import { describe, expect, test } from 'vitest';
import {
  addBagItem,
  createBagPanelState,
  createBagState,
  getBagQuantity,
  removeBagItem,
  stepBagPanel
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
});
