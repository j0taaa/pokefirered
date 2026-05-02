export const CONTROLLER_GETMONDATA = 0;
export const CONTROLLER_GETRAWMONDATA = 1;
export const CONTROLLER_SETMONDATA = 2;
export const CONTROLLER_SETRAWMONDATA = 3;
export const CONTROLLER_LOADMONSPRITE = 4;
export const CONTROLLER_SWITCHINANIM = 5;
export const CONTROLLER_RETURNMONTOBALL = 6;
export const CONTROLLER_DRAWTRAINERPIC = 7;
export const CONTROLLER_TRAINERSLIDE = 8;
export const CONTROLLER_TRAINERSLIDEBACK = 9;
export const CONTROLLER_FAINTANIMATION = 10;
export const CONTROLLER_PALETTEFADE = 11;
export const CONTROLLER_SUCCESSBALLTHROWANIM = 12;
export const CONTROLLER_BALLTHROWANIM = 13;
export const CONTROLLER_PAUSE = 14;
export const CONTROLLER_MOVEANIMATION = 15;
export const CONTROLLER_PRINTSTRING = 16;
export const CONTROLLER_PRINTSTRINGPLAYERONLY = 17;
export const CONTROLLER_CHOOSEACTION = 18;
export const CONTROLLER_UNKNOWNYESNOBOX = 19;
export const CONTROLLER_CHOOSEMOVE = 20;
export const CONTROLLER_OPENBAG = 21;
export const CONTROLLER_CHOOSEPOKEMON = 22;
export const CONTROLLER_23 = 23;
export const CONTROLLER_HEALTHBARUPDATE = 24;
export const CONTROLLER_EXPUPDATE = 25;
export const CONTROLLER_STATUSICONUPDATE = 26;
export const CONTROLLER_STATUSANIMATION = 27;
export const CONTROLLER_STATUSXOR = 28;
export const CONTROLLER_DATATRANSFER = 29;
export const CONTROLLER_DMA3TRANSFER = 30;
export const CONTROLLER_PLAYBGM = 31;
export const CONTROLLER_32 = 32;
export const CONTROLLER_TWORETURNVALUES = 33;
export const CONTROLLER_CHOSENMONRETURNVALUE = 34;
export const CONTROLLER_ONERETURNVALUE = 35;
export const CONTROLLER_ONERETURNVALUE_DUPLICATE = 36;
export const CONTROLLER_CLEARUNKVAR = 37;
export const CONTROLLER_SETUNKVAR = 38;
export const CONTROLLER_CLEARUNKFLAG = 39;
export const CONTROLLER_TOGGLEUNKFLAG = 40;
export const CONTROLLER_HITANIMATION = 41;
export const CONTROLLER_CANTSWITCH = 42;
export const CONTROLLER_PLAYSE = 43;
export const CONTROLLER_PLAYFANFARE = 44;
export const CONTROLLER_FAINTINGCRY = 45;
export const CONTROLLER_INTROSLIDE = 46;
export const CONTROLLER_INTROTRAINERBALLTHROW = 47;
export const CONTROLLER_DRAWPARTYSTATUSSUMMARY = 48;
export const CONTROLLER_HIDEPARTYSTATUSSUMMARY = 49;
export const CONTROLLER_ENDBOUNCE = 50;
export const CONTROLLER_SPRITEINVISIBILITY = 51;
export const CONTROLLER_BATTLEANIMATION = 52;
export const CONTROLLER_LINKSTANDBYMSG = 53;
export const CONTROLLER_RESETACTIONMOVESELECTION = 54;
export const CONTROLLER_ENDLINKBATTLE = 55;
export const CONTROLLER_TERMINATOR_NOP = 56;
export const CONTROLLER_CMDS_COUNT = 57;

export const REQUEST_ALL_BATTLE = 0;
export const REQUEST_SPECIES_BATTLE = 1;
export const REQUEST_HELDITEM_BATTLE = 2;
export const REQUEST_MOVES_PP_BATTLE = 3;
export const REQUEST_MOVE1_BATTLE = 4;
export const REQUEST_MOVE2_BATTLE = 5;
export const REQUEST_MOVE3_BATTLE = 6;
export const REQUEST_MOVE4_BATTLE = 7;
export const REQUEST_PP_DATA_BATTLE = 8;
export const REQUEST_PPMOVE1_BATTLE = 9;
export const REQUEST_PPMOVE2_BATTLE = 10;
export const REQUEST_PPMOVE3_BATTLE = 11;
export const REQUEST_PPMOVE4_BATTLE = 12;
export const REQUEST_OTID_BATTLE = 13;
export const REQUEST_EXP_BATTLE = 14;
export const REQUEST_HP_EV_BATTLE = 15;
export const REQUEST_ATK_EV_BATTLE = 16;
export const REQUEST_DEF_EV_BATTLE = 17;
export const REQUEST_SPEED_EV_BATTLE = 18;
export const REQUEST_SPATK_EV_BATTLE = 19;
export const REQUEST_SPDEF_EV_BATTLE = 20;
export const REQUEST_FRIENDSHIP_BATTLE = 21;
export const REQUEST_POKERUS_BATTLE = 22;
export const REQUEST_MET_LOCATION_BATTLE = 23;
export const REQUEST_MET_LEVEL_BATTLE = 24;
export const REQUEST_MET_GAME_BATTLE = 25;
export const REQUEST_POKEBALL_BATTLE = 26;
export const REQUEST_ALL_IVS_BATTLE = 27;
export const REQUEST_HP_IV_BATTLE = 28;
export const REQUEST_ATK_IV_BATTLE = 29;
export const REQUEST_DEF_IV_BATTLE = 30;
export const REQUEST_SPEED_IV_BATTLE = 31;
export const REQUEST_SPATK_IV_BATTLE = 32;
export const REQUEST_SPDEF_IV_BATTLE = 33;
export const REQUEST_PERSONALITY_BATTLE = 34;
export const REQUEST_CHECKSUM_BATTLE = 35;
export const REQUEST_STATUS_BATTLE = 36;
export const REQUEST_LEVEL_BATTLE = 37;
export const REQUEST_HP_BATTLE = 38;
export const REQUEST_MAX_HP_BATTLE = 39;
export const REQUEST_ATK_BATTLE = 40;
export const REQUEST_DEF_BATTLE = 41;
export const REQUEST_SPEED_BATTLE = 42;
export const REQUEST_SPATK_BATTLE = 43;
export const REQUEST_SPDEF_BATTLE = 44;
export const REQUEST_COOL_BATTLE = 45;
export const REQUEST_BEAUTY_BATTLE = 46;
export const REQUEST_CUTE_BATTLE = 47;
export const REQUEST_SMART_BATTLE = 48;
export const REQUEST_TOUGH_BATTLE = 49;
export const REQUEST_SHEEN_BATTLE = 50;
export const REQUEST_COOL_RIBBON_BATTLE = 51;
export const REQUEST_BEAUTY_RIBBON_BATTLE = 52;
export const REQUEST_CUTE_RIBBON_BATTLE = 53;
export const REQUEST_SMART_RIBBON_BATTLE = 54;
export const REQUEST_TOUGH_RIBBON_BATTLE = 55;

