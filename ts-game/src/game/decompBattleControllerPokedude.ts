import * as Partner from './decompBattleControllerLinkPartner';
import pokedudeTextSource from '../../../data/text/pokedude.inc?raw';
import {
  B_ACTION_SWITCH,
  B_ACTION_USE_ITEM,
  B_ACTION_USE_MOVE,
  B_SIDE_PLAYER,
  BATTLE_TYPE_IS_MASTER,
  BATTLE_TYPE_LINK_REAL
} from './decompBattleControllerOakOldMan';

export * from './decompBattleControllerOakOldMan';

export const TTVSCR_BATTLE = 0;
export const TTVSCR_STATUS = 1;
export const TTVSCR_MATCHUPS = 2;
export const TTVSCR_CATCHING = 3;
export const B_SIDE_OPPONENT = 1;
export const B_ACTION_RUN = 3;
export const B_ACTION_EXEC_SCRIPT = 10;
export const BIT_SIDE = 1;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const STRINGID_USEDMOVE = 4;
export const STRINGID_PKMNGAINEDEXP = 13;
export const STRINGID_PKMNFASTASLEEP = 107;
export const SPECIES_BUTTERFREE = 12;
export const SPECIES_PIDGEY = 16;
export const SPECIES_RATTATA = 19;
export const SPECIES_JIGGLYPUFF = 39;
export const SPECIES_ODDISH = 43;
export const SPECIES_POLIWAG = 60;
export const MOVE_POUND = 1;
export const MOVE_GUST = 16;
export const MOVE_SAND_ATTACK = 28;
export const MOVE_TACKLE = 33;
export const MOVE_TAIL_WHIP = 39;
export const MOVE_SING = 47;
export const MOVE_WATER_GUN = 55;
export const MOVE_ABSORB = 71;
export const MOVE_POISON_POWDER = 77;
export const MOVE_STUN_SPORE = 78;
export const MOVE_SLEEP_POWDER = 79;
export const MOVE_CONFUSION = 93;
export const MOVE_HYPNOSIS = 95;
export const MOVE_QUICK_ATTACK = 98;
export const MOVE_DEFENSE_CURL = 111;
export const MOVE_BUBBLE = 145;
export const MOVE_HYPER_FANG = 158;
export const MOVE_SWEET_SCENT = 230;
export const NATURE_LONELY = 1;
export const NATURE_NAUGHTY = 4;
export const NATURE_RASH = 19;
export const NATURE_CAREFUL = 23;
export const MALE = 0;

type PokedudeControllerFunc =
  | 'PokedudeBufferRunCommand'
  | 'PokedudeDummy'
  | 'Pokedude_SetBattleEndCallbacks'
  | 'CompleteOnBattlerSpriteCallbackDummy'
  | 'CompleteOnBattlerSpritePosX_0'
  | 'CompleteOnBattlerSpriteCallbackDummy2'
  | 'PokedudeAction_PrintVoiceoverMessage'
  | 'PokedudeAction_PrintMessageWithHealthboxPals'
  | 'HandleChooseActionAfterDma3'
  | 'HandleInputChooseAction'
  | 'PokedudeHandleChooseMoveAfterDma3'
  | 'PokedudeHandleInputChooseMove'
  | 'OpenBagAndChooseItem'
  | 'CompleteWhenChoseItem'
  | 'OpenPartyMenuToChooseMon'
  | 'WaitForMonSelection'
  | 'CompleteOnInactiveTextPrinter'
  | 'CompleteOnInactiveTextPrinter2'
  | 'CompleteOnHealthbarDone'
  | 'CompleteOnFinishedStatusAnimation'
  | 'CompleteOnFinishedBattleAnimation'
  | 'CompleteOnSpecialAnimDone'
  | 'FreeMonSpriteAfterFaintAnim'
  | 'DoHitAnimBlinkSpriteEffect'
  | 'DoSwitchOutAnimation'
  | 'PokedudeDoMoveAnimation'
  | 'SwitchIn_TryShinyAnimShowHealthbox'
  | 'SwitchIn_CleanShinyAnimShowSubstitute'
  | 'SwitchIn_HandleSoundAndEnd'
  | 'Intro_TryShinyAnimShowHealthbox'
  | 'Intro_WaitForShinyAnimAndHealthbox'
  | 'Intro_DelayAndEnd';

type PokedudeMonWithExpBounds = Partner.LinkPartnerMon & {
  currentLevelExp?: number;
  nextLevelExp?: number;
};

type PokedudeScriptStep = { cursorPos: number[]; delay: number[] };
type PokedudeTextHeader = { btlcmd: number; side: number; stringid?: number; callback: PokedudeControllerFunc | null };

export interface PokedudeTextEntry {
  symbol: string;
  text: string;
}

export interface PokedudeBattlerState {
  timer: number;
  action_idx: number;
  move_idx: number;
  msg_idx: number;
  saved_bg0y: number;
}

export interface PokedudeRuntime extends Omit<Partner.LinkPartnerRuntime, 'gBattlerControllerFuncs'> {
  gBattlerControllerFuncs: PokedudeControllerFunc[];
  gActionSelectionCursor: number[];
  gMoveSelectionCursor: number[];
  gBattlePartyCurrentOrder: number[];
  gBattleControllerData: number[];
  gBattlerInMenuId: number;
  gSelectedMonPartyId: number;
  gPartyMenuUseExitCallback: boolean;
  gEnemyParty: Partner.LinkPartnerMon[];
  gSpecialVar_0x8004: number;
  gSpecialVar_ItemId: number;
  gBattleStruct: {
    pdHealthboxPal1: number;
    pdHealthboxPal2: number;
    pdScriptNum: number;
    pdMessageNo: number;
    battlerPreventingSwitchout: number;
    playerPartyIdx: number;
    abilityPreventingSwitchout: number;
  };
  gPokedudeBattlerStates: PokedudeBattlerState[];
  gMain: { callback2: string; inBattle: number; callback1: string; savedCallback: string; preBattleCallback1: string };
  paletteFadeActive: boolean;
  dma3Busy: boolean;
  battlerSides: number[];
  tryHandleBattleAnimationResult: boolean;
  emittedControllerValues: Array<{ cmd: number; bufferId: number; data: number[] }>;
}

const state = (): PokedudeBattlerState => ({ timer: 0, action_idx: 0, move_idx: 0, msg_idx: 0, saved_bg0y: 0 });

export const createPokedudeRuntime = (overrides: Partial<PokedudeRuntime> = {}): PokedudeRuntime => {
  const base = Partner.createLinkPartnerRuntime({
    gActiveBattler: 0,
    gBattleControllerExecFlags: 1,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'PokedudeBufferRunCommand' as Partner.LinkPartnerControllerFunc)
  });
  return {
    ...base,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'PokedudeBufferRunCommand'),
    gActionSelectionCursor: [0, 0, 0, 0],
    gMoveSelectionCursor: [0, 0, 0, 0],
    gBattlePartyCurrentOrder: [0, 1, 2],
    gBattleControllerData: [8, 9, 10, 11],
    gBattlerInMenuId: 0,
    gSelectedMonPartyId: 6,
    gPartyMenuUseExitCallback: false,
    gEnemyParty: Array.from({ length: 6 }, (_, i) => Partner.createLinkPartnerMon({ species: i + 101 })),
    gSpecialVar_0x8004: TTVSCR_BATTLE,
    gSpecialVar_ItemId: 0,
    gBattleStruct: {
      pdHealthboxPal1: 0,
      pdHealthboxPal2: 0,
      pdScriptNum: TTVSCR_BATTLE,
      pdMessageNo: 0,
      battlerPreventingSwitchout: 0,
      playerPartyIdx: 0,
      abilityPreventingSwitchout: 0
    },
    gPokedudeBattlerStates: Array.from({ length: 4 }, state),
    gMain: { callback2: 'BattleMainCB2', inBattle: 1, callback1: '', savedCallback: 'SavedCallback', preBattleCallback1: 'PreBattleCallback1' },
    paletteFadeActive: false,
    dma3Busy: false,
    battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
    tryHandleBattleAnimationResult: true,
    emittedControllerValues: [],
    ...overrides
  };
};

