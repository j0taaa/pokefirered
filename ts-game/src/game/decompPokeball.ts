export const BALL_POKE = 0;
export const BALL_GREAT = 1;
export const BALL_SAFARI = 2;
export const BALL_ULTRA = 3;
export const BALL_MASTER = 4;
export const BALL_NET = 5;
export const BALL_DIVE = 6;
export const BALL_NEST = 7;
export const BALL_REPEAT = 8;
export const BALL_TIMER = 9;
export const BALL_LUXURY = 10;
export const BALL_PREMIER = 11;
export const POKEBALL_COUNT = 12;

export const BALL_AFFINE_ANIM_0 = 0;
export const BALL_ROTATE_RIGHT = 1;
export const BALL_ROTATE_LEFT = 2;
export const BALL_AFFINE_ANIM_3 = 3;
export const BALL_AFFINE_ANIM_4 = 4;

export const POKEBALL_PLAYER_SENDOUT = 0xff;
export const POKEBALL_OPPONENT_SENDOUT = 0xfe;

export const ITEM_MASTER_BALL = 1;
export const ITEM_ULTRA_BALL = 2;
export const ITEM_GREAT_BALL = 3;
export const ITEM_POKE_BALL = 4;
export const ITEM_SAFARI_BALL = 5;
export const ITEM_NET_BALL = 6;
export const ITEM_DIVE_BALL = 7;
export const ITEM_NEST_BALL = 8;
export const ITEM_REPEAT_BALL = 9;
export const ITEM_TIMER_BALL = 10;
export const ITEM_LUXURY_BALL = 11;
export const ITEM_PREMIER_BALL = 12;

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const MON_DATA_SPECIES = 'species';
export const MON_DATA_POKEBALL = 'pokeball';
export const BATTLER_COORD_X = 'BATTLER_COORD_X';
export const BATTLER_COORD_Y = 'BATTLER_COORD_Y';
export const BATTLER_COORD_X_2 = 'BATTLER_COORD_X_2';
export const BATTLER_COORD_Y_PIC_OFFSET = 'BATTLER_COORD_Y_PIC_OFFSET';
export const BATTLER_AFFINE_NORMAL = 0;
export const BATTLER_AFFINE_EMERGE = 1;
export const BATTLER_AFFINE_RETURN = 2;
export const MAX_BATTLERS_COUNT = 4;
export const TAG_NONE = 0xffff;
export const CURSOR_ANIM_BOUNCE = 0;

export const SE_BALL_OPEN = 15;
export const SE_BALL_BOUNCE_1 = 49;
export const SE_BALL_BOUNCE_2 = 50;
export const SE_BALL_BOUNCE_3 = 51;
export const SE_BALL_BOUNCE_4 = 52;
export const SE_BALL_TRADE = 53;
export const SE_BALL_THROW = 54;
export const SE_BALL = 23;
export const MUS_CAUGHT_INTRO = 247;
export const TRACKS_ALL = 0xffff;

export type PokeballCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCB_BallThrow'
  | 'SpriteCB_BallThrow_ReachMon'
  | 'SpriteCB_BallThrow_StartShrinkMon'
  | 'SpriteCB_BallThrow_ShrinkMon'
  | 'SpriteCB_BallThrow_Close'
  | 'SpriteCB_BallThrow_FallToGround'
  | 'SpriteCB_BallThrow_StartShakes'
  | 'SpriteCB_BallThrow_Shake'
  | 'SpriteCB_BallThrow_StartCaptureMon'
  | 'SpriteCB_BallThrow_CaptureMon'
  | 'SpriteCB_ReleaseMonFromBall'
  | 'HandleBallAnimEnd'
  | 'SpriteCB_PlayerMonSendOut_1'
  | 'SpriteCB_PlayerMonSendOut_2'
  | 'SpriteCB_ReleaseMon2FromBall'
  | 'SpriteCB_OpponentMonSendOut'
  | 'SpriteCB_PokeballReleaseMon'
  | 'SpriteCB_ReleasedMonFlyOut'
  | 'SpriteCB_TradePokeball'
  | 'SpriteCB_TradePokeballSendOff'
  | 'SpriteCB_TradePokeballEnd'
  | 'SpriteCB_HealthboxSlideInDelayed'
  | 'SpriteCB_HealthboxSlideIn'
  | 'SpriteCB_HitAnimHealthoxEffect';

type TaskCallback = 'Task_DoPokeballSendOutAnim' | 'Task_PlayCryWhenReleasedFromBall' | 'TaskDummy';

export interface Sprite {
  id: number;
  template: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  subpriority: number;
  data: number[];
  callback: PokeballCallback;
  oam: { affineParam: number; priority: number; matrixNum: number };
  invisible: boolean;
  animEnded: boolean;
  affineAnimEnded: boolean;
  animPaused: boolean;
  affineAnimPaused: boolean;
  hFlip: boolean;
  vFlip: boolean;
}

export interface Task {
  id: number;
  func: TaskCallback;
  data: number[];
  destroyed: boolean;
}

export interface PokemonLike {
  species: number;
  pokeball: number;
  weakCry?: boolean;
}