export const BATTLE_TYPE_LINK = 1 << 0;
export const BATTLE_TYPE_MULTI = 1 << 1;
export const BIT_FLANK = 2;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_FLANK_LEFT = 0;
export const VERSION_RUBY = 1;
export const VERSION_SAPPHIRE = 2;
export const VERSION_EMERALD = 3;
export const TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN = 100;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const HEALTHBOX_ALL = 'HEALTHBOX_ALL';
export const HEALTHBOX_STATUS_ICON = 'HEALTHBOX_STATUS_ICON';
export const HEALTH_BAR = 'HEALTH_BAR';
export const HP_CURRENT = 'HP_CURRENT';
export const INSTANT_HP_BAR_DROP = 0x7fff;
export const SE_FAINT = 0xab;
export const SOUND_PAN_ATTACKER = -25;
export const SOUND_PAN_TARGET = 25;
export const CRY_MODE_FAINT = 'CRY_MODE_FAINT';
export const POKEBALL_PLAYER_SENDOUT = 'POKEBALL_PLAYER_SENDOUT';
export const B_ANIM_MON_TO_SUBSTITUTE = 'B_ANIM_MON_TO_SUBSTITUTE';
export const B_ANIM_SUBSTITUTE_TO_MON = 'B_ANIM_SUBSTITUTE_TO_MON';
export const B_ANIM_SWITCH_OUT_PLAYER_MON = 'B_ANIM_SWITCH_OUT_PLAYER_MON';
export const B_WIN_MSG = 0;
export const B_TEXT_FLAG_NPC_CONTEXT_FONT = 0x80;

export type LinkPartnerControllerFunc =
  | 'LinkPartnerBufferRunCommand'
  | 'LinkPartnerDummy'
  | 'CompleteOnBattlerSpriteCallbackDummy'
  | 'FreeTrainerSpriteAfterSlide'
  | 'Intro_DelayAndEnd'
  | 'Intro_WaitForHealthbox'
  | 'Intro_ShowHealthbox'
  | 'WaitForMonAnimAfterLoad'
  | 'CompleteOnHealthbarDone'
  | 'CompleteOnFinishedStatusAnimation'
  | 'CompleteOnFinishedBattleAnimation'
  | 'FreeMonSpriteAfterFaintAnim'
  | 'DoSwitchOutAnimation'
  | 'FreeMonSpriteAfterSwitchOutAnim'
  | 'CompleteOnInactiveTextPrinter'
  | 'DoHitAnimBlinkSpriteEffect'
  | 'SwitchIn_ShowSubstitute'
  | 'SwitchIn_WaitAndEnd'
  | 'SwitchIn_ShowHealthbox'
  | 'SwitchIn_TryShinyAnim'
  | 'LinkPartnerDoMoveAnimation'
  | 'EndDrawPartyStatusSummary'
  | 'SetBattleEndCallbacks';

export interface LinkPartnerMon {
  species: number;
  item: number;
  moves: number[];
  pp: number[];
  ppBonuses: number;
  friendship: number;
  experience: number;
  hpIV: number;
  attackIV: number;
  defenseIV: number;
  speedIV: number;
  spAttackIV: number;
  spDefenseIV: number;
  personality: number;
  status1: number;
  level: number;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  isEgg: number;
  abilityNum: number;
  otId: number;
  nickname: string;
  otName: string;
  hpEV: number;
  attackEV: number;
  defenseEV: number;
  speedEV: number;
  spAttackEV: number;
  spDefenseEV: number;
  pokerus: number;
  metLocation: number;
  metLevel: number;
  metGame: number;
  pokeball: number;
  checksum: number;
  cool: number;
  beauty: number;
  cute: number;
  smart: number;
  tough: number;
  sheen: number;
  coolRibbon: number;
  beautyRibbon: number;
  cuteRibbon: number;
  smartRibbon: number;
  toughRibbon: number;
  raw: number[];
}

export interface LinkPartnerSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: string;
  invisible: boolean;
  animEnded: boolean;
  anim: number;
  oam: { paletteNum: number; matrixNum: number; priority: number };
}

export interface LinkPartnerHealthboxData {
  introEndDelay: number;
  ballAnimActive: boolean;
  specialAnimActive: boolean;
  animationState: number;
  triedShinyMonAnim: boolean;
  finishedShinyMonAnim: boolean;
  statusAnimActive: boolean;
  animFromTableActive: boolean;
  partyStatusSummaryShown: boolean;
  partyStatusDelayTimer: number;
}

export interface LinkPartnerRuntime {
  gActiveBattler: number;
  gBattleControllerExecFlags: number;
  gBitTable: number[];
  gBattleBufferA: number[][];
  gBattleBufferB: number[][];
  gBattlerControllerFuncs: LinkPartnerControllerFunc[];
  gPlayerParty: LinkPartnerMon[];
  gBattlerPartyIndexes: number[];
  gBattlerSpriteIds: number[];
  gHealthboxSpriteIds: number[];
  gBattleControllerData: number[];
  gBattleTypeFlags: number;
  gBattleSpritesDataPtr: {
    healthBoxesData: LinkPartnerHealthboxData[];
    battlerData: Array<{ behindSubstitute: boolean; flag_x8: boolean }>;
    animationData: { introAnimActive: boolean };
  };
  gSprites: LinkPartnerSprite[];
  gLinkPlayers: Array<{ version: number; gender: number }>;
  gTrainerBackPicCoords: Record<number, { size: number }>;
  gBattleMonForms: number[];
  gBattlerStatusSummaryTaskId: number[];
  gTasks: Array<{ id: number; func: string; data: number[]; destroyed: boolean }>;
  gUnusedControllerStruct: { unk: number; flag: number };
  gBattle_BG0_X: number;
  gBattle_BG0_Y: number;
  gDisplayedStringBattle: string;
  gDoingBattleAnim: boolean;
  gAnimMoveTurn: number;
  gAnimMovePower: number;
  gAnimMoveDmg: number;
  gAnimFriendship: number;
  gWeatherMoveAnim: number;
  gTransformedPersonalities: number[];
  gAnimScriptActive: boolean;
  gIntroSlideFlags: number;
  gBattleOutcome: number;
  multiplayerId: number;
  isDoubleBattle: boolean;
  cryPlaying: boolean;
  battleSEPlaying: boolean;
  textPrinterActive: boolean;
  moveBattleBarResults: number[];
  tryHandleBattleAnimationResult: boolean;
  operations: string[];
  emittedTransfers: Array<{ buffer: string; size: number; data: unknown }>;
  sounds: Array<{ kind: string; id: number; pan?: number }>;
}

export const createLinkPartnerMon = (overrides: Partial<LinkPartnerMon> = {}): LinkPartnerMon => ({
  species: 1,
  item: 0,
  moves: [1, 2, 3, 4],
  pp: [35, 20, 15, 10],
  ppBonuses: 0,
  friendship: 70,
  experience: 100,
  hpIV: 1,
  attackIV: 2,
  defenseIV: 3,
  speedIV: 4,
  spAttackIV: 5,
  spDefenseIV: 6,
  personality: 0x12345678,
  status1: 0,
  level: 5,
  hp: 18,
  maxHP: 20,
  attack: 10,
  defense: 11,
  speed: 12,
  spAttack: 13,
  spDefense: 14,
  isEgg: 0,
  abilityNum: 0,
  otId: 0xabcdef,
  nickname: 'MON',
  otName: 'OT',
  hpEV: 0,
  attackEV: 0,
  defenseEV: 0,
  speedEV: 0,
  spAttackEV: 0,
  spDefenseEV: 0,
  pokerus: 0,
  metLocation: 0,
  metLevel: 5,
  metGame: 1,
  pokeball: 4,
  checksum: 0xbeef,
  cool: 0,
  beauty: 0,
  cute: 0,
  smart: 0,
  tough: 0,
  sheen: 0,
  coolRibbon: 0,
  beautyRibbon: 0,
  cuteRibbon: 0,
  smartRibbon: 0,
  toughRibbon: 0,
  raw: Array.from({ length: 128 }, () => 0),
  ...overrides
});

const createSprite = (id: number): LinkPartnerSprite => ({
  id,
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  callback: 'SpriteCallbackDummy',
  invisible: false,
  animEnded: true,
  anim: 0,
  oam: { paletteNum: 0, matrixNum: 0, priority: 0 }
});

