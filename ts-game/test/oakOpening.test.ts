import { describe, expect, test } from 'vitest';
import { createDialogueState } from '../src/game/interaction';
import {
  applyPendingTrainerBattleOutcome,
  createScriptRuntimeState,
  getRuntimeMoney,
  runScriptById,
  setScriptVar
} from '../src/game/scripts';
import { completeFieldTextPrinter } from '../src/game/decompFieldMessageBox';
import {
  getDecompMapScript2Entries,
  getDecompMapScriptLabel,
  getMatchingDecompMapScript2ScriptId,
  resumeDecompFieldScriptSession,
  stepDecompFieldDialogue
} from '../src/game/decompFieldDialogue';
import { createPlayer } from '../src/game/player';
import { createMapNpcs, isNpcVisible, trySpawnObjectEvents } from '../src/game/npc';
import { runStepTriggersAtPlayerTile } from '../src/game/triggers';
import { loadPalletTownMap, loadPalletTownProfessorOaksLabMap } from '../src/world/mapSource';
import type { InputSnapshot } from '../src/input/inputState';

const neutralInput: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

const pressA: InputSnapshot = {
  ...neutralInput,
  interact: true,
  interactPressed: true
};

const pressStart: InputSnapshot = {
  ...neutralInput,
  start: true,
  startPressed: true
};

const tickScript = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>,
  npcs = createMapNpcs(loadPalletTownProfessorOaksLabMap()),
  input: InputSnapshot = neutralInput
): void => {
  if (dialogue.active) {
    completeFieldTextPrinter(dialogue.fieldMessageBox);
  }
  stepDecompFieldDialogue(dialogue, input, runtime, player, npcs);
};

const runUntil = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>,
  npcs: ReturnType<typeof createMapNpcs>,
  done: () => boolean,
  limit = 4096
): void => {
  for (let i = 0; i < limit && !done(); i += 1) {
    tickScript(dialogue, runtime, player, npcs, dialogue.active || dialogue.choice ? pressA : neutralInput);
  }
};

