import { describe, expect, test } from 'vitest';
import {
  addBagItem,
  buyShopItem,
  createBagState,
  getBagQuantity,
  sellShopItem
} from '../src/game/bag';

describe('bag shop parity helpers', () => {
  test('buys items, subtracts money, and records decomp-shaped thank-you flow', () => {
    const bag = createBagState();
    const result = buyShopItem({ bag, money: 900 }, 'ITEM_POTION', 3);

    expect(result.ok).toBe(true);
    expect(result.money).toBe(0);
    expect(result.message).toBe('Here you go! Thank you!');
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(3);
  });

  test('rejects buy attempts without enough money or pocket space', () => {
    const poorBag = createBagState();
    expect(buyShopItem({ bag: poorBag, money: 299 }, 'ITEM_POTION', 1)).toMatchObject({
      ok: false,
      money: 299,
      message: "You don't have enough money."
    });

    const fullBag = createBagState();
    for (let i = 0; i < 42; i += 1) {
      fullBag.pockets.items.push({ itemId: `ITEM_TEST_FULL_${i}`, quantity: 1 });
    }

    expect(buyShopItem({ bag: fullBag, money: 999_999 }, 'ITEM_POTION', 1)).toMatchObject({
      ok: false,
      message: 'No more room for this item.'
    });
  });

  test('sells normal items for half price and refuses key items', () => {
    const bag = createBagState();
    addBagItem(bag, 'ITEM_POTION', 2);
    addBagItem(bag, 'ITEM_BICYCLE', 1);

    const sold = sellShopItem({ bag, money: 100 }, 'ITEM_POTION', 2);
    expect(sold.ok).toBe(true);
    expect(sold.money).toBe(400);
    expect(sold.message).toBe('Turned over the POTION\nworth ¥300.');
    expect(getBagQuantity(bag, 'ITEM_POTION')).toBe(0);

    expect(sellShopItem({ bag, money: sold.money }, 'ITEM_BICYCLE', 1)).toMatchObject({
      ok: false,
      message: "BICYCLE? Oh, no.\nI can't buy that."
    });
  });
});