const healthbox = (): LinkPartnerHealthboxData => ({
  introEndDelay: 0,
  ballAnimActive: false,
  specialAnimActive: false,
  animationState: 0,
  triedShinyMonAnim: false,
  finishedShinyMonAnim: false,
  statusAnimActive: false,
  animFromTableActive: false,
  partyStatusSummaryShown: false,
  partyStatusDelayTimer: 0
});

export const createLinkPartnerRuntime = (overrides: Partial<LinkPartnerRuntime> = {}): LinkPartnerRuntime => ({
  gActiveBattler: 0,
  gBattleControllerExecFlags: 1,
  gBitTable: [1, 2, 4, 8],
  gBattleBufferA: Array.from({ length: 4 }, () => Array.from({ length: 64 }, () => 0)),
  gBattleBufferB: Array.from({ length: 4 }, () => Array.from({ length: 64 }, () => 0)),
  gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'LinkPartnerBufferRunCommand'),
  gPlayerParty: Array.from({ length: 6 }, (_, i) => createLinkPartnerMon({ species: i + 1, nickname: `MON${i + 1}` })),
  gBattlerPartyIndexes: [0, 1, 2, 3],
  gBattlerSpriteIds: [0, 1, 2, 3],
  gHealthboxSpriteIds: [4, 5, 6, 7],
  gBattleControllerData: [8, 9, 10, 11],
  gBattleTypeFlags: 0,
  gBattleSpritesDataPtr: {
    healthBoxesData: Array.from({ length: 4 }, healthbox),
    battlerData: Array.from({ length: 4 }, () => ({ behindSubstitute: false, flag_x8: false })),
    animationData: { introAnimActive: false }
  },
  gSprites: Array.from({ length: 32 }, (_, i) => createSprite(i)),
  gLinkPlayers: Array.from({ length: 4 }, () => ({ version: 4, gender: 0 })),
  gTrainerBackPicCoords: {},
  gBattleMonForms: [0, 0, 0, 0],
  gBattlerStatusSummaryTaskId: [0, 0, 0, 0],
  gTasks: [],
  gUnusedControllerStruct: { unk: 0, flag: 0 },
  gBattle_BG0_X: 0,
  gBattle_BG0_Y: 0,
  gDisplayedStringBattle: '',
  gDoingBattleAnim: false,
  gAnimMoveTurn: 0,
  gAnimMovePower: 0,
  gAnimMoveDmg: 0,
  gAnimFriendship: 0,
  gWeatherMoveAnim: 0,
  gTransformedPersonalities: [0, 0, 0, 0],
  gAnimScriptActive: false,
  gIntroSlideFlags: 0,
  gBattleOutcome: 0,
  multiplayerId: 0,
  isDoubleBattle: false,
  cryPlaying: false,
  battleSEPlaying: false,
  textPrinterActive: false,
  moveBattleBarResults: [-1],
  tryHandleBattleAnimationResult: false,
  operations: [],
  emittedTransfers: [],
  sounds: [],
  ...overrides
});

const u16 = (lo: number, hi: number): number => lo | (hi << 8);
const u32 = (b0: number, b1: number, b2: number, b3: number): number => (b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0;
const push16 = (out: number[], value: number): void => {
  out.push(value & 0xff, (value >>> 8) & 0xff);
};
const push24 = (out: number[], value: number): void => {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff);
};
const push32 = (out: number[], value: number): void => {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
};

const monRequestScalar = (mon: LinkPartnerMon, request: number): number | null => {
  const map: Record<number, number> = {
    [REQUEST_SPECIES_BATTLE]: mon.species,
    [REQUEST_HELDITEM_BATTLE]: mon.item,
    [REQUEST_MOVE1_BATTLE]: mon.moves[0] ?? 0,
    [REQUEST_MOVE2_BATTLE]: mon.moves[1] ?? 0,
    [REQUEST_MOVE3_BATTLE]: mon.moves[2] ?? 0,
    [REQUEST_MOVE4_BATTLE]: mon.moves[3] ?? 0,
    [REQUEST_PPMOVE1_BATTLE]: mon.pp[0] ?? 0,
    [REQUEST_PPMOVE2_BATTLE]: mon.pp[1] ?? 0,
    [REQUEST_PPMOVE3_BATTLE]: mon.pp[2] ?? 0,
    [REQUEST_PPMOVE4_BATTLE]: mon.pp[3] ?? 0,
    [REQUEST_HP_EV_BATTLE]: mon.hpEV,
    [REQUEST_ATK_EV_BATTLE]: mon.attackEV,
    [REQUEST_DEF_EV_BATTLE]: mon.defenseEV,
    [REQUEST_SPEED_EV_BATTLE]: mon.speedEV,
    [REQUEST_SPATK_EV_BATTLE]: mon.spAttackEV,
    [REQUEST_SPDEF_EV_BATTLE]: mon.spDefenseEV,
    [REQUEST_FRIENDSHIP_BATTLE]: mon.friendship,
    [REQUEST_POKERUS_BATTLE]: mon.pokerus,
    [REQUEST_MET_LOCATION_BATTLE]: mon.metLocation,
    [REQUEST_MET_LEVEL_BATTLE]: mon.metLevel,
    [REQUEST_MET_GAME_BATTLE]: mon.metGame,
    [REQUEST_POKEBALL_BATTLE]: mon.pokeball,
    [REQUEST_HP_IV_BATTLE]: mon.hpIV,
    [REQUEST_ATK_IV_BATTLE]: mon.attackIV,
    [REQUEST_DEF_IV_BATTLE]: mon.defenseIV,
    [REQUEST_SPEED_IV_BATTLE]: mon.speedIV,
    [REQUEST_SPATK_IV_BATTLE]: mon.spAttackIV,
    [REQUEST_SPDEF_IV_BATTLE]: mon.spDefenseIV,
    [REQUEST_LEVEL_BATTLE]: mon.level,
    [REQUEST_HP_BATTLE]: mon.hp,
    [REQUEST_MAX_HP_BATTLE]: mon.maxHP,
    [REQUEST_ATK_BATTLE]: mon.attack,
    [REQUEST_DEF_BATTLE]: mon.defense,
    [REQUEST_SPEED_BATTLE]: mon.speed,
    [REQUEST_SPATK_BATTLE]: mon.spAttack,
    [REQUEST_SPDEF_BATTLE]: mon.spDefense,
    [REQUEST_COOL_BATTLE]: mon.cool,
    [REQUEST_BEAUTY_BATTLE]: mon.beauty,
    [REQUEST_CUTE_BATTLE]: mon.cute,
    [REQUEST_SMART_BATTLE]: mon.smart,
    [REQUEST_TOUGH_BATTLE]: mon.tough,
    [REQUEST_SHEEN_BATTLE]: mon.sheen,
    [REQUEST_COOL_RIBBON_BATTLE]: mon.coolRibbon,
    [REQUEST_BEAUTY_RIBBON_BATTLE]: mon.beautyRibbon,
    [REQUEST_CUTE_RIBBON_BATTLE]: mon.cuteRibbon,
    [REQUEST_SMART_RIBBON_BATTLE]: mon.smartRibbon,
    [REQUEST_TOUGH_RIBBON_BATTLE]: mon.toughRibbon
  };
  return map[request] ?? null;
};

const serializeAllBattle = (mon: LinkPartnerMon): number[] => {
  const out: number[] = [];
  [
    mon.species,
    mon.item,
    ...mon.moves,
    ...mon.pp,
    mon.ppBonuses,
    mon.friendship,
    mon.experience,
    mon.hpIV,
    mon.attackIV,
    mon.defenseIV,
    mon.speedIV,
    mon.spAttackIV,
    mon.spDefenseIV,
    mon.personality,
    mon.status1,
    mon.level,
    mon.hp,
    mon.maxHP,
    mon.attack,
    mon.defense,
    mon.speed,
    mon.spAttack,
    mon.spDefense,
    mon.isEgg,
    mon.abilityNum,
    mon.otId
  ].forEach((value) => push32(out, value));
  return out;
};

