export const TAG_SMOKESCREEN = 55019;
export const PALTAG_SHADOW = 55039;
export const GFXTAG_SHADOW = 55129;

export const SMOKESCREEN_IMPACT_SPRITE_SHEET = {
  data: 'gSmokescreenImpactTiles',
  size: 0x180,
  tag: TAG_SMOKESCREEN
} as const;

export const SMOKESCREEN_IMPACT_SPRITE_PALETTE = {
  data: 'gSmokescreenImpactPalette',
  tag: TAG_SMOKESCREEN
} as const;

export const OAM_DATA_SMOKESCREEN_IMPACT = {
  y: 0,
  affineMode: 'ST_OAM_AFFINE_OFF',
  objMode: 'ST_OAM_OBJ_NORMAL',
  mosaic: false,
  bpp: 'ST_OAM_4BPP',
  shape: 'SPRITE_SHAPE_16x16',
  x: 0,
  matrixNum: 0,
  size: 'SPRITE_SIZE_16x16',
  tileNum: 0,
  priority: 1,
  paletteNum: 0,
  affineParam: 0
} as const;

export const ANIMS_SMOKESCREEN_IMPACT = [
  [
    { frame: 0, duration: 4 },
    { frame: 4, duration: 4 },
    { frame: 8, duration: 4 }
  ],
  [
    { frame: 0, duration: 4, hFlip: true },
    { frame: 4, duration: 4, hFlip: true },
    { frame: 8, duration: 4, hFlip: true }
  ],
  [
    { frame: 0, duration: 4, vFlip: true },
    { frame: 4, duration: 4, vFlip: true },
    { frame: 8, duration: 4, vFlip: true }
  ],
  [
    { frame: 0, duration: 4, hFlip: true, vFlip: true },
    { frame: 4, duration: 4, hFlip: true, vFlip: true },
    { frame: 8, duration: 4, hFlip: true, vFlip: true }
  ]
] as const;

export const SMOKESCREEN_IMPACT_SPRITE_TEMPLATE = {
  tileTag: TAG_SMOKESCREEN,
  paletteTag: TAG_SMOKESCREEN,
  oam: OAM_DATA_SMOKESCREEN_IMPACT,
  anims: ANIMS_SMOKESCREEN_IMPACT,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCB_SmokescreenImpact'
} as const;

export const SPRITE_SHEET_ENEMY_SHADOW = {
  data: 'gEnemyMonShadow_Gfx',
  size: 0x80,
  tag: GFXTAG_SHADOW
} as const;

export const SPRITE_TEMPLATE_ENEMY_SHADOW = {
  tileTag: GFXTAG_SHADOW,
  paletteTag: PALTAG_SHADOW,
  oam: {
    y: 0,
    affineMode: 'ST_OAM_AFFINE_OFF',
    objMode: 'ST_OAM_OBJ_NORMAL',
    mosaic: false,
    bpp: 'ST_OAM_4BPP',
    shape: 'SPRITE_SHAPE_32x8',
    x: 0,
    matrixNum: 0,
    size: 'SPRITE_SIZE_32x8',
    tileNum: 0,
    priority: 3,
    paletteNum: 0,
    affineParam: 0
  },
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCB_SetInvisible'
} as const;

export interface SmokescreenSprite {
  id: number;
  x: number;
  y: number;
  priority: number;
  callback: 'SpriteCB_SmokescreenImpactMain' | 'SpriteCB_SmokescreenImpact' | 'SpriteCallbackDummy';
  invisible: boolean;
  animIndex: number;
  animEnded: boolean;
  destroyed: boolean;
  activeSprites: number;
  persist: boolean;
  mainSpriteId: number;
  animated: boolean;
}

export interface SmokescreenRuntimeState {
  loadedTileTags: Set<number>;
  loadedPaletteTags: Set<number>;
  freedTileTags: number[];
  freedPaletteTags: number[];
  sprites: SmokescreenSprite[];
}

export const createSmokescreenRuntimeState = (): SmokescreenRuntimeState => ({
  loadedTileTags: new Set(),
  loadedPaletteTags: new Set(),
  freedTileTags: [],
  freedPaletteTags: [],
  sprites: []
});

