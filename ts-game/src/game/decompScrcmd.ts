export type ScrcmdValue = number | string | null;
export interface ScrcmdContext {
  script: ScrcmdValue[];
  pc: number;
  data: ScrcmdValue[];
  comparisonResult: number;
  stopped: boolean;
  native: (() => boolean) | null;
  stack: number[];
}
export interface ScrcmdWarp { mapGroup: number; mapNum: number; warpId: number; x: number; y: number; type: string; }
export interface ScrcmdObject { x: number; y: number; mapGroup: number; mapNum: number; hidden: boolean; movementType: number; subpriority: number; direction: number; }
export interface ScrcmdPokemon { species: number; level: number; item: number; moves: number[]; isEgg: boolean; modernFatefulEncounter: boolean; metLocation: number; nickname?: string; }
export interface ScrcmdRuntime {
  ctx: ScrcmdContext;
  vars: Map<number, number>;
  bytes: Map<number, number>;
  words: Map<number, ScrcmdValue>;
  flags: Set<number>;
  stats: Map<number, number>;
  inventory: Map<number, number>;
  pcItems: Map<number, number>;
  decorations: Set<number>;
  party: ScrcmdPokemon[];
  money: number;
  coins: number;
  randomSeed: number;
  specialResult: number;
  specials: Array<() => number>;
  stdScripts: number[];
  operations: string[];
  warp: ScrcmdWarp | null;
  dynamicWarp: ScrcmdWarp | null;
  diveWarp: ScrcmdWarp | null;
  holeWarp: ScrcmdWarp | null;
  escapeWarp: ScrcmdWarp | null;
  playerX: number;
  playerY: number;
  mapGroup: number;
  mapNum: number;
  selectedObjectEvent: number;
  movingNpcId: number;
  movingNpcMapGroup: number;
  movingNpcMapNum: number;
  fieldEffectScriptId: number;
  fieldEffectArgs: number[];
  fieldEffects: Set<number>;
  objects: Map<number, ScrcmdObject>;
  buffers: Map<number, string>;
  message: string;
  textColor: number;
  signMessage: boolean;
  paletteActive: boolean;
  soundEffectPlaying: boolean;
  fanfareActive: boolean;
  bgmPaused: boolean;
  pauseCounter: number;
  addressOffset: number;
  questLogWaitButtonPressTimer: number;
  questLogInput: number;
  ramScriptRetAddr: number;
  ramScript: number | null;
  mysteryEventStatus: number;
  lastMonCry: number | null;
}

let activeRuntime: ScrcmdRuntime | null = null;
const conditionTable = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, 1, 1], [1, 0, 1]];
const LOCALID_NONE = 0xff;

export function createScrcmdRuntime(script: ScrcmdValue[] = []): ScrcmdRuntime {
  const runtime: ScrcmdRuntime = {
    ctx: { script, pc: 0, data: Array.from({ length: 4 }, () => 0), comparisonResult: 0, stopped: false, native: null, stack: [] },
    vars: new Map(),
    bytes: new Map(),
    words: new Map(),
    flags: new Set(),
    stats: new Map(),
    inventory: new Map(),
    pcItems: new Map(),
    decorations: new Set(),
    party: [],
    money: 0,
    coins: 0,
    randomSeed: 1,
    specialResult: 0,
    specials: [],
    stdScripts: [],
    operations: [],
    warp: null,
    dynamicWarp: null,
    diveWarp: null,
    holeWarp: null,
    escapeWarp: null,
    playerX: 0,
    playerY: 0,
    mapGroup: 0,
    mapNum: 0,
    selectedObjectEvent: 0,
    movingNpcId: 0,
    movingNpcMapGroup: 0,
    movingNpcMapNum: 0,
    fieldEffectScriptId: 0,
    fieldEffectArgs: Array.from({ length: 8 }, () => 0),
    fieldEffects: new Set(),
    objects: new Map(),
    buffers: new Map(),
    message: '',
    textColor: 0,
    signMessage: false,
    paletteActive: false,
    soundEffectPlaying: false,
    fanfareActive: false,
    bgmPaused: false,
    pauseCounter: 0,
    addressOffset: 0,
    questLogWaitButtonPressTimer: 0,
    questLogInput: 0,
    ramScriptRetAddr: 0,
    ramScript: null,
    mysteryEventStatus: 0,
    lastMonCry: null
  };
  activeRuntime = runtime;
  return runtime;
}

