import { describe, expect, test } from 'vitest';
import {
  AnimBowMon,
  AnimBowMon_Step1,
  AnimBowMon_Step2,
  AnimBowMon_Step3,
  AnimBowMon_Step4,
  AnimFalseSwipePositionedSlice,
  AnimFalseSwipeSlice_Step1,
  AnimFalseSwipeSlice_Step2,
  AnimFalseSwipeSlice_Step3,
  AnimLockOnTarget,
  AnimLockOnTarget_Step1,
  AnimLockOnTarget_Step2,
  AnimLockOnTarget_Step3,
  AnimLockOnTarget_Step4,
  AnimLockOnTarget_Step5,
  AnimLockOnTarget_Step6,
  AnimMovePowderParticle,
  AnimMovePowderParticle_Step,
  AnimTask_CreateSmallSolarBeamOrbs,
  AnimTask_DoubleTeam,
  AnimTask_DoubleTeam_Step,
  AnimTask_HideBattlersHealthbox,
  AnimTask_LeafBlade,
  AnimTask_LeafBlade_Step,
  AnimTask_MusicNotesClearRainbowBlend,
  AnimTask_MusicNotesRainbowBlend,
  AnimTask_ShowBattlersHealthbox,
  AnimTask_ShrinkTargetCopy,
  AnimTask_SkullBashPosition,
  AnimTask_SkullBashPositionReset,
  AnimTask_SkullBashPositionSet,
  AnimTask_DuplicateAndShrinkToPos_Step1,
  AnimTask_DuplicateAndShrinkToPos_Step2,
  AnimWavyMusicNotes_CalcVelocity,
  LeafBladeGetPosFactor,
  createAnimSprite1,
  createAnimTask1,
  createBattleAnimEffects1Runtime
} from '../src/game/decompBattleAnimEffects1';

