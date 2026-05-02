export const TAG_VS_LETTERS = 10000;
export const sUnused = [1, 2] as const;

export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_FIRST_BATTLE = 1 << 4;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_BATTLE_TOWER = 1 << 8;
export const BATTLE_TYPE_EREADER_TRAINER = 1 << 11;
export const BATTLE_TYPE_KYOGRE_GROUDON = 1 << 12;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const BATTLE_TYPE_TRAINER_TOWER = 1 << 19;

export const B_OUTCOME_WON = 1;
export const B_OUTCOME_DREW = 3;
export const VERSION_FIRE_RED = 4;
export const TRAINER_CLASS_LEADER = 84;
export const TRAINER_CLASS_CHAMPION = 90;
export const BIT_SIDE = 1;

export const MAP_BATTLE_SCENE_NORMAL = 0;
export const MAP_BATTLE_SCENE_GYM = 1;
export const MAP_BATTLE_SCENE_INDOOR_1 = 2;
export const MAP_BATTLE_SCENE_INDOOR_2 = 3;
export const MAP_BATTLE_SCENE_LORELEI = 4;
export const MAP_BATTLE_SCENE_BRUNO = 5;
export const MAP_BATTLE_SCENE_AGATHA = 6;
export const MAP_BATTLE_SCENE_LANCE = 7;
export const MAP_BATTLE_SCENE_LINK = 8;

export const BATTLE_TERRAIN_GRASS = 0;
export const BATTLE_TERRAIN_LONG_GRASS = 1;
export const BATTLE_TERRAIN_SAND = 2;
export const BATTLE_TERRAIN_UNDERWATER = 3;
export const BATTLE_TERRAIN_WATER = 4;
export const BATTLE_TERRAIN_POND = 5;
export const BATTLE_TERRAIN_MOUNTAIN = 6;
export const BATTLE_TERRAIN_CAVE = 7;
export const BATTLE_TERRAIN_BUILDING = 8;
export const BATTLE_TERRAIN_PLAIN = 9;
export const BATTLE_TERRAIN_LINK = 10;
export const BATTLE_TERRAIN_GYM = 11;
export const BATTLE_TERRAIN_LEADER = 12;
export const BATTLE_TERRAIN_INDOOR_2 = 13;
export const BATTLE_TERRAIN_INDOOR_1 = 14;
export const BATTLE_TERRAIN_LORELEI = 15;
export const BATTLE_TERRAIN_BRUNO = 16;
export const BATTLE_TERRAIN_AGATHA = 17;
export const BATTLE_TERRAIN_LANCE = 18;
export const BATTLE_TERRAIN_CHAMPION = 19;

export const B_WIN_MSG = 0;
export const B_WIN_VS_PLAYER = 15;
export const B_WIN_VS_OPPONENT = 16;
export const B_WIN_VS_MULTI_PLAYER_1 = 17;
export const B_WIN_VS_MULTI_PLAYER_2 = 18;
export const B_WIN_VS_MULTI_PLAYER_3 = 19;
export const B_WIN_VS_MULTI_PLAYER_4 = 20;
export const B_WIN_VS_OUTCOME_DRAW = 21;
export const B_WIN_VS_OUTCOME_LEFT = 22;
export const B_WIN_VS_OUTCOME_RIGHT = 23;

export interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BattleBackground {
  tileset: string;
  tilemap: string;
  entryTileset: string;
  entryTilemap: string;
  palette: string;
}

export interface BattleBgSprite {
  x: number;
  invisible: boolean;
  oam: { tileNum: number };
  data: number[];
}

export interface BattleBgTask {
  data: number[];
  destroyed: boolean;
}

export interface LinkPlayer {
  id: number;
  name: string;
}

export interface BattleBgRuntime {
  gBattleTypeFlags: number;
  gBattleTerrain: number;
  gBattleOutcome: number;
  gGameVersion: number;
  gTrainerBattleOpponent_A: number;
  trainers: Record<number, { trainerClass: number }>;
  currentMapBattleScene: number;
  gBattleStruct: { multiplayerId: number; linkBattleVsSpriteId_V: number; linkBattleVsSpriteId_S: number };
  gLinkPlayers: LinkPlayer[];
  gTasks: BattleBgTask[];
  gSprites: BattleBgSprite[];
  gBattle_BG1_X: number;
  gBattle_BG1_Y: number;
  gBattle_BG2_X: number;
  gBattle_BG2_Y: number;
  mainCallback2: string | null;
  operations: string[];
  textWindows: Array<{ text: string; windowId: number }>;
  tilemapCopies: Array<{ bgId: number; tiles: number[]; destX: number; destY: number; width: number; height: number; pal: number }>;
}