const req = (runtime?: ScrcmdRuntime): ScrcmdRuntime => {
  const r = runtime ?? activeRuntime;
  if (!r) throw new Error('scrcmd runtime is not active');
  return r;
};
const op = (r: ScrcmdRuntime, name: string, ...args: ScrcmdValue[]): void => { r.operations.push([name, ...args].join(':')); };
const read = (ctx: ScrcmdContext): ScrcmdValue => ctx.script[ctx.pc++] ?? 0;
const byte = (ctx: ScrcmdContext): number => Number(read(ctx)) & 0xff;
const half = (ctx: ScrcmdContext): number => Number(read(ctx)) & 0xffff;
const word = (ctx: ScrcmdContext): ScrcmdValue => read(ctx);
const toAddr = (value: ScrcmdValue): number => Number(value) || 0;
const varGet = (r: ScrcmdRuntime, id: number): number => id >= 0x4000 ? (r.vars.get(id) ?? 0) : id;
const varSet = (r: ScrcmdRuntime, id: number, value: number): void => { r.vars.set(id & 0xffff, value & 0xffff); };
const setResult = (r: ScrcmdRuntime, value: number): void => { r.specialResult = value & 0xffff; varSet(r, 0x800d, r.specialResult); };
const stopScript = (ctx: ScrcmdContext): void => { ctx.stopped = true; };
const setupNative = (ctx: ScrcmdContext, fn: () => boolean): void => { ctx.native = fn; };
const jump = (ctx: ScrcmdContext, addr: ScrcmdValue): void => { ctx.pc = toAddr(addr); };
const call = (ctx: ScrcmdContext, addr: ScrcmdValue): void => { ctx.stack.push(ctx.pc); jump(ctx, addr); };
const ret = (ctx: ScrcmdContext): void => { ctx.pc = ctx.stack.pop() ?? ctx.pc; };
const compareValue = (a: number, b: number): number => a < b ? 0 : a === b ? 1 : 2;
const conditionMatches = (ctx: ScrcmdContext, condition: number): boolean => (conditionTable[condition]?.[ctx.comparisonResult] ?? 0) === 1;
const adjustCount = (map: Map<number, number>, id: number, count: number): boolean => { map.set(id, Math.max(0, (map.get(id) ?? 0) + count)); return true; };
const hasCount = (map: Map<number, number>, id: number, count: number): boolean => (map.get(id) ?? 0) >= count;
const object = (r: ScrcmdRuntime, id: number): ScrcmdObject => {
  let obj = r.objects.get(id);
  if (!obj) {
    obj = { x: 0, y: 0, mapGroup: r.mapGroup, mapNum: r.mapNum, hidden: false, movementType: 0, subpriority: 0, direction: 0 };
    r.objects.set(id, obj);
  }
  return obj;
};
const readWarp = (ctx: ScrcmdContext, r: ScrcmdRuntime, type: string): ScrcmdWarp => ({
  mapGroup: byte(ctx),
  mapNum: byte(ctx),
  warpId: byte(ctx),
  x: varGet(r, half(ctx)),
  y: varGet(r, half(ctx)),
  type
});