export interface PokeballRuntime {
  gDoingBattleAnim: boolean;
  gActiveBattler: number;
  gBattlerTarget: number;
  gBattleTypeFlags: number;
  gBattlerPartyIndexes: number[];
  gPlayerParty: PokemonLike[];
  gEnemyParty: PokemonLike[];
  gSaveBlock2Ptr: { playerGender: number };
  gLinkPlayers: Array<{ gender: number }>;
  gMain: { inBattle: boolean };
  gBattleSpritesDataPtr: {
    healthBoxesData: Array<{ ballAnimActive: boolean }>;
    animationData: { introAnimActive: boolean };
  };
  gSprites: Sprite[];
  gTasks: Task[];
  gBattlerSpriteIds: number[];
  gHealthboxSpriteIds: number[];
  battlerSides: number[];
  battlerPositions: number[];
  battlerCoords: Array<Record<string, number>>;
  loadedBallGfx: Set<number>;
  loadedSpriteTags: Set<number>;
  operations: string[];
  sounds: number[];
  nextFadeTaskId: number;
  translationResults: boolean[];
  dmaBusyResults: boolean[];
  cryPlayingResults: boolean[];
  isDoubleBattle: boolean;
  isBgmPlaying: boolean;
}

export const ballNames = ['Poke', 'Great', 'Safari', 'Ultra', 'Master', 'Net', 'Dive', 'Nest', 'Repeat', 'Timer', 'Luxury', 'Premier'] as const;
export const gBallSpriteSheets = ballNames.map((name, index) => ({ data: `gBallGfx_${name}`, size: 384, tag: 55000 + index }));
export const gBallSpritePalettes = ballNames.map((name, index) => ({ data: `gBallPal_${name}`, tag: 55000 + index }));
export const gBallSpriteTemplates = ballNames.map((_name, index) => ({
  tileTag: 55000 + index,
  paletteTag: 55000 + index,
  callback: 'SpriteCB_BallThrow' as PokeballCallback
}));

export const createPokeballRuntime = (overrides: Partial<PokeballRuntime> = {}): PokeballRuntime => {
  const runtime: PokeballRuntime = {
    gDoingBattleAnim: false,
    gActiveBattler: 0,
    gBattlerTarget: 0,
    gBattleTypeFlags: 0,
    gBattlerPartyIndexes: [0, 0, 1, 1],
    gPlayerParty: [{ species: 1, pokeball: ITEM_POKE_BALL }, { species: 2, pokeball: ITEM_GREAT_BALL }],
    gEnemyParty: [{ species: 3, pokeball: ITEM_ULTRA_BALL }, { species: 4, pokeball: ITEM_MASTER_BALL }],
    gSaveBlock2Ptr: { playerGender: 0 },
    gLinkPlayers: Array.from({ length: 4 }, () => ({ gender: 0 })),
    gMain: { inBattle: true },
    gBattleSpritesDataPtr: {
      healthBoxesData: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ ballAnimActive: false })),
      animationData: { introAnimActive: false }
    },
    gSprites: [],
    gTasks: [],
    gBattlerSpriteIds: [0, 1, 2, 3],
    gHealthboxSpriteIds: [4, 5, 6, 7],
    battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
    battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT],
    battlerCoords: [
      { [BATTLER_COORD_X]: 48, [BATTLER_COORD_Y]: 80, [BATTLER_COORD_X_2]: 64, [BATTLER_COORD_Y_PIC_OFFSET]: 72 },
      { [BATTLER_COORD_X]: 176, [BATTLER_COORD_Y]: 40, [BATTLER_COORD_X_2]: 176, [BATTLER_COORD_Y_PIC_OFFSET]: 40 },
      { [BATTLER_COORD_X]: 96, [BATTLER_COORD_Y]: 88, [BATTLER_COORD_X_2]: 96, [BATTLER_COORD_Y_PIC_OFFSET]: 80 },
      { [BATTLER_COORD_X]: 144, [BATTLER_COORD_Y]: 48, [BATTLER_COORD_X_2]: 144, [BATTLER_COORD_Y_PIC_OFFSET]: 48 }
    ],
    loadedBallGfx: new Set<number>(),
    loadedSpriteTags: new Set<number>(),
    operations: [],
    sounds: [],
    nextFadeTaskId: 64,
    translationResults: [],
    dmaBusyResults: [],
    cryPlayingResults: [],
    isDoubleBattle: false,
    isBgmPlaying: true
  };
  for (let i = 0; i < 8; i++) createSprite(runtime, 'InitialSprite', 0, 0, 0);
  return Object.assign(runtime, overrides);
};

const createSprite = (runtime: PokeballRuntime, template: string, x: number, y: number, subpriority: number): number => {
  const id = runtime.gSprites.length;
  runtime.gSprites.push({
    id,
    template,
    x,
    y,
    x2: 0,
    y2: 0,
    subpriority,
    data: Array.from({ length: 8 }, () => 0),
    callback: 'SpriteCallbackDummy',
    oam: { affineParam: 0, priority: 0, matrixNum: 0 },
    invisible: false,
    animEnded: false,
    affineAnimEnded: false,
    animPaused: false,
    affineAnimPaused: false,
    hFlip: false,
    vFlip: false
  });
  return id;
};

const createTask = (runtime: PokeballRuntime, func: TaskCallback): number => {
  const id = runtime.gTasks.length;
  runtime.gTasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
};

export const ItemIdToBallId = (ballItem: number): number => {
  switch (ballItem) {
    case ITEM_MASTER_BALL: return BALL_MASTER;
    case ITEM_ULTRA_BALL: return BALL_ULTRA;
    case ITEM_GREAT_BALL: return BALL_GREAT;
    case ITEM_SAFARI_BALL: return BALL_SAFARI;
    case ITEM_NET_BALL: return BALL_NET;
    case ITEM_DIVE_BALL: return BALL_DIVE;
    case ITEM_NEST_BALL: return BALL_NEST;
    case ITEM_REPEAT_BALL: return BALL_REPEAT;
    case ITEM_TIMER_BALL: return BALL_TIMER;
    case ITEM_LUXURY_BALL: return BALL_LUXURY;
    case ITEM_PREMIER_BALL: return BALL_PREMIER;
    case ITEM_POKE_BALL:
    default: return BALL_POKE;
  }
};