const u16 = (buf: number[], at: number): number => (buf[at] ?? 0) | ((buf[at + 1] ?? 0) << 8);
const u32 = (buf: number[], at: number): number => ((buf[at] ?? 0) | ((buf[at + 1] ?? 0) << 8) | ((buf[at + 2] ?? 0) << 16) | ((buf[at + 3] ?? 0) << 24)) >>> 0;
const lo = (v: number): number => v & 0xff;
const hi = (v: number): number => (v >>> 8) & 0xff;
const asPartner = (runtime: PokedudeRuntime): Partner.LinkPartnerRuntime => runtime as unknown as Partner.LinkPartnerRuntime;
const side = (runtime: PokedudeRuntime): number => runtime.battlerSides[runtime.gActiveBattler] ?? B_SIDE_PLAYER;
const activeState = (runtime: PokedudeRuntime): PokedudeBattlerState => runtime.gPokedudeBattlerStates[runtime.gActiveBattler];
const monParty = (runtime: PokedudeRuntime): Partner.LinkPartnerMon[] => side(runtime) === B_SIDE_PLAYER ? runtime.gPlayerParty : runtime.gEnemyParty;
const activeMon = (runtime: PokedudeRuntime): Partner.LinkPartnerMon => monParty(runtime)[runtime.gBattlerPartyIndexes[runtime.gActiveBattler]];

