export const CUT_GRASS_SPRITE_COUNT = 8;
export const CUT_SIDE = 3;
export const OBJ_EVENT_GFX_CUT_TREE = 'OBJ_EVENT_GFX_CUT_TREE';
export const FLDEFF_USE_CUT_ON_GRASS = 'FLDEFF_USE_CUT_ON_GRASS';
export const FLDEFF_USE_CUT_ON_TREE = 'FLDEFF_USE_CUT_ON_TREE';
export const FLDEFF_CUT_GRASS = 'FLDEFF_CUT_GRASS';
export const GAME_STAT_USED_CUT = 'GAME_STAT_USED_CUT';
export const SE_M_CUT = 'SE_M_CUT';

export const sCutGrassMetatileMapping: [string, string][] = [
  ['General_Plain_Grass', 'General_Plain_Mowed'],
  ['General_ThinTreeTop_Grass', 'General_ThinTreeTop_Mowed'],
  ['General_WideTreeTopLeft_Grass', 'General_WideTreeTopLeft_Mowed'],
  ['General_WideTreeTopRight_Grass', 'General_WideTreeTopRight_Mowed'],
  ['CeladonCity_CyclingRoad_Grass', 'CeladonCity_CyclingRoad_Mowed'],
  ['FuchsiaCity_SafariZoneTreeTopLeft_Grass', 'FuchsiaCity_SafariZoneTreeTopLeft_Mowed'],
  ['FuchsiaCity_SafariZoneTreeTopMiddle_Grass', 'FuchsiaCity_SafariZoneTreeTopMiddle_Mowed'],
  ['FuchsiaCity_SafariZoneTreeTopRight_Grass', 'FuchsiaCity_SafariZoneTreeTopRight_Mowed'],
  ['ViridianForest_HugeTreeTopMiddle_Grass', 'ViridianForest_HugeTreeTopMiddle_Mowed']
];

export interface CutTile {
  elevation: number;
  metatileId: string;
  isGrass: boolean;
}

export interface CutSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  oam: { x: number; y: number };
  data: number[];
  callback: 'SpriteCallback_CutGrass_Init' | 'SpriteCallback_CutGrass_Run' | 'SpriteCallback_CutGrass_Cleanup' | 'destroyed';
}

export interface FldEffCutRuntime {
  cutGrassSpriteArrayPtr: number[] | null;
  scheduleOpenDottedHole: boolean;
  cutMoveRuinValleyCheck: boolean;
  cutTreeInFront: boolean;
  playerFacingPosition: { x: number; y: number; elevation: number };
  cursorSelectionMonId: number;
  fieldCallback2: string | null;
  postMenuFieldCallback: string | null;
  fieldEffectArguments: number[];
  fieldEffectsStarted: string[];
  fieldEffectsRemoved: string[];
  fieldEffectsStopped: string[];
  scriptsSetup: string[];
  gameStats: Record<string, number>;
  sounds: string[];
  dottedHoleOpened: number;
  map: Map<string, CutTile>;
  groundEffectsEnabled: { x: number; y: number }[];
  wholeMapDraws: number;
  sprites: CutSprite[];
  playerAvatarSpriteId: number;
  playerControlsUnlocked: number;
  playerMovementCleared: number;
  scriptContextEnabled: number;
}

export const createFldEffCutRuntime = (): FldEffCutRuntime => ({
  cutGrassSpriteArrayPtr: null,
  scheduleOpenDottedHole: false,
  cutMoveRuinValleyCheck: false,
  cutTreeInFront: false,
  playerFacingPosition: { x: 0, y: 0, elevation: 0 },
  cursorSelectionMonId: 0,
  fieldCallback2: null,
  postMenuFieldCallback: null,
  fieldEffectArguments: Array.from({ length: 8 }, () => 0),
  fieldEffectsStarted: [],
  fieldEffectsRemoved: [],
  fieldEffectsStopped: [],
  scriptsSetup: [],
  gameStats: {},
  sounds: [],
  dottedHoleOpened: 0,
  map: new Map(),
  groundEffectsEnabled: [],
  wholeMapDraws: 0,
  sprites: [{ id: 0, x: 0, y: 0, x2: 0, y2: 0, oam: { x: 40, y: 50 }, data: Array.from({ length: 8 }, () => 0), callback: 'destroyed' }],
  playerAvatarSpriteId: 0,
  playerControlsUnlocked: 0,
  playerMovementCleared: 0,
  scriptContextEnabled: 0
});

const key = (x: number, y: number): string => `${x},${y}`;

