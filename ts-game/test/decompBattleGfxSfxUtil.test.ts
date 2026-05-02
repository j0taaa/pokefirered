import { describe, expect, test } from 'vitest';
import * as battleGfxSfxUtil from '../src/game/decompBattleGfxSfxUtil';
import {
  B_ANIM_CASTFORM_CHANGE,
  B_ANIM_HAIL_CONTINUES,
  B_ANIM_STATUS_BRN,
  B_ANIM_STATUS_CONFUSION,
  B_ANIM_STATUS_FRZ,
  B_ANIM_STATUS_INFATUATION,
  B_ANIM_STATUS_PSN,
  B_ANIM_STATUS_SLP,
  B_ANIM_SUBSTITUTE_FADE,
  BATTLE_TYPE_SAFARI,
  HP_BAR_GREEN,
  HP_BAR_RED,
  HP_BAR_YELLOW,
  MOVE_SUBSTITUTE,
  SE_LOW_HEALTH,
  SPECIES_CASTFORM,
  SPECIES_NONE,
  STATUS1_BURN,
  STATUS1_FREEZE,
  STATUS1_PARALYSIS,
  STATUS1_POISON,
  STATUS1_SLEEP,
  STATUS1_TOXIC_POISON,
  STATUS1_TOXIC_COUNTER,
  STATUS2_CONFUSION,
  STATUS2_INFATUATION,
  ST_OAM_AFFINE_OFF,
  allocateBattleSpritesData,
  allocateMonSpritesGfx,
  battleGfxSfxDummy3,
  battleInitAllSprites,
  battleInterfaceSetWindowPals,
  battleLoadAllHealthBoxesGfx,
  battleLoadOpponentMonSpriteGfx,
  battleLoadPlayerMonSpriteGfx,
  battleLoadSubstituteOrMonSpriteGfx,
  battleStopLowHpSound,
  clearBehindSubstituteBit,
  clearSpritesHealthboxAnimData,
  clearTemporarySpeciesSpriteData,
  copyAllBattleSpritesInvisibilities,
  copyBattleSpriteInvisibility,
  createBattleGfxRuntime,
  decompressGhostFrontPic,
  decompressTrainerBackPalette,
  decompressTrainerFrontPic,
  freeBattleSpritesData,
  freeMonSpritesGfx,
  freeTrainerFrontPicPaletteAndTile,
  getHPBarLevel,
  handleBattleLowHpMusicChange,
  handleLowHpMusicChange,
  handleSpeciesGfxDataChange,
  hideBattlerShadowSprite,
  initAndLaunchChosenStatusAnimation,
  initAndLaunchSpecialAnimation,
  isBattleSEPlaying,
  isMoveWithoutAnimation,
  loadAndCreateEnemyShadowSprites,
  loadBattleBarGfx,
  loadBattleMonGfxAndAnimate,
  sSpritePalettes_HealthBoxHealthBar,
  sSpriteSheet_SafariHealthbox,
  sSpriteSheet_SinglesOpponentHealthbox,
  sSpriteSheet_SinglesPlayerHealthbox,
  sSpriteSheets_DoublesOpponentHealthbox,
  sSpriteSheets_DoublesPlayerHealthbox,
  sSpriteSheets_HealthBar,
  setBattlerShadowSpriteCallback,
  setBattlerSpriteAffineMode,
  shouldAnimBeDoneRegardlessOfSubstitute,
  shouldPlayNormalMonCry,
  spriteCBEnemyShadow,
  spriteCBSetInvisible,
  spriteCBTrainerSlideIn,
  spriteCBWaitForBattlerBallReleaseAnim,
  taskClearBitWhenBattleTableAnimDone,
  taskClearBitWhenSpecialAnimDone,
  tryHandleLaunchBattleTableAnimation,
  trySetBehindSubstituteSpriteBit
} from '../src/game/decompBattleGfxSfxUtil';

const runtimeWithData = () => {
  const runtime = createBattleGfxRuntime({
    playerParty: [{ species: 25, personality: 11, otId: 1, hp: 10, maxHP: 100, status: 0 }, { species: 26, personality: 12, otId: 2, hp: 80, maxHP: 100, status: 0 }],
    enemyParty: [{ species: 150, personality: 22, otId: 3, hp: 80, maxHP: 100, status: 0 }, { species: 151, personality: 23, otId: 4, hp: 80, maxHP: 100, status: 0 }]
  });
  allocateBattleSpritesData(runtime);
  return runtime;
};