export const gBattleBgTemplates: readonly BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0x000 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0x000 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0x000 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 26, screenSize: 1, paletteMode: 0, priority: 3, baseTile: 0x000 }
] as const;

export const sStandardBattleWindowTemplates: readonly (WindowTemplate | null)[] = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 0, baseBlock: 0x090 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 35, width: 14, height: 4, paletteNum: 0, baseBlock: 0x1c0 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 35, width: 12, height: 4, paletteNum: 5, baseBlock: 0x190 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 0x300 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 0x310 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x320 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x330 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 3, height: 2, paletteNum: 5, baseBlock: 0x290 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 0x296 },
  { bg: 0, tilemapLeft: 24, tilemapTop: 55, width: 5, height: 2, paletteNum: 5, baseBlock: 0x2a6 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 57, width: 0, height: 0, paletteNum: 5, baseBlock: 0x2b0 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 8, height: 4, paletteNum: 5, baseBlock: 0x2b0 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 8, width: 10, height: 11, paletteNum: 5, baseBlock: 0x100 },
  { bg: 2, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 3, paletteNum: 6, baseBlock: 0x16e },
  { bg: 0, tilemapLeft: 25, tilemapTop: 9, width: 4, height: 4, paletteNum: 5, baseBlock: 0x100 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 3, width: 7, height: 2, paletteNum: 5, baseBlock: 0x020 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 3, width: 7, height: 2, paletteNum: 5, baseBlock: 0x040 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 2, width: 7, height: 2, paletteNum: 5, baseBlock: 0x020 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 2, width: 7, height: 2, paletteNum: 5, baseBlock: 0x040 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 6, width: 7, height: 2, paletteNum: 5, baseBlock: 0x060 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 6, width: 7, height: 2, paletteNum: 5, baseBlock: 0x080 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 2, width: 8, height: 2, paletteNum: 0, baseBlock: 0x0a0 },
  { bg: 0, tilemapLeft: 4, tilemapTop: 2, width: 8, height: 2, paletteNum: 0, baseBlock: 0x0a0 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 2, width: 8, height: 2, paletteNum: 0, baseBlock: 0x0b0 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 7, baseBlock: 0x090 },
  null
] as const;

const terrainName = (name: string): BattleBackground => ({
  tileset: `sBattleTerrainTiles_${name}`,
  tilemap: `sBattleTerrainTilemap_${name}`,
  entryTileset: `sBattleTerrainAnimTiles_${name}`,
  entryTilemap: `sBattleTerrainAnimTilemap_${name}`,
  palette: `sBattleTerrainPalette_${name}`
});

export const sBattleTerrainTable: readonly BattleBackground[] = [
  terrainName('Grass'),
  terrainName('LongGrass'),
  terrainName('Sand'),
  terrainName('Underwater'),
  terrainName('Water'),
  terrainName('Pond'),
  terrainName('Mountain'),
  terrainName('Cave'),
  terrainName('Building'),
  { ...terrainName('Building'), palette: 'sBattleTerrainPalette_Plain' },
  { ...terrainName('Building'), palette: 'sBattleTerrainPalette_Link' },
  { ...terrainName('Building'), palette: 'sBattleTerrainPalette_Gym' },
  { ...terrainName('Building'), palette: 'sBattleTerrainPalette_Leader' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Indoor2' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Indoor1' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Lorelei' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Bruno' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Agatha' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Lance' },
  { tileset: 'sBattleTerrainTiles_Indoor', tilemap: 'sBattleTerrainTilemap_Indoor', entryTileset: 'sBattleTerrainAnimTiles_Building', entryTilemap: 'sBattleTerrainAnimTilemap_Building', palette: 'sBattleTerrainPalette_Champion' }
] as const;

