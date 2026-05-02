import { describe, expect, test } from 'vitest';
import { getExperienceForLevel } from '../src/game/decompExperience';
import {
  DAYCARE_EGG_WAITING,
  DAYCARE_EXITED_LEVEL_MENU,
  DAYCARE_NO_MONS,
  DAYCARE_ONE_MON,
  DAYCARE_TWO_MONS,
  A_BUTTON,
  B_BUTTON,
  AddHatchedMonToParty,
  BufferDayCareMonReceivedMail,
  BuildEggMoveset,
  CB2_EggHatch_0,
  CB2_EggHatch_1,
  ChooseSendDaycareMon,
  COPYWIN_FULL,
  CreatedHatchedMon,
  DaycareAddTextPrinter,
  DaycareMonReceivedMail,
  DaycarePrintMonInfo,
  DaycarePrintMonLvl,
  DaycarePrintMonNickname,
  Debug_AddDaycareSteps,
  EGG_HATCH_LEVEL,
  EGG_GENDER_MALE,
  CreateEgg,
  GAME_LANGUAGE,
  GiveEggFromDaycare,
  ITEM_LAX_INCENSE,
  ITEM_NONE,
  ITEM_POKE_BALL,
  ITEM_SEA_INCENSE,
  canMonLearnTMHM,
  deleteFirstMoveAndGiveMoveToMon,
  getEggMoves as getDaycareEggMoves,
  getLevelUpMovesBySpecies,
  giveMoveToMon,
  LANGUAGE_JAPANESE,
  METLOC_SPECIAL_EGG,
  MON_ALREADY_KNOWS_MOVE,
  OT_ID_PLAYER_ID,
  USE_RANDOM_IVS,
  FONT_NORMAL_COPY_2,
  MAX_MON_MOVES,
  MAX_LEVEL,
  MOVE_NONE,
  MON_HAS_MAX_MOVES,
  MON_FEMALE,
  MON_GENDERLESS,
  MON_MALE,
  PARTY_SIZE,
  PARENTS_INCOMPATIBLE,
  PARENTS_LOW_COMPATIBILITY,
  PARENTS_MAX_COMPATIBILITY,
  PARENTS_MED_COMPATIBILITY,
  AlterEggSpeciesWithIncenseItem,
  AppendGenderSymbol,
  AppendMonGenderSymbol,
  DetermineEggSpeciesAndParentSlots,
  EggGroupsOverlap,
  GetDaycareCompatibilityScore,
  GetDaycareLevelMenuLevelText,
  GetDaycareLevelMenuText,
  IsEggPending,
  NameHasGenderSymbol,
  appendGenderSymbol,
  appendMonGenderSymbol,
  alterEggSpeciesWithIncenseItem,
  applyDaycareExperience,
  clearAllDaycareData,
  clearDaycareMon,
  clearDaycareMonMail,
  countPokemonInDaycare,
  CountPokemonInDaycare,
  createDaycareFieldRuntime,
  createDaycareHatchRuntime,
  createDaycareMenuRuntime,
  createDaycarePartyContext,
  createDaycareStringVarRuntime,
  createDaycareTextRuntime,
  createDayCare,
  createDefaultDaycareExperienceHooks,
  createEmptyDaycareMail,
  createEmptyDaycareMon,
  daycareFindEmptySpot,
  determineEggSpeciesAndParentSlots,
  eggGroupsOverlap,
  getEggSpecies,
  GetEggSpecies,
  getDaycareCompatibilityScore,
  GetDaycareCost,
  GetDaycareCompatibilityScoreFromSave,
  GetDaycareCostForMon,
  GetDaycareCostForSelectedMon,
  GetCostToWithdrawRoute5DaycareMon,
  getDaycareCostForMon,
  getDaycareCostForSelectedMon,
  getDaycareLevelMenuLevelText,
  getDaycareLevelMenuText,
  getDaycarePokemonCount,
  getDaycareState,
  getGenderFromSpeciesAndPersonality,
  GetSelectedMonNicknameAndSpecies,
  getLevelAfterDaycareSteps,
  GetNumLevelsGainedForRoute5DaycareMon,
  GetNumLevelsGainedFromDaycare,
  GetNumLevelsGainedForDaycareMon,
  getNumLevelsGainedFromSteps,
  inheritIVs,
  initDaycareMailRecordMixing,
  IsThereMonInRoute5Daycare,
  isEggPending,
  nameHasGenderSymbol,
  removeEggFromDayCare,
  RejectEggFromDayCare,
  removeIVIndexFromList,
  shiftDaycareSlots,
  StoreSelectedPokemonInDaycare,
  storePokemonInDaycare,
  storePokemonInEmptyDaycareSlot,
  PutMonInRoute5Daycare,
  SPECIES_AZURILL,
  SPECIES_DITTO,
  SPECIES_ILLUMISE,
  SPECIES_MARILL,
  SPECIES_NIDORAN_F,
  SPECIES_NIDORAN_M,
  SPECIES_NONE,
  SPECIES_PICHU,
  SPECIES_PIKACHU,
  SPECIES_VOLBEAT,
  SPECIES_WOBBUFFET,
  SPECIES_WYNAUT,
  CreateEggShardSprite,
  CreateRandomEggShardSprite,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_OBJ_ON,
  EggHatch,
  EggHatchCreateMonSprite,
  EggHatchPrintMessage,
  EggHatchSetMonNickname,
  PALETTES_ALL,
  MUS_EVOLVED,
  MUS_EVOLUTION,
  MUS_EVOLUTION_INTRO,
  NAMING_SCREEN_NICKNAME,
  SE_BALL,
  SE_EGG_HATCH,
  SPRITE_SHAPE_32x32,
  SPRITE_SHAPE_8x8,
  SPRITE_SIZE_32x32,
  SPRITE_SIZE_8x8,
  ST_OAM_AFFINE_OFF,
  SpriteCB_EggShard,
  SpriteCB_Egg_0,
  SpriteCB_Egg_1,
  SpriteCB_Egg_2,
  SpriteCB_Egg_3,
  SpriteCB_Egg_4,
  SpriteCB_Egg_5,
  createEggHatchRuntime,
  sBgTemplates_EggHatch,
  sCompatibilityMessages,
  sDaycareLevelMenuWindowTemplate,
  sDaycareListMenuLevelTemplate,
  sEggHatchTiles,
  sEggHatch_Sheet,
  sEggPalette,
  sEggShardTiles,
  sEggShards_Sheet,
  sEgg_SpritePalette,
  sJapaneseEggNickname,
  sLevelMenuItems,
  sNewLineText,
  sOamData_EggHatch,
  sOamData_EggShard,
  sSpriteAnimTable_EggHatch,
  sSpriteAnimTable_EggShard,
  sSpriteTemplate_EggHatch,
  sSpriteTemplate_EggShard,
  sWinTemplates_EggHatch,
  sYesNoWinTemplate,
  sEggShardVelocities,
  ScriptHatchMon,
  SetDaycareCompatibilityString,
  SetInitialEggData,
  ShowDaycareLevelMenu,
  ShouldEggHatch,
  Task_EggHatch,
  Task_EggHatchPlayBGM,
  Task_HandleDaycareLevelMenuInput,
  TakePokemonFromRoute5Daycare,
  TakePokemonFromDaycare,
  takeSelectedPokemonFromDaycare,
  takeSelectedPokemonMonFromDaycareShiftSlots,
  _GiveEggFromDaycare,
  GetDaycareMonNicknames,
  _GetDaycareMonNicknames,
  _TriggerPendingDaycareEgg,
  _TriggerPendingDaycareMaleEgg,
  triggerPendingDaycareEgg,
  triggerPendingDaycareMaleEgg,
  TryProduceOrHatchEgg,
  VBlankCB_EggHatch,
  type EvolutionTable,
  type DaycareBoxMon,
  type DaycareMon
} from '../src/game/decompDaycare';

const mon = (
  species: string,
  overrides: Partial<DaycareMon['mon']> = {},
  steps = 0
): DaycareMon => ({
  mon: {
    species,
    nickname: species.replace('SPECIES_', ''),
    otId: 1,
    personality: 0,
    exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 5),
    ...overrides
  },
  steps,
  mail: createEmptyDaycareMail()
});

