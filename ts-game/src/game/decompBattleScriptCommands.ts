import type { BattleState } from './battle';
import { runBattleScriptCommand, type BattleScriptCommandResult, type BattleScriptCommandRuntime } from './battleScriptVm';

export type BattleScriptValue = number | string | boolean | null;

export interface DecompBattleScriptCommandsRuntime {
  battle?: BattleState;
  commandRuntime?: BattleScriptCommandRuntime;
  operations: string[];
  memory: Record<string, BattleScriptValue>;
  arrays: Record<string, BattleScriptValue[]>;
  scriptPtr: number;
  stack: number[];
  paused: boolean;
  ended: boolean;
  moveFailed: boolean;
  protected: boolean;
  damage: number;
  typeModifier: number;
  randomSeed: number;
  battlerTurnOrder: number[];
  multihit: number;
  levelUpBannerState: 'hidden' | 'sliding-in' | 'visible' | 'sliding-out';
  lastResult: BattleScriptCommandResult;
}

let activeRuntime: DecompBattleScriptCommandsRuntime | null = null;

export const createBattleScriptCommandsRuntime = (overrides: Partial<DecompBattleScriptCommandsRuntime> = {}): DecompBattleScriptCommandsRuntime => {
  const runtime: DecompBattleScriptCommandsRuntime = {
    operations: [],
    memory: {},
    arrays: {},
    scriptPtr: 0,
    stack: [],
    paused: false,
    ended: false,
    moveFailed: false,
    protected: false,
    damage: 0,
    typeModifier: 1,
    randomSeed: 1,
    battlerTurnOrder: [0, 1, 2, 3],
    multihit: 0,
    levelUpBannerState: 'hidden',
    lastResult: {},
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
};

const requireRuntime = (runtime?: DecompBattleScriptCommandsRuntime): DecompBattleScriptCommandsRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (!resolved) throw new Error('battle script commands runtime is not active');
  return resolved;
};

const readValue = (runtime: DecompBattleScriptCommandsRuntime, key: BattleScriptValue | undefined): BattleScriptValue =>
  typeof key === 'string' && key in runtime.memory ? runtime.memory[key]! : key ?? null;