const createTask = (runtime: PokedudeRuntime, func: string, priority: number): number => {
  const id = runtime.gTasks.length;
  runtime.gTasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${func}:${priority}:${id}`);
  return id;
};

const destroySprite = (runtime: PokedudeRuntime, id: number): void => {
  runtime.gSprites[id].callback = 'Destroyed';
  runtime.operations.push(`DestroySprite:${id}`);
};

const destroyTask = (runtime: PokedudeRuntime, taskId: number): void => {
  runtime.gTasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};

const currentLevelExp = (mon: PokedudeMonWithExpBounds): number => mon.currentLevelExp ?? Math.max(0, mon.level * mon.level * mon.level);
const nextLevelExp = (mon: PokedudeMonWithExpBounds): number => mon.nextLevelExp ?? Math.max(mon.experience + 1, (mon.level + 1) * (mon.level + 1) * (mon.level + 1));

const grantExpAndMaybeLevel = (runtime: PokedudeRuntime, monId: number, gainedExp: number, battlerId: number): boolean => {
  const mon = runtime.gPlayerParty[monId] as PokedudeMonWithExpBounds;
  const nextExp = nextLevelExp(mon);
  const currExp = mon.experience;
  if (currExp + gainedExp >= nextExp) {
    mon.experience = nextExp;
    mon.level++;
    runtime.operations.push(`CalculateMonStats:${monId}`);
    const remaining = gainedExp - (nextExp - currExp);
    const saved = runtime.gActiveBattler;
    runtime.gActiveBattler = battlerId;
    emitTwo(runtime, 1, 1, remaining);
    runtime.gActiveBattler = saved;
    return true;
  }
  mon.experience = currExp + gainedExp;
  return false;
};

const emitTwo = (runtime: PokedudeRuntime, bufferId: number, value1: number, value2: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_TWORETURNVALUES, bufferId, data: [lo(value1), lo(value2), hi(value2)] });
};
const emitOne = (runtime: PokedudeRuntime, bufferId: number, value: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_ONERETURNVALUE, bufferId, data: [lo(value), hi(value), 0] });
};
const emitChosen = (runtime: PokedudeRuntime, bufferId: number, partyId: number): void => {
  runtime.emittedControllerValues.push({ cmd: Partner.CONTROLLER_CHOSENMONRETURNVALUE, bufferId, data: [lo(partyId), ...runtime.gBattlePartyCurrentOrder.map(lo)] });
};

const complete = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[b] = 'PokedudeBufferRunCommand';
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_REAL) {
    runtime.emittedTransfers.push({ buffer: 'link', size: 4, data: [runtime.multiplayerId & 0xff] });
    runtime.gBattleBufferA[b][0] = Partner.CONTROLLER_TERMINATOR_NOP;
  } else runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[b];
};

export const PokedudeBufferExecCompleted = complete;

export const PokedudeDummy = (_runtime: PokedudeRuntime): void => {};

export const ReturnFromPokedudeAction = (runtime: PokedudeRuntime): void => {
  activeState(runtime).timer = 0;
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeBufferRunCommand';
};

export const SetControllerToPokedude = (runtime: PokedudeRuntime): void => {
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeBufferRunCommand';
  runtime.gBattleStruct.pdScriptNum = runtime.gSpecialVar_0x8004;
  runtime.gBattleStruct.pdMessageNo = 0;
};

export const sInputScripts_ChooseAction: PokedudeScriptStep[][] = [
  [{ cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [4, 4], delay: [0, 0] }],
  [{ cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [1, 0], delay: [64, 0] }, { cursorPos: [0, 0], delay: [64, 0] }],
  [{ cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [2, 0], delay: [64, 0] }, { cursorPos: [0, 0], delay: [64, 0] }],
  [{ cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [1, 0], delay: [64, 0] }]
];

export const sInputScripts_ChooseMove: PokedudeScriptStep[][] = [
  [{ cursorPos: [2, 2], delay: [64, 0] }, { cursorPos: [255, 255], delay: [0, 0] }],
  [{ cursorPos: [2, 2], delay: [64, 0] }, { cursorPos: [2, 0], delay: [64, 0] }, { cursorPos: [2, 0], delay: [64, 0] }, { cursorPos: [255, 255], delay: [0, 0] }],
  [{ cursorPos: [2, 0], delay: [64, 0] }, { cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [0, 0], delay: [64, 0] }, { cursorPos: [255, 255], delay: [0, 0] }],
  [{ cursorPos: [0, 2], delay: [64, 0] }, { cursorPos: [2, 2], delay: [64, 0] }, { cursorPos: [255, 255], delay: [0, 0] }]
];

export const sPokedudeTextScripts: PokedudeTextHeader[][] = [
  [
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_OPPONENT, stringid: STRINGID_USEDMOVE, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_PLAYER, stringid: STRINGID_PKMNGAINEDEXP, callback: 'PokedudeAction_PrintVoiceoverMessage' }
  ],
  [
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: null },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintMessageWithHealthboxPals' },
    { btlcmd: Partner.CONTROLLER_OPENBAG, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_OPPONENT, stringid: STRINGID_USEDMOVE, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_PLAYER, stringid: STRINGID_PKMNGAINEDEXP, callback: 'PokedudeAction_PrintVoiceoverMessage' }
  ],
  [
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_OPPONENT, stringid: STRINGID_USEDMOVE, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEPOKEMON, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_OPPONENT, stringid: STRINGID_USEDMOVE, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEMOVE, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_PLAYER, stringid: STRINGID_PKMNGAINEDEXP, callback: 'PokedudeAction_PrintVoiceoverMessage' }
  ],
  [
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: null },
    { btlcmd: Partner.CONTROLLER_CHOOSEACTION, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_PRINTSTRING, side: B_SIDE_OPPONENT, stringid: STRINGID_PKMNFASTASLEEP, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_OPENBAG, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' },
    { btlcmd: Partner.CONTROLLER_ENDLINKBATTLE, side: B_SIDE_PLAYER, callback: 'PokedudeAction_PrintVoiceoverMessage' }
  ]
];

export const POKEDUDE_TEXT_SOURCE = pokedudeTextSource;

export const parsePokedudeText = (source: string): PokedudeTextEntry[] =>
  [...source.matchAll(/^(Pokedude_Text_\w+)::\n((?:\t\.string "[\s\S]*?"\n?)+)/gmu)].map((match) => ({
    symbol: match[1],
    text: [...match[2].matchAll(/\.string "([\s\S]*?)"/gu)].map((part) => part[1]).join('')
  }));

export const gPokedudeText = parsePokedudeText(pokedudeTextSource);

export const getPokedudeTextBySymbol = (symbol: string): string | undefined =>
  gPokedudeText.find((entry) => entry.symbol === symbol)?.text;

export const sPokedudeTexts_Battle = [
  'Pokedude_Text_SpeedierBattlerGoesFirst',
  'Pokedude_Text_MyRattataFasterThanPidgey',
  'Pokedude_Text_BattlersTakeTurnsAttacking',
  'Pokedude_Text_MyRattataWonGetsEXP'
] as const;

export const sPokedudeTexts_Status = [
  'Pokedude_Text_UhOhRattataPoisoned',
  'Pokedude_Text_UhOhRattataPoisoned',
  'Pokedude_Text_HealStatusRightAway',
  'Pokedude_Text_UsingItemTakesTurn',
  'Pokedude_Text_YayWeManagedToWin'
] as const;

export const sPokedudeTexts_TypeMatchup = [
  'Pokedude_Text_WaterNotVeryEffectiveAgainstGrass',
  'Pokedude_Text_GrassEffectiveAgainstWater',
  'Pokedude_Text_LetsTryShiftingMons',
  'Pokedude_Text_ShiftingUsesTurn',
  'Pokedude_Text_ButterfreeDoubleResistsGrass',
  'Pokedude_Text_ButterfreeGoodAgainstOddish',
  'Pokedude_Text_YeahWeWon'
] as const;

export const sPokedudeTexts_Catching = [
  'Pokedude_Text_WeakenMonBeforeCatching',
  'Pokedude_Text_WeakenMonBeforeCatching',
  'Pokedude_Text_BestIfTargetStatused',
  'Pokedude_Text_CantDoubleUpOnStatus',
  'Pokedude_Text_LetMeThrowBall',
  'Pokedude_Text_PickBestKindOfBall'
] as const;

export const sPokedudeTexts = [
  sPokedudeTexts_Battle,
  sPokedudeTexts_Status,
  sPokedudeTexts_TypeMatchup,
  sPokedudeTexts_Catching
] as const;

export const HandlePokedudeVoiceoverEtc = (runtime: PokedudeRuntime): boolean => {
  const header = sPokedudeTextScripts[runtime.gBattleStruct.pdScriptNum]?.[runtime.gBattleStruct.pdMessageNo];
  if (!header) return false;
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][0] !== header.btlcmd) return false;
  if (side(runtime) !== header.side) return false;
  if (runtime.gBattleBufferA[b][0] === Partner.CONTROLLER_PRINTSTRING && header.stringid !== u16(runtime.gBattleBufferA[b], 2)) return false;
  runtime.gBattleStruct.pdMessageNo++;
  if (header.callback == null) return false;
  runtime.gBattlerControllerFuncs[b] = header.callback;
  activeState(runtime).timer = 0;
  activeState(runtime).msg_idx = header.stringid ?? 0;
  return true;
};

export const PokedudeBufferRunCommand = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[b]) {
    if (!HandlePokedudeVoiceoverEtc(runtime)) {
      const handler = sPokedudeBufferCommands[runtime.gBattleBufferA[b][0]];
      if (handler) handler(runtime);
      else complete(runtime);
    }
  }
};

export const CopyPokedudeMonData = (runtime: PokedudeRuntime, monId: number): number[] => {
  const partner = asPartner(runtime);
  const saved = partner.gPlayerParty;
  partner.gPlayerParty = side(runtime) === B_SIDE_PLAYER ? runtime.gPlayerParty : (runtime as unknown as { gEnemyParty: Partner.LinkPartnerMon[] }).gEnemyParty;
  try {
    return Partner.CopyLinkPartnerMonData(partner, monId);
  } finally {
    partner.gPlayerParty = saved;
  }
};

export const PokedudeHandleGetMonData = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const data: number[] = [];
  if (runtime.gBattleBufferA[b][2] === 0) data.push(...CopyPokedudeMonData(runtime, runtime.gBattlerPartyIndexes[b]));
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) data.push(...CopyPokedudeMonData(runtime, i));
      mask >>= 1;
    }
  }
  runtime.emittedTransfers.push({ buffer: 'B', size: data.length, data });
  complete(runtime);
};

export const PokedudeSimulateInputChooseAction = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const script = sInputScripts_ChooseAction[runtime.gBattleStruct.pdScriptNum];
  const s = activeState(runtime);
  const step = script[s.action_idx];
  if (side(runtime) === B_SIDE_PLAYER) runtime.operations.push(`DoBounceEffect:${b}:BOUNCE_HEALTHBOX:7:1`, `DoBounceEffect:${b}:BOUNCE_MON:7:1`);
  if (step.delay[b] === s.timer) {
    if (side(runtime) === B_SIDE_PLAYER) runtime.operations.push('PlaySE:SE_SELECT');
    s.timer = 0;
    const action = [B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN][step.cursorPos[b]];
    if (action != null) emitTwo(runtime, 1, action, 0);
    complete(runtime);
    s.action_idx++;
    if (script[s.action_idx]?.cursorPos[b] === 4) s.action_idx = 0;
  } else {
    if (runtime.gActionSelectionCursor[b] !== step.cursorPos[b] && Math.trunc(step.delay[b] / 2) === s.timer) {
      runtime.operations.push('PlaySE:SE_SELECT', `ActionSelectionDestroyCursorAt:${runtime.gActionSelectionCursor[b]}`);
      runtime.gActionSelectionCursor[b] = step.cursorPos[b];
      runtime.operations.push(`ActionSelectionCreateCursorAt:${runtime.gActionSelectionCursor[b]}:0`);
    }
    s.timer++;
  }
};

export const PokedudeSimulateInputChooseMove = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const script = sInputScripts_ChooseMove[runtime.gBattleStruct.pdScriptNum];
  const s = activeState(runtime);
  const step = script[s.move_idx];
  if (step.delay[b] === s.timer) {
    if (side(runtime) === B_SIDE_PLAYER) runtime.operations.push('PlaySE:SE_SELECT');
    s.timer = 0;
    emitTwo(runtime, 1, B_ACTION_EXEC_SCRIPT, step.cursorPos[b] | ((b ^ BIT_SIDE) << 8));
    complete(runtime);
    s.move_idx++;
    if (script[s.move_idx]?.cursorPos[b] === 255) s.move_idx = 0;
  } else {
    if (step.cursorPos[b] !== runtime.gMoveSelectionCursor[b] && Math.trunc(step.delay[b] / 2) === s.timer) {
      runtime.operations.push('PlaySE:SE_SELECT', `MoveSelectionDestroyCursorAt:${runtime.gMoveSelectionCursor[b]}`);
      runtime.gMoveSelectionCursor[b] = step.cursorPos[b];
      runtime.operations.push(`MoveSelectionCreateCursorAt:${runtime.gMoveSelectionCursor[b]}:0`);
    }
    s.timer++;
  }
};

export const PokedudeAction_PrintVoiceoverMessage = (runtime: PokedudeRuntime, newKeys = 0): void => {
  const s = activeState(runtime);
  switch (s.timer) {
    case 0:
      if (!runtime.paletteFadeActive) { runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7F:4:0:8:RGB_BLACK'); s.timer++; }
      break;
    case 1:
      if (!runtime.paletteFadeActive) { s.saved_bg0y = runtime.gBattle_BG0_Y; runtime.operations.push('BtlCtrl_DrawVoiceoverMessageFrame'); s.timer++; }
      break;
    case 2:
      runtime.gBattle_BG0_Y = 0;
      runtime.operations.push(`BattleStringExpandPlaceholdersToDisplayedString:${GetPokedudeText(runtime)}`, 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
      s.timer++;
      break;
    case 3:
      if (!runtime.textPrinterActive && (newKeys & 1)) { runtime.operations.push('PlaySE:SE_SELECT', 'BeginNormalPaletteFade:0xFFFFFF7F:4:8:0:RGB_BLACK'); s.timer++; }
      break;
    case 4:
      if (!runtime.paletteFadeActive) {
        if (s.msg_idx === STRINGID_PKMNGAINEDEXP) runtime.operations.push('BattleStopLowHpSound', 'PlayBGM:MUS_VICTORY_WILD');
        runtime.gBattle_BG0_Y = s.saved_bg0y;
        runtime.operations.push('BtlCtrl_RemoveVoiceoverMessageFrame');
        s.timer = 0;
        runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeBufferRunCommand';
      }
      break;
  }
};

export const PokedudeAction_PrintMessageWithHealthboxPals = (runtime: PokedudeRuntime, newKeys = 0): void => {
  const s = activeState(runtime);
  switch (s.timer) {
    case 0:
      if (!runtime.paletteFadeActive) { runtime.operations.push('DoLoadHealthboxPalsForLevelUp', 'BeginNormalPaletteFade:0xFFFFFF7F:4:0:8:RGB_BLACK'); s.timer++; }
      break;
    case 1:
      if (!runtime.paletteFadeActive) { runtime.operations.push('BeginNormalPaletteFade:healthboxMask:4:8:0:RGB_BLACK'); s.timer++; }
      break;
    case 2:
      if (!runtime.paletteFadeActive) { runtime.operations.push('BtlCtrl_DrawVoiceoverMessageFrame'); s.timer++; }
      break;
    case 3:
      runtime.operations.push(`BattleStringExpandPlaceholdersToDisplayedString:${GetPokedudeText(runtime)}`, 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_OAK_OLD_MAN');
      s.timer++;
      break;
    case 4:
      if (!runtime.textPrinterActive && (newKeys & 1)) { runtime.operations.push('PlaySE:SE_SELECT', 'BeginNormalPaletteFade:healthboxMask:4:0:8:RGB_BLACK'); s.timer++; }
      break;
    case 5:
      if (!runtime.paletteFadeActive) { runtime.operations.push('BeginNormalPaletteFade:0xFFFFFF7F:4:8:0:RGB_BLACK'); s.timer++; }
      break;
    case 6:
      if (!runtime.paletteFadeActive) {
        if (s.msg_idx === STRINGID_PKMNGAINEDEXP) runtime.operations.push('BattleStopLowHpSound', 'PlayBGM:MUS_VICTORY_WILD');
        runtime.operations.push('DoFreeHealthboxPalsForLevelUp', 'BtlCtrl_RemoveVoiceoverMessageFrame');
        s.timer = 0;
        runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeBufferRunCommand';
      }
      break;
  }
};

export const GetPokedudeText = (runtime: PokedudeRuntime): string => {
  const n = runtime.gBattleStruct.pdMessageNo - 1;
  const symbol = sPokedudeTexts[runtime.gBattleStruct.pdScriptNum]?.[n];
  return (symbol && getPokedudeTextBySymbol(symbol)) ?? '';
};

export const PokedudeHandlePrintString = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const stringId = u16(runtime.gBattleBufferA[b], 2);
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  runtime.operations.push(`BufferStringBattle:${stringId}`, `BattlePutTextOnWindow:BattleString:${stringId}:B_WIN_MSG`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnInactiveTextPrinter';
};
export const PokedudeHandlePrintSelectionString = (runtime: PokedudeRuntime): void => side(runtime) === B_SIDE_PLAYER ? PokedudeHandlePrintString(runtime) : complete(runtime);
export const HandleChooseActionAfterDma3 = (runtime: PokedudeRuntime): void => { if (!runtime.dma3Busy) { runtime.gBattle_BG0_X = 0; runtime.gBattle_BG0_Y = 160; runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'HandleInputChooseAction'; } };
export const HandleInputChooseAction = (runtime: PokedudeRuntime): void => {
  PokedudeSimulateInputChooseAction(runtime);
};
export const PokedudeHandleChooseAction = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (side(runtime) === B_SIDE_PLAYER) {
    runtime.gBattlerControllerFuncs[b] = 'HandleChooseActionAfterDma3';
    runtime.operations.push('BattlePutTextOnWindow:gText_EmptyString3:B_WIN_MSG', 'BattlePutTextOnWindow:gText_BattleMenu:B_WIN_ACTION_MENU');
    for (let i = 0; i < 4; i++) runtime.operations.push(`ActionSelectionDestroyCursorAt:${i}`);
    runtime.operations.push(`ActionSelectionCreateCursorAt:${runtime.gActionSelectionCursor[b]}:0`, 'BattleStringExpandPlaceholdersToDisplayedString:gText_WhatWillPkmnDo', 'BattlePutTextOnWindow:gDisplayedStringBattle:B_WIN_ACTION_PROMPT');
  } else runtime.gBattlerControllerFuncs[b] = 'HandleInputChooseAction';
};
export const PokedudeHandleChooseMoveAfterDma3 = (runtime: PokedudeRuntime): void => { if (!runtime.dma3Busy) { runtime.gBattle_BG0_X = 0; runtime.gBattle_BG0_Y = 320; runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeHandleInputChooseMove'; } };
export const PokedudeHandleInputChooseMove = (runtime: PokedudeRuntime): void => {
  PokedudeSimulateInputChooseMove(runtime);
};
export const PokedudeHandleChooseMove = (runtime: PokedudeRuntime): void => {
  if (side(runtime) === B_SIDE_PLAYER) { runtime.operations.push('InitMoveSelectionsVarsAndStrings'); runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeHandleChooseMoveAfterDma3'; }
  else runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'PokedudeHandleInputChooseMove';
};
export const PokedudeHandleChooseItem = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  runtime.gBattlerControllerFuncs[b] = 'OpenBagAndChooseItem';
  runtime.gBattlerInMenuId = b;
  for (let i = 0; i < 3; i++) runtime.gBattlePartyCurrentOrder[i] = runtime.gBattleBufferA[b][i + 1];
};
export const OpenBagAndChooseItem = (runtime: PokedudeRuntime): void => {
  if (!runtime.paletteFadeActive) { runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'CompleteWhenChoseItem'; runtime.operations.push('ReshowBattleScreenDummy', 'FreeAllWindowBuffers', `InitPokedudeBag:${runtime.gBattleStruct.pdScriptNum}`); }
};
export const CompleteWhenChoseItem = (runtime: PokedudeRuntime): void => { if (runtime.gMain.callback2 === 'BattleMainCB2' && !runtime.paletteFadeActive) { emitOne(runtime, 1, runtime.gSpecialVar_ItemId); complete(runtime); } };
export const WaitForMonSelection = (runtime: PokedudeRuntime): void => { if (runtime.gMain.callback2 === 'BattleMainCB2' && !runtime.paletteFadeActive) { emitChosen(runtime, 1, runtime.gPartyMenuUseExitCallback ? runtime.gSelectedMonPartyId : 6); complete(runtime); } };
export const PokedudeHandleChoosePokemon = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattleControllerData[b] = runtime.gTasks.length;
  runtime.gTasks.push({ id: runtime.gBattleControllerData[b], func: 'TaskDummy', data: Array(16).fill(0), destroyed: false });
  runtime.gTasks[runtime.gBattleControllerData[b]].data[0] = runtime.gBattleBufferA[b][1] & 0xf;
  runtime.gBattleStruct.battlerPreventingSwitchout = runtime.gBattleBufferA[b][1] >> 4;
  runtime.gBattleStruct.playerPartyIdx = runtime.gBattleBufferA[b][2];
  runtime.gBattleStruct.abilityPreventingSwitchout = runtime.gBattleBufferA[b][3];
  for (let i = 0; i < 3; i++) runtime.gBattlePartyCurrentOrder[i] = runtime.gBattleBufferA[b][4 + i];
  runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:0:0:16:RGB_BLACK');
  runtime.gBattlerControllerFuncs[b] = 'OpenPartyMenuToChooseMon';
  runtime.gBattlerInMenuId = b;
};

export const OpenPartyMenuToChooseMon = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.paletteFadeActive) {
    runtime.gBattlerControllerFuncs[b] = 'WaitForMonSelection';
    runtime.gTasks[runtime.gBattleControllerData[b]].destroyed = true;
    runtime.operations.push(`DestroyTask:${runtime.gBattleControllerData[b]}`, 'FreeAllWindowBuffers', 'Pokedude_OpenPartyMenuInBattle');
  }
};

export const PokedudeHandleCmd55 = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattleOutcome = runtime.gBattleBufferA[b][1];
  runtime.operations.push('FadeOutMapMusic:5', 'BeginFastPaletteFade:FAST_FADE_OUT_TO_BLACK');
  complete(runtime);
  if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER) && (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_REAL)) runtime.gBattlerControllerFuncs[b] = 'Pokedude_SetBattleEndCallbacks';
};
export const Pokedude_SetBattleEndCallbacks = (runtime: PokedudeRuntime): void => { if (!runtime.paletteFadeActive) { runtime.gMain.inBattle = 0; runtime.gMain.callback1 = runtime.gMain.preBattleCallback1; runtime.operations.push(`SetMainCallback2:${runtime.gMain.savedCallback}`); } };

export const CompleteOnBattlerSpriteCallbackDummy = (runtime: PokedudeRuntime): void => {
  if (runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]].callback === 'SpriteCallbackDummy') complete(runtime);
};

export const CompleteOnBattlerSpritePosX_0 = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (sprite.animEnded && sprite.x2 === 0) {
    if (!hb.triedShinyMonAnim) {
      hb.triedShinyMonAnim = true;
      runtime.operations.push(`TryShinyAnimation:${b}:${runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]].species}`);
    } else if (hb.finishedShinyMonAnim) {
      hb.triedShinyMonAnim = false;
      hb.finishedShinyMonAnim = false;
      runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
      complete(runtime);
    }
  }
};

export const CompleteOnInactiveTextPrinter = (runtime: PokedudeRuntime): void => { if (!runtime.textPrinterActive) complete(runtime); };
export const CompleteOnInactiveTextPrinter2 = CompleteOnInactiveTextPrinter;
export const CompleteOnSpecialAnimDone = (runtime: PokedudeRuntime): void => { if (!runtime.gDoingBattleAnim) complete(runtime); };
export const CompleteOnFinishedBattleAnimation = (runtime: PokedudeRuntime): void => { if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].animFromTableActive) complete(runtime); };
export const CompleteOnFinishedStatusAnimation = (runtime: PokedudeRuntime): void => { if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].statusAnimActive) complete(runtime); };
export const CompleteOnFinishedStatusAnimation2 = CompleteOnFinishedStatusAnimation;

export const SwitchIn_HandleSoundAndEnd = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].specialAnimActive) {
    createTask(runtime, 'Task_PlayerController_RestoreBgmAfterCry', 10);
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    complete(runtime);
  }
};

export const SwitchIn_CleanShinyAnimShowSubstitute = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy' && hb.finishedShinyMonAnim) {
    hb.triedShinyMonAnim = false;
    hb.finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_MON_TO_SUBSTITUTE}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_HandleSoundAndEnd';
  }
};

export const SwitchIn_TryShinyAnimShowHealthbox = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (!hb.triedShinyMonAnim && !hb.ballAnimActive) {
    hb.triedShinyMonAnim = true;
    runtime.operations.push(`TryShinyAnimation:${b}:${runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]].species}`);
  }
  if (runtime.gSprites[runtime.gBattleControllerData[b]].callback === 'SpriteCallbackDummy' && !hb.ballAnimActive) {
    destroySprite(runtime, runtime.gBattleControllerData[b]);
    runtime.operations.push(`UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`, `CopyBattleSpriteInvisibility:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_CleanShinyAnimShowSubstitute';
  }
};