describe('Oak opening flow', () => {
  test('Oak lab map scripts are selected from decompiled map_script tables', () => {
    const runtime = createScriptRuntimeState();
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB', 1);

    expect(getDecompMapScriptLabel(
      'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB',
      'MAP_SCRIPT_ON_TRANSITION'
    )).toBe('PalletTown_ProfessorOaksLab_OnTransition');
    expect(getDecompMapScript2Entries(
      'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB',
      'MAP_SCRIPT_ON_FRAME_TABLE'
    )).toContainEqual({
      varName: 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB',
      valueToken: '1',
      scriptId: 'PalletTown_ProfessorOaksLab_ChooseStarterScene'
    });
    expect(getMatchingDecompMapScript2ScriptId(
      'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB',
      'MAP_SCRIPT_ON_FRAME_TABLE',
      runtime
    )).toBe('PalletTown_ProfessorOaksLab_ChooseStarterScene');
  });

  test('Pallet grass trigger follows the decompiled Oak escort script and queues the lab warp', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    const dialogue = createDialogueState();
    const pallet = loadPalletTownMap();
    const npcs = createMapNpcs(pallet);

    const ran = runScriptById('PalletTown_EventScript_OakTriggerLeft', {
      runtime,
      player,
      dialogue,
      npcs
    });
    runUntil(dialogue, runtime, player, npcs, () => runtime.pendingScriptWarp !== null);

    expect(ran).toBe(true);
    expect(runtime.fameChecker.pickStates[0]).toBe(2);
    expect(runtime.vars.VAR_TEXT_COLOR).toBe(0);
    expect(runtime.fieldAudio.playedSoundEffects).toEqual(expect.arrayContaining([21, 241]));
    expect(runtime.fieldAudio.bgmHistory).toContainEqual({ kind: 'playNewMapMusic', song: 302, save: false });
    expect(runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_OAK).toBe(1);
    expect(runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB).toBe(1);
    expect(runtime.flags.has('FLAG_HIDE_OAK_IN_PALLET_TOWN')).toBe(true);
    expect(runtime.flags.has('FLAG_HIDE_OAK_IN_HIS_LAB')).toBe(false);
    expect(runtime.pendingScriptWarp).toMatchObject({
      mapId: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB',
      x: 6,
      y: 12
    });
    expect(runtime.doorAnimations['16,13']).toBe('closed');
    expect(runtime.doorAnimationTask.active).toBe(false);
  });

  test('Pallet grass trigger spawns Oak as a visible object event before he escorts the player', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    const dialogue = createDialogueState();
    const pallet = loadPalletTownMap();
    const npcs = createMapNpcs(pallet);
    const oak = npcs.find((npc) => npc.id === 'LOCALID_PALLET_PROF_OAK');
    runtime.flags.add('FLAG_HIDE_OAK_IN_PALLET_TOWN');
    player.position = { x: 12 * pallet.tileSize, y: 1 * pallet.tileSize };
    player.currentTile = { x: 12, y: 1 };
    player.previousTile = { x: 12, y: 1 };
    player.currentElevation = 3;
    player.previousElevation = 3;

    expect(oak ? isNpcVisible(oak, runtime.flags) : false).toBe(false);
    const didRun = runStepTriggersAtPlayerTile(pallet.triggers, player, pallet.tileSize, {
      player,
      dialogue,
      runtime,
      npcs
    });
    expect(didRun).toBe(true);
    runUntil(
      dialogue,
      runtime,
      player,
      npcs,
      () => oak?.position.x === 12 * pallet.tileSize && oak.position.y === 2 * pallet.tileSize
    );

    expect(oak).toMatchObject({
      active: true,
      graphicsId: 'OBJ_EVENT_GFX_PROF_OAK',
      position: { x: 12 * pallet.tileSize, y: 2 * pallet.tileSize }
    });
    expect(oak ? isNpcVisible(oak, runtime.flags) : false).toBe(true);
  });

  test('lab entry and starter ball run the decompiled starter scene through rival selection', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    const dialogue = createDialogueState();
    const lab = loadPalletTownProfessorOaksLabMap();
    const npcs = createMapNpcs(lab);
    runtime.party = [];
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB', 1);

    runScriptById('PalletTown_ProfessorOaksLab_OnTransition', {
      runtime,
      player,
      dialogue,
      npcs
    });
    runScriptById('PalletTown_ProfessorOaksLab_ChooseStarterScene', {
      runtime,
      player,
      dialogue,
      npcs
    });
    runUntil(
      dialogue,
      runtime,
      player,
      npcs,
      () => runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB === 2
    );
    expect(runtime.fieldAudio.bgmHistory).toEqual(expect.arrayContaining([
      { kind: 'saveBgm', song: 302 },
      { kind: 'saveBgm', song: 0 },
      { kind: 'fadeDefaultBgm', song: 301, speed: 8 }
    ]));
    trySpawnObjectEvents(npcs, runtime.flags);
    const oak = npcs.find((npc) => npc.id === 'LOCALID_OAKS_LAB_PROF_OAK');
    expect(oak).toMatchObject({
      position: { x: 6 * lab.tileSize, y: 3 * lab.tileSize },
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      active: true
    });
    expect(oak ? isNpcVisible(oak, runtime.flags) : false).toBe(true);

    runScriptById('PalletTown_ProfessorOaksLab_EventScript_CharmanderBall', {
      runtime,
      player,
      dialogue,
      speakerId: 'LOCALID_CHARMANDER_BALL',
      npcs
    });

    runUntil(dialogue, runtime, player, npcs, () => dialogue.choice !== null);
    expect(dialogue.monPic).toEqual({
      species: 'SPECIES_CHARMANDER',
      tilemapLeft: 10,
      tilemapTop: 3
    });
    expect(dialogue.choice?.options).toEqual(['YES', 'NO']);
    tickScript(dialogue, runtime, player, npcs, pressA);
    expect(dialogue.monPic).toBeNull();
    runUntil(
      dialogue,
      runtime,
      player,
      npcs,
      () => dialogue.choice?.options.join(',') === 'YES,NO'
    );
    tickScript(dialogue, runtime, player, npcs, pressA);
    runUntil(dialogue, runtime, player, npcs, () => dialogue.namingScreen !== null);
    expect(runtime.fieldAudio.playedFanfares).toContain(318);
    expect(runtime.fieldAudio.fanfareTaskActive).toBe(false);
    expect(dialogue.namingScreen).toMatchObject({
      kind: 'nickname',
      slot: 0,
      species: 'SPECIES_CHARMANDER',
      textBuffer: '',
      destBuffer: 'CHARMANDER',
      currentPage: 'upper',
      cursorX: 0,
      cursorY: 0
    });
    expect(runtime.fieldPaletteFade.active).toBe(true);
    runUntil(dialogue, runtime, player, npcs, () => !runtime.fieldPaletteFade.active);
    tickScript(dialogue, runtime, player, npcs, pressStart);
    expect(dialogue.namingScreen).toMatchObject({ cursorX: 8, cursorY: 2 });
    tickScript(dialogue, runtime, player, npcs, pressA);
    runUntil(
      dialogue,
      runtime,
      player,
      npcs,
      () => runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB === 3
    );

    expect(runtime.party).toHaveLength(1);
    expect(runtime.party[0]?.species).toBe('CHARMANDER');
    expect(runtime.vars.VAR_STARTER_MON).toBe(2);
    expect(runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB).toBe(3);
    expect(runtime.flags.has('FLAG_HIDE_CHARMANDER_BALL')).toBe(true);
    expect(runtime.flags.has('FLAG_HIDE_SQUIRTLE_BALL')).toBe(true);
  });

  test('rival battle trigger resumes the decompiled post-battle script after loss', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    const dialogue = createDialogueState();
    const lab = loadPalletTownProfessorOaksLabMap();
    const npcs = createMapNpcs(lab);
    setScriptVar(runtime, 'VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB', 3);
    setScriptVar(runtime, 'VAR_STARTER_MON', 2);
    runtime.party = [{
      species: 'CHARMANDER',
      level: 5,
      maxHp: 19,
      hp: 1,
      attack: 11,
      defense: 10,
      speed: 12,
      spAttack: 11,
      spDefense: 10,
      catchRate: 45,
      types: ['fire'],
      status: 'none'
    }];
    const moneyBefore = getRuntimeMoney(runtime);

    runScriptById('PalletTown_ProfessorOaksLab_EventScript_RivalBattleTriggerMid', {
      runtime,
      player,
      dialogue,
      npcs
    });
    runUntil(dialogue, runtime, player, npcs, () => runtime.pendingTrainerBattle !== null);

    expect(runtime.fieldAudio.bgmHistory).toContainEqual({ kind: 'playNewMapMusic', song: 315, save: false });
    expect(runtime.pendingTrainerBattle?.trainerId).toBe('TRAINER_RIVAL_OAKS_LAB_SQUIRTLE');
    applyPendingTrainerBattleOutcome(runtime, runtime.pendingTrainerBattle!, 'lost');
    const continuation = runtime.pendingTrainerBattle?.continueScriptSession;
    expect(continuation).not.toBeNull();
    resumeDecompFieldScriptSession(dialogue, {
      runtime,
      player,
      speakerId: continuation!.speakerId,
      session: continuation!.session,
      npcs
    });
    runUntil(
      dialogue,
      runtime,
      player,
      npcs,
      () => runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB === 4
    );

    expect(runtime.vars.VAR_MAP_SCENE_PALLET_TOWN_PROFESSOR_OAKS_LAB).toBe(4);
    expect(runtime.flags.has('FLAG_BEAT_RIVAL_IN_OAKS_LAB')).toBe(true);
    expect(runtime.flags.has('FLAG_HIDE_RIVAL_IN_LAB')).toBe(true);
    expect(runtime.party[0]?.hp).toBe(runtime.party[0]?.maxHp);
    expect(getRuntimeMoney(runtime)).toBe(moneyBefore);
  });
});