export const sMapBattleSceneMapping = [
  { mapScene: MAP_BATTLE_SCENE_GYM, battleTerrain: BATTLE_TERRAIN_GYM },
  { mapScene: MAP_BATTLE_SCENE_INDOOR_1, battleTerrain: BATTLE_TERRAIN_INDOOR_1 },
  { mapScene: MAP_BATTLE_SCENE_INDOOR_2, battleTerrain: BATTLE_TERRAIN_INDOOR_2 },
  { mapScene: MAP_BATTLE_SCENE_LORELEI, battleTerrain: BATTLE_TERRAIN_LORELEI },
  { mapScene: MAP_BATTLE_SCENE_BRUNO, battleTerrain: BATTLE_TERRAIN_BRUNO },
  { mapScene: MAP_BATTLE_SCENE_AGATHA, battleTerrain: BATTLE_TERRAIN_AGATHA },
  { mapScene: MAP_BATTLE_SCENE_LANCE, battleTerrain: BATTLE_TERRAIN_LANCE },
  { mapScene: MAP_BATTLE_SCENE_LINK, battleTerrain: BATTLE_TERRAIN_LINK }
] as const;

export const createBattleBgRuntime = (overrides: Partial<BattleBgRuntime> = {}): BattleBgRuntime => ({
  gBattleTypeFlags: 0,
  gBattleTerrain: BATTLE_TERRAIN_GRASS,
  gBattleOutcome: B_OUTCOME_WON,
  gGameVersion: VERSION_FIRE_RED,
  gTrainerBattleOpponent_A: 0,
  trainers: {},
  currentMapBattleScene: MAP_BATTLE_SCENE_NORMAL,
  gBattleStruct: { multiplayerId: 0, linkBattleVsSpriteId_V: 0, linkBattleVsSpriteId_S: 0 },
  gLinkPlayers: [
    { id: 0, name: 'P0' },
    { id: 1, name: 'P1' },
    { id: 2, name: 'P2' },
    { id: 3, name: 'P3' }
  ],
  gTasks: [],
  gSprites: [],
  gBattle_BG1_X: 0,
  gBattle_BG1_Y: 0,
  gBattle_BG2_X: 0,
  gBattle_BG2_Y: 0,
  mainCallback2: null,
  operations: [],
  textWindows: [],
  tilemapCopies: [],
  ...overrides
});

export const createBattleBgTask = (runtime: BattleBgRuntime, data: Partial<Record<number, number>> = {}): number => {
  const id = runtime.gTasks.length;
  const task: BattleBgTask = { data: Array.from({ length: 16 }, () => 0), destroyed: false };
  for (const [key, value] of Object.entries(data)) task.data[Number(key)] = value ?? 0;
  runtime.gTasks.push(task);
  return id;
};

export function CreateUnknownDebugSprite(runtime: BattleBgRuntime): void {
  runtime.operations.push('ResetSpriteData');
  const spriteId = createSprite(runtime, 0, 0);
  runtime.gSprites[spriteId].invisible = true;
  runtime.mainCallback2 = 'CB2_unused';
}

export function CB2_unused(runtime: BattleBgRuntime): void {
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
}

export function GetBattleTerrainByMapScene(mapBattleScene: number): number {
  for (const entry of sMapBattleSceneMapping) {
    if (mapBattleScene === entry.mapScene) return entry.battleTerrain;
  }
  return BATTLE_TERRAIN_PLAIN;
}

export function LoadBattleTerrainGfx(runtime: BattleBgRuntime, terrain: number): void {
  const actual = terrain >= sBattleTerrainTable.length ? BATTLE_TERRAIN_PLAIN : terrain;
  const bg = sBattleTerrainTable[actual];
  runtime.operations.push(`LZDecompressVram(${bg.tileset}, BG_CHAR_ADDR(2))`);
  runtime.operations.push(`LZDecompressVram(${bg.tilemap}, BG_SCREEN_ADDR(26))`);
  runtime.operations.push(`LoadCompressedPalette(${bg.palette}, BG_PLTT_ID(2), 3 * PLTT_SIZE_4BPP)`);
}

export function LoadBattleTerrainEntryGfx(runtime: BattleBgRuntime, terrain: number): void {
  const actual = terrain >= sBattleTerrainTable.length ? BATTLE_TERRAIN_PLAIN : terrain;
  const bg = sBattleTerrainTable[actual];
  runtime.operations.push(`LZDecompressVram(${bg.entryTileset}, BG_CHAR_ADDR(1))`);
  runtime.operations.push(`LZDecompressVram(${bg.entryTilemap}, BG_SCREEN_ADDR(28))`);
}