export const CopyLinkPartnerMonData = (runtime: LinkPartnerRuntime, monId: number): number[] => {
  const request = runtime.gBattleBufferA[runtime.gActiveBattler][1];
  const mon = runtime.gPlayerParty[monId];
  const out: number[] = [];
  switch (request) {
    case REQUEST_ALL_BATTLE:
      return serializeAllBattle(mon);
    case REQUEST_MOVES_PP_BATTLE:
      mon.moves.forEach((move) => push16(out, move));
      mon.pp.forEach((pp) => out.push(pp & 0xff));
      out.push(mon.ppBonuses & 0xff);
      return out;
    case REQUEST_PP_DATA_BATTLE:
      mon.pp.forEach((pp) => out.push(pp & 0xff));
      out.push(mon.ppBonuses & 0xff);
      return out;
    case REQUEST_OTID_BATTLE:
    case REQUEST_EXP_BATTLE:
      push24(out, request === REQUEST_OTID_BATTLE ? mon.otId : mon.experience);
      return out;
    case REQUEST_PERSONALITY_BATTLE:
    case REQUEST_STATUS_BATTLE:
      push32(out, request === REQUEST_PERSONALITY_BATTLE ? mon.personality : mon.status1);
      return out;
    case REQUEST_ALL_IVS_BATTLE:
      out.push(mon.hpIV, mon.attackIV, mon.defenseIV, mon.speedIV, mon.spAttackIV, mon.spDefenseIV);
      return out;
    case REQUEST_CHECKSUM_BATTLE:
      push16(out, mon.checksum);
      return out;
    default: {
      const scalar = monRequestScalar(mon, request);
      if (scalar == null) return out;
      if (
        [
          REQUEST_SPECIES_BATTLE,
          REQUEST_HELDITEM_BATTLE,
          REQUEST_MOVE1_BATTLE,
          REQUEST_MOVE2_BATTLE,
          REQUEST_MOVE3_BATTLE,
          REQUEST_MOVE4_BATTLE,
          REQUEST_HP_BATTLE,
          REQUEST_MAX_HP_BATTLE,
          REQUEST_ATK_BATTLE,
          REQUEST_DEF_BATTLE,
          REQUEST_SPEED_BATTLE,
          REQUEST_SPATK_BATTLE,
          REQUEST_SPDEF_BATTLE
        ].includes(request)
      ) {
        push16(out, scalar);
      } else {
        out.push(scalar & 0xff);
      }
      return out;
    }
  }
};

const complete = (runtime: LinkPartnerRuntime): void => {
  const battler = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[battler] = 'LinkPartnerBufferRunCommand';
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    const playerId = runtime.multiplayerId & 0xff;
    runtime.emittedTransfers.push({ buffer: 'link', size: 4, data: [playerId] });
    runtime.gBattleBufferA[battler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[battler];
  }
};

export const LinkPartnerBufferExecCompleted = complete;

export const LinkPartnerDummy = (_runtime: LinkPartnerRuntime): void => {};

const createTask = (runtime: LinkPartnerRuntime, func: string, priority: number): number => {
  const id = runtime.gTasks.length;
  runtime.gTasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${func}:${priority}:${id}`);
  return id;
};

const destroySprite = (runtime: LinkPartnerRuntime, id: number): void => {
  runtime.gSprites[id].callback = 'Destroyed';
  runtime.operations.push(`DestroySprite:${id}`);
};

export const SetControllerToLinkPartner = (runtime: LinkPartnerRuntime): void => {
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'LinkPartnerBufferRunCommand';
};

export const LinkPartnerBufferRunCommand = (runtime: LinkPartnerRuntime): void => {
  const battler = runtime.gActiveBattler;
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[battler]) {
    const command = runtime.gBattleBufferA[battler][0];
    const handler = sLinkPartnerBufferCommands[command];
    if (handler) handler(runtime);
    else complete(runtime);
  }
};

export const CompleteOnBattlerSpriteCallbackDummy = (runtime: LinkPartnerRuntime): void => {
  if (runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]].callback === 'SpriteCallbackDummy') complete(runtime);
};

export const FreeTrainerSpriteAfterSlide = (runtime: LinkPartnerRuntime): void => {
  const id = runtime.gBattlerSpriteIds[runtime.gActiveBattler];
  if (runtime.gSprites[id].callback === 'SpriteCallbackDummy') {
    runtime.operations.push('BattleGfxSfxDummy3:MALE', `FreeSpriteOamMatrix:${id}`);
    destroySprite(runtime, id);
    complete(runtime);
  }
};

export const Intro_DelayAndEnd = (runtime: LinkPartnerRuntime): void => {
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler];
  hb.introEndDelay = (hb.introEndDelay - 1) & 0xff;
  if (hb.introEndDelay === 0xff) {
    hb.introEndDelay = 0;
    complete(runtime);
  }
};

export const Intro_WaitForHealthbox = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  let finished = false;
  if (!runtime.isDoubleBattle || (runtime.isDoubleBattle && (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI))) {
    finished = runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy';
  } else {
    finished =
      runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy' &&
      runtime.gSprites[runtime.gHealthboxSpriteIds[b ^ BIT_FLANK]].callback === 'SpriteCallbackDummy';
  }
  if (runtime.cryPlaying) finished = false;
  if (finished) {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay = 3;
    runtime.gBattlerControllerFuncs[b] = 'Intro_DelayAndEnd';
  }
};

export const Intro_ShowHealthbox = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].ballAnimActive && !runtime.gBattleSpritesDataPtr.healthBoxesData[b ^ BIT_FLANK].ballAnimActive) {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay++;
    if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay !== 1) {
      runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay = 0;
      if (runtime.isDoubleBattle && !(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
        destroySprite(runtime, runtime.gBattleControllerData[b ^ BIT_FLANK]);
        runtime.operations.push(`UpdateHealthboxAttribute:${b ^ BIT_FLANK}:${HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b ^ BIT_FLANK}`, `SetHealthboxSpriteVisible:${b ^ BIT_FLANK}`);
      }
      destroySprite(runtime, runtime.gBattleControllerData[b]);
      runtime.operations.push(`UpdateHealthboxAttribute:${b}:${HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`);
      runtime.gBattleSpritesDataPtr.animationData.introAnimActive = false;
      runtime.gBattlerControllerFuncs[b] = 'Intro_WaitForHealthbox';
    }
  }
};

export const WaitForMonAnimAfterLoad = (runtime: LinkPartnerRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]];
  if (sprite.animEnded && sprite.x2 === 0) complete(runtime);
};

export const CompleteOnHealthbarDone = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hp = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${b}`, `SetHealthboxSpriteVisible:${b}`);
  if (hp !== -1) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:${hp}:${HP_CURRENT}`);
  else {
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    complete(runtime);
  }
};

export const FreeMonSpriteAfterFaintAnim = (runtime: LinkPartnerRuntime): void => {
  const id = runtime.gBattlerSpriteIds[runtime.gActiveBattler];
  const sprite = runtime.gSprites[id];
  if (sprite.y + sprite.y2 > DISPLAY_HEIGHT) {
    runtime.operations.push(`FreeOamMatrix:${sprite.oam.matrixNum}`);
    destroySprite(runtime, id);
    runtime.operations.push(`SetHealthboxSpriteInvisible:${runtime.gActiveBattler}`);
    complete(runtime);
  }
};

export const FreeMonSpriteAfterSwitchOutAnim = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].specialAnimActive) {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const DoSwitchOutAnimation = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  switch (hb.animationState) {
    case 0:
      if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
      hb.animationState = 1;
      break;
    case 1:
      if (!hb.specialAnimActive) {
        hb.animationState = 0;
        runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_SWITCH_OUT_PLAYER_MON}`);
        runtime.gBattlerControllerFuncs[b] = 'FreeMonSpriteAfterSwitchOutAnim';
      }
      break;
  }
};

