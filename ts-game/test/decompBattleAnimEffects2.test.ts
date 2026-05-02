import { describe, expect, test } from 'vitest';
import {
  AirCutterProjectile_Step1,
  AirCutterProjectile_Step2,
  AnimCirclingFinger,
  AnimGuillotinePincer,
  AnimGuillotinePincer_Step1,
  AnimGuillotinePincer_Step2,
  AnimGuillotinePincer_Step3,
  AnimHealBellMusicNote,
  AnimMovingClamp,
  AnimMovingClamp_End,
  AnimMovingClamp_Step,
  AnimOrbitFast_Step,
  AnimSoftBoiledEgg,
  AnimSoftBoiledEgg_Step1,
  AnimSoftBoiledEgg_Step2,
  AnimSoftBoiledEgg_Step3,
  AnimSoftBoiledEgg_Step4,
  AnimTask_AirCutterProjectile,
  AnimTask_FakeOut,
  AnimTask_FakeOut_Step1,
  AnimTask_FakeOut_Step2,
  AnimTask_GetFuryCutterHitCount,
  AnimTask_IsFuryCutterHitRight,
  AnimTask_Minimize,
  AnimTask_Minimize_Step1,
  AnimTask_SpeedDust,
  AnimTask_SpeedDust_Step,
  AnimSpeedDust,
  CreateMinimizeSprite,
  createAnimSprite2,
  createAnimTask2,
  createBattleAnimEffects2Runtime
} from '../src/game/decompBattleAnimEffects2';

