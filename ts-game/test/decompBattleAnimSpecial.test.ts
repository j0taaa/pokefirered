import { describe, expect, test } from 'vitest';
import {
  AnimateBallOpenParticles,
  AnimTask_FreeBaitGfx,
  AnimTask_FreeBallGfx,
  AnimTask_FreeHealthboxPalsForLevelUp,
  AnimTask_FlashHealthboxOnLevelUp,
  AnimTask_FlashHealthboxOnLevelUp_Step,
  AnimTask_GetBattlersFromArg,
  AnimTask_GetTrappedMoveAnimId,
  AnimTask_IsAttackerBehindSubstitute,
  AnimTask_IsBallBlockedByTrainerOrDodged,
  AnimTask_LoadBaitGfx,
  AnimTask_LoadBallGfx,
  AnimTask_LoadHealthboxPalsForLevelUp,
  AnimTask_LevelUpHealthBox,
  AnimTask_SafariGetReaction,
  AnimTask_SafariOrGhost_DecideAnimSides,
  AnimTask_SetTargetToEffectBattler,
  AnimTask_ShinySparkles,
  AnimTask_ShinySparkles_WaitSparkles,
  AnimTask_SubstituteFadeToInvisible,
  AnimTask_SwapMonSpriteToFromSubstitute,
  AnimTask_SwitchOutBallEffect,
  AnimTask_SwitchOutShrinkMon,
  AnimTask_ThrowBall,
  AnimTask_ThrowBallSpecial,
  AnimTask_ThrowBallSpecial_PlaySfx,
  AnimTask_ThrowBallSpecial_ResetPlayerSprite,
  AnimTask_ThrowBall_WaitAnimObjComplete,
  AnimTask_UnusedLevelUpHealthBox_Step,
  ANIM_SPRITES_START,
  ANIM_TAG_GOLD_STARS,
  ANIM_TAG_ROCKS,
  ANIM_TAG_SAFARI_BAIT,
  ARG_RET_ID,
  BallParticleTask,
  BeginNormalPaletteFade,
  BATTLER_COORD_X,
  BATTLER_COORD_Y,
  BG_ANIM_AREA_OVERFLOW_MODE,
  BG_ANIM_CHAR_BASE_BLOCK,
  BG_ANIM_PRIORITY,
  BG_ANIM_SCREEN_SIZE,
  BLDALPHA_BLEND,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT1_BG1,
  BLDCNT_TGT1_BG2,
  BLDCNT_TGT2_ALL,
  BALL_DIVE,
  BALL_GREAT,
  BALL_LUXURY,
  BALL_MASTER,
  BALL_NEST,
  BALL_NET,
  BALL_3_SHAKES_SUCCESS,
  BALL_NO_SHAKES,
  BALL_POKE,
  BALL_PREMIER,
  BALL_REPEAT,
  BALL_SAFARI,
  BALL_TIMER,
  BALL_TRAINER_BLOCK,
  BALL_ULTRA,
  BALL_GHOST_DODGE,
  BattleAnimObj_SignalEnd,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_LEFT,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BlendPalette,
  DISPCNT_OBJWIN_ON,
  DMA3_32BIT,
  DestroyBallOpenAnimationParticle,
  DiveBallOpenParticleAnimation,
  DoFreeHealthboxPalsForLevelUp,
  DoLoadHealthboxPalsForLevelUp,
  FanOutBallOpenParticles_Step1,
  FEMALE,
  FreeBallGfx,
  GreatBallOpenParticleAnimation,
  GetSpriteTileStartByTag,
  GetShinyValue,
  GetBattlePalettesMask,
  GhostBallDodge,
  GhostBallDodge2,
  ITEM_DIVE_BALL,
  ITEM_GREAT_BALL,
  ITEM_LUXURY_BALL,
  ITEM_MASTER_BALL,
  ITEM_NEST_BALL,
  ITEM_NET_BALL,
  ITEM_POKE_BALL,
  ITEM_PREMIER_BALL,
  ITEM_REPEAT_BALL,
  ITEM_SAFARI_BALL,
  ITEM_TIMER_BALL,
  ITEM_ULTRA_BALL,
  IncrementBattleParticleCounter,
  ItemIdToBallId,
  LaunchBallFadeMonTask,
  LoadBallGfx,
  LoadBallParticleGfx,
  MasterBallOpenParticleAnimation,
  MOVE_CLAMP,
  MOVE_FIRE_SPIN,
  MOVE_SAND_TOMB,
  MOVE_WHIRLPOOL,
  MULTISTRING_CHOOSER,
  POKEBALL_COUNT,
  PLTT_SIZE_4BPP,
  PokeBallOpenParticleAnimation,
  PokeBallOpenParticleAnimation_Step1,
  PokeBallOpenParticleAnimation_Step2,
  PremierBallOpenParticleAnimation,
  PremierBallOpenParticleAnimation_Step1,
  RepeatBallOpenParticleAnimation,
  RepeatBallOpenParticleAnimation_Step1,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  SE_BALL,
  SE_BALL_CLICK,
  SE_BALL_OPEN,
  SE_BALL_BOUNCE_1,
  SE_BALL_BOUNCE_2,
  SE_BALL_BOUNCE_3,
  SE_BALL_BOUNCE_4,
  SE_BALL_TRADE,
  SE_BALL_THROW,
  SE_SHINY,
  MUS_CAUGHT_INTRO,
  SafariBallOpenParticleAnimation,
  SHINY_ODDS,
  SOUND_PAN_ATTACKER,
  SOUND_PAN_TARGET,
  SPRITE_TILE_START_NONE,
  SpriteCB_SafariBaitOrRock_ArcFlight,
  SpriteCB_SafariBaitOrRock_Finish,
  SpriteCB_SafariBaitOrRock_Init,
  SpriteCB_SafariBaitOrRock_WaitPlayerThrow,
  SpriteCB_ShinySparkles_1,
  SpriteCB_ShinySparkles_2,
  SpriteCB_ThrowBall_ArcFlight,
  SpriteCB_ThrowBall_Bounce,
  SpriteCB_ThrowBall_BeginBreakOut,
  SpriteCB_ThrowBall_DelayThenBreakOut,
  SpriteCB_ThrowBall_DoClick,
  SpriteCB_ThrowBall_DoShake,
  SpriteCB_ThrowBall_FinishClick,
  SpriteCB_ThrowBall_InitialFall,
  SpriteCB_ThrowBall_InitClick,
  SpriteCB_ThrowBall_Init,
  SpriteCB_ThrowBall_InitShake,
  SpriteCB_ThrowBall_RunBreakOut,
  SpriteCB_ThrowBall_ShrinkMon,
  SpriteCB_ThrowBall_TenFrameDelay,
  SpriteCB_BallCaptureSuccessStar,
  ST_OAM_OBJ_NORMAL,
  ST_OAM_OBJ_BLEND,
  ST_OAM_OBJ_WINDOW,
  TAG_PARTICLES_DIVEBALL,
  TAG_HEALTHBAR_PAL,
  TAG_HEALTHBOX_PAL,
  TAG_HEALTHBOX_PALS_1,
  TAG_HEALTHBOX_PALS_2,
  TAG_PARTICLES_POKEBALL,
  Task_FadeMon_ToBallColor,
  Task_FadeMon_ToNormal,
  Task_FadeMon_ToNormal_Step,
  TILE_SIZE_4BPP,
  TimerBallOpenParticleAnimation,
  TRAP_ANIM_BIND,
  TRAP_ANIM_CLAMP,
  TRAP_ANIM_FIRE_SPIN,
  TRAP_ANIM_SAND_TOMB,
  TRAP_ANIM_WHIRLPOOL,
  TryShinyAnimation,
  TrainerBallBlock,
  TrainerBallBlock2,
  UltraBallOpenParticleAnimation,
  CreateStarsWhenBallClicks,
  createBallParticleSprite,
  createBattleAnimSpecialRuntime,
  gBallParticlePalettes,
  gBallParticleSpritesheets,
  gBallSpritePalettes,
  gBallSpriteSheets,
  gBallSpriteTemplates,
  gSafariBaitSpriteTemplate,
  gSafariRockTemplate,
  sBallOpenFadeColors,
  sBallParticleAnimNums,
  sBallParticleAnimationFuncs,
  sSpriteAnim_SafariRock_0,
  sSpriteAnimTable_SafariRock,
  sCaptureStar
} from '../src/game/decompBattleAnimSpecial';
import { BG_PLTT_ID, OBJ_PLTT_ID, RGB, RGB_BLACK, RGB_WHITE } from '../src/game/decompPalette';
import { cos, sin } from '../src/game/decompTrig';

const createTask = (
  ballId: number,
  data: Partial<Record<number, number>> = {}
): BallParticleTask => {
  const taskData = Array.from({ length: 16 }, () => 0);
  taskData[1] = 40;
  taskData[2] = 56;
  taskData[3] = 2;
  taskData[4] = 9;
  taskData[15] = ballId;
  for (const [index, value] of Object.entries(data)) {
    if (value !== undefined) {
      taskData[Number(index)] = value;
    }
  }
  return {
    id: 0,
    func: sBallParticleAnimationFuncs[ballId],
    priority: 5,
    data: taskData
  };
};

const createRuntimeTask = (
  data: Partial<Record<number, number>> = {}
): BallParticleTask => {
  const taskData = Array.from({ length: 16 }, () => 0);
  for (const [index, value] of Object.entries(data)) {
    if (value !== undefined) {
      taskData[Number(index)] = value;
    }
  }
  return {
    id: 0,
    func: 'testTask',
    priority: 5,
    data: taskData
  };
};