export const DoPokeballSendOutAnimation = (runtime: PokeballRuntime, pan: number, kindOfThrow: number): number => {
  runtime.gDoingBattleAnim = true;
  runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].ballAnimActive = true;
  const taskId = createTask(runtime, 'Task_DoPokeballSendOutAnim');
  const task = runtime.gTasks[taskId];
  task.data[1] = pan;
  task.data[2] = kindOfThrow;
  task.data[3] = runtime.gActiveBattler;
  return 0;
};

export const Task_DoPokeballSendOutAnim = (runtime: PokeballRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  if (task.data[0] === 0) {
    task.data[0]++;
    return;
  }
  const throwCaseId = task.data[2];
  const battlerId = task.data[3];
  const itemId = getBattlerPokeballItemId(runtime, battlerId);
  const ballId = ItemIdToBallId(itemId);
  LoadBallGfx(runtime, ballId);
  const ballSpriteId = createSprite(runtime, `Ball:${ballId}`, 32, 80, 29);
  const sprite = runtime.gSprites[ballSpriteId];
  sprite.callback = 'SpriteCB_BallThrow';
  sprite.data[0] = 0x80;
  sprite.data[1] = 0;
  sprite.data[7] = throwCaseId;
  let notSendOut = false;
  switch (throwCaseId) {
    case POKEBALL_PLAYER_SENDOUT:
      runtime.gBattlerTarget = battlerId;
      sprite.x = (runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE) !== 0 ? 32 : 48;
      sprite.y = (runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE) !== 0 ? 64 : 70;
      sprite.callback = 'SpriteCB_PlayerMonSendOut_1';
      break;
    case POKEBALL_OPPONENT_SENDOUT:
      runtime.gBattlerTarget = battlerId;
      sprite.x = getBattlerSpriteCoord(runtime, battlerId, BATTLER_COORD_X);
      sprite.y = getBattlerSpriteCoord(runtime, battlerId, BATTLER_COORD_Y) + 24;
      sprite.data[0] = 0;
      sprite.callback = 'SpriteCB_OpponentMonSendOut';
      break;
    default:
      runtime.gBattlerTarget = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
      notSendOut = true;
      break;
  }
  sprite.data[6] = runtime.gBattlerTarget;
  if (!notSendOut) {
    destroyTask(runtime, taskId);
    return;
  }
  sprite.data[0] = 34;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.gBattlerTarget, BATTLER_COORD_X);
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.gBattlerTarget, BATTLER_COORD_Y) - 16;
  sprite.data[5] = -40;
  initAnimArcTranslation(runtime, sprite);
  sprite.oam.affineParam = taskId;
  task.data[4] = runtime.gBattlerTarget;
  task.func = 'TaskDummy';
  playSE(runtime, SE_BALL_THROW);
};

export const SpriteCB_BallThrow = (runtime: PokeballRuntime, sprite: Sprite): void => {
  if (translateAnimHorizontalArc(runtime, sprite)) {
    const taskId = sprite.oam.affineParam;
    const task = runtime.gTasks[taskId];
    const opponentBattler = task.data[4];
    const noOfShakes = task.data[2];
    startSpriteAnim(sprite, 1);
    sprite.affineAnimPaused = true;
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.x2 = 0;
    sprite.y2 = 0;
    sprite.data[5] = 0;
    const ballId = ItemIdToBallId(getBattlerPokeballItemId(runtime, opponentBattler));
    animateBallOpenParticles(runtime, sprite.x, sprite.y - 5, 1, 28, ballId);
    sprite.data[0] = launchBallFadeMonTask(runtime, false, opponentBattler, 14, ballId);
    sprite.data[6] = opponentBattler;
    sprite.data[7] = noOfShakes;
    destroyTask(runtime, taskId);
    sprite.callback = 'SpriteCB_BallThrow_ReachMon';
  }
};

export const SpriteCB_BallThrow_ReachMon = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.callback = 'SpriteCB_BallThrow_StartShrinkMon';
};

export const SpriteCB_BallThrow_StartShrinkMon = (runtime: PokeballRuntime, sprite: Sprite): void => {
  if (++sprite.data[5] === 10) {
    sprite.data[5] = 0;
    sprite.callback = 'SpriteCB_BallThrow_ShrinkMon';
    const mon = runtime.gSprites[runtime.gBattlerSpriteIds[sprite.data[6]]];
    startSpriteAffineAnim(mon, BATTLER_AFFINE_RETURN);
    animateSprite(runtime, mon);
    mon.data[1] = 0;
  }
};

export const SpriteCB_BallThrow_ShrinkMon = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const mon = runtime.gSprites[runtime.gBattlerSpriteIds[sprite.data[6]]];
  sprite.data[5]++;
  if (sprite.data[5] === 11) playSE(runtime, SE_BALL_TRADE);
  if (mon.affineAnimEnded) {
    startSpriteAnim(sprite, 2);
    mon.invisible = true;
    sprite.data[5] = 0;
    sprite.callback = 'SpriteCB_BallThrow_Close';
  } else {
    mon.data[1] += 0x60;
    mon.y2 = -mon.data[1] >> 8;
  }
};

export const SpriteCB_BallThrow_Close = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  if (sprite.animEnded) {
    sprite.data[5]++;
    if (sprite.data[5] === 1) {
      sprite.data[3] = 0;
      sprite.data[4] = 32;
      sprite.data[5] = 0;
      sprite.y += cos(0, 32);
      sprite.y2 = -cos(0, sprite.data[4]);
      sprite.callback = 'SpriteCB_BallThrow_FallToGround';
    }
  }
};

