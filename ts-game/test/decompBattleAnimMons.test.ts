import { describe, expect, test } from 'vitest';
import {
  AnimThrowProjectile,
  AnimThrowProjectile_Step,
  AnimFastTranslateLinear,
  AnimFastTranslateLinearWaitEnd,
  AnimTranslateLinear,
  AnimWeatherBallDown,
  AnimWeatherBallUp,
  AnimWeatherBallUp_Step,
  BattleAnimHelper_RunSpriteSquash,
  BattleAnimHelper_SetSpriteSquashParams,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  BATTLER_COORD_X_2,
  BATTLER_COORD_Y_PIC_OFFSET,
  ConvertPosDataToTranslateLinearData,
  CreateInvisibleSpriteCopy,
  GetBattlerSpriteCoord,
  GetBattlerSpriteDefault_Y,
  GetBattlerYCoordWithElevation,
  InitSpritePosToAnimAttacker,
  InitSpritePosToAnimTarget,
  DestroyAnimSpriteAndDisableBlend,
  DestroyAnimVisualTaskAndDisableBlend,
  DestroySpriteAndMatrix,
  GetBattleBgPaletteNum,
  InitAndRunAnimFastLinearTranslation,
  InitAnimFastLinearTranslation,
  InitAnimFastLinearTranslationWithSpeed,
  InitAnimFastLinearTranslationWithSpeedAndPos,
  InitAnimArcTranslation,
  InitAnimLinearTranslation,
  LoadPointerFromVars,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  RunStoredCallbackWhenAffineAnimEnds,
  RunStoredCallbackWhenAnimEnds,
  SetAverageBattlerPositions,
  SetGreyscaleOrOriginalPalette,
  SetSpritePrimaryCoordsFromSecondaryCoords,
  SetSpriteRotScale,
  ShouldRotScaleSpeciesBeFlipped,
  StoreSpriteCallbackInData6,
  TranslateAnimHorizontalArc,
  TranslateAnimVerticalArc,
  TranslateSpriteInLissajousCurve,
  TranslateSpriteInCircle,
  TranslateSpriteInEllipse,
  TranslateSpriteInGrowingCircle,
  TranslateSpriteLinear,
  TranslateSpriteLinearAndFlicker,
  TranslateSpriteLinearById,
  TranslateSpriteLinearByIdFixedPoint,
  TranslateSpriteLinearFixedPoint,
  WaitAnimForDuration,
  createBattleAnimMonsRuntime,
  createBattleAnimMonsSprite
} from '../src/game/decompBattleAnimMons';