export const Intro_DelayAndEnd = (runtime: PokedudeRuntime): void => {
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler];
  hb.introEndDelay = (hb.introEndDelay - 1) & 0xff;
  if (hb.introEndDelay === 0xff) {
    hb.introEndDelay = 0;
    complete(runtime);
  }
};

export const Intro_TryShinyAnimShowHealthbox = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const flank = b ^ Partner.BIT_FLANK;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  const flankHb = runtime.gBattleSpritesDataPtr.healthBoxesData[flank];
  if (!hb.triedShinyMonAnim && !hb.ballAnimActive) {
    hb.triedShinyMonAnim = true;
    runtime.operations.push(`TryShinyAnimation:${b}:${runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]].species}`);
  }
  if (!flankHb.triedShinyMonAnim && !flankHb.ballAnimActive) {
    flankHb.triedShinyMonAnim = true;
    runtime.operations.push(`TryShinyAnimation:${flank}:${runtime.gPlayerParty[runtime.gBattlerPartyIndexes[flank]].species}`);
  }
  if (!hb.ballAnimActive && !flankHb.ballAnimActive) {
    if (runtime.isDoubleBattle && !(runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI)) {
      destroySprite(runtime, runtime.gBattleControllerData[flank]);
      runtime.operations.push(`UpdateHealthboxAttribute:${flank}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${flank}`, `SetHealthboxSpriteVisible:${flank}`);
    }
    destroySprite(runtime, runtime.gBattleControllerData[b]);
    runtime.operations.push(`UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`);
    runtime.gBattleSpritesDataPtr.animationData.introAnimActive = false;
    runtime.gBattlerControllerFuncs[b] = 'Intro_WaitForShinyAnimAndHealthbox';
  }
};

