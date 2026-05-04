import { describe, expect, test } from 'vitest';
import type { FieldPokemon } from '../src/game/pokemonStorage';
import {
  addBagItem,
  checkBagHasSpace,
  createBagPanelState,
  createBagState,
  getBagAddFailureMessage,
  getBagQuantity,
  giveBagItemToPokemon,
  removeBagItem,
  stepBagPanel,
  useBagItemWithContext,
  useRegisteredBagItem
} from '../src/game/bag';

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

describe('bag state', () => {
  test('adds to existing stacks and removes cleanly', () => {
    const bag = createBagState();

    expect(addBagItem(bag, 'ITEM_POTION', 2)).toBe(true);
    expect(addBagItem(bag, 'ITEM_POTION', 3)).toBe(true);
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(5);

    expect(removeBagItem(bag, 'ITEM_POTION', 4)).toBe(true);
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(1);
    expect(removeBagItem(bag, 'ITEM_POTION', 1)).toBe(true);
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(0);
  });

  test('opens context actions from the field bag and supports tossing', () => {
    const bag = createBagState();
    const panel = createBagPanelState();
    addBagItem(bag, 'ITEM_POTION', 2);

    const rowResult = stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(rowResult.scriptId).toBe('menu.bag.context.open');
    expect(panel.contextMenu?.actions).toEqual(['USE', 'GIVE', 'TOSS', 'CANCEL']);

    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(panel.quantityPrompt?.itemId).toBe('ITEM_POTION');

    stepBagPanel(panel, bag, { ...neutralInput, up: true, upPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(panel.confirmationPrompt?.quantity).toBe(2);

    stepBagPanel(panel, bag, { ...neutralInput, up: true, upPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(0);
    expect(panel.message?.text).toContain('tossed away');
  });

  test('toss quantity prompt follows the decomp helper with right +10 and up/down wrap', () => {
    const bag = createBagState();
    const panel = createBagPanelState();
    addBagItem(bag, 'ITEM_POTION', 25);

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(panel.quantityPrompt?.quantity).toBe(1);

    stepBagPanel(panel, bag, { ...neutralInput, right: true, rightPressed: true });
    expect(panel.quantityPrompt?.quantity).toBe(11);

    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    expect(panel.quantityPrompt?.quantity).toBe(10);

    for (let i = 0; i < 10; i += 1) {
      stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    }
    expect(panel.quantityPrompt?.quantity).toBe(25);

    stepBagPanel(panel, bag, { ...neutralInput, up: true, upPressed: true });
    expect(panel.quantityPrompt?.quantity).toBe(1);
  });

  test('open action enters TM Case and Berry Pouch pockets instead of unsupported messages', () => {
    const bag = createBagState();
    const panel = createBagPanelState();

    expect(addBagItem(bag, 'ITEM_TM01', 1)).toBe(true);
    bag.selectedPocket = 'keyItems';
    bag.selectedIndexByPocket.keyItems = 0;

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(panel.contextMenu?.actions).toEqual(['OPEN', 'REGISTER', 'CANCEL']);
    const tmOpen = stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(tmOpen.scriptId).toBe('menu.bag.open.tmCase');
    expect(bag.selectedPocket).toBe('tmCase');
    expect(panel.message).toBeNull();

    expect(addBagItem(bag, 'ITEM_CHERI_BERRY', 1)).toBe(true);
    bag.selectedPocket = 'keyItems';
    bag.selectedIndexByPocket.keyItems = 1;
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    const berryOpen = stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(berryOpen.scriptId).toBe('menu.bag.open.berryPouch');
    expect(bag.selectedPocket).toBe('berryPouch');
  });

  test('registered Bicycle uses SELECT and toggles the field bike state', () => {
    const bag = createBagState();
    const panel = createBagPanelState();

    expect(addBagItem(bag, 'ITEM_BICYCLE', 1)).toBe(true);
    bag.selectedPocket = 'keyItems';

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, down: true, downPressed: true });
    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(bag.registeredItemId).toBe('ITEM_BICYCLE');

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    const result = stepBagPanel(panel, bag, { ...neutralInput, select: true, selectPressed: true });
    expect(result.scriptId).toBe('menu.bag.registered.bicycle');
    expect(bag.bicycleActive).toBe(true);
    expect(panel.message?.text).toContain('got on the BICYCLE');

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    useRegisteredBagItem(panel, bag);
    expect(bag.bicycleActive).toBe(false);
  });

  test('TM and Berry pouch acquisition fails when the key item pocket is full', () => {
    const bag = createBagState();
    for (let i = 0; i < 30; i += 1) {
      bag.pockets.keyItems.push({ itemId: `ITEM_TEST_KEY_${i}`, quantity: 1 });
    }

    expect(checkBagHasSpace(bag, 'ITEM_TM01', 1)).toBe(false);
    expect(addBagItem(bag, 'ITEM_TM01', 1)).toBe(false);
    expect(getBagQuantity(bag, 'ITEM_TM_CASE')).toBe(0);

    expect(checkBagHasSpace(bag, 'ITEM_CHERI_BERRY', 1)).toBe(false);
    expect(addBagItem(bag, 'ITEM_CHERI_BERRY', 1)).toBe(false);
    expect(getBagQuantity(bag, 'ITEM_BERRY_POUCH')).toBe(0);
  });

  test('full-pocket rejection messages identify every decomp pocket', () => {
    const bag = createBagState();
    bag.pockets.items = Array.from({ length: 42 }, (_, i) => ({ itemId: `ITEM_TEST_ITEM_${i}`, quantity: 1 }));
    bag.pockets.pokeBalls = Array.from({ length: 13 }, (_, i) => ({ itemId: `ITEM_TEST_BALL_${i}`, quantity: 1 }));
    bag.pockets.keyItems = [
      { itemId: 'ITEM_TM_CASE', quantity: 1 },
      { itemId: 'ITEM_BERRY_POUCH', quantity: 1 },
      ...Array.from({ length: 28 }, (_, i) => ({ itemId: `ITEM_TEST_KEY_${i}`, quantity: 1 }))
    ];
    bag.pockets.tmCase = Array.from({ length: 58 }, (_, i) => ({ itemId: `ITEM_TEST_TM_${i}`, quantity: 1 }));
    bag.pockets.berryPouch = Array.from({ length: 43 }, (_, i) => ({ itemId: `ITEM_TEST_BERRY_${i}`, quantity: 1 }));

    expect(getBagAddFailureMessage(bag, 'ITEM_POTION', 1)).toBe('The BAG is full...');
    expect(getBagAddFailureMessage(bag, 'ITEM_BICYCLE', 1)).toBe('The KEY ITEMS pocket is full...');
    expect(getBagAddFailureMessage(bag, 'ITEM_POKE_BALL', 1)).toBe('The POKé BALLS pocket is full...');
    expect(getBagAddFailureMessage(bag, 'ITEM_TM01', 1)).toBe('The TM CASE is full...');
    expect(getBagAddFailureMessage(bag, 'ITEM_CHERI_BERRY', 1)).toBe('The BERRY POUCH is full...');
  });

  test('registerable key items and field context restrictions follow decomp blocks', () => {
    const bag = createBagState();
    const panel = createBagPanelState();
    addBagItem(bag, 'ITEM_VS_SEEKER', 1);
    bag.selectedPocket = 'keyItems';

    stepBagPanel(panel, bag, { ...neutralInput, interact: true, interactPressed: true });
    expect(panel.contextMenu?.actions).toEqual(['USE', 'REGISTER', 'CANCEL']);

    expect(useBagItemWithContext(bag, 'ITEM_VS_SEEKER', { location: 'field', mapType: 'indoor' })).toMatchObject({
      ok: false,
      message: "OAK: There's a time and place for everything! But not now."
    });
    expect(useBagItemWithContext(bag, 'ITEM_VS_SEEKER', { location: 'field', mapType: 'route' })).toMatchObject({
      ok: true,
      scriptId: 'menu.bag.use.vsSeeker'
    });
  });

  test('gives holdable items to party Pokemon and rejects key items', () => {
    const bag = createBagState();
    addBagItem(bag, 'ITEM_POTION', 1);
    addBagItem(bag, 'ITEM_BICYCLE', 1);
    const party: FieldPokemon[] = [{ species: 'PIDGEY', level: 5, maxHp: 10, hp: 10, attack: 8, defense: 8, speed: 9, spAttack: 7, spDefense: 7, catchRate: 255, types: ['normal'], status: 'none' }];

    expect(giveBagItemToPokemon(bag, party, 0, 'ITEM_POTION')).toMatchObject({ ok: true });
    expect(party[0].heldItemId).toBe('ITEM_POTION');
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(0);

    expect(giveBagItemToPokemon(bag, party, 0, 'ITEM_BICYCLE')).toMatchObject({
      ok: false,
      message: "BICYCLE can't be held."
    });
  });
});
