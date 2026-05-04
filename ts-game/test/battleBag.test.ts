import { describe, expect, test } from 'vitest';
import { createBattleState, getBattleBagChoices, stepBattle } from '../src/game/battle';
import { addBagItem, createBagState } from '../src/game/bag';

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

describe('battle bag parity handoff', () => {
  test('lists battle-usable items and filters field-only key items', () => {
    const battle = createBattleState();
    const bag = createBagState();
    addBagItem(bag, 'ITEM_POTION', 1);
    addBagItem(bag, 'ITEM_BICYCLE', 1);

    expect(getBattleBagChoices(battle, bag).map((choice) => choice.itemId)).toContain('ITEM_POTION');
    expect(getBattleBagChoices(battle, bag).map((choice) => choice.itemId)).not.toContain('ITEM_BICYCLE');
  });

  test('hands non-ball battle items to battle runtime instead of attempting capture', () => {
    const battle = createBattleState();
    battle.active = true;
    battle.phase = 'command';
    battle.selectedCommandIndex = battle.commands.indexOf('bag');
    const bag = createBagState();
    bag.pockets.pokeBalls = [];
    addBagItem(bag, 'ITEM_POTION', 1);

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, undefined, bag);
    expect(battle.phase).toBe('bagSelect');

    stepBattle(battle, { ...neutralInput, interact: true, interactPressed: true }, undefined, bag);
    expect(battle.currentScriptLabel).toBe('BattleScript_ItemUseHandoff');
    expect(battle.lastBattleItemId).toBe('ITEM_POTION');
  });
});
