export interface FieldEffectScriptRef { script: number[]; offset: number; }
export interface FieldEffectResult { value: number; }
export interface FieldEffectSprite { id: number; x: number; y: number; x2: number; y2: number; data: number[]; callback: string | null; invisible: boolean; destroyed: boolean; animEnded: boolean; affineAnimEnded: boolean; palette: number; }
export interface FieldEffectTask { id: number; data: number[]; func: string | null; destroyed: boolean; }
export interface FieldEffectRuntime {
  operations: string[];
  fieldEffectArguments: number[];
  activeList: number[];
  activeEffects: Set<number>;
  scripts: Map<number, number[]>;
  nativeFns: Map<number, (runtime: FieldEffectRuntime) => number>;
  loadedTiles: Set<number>;
  loadedPalettes: Set<number>;
  freedTiles: number[];
  freedPalettes: number[];
  sprites: FieldEffectSprite[];
  tasks: FieldEffectTask[];
  player: { x: number; y: number; direction: number; hidden: boolean; moving: boolean; elevation: number; spriteId: number };
  callbacks: { field: string | null; vblank: string | null; main: string | null };
  map: { type: string; warp: string | null; faded: boolean; weather: string | null };
  flyBird: { spriteId: number | null; playerSpriteId: number | null; animCompleted: boolean; returning: boolean };
  deoxysRock: { exists: boolean; x: number; y: number; fragments: number[]; cameraShake: boolean };
  globalTint: { r: number; g: number; b: number };
  nextSpriteId: number;
  nextTaskId: number;
}

let activeRuntime: FieldEffectRuntime | null = null;
const FIELD_EFFECT_COUNT = 32;
const CMD_END = 4;
const EMPTY_SLOT = 0xff;

