import { describe, expect, test } from 'vitest';
import {
  AnimDragonDanceOrb,
  AnimDragonDanceOrb_Step,
  AnimDragonFireToTarget,
  AnimDragonRageFirePlume,
  AnimOutrageFlame,
  AnimOverheatFlame,
  AnimOverheatFlame_Step,
  AnimTask_DragonDanceWaver,
  AnimTask_DragonDanceWaver_Step,
  B_SIDE_OPPONENT,
  UpdateDragonDanceScanlineEffect,
  animDragonDanceOrb,
  animDragonDanceOrbStep,
  animDragonFireToTarget,
  animDragonRageFirePlume,
  animOutrageFlame,
  animOverheatFlame,
  animOverheatFlameStep,
  animTaskDragonDanceWaver,
  animTaskDragonDanceWaverStep,
  createDragonDanceScanlineRuntime,
  createDragonRuntime,
  createDragonSprite,
  gDragonBreathFireSpriteTemplate,
  gDragonDanceOrbSpriteTemplate,
  gDragonRageFirePlumeSpriteTemplate,
  gDragonRageFireSpitSpriteTemplate,
  gOutrageFlameSpriteTemplate,
  gOverheatFlameSpriteTemplate,
  sUnusedOverheatData
} from '../src/game/decompBattleAnimDragon';

