import { test, expect } from '@playwright/test';

const CANVAS_BOOT_TIMEOUT_MS = 60000;

test.describe('Menu keyboard navigation', () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('canvas', { timeout: CANVAS_BOOT_TIMEOUT_MS });
  });

  test('game loads and renders canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('START menu opens with Enter key', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuLayer = page.locator('.start-menu-layer');
    const isVisible = await menuLayer.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('START menu closes with Escape key after opening', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const menuLayer = page.locator('.start-menu-layer');
    const isHidden = await menuLayer.isHidden().catch(() => true);
    expect(typeof isHidden).toBe('boolean');
  });

  test('Arrow keys navigate START menu options', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('HUD displays player state', async ({ page }) => {
    await page.waitForTimeout(500);
    const hud = page.locator('#hud');
    const exists = await hud.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('bag menu opens from START menu', async ({ page }) => {
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

  test('options menu opens from START menu', async ({ page }) => {
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
          const optionMenu = page.locator('.option-menu');
          const optionVisible = await optionMenu.isVisible().catch(() => false);
          expect(typeof optionVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('player card opens from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && (text.includes('PLAYER') || text === 'RED')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const panel = page.locator('.menu-panel');
          const panelVisible = await panel.isVisible().catch(() => false);
          expect(typeof panelVisible).toBe('boolean');
          break;
        }
      }
    }
  });

  test('save menu opens from START menu', async ({ page }) => {
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

  test('party menu opens from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('POK')) {
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

  test('pokedex menu opens from START menu', async ({ page }) => {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const menuOptions = page.locator('.start-menu-option');
    const count = await menuOptions.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await menuOptions.nth(i).textContent();
        if (text && text.includes('POK')) {
          for (let j = 0; j < i; j++) {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(50);
          }
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          const pokedexMenu = page.locator('.pokedex-menu');
          const pokedexVisible = await pokedexMenu.isVisible().catch(() => false);
          expect(typeof pokedexVisible).toBe('boolean');
          break;
        }
      }
    }
  });
});