describe('decomp daycare', () => {
  test('exports daycare constants from constants/daycare.h', () => {
    expect(EGG_HATCH_LEVEL).toBe(5);
    expect(EGG_GENDER_MALE).toBe(0x8000);
    expect(ITEM_NONE).toBe(0);
  });

  test('static daycare menu and egg hatch graphics templates match daycare.c', () => {
    expect(sDaycareLevelMenuWindowTemplate).toEqual({
      bg: 0,
      tilemapLeft: 12,
      tilemapTop: 1,
      width: 17,
      height: 5,
      paletteNum: 15,
      baseBlock: 8
    });
    expect(sLevelMenuItems).toEqual([
      { name: '', id: 0 },
      { name: '', id: 1 },
      { name: 'EXIT', id: 5 }
    ]);
    expect(sDaycareListMenuLevelTemplate).toMatchObject({
      items: sLevelMenuItems,
      moveCursorFunc: 'ListMenuDefaultCursorMoveFunc',
      itemPrintFunc: 'DaycarePrintMonInfo',
      totalItems: 3,
      maxShowed: 3,
      windowId: 0,
      header_X: 2,
      item_X: 8,
      cursor_X: 0,
      upText_Y: 0,
      cursorPal: 2,
      fillValue: 1,
      cursorShadowPal: 3,
      lettersSpacing: 1,
      itemVerticalPadding: 0,
      scrollMultiple: 0,
      fontId: FONT_NORMAL_COPY_2,
      cursorKind: 0
    });
    expect(sCompatibilityMessages).toEqual([
      'The two seem to get along\nvery well.',
      'The two seem to get along.',
      "The two don't seem to like\neach other much.",
      'The two prefer to play with other\nPOKéMON than each other.'
    ]);
    expect(sNewLineText).toBe('\n');
    expect(sJapaneseEggNickname).toBe('タマゴ');
    expect(sEggPalette).toEqual({ incbin: 'graphics/pokemon/egg/normal.gbapal', type: 'u16' });
    expect(sEggHatchTiles).toEqual({ incbin: 'graphics/misc/egg_hatch.4bpp', type: 'u8' });
    expect(sEggShardTiles).toEqual({ incbin: 'graphics/misc/egg_shard.4bpp', type: 'u8' });

    expect(sOamData_EggHatch).toEqual({
      y: 0,
      affineMode: ST_OAM_AFFINE_OFF,
      objMode: 0,
      mosaic: false,
      bpp: 0,
      shape: SPRITE_SHAPE_32x32,
      x: 0,
      matrixNum: 0,
      size: SPRITE_SIZE_32x32,
      tileNum: 0,
      priority: 1,
      paletteNum: 0,
      affineParam: 0
    });
    expect(sSpriteAnimTable_EggHatch.map((anim) => anim[0])).toEqual([
      { frame: 0, duration: 5 },
      { frame: 16, duration: 5 },
      { frame: 32, duration: 5 },
      { frame: 48, duration: 5 }
    ]);
    expect(sEggHatch_Sheet).toEqual({ data: 'sEggHatchTiles', size: 2048, tag: 12345 });
    expect(sEggShards_Sheet).toEqual({ data: 'sEggShardTiles', size: 128, tag: 23456 });
    expect(sEgg_SpritePalette).toEqual({ data: 'sEggPalette', tag: 54321 });
    expect(sSpriteTemplate_EggHatch).toEqual({
      tileTag: 12345,
      paletteTag: 54321,
      oam: sOamData_EggHatch,
      anims: 'sSpriteAnimTable_EggHatch',
      images: null,
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'SpriteCallbackDummy'
    });

    expect(sOamData_EggShard).toMatchObject({
      affineMode: ST_OAM_AFFINE_OFF,
      shape: SPRITE_SHAPE_8x8,
      size: SPRITE_SIZE_8x8,
      priority: 2
    });
    expect(sSpriteAnimTable_EggShard.map((anim) => anim[0])).toEqual([
      { frame: 0, duration: 5 },
      { frame: 1, duration: 5 },
      { frame: 2, duration: 5 },
      { frame: 3, duration: 5 }
    ]);
    expect(sSpriteTemplate_EggShard).toEqual({
      tileTag: 23456,
      paletteTag: 54321,
      oam: sOamData_EggShard,
      anims: 'sSpriteAnimTable_EggShard',
      images: null,
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'SpriteCB_EggShard'
    });
    expect(sBgTemplates_EggHatch).toEqual([
      { bg: 0, charBaseIndex: 2, mapBaseIndex: 24, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
      { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 }
    ]);
    expect(sWinTemplates_EggHatch).toEqual([
      { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 0, baseBlock: 64 },
      'DUMMY_WIN_TEMPLATE'
    ]);
    expect(sYesNoWinTemplate).toEqual({
      bg: 0,
      tilemapLeft: 21,
      tilemapTop: 9,
      width: 6,
      height: 4,
      paletteNum: 15,
      baseBlock: 424
    });
  });

  test('counts mons, finds empty slots, and prepares record mixing mail flags exactly', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { heldItem: 0 }),
      mon('SPECIES_RATTATA', { heldItem: 42 })
    ]);
    expect(countPokemonInDaycare(daycare)).toBe(2);
    expect(CountPokemonInDaycare(daycare)).toBe(2);
    expect(daycareFindEmptySpot(daycare)).toBe(-1);
    expect(initDaycareMailRecordMixing(daycare)).toEqual({
      holdsItem: [false, true],
      numDaycareMons: 2
    });

    clearDaycareMon(daycare.mons[0]);
    expect(countPokemonInDaycare(daycare)).toBe(1);
    expect(daycareFindEmptySpot(daycare)).toBe(0);
    expect(initDaycareMailRecordMixing(daycare)).toEqual({
      holdsItem: [true, true],
      numDaycareMons: 1
    });
  });

  test('C-named selected daycare wrappers route through the same storage, cost, level, and withdraw logic', () => {
    const daycare = createDayCare();
    const partyMon = mon('SPECIES_PIKACHU', { nickname: 'PIKA', mailId: 0 }).mon;
    const partyContext = createDaycarePartyContext([partyMon, mon('SPECIES_RATTATA').mon]);
    const save = { playerName: 'RED', mail: [{ itemId: 7, body: 'MAIL' }] };

    StoreSelectedPokemonInDaycare(daycare, partyContext, 0, save);

    expect(daycare.mons[0].mon).toMatchObject({ species: 'SPECIES_PIKACHU', nickname: 'PIKA', ppRestored: true });
    expect(daycare.mons[0].mail).toEqual({ otName: 'RED', monName: 'PIKA', message: { itemId: 7, body: 'MAIL' } });
    expect(partyContext.party[0].species).toBe('SPECIES_RATTATA');

    daycare.mons[0].mon.exp = getExperienceForLevel('GROWTH_MEDIUM_FAST', 5);
    daycare.mons[0].steps =
      getExperienceForLevel('GROWTH_MEDIUM_FAST', 7) -
      getExperienceForLevel('GROWTH_MEDIUM_FAST', 5);
    const strings = createDaycareStringVarRuntime();
    expect(GetNumLevelsGainedForDaycareMon(daycare.mons[0], strings)).toBe(2);
    expect(strings.gStringVar1).toBe('PIKA');
    expect(strings.gStringVar2).toBe('2 ');
    expect(GetDaycareCostForSelectedMon(daycare.mons[0], strings)).toBe(300);
    expect(strings.gStringVar2).toBe('300  ');
    expect(GetDaycareCostForMon(daycare, 0)).toBe(getDaycareCostForMon(daycare, 0));

    const specialVars = { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 0 };
    GetDaycareCost(daycare, specialVars, strings);
    expect(specialVars.gSpecialVar_0x8005).toBe(300);
    expect(GetNumLevelsGainedFromDaycare(daycare, specialVars, strings)).toBe(2);

    const hooks = createDefaultDaycareExperienceHooks();
    hooks.tryIncrementMonLevel = () => false;
    const withdrawn = createDaycarePartyContext();
    expect(TakePokemonFromDaycare(daycare, specialVars, withdrawn, hooks)).toBe('SPECIES_PIKACHU');
    expect(withdrawn.party[0]).toMatchObject({ species: 'SPECIES_PIKACHU', mail: { itemId: 7, body: 'MAIL' } });
    expect(daycare.mons[0].mon).toMatchObject({ species: SPECIES_NONE, zeroed: true });
    expect(daycare.mons[0].steps).toBe(0);
    expect(daycare.mons[0].mail).toEqual(createEmptyDaycareMail());
  });

  test('clears mail, individual slots, and all daycare data like the C helpers', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU'),
      mon('SPECIES_RATTATA')
    ]);
    daycare.offspringPersonality = 123;
    daycare.stepCounter = 4;
    daycare.mons[0].mail = { otName: 'RED', monName: 'PIKA', message: { itemId: 5, body: 'HELLO' } };

    clearDaycareMonMail(daycare.mons[0].mail);
    expect(daycare.mons[0].mail).toEqual({ otName: '', monName: '', message: { itemId: 0 } });

    clearDaycareMon(daycare.mons[0]);
    expect(daycare.mons[0]).toEqual(createEmptyDaycareMon());

    clearAllDaycareData(daycare);
    expect(daycare.mons).toEqual([createEmptyDaycareMon(), createEmptyDaycareMon()]);
    expect(daycare.offspringPersonality).toBe(0);
    expect(daycare.stepCounter).toBe(0);
  });

  test('ShiftDaycareSlots only moves slot 1 into an empty slot 0 and transfers mail/steps', () => {
    const daycare = createDayCare([
      createEmptyDaycareMon(),
      mon('SPECIES_RATTATA', { nickname: 'RAT' }, 321)
    ]);
    daycare.mons[1].mail = { otName: 'BLUE', monName: 'RAT', message: { itemId: 99 } };

    shiftDaycareSlots(daycare);
    expect(daycare.mons[0].mon).toMatchObject({ species: 'SPECIES_RATTATA', nickname: 'RAT' });
    expect(daycare.mons[0].steps).toBe(321);
    expect(daycare.mons[0].mail).toEqual({ otName: 'BLUE', monName: 'RAT', message: { itemId: 99 } });
    expect(daycare.mons[1]).toEqual(createEmptyDaycareMon());

    const unchanged = createDayCare([mon('SPECIES_PIKACHU'), mon('SPECIES_RATTATA')]);
    shiftDaycareSlots(unchanged);
    expect(unchanged.mons[0].mon.species).toBe('SPECIES_PIKACHU');
  });

  test('StorePokemonInDaycare copies mail, restores PP, resets steps, zeroes mon, and compacts party in C order', () => {
    const partyMon = {
      species: 'SPECIES_PIKACHU',
      nickname: 'PIKA',
      otId: 7,
      personality: 3,
      exp: 99,
      heldItem: ITEM_NONE,
      mailId: 1
    };
    const daycareMon = createEmptyDaycareMon();
    const partyContext = createDaycarePartyContext([
      partyMon,
      mon('SPECIES_RATTATA').mon
    ]);

    storePokemonInDaycare(partyMon, daycareMon, {
      playerName: 'RED',
      mail: [{ itemId: 0 }, { itemId: 44, body: 'HELLO' }]
    }, partyContext);

    expect(daycareMon.mail).toEqual({ otName: 'RED', monName: 'PIKA', message: { itemId: 44, body: 'HELLO' } });
    expect(daycareMon.mon).toMatchObject({ species: 'SPECIES_PIKACHU', nickname: 'PIKA', ppRestored: true });
    expect(daycareMon.steps).toBe(0);
    expect(partyMon).toMatchObject({ species: 0, zeroed: true });
    expect(partyContext.party[0].species).toBe('SPECIES_RATTATA');
    expect(partyContext.partyCount).toBe(1);
    expect(partyContext.operations).toEqual(['CompactPartySlots', 'CalculatePlayerPartyCount']);
  });

  test('StorePokemonInEmptyDaycareSlot uses the first empty slot exactly like Daycare_FindEmptySpot', () => {
    const daycare = createDayCare([
      createEmptyDaycareMon(),
      mon('SPECIES_RATTATA')
    ]);
    const stored = mon('SPECIES_PIKACHU').mon;
    const partyContext = createDaycarePartyContext([stored]);

    storePokemonInEmptyDaycareSlot(stored, daycare, { playerName: 'RED', mail: [] }, partyContext);

    expect(daycare.mons[0].mon.species).toBe('SPECIES_PIKACHU');
    expect(daycare.mons[1].mon.species).toBe('SPECIES_RATTATA');
  });

  test('Debug_AddDaycareSteps increments both daycare slots and the Route 5 daycare mon exactly', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', {}, 10),
      mon('SPECIES_RATTATA', {}, 20)
    ]);
    const route5DayCareMon = mon('SPECIES_EEVEE', {}, 30);

    Debug_AddDaycareSteps(daycare, route5DayCareMon, 7);

    expect(daycare.mons[0].steps).toBe(17);
    expect(daycare.mons[1].steps).toBe(27);
    expect(route5DayCareMon.steps).toBe(37);
  });

  test('Route 5 daycare wrappers call the same selected-mon helpers as daycare.c', () => {
    const fieldRuntime = createDaycareFieldRuntime();
    ChooseSendDaycareMon(fieldRuntime);
    expect(fieldRuntime).toEqual({
      operations: ['ChooseMonForDaycare'],
      savedCallback: 'CB2_ReturnToField'
    });

    const partyMon = mon('SPECIES_PIKACHU', { nickname: 'PIKA', mailId: 0 }).mon;
    const partyContext = createDaycarePartyContext([partyMon, mon('SPECIES_RATTATA').mon]);
    const route5DayCareMon = createEmptyDaycareMon();
    PutMonInRoute5Daycare(partyContext, 0, route5DayCareMon, {
      playerName: 'RED',
      mail: [{ itemId: 55, body: 'MAIL' }]
    });

    expect(route5DayCareMon.mon).toMatchObject({ species: 'SPECIES_PIKACHU', nickname: 'PIKA', ppRestored: true });
    expect(route5DayCareMon.mail).toEqual({ otName: 'RED', monName: 'PIKA', message: { itemId: 55, body: 'MAIL' } });
    expect(partyContext.party[0].species).toBe('SPECIES_RATTATA');
    expect(IsThereMonInRoute5Daycare(route5DayCareMon)).toBe(true);
    expect(IsThereMonInRoute5Daycare(createEmptyDaycareMon())).toBe(false);

    route5DayCareMon.mon.exp = getExperienceForLevel('GROWTH_MEDIUM_FAST', 5);
    route5DayCareMon.steps =
      getExperienceForLevel('GROWTH_MEDIUM_FAST', 7) -
      getExperienceForLevel('GROWTH_MEDIUM_FAST', 5);
    expect(GetNumLevelsGainedForRoute5DaycareMon(route5DayCareMon)).toBe(2);
    expect(GetCostToWithdrawRoute5DaycareMon(route5DayCareMon)).toBe(300);

    const withdrawParty = createDaycarePartyContext();
    const hooks = createDefaultDaycareExperienceHooks();
    hooks.tryIncrementMonLevel = () => false;
    const species = TakePokemonFromRoute5Daycare(route5DayCareMon, withdrawParty, hooks);
    expect(species).toBe('SPECIES_PIKACHU');
    expect(withdrawParty.party[0]).toMatchObject({ species: 'SPECIES_PIKACHU', mail: { itemId: 55, body: 'MAIL' } });
    expect(route5DayCareMon.mon).toMatchObject({ species: 0, zeroed: true });
    expect(route5DayCareMon.steps).toBe(0);
  });

  test('CreatedHatchedMon preserves egg identity data and rebuilds hatched mon with C metadata', () => {
    const egg: DaycareBoxMon = {
      species: 'SPECIES_CHARMANDER',
      personality: 0xabcdef01,
      moves: ['MOVE_SCRATCH', 'MOVE_EMBER', MOVE_NONE, MOVE_NONE],
      ivs: [1, 2, 3, 4, 5, 6],
      language: LANGUAGE_JAPANESE,
      metGame: 3,
      markings: 0b1010,
      pokerus: 7,
      modernFatefulEncounter: 1,
      friendship: 12,
      isEgg: true
    };
    const temp: DaycareBoxMon = { species: SPECIES_NONE };

    CreatedHatchedMon(egg, temp);

    expect(temp).toMatchObject({
      species: 'SPECIES_CHARMANDER',
      level: EGG_HATCH_LEVEL,
      createdLevel: EGG_HATCH_LEVEL,
      fixedIv: USE_RANDOM_IVS,
      hasFixedPersonality: true,
      personality: 0xabcdef01,
      otIdType: OT_ID_PLAYER_ID,
      moves: ['MOVE_SCRATCH', 'MOVE_EMBER', MOVE_NONE, MOVE_NONE],
      ivs: [1, 2, 3, 4, 5, 6],
      language: GAME_LANGUAGE,
      metGame: 3,
      markings: 0b1010,
      friendship: 120,
      pokerus: 7,
      modernFatefulEncounter: 1
    });
    expect(temp.calls).toEqual([
      { fn: 'CreateMon', args: ['SPECIES_CHARMANDER', EGG_HATCH_LEVEL, USE_RANDOM_IVS, true, 0xabcdef01, OT_ID_PLAYER_ID, 0] }
    ]);
    expect(egg).toEqual(temp);
  });

  test('AddHatchedMonToParty and ScriptHatchMon update party, dex flags, nickname, ball, met data, PP, and stats', () => {
    const runtime = createDaycareHatchRuntime({
      playerParty: [
        { species: 'SPECIES_CHARMANDER', personality: 0x1111, moves: ['MOVE_SCRATCH'], ivs: [1, 1, 1, 1, 1, 1] },
        { species: 'SPECIES_PIKACHU', personality: 0x2222, moves: ['MOVE_THUNDERSHOCK'], ivs: [2, 2, 2, 2, 2, 2] },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE }
      ],
      enemyParty: [{ species: SPECIES_NONE }],
      currentRegionMapSectionId: 88
    });

    const hatched = AddHatchedMonToParty(runtime, 0);

    expect(hatched).toMatchObject({
      species: 'SPECIES_CHARMANDER',
      isEgg: 0x46,
      nickname: 'CHARMANDER',
      pokeball: ITEM_POKE_BALL,
      metLevel: 0,
      metLocation: 88,
      ppRestored: true,
      statsCalculated: true
    });
    expect(runtime.gStringVar1).toBe('CHARMANDER');
    expect(runtime.pokedex.seenSpecies).toEqual(['CHARMANDER']);
    expect(runtime.pokedex.caughtSpecies).toEqual(['CHARMANDER']);
    expect(runtime.calls).toEqual([{ fn: 'AddHatchedMonToParty', args: [0] }]);

    runtime.currentRegionMapSectionId = 99;
    const scripted = ScriptHatchMon(runtime, { gSpecialVar_0x8004: 1 });
    expect(scripted.nickname).toBe('PIKACHU');
    expect(scripted.metLocation).toBe(99);
    expect(runtime.pokedex.seenSpecies).toEqual(['CHARMANDER', 'PIKACHU']);
    expect(runtime.pokedex.caughtSpecies).toEqual(['CHARMANDER', 'PIKACHU']);
  });

  test('BufferDayCareMonReceivedMail reports changed daycare mail owners and preserves matching mail', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { nickname: 'PIKA' }),
      mon('SPECIES_RATTATA', { nickname: 'RAT' })
    ]);
    daycare.mons[0].mail = {
      otName: 'BLUE',
      monName: 'OLDPIKA',
      message: { itemId: 55 }
    };
    daycare.mons[1].mail = {
      otName: 'RED',
      monName: 'RAT',
      message: { itemId: 55 }
    };
    const runtime = createDaycareStringVarRuntime();

    expect(BufferDayCareMonReceivedMail(daycare, 0, 'RED', runtime)).toBe(true);
    expect(runtime).toMatchObject({
      gStringVar1: 'PIKA',
      gStringVar2: 'BLUE',
      gStringVar3: 'OLDPIKA'
    });

    expect(DaycareMonReceivedMail(daycare, 1, 'RED', createDaycareStringVarRuntime())).toBe(false);
    daycare.mons[1].mail.message.itemId = ITEM_NONE;
    expect(BufferDayCareMonReceivedMail(daycare, 1, 'GREEN', createDaycareStringVarRuntime())).toBe(false);
  });

  test('ApplyDaycareExperience loops up to failed TryIncrementMonLevel, learns moves, deletes first on MON_HAS_MAX_MOVES, then recalculates stats', () => {
    const calls: string[] = [];
    const monData: DaycareBoxMon = { species: 'SPECIES_PIKACHU', moves: [1, 2, 3, 4] };
    const learnedMoves = [MON_HAS_MAX_MOVES, 0, 33, 0];
    let incrementCalls = 0;

    applyDaycareExperience(monData, {
      moveToLearn: 99,
      tryIncrementMonLevel() {
        calls.push('TryIncrementMonLevel');
        incrementCalls += 1;
        return incrementCalls <= 2;
      },
      monTryLearningNewMove(_mon, firstMove) {
        calls.push(`MonTryLearningNewMove(${firstMove ? 'TRUE' : 'FALSE'})`);
        return learnedMoves.shift() ?? 0;
      },
      deleteFirstMoveAndGiveMoveToMon(monArg, move) {
        calls.push(`DeleteFirstMoveAndGiveMoveToMon(${move})`);
        monArg.moves = [...(monArg.moves ?? []).slice(1), move];
      },
      calculateMonStats(monArg) {
        calls.push('CalculateMonStats');
        monArg.statsCalculated = true;
      }
    });

    expect(calls).toEqual([
      'TryIncrementMonLevel',
      'MonTryLearningNewMove(TRUE)',
      'DeleteFirstMoveAndGiveMoveToMon(99)',
      'MonTryLearningNewMove(FALSE)',
      'TryIncrementMonLevel',
      'MonTryLearningNewMove(TRUE)',
      'MonTryLearningNewMove(FALSE)',
      'TryIncrementMonLevel',
      'CalculateMonStats'
    ]);
    expect(monData.moves).toEqual([2, 3, 4, 99]);
    expect(monData.statsCalculated).toBe(true);
  });

  test('TakeSelectedPokemonFromDaycare adds steps to exp unless max level, restores mail, clears slot, and compacts party', () => {
    const daycareMon = mon('SPECIES_PIKACHU', {
      exp: 100,
      level: 5
    }, 25);
    daycareMon.mail = { otName: 'RED', monName: 'PIKA', message: { itemId: 77, body: 'MAIL' } };
    const partyContext = createDaycarePartyContext([mon('SPECIES_RATTATA').mon]);
    const hooks = createDefaultDaycareExperienceHooks();
    const calculated: string[] = [];
    hooks.tryIncrementMonLevel = () => false;
    hooks.calculateMonStats = (pokemon) => {
      calculated.push(String(pokemon.exp));
      pokemon.statsCalculated = true;
    };

    expect(takeSelectedPokemonFromDaycare(daycareMon, partyContext, hooks)).toBe('SPECIES_PIKACHU');
    expect(partyContext.party[1]).toMatchObject({
      species: 'SPECIES_PIKACHU',
      exp: 125,
      mail: { itemId: 77, body: 'MAIL' },
      statsCalculated: true
    });
    expect(calculated).toEqual(['125']);
    expect(daycareMon.mon).toMatchObject({ species: 0, zeroed: true });
    expect(daycareMon.mail).toEqual(createEmptyDaycareMail());
    expect(daycareMon.steps).toBe(0);
    expect(partyContext.operations).toEqual(['CompactPartySlots', 'CalculatePlayerPartyCount']);

    const maxLevel = mon('SPECIES_RATTATA', { exp: 200, level: MAX_LEVEL }, 999);
    const maxParty = createDaycarePartyContext();
    let applied = false;
    const maxHooks = createDefaultDaycareExperienceHooks();
    maxHooks.calculateMonStats = () => { applied = true; };
    takeSelectedPokemonFromDaycare(maxLevel, maxParty, maxHooks);
    expect(maxParty.party[0].exp).toBe(200);
    expect(applied).toBe(false);
    expect(PARTY_SIZE).toBe(6);
  });

  test('TakeSelectedPokemonMonFromDaycareShiftSlots withdraws selected slot then shifts slot 1 into slot 0', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { level: MAX_LEVEL }, 0),
      mon('SPECIES_RATTATA', { nickname: 'RAT' }, 321)
    ]);
    daycare.mons[1].mail = { otName: 'BLUE', monName: 'RAT', message: { itemId: 12 } };
    const partyContext = createDaycarePartyContext();

    expect(takeSelectedPokemonMonFromDaycareShiftSlots(daycare, 0, partyContext)).toBe('SPECIES_PIKACHU');

    expect(daycare.mons[0].mon).toMatchObject({ species: 'SPECIES_RATTATA', nickname: 'RAT' });
    expect(daycare.mons[0].steps).toBe(321);
    expect(daycare.mons[0].mail).toEqual({ otName: 'BLUE', monName: 'RAT', message: { itemId: 12 } });
    expect(daycare.mons[1]).toEqual(createEmptyDaycareMon());
  });

  test('daycare state prioritizes pending eggs, then mon count + 1', () => {
    const daycare = createDayCare();
    expect(isEggPending(daycare)).toBe(false);
    expect(getDaycareState(daycare)).toBe(DAYCARE_NO_MONS);
    expect(getDaycarePokemonCount(daycare)).toBe(0);

    daycare.mons[0] = mon('SPECIES_PIKACHU');
    expect(getDaycareState(daycare)).toBe(DAYCARE_ONE_MON);
    expect(getDaycarePokemonCount(daycare)).toBe(1);

    daycare.mons[1] = mon('SPECIES_RATTATA');
    expect(getDaycareState(daycare)).toBe(DAYCARE_TWO_MONS);

    daycare.offspringPersonality = 1;
    expect(isEggPending(daycare)).toBe(true);
    expect(getDaycareState(daycare)).toBe(DAYCARE_EGG_WAITING);
  });

  test('gender uses the exact species ratio threshold and personality low byte', () => {
    expect(getGenderFromSpeciesAndPersonality('SPECIES_NIDORAN_M', 0)).toBe(MON_MALE);
    expect(getGenderFromSpeciesAndPersonality('SPECIES_NIDORAN_F', 0xff)).toBe(MON_FEMALE);
    expect(getGenderFromSpeciesAndPersonality('SPECIES_MAGNEMITE', 0)).toBe(MON_GENDERLESS);

    expect(getGenderFromSpeciesAndPersonality('SPECIES_PIKACHU', 0)).toBe(MON_FEMALE);
    expect(getGenderFromSpeciesAndPersonality('SPECIES_PIKACHU', 126)).toBe(MON_FEMALE);
    expect(getGenderFromSpeciesAndPersonality('SPECIES_PIKACHU', 127)).toBe(MON_MALE);
  });

  test('EggGroupsOverlap checks both entries against both entries', () => {
    expect(eggGroupsOverlap(['EGG_GROUP_MONSTER', 'EGG_GROUP_GRASS'], ['EGG_GROUP_FIELD', 'EGG_GROUP_GRASS'])).toBe(true);
    expect(eggGroupsOverlap(['EGG_GROUP_MONSTER', 'EGG_GROUP_GRASS'], ['EGG_GROUP_FIELD', 'EGG_GROUP_FAIRY'])).toBe(false);
  });

  test('compatibility score covers all C branches', () => {
    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_MAGNEMITE'),
      mon('SPECIES_PIKACHU')
    ]))).toBe(PARENTS_INCOMPATIBLE);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_DITTO'),
      mon('SPECIES_DITTO')
    ]))).toBe(PARENTS_INCOMPATIBLE);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_DITTO', { otId: 5 }),
      mon('SPECIES_PIKACHU', { otId: 5 })
    ]))).toBe(PARENTS_LOW_COMPATIBILITY);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_DITTO', { otId: 5 }),
      mon('SPECIES_PIKACHU', { otId: 6 })
    ]))).toBe(PARENTS_MED_COMPATIBILITY);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_PIKACHU', { otId: 1, personality: 127 })
    ]))).toBe(PARENTS_MED_COMPATIBILITY);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_PIKACHU', { otId: 2, personality: 127 })
    ]))).toBe(PARENTS_MAX_COMPATIBILITY);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_RATTATA', { otId: 2, personality: 127 })
    ]))).toBe(PARENTS_MED_COMPATIBILITY);

    expect(getDaycareCompatibilityScore(createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_RATTATA', { otId: 1, personality: 127 })
    ]))).toBe(PARENTS_LOW_COMPATIBILITY);
  });

  test('compatibility and nickname wrappers populate gStringVars like daycare.c', () => {
    const max = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_PIKACHU', { otId: 2, personality: 127 })
    ]);
    const medium = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_PIKACHU', { otId: 1, personality: 127 })
    ]);
    const low = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_RATTATA', { otId: 1, personality: 127 })
    ]);
    const incompatible = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }),
      mon('SPECIES_PIKACHU', { otId: 2, personality: 0 })
    ]);
    const runtime = createDaycareStringVarRuntime();

    expect(GetDaycareCompatibilityScoreFromSave(max)).toBe(PARENTS_MAX_COMPATIBILITY);
    SetDaycareCompatibilityString(max, runtime);
    expect(runtime.gStringVar4).toBe(sCompatibilityMessages[0]);
    SetDaycareCompatibilityString(medium, runtime);
    expect(runtime.gStringVar4).toBe(sCompatibilityMessages[1]);
    SetDaycareCompatibilityString(low, runtime);
    expect(runtime.gStringVar4).toBe(sCompatibilityMessages[2]);
    SetDaycareCompatibilityString(incompatible, runtime);
    expect(runtime.gStringVar4).toBe(sCompatibilityMessages[3]);

    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { nickname: 'PIKA', otName: 'RED' }),
      mon('SPECIES_RATTATA', { nickname: 'RAT', otName: 'BLUE' })
    ]);
    _GetDaycareMonNicknames(daycare, runtime);
    expect(runtime).toMatchObject({ gStringVar1: 'PIKA', gStringVar2: 'RAT', gStringVar3: 'RED' });

    const onlySecond = createDayCare([
      createEmptyDaycareMon(),
      mon('SPECIES_EEVEE', { nickname: 'VEE', otName: 'GREEN' })
    ]);
    const secondRuntime = createDaycareStringVarRuntime({ gStringVar1: 'KEEP', gStringVar3: 'OT' });
    GetDaycareMonNicknames(onlySecond, secondRuntime);
    expect(secondRuntime).toMatchObject({ gStringVar1: 'KEEP', gStringVar2: 'VEE', gStringVar3: 'OT' });

    expect(GetSelectedMonNicknameAndSpecies([mon('SPECIES_PIDGEY', { nickname: 'BIRD' }).mon], 0, runtime)).toBe('SPECIES_PIDGEY');
    expect(runtime.gStringVar1).toBe('BIRD');
  });

  test('level and daycare cost math adds steps to exp and charges 100 per gained level plus 100', () => {
    const daycareMon = mon('SPECIES_PIKACHU', {
      exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 5),
      growthRate: 'GROWTH_MEDIUM_FAST'
    }, getExperienceForLevel('GROWTH_MEDIUM_FAST', 7) - getExperienceForLevel('GROWTH_MEDIUM_FAST', 5));

    expect(getLevelAfterDaycareSteps(daycareMon.mon, daycareMon.steps)).toBe(7);
    expect(getNumLevelsGainedFromSteps(daycareMon)).toBe(2);
    expect(getDaycareCostForSelectedMon(daycareMon)).toBe(300);
    expect(getDaycareCostForMon(createDayCare([daycareMon]), 0)).toBe(300);
  });

  test('gender symbol helpers preserve existing matching symbols and append missing ones', () => {
    expect(nameHasGenderSymbol('NIDO♂', MON_MALE)).toBe(true);
    expect(nameHasGenderSymbol('NIDO♂♀', MON_MALE)).toBe(false);
    expect(nameHasGenderSymbol('NIDO♀', MON_FEMALE)).toBe(true);
    expect(appendGenderSymbol('NIDO', MON_MALE)).toBe('NIDO♂');
    expect(AppendGenderSymbol('NIDO', MON_MALE)).toBe('NIDO♂');
    expect(appendGenderSymbol('NIDO♂', MON_MALE)).toBe('NIDO♂');
    expect(appendGenderSymbol('NIDO', MON_FEMALE)).toBe('NIDO♀');
    expect(appendGenderSymbol('MAG', MON_GENDERLESS)).toBe('MAG');
    expect(appendMonGenderSymbol('PIKA', { species: 'SPECIES_PIKACHU', personality: 0 })).toBe('PIKA♀');
    expect(AppendMonGenderSymbol('PIKA', { species: 'SPECIES_PIKACHU', personality: 0 })).toBe('PIKA♀');
  });

  test('daycare level menu text and level text match append/newline behavior', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { nickname: 'PIKA', personality: 0, exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 5) }, 0),
      mon('SPECIES_RATTATA', { nickname: 'RAT', personality: 127, exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 6) }, 0)
    ]);

    expect(getDaycareLevelMenuText(daycare)).toBe('PIKA♀\nRAT♂\nEXIT');
    expect(getDaycareLevelMenuLevelText(daycare)).toBe('{LV_2}5  \n{LV_2}6  \n');
  });

  test('exact C-name daycare exports cover pending eggs, species, compatibility, symbols, and level text', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', {
        nickname: 'PIKA',
        personality: 0,
        gender: MON_FEMALE,
        otId: 1,
        exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 5)
      }, 0),
      mon('SPECIES_DITTO', {
        nickname: 'DITTO',
        personality: 0,
        gender: MON_GENDERLESS,
        otId: 2,
        heldItem: ITEM_NONE,
        exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 6)
      }, 0)
    ]);

    _TriggerPendingDaycareEgg(daycare, () => 0x1234);
    expect(daycare.offspringPersonality).toBe(0x1235);
    expect(IsEggPending(daycare)).toBe(true);
    _TriggerPendingDaycareMaleEgg(daycare, () => 0x0042);
    expect(daycare.offspringPersonality & EGG_GENDER_MALE).toBe(EGG_GENDER_MALE);

    const incenseDaycare = createDayCare([
      mon('SPECIES_WOBBUFFET', { heldItem: ITEM_NONE }),
      mon('SPECIES_WOBBUFFET', { heldItem: ITEM_NONE })
    ]);
    expect(AlterEggSpeciesWithIncenseItem(SPECIES_WYNAUT, incenseDaycare)).toBe(SPECIES_WOBBUFFET);
    incenseDaycare.mons[0].mon.heldItem = ITEM_LAX_INCENSE;
    expect(AlterEggSpeciesWithIncenseItem(SPECIES_WYNAUT, incenseDaycare)).toBe(SPECIES_WYNAUT);

    const evolutionTable: EvolutionTable = Array.from({ length: 400 }, () => []);
    const parentSlots = [0, 0];
    expect(DetermineEggSpeciesAndParentSlots(daycare, parentSlots, evolutionTable)).toBe('SPECIES_PIKACHU');
    expect(parentSlots).toEqual([0, 1]);

    expect(EggGroupsOverlap(['EGG_GROUP_FIELD', 'EGG_GROUP_FAIRY'], ['EGG_GROUP_MONSTER', 'EGG_GROUP_FAIRY'])).toBe(true);
    expect(GetDaycareCompatibilityScore(daycare)).toBe(PARENTS_MED_COMPATIBILITY);
    expect(NameHasGenderSymbol('NIDO♂', MON_MALE)).toBe(true);
    expect(NameHasGenderSymbol('NIDO♂♀', MON_MALE)).toBe(false);
    expect(GetDaycareLevelMenuText(daycare)).toBe('PIKA♀\nDITTO\nEXIT');
    expect(GetDaycareLevelMenuLevelText(daycare)).toBe('{LV_2}5  \n{LV_2}6  \n');
  });

  test('daycare text printer helpers build the exact C printer template and mon info calls', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { nickname: 'PIKA', personality: 0, exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 5) }, 0),
      mon('SPECIES_RATTATA', { nickname: 'RAT', personality: 127, exp: getExperienceForLevel('GROWTH_MEDIUM_FAST', 6) }, 0)
    ]);
    const runtime = createDaycareTextRuntime({
      useAlternateDownArrow: 1,
      stringWidthOverrides: new Map([[`${FONT_NORMAL_COPY_2}:{LV_2}6  :0`, 40]])
    });

    DaycareAddTextPrinter(runtime, 7, 'HELLO', 3, 4);
    DaycarePrintMonNickname(runtime, daycare, 8, 0, 12);
    DaycarePrintMonLvl(runtime, daycare, 8, 1, 28);
    DaycarePrintMonInfo(runtime, daycare, 9, 1, 44);
    DaycarePrintMonInfo(runtime, daycare, 9, 2, 60);

    expect(runtime.useAlternateDownArrow).toBe(0);
    expect(runtime.calls).toHaveLength(5);
    expect(runtime.calls[0]).toEqual({
      fn: 'AddTextPrinter',
      args: [{
        currentChar: 'HELLO',
        windowId: 7,
        fontId: FONT_NORMAL_COPY_2,
        x: 3,
        y: 4,
        currentX: 3,
        currentY: 4,
        unk: 0,
        letterSpacing: 1,
        lineSpacing: 1,
        fgColor: 2,
        bgColor: 1,
        shadowColor: 3
      }, 0xff, null]
    });
    expect(runtime.calls.map((call) => (call.args[0] as { currentChar: string; x: number; y: number }).currentChar)).toEqual([
      'HELLO',
      'PIKA♀',
      '{LV_2}6  ',
      'RAT♂',
      '{LV_2}6  '
    ]);
    expect(runtime.calls.map((call) => {
      const printer = call.args[0] as { x: number; y: number };
      return [printer.x, printer.y];
    })).toEqual([
      [3, 4],
      [8, 12],
      [92, 28],
      [8, 44],
      [92, 44]
    ]);
  });

  test('ShowDaycareLevelMenu creates the window, list menu task, and daycare input task in C order', () => {
    const runtime = createDaycareMenuRuntime({ nextWindowId: 4, nextListMenuTaskId: 6, nextTaskId: 8 });

    const taskId = ShowDaycareLevelMenu(runtime);

    expect(taskId).toBe(8);
    expect(runtime.tasks[8]?.data[0]).toBe(6);
    expect(runtime.tasks[8]?.data[1]).toBe(4);
    expect(runtime.calls.map((call) => call.fn)).toEqual([
      'AddWindow',
      'DrawStdWindowFrame',
      'ListMenuInit',
      'CopyWindowToVram',
      'CreateTask'
    ]);
    expect(runtime.calls[0]).toEqual({ fn: 'AddWindow', args: [sDaycareLevelMenuWindowTemplate, 4] });
    expect(runtime.calls[1]).toEqual({ fn: 'DrawStdWindowFrame', args: [4, false] });
    expect(runtime.calls[2].args).toEqual([{ ...sDaycareListMenuLevelTemplate, windowId: 4 }, 0, 0, 6]);
    expect(runtime.calls[3]).toEqual({ fn: 'CopyWindowToVram', args: [4, COPYWIN_FULL] });
    expect(runtime.calls[4]).toEqual({ fn: 'CreateTask', args: ['Task_HandleDaycareLevelMenuInput', 3, 8] });
  });

  test('Task_HandleDaycareLevelMenuInput mirrors A/B selection cleanup and idle no-op behavior', () => {
    const selected = createDaycareMenuRuntime({
      listMenuInput: 1,
      newKeys: A_BUTTON,
      tasks: Object.assign([], { 3: { data: [9, 7], destroyed: false } })
    });
    Task_HandleDaycareLevelMenuInput(selected, 3);
    expect(selected.specialVarResult).toBe(1);
    expect(selected.tasks[3]?.destroyed).toBe(true);
    expect(selected.calls.map((call) => call.fn)).toEqual([
      'ListMenu_ProcessInput',
      'DestroyListMenuTask',
      'ClearStdWindowAndFrame',
      'RemoveWindow',
      'DestroyTask',
      'ScriptContext_Enable'
    ]);
    expect(selected.calls[1]).toEqual({ fn: 'DestroyListMenuTask', args: [9, null, null] });
    expect(selected.calls[2]).toEqual({ fn: 'ClearStdWindowAndFrame', args: [7, true] });

    const exit = createDaycareMenuRuntime({
      listMenuInput: 5,
      newKeys: A_BUTTON,
      tasks: Object.assign([], { 4: { data: [2, 1], destroyed: false } })
    });
    Task_HandleDaycareLevelMenuInput(exit, 4);
    expect(exit.specialVarResult).toBe(DAYCARE_EXITED_LEVEL_MENU);

    const cancel = createDaycareMenuRuntime({
      listMenuInput: 0,
      newKeys: B_BUTTON,
      tasks: Object.assign([], { 5: { data: [3, 2], destroyed: false } })
    });
    Task_HandleDaycareLevelMenuInput(cancel, 5);
    expect(cancel.specialVarResult).toBe(DAYCARE_EXITED_LEVEL_MENU);

    const idle = createDaycareMenuRuntime({
      listMenuInput: 0,
      newKeys: 0,
      tasks: Object.assign([], { 6: { data: [4, 3], destroyed: false } })
    });
    Task_HandleDaycareLevelMenuInput(idle, 6);
    expect(idle.tasks[6]?.destroyed).toBe(false);
    expect(idle.calls).toEqual([{ fn: 'ListMenu_ProcessInput', args: [4, 0] }]);
  });

  test('GetEggSpecies walks backwards through the evolution table up to EVOS_PER_MON passes', () => {
    const evolutionTable: EvolutionTable = Array.from({ length: 400 }, () => []);
    evolutionTable[SPECIES_PICHU] = [{ targetSpecies: SPECIES_PIKACHU }];
    evolutionTable[SPECIES_NIDORAN_F] = [{ targetSpecies: 30 }];
    evolutionTable[30] = [{ targetSpecies: 31 }];

    expect(getEggSpecies(SPECIES_PIKACHU, evolutionTable)).toBe(SPECIES_PICHU);
    expect(GetEggSpecies(SPECIES_PIKACHU, evolutionTable)).toBe(SPECIES_PICHU);
    expect(getEggSpecies(31, evolutionTable)).toBe(SPECIES_NIDORAN_F);
    expect(getEggSpecies(SPECIES_DITTO, evolutionTable)).toBe(SPECIES_DITTO);
  });

  test('pending egg helpers preserve random modulo, male flag OR, and removal reset', () => {
    const daycare = createDayCare();

    triggerPendingDaycareEgg(daycare, () => 0);
    expect(daycare.offspringPersonality).toBe(1);
    triggerPendingDaycareEgg(daycare, () => 0xffff);
    expect(daycare.offspringPersonality).toBe(2);

    triggerPendingDaycareMaleEgg(daycare, () => 0x1234);
    expect(daycare.offspringPersonality).toBe(0x9234);

    daycare.stepCounter = 99;
    removeEggFromDayCare(daycare);
    expect(daycare.offspringPersonality).toBe(0);
    expect(daycare.stepCounter).toBe(0);

    daycare.offspringPersonality = 55;
    daycare.stepCounter = 11;
    RejectEggFromDayCare(daycare);
    expect(daycare.offspringPersonality).toBe(0);
    expect(daycare.stepCounter).toBe(0);
  });

  test('CreateEgg and SetInitialEggData preserve egg metadata and CreateMon argument differences', () => {
    const hotSpringsEgg: DaycareBoxMon = { species: SPECIES_NONE };
    CreateEgg(hotSpringsEgg, SPECIES_PICHU, true);
    expect(hotSpringsEgg).toMatchObject({
      species: SPECIES_PICHU,
      level: EGG_HATCH_LEVEL,
      createdLevel: EGG_HATCH_LEVEL,
      fixedIv: USE_RANDOM_IVS,
      hasFixedPersonality: false,
      personality: 0,
      otIdType: OT_ID_PLAYER_ID,
      pokeball: ITEM_POKE_BALL,
      nickname: 'タマゴ',
      metLevel: 0,
      language: LANGUAGE_JAPANESE,
      metLocation: METLOC_SPECIAL_EGG,
      isEgg: true
    });
    expect(hotSpringsEgg.calls).toEqual([
      { fn: 'CreateMon', args: [SPECIES_PICHU, EGG_HATCH_LEVEL, USE_RANDOM_IVS, false, 0, OT_ID_PLAYER_ID, 0] }
    ]);

    const daycare = createDayCare();
    daycare.offspringPersonality = 0x1234;
    const daycareEgg: DaycareBoxMon = { species: SPECIES_NONE };
    SetInitialEggData(daycareEgg, SPECIES_PIKACHU, daycare, () => 0xabcd);
    expect(daycareEgg).toMatchObject({
      species: SPECIES_PIKACHU,
      level: EGG_HATCH_LEVEL,
      fixedIv: USE_RANDOM_IVS,
      hasFixedPersonality: true,
      personality: 0xabcd1234,
      otIdType: OT_ID_PLAYER_ID,
      pokeball: ITEM_POKE_BALL,
      nickname: 'タマゴ',
      metLevel: 0,
      language: LANGUAGE_JAPANESE
    });
    expect(daycareEgg.metLocation).toBeUndefined();
    expect(daycareEgg.calls).toEqual([
      { fn: 'CreateMon', args: [SPECIES_PIKACHU, EGG_HATCH_LEVEL, USE_RANDOM_IVS, true, 0xabcd1234, OT_ID_PLAYER_ID, 0] }
    ]);
  });

  test('_GiveEggFromDaycare determines species, initializes egg, inherits IVs, builds moves, inserts party, and removes pending egg in C order', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0, ivs: [1, 2, 3, 4, 5, 6] }),
      mon('SPECIES_PIKACHU', { otId: 2, personality: 127, ivs: [6, 5, 4, 3, 2, 1] })
    ]);
    daycare.offspringPersonality = 0x2222;
    daycare.stepCounter = 77;
    const partyContext = createDaycarePartyContext([mon('SPECIES_RATTATA').mon]);
    const hookCalls: string[] = [];
    const evolutionTable: EvolutionTable = Array.from({ length: 400 }, () => []);
    evolutionTable[SPECIES_PICHU] = [{ targetSpecies: 'SPECIES_PIKACHU' }];

    const egg = _GiveEggFromDaycare(daycare, partyContext, {
      evolutionTable,
      random: () => {
        hookCalls.push('Random');
        return 0x1111;
      },
      inheritIVs(eggArg, daycareArg) {
        hookCalls.push(`InheritIVs:${eggArg.species}:${daycareArg.mons[0].mon.species}`);
        eggArg.ivs = [9, 9, 9, 9, 9, 9];
      },
      buildEggMoveset(eggArg, father, mother) {
        hookCalls.push(`BuildEggMoveset:${father.otId}:${mother.otId}`);
        eggArg.moves = [33];
      }
    });

    expect(hookCalls).toEqual([
      'Random',
      `InheritIVs:${SPECIES_PICHU}:SPECIES_PIKACHU`,
      'BuildEggMoveset:2:1'
    ]);
    expect(egg).toMatchObject({
      species: SPECIES_PICHU,
      personality: 0x11112222,
      isEgg: true,
      ivs: [9, 9, 9, 9, 9, 9],
      moves: [33]
    });
    expect(partyContext.party[1]).toBe(egg);
    expect(partyContext.operations).toEqual(['CompactPartySlots', 'CalculatePlayerPartyCount']);
    expect(daycare.offspringPersonality).toBe(0);
    expect(daycare.stepCounter).toBe(0);

    const wrapperDaycare = createDayCare([
      mon('SPECIES_PIKACHU', { personality: 0 }),
      mon('SPECIES_PIKACHU', { personality: 127 })
    ]);
    wrapperDaycare.offspringPersonality = 1;
    const wrapperParty = createDaycarePartyContext();
    const wrapperEgg = GiveEggFromDaycare(wrapperDaycare, wrapperParty, {
      evolutionTable,
      random: () => 0,
      inheritIVs() {},
      buildEggMoveset() {}
    });
    expect(wrapperParty.party[0]).toBe(wrapperEgg);
  });

  test('BuildEggMoveset gives father egg moves, father TMHM moves, then shared parent level-up moves in C order', () => {
    const egg: DaycareBoxMon = {
      species: 'SPECIES_CHARMANDER',
      moves: ['MOVE_GROWL', MOVE_NONE, MOVE_NONE, MOVE_NONE]
    };
    const father: DaycareBoxMon = {
      species: 'SPECIES_CHARMANDER',
      moves: ['MOVE_BELLY_DRUM', 'MOVE_FOCUS_PUNCH', 'MOVE_SCRATCH', MOVE_NONE]
    };
    const mother: DaycareBoxMon = {
      species: 'SPECIES_CHARMANDER',
      moves: ['MOVE_SCRATCH', 'MOVE_EMBER', MOVE_NONE, MOVE_NONE]
    };

    expect(getDaycareEggMoves(egg).slice(0, 3)).toEqual([
      'MOVE_BELLY_DRUM',
      'MOVE_ANCIENT_POWER',
      'MOVE_ROCK_SLIDE'
    ]);
    expect(getLevelUpMovesBySpecies('SPECIES_CHARMANDER')).toContain('MOVE_SCRATCH');
    expect(canMonLearnTMHM(egg, 0)).toBe(true);

    BuildEggMoveset(egg, father, mother);

    expect(egg.moves).toEqual([
      'MOVE_GROWL',
      'MOVE_BELLY_DRUM',
      'MOVE_FOCUS_PUNCH',
      'MOVE_SCRATCH'
    ]);
  });

  test('GiveMoveToMon and DeleteFirstMoveAndGiveMoveToMon preserve daycare.c move-slot return semantics', () => {
    const egg: DaycareBoxMon = {
      species: 'SPECIES_CHARMANDER',
      moves: ['MOVE_GROWL', MOVE_NONE, MOVE_NONE, MOVE_NONE]
    };

    expect(giveMoveToMon(egg, 'MOVE_GROWL')).toBe(MON_ALREADY_KNOWS_MOVE);
    expect(giveMoveToMon(egg, 'MOVE_SCRATCH')).toBe('MOVE_SCRATCH');
    expect(egg.moves).toEqual(['MOVE_GROWL', 'MOVE_SCRATCH', MOVE_NONE, MOVE_NONE]);

    egg.moves = ['MOVE_GROWL', 'MOVE_SCRATCH', 'MOVE_EMBER', 'MOVE_SMOKESCREEN'];
    expect(giveMoveToMon(egg, 'MOVE_METAL_CLAW')).toBe(MON_HAS_MAX_MOVES);
    deleteFirstMoveAndGiveMoveToMon(egg, 'MOVE_METAL_CLAW');
    expect(egg.moves).toEqual(['MOVE_SCRATCH', 'MOVE_EMBER', 'MOVE_SMOKESCREEN', 'MOVE_METAL_CLAW']);
    expect(egg.moves).toHaveLength(MAX_MON_MOVES);
  });

  test('TryProduceOrHatchEgg increments daycare steps, may create pending egg, and hatches only valid eggs at step 255', () => {
    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { otId: 1, personality: 0 }, 20),
      mon('SPECIES_PIKACHU', { otId: 2, personality: 127 }, 0xfe)
    ]);
    const randoms = [0, 41];
    const specialVars = { gSpecialVar_0x8004: 99 };

    expect(TryProduceOrHatchEgg(daycare, [], specialVars, () => randoms.shift() ?? 0)).toBe(false);
    expect(daycare.mons[0].steps).toBe(21);
    expect(daycare.mons[1].steps).toBe(0xff);
    expect(daycare.offspringPersonality).toBe(42);
    expect(daycare.stepCounter).toBe(1);
    expect(specialVars.gSpecialVar_0x8004).toBe(99);

    const hatching = createDayCare([
      mon('SPECIES_PIKACHU', {}, 1),
      createEmptyDaycareMon()
    ]);
    hatching.stepCounter = 254;
    const party = [
      { species: 'SPECIES_RATTATA' },
      { species: 'SPECIES_PICHU', isEgg: true, badEgg: true, friendship: 0 },
      { species: 'SPECIES_PICHU', isEgg: true, friendship: 2 },
      { species: 'SPECIES_PICHU', isEgg: true, friendship: 0 }
    ];
    const hatchVars = { gSpecialVar_0x8004: 0 };

    expect(TryProduceOrHatchEgg(hatching, party, hatchVars, () => 0xffff)).toBe(true);
    expect(hatching.mons[0].steps).toBe(2);
    expect(hatching.mons[1].steps).toBe(0);
    expect(hatching.stepCounter).toBe(255);
    expect(party[2].friendship).toBe(1);
    expect(hatchVars.gSpecialVar_0x8004).toBe(3);
  });

  test('ShouldEggHatch increments Route 5 daycare steps before running TryProduceOrHatchEgg', () => {
    const daycare = createDayCare([createEmptyDaycareMon(), createEmptyDaycareMon()]);
    daycare.stepCounter = 254;
    const route5DayCareMon = mon('SPECIES_EEVEE', {}, 12);
    const party = [{ species: 'SPECIES_PICHU', isEgg: true, friendship: 0 }];
    const specialVars = { gSpecialVar_0x8004: 99 };

    expect(ShouldEggHatch(daycare, route5DayCareMon, party, specialVars, () => 0)).toBe(true);
    expect(route5DayCareMon.steps).toBe(13);
    expect(specialVars.gSpecialVar_0x8004).toBe(0);

    const emptyRoute5 = createEmptyDaycareMon();
    expect(ShouldEggHatch(createDayCare(), emptyRoute5, [], { gSpecialVar_0x8004: 0 }, () => 0)).toBe(false);
    expect(emptyRoute5.steps).toBe(0);
  });

  test('AlterEggSpeciesWithIncenseItem applies Wynaut/Azurill incense exceptions in C order', () => {
    const daycare = createDayCare([
      mon('SPECIES_WOBBUFFET', { heldItem: ITEM_NONE }),
      mon('SPECIES_WOBBUFFET', { heldItem: ITEM_NONE })
    ]);

    expect(alterEggSpeciesWithIncenseItem(SPECIES_WYNAUT, daycare)).toBe(SPECIES_WOBBUFFET);
    daycare.mons[1].mon.heldItem = ITEM_LAX_INCENSE;
    expect(alterEggSpeciesWithIncenseItem(SPECIES_WYNAUT, daycare)).toBe(SPECIES_WYNAUT);

    daycare.mons[0].mon.heldItem = ITEM_NONE;
    daycare.mons[1].mon.heldItem = ITEM_NONE;
    expect(alterEggSpeciesWithIncenseItem(SPECIES_AZURILL, daycare)).toBe(SPECIES_MARILL);
    daycare.mons[0].mon.heldItem = ITEM_SEA_INCENSE;
    expect(alterEggSpeciesWithIncenseItem(SPECIES_AZURILL, daycare)).toBe(SPECIES_AZURILL);
    expect(alterEggSpeciesWithIncenseItem(SPECIES_PIKACHU, daycare)).toBe(SPECIES_PIKACHU);
  });

  test('DetermineEggSpeciesAndParentSlots chooses mother/father, gender variants, and Ditto swap exactly', () => {
    const evolutionTable: EvolutionTable = Array.from({ length: 400 }, () => []);
    const parentSlots = [0, 0];

    const nidoran = createDayCare([
      mon('SPECIES_NIDORAN_F', { species: SPECIES_NIDORAN_F, gender: MON_FEMALE }),
      mon('SPECIES_PIKACHU', { species: SPECIES_PIKACHU, gender: MON_MALE })
    ]);
    nidoran.offspringPersonality = EGG_GENDER_MALE;
    expect(determineEggSpeciesAndParentSlots(nidoran, parentSlots, evolutionTable)).toBe(SPECIES_NIDORAN_M);
    expect(parentSlots).toEqual([0, 1]);

    const illumise = createDayCare([
      mon('SPECIES_ILLUMISE', { species: SPECIES_ILLUMISE, gender: MON_FEMALE }),
      mon('SPECIES_VOLBEAT', { species: SPECIES_VOLBEAT, gender: MON_MALE })
    ]);
    illumise.offspringPersonality = EGG_GENDER_MALE;
    expect(determineEggSpeciesAndParentSlots(illumise, parentSlots, evolutionTable)).toBe(SPECIES_VOLBEAT);
    expect(parentSlots).toEqual([0, 1]);

    const dittoWithMale = createDayCare([
      mon('SPECIES_PIKACHU', { species: SPECIES_PIKACHU, gender: MON_MALE }),
      mon('SPECIES_DITTO', { species: SPECIES_DITTO, gender: MON_GENDERLESS })
    ]);
    expect(determineEggSpeciesAndParentSlots(dittoWithMale, parentSlots, evolutionTable)).toBe(SPECIES_PIKACHU);
    expect(parentSlots).toEqual([1, 0]);

    const dittoWithFemale = createDayCare([
      mon('SPECIES_PIKACHU', { species: SPECIES_PIKACHU, gender: MON_FEMALE }),
      mon('SPECIES_DITTO', { species: SPECIES_DITTO, gender: MON_GENDERLESS })
    ]);
    expect(determineEggSpeciesAndParentSlots(dittoWithFemale, parentSlots, evolutionTable)).toBe(SPECIES_PIKACHU);
    expect(parentSlots).toEqual([0, 1]);
  });

  test('RemoveIVIndexFromList and InheritIVs preserve the selected-value removal quirk', () => {
    const ivs = [0, 1, 2, 3, 4, 5];
    removeIVIndexFromList(ivs, 2);
    expect(ivs.slice(0, 5)).toEqual([0, 1, 3, 4, 5]);

    const daycare = createDayCare([
      mon('SPECIES_PIKACHU', { ivs: [10, 11, 12, 13, 14, 15] }),
      mon('SPECIES_RATTATA', { ivs: [20, 21, 22, 23, 24, 25] })
    ]);
    const egg = { species: SPECIES_PIKACHU, ivs: [0, 0, 0, 0, 0, 0] };
    const randoms = [2, 3, 1, 0, 1, 1];
    const inherited = inheritIVs(egg, daycare, () => randoms.shift() ?? 0);

    expect(inherited.selectedIvs).toEqual([2, 4, 1]);
    expect(inherited.whichParent).toEqual([0, 1, 1]);
    expect(egg.ivs).toEqual([0, 21, 12, 0, 24, 0]);
  });

  test('EggHatch entry, VBlank, and Task_EggHatch preserve C callback setup order', () => {
    const runtime = createEggHatchRuntime();

    VBlankCB_EggHatch(runtime);
    expect(runtime.calls.slice(0, 3)).toEqual([
      { fn: 'LoadOam', args: [] },
      { fn: 'ProcessSpriteCopyRequests', args: [] },
      { fn: 'TransferPlttBuffer', args: [] }
    ]);

    const taskId = EggHatch(runtime);
    expect(runtime.tasks[taskId]?.destroyed).toBe(false);
    expect(runtime.paletteFadeActive).toBe(true);
    expect(runtime.helpSystemEnabled).toBe(false);
    expect(runtime.calls).toContainEqual({ fn: 'LockPlayerFieldControls', args: [] });
    expect(runtime.calls).toContainEqual({ fn: 'CreateTask', args: ['Task_EggHatch', 10, taskId] });
    expect(runtime.calls).toContainEqual({ fn: 'HelpSystem_Disable', args: [] });

    Task_EggHatch(runtime, taskId);
    expect(runtime.mainCallback2).toBeNull();
    expect(runtime.tasks[taskId]?.destroyed).toBe(false);

    runtime.paletteFadeActive = false;
    Task_EggHatch(runtime, taskId);
    expect(runtime.mainCallback2).toBe('CB2_EggHatch_0');
    expect(runtime.fieldCallback).toBe('FieldCB_ContinueScriptHandleMusic');
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
    expect(runtime.calls).toContainEqual({ fn: 'CleanupOverworldWindowsAndTilemaps', args: [] });
    expect(runtime.calls).toContainEqual({ fn: 'SetMainCallback2', args: ['CB2_EggHatch_0'] });
    expect(runtime.calls).toContainEqual({ fn: 'DestroyTask', args: [taskId] });
  });

  test('CB2_EggHatch_0 walks setup states 0-8 and hands off to CB2_EggHatch_1', () => {
    const runtime = createEggHatchRuntime({
      specialVars: { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 0 },
      currentMapMusic: 123,
      currentRegionMapSectionId: 44,
      playerParty: [
        {
          species: 'SPECIES_CHARMANDER',
          personality: 0x2222,
          moves: ['MOVE_SCRATCH', MOVE_NONE, MOVE_NONE, MOVE_NONE],
          ivs: [1, 2, 3, 4, 5, 6]
        },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE },
        { species: SPECIES_NONE }
      ],
      enemyParty: [{ species: SPECIES_NONE }]
    });

    CB2_EggHatch_0(runtime);
    expect(runtime.mainState).toBe(1);
    expect(runtime.allocatedEggHatchData).toBe(true);
    expect(runtime.monSpritesGfxAllocated).toBe(true);
    expect(runtime.sEggHatchData.eggPartyID).toBe(0);
    expect(runtime.sEggHatchData.eggShardVelocityID).toBe(0);
    expect(runtime.vblankCallback).toBe('VBlankCB_EggHatch');
    expect(runtime.specialVars.gSpecialVar_0x8005).toBe(123);
    expect(runtime.bgTilemapBuffers).toMatchObject({ 0: 0x2000, 1: 0x1000 });

    CB2_EggHatch_0(runtime);
    expect(runtime.mainState).toBe(2);
    expect(runtime.sEggHatchData.windowId).toBe(0);

    CB2_EggHatch_0(runtime);
    expect(runtime.calls).toContainEqual({
      fn: 'DecompressAndLoadBgGfxUsingHeap',
      args: [0, 'gBattleInterface_Textbox_Gfx', 0, 0, 0]
    });
    expect(runtime.mainState).toBe(3);

    CB2_EggHatch_0(runtime);
    expect(runtime.calls).toContainEqual({ fn: 'LoadSpriteSheet', args: [sEggHatch_Sheet] });
    expect(runtime.calls).toContainEqual({ fn: 'LoadSpriteSheet', args: [sEggShards_Sheet] });
    expect(runtime.calls).toContainEqual({ fn: 'LoadSpritePalette', args: [sEgg_SpritePalette] });
    expect(runtime.mainState).toBe(4);

    CB2_EggHatch_0(runtime);
    expect(runtime.playerParty[0]).toMatchObject({
      species: 'SPECIES_CHARMANDER',
      nickname: 'CHARMANDER',
      metLocation: 44,
      ppRestored: true,
      statsCalculated: true
    });
    expect(runtime.pokedex.seenSpecies).toEqual(['CHARMANDER']);
    expect(runtime.mainState).toBe(5);

    CB2_EggHatch_0(runtime);
    expect(runtime.sEggHatchData.species).toBe('SPECIES_CHARMANDER');
    expect(runtime.calls).toContainEqual({
      fn: 'HandleLoadSpecialPokePic',
      args: ['SPECIES_CHARMANDER', 1, 'SPECIES_CHARMANDER', 0x2222]
    });
    expect(runtime.mainState).toBe(6);

    CB2_EggHatch_0(runtime);
    expect(runtime.sEggHatchData.pokeSpriteID).toBe(2);
    expect(runtime.sprites[2]).toMatchObject({
      id: 2,
      x: 120,
      y: 70,
      invisible: true,
      callback: 'SpriteCallbackDummy'
    });
    expect(runtime.mainState).toBe(7);

    CB2_EggHatch_0(runtime);
    expect(runtime.gpuRegs.REG_OFFSET_DISPCNT).toBe(DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
    expect(runtime.calls).toContainEqual({ fn: 'CopyBgTilemapBufferToVram', args: [1] });
    expect(runtime.mainState).toBe(8);

    CB2_EggHatch_0(runtime);
    expect(runtime.mainCallback2).toBe('CB2_EggHatch_1');
    expect(runtime.sEggHatchData.CB2_state).toBe(0);
  });

  test('EggHatchCreateMonSprite preserves switchID 0 species load and switchID 1 invisible sprite creation', () => {
    const runtime = createEggHatchRuntime({
      playerParty: [{ species: 'SPECIES_PIKACHU', personality: 0x12345678 }]
    });

    expect(EggHatchCreateMonSprite(runtime, 1, 0, 0)).toBe(0);
    expect(runtime.sEggHatchData.species).toBe('SPECIES_PIKACHU');
    expect(runtime.calls).toContainEqual({
      fn: 'HandleLoadSpecialPokePic',
      args: ['SPECIES_PIKACHU', 3, 'SPECIES_PIKACHU', 0x12345678]
    });

    const spriteId = EggHatchCreateMonSprite(runtime, 1, 1, 0);
    expect(spriteId).toBe(2);
    expect(runtime.sprites[2]).toMatchObject({
      x: 120,
      y: 70,
      invisible: true,
      callback: 'SpriteCallbackDummy'
    });
    expect(runtime.calls).toContainEqual({ fn: 'SetMultiuseSpriteTemplateToPokemon', args: ['SPECIES_PIKACHU', 3] });
  });

  test('Task_EggHatchPlayBGM follows the C timer checks including destroyed-task increment quirk', () => {
    const runtime = createEggHatchRuntime();
    const taskId = EggHatch(runtime);
    runtime.calls = [];

    Task_EggHatchPlayBGM(runtime, taskId);
    expect(runtime.calls).toContainEqual({ fn: 'StopMapMusic', args: [] });
    expect(runtime.tasks[taskId]?.data[0]).toBe(1);

    Task_EggHatchPlayBGM(runtime, taskId);
    expect(runtime.calls).toContainEqual({ fn: 'PlayBGM', args: [MUS_EVOLUTION_INTRO] });
    expect(runtime.tasks[taskId]?.data[0]).toBe(2);

    runtime.tasks[taskId]!.data[0] = 61;
    Task_EggHatchPlayBGM(runtime, taskId);
    expect(runtime.calls).toContainEqual({ fn: 'PlayBGM', args: [MUS_EVOLUTION] });
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
    expect(runtime.tasks[taskId]?.data[0]).toBe(62);
  });

  test('EggHatchSetMonNickname stores nickname, frees hatch resources, enables help, and returns to field', () => {
    const runtime = createEggHatchRuntime({
      specialVars: { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 0 },
      playerParty: [{ species: 'SPECIES_PIKACHU', nickname: 'PIKACHU' }],
      gStringVar3: 'SPARKY',
      allocatedEggHatchData: true,
      monSpritesGfxAllocated: true,
      helpSystemEnabled: false
    });

    EggHatchSetMonNickname(runtime);

    expect(runtime.playerParty[0].nickname).toBe('SPARKY');
    expect(runtime.monSpritesGfxAllocated).toBe(false);
    expect(runtime.allocatedEggHatchData).toBe(false);
    expect(runtime.helpSystemEnabled).toBe(true);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');
    expect(runtime.calls).toEqual([
      { fn: 'SetMonData', args: [0, 'MON_DATA_NICKNAME', 'SPARKY'] },
      { fn: 'FreeMonSpritesGfx', args: [] },
      { fn: 'Free', args: ['sEggHatchData'] },
      { fn: 'HelpSystem_Enable', args: [] },
      { fn: 'SetMainCallback2', args: ['CB2_ReturnToField'] }
    ]);
  });

  test('CB2_EggHatch_1 preserves animation, message, naming prompt, and fade-out state transitions', () => {
    const runtime = createEggHatchRuntime({
      playerParty: [{
        species: 'SPECIES_PIKACHU',
        nickname: 'PIKACHU',
        personality: 0x1234,
        gender: MON_FEMALE
      }],
      allocatedEggHatchData: true,
      monSpritesGfxAllocated: true,
      helpSystemEnabled: false
    });
    runtime.sEggHatchData.windowId = 7;
    runtime.sEggHatchData.eggPartyID = 0;
    runtime.sEggHatchData.species = 'SPECIES_PIKACHU';

    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(1);
    expect(runtime.paletteFadeActive).toBe(true);
    expect(runtime.sprites[runtime.sEggHatchData.eggSpriteID]).toMatchObject({
      x: 120,
      y: 75,
      callback: 'SpriteCallbackDummy'
    });
    expect(runtime.calls).toContainEqual({ fn: 'CreateTask', args: ['Task_EggHatchPlayBGM', 5, 0] });

    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(1);
    runtime.paletteFadeActive = false;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(2);
    expect(runtime.sEggHatchData.CB2_PalCounter).toBe(0);
    expect(runtime.calls).toContainEqual({ fn: 'FillWindowPixelBuffer', args: [7, 0x00] });

    for (let i = 0; i < 30; i += 1)
      CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(2);
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(3);
    expect(runtime.sprites[runtime.sEggHatchData.eggSpriteID].callback).toBe('SpriteCB_Egg_0');

    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(3);
    runtime.sprites[runtime.sEggHatchData.eggSpriteID].callback = 'SpriteCallbackDummy';
    CB2_EggHatch_1(runtime);
    expect(runtime.calls).toContainEqual({ fn: 'PlayCry_Normal', args: ['SPECIES_PIKACHU', 0] });
    expect(runtime.sEggHatchData.CB2_state).toBe(4);

    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(4);
    runtime.cryFinished = true;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(5);

    CB2_EggHatch_1(runtime);
    expect(runtime.gStringVar4).toBe('PIKACHU hatched from the EGG!');
    expect(runtime.calls).toContainEqual({ fn: 'PlayFanfare', args: [MUS_EVOLVED] });
    expect(runtime.sEggHatchData.CB2_state).toBe(6);

    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(6);
    runtime.fanfareTaskInactive = true;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(7);
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(8);

    CB2_EggHatch_1(runtime);
    expect(runtime.gStringVar4).toBe('Would you like to nickname the newly\nhatched PIKACHU?');
    expect(runtime.sEggHatchData.CB2_state).toBe(9);

    runtime.textPrinterActive = true;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(9);
    runtime.textPrinterActive = false;
    CB2_EggHatch_1(runtime);
    expect(runtime.calls).toContainEqual({ fn: 'CreateYesNoMenu', args: [sYesNoWinTemplate, FONT_NORMAL_COPY_2, 0, 2, 0x140, 14, 0] });
    expect(runtime.sEggHatchData.CB2_state).toBe(10);

    runtime.menuInput = 0;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(10);
    expect(runtime.gStringVar3).toBe('PIKACHU');
    expect(runtime.calls).toContainEqual({
      fn: 'DoNamingScreen',
      args: [NAMING_SCREEN_NICKNAME, 'PIKACHU', 'SPECIES_PIKACHU', MON_FEMALE, 0x1234, 'EggHatchSetMonNickname']
    });

    runtime.menuInput = 1;
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(11);
    CB2_EggHatch_1(runtime);
    expect(runtime.sEggHatchData.CB2_state).toBe(12);
    expect(runtime.paletteFadeActive).toBe(true);

    CB2_EggHatch_1(runtime);
    expect(runtime.mainCallback2).not.toBe('CB2_ReturnToField');
    runtime.paletteFadeActive = false;
    CB2_EggHatch_1(runtime);
    expect(runtime.bgTilemapBuffers[0]).toBeNull();
    expect(runtime.bgTilemapBuffers[1]).toBeNull();
    expect(runtime.allocatedEggHatchData).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');
    expect(runtime.helpSystemEnabled).toBe(true);
  });

  test('CB2_EggHatch_1 advances from prompt on B/no input exactly like daycare.c', () => {
    const runtime = createEggHatchRuntime({ menuInput: -1 });
    runtime.sEggHatchData.CB2_state = 10;

    CB2_EggHatch_1(runtime);

    expect(runtime.sEggHatchData.CB2_state).toBe(11);
    expect(runtime.calls).toContainEqual({ fn: 'Menu_ProcessInputNoWrapClearOnChoose', args: [-1] });
  });

  test('egg hatch sprite callback 0 waits 20 ticks, shakes with Sin, and spawns one shard on frame 15', () => {
    const runtime = createEggHatchRuntime({ random: () => 6 });
    const egg = runtime.sprites[0];

    for (let i = 0; i < 14; i += 1)
      SpriteCB_Egg_0(runtime, egg);
    expect(runtime.sprites).toHaveLength(2);

    SpriteCB_Egg_0(runtime, egg);
    expect(egg.data[0]).toBe(15);
    expect(egg.animNum).toBe(1);
    expect(runtime.sprites).toHaveLength(3);
    expect(runtime.sEggHatchData.eggShardVelocityID).toBe(1);
    expect(runtime.sprites[2].data.slice(1, 4)).toEqual([sEggShardVelocities[0][0], sEggShardVelocities[0][1], 100]);
    expect(runtime.sprites[2].animNum).toBe(2);
    expect(runtime.calls).toContainEqual({ fn: 'PlaySE', args: [SE_BALL] });

    for (let i = 0; i < 6; i += 1)
      SpriteCB_Egg_0(runtime, egg);
    expect(egg.callback).toBe('SpriteCB_Egg_1');
    expect(egg.data[0]).toBe(0);
  });

  test('egg hatch callbacks 1 and 2 gate animation on data2 > 30 and preserve transition side effects', () => {
    const runtime = createEggHatchRuntime({
      random: () => 1,
      playerParty: [{ species: 25 }],
      monFrontPicCoords: { 25: { y_offset: 9 } }
    });
    const egg = runtime.sprites[0];
    const poke = runtime.sprites[1];
    egg.callback = 'SpriteCB_Egg_1';
    egg.data[2] = 30;

    for (let i = 0; i < 15; i += 1) {
      egg.data[2] = 30;
      SpriteCB_Egg_1(runtime, egg);
    }
    expect(egg.data[0]).toBe(15);
    expect(egg.animNum).toBe(2);

    for (let i = 0; i < 6; i += 1) {
      egg.data[2] = 30;
      SpriteCB_Egg_1(runtime, egg);
    }
    expect(egg.callback).toBe('SpriteCB_Egg_2');
    expect(egg.data[0]).toBe(0);
    expect(egg.data[2]).toBe(0);

    egg.data[2] = 30;
    for (let i = 0; i < 15; i += 1) {
      egg.data[2] = 30;
      SpriteCB_Egg_2(runtime, egg);
    }
    expect(runtime.sprites).toHaveLength(4);
    expect(runtime.sEggHatchData.eggShardVelocityID).toBe(2);

    for (let i = 0; i < 15; i += 1) {
      egg.data[2] = 30;
      SpriteCB_Egg_2(runtime, egg);
    }
    expect(runtime.calls.filter((call) => call.fn === 'PlaySE' && call.args[0] === SE_BALL)).toHaveLength(3);

    for (let i = 0; i < 9; i += 1) {
      egg.data[2] = 30;
      SpriteCB_Egg_2(runtime, egg);
    }
    expect(egg.callback).toBe('SpriteCB_Egg_3');
    expect(egg.data[0]).toBe(0);
    expect(poke).toMatchObject({ x2: 0, y2: 9 });
  });

  test('egg hatch callbacks 3 through 5 preserve fade, shard burst, reveal, lift, and dummy transition timing', () => {
    const runtime = createEggHatchRuntime({ random: () => 0 });
    const egg = runtime.sprites[0];
    const poke = runtime.sprites[1];
    egg.callback = 'SpriteCB_Egg_3';

    for (let i = 0; i < 51; i += 1)
      SpriteCB_Egg_3(runtime, egg);
    expect(egg.callback).toBe('SpriteCB_Egg_4');
    expect(egg.data[0]).toBe(0);

    SpriteCB_Egg_4(runtime, egg);
    expect(runtime.calls).toContainEqual({ fn: 'BeginNormalPaletteFade', args: [PALETTES_ALL, -1, 0, 0x10, 0xffff] });
    expect(runtime.sprites).toHaveLength(6);
    expect(egg.callback).toBe('SpriteCB_Egg_4');

    runtime.paletteFadeActive = false;
    SpriteCB_Egg_4(runtime, egg);
    expect(runtime.sprites).toHaveLength(10);
    expect(egg.invisible).toBe(true);
    expect(egg.callback).toBe('SpriteCB_Egg_5');
    expect(egg.data[0]).toBe(0);
    expect(runtime.calls).toContainEqual({ fn: 'PlaySE', args: [SE_EGG_HATCH] });

    SpriteCB_Egg_5(runtime, egg);
    expect(poke.invisible).toBe(false);
    expect(poke.affineAnimNum).toBe(1);
    expect(poke.y).toBe(-1);

    for (let i = 1; i <= 8; i += 1)
      SpriteCB_Egg_5(runtime, egg);
    expect(runtime.calls).toContainEqual({ fn: 'BeginNormalPaletteFade', args: [PALETTES_ALL, -1, 0x10, 0, 0xffff] });

    while (egg.data[0] <= 41)
      SpriteCB_Egg_5(runtime, egg);
    expect(egg.callback).toBe('SpriteCallbackDummy');
  });

  test('egg shard creation and callback use signed Q8.8 movement, gravity, and destroy threshold exactly', () => {
    const runtime = createEggHatchRuntime();
    const shardId = CreateEggShardSprite(runtime, 120, 60, -384, -960, 100, 3);
    const shard = runtime.sprites[shardId];

    SpriteCB_EggShard(runtime, shard);
    expect(shard).toMatchObject({ x2: -1, y2: -3 });
    expect(shard.data.slice(1, 6)).toEqual([-384, -860, 100, -384, -960]);

    while (shard.callback !== 'Destroyed')
      SpriteCB_EggShard(runtime, shard);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'DestroySprite', args: [shardId] });
  });

  test('egg hatch message helper sets text colors before AddTextPrinterParameterized4', () => {
    const runtime = createEggHatchRuntime();
    EggHatchPrintMessage(runtime, 7, 'Oh?', 2, 3, 4);

    expect(runtime.sEggHatchData.textColor).toEqual([0, 5, 6]);
    expect(runtime.calls).toEqual([
      { fn: 'FillWindowPixelBuffer', args: [7, 0xff] },
      { fn: 'AddTextPrinterParameterized4', args: [7, 'FONT_NORMAL_COPY_2', 2, 3, 1, 1, [0, 5, 6], 4, 'Oh?'] }
    ]);

    const runtime2 = createEggHatchRuntime({ random: () => 3 });
    const randomShardId = CreateRandomEggShardSprite(runtime2);
    expect(runtime2.sprites[randomShardId].animNum).toBe(3);
    expect(runtime2.sEggHatchData.eggShardVelocityID).toBe(1);
  });
});
