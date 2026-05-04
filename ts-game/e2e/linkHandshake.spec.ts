import { expect, test } from '@playwright/test';

test.describe('Task 17 browser link handshake debug hook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForFunction(() => Boolean(window.__pokemonFireRedLinkDebug));
  });

  test('two local wireless clients reach ready-to-confirm and established states', async ({ page }) => {
    const result = await page.evaluate(() => window.__pokemonFireRedLinkDebug!.runTwoClientUnionRoomReadyFlow());

    expect(result.redReadyToConfirm.status).toBe('readyToConfirm');
    expect(result.leafReadyToConfirm.status).toBe('readyToConfirm');
    expect(result.redReadyToConfirm.playerCount).toBe(2);
    expect(result.leafReadyToConfirm.remoteTrainerNames).toEqual(['RED']);
    expect(result.redEstablished.status).toBe('established');
    expect(result.leafEstablished.status).toBe('established');
    expect(result.redEstablished.readyCount).toBe(2);
    expect(result.redEstablished.message).toBe(result.expectedEstablishedMessage);
  });

  test('two local wireless clients expose decomp-correct cancel message', async ({ page }) => {
    const result = await page.evaluate(() => window.__pokemonFireRedLinkDebug!.runTwoClientUnionRoomCancelFlow());

    expect(result.leafCanceled.status).toBe('canceled');
    expect(result.redCanceled.status).toBe('canceled');
    expect(result.leafCanceled.message).toBe(result.expectedCancelMessage);
    expect(result.redCanceled.message).toBe(result.expectedCancelMessage);
    expect(result.expectedCancelMessage).toBe('The WIRELESS COMMUNICATION\nSYSTEM search has been canceled.');
  });
});
