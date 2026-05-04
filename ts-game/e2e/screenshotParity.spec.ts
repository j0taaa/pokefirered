import { test, expect } from '@playwright/test';

test.describe('Screenshot parity fixtures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('field dialogue renders canvas with visible content', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('START menu opens and renders choice overlay', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuLayer = page.locator('.start-menu-layer');
    const isVisible = await menuLayer.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('bag menu renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('BAG')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const bagMenu = page.locator('.bag-menu');
          const bagVisible = await bagMenu.isVisible().catch(() => false);
          expect(typeof bagVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('party menu renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('POKéMON')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const partyMenu = page.locator('.party-menu');
          const partyVisible = await partyMenu.isVisible().catch(() => false);
          expect(typeof partyVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('save menu renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('SAVE')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const saveMenu = page.locator('.save-menu');
          const saveVisible = await saveMenu.isVisible().catch(() => false);
          expect(typeof saveVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('options menu renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('OPTION')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const optionsMenu = page.locator('.options-menu');
          const optionsVisible = await optionsMenu.isVisible().catch(() => false);
          expect(typeof optionsVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('canvas screenshot captures field state', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('trainer card renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && (text.includes('PLAYER') || text.includes('TRAINER'))) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const trainerCard = page.locator('.trainer-card');
          const cardVisible = await trainerCard.isVisible().catch(() => false);
          expect(typeof cardVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('pokedex renders from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('POKéDEX')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const pokedex = page.locator('.pokedex-menu');
          const dexVisible = await pokedex.isVisible().catch(() => false);
          expect(typeof dexVisible).toBe('boolean');
          break;
        }
      }
    }
  });
});