describe('decompBattleAnimMons', () => {
  test('LoadPointerFromVars rebuilds the pointer-sized value from C s16 halves', () => {
    expect(LoadPointerFromVars(0x5678, 0x1234)).toBe(0x12345678);
    expect(LoadPointerFromVars(-1, -1)).toBe(0xffffffff);
  });

  test('circle, growing circle, and ellipse translations use Sin/Cos, duration, wrapping, and stored callback', () => {
    const circle = createBattleAnimMonsSprite({ data: [64, 10, 250, 1, 0, 0, 0, 0], storedCallback: 'done' });
    TranslateSpriteInCircle(circle);
    expect(circle).toMatchObject({ x2: 10, y2: 0 });
    expect(circle.data.slice(0, 4)).toEqual([58, 10, 250, 0]);
    TranslateSpriteInCircle(circle);
    expect(circle.callback).toBe('done');

    const growing = createBattleAnimMonsSprite({ data: [0, 5, -3, 1, 0x180, 0x200, 0, 0], storedCallback: 'done' });
    TranslateSpriteInGrowingCircle(growing);
    expect(growing).toMatchObject({ x2: 0, y2: 7 });
    expect(growing.data.slice(0, 6)).toEqual([253, 5, -3, 0, 0x180, 0x380]);
    TranslateSpriteInGrowingCircle(growing);
    expect(growing.callback).toBe('done');

    const ellipse = createBattleAnimMonsSprite({ data: [192, 12, 80, 1, 4, 0, 0, 0], storedCallback: 'done' });
    TranslateSpriteInEllipse(ellipse);
    expect(ellipse.x2).toBe(-12);
    expect(ellipse.y2).toBe(0);
    expect(ellipse.data[0]).toBe(16);
  });

  test('WaitAnimForDuration decrements to zero before restoring the stored callback', () => {
    const sprite = createBattleAnimMonsSprite({ data: [2, 0, 0, 0, 0, 0, 0, 0], storedCallback: 'afterWait' });
    WaitAnimForDuration(sprite);
    expect(sprite.data[0]).toBe(1);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
    WaitAnimForDuration(sprite);
    expect(sprite.data[0]).toBe(0);
    WaitAnimForDuration(sprite);
    expect(sprite.callback).toBe('afterWait');
  });

  test('linear conversion and movement preserve signed step inversion and C integer division', () => {
    const sprite = createBattleAnimMonsSprite({ data: [4, 20, 4, 7, 13, 0, 0, 0], storedCallback: 'linearDone' });
    ConvertPosDataToTranslateLinearData(sprite);
    expect(sprite.data.slice(0, 5)).toEqual([4, -4, 1, 7, 13]);
    TranslateSpriteLinear(sprite);
    expect(sprite).toMatchObject({ x2: -4, y2: 1 });
    expect(sprite.data[0]).toBe(3);
    sprite.data[0] = 0;
    TranslateSpriteLinear(sprite);
    expect(sprite.callback).toBe('linearDone');
  });

  test('fixed-point linear movement writes x2/y2 from data accumulators and restores callback at completion', () => {
    const sprite = createBattleAnimMonsSprite({ data: [2, 384, -512, 0, 0, 0, 0, 0], storedCallback: 'fpDone' });
    TranslateSpriteLinearFixedPoint(sprite);
    expect(sprite).toMatchObject({ x2: 1, y2: -2 });
    expect(sprite.data.slice(0, 5)).toEqual([1, 384, -512, 384, -512]);
    TranslateSpriteLinearFixedPoint(sprite);
    expect(sprite).toMatchObject({ x2: 3, y2: -4 });
    TranslateSpriteLinearFixedPoint(sprite);
    expect(sprite.callback).toBe('fpDone');
  });

  test('ById movement mutates the addressed sprite and fixed-point ById uses data[5] as the target id', () => {
    const target = createBattleAnimMonsSprite({ id: 0 });
    const driver = createBattleAnimMonsSprite({ id: 1, data: [1, 3, -2, 0, 0, 0, 0, 0], storedCallback: 'done' });
    const runtime = createBattleAnimMonsRuntime({ sprites: [target, driver] });

    TranslateSpriteLinearById(runtime, driver);
    expect(target).toMatchObject({ x2: 3, y2: -2 });
    TranslateSpriteLinearById(runtime, driver);
    expect(driver.callback).toBe('done');

    const fixed = createBattleAnimMonsSprite({ id: 2, data: [1, -256, 640, 0, 0, 0, 0, 0], storedCallback: 'fixedDone' });
    runtime.sprites.push(fixed);
    TranslateSpriteLinearByIdFixedPoint(runtime, fixed);
    expect(target).toMatchObject({ x2: -1, y2: 2 });
    TranslateSpriteLinearByIdFixedPoint(runtime, fixed);
    expect(fixed.callback).toBe('fixedDone');
  });

  test('linear flicker updates from previous fixed-point accumulators and toggles only when data[0] modulo data[5] is zero', () => {
    const sprite = createBattleAnimMonsSprite({ data: [4, 256, 0, -512, 0, 2, 0, 0], storedCallback: 'flickerDone' });
    TranslateSpriteLinearAndFlicker(sprite);
    expect(sprite).toMatchObject({ x2: 0, y2: 0, invisible: false });
    TranslateSpriteLinearAndFlicker(sprite);
    expect(sprite).toMatchObject({ x2: 1, y2: -2, invisible: true });
    TranslateSpriteLinearAndFlicker(sprite);
    expect(sprite).toMatchObject({ x2: 2, y2: -4, invisible: true });
    TranslateSpriteLinearAndFlicker(sprite);
    expect(sprite).toMatchObject({ x2: 3, y2: -6, invisible: false });
    TranslateSpriteLinearAndFlicker(sprite);
    expect(sprite.callback).toBe('flickerDone');
  });

  test('stored callback and destroy/blend helpers preserve battle_anim_mons side effects', () => {
    const sprite = createBattleAnimMonsSprite({ id: 7 });
    StoreSpriteCallbackInData6(sprite, 'stored');
    RunStoredCallbackWhenAffineAnimEnds(sprite);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
    sprite.affineAnimEnded = true;
    RunStoredCallbackWhenAffineAnimEnds(sprite);
    expect(sprite.callback).toBe('stored');

    sprite.callback = 'SpriteCallbackDummy';
    sprite.animEnded = true;
    RunStoredCallbackWhenAnimEnds(sprite);
    expect(sprite.callback).toBe('stored');

    const runtime = createBattleAnimMonsRuntime({ gpuRegs: { [REG_OFFSET_BLDCNT]: 99, [REG_OFFSET_BLDALPHA]: 88 } });
    DestroySpriteAndMatrix(runtime, sprite);
    expect(sprite).toMatchObject({ matrixFreed: true, destroyed: true });
    expect(runtime.calls).toContainEqual({ fn: 'FreeSpriteOamMatrix', args: [7] });
    expect(runtime.calls).toContainEqual({ fn: 'DestroyAnimSprite', args: [7] });

    const sprite2 = createBattleAnimMonsSprite({ id: 8 });
    DestroyAnimSpriteAndDisableBlend(runtime, sprite2);
    expect(runtime.gpuRegs).toMatchObject({ [REG_OFFSET_BLDCNT]: 0, [REG_OFFSET_BLDALPHA]: 0 });
    expect(sprite2.destroyed).toBe(true);

    runtime.gpuRegs[REG_OFFSET_BLDCNT] = 12;
    runtime.gpuRegs[REG_OFFSET_BLDALPHA] = 34;
    DestroyAnimVisualTaskAndDisableBlend(runtime, 3);
    expect(runtime.gpuRegs).toMatchObject({ [REG_OFFSET_BLDCNT]: 0, [REG_OFFSET_BLDALPHA]: 0 });
    expect(runtime.destroyedVisualTasks).toEqual([3]);
  });

  test('InitAnimLinearTranslation and AnimTranslateLinear preserve sign flags and u16 accumulators', () => {
    const sprite = createBattleAnimMonsSprite({ x: 10, y: 20, data: [4, 10, -6, 20, 12, 0, 0, 0], storedCallback: 'linearDone' });
    InitAnimLinearTranslation(sprite);
    expect(sprite.data.slice(0, 5)).toEqual([4, 1025, 513, 0, 0]);

    expect(AnimTranslateLinear(sprite)).toBe(false);
    expect(sprite).toMatchObject({ x2: -4, y2: -2 });
    expect(sprite.data.slice(0, 5)).toEqual([3, 1025, 513, 1025, 513]);

    while (!AnimTranslateLinear(sprite)) {}
    expect(sprite.data[0]).toBe(0);
  });

  test('arc translation setup and horizontal/vertical arc steps match linear movement plus sine offset', () => {
    const horizontal = createBattleAnimMonsSprite({ x: 10, y: 20, data: [4, 0, 26, 0, 20, 6, 0, 0] });
    InitAnimArcTranslation(horizontal);
    expect(horizontal.data.slice(0, 8)).toEqual([4, 1024, 0, 0, 0, 6, 8192, 0]);
    expect(TranslateAnimHorizontalArc(horizontal)).toBe(false);
    expect(horizontal).toMatchObject({ x2: 4, y2: 4 });
    expect(horizontal.data[7]).toBe(8192);

    const vertical = createBattleAnimMonsSprite({ x: 10, y: 20, data: [4, 0, 10, 0, 36, 6, 0, 0] });
    InitAnimArcTranslation(vertical);
    expect(TranslateAnimVerticalArc(vertical)).toBe(false);
    expect(vertical).toMatchObject({ x2: 4, y2: 4 });

    SetSpritePrimaryCoordsFromSecondaryCoords(vertical);
    expect(vertical).toMatchObject({ x: 14, y: 24, x2: 0, y2: 0 });
  });

  test('AnimThrowProjectile initializes attacker position, flips target x offset for opponent attacker, and destroys when arc completes', () => {
    const sprite = createBattleAnimMonsSprite({ id: 4 });
    const runtime = createBattleAnimMonsRuntime({
      battleAnimArgs: [0, 0, 12, 5, 2, 7, 0, 0],
      battleAnimAttacker: 1,
      battleAnimTarget: 0,
      battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT },
      battlerCoords: {
        0: { [BATTLER_COORD_X_2]: 40, [BATTLER_COORD_Y_PIC_OFFSET]: 70 },
        1: { [BATTLER_COORD_X_2]: 160, [BATTLER_COORD_Y_PIC_OFFSET]: 42 }
      },
      sprites: [sprite]
    });

    AnimThrowProjectile(runtime, sprite);
    expect(runtime.battleAnimArgs[2]).toBe(-12);
    expect(sprite).toMatchObject({ x: 160, y: 42, callback: 'AnimThrowProjectile_Step' });
    expect(sprite.data.slice(0, 8)).toEqual([2, 16897, 4224, 0, 0, 7, 16384, 0]);

    AnimThrowProjectile_Step(runtime, sprite);
    expect(sprite.destroyed).toBe(false);
    AnimThrowProjectile_Step(runtime, sprite);
    AnimThrowProjectile_Step(runtime, sprite);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'DestroyAnimSprite', args: [4] });
  });

  test('Weather Ball up and down preserve attacker/target side branches, acceleration, destroy threshold, and stored callback', () => {
    const up = createBattleAnimMonsSprite({ id: 2 });
    const runtime = createBattleAnimMonsRuntime({
      battleAnimAttacker: 0,
      battleAnimTarget: 1,
      battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT },
      battlerCoords: {
        0: { [BATTLER_COORD_X_2]: 55, [BATTLER_COORD_Y_PIC_OFFSET]: 10 },
        1: { [BATTLER_COORD_X_2]: 120, [BATTLER_COORD_Y_PIC_OFFSET]: 50 }
      },
      sprites: [up]
    });

    AnimWeatherBallUp(runtime, up);
    expect(up).toMatchObject({ x: 55, y: 10, callback: 'AnimWeatherBallUp_Step' });
    expect(up.data.slice(0, 2)).toEqual([5, -40]);
    AnimWeatherBallUp_Step(runtime, up);
    expect(up).toMatchObject({ x2: 0, y2: -4 });
    expect(up.data.slice(0, 4)).toEqual([5, -39, 5, -40]);
    while (!up.destroyed)
      AnimWeatherBallUp_Step(runtime, up);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'DestroyAnimSprite', args: [2] });

    const down = createBattleAnimMonsSprite({ x: 100, y: 80 });
    const downRuntime = createBattleAnimMonsRuntime({
      battleAnimArgs: [0, 0, 6, 0, -10, 90, 0, 0],
      battleAnimTarget: 0,
      battlerSides: { 0: B_SIDE_PLAYER },
      sprites: [down]
    });
    AnimWeatherBallDown(downRuntime, down);
    expect(down.data.slice(0, 5)).toEqual([6, 0, 90, 0, 170]);
    expect(down.x).toBe(65656);
    expect(down.y).toBe(70);
    expect(down.callback).toBe('StartAnimLinearTranslation');
    expect(down.storedCallback).toBe('DestroyAnimSprite');
  });

  test('fast linear translation uses Q4 accumulators, sign low bits, and wait-end callback restoration', () => {
    const sprite = createBattleAnimMonsSprite({ data: [4, 10, -6, 20, 12, 0, 0, 0], storedCallback: 'fastDone' });
    InitAnimFastLinearTranslation(sprite);
    expect(sprite.data.slice(0, 5)).toEqual([4, 65, 33, 0, 0]);

    expect(AnimFastTranslateLinear(sprite)).toBe(false);
    expect(sprite).toMatchObject({ x2: -4, y2: -2 });
    expect(sprite.data.slice(0, 5)).toEqual([3, 65, 33, 65, 33]);

    while (!AnimFastTranslateLinear(sprite)) {}
    expect(sprite.data[0]).toBe(0);
    AnimFastTranslateLinearWaitEnd(sprite);
    expect(sprite.callback).toBe('fastDone');
  });

  test('fast linear wrappers initialize from primary coords and speed variants exactly like battle_anim_mons.c', () => {
    const run = createBattleAnimMonsSprite({ x: 10, y: 20, data: [4, 0, 26, 0, 12, 0, 0, 0], storedCallback: 'done' });
    InitAndRunAnimFastLinearTranslation(run);
    expect(run.callback).toBe('AnimFastTranslateLinearWaitEnd');
    expect(run.data.slice(0, 5)).toEqual([3, 64, 33, 64, 33]);
    expect(run).toMatchObject({ x2: 4, y2: -2 });

    const withSpeed = createBattleAnimMonsSprite({ data: [8, 10, 42, 20, 4, 0, 0, 0] });
    InitAnimFastLinearTranslationWithSpeed(withSpeed);
    expect(withSpeed.data.slice(0, 5)).toEqual([64, 8, 5, 0, 0]);

    const withSpeedAndPos = createBattleAnimMonsSprite({ x: 6, y: 18, data: [8, 0, 38, 0, 2, 0, 0, 0], storedCallback: 'speedDone' });
    InitAnimFastLinearTranslationWithSpeedAndPos(withSpeedAndPos);
    expect(withSpeedAndPos.callback).toBe('AnimFastTranslateLinearWaitEnd');
    expect(withSpeedAndPos.data.slice(0, 5)).toEqual([63, 8, 5, 8, 5]);
    expect(withSpeedAndPos).toMatchObject({ x2: 0, y2: 0 });
  });

  test('new battler coordinate, lissajous, target-position, and affine helpers expose the remaining C helper surface', () => {
    const sprite = createBattleAnimMonsSprite({ x: 10, y: 20, data: [64, 8, 8, 2, 4, 0, 0, 0], storedCallback: 'done' });
    const target = createBattleAnimMonsSprite({ id: 1, x: 70, y: 80 });
    const runtime = createBattleAnimMonsRuntime({
      battleAnimAttacker: 0,
      battleAnimTarget: 1,
      battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT },
      battlerCoords: {
        0: { [BATTLER_COORD_X_2]: 40, [BATTLER_COORD_Y_PIC_OFFSET]: 72 },
        1: { [BATTLER_COORD_X_2]: 160, [BATTLER_COORD_Y_PIC_OFFSET]: 44 }
      },
      sprites: [sprite, target]
    });

    expect(GetBattlerSpriteCoord(runtime, 1, BATTLER_COORD_X_2)).toBe(160);
    expect(GetBattlerSpriteDefault_Y(runtime, 1)).toBe(0);
    expect(GetBattlerYCoordWithElevation(runtime, 1)).toBe(8);

    TranslateSpriteInLissajousCurve(sprite);
    expect(sprite).toMatchObject({ x2: 8, y2: 0 });
    expect(sprite.data[3]).toBe(1);

    InitSpritePosToAnimTarget(runtime, sprite, false);
    expect(sprite).toMatchObject({ x: 160, y: 44 });
    InitSpritePosToAnimAttacker(runtime, sprite, false);
    expect(sprite).toMatchObject({ x: 40, y: 72 });

    SetSpriteRotScale(sprite, 0x120, 0xe0, 32);
    expect(sprite).toMatchObject({ scaleX: 0x120, scaleY: 0xe0, rotation: 32 });
    expect(ShouldRotScaleSpeciesBeFlipped(201)).toBe(true);
    expect(GetBattleBgPaletteNum(runtime, 19)).toBe(3);
    SetGreyscaleOrOriginalPalette(runtime, 2, true);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'SetGreyscaleOrOriginalPalette', args: [2, true] });
  });

  test('sprite cloning, averaging, invisible copy, and squash helpers keep deterministic sprite state', () => {
    const runtime = createBattleAnimMonsRuntime({
      sprites: [
        createBattleAnimMonsSprite({ id: 0, x: 10, y: 20 }),
        createBattleAnimMonsSprite({ id: 1, x: 30, y: 40 })
      ],
      battlerCoords: {
        0: { [BATTLER_COORD_X_2]: 20, [BATTLER_COORD_Y_PIC_OFFSET]: 70 },
        1: { [BATTLER_COORD_X_2]: 100, [BATTLER_COORD_Y_PIC_OFFSET]: 30 }
      }
    });

    const copyId = CreateInvisibleSpriteCopy(runtime, 0);
    expect(runtime.sprites[copyId]).toMatchObject({ invisible: true, x: 10, y: 20 });

    const average = createBattleAnimMonsSprite();
    SetAverageBattlerPositions(runtime, average, 0, 1);
    expect(average).toMatchObject({ x: 60, y: 50 });

    BattleAnimHelper_SetSpriteSquashParams(average, 0x80, 0x180, 1);
    expect(BattleAnimHelper_RunSpriteSquash(average)).toBe(false);
    expect(average).toMatchObject({ scaleX: 0x80, scaleY: 0x180 });
    expect(BattleAnimHelper_RunSpriteSquash(average)).toBe(true);
    expect(average).toMatchObject({ scaleX: 0x100, scaleY: 0x100, rotation: 0 });
  });
});
