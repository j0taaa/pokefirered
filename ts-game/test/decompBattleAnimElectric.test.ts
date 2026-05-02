import { describe, expect, test } from 'vitest';
import {
  ANIM_ATK_PARTNER,
  ANIM_TARGET,
  AnimElectricBoltSegment,
  AnimElectricChargingParticles,
  AnimElectricChargingParticles_Step,
  AnimElectricPuff,
  AnimElectricity,
  AnimGrowingChargeOrb,
  AnimGrowingShockWaveOrb,
  AnimLightning,
  AnimLightning_Step,
  AnimShockWaveLightning,
  AnimShockWaveProgressingBolt,
  AnimSparkElectricity,
  AnimSparkElectricityFlashing,
  AnimSparkElectricityFlashing_Step,
  AnimTask_ElectricBolt,
  AnimTask_ElectricBolt_Step,
  AnimTask_ElectricChargingParticles,
  AnimTask_ElectricChargingParticles_Step,
  AnimTask_ShockWaveLightning,
  AnimTask_ShockWaveProgressingBolt,
  AnimTask_VoltTackleAttackerReappear,
  AnimTask_VoltTackleBolt,
  AnimThunderWave,
  AnimThunderWave_Step,
  AnimThunderboltOrb,
  AnimThunderboltOrb_Step,
  AnimUnusedCirclingShock,
  AnimUnusedSpinningFist,
  AnimUnusedSpinningFist_Step,
  AnimVoltTackleBolt,
  AnimVoltTackleOrbSlide,
  AnimVoltTackleOrbSlide_Step,
  AnimZapCannonSpark,
  AnimZapCannonSpark_Step,
  B_SIDE_OPPONENT,
  CreateShockWaveBoltSprite,
  CreateShockWaveLightningSprite,
  CreateVoltTackleBolt,
  SE_M_THUNDERBOLT,
  animElectricBoltSegment,
  animElectricChargingParticles,
  animElectricChargingParticlesStep,
  animElectricPuff,
  animElectricity,
  animGrowingChargeOrb,
  animGrowingShockWaveOrb,
  animLightning,
  animLightningStep,
  animShockWaveLightning,
  animShockWaveProgressingBolt,
  animSparkElectricity,
  animSparkElectricityFlashing,
  animSparkElectricityFlashingStep,
  animTaskElectricBolt,
  animTaskElectricBoltStep,
  animTaskElectricChargingParticles,
  animTaskElectricChargingParticlesStep,
  animTaskShockWaveLightning,
  animTaskShockWaveProgressingBolt,
  animTaskVoltTackleAttackerReappear,
  animTaskVoltTackleBolt,
  animThunderWave,
  animThunderWaveStep,
  animThunderboltOrb,
  animThunderboltOrbStep,
  animUnusedCirclingShock,
  animUnusedSpinningFist,
  animUnusedSpinningFistStep,
  animVoltTackleBolt,
  animVoltTackleOrbSlide,
  animVoltTackleOrbSlideStep,
  animZapCannonSpark,
  animZapCannonSparkStep,
  createShockWaveBoltSprite,
  createShockWaveLightningSprite,
  createVoltTackleBolt,
  createElectricRuntime,
  createElectricSprite,
  createElectricTask,
  gElectricPuffSpriteTemplate,
  gElectricitySpriteTemplate,
  gGrowingChargeOrbSpriteTemplate,
  gGrowingShockWaveOrbSpriteTemplate,
  gLightningSpriteTemplate,
  gSparkElectricityFlashingSpriteTemplate,
  gSparkElectricitySpriteTemplate,
  gThunderWaveSpriteTemplate,
  gThunderboltOrbSpriteTemplate,
  gVoltTackleBoltSpriteTemplate,
  gVoltTackleOrbSlideSpriteTemplate,
  gZapCannonBallSpriteTemplate,
  gZapCannonSparkSpriteTemplate,
  sElectricBoltSegmentSpriteTemplate,
  sElectricChargingParticleCoordOffsets,
  sShockWaveProgressingBoltSpriteTemplate,
  sUnusedCirclingShockSpriteTemplate,
  sUnusedSpinningFistSpriteTemplate
} from '../src/game/decompBattleAnimElectric';