export function GetBattleTerrainGfxPtrs(terrain: number): Pick<BattleBackground, 'tileset' | 'tilemap' | 'palette'> {
  const actual = terrain > BATTLE_TERRAIN_PLAIN ? BATTLE_TERRAIN_PLAIN : terrain;
  const bg = sBattleTerrainTable[actual];
  return { tileset: bg.tileset, tilemap: bg.tilemap, palette: bg.palette };
}

export function BattleInitBgsAndWindows(runtime: BattleBgRuntime): void {
  runtime.operations.push('ResetBgsAndClearDma3BusyFlags(FALSE)');
  runtime.operations.push('InitBgsFromTemplates(0, gBattleBgTemplates, 4)');
  runtime.operations.push('InitWindows(sStandardBattleWindowTemplates)');
  runtime.operations.push('DeactivateAllTextPrinters');
}

export function InitBattleBgsVideo(runtime: BattleBgRuntime): void {
  runtime.operations.push('EnableInterrupts(VBLANK | VCOUNT | TIMER3 | SERIAL)');
  BattleInitBgsAndWindows(runtime);
  runtime.operations.push('SetGpuReg(REG_OFFSET_BLDCNT, 0)');
  runtime.operations.push('SetGpuReg(REG_OFFSET_BLDALPHA, 0)');
  runtime.operations.push('SetGpuReg(REG_OFFSET_BLDY, 0)');
  runtime.operations.push('SetGpuReg(REG_OFFSET_DISPCNT, battle display flags)');
}

export function LoadBattleMenuWindowGfx(runtime: BattleBgRuntime): void {
  runtime.operations.push('LoadUserWindowGfx(2, 0x012, BG_PLTT_ID(1))');
  runtime.operations.push('LoadUserWindowGfx(2, 0x022, BG_PLTT_ID(1))');
  runtime.operations.push('Set battle menu palette slots 12..15');
  if (runtime.gBattleTypeFlags & (BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_POKEDUDE)) {
    runtime.operations.push('Menu_LoadStdPalAt(BG_PLTT_ID(7))');
    runtime.operations.push('LoadMenuMessageWindowGfx(0, 0x030, BG_PLTT_ID(7))');
    runtime.operations.push('Set oak/old-man window palette slot 6');
  }
}

export function DrawMainBattleBackground(runtime: BattleBgRuntime): void {
  LoadBattleTerrainGfx(runtime, GetBattleTerrainOverride(runtime));
}

export function LoadBattleTextboxAndBackground(runtime: BattleBgRuntime): void {
  runtime.operations.push('LZDecompressVram(gBattleInterface_Textbox_Gfx, BG_CHAR_ADDR(0))');
  runtime.operations.push('CopyToBgTilemapBuffer(0, gBattleInterface_Textbox_Tilemap, 0, 0x000)');
  runtime.operations.push('CopyBgTilemapBufferToVram(0)');
  runtime.operations.push('LoadCompressedPalette(gBattleInterface_Textbox_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP)');
  LoadBattleMenuWindowGfx(runtime);
  DrawMainBattleBackground(runtime);
}

export function DrawLinkBattleParticipantPokeballs(runtime: BattleBgRuntime, taskId: number, multiplayerId: number, bgId: number, destX: number, destY: number): void {
  const task = runtime.gTasks[taskId];
  let pokeballStatuses = 0;
  let width = 6;
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    width = 3;
    if (task.data[5] !== 0) {
      switch (multiplayerId) {
        case 0: pokeballStatuses = 0x3f & task.data[3]; break;
        case 1: pokeballStatuses = (0xfc0 & task.data[4]) >> 6; break;
        case 2: pokeballStatuses = (0xfc0 & task.data[3]) >> 6; break;
        case 3: pokeballStatuses = 0x3f & task.data[4]; break;
      }
    } else {
      switch (multiplayerId) {
        case 0: pokeballStatuses = 0x3f & task.data[3]; break;
        case 1: pokeballStatuses = 0x3f & task.data[4]; break;
        case 2: pokeballStatuses = (0xfc0 & task.data[3]) >> 6; break;
        case 3: pokeballStatuses = (0xfc0 & task.data[4]) >> 6; break;
      }
    }
  } else {
    pokeballStatuses = multiplayerId === runtime.gBattleStruct.multiplayerId ? task.data[3] : task.data[4];
  }
  const tiles = Array.from({ length: width }, (_, i) => ((pokeballStatuses & (3 << (i * 2))) >> (i * 2)) + 0x6001);
  runtime.tilemapCopies.push({ bgId, tiles, destX, destY, width, height: 1, pal: 0x11 });
  runtime.operations.push(`CopyBgTilemapBufferToVram(${bgId})`);
}