const numeric = (value: BattleScriptValue | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const writeValue = (runtime: DecompBattleScriptCommandsRuntime, key: BattleScriptValue | undefined, value: BattleScriptValue): void => {
  if (typeof key === 'string') runtime.memory[key] = value;
};

const nextRandom = (runtime: DecompBattleScriptCommandsRuntime): number => {
  runtime.randomSeed = (runtime.randomSeed * 1103515245 + 24691) >>> 0;
  return runtime.randomSeed;
};

const compare = (comparison: BattleScriptValue | undefined, left: BattleScriptValue, right: BattleScriptValue): boolean => {
  const l = numeric(left);
  const r = numeric(right);
  switch (comparison) {
    case 'CMP_EQUAL': return String(left) === String(right);
    case 'CMP_NOT_EQUAL': return String(left) !== String(right);
    case 'CMP_LESS_THAN': return l < r;
    case 'CMP_GREATER_THAN': return l > r;
    case 'CMP_COMMON_BITS': return (l & r) !== 0;
    case 'CMP_NO_COMMON_BITS': return (l & r) === 0;
    default: return false;
  }
};

const maybeDelegate = (runtime: DecompBattleScriptCommandsRuntime, opcode: string): BattleScriptCommandResult => {
  if (!runtime.battle) return {};
  const result = runBattleScriptCommand(runtime.battle, opcode, runtime.commandRuntime ?? {});
  runtime.lastResult = result;
  return result;
};

const runOpcode = (runtime: DecompBattleScriptCommandsRuntime, cName: string, opcode: string, args: BattleScriptValue[]): BattleScriptCommandResult | BattleScriptValue => {
  runtime.operations.push([cName, opcode, ...args.map(String)].join(':'));
  const delegated = maybeDelegate(runtime, opcode);
  let jumped = false;
  switch (opcode) {
    case 'goto': runtime.scriptPtr = numeric(args[0]); jumped = true; break;
    case 'call': runtime.stack.push(runtime.scriptPtr); runtime.scriptPtr = numeric(args[0]); jumped = true; break;
    case 'return': runtime.scriptPtr = runtime.stack.pop() ?? runtime.scriptPtr; jumped = true; break;
    case 'end': case 'end2': case 'end3': case 'endselectionscript': case 'finishaction': case 'finishturn': runtime.ended = true; break;
    case 'pause': runtime.paused = true; runtime.memory.pauseTimer = numeric(args[0]); break;
    case 'setbyte': case 'sethalfword': case 'setword': writeValue(runtime, args[0], args[1] ?? 0); break;
    case 'addbyte': writeValue(runtime, args[0], numeric(readValue(runtime, args[0])) + numeric(args[1])); break;
    case 'subbyte': writeValue(runtime, args[0], numeric(readValue(runtime, args[0])) - numeric(args[1])); break;
    case 'orbyte': case 'orhalfword': case 'orword': writeValue(runtime, args[0], numeric(readValue(runtime, args[0])) | numeric(args[1])); break;
    case 'bicbyte': case 'bichalfword': case 'bicword': writeValue(runtime, args[0], numeric(readValue(runtime, args[0])) & ~numeric(args[1])); break;
    case 'copyarray': runtime.arrays[String(args[0])] = [...(runtime.arrays[String(args[1])] ?? [])]; break;
    case 'copyarraywithindex': writeValue(runtime, args[0], (runtime.arrays[String(args[1])] ?? [])[numeric(args[2])] ?? null); break;
    case 'jumpifbyte': case 'jumpifhalfword': case 'jumpifword': if (compare(args[0], readValue(runtime, args[1]), args[2] ?? 0)) { runtime.scriptPtr = numeric(args[3]); jumped = true; } break;
    case 'jumpifarrayequal': if (JSON.stringify(runtime.arrays[String(args[0])] ?? []) === JSON.stringify(runtime.arrays[String(args[1])] ?? [])) { runtime.scriptPtr = numeric(args[2]); jumped = true; } break;
    case 'jumpifarraynotequal': if (JSON.stringify(runtime.arrays[String(args[0])] ?? []) !== JSON.stringify(runtime.arrays[String(args[1])] ?? [])) { runtime.scriptPtr = numeric(args[2]); jumped = true; } break;
    case 'jumpifmovefailed': if (runtime.moveFailed) { runtime.scriptPtr = numeric(args[0]); jumped = true; } break;
    case 'jumpifaffectedbyprotect': if (runtime.protected) { runtime.scriptPtr = numeric(args[0]); jumped = true; } break;
    case 'damagecalc': runtime.damage = Math.max(1, numeric(args[0]) || runtime.damage || 1); break;
    case 'typecalc': case 'typecalc2': runtime.typeModifier = numeric(args[0]) || runtime.typeModifier; break;
    case 'randomdamage': runtime.damage = Math.max(1, Math.trunc((runtime.damage || 1) * (85 + (nextRandom(runtime) % 16)) / 100)); break;
    case 'adjustnormaldamage': case 'adjustnormaldamage2': runtime.damage = Math.max(1, runtime.damage); break;
    case 'negativedamage': runtime.damage = -Math.abs(runtime.damage); break;
    case 'setmultihit': case 'setmultihitcounter': runtime.multihit = numeric(args[0]); break;
    case 'decrementmultihit': runtime.multihit = Math.max(0, runtime.multihit - 1); break;
    case 'getexp': runtime.memory.expAwarded = numeric(args[0]); break;
    case 'getmoneyreward': runtime.memory.moneyReward = numeric(args[0]); break;
    case 'givepaydaymoney': runtime.memory.payDayMoney = numeric(runtime.memory.payDayMoney) + numeric(args[0]); break;
    case 'drawlvlupbox': runtime.levelUpBannerState = 'visible'; break;
    case 'attackcanceler': runtime.moveFailed = delegated.stopped === true; break;
    case 'accuracycheck': runtime.moveFailed = delegated.missed === true; break;
  }
  if (!jumped && !runtime.ended) runtime.scriptPtr += 1;
  return Object.keys(delegated).length ? delegated : runtime.lastResult;
};

const command = (cName: string, opcode: string) => (runtime?: DecompBattleScriptCommandsRuntime, ...args: BattleScriptValue[]): BattleScriptCommandResult | BattleScriptValue =>
  runOpcode(requireRuntime(runtime), cName, opcode, args);

export const gBattleScriptingCommands = {
  get activeRuntime() { return activeRuntime; }
};

export const Cmd_attackcanceler = command('Cmd_attackcanceler', 'attackcanceler');
export const JumpIfMoveFailed = command('JumpIfMoveFailed', 'jumpifmovefailed');
export const Cmd_jumpifaffectedbyprotect = command('Cmd_jumpifaffectedbyprotect', 'jumpifaffectedbyprotect');
export const JumpIfMoveAffectedByProtect = command('JumpIfMoveAffectedByProtect', 'jumpifaffectedbyprotect');
export const AccuracyCalcHelper = command('AccuracyCalcHelper', 'accuracycheck');
export const Cmd_accuracycheck = command('Cmd_accuracycheck', 'accuracycheck');
export const Cmd_attackstring = command('Cmd_attackstring', 'attackstring');
export const Cmd_ppreduce = command('Cmd_ppreduce', 'ppreduce');
export const Cmd_critcalc = command('Cmd_critcalc', 'critcalc');
export const Cmd_damagecalc = command('Cmd_damagecalc', 'damagecalc');
export const AI_CalcDmg = command('AI_CalcDmg', 'damagecalc');
export const ModulateDmgByType = command('ModulateDmgByType', 'typecalc');
export const Cmd_typecalc = command('Cmd_typecalc', 'typecalc');
export const CheckWonderGuardAndLevitate = command('CheckWonderGuardAndLevitate', 'checkwonderguardandlevitate');
export const ModulateDmgByType2 = command('ModulateDmgByType2', 'typecalc2');
export const TypeCalc = command('TypeCalc', 'typecalc');
export const AI_TypeCalc = command('AI_TypeCalc', 'typecalc');
export const ApplyRandomDmgMultiplier = command('ApplyRandomDmgMultiplier', 'randomdamage');
export const Unused_ApplyRandomDmgMultiplier = command('Unused_ApplyRandomDmgMultiplier', 'randomdamage');
export const Cmd_adjustnormaldamage = command('Cmd_adjustnormaldamage', 'adjustnormaldamage');
export const Cmd_adjustnormaldamage2 = command('Cmd_adjustnormaldamage2', 'adjustnormaldamage2');
export const Cmd_attackanimation = command('Cmd_attackanimation', 'attackanimation');
export const Cmd_waitanimation = command('Cmd_waitanimation', 'waitanimation');
export const Cmd_healthbarupdate = command('Cmd_healthbarupdate', 'healthbarupdate');
export const Cmd_datahpupdate = command('Cmd_datahpupdate', 'datahpupdate');
export const Cmd_critmessage = command('Cmd_critmessage', 'critmessage');
export const Cmd_effectivenesssound = command('Cmd_effectivenesssound', 'effectivenesssound');
export const Cmd_resultmessage = command('Cmd_resultmessage', 'resultmessage');
export const Cmd_printstring = command('Cmd_printstring', 'printstring');
export const Cmd_printselectionstring = command('Cmd_printselectionstring', 'printselectionstring');
export const Cmd_waitmessage = command('Cmd_waitmessage', 'waitmessage');
export const Cmd_printfromtable = command('Cmd_printfromtable', 'printfromtable');
export const Cmd_printselectionstringfromtable = command('Cmd_printselectionstringfromtable', 'printselectionstringfromtable');
export const GetBattlerTurnOrderNum = command('GetBattlerTurnOrderNum', 'getbattlerturnordernum');
export const SetMoveEffect = command('SetMoveEffect', 'setmoveeffect');
export const Cmd_seteffectwithchance = command('Cmd_seteffectwithchance', 'seteffectwithchance');
export const Cmd_seteffectprimary = command('Cmd_seteffectprimary', 'seteffectprimary');
export const Cmd_seteffectsecondary = command('Cmd_seteffectsecondary', 'seteffectsecondary');
export const Cmd_clearstatusfromeffect = command('Cmd_clearstatusfromeffect', 'clearstatusfromeffect');
export const Cmd_tryfaintmon = command('Cmd_tryfaintmon', 'tryfaintmon');
export const Cmd_dofaintanimation = command('Cmd_dofaintanimation', 'dofaintanimation');
export const Cmd_cleareffectsonfaint = command('Cmd_cleareffectsonfaint', 'cleareffectsonfaint');
export const Cmd_jumpifstatus = command('Cmd_jumpifstatus', 'jumpifstatus');
export const Cmd_jumpifstatus2 = command('Cmd_jumpifstatus2', 'jumpifstatus2');
export const Cmd_jumpifability = command('Cmd_jumpifability', 'jumpifability');
export const Cmd_jumpifsideaffecting = command('Cmd_jumpifsideaffecting', 'jumpifsideaffecting');
export const Cmd_jumpifstat = command('Cmd_jumpifstat', 'jumpifstat');
export const Cmd_jumpifstatus3condition = command('Cmd_jumpifstatus3condition', 'jumpifstatus3condition');
export const Cmd_jumpiftype = command('Cmd_jumpiftype', 'jumpiftype');
export const Cmd_getexp = command('Cmd_getexp', 'getexp');
export const Cmd_checkteamslost = command('Cmd_checkteamslost', 'checkteamslost');
export const MoveValuesCleanUp = command('MoveValuesCleanUp', 'movevaluescleanup');
export const Cmd_movevaluescleanup = command('Cmd_movevaluescleanup', 'movevaluescleanup');
export const Cmd_setmultihit = command('Cmd_setmultihit', 'setmultihit');
export const Cmd_decrementmultihit = command('Cmd_decrementmultihit', 'decrementmultihit');
export const Cmd_goto = command('Cmd_goto', 'goto');
export const Cmd_jumpifbyte = command('Cmd_jumpifbyte', 'jumpifbyte');
export const Cmd_jumpifhalfword = command('Cmd_jumpifhalfword', 'jumpifhalfword');
export const Cmd_jumpifword = command('Cmd_jumpifword', 'jumpifword');
export const Cmd_jumpifarrayequal = command('Cmd_jumpifarrayequal', 'jumpifarrayequal');
export const Cmd_jumpifarraynotequal = command('Cmd_jumpifarraynotequal', 'jumpifarraynotequal');
export const Cmd_setbyte = command('Cmd_setbyte', 'setbyte');
export const Cmd_addbyte = command('Cmd_addbyte', 'addbyte');
export const Cmd_subbyte = command('Cmd_subbyte', 'subbyte');
export const Cmd_copyarray = command('Cmd_copyarray', 'copyarray');
export const Cmd_copyarraywithindex = command('Cmd_copyarraywithindex', 'copyarraywithindex');
export const Cmd_orbyte = command('Cmd_orbyte', 'orbyte');
export const Cmd_orhalfword = command('Cmd_orhalfword', 'orhalfword');
export const Cmd_orword = command('Cmd_orword', 'orword');
export const Cmd_bicbyte = command('Cmd_bicbyte', 'bicbyte');
export const Cmd_bichalfword = command('Cmd_bichalfword', 'bichalfword');
export const Cmd_bicword = command('Cmd_bicword', 'bicword');
export const Cmd_pause = command('Cmd_pause', 'pause');
export const Cmd_waitstate = command('Cmd_waitstate', 'waitstate');
export const Cmd_healthbar_update = command('Cmd_healthbar_update', 'healthbar_update');
export const Cmd_return = command('Cmd_return', 'return');
export const Cmd_end = command('Cmd_end', 'end');
export const Cmd_end2 = command('Cmd_end2', 'end2');
export const Cmd_end3 = command('Cmd_end3', 'end3');
export const Cmd_call = command('Cmd_call', 'call');
export const Cmd_jumpiftype2 = command('Cmd_jumpiftype2', 'jumpiftype2');
export const Cmd_jumpifabilitypresent = command('Cmd_jumpifabilitypresent', 'jumpifabilitypresent');
export const Cmd_endselectionscript = command('Cmd_endselectionscript', 'endselectionscript');
export const Cmd_playanimation = command('Cmd_playanimation', 'playanimation');
export const Cmd_playanimation_var = command('Cmd_playanimation_var', 'playanimation_var');
export const Cmd_setgraphicalstatchangevalues = command('Cmd_setgraphicalstatchangevalues', 'setgraphicalstatchangevalues');
export const Cmd_playstatchangeanimation = command('Cmd_playstatchangeanimation', 'playstatchangeanimation');
export const Cmd_moveend = command('Cmd_moveend', 'moveend');
export const Cmd_typecalc2 = command('Cmd_typecalc2', 'typecalc2');
export const Cmd_returnatktoball = command('Cmd_returnatktoball', 'returnatktoball');
export const Cmd_getswitchedmondata = command('Cmd_getswitchedmondata', 'getswitchedmondata');
export const Cmd_switchindataupdate = command('Cmd_switchindataupdate', 'switchindataupdate');
export const Cmd_switchinanim = command('Cmd_switchinanim', 'switchinanim');
export const Cmd_jumpifcantswitch = command('Cmd_jumpifcantswitch', 'jumpifcantswitch');
export const ChooseMonToSendOut = command('ChooseMonToSendOut', 'openpartyscreen');
export const Cmd_openpartyscreen = command('Cmd_openpartyscreen', 'openpartyscreen');
export const Cmd_switchhandleorder = command('Cmd_switchhandleorder', 'switchhandleorder');
export const Cmd_switchineffects = command('Cmd_switchineffects', 'switchineffects');
export const Cmd_trainerslidein = command('Cmd_trainerslidein', 'trainerslidein');
export const Cmd_playse = command('Cmd_playse', 'playse');
export const Cmd_fanfare = command('Cmd_fanfare', 'fanfare');
export const Cmd_playfaintcry = command('Cmd_playfaintcry', 'playfaintcry');
export const Cmd_endlinkbattle = command('Cmd_endlinkbattle', 'endlinkbattle');
export const Cmd_returntoball = command('Cmd_returntoball', 'returntoball');
export const Cmd_handlelearnnewmove = command('Cmd_handlelearnnewmove', 'handlelearnnewmove');
export const Cmd_yesnoboxlearnmove = command('Cmd_yesnoboxlearnmove', 'yesnoboxlearnmove');
export const Cmd_yesnoboxstoplearningmove = command('Cmd_yesnoboxstoplearningmove', 'yesnoboxstoplearningmove');
export const Cmd_hitanimation = command('Cmd_hitanimation', 'hitanimation');
export const Cmd_getmoneyreward = command('Cmd_getmoneyreward', 'getmoneyreward');
export const Cmd_updatebattlermoves = command('Cmd_updatebattlermoves', 'updatebattlermoves');
export const Cmd_swapattackerwithtarget = command('Cmd_swapattackerwithtarget', 'swapattackerwithtarget');
export const Cmd_incrementgamestat = command('Cmd_incrementgamestat', 'incrementgamestat');
export const Cmd_drawpartystatussummary = command('Cmd_drawpartystatussummary', 'drawpartystatussummary');
export const Cmd_hidepartystatussummary = command('Cmd_hidepartystatussummary', 'hidepartystatussummary');
export const Cmd_jumptocalledmove = command('Cmd_jumptocalledmove', 'jumptocalledmove');
export const Cmd_statusanimation = command('Cmd_statusanimation', 'statusanimation');
export const Cmd_status2animation = command('Cmd_status2animation', 'status2animation');
export const Cmd_chosenstatusanimation = command('Cmd_chosenstatusanimation', 'chosenstatusanimation');
export const Cmd_yesnobox = command('Cmd_yesnobox', 'yesnobox');
export const Cmd_cancelallactions = command('Cmd_cancelallactions', 'cancelallactions');
export const Cmd_adjustsetdamage = command('Cmd_adjustsetdamage', 'adjustsetdamage');
export const Cmd_removeitem = command('Cmd_removeitem', 'removeitem');
export const Cmd_atknameinbuff1 = command('Cmd_atknameinbuff1', 'atknameinbuff1');
export const Cmd_drawlvlupbox = command('Cmd_drawlvlupbox', 'drawlvlupbox');
export const DrawLevelUpWindow1 = command('DrawLevelUpWindow1', 'drawlvlupbox');
export const DrawLevelUpWindow2 = command('DrawLevelUpWindow2', 'drawlvlupbox');
export const InitLevelUpBanner = command('InitLevelUpBanner', 'drawlvlupbox');
export const SlideInLevelUpBanner = command('SlideInLevelUpBanner', 'drawlvlupbox');
export const DrawLevelUpBannerText = command('DrawLevelUpBannerText', 'drawlvlupbox');
export const SlideOutLevelUpBanner = command('SlideOutLevelUpBanner', 'drawlvlupbox');
export const PutMonIconOnLvlUpBanner = command('PutMonIconOnLvlUpBanner', 'drawlvlupbox');
export const SpriteCB_MonIconOnLvlUpBanner = command('SpriteCB_MonIconOnLvlUpBanner', 'drawlvlupbox');
export const IsMonGettingExpSentOut = command('IsMonGettingExpSentOut', 'getexp');
export const Cmd_resetsentmonsvalue = command('Cmd_resetsentmonsvalue', 'resetsentmonsvalue');
export const Cmd_setatktoplayer0 = command('Cmd_setatktoplayer0', 'setatktoplayer0');
export const Cmd_makevisible = command('Cmd_makevisible', 'makevisible');
export const Cmd_recordlastability = command('Cmd_recordlastability', 'recordlastability');
export const BufferMoveToLearnIntoBattleTextBuff2 = command('BufferMoveToLearnIntoBattleTextBuff2', 'buffermovetolearn');
export const Cmd_buffermovetolearn = command('Cmd_buffermovetolearn', 'buffermovetolearn');
export const Cmd_jumpifplayerran = command('Cmd_jumpifplayerran', 'jumpifplayerran');
export const Cmd_hpthresholds = command('Cmd_hpthresholds', 'hpthresholds');
export const Cmd_hpthresholds2 = command('Cmd_hpthresholds2', 'hpthresholds2');
export const Cmd_useitemonopponent = command('Cmd_useitemonopponent', 'useitemonopponent');
export const Cmd_various = command('Cmd_various', 'various');
export const Cmd_setprotectlike = command('Cmd_setprotectlike', 'setprotectlike');
export const Cmd_tryexplosion = command('Cmd_tryexplosion', 'tryexplosion');
export const Cmd_setatkhptozero = command('Cmd_setatkhptozero', 'setatkhptozero');
export const Cmd_jumpifnexttargetvalid = command('Cmd_jumpifnexttargetvalid', 'jumpifnexttargetvalid');
export const Cmd_tryhealhalfhealth = command('Cmd_tryhealhalfhealth', 'tryhealhalfhealth');
export const Cmd_trymirrormove = command('Cmd_trymirrormove', 'trymirrormove');
export const Cmd_setrain = command('Cmd_setrain', 'setrain');
export const Cmd_setreflect = command('Cmd_setreflect', 'setreflect');
export const Cmd_setseeded = command('Cmd_setseeded', 'setseeded');
export const Cmd_manipulatedamage = command('Cmd_manipulatedamage', 'manipulatedamage');
export const Cmd_trysetrest = command('Cmd_trysetrest', 'trysetrest');
export const Cmd_jumpifnotfirstturn = command('Cmd_jumpifnotfirstturn', 'jumpifnotfirstturn');
export const Cmd_nop = command('Cmd_nop', 'nop');
export const UproarWakeUpCheck = command('UproarWakeUpCheck', 'jumpifcantmakeasleep');
export const Cmd_jumpifcantmakeasleep = command('Cmd_jumpifcantmakeasleep', 'jumpifcantmakeasleep');
export const Cmd_stockpile = command('Cmd_stockpile', 'stockpile');
export const Cmd_stockpiletobasedamage = command('Cmd_stockpiletobasedamage', 'stockpiletobasedamage');
export const Cmd_stockpiletohpheal = command('Cmd_stockpiletohpheal', 'stockpiletohpheal');
export const Cmd_negativedamage = command('Cmd_negativedamage', 'negativedamage');
export const ChangeStatBuffs = command('ChangeStatBuffs', 'statbuffchange');
export const Cmd_statbuffchange = command('Cmd_statbuffchange', 'statbuffchange');
export const Cmd_normalisebuffs = command('Cmd_normalisebuffs', 'normalisebuffs');
export const Cmd_setbide = command('Cmd_setbide', 'setbide');
export const Cmd_confuseifrepeatingattackends = command('Cmd_confuseifrepeatingattackends', 'confuseifrepeatingattackends');
export const Cmd_setmultihitcounter = command('Cmd_setmultihitcounter', 'setmultihitcounter');
export const Cmd_initmultihitstring = command('Cmd_initmultihitstring', 'initmultihitstring');
export const TryDoForceSwitchOut = command('TryDoForceSwitchOut', 'forcerandomswitch');
export const Cmd_forcerandomswitch = command('Cmd_forcerandomswitch', 'forcerandomswitch');
export const Cmd_tryconversiontypechange = command('Cmd_tryconversiontypechange', 'tryconversiontypechange');
export const Cmd_givepaydaymoney = command('Cmd_givepaydaymoney', 'givepaydaymoney');
export const Cmd_setlightscreen = command('Cmd_setlightscreen', 'setlightscreen');
export const Cmd_tryKO = command('Cmd_tryKO', 'tryko');
export const Cmd_damagetohalftargethp = command('Cmd_damagetohalftargethp', 'damagetohalftargethp');
export const Cmd_setsandstorm = command('Cmd_setsandstorm', 'setsandstorm');
export const Cmd_weatherdamage = command('Cmd_weatherdamage', 'weatherdamage');
export const Cmd_tryinfatuating = command('Cmd_tryinfatuating', 'tryinfatuating');
export const Cmd_updatestatusicon = command('Cmd_updatestatusicon', 'updatestatusicon');
export const Cmd_setmist = command('Cmd_setmist', 'setmist');
export const Cmd_setfocusenergy = command('Cmd_setfocusenergy', 'setfocusenergy');
export const Cmd_transformdataexecution = command('Cmd_transformdataexecution', 'transformdataexecution');
export const Cmd_setsubstitute = command('Cmd_setsubstitute', 'setsubstitute');
export const IsMoveUncopyableByMimic = command('IsMoveUncopyableByMimic', 'mimicattackcopy');
export const Cmd_mimicattackcopy = command('Cmd_mimicattackcopy', 'mimicattackcopy');
export const Cmd_metronome = command('Cmd_metronome', 'metronome');
export const Cmd_dmgtolevel = command('Cmd_dmgtolevel', 'dmgtolevel');
export const Cmd_psywavedamageeffect = command('Cmd_psywavedamageeffect', 'psywavedamageeffect');
export const Cmd_counterdamagecalculator = command('Cmd_counterdamagecalculator', 'counterdamagecalculator');
export const Cmd_mirrorcoatdamagecalculator = command('Cmd_mirrorcoatdamagecalculator', 'mirrorcoatdamagecalculator');
export const Cmd_disablelastusedattack = command('Cmd_disablelastusedattack', 'disablelastusedattack');
export const Cmd_trysetencore = command('Cmd_trysetencore', 'trysetencore');
export const Cmd_painsplitdmgcalc = command('Cmd_painsplitdmgcalc', 'painsplitdmgcalc');
export const Cmd_settypetorandomresistance = command('Cmd_settypetorandomresistance', 'settypetorandomresistance');
export const Cmd_setalwayshitflag = command('Cmd_setalwayshitflag', 'setalwayshitflag');
export const Cmd_copymovepermanently = command('Cmd_copymovepermanently', 'copymovepermanently');
export const IsTwoTurnsMove = command('IsTwoTurnsMove', 'twoturnmove');
export const IsInvalidForSleepTalkOrAssist = command('IsInvalidForSleepTalkOrAssist', 'sleepassistinvalid');
export const AttacksThisTurn = command('AttacksThisTurn', 'attacksthischurn');
export const Cmd_trychoosesleeptalkmove = command('Cmd_trychoosesleeptalkmove', 'trychoosesleeptalkmove');
export const Cmd_setdestinybond = command('Cmd_setdestinybond', 'setdestinybond');
export const TrySetDestinyBondToHappen = command('TrySetDestinyBondToHappen', 'trysetdestinybondtohappen');
export const Cmd_trysetdestinybondtohappen = command('Cmd_trysetdestinybondtohappen', 'trysetdestinybondtohappen');
export const Cmd_remaininghptopower = command('Cmd_remaininghptopower', 'remaininghptopower');
export const Cmd_tryspiteppreduce = command('Cmd_tryspiteppreduce', 'tryspiteppreduce');
export const Cmd_healpartystatus = command('Cmd_healpartystatus', 'healpartystatus');
export const Cmd_cursetarget = command('Cmd_cursetarget', 'cursetarget');
export const Cmd_trysetspikes = command('Cmd_trysetspikes', 'trysetspikes');
export const Cmd_setforesight = command('Cmd_setforesight', 'setforesight');
export const Cmd_trysetperishsong = command('Cmd_trysetperishsong', 'trysetperishsong');
export const Cmd_rolloutdamagecalculation = command('Cmd_rolloutdamagecalculation', 'rolloutdamagecalculation');
export const Cmd_jumpifconfusedandstatmaxed = command('Cmd_jumpifconfusedandstatmaxed', 'jumpifconfusedandstatmaxed');
export const Cmd_furycuttercalc = command('Cmd_furycuttercalc', 'furycuttercalc');
export const Cmd_friendshiptodamagecalculation = command('Cmd_friendshiptodamagecalculation', 'friendshiptodamagecalculation');
export const Cmd_presentdamagecalculation = command('Cmd_presentdamagecalculation', 'presentdamagecalculation');
export const Cmd_setsafeguard = command('Cmd_setsafeguard', 'setsafeguard');
export const Cmd_magnitudedamagecalculation = command('Cmd_magnitudedamagecalculation', 'magnitudedamagecalculation');
export const Cmd_jumpifnopursuitswitchdmg = command('Cmd_jumpifnopursuitswitchdmg', 'jumpifnopursuitswitchdmg');
export const Cmd_setsunny = command('Cmd_setsunny', 'setsunny');
export const Cmd_maxattackhalvehp = command('Cmd_maxattackhalvehp', 'maxattackhalvehp');
export const Cmd_copyfoestats = command('Cmd_copyfoestats', 'copyfoestats');
export const Cmd_rapidspinfree = command('Cmd_rapidspinfree', 'rapidspinfree');
export const Cmd_setdefensecurlbit = command('Cmd_setdefensecurlbit', 'setdefensecurlbit');
export const Cmd_recoverbasedonsunlight = command('Cmd_recoverbasedonsunlight', 'recoverbasedonsunlight');
export const Cmd_hiddenpowercalc = command('Cmd_hiddenpowercalc', 'hiddenpowercalc');
export const Cmd_selectfirstvalidtarget = command('Cmd_selectfirstvalidtarget', 'selectfirstvalidtarget');
export const Cmd_trysetfutureattack = command('Cmd_trysetfutureattack', 'trysetfutureattack');
export const Cmd_trydobeatup = command('Cmd_trydobeatup', 'trydobeatup');
export const Cmd_setsemiinvulnerablebit = command('Cmd_setsemiinvulnerablebit', 'setsemiinvulnerablebit');
export const Cmd_clearsemiinvulnerablebit = command('Cmd_clearsemiinvulnerablebit', 'clearsemiinvulnerablebit');
export const Cmd_setminimize = command('Cmd_setminimize', 'setminimize');
export const Cmd_sethail = command('Cmd_sethail', 'sethail');
export const Cmd_trymemento = command('Cmd_trymemento', 'trymemento');
export const Cmd_setforcedtarget = command('Cmd_setforcedtarget', 'setforcedtarget');
export const Cmd_setcharge = command('Cmd_setcharge', 'setcharge');
export const Cmd_callterrainattack = command('Cmd_callterrainattack', 'callterrainattack');
export const Cmd_cureifburnedparalysedorpoisoned = command('Cmd_cureifburnedparalysedorpoisoned', 'cureifburnedparalysedorpoisoned');
export const Cmd_settorment = command('Cmd_settorment', 'settorment');
export const Cmd_jumpifnodamage = command('Cmd_jumpifnodamage', 'jumpifnodamage');
export const Cmd_settaunt = command('Cmd_settaunt', 'settaunt');
export const Cmd_trysethelpinghand = command('Cmd_trysethelpinghand', 'trysethelpinghand');
export const Cmd_tryswapitems = command('Cmd_tryswapitems', 'tryswapitems');
export const Cmd_trycopyability = command('Cmd_trycopyability', 'trycopyability');
export const Cmd_trywish = command('Cmd_trywish', 'trywish');
export const Cmd_trysetroots = command('Cmd_trysetroots', 'trysetroots');
export const Cmd_doubledamagedealtifdamaged = command('Cmd_doubledamagedealtifdamaged', 'doubledamagedealtifdamaged');
export const Cmd_setyawn = command('Cmd_setyawn', 'setyawn');
export const Cmd_setdamagetohealthdifference = command('Cmd_setdamagetohealthdifference', 'setdamagetohealthdifference');
export const Cmd_scaledamagebyhealthratio = command('Cmd_scaledamagebyhealthratio', 'scaledamagebyhealthratio');
export const Cmd_tryswapabilities = command('Cmd_tryswapabilities', 'tryswapabilities');
export const Cmd_tryimprison = command('Cmd_tryimprison', 'tryimprison');
export const Cmd_trysetgrudge = command('Cmd_trysetgrudge', 'trysetgrudge');
export const Cmd_weightdamagecalculation = command('Cmd_weightdamagecalculation', 'weightdamagecalculation');
export const Cmd_assistattackselect = command('Cmd_assistattackselect', 'assistattackselect');
export const Cmd_trysetmagiccoat = command('Cmd_trysetmagiccoat', 'trysetmagiccoat');
export const Cmd_trysetsnatch = command('Cmd_trysetsnatch', 'trysetsnatch');
export const Cmd_trygetintimidatetarget = command('Cmd_trygetintimidatetarget', 'trygetintimidatetarget');
export const Cmd_switchoutabilities = command('Cmd_switchoutabilities', 'switchoutabilities');
export const Cmd_jumpifhasnohp = command('Cmd_jumpifhasnohp', 'jumpifhasnohp');
export const Cmd_getsecretpowereffect = command('Cmd_getsecretpowereffect', 'getsecretpowereffect');
export const Cmd_pickup = command('Cmd_pickup', 'pickup');
export const Cmd_docastformchangeanimation = command('Cmd_docastformchangeanimation', 'docastformchangeanimation');
export const Cmd_trycastformdatachange = command('Cmd_trycastformdatachange', 'trycastformdatachange');
export const Cmd_settypebasedhalvers = command('Cmd_settypebasedhalvers', 'settypebasedhalvers');
export const Cmd_setweatherballtype = command('Cmd_setweatherballtype', 'setweatherballtype');
export const Cmd_tryrecycleitem = command('Cmd_tryrecycleitem', 'tryrecycleitem');
export const Cmd_settypetoterrain = command('Cmd_settypetoterrain', 'settypetoterrain');
export const Cmd_pursuitdoubles = command('Cmd_pursuitdoubles', 'pursuitdoubles');
export const Cmd_snatchsetbattlers = command('Cmd_snatchsetbattlers', 'snatchsetbattlers');
export const Cmd_removelightscreenreflect = command('Cmd_removelightscreenreflect', 'removelightscreenreflect');
export const Cmd_handleballthrow = command('Cmd_handleballthrow', 'handleballthrow');
export const Cmd_givecaughtmon = command('Cmd_givecaughtmon', 'givecaughtmon');
export const Cmd_trysetcaughtmondexflags = command('Cmd_trysetcaughtmondexflags', 'trysetcaughtmondexflags');
export const Cmd_displaydexinfo = command('Cmd_displaydexinfo', 'displaydexinfo');
export const HandleBattleWindow = command('HandleBattleWindow', 'handlebattlewindow');
export const BattleCreateYesNoCursorAt = command('BattleCreateYesNoCursorAt', 'yesnobox');
export const BattleDestroyYesNoCursorAt = command('BattleDestroyYesNoCursorAt', 'yesnobox');
export const Cmd_trygivecaughtmonnick = command('Cmd_trygivecaughtmonnick', 'trygivecaughtmonnick');
export const Cmd_subattackerhpbydmg = command('Cmd_subattackerhpbydmg', 'subattackerhpbydmg');
export const Cmd_removeattackerstatus1 = command('Cmd_removeattackerstatus1', 'removeattackerstatus1');
export const Cmd_finishaction = command('Cmd_finishaction', 'finishaction');
export const Cmd_finishturn = command('Cmd_finishturn', 'finishturn');
