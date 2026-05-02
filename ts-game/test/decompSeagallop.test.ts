import { describe, expect, it } from 'vitest';
import {
  CB2_SetUpSeagallopScene,
  CreateFerrySprite,
  CreateWakeSprite,
  DIRN_EASTBOUND,
  DIRN_WESTBOUND,
  DISPCNT_BG0_ON,
  DISPCNT_BG3_ON,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_OBJ_ON,
  DISPCNT_WIN0_ON,
  DoSeagallopFerryScene,
  GetDirectionOfTravel,
  GetSeagallopNumber,
  IsPlayerLeftOfVermilionSailor,
  MAP_GROUP,
  MAP_NUM,
  MAP_VERMILION_CITY,
  MAX_SPRITES,
  REG_OFFSET_DISPCNT,
  SEAGALLOP_BIRTH_ISLAND,
  SEAGALLOP_CINNABAR_ISLAND,
  SEAGALLOP_FIVE_ISLAND,
  SEAGALLOP_FOUR_ISLAND,
  SEAGALLOP_NAVEL_ROCK,
  SEAGALLOP_ONE_ISLAND,
  SEAGALLOP_SEVEN_ISLAND,
  SEAGALLOP_SIX_ISLAND,
  SEAGALLOP_THREE_ISLAND,
  SEAGALLOP_TWO_ISLAND,
  SEAGALLOP_VERMILION_CITY,
  SE_EXIT,
  SE_SHIP,
  SpriteCB_Ferry,
  SpriteCB_Wake,
  Task_Seagallop_1,
  Task_Seagallop_2,
  TILESTAG_FERRY,
  TILESTAG_WAKE,
  WARP_ID_NONE,
  createSeagallopRuntime,
  sSeag,
} from '../src/game/decompSeagallop';