export const CompleteOnFinishedStatusAnimation = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].statusAnimActive) complete(runtime);
};

export const CompleteOnFinishedBattleAnimation = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].animFromTableActive) complete(runtime);
};

export const CompleteOnInactiveTextPrinter = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.textPrinterActive) complete(runtime);
};

export const DoHitAnimBlinkSpriteEffect = (runtime: LinkPartnerRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]];
  if (sprite.data[1] === 32) {
    sprite.data[1] = 0;
    sprite.invisible = false;
    runtime.gDoingBattleAnim = false;
    complete(runtime);
  } else {
    if (sprite.data[1] % 4 === 0) sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
  }
};

export const SwitchIn_ShowSubstitute = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy') {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_MON_TO_SUBSTITUTE}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_WaitAndEnd';
  }
};

export const SwitchIn_WaitAndEnd = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].specialAnimActive) complete(runtime);
};

export const SwitchIn_ShowHealthbox = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.finishedShinyMonAnim) {
    hb.triedShinyMonAnim = false;
    hb.finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS', 'CreateTask:Task_PlayerController_RestoreBgmAfterCry:10');
    runtime.operations.push(`HandleLowHpMusicChange:${b}`, `StartSpriteAnim:${runtime.gBattlerSpriteIds[b]}:0`, `UpdateHealthboxAttribute:${b}:${HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`, `CopyBattleSpriteInvisibility:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_ShowSubstitute';
  }
};

export const SwitchIn_TryShinyAnim = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (!hb.triedShinyMonAnim && !hb.ballAnimActive) runtime.operations.push(`TryShinyAnimation:${b}`);
  if (runtime.gSprites[runtime.gBattleControllerData[b]].callback === 'SpriteCallbackDummy' && !hb.ballAnimActive) {
    destroySprite(runtime, runtime.gBattleControllerData[b]);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_ShowHealthbox';
  }
};

export const LinkPartnerHandleGetMonData = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const data: number[] = [];
  if (runtime.gBattleBufferA[b][2] === 0) data.push(...CopyLinkPartnerMonData(runtime, runtime.gBattlerPartyIndexes[b]));
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) data.push(...CopyLinkPartnerMonData(runtime, i));
      mask >>= 1;
    }
  }
  runtime.emittedTransfers.push({ buffer: 'B', size: data.length, data });
  complete(runtime);
};

export const SetLinkPartnerMonData = (runtime: LinkPartnerRuntime, monId: number): void => {
  const b = runtime.gActiveBattler;
  const request = runtime.gBattleBufferA[b][1];
  const buf = runtime.gBattleBufferA[b];
  const mon = runtime.gPlayerParty[monId];
  const set16 = (key: keyof LinkPartnerMon): void => {
    (mon as unknown as Record<string, number>)[key] = u16(buf[3], buf[4]);
  };
  const set32 = (key: keyof LinkPartnerMon): void => {
    (mon as unknown as Record<string, number>)[key] = u32(buf[3], buf[4], buf[5], buf[6]);
  };
  switch (request) {
    case REQUEST_ALL_BATTLE: {
      let pos = 3;
      const read32 = (): number => {
        const value = u32(buf[pos], buf[pos + 1], buf[pos + 2], buf[pos + 3]);
        pos += 4;
        return value;
      };
      mon.species = read32();
      mon.item = read32();
      for (let i = 0; i < 4; i++) mon.moves[i] = read32();
      for (let i = 0; i < 4; i++) mon.pp[i] = read32();
      mon.ppBonuses = read32();
      mon.friendship = read32();
      mon.experience = read32();
      mon.hpIV = read32();
      mon.attackIV = read32();
      mon.defenseIV = read32();
      mon.speedIV = read32();
      mon.spAttackIV = read32();
      mon.spDefenseIV = read32();
      mon.personality = read32();
      mon.status1 = read32();
      mon.level = read32();
      mon.hp = read32();
      mon.maxHP = read32();
      mon.attack = read32();
      mon.defense = read32();
      mon.speed = read32();
      mon.spAttack = read32();
      mon.spDefense = read32();
      break;
    }
    case REQUEST_SPECIES_BATTLE:
      set16('species');
      break;
    case REQUEST_HELDITEM_BATTLE:
      set16('item');
      break;
    case REQUEST_MOVES_PP_BATTLE:
      for (let i = 0; i < 4; i++) mon.moves[i] = u16(buf[3 + i * 2], buf[4 + i * 2]);
      for (let i = 0; i < 4; i++) mon.pp[i] = buf[11 + i];
      mon.ppBonuses = buf[15];
      break;
    case REQUEST_PP_DATA_BATTLE:
      for (let i = 0; i < 4; i++) mon.pp[i] = buf[3 + i];
      mon.ppBonuses = buf[7];
      break;
    case REQUEST_PERSONALITY_BATTLE:
      set32('personality');
      break;
    case REQUEST_STATUS_BATTLE:
      set32('status1');
      break;
    case REQUEST_OTID_BATTLE:
      mon.otId = u32(buf[3], buf[4], buf[5], 0);
      break;
    case REQUEST_EXP_BATTLE:
      mon.experience = u32(buf[3], buf[4], buf[5], 0);
      break;
    case REQUEST_ALL_IVS_BATTLE:
      mon.hpIV = buf[3];
      mon.attackIV = buf[4];
      mon.defenseIV = buf[5];
      mon.speedIV = buf[6];
      mon.spAttackIV = buf[7];
      mon.spDefenseIV = buf[8];
      break;
    case REQUEST_CHECKSUM_BATTLE:
      set16('checksum');
      break;
    default: {
      const scalarFields: Record<number, keyof LinkPartnerMon> = {
        [REQUEST_MOVE1_BATTLE]: 'moves',
        [REQUEST_MOVE2_BATTLE]: 'moves',
        [REQUEST_MOVE3_BATTLE]: 'moves',
        [REQUEST_MOVE4_BATTLE]: 'moves',
        [REQUEST_PPMOVE1_BATTLE]: 'pp',
        [REQUEST_PPMOVE2_BATTLE]: 'pp',
        [REQUEST_PPMOVE3_BATTLE]: 'pp',
        [REQUEST_PPMOVE4_BATTLE]: 'pp',
        [REQUEST_HP_BATTLE]: 'hp',
        [REQUEST_MAX_HP_BATTLE]: 'maxHP',
        [REQUEST_ATK_BATTLE]: 'attack',
        [REQUEST_DEF_BATTLE]: 'defense',
        [REQUEST_SPEED_BATTLE]: 'speed',
        [REQUEST_SPATK_BATTLE]: 'spAttack',
        [REQUEST_SPDEF_BATTLE]: 'spDefense',
        [REQUEST_LEVEL_BATTLE]: 'level',
        [REQUEST_HP_EV_BATTLE]: 'hpEV',
        [REQUEST_ATK_EV_BATTLE]: 'attackEV',
        [REQUEST_DEF_EV_BATTLE]: 'defenseEV',
        [REQUEST_SPEED_EV_BATTLE]: 'speedEV',
        [REQUEST_SPATK_EV_BATTLE]: 'spAttackEV',
        [REQUEST_SPDEF_EV_BATTLE]: 'spDefenseEV',
        [REQUEST_FRIENDSHIP_BATTLE]: 'friendship',
        [REQUEST_POKERUS_BATTLE]: 'pokerus',
        [REQUEST_MET_LOCATION_BATTLE]: 'metLocation',
        [REQUEST_MET_LEVEL_BATTLE]: 'metLevel',
        [REQUEST_MET_GAME_BATTLE]: 'metGame',
        [REQUEST_POKEBALL_BATTLE]: 'pokeball',
        [REQUEST_HP_IV_BATTLE]: 'hpIV',
        [REQUEST_ATK_IV_BATTLE]: 'attackIV',
        [REQUEST_DEF_IV_BATTLE]: 'defenseIV',
        [REQUEST_SPEED_IV_BATTLE]: 'speedIV',
        [REQUEST_SPATK_IV_BATTLE]: 'spAttackIV',
        [REQUEST_SPDEF_IV_BATTLE]: 'spDefenseIV',
        [REQUEST_COOL_BATTLE]: 'cool',
        [REQUEST_BEAUTY_BATTLE]: 'beauty',
        [REQUEST_CUTE_BATTLE]: 'cute',
        [REQUEST_SMART_BATTLE]: 'smart',
        [REQUEST_TOUGH_BATTLE]: 'tough',
        [REQUEST_SHEEN_BATTLE]: 'sheen',
        [REQUEST_COOL_RIBBON_BATTLE]: 'coolRibbon',
        [REQUEST_BEAUTY_RIBBON_BATTLE]: 'beautyRibbon',
        [REQUEST_CUTE_RIBBON_BATTLE]: 'cuteRibbon',
        [REQUEST_SMART_RIBBON_BATTLE]: 'smartRibbon',
        [REQUEST_TOUGH_RIBBON_BATTLE]: 'toughRibbon'
      };
      const field = scalarFields[request];
      if (field === 'moves') mon.moves[request - REQUEST_MOVE1_BATTLE] = u16(buf[3], buf[4]);
      else if (field === 'pp') mon.pp[request - REQUEST_PPMOVE1_BATTLE] = buf[3];
      else if (field) {
        const twoByteFields = new Set<keyof LinkPartnerMon>(['hp', 'maxHP', 'attack', 'defense', 'speed', 'spAttack', 'spDefense']);
        (mon as unknown as Record<string, number>)[field] = twoByteFields.has(field) ? u16(buf[3], buf[4]) : buf[3];
      }
      break;
    }
  }
  runtime.operations.push(`HandleLowHpMusicChange:${runtime.gBattlerPartyIndexes[b]}:${b}`);
};

export const LinkPartnerHandleSetMonData = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][2] === 0) SetLinkPartnerMonData(runtime, runtime.gBattlerPartyIndexes[b]);
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) SetLinkPartnerMonData(runtime, i);
      mask >>= 1;
    }
  }
  complete(runtime);
};

export const LinkPartnerHandleSetRawMonData = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const mon = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]];
  const offset = runtime.gBattleBufferA[b][1];
  const size = runtime.gBattleBufferA[b][2];
  for (let i = 0; i < size; i++) mon.raw[offset + i] = runtime.gBattleBufferA[b][3 + i];
  complete(runtime);
};

export const StartSendOutAnim = (runtime: LinkPartnerRuntime, battlerId: number, dontClearSubstituteBit: number): void => {
  const species = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[battlerId]].species;
  runtime.operations.push(`ClearTemporarySpeciesSpriteData:${battlerId}:${dontClearSubstituteBit}`, `CreateInvisibleSpriteWithCallback:${battlerId}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${battlerId}`);
  const controllerSpriteId = runtime.gBattleControllerData[battlerId];
  const monSpriteId = runtime.gBattlerSpriteIds[battlerId];
  runtime.gSprites[controllerSpriteId].callback = 'SpriteCB_WaitForBattlerBallReleaseAnim';
  runtime.gSprites[controllerSpriteId].data[1] = monSpriteId;
  runtime.gSprites[monSpriteId] = { ...runtime.gSprites[monSpriteId], x: 80 + battlerId * 16, y: 80, data: Array.from({ length: 8 }, () => 0), invisible: true, callback: 'SpriteCallbackDummy' };
  runtime.gSprites[monSpriteId].data[0] = battlerId;
  runtime.gSprites[monSpriteId].data[2] = species;
  runtime.gSprites[monSpriteId].oam.paletteNum = battlerId;
  runtime.gSprites[monSpriteId].anim = runtime.gBattleMonForms[battlerId];
  runtime.gSprites[controllerSpriteId].data[0] = 1;
  runtime.operations.push(`DoPokeballSendOutAnimation:0:${POKEBALL_PLAYER_SENDOUT}`);
};

export const LinkPartnerHandleLoadMonSprite = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const species = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]].species;
  runtime.operations.push(`BattleLoadPlayerMonSpriteGfx:${b}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${b}`);
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].x2 = -DISPLAY_WIDTH;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[0] = b;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].oam.paletteNum = b;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].anim = runtime.gBattleMonForms[b];
  runtime.gBattlerControllerFuncs[b] = 'WaitForMonAnimAfterLoad';
};

export const LinkPartnerHandleSwitchInAnim = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerPartyIndexes[b] = runtime.gBattleBufferA[b][1];
  runtime.operations.push(`BattleLoadPlayerMonSpriteGfx:${b}`);
  StartSendOutAnim(runtime, b, runtime.gBattleBufferA[b][2]);
  runtime.gBattlerControllerFuncs[b] = 'SwitchIn_TryShinyAnim';
};

export const LinkPartnerHandleReturnMonToBall = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] === 0) {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].animationState = 0;
    runtime.gBattlerControllerFuncs[b] = 'DoSwitchOutAnimation';
  } else {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const LinkPartnerHandleDrawTrainerPic = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const x = (b & BIT_FLANK) !== B_FLANK_LEFT ? 90 : 32;
  const link = runtime.gLinkPlayers[runtime.multiplayerId];
  const version = link.version & 0xff;
  const trainerPicId = version === VERSION_RUBY || version === VERSION_SAPPHIRE || version === VERSION_EMERALD ? link.gender + TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN : link.gender;
  const y = (8 - (runtime.gTrainerBackPicCoords[trainerPicId]?.size ?? 8)) * 4 + 80;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  sprite.x = x;
  sprite.y = y;
  sprite.x2 = DISPLAY_WIDTH;
  sprite.data[0] = -2;
  sprite.oam.paletteNum = b;
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.operations.push(`DecompressTrainerBackPalette:${trainerPicId}:${b}`, `SetMultiuseSpriteTemplateToTrainerBack:${trainerPicId}:${b}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpriteCallbackDummy';
};

export const LinkPartnerHandleTrainerSlideBack = (runtime: LinkPartnerRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]];
  sprite.data[0] = 35;
  sprite.data[2] = -40;
  sprite.data[4] = sprite.y;
  sprite.callback = 'StartAnimLinearTranslation';
  runtime.operations.push(`StoreSpriteCallbackInData6:${sprite.id}:SpriteCallbackDummy`);
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'FreeTrainerSpriteAfterSlide';
};