export function ScrCmd_nop(_ctx: ScrcmdContext, _runtime = req()): boolean { return false; }
export function ScrCmd_nop1(_ctx: ScrcmdContext, _runtime = req()): boolean { return false; }
export function ScrCmd_end(ctx: ScrcmdContext, _runtime = req()): boolean { stopScript(ctx); return false; }
export function ScrCmd_gotonative(ctx: ScrcmdContext, r = req()): boolean { const index = toAddr(word(ctx)); setupNative(ctx, r.specials[index] ? () => r.specials[index]() !== 0 : () => true); return true; }
export function ScrCmd_special(ctx: ScrcmdContext, r = req()): boolean { const fn = r.specials[half(ctx)]; if (fn) fn(); else op(r, 'assert-special'); return false; }
export function ScrCmd_specialvar(ctx: ScrcmdContext, r = req()): boolean { const varId = half(ctx); const fn = r.specials[half(ctx)]; varSet(r, varId, fn ? fn() : 0); if (!fn) op(r, 'assert-specialvar'); return false; }
export function ScrCmd_callnative(ctx: ScrcmdContext, r = req()): boolean { const fn = r.specials[toAddr(word(ctx))]; if (fn) fn(); return false; }
export function ScrCmd_waitstate(ctx: ScrcmdContext, r = req()): boolean { stopScript(ctx); op(r, 'ScriptContext_Stop'); return true; }
export function ScrCmd_goto(ctx: ScrcmdContext, _runtime = req()): boolean { jump(ctx, word(ctx)); return false; }
export function ScrCmd_return(ctx: ScrcmdContext, _runtime = req()): boolean { ret(ctx); return false; }
export function ScrCmd_call(ctx: ScrcmdContext, _runtime = req()): boolean { call(ctx, word(ctx)); return false; }
export function ScrCmd_goto_if(ctx: ScrcmdContext, _runtime = req()): boolean { const condition = byte(ctx); const addr = word(ctx); if (conditionMatches(ctx, condition)) jump(ctx, addr); return false; }
export function ScrCmd_call_if(ctx: ScrcmdContext, _runtime = req()): boolean { const condition = byte(ctx); const addr = word(ctx); if (conditionMatches(ctx, condition)) call(ctx, addr); return false; }
export function ScrCmd_setvaddress(ctx: ScrcmdContext, r = req()): boolean { const addr1 = ctx.pc - 1; const addr2 = toAddr(word(ctx)); r.addressOffset = addr2 - addr1; return false; }
export function ScrCmd_vgoto(ctx: ScrcmdContext, r = req()): boolean { jump(ctx, toAddr(word(ctx)) - r.addressOffset); return false; }
export function ScrCmd_vcall(ctx: ScrcmdContext, r = req()): boolean { call(ctx, toAddr(word(ctx)) - r.addressOffset); return false; }
export function ScrCmd_vgoto_if(ctx: ScrcmdContext, r = req()): boolean { const condition = byte(ctx); const addr = toAddr(word(ctx)) - r.addressOffset; if (conditionMatches(ctx, condition)) jump(ctx, addr); return false; }
export function ScrCmd_vcall_if(ctx: ScrcmdContext, r = req()): boolean { const condition = byte(ctx); const addr = toAddr(word(ctx)) - r.addressOffset; if (conditionMatches(ctx, condition)) call(ctx, addr); return false; }
export function ScrCmd_gotostd(ctx: ScrcmdContext, r = req()): boolean { const addr = r.stdScripts[byte(ctx)]; if (addr !== undefined) jump(ctx, addr); return false; }
export function ScrCmd_callstd(ctx: ScrcmdContext, r = req()): boolean { const addr = r.stdScripts[byte(ctx)]; if (addr !== undefined) call(ctx, addr); return false; }
export function ScrCmd_gotostd_if(ctx: ScrcmdContext, r = req()): boolean { const condition = byte(ctx); const addr = r.stdScripts[byte(ctx)]; if (addr !== undefined && conditionMatches(ctx, condition)) jump(ctx, addr); return false; }
export function ScrCmd_callstd_if(ctx: ScrcmdContext, r = req()): boolean { const condition = byte(ctx); const addr = r.stdScripts[byte(ctx)]; if (addr !== undefined && conditionMatches(ctx, condition)) call(ctx, addr); return false; }
export function ScrCmd_returnram(ctx: ScrcmdContext, r = req()): boolean { jump(ctx, r.ramScriptRetAddr); return false; }
export function ScrCmd_endram(ctx: ScrcmdContext, r = req()): boolean { r.ramScript = null; stopScript(ctx); return true; }
export function ScrCmd_setmysteryeventstatus(ctx: ScrcmdContext, r = req()): boolean { r.mysteryEventStatus = byte(ctx); return false; }
export function ScrCmd_trywondercardscript(ctx: ScrcmdContext, r = req()): boolean { if (r.ramScript !== null) { r.ramScriptRetAddr = ctx.pc; jump(ctx, r.ramScript); } return false; }
export function ScrCmd_loadword(ctx: ScrcmdContext, _runtime = req()): boolean { ctx.data[byte(ctx)] = word(ctx); return false; }
export function ScrCmd_loadbytefromptr(ctx: ScrcmdContext, r = req()): boolean { ctx.data[byte(ctx)] = r.bytes.get(toAddr(word(ctx))) ?? 0; return false; }
export function ScrCmd_setptr(ctx: ScrcmdContext, r = req()): boolean { const value = byte(ctx); r.bytes.set(toAddr(word(ctx)), value); return false; }
export function ScrCmd_loadbyte(ctx: ScrcmdContext, _runtime = req()): boolean { ctx.data[byte(ctx)] = byte(ctx); return false; }
export function ScrCmd_setptrbyte(ctx: ScrcmdContext, r = req()): boolean { const index = byte(ctx); r.bytes.set(toAddr(word(ctx)), Number(ctx.data[index]) & 0xff); return false; }
export function ScrCmd_copylocal(ctx: ScrcmdContext, _runtime = req()): boolean { const dest = byte(ctx); ctx.data[dest] = ctx.data[byte(ctx)]; return false; }
export function ScrCmd_copybyte(ctx: ScrcmdContext, r = req()): boolean { const dest = toAddr(word(ctx)); r.bytes.set(dest, r.bytes.get(toAddr(word(ctx))) ?? 0); return false; }
export function ScrCmd_setvar(ctx: ScrcmdContext, r = req()): boolean { varSet(r, half(ctx), half(ctx)); return false; }
export function ScrCmd_copyvar(ctx: ScrcmdContext, r = req()): boolean { const dest = half(ctx); varSet(r, dest, r.vars.get(half(ctx)) ?? 0); return false; }
export function ScrCmd_setorcopyvar(ctx: ScrcmdContext, r = req()): boolean { const dest = half(ctx); varSet(r, dest, varGet(r, half(ctx))); return false; }
export function Compare(a: number, b: number): number { return compareValue(a, b); }
export function ScrCmd_compare_local_to_local(ctx: ScrcmdContext, _runtime = req()): boolean { ctx.comparisonResult = Compare(Number(ctx.data[byte(ctx)]), Number(ctx.data[byte(ctx)])); return false; }
export function ScrCmd_compare_local_to_value(ctx: ScrcmdContext, _runtime = req()): boolean { ctx.comparisonResult = Compare(Number(ctx.data[byte(ctx)]), byte(ctx)); return false; }
export function ScrCmd_compare_local_to_ptr(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(Number(ctx.data[byte(ctx)]), r.bytes.get(toAddr(word(ctx))) ?? 0); return false; }
export function ScrCmd_compare_ptr_to_local(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(r.bytes.get(toAddr(word(ctx))) ?? 0, Number(ctx.data[byte(ctx)])); return false; }
export function ScrCmd_compare_ptr_to_value(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(r.bytes.get(toAddr(word(ctx))) ?? 0, byte(ctx)); return false; }
export function ScrCmd_compare_ptr_to_ptr(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(r.bytes.get(toAddr(word(ctx))) ?? 0, r.bytes.get(toAddr(word(ctx))) ?? 0); return false; }
export function ScrCmd_compare_var_to_value(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(r.vars.get(half(ctx)) ?? 0, half(ctx)); return false; }
export function ScrCmd_compare_var_to_var(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = Compare(r.vars.get(half(ctx)) ?? 0, r.vars.get(half(ctx)) ?? 0); return false; }
export function ScrCmd_addvar(ctx: ScrcmdContext, r = req()): boolean { const id = half(ctx); varSet(r, id, (r.vars.get(id) ?? 0) + half(ctx)); return false; }
export function ScrCmd_subvar(ctx: ScrcmdContext, r = req()): boolean { const id = half(ctx); varSet(r, id, (r.vars.get(id) ?? 0) - varGet(r, half(ctx))); return false; }
export function ScrCmd_random(ctx: ScrcmdContext, r = req()): boolean { const max = Math.max(1, varGet(r, half(ctx))); r.randomSeed = (r.randomSeed * 1103515245 + 24691) & 0x7fffffff; setResult(r, r.randomSeed % max); return false; }
export function ScrCmd_additem(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const qty = varGet(r, half(ctx)) & 0xff; setResult(r, adjustCount(r.inventory, id, qty) ? 1 : 0); op(r, 'TrySetObtainedItemQuestLogEvent', id); return false; }
export function ScrCmd_removeitem(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const qty = varGet(r, half(ctx)) & 0xff; const ok = hasCount(r.inventory, id, qty); if (ok) adjustCount(r.inventory, id, -qty); setResult(r, ok ? 1 : 0); return false; }
export function ScrCmd_checkitemspace(ctx: ScrcmdContext, r = req()): boolean { half(ctx); half(ctx); setResult(r, 1); return false; }
export function ScrCmd_checkitem(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const qty = varGet(r, half(ctx)) & 0xff; setResult(r, hasCount(r.inventory, id, qty) ? 1 : 0); return false; }
export function ScrCmd_checkitemtype(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); setResult(r, Math.max(1, Math.trunc(id / 100))); return false; }
export function ScrCmd_addpcitem(ctx: ScrcmdContext, r = req()): boolean { setResult(r, adjustCount(r.pcItems, varGet(r, half(ctx)), varGet(r, half(ctx))) ? 1 : 0); return false; }
export function ScrCmd_checkpcitem(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const qty = varGet(r, half(ctx)); setResult(r, hasCount(r.pcItems, id, qty) ? 1 : 0); return false; }
export function ScrCmd_adddecoration(ctx: ScrcmdContext, r = req()): boolean { r.decorations.add(varGet(r, half(ctx))); return false; }
export function ScrCmd_removedecoration(ctx: ScrcmdContext, r = req()): boolean { r.decorations.delete(varGet(r, half(ctx))); return false; }
export function ScrCmd_checkdecorspace(ctx: ScrcmdContext, r = req()): boolean { half(ctx); setResult(r, 1); return false; }
export function ScrCmd_checkdecor(ctx: ScrcmdContext, r = req()): boolean { setResult(r, r.decorations.has(varGet(r, half(ctx))) ? 1 : 0); return false; }
export function ScrCmd_setflag(ctx: ScrcmdContext, r = req()): boolean { r.flags.add(half(ctx)); return false; }
export function ScrCmd_clearflag(ctx: ScrcmdContext, r = req()): boolean { r.flags.delete(half(ctx)); return false; }
export function ScrCmd_checkflag(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = r.flags.has(half(ctx)) ? 1 : 0; return false; }
export function ScrCmd_incrementgamestat(ctx: ScrcmdContext, r = req()): boolean { const id = byte(ctx); r.stats.set(id, (r.stats.get(id) ?? 0) + 1); return false; }
export function ScrCmd_comparestat(ctx: ScrcmdContext, r = req()): boolean { const id = byte(ctx); ctx.comparisonResult = Compare(r.stats.get(id) ?? 0, Number(word(ctx))); return false; }
export function ScrCmd_setworldmapflag(ctx: ScrcmdContext, r = req()): boolean { op(r, 'QuestLog_RecordEnteredMap', half(ctx)); return false; }
export function ScrCmd_animateflash(ctx: ScrcmdContext, r = req()): boolean { op(r, 'AnimateFlash', byte(ctx)); stopScript(ctx); return true; }
export function ScrCmd_setflashlevel(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetFlashLevel', varGet(r, half(ctx))); return false; }
export function IsPaletteNotActive(r = req()): boolean { return !r.paletteActive; }
export function ScrCmd_fadescreen(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FadeScreen', byte(ctx), 0); setupNative(ctx, () => IsPaletteNotActive(r)); return true; }
export function ScrCmd_fadescreenspeed(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FadeScreen', byte(ctx), byte(ctx)); setupNative(ctx, () => IsPaletteNotActive(r)); return true; }
export function RunPauseTimer(r = req()): boolean { r.pauseCounter = (r.pauseCounter - 1) & 0xffff; return r.pauseCounter === 0; }
export function ScrCmd_delay(ctx: ScrcmdContext, r = req()): boolean { r.pauseCounter = half(ctx); setupNative(ctx, () => RunPauseTimer(r)); return true; }
export function ScrCmd_initclock(ctx: ScrcmdContext, r = req()): boolean { op(r, 'RtcInitLocalTimeOffset', varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_dotimebasedevents(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'DoTimeBasedEvents'); return false; }
export function ScrCmd_gettime(_ctx: ScrcmdContext, r = req()): boolean { varSet(r, 0x8000, 0); varSet(r, 0x8001, 0); varSet(r, 0x8002, 0); return false; }
export function ScrCmd_setweather(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetSavedWeather', varGet(r, half(ctx))); return false; }
export function ScrCmd_resetweather(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetSavedWeatherFromCurrMapHeader'); return false; }
export function ScrCmd_doweather(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'DoCurrentWeather'); return false; }
export function ScrCmd_setstepcallback(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ActivatePerStepCallback', byte(ctx)); return false; }
export function ScrCmd_setmaplayoutindex(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetCurrentMapLayout', varGet(r, half(ctx))); return false; }
export function ScrCmd_warp(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'DoWarp'); op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_warpsilent(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'DoDiveWarp'); op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_warpdoor(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'DoDoorWarp'); op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_warphole(ctx: ScrcmdContext, r = req()): boolean { const group = byte(ctx); const num = byte(ctx); r.warp = { mapGroup: group, mapNum: num, warpId: -1, x: r.playerX - 7, y: r.playerY - 7, type: 'DoFallWarp' }; op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_warpteleport(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'DoTeleportWarp'); op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_warpspinenter(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'DoTeleport2Warp'); op(r, 'SavePlayerFacingDirectionForTeleport'); op(r, 'ResetInitialPlayerAvatarState'); return true; }
export function ScrCmd_setwarp(ctx: ScrcmdContext, r = req()): boolean { r.warp = readWarp(ctx, r, 'SetWarpDestination'); return false; }
export function ScrCmd_setdynamicwarp(ctx: ScrcmdContext, r = req()): boolean { r.dynamicWarp = readWarp(ctx, r, 'SetDynamicWarpWithCoords'); return false; }
export function ScrCmd_setdivewarp(ctx: ScrcmdContext, r = req()): boolean { r.diveWarp = readWarp(ctx, r, 'SetFixedDiveWarp'); return false; }
export function ScrCmd_setholewarp(ctx: ScrcmdContext, r = req()): boolean { r.holeWarp = readWarp(ctx, r, 'SetFixedHoleWarp'); return false; }
export function ScrCmd_setescapewarp(ctx: ScrcmdContext, r = req()): boolean { r.escapeWarp = readWarp(ctx, r, 'SetEscapeWarp'); return false; }
export function ScrCmd_getplayerxy(ctx: ScrcmdContext, r = req()): boolean { varSet(r, half(ctx), r.playerX); varSet(r, half(ctx), r.playerY); return false; }
export function ScrCmd_getpartysize(_ctx: ScrcmdContext, r = req()): boolean { setResult(r, r.party.length); return false; }
export function ScrCmd_playse(ctx: ScrcmdContext, r = req()): boolean { r.soundEffectPlaying = true; op(r, 'PlaySE', half(ctx)); return false; }
export function WaitForSoundEffectFinish(r = req()): boolean { return !r.soundEffectPlaying; }
export function ScrCmd_waitse(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => WaitForSoundEffectFinish(r)); return true; }
export function ScrCmd_playfanfare(ctx: ScrcmdContext, r = req()): boolean { r.fanfareActive = true; op(r, 'PlayFanfare', half(ctx)); return false; }
export function WaitForFanfareFinish(r = req()): boolean { return !r.fanfareActive; }
export function ScrCmd_waitfanfare(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => WaitForFanfareFinish(r)); return true; }
export function ScrCmd_playbgm(ctx: ScrcmdContext, r = req()): boolean { const song = half(ctx); const save = byte(ctx); if (save) op(r, 'Overworld_SetSavedMusic', song); op(r, 'PlayNewMapMusic', song); return false; }
export function ScrCmd_savebgm(ctx: ScrcmdContext, r = req()): boolean { op(r, 'Overworld_SetSavedMusic', half(ctx)); return false; }
export function ScrCmd_fadedefaultbgm(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'Overworld_ChangeMusicToDefault'); return false; }
export function ScrCmd_fadenewbgm(ctx: ScrcmdContext, r = req()): boolean { op(r, 'Overworld_ChangeMusicTo', half(ctx)); return false; }
export function ScrCmd_fadeoutbgm(ctx: ScrcmdContext, r = req()): boolean { const speed = byte(ctx); op(r, 'FadeOutBGMTemporarily', speed ? 4 * speed : 4); setupNative(ctx, () => r.bgmPaused); return true; }
export function ScrCmd_fadeinbgm(ctx: ScrcmdContext, r = req()): boolean { const speed = byte(ctx); op(r, 'FadeInBGM', speed ? 4 * speed : 4); return false; }
export function ScrCmd_applymovement(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const movement = word(ctx); r.movingNpcId = id; r.movingNpcMapGroup = r.mapGroup; r.movingNpcMapNum = r.mapNum; op(r, 'ScriptMovement_StartObjectMovementScript', id, r.mapNum, r.mapGroup, movement); return false; }
export function ScrCmd_applymovementat(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const movement = word(ctx); const group = byte(ctx); const num = byte(ctx); r.movingNpcId = id; r.movingNpcMapGroup = group; r.movingNpcMapNum = num; op(r, 'ScriptMovement_StartObjectMovementScript', id, num, group, movement); return false; }
export function WaitForMovementFinish(_runtime = req()): boolean { return true; }
export function ScrCmd_waitmovement(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); if (id !== LOCALID_NONE) r.movingNpcId = id; r.movingNpcMapGroup = r.mapGroup; r.movingNpcMapNum = r.mapNum; setupNative(ctx, () => WaitForMovementFinish(r)); return true; }
export function ScrCmd_waitmovementat(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); if (id !== LOCALID_NONE) r.movingNpcId = id; r.movingNpcMapGroup = byte(ctx); r.movingNpcMapNum = byte(ctx); setupNative(ctx, () => WaitForMovementFinish(r)); return true; }
export function ScrCmd_removeobject(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).hidden = true; return false; }
export function ScrCmd_removeobjectat(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const group = byte(ctx); const num = byte(ctx); const obj = object(r, id); obj.mapGroup = group; obj.mapNum = num; obj.hidden = true; return false; }
export function ScrCmd_addobject(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).hidden = false; return false; }
export function ScrCmd_addobjectat(ctx: ScrcmdContext, r = req()): boolean { const id = varGet(r, half(ctx)); const group = byte(ctx); const num = byte(ctx); const obj = object(r, id); obj.mapGroup = group; obj.mapNum = num; obj.hidden = false; return false; }
export function ScrCmd_setobjectxy(ctx: ScrcmdContext, r = req()): boolean { const obj = object(r, varGet(r, half(ctx))); obj.x = varGet(r, half(ctx)); obj.y = varGet(r, half(ctx)); return false; }
export function ScrCmd_setobjectxyperm(ctx: ScrcmdContext, r = req()): boolean { return ScrCmd_setobjectxy(ctx, r); }
export function ScrCmd_copyobjectxytoperm(ctx: ScrcmdContext, r = req()): boolean { op(r, 'CopyObjectEventCoordsToPerm', varGet(r, half(ctx))); return false; }
export function ScrCmd_showobjectat(ctx: ScrcmdContext, r = req()): boolean { return ScrCmd_addobjectat(ctx, r); }
export function ScrCmd_hideobjectat(ctx: ScrcmdContext, r = req()): boolean { return ScrCmd_removeobjectat(ctx, r); }
export function ScrCmd_setobjectsubpriority(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).subpriority = byte(ctx); return false; }
export function ScrCmd_resetobjectsubpriority(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).subpriority = 0; return false; }
export function ScrCmd_faceplayer(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'FacePlayer'); return false; }
export function ScrCmd_turnobject(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).direction = byte(ctx); return false; }
export function ScrCmd_setobjectmovementtype(ctx: ScrcmdContext, r = req()): boolean { object(r, varGet(r, half(ctx))).movementType = byte(ctx); return false; }
export function ScrCmd_createvobject(ctx: ScrcmdContext, r = req()): boolean { const id = byte(ctx); const obj = object(r, id); obj.x = varGet(r, half(ctx)); obj.y = varGet(r, half(ctx)); obj.direction = byte(ctx); return false; }
export function ScrCmd_turnvobject(ctx: ScrcmdContext, r = req()): boolean { object(r, byte(ctx)).direction = byte(ctx); return false; }
export function ScrCmd_lockall(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptFreezeObjectEvents'); return false; }
export function ScrCmd_lock(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'LockSelectedObjectEvent'); return false; }
export function ScrCmd_releaseall(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptUnfreezeObjectEvents'); return false; }
export function ScrCmd_release(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'UnlockSelectedObjectEvent'); return false; }
export function ScrCmd_textcolor(ctx: ScrcmdContext, r = req()): boolean { r.textColor = byte(ctx); return false; }
export function ScrCmd_message(ctx: ScrcmdContext, r = req()): boolean { r.message = String(word(ctx)); op(r, 'ShowFieldMessage', r.message); return false; }
export function ScrCmd_loadhelp(ctx: ScrcmdContext, r = req()): boolean { op(r, 'LoadHelp', word(ctx)); return false; }
export function ScrCmd_unloadhelp(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'UnloadHelp'); return false; }
export function ScrCmd_messageautoscroll(ctx: ScrcmdContext, r = req()): boolean { r.message = String(word(ctx)); op(r, 'ShowFieldAutoScrollMessage', r.message); return false; }
export function ScrCmd_waitmessage(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => true); op(r, 'WaitFieldMessage'); return true; }
export function ScrCmd_closemessage(_ctx: ScrcmdContext, r = req()): boolean { r.message = ''; op(r, 'CloseFieldMessage'); return false; }
export function WaitForAorBPress(r = req()): boolean { return r.questLogInput !== 0; }
export function ScriptContext_NextCommandEndsScript(ctx: ScrcmdContext): boolean { return ctx.script[ctx.pc] === 0 || ctx.stopped; }
export function ScriptContext_GetQuestLogInput(_ctx: ScrcmdContext, r = req()): number { return r.questLogInput; }
export function ScrCmd_waitbuttonpress(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => WaitForAorBPress(r)); return true; }
export function ScrCmd_yesnobox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptMenu_YesNo', byte(ctx), byte(ctx)); stopScript(ctx); return true; }
export function ScrCmd_multichoice(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptMenu_Multichoice', byte(ctx), byte(ctx), byte(ctx), 0); stopScript(ctx); return true; }
export function ScrCmd_multichoicedefault(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptMenu_Multichoice', byte(ctx), byte(ctx), byte(ctx), byte(ctx)); stopScript(ctx); return true; }
export function ScrCmd_drawbox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'DrawWindow', byte(ctx), byte(ctx), byte(ctx), byte(ctx)); return false; }
export function ScrCmd_multichoicegrid(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ScriptMenu_MultichoiceGrid', byte(ctx), byte(ctx), byte(ctx), byte(ctx), byte(ctx)); stopScript(ctx); return true; }
export function ScrCmd_erasebox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ClearWindow', byte(ctx), byte(ctx), byte(ctx), byte(ctx)); return false; }
export function ScrCmd_drawboxtext(ctx: ScrcmdContext, r = req()): boolean { op(r, 'DrawWindowText', byte(ctx), byte(ctx), byte(ctx), byte(ctx), word(ctx)); return false; }
export function ScrCmd_showmonpic(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowMonPic', varGet(r, half(ctx)), byte(ctx), byte(ctx)); return false; }
export function ScrCmd_hidemonpic(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'HideMonPic'); return false; }
export function ScrCmd_showcontestpainting(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowContestPainting', byte(ctx)); return false; }
export function ScrCmd_braillemessage(ctx: ScrcmdContext, r = req()): boolean { r.message = String(word(ctx)); op(r, 'ShowBrailleMessage', r.message); return false; }
export function ScrCmd_getbraillestringwidth(ctx: ScrcmdContext, r = req()): boolean { setResult(r, String(word(ctx)).length * 6); return false; }
export function ScrCmd_vmessage(ctx: ScrcmdContext, r = req()): boolean { r.message = String(r.words.get(toAddr(word(ctx))) ?? ''); op(r, 'ShowFieldMessage', r.message); return false; }
export function ScrCmd_bufferspeciesname(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `SPECIES_${varGet(r, half(ctx))}`); return false; }
export function ScrCmd_bufferleadmonspeciesname(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `SPECIES_${r.party[0]?.species ?? 0}`); return false; }
export function ScrCmd_bufferpartymonnick(ctx: ScrcmdContext, r = req()): boolean { const slot = varGet(r, half(ctx)); r.buffers.set(byte(ctx), r.party[slot]?.nickname ?? `MON_${slot}`); return false; }
export function ScrCmd_bufferitemname(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `ITEM_${varGet(r, half(ctx))}`); return false; }
export function ScrCmd_bufferitemnameplural(ctx: ScrcmdContext, r = req()): boolean { const slot = byte(ctx); const item = varGet(r, half(ctx)); const qty = varGet(r, half(ctx)); r.buffers.set(slot, `ITEM_${item}${qty === 1 ? '' : 'S'}`); return false; }
export function ScrCmd_bufferdecorationname(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `DECOR_${varGet(r, half(ctx))}`); return false; }
export function ScrCmd_buffermovename(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `MOVE_${varGet(r, half(ctx))}`); return false; }
export function ScrCmd_buffernumberstring(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), String(varGet(r, half(ctx)))); return false; }
export function ScrCmd_bufferstdstring(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `STD_${byte(ctx)}`); return false; }
export function ScrCmd_bufferstring(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), String(word(ctx))); return false; }
export function ScrCmd_vbuffermessage(ctx: ScrcmdContext, r = req()): boolean { r.message = String(r.words.get(toAddr(word(ctx))) ?? ''); return false; }
export function ScrCmd_vbufferstring(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), String(r.words.get(toAddr(word(ctx))) ?? '')); return false; }
export function ScrCmd_bufferboxname(ctx: ScrcmdContext, r = req()): boolean { r.buffers.set(byte(ctx), `BOX_${varGet(r, half(ctx))}`); return false; }
export function ScrCmd_givemon(ctx: ScrcmdContext, r = req()): boolean { const mon = { species: varGet(r, half(ctx)), level: varGet(r, half(ctx)), item: varGet(r, half(ctx)), moves: [varGet(r, half(ctx)), varGet(r, half(ctx)), varGet(r, half(ctx)), varGet(r, half(ctx))], isEgg: false, modernFatefulEncounter: false, metLocation: 0 }; r.party.push(mon); setResult(r, 0); return false; }
export function ScrCmd_giveegg(ctx: ScrcmdContext, r = req()): boolean { r.party.push({ species: varGet(r, half(ctx)), level: 5, item: 0, moves: [], isEgg: true, modernFatefulEncounter: false, metLocation: 0 }); setResult(r, 0); return false; }
export function ScrCmd_setmonmove(ctx: ScrcmdContext, r = req()): boolean { const slot = varGet(r, half(ctx)); const moveSlot = varGet(r, half(ctx)); const move = varGet(r, half(ctx)); if (r.party[slot]) r.party[slot].moves[moveSlot] = move; return false; }
export function ScrCmd_checkpartymove(ctx: ScrcmdContext, r = req()): boolean { const move = varGet(r, half(ctx)); setResult(r, r.party.findIndex(mon => mon.moves.includes(move))); return false; }
export function ScrCmd_addmoney(ctx: ScrcmdContext, r = req()): boolean { r.money += varGet(r, half(ctx)); return false; }
export function ScrCmd_removemoney(ctx: ScrcmdContext, r = req()): boolean { r.money = Math.max(0, r.money - varGet(r, half(ctx))); return false; }
export function ScrCmd_checkmoney(ctx: ScrcmdContext, r = req()): boolean { setResult(r, r.money >= varGet(r, half(ctx)) ? 1 : 0); return false; }
export function ScrCmd_showmoneybox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowMoneyBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_hidemoneybox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'HideMoneyBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_updatemoneybox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'UpdateMoneyBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_showcoinsbox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowCoinsBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_hidecoinsbox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'HideCoinsBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_updatecoinsbox(ctx: ScrcmdContext, r = req()): boolean { op(r, 'UpdateCoinsBox', byte(ctx), byte(ctx)); return false; }
export function ScrCmd_trainerbattle(ctx: ScrcmdContext, r = req()): boolean { op(r, 'TrainerBattleLoadArgs', byte(ctx), half(ctx), word(ctx), word(ctx)); return false; }
export function ScrCmd_dotrainerbattle(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'DoTrainerBattle'); stopScript(r.ctx); return true; }
export function ScrCmd_gotopostbattlescript(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'GotoPostBattleScript'); return false; }
export function ScrCmd_gotobeatenscript(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'GotoBeatenScript'); return false; }
export function ScrCmd_checktrainerflag(ctx: ScrcmdContext, r = req()): boolean { ctx.comparisonResult = r.flags.has(0x5000 + half(ctx)) ? 1 : 0; return false; }
export function ScrCmd_settrainerflag(ctx: ScrcmdContext, r = req()): boolean { r.flags.add(0x5000 + half(ctx)); return false; }
export function ScrCmd_cleartrainerflag(ctx: ScrcmdContext, r = req()): boolean { r.flags.delete(0x5000 + half(ctx)); return false; }
export function ScrCmd_setwildbattle(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetWildBattle', varGet(r, half(ctx)), varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_dowildbattle(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'DoWildBattle'); stopScript(r.ctx); return true; }
export function ScrCmd_pokemart(ctx: ScrcmdContext, r = req()): boolean { op(r, 'CreatePokemartMenu', word(ctx)); stopScript(ctx); return true; }
export function ScrCmd_pokemartdecoration(ctx: ScrcmdContext, r = req()): boolean { op(r, 'CreateDecorationShop1Menu', word(ctx)); stopScript(ctx); return true; }
export function ScrCmd_pokemartdecoration2(ctx: ScrcmdContext, r = req()): boolean { op(r, 'CreateDecorationShop2Menu', word(ctx)); stopScript(ctx); return true; }
export function ScrCmd_playslotmachine(ctx: ScrcmdContext, r = req()): boolean { op(r, 'PlaySlotMachine', varGet(r, half(ctx))); stopScript(ctx); return true; }
export function ScrCmd_setberrytree(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetBerryTree', byte(ctx), varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_getpokenewsactive(_ctx: ScrcmdContext, r = req()): boolean { setResult(r, 0); return false; }
export function ScrCmd_choosecontestmon(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'ChooseContestMon'); stopScript(r.ctx); return true; }
export function ScrCmd_startcontest(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'StartContest'); stopScript(r.ctx); return true; }
export function ScrCmd_showcontestresults(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowContestResults'); stopScript(r.ctx); return true; }
export function ScrCmd_contestlinktransfer(_ctx: ScrcmdContext, r = req()): boolean { op(r, 'ContestLinkTransfer'); stopScript(r.ctx); return true; }
export function ScrCmd_dofieldeffect(ctx: ScrcmdContext, r = req()): boolean { const id = half(ctx); r.fieldEffects.add(id); r.fieldEffectScriptId = id; op(r, 'FieldEffectStart', id); return false; }
export function ScrCmd_setfieldeffectargument(ctx: ScrcmdContext, r = req()): boolean { r.fieldEffectArgs[byte(ctx)] = varGet(r, half(ctx)); return false; }
export function WaitForFieldEffectFinish(r = req()): boolean { return !r.fieldEffects.has(r.fieldEffectScriptId); }
export function ScrCmd_waitfieldeffect(ctx: ScrcmdContext, r = req()): boolean { r.fieldEffectScriptId = half(ctx); setupNative(ctx, () => WaitForFieldEffectFinish(r)); return true; }
export function ScrCmd_setrespawn(ctx: ScrcmdContext, r = req()): boolean { op(r, 'SetRespawn', half(ctx)); return false; }
export function ScrCmd_checkplayergender(_ctx: ScrcmdContext, r = req()): boolean { setResult(r, 0); return false; }
export function ScrCmd_playmoncry(ctx: ScrcmdContext, r = req()): boolean { r.lastMonCry = varGet(r, half(ctx)); op(r, 'PlayCry', r.lastMonCry, half(ctx)); return false; }
export function ScrCmd_waitmoncry(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => r.lastMonCry !== null); return true; }
export function ScrCmd_setmetatile(ctx: ScrcmdContext, r = req()): boolean { op(r, 'MapGridSetMetatileIdAt', varGet(r, half(ctx)), varGet(r, half(ctx)), varGet(r, half(ctx)), half(ctx)); return false; }
export function ScrCmd_opendoor(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FieldAnimateDoorOpen', varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_closedoor(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FieldAnimateDoorClose', varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function IsDoorAnimationStopped(_runtime = req()): boolean { return true; }
export function ScrCmd_waitdooranim(ctx: ScrcmdContext, r = req()): boolean { setupNative(ctx, () => IsDoorAnimationStopped(r)); return true; }
export function ScrCmd_setdooropen(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FieldSetDoorOpened', varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_setdoorclosed(ctx: ScrcmdContext, r = req()): boolean { op(r, 'FieldSetDoorClosed', varGet(r, half(ctx)), varGet(r, half(ctx))); return false; }
export function ScrCmd_addelevmenuitem(ctx: ScrcmdContext, r = req()): boolean { op(r, 'AddElevatorMenuItem', byte(ctx), byte(ctx), byte(ctx), byte(ctx)); return false; }
export function ScrCmd_showelevmenu(ctx: ScrcmdContext, r = req()): boolean { op(r, 'ShowElevatorMenu'); stopScript(ctx); return true; }
export function ScrCmd_checkcoins(ctx: ScrcmdContext, r = req()): boolean { setResult(r, r.coins >= varGet(r, half(ctx)) ? 1 : 0); return false; }
export function ScrCmd_addcoins(ctx: ScrcmdContext, r = req()): boolean { r.coins += varGet(r, half(ctx)); return false; }
export function ScrCmd_removecoins(ctx: ScrcmdContext, r = req()): boolean { r.coins = Math.max(0, r.coins - varGet(r, half(ctx))); return false; }
export function ScrCmd_signmsg(_ctx: ScrcmdContext, r = req()): boolean { r.signMessage = true; return false; }
export function ScrCmd_normalmsg(_ctx: ScrcmdContext, r = req()): boolean { r.signMessage = false; return false; }
export function ScrCmd_setmonmodernfatefulencounter(ctx: ScrcmdContext, r = req()): boolean { const mon = r.party[varGet(r, half(ctx))]; if (mon) mon.modernFatefulEncounter = true; return false; }
export function ScrCmd_checkmonmodernfatefulencounter(ctx: ScrcmdContext, r = req()): boolean { const mon = r.party[varGet(r, half(ctx))]; setResult(r, mon?.modernFatefulEncounter ? 1 : 0); return false; }
export function ScrCmd_setmonmetlocation(ctx: ScrcmdContext, r = req()): boolean { const mon = r.party[varGet(r, half(ctx))]; const location = varGet(r, half(ctx)); if (mon) mon.metLocation = location; return false; }