export function DrawLinkBattleVsScreenOutcomeText(runtime: BattleBgRuntime): void {
  const id = runtime.gLinkPlayers[runtime.gBattleStruct.multiplayerId].id;
  if (runtime.gBattleOutcome === B_OUTCOME_DREW) {
    battlePutTextOnWindow(runtime, 'gText_Draw', B_WIN_VS_OUTCOME_DRAW);
  } else if (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    const winLeft = runtime.gBattleOutcome === B_OUTCOME_WON ? [0, 2].includes(id) : [1, 3].includes(id);
    battlePutTextOnWindow(runtime, 'gText_Win', winLeft ? B_WIN_VS_OUTCOME_LEFT : B_WIN_VS_OUTCOME_RIGHT);
    battlePutTextOnWindow(runtime, 'gText_Loss', winLeft ? B_WIN_VS_OUTCOME_RIGHT : B_WIN_VS_OUTCOME_LEFT);
  } else if (runtime.gBattleOutcome === B_OUTCOME_WON) {
    const rightWin = id !== 0;
    battlePutTextOnWindow(runtime, 'gText_Win', rightWin ? B_WIN_VS_OUTCOME_RIGHT : B_WIN_VS_OUTCOME_LEFT);
    battlePutTextOnWindow(runtime, 'gText_Loss', rightWin ? B_WIN_VS_OUTCOME_LEFT : B_WIN_VS_OUTCOME_RIGHT);
  } else {
    const leftWin = id !== 0;
    battlePutTextOnWindow(runtime, 'gText_Win', leftWin ? B_WIN_VS_OUTCOME_LEFT : B_WIN_VS_OUTCOME_RIGHT);
    battlePutTextOnWindow(runtime, 'gText_Loss', leftWin ? B_WIN_VS_OUTCOME_RIGHT : B_WIN_VS_OUTCOME_LEFT);
  }
}

export function InitLinkBattleVsScreen(runtime: BattleBgRuntime, taskId: number): void {
  const task = runtime.gTasks[taskId];
  switch (task.data[0]) {
    case 0:
      if (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) {
        for (let i = 0; i < 4; i += 1) {
          const player = runtime.gLinkPlayers[i];
          const windows = [B_WIN_VS_MULTI_PLAYER_1, B_WIN_VS_MULTI_PLAYER_2, B_WIN_VS_MULTI_PLAYER_3, B_WIN_VS_MULTI_PLAYER_4];
          const bgIds = [1, 2, 1, 2];
          const ys = [4, 4, 8, 8];
          battlePutTextOnWindow(runtime, player.name, windows[player.id]);
          DrawLinkBattleParticipantPokeballs(runtime, taskId, player.id, bgIds[player.id], 2, ys[player.id]);
        }
      } else {
        let playerId = runtime.gBattleStruct.multiplayerId;
        let opponentId = playerId ^ BIT_SIDE;
        const opponentIdCopy = opponentId;
        if (runtime.gLinkPlayers[playerId].id !== 0) {
          opponentId = playerId;
          playerId = opponentIdCopy;
        }
        battlePutTextOnWindow(runtime, runtime.gLinkPlayers[playerId].name, B_WIN_VS_PLAYER);
        battlePutTextOnWindow(runtime, runtime.gLinkPlayers[opponentId].name, B_WIN_VS_OPPONENT);
        DrawLinkBattleParticipantPokeballs(runtime, taskId, playerId, 1, 2, 7);
        DrawLinkBattleParticipantPokeballs(runtime, taskId, opponentId, 2, 2, 7);
      }
      task.data[0] += 1;
      break;
    case 1: {
      runtime.operations.push(`AllocSpritePalette(${TAG_VS_LETTERS})`);
      runtime.gBattleStruct.linkBattleVsSpriteId_V = createSprite(runtime, 108, 80);
      runtime.gBattleStruct.linkBattleVsSpriteId_S = createSprite(runtime, 132, 80);
      runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_V].invisible = true;
      runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_S].invisible = true;
      task.data[0] += 1;
      break;
    }
    case 2:
      if (task.data[5] !== 0) {
        runtime.gBattle_BG1_X = -20 - Math.trunc(sin2(task.data[1]) / 32);
        runtime.gBattle_BG2_X = -140 - Math.trunc(sin2(task.data[2]) / 32);
        runtime.gBattle_BG1_Y = -36;
        runtime.gBattle_BG2_Y = -36;
      } else {
        runtime.gBattle_BG1_X = -20 - Math.trunc(sin2(task.data[1]) / 32);
        runtime.gBattle_BG1_Y = Math.trunc(cos2(task.data[1]) / 32) - 164;
        runtime.gBattle_BG2_X = -140 - Math.trunc(sin2(task.data[2]) / 32);
        runtime.gBattle_BG2_Y = Math.trunc(cos2(task.data[2]) / 32) - 164;
      }
      if (task.data[2] !== 0) {
        task.data[2] -= 2;
        task.data[1] += 2;
      } else {
        if (task.data[5] !== 0) DrawLinkBattleVsScreenOutcomeText(runtime);
        runtime.operations.push('PlaySE(SE_M_HARDEN)');
        task.destroyed = true;
        const v = runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_V];
        const s = runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_S];
        v.invisible = false;
        s.invisible = false;
        s.oam.tileNum += 0x40;
        v.data[0] = 0;
        s.data[0] = 1;
        v.data[1] = v.x;
        s.data[1] = s.x;
        v.data[2] = 0;
        s.data[2] = 0;
      }
      break;
  }
}

