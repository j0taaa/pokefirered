import { describe, expect, test } from 'vitest';
import {
  CreateDeoxysRockFragments,
  CreateFlyBirdSprite,
  CreateMonSprite_FieldMove,
  CreateTrainerSprite,
  DestroyDeoxysRockEffect_RockFragments,
  DestroyDeoxysRockEffect_WaitAndEnd,
  DiveFieldEffect_TryWarp,
  FieldEffectActiveListAdd,
  FieldEffectActiveListClear,
  FieldEffectActiveListContains,
  FieldEffectActiveListRemove,
  FieldEffectFreeGraphicsResources,
  FieldEffectScript_ReadWord,
  FieldEffectStart,
  FieldEffectStop,
  FldEff_PhotoFlash,
  FldEff_UseDive,
  FldEff_UseSurf,
  GetFlyBirdAnimCompleted,
  InitFieldMoveMonSprite,
  MultiplyInvertedPaletteRGBComponents,
  MultiplyPaletteRGBComponents,
  SetFlyBirdPlayerSpriteId,
  SpriteCB_FlyBirdReturnToBall,
  SpriteCB_FlyBirdSwoopDown,
  StartFlyBirdReturnToBall,
  StartFlyBirdSwoopDown,
  Task_FldEffUseSurf,
  Task_PhotoFlash,
  Task_ShowMon_Outdoors,
  Task_UseDive,
  TeleportFieldEffectTask4,
  UseSurfEffect_1,
  VBlankCB_ShowMonEffect_Outdoors,
  WarpInObjectEventDownwards,
  WarpOutObjectEventUpwards,
  createFieldEffectRuntime
} from '../src/game/decompFieldEffect';

