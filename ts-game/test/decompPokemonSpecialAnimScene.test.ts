import { describe, expect, test } from 'vitest';
import {
  CreateItemIconSpriteAtMaxCloseness,
  CreateLevelUpVerticalSpritesTask,
  DrawLevelUpWindowPg1,
  DrawLevelUpWindowPg2,
  GetSpriteOffsetByScale,
  GetYPosByScale,
  InitPokemonSpecialAnimScene,
  LoadBgGfxByAnimType,
  LoadMonSpriteGraphics,
  LoadOutwardSpiralDotsGfx,
  PSA_CreateMonSpriteAtCloseness,
  PSA_DarkenMonSprite,
  PSA_DrawLevelUpWindowPg1,
  PSA_DrawLevelUpWindowPg2,
  PSA_ITEM_ANIM_TYPE_TMHM,
  PSA_IsZoomTaskActive,
  PSA_PrintMessage,
  PSA_RunPoofAnim,
  PSA_SetUpItemUseOnMonAnim,
  PSA_SetUpZoomAnim,
  PSA_UseItem_CleanUpForCancel,
  PSA_UseTM_RunMachineSetWobble,
  PSA_UseTM_RunZoomOutAnim,
  PSA_UseTM_SetUpMachineSetWobble,
  PSA_UseTM_SetUpZoomOutAnim,
  SE_BALL_TRAY_EXIT,
  SE_EXP_MAX,
  SE_M_MILK_DRINK,
  SE_M_REVERSAL,
  SE_M_SWAGGER2,
  SE_SWITCH,
  SpriteCallback_UseItem_OutwardSpiralDots,
  StartMonWiggleAnim,
  Task_UseItem_OutwardSpiralDots,
  callPsaSpriteCallback,
  callPsaTask,
  createPokemonSpecialAnimSceneRuntime,
  sAffineScales
} from '../src/game/decompPokemonSpecialAnimScene';
import { advanceDecompRng } from '../src/game/decompRandom';
import { gSineTable } from '../src/game/decompTrig';

