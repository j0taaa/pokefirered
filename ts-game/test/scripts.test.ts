import { describe, expect, test } from 'vitest';
import {
  addScriptVar,
  addRuntimeCoins,
  applyPendingTrainerBattleOutcome,
  clearScriptFlag,
  computeWhiteOutMoneyLoss,
  createScriptRuntimeState,
  getRuntimeCoins,
  getRuntimeMoney,
  getTrainerBattleMoneyReward,
  getScriptVar,
  isScriptFlagSet,
  removeRuntimeCoins,
  prototypeScriptRegistry,
  runScriptById,
  setRuntimeCoins,
  setRuntimeMoney,
  setScriptFlag,
  setScriptVar
} from '../src/game/scripts';
import {
  applyDecompMovementScript,
  getUntrackedDecompSpecialNames,
  getUntrackedDecompSpecialVarNames,
  runDecompFieldScript,
  resolveSimpleDecompDialogue,
  resumeDecompFieldScriptSession,
  stepDecompFieldDialogue
} from '../src/game/decompFieldDialogue';
import { addBagItem, getBagQuantity, getItemDefinition } from '../src/game/bag';
import { MYSTERY_EVENT_MESSAGES } from '../src/game/decompMysteryEventMsg';
import { enterHallOfFame } from '../src/game/decompPostBattleEvents';
import { closeDialogue, createDialogueState } from '../src/game/interaction';
import { completeFieldTextPrinter } from '../src/game/decompFieldMessageBox';
import type { NpcState } from '../src/game/npc';
import {
  addObjectEvent,
  isNpcVisible,
  removeObjectEvent,
  setObjectEventInvisibility
} from '../src/game/npc';
import { createPlayer } from '../src/game/player';

const neutralInput = {
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

const createTestNpc = (id: string): NpcState => ({
  id,
  position: { x: 0, y: 0 },
  path: [],
  pathIndex: 0,
  facing: 'down',
  initialFacing: 'down',
  moving: false,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: [],
  dialogueIndex: 0
});

const pressA = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>
): void => {
  completeFieldTextPrinter(dialogue.fieldMessageBox);
  stepDecompFieldDialogue(
    dialogue,
    { ...neutralInput, interact: true, interactPressed: true },
    runtime,
    player
  );
};

const tickScriptTasks = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>,
  limit = 256,
  npcs: readonly NpcState[] = []
): void => {
  for (
    let step = 0;
    step < limit
      && (dialogue.scriptSession?.waitingFor === 'task' || dialogue.scriptSession?.waitingFor === 'movement')
      && !dialogue.active
      && !dialogue.choice;
    step += 1
  ) {
    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player, npcs);
  }
};

const pressDown = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>
): void => {
  stepDecompFieldDialogue(
    dialogue,
    { ...neutralInput, down: true, downPressed: true },
    runtime,
    player
  );
};

const pressUp = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>
): void => {
  stepDecompFieldDialogue(
    dialogue,
    { ...neutralInput, up: true, upPressed: true },
    runtime,
    player
  );
};

const pressB = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>
): void => {
  stepDecompFieldDialogue(
    dialogue,
    { ...neutralInput, cancel: true, cancelPressed: true },
    runtime,
    player
  );
};

const advanceToChoice = (
  dialogue: ReturnType<typeof createDialogueState>,
  runtime: ReturnType<typeof createScriptRuntimeState>,
  player: ReturnType<typeof createPlayer>,
  limit = 128
): void => {
  tickScriptTasks(dialogue, runtime, player);
  for (let step = 0; step < limit && !dialogue.choice && dialogue.scriptSession; step += 1) {
    tickScriptTasks(dialogue, runtime, player);
    if (dialogue.choice) {
      break;
    }
    if (dialogue.active) {
      pressA(dialogue, runtime, player);
    } else {
      stepDecompFieldDialogue(dialogue, neutralInput, runtime, player);
    }
  }
};

