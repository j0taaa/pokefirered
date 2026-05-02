import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import { isNpcVisible, type NpcState } from './npc';
import type { PlayerState } from './player';
import type { TriggerZone } from '../world/mapSource';
import type { MapHiddenItemSource } from '../world/mapSource';
import { addBagItem, getBagPocketByItemId, getBagPocketLabel, getItemDefinition } from './bag';
import {
  createFieldMessageBoxState,
  hideFieldMessageBox,
  requestFieldTextPrinterSpeedUp,
  showFieldAutoScrollMessage,
  showFieldMessage,
  startFieldTextPrinter,
  type FieldMessageBoxFrame,
  type FieldMessageBoxState
} from './decompFieldMessageBox';
import type { ScriptHandler, ScriptRuntimeState } from './scripts';
import { runScriptById, setScriptFlag } from './scripts';
import type { DialogueChoiceState, FieldScriptSessionState, ShopState } from './decompFieldDialogue';
import { stepDecompFieldDialogue } from './decompFieldDialogue';
import type { NamingScreenState } from './decompNamingScreen';
import { setSelectedObjectEvent } from './decompEventObjectLock';
import {
  MetatileBehavior_IsSurfable,
  MetatileBehavior_IsWaterfall,
  ObjectEventDoesElevationMatch
} from './fieldCollision';
import { TestMetatileAttributeBit } from './decompMetatileBehavior';
import { checkPartyMove, getPartySizeConstant } from './decompFldEffStrength';
import { tryRunFacingTrigger } from './triggers';

export interface DialogueState {
  active: boolean;
  speakerId: string | null;
  text: string;
  queue: string[];
  queueIndex: number;
  choice: DialogueChoiceState | null;
  shop: ShopState | null;
  monPic: {
    species: string;
    tilemapLeft: number;
    tilemapTop: number;
  } | null;
  namingScreen: NamingScreenState | null;
  scriptSession: FieldScriptSessionState | null;
  fieldMessageBox: FieldMessageBoxState;
}

const MB_COUNTER = 0x80;
const MB_FAST_WATER = 0x11;
const MB_BOOKSHELF = 0x81;
const TILE_TERRAIN_WATER = 2;
const MB_POKEMART_SHELF = 0x82;
const MB_PC = 0x83;
const MB_REGION_MAP = 0x85;
const MB_TELEVISION = 0x86;
const MB_POKEMON_CENTER_SIGN = 0x87;
const MB_POKEMART_SIGN = 0x88;
const MB_CABINET = 0x89;
const MB_KITCHEN = 0x8a;
const MB_DRESSER = 0x8b;
const MB_SNACKS = 0x8c;
const MB_CABLE_CLUB_WIRELESS_MONITOR = 0x8d;
const MB_BATTLE_RECORDS = 0x8e;
const MB_QUESTIONNAIRE = 0x8f;
const MB_FOOD = 0x90;
const MB_INDIGO_PLATEAU_SIGN_1 = 0x91;
const MB_INDIGO_PLATEAU_SIGN_2 = 0x92;
const MB_BLUEPRINTS = 0x93;
const MB_PAINTING = 0x94;
const MB_POWER_PLANT_MACHINE = 0x95;
const MB_TELEPHONE = 0x96;
const MB_COMPUTER = 0x97;
const MB_ADVERTISING_POSTER = 0x98;
const MB_TASTY_FOOD = 0x99;
const MB_TRASH_BIN = 0x9a;
const MB_CUP = 0x9b;
const MB_BLINKING_LIGHTS = 0x9e;
const MB_NEATLY_LINED_UP_TOOLS = 0x9f;
const MB_IMPRESSIVE_MACHINE = 0xa0;
const MB_VIDEO_GAME = 0xa1;
const MB_BURGLARY = 0xa2;
const MB_TRAINER_TOWER_MONITOR = 0xa3;

export const createDialogueState = (): DialogueState => ({
  active: false,
  speakerId: null,
  text: '',
  queue: [],
  queueIndex: 0,
  choice: null,
  shop: null,
  monPic: null,
  namingScreen: null,
  scriptSession: null,
  fieldMessageBox: createFieldMessageBoxState()
});

