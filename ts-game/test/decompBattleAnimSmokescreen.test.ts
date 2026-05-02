import { describe, expect, test } from 'vitest';
import {
  TAG_SMOKESCREEN,
  SmokescreenImpact,
  SpriteCB_SmokescreenImpact,
  SpriteCB_SmokescreenImpactMain,
  createSmokescreenRuntimeState,
  smokescreenImpact,
  spriteCbSmokescreenImpact,
  spriteCbSmokescreenImpactMain
} from '../src/game/decompBattleAnimSmokescreen';

describe('decompBattleAnimSmokescreen', () => {
  test('SmokescreenImpact loads assets once and creates the four quadrant sprites in C order', () => {
    const runtime = createSmokescreenRuntimeState();
    const mainSpriteId = smokescreenImpact(runtime, 40, 64, false);

    expect(mainSpriteId).toBe(0);
    expect(runtime.loadedTileTags.has(TAG_SMOKESCREEN)).toBe(true);
    expect(runtime.loadedPaletteTags.has(TAG_SMOKESCREEN)).toBe(true);
    expect(runtime.sprites[mainSpriteId]).toMatchObject({
      invisible: true,
      persist: false,
      activeSprites: 4
    });
    expect(runtime.sprites.slice(1).map((sprite) => ({
      x: sprite.x,
      y: sprite.y,
      priority: sprite.priority,
      animIndex: sprite.animIndex,
      mainSpriteId: sprite.mainSpriteId,
      animated: sprite.animated
    }))).toEqual([
      { x: 24, y: 48, priority: 2, animIndex: 0, mainSpriteId: 0, animated: true },
      { x: 40, y: 48, priority: 2, animIndex: 1, mainSpriteId: 0, animated: true },
      { x: 24, y: 64, priority: 2, animIndex: 2, mainSpriteId: 0, animated: true },
      { x: 40, y: 64, priority: 2, animIndex: 3, mainSpriteId: 0, animated: true }
    ]);

    smokescreenImpact(runtime, 0, 0, false);
    expect([...runtime.loadedTileTags]).toEqual([TAG_SMOKESCREEN]);

    const aliasRuntime = createSmokescreenRuntimeState();
    expect(SmokescreenImpact(aliasRuntime, 8, 12, true)).toBe(0);
    expect(aliasRuntime.sprites[0].persist).toBe(true);
  });

  test('impact sprite callback decrements main active count and destroys only after animEnded', () => {
    const runtime = createSmokescreenRuntimeState();
    smokescreenImpact(runtime, 16, 16, false);

    spriteCbSmokescreenImpact(runtime, 1);
    expect(runtime.sprites[0].activeSprites).toBe(4);
    expect(runtime.sprites[1].destroyed).toBe(false);

    runtime.sprites[1].animEnded = true;
    SpriteCB_SmokescreenImpact(runtime, 1);
    expect(runtime.sprites[0].activeSprites).toBe(3);
    expect(runtime.sprites[1].destroyed).toBe(true);
  });

  test('main callback frees assets and either destroys or becomes dummy based on persist', () => {
    const runtime = createSmokescreenRuntimeState();
    const mainSpriteId = smokescreenImpact(runtime, 16, 16, false);
    runtime.sprites[mainSpriteId].activeSprites = 0;

    SpriteCB_SmokescreenImpactMain(runtime, mainSpriteId);
    expect(runtime.freedTileTags).toEqual([TAG_SMOKESCREEN]);
    expect(runtime.freedPaletteTags).toEqual([TAG_SMOKESCREEN]);
    expect(runtime.sprites[mainSpriteId].destroyed).toBe(true);

    const persistentRuntime = createSmokescreenRuntimeState();
    const persistentMain = smokescreenImpact(persistentRuntime, 16, 16, true);
    persistentRuntime.sprites[persistentMain].activeSprites = 0;
    spriteCbSmokescreenImpactMain(persistentRuntime, persistentMain);
    expect(persistentRuntime.sprites[persistentMain]).toMatchObject({
      destroyed: false,
      callback: 'SpriteCallbackDummy'
    });
  });
});