describe('decompBattleAnimSpecial', () => {
  test('ItemIdToBallId preserves every switch case and defaults to BALL_POKE', () => {
    expect(ItemIdToBallId(ITEM_MASTER_BALL)).toBe(BALL_MASTER);
    expect(ItemIdToBallId(ITEM_ULTRA_BALL)).toBe(BALL_ULTRA);
    expect(ItemIdToBallId(ITEM_GREAT_BALL)).toBe(BALL_GREAT);
    expect(ItemIdToBallId(ITEM_SAFARI_BALL)).toBe(BALL_SAFARI);
    expect(ItemIdToBallId(ITEM_NET_BALL)).toBe(BALL_NET);
    expect(ItemIdToBallId(ITEM_DIVE_BALL)).toBe(BALL_DIVE);
    expect(ItemIdToBallId(ITEM_NEST_BALL)).toBe(BALL_NEST);
    expect(ItemIdToBallId(ITEM_REPEAT_BALL)).toBe(BALL_REPEAT);
    expect(ItemIdToBallId(ITEM_TIMER_BALL)).toBe(BALL_TIMER);
    expect(ItemIdToBallId(ITEM_LUXURY_BALL)).toBe(BALL_LUXURY);
    expect(ItemIdToBallId(ITEM_PREMIER_BALL)).toBe(BALL_PREMIER);
    expect(ItemIdToBallId(ITEM_POKE_BALL)).toBe(BALL_POKE);
    expect(ItemIdToBallId(9999)).toBe(BALL_POKE);
  });

  test('ball particle tables preserve tags, animation numbers, funcs, and capture star constants', () => {
    expect(sCaptureStar).toEqual([
      { xOffset: 10, yOffset: 2, amplitude: -3 },
      { xOffset: 15, yOffset: 0, amplitude: -4 },
      { xOffset: -10, yOffset: 2, amplitude: -4 }
    ]);
    expect(gBallParticleSpritesheets[BALL_POKE]).toEqual({
      data: 'gBattleAnimSpriteGfx_Particles',
      size: 0x100,
      tag: TAG_PARTICLES_POKEBALL
    });
    expect(gBallParticlePalettes[BALL_DIVE]).toEqual({
      data: 'gBattleAnimSpritePal_CircleImpact',
      tag: TAG_PARTICLES_DIVEBALL
    });
    expect(sBallParticleAnimNums).toEqual([0, 0, 0, 5, 1, 2, 2, 3, 5, 5, 4, 4]);
    expect(sBallParticleAnimationFuncs).toEqual([
      'PokeBallOpenParticleAnimation',
      'GreatBallOpenParticleAnimation',
      'SafariBallOpenParticleAnimation',
      'UltraBallOpenParticleAnimation',
      'MasterBallOpenParticleAnimation',
      'SafariBallOpenParticleAnimation',
      'DiveBallOpenParticleAnimation',
      'UltraBallOpenParticleAnimation',
      'RepeatBallOpenParticleAnimation',
      'TimerBallOpenParticleAnimation',
      'GreatBallOpenParticleAnimation',
      'PremierBallOpenParticleAnimation'
    ]);
    expect(sBallOpenFadeColors).toEqual([
      RGB(31, 22, 30),
      RGB(16, 23, 30),
      RGB(23, 30, 20),
      RGB(31, 31, 15),
      RGB(23, 20, 28),
      RGB(21, 31, 25),
      RGB(12, 25, 30),
      RGB(30, 27, 10),
      RGB(31, 24, 16),
      RGB(29, 30, 30),
      RGB(31, 17, 10),
      RGB(31, 9, 10),
      RGB_BLACK,
      RGB(1, 16, 0),
      RGB(3, 0, 1),
      RGB(1, 8, 0),
      RGB(0, 8, 0),
      RGB(3, 8, 1),
      RGB(6, 8, 1),
      RGB(4, 0, 0)
    ]);
    expect(gSafariBaitSpriteTemplate).toEqual({
      tileTag: ANIM_TAG_SAFARI_BAIT,
      paletteTag: ANIM_TAG_SAFARI_BAIT,
      oam: 'gOamData_AffineOff_ObjNormal_16x16',
      anims: 'gDummySpriteAnimTable',
      images: null,
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'SpriteCB_SafariBaitOrRock_Init'
    });
    expect(sSpriteAnim_SafariRock_0).toEqual([
      { frame: 64, duration: 1 },
      'ANIMCMD_END'
    ]);
    expect(sSpriteAnimTable_SafariRock).toEqual([sSpriteAnim_SafariRock_0]);
    expect(gSafariRockTemplate).toEqual({
      tileTag: ANIM_TAG_ROCKS,
      paletteTag: ANIM_TAG_ROCKS,
      oam: 'gOamData_AffineOff_ObjNormal_32x32',
      anims: sSpriteAnimTable_SafariRock,
      images: null,
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'SpriteCB_SafariBaitOrRock_Init'
    });
  });

  test('LoadBallParticleGfx loads sheet and palette only when tile tag is absent', () => {
    const runtime = createBattleAnimSpecialRuntime();
    expect(GetSpriteTileStartByTag(runtime, TAG_PARTICLES_POKEBALL)).toBe(SPRITE_TILE_START_NONE);

    LoadBallParticleGfx(runtime, BALL_POKE);
    expect(runtime.calls).toEqual([
      { fn: 'LoadCompressedSpriteSheetUsingHeap', args: [gBallParticleSpritesheets[BALL_POKE]] },
      { fn: 'LoadCompressedSpritePaletteUsingHeap', args: [gBallParticlePalettes[BALL_POKE]] }
    ]);
    expect(GetSpriteTileStartByTag(runtime, TAG_PARTICLES_POKEBALL)).toBe(0);

    LoadBallParticleGfx(runtime, BALL_POKE);
    expect(runtime.calls).toHaveLength(2);
  });

  test('LoadBallGfx mirrors pokeball.c sheet, palette, and open-ball decompression rules', () => {
    const runtime = createBattleAnimSpecialRuntime();

    LoadBallGfx(runtime, BALL_GREAT);
    expect(runtime.loadedTileTags.has(gBallSpriteSheets[BALL_GREAT].tag)).toBe(true);
    expect(runtime.loadedPaletteTags.has(gBallSpritePalettes[BALL_GREAT].tag)).toBe(true);
    expect(runtime.loadedBallGfx.has(BALL_GREAT)).toBe(true);
    expect(runtime.calls).toEqual([
      { fn: 'LoadCompressedSpriteSheetUsingHeap', args: [gBallSpriteSheets[BALL_GREAT]] },
      { fn: 'LoadCompressedSpritePaletteUsingHeap', args: [gBallSpritePalettes[BALL_GREAT]] },
      { fn: 'LZDecompressVram', args: ['gOpenPokeballGfx', 'OBJ_VRAM0 + 0x100 + 0 * 32'] }
    ]);

    LoadBallGfx(runtime, BALL_GREAT);
    expect(runtime.calls.at(-1)).toEqual({
      fn: 'LZDecompressVram',
      args: ['gOpenPokeballGfx', 'OBJ_VRAM0 + 0x100 + 0 * 32']
    });
    expect(runtime.calls).toHaveLength(4);

    const skippedOpenGfx = createBattleAnimSpecialRuntime();
    LoadBallGfx(skippedOpenGfx, BALL_DIVE);
    expect(skippedOpenGfx.calls).toEqual([
      { fn: 'LoadCompressedSpriteSheetUsingHeap', args: [gBallSpriteSheets[BALL_DIVE]] },
      { fn: 'LoadCompressedSpritePaletteUsingHeap', args: [gBallSpritePalettes[BALL_DIVE]] }
    ]);
  });

  test('FreeBallGfx frees sheet and palette tags for the selected ball id', () => {
    const runtime = createBattleAnimSpecialRuntime({
      loadedTileTags: new Set([gBallSpriteSheets[BALL_ULTRA].tag]),
      loadedPaletteTags: new Set([gBallSpritePalettes[BALL_ULTRA].tag]),
      loadedBallGfx: new Set([BALL_ULTRA])
    });

    FreeBallGfx(runtime, BALL_ULTRA);

    expect(runtime.loadedTileTags.has(gBallSpriteSheets[BALL_ULTRA].tag)).toBe(false);
    expect(runtime.loadedPaletteTags.has(gBallSpritePalettes[BALL_ULTRA].tag)).toBe(false);
    expect(runtime.loadedBallGfx.has(BALL_ULTRA)).toBe(false);
    expect(runtime.freedBallGfx).toEqual([BALL_ULTRA]);
    expect(runtime.freedTileTags).toEqual([gBallSpriteSheets[BALL_ULTRA].tag]);
    expect(runtime.freedPaletteTags).toEqual([gBallSpritePalettes[BALL_ULTRA].tag]);
    expect(runtime.calls).toEqual([
      { fn: 'FreeSpriteTilesByTag', args: [gBallSpriteSheets[BALL_ULTRA].tag] },
      { fn: 'FreeSpritePaletteByTag', args: [gBallSpritePalettes[BALL_ULTRA].tag] }
    ]);
  });

  test('AnimTask_LoadBallGfx and AnimTask_FreeBallGfx use gLastUsedItem before destroying visual task', () => {
    const loadRuntime = createBattleAnimSpecialRuntime({
      lastUsedItem: ITEM_PREMIER_BALL,
      tasks: [createRuntimeTask()]
    });
    AnimTask_LoadBallGfx(loadRuntime, 0);
    expect(loadRuntime.loadedBallGfx.has(BALL_PREMIER)).toBe(true);
    expect(loadRuntime.destroyedVisualTasks).toEqual([0]);

    const freeRuntime = createBattleAnimSpecialRuntime({
      lastUsedItem: ITEM_GREAT_BALL,
      loadedTileTags: new Set([gBallSpriteSheets[BALL_GREAT].tag]),
      loadedPaletteTags: new Set([gBallSpritePalettes[BALL_GREAT].tag]),
      loadedBallGfx: new Set([BALL_GREAT]),
      tasks: [createRuntimeTask()]
    });
    AnimTask_FreeBallGfx(freeRuntime, 0);
    expect(freeRuntime.freedBallGfx).toEqual([BALL_GREAT]);
    expect(freeRuntime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_IsBallBlockedByTrainerOrDodged writes exact return arg for trainer block, ghost dodge, and default', () => {
    const cases = [
      [BALL_TRAINER_BLOCK, -1],
      [BALL_GHOST_DODGE, -2],
      [0, 0]
    ] as const;

    for (const [ballThrowCaseId, retValue] of cases) {
      const runtime = createBattleAnimSpecialRuntime({
        ballThrowCaseId,
        tasks: [createRuntimeTask()]
      });
      AnimTask_IsBallBlockedByTrainerOrDodged(runtime, 0);
      expect(runtime.battleAnimArgs[ARG_RET_ID]).toBe(retValue);
      expect(runtime.destroyedVisualTasks).toEqual([0]);
    }
  });

  test('AnimTask_SwitchOutShrinkMon preserves prepare, scale, y-offset, and hide cases', () => {
    const attackerSprite = createBallParticleSprite(4);
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      battlerSpriteIds: { 2: 4 },
      sprites: Object.assign([], { 4: attackerSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_SwitchOutShrinkMon(runtime, 0);
    expect(runtime.preparedRotScaleSprites).toEqual([{ spriteId: 4, objMode: ST_OAM_OBJ_NORMAL }]);
    expect(runtime.tasks[0].data[10]).toBe(0x100);
    expect(runtime.tasks[0].data[0]).toBe(1);

    runtime.tasks[0].data[10] = 0x2a0;
    AnimTask_SwitchOutShrinkMon(runtime, 0);
    expect(runtime.tasks[0].data[10]).toBe(0x2d0);
    expect(runtime.spriteRotScales).toContainEqual({ spriteId: 4, xScale: 0x2d0, yScale: 0x2d0, rotation: 0 });
    expect(runtime.battlerSpriteYScaleOffsets).toEqual([4]);
    expect(runtime.tasks[0].data[0]).toBe(2);

    AnimTask_SwitchOutShrinkMon(runtime, 0);
    expect(runtime.resetRotScaleSprites).toEqual([4]);
    expect(attackerSprite.invisible).toBe(true);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('GetBattlePalettesMask preserves background, battler, partner, and anim palette bits', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 1,
      battleAnimTarget: 0,
      battlerSpriteVisible: { 0: true, 1: true, 2: false, 3: true }
    });

    expect(GetBattlePalettesMask(runtime, true, true, true, true, true, true, true)).toBe(
      (0xe | (1 << 17) | (1 << 16) | (1 << 19) | (1 << 4) | (1 << 5)) >>> 0
    );
  });

  test('AnimTask_SwitchOutBallEffect launches particles and fade with party ball, then waits for child tasks inactive', () => {
    const attackerSprite = createBallParticleSprite(4, 0, 0, 6);
    attackerSprite.oam.priority = 2;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      battlerSides: { 2: B_SIDE_PLAYER },
      battlerPartyIndexes: { 2: 1 },
      playerParty: [{ pokeball: ITEM_POKE_BALL }, { pokeball: ITEM_DIVE_BALL }],
      battlerSpriteIds: { 2: 4 },
      battlerCoords: { 2: { [BATTLER_COORD_X]: 44, [BATTLER_COORD_Y]: 72 } },
      sprites: Object.assign([], { 4: attackerSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_SwitchOutBallEffect(runtime, 0);

    expect(runtime.tasks[0].data[10]).toBe(1);
    expect(runtime.tasks[0].data[11]).toBe(2);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[1]).toMatchObject({ func: 'DiveBallOpenParticleAnimation', isActive: true });
    expect(runtime.tasks[1].data[1]).toBe(44);
    expect(runtime.tasks[1].data[2]).toBe(104);
    expect(runtime.tasks[1].data[3]).toBe(2);
    expect(runtime.tasks[1].data[4]).toBe(6);
    expect(runtime.tasks[1].data[15]).toBe(BALL_DIVE);
    expect(runtime.tasks[2]).toMatchObject({ func: 'Task_FadeMon_ToBallColor', isActive: true });
    expect(runtime.tasks[2].data[1]).toBe(1);
    expect(runtime.tasks[2].data[3]).toBe(2);
    expect(runtime.tasks[2].data[15]).toBe(BALL_DIVE);

    AnimTask_SwitchOutBallEffect(runtime, 0);
    expect(runtime.destroyedVisualTasks).toEqual([]);

    runtime.tasks[1].isActive = false;
    runtime.tasks[2].isActive = false;
    AnimTask_SwitchOutBallEffect(runtime, 0);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_SwitchOutBallEffect reads enemy party pokeball for opponent-side attacker', () => {
    const attackerSprite = createBallParticleSprite(5, 0, 0, 3);
    attackerSprite.oam.priority = 1;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 3,
      battlerSides: { 3: B_SIDE_OPPONENT },
      battlerPartyIndexes: { 3: 0 },
      enemyParty: [{ pokeball: ITEM_MASTER_BALL }],
      battlerSpriteIds: { 3: 5 },
      battlerCoords: { 3: { [BATTLER_COORD_X]: 120, [BATTLER_COORD_Y]: 40 } },
      sprites: Object.assign([], { 5: attackerSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_SwitchOutBallEffect(runtime, 0);

    expect(runtime.tasks[1].func).toBe('MasterBallOpenParticleAnimation');
    expect(runtime.tasks[1].data[15]).toBe(BALL_MASTER);
    expect(runtime.tasks[2].data[15]).toBe(BALL_MASTER);
  });

  test('AnimTask_ThrowBall creates ball sprite, stores target coords, records wild mon invisibility, and waits', () => {
    const targetSprite = createBallParticleSprite(4);
    targetSprite.invisible = true;
    const runtime = createBattleAnimSpecialRuntime({
      lastUsedItem: ITEM_ULTRA_BALL,
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 4 },
      battlerCoords: { 1: { [BATTLER_COORD_X]: 180, [BATTLER_COORD_Y]: 64 } },
      sprites: Object.assign([], { 4: targetSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_ThrowBall(runtime, 0);

    const sprite = runtime.sprites[0]!;
    expect(sprite.template).toBe('gBallSpriteTemplates[3]');
    expect(sprite.x).toBe(32);
    expect(sprite.y).toBe(80);
    expect(sprite.subpriority).toBe(29);
    expect(sprite.data[0]).toBe(34);
    expect(sprite.data[1]).toBe(180);
    expect(sprite.data[2]).toBe(48);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_Init');
    expect(runtime.wildMonInvisible).toBe(true);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].func).toBe('AnimTask_ThrowBall_WaitAnimObjComplete');
    expect(runtime.calls).toContainEqual({ fn: 'CreateSprite', args: [gBallSpriteTemplates[BALL_ULTRA], 32, 80, 29, 0] });
  });

  test('AnimTask_ThrowBall_WaitAnimObjComplete destroys visual task only when sprite data0 is 0xFFFF as u16', () => {
    const sprite = createBallParticleSprite(3);
    const runtime = createBattleAnimSpecialRuntime({
      sprites: Object.assign([], { 3: sprite }),
      tasks: [createRuntimeTask({ 0: 3 })]
    });

    AnimTask_ThrowBall_WaitAnimObjComplete(runtime, 0);
    expect(runtime.destroyedVisualTasks).toEqual([]);

    sprite.data[0] = -1;
    AnimTask_ThrowBall_WaitAnimObjComplete(runtime, 0);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_ThrowBallSpecial creates the player throw ball with female coordinates and opponent subpriority', () => {
    const playerSprite = createBallParticleSprite(6);
    const opponentSprite = createBallParticleSprite(7);
    opponentSprite.subpriority = 22;
    const targetSprite = createBallParticleSprite(8);
    const runtime = createBattleAnimSpecialRuntime({
      playerGender: FEMALE,
      lastUsedItem: ITEM_GREAT_BALL,
      battleAnimTarget: 1,
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2, [B_POSITION_OPPONENT_LEFT]: 3 },
      battlerSpriteIds: { 1: 8, 2: 6, 3: 7 },
      battlerCoords: { 1: { [BATTLER_COORD_X]: 180, [BATTLER_COORD_Y]: 64 } },
      sprites: Object.assign([], { 6: playerSprite, 7: opponentSprite, 8: targetSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_ThrowBallSpecial(runtime, 0);

    const ballSprite = runtime.sprites[0]!;
    expect(ballSprite.template).toBe('gBallSpriteTemplates[1]');
    expect(ballSprite.x).toBe(23 | 32);
    expect(ballSprite.y).toBe(13 | 80);
    expect(ballSprite.subpriority).toBe(23);
    expect(ballSprite.data[0]).toBe(34);
    expect(ballSprite.data[1]).toBe(180);
    expect(ballSprite.data[2]).toBe(48);
    expect(ballSprite.callback).toBe('SpriteCallbackDummy');
    expect(playerSprite.callback).toBe('SpriteCB_PlayerThrowInit');
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].func).toBe('AnimTask_ThrowBallSpecial_PlaySfx');
    expect(runtime.calls).toContainEqual({ fn: 'CreateSprite', args: [gBallSpriteTemplates[BALL_GREAT], 55, 93, 23, 0] });
  });

  test('AnimTask_ThrowBallSpecial uses old man tutorial coordinates over player gender', () => {
    const playerSprite = createBallParticleSprite(6);
    const opponentSprite = createBallParticleSprite(7);
    const runtime = createBattleAnimSpecialRuntime({
      battleTypeFlags: BATTLE_TYPE_OLD_MAN_TUTORIAL,
      playerGender: FEMALE,
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2, [B_POSITION_OPPONENT_LEFT]: 3 },
      battlerSpriteIds: { 2: 6, 3: 7 },
      sprites: Object.assign([], { 6: playerSprite, 7: opponentSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_ThrowBallSpecial(runtime, 0);

    expect(runtime.sprites[0]!.x).toBe(28 | 32);
    expect(runtime.sprites[0]!.y).toBe(11 | 80);
  });

  test('AnimTask_ThrowBallSpecial_PlaySfx waits for player throw frame before starting ball flight', () => {
    const playerSprite = createBallParticleSprite(6);
    const ballSprite = createBallParticleSprite(0);
    const runtime = createBattleAnimSpecialRuntime({
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2 },
      battlerSpriteIds: { 2: 6 },
      sprites: Object.assign([], { 0: ballSprite, 6: playerSprite }),
      tasks: [createRuntimeTask({ 0: 0 })]
    });

    AnimTask_ThrowBallSpecial_PlaySfx(runtime, 0);

    expect(runtime.pannedSounds).toEqual([]);
    expect(ballSprite.callback).toBeNull();
    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0].func).toBe('testTask');

    playerSprite.animCmdIndex = 1;
    AnimTask_ThrowBallSpecial_PlaySfx(runtime, 0);

    expect(runtime.pannedSounds).toEqual([{ id: SE_BALL_THROW, pan: 0 }]);
    expect(ballSprite.callback).toBe('SpriteCB_ThrowBall_Init');
    expect(runtime.tasks[1]).toMatchObject({ id: 1, func: 'AnimTask_ThrowBallSpecial_ResetPlayerSprite', priority: 10 });
    expect(runtime.tasks[0].func).toBe('AnimTask_ThrowBall_WaitAnimObjComplete');
  });

  test('AnimTask_ThrowBallSpecial_ResetPlayerSprite restarts player sprite only after anim ends', () => {
    const playerSprite = createBallParticleSprite(6);
    playerSprite.animNum = 4;
    const runtime = createBattleAnimSpecialRuntime({
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2 },
      battlerSpriteIds: { 2: 6 },
      sprites: Object.assign([], { 6: playerSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_ThrowBallSpecial_ResetPlayerSprite(runtime, 0);
    expect(playerSprite.animNum).toBe(4);
    expect(runtime.destroyedTasks).toEqual([]);

    playerSprite.animEnded = true;
    AnimTask_ThrowBallSpecial_ResetPlayerSprite(runtime, 0);

    expect(playerSprite.animNum).toBe(0);
    expect(runtime.destroyedTasks).toEqual([0]);
    expect(runtime.calls).toContainEqual({ fn: 'StartSpriteAnim', args: [6, 0] });
  });

  test('SpriteCB_ThrowBall_Init preserves destination fields and initializes arc translation to flight callback', () => {
    const sprite = createBallParticleSprite(3, 32, 80);
    sprite.data[0] = 34;
    sprite.data[1] = 180;
    sprite.data[2] = 48;

    SpriteCB_ThrowBall_Init(createBattleAnimSpecialRuntime(), sprite);

    expect(sprite.data[0]).toBe(34);
    expect(sprite.data[1]).toBe(Math.trunc((Math.abs(180 - 32) << 8) / 34) & ~1);
    expect(sprite.data[2]).toBe(Math.trunc((Math.abs(48 - 80) << 8) / 34) | 1);
    expect(sprite.data[3]).toBe(0);
    expect(sprite.data[4]).toBe(0);
    expect(sprite.data[5]).toBe(-40);
    expect(sprite.data[6]).toBe(Math.trunc(0x8000 / 34));
    expect(sprite.data[7]).toBe(0);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_ArcFlight');
  });

  test('SpriteCB_ThrowBall_ArcFlight branches to trainer block or ghost dodge when arc finishes', () => {
    const trainerBlock = createBallParticleSprite(3);
    trainerBlock.data[0] = 0;
    SpriteCB_ThrowBall_ArcFlight(createBattleAnimSpecialRuntime({ ballThrowCaseId: BALL_TRAINER_BLOCK }), trainerBlock);
    expect(trainerBlock.callback).toBe('TrainerBallBlock');

    const ghostDodge = createBallParticleSprite(4);
    ghostDodge.data[0] = 0;
    SpriteCB_ThrowBall_ArcFlight(createBattleAnimSpecialRuntime({ ballThrowCaseId: BALL_GHOST_DODGE }), ghostDodge);
    expect(ghostDodge.callback).toBe('GhostBallDodge');
  });

  test('SpriteCB_ThrowBall_ArcFlight opens ball, resets motion data, and launches particle/fade tasks for normal throws', () => {
    const sprite = createBallParticleSprite(3, 32, 80);
    sprite.data = [0, 11, 22, 33, 44, 55, 66, 77];
    sprite.x2 = 5;
    sprite.y2 = -7;
    const runtime = createBattleAnimSpecialRuntime({
      lastUsedItem: ITEM_REPEAT_BALL,
      battleAnimTarget: 1
    });

    SpriteCB_ThrowBall_ArcFlight(runtime, sprite);

    expect(sprite.animNum).toBe(1);
    expect(sprite.x).toBe(37);
    expect(sprite.y).toBe(73);
    expect(sprite.x2).toBe(0);
    expect(sprite.y2).toBe(0);
    expect(sprite.data).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_TenFrameDelay');
    expect(runtime.tasks[0].func).toBe('RepeatBallOpenParticleAnimation');
    expect(runtime.tasks[0].data[1]).toBe(37);
    expect(runtime.tasks[0].data[2]).toBe(68);
    expect(runtime.tasks[1].func).toBe('Task_FadeMon_ToBallColor');
    expect(runtime.tasks[1].data[15]).toBe(BALL_REPEAT);
    expect(runtime.calls).toContainEqual({ fn: 'StartSpriteAnim', args: [3, 1] });
  });

  test('SpriteCB_ThrowBall_TenFrameDelay waits ten frames, creates TaskDummy, and clears target data1', () => {
    const sprite = createBallParticleSprite(3);
    const targetSprite = createBallParticleSprite(5);
    targetSprite.data[1] = 99;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: targetSprite })
    });

    for (let i = 0; i < 9; i += 1) {
      SpriteCB_ThrowBall_TenFrameDelay(runtime, sprite);
    }
    expect(sprite.callback).toBeNull();
    expect(runtime.tasks).toHaveLength(0);
    expect(targetSprite.data[1]).toBe(99);

    SpriteCB_ThrowBall_TenFrameDelay(runtime, sprite);
    expect(sprite.data[5]).toBe(0);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_ShrinkMon');
    expect(runtime.tasks[0]).toMatchObject({ id: 0, func: 'TaskDummy', priority: 50 });
    expect(targetSprite.data[1]).toBe(0);
  });

  test('SpriteCB_ThrowBall_ShrinkMon case 0 prepares target rot-scale and stores shrink globals', () => {
    const ballSprite = createBallParticleSprite(3, 40, 70);
    ballSprite.y2 = -5;
    ballSprite.data[5] = 0;
    const targetSprite = createBallParticleSprite(5, 120, 100);
    targetSprite.y2 = 8;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: targetSprite }),
      tasks: [createRuntimeTask()]
    });

    SpriteCB_ThrowBall_ShrinkMon(runtime, ballSprite);

    expect(runtime.preparedRotScaleSprites).toEqual([{ spriteId: 5, objMode: ST_OAM_OBJ_NORMAL }]);
    expect(targetSprite.affineAnimPaused).toBe(true);
    expect(runtime.tasks[0].data[1]).toBe(1);
    expect(runtime.tasks[0].data[10]).toBe(256);
    expect(runtime.monShrinkDuration).toBe(28);
    expect(runtime.monShrinkDistance).toBe(43);
    expect(runtime.monShrinkDelta).toBe(Math.trunc((43 * 256) / 28));
    expect(runtime.tasks[0].data[2]).toBe(runtime.monShrinkDelta);
    expect(runtime.tasks[0].data[0]).toBe(1);
  });

  test('SpriteCB_ThrowBall_ShrinkMon case 1 scales target and advances y2 until threshold', () => {
    const ballSprite = createBallParticleSprite(3);
    ballSprite.data[5] = 0;
    const targetSprite = createBallParticleSprite(5);
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: targetSprite }),
      tasks: [createRuntimeTask({ 0: 1, 2: 100, 3: 0, 10: 0x460 })]
    });

    SpriteCB_ThrowBall_ShrinkMon(runtime, ballSprite);

    expect(runtime.tasks[0].data[1]).toBe(1);
    expect(runtime.tasks[0].data[10]).toBe(0x480);
    expect(runtime.spriteRotScales).toEqual([{ spriteId: 5, xScale: 0x480, yScale: 0x480, rotation: 0 }]);
    expect(runtime.tasks[0].data[3]).toBe(100);
    expect(targetSprite.y2).toBe((-100) >> 8);
    expect(runtime.tasks[0].data[0]).toBe(2);
  });

  test('SpriteCB_ThrowBall_ShrinkMon case 2 resets rot-scale and hides target', () => {
    const ballSprite = createBallParticleSprite(3);
    ballSprite.data[5] = 0;
    const targetSprite = createBallParticleSprite(5);
    targetSprite.affineAnimPaused = true;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: targetSprite }),
      tasks: [createRuntimeTask({ 0: 2 })]
    });

    SpriteCB_ThrowBall_ShrinkMon(runtime, ballSprite);

    expect(runtime.resetRotScaleSprites).toEqual([5]);
    expect(targetSprite.affineAnimPaused).toBe(false);
    expect(targetSprite.invisible).toBe(true);
    expect(runtime.tasks[0].data[0]).toBe(3);
  });

  test('SpriteCB_ThrowBall_ShrinkMon default waits past ten ticks, destroys task, and starts fall anim', () => {
    const ballSprite = createBallParticleSprite(3);
    ballSprite.data[5] = 0;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: createBallParticleSprite(5) }),
      tasks: [createRuntimeTask({ 0: 3, 1: 9 })]
    });

    SpriteCB_ThrowBall_ShrinkMon(runtime, ballSprite);
    expect(ballSprite.callback).toBeNull();
    expect(runtime.sounds).toEqual([]);

    SpriteCB_ThrowBall_ShrinkMon(runtime, ballSprite);
    expect(runtime.sounds).toEqual([SE_BALL_TRADE]);
    expect(runtime.destroyedTasks).toEqual([0]);
    expect(ballSprite.animNum).toBe(2);
    expect(ballSprite.data[5]).toBe(0);
    expect(ballSprite.callback).toBe('SpriteCB_ThrowBall_InitialFall');
  });

  test('SpriteCB_ThrowBall_InitialFall waits for anim end before setting bounce state', () => {
    const sprite = createBallParticleSprite(3, 40, 70);

    SpriteCB_ThrowBall_InitialFall(createBattleAnimSpecialRuntime(), sprite);
    expect(sprite.callback).toBeNull();

    sprite.animEnded = true;
    SpriteCB_ThrowBall_InitialFall(createBattleAnimSpecialRuntime(), sprite);
    expect(sprite.data[3]).toBe(0);
    expect(sprite.data[4]).toBe(40);
    expect(sprite.data[5]).toBe(0);
    expect(sprite.y).toBe(110);
    expect(sprite.y2).toBe(-40);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_Bounce');
  });

  test('SpriteCB_ThrowBall_Bounce plays each bounce sound and toggles direction data', () => {
    const sprite = createBallParticleSprite(3);
    sprite.data[3] = 0;
    sprite.data[4] = 40;
    sprite.data[5] = 64;
    const runtime = createBattleAnimSpecialRuntime();

    SpriteCB_ThrowBall_Bounce(runtime, sprite);
    expect(sprite.data[4]).toBe(30);
    expect(sprite.data[3]).toBe(257);
    expect(runtime.sounds).toEqual([SE_BALL_BOUNCE_1]);

    sprite.data[5] = 0;
    SpriteCB_ThrowBall_Bounce(runtime, sprite);
    expect(sprite.data[5]).toBe(0);
    expect(sprite.data[3]).toBe(256);

    for (const [data3, expectedSound] of [[256, SE_BALL_BOUNCE_2], [512, SE_BALL_BOUNCE_3], [768, SE_BALL_BOUNCE_4]] as const) {
      sprite.data[3] = data3;
      sprite.data[5] = 64;
      SpriteCB_ThrowBall_Bounce(runtime, sprite);
      expect(runtime.sounds.at(-1)).toBe(expectedSound);
    }
  });

  test('SpriteCB_ThrowBall_Bounce sends final bounce to breakout or shake based on ball throw case', () => {
    const noShakesSprite = createBallParticleSprite(3, 0, 100);
    noShakesSprite.data[3] = 768;
    noShakesSprite.data[4] = 10;
    noShakesSprite.data[5] = 64;
    SpriteCB_ThrowBall_Bounce(createBattleAnimSpecialRuntime({ ballThrowCaseId: BALL_NO_SHAKES }), noShakesSprite);
    expect(noShakesSprite.data[3]).toBe(0);
    expect(noShakesSprite.y).toBe(100);
    expect(noShakesSprite.y2).toBe(0);
    expect(noShakesSprite.data[5]).toBe(0);
    expect(noShakesSprite.callback).toBe('SpriteCB_ThrowBall_DelayThenBreakOut');

    const shakeSprite = createBallParticleSprite(4, 0, 100);
    shakeSprite.data[3] = 768;
    shakeSprite.data[4] = 10;
    shakeSprite.data[5] = 64;
    SpriteCB_ThrowBall_Bounce(createBattleAnimSpecialRuntime({ ballThrowCaseId: 1 }), shakeSprite);
    expect(shakeSprite.callback).toBe('SpriteCB_ThrowBall_InitShake');
    expect(shakeSprite.data[4]).toBe(1);
    expect(shakeSprite.data[5]).toBe(0);
  });

  test('SpriteCB_ThrowBall_InitShake waits thirty-one frames before starting shake affine anim', () => {
    const sprite = createBallParticleSprite(3);
    const runtime = createBattleAnimSpecialRuntime({ ballSubpx: 99 });

    for (let i = 0; i < 30; i += 1) {
      SpriteCB_ThrowBall_InitShake(runtime, sprite);
    }
    expect(sprite.data[3]).toBe(30);
    expect(sprite.callback).toBeNull();
    expect(runtime.sounds).toEqual([]);

    SpriteCB_ThrowBall_InitShake(runtime, sprite);
    expect(sprite.data[3]).toBe(0);
    expect(sprite.affineAnimPaused).toBe(true);
    expect(sprite.affineAnimNum).toBe(1);
    expect(runtime.ballSubpx).toBe(0);
    expect(sprite.callback).toBe('SpriteCB_ThrowBall_DoShake');
    expect(runtime.sounds).toEqual([SE_BALL]);
    expect(runtime.spriteAffineAnims).toEqual([{ spriteId: 3, animNum: 1, kind: 'start' }]);
  });

  test('SpriteCB_ThrowBall_DoShake case 0 uses ballSubpx accumulator and advances to case one after eight ticks', () => {
    const sprite = createBallParticleSprite(3);
    sprite.data[3] = 0;
    sprite.data[4] = 1;
    sprite.data[5] = 0;
    const runtime = createBattleAnimSpecialRuntime({ ballSubpx: 0x100 });

    SpriteCB_ThrowBall_DoShake(runtime, sprite);
    expect(sprite.x2).toBe(1);
    expect(runtime.ballSubpx).toBe(0);
    expect(sprite.data[5]).toBe(1);
    expect(sprite.affineAnimPaused).toBe(false);

    sprite.data[5] = 7;
    runtime.ballSubpx = 0;
    SpriteCB_ThrowBall_DoShake(runtime, sprite);
    expect(runtime.ballSubpx).toBe(0);
    expect(sprite.data[3]).toBe(1);
    expect(sprite.data[5]).toBe(0);
  });

  test('SpriteCB_ThrowBall_DoShake cases 1 through 4 preserve flips, affine changes, and fallthrough', () => {
    const case1 = createBallParticleSprite(3);
    case1.data[3] = 1;
    case1.data[4] = 1;
    SpriteCB_ThrowBall_DoShake(createBattleAnimSpecialRuntime(), case1);
    expect(case1.data[3]).toBe(2);
    expect(case1.data[4]).toBe(-1);
    expect(case1.affineAnimNum).toBe(2);

    const case2 = createBallParticleSprite(4);
    case2.data[3] = 2;
    case2.data[4] = -1;
    case2.data[5] = 12;
    const runtime2 = createBattleAnimSpecialRuntime({ ballSubpx: 0 });
    SpriteCB_ThrowBall_DoShake(runtime2, case2);
    expect(case2.data[3]).toBe(3);
    expect(case2.data[5]).toBe(0);
    expect(runtime2.ballSubpx).toBe(0);

    const case3 = createBallParticleSprite(5);
    case3.data[3] = 3;
    case3.data[4] = -1;
    case3.data[5] = 0;
    const runtime3 = createBattleAnimSpecialRuntime({ ballSubpx: 0x100 });
    SpriteCB_ThrowBall_DoShake(runtime3, case3);
    expect(case3.data[3]).toBe(4);
    expect(case3.data[4]).toBe(1);
    expect(case3.x2).toBe(1);
    expect(case3.data[5]).toBe(1);
    expect(case3.affineAnimNum).toBe(1);

    case3.data[5] = 4;
    SpriteCB_ThrowBall_DoShake(runtime3, case3);
    expect(case3.data[3]).toBe(5);
    expect(case3.data[5]).toBe(0);
    expect(case3.data[4]).toBe(-1);
  });

  test('SpriteCB_ThrowBall_DoShake case 5 chooses breakout, click, or another shake cycle', () => {
    const breakOut = createBallParticleSprite(3);
    breakOut.data[3] = 0x105;
    SpriteCB_ThrowBall_DoShake(createBattleAnimSpecialRuntime({ ballThrowCaseId: 2 }), breakOut);
    expect(breakOut.affineAnimPaused).toBe(true);
    expect(breakOut.callback).toBe('SpriteCB_ThrowBall_DelayThenBreakOut');

    const click = createBallParticleSprite(4);
    click.data[3] = 0x205;
    SpriteCB_ThrowBall_DoShake(createBattleAnimSpecialRuntime({ ballThrowCaseId: BALL_3_SHAKES_SUCCESS }), click);
    expect(click.callback).toBe('SpriteCB_ThrowBall_InitClick');
    expect(click.affineAnimPaused).toBe(true);

    const nextCycle = createBallParticleSprite(5);
    nextCycle.data[3] = 0x005;
    SpriteCB_ThrowBall_DoShake(createBattleAnimSpecialRuntime({ ballThrowCaseId: 3 }), nextCycle);
    expect(nextCycle.data[3]).toBe(0x106);
    expect(nextCycle.affineAnimPaused).toBe(true);
  });

  test('SpriteCB_ThrowBall_DoShake default restarts affine anim and sound on frame thirty-one', () => {
    const sprite = createBallParticleSprite(3);
    sprite.data[3] = 6;
    sprite.data[4] = -1;
    sprite.data[5] = 30;
    const runtime = createBattleAnimSpecialRuntime();

    SpriteCB_ThrowBall_DoShake(runtime, sprite);

    expect(sprite.data[5]).toBe(0);
    expect(sprite.data[3]).toBe(0);
    expect(runtime.spriteAffineAnims).toEqual([
      { spriteId: 3, animNum: 3, kind: 'start' },
      { spriteId: 3, animNum: 2, kind: 'start' }
    ]);
    expect(runtime.sounds).toEqual([SE_BALL]);
  });

  test('SpriteCB_ThrowBall_DelayThenBreakOut and InitClick preserve their exact data transitions', () => {
    const breakOut = createBallParticleSprite(3);
    for (let i = 0; i < 30; i += 1) {
      SpriteCB_ThrowBall_DelayThenBreakOut(createBattleAnimSpecialRuntime(), breakOut);
    }
    expect(breakOut.data[5]).toBe(30);
    expect(breakOut.callback).toBeNull();

    SpriteCB_ThrowBall_DelayThenBreakOut(createBattleAnimSpecialRuntime(), breakOut);
    expect(breakOut.data[5]).toBe(0);
    expect(breakOut.callback).toBe('SpriteCB_ThrowBall_BeginBreakOut');

    const click = createBallParticleSprite(4);
    click.data[3] = 9;
    click.data[4] = 9;
    click.data[5] = 9;
    SpriteCB_ThrowBall_InitClick(createBattleAnimSpecialRuntime(), click);
    expect(click.animPaused).toBe(true);
    expect(click.callback).toBe('SpriteCB_ThrowBall_DoClick');
    expect(click.data[3]).toBe(0);
    expect(click.data[4]).toBe(0);
    expect(click.data[5]).toBe(0);
  });

  test('SpriteCB_ThrowBall_DoClick preserves frame thresholds for click, fade, caught intro, and target destroy', () => {
    const ball = createBallParticleSprite(3);
    ball.callback = 'SpriteCB_ThrowBall_DoClick';
    ball.oam.paletteNum = 2;
    ball.subpriority = 4;
    ball.data[4] = 39;
    const target = createBallParticleSprite(5);
    target.oam.matrixNum = 7;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: target })
    });

    SpriteCB_ThrowBall_DoClick(runtime, ball);
    expect(ball.data[4]).toBe(40);
    expect(runtime.sounds).toContain(SE_BALL_CLICK);
    expect(runtime.blendedPalettes).toContainEqual({ offset: (0x10000 << 2) >>> 0, count: 0, coefficient: 6, color: RGB_BLACK });
    expect(runtime.sprites.filter(Boolean).slice(1)).toHaveLength(3);

    ball.data[4] = 59;
    SpriteCB_ThrowBall_DoClick(runtime, ball);
    expect(runtime.paletteFades.at(-1)).toEqual({
      selectedPalettes: (0x10000 << 2) >>> 0,
      delay: 2,
      startY: 6,
      targetY: 0,
      color: RGB_BLACK
    });

    ball.data[4] = 94;
    SpriteCB_ThrowBall_DoClick(runtime, ball);
    expect(runtime.doingBattleAnim).toBe(false);
    expect(runtime.healthboxPriorityUpdates).toEqual([1]);
    expect(runtime.allMusicStopped).toBe(1);
    expect(runtime.sounds.at(-1)).toBe(MUS_CAUGHT_INTRO);

    ball.data[4] = 314;
    SpriteCB_ThrowBall_DoClick(runtime, ball);
    expect(runtime.freedOamMatrices).toContain(7);
    expect(target.destroyed).toBe(true);
    expect(runtime.destroyedTargetSprites).toEqual([5]);
    expect(ball.data[0]).toBe(0);
    expect(ball.callback).toBe('SpriteCB_ThrowBall_FinishClick');
  });

  test('CreateStarsWhenBallClicks creates three master-ball particles with exact capture star arc data', () => {
    const ball = createBallParticleSprite(3, 80, 64, 0);
    const runtime = createBattleAnimSpecialRuntime();

    CreateStarsWhenBallClicks(runtime, ball);

    expect(ball.subpriority).toBe(1);
    const stars = runtime.sprites.filter((sprite) => sprite?.callback === 'SpriteCB_BallCaptureSuccessStar');
    expect(stars).toHaveLength(3);
    for (let i = 0; i < 3; i += 1) {
      const star = stars[i]!;
      expect(star.subpriority).toBe(0);
      expect(star.animNum).toBe(1);
      expect(star.data[0]).toBe(24);
      expect(star.data[5]).toBe(sCaptureStar[i].amplitude);
      expect(star.data[6]).toBe(Math.trunc(0x8000 / 24));
      expect(star.callback).toBe('SpriteCB_BallCaptureSuccessStar');
    }
  });

  test('SpriteCB_BallCaptureSuccessStar toggles invisibility and destroys when arc completes', () => {
    const star = createBallParticleSprite(6);
    star.data[0] = 1;
    star.data[1] = 0;
    star.data[2] = 0;
    star.data[3] = 0;
    star.data[4] = 0;
    star.data[5] = 0;
    star.data[6] = 0x8000;
    const runtime = createBattleAnimSpecialRuntime();

    SpriteCB_BallCaptureSuccessStar(runtime, star);
    expect(star.invisible).toBe(true);
    expect(star.destroyed).toBe(false);

    SpriteCB_BallCaptureSuccessStar(runtime, star);
    expect(star.invisible).toBe(false);
    expect(star.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([6]);
  });

  test('SpriteCB_ThrowBall_FinishClick preserves fade cases and signal-end transition', () => {
    const sprite = createBallParticleSprite(3);
    sprite.oam.paletteNum = 1;
    const runtime = createBattleAnimSpecialRuntime({ lastUsedItem: ITEM_ULTRA_BALL });

    SpriteCB_ThrowBall_FinishClick(runtime, sprite);
    expect(sprite.oam.objMode).toBe(ST_OAM_OBJ_BLEND);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(16, 0));
    expect(runtime.paletteFades.at(-1)).toEqual({ selectedPalettes: 1 << 16, delay: 0, startY: 0, targetY: 16, color: RGB_WHITE });
    expect(sprite.data[0]).toBe(1);

    sprite.data[1] = 1;
    sprite.data[2] = 15;
    SpriteCB_ThrowBall_FinishClick(runtime, sprite);
    expect(sprite.data[1]).toBe(0);
    expect(sprite.data[2]).toBe(16);
    expect(sprite.data[0]).toBe(2);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(0, 16));

    SpriteCB_ThrowBall_FinishClick(runtime, sprite);
    expect(sprite.invisible).toBe(true);
    expect(sprite.data[0]).toBe(3);

    runtime.paletteFadeActive = false;
    SpriteCB_ThrowBall_FinishClick(runtime, sprite);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(sprite.data[0]).toBe(0);
    expect(sprite.callback).toBe('BattleAnimObj_SignalEnd');
  });

  test('BattleAnimObj_SignalEnd first signals -1, then frees matrix and destroys sprite', () => {
    const sprite = createBallParticleSprite(3);
    const runtime = createBattleAnimSpecialRuntime();

    BattleAnimObj_SignalEnd(runtime, sprite);
    expect(sprite.data[0]).toBe(-1);
    expect(sprite.destroyed).toBe(false);

    BattleAnimObj_SignalEnd(runtime, sprite);
    expect(sprite.oamMatrixFreed).toBe(true);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([3]);
  });

  test('SpriteCB_ThrowBall_BeginBreakOut opens ball, unfades target, and starts target emerge anim', () => {
    const ball = createBallParticleSprite(3, 70, 90);
    const target = createBallParticleSprite(5);
    target.invisible = true;
    const runtime = createBattleAnimSpecialRuntime({
      lastUsedItem: ITEM_TIMER_BALL,
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      sprites: Object.assign([], { 5: target })
    });

    SpriteCB_ThrowBall_BeginBreakOut(runtime, ball);

    expect(ball.animNum).toBe(1);
    expect(ball.affineAnimNum).toBe(0);
    expect(ball.callback).toBe('SpriteCB_ThrowBall_RunBreakOut');
    expect(runtime.tasks[0].func).toBe('TimerBallOpenParticleAnimation');
    expect(runtime.tasks[0].data[1]).toBe(70);
    expect(runtime.tasks[0].data[2]).toBe(85);
    expect(runtime.tasks[1].func).toBe('Task_FadeMon_ToNormal');
    expect(runtime.tasks[1].data[15]).toBe(BALL_TIMER);
    expect(target.invisible).toBe(false);
    expect(target.affineAnimNum).toBe(1);
    expect(runtime.animatedSprites).toEqual([5]);
    expect(target.data[1]).toBe(0x1000);
  });

  test('SpriteCB_ThrowBall_RunBreakOut bobs target until affine anim ends, then restores invisibility and signals end', () => {
    const ball = createBallParticleSprite(3);
    const target = createBallParticleSprite(5);
    target.data[1] = 0x1000;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimTarget: 1,
      battlerSpriteIds: { 1: 5 },
      wildMonInvisible: true,
      sprites: Object.assign([], { 5: target })
    });

    SpriteCB_ThrowBall_RunBreakOut(runtime, ball);
    expect(target.data[1]).toBe(0x1000 - 288);
    expect(target.y2).toBe((0x1000 - 288) >> 8);
    expect(ball.callback).toBeNull();

    ball.animEnded = true;
    target.affineAnimEnded = true;
    SpriteCB_ThrowBall_RunBreakOut(runtime, ball);
    expect(ball.invisible).toBe(true);
    expect(target.affineAnimNum).toBe(0);
    expect(target.y2).toBe(0);
    expect(target.invisible).toBe(true);
    expect(ball.data[0]).toBe(0);
    expect(ball.callback).toBe('BattleAnimObj_SignalEnd');
    expect(runtime.doingBattleAnim).toBe(false);
    expect(runtime.healthboxPriorityUpdates).toEqual([1]);
  });

  test('TrainerBallBlock settles primary coords, clears data, and TrainerBallBlock2 flies off until signal end', () => {
    const sprite = createBallParticleSprite(3, 20, 150);
    sprite.x2 = -5;
    sprite.y2 = 7;
    sprite.data = [1, 2, 3, 4, 5, 6, 7, 8];
    const runtime = createBattleAnimSpecialRuntime();

    TrainerBallBlock(runtime, sprite);
    expect(sprite.x).toBe(15);
    expect(sprite.y).toBe(157);
    expect(sprite.x2).toBe(0);
    expect(sprite.y2).toBe(0);
    expect(sprite.data.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(sprite.callback).toBe('TrainerBallBlock2');

    TrainerBallBlock2(runtime, sprite);
    expect(sprite.x2).toBe(-6);
    expect(sprite.y2).toBe(8);
    expect(sprite.data[0]).toBe(0);
    expect(sprite.data[1]).toBe(0x80);
    expect(sprite.callback).toBe('BattleAnimObj_SignalEnd');
    expect(runtime.doingBattleAnim).toBe(false);
    expect(runtime.healthboxPriorityUpdates).toEqual([1]);
  });

  test('GhostBallDodge initializes vertical arc and GhostBallDodge2 waits until high enough or complete', () => {
    const sprite = createBallParticleSprite(3, 100, 40);
    sprite.x2 = 4;
    sprite.y2 = 5;
    const runtime = createBattleAnimSpecialRuntime();

    GhostBallDodge(runtime, sprite);
    expect(sprite.x).toBe(104);
    expect(sprite.y).toBe(45);
    expect(sprite.data[0]).toBe(0x21);
    expect(sprite.data[1]).toBe(61);
    expect(sprite.data[2]).toBe(744);
    expect(sprite.data[3]).toBe(61);
    expect(sprite.data[4]).toBe(744);
    expect(sprite.data[5]).toBe(0x20);
    expect(sprite.callback).toBe('GhostBallDodge2');

    sprite.y = 40;
    sprite.y2 = 0;
    sprite.data[0] = 1;
    sprite.data[1] = 0;
    sprite.data[2] = 0;
    sprite.data[3] = 0;
    sprite.data[4] = 0;
    sprite.data[5] = 0;
    sprite.data[6] = 0;
    GhostBallDodge2(runtime, sprite);
    expect(sprite.callback).toBe('GhostBallDodge2');

    sprite.y = 66;
    GhostBallDodge2(runtime, sprite);
    expect(sprite.data[0]).toBe(0);
    expect(sprite.callback).toBe('BattleAnimObj_SignalEnd');
    expect(runtime.doingBattleAnim).toBe(false);
    expect(runtime.healthboxPriorityUpdates).toEqual([1]);
  });

  test('AnimateBallOpenParticles creates task data, loads gfx, plays sound, and returns task id', () => {
    const runtime = createBattleAnimSpecialRuntime();
    const taskId = AnimateBallOpenParticles(runtime, 10, 20, 3, 4, BALL_TIMER);

    expect(taskId).toBe(0);
    expect(runtime.tasks[0]).toMatchObject({
      id: 0,
      func: 'TimerBallOpenParticleAnimation',
      priority: 5
    });
    expect(runtime.tasks[0].data[1]).toBe(10);
    expect(runtime.tasks[0].data[2]).toBe(20);
    expect(runtime.tasks[0].data[3]).toBe(3);
    expect(runtime.tasks[0].data[4]).toBe(4);
    expect(runtime.tasks[0].data[15]).toBe(BALL_TIMER);
    expect(runtime.sounds).toEqual([SE_BALL_OPEN]);
    expect(runtime.calls.at(-2)).toEqual({ fn: 'CreateTask', args: ['TimerBallOpenParticleAnimation', 5] });
    expect(runtime.calls.at(-1)).toEqual({ fn: 'PlaySE', args: [SE_BALL_OPEN] });
  });

  test('IncrementBattleParticleCounter only increments while in battle', () => {
    const battleRuntime = createBattleAnimSpecialRuntime({ inBattle: true });
    const fieldRuntime = createBattleAnimSpecialRuntime({ inBattle: false });

    IncrementBattleParticleCounter(battleRuntime);
    IncrementBattleParticleCounter(fieldRuntime);

    expect(battleRuntime.numBallParticles).toBe(1);
    expect(fieldRuntime.numBallParticles).toBe(0);
  });

  test('PokeBallOpenParticleAnimation creates one particle per tick and wraps the angle after eight', () => {
    const runtime = createBattleAnimSpecialRuntime();
    runtime.tasks.push(createTask(BALL_POKE, { 0: 7 }));

    PokeBallOpenParticleAnimation(runtime, 0);
    PokeBallOpenParticleAnimation(runtime, 0);

    expect(runtime.tasks[0].data[0]).toBe(9);
    expect(runtime.numBallParticles).toBe(2);
    expect(runtime.sprites[0]).toMatchObject({
      x: 40,
      y: 56,
      subpriority: 9,
      animNum: sBallParticleAnimNums[BALL_POKE],
      callback: 'PokeBallOpenParticleAnimation_Step1',
      oam: { priority: 2 }
    });
    expect(runtime.sprites[0]!.data[0]).toBe(224);
    expect(runtime.sprites[1]!.data[0]).toBe(0);
  });

  test('PokeBallOpenParticleAnimation destroys task at the sixteenth particle and flags resources outside battle', () => {
    const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
    runtime.tasks.push(createTask(BALL_POKE, { 0: 15 }));

    PokeBallOpenParticleAnimation(runtime, 0);

    expect(runtime.tasks[0].data[0]).toBe(15);
    expect(runtime.sprites[0]!.data[7]).toBe(1);
    expect(runtime.destroyedTasks).toEqual([0]);
    expect(runtime.numBallParticles).toBe(0);
  });

  test('PokeBallOpenParticleAnimation step callbacks wait, translate, and destroy at radius fifty', () => {
    const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
    const sprite = createBallParticleSprite(0);
    sprite.callback = 'PokeBallOpenParticleAnimation_Step1';
    sprite.data[0] = 32;
    sprite.data[1] = 1;

    PokeBallOpenParticleAnimation_Step1(sprite);
    expect(sprite.data[1]).toBe(0);
    expect(sprite.callback).toBe('PokeBallOpenParticleAnimation_Step1');

    PokeBallOpenParticleAnimation_Step1(sprite);
    expect(sprite.callback).toBe('PokeBallOpenParticleAnimation_Step2');

    sprite.data[1] = 48;
    PokeBallOpenParticleAnimation_Step2(runtime, sprite);
    expect(sprite.x2).toBe(sin(32, 48));
    expect(sprite.y2).toBe(cos(32, 48));
    expect(sprite.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([0]);
  });

  test('fan-out ball particle task variants preserve counts, angles, velocities, priority, and cleanup', () => {
    const cases = [
      { ballId: BALL_TIMER, fn: TimerBallOpenParticleAnimation, count: 8, angleStep: 32, d4: 10, d5: 2, d6: 1 },
      { ballId: BALL_DIVE, fn: DiveBallOpenParticleAnimation, count: 8, angleStep: 32, d4: 10, d5: 1, d6: 2 },
      { ballId: BALL_SAFARI, fn: SafariBallOpenParticleAnimation, count: 8, angleStep: 32, d4: 4, d5: 1, d6: 1 },
      { ballId: BALL_ULTRA, fn: UltraBallOpenParticleAnimation, count: 10, angleStep: 25, d4: 5, d5: 1, d6: 1 }
    ] as const;

    for (const testCase of cases) {
      const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
      runtime.tasks.push(createTask(testCase.ballId));

      testCase.fn(runtime, 0);

      const sprites = runtime.sprites.filter((sprite) => sprite !== undefined);
      expect(sprites).toHaveLength(testCase.count);
      expect(sprites[0]!.callback).toBe('FanOutBallOpenParticles_Step1');
      expect(sprites[0]!.data.slice(0, 7)).toEqual([0, 0, 0, 0, testCase.d4, testCase.d5, testCase.d6]);
      expect(sprites.at(-1)!.data[0]).toBe((testCase.count - 1) * testCase.angleStep);
      expect(sprites.at(-1)!.data[7]).toBe(1);
      expect(sprites.every((sprite) => sprite!.oam.priority === 2)).toBe(true);
      expect(runtime.destroyedTasks).toEqual([0]);
    }
  });

  test('GreatBallOpenParticleAnimation waits eight ticks between its two bursts', () => {
    const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
    runtime.tasks.push(createTask(BALL_GREAT));

    GreatBallOpenParticleAnimation(runtime, 0);
    expect(runtime.sprites.filter((sprite) => sprite !== undefined)).toHaveLength(8);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[7]).toBe(8);
    expect(runtime.destroyedTasks).toEqual([]);

    for (let i = 0; i < 8; i += 1) {
      GreatBallOpenParticleAnimation(runtime, 0);
    }
    expect(runtime.tasks[0].data[7]).toBe(0);

    GreatBallOpenParticleAnimation(runtime, 0);
    expect(runtime.sprites.filter((sprite) => sprite !== undefined)).toHaveLength(16);
    expect(runtime.tasks[0].data[0]).toBe(2);
    expect(runtime.sprites[15]!.data[7]).toBe(1);
    expect(runtime.destroyedTasks).toEqual([0]);
  });

  test('Repeat, Master, and Premier ball particle launchers keep their exact callback and data shapes', () => {
    const repeatRuntime = createBattleAnimSpecialRuntime();
    repeatRuntime.tasks.push(createTask(BALL_REPEAT));
    RepeatBallOpenParticleAnimation(repeatRuntime, 0);
    expect(repeatRuntime.sprites).toHaveLength(POKEBALL_COUNT);
    expect(repeatRuntime.sprites[11]).toMatchObject({
      callback: 'RepeatBallOpenParticleAnimation_Step1',
      animNum: sBallParticleAnimNums[BALL_REPEAT]
    });
    expect(repeatRuntime.sprites[11]!.data[0]).toBe(11 * 21);

    const masterRuntime = createBattleAnimSpecialRuntime();
    masterRuntime.tasks.push(createTask(BALL_MASTER));
    MasterBallOpenParticleAnimation(masterRuntime, 0);
    expect(masterRuntime.sprites).toHaveLength(16);
    expect(masterRuntime.sprites[0]!.data.slice(4, 7)).toEqual([8, 2, 1]);
    expect(masterRuntime.sprites[8]!.data.slice(4, 7)).toEqual([8, 1, 2]);

    const premierRuntime = createBattleAnimSpecialRuntime();
    premierRuntime.tasks.push(createTask(BALL_PREMIER));
    PremierBallOpenParticleAnimation(premierRuntime, 0);
    expect(premierRuntime.sprites).toHaveLength(8);
    expect(premierRuntime.sprites[7]).toMatchObject({
      callback: 'PremierBallOpenParticleAnimation_Step1',
      animNum: sBallParticleAnimNums[BALL_PREMIER]
    });
    expect(premierRuntime.sprites[7]!.data[0]).toBe(224);
  });

  test('particle callback math matches the decomp trig formulas and destroys on frame fifty-one', () => {
    const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
    const fanSprite = createBallParticleSprite(0);
    fanSprite.data[0] = 250;
    fanSprite.data[1] = 7;
    fanSprite.data[2] = 9;
    fanSprite.data[3] = 50;
    fanSprite.data[4] = 10;
    fanSprite.data[5] = 2;
    fanSprite.data[6] = 1;

    FanOutBallOpenParticles_Step1(runtime, fanSprite);
    expect(fanSprite.x2).toBe(sin(250, 7));
    expect(fanSprite.y2).toBe(cos(250, 9));
    expect(fanSprite.data.slice(0, 7)).toEqual([4, 9, 10, 51, 10, 2, 1]);
    expect(fanSprite.destroyed).toBe(true);

    const repeatSprite = createBallParticleSprite(1);
    repeatSprite.data[0] = 42;
    repeatSprite.data[1] = 3;
    repeatSprite.data[2] = 5;
    RepeatBallOpenParticleAnimation_Step1(runtime, repeatSprite);
    expect(repeatSprite.x2).toBe(sin(42, 3));
    expect(repeatSprite.y2).toBe(cos(42, sin(42, 5)));
    expect(repeatSprite.data.slice(0, 4)).toEqual([48, 4, 6, 1]);

    const premierSprite = createBallParticleSprite(2);
    premierSprite.data[0] = 74;
    premierSprite.data[1] = 4;
    premierSprite.data[2] = 6;
    PremierBallOpenParticleAnimation_Step1(runtime, premierSprite);
    expect(premierSprite.x2).toBe(sin(74, 4));
    expect(premierSprite.y2).toBe(cos(74, sin(74 & 0x3f, 6)));
    expect(premierSprite.data.slice(0, 4)).toEqual([84, 5, 7, 1]);
  });

  test('DestroyBallOpenAnimationParticle frees every ball particle resource only after the last battle particle', () => {
    const runtime = createBattleAnimSpecialRuntime({
      inBattle: true,
      numBallParticles: 2,
      loadedTileTags: new Set(gBallParticleSpritesheets.map((sheet) => sheet.tag)),
      loadedPaletteTags: new Set(gBallParticlePalettes.map((palette) => palette.tag))
    });
    const first = createBallParticleSprite(0);
    const last = createBallParticleSprite(1);

    DestroyBallOpenAnimationParticle(runtime, first);
    expect(runtime.numBallParticles).toBe(1);
    expect(runtime.freedTileTags).toEqual([]);
    expect(first.destroyed).toBe(true);

    DestroyBallOpenAnimationParticle(runtime, last);
    expect(runtime.numBallParticles).toBe(0);
    expect(runtime.freedTileTags).toEqual(gBallParticleSpritesheets.map((sheet) => sheet.tag));
    expect(runtime.freedPaletteTags).toEqual(gBallParticlePalettes.map((palette) => palette.tag));
    expect(runtime.loadedTileTags.size).toBe(0);
    expect(runtime.loadedPaletteTags.size).toBe(0);
    expect(runtime.destroyedSprites).toEqual([0, 1]);
  });

  test('DestroyBallOpenAnimationParticle uses free-resources cleanup only for the flagged field sprite', () => {
    const runtime = createBattleAnimSpecialRuntime({ inBattle: false });
    const normal = createBallParticleSprite(0);
    const withResources = createBallParticleSprite(1);
    withResources.data[7] = 1;

    DestroyBallOpenAnimationParticle(runtime, normal);
    DestroyBallOpenAnimationParticle(runtime, withResources);

    expect(runtime.freedResourceSprites).toEqual([1]);
    expect(runtime.calls.at(-2)).toEqual({ fn: 'DestroySprite', args: [0] });
    expect(runtime.calls.at(-1)).toEqual({ fn: 'DestroySpriteAndFreeResources', args: [1] });
  });

  test('BlendPalette and BeginNormalPaletteFade record the same palette side effects used by fade tasks', () => {
    const runtime = createBattleAnimSpecialRuntime();

    BlendPalette(runtime, 7, 16, 3, RGB_WHITE);
    BeginNormalPaletteFade(runtime, 0x81234567, 1, 2, 3, RGB_BLACK);

    expect(runtime.blendedPalettes).toEqual([{ offset: 7, count: 16, coefficient: 3, color: RGB_WHITE }]);
    expect(runtime.paletteFades).toEqual([
      { selectedPalettes: 0x81234567, delay: 1, startY: 2, targetY: 3, color: RGB_BLACK }
    ]);
    expect(runtime.paletteFadeActive).toBe(true);
  });

  test('LaunchBallFadeMonTask initializes fade-to-ball-color task data exactly', () => {
    const runtime = createBattleAnimSpecialRuntime();
    const taskId = LaunchBallFadeMonTask(runtime, false, 3, 0x89abcdef, BALL_ULTRA);

    expect(taskId).toBe(0);
    expect(runtime.tasks[0]).toMatchObject({
      id: 0,
      func: 'Task_FadeMon_ToBallColor',
      priority: 5
    });
    expect(runtime.tasks[0].data[15]).toBe(BALL_ULTRA);
    expect(runtime.tasks[0].data[3]).toBe(3);
    expect(runtime.tasks[0].data[10]).toBe(0xcdef);
    expect(runtime.tasks[0].data[11]).toBe(0x89ab);
    expect(runtime.tasks[0].data[1]).toBe(1);
    expect(runtime.blendedPalettes[0]).toEqual({
      offset: OBJ_PLTT_ID(3),
      count: 16,
      coefficient: 0,
      color: sBallOpenFadeColors[BALL_ULTRA]
    });
    expect(runtime.paletteFades[0]).toEqual({
      selectedPalettes: 0x89abcdef,
      delay: 0,
      startY: 0,
      targetY: 16,
      color: RGB_WHITE
    });
  });

  test('LaunchBallFadeMonTask initializes unfade-later path at coefficient sixteen and swaps the task func', () => {
    const runtime = createBattleAnimSpecialRuntime();
    const taskId = LaunchBallFadeMonTask(runtime, true, 2, 0x10203040, BALL_MASTER);

    expect(taskId).toBe(0);
    expect(runtime.tasks[0].func).toBe('Task_FadeMon_ToNormal');
    expect(runtime.tasks[0].data[0]).toBe(16);
    expect(runtime.tasks[0].data[1]).toBe(-1);
    expect(runtime.blendedPalettes[0]).toEqual({
      offset: OBJ_PLTT_ID(2),
      count: 16,
      coefficient: 16,
      color: sBallOpenFadeColors[BALL_MASTER]
    });
    expect(runtime.paletteFades[0]).toEqual({
      selectedPalettes: 0x10203040,
      delay: 0,
      startY: 0,
      targetY: 16,
      color: RGB_WHITE
    });
  });

  test('Task_FadeMon_ToBallColor blends through coefficient sixteen then waits for palette fade before destroying', () => {
    const runtime = createBattleAnimSpecialRuntime();
    LaunchBallFadeMonTask(runtime, false, 1, 0x12345678, BALL_TIMER);
    runtime.blendedPalettes.length = 0;

    for (let i = 0; i < 17; i += 1) {
      Task_FadeMon_ToBallColor(runtime, 0);
      expect(runtime.blendedPalettes[i]).toEqual({
        offset: OBJ_PLTT_ID(1),
        count: 16,
        coefficient: i,
        color: sBallOpenFadeColors[BALL_TIMER]
      });
    }

    expect(runtime.tasks[0].data[0]).toBe(17);
    expect(runtime.tasks[0].data[2]).toBe(17);
    runtime.paletteFadeActive = true;
    Task_FadeMon_ToBallColor(runtime, 0);
    expect(runtime.destroyedTasks).toEqual([]);

    runtime.paletteFadeActive = false;
    Task_FadeMon_ToBallColor(runtime, 0);
    expect(runtime.paletteFades.at(-1)).toEqual({
      selectedPalettes: 0x12345678,
      delay: 0,
      startY: 16,
      targetY: 0,
      color: RGB_WHITE
    });
    expect(runtime.destroyedTasks).toEqual([0]);
  });

  test('Task_FadeMon_ToNormal waits for palette fade, then Task_FadeMon_ToNormal_Step counts down to destroy', () => {
    const runtime = createBattleAnimSpecialRuntime();
    LaunchBallFadeMonTask(runtime, true, 4, 0xff00aa55, BALL_DIVE);

    runtime.paletteFadeActive = true;
    Task_FadeMon_ToNormal(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_FadeMon_ToNormal');

    runtime.paletteFadeActive = false;
    Task_FadeMon_ToNormal(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_FadeMon_ToNormal_Step');
    expect(runtime.paletteFades.at(-1)).toEqual({
      selectedPalettes: 0xff00aa55,
      delay: 0,
      startY: 16,
      targetY: 0,
      color: RGB_WHITE
    });

    runtime.blendedPalettes.length = 0;
    for (let i = 0; i < 17; i += 1) {
      Task_FadeMon_ToNormal_Step(runtime, 0);
      expect(runtime.blendedPalettes[i]).toEqual({
        offset: OBJ_PLTT_ID(4),
        count: 16,
        coefficient: 16 - i,
        color: sBallOpenFadeColors[BALL_DIVE]
      });
    }

    expect(runtime.tasks[0].data[0]).toBe(-1);
    expect(runtime.tasks[0].data[2]).toBe(17);
    Task_FadeMon_ToNormal_Step(runtime, 0);
    expect(runtime.destroyedTasks).toEqual([0]);
  });

  test('AnimTask_SwapMonSpriteToFromSubstitute slides an opponent sprite out, swaps gfx, and slides it back', () => {
    const sprite = createBallParticleSprite(0, 280, 0);
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimArgs: [12, 0, 0, 0, 0, 0, 0, 0],
      battleAnimAttacker: 1,
      battlerSpriteIds: { 1: 0 },
      battlerSides: { 1: B_SIDE_OPPONENT },
      sprites: [sprite],
      tasks: [createRuntimeTask()]
    });

    AnimTask_SwapMonSpriteToFromSubstitute(runtime, 0);
    expect(runtime.tasks[0].data[11]).toBe(12);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(sprite.x2).toBe(5);
    expect(runtime.tasks[0].data[10]).toBe(1);

    AnimTask_SwapMonSpriteToFromSubstitute(runtime, 0);
    expect(runtime.loadedBattleMonGfx).toEqual([{ battler: 1, mode: 12, spriteId: 0 }]);
    expect(runtime.tasks[0].data[10]).toBe(2);

    AnimTask_SwapMonSpriteToFromSubstitute(runtime, 0);
    expect(sprite.x2).toBe(0);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_SwapMonSpriteToFromSubstitute mirrors movement direction for the player side', () => {
    const sprite = createBallParticleSprite(0, 278, 0);
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimArgs: [7, 0, 0, 0, 0, 0, 0, 0],
      battleAnimAttacker: 0,
      battlerSpriteIds: { 0: 0 },
      battlerSides: { 0: B_SIDE_PLAYER },
      sprites: [sprite],
      tasks: [createRuntimeTask()]
    });

    AnimTask_SwapMonSpriteToFromSubstitute(runtime, 0);
    expect(sprite.x2).toBe(-5);
    expect(runtime.tasks[0].data[10]).toBe(1);

    runtime.tasks[0].data[10] = 2;
    AnimTask_SwapMonSpriteToFromSubstitute(runtime, 0);
    expect(sprite.x2).toBe(0);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_SubstituteFadeToInvisible chooses BG layer from priority rank and fades every third tick', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 0,
      battlerBgPriorityRanks: { 0: B_POSITION_OPPONENT_LEFT },
      tasks: [createRuntimeTask()]
    });

    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(16, 0));
    expect(runtime.tasks[0].data[15]).toBe(1);

    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.tasks[0].data[1]).toBe(1);
    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.tasks[0].data[1]).toBe(2);
    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.tasks[0].data[1]).toBe(0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(15, 1));

    runtime.tasks[0].data[0] = 15;
    runtime.tasks[0].data[1] = 2;
    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(0, 16));
    expect(runtime.tasks[0].data[15]).toBe(2);
  });

  test('AnimTask_SubstituteFadeToInvisible uses BG2 for non-opponent-left priority and clears substitute VRAM in case two', () => {
    const sprite = createBallParticleSprite(0);
    sprite.oam.tileNum = 33;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 0,
      battlerSpriteIds: { 0: 0 },
      battlerBgPriorityRanks: { 0: B_POSITION_PLAYER_LEFT },
      sprites: [sprite],
      tasks: [createRuntimeTask()]
    });

    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);

    runtime.tasks[0].data[15] = 2;
    AnimTask_SubstituteFadeToInvisible(runtime, 0);
    expect(runtime.dmaFills).toEqual([{ value: 0, dest: 33 * TILE_SIZE_4BPP, size: 0x800, mode: DMA3_32BIT }]);
    expect(runtime.clearedBehindSubstituteBattlers).toEqual([0]);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_IsAttackerBehindSubstitute and AnimTask_SetTargetToEffectBattler preserve their simple side effects', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      effectBattler: 3,
      battlerData: { 2: { behindSubstitute: 1 } },
      tasks: [createRuntimeTask(), createRuntimeTask()]
    });

    AnimTask_IsAttackerBehindSubstitute(runtime, 0);
    expect(runtime.battleAnimArgs[ARG_RET_ID]).toBe(1);
    expect(runtime.destroyedVisualTasks).toEqual([0]);

    AnimTask_SetTargetToEffectBattler(runtime, 1);
    expect(runtime.battleAnimTarget).toBe(3);
    expect(runtime.destroyedVisualTasks).toEqual([0, 1]);
  });

  test('GetShinyValue and TryShinyAnimation preserve visible, non-visible, and non-shiny branches', () => {
    expect(GetShinyValue(0x12345678, 0x9abcdef0)).toBe(0);
    expect(GetShinyValue(0, SHINY_ODDS)).toBe(SHINY_ODDS);

    const hiddenRuntime = createBattleAnimSpecialRuntime({
      battlerSpriteVisible: { 1: false }
    });
    TryShinyAnimation(hiddenRuntime, 1, { otId: 0, personality: 0 });
    expect(hiddenRuntime.healthBoxesData[1]).toEqual({
      triedShinyMonAnim: true,
      finishedShinyMonAnim: true
    });
    expect(hiddenRuntime.tasks).toEqual([]);

    const notShinyRuntime = createBattleAnimSpecialRuntime();
    TryShinyAnimation(notShinyRuntime, 0, { otId: 0, personality: SHINY_ODDS });
    expect(notShinyRuntime.healthBoxesData[0]).toEqual({
      triedShinyMonAnim: true,
      finishedShinyMonAnim: true
    });
    expect(notShinyRuntime.tasks).toEqual([]);
  });

  test('TryShinyAnimation loads gold stars once and creates the two shiny sparkle tasks', () => {
    const runtime = createBattleAnimSpecialRuntime();
    TryShinyAnimation(runtime, 2, { otId: 0x00000001, personality: 0x00000001 });

    expect(runtime.healthBoxesData[2]).toEqual({
      triedShinyMonAnim: true,
      finishedShinyMonAnim: false
    });
    expect(runtime.loadedTileTags.has(ANIM_TAG_GOLD_STARS)).toBe(true);
    expect(runtime.loadedPaletteTags.has(ANIM_TAG_GOLD_STARS)).toBe(true);
    expect(runtime.calls).toContainEqual({
      fn: 'LoadCompressedSpriteSheetUsingHeap',
      args: [`gBattleAnimPicTable[${ANIM_TAG_GOLD_STARS - ANIM_SPRITES_START}]`]
    });
    expect(runtime.calls).toContainEqual({
      fn: 'LoadCompressedSpritePaletteUsingHeap',
      args: [`gBattleAnimPaletteTable[${ANIM_TAG_GOLD_STARS - ANIM_SPRITES_START}]`]
    });
    expect(runtime.tasks.map((task) => task.func)).toEqual(['AnimTask_ShinySparkles', 'AnimTask_ShinySparkles']);
    expect(runtime.tasks[0].data[0]).toBe(2);
    expect(runtime.tasks[1].data[0]).toBe(2);
    expect(runtime.tasks[0].data[1]).toBe(0);
    expect(runtime.tasks[1].data[1]).toBe(1);

    const alreadyLoadedRuntime = createBattleAnimSpecialRuntime({
      loadedTileTags: new Set([ANIM_TAG_GOLD_STARS])
    });
    TryShinyAnimation(alreadyLoadedRuntime, 0, { otId: 0, personality: 0 });
    expect(alreadyLoadedRuntime.calls.some((call) => call.fn === 'LoadCompressedSpriteSheetUsingHeap')).toBe(false);
  });

  test('AnimTask_ShinySparkles waits sixty frames, waits for ball particles, and spawns every fourth counter tick', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battlerCoords: { 1: { [BATTLER_COORD_X]: 88, [BATTLER_COORD_Y]: 99 } },
      tasks: [createRuntimeTask({ 0: 1 })]
    });

    AnimTask_ShinySparkles(runtime, 0);
    expect(runtime.tasks[0].data[13]).toBe(1);
    expect(runtime.sprites).toEqual([]);

    runtime.tasks[0].data[13] = 60;
    runtime.numBallParticles = 1;
    AnimTask_ShinySparkles(runtime, 0);
    expect(runtime.tasks[0].data[10]).toBe(0);

    runtime.numBallParticles = 0;
    runtime.tasks[0].data[10] = 1;
    AnimTask_ShinySparkles(runtime, 0);
    expect(runtime.tasks[0].data[10]).toBe(2);
    expect(runtime.sprites).toEqual([]);

    runtime.tasks[0].data[10] = 0;
    AnimTask_ShinySparkles(runtime, 0);
    expect(runtime.sprites[0]).toMatchObject({
      template: 'gWishStarSpriteTemplate',
      x: 88,
      y: 99,
      subpriority: 5,
      callback: 'SpriteCB_ShinySparkles_1'
    });
    expect(runtime.sprites[0]!.data[0]).toBe(0);
    expect(runtime.tasks[0].data[11]).toBe(1);
    expect(runtime.tasks[0].data[12]).toBe(1);
  });

  test('AnimTask_ShinySparkles creates mini stars, plays panned sound for second task, and switches to wait func after five', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battlerSides: { 1: B_SIDE_OPPONENT },
      battlerCoords: { 1: { [BATTLER_COORD_X]: 120, [BATTLER_COORD_Y]: 64 } },
      tasks: [createRuntimeTask({ 0: 1, 1: 1, 10: 0, 11: 0, 13: 60 })]
    });

    for (let i = 0; i < 5; i += 1) {
      runtime.tasks[0].data[10] = 0;
      AnimTask_ShinySparkles(runtime, 0);
    }

    expect(runtime.pannedSounds).toEqual([{ id: SE_SHINY, pan: SOUND_PAN_TARGET }]);
    expect(runtime.sprites[0]).toMatchObject({
      template: 'gWishStarSpriteTemplate',
      callback: 'SpriteCB_ShinySparkles_2',
      x2: -32,
      y2: 32,
      invisible: true
    });
    expect(runtime.sprites[1]!.template).toBe('gMiniTwinklingStarSpriteTemplate');
    expect(runtime.sprites[1]!.oam.tileNum).toBe(4);
    expect(runtime.sprites[3]!.oam.tileNum).toBe(4);
    expect(runtime.sprites[4]!.oam.tileNum).toBe(5);
    expect(runtime.tasks[0].data[11]).toBe(5);
    expect(runtime.tasks[0].data[12]).toBe(5);
    expect(runtime.tasks[0].func).toBe('AnimTask_ShinySparkles_WaitSparkles');

    const playerRuntime = createBattleAnimSpecialRuntime({
      battlerSides: { 0: B_SIDE_PLAYER },
      tasks: [createRuntimeTask({ 0: 0, 1: 1, 13: 60 })]
    });
    AnimTask_ShinySparkles(playerRuntime, 0);
    expect(playerRuntime.pannedSounds).toEqual([{ id: SE_SHINY, pan: SOUND_PAN_ATTACKER }]);
  });

  test('AnimTask_ShinySparkles_WaitSparkles only finishes shiny animation for the second task and destroys at zero count', () => {
    const firstRuntime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 0: 1, 1: 0, 12: 0 })]
    });
    AnimTask_ShinySparkles_WaitSparkles(firstRuntime, 0);
    expect(firstRuntime.healthBoxesData[1]).toBeUndefined();
    expect(firstRuntime.destroyedTasks).toEqual([0]);

    const secondRuntime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 0: 1, 1: 1, 12: 0 })]
    });
    AnimTask_ShinySparkles_WaitSparkles(secondRuntime, 0);
    expect(secondRuntime.healthBoxesData[1]).toEqual({
      triedShinyMonAnim: false,
      finishedShinyMonAnim: true
    });
    expect(secondRuntime.destroyedTasks).toEqual([0]);

    const pendingRuntime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 0: 1, 1: 1, 12: 1 })]
    });
    AnimTask_ShinySparkles_WaitSparkles(pendingRuntime, 0);
    expect(pendingRuntime.destroyedTasks).toEqual([]);
  });

  test('SpriteCB_ShinySparkles_1 follows circular trig and decrements parent count after angle exceeds 255', () => {
    const runtime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 12: 1 })]
    });
    const sprite = createBallParticleSprite(0);
    sprite.data[0] = 0;
    sprite.data[1] = 252;

    SpriteCB_ShinySparkles_1(runtime, sprite);

    expect(sprite.x2).toBe(sin(252, 24));
    expect(sprite.y2).toBe(cos(252, 24));
    expect(sprite.data[1]).toBe(264);
    expect(runtime.tasks[0].data[12]).toBe(0);
    expect(sprite.oamMatrixFreed).toBe(true);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([0]);
  });

  test('SpriteCB_ShinySparkles_2 waits four frames, then moves diagonally until x2 passes thirty-two', () => {
    const runtime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 12: 1 })]
    });
    const sprite = createBallParticleSprite(0);
    sprite.data[0] = 0;
    sprite.x2 = 28;
    sprite.y2 = 0;
    sprite.invisible = true;

    for (let i = 0; i < 4; i += 1) {
      SpriteCB_ShinySparkles_2(runtime, sprite);
      expect(sprite.data[1]).toBe(i + 1);
      expect(sprite.invisible).toBe(true);
    }

    SpriteCB_ShinySparkles_2(runtime, sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.x2).toBe(33);
    expect(sprite.y2).toBe(-5);
    expect(runtime.tasks[0].data[12]).toBe(0);
    expect(sprite.oamMatrixFreed).toBe(true);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([0]);
  });

  test('AnimTask_LoadBaitGfx loads Safari bait sheet, palette, indexes palette tag, and destroys visual task', () => {
    const runtime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask()]
    });

    AnimTask_LoadBaitGfx(runtime, 0);

    expect(runtime.loadedTileTags.has(ANIM_TAG_SAFARI_BAIT)).toBe(true);
    expect(runtime.loadedPaletteTags.has(ANIM_TAG_SAFARI_BAIT)).toBe(true);
    expect(runtime.indexedSpritePaletteTags).toEqual([ANIM_TAG_SAFARI_BAIT]);
    expect(runtime.calls).toContainEqual({
      fn: 'LoadCompressedSpriteSheetUsingHeap',
      args: [`gBattleAnimPicTable[${ANIM_TAG_SAFARI_BAIT - ANIM_SPRITES_START}]`]
    });
    expect(runtime.calls).toContainEqual({
      fn: 'LoadCompressedSpritePaletteUsingHeap',
      args: [`gBattleAnimPaletteTable[${ANIM_TAG_SAFARI_BAIT - ANIM_SPRITES_START}]`]
    });
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_FreeBaitGfx frees Safari bait sheet and palette tags and destroys visual task', () => {
    const runtime = createBattleAnimSpecialRuntime({
      loadedTileTags: new Set([ANIM_TAG_SAFARI_BAIT]),
      loadedPaletteTags: new Set([ANIM_TAG_SAFARI_BAIT]),
      tasks: [createRuntimeTask()]
    });

    AnimTask_FreeBaitGfx(runtime, 0);

    expect(runtime.loadedTileTags.has(ANIM_TAG_SAFARI_BAIT)).toBe(false);
    expect(runtime.loadedPaletteTags.has(ANIM_TAG_SAFARI_BAIT)).toBe(false);
    expect(runtime.freedTileTags).toEqual([ANIM_TAG_SAFARI_BAIT]);
    expect(runtime.freedPaletteTags).toEqual([ANIM_TAG_SAFARI_BAIT]);
    expect(runtime.calls).toContainEqual({ fn: 'FreeSpriteTilesByTag', args: [ANIM_TAG_SAFARI_BAIT] });
    expect(runtime.calls).toContainEqual({ fn: 'FreeSpritePaletteByTag', args: [ANIM_TAG_SAFARI_BAIT] });
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('SpriteCB_SafariBaitOrRock_Init positions sprite, initializes arc data, and starts player throw', () => {
    const attackerSprite = createBallParticleSprite(4);
    const baitSprite = createBallParticleSprite(9);
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimArgs: [6, 7, -3, 5, 0, 0, 0, 0],
      battleAnimAttacker: 2,
      battleAnimTarget: 3,
      battlerSpriteIds: { 2: 4 },
      battlersAtPositions: { [B_POSITION_OPPONENT_LEFT]: 3 },
      battlerCoords: {
        2: { [BATTLER_COORD_X]: 40, [BATTLER_COORD_Y]: 80 },
        3: { [BATTLER_COORD_X]: 180, [BATTLER_COORD_Y]: 62 }
      },
      sprites: Object.assign([], { 4: attackerSprite, 9: baitSprite })
    });

    SpriteCB_SafariBaitOrRock_Init(runtime, baitSprite);

    expect(baitSprite.x).toBe(46);
    expect(baitSprite.y).toBe(87);
    expect(baitSprite.data[0]).toBe(30);
    expect(baitSprite.data[1]).toBe(Math.trunc((Math.abs(177 - 46) << 8) / 30) & ~1);
    expect(baitSprite.data[2]).toBe(Math.trunc((Math.abs(67 - 87) << 8) / 30) | 1);
    expect(baitSprite.data[3]).toBe(0);
    expect(baitSprite.data[4]).toBe(0);
    expect(baitSprite.data[5]).toBe(-32);
    expect(baitSprite.data[6]).toBe(Math.trunc(0x8000 / 30));
    expect(baitSprite.data[7]).toBe(0);
    expect(attackerSprite.callback).toBe('SpriteCB_PlayerThrowInit');
    expect(baitSprite.callback).toBe('SpriteCB_SafariBaitOrRock_WaitPlayerThrow');
  });

  test('SpriteCB_SafariBaitOrRock_WaitPlayerThrow waits for attacker anim command index one', () => {
    const attackerSprite = createBallParticleSprite(4);
    const baitSprite = createBallParticleSprite(9);
    baitSprite.callback = 'SpriteCB_SafariBaitOrRock_WaitPlayerThrow';
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      battlerSpriteIds: { 2: 4 },
      sprites: Object.assign([], { 4: attackerSprite, 9: baitSprite })
    });

    SpriteCB_SafariBaitOrRock_WaitPlayerThrow(runtime, baitSprite);
    expect(baitSprite.callback).toBe('SpriteCB_SafariBaitOrRock_WaitPlayerThrow');

    attackerSprite.animCmdIndex = 1;
    SpriteCB_SafariBaitOrRock_WaitPlayerThrow(runtime, baitSprite);
    expect(baitSprite.callback).toBe('SpriteCB_SafariBaitOrRock_ArcFlight');
  });

  test('SpriteCB_SafariBaitOrRock_ArcFlight translates along horizontal arc until linear motion completes', () => {
    const baitSprite = createBallParticleSprite(9);
    baitSprite.data[0] = 1;
    baitSprite.data[1] = 0x0200;
    baitSprite.data[2] = 0x0101;
    baitSprite.data[3] = 0;
    baitSprite.data[4] = 0;
    baitSprite.data[5] = -32;
    baitSprite.data[6] = 0x8000;
    baitSprite.data[7] = 0;
    baitSprite.callback = 'SpriteCB_SafariBaitOrRock_ArcFlight';
    const runtime = createBattleAnimSpecialRuntime();

    SpriteCB_SafariBaitOrRock_ArcFlight(runtime, baitSprite);
    expect(baitSprite.x2).toBe(2);
    expect(baitSprite.y2).toBe(-1 + sin(0x80, -32));
    expect(baitSprite.data[0]).toBe(0);
    expect(baitSprite.invisible).toBe(false);
    expect(baitSprite.callback).toBe('SpriteCB_SafariBaitOrRock_ArcFlight');

    SpriteCB_SafariBaitOrRock_ArcFlight(runtime, baitSprite);
    expect(baitSprite.data[0]).toBe(0);
    expect(baitSprite.invisible).toBe(true);
    expect(baitSprite.callback).toBe('SpriteCB_SafariBaitOrRock_Finish');
  });

  test('SpriteCB_SafariBaitOrRock_Finish waits for attacker animation end before restarting and destroying sprite', () => {
    const attackerSprite = createBallParticleSprite(4);
    const baitSprite = createBallParticleSprite(9);
    baitSprite.callback = 'SpriteCB_SafariBaitOrRock_Finish';
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      battlerSpriteIds: { 2: 4 },
      sprites: Object.assign([], { 4: attackerSprite, 9: baitSprite })
    });

    SpriteCB_SafariBaitOrRock_Finish(runtime, baitSprite);
    expect(baitSprite.destroyed).toBe(false);
    expect(runtime.destroyedSprites).toEqual([]);

    attackerSprite.animEnded = true;
    SpriteCB_SafariBaitOrRock_Finish(runtime, baitSprite);
    expect(baitSprite.data[0]).toBe(1);
    expect(attackerSprite.animNum).toBe(0);
    expect(baitSprite.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([9]);
    expect(runtime.calls).toContainEqual({ fn: 'StartSpriteAnim', args: [4, 0] });
    expect(runtime.calls).toContainEqual({ fn: 'DestroyAnimSprite', args: [9] });
  });

  test('AnimTask_SafariOrGhost_DecideAnimSides preserves both switch cases and default no-op', () => {
    const playerFirst = createBattleAnimSpecialRuntime({
      battleAnimArgs: [0, 0, 0, 0, 0, 0, 0, 0],
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2, [B_POSITION_OPPONENT_LEFT]: 3 },
      battleAnimAttacker: 9,
      battleAnimTarget: 8,
      tasks: [createRuntimeTask()]
    });
    AnimTask_SafariOrGhost_DecideAnimSides(playerFirst, 0);
    expect(playerFirst.battleAnimAttacker).toBe(2);
    expect(playerFirst.battleAnimTarget).toBe(3);
    expect(playerFirst.destroyedVisualTasks).toEqual([0]);

    const opponentFirst = createBattleAnimSpecialRuntime({
      battleAnimArgs: [1, 0, 0, 0, 0, 0, 0, 0],
      battlersAtPositions: { [B_POSITION_PLAYER_LEFT]: 2, [B_POSITION_OPPONENT_LEFT]: 3 },
      battleAnimAttacker: 9,
      battleAnimTarget: 8,
      tasks: [createRuntimeTask()]
    });
    AnimTask_SafariOrGhost_DecideAnimSides(opponentFirst, 0);
    expect(opponentFirst.battleAnimAttacker).toBe(3);
    expect(opponentFirst.battleAnimTarget).toBe(2);

    const noMatch = createBattleAnimSpecialRuntime({
      battleAnimArgs: [2, 0, 0, 0, 0, 0, 0, 0],
      battleAnimAttacker: 9,
      battleAnimTarget: 8,
      tasks: [createRuntimeTask()]
    });
    AnimTask_SafariOrGhost_DecideAnimSides(noMatch, 0);
    expect(noMatch.battleAnimAttacker).toBe(9);
    expect(noMatch.battleAnimTarget).toBe(8);
    expect(noMatch.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_SafariGetReaction clamps out-of-range multichoice reaction to zero', () => {
    const inRange = createBattleAnimSpecialRuntime({
      battleCommunication: Object.assign(Array.from({ length: 8 }, () => 0), { [MULTISTRING_CHOOSER]: 2 }),
      tasks: [createRuntimeTask()]
    });
    AnimTask_SafariGetReaction(inRange, 0);
    expect(inRange.battleAnimArgs[7]).toBe(2);
    expect(inRange.destroyedVisualTasks).toEqual([0]);

    const outOfRange = createBattleAnimSpecialRuntime({
      battleCommunication: Object.assign(Array.from({ length: 8 }, () => 0), { [MULTISTRING_CHOOSER]: 3 }),
      tasks: [createRuntimeTask()]
    });
    AnimTask_SafariGetReaction(outOfRange, 0);
    expect(outOfRange.battleAnimArgs[7]).toBe(0);
  });

  test('AnimTask_GetTrappedMoveAnimId maps trapped move ids to exact trap animation ids', () => {
    const cases = [
      [MOVE_FIRE_SPIN, TRAP_ANIM_FIRE_SPIN],
      [MOVE_WHIRLPOOL, TRAP_ANIM_WHIRLPOOL],
      [MOVE_CLAMP, TRAP_ANIM_CLAMP],
      [MOVE_SAND_TOMB, TRAP_ANIM_SAND_TOMB],
      [9999, TRAP_ANIM_BIND]
    ] as const;

    for (const [move, trapAnim] of cases) {
      const runtime = createBattleAnimSpecialRuntime({
        animationDataAnimArg: move,
        tasks: [createRuntimeTask()]
      });
      AnimTask_GetTrappedMoveAnimId(runtime, 0);
      expect(runtime.battleAnimArgs[0]).toBe(trapAnim);
      expect(runtime.destroyedVisualTasks).toEqual([0]);
    }
  });

  test('AnimTask_GetBattlersFromArg splits animArg into attacker low byte and target high byte', () => {
    const runtime = createBattleAnimSpecialRuntime({
      animationDataAnimArg: 0x0302,
      tasks: [createRuntimeTask()]
    });

    AnimTask_GetBattlersFromArg(runtime, 0);

    expect(runtime.battleAnimAttacker).toBe(0x0302);
    expect(runtime.battleAnimTarget).toBe(0x03);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('DoLoadHealthboxPalsForLevelUp allocates, copies, and swaps healthbox palettes', () => {
    const healthbox = createBallParticleSprite(10);
    const sideSprite = createBallParticleSprite(11);
    const barSprite = createBallParticleSprite(12);
    healthbox.oam.affineParam = 11;
    healthbox.oam.paletteNum = 2;
    healthbox.data[5] = 12;
    barSprite.oam.paletteNum = 3;
    const runtime = createBattleAnimSpecialRuntime({
      healthboxSpriteIds: { 2: 10 },
      nextSpritePaletteId: 6,
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite })
    });

    const result = DoLoadHealthboxPalsForLevelUp(runtime, 2);

    expect(result).toEqual({ paletteId1: 6, paletteId2: 7 });
    expect(runtime.nextSpritePaletteId).toBe(8);
    expect(runtime.allocatedSpritePalettes).toEqual([
      { tag: TAG_HEALTHBOX_PALS_1, paletteId: 6 },
      { tag: TAG_HEALTHBOX_PALS_2, paletteId: 7 }
    ]);
    expect(runtime.loadedPalettes).toEqual([
      { src: `gPlttBufferUnfaded[${OBJ_PLTT_ID(2)}]`, offset: OBJ_PLTT_ID(6), size: PLTT_SIZE_4BPP },
      { src: `gPlttBufferUnfaded[${OBJ_PLTT_ID(3)}]`, offset: OBJ_PLTT_ID(7), size: PLTT_SIZE_4BPP }
    ]);
    expect(healthbox.oam.paletteNum).toBe(6);
    expect(sideSprite.oam.paletteNum).toBe(6);
    expect(barSprite.oam.paletteNum).toBe(7);
  });

  test('AnimTask_LoadHealthboxPalsForLevelUp uses the attacker and destroys the visual task', () => {
    const healthbox = createBallParticleSprite(10);
    const sideSprite = createBallParticleSprite(11);
    const barSprite = createBallParticleSprite(12);
    healthbox.oam.affineParam = 11;
    healthbox.data[5] = 12;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 3,
      healthboxSpriteIds: { 3: 10 },
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_LoadHealthboxPalsForLevelUp(runtime, 0);

    expect(runtime.allocatedSpritePalettes.map((entry) => entry.tag)).toEqual([
      TAG_HEALTHBOX_PALS_1,
      TAG_HEALTHBOX_PALS_2
    ]);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('DoFreeHealthboxPalsForLevelUp frees temp palettes and restores healthbox palette ids', () => {
    const healthbox = createBallParticleSprite(10);
    const sideSprite = createBallParticleSprite(11);
    const barSprite = createBallParticleSprite(12);
    healthbox.oam.affineParam = 11;
    healthbox.oam.paletteNum = 6;
    healthbox.data[5] = 12;
    sideSprite.oam.paletteNum = 6;
    barSprite.oam.paletteNum = 7;
    const runtime = createBattleAnimSpecialRuntime({
      healthboxSpriteIds: { 1: 10 },
      spritePaletteTagIndexes: {
        [TAG_HEALTHBOX_PAL]: 4,
        [TAG_HEALTHBAR_PAL]: 5
      },
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite })
    });

    DoFreeHealthboxPalsForLevelUp(runtime, 1);

    expect(runtime.freedPaletteTags).toEqual([TAG_HEALTHBOX_PALS_1, TAG_HEALTHBOX_PALS_2]);
    expect(runtime.indexedSpritePaletteTags).toEqual([TAG_HEALTHBOX_PAL, TAG_HEALTHBAR_PAL]);
    expect(healthbox.oam.paletteNum).toBe(4);
    expect(sideSprite.oam.paletteNum).toBe(4);
    expect(barSprite.oam.paletteNum).toBe(5);
  });

  test('AnimTask_FreeHealthboxPalsForLevelUp uses the attacker and destroys the visual task', () => {
    const healthbox = createBallParticleSprite(10);
    const sideSprite = createBallParticleSprite(11);
    const barSprite = createBallParticleSprite(12);
    healthbox.oam.affineParam = 11;
    healthbox.data[5] = 12;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 1,
      healthboxSpriteIds: { 1: 10 },
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_FreeHealthboxPalsForLevelUp(runtime, 0);

    expect(runtime.freedPaletteTags).toEqual([TAG_HEALTHBOX_PALS_1, TAG_HEALTHBOX_PALS_2]);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_FlashHealthboxOnLevelUp stores args and switches to the step callback', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimArgs: [1, 2, 0, 0, 0, 0, 0, 0],
      tasks: [createRuntimeTask()]
    });

    AnimTask_FlashHealthboxOnLevelUp(runtime, 0);

    expect(runtime.tasks[0].data[10]).toBe(1);
    expect(runtime.tasks[0].data[11]).toBe(2);
    expect(runtime.tasks[0].func).toBe('AnimTask_FlashHealthboxOnLevelUp_Step');
  });

  test('AnimTask_FlashHealthboxOnLevelUp_Step preserves the double increment frame gate', () => {
    const runtime = createBattleAnimSpecialRuntime({
      spritePaletteTagIndexes: { [TAG_HEALTHBOX_PALS_1]: 3 },
      tasks: [createRuntimeTask({ 0: 0, 11: 2 })]
    });

    AnimTask_FlashHealthboxOnLevelUp_Step(runtime, 0);

    expect(runtime.tasks[0].data[0]).toBe(2);
    expect(runtime.blendedPalettes).toEqual([]);

    AnimTask_FlashHealthboxOnLevelUp_Step(runtime, 0);

    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].data[2]).toBe(2);
    expect(runtime.blendedPalettes).toEqual([
      { offset: OBJ_PLTT_ID(3) + 6, count: 1, coefficient: 2, color: RGB(20, 27, 31) }
    ]);
  });

  test('AnimTask_FlashHealthboxOnLevelUp_Step brightens then advances at coefficient sixteen', () => {
    const runtime = createBattleAnimSpecialRuntime({
      spritePaletteTagIndexes: { [TAG_HEALTHBOX_PALS_1]: 3 },
      tasks: [createRuntimeTask({ 1: 0, 2: 14, 10: 0, 11: 0 })]
    });

    AnimTask_FlashHealthboxOnLevelUp_Step(runtime, 0);

    expect(runtime.tasks[0].data[1]).toBe(1);
    expect(runtime.tasks[0].data[2]).toBe(16);
    expect(runtime.blendedPalettes).toEqual([
      { offset: OBJ_PLTT_ID(3) + 6, count: 1, coefficient: 16, color: RGB(20, 27, 31) }
    ]);
  });

  test('AnimTask_FlashHealthboxOnLevelUp_Step darkens then destroys at coefficient zero', () => {
    const runtime = createBattleAnimSpecialRuntime({
      spritePaletteTagIndexes: { [TAG_HEALTHBOX_PALS_1]: 3 },
      tasks: [createRuntimeTask({ 1: 1, 2: 2, 10: 1, 11: 0 })]
    });

    AnimTask_FlashHealthboxOnLevelUp_Step(runtime, 0);

    expect(runtime.tasks[0].data[2]).toBe(0);
    expect(runtime.blendedPalettes).toEqual([
      { offset: OBJ_PLTT_ID(3) + 2, count: 1, coefficient: 0, color: RGB(20, 27, 31) }
    ]);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });

  test('AnimTask_LevelUpHealthBox initializes windowed BG overlay and cloned healthbox sprites', () => {
    const healthbox = createBallParticleSprite(10, 40, 50);
    const sideSprite = createBallParticleSprite(11, 44, 51);
    const barSprite = createBallParticleSprite(12, 48, 52);
    healthbox.oam.affineParam = 11;
    healthbox.data[5] = 12;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      healthboxSpriteIds: { 2: 10 },
      battleAnimBg1Data: { bgId: 1, paletteId: 3, tilesOffset: 0x240 },
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite }),
      tasks: [createRuntimeTask()]
    });

    AnimTask_LevelUpHealthBox(runtime, 0);

    expect(runtime.battle_WIN0H).toBe(0);
    expect(runtime.battle_WIN0V).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_WININ]).toBe(0x3f3f);
    expect(runtime.gpuRegs[REG_OFFSET_WINOUT]).toBe(0x3f3d);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(DISPCNT_OBJWIN_ON);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(0, 16));
    expect(runtime.animBgAttributes).toEqual([
      { bgId: 1, attributeId: BG_ANIM_PRIORITY, value: 0 },
      { bgId: 1, attributeId: BG_ANIM_SCREEN_SIZE, value: 0 },
      { bgId: 1, attributeId: BG_ANIM_AREA_OVERFLOW_MODE, value: 1 },
      { bgId: 1, attributeId: BG_ANIM_CHAR_BASE_BLOCK, value: 1 }
    ]);
    expect(healthbox.oam.priority).toBe(1);
    expect(sideSprite.oam.priority).toBe(1);
    expect(barSprite.oam.priority).toBe(1);
    expect(runtime.sprites[0]!.x).toBe(40);
    expect(runtime.sprites[1]!.x).toBe(44);
    expect(runtime.sprites[0]!.oam.objMode).toBe(ST_OAM_OBJ_WINDOW);
    expect(runtime.sprites[1]!.oam.objMode).toBe(ST_OAM_OBJ_WINDOW);
    expect(runtime.sprites[0]!.callback).toBe('SpriteCallbackDummy');
    expect(runtime.sprites[1]!.callback).toBe('SpriteCallbackDummy');
    expect(runtime.loadedBgTilemaps).toEqual([{ bgId: 1, src: 'gUnusedLevelupAnimationTilemap' }]);
    expect(runtime.loadedBgGfx).toEqual([{ bgId: 1, src: 'gUnusedLevelupAnimationGfx', tilesOffset: 0x240 }]);
    expect(runtime.loadedCompressedPalettes).toEqual([
      { src: 'gCureBubblesPal', offset: BG_PLTT_ID(3), size: PLTT_SIZE_4BPP }
    ]);
    expect(runtime.battle_BG1_X).toBe(-8);
    expect(runtime.battle_BG1_Y).toBe(-82);
    expect(runtime.tasks[0].data[1]).toBe(640);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].data[2]).toBe(1);
    expect(runtime.tasks[0].func).toBe('AnimTask_UnusedLevelUpHealthBox_Step');
  });

  test('AnimTask_UnusedLevelUpHealthBox_Step scrolls BG and fades in every third tick', () => {
    const runtime = createBattleAnimSpecialRuntime({
      battle_BG1_Y: 10,
      tasks: [createRuntimeTask({ 1: 640, 11: 2, 12: 7, 15: 0 })]
    });

    AnimTask_UnusedLevelUpHealthBox_Step(runtime, 0);

    expect(runtime.battle_BG1_Y).toBe(12);
    expect(runtime.tasks[0].data[13]).toBe(128);
    expect(runtime.tasks[0].data[11]).toBe(0);
    expect(runtime.tasks[0].data[12]).toBe(8);
    expect(runtime.tasks[0].data[15]).toBe(1);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(8, 8));
  });

  test('AnimTask_UnusedLevelUpHealthBox_Step waits thirty frames in hold state', () => {
    const runtime = createBattleAnimSpecialRuntime({
      tasks: [createRuntimeTask({ 10: 29, 15: 1 })]
    });

    AnimTask_UnusedLevelUpHealthBox_Step(runtime, 0);

    expect(runtime.tasks[0].data[10]).toBe(30);
    expect(runtime.tasks[0].data[15]).toBe(2);
  });

  test('AnimTask_UnusedLevelUpHealthBox_Step restores BG/window state and destroys temp sprites at fade-out end', () => {
    const healthbox = createBallParticleSprite(10);
    const sideSprite = createBallParticleSprite(11);
    const barSprite = createBallParticleSprite(12);
    const tempHealthbox = createBallParticleSprite(20);
    const tempSide = createBallParticleSprite(21);
    healthbox.oam.affineParam = 11;
    healthbox.data[5] = 12;
    healthbox.oam.priority = 0;
    sideSprite.oam.priority = 0;
    barSprite.oam.priority = 0;
    const runtime = createBattleAnimSpecialRuntime({
      battleAnimAttacker: 2,
      healthboxSpriteIds: { 2: 10 },
      gpuRegs: { [REG_OFFSET_DISPCNT]: DISPCNT_OBJWIN_ON },
      sprites: Object.assign([], { 10: healthbox, 11: sideSprite, 12: barSprite, 20: tempHealthbox, 21: tempSide }),
      tasks: [createRuntimeTask({ 0: 20, 2: 21, 11: 2, 12: 1, 15: 2 })]
    });

    AnimTask_UnusedLevelUpHealthBox_Step(runtime, 0);

    expect(runtime.tasks[0].data[11]).toBe(0);
    expect(runtime.tasks[0].data[12]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(0, 0));
    expect(runtime.resetBattleAnimBgs).toEqual([0]);
    expect(runtime.gpuRegs[REG_OFFSET_WININ]).toBe(0x3f3f);
    expect(runtime.gpuRegs[REG_OFFSET_WINOUT]).toBe(0x3f3f);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.animBgAttributes).toEqual([
      { bgId: 1, attributeId: BG_ANIM_CHAR_BASE_BLOCK, value: 0 },
      { bgId: 1, attributeId: BG_ANIM_AREA_OVERFLOW_MODE, value: 0 }
    ]);
    expect(tempHealthbox.destroyed).toBe(true);
    expect(tempSide.destroyed).toBe(true);
    expect(runtime.destroyedSprites).toEqual([20, 21]);
    expect(healthbox.oam.priority).toBe(1);
    expect(sideSprite.oam.priority).toBe(1);
    expect(barSprite.oam.priority).toBe(1);
    expect(runtime.destroyedVisualTasks).toEqual([0]);
  });
});