export function createFieldEffectRuntime(overrides: Partial<FieldEffectRuntime> = {}): FieldEffectRuntime {
  const runtime: FieldEffectRuntime = {
    operations: [],
    fieldEffectArguments: Array.from({ length: 8 }, () => 0),
    activeList: Array.from({ length: FIELD_EFFECT_COUNT }, () => EMPTY_SLOT),
    activeEffects: new Set(),
    scripts: new Map(),
    nativeFns: new Map(),
    loadedTiles: new Set(),
    loadedPalettes: new Set(),
    freedTiles: [],
    freedPalettes: [],
    sprites: [],
    tasks: [],
    player: { x: 0, y: 0, direction: 1, hidden: false, moving: false, elevation: 0, spriteId: 0 },
    callbacks: { field: null, vblank: null, main: null },
    map: { type: 'outdoors', warp: null, faded: false, weather: null },
    flyBird: { spriteId: null, playerSpriteId: null, animCompleted: false, returning: false },
    deoxysRock: { exists: true, x: 0, y: 0, fragments: [], cameraShake: false },
    globalTint: { r: 0, g: 0, b: 0 },
    nextSpriteId: 0,
    nextTaskId: 0,
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
}

const req = (runtime?: FieldEffectRuntime): FieldEffectRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('field effect runtime is not active'); return r; };
const op = (r: FieldEffectRuntime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const makeSprite = (r: FieldEffectRuntime, callback: string | null, x = 0, y = 0): number => {
  const id = r.nextSpriteId++;
  r.sprites[id] = { id, x, y, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback, invisible: false, destroyed: false, animEnded: false, affineAnimEnded: false, palette: 0 };
  op(r, 'CreateSprite', callback ?? 'null', id);
  return id;
};
const sprite = (r: FieldEffectRuntime, id: number): FieldEffectSprite => r.sprites[id] ?? (r.sprites[id] = { id, x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback: null, invisible: false, destroyed: false, animEnded: false, affineAnimEnded: false, palette: 0 });
const makeTask = (r: FieldEffectRuntime, func: string): number => {
  const id = r.nextTaskId++;
  r.tasks[id] = { id, data: Array.from({ length: 16 }, () => 0), func, destroyed: false };
  op(r, 'CreateTask', func, id);
  return id;
};
const task = (r: FieldEffectRuntime, id: number): FieldEffectTask => r.tasks[id] ?? (r.tasks[id] = { id, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false });
const destroySprite = (r: FieldEffectRuntime, id: number): void => { const sp = sprite(r, id); sp.destroyed = true; sp.callback = null; op(r, 'DestroySprite', id); };
const destroyTask = (r: FieldEffectRuntime, id: number): void => { const t = task(r, id); t.destroyed = true; t.func = null; op(r, 'DestroyTask', id); };
const readWord = (script: FieldEffectScriptRef): number => { const lo = script.script[script.offset++] ?? 0; const hi = script.script[script.offset++] ?? 0; return lo | (hi << 8); };
const commandResult = (result?: FieldEffectResult, value = 0): void => { if (result) result.value = value; };
const runStep = (name: string, taskId: number, r: FieldEffectRuntime, next?: string, frames = 1): void => {
  const t = task(r, taskId);
  op(r, name, taskId);
  t.data[0]++;
  if (next) t.func = next;
  if (!next && t.data[0] >= frames) destroyTask(r, taskId);
};
const runSpriteStep = (name: string, spriteId: number, r: FieldEffectRuntime, next?: string, frames = 16): void => {
  const sp = sprite(r, spriteId);
  op(r, name, spriteId);
  sp.data[0]++;
  sp.y2 += sp.data[1] || 0;
  if (next) sp.callback = next;
  if (!next && sp.data[0] >= frames) destroySprite(r, spriteId);
};
const startTaskEffect = (r: FieldEffectRuntime, effectId: number, taskName: string): number => { FieldEffectActiveListAdd(effectId, r); makeTask(r, taskName); return 0; };
const genericTask = (name: string, next?: string) => (taskId = 0, runtime?: FieldEffectRuntime): void => runStep(name, taskId, req(runtime), next);
const genericSprite = (name: string, next?: string) => (spriteId = 0, runtime?: FieldEffectRuntime): void => runSpriteStep(name, spriteId, req(runtime), next);
const genericFieldEffect = (name: string, effectId: number, taskName?: string) => (runtime?: FieldEffectRuntime): number => { const r = req(runtime); op(r, name); return taskName ? startTaskEffect(r, effectId, taskName) : FieldEffectStart(effectId, r); };

export function FieldEffectStart(fldeff: number, r = req()): number {
  FieldEffectActiveListAdd(fldeff, r);
  op(r, 'FieldEffectStart', fldeff);
  const script = r.scripts.get(fldeff);
  const result = { value: fldeff };
  if (!script) return result.value;
  const ref = { script, offset: 0 };
  while (ref.offset < ref.script.length) {
    const cmd = ref.script[ref.offset++] ?? CMD_END;
    const done = [FieldEffectCmd_loadtiles, FieldEffectCmd_loadfadedpal, FieldEffectCmd_loadpal, FieldEffectCmd_callnative, FieldEffectCmd_end, FieldEffectCmd_loadgfx_callnative, FieldEffectCmd_loadtiles_callnative, FieldEffectCmd_loadfadedpal_callnative][cmd]?.(ref, result, r) ?? true;
    if (done) break;
  }
  return result.value;
}
export function FieldEffectCmd_loadtiles(script: FieldEffectScriptRef, result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadTiles(script, r); commandResult(result, result?.value ?? 0); return false; }
export function FieldEffectCmd_loadfadedpal(script: FieldEffectScriptRef, _result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadFadedPal(script, r); return false; }
export function FieldEffectCmd_loadpal(script: FieldEffectScriptRef, _result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadPal(script, r); return false; }
export function FieldEffectCmd_callnative(script: FieldEffectScriptRef, result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_CallNative(script, result ?? { value: 0 }, r); return false; }
export function FieldEffectCmd_end(_script?: FieldEffectScriptRef, _result?: FieldEffectResult, _r = req()): boolean { return true; }
export function FieldEffectCmd_loadgfx_callnative(script: FieldEffectScriptRef, result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadTiles(script, r); FieldEffectScript_LoadFadedPal(script, r); FieldEffectScript_CallNative(script, result ?? { value: 0 }, r); return false; }
export function FieldEffectCmd_loadtiles_callnative(script: FieldEffectScriptRef, result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadTiles(script, r); FieldEffectScript_CallNative(script, result ?? { value: 0 }, r); return false; }
export function FieldEffectCmd_loadfadedpal_callnative(script: FieldEffectScriptRef, result?: FieldEffectResult, r = req()): boolean { FieldEffectScript_LoadFadedPal(script, r); FieldEffectScript_CallNative(script, result ?? { value: 0 }, r); return false; }
export function FieldEffectScript_ReadWord(script: FieldEffectScriptRef): number { return readWord(script); }
export function FieldEffectScript_LoadTiles(script: FieldEffectScriptRef, r = req()): void { const tag = readWord(script); r.loadedTiles.add(tag); op(r, 'LoadTiles', tag); }
export function ApplyGlobalFieldPaletteTint(r = req()): void { r.globalTint = { r: 16, g: 16, b: 16 }; op(r, 'ApplyGlobalFieldPaletteTint'); }
export function FieldEffectScript_LoadFadedPal(script: FieldEffectScriptRef, r = req()): void { const pal = readWord(script); r.loadedPalettes.add(pal); ApplyGlobalFieldPaletteTint(r); op(r, 'LoadFadedPal', pal); }
export function FieldEffectScript_LoadPal(script: FieldEffectScriptRef, r = req()): void { const pal = readWord(script); r.loadedPalettes.add(pal); op(r, 'LoadPal', pal); }
export function FieldEffectScript_CallNative(script: FieldEffectScriptRef, result: FieldEffectResult, r = req()): void { const fnId = readWord(script); result.value = r.nativeFns.get(fnId)?.(r) ?? fnId; op(r, 'CallNative', fnId, result.value); }
export function FieldEffectFreeGraphicsResources(fldeff: number, r = req()): void { FieldEffectFreeTilesIfUnused(fldeff, r); FieldEffectFreePaletteIfUnused(fldeff, r); }
export function FieldEffectStop(spriteArg: FieldEffectSprite | number, fldeff: number, r = req()): void { FieldEffectActiveListRemove(fldeff, r); if (typeof spriteArg === 'number') destroySprite(r, spriteArg); else spriteArg.destroyed = true; op(r, 'FieldEffectStop', fldeff); }
export function FieldEffectFreeTilesIfUnused(tilesTag: number, r = req()): void { r.loadedTiles.delete(tilesTag); r.freedTiles.push(tilesTag); op(r, 'FreeTiles', tilesTag); }
export function FieldEffectFreePaletteIfUnused(paletteNum: number, r = req()): void { r.loadedPalettes.delete(paletteNum); r.freedPalettes.push(paletteNum); op(r, 'FreePalette', paletteNum); }
export function FieldEffectActiveListClear(r = req()): void { r.activeList.fill(EMPTY_SLOT); r.activeEffects.clear(); }
export function FieldEffectActiveListAdd(fldeff: number, r = req()): void { if (!r.activeEffects.has(fldeff)) { const idx = r.activeList.indexOf(EMPTY_SLOT); if (idx >= 0) r.activeList[idx] = fldeff; } r.activeEffects.add(fldeff); }
export function FieldEffectActiveListRemove(fldeff: number, r = req()): void { r.activeEffects.delete(fldeff); const idx = r.activeList.indexOf(fldeff); if (idx >= 0) r.activeList[idx] = EMPTY_SLOT; }
export function FieldEffectActiveListContains(fldeff: number, r = req()): boolean { return r.activeEffects.has(fldeff); }
export function CreateTrainerSprite(trainerPicId: number, x: number, y: number, subpriority = 0, r = req()): number { const id = makeSprite(r, 'TrainerSprite', x, y); sprite(r, id).data[0] = trainerPicId; sprite(r, id).data[1] = subpriority; return id; }
export function LoadTrainerGfx_TrainerCard(trainerPicId: number, r = req()): void { op(r, 'LoadTrainerGfx_TrainerCard', trainerPicId); }
export function AddNewGameBirchObject(r = req()): number { return makeSprite(r, 'NewGameBirchObject', 120, 72); }
export function CreateMonSprite_PicBox(species: number, x: number, y: number, r = req()): number { const id = makeSprite(r, 'MonSprite_PicBox', x, y); sprite(r, id).data[0] = species; return id; }
export function CreateMonSprite_FieldMove(species: number, x: number, y: number, r = req()): number { const id = makeSprite(r, 'MonSprite_FieldMove', x, y); sprite(r, id).data[0] = species; return id; }
export function FreeResourcesAndDestroySprite(spriteId: number, r = req()): void { FieldEffectFreeGraphicsResources(spriteId, r); destroySprite(r, spriteId); }
export function MultiplyInvertedPaletteRGBComponents(color: number, rMul: number, gMul: number, bMul: number): number { return ((31 - (((31 - (color & 31)) * rMul) >> 4)) & 31) | (((31 - (((31 - ((color >> 5) & 31)) * gMul) >> 4)) & 31) << 5) | (((31 - (((31 - ((color >> 10) & 31)) * bMul) >> 4)) & 31) << 10); }
export function MultiplyPaletteRGBComponents(color: number, rMul: number, gMul: number, bMul: number): number { return (((color & 31) * rMul) >> 4) | (((((color >> 5) & 31) * gMul) >> 4) << 5) | (((((color >> 10) & 31) * bMul) >> 4) << 10); }

export const FldEff_PokecenterHeal = genericFieldEffect('FldEff_PokecenterHeal', 1, 'Task_PokecenterHeal');
export const Task_PokecenterHeal = genericTask('Task_PokecenterHeal', 'PokecenterHealEffect_Init');
export const PokecenterHealEffect_Init = genericTask('PokecenterHealEffect_Init', 'PokecenterHealEffect_WaitForBallPlacement');
export const PokecenterHealEffect_WaitForBallPlacement = genericTask('PokecenterHealEffect_WaitForBallPlacement', 'PokecenterHealEffect_WaitForBallFlashing');
export const PokecenterHealEffect_WaitForBallFlashing = genericTask('PokecenterHealEffect_WaitForBallFlashing', 'PokecenterHealEffect_WaitForSoundAndEnd');
export const PokecenterHealEffect_WaitForSoundAndEnd = genericTask('PokecenterHealEffect_WaitForSoundAndEnd');
export const FldEff_HallOfFameRecord = genericFieldEffect('FldEff_HallOfFameRecord', 2, 'Task_HallOfFameRecord');
export const Task_HallOfFameRecord = genericTask('Task_HallOfFameRecord', 'HallOfFameRecordEffect_Init');
export const HallOfFameRecordEffect_Init = genericTask('HallOfFameRecordEffect_Init', 'HallOfFameRecordEffect_WaitForBallPlacement');
export const HallOfFameRecordEffect_WaitForBallPlacement = genericTask('HallOfFameRecordEffect_WaitForBallPlacement', 'HallOfFameRecordEffect_WaitForBallFlashing');
export const HallOfFameRecordEffect_WaitForBallFlashing = genericTask('HallOfFameRecordEffect_WaitForBallFlashing', 'HallOfFameRecordEffect_WaitForSoundAndEnd');
export const HallOfFameRecordEffect_WaitForSoundAndEnd = genericTask('HallOfFameRecordEffect_WaitForSoundAndEnd');
export function CreateGlowingPokeballsEffect(r = req()): number { return makeSprite(r, 'SpriteCB_PokeballGlowEffect', 120, 72); }
export const SpriteCB_PokeballGlowEffect = genericSprite('SpriteCB_PokeballGlowEffect', 'PokeballGlowEffect_PlaceBalls');
export const PokeballGlowEffect_PlaceBalls = genericTask('PokeballGlowEffect_PlaceBalls', 'PokeballGlowEffect_TryPlaySe');
export const PokeballGlowEffect_TryPlaySe = genericTask('PokeballGlowEffect_TryPlaySe', 'PokeballGlowEffect_FlashFirstThree');
export const PokeballGlowEffect_FlashFirstThree = genericTask('PokeballGlowEffect_FlashFirstThree', 'PokeballGlowEffect_FlashLast');
export const PokeballGlowEffect_FlashLast = genericTask('PokeballGlowEffect_FlashLast', 'PokeballGlowEffect_WaitAfterFlash');
export const PokeballGlowEffect_WaitAfterFlash = genericTask('PokeballGlowEffect_WaitAfterFlash', 'PokeballGlowEffect_WaitForSound');
export const PokeballGlowEffect_Dummy = genericTask('PokeballGlowEffect_Dummy');
export const PokeballGlowEffect_WaitForSound = genericTask('PokeballGlowEffect_WaitForSound', 'PokeballGlowEffect_Idle');
export const PokeballGlowEffect_Idle = genericTask('PokeballGlowEffect_Idle');
export const SpriteCB_PokeballGlow = genericSprite('SpriteCB_PokeballGlow');
export function CreatePokecenterMonitorSprite(r = req()): number { return makeSprite(r, 'SpriteCB_PokecenterMonitor', 120, 56); }
export const SpriteCB_PokecenterMonitor = genericSprite('SpriteCB_PokecenterMonitor');
export function CreateHofMonitorSprite(r = req()): number { return makeSprite(r, 'SpriteCB_HallOfFameMonitor', 120, 56); }
export const SpriteCB_HallOfFameMonitor = genericSprite('SpriteCB_HallOfFameMonitor');
export function ReturnToFieldFromFlyMapSelect(r = req()): void { r.callbacks.main = 'CB2_ReturnToField'; op(r, 'ReturnToFieldFromFlyMapSelect'); }
export function FieldCallback_UseFly(r = req()): void { FieldEffectStart(3, r); r.callbacks.field = 'FieldCallback_UseFly'; }
export const Task_UseFly = genericTask('Task_UseFly');
export function FieldCallback_FlyIntoMap(r = req()): void { r.callbacks.field = 'FieldCallback_FlyIntoMap'; makeTask(r, 'Task_FlyIntoMap'); }
export const Task_FlyIntoMap = genericTask('Task_FlyIntoMap');
export function FieldCB_FallWarpExit(r = req()): void { makeTask(r, 'Task_FallWarpFieldEffect'); }
export const Task_FallWarpFieldEffect = genericTask('Task_FallWarpFieldEffect', 'FallWarpEffect_1');
export const FallWarpEffect_1 = genericTask('FallWarpEffect_1', 'FallWarpEffect_2');
export const FallWarpEffect_2 = genericTask('FallWarpEffect_2', 'FallWarpEffect_3');
export const FallWarpEffect_3 = genericTask('FallWarpEffect_3', 'FallWarpEffect_4');
export const FallWarpEffect_4 = genericTask('FallWarpEffect_4', 'FallWarpEffect_5');
export const FallWarpEffect_5 = genericTask('FallWarpEffect_5', 'FallWarpEffect_6');
export const FallWarpEffect_6 = genericTask('FallWarpEffect_6', 'FallWarpEffect_7');
export const FallWarpEffect_7 = genericTask('FallWarpEffect_7');
export function StartEscalatorWarp(r = req()): void { makeTask(r, 'Task_EscalatorWarpFieldEffect'); }
export const Task_EscalatorWarpFieldEffect = genericTask('Task_EscalatorWarpFieldEffect', 'EscalatorWarpEffect_1');
export const EscalatorWarpEffect_1 = genericTask('EscalatorWarpEffect_1', 'EscalatorWarpEffect_2');
export const EscalatorWarpEffect_2 = genericTask('EscalatorWarpEffect_2', 'EscalatorWarpEffect_3');
export const EscalatorWarpEffect_3 = genericTask('EscalatorWarpEffect_3', 'EscalatorWarpEffect_4');
export const EscalatorWarpEffect_4 = genericTask('EscalatorWarpEffect_4', 'EscalatorWarpEffect_5');
export const EscalatorWarpEffect_5 = genericTask('EscalatorWarpEffect_5', 'EscalatorWarpEffect_6');
export const EscalatorWarpEffect_6 = genericTask('EscalatorWarpEffect_6');
export function Escalator_AnimatePlayerGoingDown(r = req()): void { r.player.elevation--; op(r, 'Escalator_AnimatePlayerGoingDown'); }
export function Escalator_AnimatePlayerGoingUp(r = req()): void { r.player.elevation++; op(r, 'Escalator_AnimatePlayerGoingUp'); }
export function Escalator_BeginFadeOutToNewMap(r = req()): void { r.map.faded = true; op(r, 'Escalator_BeginFadeOutToNewMap'); }
export function Escalator_TransitionToWarpInEffect(r = req()): void { r.map.warp = 'escalator'; op(r, 'Escalator_TransitionToWarpInEffect'); }
export function FieldCB_EscalatorWarpIn(r = req()): void { makeTask(r, 'Task_EscalatorWarpInFieldEffect'); }
export const Task_EscalatorWarpInFieldEffect = genericTask('Task_EscalatorWarpInFieldEffect', 'EscalatorWarpInEffect_1');
export const EscalatorWarpInEffect_1 = genericTask('EscalatorWarpInEffect_1', 'EscalatorWarpInEffect_2');
export const EscalatorWarpInEffect_2 = genericTask('EscalatorWarpInEffect_2', 'EscalatorWarpInEffect_3');
export const EscalatorWarpInEffect_3 = genericTask('EscalatorWarpInEffect_3', 'EscalatorWarpInEffect_4');
export const EscalatorWarpInEffect_4 = genericTask('EscalatorWarpInEffect_4', 'EscalatorWarpInEffect_5');
export const EscalatorWarpInEffect_5 = genericTask('EscalatorWarpInEffect_5', 'EscalatorWarpInEffect_6');
export const EscalatorWarpInEffect_6 = genericTask('EscalatorWarpInEffect_6', 'EscalatorWarpInEffect_7');
export const EscalatorWarpInEffect_7 = genericTask('EscalatorWarpInEffect_7');
export const FldEff_UseWaterfall = genericFieldEffect('FldEff_UseWaterfall', 4, 'Task_UseWaterfall');
export const Task_UseWaterfall = genericTask('Task_UseWaterfall', 'waterfall_0_setup');
export const waterfall_0_setup = genericTask('waterfall_0_setup', 'waterfall_1_do_anim_probably');
export const waterfall_1_do_anim_probably = genericTask('waterfall_1_do_anim_probably', 'waterfall_2_wait_anim_finish_probably');
export const waterfall_2_wait_anim_finish_probably = genericTask('waterfall_2_wait_anim_finish_probably', 'waterfall_3_move_player_probably');
export const waterfall_3_move_player_probably = genericTask('waterfall_3_move_player_probably', 'waterfall_4_wait_player_move_probably');
export const waterfall_4_wait_player_move_probably = genericTask('waterfall_4_wait_player_move_probably');
export const FldEff_UseDive = genericFieldEffect('FldEff_UseDive', 5, 'Task_UseDive');
export const Task_UseDive = genericTask('Task_UseDive', 'DiveFieldEffect_Init');
export const DiveFieldEffect_Init = genericTask('DiveFieldEffect_Init', 'DiveFieldEffect_ShowMon');
export const DiveFieldEffect_ShowMon = genericTask('DiveFieldEffect_ShowMon', 'DiveFieldEffect_TryWarp');
export function DiveFieldEffect_TryWarp(taskId = 0, r = req()): void { r.map.warp = 'dive'; runStep('DiveFieldEffect_TryWarp', taskId, r); }
export function StartLavaridgeGymB1FWarp(r = req()): void { makeTask(r, 'Task_LavaridgeGymB1FWarp'); }
export const Task_LavaridgeGymB1FWarp = genericTask('Task_LavaridgeGymB1FWarp', 'LavaridgeGymB1FWarpEffect_1');
export const LavaridgeGymB1FWarpEffect_1 = genericTask('LavaridgeGymB1FWarpEffect_1', 'LavaridgeGymB1FWarpEffect_2');
export const LavaridgeGymB1FWarpEffect_2 = genericTask('LavaridgeGymB1FWarpEffect_2', 'LavaridgeGymB1FWarpEffect_3');
export const LavaridgeGymB1FWarpEffect_3 = genericTask('LavaridgeGymB1FWarpEffect_3', 'LavaridgeGymB1FWarpEffect_4');
export const LavaridgeGymB1FWarpEffect_4 = genericTask('LavaridgeGymB1FWarpEffect_4', 'LavaridgeGymB1FWarpEffect_5');
export const LavaridgeGymB1FWarpEffect_5 = genericTask('LavaridgeGymB1FWarpEffect_5', 'LavaridgeGymB1FWarpEffect_6');
export const LavaridgeGymB1FWarpEffect_6 = genericTask('LavaridgeGymB1FWarpEffect_6');
export function FieldCB_LavaridgeGymB1FWarpExit(r = req()): void { makeTask(r, 'Task_LavaridgeGymB1FWarpExit'); }
export const Task_LavaridgeGymB1FWarpExit = genericTask('Task_LavaridgeGymB1FWarpExit', 'LavaridgeGymB1FWarpExitEffect_1');
export const LavaridgeGymB1FWarpExitEffect_1 = genericTask('LavaridgeGymB1FWarpExitEffect_1', 'LavaridgeGymB1FWarpExitEffect_2');
export const LavaridgeGymB1FWarpExitEffect_2 = genericTask('LavaridgeGymB1FWarpExitEffect_2', 'LavaridgeGymB1FWarpExitEffect_3');
export const LavaridgeGymB1FWarpExitEffect_3 = genericTask('LavaridgeGymB1FWarpExitEffect_3', 'LavaridgeGymB1FWarpExitEffect_4');
export const LavaridgeGymB1FWarpExitEffect_4 = genericTask('LavaridgeGymB1FWarpExitEffect_4');
export const FldEff_LavaridgeGymWarp = genericFieldEffect('FldEff_LavaridgeGymWarp', 6);
export const SpriteCB_AshLaunch = genericSprite('SpriteCB_AshLaunch');
export function StartLavaridgeGym1FWarp(r = req()): void { makeTask(r, 'Task_LavaridgeGym1FWarp'); }
export const Task_LavaridgeGym1FWarp = genericTask('Task_LavaridgeGym1FWarp', 'LavaridgeGym1FWarpEffect_1');
export const LavaridgeGym1FWarpEffect_1 = genericTask('LavaridgeGym1FWarpEffect_1', 'LavaridgeGym1FWarpEffect_2');
export const LavaridgeGym1FWarpEffect_2 = genericTask('LavaridgeGym1FWarpEffect_2', 'LavaridgeGym1FWarpEffect_3');
export const LavaridgeGym1FWarpEffect_3 = genericTask('LavaridgeGym1FWarpEffect_3', 'LavaridgeGym1FWarpEffect_4');
export const LavaridgeGym1FWarpEffect_4 = genericTask('LavaridgeGym1FWarpEffect_4', 'LavaridgeGym1FWarpEffect_5');
export const LavaridgeGym1FWarpEffect_5 = genericTask('LavaridgeGym1FWarpEffect_5');
export const FldEff_PopOutOfAsh = genericFieldEffect('FldEff_PopOutOfAsh', 7);
export const SpriteCB_PopOutOfAsh = genericSprite('SpriteCB_PopOutOfAsh');
export function StartEscapeRopeFieldEffect(r = req()): void { makeTask(r, 'Task_EscapeRopeWarpOut'); }
export const Task_EscapeRopeWarpOut = genericTask('Task_EscapeRopeWarpOut', 'EscapeRopeWarpOutEffect_Init');
export const EscapeRopeWarpOutEffect_Init = genericTask('EscapeRopeWarpOutEffect_Init', 'EscapeRopeWarpOutEffect_Spin');
export const EscapeRopeWarpOutEffect_Spin = genericTask('EscapeRopeWarpOutEffect_Spin');
export function SpinObjectEvent(r = req()): void { r.player.direction = (r.player.direction % 4) + 1; op(r, 'SpinObjectEvent'); }
export function WarpOutObjectEventUpwards(r = req()): void { r.player.y--; r.player.hidden = true; op(r, 'WarpOutObjectEventUpwards'); }
export function WarpInObjectEventDownwards(r = req()): void { r.player.y++; r.player.hidden = false; op(r, 'WarpInObjectEventDownwards'); }
export function FieldCallback_EscapeRopeExit(r = req()): void { makeTask(r, 'Task_EscapeRopeWarpIn'); }
export const Task_EscapeRopeWarpIn = genericTask('Task_EscapeRopeWarpIn', 'EscapeRopeWarpInEffect_Init');
export const EscapeRopeWarpInEffect_Init = genericTask('EscapeRopeWarpInEffect_Init', 'EscapeRopeWarpInEffect_Spin');
export const EscapeRopeWarpInEffect_Spin = genericTask('EscapeRopeWarpInEffect_Spin');
export function CreateTeleportFieldEffectTask(r = req()): number { return makeTask(r, 'Task_DoTeleportFieldEffect'); }
export const Task_DoTeleportFieldEffect = genericTask('Task_DoTeleportFieldEffect', 'TeleportFieldEffectTask1');
export const TeleportFieldEffectTask1 = genericTask('TeleportFieldEffectTask1', 'TeleportFieldEffectTask2');
export const TeleportFieldEffectTask2 = genericTask('TeleportFieldEffectTask2', 'TeleportFieldEffectTask3');
export const TeleportFieldEffectTask3 = genericTask('TeleportFieldEffectTask3', 'TeleportFieldEffectTask4');
export function TeleportFieldEffectTask4(taskId = 0, r = req()): void { r.map.warp = 'teleport'; runStep('TeleportFieldEffectTask4', taskId, r); }
export function FieldCallback_TeleportIn(r = req()): void { makeTask(r, 'Task_DoTeleportInFieldEffect'); }
export const Task_DoTeleportInFieldEffect = genericTask('Task_DoTeleportInFieldEffect', 'TeleportInFieldEffectTask1');
export const TeleportInFieldEffectTask1 = genericTask('TeleportInFieldEffectTask1', 'TeleportInFieldEffectTask2');
export const TeleportInFieldEffectTask2 = genericTask('TeleportInFieldEffectTask2', 'TeleportInFieldEffectTask3');
export const TeleportInFieldEffectTask3 = genericTask('TeleportInFieldEffectTask3');
export const FldEff_FieldMoveShowMon = genericFieldEffect('FldEff_FieldMoveShowMon', 8, 'Task_ShowMon_Outdoors');
export const FldEff_FieldMoveShowMonInit = genericFieldEffect('FldEff_FieldMoveShowMonInit', 8);
export const Task_ShowMon_Outdoors = genericTask('Task_ShowMon_Outdoors', 'ShowMonEffect_Outdoors_1');
export const ShowMonEffect_Outdoors_1 = genericTask('ShowMonEffect_Outdoors_1', 'ShowMonEffect_Outdoors_2');
export const ShowMonEffect_Outdoors_2 = genericTask('ShowMonEffect_Outdoors_2', 'ShowMonEffect_Outdoors_3');
export const ShowMonEffect_Outdoors_3 = genericTask('ShowMonEffect_Outdoors_3', 'ShowMonEffect_Outdoors_4');
export const ShowMonEffect_Outdoors_4 = genericTask('ShowMonEffect_Outdoors_4', 'ShowMonEffect_Outdoors_5');
export const ShowMonEffect_Outdoors_5 = genericTask('ShowMonEffect_Outdoors_5', 'ShowMonEffect_Outdoors_6');
export const ShowMonEffect_Outdoors_6 = genericTask('ShowMonEffect_Outdoors_6', 'ShowMonEffect_Outdoors_7');
export const ShowMonEffect_Outdoors_7 = genericTask('ShowMonEffect_Outdoors_7');
export function VBlankCB_ShowMonEffect_Outdoors(r = req()): void { r.callbacks.vblank = 'VBlankCB_ShowMonEffect_Outdoors'; op(r, 'VBlankCB_ShowMonEffect_Outdoors'); }
export function LoadFieldMoveStreaksTilemapToVram(r = req()): void { op(r, 'LoadFieldMoveStreaksTilemapToVram'); }
export const Task_ShowMon_Indoors = genericTask('Task_ShowMon_Indoors', 'ShowMonEffect_Indoors_1');
export const ShowMonEffect_Indoors_1 = genericTask('ShowMonEffect_Indoors_1', 'ShowMonEffect_Indoors_2');
export const ShowMonEffect_Indoors_2 = genericTask('ShowMonEffect_Indoors_2', 'ShowMonEffect_Indoors_3');
export const ShowMonEffect_Indoors_3 = genericTask('ShowMonEffect_Indoors_3', 'ShowMonEffect_Indoors_4');
export const ShowMonEffect_Indoors_4 = genericTask('ShowMonEffect_Indoors_4', 'ShowMonEffect_Indoors_5');
export const ShowMonEffect_Indoors_5 = genericTask('ShowMonEffect_Indoors_5', 'ShowMonEffect_Indoors_6');
export const ShowMonEffect_Indoors_6 = genericTask('ShowMonEffect_Indoors_6', 'ShowMonEffect_Indoors_7');
export const ShowMonEffect_Indoors_7 = genericTask('ShowMonEffect_Indoors_7');
export function VBlankCB_ShowMonEffect_Indoors(r = req()): void { r.callbacks.vblank = 'VBlankCB_ShowMonEffect_Indoors'; op(r, 'VBlankCB_ShowMonEffect_Indoors'); }
export const AnimateIndoorShowMonBg = genericTask('AnimateIndoorShowMonBg');
export const SlideIndoorBannerOnscreen = genericTask('SlideIndoorBannerOnscreen');
export const SlideIndoorBannerOffscreen = genericTask('SlideIndoorBannerOffscreen');
export function InitFieldMoveMonSprite(r = req()): number { return makeSprite(r, 'SpriteCB_FieldMoveMonSlideOnscreen', 240, 80); }
export const SpriteCB_FieldMoveMonSlideOnscreen = genericSprite('SpriteCB_FieldMoveMonSlideOnscreen', 'SpriteCB_FieldMoveMonWaitAfterCry');
export const SpriteCB_FieldMoveMonWaitAfterCry = genericSprite('SpriteCB_FieldMoveMonWaitAfterCry', 'SpriteCB_FieldMoveMonSlideOffscreen');
export const SpriteCB_FieldMoveMonSlideOffscreen = genericSprite('SpriteCB_FieldMoveMonSlideOffscreen');
export const FldEff_UseSurf = genericFieldEffect('FldEff_UseSurf', 9, 'Task_FldEffUseSurf');
export const Task_FldEffUseSurf = genericTask('Task_FldEffUseSurf', 'UseSurfEffect_1');
export const UseSurfEffect_1 = genericTask('UseSurfEffect_1', 'UseSurfEffect_2');
export const UseSurfEffect_2 = genericTask('UseSurfEffect_2', 'UseSurfEffect_3');
export const UseSurfEffect_3 = genericTask('UseSurfEffect_3', 'UseSurfEffect_4');
export const UseSurfEffect_4 = genericTask('UseSurfEffect_4', 'UseSurfEffect_5');
export const UseSurfEffect_5 = genericTask('UseSurfEffect_5');
export const FldEff_UseVsSeeker = genericFieldEffect('FldEff_UseVsSeeker', 10, 'Task_FldEffUseVsSeeker');
export const Task_FldEffUseVsSeeker = genericTask('Task_FldEffUseVsSeeker', 'UseVsSeekerEffect_1');
export const UseVsSeekerEffect_1 = genericTask('UseVsSeekerEffect_1', 'UseVsSeekerEffect_2');
export const UseVsSeekerEffect_2 = genericTask('UseVsSeekerEffect_2', 'UseVsSeekerEffect_3');
export const UseVsSeekerEffect_3 = genericTask('UseVsSeekerEffect_3', 'UseVsSeekerEffect_4');
export const UseVsSeekerEffect_4 = genericTask('UseVsSeekerEffect_4');
export function FldEff_NpcFlyOut(r = req()): number { return makeSprite(r, 'SpriteCB_NPCFlyOut', r.player.x, r.player.y); }
export const SpriteCB_NPCFlyOut = genericSprite('SpriteCB_NPCFlyOut');
export const FldEff_FlyOut = genericFieldEffect('FldEff_FlyOut', 11, 'Task_FlyOut');
export const Task_FlyOut = genericTask('Task_FlyOut', 'FlyOutFieldEffect_FieldMovePose');
export const FlyOutFieldEffect_FieldMovePose = genericTask('FlyOutFieldEffect_FieldMovePose', 'FlyOutFieldEffect_ShowMon');
export const FlyOutFieldEffect_ShowMon = genericTask('FlyOutFieldEffect_ShowMon', 'FlyOutFieldEffect_BirdLeaveBall');
export const FlyOutFieldEffect_BirdLeaveBall = genericTask('FlyOutFieldEffect_BirdLeaveBall', 'FlyOutFieldEffect_WaitBirdLeave');
export const FlyOutFieldEffect_WaitBirdLeave = genericTask('FlyOutFieldEffect_WaitBirdLeave', 'FlyOutFieldEffect_BirdSwoopDown');
export const FlyOutFieldEffect_BirdSwoopDown = genericTask('FlyOutFieldEffect_BirdSwoopDown', 'FlyOutFieldEffect_JumpOnBird');
export const FlyOutFieldEffect_JumpOnBird = genericTask('FlyOutFieldEffect_JumpOnBird', 'FlyOutFieldEffect_FlyOffWithBird');
export const FlyOutFieldEffect_FlyOffWithBird = genericTask('FlyOutFieldEffect_FlyOffWithBird', 'FlyOutFieldEffect_WaitFlyOff');
export const FlyOutFieldEffect_WaitFlyOff = genericTask('FlyOutFieldEffect_WaitFlyOff', 'FlyOutFieldEffect_End');
export const FlyOutFieldEffect_End = genericTask('FlyOutFieldEffect_End');
export function CreateFlyBirdSprite(r = req()): number { const id = makeSprite(r, 'SpriteCB_FlyBirdLeaveBall', r.player.x, r.player.y); r.flyBird.spriteId = id; return id; }
export function GetFlyBirdAnimCompleted(r = req()): boolean { return r.flyBird.animCompleted; }
export function StartFlyBirdSwoopDown(r = req()): void { if (r.flyBird.spriteId !== null) sprite(r, r.flyBird.spriteId).callback = 'SpriteCB_FlyBirdSwoopDown'; r.flyBird.animCompleted = false; }
export function SetFlyBirdPlayerSpriteId(spriteId: number, r = req()): void { r.flyBird.playerSpriteId = spriteId; }
export const SpriteCB_FlyBirdLeaveBall = genericSprite('SpriteCB_FlyBirdLeaveBall');
export function SpriteCB_FlyBirdSwoopDown(spriteId = 0, r = req()): void { sprite(r, spriteId).y2 += 4; r.flyBird.animCompleted = true; runSpriteStep('SpriteCB_FlyBirdSwoopDown', spriteId, r); }
export function SpriteCB_FlyBirdReturnToBall(spriteId = 0, r = req()): void { sprite(r, spriteId).y2 -= 4; r.flyBird.animCompleted = true; runSpriteStep('SpriteCB_FlyBirdReturnToBall', spriteId, r); }
export function StartFlyBirdReturnToBall(r = req()): void { if (r.flyBird.spriteId !== null) sprite(r, r.flyBird.spriteId).callback = 'SpriteCB_FlyBirdReturnToBall'; r.flyBird.returning = true; r.flyBird.animCompleted = false; }
export const FldEff_FlyIn = genericFieldEffect('FldEff_FlyIn', 12, 'Task_FlyIn');
export const Task_FlyIn = genericTask('Task_FlyIn', 'FlyInFieldEffect_BirdSwoopDown');
export const FlyInFieldEffect_BirdSwoopDown = genericTask('FlyInFieldEffect_BirdSwoopDown', 'FlyInFieldEffect_FlyInWithBird');
export const FlyInFieldEffect_FlyInWithBird = genericTask('FlyInFieldEffect_FlyInWithBird', 'FlyInFieldEffect_JumpOffBird');
export const FlyInFieldEffect_JumpOffBird = genericTask('FlyInFieldEffect_JumpOffBird', 'FlyInFieldEffect_FieldMovePose');
export const FlyInFieldEffect_FieldMovePose = genericTask('FlyInFieldEffect_FieldMovePose', 'FlyInFieldEffect_BirdReturnToBall');
export const FlyInFieldEffect_BirdReturnToBall = genericTask('FlyInFieldEffect_BirdReturnToBall', 'FlyInFieldEffect_WaitBirdReturn');
export const FlyInFieldEffect_WaitBirdReturn = genericTask('FlyInFieldEffect_WaitBirdReturn', 'FlyInFieldEffect_End');
export const FlyInFieldEffect_End = genericTask('FlyInFieldEffect_End');
export function DoBirdSpriteWithPlayerAffineAnim(r = req()): void { op(r, 'DoBirdSpriteWithPlayerAffineAnim'); }
export const SpriteCB_FlyBirdWithPlayer = genericSprite('SpriteCB_FlyBirdWithPlayer');
export function TryChangeBirdSprite(r = req()): boolean { op(r, 'TryChangeBirdSprite'); return true; }
export const FldEff_MoveDeoxysRock = genericFieldEffect('FldEff_MoveDeoxysRock', 13, 'Task_MoveDeoxysRock_Step');
export function Task_MoveDeoxysRock_Step(taskId = 0, r = req()): void { r.deoxysRock.x += 1; r.deoxysRock.y += 1; runStep('Task_MoveDeoxysRock_Step', taskId, r); }
export const FldEff_DestroyDeoxysRock = genericFieldEffect('FldEff_DestroyDeoxysRock', 14, 'Task_DestroyDeoxysRock');
export function Task_DeoxysRockCameraShake(taskId = 0, r = req()): void { r.deoxysRock.cameraShake = true; runStep('Task_DeoxysRockCameraShake', taskId, r); }
export function StartEndingDeoxysRockCameraShake(r = req()): void { r.deoxysRock.cameraShake = false; op(r, 'StartEndingDeoxysRockCameraShake'); }
export const Task_DestroyDeoxysRock = genericTask('Task_DestroyDeoxysRock', 'DestroyDeoxysRockEffect_CameraShake');
export const DestroyDeoxysRockEffect_CameraShake = genericTask('DestroyDeoxysRockEffect_CameraShake', 'DestroyDeoxysRockEffect_RockFragments');
export function DestroyDeoxysRockEffect_RockFragments(taskId = 0, r = req()): void { CreateDeoxysRockFragments(r); runStep('DestroyDeoxysRockEffect_RockFragments', taskId, r, 'DestroyDeoxysRockEffect_WaitAndEnd'); }
export function DestroyDeoxysRockEffect_WaitAndEnd(taskId = 0, r = req()): void { r.deoxysRock.exists = false; runStep('DestroyDeoxysRockEffect_WaitAndEnd', taskId, r); }
export function CreateDeoxysRockFragments(r = req()): void { for (let i = 0; i < 4; i++) r.deoxysRock.fragments.push(makeSprite(r, 'SpriteCB_DeoxysRockFragment', r.deoxysRock.x, r.deoxysRock.y)); }
export const SpriteCB_DeoxysRockFragment = genericSprite('SpriteCB_DeoxysRockFragment');
export function Task_PhotoFlash(taskId = 0, r = req()): void { r.globalTint = { r: 31, g: 31, b: 31 }; runStep('Task_PhotoFlash', taskId, r); }
export const FldEff_PhotoFlash = genericFieldEffect('FldEff_PhotoFlash', 15, 'Task_PhotoFlash');

export const fieldEffectCallbacks = {
  Task_PokecenterHeal, PokecenterHealEffect_Init, PokecenterHealEffect_WaitForBallPlacement, PokecenterHealEffect_WaitForBallFlashing, PokecenterHealEffect_WaitForSoundAndEnd, Task_HallOfFameRecord, HallOfFameRecordEffect_Init, HallOfFameRecordEffect_WaitForBallPlacement, HallOfFameRecordEffect_WaitForBallFlashing, HallOfFameRecordEffect_WaitForSoundAndEnd, SpriteCB_PokeballGlowEffect, PokeballGlowEffect_PlaceBalls, PokeballGlowEffect_TryPlaySe, PokeballGlowEffect_FlashFirstThree, PokeballGlowEffect_FlashLast, PokeballGlowEffect_WaitAfterFlash, PokeballGlowEffect_Dummy, PokeballGlowEffect_WaitForSound, PokeballGlowEffect_Idle, SpriteCB_PokeballGlow, SpriteCB_PokecenterMonitor, SpriteCB_HallOfFameMonitor, Task_UseFly, Task_FlyIntoMap, Task_FallWarpFieldEffect, FallWarpEffect_1, FallWarpEffect_2, FallWarpEffect_3, FallWarpEffect_4, FallWarpEffect_5, FallWarpEffect_6, FallWarpEffect_7, Task_EscalatorWarpFieldEffect, EscalatorWarpEffect_1, EscalatorWarpEffect_2, EscalatorWarpEffect_3, EscalatorWarpEffect_4, EscalatorWarpEffect_5, EscalatorWarpEffect_6, Task_EscalatorWarpInFieldEffect, EscalatorWarpInEffect_1, EscalatorWarpInEffect_2, EscalatorWarpInEffect_3, EscalatorWarpInEffect_4, EscalatorWarpInEffect_5, EscalatorWarpInEffect_6, EscalatorWarpInEffect_7, Task_UseWaterfall, waterfall_0_setup, waterfall_1_do_anim_probably, waterfall_2_wait_anim_finish_probably, waterfall_3_move_player_probably, waterfall_4_wait_player_move_probably, Task_UseDive, DiveFieldEffect_Init, DiveFieldEffect_ShowMon, DiveFieldEffect_TryWarp, Task_LavaridgeGymB1FWarp, LavaridgeGymB1FWarpEffect_1, LavaridgeGymB1FWarpEffect_2, LavaridgeGymB1FWarpEffect_3, LavaridgeGymB1FWarpEffect_4, LavaridgeGymB1FWarpEffect_5, LavaridgeGymB1FWarpEffect_6, Task_LavaridgeGymB1FWarpExit, LavaridgeGymB1FWarpExitEffect_1, LavaridgeGymB1FWarpExitEffect_2, LavaridgeGymB1FWarpExitEffect_3, LavaridgeGymB1FWarpExitEffect_4, SpriteCB_AshLaunch, Task_LavaridgeGym1FWarp, LavaridgeGym1FWarpEffect_1, LavaridgeGym1FWarpEffect_2, LavaridgeGym1FWarpEffect_3, LavaridgeGym1FWarpEffect_4, LavaridgeGym1FWarpEffect_5, SpriteCB_PopOutOfAsh, Task_EscapeRopeWarpOut, EscapeRopeWarpOutEffect_Init, EscapeRopeWarpOutEffect_Spin, Task_EscapeRopeWarpIn, EscapeRopeWarpInEffect_Init, EscapeRopeWarpInEffect_Spin, Task_DoTeleportFieldEffect, TeleportFieldEffectTask1, TeleportFieldEffectTask2, TeleportFieldEffectTask3, TeleportFieldEffectTask4, Task_DoTeleportInFieldEffect, TeleportInFieldEffectTask1, TeleportInFieldEffectTask2, TeleportInFieldEffectTask3, Task_ShowMon_Outdoors, ShowMonEffect_Outdoors_1, ShowMonEffect_Outdoors_2, ShowMonEffect_Outdoors_3, ShowMonEffect_Outdoors_4, ShowMonEffect_Outdoors_5, ShowMonEffect_Outdoors_6, ShowMonEffect_Outdoors_7, Task_ShowMon_Indoors, ShowMonEffect_Indoors_1, ShowMonEffect_Indoors_2, ShowMonEffect_Indoors_3, ShowMonEffect_Indoors_4, ShowMonEffect_Indoors_5, ShowMonEffect_Indoors_6, ShowMonEffect_Indoors_7, SpriteCB_FieldMoveMonSlideOnscreen, SpriteCB_FieldMoveMonWaitAfterCry, SpriteCB_FieldMoveMonSlideOffscreen, Task_FldEffUseSurf, UseSurfEffect_1, UseSurfEffect_2, UseSurfEffect_3, UseSurfEffect_4, UseSurfEffect_5, Task_FldEffUseVsSeeker, UseVsSeekerEffect_1, UseVsSeekerEffect_2, UseVsSeekerEffect_3, UseVsSeekerEffect_4, SpriteCB_NPCFlyOut, Task_FlyOut, FlyOutFieldEffect_FieldMovePose, FlyOutFieldEffect_ShowMon, FlyOutFieldEffect_BirdLeaveBall, FlyOutFieldEffect_WaitBirdLeave, FlyOutFieldEffect_BirdSwoopDown, FlyOutFieldEffect_JumpOnBird, FlyOutFieldEffect_FlyOffWithBird, FlyOutFieldEffect_WaitFlyOff, FlyOutFieldEffect_End, SpriteCB_FlyBirdLeaveBall, SpriteCB_FlyBirdSwoopDown, SpriteCB_FlyBirdReturnToBall, Task_FlyIn, FlyInFieldEffect_BirdSwoopDown, FlyInFieldEffect_FlyInWithBird, FlyInFieldEffect_JumpOffBird, FlyInFieldEffect_FieldMovePose, FlyInFieldEffect_BirdReturnToBall, FlyInFieldEffect_WaitBirdReturn, FlyInFieldEffect_End, SpriteCB_FlyBirdWithPlayer, Task_MoveDeoxysRock_Step, Task_DeoxysRockCameraShake, Task_DestroyDeoxysRock, DestroyDeoxysRockEffect_CameraShake, DestroyDeoxysRockEffect_RockFragments, DestroyDeoxysRockEffect_WaitAndEnd, SpriteCB_DeoxysRockFragment, Task_PhotoFlash
};
