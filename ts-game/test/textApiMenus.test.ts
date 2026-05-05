import { describe, expect, it } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager } from '../src/api/sessionManager';
import type { TextApiOption } from '../src/api/textApiTypes';
import { addBagItem } from '../src/game/bag';
import { setMoney } from '../src/game/decompMoney';

const createSession = () => {
  const manager = new SessionManager({ createId: () => `menu-api-${Math.random().toString(16).slice(2)}` });
  const session = manager.createSession();
  (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
  return { manager, gameSession: session.gameSession, version: session.version };
};

const enumerator = new ActionEnumerator();
const executor = new ActionExecutor();

const findOption = (options: readonly TextApiOption[], predicate: (option: TextApiOption) => boolean): TextApiOption => {
  const option = options.find(predicate);
  if (!option) {
    throw new Error(`missing option in ${options.map((entry) => entry.label).join(', ')}`);
  }
  return option;
};

const execute = (gameSession: ReturnType<typeof createSession>['gameSession'], version: number, option: TextApiOption): number => {
  const result = executor.execute(gameSession, option.id, version);
  expect(result.status).toBe(200);
  expect(result.body.success).toBe(true);
  return result.body.newVersion;
};

const openStartMenu = (gameSession: ReturnType<typeof createSession>['gameSession'], version: number): number => {
  gameSession.getRuntimeState().scriptRuntime.startMenu.hasPokedex = true;
  gameSession.getRuntimeState().scriptRuntime.startMenu.hasPokemon = true;
  const open = findOption(enumerator.enumerate(gameSession), (option) => option.action.type === 'openMenu');
  return execute(gameSession, version, open);
};

describe('Text API menu semantics and execution', () => {
  it('exposes START menu entries and executes the save confirmation flow', () => {
    const { manager, gameSession, version } = createSession();
    let currentVersion = openStartMenu(gameSession, version);

    const startEntries = enumerator.enumerate(gameSession)
      .filter((option) => option.action.target === 'menu' && option.action.type !== 'back')
      .map((option) => option.label);
    expect(startEntries).toEqual(['POKéDEX', 'POKéMON', 'BAG', 'PLAYER', 'SAVE', 'OPTION', 'EXIT']);

    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'SAVE'));
    expect(gameSession.getRuntimeState().startMenu.panel?.kind).toBe('save');
    expect(enumerator.enumerate(gameSession).map((option) => option.label)).toContain('Confirm save');

    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'Confirm save'));
    expect(gameSession.getRuntimeState().startMenu.panel?.kind).toBe('save');
    expect(gameSession.getRuntimeState().startMenu.panel?.description).toContain('Saved');

    execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'Continue'));
    expect(gameSession.getRuntimeState().startMenu.panel).toBe(null);
    manager.deleteSession('menu-api');
  });

  it('exposes bag pockets, quantities, context actions, and disabled reasons', () => {
    const { gameSession, version } = createSession();
    const runtime = gameSession.getRuntimeState().scriptRuntime;
    addBagItem(runtime.bag, 'ITEM_BICYCLE', 1);
    addBagItem(runtime.bag, 'ITEM_NUGGET', 1);
    addBagItem(runtime.bag, 'ITEM_POTION', 2);
    let currentVersion = openStartMenu(gameSession, version);
    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'BAG'));

    const bagOptions = enumerator.enumerate(gameSession);
    expect(bagOptions.map((option) => option.label)).toContain('ITEMS pocket');
    expect(bagOptions.map((option) => option.label)).toContain('KEY ITEMS pocket');
    expect(bagOptions.some((option) => option.label.includes('POTION x2'))).toBe(true);

    currentVersion = execute(gameSession, currentVersion, findOption(bagOptions, (option) => option.label.includes('NUGGET')));
    const actionLabels = enumerator.enumerate(gameSession).map((option) => option.label);
    expect(actionLabels).toEqual(expect.arrayContaining(['Use NUGGET', 'Give NUGGET', 'Toss NUGGET']));
    expect(enumerator.enumerate(gameSession).find((option) => option.label === 'Use NUGGET')).toEqual(expect.objectContaining({ disabledReason: 'Cannot use here.' }));

    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'Toss NUGGET'));
    execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label.startsWith('Yes, toss')));
    expect(runtime.bag.pockets.items.some((slot) => slot.itemId === 'ITEM_NUGGET')).toBe(false);
  });

  it('exposes party Pokémon stats and executes switch actions', () => {
    const { gameSession, version } = createSession();
    let currentVersion = openStartMenu(gameSession, version);
    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'POKéMON'));

    const partyOptions = enumerator.enumerate(gameSession);
    expect(partyOptions.some((option) => option.label.includes('CHARMANDER Lv.8 HP 23/23'))).toBe(true);
    currentVersion = execute(gameSession, currentVersion, findOption(partyOptions, (option) => option.label.includes('PIDGEY')));
    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label.startsWith('SWITCH PIDGEY')));
    execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label.includes('CHARMANDER')));

    expect(gameSession.getRuntimeState().scriptRuntime.party[0].species).toBe('PIDGEY');
  });

  it('exposes shop stock with prices and executes a buy flow', () => {
    const { gameSession, version } = createSession();
    const state = gameSession.getRuntimeState();
    setMoney(state.scriptRuntime, 3000);
    state.dialogue.active = true;
    state.dialogue.shop = {
      kind: 'mart',
      mode: 'buyList',
      items: ['ITEM_POTION', 'ITEM_ANTIDOTE'],
      buyMenuWindows: {} as never,
      moneyBox: { windowId: 0, money: 3000 } as never,
      yesNoWindow: { windowId: 0 } as never,
      prompt: '',
      selectedIndex: 0,
      scrollOffset: 0,
      currentItemId: null,
      quantity: 1,
      maxQuantity: 1,
      pendingMode: null
    };
    state.dialogue.scriptSession = { specialState: { kind: 'mart' } } as never;

    let currentVersion = version;
    const shopOptions = enumerator.enumerate(gameSession);
    expect(shopOptions.map((option) => option.label)).toContain('Buy POTION - ¥300');
    currentVersion = execute(gameSession, currentVersion, findOption(shopOptions, (option) => option.label.startsWith('Buy POTION')));
    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label.startsWith('Buy 1 POTION')));
    execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label.startsWith('Yes, confirm')));

    expect(state.scriptRuntime.bag.pockets.items.some((slot) => slot.itemId === 'ITEM_POTION')).toBe(true);
  });

  it('exposes save cancel and result narration paths', () => {
    const { gameSession, version } = createSession();
    let currentVersion = openStartMenu(gameSession, version);
    currentVersion = execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'SAVE'));
    execute(gameSession, currentVersion, findOption(enumerator.enumerate(gameSession), (option) => option.label === 'Cancel save'));
    expect(gameSession.getRuntimeState().startMenu.active).toBe(true);
  });
});