export const Intro_WaitForShinyAnimAndHealthbox = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const flank = b ^ Partner.BIT_FLANK;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  const flankHb = runtime.gBattleSpritesDataPtr.healthBoxesData[flank];
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy' && hb.finishedShinyMonAnim && flankHb.finishedShinyMonAnim) {
    hb.triedShinyMonAnim = false;
    hb.finishedShinyMonAnim = false;
    flankHb.triedShinyMonAnim = false;
    flankHb.finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
    createTask(runtime, 'Task_PlayerController_RestoreBgmAfterCry', 10);
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'Intro_DelayAndEnd';
  }
};

export const SetPokedudeMonData = (runtime: PokedudeRuntime, monId: number): void => {
  const partner = asPartner(runtime);
  const saved = partner.gPlayerParty;
  partner.gPlayerParty = monParty(runtime);
  try {
    Partner.SetLinkPartnerMonData(partner, monId);
  } finally {
    partner.gPlayerParty = saved;
  }
};

export const PokedudeHandleGetRawMonData = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const mon = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[b]];
  const offset = runtime.gBattleBufferA[b][1];
  const size = runtime.gBattleBufferA[b][2];
  const data = mon.raw.slice(offset, offset + size);
  runtime.emittedTransfers.push({ buffer: 'B', size: data.length, data });
  complete(runtime);
};

export const PokedudeHandleSetMonData = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][2] === 0) SetPokedudeMonData(runtime, runtime.gBattlerPartyIndexes[b]);
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) SetPokedudeMonData(runtime, i);
      mask >>= 1;
    }
  }
  complete(runtime);
};
export const PokedudeHandleSetRawMonData = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleLoadMonSprite = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const mon = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]];
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  runtime.operations.push(`BattleLoadOpponentMonSpriteGfx:${b}`, `SetMultiuseSpriteTemplateToPokemon:${mon.species}:${b}`, `SetBattlerShadowSpriteCallback:${b}:${mon.species}`);
  sprite.x2 = -Partner.DISPLAY_WIDTH;
  sprite.data[0] = b;
  sprite.data[2] = mon.species;
  sprite.oam.paletteNum = b;
  sprite.anim = runtime.gBattleMonForms[b];
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpritePosX_0';
  complete(runtime);
};

const StartPokedudeSendOutAnim = (runtime: PokedudeRuntime, battlerId: number): void => {
  runtime.gBattlerPartyIndexes[battlerId] = runtime.gBattleBufferA[battlerId][1];
  const species = runtime.gPlayerParty[runtime.gBattlerPartyIndexes[battlerId]].species;
  runtime.operations.push(`CreateInvisibleSpriteWithCallback:${battlerId}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${battlerId}`);
  const controllerSprite = runtime.gSprites[runtime.gBattleControllerData[battlerId]];
  const monSprite = runtime.gSprites[runtime.gBattlerSpriteIds[battlerId]];
  controllerSprite.callback = 'SpriteCB_WaitForBattlerBallReleaseAnim';
  controllerSprite.data[1] = runtime.gBattlerSpriteIds[battlerId];
  monSprite.data[0] = battlerId;
  monSprite.data[2] = species;
  monSprite.oam.paletteNum = battlerId;
  monSprite.anim = runtime.gBattleMonForms[battlerId];
  monSprite.invisible = true;
  monSprite.callback = 'SpriteCallbackDummy';
  controllerSprite.data[0] = 1;
  runtime.operations.push(`DoPokeballSendOutAnimation:0:${Partner.POKEBALL_PLAYER_SENDOUT}`);
};

export const StartSendOutAnim = StartPokedudeSendOutAnim;

export const PokedudeHandleSwitchInAnim = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push(`ClearTemporarySpeciesSpriteData:${b}:${runtime.gBattleBufferA[b][2]}`, `BattleLoadPlayerMonSpriteGfx:${b}`);
  runtime.gActionSelectionCursor[b] = 0;
  runtime.gMoveSelectionCursor[b] = 0;
  StartPokedudeSendOutAnim(runtime, b);
  runtime.gBattlerControllerFuncs[b] = 'SwitchIn_TryShinyAnimShowHealthbox';
};