export const SpriteCB_BallThrow_FallToGround = (runtime: PokeballRuntime, sprite: Sprite): void => {
  let done = false;
  switch (sprite.data[3] & 0xff) {
    case 0:
      sprite.y2 = -cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] += 4 + (sprite.data[3] >> 8);
      if (sprite.data[5] >= 64) {
        sprite.data[4] -= 10;
        sprite.data[3] += 0x101;
        if (sprite.data[3] >> 8 === 4) done = true;
        playSE(runtime, [0, SE_BALL_BOUNCE_1, SE_BALL_BOUNCE_2, SE_BALL_BOUNCE_3][sprite.data[3] >> 8] ?? SE_BALL_BOUNCE_4);
      }
      break;
    case 1:
      sprite.y2 = -cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] -= 4 + (sprite.data[3] >> 8);
      if (sprite.data[5] <= 0) {
        sprite.data[5] = 0;
        sprite.data[3] &= 0xff00;
      }
      break;
  }
  if (done) {
    sprite.data[3] = 0;
    sprite.y += cos(64, 32);
    sprite.y2 = 0;
    if (sprite.data[7] === 0) sprite.callback = 'SpriteCB_ReleaseMonFromBall';
    else {
      sprite.callback = 'SpriteCB_BallThrow_StartShakes';
      sprite.data[4] = 1;
      sprite.data[5] = 0;
    }
  }
};

export const SpriteCB_BallThrow_StartShakes = (runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.data[3]++;
  if (sprite.data[3] === 31) {
    sprite.data[3] = 0;
    sprite.affineAnimPaused = true;
    startSpriteAffineAnim(sprite, 1);
    sprite.callback = 'SpriteCB_BallThrow_Shake';
    playSE(runtime, SE_BALL);
  }
};

export const SpriteCB_BallThrow_Shake = (runtime: PokeballRuntime, sprite: Sprite): void => {
  switch (sprite.data[3] & 0xff) {
    case 0:
    case 2:
      sprite.x2 += sprite.data[4];
      sprite.data[5] += sprite.data[4];
      sprite.affineAnimPaused = false;
      if (sprite.data[5] > 3 || sprite.data[5] < -3) {
        sprite.data[3]++;
        sprite.data[5] = 0;
      }
      break;
    case 1:
      sprite.data[5]++;
      if (sprite.data[5] === 1) {
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
        sprite.data[3]++;
        sprite.affineAnimPaused = false;
        changeSpriteAffineAnim(sprite, sprite.data[4] < 0 ? 2 : 1);
      } else sprite.affineAnimPaused = true;
      break;
    case 3:
      sprite.data[3] += 0x100;
      if (sprite.data[3] >> 8 === sprite.data[7]) sprite.callback = 'SpriteCB_ReleaseMonFromBall';
      else if (sprite.data[7] === 4 && sprite.data[3] >> 8 === 3) {
        sprite.callback = 'SpriteCB_BallThrow_StartCaptureMon';
        sprite.affineAnimPaused = true;
      } else {
        sprite.data[3]++;
        sprite.affineAnimPaused = true;
      }
      break;
    default:
      sprite.data[5]++;
      if (sprite.data[5] === 31) {
        sprite.data[5] = 0;
        sprite.data[3] &= 0xff00;
        startSpriteAffineAnim(sprite, 3);
        startSpriteAffineAnim(sprite, sprite.data[4] < 0 ? 2 : 1);
        playSE(runtime, SE_BALL);
      }
      break;
  }
};

export const Task_PlayCryWhenReleasedFromBall = (runtime: PokeballRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const wantedCry = task.data[2];
  switch (task.data[15]) {
    case 0:
    default:
      if (task.data[8] < 3) task.data[8]++;
      else task.data[15] = wantedCry + 1;
      break;
    case 1:
      playCry(runtime, task.data[0], task.data[1], task.data[3] !== 0 ? 'CRY_MODE_NORMAL' : 'CRY_MODE_WEAK');
      destroyTask(runtime, taskId);
      break;
    case 2:
      runtime.operations.push('StopCryAndClearCrySongs');
      task.data[10] = 3;
      task.data[15] = 20;
      break;
    case 20:
      if (task.data[10] === 0) {
        playCry(runtime, task.data[0], task.data[1], task.data[3] !== 0 ? 'CRY_MODE_DOUBLES' : 'CRY_MODE_WEAK_DOUBLES');
        destroyTask(runtime, taskId);
      } else task.data[10]--;
      break;
    case 3:
      task.data[10] = 6;
      task.data[15] = 30;
      break;
    case 30:
      if (task.data[10] !== 0) {
        task.data[10]--;
        break;
      }
      task.data[15]++;
    // fall through
    case 31:
      if (!isCryPlayingOrClearCrySongs(runtime)) {
        runtime.operations.push('StopCryAndClearCrySongs');
        task.data[10] = 3;
        task.data[15]++;
      }
      break;
    case 32:
      if (task.data[10] !== 0) {
        task.data[10]--;
        break;
      }
      playCry(runtime, task.data[0], task.data[1], task.data[3] !== 0 ? 'CRY_MODE_NORMAL' : 'CRY_MODE_WEAK');
      destroyTask(runtime, taskId);
      break;
  }
};