describe('decomp battle_anim_dragon', () => {
  test('ports dragon sprite templates with exact tags, OAM, and callbacks', () => {
    expect(gOutrageFlameSpriteTemplate).toMatchObject({
      tileTag: 'ANIM_TAG_SMALL_EMBER',
      paletteTag: 'ANIM_TAG_SMALL_EMBER',
      oam: 'gOamData_AffineOff_ObjNormal_32x32',
      callback: 'AnimOutrageFlame'
    });
    expect(gDragonBreathFireSpriteTemplate).toMatchObject({
      oam: 'gOamData_AffineDouble_ObjNormal_32x32',
      callback: 'AnimDragonFireToTarget'
    });
    expect(gDragonRageFirePlumeSpriteTemplate.callback).toBe('AnimDragonRageFirePlume');
    expect(gDragonRageFireSpitSpriteTemplate.affineAnims).toEqual(['sAffineAnim_DragonRageFire_0', 'sAffineAnim_DragonRageFire_1']);
    expect(gDragonDanceOrbSpriteTemplate.tileTag).toBe('ANIM_TAG_HOLLOW_ORB');
    expect(gOverheatFlameSpriteTemplate.callback).toBe('AnimOverheatFlame');
  });

  test('AnimOutrageFlame mirrors attacker side branch and flicker setup', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [8, -3, 12, 0x100, -0x80, 4, 0, 0];
    const sprite = createDragonSprite();

    animOutrageFlame(runtime, sprite);

    expect(sprite.x).toBe(152);
    expect(sprite.y).toBe(53);
    expect(runtime.battleAnimArgs.slice(3, 5)).toEqual([-0x100, 0x80]);
    expect(sprite.data.slice(0, 6)).toEqual([12, -0x100, 0, 0x80, 0, 4]);
    expect(sprite.invisible).toBe(true);
    expect(sprite.callback).toBe('TranslateSpriteLinearAndFlicker');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('AnimDragonFireToTarget starts affine anim for opponent attacker and sets linear translation fields', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battleAnimTarget = 0;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [7, 5, 11, -6, 18, 0, 0, 0];
    const sprite = createDragonSprite();

    animDragonFireToTarget(runtime, sprite);

    expect(sprite.affineAnimIndex).toBe(1);
    expect(sprite.animIndex).toBe(0);
    expect(sprite.x).toBe(155);
    expect(sprite.y).toBe(61);
    expect(sprite.data[0]).toBe(18);
    expect(sprite.data[2]).toBe(37);
    expect(sprite.data[4]).toBe(58);
    expect(sprite.callback).toBe('StartAnimLinearTranslation');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('AnimDragonRageFirePlume selects attacker or target and applies orientation-aware x offset', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimArgs = [1, 9, -4, 0, 0, 0, 0, 0];
    const sprite = createDragonSprite();

    animDragonRageFirePlume(runtime, sprite);

    expect(sprite.x).toBe(177);
    expect(sprite.y).toBe(68);
    expect(sprite.callback).toBe('RunStoredCallbackWhenAnimEnds');
    expect(sprite.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('Dragon Dance orb follows the two-phase radius/speed state machine and eventually destroys', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimArgs[0] = 64;
    const sprite = createDragonSprite();

    animDragonDanceOrb(runtime, sprite);

    expect(sprite).toMatchObject({ x: 48, y: 64, x2: 0, y2: 32, callback: 'AnimDragonDanceOrb_Step' });
    for (let i = 0; i < 61; i += 1) {
      animDragonDanceOrbStep(sprite);
    }
    expect(sprite.data[0]).toBe(1);

    for (let i = 0; i < 21; i += 1) {
      animDragonDanceOrbStep(sprite);
    }
    expect(sprite.destroyed).toBe(true);
  });

  test('Dragon Dance scanline task follows setup, wave, shutdown, and destroy phases', () => {
    const runtime = createDragonDanceScanlineRuntime();
    const task = runtime.tasks[0];

    animTaskDragonDanceWaver(runtime, 0);

    expect(runtime.scanlineEffect).toMatchObject({
      dmaDest: 'REG_BG1HOFS',
      dmaControl: 'SCANLINE_EFFECT_DMACNT_16BIT',
      initState: 1,
      state: 1
    });
    expect(task.data.slice(2, 5)).toEqual([12, 32, 96]);
    expect(runtime.scanlineBuffers[0][32]).toBe(12);

    animTaskDragonDanceWaverStep(runtime, 0);
    animTaskDragonDanceWaverStep(runtime, 0);
    expect(task.data[6]).toBe(1);
    task.data[0] = 3;
    animTaskDragonDanceWaverStep(runtime, 0);
    expect(runtime.scanlineEffect.state).toBe(3);
    animTaskDragonDanceWaverStep(runtime, 0);
    expect(task.destroyed).toBe(true);
  });

  test('Overheat flame stores velocity, mirrors unused EWRAM data, and destroys after duration', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimArgs = [2, 0, 10, 2, 3, 0, 0, 0];
    const sprite = createDragonSprite();

    animOverheatFlame(runtime, sprite);

    expect(sprite.x).toBe(68);
    expect(sprite.y).toBe(67);
    expect(sprite.data.slice(1, 4)).toEqual([10, 0, 2]);
    expect(sUnusedOverheatData.slice(0, 4)).toEqual(sprite.data.slice(0, 4));
    expect(sprite.callback).toBe('AnimOverheatFlame_Step');

    animOverheatFlameStep(sprite);
    expect(sprite.x2).toBe(1);
    expect(sprite.destroyed).toBe(false);
    animOverheatFlameStep(sprite);
    animOverheatFlameStep(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  test('exact C-name dragon animation exports preserve sprite callbacks, scanline wave, and overheat motion', () => {
    const runtime = createDragonRuntime();
    runtime.battleAnimAttacker = 1;
    runtime.battleAnimTarget = 0;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.battleAnimArgs = [8, -3, 12, 0x100, -0x80, 4, 0, 0];
    const outrage = createDragonSprite();

    AnimOutrageFlame(runtime, outrage);
    expect(outrage.callback).toBe('TranslateSpriteLinearAndFlicker');
    expect(outrage.storedCallback).toBe('DestroySpriteAndMatrix');
    expect(runtime.battleAnimArgs.slice(3, 5)).toEqual([-0x100, 0x80]);

    runtime.battleAnimArgs = [7, 5, 11, -6, 18, 0, 0, 0];
    const fire = createDragonSprite();
    AnimDragonFireToTarget(runtime, fire);
    expect(fire.affineAnimIndex).toBe(1);
    expect(fire.callback).toBe('StartAnimLinearTranslation');

    runtime.battleAnimAttacker = 0;
    runtime.battleAnimTarget = 1;
    runtime.battleAnimArgs = [1, 9, -4, 0, 0, 0, 0, 0];
    const plume = createDragonSprite();
    AnimDragonRageFirePlume(runtime, plume);
    expect(plume.callback).toBe('RunStoredCallbackWhenAnimEnds');

    runtime.battleAnimArgs[0] = 64;
    const orb = createDragonSprite();
    AnimDragonDanceOrb(runtime, orb);
    expect(orb.callback).toBe('AnimDragonDanceOrb_Step');
    for (let i = 0; i < 61; i += 1) {
      AnimDragonDanceOrb_Step(orb);
    }
    expect(orb.data[0]).toBe(1);

    const scanlineRuntime = createDragonDanceScanlineRuntime();
    const task = scanlineRuntime.tasks[0];
    AnimTask_DragonDanceWaver(scanlineRuntime, 0);
    expect(scanlineRuntime.scanlineEffect.state).toBe(1);
    UpdateDragonDanceScanlineEffect(scanlineRuntime, task);
    expect(task.data[5]).toBe(9);
    task.data[0] = 3;
    AnimTask_DragonDanceWaver_Step(scanlineRuntime, 0);
    expect(scanlineRuntime.scanlineEffect.state).toBe(3);

    runtime.battleAnimArgs = [2, 0, 10, 2, 3, 0, 0, 0];
    const overheat = createDragonSprite();
    AnimOverheatFlame(runtime, overheat);
    expect(overheat.callback).toBe('AnimOverheatFlame_Step');
    AnimOverheatFlame_Step(overheat);
    expect(overheat.x2).toBe(1);
  });
});
