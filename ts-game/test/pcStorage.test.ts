import { describe, expect, test } from 'vitest';
import {
  addBagItem,
  createBagState,
  createPcItemStorage,
  depositPcItem,
  getBagQuantity,
  getPcItemQuantity,
  movePcItemSlot,
  tossPcItem,
  withdrawPcItem
} from '../src/game/bag';

describe('PC item storage parity helpers', () => {
  test('deposits, withdraws, tosses, and compacts PC item slots', () => {
    const bag = createBagState();
    const pc = createPcItemStorage();
    addBagItem(bag, 'ITEM_POTION', 5);

    expect(depositPcItem(pc, bag, 'ITEM_POTION', 3)).toMatchObject({ ok: true });
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(2);
    expect(getPcItemQuantity(pc, 'ITEM_POTION')).toBe(3);

    expect(withdrawPcItem(pc, bag, 'ITEM_POTION', 2)).toMatchObject({ ok: true });
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(4);
    expect(getPcItemQuantity(pc, 'ITEM_POTION')).toBe(1);

    expect(tossPcItem(pc, 'ITEM_POTION', 1)).toMatchObject({ ok: true });
    expect(pc.slots).toEqual([]);
  });

  test('rejects full PC deposits and full bag withdrawals with decomp messages', () => {
    const bag = createBagState();
    const pc = createPcItemStorage();
    addBagItem(bag, 'ITEM_POTION', 1);
    for (let i = 0; i < 30; i += 1) {
      pc.slots.push({ itemId: `ITEM_PC_FULL_${i}`, quantity: 1 });
    }

    expect(depositPcItem(pc, bag, 'ITEM_POTION', 1)).toMatchObject({
      ok: false,
      message: "The PC's item storage is full."
    });

    const fullBag = createBagState();
    const withdrawPc = createPcItemStorage([{ itemId: 'ITEM_POTION', quantity: 1 }]);
    for (let i = 0; i < 42; i += 1) {
      fullBag.pockets.items.push({ itemId: `ITEM_TEST_FULL_${i}`, quantity: 1 });
    }

    expect(withdrawPcItem(withdrawPc, fullBag, 'ITEM_POTION', 1)).toMatchObject({
      ok: false,
      message: 'The BAG is full...'
    });
  });

  test('changes item order using decomp move-slot semantics', () => {
    const pc = createPcItemStorage([
      { itemId: 'ITEM_POTION', quantity: 1 },
      { itemId: 'ITEM_ANTIDOTE', quantity: 1 },
      { itemId: 'ITEM_ESCAPE_ROPE', quantity: 1 }
    ]);

    expect(movePcItemSlot(pc, 0, 2)).toBe(true);
    expect(pc.slots.map((slot) => slot.itemId)).toEqual(['ITEM_ANTIDOTE', 'ITEM_ESCAPE_ROPE', 'ITEM_POTION']);
  });
});
