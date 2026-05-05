import { describe, expect, test } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager } from '../src/api/sessionManager';
import { createBattleEncounterState, createBattleState, stepBattle, type BattleState } from '../src/game/battle';
import { addBagItem } from '../src/game/bag';
import type { GameRuntimeState, GameSession } from '../src/core/gameSession';
import type { InputSnapshot } from '../src/input/inputState';

const createRuntimeWithBattle = (battle: BattleState, version = 1): { readonly session: GameSession; readonly state: GameRuntimeState } => {
  const manager = new SessionManager({ createId: () => `battle-api-${Math.random().toString(16).slice(2)}` });
  const created = manager.createSession();
  const state = created.gameSession.getRuntimeState() as GameRuntimeState;
  Object.assign(state.battle, battle);
  (created.gameSession as typeof created.gameSession & { version: number }).version = version;
  return { session: created.gameSession, state };
};

const createSteppingBattleSession = (battle: BattleState, version = 1): { readonly session: GameSession; readonly state: GameRuntimeState } => {
  const { state } = createRuntimeWithBattle(battle, version);
  const encounter = createBattleEncounterState(0x1234);
  return {
    state,
    session: {
      version,
      step: (input: InputSnapshot) => stepBattle(state.battle, input, encounter, state.scriptRuntime.bag),
      stepFrames: () => undefined,
      getRuntimeState: () => state,
      getRenderableState: () => { throw new Error('not needed'); },
      exportSaveBlob: () => { throw new Error('not needed'); },
      importSaveBlob: () => undefined,
      cleanup: () => undefined
    } as unknown as GameSession
  };
};

const activeBattle = (mode: 'wild' | 'trainer' | 'safari' = 'wild'): BattleState => {
  const battle = createBattleState({
    mode,
    battleTypeFlags: mode === 'trainer' ? ['trainer'] : mode === 'safari' ? ['safari'] : [],
    safariBalls: 3
  });
  battle.active = true;
  battle.phase = 'command';
  battle.playerMon.speed = 200;
  battle.wildMon.speed = 10;
  return battle;
};

const clonePartyMember = (battle: BattleState, species: string, hp: number): BattleState['party'][number] => ({
  ...structuredClone(battle.party[0]!),
  species,
  hp,
  maxHp: Math.max(hp, 20)
});