export const LinkPartnerHandleMoveAnimation = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.battleSEPlaying) {
    const move = u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]);
    runtime.gAnimMoveTurn = runtime.gBattleBufferA[b][3];
    runtime.gAnimMovePower = u16(runtime.gBattleBufferA[b][4], runtime.gBattleBufferA[b][5]);
    runtime.gAnimMoveDmg = u32(runtime.gBattleBufferA[b][6], runtime.gBattleBufferA[b][7], runtime.gBattleBufferA[b][8], runtime.gBattleBufferA[b][9]);
    runtime.gAnimFriendship = runtime.gBattleBufferA[b][10];
    runtime.gWeatherMoveAnim = u16(runtime.gBattleBufferA[b][12], runtime.gBattleBufferA[b][13]);
    runtime.gTransformedPersonalities[b] = u32(runtime.gBattleBufferA[b][16], runtime.gBattleBufferA[b][17], runtime.gBattleBufferA[b][18], runtime.gBattleBufferA[b][19]);
    runtime.operations.push(`IsMoveWithoutAnimation:${move}:${runtime.gAnimMoveTurn}`);
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].animationState = 0;
    runtime.gBattlerControllerFuncs[b] = 'LinkPartnerDoMoveAnimation';
  }
};

export const LinkPartnerDoMoveAnimation = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  const move = u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]);
  const multihit = runtime.gBattleBufferA[b][11];
  switch (hb.animationState) {
    case 0:
      if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute && !runtime.gBattleSpritesDataPtr.battlerData[b].flag_x8) {
        runtime.gBattleSpritesDataPtr.battlerData[b].flag_x8 = true;
        runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
      }
      hb.animationState = 1;
      break;
    case 1:
      if (!hb.specialAnimActive) {
        runtime.operations.push('SetBattlerSpriteAffineMode:OFF', `DoMoveAnim:${move}`);
        hb.animationState = 2;
      }
      break;
    case 2:
      runtime.operations.push('gAnimScriptCallback');
      if (!runtime.gAnimScriptActive) {
        runtime.operations.push('SetBattlerSpriteAffineMode:NORMAL');
        if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute && multihit < 2) {
          runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_MON_TO_SUBSTITUTE}`);
          runtime.gBattleSpritesDataPtr.battlerData[b].flag_x8 = false;
        }
        hb.animationState = 3;
      }
      break;
    case 3:
      if (!hb.specialAnimActive) {
        runtime.operations.push('CopyAllBattleSpritesInvisibilities', `TrySetBehindSubstituteSpriteBit:${b}:${move}`);
        hb.animationState = 0;
        complete(runtime);
      }
      break;
  }
};

export const LinkPartnerHandlePrintString = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  const stringId = u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3]);
  runtime.gDisplayedStringBattle = `BattleString:${stringId}`;
  runtime.operations.push(`BufferStringBattle:${stringId}`, `BattlePutTextOnWindow:${stringId}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnInactiveTextPrinter';
};