export const SpriteCB_ReleaseMonFromBall = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const battlerId = sprite.data[6];
  startSpriteAnim(sprite, 1);
  const ballId = ItemIdToBallId(getBattlerPokeballItemId(runtime, battlerId));
  animateBallOpenParticles(runtime, sprite.x, sprite.y - 5, 1, 28, ballId);
  sprite.data[0] = launchBallFadeMonTask(runtime, true, battlerId, 14, ballId);
  sprite.callback = 'HandleBallAnimEnd';
  if (runtime.gMain.inBattle) {
    const mon = getBattlerMon(runtime, battlerId);
    const pan = getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER ? 25 : -25;
    let wantedCryCase = 0;
    if (runtime.isDoubleBattle && runtime.gBattleSpritesDataPtr.animationData.introAnimActive) {
      if (battlerId === getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT) || battlerId === getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT)) wantedCryCase = 1;
      else wantedCryCase = 2;
    }
    const taskId = createTask(runtime, 'Task_PlayCryWhenReleasedFromBall');
    const task = runtime.gTasks[taskId];
    task.data[0] = mon.species;
    task.data[1] = pan;
    task.data[2] = wantedCryCase;
    task.data[3] = mon.weakCry ? 0 : 1;
    task.data[15] = 0;
  }
  const monSprite = runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]];
  startSpriteAffineAnim(monSprite, BATTLER_AFFINE_EMERGE);
  animateSprite(runtime, monSprite);
  monSprite.data[1] = 0x1000;
};

export const SpriteCB_BallThrow_StartCaptureMon = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.animPaused = true;
  sprite.callback = 'SpriteCB_BallThrow_CaptureMon';
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
};

export const HandleBallAnimEnd = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const battlerId = sprite.data[6];
  const mon = runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]];
  mon.invisible = false;
  if (sprite.animEnded) sprite.invisible = true;
  let affineAnimEnded = false;
  if (mon.affineAnimEnded) {
    startSpriteAffineAnim(mon, BATTLER_AFFINE_NORMAL);
    affineAnimEnded = true;
  } else {
    mon.data[1] -= 288;
    mon.y2 = mon.data[1] >> 8;
  }
  if (sprite.animEnded && affineAnimEnded) {
    mon.y2 = 0;
    runtime.gDoingBattleAnim = false;
    runtime.gBattleSpritesDataPtr.healthBoxesData[battlerId].ballAnimActive = false;
    destroySprite(runtime, sprite);
    if (runtime.gBattleSpritesDataPtr.healthBoxesData.every((h) => !h.ballAnimActive)) {
      for (let i = 0; i < POKEBALL_COUNT; i++) FreeBallGfx(runtime, i);
    }
  }
};

export const SpriteCB_BallThrow_CaptureMon = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const battlerId = sprite.data[6];
  sprite.data[4]++;
  if (sprite.data[4] === 40) return;
  if (sprite.data[4] === 95) {
    runtime.gDoingBattleAnim = false;
    runtime.operations.push('m4aMPlayAllStop');
    playSE(runtime, MUS_CAUGHT_INTRO);
  } else if (sprite.data[4] === 315) {
    destroySprite(runtime, runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]]);
    destroySprite(runtime, sprite);
    if (runtime.gMain.inBattle) runtime.gBattleSpritesDataPtr.healthBoxesData[battlerId].ballAnimActive = false;
  }
};

export const SpriteCB_PlayerMonSendOut_1 = (runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.data[0] = 25;
  sprite.data[2] = getBattlerSpriteCoord(runtime, sprite.data[6], BATTLER_COORD_X_2);
  sprite.data[4] = getBattlerSpriteCoord(runtime, sprite.data[6], BATTLER_COORD_Y_PIC_OFFSET) + 24;
  sprite.data[5] = -30;
  sprite.oam.affineParam = sprite.data[6];
  initAnimArcTranslation(runtime, sprite);
  sprite.callback = 'SpriteCB_PlayerMonSendOut_2';
};

export const SpriteCB_PlayerMonSendOut_2 = (runtime: PokeballRuntime, sprite: Sprite): void => {
  if (translateAnimHorizontalArc(runtime, sprite)) {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[6] = sprite.oam.affineParam & 0xff;
    sprite.data[0] = 0;
    if (runtime.isDoubleBattle && runtime.gBattleSpritesDataPtr.animationData.introAnimActive && sprite.data[6] === getBattlerAtPosition(runtime, B_POSITION_PLAYER_RIGHT)) {
      sprite.callback = 'SpriteCB_ReleaseMon2FromBall';
    } else sprite.callback = 'SpriteCB_ReleaseMonFromBall';
    startSpriteAffineAnim(sprite, 0);
  }
};

export const SpriteCB_ReleaseMon2FromBall = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  if (sprite.data[0]++ > 24) {
    sprite.data[0] = 0;
    sprite.callback = 'SpriteCB_ReleaseMonFromBall';
  }
};

export const SpriteCB_OpponentMonSendOut = (runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.data[0]++;
  if (sprite.data[0] > 15) {
    sprite.data[0] = 0;
    if (runtime.isDoubleBattle && runtime.gBattleSpritesDataPtr.animationData.introAnimActive && sprite.data[6] === getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT)) {
      sprite.callback = 'SpriteCB_ReleaseMon2FromBall';
    } else sprite.callback = 'SpriteCB_ReleaseMonFromBall';
  }
};

export const CreatePokeballSpriteToReleaseMon = (
  runtime: PokeballRuntime,
  monSpriteId: number,
  monPalNum: number,
  x: number,
  y: number,
  oamPriority: number,
  subpriority: number,
  delay: number,
  fadePalettes: number
): void => {
  LoadBallGfx(runtime, BALL_POKE);
  const spriteId = createSprite(runtime, 'Ball:0', x, y, subpriority);
  const sprite = runtime.gSprites[spriteId];
  const mon = runtime.gSprites[monSpriteId];
  sprite.data[0] = monSpriteId;
  sprite.data[5] = mon.x;
  sprite.data[6] = mon.y;
  mon.x = x;
  mon.y = y;
  sprite.data[1] = delay;
  sprite.data[2] = monPalNum;
  sprite.data[3] = fadePalettes & 0xffff;
  sprite.data[4] = fadePalettes >>> 16;
  sprite.oam.priority = oamPriority;
  sprite.callback = 'SpriteCB_PokeballReleaseMon';
  mon.invisible = true;
};

