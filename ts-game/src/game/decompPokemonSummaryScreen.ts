export interface SummaryMove { id: number; pp: number; maxPp: number; type: number; power: number; accuracy: number; hm?: boolean; }
export interface SummaryMon { species: number; nickname: string; level: number; hp: number; maxHp: number; exp: number; nextLevelExp: number; status: number; isEgg: boolean; isBadEgg: boolean; shiny: boolean; pokerus: boolean; markings: number; nature: number; mapSec: number; fromGBA: boolean; otName: string; ownerName: string; ability: string; abilityDesc: string; types: [number, number]; moves: SummaryMove[]; }
export interface SummarySprite { id: number; kind: string; x: number; y: number; data: number[]; callback: string | null; invisible: boolean; destroyed: boolean; anim: number; }
export interface SummaryTask { id: number; data: number[]; func: string | null; destroyed: boolean; }
export interface PokemonSummaryRuntime {
  operations: string[];
  party: SummaryMon[];
  box: SummaryMon[];
  currentMon: SummaryMon;
  mode: number;
  curMonIndex: number;
  lastIndex: number;
  curPageIndex: number;
  lastPageFlipDirection: number;
  pageFlipDirection: number;
  inhibitPageFlipInput: number;
  flippingPages: boolean;
  flipPagesBgHofs: number;
  whichBgLayerToTranslate: number;
  skillsPageBgNum: number;
  infoAndMovesPageBgNum: number;
  lockMovesFlag: number;
  selectedMoveSlot: number;
  moveSlotToReplace: number;
  isBoxMon: boolean;
  isEnemyParty: boolean;
  isSwappingMoves: boolean;
  input: { left: boolean; right: boolean; up: boolean; down: boolean; a: boolean; b: boolean };
  summary: Record<string, string | string[]>;
  windows: string[];
  sprites: SummarySprite[];
  tasks: SummaryTask[];
  spriteIds: Record<string, number | number[] | null>;
  inputHandlerTaskId: number;
  isEgg: boolean;
  isBadEgg: boolean;
  curMonStatusAilment: number;
  hpBar: { x: number; y: number; value: number; invisible: boolean };
  expBar: { x: number; y: number; value: number; invisible: boolean };
  callbacks: { main: string | null; vblank: string | null; saved: string | null };
  setupStep: number;
  loadBgGfxStep: number;
  spriteCreationStep: number;
  bufferStringsStep: number;
  selectMoveInputHandlerState: number;
  switchMonTaskState: number;
  helpContext: string | null;
  win1Active: boolean;
  pageFlipFinished: boolean;
  monCryTimer: number;
  selectedMoveCanForget: boolean;
}