describe('script runtime helpers', () => {
  test('tracks every decomp special and specialvar used by the loaded scripts', () => {
    expect(getUntrackedDecompSpecialNames()).toEqual([]);
    expect(getUntrackedDecompSpecialVarNames()).toEqual([]);
  });

  test('supports var reads/writes and increments', () => {
    const runtime = createScriptRuntimeState();
    expect(getScriptVar(runtime, 'counter')).toBe(0);
    expect(runtime.saveCounter).toBe(0);

    setScriptVar(runtime, 'counter', 5);
    expect(getScriptVar(runtime, 'counter')).toBe(5);

    const next = addScriptVar(runtime, 'counter', 3);
    expect(next).toBe(8);
    expect(getScriptVar(runtime, 'counter')).toBe(8);
  });

  test('supports setting and clearing script flags', () => {
    const runtime = createScriptRuntimeState();
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(false);

    setScriptFlag(runtime, 'story.route-warning');
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(true);

    clearScriptFlag(runtime, 'story.route-warning');
    expect(isScriptFlagSet(runtime, 'story.route-warning')).toBe(false);
  });

  test('tracks runtime money and whiteout loss using FireRed-style caps and badge scaling', () => {
    const runtime = createScriptRuntimeState();

    expect(getRuntimeMoney(runtime)).toBe(3000);
    expect(setRuntimeMoney(runtime, 1_234_567)).toBe(999_999);
    expect(getRuntimeMoney(runtime)).toBe(999_999);
    expect(runtime.vars.moneyEncrypted).toBe(999_999);

    runtime.party[0]!.level = 12;
    runtime.party[1]!.level = 20;
    expect(computeWhiteOutMoneyLoss(runtime)).toBe(160);

    setScriptFlag(runtime, 'FLAG_BADGE01_GET');
    setScriptFlag(runtime, 'FLAG_BADGE02_GET');
    expect(computeWhiteOutMoneyLoss(runtime)).toBe(480);

    setRuntimeMoney(runtime, 300);
    expect(computeWhiteOutMoneyLoss(runtime)).toBe(300);
  });

  test('tracks runtime coins with FireRed-style encryption and caps', () => {
    const runtime = createScriptRuntimeState();

    expect(getRuntimeCoins(runtime)).toBe(0);
    expect(setRuntimeCoins(runtime, 12_345)).toBe(9_999);
    expect(getRuntimeCoins(runtime)).toBe(9_999);
    expect(runtime.vars.coinsEncrypted).toBe(9_999);
    expect(addRuntimeCoins(runtime, 1)).toBe(false);
    expect(removeRuntimeCoins(runtime, 10_000)).toBe(false);
    expect(removeRuntimeCoins(runtime, 99)).toBe(true);
    expect(getRuntimeCoins(runtime)).toBe(9_900);
  });

  test('supports object-event style flag/var branching in npc scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('object.npc-lass-01.interact', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(isScriptFlagSet(runtime, 'npc.lass01.introSeen')).toBe(true);
    expect(dialogue.text).toContain('The grass rustles');

    runtime.vars.routeWarningSeen = 2;
    runScriptById('object.npc-lass-01.interact', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[1]).toContain('eastern wind');
  });

  test('Route 4 boy waits for lock completion before opening dialogue and releasing controls', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    player.facing = 'left';
    player.moving = true;

    const speakerNpc = createTestNpc('Route4_EventScript_Boy');
    const bystanderNpc = createTestNpc('bystander');

    expect(
      runDecompFieldScript('Route4_EventScript_Boy', {
        runtime,
        player,
        dialogue,
        speakerId: speakerNpc.id,
        npcs: [speakerNpc, bystanderNpc]
      })
    ).toBe(true);

    expect(dialogue.active).toBe(false);
    expect(runtime.eventObjectLock.frozenObjectEventIds.has(speakerNpc.id)).toBe(true);
    expect(runtime.eventObjectLock.frozenObjectEventIds.has(bystanderNpc.id)).toBe(true);

    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player, [speakerNpc, bystanderNpc]);
    expect(dialogue.active).toBe(false);

    player.moving = false;
    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player, [speakerNpc, bystanderNpc]);
    expect(dialogue.active).toBe(true);
    expect(speakerNpc.facing).toBe('right');

    for (let step = 0; step < 4 && dialogue.scriptSession; step += 1) {
      stepDecompFieldDialogue(
        dialogue,
        { ...neutralInput, interactPressed: true, interact: true },
        runtime,
        player,
        [speakerNpc, bystanderNpc]
      );
    }
    expect(dialogue.scriptSession).toBeNull();
    expect(runtime.eventObjectLock.frozenObjectEventIds.size).toBe(0);
  });

  test('questionnaire lockall waits for the player before opening the yes-no message', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    player.moving = true;

    const speakerNpc = createTestNpc('questionnaire-clerk');
    const bystanderNpc = createTestNpc('questionnaire-customer');

    expect(
      runDecompFieldScript('EventScript_Questionnaire', {
        runtime,
        player,
        dialogue,
        speakerId: speakerNpc.id,
        npcs: [speakerNpc, bystanderNpc]
      })
    ).toBe(true);

    expect(dialogue.active).toBe(false);
    expect(runtime.eventObjectLock.frozenObjectEventIds.has(speakerNpc.id)).toBe(true);
    expect(runtime.eventObjectLock.frozenObjectEventIds.has(bystanderNpc.id)).toBe(true);

    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player, [speakerNpc, bystanderNpc]);
    expect(dialogue.active).toBe(false);

    player.moving = false;
    stepDecompFieldDialogue(dialogue, neutralInput, runtime, player, [speakerNpc, bystanderNpc]);
    expect(dialogue.active).toBe(true);
    expect(dialogue.text.toLowerCase()).toContain('questionnaire');
  });

  test('Strength boulder script follows the decomp field-effect flow and sets the strength flag', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    const boulderNpc = createTestNpc('boulder');

    setScriptFlag(runtime, 'FLAG_BADGE04_GET');
    runtime.party[0] = {
      ...runtime.party[0],
      nickname: 'BLAZE',
      moves: ['CUT', 'STRENGTH']
    };

    expect(
      runDecompFieldScript('EventScript_StrengthBoulder', {
        runtime,
        player,
        dialogue,
        speakerId: boulderNpc.id,
        npcs: [boulderNpc]
      })
    ).toBe(true);

    expect(dialogue.queue.join(' ')).toContain('Would you like to use STRENGTH');
    expect(dialogue.choice?.kind).toBe('yesno');

    stepDecompFieldDialogue(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      runtime,
      player,
      [boulderNpc]
    );

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession?.specialState).toEqual({ kind: 'strengthFieldEffect' });

    stepDecompFieldDialogue(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      runtime,
      player,
      [boulderNpc]
    );

    expect(isScriptFlagSet(runtime, 'FLAG_SYS_USE_STRENGTH')).toBe(true);
    expect(dialogue.queue.join(' ')).toContain('BLAZE used STRENGTH');
    expect(dialogue.queue.join(' ')).toContain('possible to move boulders around');
  });

  test('Rock Smash script follows the decomp field-effect flow and removes the smashed rock object', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    const rockNpc = createTestNpc('rock-smash-boulder');

    setScriptFlag(runtime, 'FLAG_BADGE06_GET');
    runtime.party[0] = {
      ...runtime.party[0],
      nickname: 'BLAZE',
      moves: ['CUT', 'ROCK SMASH']
    };

    expect(
      runDecompFieldScript('EventScript_RockSmash', {
        runtime,
        player,
        dialogue,
        speakerId: rockNpc.id,
        npcs: [rockNpc]
      })
    ).toBe(true);

    expect(dialogue.queue.join(' ')).toContain('Would you like to use ROCK SMASH');
    expect(dialogue.choice?.kind).toBe('yesno');

    stepDecompFieldDialogue(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      runtime,
      player,
      [rockNpc]
    );

    expect(dialogue.queue.join(' ')).toContain('BLAZE used ROCK SMASH');
    expect(dialogue.active).toBe(true);

    stepDecompFieldDialogue(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      runtime,
      player,
      [rockNpc]
    );

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession?.specialState).toEqual({ kind: 'rockSmashFieldEffect' });
    expect(runtime.vars['gameStat.GAME_STAT_USED_ROCK_SMASH']).toBe(1);

    expect(dialogue.scriptSession?.specialState).toEqual({ kind: 'rockSmashFieldEffect' });

    stepDecompFieldDialogue(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      runtime,
      player,
      [rockNpc]
    );
    tickScriptTasks(dialogue, runtime, player, 8, [rockNpc]);

    expect(dialogue.scriptSession).toBeNull();
    expect(rockNpc.active).toBe(false);
    expect(isNpcVisible(rockNpc, runtime.flags)).toBe(false);
  });

  test('Cycling Road warp special forces the player onto the Mach Bike only from on-foot state', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    expect(
      runDecompFieldScript('Route16_OnWarpCyclingRoad', {
        runtime,
        player,
        dialogue,
        speakerId: 'system'
      })
    ).toBe(true);

    expect(player.avatarMode).toBe('machBike');

    player.avatarMode = 'surfing';
    expect(
      runDecompFieldScript('Route18_OnWarpCyclingRoad', {
        runtime,
        player,
        dialogue,
        speakerId: 'system'
      })
    ).toBe(true);
    expect(player.avatarMode).toBe('surfing');
  });

  test('Seafoam current warp special starts surfing and sets the surfing help context', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    expect(
      runDecompFieldScript('SeafoamIslands_B4F_EventScript_WarpInOnCurrent', {
        runtime,
        player,
        dialogue,
        speakerId: 'system'
      })
    ).toBe(true);

    expect(player.avatarMode).toBe('surfing');
    expect(runtime.vars.helpContext).toBe(22);
    expect(player.facing).toBe('up');
  });

  test('turnobject resolves NPC local ids from vars like the decomp Cable Club warp script', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    const attendantNpc = createTestNpc('7');
    attendantNpc.facing = 'down';
    setScriptVar(runtime, 'VAR_0x8007', 7);

    expect(
      runDecompFieldScript('EventScript_CheckTurnAttendant', {
        runtime,
        player,
        dialogue,
        speakerId: 'system',
        npcs: [attendantNpc]
      })
    ).toBe(true);

    expect(attendantNpc.facing).toBe('left');
  });

  test('object-event visibility helpers distinguish template flags, active spawns, and invisibility', () => {
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc('7'),
      flag: 'FLAG_HIDE_TEST_OBJECT'
    };

    removeObjectEvent(runtime.flags, npc);
    expect(runtime.flags.has('FLAG_HIDE_TEST_OBJECT')).toBe(true);
    expect(isNpcVisible(npc, runtime.flags)).toBe(false);

    addObjectEvent(runtime.flags, npc);
    expect(runtime.flags.has('FLAG_HIDE_TEST_OBJECT')).toBe(true);
    expect(isNpcVisible(npc, runtime.flags)).toBe(true);

    setObjectEventInvisibility(npc, true);
    expect(isNpcVisible(npc, runtime.flags)).toBe(false);

    setObjectEventInvisibility(npc, false);
    expect(isNpcVisible(npc, runtime.flags)).toBe(true);
  });

  test('Viridian Pokemon Center nurse stub heals the current party', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0].hp = 1;
    runtime.party[0].status = 'poison';
    runtime.party[1].hp = 5;

    expect(
      runScriptById(
        'ViridianCity_PokemonCenter_1F_EventScript_Nurse',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);

    expect(runtime.party[0].hp).toBe(runtime.party[0].maxHp);
    expect(runtime.party[0].status).toBe('none');
    expect(runtime.party[1].hp).toBe(runtime.party[1].maxHp);
    expect(dialogue.queue).toEqual([
      'Welcome to our POKeMON CENTER!\nWould you like me to heal your POKeMON back to perfect health?',
      "Okay, I'll take your POKeMON for a few seconds.",
      "Thank you for waiting.\nWe've restored your POKeMON to full health.",
      'We hope to see you again!'
    ]);
  });

  test('postgame Hall of Fame state unlocks the fan club worker branch', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    enterHallOfFame(runtime);
    runScriptById('VermilionCity_PokemonFanClub_EventScript_WorkerF', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue).toEqual([
      'Our CHAIRMAN really does adore his POKéMON.',
      'But the person who is most liked by POKéMON is DAISY, I think.'
    ]);
  });

  test('Viridian Mart clerk follows the decomp mart flow and completes a purchase', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    addBagItem(runtime.bag, 'ITEM_POTION', 3);
    const initialPokeBallCount = getBagQuantity(runtime.bag, 'ITEM_POKE_BALL');
    const initialPotionCount = getBagQuantity(runtime.bag, 'ITEM_POTION');
    const potionSaleValue = Math.floor(getItemDefinition('ITEM_POTION').price / 2);

    expect(
      runScriptById(
        'ViridianCity_Mart_EventScript_Clerk',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);
    tickScriptTasks(dialogue, runtime, player);

    expect(dialogue.queue.join(' ')).toContain('May I help you');
    expect(dialogue.shop).toBeNull();
    expect(dialogue.choice).toBeNull();

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('mainMenu');
    expect(dialogue.shop?.prompt).toContain('What would you like to do');
    expect(dialogue.shop?.buyMenuWindows.isSellingTM).toBe(false);
    expect(dialogue.shop?.buyMenuWindows.tilemapWindows).toEqual([0, 4, 5]);
    expect(dialogue.shop?.moneyBox).toMatchObject({ windowId: 0, tileStart: 0xa, palette: 0xf });
    expect(dialogue.shop?.yesNoWindow.window).toMatchObject({ tilemapLeft: 21, tilemapTop: 9 });
    expect(dialogue.choice).toBeNull();

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('buyList');
    expect(dialogue.shop?.items).toEqual([
      'ITEM_POKE_BALL',
      'ITEM_POTION',
      'ITEM_ANTIDOTE',
      'ITEM_PARALYZE_HEAL'
    ]);

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('buyQuantity');
    expect(dialogue.shop?.currentItemId).toBe('ITEM_POKE_BALL');
    expect(dialogue.shop?.prompt).toContain('How many would you like');

    pressUp(dialogue, runtime, player);
    expect(dialogue.shop?.quantity).toBe(2);

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('buyConfirm');
    expect(dialogue.shop?.prompt).toContain('That will be ¥400');

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('message');
    expect(getBagQuantity(runtime.bag, 'ITEM_POKE_BALL')).toBe(initialPokeBallCount + 2);
    expect(getRuntimeMoney(runtime)).toBe(2600);
    expect(dialogue.shop?.moneyBox.money).toBe(2600);
    expect(dialogue.shop?.prompt).toContain('Thank you');

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('buyList');

    pressB(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('mainMenu');
    expect(dialogue.shop?.prompt).toContain('anything else');

    pressDown(dialogue, runtime, player);
    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('sellList');

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('sellQuantity');
    expect(dialogue.shop?.currentItemId).toBe('ITEM_POTION');

    pressUp(dialogue, runtime, player);
    expect(dialogue.shop?.quantity).toBe(2);

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('sellConfirm');
    expect(dialogue.shop?.prompt).toContain('Would that be okay');

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('message');
    expect(getBagQuantity(runtime.bag, 'ITEM_POTION')).toBe(initialPotionCount - 2);
    expect(getRuntimeMoney(runtime)).toBe(2600 + potionSaleValue * 2);
    expect(dialogue.shop?.prompt).toContain('Turned over');

    pressA(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('sellList');

    pressB(dialogue, runtime, player);
    expect(dialogue.shop?.mode).toBe('mainMenu');

    pressDown(dialogue, runtime, player);
    pressDown(dialogue, runtime, player);
    pressA(dialogue, runtime, player);

    expect(dialogue.shop).toBeNull();
    expect(dialogue.queue.join(' ')).toContain('Please come again');
  });

  test('Viridian Mart clerk matches the Oak parcel follow-up branch', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_MART', 1);

    expect(
      runScriptById(
        'ViridianCity_Mart_EventScript_Clerk',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);
    tickScriptTasks(dialogue, runtime, player);

    expect(dialogue.queue).toEqual([
      'Okay, thanks! Please say hi to\nPROF. OAK for me, too.'
    ]);
  });

  test('Route 10 Oaks aide gives the Everstone once the Kanto owned count reaches twenty', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.startMenu.playerName = 'RED';
    runtime.pokedex.caughtSpecies = [
      'BULBASAUR',
      'IVYSAUR',
      'VENUSAUR',
      'CHARMANDER',
      'CHARMELEON',
      'CHARIZARD',
      'SQUIRTLE',
      'WARTORTLE',
      'BLASTOISE',
      'CATERPIE',
      'METAPOD',
      'BUTTERFREE',
      'WEEDLE',
      'KAKUNA',
      'BEEDRILL',
      'PIDGEY',
      'PIDGEOTTO',
      'PIDGEOT',
      'RATTATA',
      'RATICATE'
    ];

    expect(
      runScriptById(
        'Route10_PokemonCenter_1F_EventScript_Aide',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_EVERSTONE_FROM_OAKS_AIDE')).toBe(true);
    expect(runtime.bag.pockets.items.some((slot) => slot.itemId === 'ITEM_EVERSTONE')).toBe(true);
    expect(dialogue.queue.join(' ')).toContain('RED received the EVERSTONE');
  });

  test('Route 10 Oaks aide reports when the Pokedex count is still too low', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.pokedex.caughtSpecies = ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'];

    runScriptById(
      'Route10_PokemonCenter_1F_EventScript_Aide',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_EVERSTONE_FROM_OAKS_AIDE')).toBe(false);
    expect(runtime.bag.pockets.items.some((slot) => slot.itemId === 'ITEM_EVERSTONE')).toBe(false);
    expect(dialogue.queue.at(-1)).toContain('You need 20 kinds');
  });

  test('Route 10 Oaks aide explains Everstone use after the reward was already claimed', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'FLAG_GOT_EVERSTONE_FROM_OAKS_AIDE');

    runScriptById(
      'Route10_PokemonCenter_1F_EventScript_Aide',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue).toEqual([
      'Making POKeMON evolve certainly\ncan add to the POKeDEX.',
      'However, at times, you may not\nwant a certain POKeMON to evolve.',
      'In that case, give the EVERSTONE\nto that POKeMON.',
      'It will prevent evolution according\nto the PROFESSOR.'
    ]);
  });

  test('Prof Oak rating handler uses the decomp rating dialogue flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.pokedex.seenSpecies = ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'];
    runtime.pokedex.caughtSpecies = ['BULBASAUR', 'IVYSAUR'];

    runScriptById(
      'PokedexRating_EventScript_RateInPerson',
      { player, dialogue, runtime, speakerId: 'LOCALID_OAKS_LAB_PROF_OAK' },
      prototypeScriptRegistry
    );

    expect(dialogue.speakerId).toBe('LOCALID_OAKS_LAB_PROF_OAK');
    expect(dialogue.queue[0]).toContain('OAK: Good to see you!');
    expect(dialogue.queue.join(' ')).toContain("2 POK");
    expect(dialogue.queue.at(-1)).toContain('Go into every patch of grass');
  });

  test('Viridian Mart NPC stubs mirror the exported map dialogue ids', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_Mart_EventScript_Woman', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue).toEqual([
      'This shop does good business in',
      "ANTIDOTES, I've heard."
    ]);

    runScriptById(
      'ViridianCity_Mart_EventScript_Youngster',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );
    expect(dialogue.queue).toEqual([
      "I've got to buy some POTIONS.",
      'You never know when your POKeMON',
      'will need quick healing.'
    ]);
  });

  test('Viridian School NPC stubs mirror the exported map dialogue ids', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_School_EventScript_Woman', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue).toEqual([
      'Okay!',
      "Be sure to read what's on the blackboard carefully!"
    ]);

    runScriptById('ViridianCity_School_EventScript_Lass', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue).toEqual([
      "Whew! I'm trying to memorize all my notes."
    ]);
  });

  test('std msgbox-backed npc and sign scripts follow decomp text flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('Test_EventScript_NPC', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('ポケモンの　せかいへ');
    expect(dialogue.fieldMessageBox.frame).toBe('std');

    runScriptById('EventScript_TestSignpostMsg', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('かんばん');
    expect(dialogue.fieldMessageBox.frame).toBe('signpost');
  });

  test('Viridian School study props follow the original decomp text ids', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_School_EventScript_Notebook', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain("Let's check out the notebook.");
    expect(dialogue.queue).toContain('People who raise and battle\nwith POKéMON are called TRAINERS.');

    runScriptById('ViridianCity_School_EventScript_Blackboard', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('The blackboard lists POKéMON');

    runScriptById('ViridianCity_School_EventScript_PokemonJournal', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('POKéMON JOURNAL');
  });

  test('blackboard prompt reopens its topic menu immediately like the original script', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_School_EventScript_Blackboard', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('The blackboard lists POKéMON');

    const introPageCount = dialogue.queue.length;
    for (let i = 0; i < introPageCount; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.text).toContain('topic');
    expect(dialogue.choice?.kind).toBe('multichoice');

    pressA(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('asleep');

    const explanationPageCount = dialogue.queue.length;
    for (let i = 0; i < explanationPageCount; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.text).toContain('topic');
    expect(dialogue.choice?.kind).toBe('multichoice');
    expect(dialogue.choice?.selectedIndex).toBe(0);
  });

  test('badge explainer uses the decomp list menu flow instead of a stub', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('CeruleanCity_House1_EventScript_BadgeGuy', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('Only skilled TRAINERS');

    for (let i = 0; i < 4 && !dialogue.choice; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.text.length).toBeGreaterThan(0);
    expect(dialogue.choice?.kind).toBe('listmenu');
    expect(dialogue.scriptSession?.waitingFor).toBe('task');
    expect(dialogue.choice?.options[0]).toBe('BOULDERBADGE');
    expect(dialogue.choice?.options.at(-1)).toBe('EXIT');

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);

    expect(dialogue.queue[0]).toContain('The ATTACK stat');

    for (let i = 0; i < dialogue.queue.length; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.choice?.kind).toBe('listmenu');
    expect(dialogue.choice?.selectedIndex).toBe(0);
  });

  test('Mystery Event Club uses the decomp unsupported-data message', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'MysteryEventClub_EventScript_Woman',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue).toEqual([
      'Welcome to the MYSTERY EVENT CLUB!',
      MYSTERY_EVENT_MESSAGES.cantBeUsed
    ]);
  });

  test('decomp trainer scripts queue real trainer battles from global data/scripts includes', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    expect(
      runScriptById(
        'Route3_EventScript_Ben',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);

    expect(dialogue.queue).toEqual([
      'Hi!\nI like shorts!',
      "They're delightfully comfy and\neasy to wear!"
    ]);
    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_YOUNGSTER_BEN',
      trainerName: 'BEN',
      trainerClass: 'TRAINER_CLASS_YOUNGSTER',
      defeatFlag: 'TRAINER_DEFEATED_TRAINER_YOUNGSTER_BEN'
    });
    expect(runtime.pendingTrainerBattle?.opponentParty.map((pokemon) => pokemon.species)).toEqual(['RATTATA', 'EKANS']);
    expect(runtime.lastScriptId).toBe('Route3_EventScript_Ben');
  });

  test('decomp trainer battles can resume the original script after a win', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'Route3_EventScript_Ben',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    const continuation = runtime.pendingTrainerBattle?.continueScriptSession;
    expect(continuation).toBeTruthy();

    setScriptFlag(runtime, runtime.pendingTrainerBattle!.defeatFlag);
    runtime.pendingTrainerBattle = null;

    resumeDecompFieldScriptSession(dialogue, {
      runtime,
      player,
      speakerId: continuation!.speakerId,
      session: continuation!.session
    });

    expect(dialogue.queue).toEqual([
      "Are you using a POKéMON CENTER's\nPC for storing your POKéMON?",
      'Each BOX can hold up to\n30 POKéMON.'
    ]);
  });

  test('trainerbattle_no_intro skips defeat text and resumes the original script after battle', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'MtEmber_Exterior_EventScript_BattleGrunt1',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );
    tickScriptTasks(dialogue, runtime, player);

    expect(dialogue.queue.join(' ')).toContain("You've been eavesdropping on us");
    expect(dialogue.queue.join(' ')).not.toContain('Huh, what?');

    const introPageCount = dialogue.queue.length;
    for (let i = 0; i < introPageCount; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.active).toBe(false);
    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_TEAM_ROCKET_GRUNT_43',
      format: 'singles'
    });

    const continuation = runtime.pendingTrainerBattle?.continueScriptSession;
    expect(continuation).toBeTruthy();

    setScriptFlag(runtime, runtime.pendingTrainerBattle!.defeatFlag);
    runtime.pendingTrainerBattle = null;

    resumeDecompFieldScriptSession(dialogue, {
      runtime,
      player,
      speakerId: continuation!.speakerId,
      session: continuation!.session
    });

    expect(dialogue.queue).toEqual(["Why'd you have to win?"]);
  });

  test('trainerbattle event scripts run their dedicated post-battle branch before later repeat dialogue', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'RocketHideout_B1F_EventScript_Grunt5',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue.join(' ')).toContain('little mouse');

    closeDialogue(dialogue);

    const continuation = runtime.pendingTrainerBattle?.continueScriptSession;
    expect(continuation).toBeTruthy();
    expect(dialogue.active).toBe(false);

    setScriptFlag(runtime, runtime.pendingTrainerBattle!.defeatFlag);
    runtime.pendingTrainerBattle = null;

    resumeDecompFieldScriptSession(dialogue, {
      runtime,
      player,
      speakerId: continuation!.speakerId,
      session: continuation!.session
    });

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession).toBeNull();

    runScriptById(
      'RocketHideout_B1F_EventScript_Grunt5',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue.join(' ')).toContain('opened');
    expect(runtime.pendingTrainerBattle).toBeNull();
  });

  test('decomp trainer scripts fall through to post-battle dialogue after the trainer was beaten', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'TRAINER_DEFEATED_TRAINER_YOUNGSTER_BEN');

    expect(
      runScriptById(
        'Route3_EventScript_Ben',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);

    expect(dialogue.queue).toEqual([
      "Are you using a POKéMON CENTER's\nPC for storing your POKéMON?",
      'Each BOX can hold up to\n30 POKéMON.'
    ]);
    expect(runtime.pendingTrainerBattle).toBeNull();
  });

  test('bedroom PC script now drives the decomp-style menu loop until TURN OFF', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.startMenu.playerName = 'RED';
    runtime.newGame.pcItems = [{ itemId: 'ITEM_POTION', quantity: 1 }];

    runScriptById(
      'PalletTown_PlayersHouse_2F_EventScript_PC',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue).toEqual(['RED booted up the PC.']);
    expect(runtime.pcScreenEffect.mode).toBe('turnOn');

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['ITEM STORAGE', 'MAILBOX', 'TURN OFF']);
    expect(dialogue.scriptSession?.waitingFor).toBe('task');

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['WITHDRAW ITEM', 'DEPOSIT ITEM', 'CANCEL']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['POTION', 'CANCEL']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.queue).toEqual(['Withdrew POTION.']);
    expect(getBagQuantity(runtime.bag, 'ITEM_POTION')).toBe(1);
    expect(runtime.newGame.pcItems).toEqual([]);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['WITHDRAW ITEM', 'DEPOSIT ITEM', 'CANCEL']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['POTION', 'CANCEL']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.queue).toEqual(['Stored POTION.']);
    expect(getBagQuantity(runtime.bag, 'ITEM_POTION')).toBe(0);
    expect(runtime.newGame.pcItems).toEqual([{ itemId: 'ITEM_POTION', quantity: 1 }]);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['WITHDRAW ITEM', 'DEPOSIT ITEM', 'CANCEL']);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.choice?.options).toEqual(['ITEM STORAGE', 'MAILBOX', 'TURN OFF']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession).toBeNull();
  });

  test('waitstate suspends Field_AskSaveTheGame until the yes-no prompt resolves', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'EventScript_AskSaveGame',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.choice?.kind).toBe('yesno');
    expect(dialogue.scriptSession?.waitingFor).toBe('task');

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);

    expect(runtime.vars.VAR_RESULT).toBe(1);
    expect(dialogue.scriptSession).toBeNull();
    expect(dialogue.active).toBe(false);
  });

  test('generic PC script can enter Hall of Fame and return to the PC menu before logging off', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.startMenu.playerName = 'RED';
    setScriptFlag(runtime, 'FLAG_SYS_GAME_CLEAR');

    runScriptById(
      'EventScript_PC',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );

    expect(dialogue.queue).toEqual(['RED booted up the PC.']);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    if (!dialogue.choice) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.choice?.options).toEqual([
      "SOMEONE'S PC",
      "RED'S PC",
      "PROF. OAK'S PC",
      'HALL OF FAME',
      'LOG OFF'
    ]);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);

    expect(dialogue.queue[0]).toBe('Welcome to the HALL OF FAME!');
    expect(runtime.pcScreenEffect.mode).toBe('turnOff');

    while (dialogue.active && !dialogue.choice) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.choice?.options.at(-1)).toBe('LOG OFF');

    for (let i = 0; i < 4; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, down: true, downPressed: true }, runtime, player);
    }
    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession).toBeNull();
    expect(runtime.pcScreenEffect.mode).toBe('turnOff');
  });

  test('decomp fallback can follow simple facing-based branches used by museum counters', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();
    player.facing = 'up';

    const pages = resolveSimpleDecompDialogue(
      'PewterCity_Museum_1F_EventScript_Scientist1',
      runtime,
      player
    );

    expect(pages).toBeTruthy();
    expect(pages?.[0]).toContain("You can't sneak in the back way!");
    expect(pages?.join(' ')).toContain('Do you know what AMBER is?');
  });

  test('Pewter Museum admission takes the ticket fee and marks admission paid', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setRuntimeMoney(runtime, 3000);
    runScriptById('PewterCity_Museum_1F_EventScript_Scientist1', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(getRuntimeMoney(runtime)).toBe(2950);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('Thank you');
  });

  test('Pewter Museum OLD AMBER scientist gives the fossil once', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PewterCity_Museum_1F_EventScript_OldAmberScientist', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_OLD_AMBER')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_OLD_AMBER')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('received the OLD AMBER');

    closeDialogue(dialogue);
    runScriptById('PewterCity_Museum_1F_EventScript_OldAmberScientist', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getBagQuantity(runtime.bag, 'ITEM_OLD_AMBER')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('Take good care');
  });

  test('Pewter Museum Seismic Toss tutor teaches the lead Pokemon once', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.party[0] = { ...runtime.party[0]!, nickname: 'BLAZE', moves: ['SCRATCH'] };

    runScriptById('PewterCity_Museum_1F_EventScript_SeismicTossTutor', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(isScriptFlagSet(runtime, 'FLAG_TUTOR_SEISMIC_TOSS')).toBe(true);
    expect(runtime.party[0]?.moves).toContain('SEISMIC TOSS');
    expect(dialogue.queue.join(' ')).toContain('learned SEISMIC TOSS');
  });

  test('decomp fallback can follow conditional call branches from the original scripts', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();

    const preBrockPages = resolveSimpleDecompDialogue('EventScript_AfterWhiteOutHeal', runtime, player);
    expect(preBrockPages).toBeTruthy();
    expect(preBrockPages?.join(' ')).toContain('buy some POTIONS');

    setScriptFlag(runtime, 'FLAG_DEFEATED_BROCK');
    const postBrockPages = resolveSimpleDecompDialogue('EventScript_AfterWhiteOutHeal', runtime, player);
    expect(postBrockPages).toBeTruthy();
    expect(postBrockPages?.join(' ')).not.toContain('buy some POTIONS');
    expect(postBrockPages?.join(' ')).toContain('We hope you excel!');
  });

  test('decomp runtime honors defeated-trainer call branches from map scripts', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();

    resolveSimpleDecompDialogue('FiveIsland_LostCave_Room10_OnResume', runtime, player);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_FIVE_ISLAND_LOST_CAVE_ROOM10')).toBe(0);

    setScriptFlag(runtime, 'TRAINER_DEFEATED_TRAINER_LADY_SELPHY');
    resolveSimpleDecompDialogue('FiveIsland_LostCave_Room10_OnResume', runtime, player);
    expect(getScriptVar(runtime, 'VAR_MAP_SCENE_FIVE_ISLAND_LOST_CAVE_ROOM10')).toBe(1);
  });

  test('decomp npc scripts can branch on defeated trainers just like the original game', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('MtEmber_Exterior_EventScript_Grunt1', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain("We'll try digging here");
    expect(runtime.pendingTrainerBattle).toBeNull();

    setScriptFlag(runtime, 'TRAINER_DEFEATED_TRAINER_TEAM_ROCKET_GRUNT_43');
    runScriptById('MtEmber_Exterior_EventScript_Grunt1', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain("Why'd you have to win?");
    expect(runtime.pendingTrainerBattle).toBeNull();
  });

  test('decomp scripts honor goto_if_not_defeated trainer branches used by gym quizzes', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('CinnabarIsland_Gym_EventScript_Quiz1Incorrect', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('Bad call');

    const firstMessagePages = dialogue.queue.length;
    for (let i = 0; i < firstMessagePages; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.queue.join(' ')).toContain('I was a thief');

    const quinnIntroPages = dialogue.queue.length;
    for (let i = 0; i < quinnIntroPages; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_BURGLAR_QUINN'
    });

    setScriptFlag(runtime, 'TRAINER_DEFEATED_TRAINER_BURGLAR_QUINN');
    runtime.pendingTrainerBattle = null;
    runScriptById('CinnabarIsland_Gym_EventScript_Quiz1Incorrect', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('Bad call');

    const alreadyDefeatedPages = dialogue.queue.length;
    for (let i = 0; i < alreadyDefeatedPages; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.active).toBe(false);
    expect(runtime.pendingTrainerBattle).toBeNull();
  });

  test('std msgbox yes-no uses the original window placement from decomp scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('UndergroundPath_NorthEntrance_EventScript_Saige', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('trade');

    for (let i = 0; i < 4 && !dialogue.choice; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.choice?.kind).toBe('yesno');
    expect(dialogue.choice?.tilemapLeft).toBe(20);
    expect(dialogue.choice?.tilemapTop).toBe(8);
  });

  test('decomp gift-item scripts award Brock TM39 and continue into the follow-up explanation', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PewterCity_Gym_EventScript_GiveTM39', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('Take this with you');
    expect(getBagQuantity(runtime.bag, 'ITEM_TM39')).toBe(0);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('received TM39');
    expect(getBagQuantity(runtime.bag, 'ITEM_TM39')).toBe(1);
    expect(getBagQuantity(runtime.bag, 'ITEM_TM_CASE')).toBe(1);

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    expect(isScriptFlagSet(runtime, 'FLAG_GOT_TM39_FROM_BROCK')).toBe(true);
    expect(dialogue.queue.join(' ')).toContain('ROCK TOMB');

    expect(dialogue.choice).toBeNull();
  });

  test('Fishing Guru now gives the Old Rod through the original yes-no flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('VermilionCity_House1_EventScript_FishingGuru', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    expect(dialogue.queue.join(' ')).toContain('do you like to fish');

    pressA(dialogue, runtime, player);
    expect(getBagQuantity(runtime.bag, 'ITEM_OLD_ROD')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('Take this and fish');

    for (let i = 0; i < 6 && !isScriptFlagSet(runtime, 'FLAG_GOT_OLD_ROD'); i += 1) {
      pressA(dialogue, runtime, player);
    }
    expect(isScriptFlagSet(runtime, 'FLAG_GOT_OLD_ROD')).toBe(true);
    expect(dialogue.queue.join(' ')).toContain('Fishing is a way of life');
  });

  test('Fan Club chairman gives the Bike Voucher through the decomp story flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('VermilionCity_PokemonFanClub_EventScript_Chairman', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 16 && !isScriptFlagSet(runtime, 'FLAG_GOT_BIKE_VOUCHER'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_BIKE_VOUCHER')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_BIKE_VOUCHER')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('BIKE VOUCHER');
  });

  test('Bike Shop clerk exchanges the Bike Voucher using the decomp script', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'FLAG_GOT_BIKE_VOUCHER');
    addBagItem(runtime.bag, 'ITEM_BIKE_VOUCHER', 1);

    runScriptById('CeruleanCity_BikeShop_EventScript_Clerk', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('BIKE VOUCHER');

    for (let i = 0; i < 6 && !isScriptFlagSet(runtime, 'FLAG_GOT_BICYCLE'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_BICYCLE')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_BIKE_VOUCHER')).toBe(0);
    expect(getBagQuantity(runtime.bag, 'ITEM_BICYCLE')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('Thank you');
  });

  test('Berry Powder man gives the Powder Jar after the Berry Pouch gate', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('CeruleanCity_House5_EventScript_BerryPowderMan', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(isScriptFlagSet(runtime, 'FLAG_GOT_POWDER_JAR')).toBe(false);
    expect(dialogue.queue.join(' ')).toContain('Not a one');

    closeDialogue(dialogue);
    setScriptFlag(runtime, 'FLAG_SYS_GOT_BERRY_POUCH');
    runScriptById('CeruleanCity_House5_EventScript_BerryPowderMan', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_POWDER_JAR')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_POWDER_JAR')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('received the POWDER JAR');
  });

  test('Route 4 Magikarp salesman sells one Magikarp and charges money once', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.party = [runtime.party[0]!];
    setRuntimeMoney(runtime, 3000);

    runScriptById('Route4_PokemonCenter_1F_EventScript_MagikarpSalesman', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(isScriptFlagSet(runtime, 'FLAG_BOUGHT_MAGIKARP')).toBe(true);
    expect(getRuntimeMoney(runtime)).toBe(2500);
    expect(runtime.party.some((pokemon) => pokemon.species === 'MAGIKARP')).toBe(true);
    expect(dialogue.queue.join(' ')).toContain('bought MAGIKARP');
  });

  test('Route 2 Oaks aide gives HM05 after ten seen Pokemon', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.pokedex.seenSpecies = [
      'BULBASAUR', 'IVYSAUR', 'VENUSAUR', 'CHARMANDER', 'CHARMELEON',
      'CHARIZARD', 'SQUIRTLE', 'WARTORTLE', 'BLASTOISE', 'CATERPIE'
    ];

    runScriptById('Route2_EastBuilding_EventScript_Aide', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_HM05')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_HM05')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('received HM05');
  });

  test('Cerulean in-game trade now runs through the original decomp trade flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0] = {
      ...runtime.party[0]!,
      species: 'POLIWHIRL',
      nickname: 'BUBBLE'
    };

    runScriptById('CeruleanCity_House3_EventScript_Dontae', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    tickScriptTasks(dialogue, runtime, player);
    expect(dialogue.choice?.kind).toBe('listmenu');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 8 && !isScriptFlagSet(runtime, 'FLAG_DID_ZYNX_TRADE'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_DID_ZYNX_TRADE')).toBe(true);
    expect(runtime.party[0]?.species).toBe('JYNX');
    expect(runtime.party[0]?.nickname).toBe('ZYNX');
  });

  test('Vermilion in-game trade now swaps Spearow for CH\'DING through the decomp script', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0] = {
      ...runtime.party[0]!,
      species: 'SPEAROW',
      nickname: 'PECKY'
    };

    runScriptById('VermilionCity_House2_EventScript_Elyssa', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    tickScriptTasks(dialogue, runtime, player);
    expect(dialogue.choice?.kind).toBe('listmenu');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 8 && !isScriptFlagSet(runtime, 'FLAG_DID_CH_DING_TRADE'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_DID_CH_DING_TRADE')).toBe(true);
    expect(runtime.party[0]?.species).toBe('FARFETCHD');
    expect(runtime.party[0]?.nickname).toBe("CH'DING");
  });

  test('Move tutors now choose and teach party Pokemon through the decomp field flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0] = {
      ...runtime.party[0]!,
      species: 'CHARMANDER',
      nickname: 'BLAZE',
      moves: ['SCRATCH']
    };

    runScriptById('Route4_EventScript_MegaPunchTutor', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('listmenu');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 8 && !isScriptFlagSet(runtime, 'FLAG_TUTOR_MEGA_PUNCH'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_TUTOR_MEGA_PUNCH')).toBe(true);
    expect(runtime.party[0]?.moves).toContain('MEGA PUNCH');
  });

  test('Move relearner scripts now choose a party Pokemon and relearn moves through the decomp flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    addBagItem(runtime.bag, 'ITEM_TINY_MUSHROOM', 2);
    runtime.party[0] = {
      ...runtime.party[0]!,
      species: 'CHARMANDER',
      nickname: 'BLAZE',
      level: 10,
      moves: ['SCRATCH']
    };

    runScriptById('TwoIsland_House_EventScript_MoveManiac', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('listmenu');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('listmenu');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 10 && getBagQuantity(runtime.bag, 'ITEM_TINY_MUSHROOM') > 0; i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(getBagQuantity(runtime.bag, 'ITEM_TINY_MUSHROOM')).toBe(0);
    expect((runtime.party[0]?.moves ?? []).length).toBeGreaterThan(1);
    expect(dialogue.queue.join(' ')).toContain('handed over');
  });

  test('Four Island daycare retrieval keeps the remaining mon selected through the original level menu flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party = [
      {
        ...runtime.party[0]!,
        species: 'SPEAROW',
        nickname: 'SCOUT'
      }
    ];
    runtime.stringVars.daycareMon1 = 'BLAZE';
    runtime.stringVars.daycareSpecies_0 = 'CHARMANDER';
    runtime.stringVars.daycareMonData_0 = JSON.stringify({
      ...runtime.party[0]!,
      species: 'CHARMANDER',
      nickname: 'BLAZE',
      otName: 'PLAYER'
    });
    runtime.vars.daycareLevelsGained_0 = 1;
    runtime.stringVars.daycareMon2 = 'WING';
    runtime.stringVars.daycareSpecies_1 = 'PIDGEY';
    runtime.stringVars.daycareMonData_1 = JSON.stringify({
      ...runtime.party[0]!,
      species: 'PIDGEY',
      nickname: 'WING',
      otName: 'PLAYER'
    });
    runtime.vars.daycareLevelsGained_1 = 0;

    runScriptById('FourIsland_PokemonDayCare_EventScript_DaycareWoman', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player, 12);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);
    tickScriptTasks(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('multichoice');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 12 && !runtime.party.some((pokemon) => pokemon.nickname === 'BLAZE'); i += 1) {
      tickScriptTasks(dialogue, runtime, player);
      pressA(dialogue, runtime, player);
    }

    expect(runtime.party.some((pokemon) => pokemon.nickname === 'BLAZE')).toBe(true);
    expect(runtime.stringVars.daycareMon1).toBe('WING');
    expect(runtime.stringVars.daycareSpecies_0).toBe('PIDGEY');
  });

  test('VS Seeker woman uses the decomp global event script and gives the item', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'VermilionCity_PokemonCenter_1F_EventScript_VSSeekerWoman',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );
    tickScriptTasks(dialogue, runtime, player);

    expect(dialogue.queue.join(' ')).toContain('urge');
    for (let i = 0; i < 8 && !isScriptFlagSet(runtime, 'FLAG_GOT_VS_SEEKER'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(isScriptFlagSet(runtime, 'FLAG_GOT_VS_SEEKER')).toBe(true);
    expect(getBagQuantity(runtime.bag, 'ITEM_VS_SEEKER')).toBe(1);
    expect(dialogue.queue.join(' ')).toContain('looking for a rematch');
  });

  test('Vermilion Pokemon Center nurse heals the party through the local handler', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    runtime.party[0] = { ...runtime.party[0]!, hp: 1, status: 'poison' };

    runScriptById('VermilionCity_PokemonCenter_1F_EventScript_Nurse', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(runtime.party[0]?.hp).toBe(runtime.party[0]?.maxHp);
    expect(runtime.party[0]?.status).toBe('none');
    expect(dialogue.queue.join(' ')).toContain('restored your POKéMON');
  });

  test('Vermilion Gym trash cans open adjacent locks and reset on the wrong second can', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('VermilionCity_Gym_EventScript_TrashCan3', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getScriptVar(runtime, 'VAR_VERMILION_GYM_TRASH_FIRST_LOCK')).toBe(3);
    expect(dialogue.queue.join(' ')).toContain('first electric lock opened');

    closeDialogue(dialogue);
    runScriptById('VermilionCity_Gym_EventScript_TrashCan8', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getScriptVar(runtime, 'VAR_VERMILION_GYM_TRASH_FIRST_LOCK')).toBe(0);
    expect(getScriptVar(runtime, 'VAR_VERMILION_GYM_TRASH_SECOND_LOCK')).toBe(0);
    expect(dialogue.queue.join(' ')).toContain('electric locks reset');

    closeDialogue(dialogue);
    runScriptById('VermilionCity_Gym_EventScript_TrashCan3', { player, dialogue, runtime }, prototypeScriptRegistry);
    closeDialogue(dialogue);
    runScriptById('VermilionCity_Gym_EventScript_TrashCan4', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(getScriptVar(runtime, 'VAR_VERMILION_GYM_TRASH_SECOND_LOCK')).toBe(4);
    expect(dialogue.queue.join(' ')).toContain('second electric lock opened');
  });

  test('Union Room attendant first follows the original Wireless Club adjustments gate', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('Common_EventScript_UnionRoomAttendant', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue.join(' ')).toContain('undergoing adjustments');
    expect(dialogue.choice).toBeNull();
  });

  test('Union Room attendant now follows the original adapter-not-connected branch after the Pokedex unlock', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'FLAG_SYS_POKEDEX_GET');

    runScriptById('Common_EventScript_UnionRoomAttendant', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue.join(' ')).toContain('UNION ROOM');
    expect(dialogue.queue.join(' ')).toContain('Adapter');
    expect(dialogue.choice).toBeNull();
  });

  test('Wireless Club attendant now runs the original yes-no explainer flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'FLAG_SYS_POKEDEX_GET');

    runScriptById('Common_EventScript_WirelessClubAttendant', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('UNION ROOM');
    expect(dialogue.queue.join(' ')).toContain('DIRECT CORNER');
  });

  test('Direct Corner attendant falls back to the original cable club menu when no adapter is connected', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptFlag(runtime, 'FLAG_SYS_POKEDEX_GET');

    runScriptById('Common_EventScript_DirectCornerAttendant', { player, dialogue, runtime }, prototypeScriptRegistry);
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('multichoice');
    expect(dialogue.choice?.options).toEqual(expect.arrayContaining(['TRADE CENTER', 'COLOSSEUM']));

    pressB(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('Please do visit again');
  });

  test('Cable club trade-center script now uses the original save-and-link abort flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'Route4_PokemonCenter_2F_EventScript_TradeCenter',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 6 && !dialogue.queue.join(' ').includes('Please do visit again'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(dialogue.queue.join(' ')).toContain('Please do visit again');
  });

  test('Cable club colosseum script now uses the original battle-mode and abort flow', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById(
      'Route4_PokemonCenter_2F_EventScript_Colosseum',
      { player, dialogue, runtime },
      prototypeScriptRegistry
    );
    tickScriptTasks(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('multichoice');
    pressA(dialogue, runtime, player);
    advanceToChoice(dialogue, runtime, player);

    expect(dialogue.choice?.kind).toBe('yesno');
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 6 && !dialogue.queue.join(' ').includes('Please do visit again'); i += 1) {
      pressA(dialogue, runtime, player);
    }

    expect(dialogue.queue.join(' ')).toContain('Please do visit again');
  });

  test('applymovement now moves the player through decomp cutscene movement blocks', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    player.position = { x: 12 * 16, y: 5 * 16 };
    player.currentTile = { x: 12, y: 5 };
    player.previousTile = { x: 12, y: 5 };

    runDecompFieldScript(
      'PewterCity_Museum_1F_EventScript_EntranceTriggerLeft',
      { player, dialogue, runtime, speakerId: 'system' }
    );
    tickScriptTasks(dialogue, runtime, player);

    expect(player.facing).toBe('right');
    expect(player.position).toEqual({ x: 12 * 16, y: 5 * 16 });
    advanceToChoice(dialogue, runtime, player);
    pressA(dialogue, runtime, player);

    for (let i = 0; i < 6 && !dialogue.queue.join(' ').includes('Thank you'); i += 1) {
      tickScriptTasks(dialogue, runtime, player);
      pressA(dialogue, runtime, player);
    }

    expect(player.position).toEqual({ x: 14 * 16, y: 5 * 16 });
    expect(player.currentTile).toEqual({ x: 14, y: 5 });
    expect(player.facing).toBe('right');
    expect(getRuntimeMoney(runtime)).toBe(2950);
  });

  test('decomp movement scripts apply jump, delay, visibility, and facing-lock actions', () => {
    const player = createPlayer();
    player.position = { x: 4 * 16, y: 4 * 16 };
    player.currentTile = { x: 4, y: 4 };
    player.previousTile = { x: 4, y: 4 };

    expect(applyDecompMovementScript(player, 'ViridianCity_Movement_JumpDownLedge', player)).toBe(true);
    expect(player.position).toEqual({ x: 4 * 16, y: 6 * 16 });
    expect(player.currentTile).toEqual({ x: 4, y: 6 });
    expect(player.lastStartedMovementActionId).toBe(0x14);

    const npc = createTestNpc('LOCALID_SCRIPTED_NPC');
    npc.initialFacing = 'left';

    expect(applyDecompMovementScript(npc, 'Common_Movement_FaceOriginalDirection', player)).toBe(true);
    expect(npc.facing).toBe('left');

    npc.facingLocked = true;
    expect(applyDecompMovementScript(npc, 'Common_Movement_WalkInPlaceFasterRight', player)).toBe(true);
    expect(npc.facing).toBe('left');
    expect(npc.movementDirection).toBe('right');
    expect(npc.lastStartedMovementActionId).toBe(0x30);
  });

  test('applymovement now restores NPC original facing from decomp movement blocks', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    const scientist: NpcState = {
      ...createTestNpc('LOCALID_MUSEUM_SCIENTIST1'),
      position: { x: 16 * 16, y: 5 * 16 },
      currentTile: { x: 16, y: 5 },
      previousTile: { x: 16, y: 5 },
      facing: 'down',
      initialFacing: 'left'
    };

    runScriptById(
      'PewterCity_Museum_1F_EventScript_AmberHasGeneticMatter',
      { player, dialogue, runtime, npcs: [scientist] },
      prototypeScriptRegistry
    );

    expect(dialogue.queue.join(' ')).toContain('genetic matter');
    for (let i = 0; i < 4 && scientist.facing !== 'left'; i += 1) {
      stepDecompFieldDialogue(
        dialogue,
        { ...neutralInput, interact: true, interactPressed: true },
        runtime,
        player,
        [scientist]
      );
    }

    expect(scientist.facing).toBe('left');
  });

  test('waitmovement pauses script continuation until the decomp script-movement task finishes', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    player.position = { x: 6 * 16, y: 8 * 16 };
    player.currentTile = { x: 6, y: 8 };
    player.previousTile = { x: 6, y: 8 };

    expect(runDecompFieldScript(
      'PokemonLeague_EventScript_EnterRoom',
      { player, dialogue, runtime, speakerId: 'system' }
    )).toBe(true);

    expect(dialogue.scriptSession?.waitingFor).toBe('movement');
    expect(isScriptFlagSet(runtime, 'FLAG_TEMP_2')).toBe(false);
    expect(player.currentTile).toEqual({ x: 6, y: 8 });

    tickScriptTasks(dialogue, runtime, player);
    expect(player.currentTile).toEqual({ x: 6, y: 3 });
    expect(dialogue.scriptSession).toBeNull();
    expect(isScriptFlagSet(runtime, 'FLAG_TEMP_2')).toBe(true);
  });

  test('door animation script commands now track decomp door open and close state', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    const bill = {
      ...createTestNpc('LOCALID_CINNABAR_BILL'),
      position: { x: 14 * 16, y: 11 * 16 },
      currentTile: { x: 14, y: 11 },
      previousTile: { x: 14, y: 11 },
      facing: 'down' as const,
      initialFacing: 'down' as const
    };

    runDecompFieldScript(
      'CinnabarIsland_EventScript_BillReturnToPokeCenter',
      { player, dialogue, runtime, speakerId: 'system', npcs: [bill] }
    );
    tickScriptTasks(dialogue, runtime, player, 256, [bill]);

    expect(runtime.doorAnimations['14,11']).toBe('closed');
  });

  test('dynamic warp commands now keep the original destination from elevator scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptVar(runtime, 'VAR_ELEVATOR_FLOOR', 4);
    runDecompFieldScript(
      'SilphCo_Elevator_EventScript_To1F',
      { player, dialogue, runtime, speakerId: 'system' }
    );

    expect(runtime.dynamicWarp).toEqual({
      mapId: 'MAP_SILPH_CO_1F',
      warpId: 255,
      x: 22,
      y: 3
    });
  });

  test('script warp commands now queue direct map transitions from decomp scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    setScriptVar(runtime, 'VAR_ELEVATOR_FLOOR', 4);
    runDecompFieldScript(
      'TrainerTower_Elevator_EventScript_SelectLobby',
      { player, dialogue, runtime, speakerId: 'system' }
    );
    tickScriptTasks(dialogue, runtime, player);

    expect(runtime.dynamicWarp).toEqual({
      mapId: 'MAP_TRAINER_TOWER_LOBBY',
      warpId: 255,
      x: 17,
      y: 8
    });
    expect(runtime.pendingScriptWarp).toEqual({
      mapId: 'MAP_TRAINER_TOWER_LOBBY',
      warpId: 255,
      x: 17,
      y: 8,
      kind: 'warp'
    });
  });

  test('camera-object cutscenes now run camera movement and visual effect specials', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();
    player.position = { x: 5 * 16, y: 6 * 16 };
    player.currentTile = { x: 5, y: 6 };
    player.previousTile = { x: 5, y: 6 };
    setScriptFlag(runtime, 'BILL_IN_TELEPORTER');

    runDecompFieldScript(
      'Route25_SeaCottage_EventScript_RunCellSeparator',
      { player, dialogue, runtime, speakerId: 'system' }
    );

    for (let i = 0; i < 24 && runtime.fieldCamera?.active !== false; i += 1) {
      pressA(dialogue, runtime, player);
      tickScriptTasks(dialogue, runtime, player);
    }

    expect(runtime.fieldCamera?.active).toBe(false);
    expect(runtime.fieldCamera?.position).toEqual({ x: 5 * 16, y: 6 * 16 });
    expect(runtime.fieldEffects.teleporterHousingPhase).toBe(2);
    expect(runtime.fieldEffects.teleporterCablePhase).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.SpawnCameraObject).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.RemoveCameraObject).toBe(1);
    expect(runtime.doorAnimations['3,3']).toBe('closed');
    expect(isScriptFlagSet(runtime, 'FLAG_HELPED_BILL_IN_SEA_COTTAGE')).toBe(true);
  });

  test('signmsg and normalmsg switch message box frames like the decomp command state', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runDecompFieldScript('PewterCity_EventScript_RunningShoesAide', { player, dialogue, runtime, speakerId: 'LOCALID_PEWTER_AIDE' });

    for (let i = 0; i < 20 && !dialogue.queue.join(' ').includes('Press the B Button'); i += 1) {
      pressA(dialogue, runtime, player);
      tickScriptTasks(dialogue, runtime, player);
    }

    expect(dialogue.queue.join(' ')).toContain('Press the B Button');
    expect(dialogue.fieldMessageBox.frame).toBe('signpost');

    pressA(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('must be going back');
    expect(dialogue.fieldMessageBox.frame).toBe('std');
  });

  test('messageautoscroll opens auto-scroll field messages from decomp scripts', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runDecompFieldScript('CableClub_EventScript_EnterColosseum', { player, dialogue, runtime, speakerId: 'system' });

    expect(dialogue.queue.join(' ')).toContain('Please enter');
    expect(dialogue.fieldMessageBox.type).toBe('autoScroll');
    expect(dialogue.fieldMessageBox.autoScroll).toBe(true);
  });

  test('braillemessage opens decomp braille text in a standard dialogue frame', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runDecompFieldScript('MtEmber_RubyPath_B4F_EventScript_BrailleABC', { player, dialogue, runtime, speakerId: 'sign' });

    expect(dialogue.queue).toEqual(['ABC']);
    expect(dialogue.fieldMessageBox.frame).toBe('std');
    expect(dialogue.fieldMessageBox.font).toBe('braille');
    expect(runtime.vars.VAR_0x8004).toBe(24);
  });

  test('remaining visual field specials now leave explicit runtime side effects', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runDecompFieldScript('PokemonLeague_EventScript_DoLightingEffect', { player, dialogue, runtime, speakerId: 'system' });
    runDecompFieldScript('EventScript_DoFallWarp', { player, dialogue, runtime, speakerId: 'system' });
    tickScriptTasks(dialogue, runtime, player);
    runDecompFieldScript('SSAnne_Exterior_ExitSSAnne', { player, dialogue, runtime, speakerId: 'system' });
    tickScriptTasks(dialogue, runtime, player);

    expect(runtime.fieldEffects.pokemonLeagueLightingActive).toBe(true);
    expect(runtime.fieldEffects.fallWarpCount).toBe(1);
    expect(runtime.fieldEffects.ssAnneDepartureScenePlayed).toBe(true);
    expect(runtime.fieldEffects.triggeredSpecials.DoPokemonLeagueLightingEffect).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoFallWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoSSAnneDepartureCutscene).toBe(1);
  });

  test('Std_FindItem follows the decomp pickup flow for TM items', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    (runtime.vars as Record<string, number | string>).VAR_0x8000 = 'ITEM_TM39';
    runtime.vars.VAR_0x8001 = 1;

    runScriptById('Std_FindItem', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue.join(' ')).toContain('found a TM39');
    expect(getBagQuantity(runtime.bag, 'ITEM_TM39')).toBe(1);
    expect(getBagQuantity(runtime.bag, 'ITEM_TM_CASE')).toBe(1);

    pressA(dialogue, runtime, player);
    expect(runtime.fieldAudio.fanfareTaskActive).toBe(true);
    for (let i = 0; i < 256 && runtime.fieldAudio.fanfareTaskActive; i += 1) {
      stepDecompFieldDialogue(dialogue, neutralInput, runtime, player);
    }
    pressA(dialogue, runtime, player);
    expect(dialogue.queue.join(' ')).toContain('put the TM39');
  });

  test('representative story chapter scripts remain reachable through the field script runner', () => {
    type StoryChapterCase = {
      chapter: string;
      scriptId: string;
      prepare?: (player: ReturnType<typeof createPlayer>) => void;
      assert: (
        runtime: ReturnType<typeof createScriptRuntimeState>,
        dialogue: ReturnType<typeof createDialogueState>,
        player: ReturnType<typeof createPlayer>
      ) => void;
    };

    const cases: StoryChapterCase[] = [
      {
        chapter: 'Pallet/Viridian',
        scriptId: 'ViridianCity_EventScript_GymDoor',
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(runtime.lastScriptId).toBe('ViridianCity_EventScript_GymDoor');
          expect(dialogue.queue.join(' ')).toContain('locked');
        }
      },
      {
        chapter: 'Pewter/Mt. Moon',
        scriptId: 'PewterCity_Gym_EventScript_Brock',
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>) => {
          expect(runtime.pendingTrainerBattle?.trainerId).toBe('TRAINER_LEADER_BROCK');
        }
      },
      {
        chapter: 'Cerulean/Bill',
        scriptId: 'CeruleanCity_Gym_EventScript_Misty',
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>) => {
          expect(runtime.pendingTrainerBattle?.trainerId).toBe('TRAINER_LEADER_MISTY');
        }
      },
      {
        chapter: 'Vermilion/S.S. Anne',
        scriptId: 'SSAnne_Exterior_ExitSSAnne',
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>) => {
          expect(runtime.fieldEffects.ssAnneDepartureScenePlayed).toBe(true);
        }
      },
      {
        chapter: 'Rock Tunnel/Lavender',
        scriptId: 'PokemonTower_5F_EventScript_PurifiedZone',
        assert: (_runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(dialogue.queue.join(' ')).toContain('purified');
        }
      },
      {
        chapter: 'Celadon/Rocket',
        scriptId: 'RocketHideout_B1F_EventScript_Grunt5',
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(runtime.pendingTrainerBattle?.trainerId).toBeTruthy();
          expect(dialogue.queue.join(' ')).toContain('little mouse');
        }
      },
      {
        chapter: 'Safari/Fuchsia',
        scriptId: 'SafariZone_SecretHouse_EventScript_Attendant',
        assert: (_runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(dialogue.queue.join(' ')).toContain('prize');
        }
      },
      {
        chapter: 'Silph/Saffron',
        scriptId: 'SilphCo_9F_EventScript_HealWoman',
        assert: (_runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(dialogue.queue.join(' ')).toContain('nap');
        }
      },
      {
        chapter: 'Cinnabar',
        scriptId: 'CinnabarIsland_Gym_EventScript_Quiz1Incorrect',
        assert: (_runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(dialogue.queue.join(' ')).toContain('Bad call');
        }
      },
      {
        chapter: 'Victory Road/E4',
        scriptId: 'PokemonLeague_EventScript_EnterRoom',
        prepare: (player: ReturnType<typeof createPlayer>) => {
          player.position = { x: 6 * 16, y: 8 * 16 };
          player.currentTile = { x: 6, y: 8 };
          player.previousTile = { x: 6, y: 8 };
        },
        assert: (runtime: ReturnType<typeof createScriptRuntimeState>, _dialogue: ReturnType<typeof createDialogueState>, player: ReturnType<typeof createPlayer>) => {
          expect(player.currentTile).toEqual({ x: 6, y: 3 });
          expect(isScriptFlagSet(runtime, 'FLAG_TEMP_2')).toBe(true);
        }
      },
      {
        chapter: 'Sevii/postgame',
        scriptId: 'MtEmber_RubyPath_B4F_EventScript_BrailleABC',
        assert: (_runtime: ReturnType<typeof createScriptRuntimeState>, dialogue: ReturnType<typeof createDialogueState>) => {
          expect(dialogue.queue).toEqual(['ABC']);
        }
      }
    ];

    for (const storyCase of cases) {
      const runtime = createScriptRuntimeState();
      const dialogue = createDialogueState();
      const player = createPlayer();
      storyCase.prepare?.(player);

      expect(
        runScriptById(storyCase.scriptId, { player, dialogue, runtime }, prototypeScriptRegistry),
        `${storyCase.chapter} should run ${storyCase.scriptId}`
      ).toBe(true);
      tickScriptTasks(dialogue, runtime, player);
      storyCase.assert(runtime, dialogue, player);
    }
  });

  test('gym leader scripts can queue trainer battles instead of dialogue stubs', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PewterCity_Gym_EventScript_Brock', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue).toContain('Fine, then! Show me your best!');
    expect(dialogue.queue.join(' ')).not.toContain('battle stub');
    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_LEADER_BROCK',
      trainerName: 'BROCK',
      defeatFlag: 'FLAG_DEFEATED_LEADER_BROCK',
      trainerClass: 'TRAINER_CLASS_LEADER',
      trainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      trainerItems: [],
      victoryFlags: ['FLAG_BADGE01_GET'],
      started: false,
      resolved: false,
      result: null
    });
    expect(runtime.pendingTrainerBattle?.opponentParty.map((pokemon) => pokemon.species)).toEqual(['GEODUDE', 'ONIX']);
    expect(getTrainerBattleMoneyReward(runtime.pendingTrainerBattle!)).toBe(1400);
  });

  test('applying a won trainer battle grants money, defeat flags, and badge flags', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('PewterCity_Gym_EventScript_Brock', { player, dialogue, runtime }, prototypeScriptRegistry);

    const payout = applyPendingTrainerBattleOutcome(runtime, runtime.pendingTrainerBattle!, 'won');

    expect(payout).toBe(1400);
    expect(getRuntimeMoney(runtime)).toBe(4400);
    expect(isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK')).toBe(true);
    expect(isScriptFlagSet(runtime, 'FLAG_BADGE01_GET')).toBe(true);
  });

  test('applying a lost trainer battle uses FireRed whiteout money loss', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runtime.party[0]!.level = 22;
    runtime.party[1]!.level = 17;
    setScriptFlag(runtime, 'FLAG_BADGE01_GET');
    setScriptFlag(runtime, 'FLAG_BADGE02_GET');
    setRuntimeMoney(runtime, 900);

    runScriptById('PewterCity_Gym_EventScript_Brock', { player, dialogue, runtime }, prototypeScriptRegistry);

    const payout = applyPendingTrainerBattleOutcome(runtime, runtime.pendingTrainerBattle!, 'lost');

    expect(payout).toBe(-528);
    expect(getRuntimeMoney(runtime)).toBe(372);
    expect(isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK')).toBe(false);
    expect(isScriptFlagSet(runtime, 'FLAG_BADGE01_GET')).toBe(true);
  });

  test('gym trainer scripts queue trainer battles and later branch on defeat flags', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_Gym_EventScript_Takashi', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue).toEqual([
      "I'm the KARATE KING!",
      'Your fate rests with me!'
    ]);
    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_BLACK_BELT_TAKASHI',
      trainerName: 'TAKASHI'
    });
    expect(runtime.pendingTrainerBattle?.opponentParty.map((pokemon) => pokemon.species)).toEqual(['MACHOKE', 'MACHOP', 'MACHOKE']);

    setScriptFlag(runtime, 'FLAG_DEFEATED_BLACK_BELT_TAKASHI');
    runtime.pendingTrainerBattle = null;

    runScriptById('ViridianCity_Gym_EventScript_Takashi', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(dialogue.queue).toEqual([
      'The POKeMON LEAGUE?',
      "You? Don't get cocky!"
    ]);
    expect(runtime.pendingTrainerBattle).toBeNull();
  });

  test('scripted gym battles now source trainer items and AI flags from parsed decomp trainer data', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('CeruleanCity_Gym_EventScript_Misty', { player, dialogue, runtime }, prototypeScriptRegistry);

    expect(runtime.pendingTrainerBattle).toMatchObject({
      trainerId: 'TRAINER_LEADER_MISTY',
      trainerName: 'MISTY',
      defeatFlag: 'TRAINER_DEFEATED_TRAINER_LEADER_MISTY',
      trainerItems: ['ITEM_SUPER_POTION'],
      trainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      victoryFlags: []
    });
    expect(runtime.pendingTrainerBattle?.opponentParty.map((pokemon) => pokemon.species)).toEqual(['STARYU', 'STARMIE']);
  });
});