const createSprite = (
  state: SmokescreenRuntimeState,
  x: number,
  y: number,
  priority: number
): number => {
  const id = state.sprites.length;
  state.sprites.push({
    id,
    x,
    y,
    priority,
    callback: 'SpriteCB_SmokescreenImpact',
    invisible: false,
    animIndex: 0,
    animEnded: false,
    destroyed: false,
    activeSprites: 0,
    persist: false,
    mainSpriteId: 0,
    animated: false
  });
  return id;
};

const createInvisibleSpriteWithCallback = (state: SmokescreenRuntimeState): number => {
  const id = state.sprites.length;
  state.sprites.push({
    id,
    x: 0,
    y: 0,
    priority: 0,
    callback: 'SpriteCB_SmokescreenImpactMain',
    invisible: true,
    animIndex: 0,
    animEnded: false,
    destroyed: false,
    activeSprites: 0,
    persist: false,
    mainSpriteId: 0,
    animated: false
  });
  return id;
};

const startSpriteAnim = (
  state: SmokescreenRuntimeState,
  spriteId: number,
  animIndex: number
): void => {
  state.sprites[spriteId].animIndex = animIndex & 0xff;
};

const animateSprite = (state: SmokescreenRuntimeState, spriteId: number): void => {
  state.sprites[spriteId].animated = true;
};

export const smokescreenImpact = (
  state: SmokescreenRuntimeState,
  x: number,
  y: number,
  persist: boolean
): number => {
  if (!state.loadedTileTags.has(SMOKESCREEN_IMPACT_SPRITE_SHEET.tag)) {
    state.loadedTileTags.add(SMOKESCREEN_IMPACT_SPRITE_SHEET.tag);
    state.loadedPaletteTags.add(SMOKESCREEN_IMPACT_SPRITE_PALETTE.tag);
  }

  const mainSpriteId = createInvisibleSpriteWithCallback(state);
  const mainSprite = state.sprites[mainSpriteId];
  mainSprite.persist = persist;

  const spriteId1 = createSprite(state, x - 16, y - 16, 2);
  state.sprites[spriteId1].mainSpriteId = mainSpriteId;
  mainSprite.activeSprites += 1;
  animateSprite(state, spriteId1);

  const spriteId2 = createSprite(state, x, y - 16, 2);
  state.sprites[spriteId2].mainSpriteId = mainSpriteId;
  mainSprite.activeSprites += 1;
  startSpriteAnim(state, spriteId2, 1);
  animateSprite(state, spriteId2);

  const spriteId3 = createSprite(state, x - 16, y, 2);
  state.sprites[spriteId3].mainSpriteId = mainSpriteId;
  mainSprite.activeSprites += 1;
  startSpriteAnim(state, spriteId3, 2);
  animateSprite(state, spriteId3);

  const spriteId4 = createSprite(state, x, y, 2);
  state.sprites[spriteId4].mainSpriteId = mainSpriteId;
  mainSprite.activeSprites += 1;
  startSpriteAnim(state, spriteId4, 3);
  animateSprite(state, spriteId4);

  return mainSpriteId;
};

export const spriteCbSmokescreenImpactMain = (
  state: SmokescreenRuntimeState,
  spriteId: number
): void => {
  const sprite = state.sprites[spriteId];
  if (sprite.activeSprites === 0) {
    state.freedTileTags.push(SMOKESCREEN_IMPACT_SPRITE_SHEET.tag);
    state.freedPaletteTags.push(SMOKESCREEN_IMPACT_SPRITE_PALETTE.tag);
    if (!sprite.persist) {
      sprite.destroyed = true;
    } else {
      sprite.callback = 'SpriteCallbackDummy';
    }
  }
};

export function SpriteCB_SmokescreenImpactMain(
  state: SmokescreenRuntimeState,
  spriteId: number
): void {
  spriteCbSmokescreenImpactMain(state, spriteId);
}

export const spriteCbSmokescreenImpact = (
  state: SmokescreenRuntimeState,
  spriteId: number
): void => {
  const sprite = state.sprites[spriteId];
  if (sprite.animEnded) {
    state.sprites[sprite.mainSpriteId].activeSprites -= 1;
    sprite.destroyed = true;
  }
};

export function SpriteCB_SmokescreenImpact(
  state: SmokescreenRuntimeState,
  spriteId: number
): void {
  spriteCbSmokescreenImpact(state, spriteId);
}

export function SmokescreenImpact(
  state: SmokescreenRuntimeState,
  x: number,
  y: number,
  persist: boolean
): number {
  return smokescreenImpact(state, x, y, persist);
}