export const openDialogueSequence = (
  dialogue: DialogueState,
  speakerId: string,
  lines: string[],
  {
    frame = speakerId === 'sign' ? 'signpost' : 'std',
    autoScroll = false
  }: {
    frame?: FieldMessageBoxFrame;
    autoScroll?: boolean;
  } = {}
): void => {
  if (lines.length === 0) {
    dialogue.active = false;
    dialogue.speakerId = null;
    dialogue.text = '';
    dialogue.queue = [];
    dialogue.queueIndex = 0;
    dialogue.monPic = null;
    dialogue.namingScreen = null;
    hideFieldMessageBox(dialogue.fieldMessageBox);
    return;
  }

  dialogue.active = true;
  dialogue.speakerId = speakerId;
  dialogue.queue = [...lines];
  dialogue.queueIndex = 0;
  dialogue.text = dialogue.queue[0];
  dialogue.choice = null;
  dialogue.shop = null;
  dialogue.namingScreen = null;
  dialogue.scriptSession = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
  if (autoScroll) {
    showFieldAutoScrollMessage(dialogue.fieldMessageBox, frame);
  } else {
    showFieldMessage(dialogue.fieldMessageBox, frame);
  }
  startFieldTextPrinter(dialogue.fieldMessageBox, dialogue.text);
};

export const closeDialogue = (dialogue: DialogueState): void => {
  dialogue.active = false;
  dialogue.speakerId = null;
  dialogue.text = '';
  dialogue.queue = [];
  dialogue.queueIndex = 0;
  dialogue.choice = null;
  dialogue.shop = null;
  dialogue.monPic = null;
  dialogue.namingScreen = null;
  dialogue.scriptSession = null;
  hideFieldMessageBox(dialogue.fieldMessageBox);
};

export const advanceDialogue = (dialogue: DialogueState): void => {
  if (!dialogue.active) {
    return;
  }

  const nextIndex = dialogue.queueIndex + 1;
  if (nextIndex >= dialogue.queue.length) {
    closeDialogue(dialogue);
    return;
  }

  dialogue.queueIndex = nextIndex;
  dialogue.text = dialogue.queue[nextIndex];
  startFieldTextPrinter(dialogue.fieldMessageBox, dialogue.text);
};

const facingVector = (facing: PlayerState['facing']): Vec2 => {
  switch (facing) {
    case 'up':
      return vec2(0, -1);
    case 'down':
      return vec2(0, 1);
    case 'left':
      return vec2(-1, 0);
    case 'right':
      return vec2(1, 0);
  }
};