export const setCutTile = (
  runtime: FldEffCutRuntime,
  x: number,
  y: number,
  tile: CutTile
): void => {
  runtime.map.set(key(x, y), { ...tile });
};

const getTile = (runtime: FldEffCutRuntime, x: number, y: number): CutTile =>
  runtime.map.get(key(x, y)) ?? { elevation: 0, metatileId: '0xffff', isGrass: false };

export function MetatileAtCoordsIsGrassTile(
  runtime: FldEffCutRuntime,
  x: number,
  y: number
): boolean {
  return getTile(runtime, x, y).isGrass;
}

export function SetUpFieldMove_Cut(runtime: FldEffCutRuntime): boolean {
  runtime.scheduleOpenDottedHole = false;
  if (runtime.cutMoveRuinValleyCheck === true) {
    runtime.scheduleOpenDottedHole = true;
    runtime.fieldCallback2 = 'FieldCallback_PrepareFadeInFromMenu';
    runtime.postMenuFieldCallback = 'FieldCallback_CutGrass';
    return true;
  }
  if (runtime.cutTreeInFront === true) {
    runtime.fieldCallback2 = 'FieldCallback_PrepareFadeInFromMenu';
    runtime.postMenuFieldCallback = 'FieldCallback_CutTree';
    return true;
  }

  for (let i = 0; i < CUT_SIDE; i += 1) {
    const y = runtime.playerFacingPosition.y - 1 + i;
    for (let j = 0; j < CUT_SIDE; j += 1) {
      const x = runtime.playerFacingPosition.x - 1 + j;
      if (getTile(runtime, x, y).elevation === runtime.playerFacingPosition.elevation) {
        if (MetatileAtCoordsIsGrassTile(runtime, x, y) === true) {
          runtime.fieldCallback2 = 'FieldCallback_PrepareFadeInFromMenu';
          runtime.postMenuFieldCallback = 'FieldCallback_CutGrass';
          return true;
        }
      }
    }
  }
  return false;
}

export function FieldCallback_CutGrass(runtime: FldEffCutRuntime): void {
  runtime.fieldEffectsStarted.push(FLDEFF_USE_CUT_ON_GRASS);
  runtime.fieldEffectArguments[0] = runtime.cursorSelectionMonId;
}

export function FldEff_UseCutOnGrass(runtime: FldEffCutRuntime): boolean {
  runtime.fieldEffectArguments[7] = runtime.cursorSelectionMonId;
  runtime.gameStats[GAME_STAT_USED_CUT] = (runtime.gameStats[GAME_STAT_USED_CUT] ?? 0) + 1;
  return false;
}

export function FieldCallback_CutTree(runtime: FldEffCutRuntime): void {
  runtime.fieldEffectArguments[0] = runtime.cursorSelectionMonId;
  runtime.scriptsSetup.push('EventScript_FldEffCut');
}

export function FldEff_UseCutOnTree(runtime: FldEffCutRuntime): boolean {
  runtime.fieldEffectArguments[7] = runtime.cursorSelectionMonId;
  runtime.gameStats[GAME_STAT_USED_CUT] = (runtime.gameStats[GAME_STAT_USED_CUT] ?? 0) + 1;
  return false;
}

export function FieldMoveCallback_CutGrass(runtime: FldEffCutRuntime): void {
  runtime.fieldEffectsRemoved.push(FLDEFF_USE_CUT_ON_GRASS);
  if (runtime.scheduleOpenDottedHole === true) {
    runtime.dottedHoleOpened += 1;
  } else {
    runtime.fieldEffectsStarted.push(FLDEFF_CUT_GRASS);
  }
}

export function SetCutGrassMetatileAt(
  runtime: FldEffCutRuntime,
  x: number,
  y: number
): void {
  const tile = getTile(runtime, x, y);
  for (const [from, to] of sCutGrassMetatileMapping) {
    if (from === tile.metatileId) {
      setCutTile(runtime, x, y, { ...tile, metatileId: to });
      break;
    }
  }
}

const createSprite = (runtime: FldEffCutRuntime, x: number, y: number): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({
    id,
    x,
    y,
    x2: 0,
    y2: 0,
    oam: { x, y },
    data: Array.from({ length: 8 }, () => 0),
    callback: 'SpriteCallback_CutGrass_Init'
  });
  return id;
};