describe('Text API battle semantics', () => {
  test('enumerates and executes battle command selection', () => {
    const battle = activeBattle('wild');
    const { session, state } = createSteppingBattleSession(battle, 4);
    const options = new ActionEnumerator().enumerate(session);

    expect(options.map((option) => option.label)).toEqual(['Fight', 'Open Bag', 'Open Pokémon party', 'Try to flee']);
    const fight = options.find((option) => option.action.type === 'fight')!;
    const result = new ActionExecutor().execute(session, fight.id, 4);

    expect(result.status).toBe(200);
    expect(state.battle.phase).toBe('moveSelect');
  });

  test('lists moves with PP, types, and disabled states', () => {
    const battle = activeBattle('wild');
    battle.phase = 'moveSelect';
    battle.moves[0]!.ppRemaining = 0;
    battle.playerMon.volatile.disabledMoveId = battle.moves[1]!.id;
    battle.playerMon.volatile.disableTurns = 2;
    const { session } = createRuntimeWithBattle(battle);

    const options = new ActionEnumerator().enumerate(session);

    expect(options[0]).toEqual(expect.objectContaining({
      category: 'battleMove',
      enabled: false,
      disabledReason: 'No PP remaining.'
    }));
    expect(options[0]!.description).toMatch(/Type: .+\. PP: 0\//u);
    expect(options[1]).toEqual(expect.objectContaining({
      enabled: false,
      disabledReason: expect.stringContaining('disabled')
    }));
  });

  test('executes move selection through the battle stepper', () => {
    const battle = activeBattle('wild');
    battle.phase = 'moveSelect';
    const { session, state } = createSteppingBattleSession(battle, 2);
    const move = new ActionEnumerator().enumerate(session).find((option) => option.action.type === 'battleMove' && option.enabled)!;

    const result = new ActionExecutor().execute(session, move.id, 2);

    expect(result.status).toBe(200);
    expect(state.battle.phase === 'script' || state.battle.phase === 'resolved' || state.battle.phase === 'command').toBe(true);
  });

  test('filters the battle Bag to battle-legal items only', () => {
    const wild = activeBattle('wild');
    wild.phase = 'bagSelect';
    const wildRuntime = createRuntimeWithBattle(wild).state;
    wildRuntime.scriptRuntime.bag.pockets.pokeBalls = [];
    addBagItem(wildRuntime.scriptRuntime.bag, 'ITEM_POKE_BALL', 2);
    addBagItem(wildRuntime.scriptRuntime.bag, 'ITEM_POTION', 1);
    addBagItem(wildRuntime.scriptRuntime.bag, 'ITEM_BICYCLE', 1);
    const wildOptions = new ActionEnumerator().enumerate({
      version: 1,
      getRuntimeState: () => wildRuntime
    } as unknown as GameSession);

    expect(wildOptions.map((option) => option.label)).toContain('Use POKé BALL');
    expect(wildOptions.map((option) => option.label)).toContain('Use POTION');
    expect(wildOptions.map((option) => option.label)).not.toContain('Use BICYCLE');

    const trainer = activeBattle('trainer');
    trainer.phase = 'bagSelect';
    const trainerRuntime = createRuntimeWithBattle(trainer).state;
    trainerRuntime.scriptRuntime.bag.pockets.pokeBalls = [];
    addBagItem(trainerRuntime.scriptRuntime.bag, 'ITEM_POKE_BALL', 2);
    addBagItem(trainerRuntime.scriptRuntime.bag, 'ITEM_POTION', 1);
    const trainerOptions = new ActionEnumerator().enumerate({
      version: 1,
      getRuntimeState: () => trainerRuntime
    } as unknown as GameSession);

    expect(trainerOptions.map((option) => option.label)).not.toContain('Use POKé BALL');
    expect(trainerOptions.map((option) => option.label)).toContain('Use POTION');
  });

  test('executes battle Bag item usage with battle restrictions', () => {
    const battle = activeBattle('wild');
    battle.phase = 'bagSelect';
    const { session, state } = createSteppingBattleSession(battle, 3);
    state.scriptRuntime.bag.pockets.pokeBalls = [];
    addBagItem(state.scriptRuntime.bag, 'ITEM_POTION', 1);
    const potion = new ActionEnumerator().enumerate(session).find((option) => option.label === 'Use POTION')!;

    const result = new ActionExecutor().execute(session, potion.id, 3);

    expect(result.status).toBe(200);
    expect(state.battle.currentScriptLabel).toBe('BattleScript_ItemUseHandoff');
    expect(state.battle.lastBattleItemId).toBe('ITEM_POTION');
  });

  test('shows and executes valid party switching choices', () => {
    const battle = activeBattle('wild');
    const second = clonePartyMember(battle, 'PIDGEY', 18);
    const fainted = clonePartyMember(battle, 'RATTATA', 0);
    battle.party.push(second, fainted);
    battle.playerSide.party = battle.party;
    battle.phase = 'partySelect';
    const { session, state } = createSteppingBattleSession(battle, 5);
    const options = new ActionEnumerator().enumerate(session);

    expect(options.find((option) => option.label.includes('Review active'))).toEqual(expect.objectContaining({ enabled: true }));
    expect(options.find((option) => option.label === 'Switch to PIDGEY')).toEqual(expect.objectContaining({ enabled: true }));
    expect(options.find((option) => option.label === 'Switch to RATTATA')).toEqual(expect.objectContaining({
      enabled: false,
      disabledReason: 'Fainted Pokémon cannot switch in.'
    }));

    const switchOption = options.find((option) => option.label === 'Switch to PIDGEY')!;
    const result = new ActionExecutor().execute(session, switchOption.id, 5);

    expect(result.status).toBe(200);
    expect(state.battle.playerMon.species).toBe('PIDGEY');
  });

  test('blocks running from trainer battles with a disabled reason', () => {
    const battle = activeBattle('trainer');
    const { session } = createRuntimeWithBattle(battle, 6);
    const run = new ActionEnumerator().enumerate(session).find((option) => option.action.type === 'flee')!;

    expect(run).toEqual(expect.objectContaining({
      enabled: false,
      disabledReason: 'Cannot run from trainer battles.'
    }));
    const result = new ActionExecutor().execute(session, run.id, 6);

    expect(result.status).toBe(400);
    expect(result.body.error).toEqual(expect.objectContaining({ code: 'disabled_action' }));
  });

  test('allows wild battle run attempts through battle execution', () => {
    const battle = activeBattle('wild');
    const { session, state } = createSteppingBattleSession(battle, 7);
    const run = new ActionEnumerator().enumerate(session).find((option) => option.action.type === 'flee')!;

    const result = new ActionExecutor().execute(session, run.id, 7);

    expect(result.status).toBe(200);
    expect(state.battle.postResult.outcome).toBe('escaped');
    expect(state.battle.phase).toBe('script');
  });

  test('exposes and executes Safari actions', () => {
    const battle = activeBattle('safari');
    const { session, state } = createSteppingBattleSession(battle, 8);
    const options = new ActionEnumerator().enumerate(session);

    expect(options.map((option) => option.label)).toEqual([
      'Throw Safari Ball',
      'Throw bait',
      'Throw rock',
      'Try to flee'
    ]);
    const bait = options.find((option) => option.action.type === 'safariBait')!;
    const result = new ActionExecutor().execute(session, bait.id, 8);

    expect(result.status).toBe(200);
    expect(state.battle.safariBaitThrowCounter).toBeGreaterThan(0);
    expect(['BattleScript_WatchesCarefully', 'BattleScript_PrintMonFledFromBattle']).toContain(state.battle.currentScriptLabel);
  });
});