export const PokedudeHandleReturnMonToBall = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] === 0) {
    runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_SWITCH_OUT_PLAYER_MON}`);
    runtime.gBattlerControllerFuncs[b] = 'DoSwitchOutAnimation';
  } else {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const PokedudeHandleDrawTrainerPic = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (side(runtime) === B_SIDE_PLAYER) {
    runtime.operations.push(`DecompressTrainerBackPalette:TRAINER_BACK_PIC_POKEDUDE:${b}`, `SetMultiuseSpriteTemplateToTrainerBack:TRAINER_BACK_PIC_POKEDUDE:${b}`);
    sprite.x = 80;
    sprite.y = 80;
    sprite.x2 = Partner.DISPLAY_WIDTH;
    sprite.data[0] = -2;
    sprite.oam.paletteNum = b;
  } else {
    runtime.operations.push(`DecompressTrainerFrontPic:TRAINER_PIC_PROFESSOR_OAK:${b}`, `SetMultiuseSpriteTemplateToTrainerBack:TRAINER_PIC_PROFESSOR_OAK:${b}`);
    sprite.x = 176;
    sprite.y = 40;
    sprite.x2 = -Partner.DISPLAY_WIDTH;
    sprite.data[0] = 2;
    sprite.oam.paletteNum = b;
    sprite.data[5] = 0;
  }
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpriteCallbackDummy';
};

export const PokedudeHandleTrainerSlide = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  runtime.operations.push(`DecompressTrainerBackPalette:TRAINER_BACK_PIC_POKEDUDE:${b}`, `SetMultiuseSpriteTemplateToTrainerBack:TRAINER_BACK_PIC_POKEDUDE:${b}`);
  sprite.x = 80;
  sprite.y = 80;
  sprite.oam.paletteNum = b;
  sprite.x2 = -96;
  sprite.data[0] = 2;
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpriteCallbackDummy2';
};
export const PokedudeHandleTrainerSlideBack = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleFaintAnimation = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.animationState === 0) {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_SUBSTITUTE_TO_MON}`);
    hb.animationState++;
  } else if (!hb.specialAnimActive) {
    hb.animationState = 0;
    if (side(runtime) === B_SIDE_PLAYER) {
      runtime.operations.push(`HandleLowHpMusicChange:${b}`);
      runtime.sounds.push({ kind: 'SE_PAN', id: Partner.SE_FAINT, pan: Partner.SOUND_PAN_ATTACKER });
      runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[1] = 0;
      runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[2] = 5;
      runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'SpriteCB_FaintSlideAnim';
    } else {
      runtime.sounds.push({ kind: 'SE_PAN', id: Partner.SE_FAINT, pan: Partner.SOUND_PAN_TARGET });
      runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'SpriteCB_FaintOpponentMon';
    }
    runtime.gBattlerControllerFuncs[b] = 'FreeMonSpriteAfterFaintAnim';
  }
};
export const PokedudeHandlePaletteFade = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleSuccessBallThrowAnim = (runtime: PokedudeRuntime): void => {
  runtime.gDoingBattleAnim = true;
  runtime.operations.push('SetBallThrowCaseId:BALL_3_SHAKES_SUCCESS', 'InitAndLaunchSpecialAnimation:B_ANIM_BALL_THROW');
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'CompleteOnSpecialAnimDone';
};
export const PokedudeHandleBallThrowAnim = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gDoingBattleAnim = true;
  runtime.operations.push(`SetBallThrowCaseId:${runtime.gBattleBufferA[b][1]}`, 'InitAndLaunchSpecialAnimation:B_ANIM_BALL_THROW');
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnSpecialAnimDone';
};
export const PokedudeHandlePause = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleMoveAnimation = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const move = u16(runtime.gBattleBufferA[b], 1);
  runtime.gAnimMoveTurn = runtime.gBattleBufferA[b][3];
  runtime.gAnimMovePower = u16(runtime.gBattleBufferA[b], 4);
  runtime.gAnimMoveDmg = u32(runtime.gBattleBufferA[b], 6);
  runtime.gAnimFriendship = runtime.gBattleBufferA[b][10];
  runtime.gWeatherMoveAnim = u16(runtime.gBattleBufferA[b], 12);
  runtime.gTransformedPersonalities[b] = u32(runtime.gBattleBufferA[b], 16);
  runtime.operations.push(`IsMoveWithoutAnimation:${move}:${runtime.gAnimMoveTurn}`);
  runtime.gBattleSpritesDataPtr.healthBoxesData[b].animationState = 0;
  runtime.gBattlerControllerFuncs[b] = 'PokedudeDoMoveAnimation';
};
export const PokedudeHandleUnknownYesNoBox = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd23 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeDoMoveAnimation = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  const move = u16(runtime.gBattleBufferA[b], 1);
  switch (hb.animationState) {
    case 0:
      if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_SUBSTITUTE_TO_MON}`);
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
        if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_MON_TO_SUBSTITUTE}`);
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
export const PokedudeHandleHealthBarUpdate = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hpVal = u16(runtime.gBattleBufferA[b], 2);
  const mon = activeMon(runtime);
  runtime.operations.push('LoadBattleBarGfx:0', `SetBattleBarStruct:${b}:${mon.maxHP}:${hpVal !== Partner.INSTANT_HP_BAR_DROP ? mon.hp : 0}:${hpVal}`);
  if (hpVal === Partner.INSTANT_HP_BAR_DROP) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:0:${Partner.HP_CURRENT}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnHealthbarDone';
};
export const PokedudeHandleExpUpdate = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const monId = runtime.gBattleBufferA[b][1];
  if (runtime.gPlayerParty[monId].level >= 100) complete(runtime);
  else {
    runtime.operations.push('LoadBattleBarGfx:1');
    const taskId = createTask(runtime, 'Task_GiveExpToMon', 10);
    runtime.gTasks[taskId].data[0] = monId;
    runtime.gTasks[taskId].data[1] = u16(runtime.gBattleBufferA[b], 2);
    runtime.gTasks[taskId].data[2] = b;
    runtime.gBattlerControllerFuncs[b] = 'PokedudeDummy';
  }
};

export const Task_GiveExpToMon = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const monId = task.data[0] & 0xff;
  const gainedExp = task.data[1] << 16 >> 16;
  const battlerId = task.data[2] & 0xff;
  if (runtime.isDoubleBattle || monId !== runtime.gBattlerPartyIndexes[battlerId]) {
    const leveledUp = grantExpAndMaybeLevel(runtime, monId, gainedExp, battlerId);
    if (leveledUp) {
      if (runtime.isDoubleBattle && (monId === runtime.gBattlerPartyIndexes[battlerId] || monId === runtime.gBattlerPartyIndexes[battlerId ^ Partner.BIT_FLANK])) task.func = 'Task_LaunchLvlUpAnim';
      else task.func = 'DestroyExpTaskAndCompleteOnInactiveTextPrinter';
    } else {
      runtime.gBattlerControllerFuncs[battlerId] = 'CompleteOnInactiveTextPrinter2';
      destroyTask(runtime, taskId);
    }
  } else {
    task.func = 'Task_PrepareToGiveExpWithExpBar';
  }
};

export const Task_PrepareToGiveExpWithExpBar = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const monId = task.data[0] & 0xff;
  const gainedExp = task.data[1] << 16 >> 16;
  const battlerId = task.data[2] & 0xff;
  const mon = runtime.gPlayerParty[monId] as PokedudeMonWithExpBounds;
  const currLvlExp = currentLevelExp(mon);
  const exp = mon.experience - currLvlExp;
  const expToNextLvl = nextLevelExp(mon) - currLvlExp;
  runtime.operations.push(`SetBattleBarStruct:${battlerId}:${expToNextLvl}:${exp}:${-gainedExp}`, 'PlaySE:SE_EXP');
  task.func = 'Task_GiveExpWithExpBar';
};

export const Task_GiveExpWithExpBar = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  if (task.data[10] < 13) {
    task.data[10]++;
    return;
  }
  const monId = task.data[0] & 0xff;
  const gainedExp = task.data[1] << 16 >> 16;
  const battlerId = task.data[2] & 0xff;
  const newExpPoints = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${battlerId}:EXP_BAR`, `SetHealthboxSpriteVisible:${battlerId}`);
  if (newExpPoints !== -1) return;
  runtime.operations.push('m4aSongNumStop:SE_EXP');
  const leveledUp = grantExpAndMaybeLevel(runtime, monId, gainedExp, battlerId);
  if (leveledUp) task.func = 'Task_LaunchLvlUpAnim';
  else {
    runtime.gBattlerControllerFuncs[battlerId] = 'CompleteOnInactiveTextPrinter2';
    destroyTask(runtime, taskId);
  }
};

export const Task_LaunchLvlUpAnim = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  let battlerId = task.data[2] & 0xff;
  const monId = task.data[0] & 0xff;
  if (runtime.isDoubleBattle && monId === runtime.gBattlerPartyIndexes[battlerId ^ Partner.BIT_FLANK]) battlerId ^= Partner.BIT_FLANK;
  runtime.operations.push(`InitAndLaunchSpecialAnimation:${battlerId}:B_ANIM_LVL_UP`);
  task.func = 'Task_UpdateLvlInHealthbox';
};

export const Task_UpdateLvlInHealthbox = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const battlerId = task.data[2] & 0xff;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[battlerId].specialAnimActive) {
    const monId = task.data[0] & 0xff;
    const healthboxBattler = runtime.isDoubleBattle && monId === runtime.gBattlerPartyIndexes[battlerId ^ Partner.BIT_FLANK] ? battlerId ^ Partner.BIT_FLANK : battlerId;
    runtime.operations.push(`UpdateHealthboxAttribute:${healthboxBattler}:${Partner.HEALTHBOX_ALL}`);
    task.func = 'DestroyExpTaskAndCompleteOnInactiveTextPrinter';
  }
};

export const DestroyExpTaskAndCompleteOnInactiveTextPrinter = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const battlerId = task.data[2] & 0xff;
  runtime.gBattlerControllerFuncs[battlerId] = 'CompleteOnInactiveTextPrinter2';
  destroyTask(runtime, taskId);
};

export const runPokedudeTask = (runtime: PokedudeRuntime, taskId: number): void => {
  switch (runtime.gTasks[taskId]?.func) {
    case 'Task_GiveExpToMon': Task_GiveExpToMon(runtime, taskId); break;
    case 'Task_PrepareToGiveExpWithExpBar': Task_PrepareToGiveExpWithExpBar(runtime, taskId); break;
    case 'Task_GiveExpWithExpBar': Task_GiveExpWithExpBar(runtime, taskId); break;
    case 'Task_LaunchLvlUpAnim': Task_LaunchLvlUpAnim(runtime, taskId); break;
    case 'Task_UpdateLvlInHealthbox': Task_UpdateLvlInHealthbox(runtime, taskId); break;
    case 'DestroyExpTaskAndCompleteOnInactiveTextPrinter': DestroyExpTaskAndCompleteOnInactiveTextPrinter(runtime, taskId); break;
    case 'Task_StartSendOutAnim': Task_StartSendOutAnim(runtime, taskId); break;
  }
};
export const PokedudeHandleStatusIconUpdate = (runtime: PokedudeRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_STATUS_ICON}`);
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].statusAnimActive = false;
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};
export const PokedudeHandleStatusAnimation = (runtime: PokedudeRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`InitAndLaunchChosenStatusAnimation:${runtime.gBattleBufferA[b][1]}:${u32(runtime.gBattleBufferA[b], 2)}`);
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};
export const PokedudeHandleStatusXor = (runtime: PokedudeRuntime): void => {
  activeMon(runtime).status1 ^= runtime.gBattleBufferA[runtime.gActiveBattler][1];
  complete(runtime);
};