describe('decompBattleAnimEffects2', () => {
  test('moving clamp and guillotine pincer preserve chained sprite callbacks', () => {
    const runtime = createBattleAnimEffects2Runtime();
    const clamp = createAnimSprite2(runtime);

    AnimMovingClamp(clamp, runtime);
    expect(runtime.sprites[clamp].callback).toBe('AnimMovingClamp_Step');

    for (let i = 0; i < 10; i++) AnimMovingClamp_Step(clamp, runtime);
    expect(runtime.sprites[clamp].callback).toBe('AnimMovingClamp_End');
    expect(runtime.sprites[clamp].x2).toBe(30);

    for (let i = 0; i < 8; i++) AnimMovingClamp_End(clamp, runtime);
    expect(runtime.sprites[clamp].destroyed).toBe(true);

    const guillotine = createAnimSprite2(runtime);
    AnimGuillotinePincer(guillotine, runtime);
    expect(runtime.sprites[guillotine].callback).toBe('AnimGuillotinePincer_Step1');

    for (let i = 0; i < 8; i++) AnimGuillotinePincer_Step1(guillotine, runtime);
    expect(runtime.sprites[guillotine].callback).toBe('AnimGuillotinePincer_Step2');

    for (let i = 0; i < 6; i++) AnimGuillotinePincer_Step2(guillotine, runtime);
    expect(runtime.sprites[guillotine].callback).toBe('AnimGuillotinePincer_Step3');

    for (let i = 0; i < 10; i++) AnimGuillotinePincer_Step3(guillotine, runtime);
    expect(runtime.sprites[guillotine].destroyed).toBe(true);
  });

  test('air cutter and fake out tasks advance through the same staged task functions', () => {
    const runtime = createBattleAnimEffects2Runtime();
    const airCutter = createAnimTask2(runtime);

    AnimTask_AirCutterProjectile(airCutter, runtime);
    expect(runtime.tasks[airCutter].func).toBe('AirCutterProjectile_Step1');

    for (let i = 0; i < 8; i++) AirCutterProjectile_Step1(airCutter, runtime);
    expect(runtime.tasks[airCutter].func).toBe('AirCutterProjectile_Step2');
    expect(runtime.bgOffset).toBe(16);

    for (let i = 0; i < 12; i++) AirCutterProjectile_Step2(airCutter, runtime);
    expect(runtime.tasks[airCutter].destroyed).toBe(true);
    expect(runtime.bgOffset).toBe(64);

    const fakeOut = createAnimTask2(runtime);
    AnimTask_FakeOut(fakeOut, runtime);
    expect(runtime.tasks[fakeOut].func).toBe('AnimTask_FakeOut_Step1');

    for (let i = 0; i < 4; i++) AnimTask_FakeOut_Step1(fakeOut, runtime);
    expect(runtime.tasks[fakeOut].func).toBe('AnimTask_FakeOut_Step2');
    expect(runtime.operations).toContain('FakeOutStep1');

    for (let i = 0; i < 8; i++) AnimTask_FakeOut_Step2(fakeOut, runtime);
    expect(runtime.tasks[fakeOut].destroyed).toBe(true);
    expect(runtime.operations).toContain('FakeOutStep2');
  });

  test('minimize and speed dust tasks create child sprites with registered callbacks', () => {
    const runtime = createBattleAnimEffects2Runtime();
    const minimize = createAnimTask2(runtime);

    AnimTask_Minimize(minimize, runtime);
    expect(runtime.tasks[minimize].func).toBe('AnimTask_Minimize_Step1');

    const clone = CreateMinimizeSprite(runtime.tasks[minimize], minimize, runtime);
    expect(runtime.tasks[minimize].data[2]).toBe(clone);
    expect(runtime.sprites[clone].callback).toBe('ClonedMinizeSprite_Step');

    for (let i = 0; i < 12; i++) AnimTask_Minimize_Step1(minimize, runtime);
    expect(runtime.tasks[minimize].destroyed).toBe(true);

    const speedDust = createAnimTask2(runtime);
    AnimTask_SpeedDust(speedDust, runtime);
    for (let i = 0; i < 3; i++) AnimTask_SpeedDust_Step(speedDust, runtime);
    const createdDust = runtime.sprites.filter(sprite => sprite.callback === 'AnimSpeedDust');
    expect(createdDust).toHaveLength(3);

    const dustId = runtime.sprites.findIndex(sprite => sprite.callback === 'AnimSpeedDust');
    AnimSpeedDust(dustId, runtime);
    expect(runtime.sprites[dustId].x2).toBe(-4);
    expect(runtime.sprites[dustId].y2).toBe(1);
  });

  test('soft-boiled egg and music note helpers keep palette and callback state', () => {
    const runtime = createBattleAnimEffects2Runtime();
    const note = createAnimSprite2(runtime);

    AnimHealBellMusicNote(note, runtime);
    expect(runtime.sprites[note].callback).toBe('AnimBouncingMusicNote_Step');
    expect(runtime.sprites[note].palette).toBe(0x12);

    const egg = createAnimSprite2(runtime);
    AnimSoftBoiledEgg(egg, runtime);
    expect(runtime.sprites[egg].callback).toBe('AnimSoftBoiledEgg_Step1');

    for (let i = 0; i < 8; i++) AnimSoftBoiledEgg_Step1(egg, runtime);
    expect(runtime.sprites[egg].callback).toBe('AnimSoftBoiledEgg_Step2');

    for (let i = 0; i < 8; i++) AnimSoftBoiledEgg_Step2(egg, runtime);
    expect(runtime.sprites[egg].callback).toBe('AnimSoftBoiledEgg_Step3');

    for (let i = 0; i < 4; i++) AnimSoftBoiledEgg_Step3(egg, runtime);
    expect(runtime.sprites[egg].callback).toBe('AnimSoftBoiledEgg_Step4');

    for (let i = 0; i < 10; i++) AnimSoftBoiledEgg_Step4(egg, runtime);
    expect(runtime.sprites[egg].destroyed).toBe(true);
  });

  test('orbit setup uses target battler coordinates and fury cutter tasks expose battle state', () => {
    const runtime = createBattleAnimEffects2Runtime();
    runtime.target = 2;
    runtime.battlerX[2] = 77;
    runtime.battlerY[2] = 88;

    const finger = createAnimSprite2(runtime);
    AnimCirclingFinger(finger, runtime);
    expect(runtime.sprites[finger].x).toBe(77);
    expect(runtime.sprites[finger].y).toBe(88);
    expect(runtime.sprites[finger].callback).toBe('AnimOrbitFast_Step');

    AnimOrbitFast_Step(finger, runtime);
    expect(runtime.sprites[finger].x2).not.toBe(0);
    expect(runtime.sprites[finger].y2).not.toBe(0);

    runtime.furyCutterHitRight = true;
    const hitRight = createAnimTask2(runtime);
    AnimTask_IsFuryCutterHitRight(hitRight, runtime);
    expect(runtime.tasks[hitRight].data[0]).toBe(1);
    expect(runtime.tasks[hitRight].destroyed).toBe(true);

    runtime.furyCutterHitCount = 4;
    const hitCount = createAnimTask2(runtime);
    AnimTask_GetFuryCutterHitCount(hitCount, runtime);
    expect(runtime.tasks[hitCount].data[0]).toBe(4);
    expect(runtime.tasks[hitCount].destroyed).toBe(true);
  });
});