export const SpriteCB_PokeballReleaseMon = (runtime: PokeballRuntime, sprite: Sprite): void => {
  if (sprite.data[1] === 0) {
    const monSprite = runtime.gSprites[sprite.data[0]];
    const subpriority = sprite.subpriority !== 0 ? sprite.subpriority - 1 : 0;
    startSpriteAnim(sprite, 1);
    animateBallOpenParticles(runtime, sprite.x, sprite.y - 5, sprite.oam.priority, subpriority, BALL_POKE);
    sprite.data[1] = launchBallFadeMonTask(runtime, true, sprite.data[2], (sprite.data[3] & 0xffff) | ((sprite.data[4] & 0xffff) << 16), BALL_POKE);
    sprite.callback = 'SpriteCB_ReleasedMonFlyOut';
    monSprite.invisible = false;
    startSpriteAffineAnim(monSprite, BATTLER_AFFINE_EMERGE);
    animateSprite(runtime, monSprite);
    monSprite.data[1] = 0x1000;
    sprite.data[7] = 0;
  } else sprite.data[1]--;
};

export const SpriteCB_ReleasedMonFlyOut = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const monSprite = runtime.gSprites[sprite.data[0]];
  if (sprite.animEnded) sprite.invisible = true;
  const emergeAnimFinished = monSprite.affineAnimEnded;
  if (emergeAnimFinished) startSpriteAffineAnim(monSprite, BATTLER_AFFINE_NORMAL);
  const x = Math.trunc((sprite.data[5] - sprite.x) * sprite.data[7] / 128 + sprite.x);
  const y = Math.trunc((sprite.data[6] - sprite.y) * sprite.data[7] / 128 + sprite.y);
  monSprite.x = x;
  monSprite.y = y;
  let atFinalPosition = false;
  if (sprite.data[7] < 128) {
    const sine = -Math.trunc(sin(sprite.data[7], 1) / 8);
    sprite.data[7] += 4;
    monSprite.x2 = sine;
    monSprite.y2 = sine;
  } else {
    monSprite.x = sprite.data[5];
    monSprite.y = sprite.data[6];
    monSprite.x2 = 0;
    monSprite.y2 = 0;
    atFinalPosition = true;
  }
  if (sprite.animEnded && emergeAnimFinished && atFinalPosition) destroySprite(runtime, sprite);
};

export const CreateTradePokeballSprite = (
  runtime: PokeballRuntime,
  monSpriteId: number,
  monPalNum: number,
  x: number,
  y: number,
  oamPriority: number,
  subPriority: number,
  delay: number,
  fadePalettes: number
): number => {
  LoadBallGfx(runtime, BALL_POKE);
  const spriteId = createSprite(runtime, 'Ball:0', x, y, subPriority);
  const sprite = runtime.gSprites[spriteId];
  sprite.data[0] = monSpriteId;
  sprite.data[1] = delay;
  sprite.data[2] = monPalNum;
  sprite.data[3] = fadePalettes & 0xffff;
  sprite.data[4] = fadePalettes >>> 16;
  sprite.oam.priority = oamPriority;
  sprite.callback = 'SpriteCB_TradePokeball';
  return spriteId;
};

export const SpriteCB_TradePokeball = (runtime: PokeballRuntime, sprite: Sprite): void => {
  if (sprite.data[1] === 0) {
    const monSprite = runtime.gSprites[sprite.data[0]];
    const subpriority = sprite.subpriority !== 0 ? sprite.subpriority - 1 : 0;
    startSpriteAnim(sprite, 1);
    animateBallOpenParticles(runtime, sprite.x, sprite.y - 5, sprite.oam.priority, subpriority, BALL_POKE);
    sprite.data[1] = launchBallFadeMonTask(runtime, true, sprite.data[2], (sprite.data[3] & 0xffff) | ((sprite.data[4] & 0xffff) << 16), BALL_POKE);
    sprite.callback = 'SpriteCB_TradePokeballSendOff';
    startSpriteAffineAnim(monSprite, BATTLER_AFFINE_RETURN);
    animateSprite(runtime, monSprite);
    monSprite.data[1] = 0;
  } else sprite.data[1]--;
};

export const SpriteCB_TradePokeballSendOff = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const monSprite = runtime.gSprites[sprite.data[0]];
  sprite.data[5]++;
  if (sprite.data[5] === 11) playSE(runtime, SE_BALL_TRADE);
  if (monSprite.affineAnimEnded) {
    startSpriteAnim(sprite, 2);
    monSprite.invisible = true;
    sprite.data[5] = 0;
    sprite.callback = 'SpriteCB_TradePokeballEnd';
  } else {
    monSprite.data[1] += 96;
    monSprite.y2 = -monSprite.data[1] >> 8;
  }
};

export const SpriteCB_TradePokeballEnd = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  if (sprite.animEnded) sprite.callback = 'SpriteCallbackDummy';
};

export const DestroySpriteAndFreeResources_Ball = (runtime: PokeballRuntime, sprite: Sprite): void => destroySprite(runtime, sprite);

export const StartHealthboxSlideIn = (runtime: PokeballRuntime, battlerId: number): void => {
  const healthbox = runtime.gSprites[runtime.gHealthboxSpriteIds[battlerId]];
  healthbox.data[0] = 5;
  healthbox.data[1] = 0;
  healthbox.x2 = 0x73;
  healthbox.y2 = 0;
  healthbox.callback = 'SpriteCB_HealthboxSlideIn';
  if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
    healthbox.data[0] = -healthbox.data[0];
    healthbox.data[1] = -healthbox.data[1];
    healthbox.x2 = -healthbox.x2;
    healthbox.y2 = -healthbox.y2;
  }
  if (runtime.gSprites[healthbox.data[5]]) callSpriteCallback(runtime, runtime.gSprites[healthbox.data[5]]);
  if (getBattlerPosition(runtime, battlerId) === B_POSITION_PLAYER_RIGHT) healthbox.callback = 'SpriteCB_HealthboxSlideInDelayed';
};