export const FreeMonSpriteAfterFaintAnim = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (side(runtime) === B_SIDE_PLAYER) {
    if (sprite.y + sprite.y2 > Partner.DISPLAY_HEIGHT) {
      runtime.operations.push(`FreeOamMatrix:${sprite.oam.matrixNum}`);
      destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
      runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
      complete(runtime);
    }
  } else if (sprite.callback === 'Destroyed' || sprite.invisible) {
    runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const CompleteOnHealthbarDone = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const hpValue = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${b}`, `SetHealthboxSpriteVisible:${b}`);
  if (hpValue !== -1) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:${hpValue}:${Partner.HP_CURRENT}`);
  else {
    runtime.operations.push(`HandleLowHpMusicChange:${b}`);
    complete(runtime);
  }
};

export const DoHitAnimBlinkSpriteEffect = (runtime: PokedudeRuntime): void => {
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

export const DoSwitchOutAnimation = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].specialAnimActive) {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const CompleteOnBattlerSpriteCallbackDummy2 = (runtime: PokedudeRuntime): void => {
  if (runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]].callback === 'SpriteCallbackDummy') complete(runtime);
};

export const PokedudeHandleDataTransfer = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleDMA3Transfer = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandlePlayBGM = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd32 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleTwoReturnValues = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleChosenMonReturnValue = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleOneReturnValue = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleOneReturnValue_Duplicate = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd37 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd38 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd39 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleCmd40 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleHitAnimation = (runtime: PokedudeRuntime): void => {
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
export const PokedudeHandleCmd42 = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandlePlaySE = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'SE', id: u16(runtime.gBattleBufferA[b], 1) });
  complete(runtime);
};
export const PokedudeHandlePlayFanfare = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'FANFARE', id: u16(runtime.gBattleBufferA[b], 1) });
  complete(runtime);
};
export const PokedudeHandleFaintingCry = (runtime: PokedudeRuntime): void => {
  runtime.sounds.push({ kind: 'CRY', id: activeMon(runtime).species, pan: Partner.SOUND_PAN_TARGET });
  complete(runtime);
};
export const PokedudeHandleIntroSlide = (runtime: PokedudeRuntime): void => {
  runtime.operations.push(`HandleIntroSlide:${runtime.gBattleBufferA[runtime.gActiveBattler][1]}`);
  runtime.gIntroSlideFlags |= 1;
  complete(runtime);
};
export const PokedudeHandleIntroTrainerBallThrow = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  sprite.data[0] = 50;
  sprite.data[2] = -40;
  sprite.data[4] = sprite.y;
  sprite.callback = 'StartAnimLinearTranslation';
  sprite.data[5] = b;
  sprite.anim = 1;
  const taskId = createTask(runtime, 'Task_StartSendOutAnim', 5);
  runtime.gTasks[taskId].data[0] = b;
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown) runtime.gTasks[runtime.gBattlerStatusSummaryTaskId[b]].func = 'Task_HidePartyStatusSummary';
  runtime.gBattleSpritesDataPtr.animationData.introAnimActive = true;
  runtime.gBattlerControllerFuncs[b] = 'PokedudeDummy';
};
export const Task_StartSendOutAnim = (runtime: PokedudeRuntime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  if (task.data[1] < 31) task.data[1]++;
  else {
    const saved = runtime.gActiveBattler;
    runtime.gActiveBattler = task.data[0];
    runtime.gBattleBufferA[runtime.gActiveBattler][1] = runtime.gBattlerPartyIndexes[runtime.gActiveBattler];
    StartPokedudeSendOutAnim(runtime, runtime.gActiveBattler);
    runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'Intro_TryShinyAnimShowHealthbox';
    runtime.gActiveBattler = saved;
    task.destroyed = true;
    runtime.operations.push(`DestroyTask:${taskId}`);
  }
};
export const PokedudeHandleDrawPartyStatusSummary = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] !== 0 && side(runtime) === B_SIDE_PLAYER) complete(runtime);
  else {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown = true;
    runtime.gBattlerStatusSummaryTaskId[b] = createTask(runtime, 'CreatePartyStatusSummarySprites', 0);
    complete(runtime);
  }
};
export const PokedudeHandleHidePartyStatusSummary = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleEndBounceEffect = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push(`EndBounceEffect:${b}:BOUNCE_HEALTHBOX`, `EndBounceEffect:${b}:BOUNCE_MON`);
  complete(runtime);
};
export const PokedudeHandleSpriteInvisibility = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeHandleBattleAnimation = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.operations.push(`TryHandleLaunchBattleTableAnimation:${b}:${runtime.gBattleBufferA[b][1]}:${u16(runtime.gBattleBufferA[b], 2)}`);
  if (runtime.tryHandleBattleAnimationResult) complete(runtime);
  else runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedBattleAnimation';
};
export const PokedudeHandleLinkStandbyMsg = (runtime: PokedudeRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] === 0 || runtime.gBattleBufferA[b][1] === 1) runtime.operations.push(`EndBounceEffect:${b}:BOUNCE_HEALTHBOX`, `EndBounceEffect:${b}:BOUNCE_MON`);
  complete(runtime);
};
export const PokedudeHandleResetActionMoveSelection = (runtime: PokedudeRuntime): void => complete(runtime);
export const PokedudeCmdEnd = (_runtime: PokedudeRuntime): void => {};

export interface PokedudeBattlePartyInfo {
  side: number;
  level: number;
  species: number;
  moves: number[];
  nature: number;
  gender: number;
}

const party = (sideId: number, level: number, species: number, moves: number[], nature: number): PokedudeBattlePartyInfo => ({
  side: sideId,
  level,
  species,
  moves,
  nature,
  gender: MALE
});

export const sParties_Battle: PokedudeBattlePartyInfo[] = [
  party(B_SIDE_PLAYER, 15, SPECIES_RATTATA, [MOVE_TACKLE, MOVE_TAIL_WHIP, MOVE_HYPER_FANG, MOVE_QUICK_ATTACK], NATURE_LONELY),
  party(B_SIDE_OPPONENT, 18, SPECIES_PIDGEY, [MOVE_TACKLE, MOVE_SAND_ATTACK, MOVE_GUST, MOVE_QUICK_ATTACK], NATURE_NAUGHTY)
];

export const sParties_Status: PokedudeBattlePartyInfo[] = [
  party(B_SIDE_PLAYER, 15, SPECIES_RATTATA, [MOVE_TACKLE, MOVE_TAIL_WHIP, MOVE_HYPER_FANG, MOVE_QUICK_ATTACK], NATURE_LONELY),
  party(B_SIDE_OPPONENT, 14, SPECIES_ODDISH, [MOVE_ABSORB, MOVE_SWEET_SCENT, MOVE_POISON_POWDER, 0], NATURE_RASH)
];

export const sParties_Matchups: PokedudeBattlePartyInfo[] = [
  party(B_SIDE_PLAYER, 15, SPECIES_POLIWAG, [MOVE_WATER_GUN, MOVE_HYPNOSIS, MOVE_BUBBLE, 0], NATURE_RASH),
  party(B_SIDE_PLAYER, 15, SPECIES_BUTTERFREE, [MOVE_CONFUSION, MOVE_POISON_POWDER, MOVE_STUN_SPORE, MOVE_SLEEP_POWDER], NATURE_RASH),
  party(B_SIDE_OPPONENT, 14, SPECIES_ODDISH, [MOVE_ABSORB, MOVE_SWEET_SCENT, MOVE_POISON_POWDER, 0], NATURE_RASH)
];