export function FldEff_CutGrass(runtime: FldEffCutRuntime): boolean {
  runtime.sounds.push(SE_M_CUT);
  for (let i = 0; i < CUT_SIDE; i += 1) {
    const y = runtime.playerFacingPosition.y - 1 + i;
    for (let j = 0; j < CUT_SIDE; j += 1) {
      const x = runtime.playerFacingPosition.x - 1 + j;
      if (getTile(runtime, x, y).elevation === runtime.playerFacingPosition.elevation) {
        if (MetatileAtCoordsIsGrassTile(runtime, x, y) === true) {
          SetCutGrassMetatileAt(runtime, x, y);
          runtime.groundEffectsEnabled.push({ x, y });
        }
      }
    }
  }
  runtime.wholeMapDraws += 1;
  runtime.cutGrassSpriteArrayPtr = Array.from({ length: CUT_GRASS_SPRITE_COUNT }, () => 0);
  const avatar = runtime.sprites[runtime.playerAvatarSpriteId];
  for (let i = 0; i < CUT_GRASS_SPRITE_COUNT; i += 1) {
    const spriteId = createSprite(runtime, avatar.oam.x + 8, avatar.oam.y + 20);
    runtime.cutGrassSpriteArrayPtr[i] = spriteId;
    runtime.sprites[spriteId].data[2] = i * (0x100 / CUT_GRASS_SPRITE_COUNT);
  }
  return false;
}

const sin = (angle: number, amplitude: number): number =>
  Math.trunc(Math.sin(((angle & 0xff) * Math.PI) / 128) * amplitude);

const cos = (angle: number, amplitude: number): number =>
  Math.trunc(Math.cos(((angle & 0xff) * Math.PI) / 128) * amplitude);

export function SpriteCallback_CutGrass_Init(sprite: CutSprite): void {
  sprite.data[0] = 8;
  sprite.data[1] = 0;
  sprite.data[3] = 0;
  sprite.callback = 'SpriteCallback_CutGrass_Run';
}

export function SpriteCallback_CutGrass_Run(sprite: CutSprite): void {
  sprite.x2 = sin(sprite.data[2], sprite.data[0]);
  sprite.y2 = cos(sprite.data[2], sprite.data[0]);
  sprite.data[2] += 8;
  sprite.data[2] &= 0xff;
  sprite.data[0] += 1;
  sprite.data[0] += sprite.data[3] >> 2;
  sprite.data[3] += 1;
  if (sprite.data[1] !== 28) {
    sprite.data[1] += 1;
  } else {
    sprite.callback = 'SpriteCallback_CutGrass_Cleanup';
  }
}

export function SpriteCallback_CutGrass_Cleanup(runtime: FldEffCutRuntime, sprite: CutSprite): void {
  if (runtime.cutGrassSpriteArrayPtr !== null) {
    for (let i = 1; i < CUT_GRASS_SPRITE_COUNT; i += 1) {
      runtime.sprites[runtime.cutGrassSpriteArrayPtr[i]].callback = 'destroyed';
    }
  }
  runtime.fieldEffectsStopped.push(`${sprite.id}:${FLDEFF_CUT_GRASS}`);
  runtime.cutGrassSpriteArrayPtr = null;
  runtime.playerMovementCleared += 1;
  runtime.playerControlsUnlocked += 1;
}

export function FieldMoveCallback_CutTree(runtime: FldEffCutRuntime): void {
  runtime.sounds.push(SE_M_CUT);
  runtime.fieldEffectsRemoved.push(FLDEFF_USE_CUT_ON_TREE);
  runtime.scriptContextEnabled += 1;
}

export const metatileAtCoordsIsGrassTile = MetatileAtCoordsIsGrassTile;
export const setUpFieldMoveCut = SetUpFieldMove_Cut;
export const fieldCallbackCutGrass = FieldCallback_CutGrass;
export const fldEffUseCutOnGrass = FldEff_UseCutOnGrass;
export const fieldCallbackCutTree = FieldCallback_CutTree;
export const fldEffUseCutOnTree = FldEff_UseCutOnTree;
export const fieldMoveCallbackCutGrass = FieldMoveCallback_CutGrass;
export const fldEffCutGrass = FldEff_CutGrass;
export const setCutGrassMetatileAt = SetCutGrassMetatileAt;
export const spriteCallbackCutGrassInit = SpriteCallback_CutGrass_Init;
export const spriteCallbackCutGrassRun = SpriteCallback_CutGrass_Run;
export const spriteCallbackCutGrassCleanup = SpriteCallback_CutGrass_Cleanup;
export const fieldMoveCallbackCutTree = FieldMoveCallback_CutTree;