describe('decompFieldEffect', () => {
  test('field-effect scripts read words, load resources, call native handlers, and stop on end', () => {
    const runtime = createFieldEffectRuntime();
    runtime.nativeFns.set(9, (r) => {
      r.fieldEffectArguments[0] = 77;
      return 1234;
    });
    runtime.scripts.set(42, [
      0, 0x34, 0x12,
      1, 0x56, 0x00,
      2, 0x78, 0x00,
      3, 0x09, 0x00,
      4
    ]);

    expect(FieldEffectStart(42, runtime)).toBe(1234);
    expect(FieldEffectActiveListContains(42, runtime)).toBe(true);
    expect(runtime.loadedTiles.has(0x1234)).toBe(true);
    expect(runtime.loadedPalettes.has(0x56)).toBe(true);
    expect(runtime.loadedPalettes.has(0x78)).toBe(true);
    expect(runtime.globalTint).toEqual({ r: 16, g: 16, b: 16 });
    expect(runtime.fieldEffectArguments[0]).toBe(77);

    const ref = { script: [0xef, 0xbe], offset: 0 };
    expect(FieldEffectScript_ReadWord(ref)).toBe(0xbeef);
    expect(ref.offset).toBe(2);
  });

  test('active-list and resource cleanup keep the fixed slot behavior', () => {
    const runtime = createFieldEffectRuntime();

    FieldEffectActiveListAdd(3, runtime);
    FieldEffectActiveListAdd(7, runtime);
    expect(runtime.activeList.slice(0, 2)).toEqual([3, 7]);
    FieldEffectActiveListRemove(3, runtime);
    expect(runtime.activeList[0]).toBe(0xff);
    expect(FieldEffectActiveListContains(7, runtime)).toBe(true);
    FieldEffectActiveListClear(runtime);
    expect(runtime.activeEffects.size).toBe(0);

    runtime.loadedTiles.add(12);
    runtime.loadedPalettes.add(12);
    FieldEffectFreeGraphicsResources(12, runtime);
    expect(runtime.freedTiles).toEqual([12]);
    expect(runtime.freedPalettes).toEqual([12]);

    const spriteId = CreateTrainerSprite(5, 10, 20, 2, runtime);
    FieldEffectStop(spriteId, 7, runtime);
    expect(runtime.sprites[spriteId].destroyed).toBe(true);
  });

  test('field-move task chains preserve staged function handoffs and warp side effects', () => {
    const runtime = createFieldEffectRuntime();

    FldEff_UseSurf(runtime);
    expect(runtime.tasks[0].func).toBe('Task_FldEffUseSurf');
    Task_FldEffUseSurf(0, runtime);
    expect(runtime.tasks[0].func).toBe('UseSurfEffect_1');
    UseSurfEffect_1(0, runtime);
    expect(runtime.tasks[0].func).toBe('UseSurfEffect_2');

    FldEff_UseDive(runtime);
    const diveTaskId = 1;
    Task_UseDive(diveTaskId, runtime);
    expect(runtime.tasks[diveTaskId].func).toBe('DiveFieldEffect_Init');
    DiveFieldEffect_TryWarp(diveTaskId, runtime);
    expect(runtime.map.warp).toBe('dive');

    TeleportFieldEffectTask4(diveTaskId, runtime);
    expect(runtime.map.warp).toBe('teleport');

    Task_ShowMon_Outdoors(diveTaskId, runtime);
    expect(runtime.tasks[diveTaskId].func).toBe('ShowMonEffect_Outdoors_1');
    VBlankCB_ShowMonEffect_Outdoors(runtime);
    expect(runtime.callbacks.vblank).toBe('VBlankCB_ShowMonEffect_Outdoors');

    const monSprite = InitFieldMoveMonSprite(runtime);
    expect(runtime.sprites[monSprite].callback).toBe('SpriteCB_FieldMoveMonSlideOnscreen');
    expect(CreateMonSprite_FieldMove(25, 30, 40, runtime)).toBe(monSprite + 1);
  });

  test('fly bird, player warp, Deoxys rock, photo flash, and palette math update exact runtime state', () => {
    const runtime = createFieldEffectRuntime({ player: { x: 50, y: 60, direction: 1, hidden: false, moving: false, elevation: 0, spriteId: 9 } });

    const bird = CreateFlyBirdSprite(runtime);
    expect(runtime.flyBird.spriteId).toBe(bird);
    SetFlyBirdPlayerSpriteId(9, runtime);
    expect(runtime.flyBird.playerSpriteId).toBe(9);
    StartFlyBirdSwoopDown(runtime);
    SpriteCB_FlyBirdSwoopDown(bird, runtime);
    expect(GetFlyBirdAnimCompleted(runtime)).toBe(true);
    expect(runtime.sprites[bird].y2).toBe(4);
    StartFlyBirdReturnToBall(runtime);
    SpriteCB_FlyBirdReturnToBall(bird, runtime);
    expect(runtime.flyBird.returning).toBe(true);

    WarpOutObjectEventUpwards(runtime);
    expect(runtime.player.hidden).toBe(true);
    expect(runtime.player.y).toBe(59);
    WarpInObjectEventDownwards(runtime);
    expect(runtime.player.hidden).toBe(false);
    expect(runtime.player.y).toBe(60);

    CreateDeoxysRockFragments(runtime);
    expect(runtime.deoxysRock.fragments).toHaveLength(4);
    DestroyDeoxysRockEffect_RockFragments(0, runtime);
    expect(runtime.tasks[0].func).toBe('DestroyDeoxysRockEffect_WaitAndEnd');
    DestroyDeoxysRockEffect_WaitAndEnd(0, runtime);
    expect(runtime.deoxysRock.exists).toBe(false);

    FldEff_PhotoFlash(runtime);
    const flashTask = runtime.tasks.find(task => task.func === 'Task_PhotoFlash')?.id ?? 0;
    Task_PhotoFlash(flashTask, runtime);
    expect(runtime.globalTint).toEqual({ r: 31, g: 31, b: 31 });

    expect(MultiplyPaletteRGBComponents(0x7fff, 8, 8, 8)).toBe(0x3def);
    expect(MultiplyInvertedPaletteRGBComponents(0x0000, 8, 8, 8)).toBe(0x4210);
  });
});