const oppositeFacing = (facing: PlayerState['facing']): PlayerState['facing'] => {
  switch (facing) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

const toInteractionTile = (position: Vec2, tileSize: number): Vec2 =>
  vec2(
    Math.floor((position.x + 8) / tileSize),
    Math.floor((position.y + 12) / tileSize)
  );

const getPlayerInteractionTile = (player: PlayerState, tileSize: number): Vec2 =>
  player.currentTile ?? toInteractionTile(player.position, tileSize);

const getNpcInteractionTile = (npc: NpcState, tileSize: number): Vec2 =>
  npc.currentTile ?? toInteractionTile(npc.position, tileSize);

const getTileElevation = (
  tileElevations: number[] | undefined,
  mapWidth: number | undefined,
  tile: Vec2
): number | null => {
  if (!tileElevations || !mapWidth || tile.x < 0 || tile.y < 0) {
    return null;
  }

  const index = tile.y * mapWidth + tile.x;
  return index >= 0 && index < tileElevations.length ? tileElevations[index] : null;
};

const getTileValue = (
  values: number[] | undefined,
  mapWidth: number | undefined,
  tile: Vec2
): number | null => {
  if (!values || !mapWidth || tile.x < 0 || tile.y < 0) {
    return null;
  }

  const index = tile.y * mapWidth + tile.x;
  return index >= 0 && index < values.length ? values[index] : null;
};

const getFacingPositionElevation = (
  player: PlayerState,
  tileSize: number,
  mapWidth: number | undefined,
  tileElevations: number[] | undefined
): number => {
  const playerTile = getPlayerInteractionTile(player, tileSize);
  const currentTileElevation = getTileElevation(tileElevations, mapWidth, playerTile);
  if (currentTileElevation === null) {
    return player.currentElevation ?? 0;
  }

  return currentTileElevation !== 0 ? (player.currentElevation ?? 0) : 0;
};

const objectEventMatchesInteractionElevation = (
  npc: NpcState,
  currentTile: Vec2,
  elevation: number
): boolean =>
  ObjectEventDoesElevationMatch(
    {
      id: npc.id,
      currentTile,
      previousTile: npc.previousTile ?? currentTile,
      facing: npc.facing,
      initialTile: npc.initialTile ?? currentTile,
      movementRangeX: npc.movementRangeX ?? 0,
      movementRangeY: npc.movementRangeY ?? 0,
      currentElevation: npc.currentElevation ?? 0,
      previousElevation: npc.previousElevation ?? npc.currentElevation ?? 0,
      trackedByCamera: false,
      avatarMode: 'normal',
      graphicsId: npc.graphicsId
    },
    elevation
  );

const getTileBehavior = (
  tileBehaviors: number[] | undefined,
  mapWidth: number | undefined,
  tile: Vec2
): number | null => {
  if (!tileBehaviors || !mapWidth || tile.x < 0 || tile.y < 0) {
    return null;
  }

  const index = tile.y * mapWidth + tile.x;
  return index >= 0 && index < tileBehaviors.length ? tileBehaviors[index] : null;
};

const getFacingTile = (player: PlayerState, tileSize: number): Vec2 => {
  const playerTile = getPlayerInteractionTile(player, tileSize);
  const direction = facingVector(player.facing);
  return vec2(playerTile.x + direction.x, playerTile.y + direction.y);
};

const isFacingNorth = (facing: PlayerState['facing']): boolean => facing === 'up';

const getInteractedMetatileScriptId = (
  behavior: number | null,
  facing: PlayerState['facing']
): string | null => {
  switch (behavior) {
    case MB_PC:
      return 'EventScript_PC';
    case MB_REGION_MAP:
      return 'EventScript_WallTownMap';
    case MB_BOOKSHELF:
      return 'EventScript_Bookshelf';
    case MB_POKEMART_SHELF:
      return 'EventScript_PokeMartShelf';
    case MB_FOOD:
      return 'EventScript_Food';
    case MB_IMPRESSIVE_MACHINE:
      return 'EventScript_ImpressiveMachine';
    case MB_BLUEPRINTS:
      return 'EventScript_Blueprints';
    case MB_VIDEO_GAME:
      return 'EventScript_VideoGame';
    case MB_BURGLARY:
      return 'EventScript_Burglary';
    case MB_COMPUTER:
      return 'EventScript_Computer';
    case MB_TRAINER_TOWER_MONITOR:
      return 'TrainerTower_EventScript_ShowTime';
    case MB_TELEVISION:
      return isFacingNorth(facing) ? 'EventScript_PlayerFacingTVScreen' : null;
    case MB_CABINET:
      return 'EventScript_Cabinet';
    case MB_KITCHEN:
      return 'EventScript_Kitchen';
    case MB_DRESSER:
      return 'EventScript_Dresser';
    case MB_SNACKS:
      return 'EventScript_Snacks';
    case MB_PAINTING:
      return 'EventScript_Painting';
    case MB_POWER_PLANT_MACHINE:
      return 'EventScript_PowerPlantMachine';
    case MB_TELEPHONE:
      return 'EventScript_Telephone';
    case MB_ADVERTISING_POSTER:
      return 'EventScript_AdvertisingPoster';
    case MB_TASTY_FOOD:
      return 'EventScript_TastyFood';
    case MB_TRASH_BIN:
      return 'EventScript_TrashBin';
    case MB_CUP:
      return 'EventScript_Cup';
    case MB_BLINKING_LIGHTS:
      return 'EventScript_BlinkingLights';
    case MB_NEATLY_LINED_UP_TOOLS:
      return 'EventScript_NeatlyLinedUpTools';
    case MB_CABLE_CLUB_WIRELESS_MONITOR:
      return isFacingNorth(facing) ? 'CableClub_EventScript_ShowWirelessCommunicationScreen' : null;
    case MB_QUESTIONNAIRE:
      return 'EventScript_Questionnaire';
    case MB_BATTLE_RECORDS:
      return isFacingNorth(facing) ? 'CableClub_EventScript_ShowBattleRecords' : null;
    case MB_INDIGO_PLATEAU_SIGN_1:
      return 'EventScript_Indigo_UltimateGoal';
    case MB_INDIGO_PLATEAU_SIGN_2:
      return 'EventScript_Indigo_HighestAuthority';
    case MB_POKEMART_SIGN:
      return isFacingNorth(facing) ? 'EventScript_PokemartSign' : null;
    case MB_POKEMON_CENTER_SIGN:
      return isFacingNorth(facing) ? 'EventScript_PokecenterSign' : null;
    default:
      return null;
  }
};

const tryRunMetatileInteractionScript = (
  player: PlayerState,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  scriptRegistry: Record<string, ScriptHandler> | undefined,
  tileSize: number,
  mapWidth: number | undefined,
  tileBehaviors: number[] | undefined
): boolean => {
  const targetTile = getFacingTile(player, tileSize);
  const behavior = getTileBehavior(tileBehaviors, mapWidth, targetTile);
  const scriptId = getInteractedMetatileScriptId(behavior, player.facing);
  if (!scriptId) {
    return false;
  }

  return runScriptById(scriptId, {
    player,
    dialogue,
    runtime,
    speakerId: scriptId.includes('Sign') || scriptId.includes('Indigo') ? 'sign' : 'system'
  }, scriptRegistry);
};

const partyHasMonWithMove = (runtime: ScriptRuntimeState, moveToken: string): boolean =>
  checkPartyMove(runtime, moveToken) !== getPartySizeConstant();

const isPlayerFacingSurfableFishableWater = (
  player: PlayerState,
  targetTile: Vec2,
  mapWidth: number | undefined,
  tileBehaviors: number[] | undefined,
  tileElevations: number[] | undefined,
  tileCollisionValues: number[] | undefined,
  tileTerrainTypes: number[] | undefined
): boolean => {
  const behavior = getTileBehavior(tileBehaviors, mapWidth, targetTile);
  const playerElevation = player.currentElevation ?? 0;
  const targetElevation = getTileElevation(tileElevations, mapWidth, targetTile);

  if (tileElevations && targetElevation !== null) {
    if (
      playerElevation === 0
      || targetElevation === 0
      || targetElevation === 15
      || targetElevation === playerElevation
    ) {
      return false;
    }
  } else if (playerElevation !== 3 || !MetatileBehavior_IsSurfable(behavior)) {
    return false;
  }

  const collision = getTileValue(tileCollisionValues, mapWidth, targetTile);
  if (collision !== null && collision !== 0) {
    return false;
  }

  const terrain = getTileValue(tileTerrainTypes, mapWidth, targetTile);
  if (terrain !== null) {
    return playerElevation === 3 && TestMetatileAttributeBit(terrain, TILE_TERRAIN_WATER);
  }

  return playerElevation === 3 && MetatileBehavior_IsSurfable(behavior);
};

const isPlayerSurfingNorth = (player: PlayerState): boolean =>
  player.facing === 'up' && player.avatarMode === 'surfing';

const getInteractedWaterScriptId = (
  player: PlayerState,
  runtime: ScriptRuntimeState,
  behavior: number | null,
  targetTile: Vec2,
  mapWidth: number | undefined,
  tileBehaviors: number[] | undefined,
  tileElevations: number[] | undefined,
  tileCollisionValues: number[] | undefined,
  tileTerrainTypes: number[] | undefined
): string | null => {
  if (behavior === MB_FAST_WATER && partyHasMonWithMove(runtime, 'MOVE_SURF')) {
    return 'EventScript_CurrentTooFast';
  }

  if (
    runtime.flags.has('FLAG_BADGE05_GET')
    && partyHasMonWithMove(runtime, 'MOVE_SURF')
    && isPlayerFacingSurfableFishableWater(
      player,
      targetTile,
      mapWidth,
      tileBehaviors,
      tileElevations,
      tileCollisionValues,
      tileTerrainTypes
    )
  ) {
    return 'EventScript_UseSurf';
  }

  if (!MetatileBehavior_IsWaterfall(behavior)) {
    return null;
  }

  return runtime.flags.has('FLAG_BADGE07_GET') && isPlayerSurfingNorth(player)
    ? 'EventScript_Waterfall'
    : 'EventScript_CantUseWaterfall';
};

const tryRunWaterInteractionScript = (
  player: PlayerState,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  scriptRegistry: Record<string, ScriptHandler> | undefined,
  tileSize: number,
  mapWidth: number | undefined,
  tileBehaviors: number[] | undefined,
  tileElevations: number[] | undefined,
  tileCollisionValues: number[] | undefined,
  tileTerrainTypes: number[] | undefined
): boolean => {
  const targetTile = getFacingTile(player, tileSize);
  const behavior = getTileBehavior(tileBehaviors, mapWidth, targetTile);
  const scriptId = getInteractedWaterScriptId(
    player,
    runtime,
    behavior,
    targetTile,
    mapWidth,
    tileBehaviors,
    tileElevations,
    tileCollisionValues,
    tileTerrainTypes
  );
  if (!scriptId) {
    return false;
  }

  return runScriptById(scriptId, {
    player,
    dialogue,
    runtime,
    speakerId: 'system'
  }, scriptRegistry);
};

const findNpcInFront = (
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number,
  mapWidth?: number,
  tileBehaviors?: number[],
  tileElevations?: number[]
): NpcState | null => {
  const playerTile = getPlayerInteractionTile(player, tileSize);
  const playerElevation = getFacingPositionElevation(player, tileSize, mapWidth, tileElevations);
  const direction = facingVector(player.facing);
  const targetTile = vec2(playerTile.x + direction.x, playerTile.y + direction.y);

  for (const npc of npcs) {
    const npcTile = getNpcInteractionTile(npc, tileSize);
    if (
      npcTile.x === targetTile.x
      && npcTile.y === targetTile.y
      && objectEventMatchesInteractionElevation(npc, npcTile, playerElevation)
    ) {
      return npc;
    }
  }

  if (getTileBehavior(tileBehaviors, mapWidth, targetTile) !== MB_COUNTER) {
    return null;
  }

  const counterFarTile = vec2(targetTile.x + direction.x, targetTile.y + direction.y);
  for (const npc of npcs) {
    const npcTile = getNpcInteractionTile(npc, tileSize);
    if (
      npcTile.x === counterFarTile.x
      && npcTile.y === counterFarTile.y
      && objectEventMatchesInteractionElevation(npc, npcTile, playerElevation)
    ) {
      return npc;
    }
  }

  return null;
};

const tryCollectNpcItem = (
  npc: NpcState,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState
): boolean => {
  if (!npc.itemId) {
    return false;
  }

  const item = getItemDefinition(npc.itemId);
  const ok = addBagItem(runtime.bag, npc.itemId, 1);
  if (!ok) {
    openDialogueSequence(dialogue, 'system', ['Too bad! The BAG is full...']);
    runtime.lastScriptId = `item.obtain.failed.${npc.itemId.toLowerCase()}`;
    return true;
  }

  if (npc.flag && npc.flag !== '0') {
    setScriptFlag(runtime, npc.flag);
  }

  const pocketLabel = getBagPocketLabel(getBagPocketByItemId(npc.itemId) ?? 'items');
  openDialogueSequence(dialogue, 'system', [
    `Obtained ${item.name}!`,
    `${item.name} was put away in the ${pocketLabel}.`
  ]);
  runtime.lastScriptId = `item.obtain.${npc.itemId.toLowerCase()}`;
  return true;
};

const moveStandaloneChoiceSelection = (
  choice: NonNullable<DialogueState['choice']>,
  delta: number
): void => {
  const nextIndex = choice.selectedIndex + delta;
  choice.selectedIndex = Math.max(0, Math.min(choice.options.length - 1, nextIndex));
};

const tryStepStandaloneChoice = (
  dialogue: DialogueState,
  input: InputSnapshot,
  player: PlayerState,
  npcs: NpcState[],
  runtime: ScriptRuntimeState,
  scriptRegistry: Record<string, ScriptHandler> | undefined
): boolean => {
  const choice = dialogue.choice;
  if (!choice || dialogue.scriptSession) {
    return false;
  }

  if (input.upPressed || input.leftPressed) {
    moveStandaloneChoiceSelection(choice, -1);
    return true;
  }
  if (input.downPressed || input.rightPressed) {
    moveStandaloneChoiceSelection(choice, 1);
    return true;
  }

  let result: number | null = null;
  if (input.interactPressed) {
    result = choice.kind === 'yesno'
      ? choice.selectedIndex === 0 ? 1 : 0
      : choice.selectedIndex;
  } else if (input.cancelPressed && !choice.ignoreCancel) {
    result = choice.cancelValue;
  }

  if (result === null) {
    return true;
  }

  runtime.vars.VAR_RESULT = result;
  const pendingScriptId = runtime.stringVars.__pendingStandaloneChoiceScriptId;
  const speakerId = dialogue.speakerId ?? 'system';
  runtime.stringVars.__pendingStandaloneChoiceScriptId = '';
  closeDialogue(dialogue);

  if (pendingScriptId) {
    const suffix = result === 1 ? 'yes' : 'no';
    runScriptById(`${pendingScriptId}.${suffix}`, {
      player,
      dialogue,
      runtime,
      speakerId,
      npcs
    }, scriptRegistry);
  }

  return true;
};

export const stepInteraction = (
  dialogue: DialogueState,
  input: InputSnapshot,
  player: PlayerState,
  npcs: NpcState[],
  tileSize: number,
  triggers: TriggerZone[] = [],
  runtime?: ScriptRuntimeState,
  scriptRegistry?: Record<string, ScriptHandler>,
  hiddenItems: MapHiddenItemSource[] = [],
  mapWidth?: number,
  tileBehaviors?: number[],
  tileElevations?: number[],
  tileCollisionValues?: number[],
  tileTerrainTypes?: number[]
): DialogueState => {
  if (runtime && dialogue.scriptSession) {
    if (stepDecompFieldDialogue(dialogue, input, runtime, player, npcs)) {
      return dialogue;
    }
  }

  if (runtime && tryStepStandaloneChoice(dialogue, input, player, npcs, runtime, scriptRegistry)) {
    return dialogue;
  }

  if (dialogue.active) {
    if (!input.interactPressed && !input.cancelPressed) {
      return dialogue;
    }

    if (requestFieldTextPrinterSpeedUp(dialogue.fieldMessageBox)) {
      return dialogue;
    }

    advanceDialogue(dialogue);
    return dialogue;
  }

  if (!input.interactPressed) {
    return dialogue;
  }

  // Matches field_control_avatar.c interaction priority:
  // object events first, then background/facing triggers.
  const interactableNpcs = runtime
    ? npcs.filter((candidate) => isNpcVisible(candidate, runtime.flags))
    : npcs;
  const npc = findNpcInFront(
    player,
    interactableNpcs,
    tileSize,
    mapWidth,
    tileBehaviors,
    tileElevations
  );
  if (npc) {
    npc.facing = oppositeFacing(player.facing);
    npc.moving = false;
    npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);
    if (runtime) {
      setSelectedObjectEvent(runtime.eventObjectLock, npc.id);
    }

    if (runtime && tryCollectNpcItem(npc, dialogue, runtime)) {
      return dialogue;
    }

    if (runtime && npc.interactScriptId) {
      const ran = runScriptById(
        npc.interactScriptId,
        {
          player,
          dialogue,
          runtime,
          speakerId: npc.id,
          npcs
        },
        scriptRegistry
      );
      if (ran) {
        return dialogue;
      }
    }

    if (npc.dialogueLines.length > 0) {
      const line = npc.dialogueLines[npc.dialogueIndex % npc.dialogueLines.length];
      npc.dialogueIndex = (npc.dialogueIndex + 1) % npc.dialogueLines.length;

      openDialogueSequence(dialogue, npc.id, [line]);
    }
    return dialogue;
  }

  if (runtime) {
    setSelectedObjectEvent(runtime.eventObjectLock, null);
    const didRunFacingTrigger = tryRunFacingTrigger(triggers, player, tileSize, {
      player,
      dialogue,
      runtime,
      scriptRegistry,
      hiddenItems,
      npcs
    }, mapWidth, tileElevations);
    if (didRunFacingTrigger) {
      return dialogue;
    }

    const didRunMetatileScript = tryRunMetatileInteractionScript(
      player,
      dialogue,
      runtime,
      scriptRegistry,
      tileSize,
      mapWidth,
      tileBehaviors
    );
    if (didRunMetatileScript) {
      return dialogue;
    }

    tryRunWaterInteractionScript(
      player,
      dialogue,
      runtime,
      scriptRegistry,
      tileSize,
      mapWidth,
      tileBehaviors,
      tileElevations,
      tileCollisionValues,
      tileTerrainTypes
    );
  }

  return dialogue;
};