export const sParties_Catching: PokedudeBattlePartyInfo[] = [
  party(B_SIDE_PLAYER, 15, SPECIES_BUTTERFREE, [MOVE_CONFUSION, MOVE_POISON_POWDER, MOVE_SLEEP_POWDER, MOVE_STUN_SPORE], NATURE_RASH),
  party(B_SIDE_OPPONENT, 11, SPECIES_JIGGLYPUFF, [MOVE_SING, MOVE_DEFENSE_CURL, MOVE_POUND, 0], NATURE_CAREFUL)
];

export const sPokedudeBattlePartyPointers = [sParties_Battle, sParties_Status, sParties_Matchups, sParties_Catching];

export const InitPokedudePartyAndOpponent = (runtime: PokedudeRuntime): void => {
  runtime.gBattleTypeFlags = BATTLE_TYPE_POKEDUDE;
  runtime.gPlayerParty = Array.from({ length: 6 }, () => Partner.createLinkPartnerMon({ species: 0, level: 0, moves: [0, 0, 0, 0] }));
  runtime.gEnemyParty = Array.from({ length: 6 }, () => Partner.createLinkPartnerMon({ species: 0, level: 0, moves: [0, 0, 0, 0] }));
  let myIdx = 0;
  let opIdx = 0;
  for (const info of sPokedudeBattlePartyPointers[runtime.gSpecialVar_0x8004] ?? sParties_Battle) {
    const mon = Partner.createLinkPartnerMon({
      species: info.species,
      level: info.level,
      moves: [...info.moves],
      nickname: `SPECIES_${info.species}`
    });
    (mon as Partner.LinkPartnerMon & { nature?: number; gender?: number }).nature = info.nature;
    (mon as Partner.LinkPartnerMon & { nature?: number; gender?: number }).gender = info.gender;
    if (info.side === B_SIDE_PLAYER) runtime.gPlayerParty[myIdx++] = mon;
    else runtime.gEnemyParty[opIdx++] = mon;
  }
};

export const sPokedudeBufferCommands: Array<((runtime: PokedudeRuntime) => void) | undefined> = [
  PokedudeHandleGetMonData, PokedudeHandleGetRawMonData, PokedudeHandleSetMonData, PokedudeHandleSetRawMonData,
  PokedudeHandleLoadMonSprite, PokedudeHandleSwitchInAnim, PokedudeHandleReturnMonToBall, PokedudeHandleDrawTrainerPic,
  PokedudeHandleTrainerSlide, PokedudeHandleTrainerSlideBack, PokedudeHandleFaintAnimation, PokedudeHandlePaletteFade,
  PokedudeHandleSuccessBallThrowAnim, PokedudeHandleBallThrowAnim, PokedudeHandlePause, PokedudeHandleMoveAnimation,
  PokedudeHandlePrintString, PokedudeHandlePrintSelectionString, PokedudeHandleChooseAction, PokedudeHandleUnknownYesNoBox,
  PokedudeHandleChooseMove, PokedudeHandleChooseItem, PokedudeHandleChoosePokemon, PokedudeHandleCmd23,
  PokedudeHandleHealthBarUpdate, PokedudeHandleExpUpdate, PokedudeHandleStatusIconUpdate, PokedudeHandleStatusAnimation,
  PokedudeHandleStatusXor, PokedudeHandleDataTransfer, PokedudeHandleDMA3Transfer, PokedudeHandlePlayBGM,
  PokedudeHandleCmd32, PokedudeHandleTwoReturnValues, PokedudeHandleChosenMonReturnValue, PokedudeHandleOneReturnValue,
  PokedudeHandleOneReturnValue_Duplicate, PokedudeHandleCmd37, PokedudeHandleCmd38, PokedudeHandleCmd39,
  PokedudeHandleCmd40, PokedudeHandleHitAnimation, PokedudeHandleCmd42, PokedudeHandlePlaySE,
  PokedudeHandlePlayFanfare, PokedudeHandleFaintingCry, PokedudeHandleIntroSlide, PokedudeHandleIntroTrainerBallThrow,
  PokedudeHandleDrawPartyStatusSummary, PokedudeHandleHidePartyStatusSummary, PokedudeHandleEndBounceEffect,
  PokedudeHandleSpriteInvisibility, PokedudeHandleBattleAnimation, PokedudeHandleLinkStandbyMsg,
  PokedudeHandleResetActionMoveSelection, PokedudeHandleCmd55, PokedudeCmdEnd
];

export const runPokedudeControllerFunc = (runtime: PokedudeRuntime, newKeys = 0): void => {
  switch (runtime.gBattlerControllerFuncs[runtime.gActiveBattler]) {
    case 'PokedudeBufferRunCommand': PokedudeBufferRunCommand(runtime); break;
    case 'HandleChooseActionAfterDma3': HandleChooseActionAfterDma3(runtime); break;
    case 'HandleInputChooseAction': HandleInputChooseAction(runtime); break;
    case 'PokedudeHandleChooseMoveAfterDma3': PokedudeHandleChooseMoveAfterDma3(runtime); break;
    case 'PokedudeHandleInputChooseMove': PokedudeHandleInputChooseMove(runtime); break;
    case 'PokedudeAction_PrintVoiceoverMessage': PokedudeAction_PrintVoiceoverMessage(runtime, newKeys); break;
    case 'PokedudeAction_PrintMessageWithHealthboxPals': PokedudeAction_PrintMessageWithHealthboxPals(runtime, newKeys); break;
    case 'OpenBagAndChooseItem': OpenBagAndChooseItem(runtime); break;
    case 'CompleteWhenChoseItem': CompleteWhenChoseItem(runtime); break;
    case 'OpenPartyMenuToChooseMon': OpenPartyMenuToChooseMon(runtime); break;
    case 'WaitForMonSelection': WaitForMonSelection(runtime); break;
    case 'CompleteOnBattlerSpriteCallbackDummy': CompleteOnBattlerSpriteCallbackDummy(runtime); break;
    case 'CompleteOnBattlerSpritePosX_0': CompleteOnBattlerSpritePosX_0(runtime); break;
    case 'CompleteOnBattlerSpriteCallbackDummy2': CompleteOnBattlerSpriteCallbackDummy2(runtime); break;
    case 'CompleteOnInactiveTextPrinter': CompleteOnInactiveTextPrinter(runtime); break;
    case 'CompleteOnInactiveTextPrinter2': CompleteOnInactiveTextPrinter2(runtime); break;
    case 'CompleteOnHealthbarDone': CompleteOnHealthbarDone(runtime); break;
    case 'CompleteOnFinishedStatusAnimation': CompleteOnFinishedStatusAnimation(runtime); break;
    case 'CompleteOnFinishedBattleAnimation': CompleteOnFinishedBattleAnimation(runtime); break;
    case 'CompleteOnSpecialAnimDone': CompleteOnSpecialAnimDone(runtime); break;
    case 'FreeMonSpriteAfterFaintAnim': FreeMonSpriteAfterFaintAnim(runtime); break;
    case 'DoHitAnimBlinkSpriteEffect': DoHitAnimBlinkSpriteEffect(runtime); break;
    case 'DoSwitchOutAnimation': DoSwitchOutAnimation(runtime); break;
    case 'PokedudeDoMoveAnimation': PokedudeDoMoveAnimation(runtime); break;
    case 'SwitchIn_TryShinyAnimShowHealthbox': SwitchIn_TryShinyAnimShowHealthbox(runtime); break;
    case 'SwitchIn_CleanShinyAnimShowSubstitute': SwitchIn_CleanShinyAnimShowSubstitute(runtime); break;
    case 'SwitchIn_HandleSoundAndEnd': SwitchIn_HandleSoundAndEnd(runtime); break;
    case 'Intro_TryShinyAnimShowHealthbox': Intro_TryShinyAnimShowHealthbox(runtime); break;
    case 'Intro_WaitForShinyAnimAndHealthbox': Intro_WaitForShinyAnimAndHealthbox(runtime); break;
    case 'Intro_DelayAndEnd': Intro_DelayAndEnd(runtime); break;
    case 'PokedudeDummy': PokedudeDummy(runtime); break;
    case 'Pokedude_SetBattleEndCallbacks': Pokedude_SetBattleEndCallbacks(runtime); break;
  }
};