let activeRuntime: PokemonSummaryRuntime | null = null;
const req = (runtime?: PokemonSummaryRuntime): PokemonSummaryRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('pokemon summary screen runtime is not active'); return r; };
const op = (r: PokemonSummaryRuntime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const emptyMove = (): SummaryMove => ({ id: 0, pp: 0, maxPp: 0, type: 0, power: 0, accuracy: 0 });
const emptyMon = (): SummaryMon => ({ species: 0, nickname: 'NONE', level: 1, hp: 1, maxHp: 1, exp: 0, nextLevelExp: 1, status: 0, isEgg: false, isBadEgg: false, shiny: false, pokerus: false, markings: 0, nature: 0, mapSec: 0, fromGBA: true, otName: 'OT', ownerName: 'OT', ability: 'ABILITY', abilityDesc: 'No data', types: [0, 0], moves: [emptyMove(), emptyMove(), emptyMove(), emptyMove(), emptyMove()] });
const makeTask = (r: PokemonSummaryRuntime, func: string): number => { const id = r.tasks.length; r.tasks.push({ id, data: Array.from({ length: 16 }, () => 0), func, destroyed: false }); op(r, 'CreateTask', func, id); return id; };
const task = (r: PokemonSummaryRuntime, id: number): SummaryTask => r.tasks[id] ?? (r.tasks[id] = { id, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false });
const destroyTask = (r: PokemonSummaryRuntime, id: number): void => { task(r, id).destroyed = true; task(r, id).func = null; op(r, 'DestroyTask', id); };
const makeSprite = (r: PokemonSummaryRuntime, kind: string, callback: string | null, x = 0, y = 0): number => { const id = r.sprites.length; r.sprites.push({ id, kind, x, y, data: Array.from({ length: 16 }, () => 0), callback, invisible: false, destroyed: false, anim: 0 }); op(r, 'CreateSprite', kind, id); return id; };
const sprite = (r: PokemonSummaryRuntime, id: number): SummarySprite => r.sprites[id] ?? (r.sprites[id] = { id, kind: 'missing', x: 0, y: 0, data: Array.from({ length: 16 }, () => 0), callback: null, invisible: false, destroyed: false, anim: 0 });
const destroySprite = (r: PokemonSummaryRuntime, id: number): void => { const sp = sprite(r, id); sp.destroyed = true; sp.callback = null; op(r, 'DestroySprite', id); };
const setVisible = (r: PokemonSummaryRuntime, key: string, invisible: boolean): void => { const v = r.spriteIds[key]; const ids = Array.isArray(v) ? v : v == null ? [] : [v]; ids.forEach(id => { if (id >= 0) sprite(r, id).invisible = invisible; }); };
const currentList = (r: PokemonSummaryRuntime): SummaryMon[] => r.isBoxMon ? r.box : r.party;
const clampIndex = (r: PokemonSummaryRuntime, i: number): number => Math.max(0, Math.min(r.lastIndex, i));
const genericPrint = (key: string) => (runtime?: PokemonSummaryRuntime): void => { const r = req(runtime); r.windows.push(key); op(r, key); };

export function createPokemonSummaryRuntime(overrides: Partial<PokemonSummaryRuntime> = {}): PokemonSummaryRuntime {
  const mon = emptyMon();
  const runtime: PokemonSummaryRuntime = {
    operations: [],
    party: [mon],
    box: [],
    currentMon: mon,
    mode: 0,
    curMonIndex: 0,
    lastIndex: 0,
    curPageIndex: 0,
    lastPageFlipDirection: 0,
    pageFlipDirection: 0,
    inhibitPageFlipInput: 0,
    flippingPages: false,
    flipPagesBgHofs: 0,
    whichBgLayerToTranslate: 0,
    skillsPageBgNum: 1,
    infoAndMovesPageBgNum: 2,
    lockMovesFlag: 0,
    selectedMoveSlot: 0,
    moveSlotToReplace: 0,
    isBoxMon: false,
    isEnemyParty: false,
    isSwappingMoves: false,
    input: { left: false, right: false, up: false, down: false, a: false, b: false },
    summary: {},
    windows: [],
    sprites: [],
    tasks: [],
    spriteIds: { monPic: null, ballIcon: null, monIcon: null, moveCursor: [], statusIcon: null, hpBar: [], expBar: [], pokerus: null, shiny: null, markings: null },
    inputHandlerTaskId: 0,
    isEgg: false,
    isBadEgg: false,
    curMonStatusAilment: 0,
    hpBar: { x: 0, y: 0, value: 0, invisible: false },
    expBar: { x: 0, y: 0, value: 0, invisible: false },
    callbacks: { main: null, vblank: null, saved: null },
    setupStep: 0,
    loadBgGfxStep: 0,
    spriteCreationStep: 0,
    bufferStringsStep: 0,
    selectMoveInputHandlerState: 0,
    switchMonTaskState: 0,
    helpContext: null,
    win1Active: false,
    pageFlipFinished: true,
    monCryTimer: 0,
    selectedMoveCanForget: true,
    ...overrides
  };
  runtime.currentMon = currentList(runtime)[runtime.curMonIndex] ?? runtime.currentMon;
  activeRuntime = runtime;
  return runtime;
}

export function ShowPokemonSummaryScreen(party: SummaryMon[] = req().party, curIndex = 0, maxIndex = party.length - 1, callback: string | null = null, mode = 0, r = req()): void { r.party = party; r.isBoxMon = false; r.curMonIndex = curIndex; r.lastIndex = maxIndex; r.callbacks.saved = callback; SetPokemonSummaryScreenMode(mode, r); BufferSelectedMonData(r.party[curIndex] ?? emptyMon(), r); r.callbacks.main = 'CB2_SetUpPSS'; }
export function ShowSelectMovePokemonSummaryScreen(party: SummaryMon[] = req().party, curIndex = 0, maxIndex = party.length - 1, moveSlot = 0, callback: string | null = null, r = req()): void { ShowPokemonSummaryScreen(party, curIndex, maxIndex, callback, 1, r); r.moveSlotToReplace = moveSlot; r.selectedMoveSlot = moveSlot; r.callbacks.main = 'CB2_SetUpPSS_SelectMove'; }
export function PageFlipInputIsDisabled(r = req()): boolean { return r.inhibitPageFlipInput !== 0 || r.flippingPages; }
export function IsPageFlipInput(r = req()): boolean { return !PageFlipInputIsDisabled(r) && (r.input.left || r.input.right); }
export function Task_InputHandler_Info(taskId = 0, r = req()): void { if (IsPageFlipInput(r)) { r.pageFlipDirection = r.input.right ? 1 : -1; task(r, taskId).func = 'Task_PokeSum_FlipPages'; } else if (r.input.b) task(r, taskId).func = 'Task_DestroyResourcesOnExit'; }
export function Task_PokeSum_FlipPages(taskId = 0, r = req()): void { r.flippingPages = true; r.pageFlipFinished = false; PokeSum_HideSpritesBeforePageFlip(r); r.curPageIndex = Math.max(0, Math.min(2, r.curPageIndex + r.pageFlipDirection)); task(r, taskId).func = 'Task_FlipPages_FromInfo'; }
export function Task_FlipPages_FromInfo(taskId = 0, r = req()): void { PokeSum_FlipPages_SlideLayerLeft(taskId, r); if (PokeSum_IsPageFlipFinished(0, r)) { r.flippingPages = false; PokeSum_ShowSpritesBeforePageFlip(r); task(r, taskId).func = 'Task_InputHandler_Info'; } }
export function Task_BackOutOfSelectMove(taskId = 0, r = req()): void { r.selectedMoveSlot = r.moveSlotToReplace; destroyTask(r, taskId); }
export function PokeSum_SetHpExpBarCoordsFullRight(r = req()): void { r.hpBar.x = 160; r.expBar.x = 160; }
export function PokeSum_SetHpExpBarCoordsFullLeft(r = req()): void { r.hpBar.x = 0; r.expBar.x = 0; }
export function PokeSum_InitBgCoordsBeforePageFlips(r = req()): void { r.flipPagesBgHofs = 0; r.whichBgLayerToTranslate = r.curPageIndex === 1 ? r.skillsPageBgNum : r.infoAndMovesPageBgNum; }
export function PokeSum_HideSpritesBeforePageFlip(r = req()): void { Object.keys(r.spriteIds).forEach(k => setVisible(r, k, true)); }
export function PokeSum_ShowSpritesBeforePageFlip(r = req()): void { Object.keys(r.spriteIds).forEach(k => setVisible(r, k, false)); }
export function PokeSum_IsPageFlipFinished(_bg = 0, r = req()): boolean { return r.pageFlipFinished || Math.abs(r.flipPagesBgHofs) >= 256; }
export function PokeSum_UpdateBgPriorityForPageFlip(setBg0Priority: number, keepOrder: number, r = req()): void { op(r, 'PokeSum_UpdateBgPriorityForPageFlip', setBg0Priority, keepOrder); }
export function PokeSum_CopyNewBgTilemapBeforePageFlip_2(r = req()): void { op(r, 'PokeSum_CopyNewBgTilemapBeforePageFlip_2'); }
export function PokeSum_CopyNewBgTilemapBeforePageFlip(r = req()): void { op(r, 'PokeSum_CopyNewBgTilemapBeforePageFlip'); }
export function CB2_SetUpPSS(r = req()): void { if (PokeSum_HandleLoadBgGfx(r) && PokeSum_Setup_BufferStrings(r) && PokeSum_HandleCreateSprites(r)) PokeSum_FinishSetup(r); }
export function PokeSum_HandleLoadBgGfx(r = req()): boolean { r.loadBgGfxStep++; op(r, 'PokeSum_HandleLoadBgGfx', r.loadBgGfxStep); return r.loadBgGfxStep >= 1; }
export function PokeSum_Setup_BufferStrings(r = req()): boolean { BufferMonInfo(r.currentMon, r); BufferMonSkills(r); BufferMonMoves(r); r.bufferStringsStep++; return true; }
export function BufferMonInfo(mon: SummaryMon = req().currentMon, r = req()): void { r.summary.nickname = mon.nickname; r.summary.level = String(mon.level); r.summary.item = 'NONE'; r.summary.ot = mon.otName; r.summary.species = String(mon.species); }
export function BufferMonSkills(r = req()): void { const m = r.currentMon; r.summary.hp = `${m.hp}/${m.maxHp}`; r.summary.exp = String(m.exp); r.summary.nextLevel = String(m.nextLevelExp); r.summary.ability = m.ability; }
export function BufferMonMoves(r = req()): void { r.summary.moves = r.currentMon.moves.map(m => `MOVE${m.id}`); r.summary.pp = r.currentMon.moves.map(m => `${m.pp}/${m.maxPp}`); r.summary.power = r.currentMon.moves.map(m => String(m.power)); r.summary.accuracy = r.currentMon.moves.map(m => String(m.accuracy)); }
export function BufferMonMoveI(i: number, r = req()): void { const move = r.currentMon.moves[i] ?? emptyMove(); r.summary[`move${i}`] = `MOVE${move.id}`; r.summary[`pp${i}`] = `${move.pp}/${move.maxPp}`; }
export function PokeSum_HandleCreateSprites(r = req()): boolean { PokeSum_CreateSprites(r); r.spriteCreationStep++; return true; }
export function PokeSum_Setup_SpritesReset(r = req()): void { r.sprites = []; r.spriteIds = { monPic: null, ballIcon: null, monIcon: null, moveCursor: [], statusIcon: null, hpBar: [], expBar: [], pokerus: null, shiny: null, markings: null }; }
export function PokeSum_Setup_InitGpu(r = req()): void { op(r, 'PokeSum_Setup_InitGpu'); }
export function PokeSum_FinishSetup(r = req()): void { PokeSum_CreateWindows(r); PokeSum_PrintPageHeaderText(r.curPageIndex, r); r.callbacks.main = 'CB2_RunPokemonSummaryScreen'; r.callbacks.vblank = 'VBlankCB_PokemonSummaryScreen'; r.inputHandlerTaskId = makeTask(r, 'Task_InputHandler_Info') as never; }
export function PokeSum_PrintPageName(str: string, r = req()): void { r.windows.push(`page:${str}`); }
export function PokeSum_PrintControlsString(str: string, r = req()): void { r.windows.push(`controls:${str}`); }
export function PrintMonLevelNickOnWindow2(str: string, r = req()): void { r.windows.push(`mon:${str}`); }
export function PokeSum_PrintRightPaneText(r = req()): void { [PrintInfoPage, PrintSkillsPage, PrintMovesPage][r.curPageIndex]?.(r); }
export function PrintInfoPage(r = req()): void { genericPrint('PrintInfoPage')(r); }
export function PrintSkillsPage(r = req()): void { genericPrint('PrintSkillsPage')(r); }
export function PrintMovesPage(r = req()): void { genericPrint('PrintMovesPage')(r); }
export function PokeSum_PrintMoveName(i: number, r = req()): void { r.windows.push(`move:${i}:${GetMonMoveBySlotId(r.currentMon, i, r)}`); }
export function PokeSum_PrintBottomPaneText(r = req()): void { genericPrint('PokeSum_PrintBottomPaneText')(r); }
export function PokeSum_PrintTrainerMemo(r = req()): void { if (r.currentMon.isEgg) PokeSum_PrintTrainerMemo_Egg(r); else PokeSum_PrintTrainerMemo_Mon(r); }
export function PokeSum_PrintTrainerMemo_Mon_HeldByOT(r = req()): void { genericPrint('PokeSum_PrintTrainerMemo_Mon_HeldByOT')(r); }
export function PokeSum_PrintTrainerMemo_Mon_NotHeldByOT(r = req()): void { genericPrint('PokeSum_PrintTrainerMemo_Mon_NotHeldByOT')(r); }
export function PokeSum_PrintTrainerMemo_Mon(r = req()): void { (PokeSum_BufferOtName_IsEqualToCurrentOwner(r.currentMon, r) ? PokeSum_PrintTrainerMemo_Mon_HeldByOT : PokeSum_PrintTrainerMemo_Mon_NotHeldByOT)(r); }
export function PokeSum_PrintTrainerMemo_Egg(r = req()): void { genericPrint('PokeSum_PrintTrainerMemo_Egg')(r); }
export function PokeSum_PrintExpPoints_NextLv(r = req()): void { r.windows.push(`exp:${r.currentMon.exp}:next:${r.currentMon.nextLevelExp}`); }
export function PokeSum_PrintSelectedMoveStats(r = req()): void { const m = r.currentMon.moves[r.selectedMoveSlot] ?? emptyMove(); r.windows.push(`selected:${m.id}:${m.power}:${m.accuracy}`); }
export function PokeSum_PrintAbilityDataOrMoveTypes(r = req()): void { if (r.curPageIndex === 1) PokeSum_PrintAbilityNameAndDesc(r); else PokeSum_DrawMoveTypeIcons(r); }
export function PokeSum_PrintAbilityNameAndDesc(r = req()): void { r.windows.push(`ability:${r.currentMon.ability}:${r.currentMon.abilityDesc}`); }
export function PokeSum_DrawMoveTypeIcons(r = req()): void { r.windows.push(`types:${r.currentMon.moves.map(m => m.type).join(',')}`); }
export function PokeSum_PrintPageHeaderText(curPageIndex: number, r = req()): void { PokeSum_PrintPageName(['POKEMON INFO','POKEMON SKILLS','KNOWN MOVES'][curPageIndex] ?? 'POKEMON INFO', r); }
export function CommitStaticWindowTilemaps(r = req()): void { op(r, 'CommitStaticWindowTilemaps'); }
export function Task_DestroyResourcesOnExit(taskId = 0, r = req()): void { PokeSum_DestroySprites(r); PokeSum_RemoveWindows(r.curPageIndex, r); r.callbacks.main = r.callbacks.saved; destroyTask(r, taskId); }
export function CB2_RunPokemonSummaryScreen(r = req()): void { op(r, 'CB2_RunPokemonSummaryScreen'); }
export function PokeSum_FlipPages_SlideHpExpBarsOut(taskId = 0, r = req()): void { r.hpBar.x += 16; r.expBar.x += 16; task(r, taskId).data[0]++; }
export function PokeSum_FlipPages_SlideHpExpBarsIn(taskId = 0, r = req()): void { r.hpBar.x -= 16; r.expBar.x -= 16; task(r, taskId).data[0]++; }
export function PokeSum_FlipPages_SlideLayerLeft(taskId = 0, r = req()): void { r.flipPagesBgHofs -= 32; if (Math.abs(r.flipPagesBgHofs) >= 256) r.pageFlipFinished = true; task(r, taskId).data[0]++; }
export function PokeSum_FlipPages_SlideLayeRight(taskId = 0, r = req()): void { r.flipPagesBgHofs += 32; if (Math.abs(r.flipPagesBgHofs) >= 256) r.pageFlipFinished = true; task(r, taskId).data[0]++; }
export function PokeSum_FlipPages_HandleBgHofs(r = req()): void { r.flipPagesBgHofs += r.pageFlipDirection * 32; }
export function PokeSum_FlipPages_HandleHpExpBarSprites(r = req()): void { if (r.pageFlipDirection > 0) PokeSum_FlipPages_SlideHpExpBarsOut(0, r); else PokeSum_FlipPages_SlideHpExpBarsIn(0, r); }
export function VBlankCB_PokemonSummaryScreen(r = req()): void { op(r, 'VBlankCB_PokemonSummaryScreen'); }
export function PokeSum_Setup_ResetCallbacks(r = req()): void { r.callbacks.main = null; r.callbacks.vblank = null; }
export function PokeSum_Setup_SetVBlankCallback(r = req()): void { r.callbacks.vblank = 'VBlankCB_PokemonSummaryScreen'; }
export function PokeSum_CreateWindows(r = req()): void { r.windows = []; PokeSum_AddWindows(r.curPageIndex, r); }
export function PokeSum_AddWindows(curPageIndex: number, r = req()): void { r.windows.push(`window:${curPageIndex}`); }
export function PokeSum_RemoveWindows(curPageIndex = req().curPageIndex, r = req()): void { r.windows = r.windows.filter(w => w !== `window:${curPageIndex}`); }
export function PokeSum_SetHelpContext(r = req()): void { r.helpContext = `summary:${r.mode}:${r.curPageIndex}`; }
export function PokeSum_BufferOtName_IsEqualToCurrentOwner(mon: SummaryMon = req().currentMon, _r = req()): number { return mon.otName === mon.ownerName ? 1 : 0; }
export function PokeSum_DrawPageProgressTiles(r = req()): void { r.windows.push(`progress:${r.curPageIndex}`); }
export function PokeSum_PrintMonTypeIcons(r = req()): void { r.windows.push(`monTypes:${r.currentMon.types.join(',')}`); }
export function GetLastViewedMonIndex(r = req()): number { return r.curMonIndex; }
export function GetMoveSlotToReplace(r = req()): number { return r.moveSlotToReplace; }
export function SetPokemonSummaryScreenMode(mode: number, r = req()): void { r.mode = mode; r.lockMovesFlag = mode === 0 ? 0 : 1; }
export function IsMultiBattlePartner(r = req()): boolean { return r.isEnemyParty && r.curMonIndex >= 3; }
export function BufferSelectedMonData(mon: SummaryMon = req().currentMon, r = req()): void { r.currentMon = mon; r.isEgg = mon.isEgg as never; r.isBadEgg = mon.isBadEgg as never; BufferMonInfo(mon, r); BufferMonSkills(r); BufferMonMoves(r); r.curMonStatusAilment = StatusToAilment(mon.status, r) as never; }
export function GetMonMoveBySlotId(mon: SummaryMon = req().currentMon, moveSlot: number, _r = req()): number { return mon.moves[moveSlot]?.id ?? 0; }
export function GetMonPpByMoveSlot(mon: SummaryMon = req().currentMon, moveSlot: number, _r = req()): number { return mon.moves[moveSlot]?.pp ?? 0; }
export function StatusToAilment(status: number, _r = req()): number { if (status & 0x7) return 1; if (status & 0x8) return 2; if (status & 0x10) return 3; if (status & 0x20) return 4; if (status & 0x40) return 5; return 0; }
export function Task_HandleInput_SelectMove(taskId = 0, r = req()): void { if (r.input.up) r.selectedMoveSlot = Math.max(0, r.selectedMoveSlot - 1); if (r.input.down) r.selectedMoveSlot = Math.min(3, r.selectedMoveSlot + 1); if (r.input.a) task(r, taskId).func = 'Task_InputHandler_SelectOrForgetMove'; if (r.input.b) task(r, taskId).func = 'Task_BackOutOfSelectMove'; }
export function SwapMonMoveSlots(r = req()): void { const a = r.selectedMoveSlot, b = r.moveSlotToReplace; [r.currentMon.moves[a], r.currentMon.moves[b]] = [r.currentMon.moves[b] ?? emptyMove(), r.currentMon.moves[a] ?? emptyMove()]; }
export function SwapBoxMonMoveSlots(r = req()): void { SwapMonMoveSlots(r); UpdateCurrentMonBufferFromPartyOrBox(r.currentMon, r); }
export function UpdateCurrentMonBufferFromPartyOrBox(mon: SummaryMon = req().currentMon, r = req()): void { currentList(r)[r.curMonIndex] = mon; r.currentMon = mon; BufferSelectedMonData(mon, r); }
export function PokeSum_CanForgetSelectedMove(r = req()): boolean { return r.selectedMoveCanForget && !(r.currentMon.moves[r.selectedMoveSlot]?.hm); }
export function Task_InputHandler_SelectOrForgetMove(taskId = 0, r = req()): void { if (PokeSum_CanForgetSelectedMove(r)) SwapMonMoveSlots(r); destroyTask(r, taskId); }
export function SpriteCB_PokeSum_MonPicSprite(spriteId: number, r = req()): void { sprite(r, spriteId).data[0]++; }
export function SpriteCB_PokeSum_EggPicShake(spriteId: number, r = req()): void { sprite(r, spriteId).x += sprite(r, spriteId).data[0] % 2 ? 1 : -1; sprite(r, spriteId).data[0]++; }
export function SpriteCB_MonPicDummy(_spriteId = 0, _r = req()): void {}
export function PokeSum_CreateMonPicSprite(r = req()): number { const id = makeSprite(r, 'monPic', r.currentMon.isEgg ? 'SpriteCB_PokeSum_EggPicShake' : 'SpriteCB_PokeSum_MonPicSprite', 40, 64); r.spriteIds.monPic = id; return id; }
export function PokeSum_SetMonPicSpriteCallback(spriteId: number, r = req()): void { sprite(r, spriteId).callback = r.currentMon.isEgg ? 'SpriteCB_PokeSum_EggPicShake' : 'SpriteCB_PokeSum_MonPicSprite'; }
export function PokeSum_ShowOrHideMonPicSprite(invisible: number | boolean, r = req()): void { setVisible(r, 'monPic', !!invisible); }
export function PokeSum_DestroyMonPicSprite(r = req()): void { const id = r.spriteIds.monPic; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.monPic = null; }
export function CreateBallIconObj(r = req()): number { const id = makeSprite(r, 'ballIcon', null, 16, 16); r.spriteIds.ballIcon = id; return id; }
export function ShowOrHideBallIconObj(invisible: number | boolean, r = req()): void { setVisible(r, 'ballIcon', !!invisible); }
export function DestroyBallIconObj(r = req()): void { const id = r.spriteIds.ballIcon; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.ballIcon = null; }
export function PokeSum_CreateMonIconSprite(r = req()): number { const id = makeSprite(r, 'monIcon', null, 120, 32); r.spriteIds.monIcon = id; return id; }
export function PokeSum_ShowOrHideMonIconSprite(invisible: number | boolean, r = req()): void { setVisible(r, 'monIcon', !!invisible); }
export function PokeSum_DestroyMonIconSprite(r = req()): void { const id = r.spriteIds.monIcon; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.monIcon = null; }
export function CreateMoveSelectionCursorObjs(x = 0, y = 0, r = req()): void { r.spriteIds.moveCursor = [makeSprite(r, 'moveCursor', 'SpriteCB_MoveSelectionCursor', x, y), makeSprite(r, 'moveCursor', 'SpriteCB_MoveSelectionCursor', x + 8, y)]; }
export function ShoworHideMoveSelectionCursor(invisible: number | boolean, r = req()): void { setVisible(r, 'moveCursor', !!invisible); }
export function SpriteCB_MoveSelectionCursor(spriteId: number, r = req()): void { sprite(r, spriteId).y = 32 + r.selectedMoveSlot * 16; }
export function DestroyMoveSelectionCursorObjs(r = req()): void { (r.spriteIds.moveCursor as number[]).forEach(id => destroySprite(r, id)); r.spriteIds.moveCursor = []; }
export function CreateMonStatusIconObj(x = 0, y = 0, r = req()): number { const id = makeSprite(r, 'statusIcon', null, x, y); r.spriteIds.statusIcon = id; return id; }
export function DestroyMonStatusIconObj(r = req()): void { const id = r.spriteIds.statusIcon; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.statusIcon = null; }
export function UpdateMonStatusIconObj(r = req()): void { const id = r.spriteIds.statusIcon; if (typeof id === 'number') sprite(r, id).anim = StatusToAilment(r.currentMon.status, r); }
export function ShowOrHideStatusIcon(invisible: number | boolean, r = req()): void { setVisible(r, 'statusIcon', !!invisible); }
export function CreateHpBarObjs(x = 0, y = 0, r = req()): void { r.spriteIds.hpBar = [makeSprite(r, 'hpBar', null, x, y)]; UpdateHpBarObjs(r); }
export function UpdateHpBarObjs(r = req()): void { r.hpBar.value = r.currentMon.maxHp ? Math.trunc((r.currentMon.hp * 48) / r.currentMon.maxHp) : 0; }
export function DestroyHpBarObjs(r = req()): void { (r.spriteIds.hpBar as number[]).forEach(id => destroySprite(r, id)); r.spriteIds.hpBar = []; }
export function ShowOrHideHpBarObjs(invisible: number | boolean, r = req()): void { r.hpBar.invisible = !!invisible; setVisible(r, 'hpBar', !!invisible); }
export function CreateExpBarObjs(x = 0, y = 0, r = req()): void { r.spriteIds.expBar = [makeSprite(r, 'expBar', null, x, y)]; UpdateExpBarObjs(r); }
export function UpdateExpBarObjs(r = req()): void { r.expBar.value = r.currentMon.nextLevelExp ? Math.trunc((r.currentMon.exp * 64) / r.currentMon.nextLevelExp) : 0; }
export function DestroyExpBarObjs(r = req()): void { (r.spriteIds.expBar as number[]).forEach(id => destroySprite(r, id)); r.spriteIds.expBar = []; }
export function ShowOrHideExpBarObjs(invisible: number | boolean, r = req()): void { r.expBar.invisible = !!invisible; setVisible(r, 'expBar', !!invisible); }
export function CreatePokerusIconObj(x = 0, y = 0, r = req()): number { const id = makeSprite(r, 'pokerus', null, x, y); r.spriteIds.pokerus = id; return id; }
export function DestroyPokerusIconObj(r = req()): void { const id = r.spriteIds.pokerus; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.pokerus = null; }
export function ShowPokerusIconObjIfHasOrHadPokerus(r = req()): void { HideShowPokerusIcon(!r.currentMon.pokerus, r); }
export function HideShowPokerusIcon(invisible: number | boolean, r = req()): void { setVisible(r, 'pokerus', !!invisible); }
export function CreateShinyStarObj(x = 0, y = 0, r = req()): number { const id = makeSprite(r, 'shiny', null, x, y); r.spriteIds.shiny = id; return id; }
export function DestroyShinyStarObj(r = req()): void { const id = r.spriteIds.shiny; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.shiny = null; }
export function HideShowShinyStar(invisible: number | boolean, r = req()): void { setVisible(r, 'shiny', !!invisible); }
export function ShowShinyStarObjIfMonShiny(r = req()): void { HideShowShinyStar(!r.currentMon.shiny, r); }
export function PokeSum_DestroySprites(r = req()): void { r.sprites.forEach(sp => { if (!sp.destroyed) destroySprite(r, sp.id); }); }
export function PokeSum_CreateSprites(r = req()): void { if (r.spriteIds.monPic == null) PokeSum_CreateMonPicSprite(r); if (r.spriteIds.ballIcon == null) CreateBallIconObj(r); if (r.spriteIds.monIcon == null) PokeSum_CreateMonIconSprite(r); CreateHpBarObjs(0, 0, r); CreateExpBarObjs(0, 0, r); CreateMonStatusIconObj(0, 0, r); CreatePokerusIconObj(0, 0, r); CreateShinyStarObj(0, 0, r); PokeSum_CreateMonMarkingsSprite(r); }
export function PokeSum_CreateMonMarkingsSprite(r = req()): number { const id = makeSprite(r, 'markings', null, 152, 32); r.spriteIds.markings = id; return id; }
export function PokeSum_DestroyMonMarkingsSprite(r = req()): void { const id = r.spriteIds.markings; if (typeof id === 'number') destroySprite(r, id); r.spriteIds.markings = null; }
export function PokeSum_ShowOrHideMonMarkingsSprite(invisible: number | boolean, r = req()): void { setVisible(r, 'markings', !!invisible); }
export function PokeSum_UpdateMonMarkingsAnim(r = req()): void { const id = r.spriteIds.markings; if (typeof id === 'number') sprite(r, id).anim = r.currentMon.markings; }
export function PokeSum_SeekToNextMon(taskId: number, direction: number, r = req()): void { const delta = r.isEnemyParty ? SeekToNextMonInMultiParty(direction, r) : SeekToNextMonInSingleParty(direction, r); if (delta !== 0) { r.curMonIndex = clampIndex(r, r.curMonIndex + delta); BufferSelectedMonData(currentList(r)[r.curMonIndex], r); task(r, taskId).func = 'Task_PokeSum_SwitchDisplayedPokemon'; } }
export function SeekToNextMonInSingleParty(direction: number, r = req()): number { return PokeSum_CanSeekToMon(r.curMonIndex + direction, r) ? direction : 0; }
export function PokeSum_CanSeekToMon(index: number, r = req()): boolean { const mon = currentList(r)[index]; return index >= 0 && index <= r.lastIndex && !!mon && !mon.isBadEgg; }
export function SeekToMonInMultiParty_SeekForward(r = req()): number { return SeekToNextMonInMultiParty(1, r); }
export function SeekToMonInMultiParty_SeekBack(r = req()): number { return SeekToNextMonInMultiParty(-1, r); }
export function SeekToNextMonInMultiParty(direction: number, r = req()): number { let index = r.curMonIndex + direction; while (index >= 0 && index <= r.lastIndex) { if (PokeSum_CanSeekToMon(index, r)) return index - r.curMonIndex; index += direction; } return 0; }
export function Task_PokeSum_SwitchDisplayedPokemon(taskId = 0, r = req()): void { r.switchMonTaskState++; PokeSum_TryPlayMonCry(r); destroyTask(r, taskId); }
export function PokeSum_UpdateWin1ActiveFlag(curPageIndex = req().curPageIndex, r = req()): void { r.win1Active = curPageIndex === 1 || curPageIndex === 2; }
export function PokeSum_TryPlayMonCry(r = req()): void { if (!r.currentMon.isEgg) { r.monCryTimer++; op(r, 'PlayMonCry', r.currentMon.species); } }
export function PokeSum_IsMonBoldOrGentle(nature: number): boolean { return nature === 5 || nature === 16; }
export function CurrentMonIsFromGBA(r = req()): boolean { return r.currentMon.fromGBA; }
export function MapSecIsInKantoOrSevii(mapSec: number): boolean { return (mapSec >= 0 && mapSec <= 0x58) || (mapSec >= 0x59 && mapSec <= 0x7f); }
export function ShowPokemonSummaryScreen_NullParty(r = req()): void { ShowPokemonSummaryScreen([], 0, 0, null, 0, r); }