export const LinkPartnerHandleHealthBarUpdate = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hpVal = u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3]);
  const mon = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]];
  runtime.operations.push('LoadBattleBarGfx:0', `SetBattleBarStruct:${b}:${mon.maxHP}:${hpVal !== INSTANT_HP_BAR_DROP ? mon.hp : 0}:${hpVal}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnHealthbarDone';
};

export const LinkPartnerHandleHitAnimation = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (sprite.invisible) complete(runtime);
  else {
    runtime.gDoingBattleAnim = true;
    sprite.data[1] = 0;
    runtime.operations.push(`DoHitAnimHealthboxEffect:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'DoHitAnimBlinkSpriteEffect';
  }
};

export const LinkPartnerHandleEndLinkBattle = (runtime: LinkPartnerRuntime): void => {
  runtime.gBattleOutcome = runtime.gBattleBufferA[runtime.gActiveBattler][1];
  runtime.operations.push('FadeOutMapMusic:5', 'BeginFastPaletteFade:3');
  complete(runtime);
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'SetBattleEndCallbacks';
};

export const LinkPartnerHandleGetRawMonData = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleTrainerSlide = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandlePaletteFade = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleSuccessBallThrowAnim = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleBallThrowAnim = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandlePause = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandlePrintSelectionString = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleChooseAction = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleUnknownYesNoBox = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleChooseMove = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleChooseItem = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleChoosePokemon = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleCmd23 = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleExpUpdate = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleStatusXor = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleDataTransfer = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleDMA3Transfer = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandlePlayBGM = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleCmd32 = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleTwoReturnValues = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleChosenMonReturnValue = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleOneReturnValue = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleOneReturnValue_Duplicate = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleCantSwitch = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleEndBounceEffect = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleLinkStandbyMsg = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerHandleResetActionMoveSelection = (runtime: LinkPartnerRuntime): void => complete(runtime);
export const LinkPartnerCmdEnd = (_runtime: LinkPartnerRuntime): void => {};

export const LinkPartnerHandleFaintAnimation = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.animationState === 0) {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
    hb.animationState++;
  } else if (!hb.specialAnimActive) {
    hb.animationState = 0;
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    runtime.sounds.push({ kind: 'SE_PAN', id: SE_FAINT, pan: SOUND_PAN_ATTACKER });
    runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[1] = 0;
    runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[2] = 5;
    runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'SpriteCB_FaintSlideAnim';
    runtime.gBattlerControllerFuncs[b] = 'FreeMonSpriteAfterFaintAnim';
  }
};

export const LinkPartnerHandleStatusIconUpdate = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`UpdateHealthboxAttribute:${b}:${HEALTHBOX_STATUS_ICON}`);
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].statusAnimActive = false;
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};

export const LinkPartnerHandleStatusAnimation = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`InitAndLaunchChosenStatusAnimation:${runtime.gBattleBufferA[b][1]}:${u32(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3], runtime.gBattleBufferA[b][4], runtime.gBattleBufferA[b][5])}`);
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};

export const LinkPartnerHandleClearUnkVar = (runtime: LinkPartnerRuntime): void => {
  runtime.gUnusedControllerStruct.unk = 0;
  complete(runtime);
};
export const LinkPartnerHandleSetUnkVar = (runtime: LinkPartnerRuntime): void => {
  runtime.gUnusedControllerStruct.unk = runtime.gBattleBufferA[runtime.gActiveBattler][1];
  complete(runtime);
};
export const LinkPartnerHandleClearUnkFlag = (runtime: LinkPartnerRuntime): void => {
  runtime.gUnusedControllerStruct.flag = 0;
  complete(runtime);
};
export const LinkPartnerHandleToggleUnkFlag = (runtime: LinkPartnerRuntime): void => {
  runtime.gUnusedControllerStruct.flag ^= 1;
  complete(runtime);
};