export function DrawBattleEntryBackground(runtime: BattleBgRuntime): void {
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    runtime.operations.push('LZDecompressVram(vs_frame_sheet, BG_CHAR_ADDR(1))');
    runtime.operations.push('LZDecompressVram(gVsLettersGfx, VRAM + 0x10000)');
    runtime.operations.push('LoadCompressedPalette(vs_frame_palette, BG_PLTT_ID(6), PLTT_SIZE_4BPP)');
    runtime.operations.push('SetBgAttribute(1, BG_ATTR_SCREENSIZE, 1)');
    runtime.operations.push('SetGpuReg(REG_OFFSET_BG1CNT, VS frame flags)');
    runtime.operations.push('CopyToBgTilemapBuffer(1, vs_frame_tilemap, 0, 0)');
    runtime.operations.push('CopyToBgTilemapBuffer(2, vs_frame_tilemap, 0, 0)');
    runtime.operations.push('CopyBgTilemapBufferToVram(1)');
    runtime.operations.push('CopyBgTilemapBufferToVram(2)');
    runtime.operations.push('SetGpuReg(REG_OFFSET_WININ, link flags)');
    runtime.operations.push('SetGpuReg(REG_OFFSET_WINOUT, link flags)');
    runtime.gBattle_BG1_Y = -164;
    runtime.gBattle_BG2_Y = -164;
    runtime.operations.push('LoadCompressedSpriteSheetUsingHeap(sVsLettersSpriteSheet)');
  } else if (runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE) {
    LoadBattleTerrainEntryGfx(runtime, BATTLE_TERRAIN_GRASS);
  } else if (runtime.gBattleTypeFlags & (BATTLE_TYPE_TRAINER_TOWER | BATTLE_TYPE_LINK | BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_EREADER_TRAINER)) {
    LoadBattleTerrainEntryGfx(runtime, BATTLE_TERRAIN_BUILDING);
  } else if (runtime.gBattleTypeFlags & BATTLE_TYPE_KYOGRE_GROUDON) {
    LoadBattleTerrainEntryGfx(runtime, runtime.gGameVersion === VERSION_FIRE_RED ? BATTLE_TERRAIN_CAVE : BATTLE_TERRAIN_WATER);
  } else {
    if (runtime.gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
      const trainerClass = runtime.trainers[runtime.gTrainerBattleOpponent_A]?.trainerClass;
      if (trainerClass === TRAINER_CLASS_LEADER || trainerClass === TRAINER_CLASS_CHAMPION) {
        LoadBattleTerrainEntryGfx(runtime, BATTLE_TERRAIN_BUILDING);
        return;
      }
    }
    LoadBattleTerrainEntryGfx(runtime, runtime.currentMapBattleScene === MAP_BATTLE_SCENE_NORMAL ? runtime.gBattleTerrain : BATTLE_TERRAIN_BUILDING);
  }
}

