import { describe, expect, test } from 'vitest';
import {
  addScriptVar,
  clearScriptFlag,
  createScriptRuntimeState,
  getScriptVar,
  isScriptFlagSet,
  prototypeScriptRegistry,
  runScriptById,
  setScriptFlag,
  setScriptVar
} from '../src/game/scripts';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer } from '../src/game/player';

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
      'Welcome to our POKeMON CENTER! We heal your POKeMON back to perfect health.',
      "Okay, I'll take your POKeMON for a few seconds.",
      "We've restored your POKeMON to full health.",
      'We hope to see you again!'
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
      'May I help you?',
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

  test('Viridian School sign stubs mirror the exported map trigger ids', () => {
    const runtime = createScriptRuntimeState();
    const dialogue = createDialogueState();
    const player = createPlayer();

    runScriptById('ViridianCity_School_EventScript_Notebook', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('notebook');

    runScriptById('ViridianCity_School_EventScript_Blackboard', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.queue[0]).toContain('blackboard');

    runScriptById('ViridianCity_School_EventScript_PokemonJournal', { player, dialogue, runtime }, prototypeScriptRegistry);
    expect(dialogue.text).toContain('journal');
  });
});