export const LinkPartnerHandlePlaySE = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const pan = b % 2 === B_SIDE_PLAYER ? SOUND_PAN_ATTACKER : SOUND_PAN_TARGET;
  runtime.sounds.push({ kind: 'SE_PAN', id: u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]), pan });
  complete(runtime);
};
export const LinkPartnerHandlePlayFanfare = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'FANFARE', id: u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]) });
  complete(runtime);
};
export const LinkPartnerHandleFaintingCry = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'CRY', id: runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]].species, pan: SOUND_PAN_ATTACKER });
  runtime.operations.push(`PlayCry_ByMode:${CRY_MODE_FAINT}`);
  complete(runtime);
};
export const LinkPartnerHandleIntroSlide = (runtime: LinkPartnerRuntime): void => {
  runtime.operations.push(`HandleIntroSlide:${runtime.gBattleBufferA[runtime.gActiveBattler][1]}`);
  runtime.gIntroSlideFlags |= 1;
  complete(runtime);
};
export const LinkPartnerHandleIntroTrainerBallThrow = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[0] = 50;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[2] = -40;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[4] = runtime.gSprites[runtime.gBattlerSpriteIds[b]].y;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[5] = b;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'StartAnimLinearTranslation';
  const taskId = createTask(runtime, 'Task_StartSendOutAnim', 5);
  runtime.gTasks[taskId].data[0] = b;
  runtime.gBattleSpritesDataPtr.animationData.introAnimActive = true;
  runtime.gBattlerControllerFuncs[b] = 'LinkPartnerDummy';
};
export const Task_StartSendOutAnim = (runtime: LinkPartnerRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  if (task.data[1] < 24) task.data[1]++;
  else {
    const saved = runtime.gActiveBattler;
    runtime.gActiveBattler = task.data[0];
    runtime.gBattleBufferA[runtime.gActiveBattler][1] = runtime.gBattlerPartyIndexes[runtime.gActiveBattler];
    StartSendOutAnim(runtime, runtime.gActiveBattler, 0);
    runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'Intro_ShowHealthbox';
    runtime.gActiveBattler = saved;
    task.destroyed = true;
    runtime.operations.push(`DestroyTask:${taskId}`);
  }
};
export const LinkPartnerHandleDrawPartyStatusSummary = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] !== 0 && b % 2 === B_SIDE_PLAYER) complete(runtime);
  else {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown = true;
    runtime.gBattlerStatusSummaryTaskId[b] = createTask(runtime, 'CreatePartyStatusSummarySprites', 0);
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusDelayTimer = runtime.gBattleBufferA[b][2] !== 0 ? 93 : 0;
    runtime.gBattlerControllerFuncs[b] = 'EndDrawPartyStatusSummary';
  }
};
export const EndDrawPartyStatusSummary = (runtime: LinkPartnerRuntime): void => {
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler];
  if (hb.partyStatusDelayTimer++ > 92) {
    hb.partyStatusDelayTimer = 0;
    complete(runtime);
  }
};
export const LinkPartnerHandleHidePartyStatusSummary = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown) runtime.gTasks[runtime.gBattlerStatusSummaryTaskId[b]].func = 'Task_HidePartyStatusSummary';
  complete(runtime);
};
export const LinkPartnerHandleSpriteInvisibility = (runtime: LinkPartnerRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (sprite) {
    sprite.invisible = !!runtime.gBattleBufferA[b][1];
    runtime.operations.push(`CopyBattleSpriteInvisibility:${b}`);
  }
  complete(runtime);
};
export const LinkPartnerHandleBattleAnimation = (runtime: LinkPartnerRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`TryHandleLaunchBattleTableAnimation:${b}:${runtime.gBattleBufferA[b][1]}:${u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3])}`);
    if (runtime.tryHandleBattleAnimationResult) complete(runtime);
    else runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedBattleAnimation';
  }
};

export const sLinkPartnerBufferCommands: Array<((runtime: LinkPartnerRuntime) => void) | undefined> = [
  LinkPartnerHandleGetMonData,
  LinkPartnerHandleGetRawMonData,
  LinkPartnerHandleSetMonData,
  LinkPartnerHandleSetRawMonData,
  LinkPartnerHandleLoadMonSprite,
  LinkPartnerHandleSwitchInAnim,
  LinkPartnerHandleReturnMonToBall,
  LinkPartnerHandleDrawTrainerPic,
  LinkPartnerHandleTrainerSlide,
  LinkPartnerHandleTrainerSlideBack,
  LinkPartnerHandleFaintAnimation,
  LinkPartnerHandlePaletteFade,
  LinkPartnerHandleSuccessBallThrowAnim,
  LinkPartnerHandleBallThrowAnim,
  LinkPartnerHandlePause,
  LinkPartnerHandleMoveAnimation,
  LinkPartnerHandlePrintString,
  LinkPartnerHandlePrintSelectionString,
  LinkPartnerHandleChooseAction,
  LinkPartnerHandleUnknownYesNoBox,
  LinkPartnerHandleChooseMove,
  LinkPartnerHandleChooseItem,
  LinkPartnerHandleChoosePokemon,
  LinkPartnerHandleCmd23,
  LinkPartnerHandleHealthBarUpdate,
  LinkPartnerHandleExpUpdate,
  LinkPartnerHandleStatusIconUpdate,
  LinkPartnerHandleStatusAnimation,
  LinkPartnerHandleStatusXor,
  LinkPartnerHandleDataTransfer,
  LinkPartnerHandleDMA3Transfer,
  LinkPartnerHandlePlayBGM,
  LinkPartnerHandleCmd32,
  LinkPartnerHandleTwoReturnValues,
  LinkPartnerHandleChosenMonReturnValue,
  LinkPartnerHandleOneReturnValue,
  LinkPartnerHandleOneReturnValue_Duplicate,
  LinkPartnerHandleClearUnkVar,
  LinkPartnerHandleSetUnkVar,
  LinkPartnerHandleClearUnkFlag,
  LinkPartnerHandleToggleUnkFlag,
  LinkPartnerHandleHitAnimation,
  LinkPartnerHandleCantSwitch,
  LinkPartnerHandlePlaySE,
  LinkPartnerHandlePlayFanfare,
  LinkPartnerHandleFaintingCry,
  LinkPartnerHandleIntroSlide,
  LinkPartnerHandleIntroTrainerBallThrow,
  LinkPartnerHandleDrawPartyStatusSummary,
  LinkPartnerHandleHidePartyStatusSummary,
  LinkPartnerHandleEndBounceEffect,
  LinkPartnerHandleSpriteInvisibility,
  LinkPartnerHandleBattleAnimation,
  LinkPartnerHandleLinkStandbyMsg,
  LinkPartnerHandleResetActionMoveSelection,
  LinkPartnerHandleEndLinkBattle,
  LinkPartnerCmdEnd
];

export const callLinkPartnerControllerFunc = (runtime: LinkPartnerRuntime, func: LinkPartnerControllerFunc): void => {
  switch (func) {
    case 'LinkPartnerBufferRunCommand':
      LinkPartnerBufferRunCommand(runtime);
      break;
    case 'CompleteOnBattlerSpriteCallbackDummy':
      CompleteOnBattlerSpriteCallbackDummy(runtime);
      break;
    case 'FreeTrainerSpriteAfterSlide':
      FreeTrainerSpriteAfterSlide(runtime);
      break;
    case 'Intro_DelayAndEnd':
      Intro_DelayAndEnd(runtime);
      break;
    case 'Intro_WaitForHealthbox':
      Intro_WaitForHealthbox(runtime);
      break;
    case 'Intro_ShowHealthbox':
      Intro_ShowHealthbox(runtime);
      break;
    case 'WaitForMonAnimAfterLoad':
      WaitForMonAnimAfterLoad(runtime);
      break;
    case 'CompleteOnHealthbarDone':
      CompleteOnHealthbarDone(runtime);
      break;
    case 'FreeMonSpriteAfterFaintAnim':
      FreeMonSpriteAfterFaintAnim(runtime);
      break;
    case 'DoSwitchOutAnimation':
      DoSwitchOutAnimation(runtime);
      break;
    case 'FreeMonSpriteAfterSwitchOutAnim':
      FreeMonSpriteAfterSwitchOutAnim(runtime);
      break;
    case 'CompleteOnFinishedStatusAnimation':
      CompleteOnFinishedStatusAnimation(runtime);
      break;
    case 'CompleteOnFinishedBattleAnimation':
      CompleteOnFinishedBattleAnimation(runtime);
      break;
    case 'CompleteOnInactiveTextPrinter':
      CompleteOnInactiveTextPrinter(runtime);
      break;
    case 'DoHitAnimBlinkSpriteEffect':
      DoHitAnimBlinkSpriteEffect(runtime);
      break;
    case 'SwitchIn_ShowSubstitute':
      SwitchIn_ShowSubstitute(runtime);
      break;
    case 'SwitchIn_WaitAndEnd':
      SwitchIn_WaitAndEnd(runtime);
      break;
    case 'SwitchIn_ShowHealthbox':
      SwitchIn_ShowHealthbox(runtime);
      break;
    case 'SwitchIn_TryShinyAnim':
      SwitchIn_TryShinyAnim(runtime);
      break;
    case 'LinkPartnerDoMoveAnimation':
      LinkPartnerDoMoveAnimation(runtime);
      break;
    case 'EndDrawPartyStatusSummary':
      EndDrawPartyStatusSummary(runtime);
      break;
    case 'LinkPartnerDummy':
      LinkPartnerDummy(runtime);
      break;
    case 'SetBattleEndCallbacks':
      break;
  }
};