describe('decomp battle_anim_electric.c parity', () => {
  test('exports exact C callback, task, and helper names as aliases of the implemented logic', () => {
    expect(AnimLightning).toBe(animLightning);
    expect(AnimLightning_Step).toBe(animLightningStep);
    expect(AnimUnusedSpinningFist).toBe(animUnusedSpinningFist);
    expect(AnimUnusedSpinningFist_Step).toBe(animUnusedSpinningFistStep);
    expect(AnimUnusedCirclingShock).toBe(animUnusedCirclingShock);
    expect(AnimSparkElectricity).toBe(animSparkElectricity);
    expect(AnimZapCannonSpark).toBe(animZapCannonSpark);
    expect(AnimZapCannonSpark_Step).toBe(animZapCannonSparkStep);
    expect(AnimThunderboltOrb_Step).toBe(animThunderboltOrbStep);
    expect(AnimThunderboltOrb).toBe(animThunderboltOrb);
    expect(AnimSparkElectricityFlashing).toBe(animSparkElectricityFlashing);
    expect(AnimSparkElectricityFlashing_Step).toBe(animSparkElectricityFlashingStep);
    expect(AnimElectricity).toBe(animElectricity);
    expect(AnimTask_ElectricBolt).toBe(animTaskElectricBolt);
    expect(AnimTask_ElectricBolt_Step).toBe(animTaskElectricBoltStep);
    expect(AnimElectricBoltSegment).toBe(animElectricBoltSegment);
    expect(AnimThunderWave).toBe(animThunderWave);
    expect(AnimThunderWave_Step).toBe(animThunderWaveStep);
    expect(AnimTask_ElectricChargingParticles).toBe(animTaskElectricChargingParticles);
    expect(AnimTask_ElectricChargingParticles_Step).toBe(animTaskElectricChargingParticlesStep);
    expect(AnimElectricChargingParticles_Step).toBe(animElectricChargingParticlesStep);
    expect(AnimElectricChargingParticles).toBe(animElectricChargingParticles);
    expect(AnimGrowingChargeOrb).toBe(animGrowingChargeOrb);
    expect(AnimElectricPuff).toBe(animElectricPuff);
    expect(AnimVoltTackleOrbSlide).toBe(animVoltTackleOrbSlide);
    expect(AnimVoltTackleOrbSlide_Step).toBe(animVoltTackleOrbSlideStep);
    expect(AnimTask_VoltTackleAttackerReappear).toBe(animTaskVoltTackleAttackerReappear);
    expect(AnimTask_VoltTackleBolt).toBe(animTaskVoltTackleBolt);
    expect(CreateVoltTackleBolt).toBe(createVoltTackleBolt);
    expect(AnimVoltTackleBolt).toBe(animVoltTackleBolt);
    expect(AnimGrowingShockWaveOrb).toBe(animGrowingShockWaveOrb);
    expect(AnimTask_ShockWaveProgressingBolt).toBe(animTaskShockWaveProgressingBolt);
    expect(CreateShockWaveBoltSprite).toBe(createShockWaveBoltSprite);
    expect(AnimShockWaveProgressingBolt).toBe(animShockWaveProgressingBolt);
    expect(AnimTask_ShockWaveLightning).toBe(animTaskShockWaveLightning);
    expect(CreateShockWaveLightningSprite).toBe(createShockWaveLightningSprite);
    expect(AnimShockWaveLightning).toBe(animShockWaveLightning);
  });

  test('sprite templates preserve electric animation tags and callback identities', () => {
    expect(gLightningSpriteTemplate.callback).toBe('AnimLightning');
    expect(sUnusedSpinningFistSpriteTemplate.callback).toBe('AnimUnusedSpinningFist');
    expect(sUnusedCirclingShockSpriteTemplate.tileTag).toBe('ANIM_TAG_SHOCK');
    expect(gSparkElectricitySpriteTemplate.callback).toBe('AnimSparkElectricity');
    expect(gZapCannonBallSpriteTemplate.callback).toBe('TranslateAnimSpriteToTargetMonLocation');
    expect(gZapCannonSparkSpriteTemplate.affineAnims).toHaveLength(1);
    expect(gThunderboltOrbSpriteTemplate.callback).toBe('AnimThunderboltOrb');
    expect(gSparkElectricityFlashingSpriteTemplate.callback).toBe('AnimSparkElectricityFlashing');
    expect(gElectricitySpriteTemplate.callback).toBe('AnimElectricity');
    expect(sElectricBoltSegmentSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjNormal_8x8');
    expect(gThunderWaveSpriteTemplate.tileTag).toBe('ANIM_TAG_SPARK_H');
    expect(gGrowingChargeOrbSpriteTemplate.callback).toBe('AnimGrowingChargeOrb');
    expect(gElectricPuffSpriteTemplate.anims).toHaveLength(1);
    expect(gVoltTackleOrbSlideSpriteTemplate.callback).toBe('AnimVoltTackleOrbSlide');
    expect(gVoltTackleBoltSpriteTemplate.callback).toBe('AnimVoltTackleBolt');
    expect(gGrowingShockWaveOrbSpriteTemplate.callback).toBe('AnimGrowingShockWaveOrb');
    expect(sShockWaveProgressingBoltSpriteTemplate.callback).toBe('AnimShockWaveProgressingBolt');
  });

  test('basic lightning, unused spinning fist, and circling shock preserve side offsets and destroy callbacks', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [7, -4, 3, 5, 9], battleAnimAttacker: 1 });
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    const lightning = createElectricSprite();
    lightning.x = 50;
    lightning.y = 20;
    animLightning(runtime, lightning);
    expect(lightning.x).toBe(43);
    expect(lightning.y).toBe(16);
    lightning.animEnded = true;
    animLightningStep(lightning);
    expect(lightning.destroyed).toBe(true);

    const fist = createElectricSprite();
    fist.x = 30;
    animUnusedSpinningFist(runtime, fist);
    expect(fist.x).toBe(23);
    fist.affineAnimEnded = true;
    animUnusedSpinningFistStep(fist);
    expect(fist.callback).toBe('DestroySpriteAndMatrix');

    const shock = createElectricSprite();
    animUnusedCirclingShock(runtime, shock);
    expect(shock.x).toBe(169);
    expect(shock.y).toBe(52);
    expect(shock.data.slice(0, 4)).toEqual([0, 3, 5, 9]);
    expect(shock.callback).toBe('TranslateSpriteInCircle');
    expect(shock.storedCallback).toBe('DestroySpriteAndMatrix');
  });

  test('spark electricity selects battlers exactly, writes sine offsets, priority, matrix, and timer callback', () => {
    const runtime = createElectricRuntime({
      battleAnimArgs: [64, 10, 32, 7, ANIM_ATK_PARTNER, 1, 1],
      battlerVisible: { 0: true, 1: true, 2: true, 3: true }
    });
    const sprite = createElectricSprite();
    animSparkElectricity(runtime, sprite);
    expect(sprite.x).toBe(80);
    expect(sprite.y).toBe(72);
    expect(sprite.x2).toBe(10);
    expect(sprite.y2).toBe(0);
    expect(sprite.oam.priority).toBe(2);
    expect(sprite.matrix.b).toBeGreaterThan(0);
    expect(sprite.matrix.c).toBe(-sprite.matrix.b);
    expect(sprite.data[0]).toBe(7);
    expect(sprite.callback).toBe('DestroyAnimSpriteAfterTimer');
  });

  test('zap cannon and flashing spark keep linear translation, sine wobble, tile offset, flashing, and final destroy', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [4, -2, 6, 3, 0, 3, 2] });
    const zap = createElectricSprite();
    animZapCannonSpark(runtime, zap);
    expect(zap.x).toBe(52);
    expect(zap.y).toBe(62);
    expect(zap.data.slice(0, 8)).toEqual([3, 52, 176, 62, 48, 6, 3, 3]);
    expect(zap.oam.tileNum).toBe(8);
    expect(zap.callback).toBe('AnimZapCannonSpark_Step');
    animZapCannonSparkStep(zap);
    animZapCannonSparkStep(zap);
    expect(zap.destroyed).toBe(true);

    const flashingRuntime = createElectricRuntime({ battleAnimArgs: [5, 4, 8, 1, 0, 4, 3, 0x8002] });
    const flash = createElectricSprite();
    animSparkElectricityFlashing(flashingRuntime, flash);
    expect(flash.x).toBe(181);
    expect(flash.y).toBe(52);
    expect(flash.data.slice(4, 8)).toEqual([2, 8, 4, 4]);
    expect(flash.oam.tileNum).toBe(12);
    animSparkElectricityFlashingStep(flash);
    expect(flash.destroyed).toBe(true);
  });

  test('thunderbolt orb and electricity arcs preserve side flip, wait duration, h/v flip matrix, and destroy timing', () => {
    const orbRuntime = createElectricRuntime({ battleAnimTarget: 0, battleAnimArgs: [1, 9, -3, 0] });
    const orb = createElectricSprite();
    animThunderboltOrb(orbRuntime, orb);
    expect(orbRuntime.battleAnimArgs[1]).toBe(-9);
    expect(orb.x).toBe(39);
    expect(orb.y).toBe(61);
    animThunderboltOrbStep(orb);
    expect(orb.invisible).toBe(true);
    animThunderboltOrbStep(orb);
    expect(orb.destroyed).toBe(true);

    const elecRuntime = createElectricRuntime({ battleAnimArgs: [3, 4, 5, 2] });
    const elec = createElectricSprite();
    animElectricity(elecRuntime, elec);
    expect(elec.x).toBe(179);
    expect(elec.y).toBe(52);
    expect(elec.oam.tileNum).toBe(8);
    expect(elec.oam.matrixNum).toBe(2);
    expect(elec.data[0]).toBe(5);
    expect(elec.callback).toBe('WaitAnimForDuration');
    expect(elec.storedCallback).toBe('DestroyAnimSprite');
  });

  test('electric bolt task creates five falling segments with exact tile offsets and segment lifetimes', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [2, -1, 1] });
    const taskId = createElectricTask(runtime);
    animTaskElectricBolt(runtime, taskId);
    for (let i = 0; i <= 10; i++) animTaskElectricBoltStep(runtime, taskId);
    const created = runtime.sprites.filter((sprite) => sprite.callback === 'AnimElectricBoltSegment');
    expect(created).toHaveLength(5);
    expect(created.map((sprite) => sprite.y)).toEqual([63, 79, 95, 111, 127]);
    expect(created.map((sprite) => sprite.oam.tileNum)).toEqual([8, 12, 16, 20, 8]);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
    const segment = created[0];
    expect(segment.oam.shape).toBe('SPRITE_SHAPE(16x16)');
    for (let i = 0; i < 14; i++) animElectricBoltSegment(segment);
    expect(segment.destroyed).toBe(true);
  });

  test('thunder wave creates paired band, increments visual count, toggles every third frame, and destroys at 51', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [4, -6] });
    const wave = createElectricSprite();
    wave.x = 20;
    wave.y = 30;
    wave.subpriority = 9;
    animThunderWave(runtime, wave);
    const paired = runtime.sprites.find((sprite) => sprite.callback === 'AnimThunderWave_Step' && sprite !== wave)!;
    expect(paired.x).toBe(56);
    expect(paired.y).toBe(24);
    expect(paired.oam.tileNum).toBe(8);
    expect(runtime.animVisualTaskCount).toBe(1);
    for (let i = 0; i < 3; i++) animThunderWaveStep(wave);
    expect(wave.invisible).toBe(true);
    for (let i = 0; i < 48; i++) animThunderWaveStep(wave);
    expect(wave.destroyed).toBe(true);
  });

  test('charging particle task spawns offset particles, speeds them up by group, and waits for active particles', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [0, 2, 0, 1] });
    const taskId = createElectricTask(runtime);
    animTaskElectricChargingParticles(runtime, taskId);
    animTaskElectricChargingParticlesStep(runtime, taskId);
    animTaskElectricChargingParticlesStep(runtime, taskId);
    const first = runtime.sprites.find((sprite) => sprite.callback === 'RunStoredCallbackWhenAnimEnds')!;
    expect(first.x).toBe(48 + sElectricChargingParticleCoordOffsets[0][0]);
    expect(first.y).toBe(64 + sElectricChargingParticleCoordOffsets[0][1]);
    expect(first.data.slice(0, 6)).toEqual([40, 106, 48, 4, 64, taskId]);
    expect(first.storedCallback).toBe('AnimElectricChargingParticles');
    expect(runtime.tasks[taskId]?.data[7]).toBe(2);
    animElectricChargingParticles(first);
    expect(first.animIndex).toBe(1);
    first.data[9] = 39;
    animElectricChargingParticlesStep(runtime, first);
    expect(runtime.tasks[taskId]?.data[7]).toBe(1);
    expect(first.destroyed).toBe(true);
  });

  test('charge orb, puff, volt tackle orb slide, and attacker reappear keep callback handoff and side-specific movement', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [ANIM_TARGET, 3, -5] });
    const charge = createElectricSprite();
    animGrowingChargeOrb(runtime, charge);
    expect(charge.x).toBe(176);
    expect(charge.y).toBe(48);
    expect(charge.callback).toBe('RunStoredCallbackWhenAffineAnimEnds');
    expect(charge.storedCallback).toBe('DestroySpriteAndMatrix');

    const puff = createElectricSprite();
    animElectricPuff(runtime, puff);
    expect(puff.x2).toBe(3);
    expect(puff.y2).toBe(-5);
    expect(puff.storedCallback).toBe('DestroyAnimSprite');

    const slideRuntime = createElectricRuntime({ battleAnimAttacker: 1, battlerSides: { 0: 0, 1: B_SIDE_OPPONENT } });
    const slide = createElectricSprite();
    animVoltTackleOrbSlide(slideRuntime, slide);
    expect(slide.affineAnimIndex).toBe(1);
    expect(slide.data[7]).toBe(-16);
    slide.data[1] = 41;
    animVoltTackleOrbSlideStep(slideRuntime, slide);
    animVoltTackleOrbSlideStep(slideRuntime, slide);
    expect(slideRuntime.sprites[1].x2).toBe(-16);

    const reappear = createElectricRuntime();
    const taskId = createElectricTask(reappear, 'AnimTask_VoltTackleAttackerReappear');
    animTaskVoltTackleAttackerReappear(reappear, taskId);
    expect(reappear.sprites[0].x2).toBe(-32);
    for (let i = 0; i < 34; i++) animTaskVoltTackleAttackerReappear(reappear, taskId);
    expect(reappear.tasks[taskId]?.data[0]).toBeGreaterThanOrEqual(2);
  });

  test('volt tackle bolt task creates horizontal bolts, decrements active count from sprite callback, then destroys', () => {
    const runtime = createElectricRuntime({ battleAnimArgs: [0] });
    const taskId = createElectricTask(runtime, 'AnimTask_VoltTackleBolt');
    animTaskVoltTackleBolt(runtime, taskId);
    expect(runtime.tasks[taskId]?.data.slice(1, 7)).toEqual([1, 0, 48, 248, 64, 0]);
    for (let i = 0; i < 7; i++) animTaskVoltTackleBolt(runtime, taskId);
    const bolts = runtime.sprites.filter((sprite) => sprite.callback === 'AnimVoltTackleBolt');
    expect(bolts.length).toBeGreaterThan(0);
    const first = bolts[0];
    expect(first.data[6]).toBe(taskId);
    expect(first.data[7]).toBe(7);
    for (let i = 0; i < 13; i++) animVoltTackleBolt(runtime, first);
    expect(first.destroyed).toBe(true);
    runtime.tasks[taskId]!.data[7] = 0;
    animTaskVoltTackleBolt(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('shock wave orb and progressing bolt task preserve zig-zag phases, panning, active count, and final destroy', () => {
    const orbRuntime = createElectricRuntime();
    const orb = createElectricSprite();
    animGrowingShockWaveOrb(orbRuntime, orb);
    expect(orb.x).toBe(48);
    expect(orb.y).toBe(64);
    expect(orb.affineAnimIndex).toBe(2);
    orb.affineAnimEnded = true;
    animGrowingShockWaveOrb(orbRuntime, orb);
    expect(orb.destroyed).toBe(true);

    const runtime = createElectricRuntime();
    const taskId = createElectricTask(runtime, 'AnimTask_ShockWaveProgressingBolt');
    animTaskShockWaveProgressingBolt(runtime, taskId);
    expect(runtime.tasks[taskId]?.data.slice(4, 16)).toEqual([7, -1, 48, 64, 4, 25, 176, 12, -64, 63, -64, 42]);
    for (let i = 0; i < 80 && runtime.sounds.length === 0; i++) animTaskShockWaveProgressingBolt(runtime, taskId);
    const bolts = runtime.sprites.filter((sprite) => sprite.callback === 'AnimShockWaveProgressingBolt');
    expect(bolts.length).toBeGreaterThan(0);
    const first = bolts[0];
    for (let i = 0; i < 13; i++) animShockWaveProgressingBolt(runtime, first);
    expect(first.destroyed).toBe(true);
    runtime.tasks[taskId]!.data[3] = 0;
    runtime.tasks[taskId]!.data[0] = 3;
    animTaskShockWaveProgressingBolt(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
    expect(runtime.sounds.some((sound) => sound.song === SE_M_THUNDERBOLT)).toBe(true);
  });

  test('shock wave lightning task creates vertical lightning sprites and waits for all callbacks to decrement', () => {
    const runtime = createElectricRuntime();
    const taskId = createElectricTask(runtime, 'AnimTask_ShockWaveLightning');
    animTaskShockWaveLightning(runtime, taskId);
    expect(runtime.tasks[taskId]?.data.slice(12, 16)).toEqual([26, 176, 16, 80]);
    for (let i = 0; i < 6; i++) animTaskShockWaveLightning(runtime, taskId);
    const lightning = runtime.sprites.filter((sprite) => sprite.callback === 'AnimShockWaveLightning');
    expect(lightning.length).toBe(3);
    expect(runtime.tasks[taskId]?.data[0]).toBe(2);
    lightning.forEach((sprite) => {
      sprite.animEnded = true;
      animShockWaveLightning(runtime, sprite);
    });
    animTaskShockWaveLightning(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });
});