export function GetBattleTerrainOverride(runtime: BattleBgRuntime): number {
  if (runtime.gBattleTypeFlags & (BATTLE_TYPE_TRAINER_TOWER | BATTLE_TYPE_LINK | BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_EREADER_TRAINER)) return BATTLE_TERRAIN_LINK;
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE) {
    runtime.gBattleTerrain = BATTLE_TERRAIN_GRASS;
    return BATTLE_TERRAIN_GRASS;
  }
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    const trainerClass = runtime.trainers[runtime.gTrainerBattleOpponent_A]?.trainerClass;
    if (trainerClass === TRAINER_CLASS_LEADER) return BATTLE_TERRAIN_LEADER;
    if (trainerClass === TRAINER_CLASS_CHAMPION) return BATTLE_TERRAIN_CHAMPION;
  }
  return runtime.currentMapBattleScene === MAP_BATTLE_SCENE_NORMAL ? runtime.gBattleTerrain : GetBattleTerrainByMapScene(runtime.currentMapBattleScene);
}

export function LoadChosenBattleElement(runtime: BattleBgRuntime, caseId: number): boolean {
  let ret = false;
  let battleScene: number;
  switch (caseId) {
    case 0:
      runtime.operations.push('LZDecompressVram(gBattleInterface_Textbox_Gfx, BG_CHAR_ADDR(0))');
      break;
    case 1:
      runtime.operations.push('CopyToBgTilemapBuffer(0, gBattleInterface_Textbox_Tilemap, 0, 0x000)');
      runtime.operations.push('CopyBgTilemapBufferToVram(0)');
      break;
    case 2:
      runtime.operations.push('LoadCompressedPalette(gBattleInterface_Textbox_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP)');
      break;
    case 3:
      battleScene = GetBattleTerrainOverride(runtime);
      runtime.operations.push(`LZDecompressVram(${sBattleTerrainTable[battleScene].tileset}, BG_CHAR_ADDR(2))`);
    // fallthrough
    case 4:
      battleScene = GetBattleTerrainOverride(runtime);
      runtime.operations.push(`LZDecompressVram(${sBattleTerrainTable[battleScene].tilemap}, BG_SCREEN_ADDR(26))`);
      break;
    case 5:
      battleScene = GetBattleTerrainOverride(runtime);
      runtime.operations.push(`LoadCompressedPalette(${sBattleTerrainTable[battleScene].palette}, BG_PLTT_ID(2), 3 * PLTT_SIZE_4BPP)`);
      break;
    case 6:
      LoadBattleMenuWindowGfx(runtime);
      break;
    default:
      ret = true;
      break;
  }
  return ret;
}

const createSprite = (runtime: BattleBgRuntime, x: number, _y: number): number => {
  const id = runtime.gSprites.length;
  runtime.gSprites.push({ x, invisible: false, oam: { tileNum: 0 }, data: Array.from({ length: 8 }, () => 0) });
  runtime.operations.push(`CreateSprite(${id})`);
  return id;
};

const battlePutTextOnWindow = (runtime: BattleBgRuntime, text: string, windowId: number): void => {
  runtime.textWindows.push({ text, windowId });
};

const sin2 = (angle: number): number => Math.round(Math.sin((angle * Math.PI) / 128) * 256);
const cos2 = (angle: number): number => Math.round(Math.cos((angle * Math.PI) / 128) * 256);

export const createUnknownDebugSprite = CreateUnknownDebugSprite;
export const cb2Unused = CB2_unused;
export const getBattleTerrainByMapScene = GetBattleTerrainByMapScene;
export const loadBattleTerrainGfx = LoadBattleTerrainGfx;
export const loadBattleTerrainEntryGfx = LoadBattleTerrainEntryGfx;
export const getBattleTerrainGfxPtrs = GetBattleTerrainGfxPtrs;
export const battleInitBgsAndWindows = BattleInitBgsAndWindows;
export const initBattleBgsVideo = InitBattleBgsVideo;
export const loadBattleMenuWindowGfx = LoadBattleMenuWindowGfx;
export const drawMainBattleBackground = DrawMainBattleBackground;
export const loadBattleTextboxAndBackground = LoadBattleTextboxAndBackground;
export const drawLinkBattleParticipantPokeballs = DrawLinkBattleParticipantPokeballs;
export const drawLinkBattleVsScreenOutcomeText = DrawLinkBattleVsScreenOutcomeText;
export const initLinkBattleVsScreen = InitLinkBattleVsScreen;
export const drawBattleEntryBackground = DrawBattleEntryBackground;
export const getBattleTerrainOverride = GetBattleTerrainOverride;
export const loadChosenBattleElement = LoadChosenBattleElement;