describe('decomp battle_gfx_sfx_util', () => {
  test('exports exact C battle gfx/sfx names as aliases of the implemented logic', () => {
    expect(battleGfxSfxUtil.AllocateBattleSpritesData).toBe(battleGfxSfxUtil.allocateBattleSpritesData);
    expect(battleGfxSfxUtil.FreeBattleSpritesData).toBe(battleGfxSfxUtil.freeBattleSpritesData);
    expect(battleGfxSfxUtil.SpriteCB_WaitForBattlerBallReleaseAnim).toBe(battleGfxSfxUtil.spriteCBWaitForBattlerBallReleaseAnim);
    expect(battleGfxSfxUtil.DoBattleSpriteAffineAnim).toBe(battleGfxSfxUtil.doBattleSpriteAffineAnim);
    expect(battleGfxSfxUtil.SpriteCB_TrainerSlideIn).toBe(battleGfxSfxUtil.spriteCBTrainerSlideIn);
    expect(battleGfxSfxUtil.InitAndLaunchChosenStatusAnimation).toBe(battleGfxSfxUtil.initAndLaunchChosenStatusAnimation);
    expect(battleGfxSfxUtil.TryHandleLaunchBattleTableAnimation).toBe(battleGfxSfxUtil.tryHandleLaunchBattleTableAnimation);
    expect(battleGfxSfxUtil.Task_ClearBitWhenBattleTableAnimDone).toBe(battleGfxSfxUtil.taskClearBitWhenBattleTableAnimDone);
    expect(battleGfxSfxUtil.ShouldAnimBeDoneRegardlessOfSubsitute).toBe(battleGfxSfxUtil.shouldAnimBeDoneRegardlessOfSubstitute);
    expect(battleGfxSfxUtil.InitAndLaunchSpecialAnimation).toBe(battleGfxSfxUtil.initAndLaunchSpecialAnimation);
    expect(battleGfxSfxUtil.Task_ClearBitWhenSpecialAnimDone).toBe(battleGfxSfxUtil.taskClearBitWhenSpecialAnimDone);
    expect(battleGfxSfxUtil.IsMoveWithoutAnimation).toBe(battleGfxSfxUtil.isMoveWithoutAnimation);
    expect(battleGfxSfxUtil.IsBattleSEPlaying).toBe(battleGfxSfxUtil.isBattleSEPlaying);
    expect(battleGfxSfxUtil.BattleLoadOpponentMonSpriteGfx).toBe(battleGfxSfxUtil.battleLoadOpponentMonSpriteGfx);
    expect(battleGfxSfxUtil.BattleLoadPlayerMonSpriteGfx).toBe(battleGfxSfxUtil.battleLoadPlayerMonSpriteGfx);
    expect(battleGfxSfxUtil.DecompressGhostFrontPic).toBe(battleGfxSfxUtil.decompressGhostFrontPic);
    expect(battleGfxSfxUtil.DecompressTrainerFrontPic).toBe(battleGfxSfxUtil.decompressTrainerFrontPic);
    expect(battleGfxSfxUtil.DecompressTrainerBackPalette).toBe(battleGfxSfxUtil.decompressTrainerBackPalette);
    expect(battleGfxSfxUtil.BattleGfxSfxDummy3).toBe(battleGfxSfxUtil.battleGfxSfxDummy3);
    expect(battleGfxSfxUtil.FreeTrainerFrontPicPaletteAndTile).toBe(battleGfxSfxUtil.freeTrainerFrontPicPaletteAndTile);
    expect(battleGfxSfxUtil.BattleLoadAllHealthBoxesGfxAtOnce).toBe(battleGfxSfxUtil.battleLoadAllHealthBoxesGfxAtOnce);
    expect(battleGfxSfxUtil.BattleLoadAllHealthBoxesGfx).toBe(battleGfxSfxUtil.battleLoadAllHealthBoxesGfx);
    expect(battleGfxSfxUtil.LoadBattleBarGfx).toBe(battleGfxSfxUtil.loadBattleBarGfx);
    expect(battleGfxSfxUtil.BattleInitAllSprites).toBe(battleGfxSfxUtil.battleInitAllSprites);
    expect(battleGfxSfxUtil.ClearSpritesHealthboxAnimData).toBe(battleGfxSfxUtil.clearSpritesHealthboxAnimData);
    expect(battleGfxSfxUtil.ClearSpritesBattlerHealthboxAnimData).toBe(battleGfxSfxUtil.clearSpritesBattlerHealthboxAnimData);
    expect(battleGfxSfxUtil.CopyAllBattleSpritesInvisibilities).toBe(battleGfxSfxUtil.copyAllBattleSpritesInvisibilities);
    expect(battleGfxSfxUtil.CopyBattleSpriteInvisibility).toBe(battleGfxSfxUtil.copyBattleSpriteInvisibility);
    expect(battleGfxSfxUtil.HandleSpeciesGfxDataChange).toBe(battleGfxSfxUtil.handleSpeciesGfxDataChange);
    expect(battleGfxSfxUtil.BattleLoadSubstituteOrMonSpriteGfx).toBe(battleGfxSfxUtil.battleLoadSubstituteOrMonSpriteGfx);
    expect(battleGfxSfxUtil.LoadBattleMonGfxAndAnimate).toBe(battleGfxSfxUtil.loadBattleMonGfxAndAnimate);
    expect(battleGfxSfxUtil.TrySetBehindSubstituteSpriteBit).toBe(battleGfxSfxUtil.trySetBehindSubstituteSpriteBit);
    expect(battleGfxSfxUtil.ClearBehindSubstituteBit).toBe(battleGfxSfxUtil.clearBehindSubstituteBit);
    expect(battleGfxSfxUtil.HandleLowHpMusicChange).toBe(battleGfxSfxUtil.handleLowHpMusicChange);
    expect(battleGfxSfxUtil.BattleStopLowHpSound).toBe(battleGfxSfxUtil.battleStopLowHpSound);
    expect(battleGfxSfxUtil.GetMonHPBarLevel).toBe(battleGfxSfxUtil.getMonHPBarLevel);
    expect(battleGfxSfxUtil.HandleBattleLowHpMusicChange).toBe(battleGfxSfxUtil.handleBattleLowHpMusicChange);
    expect(battleGfxSfxUtil.SetBattlerSpriteAffineMode).toBe(battleGfxSfxUtil.setBattlerSpriteAffineMode);
    expect(battleGfxSfxUtil.LoadAndCreateEnemyShadowSprites).toBe(battleGfxSfxUtil.loadAndCreateEnemyShadowSprites);
    expect(battleGfxSfxUtil.SpriteCB_EnemyShadow).toBe(battleGfxSfxUtil.spriteCBEnemyShadow);
    expect(battleGfxSfxUtil.SpriteCB_SetInvisible).toBe(battleGfxSfxUtil.spriteCBSetInvisible);
    expect(battleGfxSfxUtil.SetBattlerShadowSpriteCallback).toBe(battleGfxSfxUtil.setBattlerShadowSpriteCallback);
    expect(battleGfxSfxUtil.HideBattlerShadowSprite).toBe(battleGfxSfxUtil.hideBattlerShadowSprite);
    expect(battleGfxSfxUtil.BattleInterfaceSetWindowPals).toBe(battleGfxSfxUtil.battleInterfaceSetWindowPals);
    expect(battleGfxSfxUtil.ClearTemporarySpeciesSpriteData).toBe(battleGfxSfxUtil.clearTemporarySpeciesSpriteData);
    expect(battleGfxSfxUtil.AllocateMonSpritesGfx).toBe(battleGfxSfxUtil.allocateMonSpritesGfx);
    expect(battleGfxSfxUtil.FreeMonSpritesGfx).toBe(battleGfxSfxUtil.freeMonSpritesGfx);
    expect(battleGfxSfxUtil.ShouldPlayNormalMonCry).toBe(battleGfxSfxUtil.shouldPlayNormalMonCry);
  });

  test('unused exact C helpers preserve affine, eager healthbox, and HP-bar wrapper behavior', () => {
    const runtime = runtimeWithData();
    const sprite = runtime.gSprites[5];
    sprite.callback = 'old';
    battleGfxSfxUtil.DoBattleSpriteAffineAnim(runtime, sprite, false);
    expect(sprite.animPaused).toBe(1);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
    expect(runtime.operations.slice(-2)).toEqual(['StartSpriteAffineAnim(sprite, 1)', 'AnimateSprite(sprite)']);

    runtime.operations = [];
    runtime.isDoubleBattle = false;
    battleGfxSfxUtil.BattleLoadAllHealthBoxesGfxAtOnce(runtime);
    expect(runtime.operations).toEqual([
      'LoadSpritePalette(TAG_HEALTHBOX_PAL)',
      'LoadSpritePalette(TAG_HEALTHBAR_PAL)',
      'LoadCompressedSpriteSheet(TAG_HEALTHBOX_PLAYER1_TILE)',
      'LoadCompressedSpriteSheet(TAG_HEALTHBOX_OPPONENT1_TILE)',
      'LoadCompressedSpriteSheet(TAG_HEALTHBAR_PLAYER1_TILE)',
      'LoadCompressedSpriteSheet(TAG_HEALTHBAR_OPPONENT1_TILE)'
    ]);
    expect(battleGfxSfxUtil.GetMonHPBarLevel({ species: 1, personality: 0, otId: 0, hp: 60, maxHP: 100, status: 0 })).toBe(HP_BAR_GREEN);
  });

  test('static healthbox sheet and palette descriptors preserve C sizes and tags', () => {
    expect(sSpriteSheet_SinglesPlayerHealthbox).toEqual({ data: 'gHealthboxSinglesPlayerGfx', size: 0x1000, tag: 'TAG_HEALTHBOX_PLAYER1_TILE' });
    expect(sSpriteSheet_SinglesOpponentHealthbox).toEqual({ data: 'gHealthboxSinglesOpponentGfx', size: 0x1000, tag: 'TAG_HEALTHBOX_OPPONENT1_TILE' });
    expect(sSpriteSheets_DoublesPlayerHealthbox.map((sheet) => sheet.size)).toEqual([0x800, 0x800]);
    expect(sSpriteSheets_DoublesOpponentHealthbox.map((sheet) => sheet.tag)).toEqual(['TAG_HEALTHBOX_OPPONENT1_TILE', 'TAG_HEALTHBOX_OPPONENT2_TILE']);
    expect(sSpriteSheet_SafariHealthbox.size).toBe(0x1000);
    expect(sSpriteSheets_HealthBar.map((sheet) => sheet.size)).toEqual([0x100, 0x120, 0x100, 0x120]);
    expect(sSpritePalettes_HealthBoxHealthBar.map((pal) => pal.tag)).toEqual(['TAG_HEALTHBOX_PAL', 'TAG_HEALTHBAR_PAL']);
  });

  test('allocation/free mirrors top-level pointer lifecycle', () => {
    const runtime = createBattleGfxRuntime();
    allocateBattleSpritesData(runtime);
    expect(runtime.gBattleSpritesDataPtr?.battlerData).toHaveLength(4);
    expect(runtime.gBattleSpritesDataPtr?.healthBoxesData).toHaveLength(4);
    freeBattleSpritesData(runtime);
    expect(runtime.gBattleSpritesDataPtr).toBeNull();
  });

  test('SpriteCB_WaitForBattlerBallReleaseAnim waits on affine/invisible/pause then idles target', () => {
    const runtime = runtimeWithData();
    const waiter = runtime.gSprites[10];
    waiter.data[1] = 1;
    runtime.gSprites[1].affineAnimEnded = false;
    spriteCBWaitForBattlerBallReleaseAnim(runtime, waiter);
    expect(waiter.callback).toBe('SpriteCallbackDummy');
    runtime.gSprites[1].affineAnimEnded = true;
    runtime.gSprites[1].animPaused = 1;
    spriteCBWaitForBattlerBallReleaseAnim(runtime, waiter);
    expect(runtime.gSprites[1].animPaused).toBe(0);
    runtime.gSprites[1].animEnded = true;
    waiter.callback = 'waiting';
    spriteCBWaitForBattlerBallReleaseAnim(runtime, waiter);
    expect(runtime.gSprites[1].callback).toBe('SetIdleSpriteCallback');
    expect(waiter.callback).toBe('SpriteCallbackDummy');
    expect(runtime.operations.at(-1)).toBe('StartSpriteAffineAnim(1, 0)');
  });

  test('trainer slide in ignores intro flag and stops exactly when x2 reaches zero', () => {
    const runtime = runtimeWithData();
    const sprite = runtime.gSprites[0];
    sprite.data[0] = 4;
    sprite.x2 = -8;
    sprite.callback = 'SpriteCB_TrainerSlideIn';
    spriteCBTrainerSlideIn(runtime, sprite);
    expect(sprite.x2).toBe(-4);
    spriteCBTrainerSlideIn(runtime, sprite);
    expect(sprite.x2).toBe(0);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
    runtime.gIntroSlideFlags = 1;
    sprite.x2 = -4;
    spriteCBTrainerSlideIn(runtime, sprite);
    expect(sprite.x2).toBe(-4);
  });

  test('status animation priority matches status1 and status2 chains', () => {
    const runtime = runtimeWithData();
    initAndLaunchChosenStatusAnimation(runtime, false, STATUS1_FREEZE);
    initAndLaunchChosenStatusAnimation(runtime, false, STATUS1_POISON | STATUS1_TOXIC_POISON);
    initAndLaunchChosenStatusAnimation(runtime, false, STATUS1_BURN);
    initAndLaunchChosenStatusAnimation(runtime, false, STATUS1_SLEEP);
    initAndLaunchChosenStatusAnimation(runtime, false, STATUS1_PARALYSIS);
    expect(runtime.operations).toContain(`LaunchStatusAnimation(0, ${B_ANIM_STATUS_FRZ})`);
    expect(runtime.operations).toContain(`LaunchStatusAnimation(0, ${B_ANIM_STATUS_PSN})`);
    expect(runtime.operations).toContain(`LaunchStatusAnimation(0, ${B_ANIM_STATUS_BRN})`);
    expect(runtime.operations).toContain(`LaunchStatusAnimation(0, ${B_ANIM_STATUS_SLP})`);

    runtime.operations = [];
    initAndLaunchChosenStatusAnimation(runtime, true, STATUS2_INFATUATION | STATUS2_CONFUSION);
    expect(runtime.operations).toEqual([`LaunchStatusAnimation(0, ${B_ANIM_STATUS_INFATUATION})`]);
    initAndLaunchChosenStatusAnimation(runtime, true, STATUS2_CONFUSION);
    expect(runtime.operations.at(-1)).toBe(`LaunchStatusAnimation(0, ${B_ANIM_STATUS_CONFUSION})`);
    initAndLaunchChosenStatusAnimation(runtime, false, 0);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[0].statusAnimActive).toBe(0);
  });

  test('battle table animation handles Castform, substitute skip, substitute fade, and task launch', () => {
    const runtime = runtimeWithData();
    expect(tryHandleLaunchBattleTableAnimation(runtime, 1, 2, 3, B_ANIM_CASTFORM_CHANGE, 0x82)).toBe(true);
    expect(runtime.gBattleMonForms[1]).toBe(2);

    runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute = 1;
    expect(tryHandleLaunchBattleTableAnimation(runtime, 1, 2, 3, 99, 5)).toBe(true);
    expect(shouldAnimBeDoneRegardlessOfSubstitute(B_ANIM_HAIL_CONTINUES)).toBe(true);

    runtime.gSprites[runtime.gBattlerSpriteIds[1]].invisible = true;
    expect(tryHandleLaunchBattleTableAnimation(runtime, 1, 2, 3, B_ANIM_SUBSTITUTE_FADE, 5)).toBe(true);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute).toBe(0);

    expect(tryHandleLaunchBattleTableAnimation(runtime, 1, 2, 3, 99, 123)).toBe(false);
    expect(runtime.gBattleAnimAttacker).toBe(2);
    expect(runtime.gBattleAnimTarget).toBe(3);
    expect(runtime.gBattleSpritesDataPtr!.animationData.animArg).toBe(123);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[1].animFromTableActive).toBe(1);
    taskClearBitWhenBattleTableAnimDone(runtime, 0);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[1].animFromTableActive).toBe(0);
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('special animation task clears only after anim script becomes inactive', () => {
    const runtime = runtimeWithData();
    initAndLaunchSpecialAnimation(runtime, 2, 0, 1, 9);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[2].specialAnimActive).toBe(1);
    runtime.gAnimScriptActive = true;
    taskClearBitWhenSpecialAnimDone(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(false);
    runtime.gAnimScriptActive = false;
    taskClearBitWhenSpecialAnimDone(runtime, 0);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[2].specialAnimActive).toBe(0);
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('IsBattleSEPlaying preserves the gActiveBattler timer quirk and stop threshold', () => {
    const runtime = runtimeWithData();
    runtime.sePlaying = true;
    runtime.gActiveBattler = 0;
    expect(isBattleSEPlaying(runtime, 1)).toBe(true);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[1].soundTimer).toBe(1);
    runtime.gBattleSpritesDataPtr!.healthBoxesData[0].soundTimer = 30;
    expect(isBattleSEPlaying(runtime, 1)).toBe(false);
    expect(runtime.operations.slice(-2)).toEqual(['m4aMPlayStop(SE1)', 'm4aMPlayStop(SE2)']);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[1].soundTimer).toBe(0);
    expect(isMoveWithoutAnimation(1, 2)).toBe(false);
  });

  test('mon/trainer/ghost loading record transform and Castform palette branches', () => {
    const runtime = runtimeWithData();
    battleLoadOpponentMonSpriteGfx(runtime, runtime.enemyParty[0], 1);
    expect(runtime.operations[0]).toBe('HandleLoadSpecialPokePic_front(150, 22)');
    runtime.operations = [];
    runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies = SPECIES_CASTFORM;
    runtime.gBattleMonForms[1] = 3;
    battleLoadOpponentMonSpriteGfx(runtime, runtime.enemyParty[0], 1);
    expect(runtime.operations).toContain('LoadCastformPalette(3)');
    expect(runtime.operations).toContain('BlendPalette(1, 16, 6, RGB_WHITE)');
    runtime.operations = [];
    battleLoadPlayerMonSpriteGfx(runtime, runtime.playerParty[0], 0);
    decompressGhostFrontPic(runtime, null, 1);
    decompressTrainerFrontPic(runtime, 7, 1);
    decompressTrainerBackPalette(runtime, 8, 2);
    freeTrainerFrontPicPaletteAndTile(runtime, 7);
    battleGfxSfxDummy3(0);
    expect(runtime.operations).toContain('HandleLoadSpecialPokePic_back(25, 11)');
    expect(runtime.operations).toContain('LZ77UnCompWram(gGhostFrontPic, position=1)');
    expect(runtime.operations).toContain('LoadSpriteSheet(7)');
    expect(runtime.operations).toContain('LoadCompressedPalette(trainerBack=8, OBJ_PLTT_ID2(2))');
  });

  test('healthbox graphics and sprite initialization follow single, safari, and double state ranges', () => {
    const runtime = runtimeWithData();
    expect(battleLoadAllHealthBoxesGfx(runtime, 0)).toBe(false);
    expect(battleLoadAllHealthBoxesGfx(runtime, 1)).toBe(false);
    runtime.gBattleTypeFlags = BATTLE_TYPE_SAFARI;
    battleLoadAllHealthBoxesGfx(runtime, 2);
    expect(runtime.operations.at(-1)).toBe('LoadCompressedSpriteSheet(TAG_HEALTHBOX_SAFARI_TILE)');
    expect(battleLoadAllHealthBoxesGfx(runtime, 6)).toBe(true);

    const doubleRuntime = runtimeWithData();
    doubleRuntime.isDoubleBattle = true;
    expect(battleLoadAllHealthBoxesGfx(doubleRuntime, 9)).toBe(false);
    expect(battleLoadAllHealthBoxesGfx(doubleRuntime, 10)).toBe(true);

    const state = { value: 0 };
    const battlerId = { value: 0 };
    battleInitAllSprites(runtime, state, battlerId);
    expect(state.value).toBe(1);
    while (state.value < 6) battleInitAllSprites(runtime, state, battlerId);
    expect(battleInitAllSprites(runtime, state, battlerId)).toBe(true);
    expect(runtime.operations).toContain('BufferBattlePartyCurrentOrder');
  });

  test('sprite data clearing and invisibility copies use battler sprite ids', () => {
    const runtime = runtimeWithData();
    runtime.gBattleSpritesDataPtr!.healthBoxesData[0].statusAnimActive = 1;
    clearSpritesHealthboxAnimData(runtime);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[0].statusAnimActive).toBe(0);
    runtime.gSprites[0].invisible = true;
    copyBattleSpriteInvisibility(runtime, 0);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[0].invisible).toBe(true);
    runtime.gSprites[1].invisible = true;
    copyAllBattleSpritesInvisibilities(runtime);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].invisible).toBe(true);
  });

  test('species gfx change covers ghost unveil, Castform form change, and transform move', () => {
    const runtime = runtimeWithData();
    handleSpeciesGfxDataChange(runtime, 1, 0, 255);
    expect(runtime.operations.at(-1)).toBe('GhostUnveil(1, species=150)');
    runtime.gBattleSpritesDataPtr!.animationData.animArg = 2;
    runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies = SPECIES_CASTFORM;
    handleSpeciesGfxDataChange(runtime, 1, 0, 1);
    expect(runtime.gBattleMonForms[1]).toBe(2);
    expect(runtime.operations).toContain('BlendPalette(1, 16, 6, RGB_WHITE)');
    runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies = SPECIES_NONE;
    handleSpeciesGfxDataChange(runtime, 1, 0, 0);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies).toBe(25);
    expect(runtime.gBattleMonForms[1]).toBe(runtime.gBattleMonForms[0]);
  });

  test('substitute and mon sprite loading set y from loadMonSprite branch and substitute bit only for Substitute move', () => {
    const runtime = runtimeWithData();
    battleLoadSubstituteOrMonSpriteGfx(runtime, 1, false);
    expect(runtime.operations).toContain('LZDecompressVram(gSubstituteDollFrontGfx)');
    loadBattleMonGfxAndAnimate(runtime, 1, false, 1);
    expect(runtime.gSprites[1].y).toBe(81);
    loadBattleMonGfxAndAnimate(runtime, 1, true, 1);
    expect(runtime.gSprites[1].y).toBe(41);
    trySetBehindSubstituteSpriteBit(runtime, 1, 1);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute).toBe(0);
    trySetBehindSubstituteSpriteBit(runtime, 1, MOVE_SUBSTITUTE);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute).toBe(1);
    clearBehindSubstituteBit(runtime, 1);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute).toBe(0);
  });

  test('low HP music starts/stops with flank and double-battle checks', () => {
    const runtime = runtimeWithData();
    expect(getHPBarLevel(1, 100)).toBe(HP_BAR_RED);
    expect(getHPBarLevel(40, 100)).toBe(HP_BAR_YELLOW);
    expect(getHPBarLevel(80, 100)).toBe(HP_BAR_GREEN);
    handleLowHpMusicChange(runtime, { species: 1, personality: 0, otId: 0, hp: 1, maxHP: 100, status: 0 }, 0);
    expect(runtime.operations.at(-1)).toBe(`PlaySE(${SE_LOW_HEALTH})`);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[0].lowHpSong).toBe(1);
    runtime.operations = [];
    handleLowHpMusicChange(runtime, { species: 1, personality: 0, otId: 0, hp: 80, maxHP: 100, status: 0 }, 0);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStop(${SE_LOW_HEALTH})`);
    battleStopLowHpSound(runtime);
    expect(runtime.operations.at(-1)).toBe(`m4aSongNumStop(${SE_LOW_HEALTH})`);
    runtime.playerParty[0].hp = 1;
    handleBattleLowHpMusicChange(runtime);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[0].lowHpSong).toBe(1);
  });

  test('affine mode preserves/restores matrix numbers', () => {
    const runtime = runtimeWithData();
    runtime.gSprites[0].oam.matrixNum = 7;
    setBattlerSpriteAffineMode(runtime, ST_OAM_AFFINE_OFF);
    expect(runtime.gBattleSpritesDataPtr!.healthBoxesData[0].matrixNum).toBe(7);
    expect(runtime.gSprites[0].oam.matrixNum).toBe(0);
    setBattlerSpriteAffineMode(runtime, 1);
    expect(runtime.gSprites[0].oam.matrixNum).toBe(7);
  });

  test('enemy shadows create opponent sprites and visibility follows anim, transform elevation, substitute, and missing sprite', () => {
    const runtime = runtimeWithData();
    runtime.isDoubleBattle = true;
    loadAndCreateEnemyShadowSprites(runtime);
    const shadowId = runtime.gBattleSpritesDataPtr!.healthBoxesData[1].shadowSpriteId;
    expect(runtime.gSprites[shadowId].data[0]).toBe(1);
    setBattlerShadowSpriteCallback(runtime, 1, 150);
    expect(runtime.gSprites[shadowId].callback).toBe('SpriteCB_SetInvisible');
    runtime.enemyMonElevation[150] = 4;
    setBattlerShadowSpriteCallback(runtime, 1, 150);
    expect(runtime.gSprites[shadowId].callback).toBe('SpriteCB_EnemyShadow');
    runtime.gSprites[1].x = 33;
    runtime.gSprites[1].x2 = 4;
    spriteCBEnemyShadow(runtime, runtime.gSprites[shadowId]);
    expect(runtime.gSprites[shadowId]).toMatchObject({ x: 33, x2: 4, invisible: false });
    runtime.gAnimScriptActive = true;
    spriteCBEnemyShadow(runtime, runtime.gSprites[shadowId]);
    expect(runtime.gSprites[shadowId].invisible).toBe(true);
    runtime.gSprites[1].inUse = false;
    spriteCBEnemyShadow(runtime, runtime.gSprites[shadowId]);
    expect(runtime.gSprites[shadowId].callback).toBe('SpriteCB_SetInvisible');
    spriteCBSetInvisible(runtime.gSprites[shadowId]);
    expect(runtime.gSprites[shadowId].invisible).toBe(true);
    hideBattlerShadowSprite(runtime, 1);
    expect(runtime.gSprites[shadowId].callback).toBe('SpriteCB_SetInvisible');
  });

  test('BattleInterfaceSetWindowPals fills zero nibbles with F for first block and 6 for second', () => {
    const runtime = runtimeWithData();
    runtime.vram240[0] = 0x0000;
    runtime.vram240[1] = 0x1200;
    runtime.vram600[0] = 0x0000;
    runtime.vram600[1] = 0x1200;
    battleInterfaceSetWindowPals(runtime);
    expect(runtime.vram240[0]).toBe(0xffff);
    expect(runtime.vram240[1]).toBe(0x12ff);
    expect(runtime.vram600[0]).toBe(0x6666);
    expect(runtime.vram600[1]).toBe(0x1266);
  });

  test('temporary species data, mon sprite gfx allocation logs, battle bar gfx, and normal cry gate', () => {
    const runtime = runtimeWithData();
    runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies = 99;
    runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute = 1;
    runtime.gBattleMonForms[1] = 2;
    clearTemporarySpeciesSpriteData(runtime, 1, false);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].transformSpecies).toBe(SPECIES_NONE);
    expect(runtime.gBattleSpritesDataPtr!.battlerData[1].behindSubstitute).toBe(0);
    expect(runtime.gBattleMonForms[1]).toBe(0);

    allocateMonSpritesGfx(runtime);
    freeMonSpritesGfx(runtime);
    loadBattleBarGfx(runtime, 0);
    expect(runtime.operations).toContain('AllocZeroed(firstDecompressed=0x8000)');
    expect(runtime.operations).toContain('LZDecompressWram(gInterfaceGfx_HPNumbers, barFontGfx)');
    expect(shouldPlayNormalMonCry({ species: 1, personality: 0, otId: 0, hp: 80, maxHP: 100, status: 0 })).toBe(true);
    expect(shouldPlayNormalMonCry({ species: 1, personality: 0, otId: 0, hp: 40, maxHP: 100, status: 0 })).toBe(false);
    expect(shouldPlayNormalMonCry({ species: 1, personality: 0, otId: 0, hp: 80, maxHP: 100, status: STATUS1_TOXIC_COUNTER })).toBe(false);
  });
});