export const SpriteCB_HealthboxSlideInDelayed = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.data[1]++;
  if (sprite.data[1] === 20) {
    sprite.data[1] = 0;
    sprite.callback = 'SpriteCB_HealthboxSlideIn';
  }
};

export const SpriteCB_HealthboxSlideIn = (_runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.x2 -= sprite.data[0];
  sprite.y2 -= sprite.data[1];
  if (sprite.x2 === 0 && sprite.y2 === 0) sprite.callback = 'SpriteCallbackDummy';
};

export const DoHitAnimHealthboxEffect = (runtime: PokeballRuntime, battlerId: number): void => {
  const spriteId = createSprite(runtime, 'Invisible', 0, 0, 0);
  const sprite = runtime.gSprites[spriteId];
  sprite.invisible = true;
  sprite.data[0] = 1;
  sprite.data[1] = runtime.gHealthboxSpriteIds[battlerId];
  sprite.callback = 'SpriteCB_HitAnimHealthoxEffect';
};

export const SpriteCB_HitAnimHealthoxEffect = (runtime: PokeballRuntime, sprite: Sprite): void => {
  const target = runtime.gSprites[sprite.data[1]];
  target.y2 = sprite.data[0];
  sprite.data[0] = -sprite.data[0];
  sprite.data[2]++;
  if (sprite.data[2] === 21) {
    target.x2 = 0;
    target.y2 = 0;
    destroySprite(runtime, sprite);
  }
};

export const LoadBallGfx = (runtime: PokeballRuntime, ballId: number): void => {
  if (!runtime.loadedSpriteTags.has(gBallSpriteSheets[ballId].tag)) {
    runtime.loadedSpriteTags.add(gBallSpriteSheets[ballId].tag);
    runtime.operations.push(`LoadCompressedSpriteSheetUsingHeap:${ballId}`, `LoadCompressedSpritePaletteUsingHeap:${ballId}`);
  }
  runtime.loadedBallGfx.add(ballId);
  switch (ballId) {
    case BALL_DIVE:
    case BALL_LUXURY:
    case BALL_PREMIER:
      break;
    default:
      runtime.operations.push(`LZDecompressVram:gOpenPokeballGfx:${ballId}`);
      break;
  }
};

export const FreeBallGfx = (runtime: PokeballRuntime, ballId: number): void => {
  runtime.loadedSpriteTags.delete(gBallSpriteSheets[ballId].tag);
  runtime.loadedBallGfx.delete(ballId);
  runtime.operations.push(`FreeSpriteTilesByTag:${gBallSpriteSheets[ballId].tag}`, `FreeSpritePaletteByTag:${gBallSpritePalettes[ballId].tag}`);
};

export const AnimateBallOpenParticlesForPokeball = (
  runtime: PokeballRuntime,
  x: number,
  y: number,
  kindOfStars: number,
  subpriority: number
): number => animateBallOpenParticles(runtime, x, y, kindOfStars, subpriority, BALL_POKE);

export const LaunchBallFadeMonTaskForPokeball = (
  runtime: PokeballRuntime,
  unFadeLater: boolean,
  spritePalNum: number,
  selectedPalettes: number
): number => launchBallFadeMonTask(runtime, unFadeLater, spritePalNum, selectedPalettes, BALL_POKE);

export const GetBattlerPokeballItemId = (runtime: PokeballRuntime, battlerId: number): number =>
  getBattlerPokeballItemId(runtime, battlerId);

export const callSpriteCallback = (runtime: PokeballRuntime, sprite: Sprite): void => {
  switch (sprite.callback) {
    case 'SpriteCB_BallThrow': return SpriteCB_BallThrow(runtime, sprite);
    case 'SpriteCB_BallThrow_ReachMon': return SpriteCB_BallThrow_ReachMon(runtime, sprite);
    case 'SpriteCB_BallThrow_StartShrinkMon': return SpriteCB_BallThrow_StartShrinkMon(runtime, sprite);
    case 'SpriteCB_BallThrow_ShrinkMon': return SpriteCB_BallThrow_ShrinkMon(runtime, sprite);
    case 'SpriteCB_BallThrow_Close': return SpriteCB_BallThrow_Close(runtime, sprite);
    case 'SpriteCB_BallThrow_FallToGround': return SpriteCB_BallThrow_FallToGround(runtime, sprite);
    case 'SpriteCB_BallThrow_StartShakes': return SpriteCB_BallThrow_StartShakes(runtime, sprite);
    case 'SpriteCB_BallThrow_Shake': return SpriteCB_BallThrow_Shake(runtime, sprite);
    case 'SpriteCB_BallThrow_StartCaptureMon': return SpriteCB_BallThrow_StartCaptureMon(runtime, sprite);
    case 'SpriteCB_BallThrow_CaptureMon': return SpriteCB_BallThrow_CaptureMon(runtime, sprite);
    case 'SpriteCB_ReleaseMonFromBall': return SpriteCB_ReleaseMonFromBall(runtime, sprite);
    case 'HandleBallAnimEnd': return HandleBallAnimEnd(runtime, sprite);
    case 'SpriteCB_PlayerMonSendOut_1': return SpriteCB_PlayerMonSendOut_1(runtime, sprite);
    case 'SpriteCB_PlayerMonSendOut_2': return SpriteCB_PlayerMonSendOut_2(runtime, sprite);
    case 'SpriteCB_ReleaseMon2FromBall': return SpriteCB_ReleaseMon2FromBall(runtime, sprite);
    case 'SpriteCB_OpponentMonSendOut': return SpriteCB_OpponentMonSendOut(runtime, sprite);
    case 'SpriteCB_PokeballReleaseMon': return SpriteCB_PokeballReleaseMon(runtime, sprite);
    case 'SpriteCB_ReleasedMonFlyOut': return SpriteCB_ReleasedMonFlyOut(runtime, sprite);
    case 'SpriteCB_TradePokeball': return SpriteCB_TradePokeball(runtime, sprite);
    case 'SpriteCB_TradePokeballSendOff': return SpriteCB_TradePokeballSendOff(runtime, sprite);
    case 'SpriteCB_TradePokeballEnd': return SpriteCB_TradePokeballEnd(runtime, sprite);
    case 'SpriteCB_HealthboxSlideInDelayed': return SpriteCB_HealthboxSlideInDelayed(runtime, sprite);
    case 'SpriteCB_HealthboxSlideIn': return SpriteCB_HealthboxSlideIn(runtime, sprite);
    case 'SpriteCB_HitAnimHealthoxEffect': return SpriteCB_HitAnimHealthoxEffect(runtime, sprite);
    case 'SpriteCallbackDummy': return;
  }
};

