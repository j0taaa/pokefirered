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
  resolveSimpleDecompDialogue,
  resumeDecompFieldScriptSession,
  stepDecompFieldDialogue
} from '../src/game/decompFieldDialogue';
import { MYSTERY_EVENT_MESSAGES } from '../src/game/decompMysteryEventMsg';
import { enterHallOfFame } from '../src/game/decompPostBattleEvents';
import { closeDialogue, createDialogueState } from '../src/game/interaction';
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

describe('script runtime helpers', () => {
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

  test('Viridian Mart clerk shop stub exposes the decomp stock list', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    expect(
      runScriptById(
        'ViridianCity_Mart_EventScript_Clerk',
        { player, dialogue, runtime },
        prototypeScriptRegistry
      )
    ).toBe(true);

    expect(dialogue.queue).toEqual([
      'Hi, there!\nMay I help you?',
      'Shop UI stub: POKE BALL, POTION, ANTIDOTE, PARLYZ HEAL.',
      'Please come again!'
    ]);
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

    expect(dialogue.queue).toEqual([
      'Okay, thanks! Please say hi to',
      'PROF. OAK for me, too.'
    ]);
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

    runScriptById('EventScript_TestSignpostMsg', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('かんばん');
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

    stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
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

    const introPageCount = dialogue.queue.length;
    for (let i = 0; i < introPageCount; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.text.length).toBeGreaterThan(0);
    expect(dialogue.choice?.kind).toBe('listmenu');
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

    runScriptById('UndergroundPath_NorthEntrance_EventScript_Woman', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue.join(' ')).toContain('trade');

    const pageCount = dialogue.queue.length;
    for (let i = 0; i < pageCount; i += 1) {
      stepDecompFieldDialogue(dialogue, { ...neutralInput, interact: true, interactPressed: true }, runtime, player);
    }

    expect(dialogue.choice?.kind).toBe('yesno');
    expect(dialogue.choice?.tilemapLeft).toBe(20);
    expect(dialogue.choice?.tilemapTop).toBe(8);
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
      defeatFlag: 'FLAG_DEFEATED_MISTY',
      trainerItems: ['ITEM_SUPER_POTION'],
      trainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      victoryFlags: ['FLAG_BADGE02_GET']
    });
    expect(runtime.pendingTrainerBattle?.opponentParty.map((pokemon) => pokemon.species)).toEqual(['STARYU', 'STARMIE']);
  });
});