describe('decompBattleAnimEffects1', () => {
  test('powder particles and lock-on reticle preserve staged sprite callback chains', () => {
    const runtime = createBattleAnimEffects1Runtime({ args: [3, -4] });
    const powder = createAnimSprite1(runtime);

    AnimMovePowderParticle(powder, runtime);
    expect(runtime.sprites[powder]).toMatchObject({ x: 203, y: 52, callback: 'AnimMovePowderParticle_Step' });
    AnimMovePowderParticle_Step(powder, runtime);
    expect(runtime.sprites[powder].x2).toBe(1);

    const lockOn = createAnimSprite1(runtime);
    AnimLockOnTarget(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step1');
    for (let i = 0; i < 4; i++) AnimLockOnTarget_Step1(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step2');
    for (let i = 0; i < 4; i++) AnimLockOnTarget_Step2(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step3');
    for (let i = 0; i < 4; i++) AnimLockOnTarget_Step3(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step4');
    for (let i = 0; i < 4; i++) AnimLockOnTarget_Step4(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step5');
    for (let i = 0; i < 4; i++) AnimLockOnTarget_Step5(lockOn, runtime);
    expect(runtime.sprites[lockOn].callback).toBe('AnimLockOnTarget_Step6');
    for (let i = 0; i < 12; i++) AnimLockOnTarget_Step6(lockOn, runtime);
    expect(runtime.sprites[lockOn].destroyed).toBe(true);
  });

  test('bow and false-swipe sprites follow the same multi-stage callback order', () => {
    const runtime = createBattleAnimEffects1Runtime({ args: [11, -7] });
    const bow = createAnimSprite1(runtime);

    AnimBowMon(bow, runtime);
    expect(runtime.sprites[bow].callback).toBe('AnimBowMon_Step1');
    for (let i = 0; i < 8; i++) AnimBowMon_Step1(bow, runtime);
    expect(runtime.sprites[bow].callback).toBe('AnimBowMon_Step2');
    for (let i = 0; i < 8; i++) AnimBowMon_Step2(bow, runtime);
    expect(runtime.sprites[bow].callback).toBe('AnimBowMon_Step3');
    for (let i = 0; i < 8; i++) AnimBowMon_Step3(bow, runtime);
    expect(runtime.sprites[bow].callback).toBe('AnimBowMon_Step4');
    for (let i = 0; i < 4; i++) AnimBowMon_Step4(bow, runtime);
    expect(runtime.sprites[bow].destroyed).toBe(true);

    const slice = createAnimSprite1(runtime);
    AnimFalseSwipePositionedSlice(slice, runtime);
    expect(runtime.sprites[slice]).toMatchObject({ callback: 'AnimFalseSwipeSlice_Step1', x: 211, y: 49 });
    for (let i = 0; i < 6; i++) AnimFalseSwipeSlice_Step1(slice, runtime);
    expect(runtime.sprites[slice].callback).toBe('AnimFalseSwipeSlice_Step2');
    for (let i = 0; i < 6; i++) AnimFalseSwipeSlice_Step2(slice, runtime);
    expect(runtime.sprites[slice].callback).toBe('AnimFalseSwipeSlice_Step3');
    for (let i = 0; i < 6; i++) AnimFalseSwipeSlice_Step3(slice, runtime);
    expect(runtime.sprites[slice].destroyed).toBe(true);
  });

  test('task ports preserve data outputs, spawned sprite ids, and global animation flags', () => {
    const runtime = createBattleAnimEffects1Runtime({ args: [4] });

    const solar = createAnimTask1(runtime);
    AnimTask_CreateSmallSolarBeamOrbs(solar, runtime);
    expect(runtime.tasks[solar].destroyed).toBe(true);
    expect(runtime.sprites).toHaveLength(4);

    const leaf = createAnimTask1(runtime);
    AnimTask_LeafBlade(leaf, runtime);
    expect(runtime.tasks[leaf].func).toBe('AnimTask_LeafBlade_Step');
    for (let i = 0; i < 24; i++) AnimTask_LeafBlade_Step(leaf, runtime);
    expect(runtime.tasks[leaf].func).toBe('AnimTask_LeafBlade_Step2');
    expect(runtime.sprites.length).toBeGreaterThan(4);
    const spawnedLeaf = runtime.sprites.length - 1;
    runtime.sprites[spawnedLeaf].x2 = 7;
    runtime.sprites[spawnedLeaf].y2 = -5;
    expect(LeafBladeGetPosFactor(spawnedLeaf, runtime)).toBe(12);

    const shrink = createAnimTask1(runtime);
    AnimTask_ShrinkTargetCopy(shrink, runtime);
    expect(runtime.tasks[shrink].func).toBe('AnimTask_DuplicateAndShrinkToPos_Step1');
    for (let i = 0; i < 12; i++) AnimTask_DuplicateAndShrinkToPos_Step1(shrink, runtime);
    expect(runtime.tasks[shrink].func).toBe('AnimTask_DuplicateAndShrinkToPos_Step2');
    for (let i = 0; i < 12; i++) AnimTask_DuplicateAndShrinkToPos_Step2(shrink, runtime);
    expect(runtime.tasks[shrink].destroyed).toBe(true);

    const skull = createAnimTask1(runtime);
    AnimTask_SkullBashPosition(skull, runtime);
    expect(runtime.tasks[skull].func).toBe('AnimTask_SkullBashPositionSet');
    AnimTask_SkullBashPositionSet(skull, runtime);
    expect(runtime.tasks[skull].data[1]).toBe(-8);
    AnimTask_SkullBashPositionReset(skull, runtime);
    expect(runtime.tasks[skull].data[1]).toBe(0);

    AnimTask_HideBattlersHealthbox(createAnimTask1(runtime), runtime);
    expect(runtime.healthboxesHidden).toBe(true);
    AnimTask_ShowBattlersHealthbox(createAnimTask1(runtime), runtime);
    expect(runtime.healthboxesHidden).toBe(false);

    AnimTask_MusicNotesRainbowBlend(createAnimTask1(runtime), runtime);
    expect(runtime.musicBlendActive).toBe(true);
    AnimTask_MusicNotesClearRainbowBlend(createAnimTask1(runtime), runtime);
    expect(runtime.musicBlendActive).toBe(false);
  });

  test('double team and music-note velocity helpers mirror task spawning and pointer writes', () => {
    const runtime = createBattleAnimEffects1Runtime();
    const task = createAnimTask1(runtime);

    AnimTask_DoubleTeam(task, runtime);
    expect(runtime.tasks[task].func).toBe('AnimTask_DoubleTeam_Step');
    for (let i = 0; i < 8; i++) AnimTask_DoubleTeam_Step(task, runtime);
    expect(runtime.sprites.filter(sprite => sprite.callback === 'AnimDoubleTeam')).toHaveLength(2);

    const outX = { value: 0 };
    const outY = { value: 0 };
    AnimWavyMusicNotes_CalcVelocity(30, -18, outX, outY, 6);
    expect(outX.value).toBe(5);
    expect(outY.value).toBe(-3);
  });
});