describe('decomp pokemon special anim scene', () => {
  test('initializes backgrounds, message text, and poof star fade in C order', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime({
      itemId: 289,
      monNickname: 'PIKA',
      itemNames: { 289: 'TM01' }
    });

    InitPokemonSpecialAnimScene(runtime, PSA_ITEM_ANIM_TYPE_TMHM);
    expect(runtime.operations).toContain('LoadPalette:sBg_TmHm_Pal');

    PSA_PrintMessage(runtime, 0);
    expect(runtime.scene.textBuf).toBe('TM01 was used on PIKA.');
    PSA_PrintMessage(runtime, 4);
    expect(runtime.scene.textBuf).toBe('Poof');
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized5:0:Poof:36:0:1:0:4');
    PSA_PrintMessage(runtime, 9);
    expect(runtime.scene.textBuf).toBe('PIKA learned CUT!');

    runtime.scene.monSpriteY2 = 80;
    runtime.starPosAttributes.PSA_MON_ATTR_TMHM_X_POS = 3;
    runtime.starPosAttributes.PSA_MON_ATTR_TMHM_Y_POS = 4;
    PSA_DarkenMonSprite(runtime);
    expect(runtime.scene.field_0002).toBe(3);
    expect(runtime.sprites.filter((sprite) => sprite.kind === 'Star')).toHaveLength(3);
    expect(PSA_RunPoofAnim(runtime)).toBe(true);
    for (const star of runtime.sprites.filter((sprite) => sprite.kind === 'Star')) {
      for (let i = 0; i < 10; i++) callPsaSpriteCallback(runtime, star);
    }
    expect(runtime.scene.field_0002).toBe(0);
    PSA_RunPoofAnim(runtime);
    expect(runtime.gPaletteFade.active).toBe(true);
    runtime.gPaletteFade.active = false;
    expect(PSA_RunPoofAnim(runtime)).toBe(false);
  });

  test('creates mon and item sprites with exact closeness scaling and zoom task slots', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime({
      monPosAttributes: {
        PSA_MON_ATTR_Y_OFFSET: 16,
        PSA_MON_ATTR_ITEM_X_POS: 40,
        PSA_MON_ATTR_ITEM_Y_POS: 48
      }
    });

    PSA_CreateMonSpriteAtCloseness(runtime, 1);
    const mon = runtime.scene.monSprite!;
    expect(runtime.scene.monSpriteY1).toBe(72);
    expect(runtime.scene.monSpriteY2).toBe(64);
    expect(mon.affineAnim).toBe(1);
    expect(mon.y).toBe(GetYPosByScale(runtime, sAffineScales[1]));
    expect(GetSpriteOffsetByScale(8, 3)).toBe(16);

    CreateItemIconSpriteAtMaxCloseness(runtime, 13);
    const item = runtime.scene.itemIconSprite!;
    expect(item.x).toBe(124);
    expect(item.y).toBe(64);
    expect(item.x2).toBe(16);
    expect(item.y2).toBe(32);

    PSA_SetUpZoomAnim(runtime, 3);
    expect(PSA_IsZoomTaskActive(runtime)).toBe(true);
    const taskId = runtime.tasks.length - 1;
    expect(runtime.tasks[taskId].data.slice(1, 6)).toEqual([1, 3, 1, 0, 6]);
    callPsaTask(runtime, taskId);
    expect(mon.data.slice(0, 3)).toEqual([0, 0, 1]);
    callPsaTask(runtime, taskId);
    expect(runtime.sounds).toContain(SE_BALL_TRAY_EXIT);
  });

  test('wiggle and machine-set callbacks match finite and timed behavior', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime();
    PSA_CreateMonSpriteAtCloseness(runtime, 0);
    CreateItemIconSpriteAtMaxCloseness(runtime, 289);
    const mon = runtime.scene.monSprite!;

    StartMonWiggleAnim(runtime.scene, 1, 3, 2);
    for (let i = 0; i < 2; i++) callPsaSpriteCallback(runtime, mon);
    expect(mon.x2).toBe(2);
    for (let i = 0; i < 2; i++) callPsaSpriteCallback(runtime, mon);
    expect(mon.x2).toBe(-2);
    for (let i = 0; i < 2; i++) callPsaSpriteCallback(runtime, mon);
    expect(mon.callback).toBe('SpriteCallbackDummy');
    expect(mon.x2).toBe(0);

    PSA_UseTM_SetUpMachineSetWobble(runtime);
    expect(PSA_UseTM_RunMachineSetWobble(runtime)).toBe(true);
    expect(runtime.sounds).toContain(SE_SWITCH);
    const startX = mon.x;
    callPsaSpriteCallback(runtime, mon);
    expect(mon.x).toBe(startX + 3);
    for (let i = 0; i < 31; i++) callPsaSpriteCallback(runtime, mon);
    expect(mon.x).toBe(startX);
    expect(PSA_UseTM_RunMachineSetWobble(runtime)).toBe(false);
  });

  test('item-use-on-mon task reveals item, zooms, creates three bursts, and honors cancel suppression', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime();
    PSA_CreateMonSpriteAtCloseness(runtime, 0);
    PSA_SetUpItemUseOnMonAnim(runtime, 13, 1, true);
    const taskId = runtime.tasks.length - 1;
    const task = runtime.tasks[taskId];
    const item = runtime.scene.itemIconSprite!;
    expect(item.invisible).toBe(true);

    for (let i = 0; i < 21; i++) callPsaTask(runtime, taskId);
    expect(item.invisible).toBe(false);
    expect(runtime.sounds).toContain(SE_M_SWAGGER2);
    for (let i = 0; i < 31; i++) callPsaTask(runtime, taskId);
    expect(item.affineAnims).toBe('itemZoom');
    expect(runtime.sounds).toContain(SE_M_MILK_DRINK);
    callPsaTask(runtime, taskId);
    expect(item.invisible).toBe(true);

    for (let i = 0; i < 21; i++) callPsaTask(runtime, taskId);
    expect(runtime.sounds).toContain(SE_M_REVERSAL);
    expect(task.data[8]).toBe(15);
    const burstDot = runtime.sprites.find((sprite) => sprite.callback === 'SpriteCB_OutwardSpiralDots')!;
    callPsaSpriteCallback(runtime, burstDot);
    expect(burstDot.data.slice(0, 3)).toEqual([1, 7, 4]);
    expect(burstDot.x2).toBe((4 * gSineTable[0x47]) >> 8);
    for (let i = 0; i < 16; i++) callPsaSpriteCallback(runtime, burstDot);
    expect(burstDot.destroyed).toBe(true);
    expect(task.data[8]).toBe(14);

    const cancel = createPokemonSpecialAnimSceneRuntime();
    PSA_SetUpItemUseOnMonAnim(cancel, 13, 0, false);
    PSA_UseItem_CleanUpForCancel(cancel);
    const cancelTaskId = cancel.tasks.length - 1;
    for (let i = 0; i < 21 + 31 + 1 + 21; i++) callPsaTask(cancel, cancelTaskId);
    expect(cancel.tasks[cancelTaskId].data[11]).toBe(1);
    expect(cancel.sprites.filter((sprite) => sprite.kind === 'UseItem_OutwardSpiralDots')).toHaveLength(0);
  });

  test('TM zoom-out seeds random outward dots and destroys item after the exact state chain', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime();
    PSA_CreateMonSpriteAtCloseness(runtime, 3);
    CreateItemIconSpriteAtMaxCloseness(runtime, 289);
    PSA_UseTM_SetUpZoomOutAnim(runtime);

    expect(PSA_UseTM_RunZoomOutAnim(runtime)).toBe(true);
    const zoomTaskId = runtime.tasks.length - 1;
    while (runtime.tasks[zoomTaskId] && !runtime.tasks[zoomTaskId].destroyed) {
      callPsaTask(runtime, zoomTaskId);
    }
    PSA_UseTM_RunZoomOutAnim(runtime);
    for (let i = 0; i < 21; i++) PSA_UseTM_RunZoomOutAnim(runtime);
    PSA_UseTM_RunZoomOutAnim(runtime);
    PSA_UseTM_RunZoomOutAnim(runtime);
    const dotTaskId = runtime.tasks.findIndex((task) => task.func === 'Task_UseItem_OutwardSpiralDots');
    expect(dotTaskId).toBeGreaterThanOrEqual(0);
    expect(runtime.scene.monSprite!.callback).toBe('SpriteCallback_MonSpriteWiggle');

    Task_UseItem_OutwardSpiralDots(runtime, dotTaskId);
    const dot = runtime.sprites.at(-1)!;
    const firstState = advanceDecompRng(2022069025);
    const ampl = ((firstState >>> 16) % 21) + 70;
    const x = runtime.scene.itemIconSprite!.x + runtime.scene.itemIconSprite!.x2;
    const y = runtime.scene.itemIconSprite!.y + runtime.scene.itemIconSprite!.y2;
    expect(dot.x).toBe(x + ((gSineTable[0x120] * ampl) >> 8));
    expect(dot.y).toBe(y + ((gSineTable[0xe0] * ampl) >> 8));
    expect(dot.data[1]).toBe(((advanceDecompRng(firstState) >>> 16) & 1) + 6);
    SpriteCallback_UseItem_OutwardSpiralDots(runtime, dot);
    expect(dot.data[0]).toBe(dot.data[1]);

    runtime.tasks[dotTaskId].data[0] = 1;
    runtime.tasks[dotTaskId].data[2] = 0;
    callPsaTask(runtime, dotTaskId);
    runtime.scene.state = 6;
    for (let i = 0; i < 41; i++) PSA_UseTM_RunZoomOutAnim(runtime);
    for (let i = 0; i < 21; i++) PSA_UseTM_RunZoomOutAnim(runtime);
    expect(PSA_UseTM_RunZoomOutAnim(runtime)).toBe(true);
    expect(runtime.sounds).toContain(SE_EXP_MAX);
    expect(runtime.scene.itemIconSprite!.destroyed).toBe(true);
    expect(PSA_UseTM_RunZoomOutAnim(runtime)).toBe(false);
  });

  test('level-up vertical task and stat pages preserve sprite cadence and stat rearrangement', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime();
    CreateLevelUpVerticalSpritesTask(runtime, 120, 56, 4, 4, 2, 0);
    const taskId = runtime.tasks.length - 1;
    callPsaTask(runtime, taskId);
    expect(runtime.sprites[0]).toMatchObject({
      kind: 'LevelUpVertical',
      x: ((1 * 219) & 0x3f) + 88,
      y: 88,
      subpriority: 0
    });
    expect(runtime.sprites[0].data[2]).toBe((advanceDecompRng(1) & 0x3f) + 0x20);
    callPsaSpriteCallback(runtime, runtime.sprites[0]);
    expect(runtime.sprites[0].y2).toBe(runtime.sprites[0].data[1] >> 4);

    for (let i = 0; i < 40; i++) callPsaTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    for (const sprite of runtime.sprites) {
      while (!sprite.destroyed) callPsaSpriteCallback(runtime, sprite);
    }
    callPsaTask(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.operations).toContain('FreeSpriteTilesByTag:4');
    expect(runtime.operations).toContain('FreeSpritePaletteByTag:4');

    const page1 = DrawLevelUpWindowPg1(runtime, 1, [10, 11, 12, 13, 14, 15], [11, 9, 22, 18, 15, 30], 0, 1, 2);
    expect(page1.filter((entry) => entry.x === 0).map((entry) => entry.text)).toEqual([
      'MAX. HP',
      'ATTACK',
      'DEFENSE',
      'SP. ATK',
      'SP. DEF',
      'SPEED'
    ]);
    expect(page1.filter((entry) => entry.x === 56).map((entry) => entry.text)).toEqual(['+', '-', '+', '+', '+', '+']);
    expect(page1[8]).toMatchObject({ x: 62, y: 30, text: ' 10' });

    const page2 = DrawLevelUpWindowPg2(runtime, 1, [9, 10, 99, 100, 7, 123], 0, 1, 2);
    expect(page2.filter((entry) => entry.x === 0).map((entry) => entry.text)).toEqual([
      'MAX. HP',
      'ATTACK',
      'DEFENSE',
      'SP. ATK',
      'SP. DEF',
      'SPEED'
    ]);
    expect(page2.filter((_, index) => index % 2 === 1).map((entry) => [entry.x, entry.text])).toEqual([
      [74, '9'],
      [68, '10'],
      [68, '99'],
      [74, '7'],
      [62, '123'],
      [62, '100']
    ]);
  });

  test('exact C-name stat-window and graphics helpers preserve side effects', () => {
    const runtime = createPokemonSpecialAnimSceneRuntime();

    const page1 = PSA_DrawLevelUpWindowPg1(runtime, [10, 20, 30, 40, 50, 60], [11, 18, 30, 45, 51, 70]);
    expect(page1.filter((entry) => entry.x === 56).map((entry) => entry.text)).toEqual(['+', '-', '+', '+', '+', '+']);
    expect(runtime.operations).toContain('DrawTextBorderOuter:1:0x001:14');
    expect(runtime.operations).toContain('PutWindowTilemap:1');
    expect(runtime.operations).toContain('CopyWindowToVram:1:FULL');

    const page2 = PSA_DrawLevelUpWindowPg2(runtime, [9, 10, 99, 100, 7, 123]);
    expect(page2.filter((_, index) => index % 2 === 1).map((entry) => [entry.x, entry.text])).toEqual([
      [74, '9'],
      [68, '10'],
      [68, '99'],
      [74, '7'],
      [62, '123'],
      [62, '100']
    ]);
    expect(runtime.operations).toContain('CopyWindowToVram:1:GFX');

    LoadBgGfxByAnimType(runtime, PSA_ITEM_ANIM_TYPE_TMHM);
    expect(runtime.operations).toContain('CopyToBgTilemapBuffer:3:sBg_Tilemap:0:0x000');
    expect(runtime.operations).toContain('DecompressAndCopyTileDataToVram:3:sBg_Gfx:0:0x000:0');
    expect(runtime.operations).toContain('LoadPalette:sBg_TmHm_Pal:BG_PLTT_ID(0)');

    LoadMonSpriteGraphics(runtime, {}, {});
    expect(runtime.operations).toContain('LoadSpriteSheet:MonSprite:tiles:MON_PIC_SIZE:0');
    expect(runtime.operations).toContain('LoadSpritePalette:MonSprite:palette:0');

    LoadOutwardSpiralDotsGfx(runtime);
    expect(runtime.operations).toContain('LoadCompressedSpriteSheet:UseItem_OutwardSpiralDots');
    expect(runtime.operations).toContain('LoadSpritePalette:UseItem_OutwardSpiralDots');
  });
});