describe('decompSeagallop', () => {
  it('DoSeagallopFerryScene disables help and installs setup callback', () => {
    const runtime = createSeagallopRuntime();

    DoSeagallopFerryScene(runtime);

    expect(runtime.vBlankCallback).toBeNull();
    expect(runtime.helpSystemEnabled).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_SetUpSeagallopScene');
  });

  it('GetDirectionOfTravel follows the bitpacked C matrix and out-of-range origin fallback', () => {
    const runtime = createSeagallopRuntime();
    runtime.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    runtime.gSpecialVar_0x8006 = SEAGALLOP_VERMILION_CITY;
    expect(GetDirectionOfTravel(runtime)).toBe(DIRN_WESTBOUND);

    runtime.gSpecialVar_0x8006 = SEAGALLOP_ONE_ISLAND;
    expect(GetDirectionOfTravel(runtime)).toBe(DIRN_EASTBOUND);

    runtime.gSpecialVar_0x8004 = SEAGALLOP_BIRTH_ISLAND;
    runtime.gSpecialVar_0x8006 = SEAGALLOP_SEVEN_ISLAND;
    expect(GetDirectionOfTravel(runtime)).toBe(DIRN_WESTBOUND);

    runtime.gSpecialVar_0x8004 = 99;
    expect(GetDirectionOfTravel(runtime)).toBe(DIRN_EASTBOUND);
  });

  it('CB2_SetUpSeagallopScene advances through setup states and keeps the DMA busy comparison exact', () => {
    const runtime = createSeagallopRuntime();
    for (let state = 0; state <= 3; state += 1) {
      expect(runtime.gMain.state).toBe(state);
      CB2_SetUpSeagallopScene(runtime);
    }

    expect(runtime.sBg3TilemapBuffer).toEqual({ zeroedBytes: 0x800 });
    expect(runtime.bgX).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 });
    expect(runtime.bgY).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 });
    expect(runtime.gMain.state).toBe(4);

    runtime.dma3BusyWithBgCopy = DIRN_EASTBOUND;
    CB2_SetUpSeagallopScene(runtime);
    expect(runtime.gMain.state).toBe(4);
    expect(runtime.shownBgs).toEqual([]);

    runtime.dma3BusyWithBgCopy = DIRN_WESTBOUND;
    CB2_SetUpSeagallopScene(runtime);
    expect(runtime.gMain.state).toBe(5);
    expect(runtime.shownBgs).toEqual([0, 3]);
  });

  it('final setup state creates the ferry, window registers, task, and main callback', () => {
    const runtime = createSeagallopRuntime();
    runtime.gMain.state = 7;
    runtime.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    runtime.gSpecialVar_0x8006 = SEAGALLOP_ONE_ISLAND;

    CB2_SetUpSeagallopScene(runtime);

    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON | DISPCNT_OBJ_ON | DISPCNT_WIN0_ON);
    expect(runtime.vBlankCallback).toBe('VBlankCB_SeaGallop');
    expect(runtime.playedSE).toEqual([SE_SHIP]);
    expect(runtime.sprites[0]).toMatchObject({ kind: 'ferry', x: 0, y: 92, data: [48, 0, 0, 0, 0, 0, 0, 0], anim: 1 });
    expect(runtime.tasks[0]).toMatchObject({ func: 'Task_Seagallop_0', priority: 8 });
    expect(runtime.mainCallback2).toBe('MainCB2_SeaGallop');
    expect(runtime.gMain.state).toBe(0);
  });

  it('CreateFerrySprite mirrors eastbound and westbound initialization', () => {
    const eastbound = createSeagallopRuntime();
    eastbound.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    eastbound.gSpecialVar_0x8006 = SEAGALLOP_ONE_ISLAND;
    expect(CreateFerrySprite(eastbound)).toBe(0);
    expect(eastbound.sprites[0]).toMatchObject({ x: 0, data: [48, 0, 0, 0, 0, 0, 0, 0], anim: 1 });

    const westbound = createSeagallopRuntime();
    westbound.gSpecialVar_0x8004 = SEAGALLOP_ONE_ISLAND;
    westbound.gSpecialVar_0x8006 = SEAGALLOP_VERMILION_CITY;
    expect(CreateFerrySprite(westbound)).toBe(0);
    expect(westbound.sprites[0]).toMatchObject({ x: 240, data: [-48, 0, 0, 0, 0, 0, 0, 0], anim: 0 });
  });

  it('SpriteCB_Ferry moves in sixteenth-pixel units, creates wakes every five frames, and uses u16 destruction check', () => {
    const runtime = createSeagallopRuntime();
    runtime.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    runtime.gSpecialVar_0x8006 = SEAGALLOP_ONE_ISLAND;
    const spriteId = CreateFerrySprite(runtime);

    SpriteCB_Ferry(runtime, spriteId);
    expect(runtime.sprites[spriteId].data[1]).toBe(48);
    expect(runtime.sprites[spriteId].x2).toBe(3);
    expect(runtime.sprites[spriteId].data[2]).toBe(1);
    expect(runtime.sprites[1]).toMatchObject({ kind: 'wake', x: 3, y: 92, priority: 8 });

    runtime.sprites[spriteId].data[1] = 4816;
    SpriteCB_Ferry(runtime, spriteId);
    expect(runtime.sprites[spriteId].x2).toBe(304);
    expect(runtime.sprites[spriteId].destroyed).toBe(true);

    const westbound = createSeagallopRuntime();
    westbound.gSpecialVar_0x8004 = SEAGALLOP_ONE_ISLAND;
    westbound.gSpecialVar_0x8006 = SEAGALLOP_VERMILION_CITY;
    const westSpriteId = CreateFerrySprite(westbound);
    SpriteCB_Ferry(westbound, westSpriteId);
    expect(westbound.sprites[westSpriteId].x2).toBe(-3);
    expect(westbound.sprites[westSpriteId].destroyed).toBe(false);

    westbound.sprites[westSpriteId].data[1] = -4816;
    SpriteCB_Ferry(westbound, westSpriteId);
    expect(westbound.sprites[westSpriteId].x2).toBe(-304);
    expect(westbound.sprites[westSpriteId].destroyed).toBe(true);
  });

  it('SpriteCB_Wake only destroys ended wake animations', () => {
    const runtime = createSeagallopRuntime();
    CreateFerrySprite(runtime);
    SpriteCB_Ferry(runtime, 0);
    const wakeId = 1;

    SpriteCB_Wake(runtime, wakeId);
    expect(runtime.sprites[wakeId].destroyed).toBe(false);

    runtime.sprites[wakeId].animEnded = true;
    SpriteCB_Wake(runtime, wakeId);
    expect(runtime.sprites[wakeId].destroyed).toBe(true);
  });

  it('task 1 scrolls for 140 frames before fading music and switching to task 2', () => {
    const runtime = createSeagallopRuntime();
    runtime.tasks.push({ func: 'Task_Seagallop_1', priority: 8, data: Array(16).fill(0), destroyed: false });
    runtime.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    runtime.gSpecialVar_0x8006 = SEAGALLOP_ONE_ISLAND;

    for (let i = 0; i < 139; i += 1) {
      Task_Seagallop_1(runtime, 0);
    }
    expect(runtime.tasks[0].func).toBe('Task_Seagallop_1');
    expect(runtime.bgX[3]).toBe(0x600 * 139);

    Task_Seagallop_1(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_Seagallop_2');
    expect(runtime.sideEffects.slice(-2)).toEqual(['Overworld_FadeOutMapMusic', 'WarpFadeOutScreen']);
  });

  it('task 2 performs warp cleanup only when music is stopped and palette fade is inactive', () => {
    const runtime = createSeagallopRuntime();
    runtime.sBg3TilemapBuffer = { zeroedBytes: 0x800 };
    runtime.tasks.push({ func: 'Task_Seagallop_2', priority: 8, data: Array(16).fill(0), destroyed: false });
    runtime.gSpecialVar_0x8006 = SEAGALLOP_CINNABAR_ISLAND;
    runtime.bgMusicStopped = false;

    Task_Seagallop_2(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(false);
    expect(runtime.warpDestination).toBeNull();

    runtime.bgMusicStopped = true;
    runtime.gPaletteFade.active = false;
    Task_Seagallop_2(runtime, 0);
    expect(runtime.warpDestination).toEqual({
      mapGroup: sSeag[SEAGALLOP_CINNABAR_ISLAND][0],
      mapNum: sSeag[SEAGALLOP_CINNABAR_ISLAND][1],
      warpId: WARP_ID_NONE,
      x: 0x15,
      y: 0x07,
    });
    expect(runtime.playedSE).toEqual([SE_EXIT]);
    expect(runtime.gFieldCallback).toBe('FieldCB_DefaultWarpExit');
    expect(runtime.mainCallback2).toBe('CB2_LoadMap');
    expect(runtime.helpSystemEnabled).toBe(true);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(runtime.freedSpriteTiles).toEqual([TILESTAG_FERRY, TILESTAG_WAKE]);
    expect(runtime.sBg3TilemapBuffer).toBeNull();
  });

  it('GetSeagallopNumber keeps the exact C priority order', () => {
    const runtime = createSeagallopRuntime();
    const numberFor = (origin: number, dest: number) => {
      runtime.gSpecialVar_0x8004 = origin;
      runtime.gSpecialVar_0x8006 = dest;
      return GetSeagallopNumber(runtime);
    };

    expect(numberFor(SEAGALLOP_CINNABAR_ISLAND, SEAGALLOP_VERMILION_CITY)).toBe(1);
    expect(numberFor(SEAGALLOP_VERMILION_CITY, SEAGALLOP_ONE_ISLAND)).toBe(7);
    expect(numberFor(SEAGALLOP_NAVEL_ROCK, SEAGALLOP_ONE_ISLAND)).toBe(10);
    expect(numberFor(SEAGALLOP_BIRTH_ISLAND, SEAGALLOP_ONE_ISLAND)).toBe(12);
    expect(numberFor(SEAGALLOP_ONE_ISLAND, SEAGALLOP_THREE_ISLAND)).toBe(2);
    expect(numberFor(SEAGALLOP_FOUR_ISLAND, SEAGALLOP_FIVE_ISLAND)).toBe(3);
    expect(numberFor(SEAGALLOP_SIX_ISLAND, SEAGALLOP_SEVEN_ISLAND)).toBe(5);
    expect(numberFor(SEAGALLOP_TWO_ISLAND, SEAGALLOP_FIVE_ISLAND)).toBe(6);
  });

  it('IsPlayerLeftOfVermilionSailor checks exact map group, map number, and x < 24', () => {
    const runtime = createSeagallopRuntime();
    runtime.gSaveBlock1Ptr.location.mapGroup = MAP_GROUP(MAP_VERMILION_CITY);
    runtime.gSaveBlock1Ptr.location.mapNum = MAP_NUM(MAP_VERMILION_CITY);
    runtime.gSaveBlock1Ptr.pos.x = 23;
    expect(IsPlayerLeftOfVermilionSailor(runtime)).toBe(true);

    runtime.gSaveBlock1Ptr.pos.x = 24;
    expect(IsPlayerLeftOfVermilionSailor(runtime)).toBe(false);

    runtime.gSaveBlock1Ptr.pos.x = 23;
    runtime.gSaveBlock1Ptr.location.mapNum += 1;
    expect(IsPlayerLeftOfVermilionSailor(runtime)).toBe(false);
  });

  it('CreateWakeSprite honors MAX_SPRITES failure without creating a sprite', () => {
    const runtime = createSeagallopRuntime();
    runtime.nextCreateSpriteResult = MAX_SPRITES;
    expect(CreateWakeSprite(runtime, 10)).toBe(MAX_SPRITES);
    expect(runtime.sprites).toHaveLength(0);
  });
});