const getBattlerSide = (runtime: PokeballRuntime, battlerId: number): number => runtime.battlerSides[battlerId] ?? B_SIDE_PLAYER;
const getBattlerPosition = (runtime: PokeballRuntime, battlerId: number): number => runtime.battlerPositions[battlerId] ?? battlerId;
const getBattlerAtPosition = (runtime: PokeballRuntime, position: number): number => runtime.battlerPositions.indexOf(position);
const getBattlerSpriteCoord = (runtime: PokeballRuntime, battlerId: number, coord: string): number => runtime.battlerCoords[battlerId]?.[coord] ?? 0;
const getBattlerMon = (runtime: PokeballRuntime, battlerId: number): PokemonLike =>
  getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER
    ? runtime.gPlayerParty[runtime.gBattlerPartyIndexes[battlerId]]
    : runtime.gEnemyParty[runtime.gBattlerPartyIndexes[battlerId]];
const getBattlerPokeballItemId = (runtime: PokeballRuntime, battlerId: number): number => getBattlerMon(runtime, battlerId).pokeball;
const destroyTask = (runtime: PokeballRuntime, taskId: number): void => {
  runtime.gTasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};
const destroySprite = (runtime: PokeballRuntime, sprite: Sprite): void => {
  sprite.invisible = true;
  sprite.callback = 'SpriteCallbackDummy';
  runtime.operations.push(`DestroySprite:${sprite.id}`);
};
const startSpriteAnim = (sprite: Sprite, anim: number): void => {
  sprite.data[7] = sprite.data[7];
  sprite.animEnded = false;
  sprite.data[5] = sprite.data[5];
  sprite.oam.matrixNum = sprite.oam.matrixNum;
  sprite.template = `${sprite.template}|anim${anim}`;
};
const startSpriteAffineAnim = (sprite: Sprite, anim: number): void => {
  sprite.affineAnimEnded = false;
  sprite.oam.affineParam = sprite.oam.affineParam;
  sprite.template = `${sprite.template}|affine${anim}`;
};
const changeSpriteAffineAnim = (sprite: Sprite, anim: number): void => startSpriteAffineAnim(sprite, anim);
const animateSprite = (_runtime: PokeballRuntime, _sprite: Sprite): void => undefined;
const initAnimArcTranslation = (runtime: PokeballRuntime, sprite: Sprite): void => {
  runtime.operations.push(`InitAnimArcTranslation:${sprite.id}`);
};
const translateAnimHorizontalArc = (runtime: PokeballRuntime, _sprite: Sprite): boolean =>
  runtime.translationResults.length > 0 ? runtime.translationResults.shift()! : false;
const animateBallOpenParticles = (runtime: PokeballRuntime, x: number, y: number, kind: number, subpriority: number, ballId: number): number => {
  const taskId = createTask(runtime, 'TaskDummy');
  const task = runtime.gTasks[taskId];
  task.data[1] = x & 0xff;
  task.data[2] = y & 0xff;
  task.data[3] = kind & 0xff;
  task.data[4] = subpriority & 0xff;
  task.data[15] = ballId & 0xff;
  runtime.operations.push(`AnimateBallOpenParticles:${x}:${y}:${kind}:${subpriority}:${ballId}`);
  playSE(runtime, SE_BALL_OPEN);
  return taskId;
};
const launchBallFadeMonTask = (runtime: PokeballRuntime, unFadeLater: boolean, spritePalNum: number, selectedPalettes: number, ballId: number): number => {
  const id = runtime.nextFadeTaskId++;
  runtime.operations.push(`LaunchBallFadeMonTask:${unFadeLater ? 1 : 0}:${spritePalNum}:${selectedPalettes}:${ballId}:${id}`);
  return id;
};
const playSE = (runtime: PokeballRuntime, song: number): void => {
  runtime.sounds.push(song);
};
const playCry = (runtime: PokeballRuntime, species: number, pan: number, mode: string): void => {
  runtime.operations.push(`PlayCry:${species}:${pan}:${mode}`);
};
const isCryPlayingOrClearCrySongs = (runtime: PokeballRuntime): boolean =>
  runtime.cryPlayingResults.length > 0 ? runtime.cryPlayingResults.shift()! : false;
const cos = (angle: number, amplitude: number): number => Math.round(Math.cos((angle / 128) * Math.PI) * amplitude);
const sin = (angle: number, amplitude: number): number => Math.round(Math.sin((angle / 128) * Math.PI) * amplitude);
