import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { stepDecompFieldDialogue } from '../src/game/decompFieldDialogue';
import { createDialogueState, stepInteraction } from '../src/game/interaction';
import { getObjectEventHiddenFlag, type NpcState } from '../src/game/npc';
import type { PlayerState } from '../src/game/player';
import { createScriptRuntimeState, type ScriptHandler } from '../src/game/scripts';

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

const createTestNpc = (): NpcState => ({
  id: 'npc-test',
  position: vec2(4 * 16, 3 * 16),
  path: [{ x: 4 * 16, y: 3 * 16 }],
  pathIndex: 0,
  facing: 'left',
  moving: false,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: ['Hello!', 'Second line'],
  dialogueIndex: 0
});

const createTestPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'right',
  moving: false,
  animationTime: 0
});

describe('interaction stepping', () => {
  test('opens dialogue with NPC directly in front and turns npc to face player', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const npc = createTestNpc();

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Hello!');
    expect(dialogue.speakerId).toBe(npc.id);
    expect(npc.facing).toBe('left');
    expect(npc.dialogueIndex).toBe(1);
  });

  test('interaction advances dialogue and then closes on final press', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const npc = createTestNpc();

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );
    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Hello!');

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );
    expect(dialogue.active).toBe(false);
    expect(dialogue.text).toBe('');
    expect(dialogue.speakerId).toBe(null);
    expect(dialogue.queue.length).toBe(0);
  });

  test('runs scripted npc interaction when script id is provided', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'object.npc-test.interact',
      dialogueLines: ['Fallback text should not run']
    };
    const registry: Record<string, ScriptHandler> = {
      'object.npc-test.interact': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'npc-test';
        d.text = 'Scripted hello';
        d.queue = ['Scripted hello', 'Scripted bye'];
        d.queueIndex = 0;
      }
    };

    expect(dialogue.active).toBe(false);
    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime,
      registry
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Scripted hello');
    expect(runtime.lastScriptId).toBe('object.npc-test.interact');
  });

  test('falls back to simple decomp dialogue for npc scripts without a custom handler', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'Route2_ViridianForest_NorthEntrance_EventScript_Youngster',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.speakerId).toBe(npc.id);
    expect(dialogue.queue[0]).toContain('Many POK');
    expect(dialogue.queue[1]).toContain('persistent');
    expect(runtime.lastScriptId).toBe('Route2_ViridianForest_NorthEntrance_EventScript_Youngster');
  });

  test('can talk to an npc across a counter tile like FireRed object interactions', () => {
    const dialogue = createDialogueState();
    const player: PlayerState = {
      position: vec2(4 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const npc: NpcState = {
      ...createTestNpc(),
      position: vec2(4 * 16, 2 * 16),
      dialogueLines: ['Counter hello']
    };
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x80;

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      undefined,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Counter hello');
    expect(dialogue.speakerId).toBe(npc.id);
  });

  test('does not talk to an npc on an incompatible elevation', () => {
    const dialogue = createDialogueState();
    const player: PlayerState = {
      ...createTestPlayer(),
      currentTile: vec2(3, 3),
      currentElevation: 3
    };
    const npc: NpcState = {
      ...createTestNpc(),
      currentTile: vec2(4, 3),
      currentElevation: 2,
      dialogueLines: ['Wrong elevation']
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16
    );

    expect(dialogue.active).toBe(false);
    expect(dialogue.speakerId).toBeNull();
    expect(npc.dialogueIndex).toBe(0);
  });

  test('allows npc interaction when object-event elevation matches or is wildcard zero', () => {
    const player: PlayerState = {
      ...createTestPlayer(),
      currentTile: vec2(3, 3),
      currentElevation: 3
    };
    const matchingNpc: NpcState = {
      ...createTestNpc(),
      currentTile: vec2(4, 3),
      currentElevation: 3,
      dialogueLines: ['Matching elevation']
    };
    const wildcardNpc: NpcState = {
      ...createTestNpc(),
      id: 'wildcard-npc',
      currentTile: vec2(4, 3),
      currentElevation: 0,
      dialogueLines: ['Wildcard elevation']
    };
    const matchingDialogue = createDialogueState();
    const wildcardDialogue = createDialogueState();

    stepInteraction(
      matchingDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [matchingNpc],
      16
    );
    stepInteraction(
      wildcardDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [wildcardNpc],
      16
    );

    expect(matchingDialogue.text).toBe('Matching elevation');
    expect(wildcardDialogue.text).toBe('Wildcard elevation');
  });

  test('uses facing-position elevation zero when the player stands on a zero-elevation tile', () => {
    const dialogue = createDialogueState();
    const player: PlayerState = {
      ...createTestPlayer(),
      currentTile: vec2(3, 3),
      currentElevation: 3
    };
    const npc: NpcState = {
      ...createTestNpc(),
      currentTile: vec2(4, 3),
      currentElevation: 2,
      dialogueLines: ['Zero elevation front position']
    };
    const tileElevations = Array.from({ length: 8 * 8 }, () => 1);
    tileElevations[3 * 8 + 3] = 0;

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      undefined,
      undefined,
      [],
      8,
      undefined,
      tileElevations
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toBe('Zero elevation front position');
  });

  test('counter interaction uses player elevation when selecting the object event behind it', () => {
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x80;
    const player: PlayerState = {
      position: vec2(4 * 16, 4 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0,
      currentTile: vec2(4, 4),
      currentElevation: 3
    };
    const npc: NpcState = {
      ...createTestNpc(),
      position: vec2(4 * 16, 2 * 16),
      currentTile: vec2(4, 2),
      currentElevation: 2,
      dialogueLines: ['Counter elevation hello']
    };
    const blockedDialogue = createDialogueState();
    const allowedDialogue = createDialogueState();

    stepInteraction(
      blockedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      undefined,
      undefined,
      [],
      8,
      tileBehaviors
    );
    npc.currentElevation = 3;
    stepInteraction(
      allowedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      undefined,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(blockedDialogue.active).toBe(false);
    expect(allowedDialogue.active).toBe(true);
    expect(allowedDialogue.text).toBe('Counter elevation hello');
  });

  test('does not interact with hidden object events even if the caller passes them in', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = createTestNpc();
    runtime.flags.add(getObjectEventHiddenFlag(npc.id));

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(false);
    expect(runtime.eventObjectLock.selectedObjectEventId).toBeNull();
    expect(npc.dialogueIndex).toBe(0);
  });

  test('runs original yes-no notebook flow from the decomp scripts', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'ViridianCity_School_EventScript_Notebook',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.queue[0]).toContain("Let's check out the notebook.");

    for (let i = 0; i < 5; i += 1) {
      stepInteraction(
        dialogue,
        { ...neutralInput, interact: true, interactPressed: true },
        player,
        [npc],
        16,
        [],
        runtime
      );
    }

    expect(dialogue.text).toBe('Turn the page?');
    expect(dialogue.choice?.options).toEqual(['YES', 'NO']);

    stepInteraction(
      dialogue,
      { ...neutralInput, down: true, downPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.choice?.selectedIndex).toBe(1);

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(false);
    expect(dialogue.scriptSession).toBeNull();
  });

  test('runs original multichoice blackboard flow from the decomp scripts', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      interactScriptId: 'ViridianCity_School_EventScript_Blackboard',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.text).toContain('STATUS problems');

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.text).toBe('Which topic do you want to read?');
    expect(dialogue.choice?.options).toEqual(['SLP', 'PSN', 'PAR', 'BRN', 'FRZ', 'EXIT']);
    expect(dialogue.choice?.columns).toBe(3);

    stepInteraction(
      dialogue,
      { ...neutralInput, down: true, downPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    stepInteraction(
      dialogue,
      { ...neutralInput, right: true, rightPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );
    expect(dialogue.choice?.selectedIndex).toBe(4);

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.text).toContain('A frozen POK');
    expect(runtime.lastScriptId).toBe('ViridianCity_School_EventScript_Blackboard');
  });

  test('runs facing trigger when there is no npc in front', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const registry: Record<string, ScriptHandler> = {
      'sign.test': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'sign';
        d.text = 'Sign text';
      }
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [{
        id: 't1',
        activation: 'interact',
        x: 4,
        y: 3,
        scriptId: 'sign.test',
        facing: 'any',
        once: false
      }],
      runtime,
      registry
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.speakerId).toBe('sign');
    expect(dialogue.text).toBe('Sign text');
    expect(runtime.lastScriptId).toBe('sign.test');
  });

  test('falls through to generic metatile interaction scripts after object and bg lookups', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x83;

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [],
      runtime,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(runtime.lastScriptId).toBe('EventScript_PC');
    expect(dialogue.queue[0]).toContain('booted up the PC');
  });

  test('uses decomp metatile predicates for bookshelf and mart shelf scripts', () => {
    const bookshelfDialogue = createDialogueState();
    const martShelfDialogue = createDialogueState();
    const player = createTestPlayer();
    const bookshelfRuntime = createScriptRuntimeState();
    const martShelfRuntime = createScriptRuntimeState();
    const bookshelfBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    const martShelfBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    bookshelfBehaviors[3 * 8 + 4] = 0x81;
    martShelfBehaviors[3 * 8 + 4] = 0x82;

    stepInteraction(
      bookshelfDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [],
      bookshelfRuntime,
      undefined,
      [],
      8,
      bookshelfBehaviors
    );
    stepInteraction(
      martShelfDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [],
      martShelfRuntime,
      undefined,
      [],
      8,
      martShelfBehaviors
    );

    expect(bookshelfRuntime.lastScriptId).toBe('EventScript_Bookshelf');
    expect(martShelfRuntime.lastScriptId).toBe('EventScript_PokeMartShelf');
  });

  test('keeps background events ahead of metatile script fallback', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x83;
    const registry: Record<string, ScriptHandler> = {
      'bg.priority': ({ dialogue: d }) => {
        d.active = true;
        d.speakerId = 'sign';
        d.text = 'background wins';
      }
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [{
        id: 'bg-priority',
        x: 4,
        y: 3,
        activation: 'interact',
        scriptId: 'bg.priority',
        facing: 'any',
        once: false
      }],
      runtime,
      registry,
      [],
      8,
      tileBehaviors
    );

    expect(runtime.lastScriptId).toBe('bg.priority');
    expect(dialogue.text).toBe('background wins');
  });

  test('requires north-facing direction for Poke Center and Poke Mart sign metatiles', () => {
    const blockedDialogue = createDialogueState();
    const allowedDialogue = createDialogueState();
    const blockedRuntime = createScriptRuntimeState();
    const allowedRuntime = createScriptRuntimeState();
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    const blockedPlayer: PlayerState = {
      position: vec2(3 * 16, 4 * 16),
      facing: 'right',
      moving: false,
      animationTime: 0
    };
    const allowedPlayer: PlayerState = {
      ...blockedPlayer,
      facing: 'up'
    };
    tileBehaviors[4 * 8 + 4] = 0x87;
    tileBehaviors[3 * 8 + 3] = 0x88;

    stepInteraction(
      blockedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      blockedPlayer,
      [],
      16,
      [],
      blockedRuntime,
      undefined,
      [],
      8,
      tileBehaviors
    );
    stepInteraction(
      allowedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      allowedPlayer,
      [],
      16,
      [],
      allowedRuntime,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(blockedRuntime.lastScriptId).toBeNull();
    expect(blockedDialogue.active).toBe(false);
    expect(allowedRuntime.lastScriptId).toBe('EventScript_PokemartSign');
    expect(allowedDialogue.active).toBe(true);
  });

  test('runs current-too-fast water interaction before surf startup like the decomp', () => {
    const dialogue = createDialogueState();
    const player: PlayerState = {
      ...createTestPlayer(),
      currentElevation: 3
    };
    const runtime = createScriptRuntimeState();
    runtime.party[0].moves = ['SURF'];
    runtime.flags.add('FLAG_BADGE05_GET');
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x11;

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [],
      16,
      [],
      runtime,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(runtime.lastScriptId).toBe('EventScript_CurrentTooFast');
    expect(dialogue.text).toContain('too fast');
    expect(player.avatarMode).not.toBe('surfing');
  });

  test('starts the decomp surf interaction only with badge, surf move, elevation, and surfable water', () => {
    const blockedDialogue = createDialogueState();
    const allowedDialogue = createDialogueState();
    const blockedPlayer: PlayerState = {
      ...createTestPlayer(),
      currentElevation: 2,
      avatarMode: 'normal'
    };
    const allowedPlayer: PlayerState = {
      ...createTestPlayer(),
      currentElevation: 3,
      avatarMode: 'normal'
    };
    const blockedRuntime = createScriptRuntimeState();
    const allowedRuntime = createScriptRuntimeState();
    blockedRuntime.party[0].moves = ['SURF'];
    allowedRuntime.party[0].moves = ['SURF'];
    blockedRuntime.flags.add('FLAG_BADGE05_GET');
    allowedRuntime.flags.add('FLAG_BADGE05_GET');
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[3 * 8 + 4] = 0x12;
    const tileElevations = Array.from({ length: 8 * 8 }, () => 3);
    tileElevations[3 * 8 + 4] = 4;
    const tileCollisionValues = Array.from({ length: 8 * 8 }, () => 0);
    const tileTerrainTypes = Array.from({ length: 8 * 8 }, () => 0);
    tileTerrainTypes[3 * 8 + 4] = 2;

    stepInteraction(
      blockedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      blockedPlayer,
      [],
      16,
      [],
      blockedRuntime,
      undefined,
      [],
      8,
      tileBehaviors,
      tileElevations,
      tileCollisionValues,
      tileTerrainTypes
    );
    stepInteraction(
      allowedDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      allowedPlayer,
      [],
      16,
      [],
      allowedRuntime,
      undefined,
      [],
      8,
      tileBehaviors,
      tileElevations,
      tileCollisionValues,
      tileTerrainTypes
    );

    expect(blockedRuntime.lastScriptId).toBeNull();
    expect(allowedRuntime.lastScriptId).toBe('EventScript_UseSurf');
    expect(allowedDialogue.choice?.kind).toBe('yesno');

    for (let i = 0; i < 4 && allowedPlayer.avatarMode !== 'surfing'; i += 1) {
      stepDecompFieldDialogue(
        allowedDialogue,
        { ...neutralInput, interact: true, interactPressed: true },
        allowedRuntime,
        allowedPlayer
      );
    }
    expect(allowedPlayer.avatarMode).toBe('surfing');

    const sameElevationRuntime = createScriptRuntimeState();
    sameElevationRuntime.party[0].moves = ['SURF'];
    sameElevationRuntime.flags.add('FLAG_BADGE05_GET');
    const sameElevationDialogue = createDialogueState();
    tileElevations[3 * 8 + 4] = 3;
    stepInteraction(
      sameElevationDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      { ...createTestPlayer(), currentElevation: 3, avatarMode: 'normal' },
      [],
      16,
      [],
      sameElevationRuntime,
      undefined,
      [],
      8,
      tileBehaviors,
      tileElevations,
      tileCollisionValues,
      tileTerrainTypes
    );
    expect(sameElevationRuntime.lastScriptId).toBeNull();
  });

  test('uses waterfall scripts only for north-facing surfing with the Volcano Badge', () => {
    const cantDialogue = createDialogueState();
    const canDialogue = createDialogueState();
    const cantRuntime = createScriptRuntimeState();
    const canRuntime = createScriptRuntimeState();
    cantRuntime.party[0].moves = ['WATERFALL'];
    canRuntime.party[0].moves = ['WATERFALL'];
    canRuntime.flags.add('FLAG_BADGE07_GET');
    const tileBehaviors = Array.from({ length: 8 * 8 }, () => 0);
    tileBehaviors[2 * 8 + 3] = 0x13;
    const cantPlayer: PlayerState = {
      position: vec2(3 * 16, 3 * 16),
      facing: 'up',
      moving: false,
      animationTime: 0,
      avatarMode: 'normal'
    };
    const canPlayer: PlayerState = {
      ...cantPlayer,
      avatarMode: 'surfing'
    };

    stepInteraction(
      cantDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      cantPlayer,
      [],
      16,
      [],
      cantRuntime,
      undefined,
      [],
      8,
      tileBehaviors
    );
    stepInteraction(
      canDialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      canPlayer,
      [],
      16,
      [],
      canRuntime,
      undefined,
      [],
      8,
      tileBehaviors
    );

    expect(cantRuntime.lastScriptId).toBe('EventScript_CantUseWaterfall');
    expect(canRuntime.lastScriptId).toBe('EventScript_Waterfall');
    expect(canDialogue.choice?.kind).toBe('yesno');
  });

  test('collects an item-ball npc into the shared bag and sets its hide flag', () => {
    const dialogue = createDialogueState();
    const player = createTestPlayer();
    const runtime = createScriptRuntimeState();
    const npc = {
      ...createTestNpc(),
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      itemId: 'ITEM_POTION',
      flag: 'FLAG_HIDE_TEST_POTION',
      dialogueLines: []
    };

    stepInteraction(
      dialogue,
      { ...neutralInput, interact: true, interactPressed: true },
      player,
      [npc],
      16,
      [],
      runtime
    );

    expect(dialogue.active).toBe(true);
    expect(dialogue.text).toContain('Obtained POTION');
    expect(runtime.flags.has('FLAG_HIDE_TEST_POTION')).toBe(true);
    expect(runtime.bag.pockets.items).toEqual([{ itemId: 'ITEM_POTION', quantity: 1 }]);
  });
});
