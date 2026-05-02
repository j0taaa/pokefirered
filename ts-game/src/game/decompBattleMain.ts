export interface BattleMainMon { species: number; hp: number; maxHp: number; status: number; speed: number; level: number; item?: number; language?: string; nickname?: string; ability?: number; fainted?: boolean; }
export interface BattleMainSprite { x: number; y: number; x2: number; y2: number; data: number[]; invisible: boolean; callback: string; destroyed: boolean; }
export interface BattleMainRuntime {
  battleTypeFlags: number; battleTerrain: number; battleOutcome: number; battleMainFunc: string | null; mainCallback2: string | null; preBattleCallback1: string | null;
  battleCommunication: number[]; battleStruct: { multiBuffer: Record<string, number>; berries: number[]; switchInItems: number[]; runTries: number; battleIntroState: number; endTurnState: number; evolutionState: number };
  playerParty: BattleMainMon[]; enemyParty: BattleMainMon[]; battleMons: BattleMainMon[]; battlersCount: number; activeBattler: number; battlerAttacker: number; battlerTarget: number;
  battlerPartyIndexes: number[]; battlerPositions: number[]; actionsByTurnOrder: number[]; battlerByTurnOrder: number[]; chosenActionByBattler: number[]; chosenMoveByBattler: number[];
  currentTurnActionNumber: number; currentActionFuncId: number; absentBattlerFlags: number; hitMarker: number; moveResultFlags: number; battleMoveDamage: number;
  sprites: BattleMainSprite[]; battlerSpriteIds: number[]; healthboxSpriteIds: number[]; tasks: Array<{ data: number[]; func: string | null; destroyed: boolean }>;
  operations: string[]; scanline0: number[]; scanline1: number[]; bg: Record<string, number>; specialStatuses: Array<Record<string, number | boolean>>; protectStructs: Array<Record<string, number | boolean>>;
  sideStatuses: number[]; statuses3: number[]; disableStructs: Array<Record<string, number | boolean>>; randomTurnNumber: number; paydayMoney: number; leveledUpInBattle: number; expShareExp: number; moveToLearn: number;
}
export const BATTLE_TYPE_LINK = 1 << 0, BATTLE_TYPE_TRAINER = 1 << 1, BATTLE_TYPE_DOUBLE = 1 << 2, BATTLE_TYPE_MULTI = 1 << 3, BATTLE_TYPE_SAFARI = 1 << 4, BATTLE_TYPE_OLD_MAN = 1 << 5;
export const B_OUTCOME_WON = 1, B_OUTCOME_LOST = 2, B_OUTCOME_DREW = 3, B_OUTCOME_RAN = 4, B_OUTCOME_PLAYER_TELEPORTED = 5, B_OUTCOME_MON_FLED = 6, B_OUTCOME_CAUGHT = 7, B_OUTCOME_NO_SAFARI_BALLS = 8;
export const B_ACTION_USE_MOVE = 0, B_ACTION_USE_ITEM = 1, B_ACTION_SWITCH = 2, B_ACTION_RUN = 3, B_ACTION_SAFARI_WATCH_CAREFULLY = 4, B_ACTION_SAFARI_BALL = 5, B_ACTION_SAFARI_BAIT = 6, B_ACTION_SAFARI_GO_NEAR = 7, B_ACTION_SAFARI_RUN = 8, B_ACTION_OLDMAN_THROW = 9, B_ACTION_EXEC_SCRIPT = 10, B_ACTION_TRY_FINISH = 11, B_ACTION_FINISHED = 12, B_ACTION_NOTHING_FAINTED = 13;
export const SPECIES_NONE = 0, SPECIES_EGG = 412, SPECIES_SHEDINJA = 292, PARTY_SIZE = 6, MAX_BATTLERS_COUNT = 4;
let activeRuntime: BattleMainRuntime | null = null;
const req = (runtime?: BattleMainRuntime): BattleMainRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('battle main runtime is not active'); return r; };
const op = (r: BattleMainRuntime, s: string): void => { r.operations.push(s); };
const mon = (species = SPECIES_NONE): BattleMainMon => ({ species, hp: species ? 10 : 0, maxHp: species ? 10 : 0, status: 0, speed: 10, level: 5 });
const sprite = (): BattleMainSprite => ({ x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 8 }, () => 0), invisible: false, callback: 'SpriteCallbackDummy', destroyed: false });
const getSprite = (r: BattleMainRuntime, id: number): BattleMainSprite => r.sprites[id] ?? (r.sprites[id] = sprite());
const destroyTask = (r: BattleMainRuntime, id: number): void => { r.tasks[id].destroyed = true; r.tasks[id].func = null; op(r, `DestroyTask:${id}`); };
const partyFlags = (party: BattleMainMon[]): number => party.slice(0, PARTY_SIZE).reduce((flags, p, i) => { if (p.species === SPECIES_NONE) return flags; if (p.species !== SPECIES_EGG && p.hp !== 0 && p.status === 0) return flags | (1 << (i * 2)); if (p.hp !== 0 && (p.species === SPECIES_EGG || p.status !== 0)) return flags | (2 << (i * 2)); if (p.species !== SPECIES_EGG && p.hp === 0) return flags | (3 << (i * 2)); return flags; }, 0);
export function createBattleMainRuntime(): BattleMainRuntime { const r: BattleMainRuntime = { battleTypeFlags: 0, battleTerrain: 0, battleOutcome: 0, battleMainFunc: null, mainCallback2: null, preBattleCallback1: null, battleCommunication: Array.from({ length: 16 }, () => 0), battleStruct: { multiBuffer: {}, berries: [0, 0, 0, 0], switchInItems: [0, 0, 0, 0], runTries: 0, battleIntroState: 0, endTurnState: 0, evolutionState: 0 }, playerParty: Array.from({ length: PARTY_SIZE }, (_, i) => mon(i + 1)), enemyParty: Array.from({ length: PARTY_SIZE }, (_, i) => mon(i + 100)), battleMons: Array.from({ length: MAX_BATTLERS_COUNT }, (_, i) => mon(i + 1)), battlersCount: 2, activeBattler: 0, battlerAttacker: 0, battlerTarget: 1, battlerPartyIndexes: [0, 0, 0, 0], battlerPositions: [0, 1, 2, 3], actionsByTurnOrder: [0, 0, 0, 0], battlerByTurnOrder: [0, 1, 2, 3], chosenActionByBattler: [0, 0, 0, 0], chosenMoveByBattler: [0, 0, 0, 0], currentTurnActionNumber: 0, currentActionFuncId: 0, absentBattlerFlags: 0, hitMarker: 0, moveResultFlags: 0, battleMoveDamage: 0, sprites: Array.from({ length: 16 }, () => sprite()), battlerSpriteIds: [0, 1, 2, 3], healthboxSpriteIds: [4, 5, 6, 7], tasks: [], operations: [], scanline0: Array.from({ length: 160 }, () => 0), scanline1: Array.from({ length: 160 }, () => 0), bg: {}, specialStatuses: Array.from({ length: 4 }, () => ({})), protectStructs: Array.from({ length: 4 }, () => ({})), sideStatuses: [0, 0], statuses3: [0, 0, 0, 0], disableStructs: Array.from({ length: 4 }, () => ({})), randomTurnNumber: 0, paydayMoney: 0, leveledUpInBattle: 0, expShareExp: 0, moveToLearn: 0 }; activeRuntime = r; return r; }
export function CB2_InitBattle(r=req()): void { op(r, 'MoveSaveBlocks_ResetHeap'); op(r, 'AllocateBattleResources'); if (r.battleTypeFlags & BATTLE_TYPE_MULTI) { op(r, 'HandleLinkBattleSetup'); r.mainCallback2 = 'CB2_PreInitMultiBattle'; r.battleCommunication[0] = 0; } else { CB2_InitBattleInternal(r); if (!(r.battleTypeFlags & BATTLE_TYPE_LINK)) op(r, r.battleTypeFlags & BATTLE_TYPE_TRAINER ? (r.battleTypeFlags & BATTLE_TYPE_DOUBLE ? 'Help:TrainerDouble' : 'Help:TrainerSingle') : r.battleTypeFlags & BATTLE_TYPE_SAFARI ? 'Help:Safari' : 'Help:Wild'); } }
export function CB2_InitBattleInternal(r=req()): void { r.scanline0.fill(0xf0, 0, 80); r.scanline1.fill(0xf0, 0, 80); r.scanline0.fill(0xff10, 80); r.scanline1.fill(0xff10, 80); r.bg = { BG0_X: 0, BG0_Y: 0, BG1_X: 0, BG1_Y: 0, WIN0H: 240, WIN0V: 0x5051 }; r.battleTerrain = 1; op(r, 'InitBattleBgsVideo'); op(r, 'LoadBattleTextboxAndBackground'); BattleStartClearSetData(r); r.mainCallback2 = (r.battleTypeFlags & BATTLE_TYPE_MULTI) ? 'CB2_HandleStartMultiBattle' : 'CB2_HandleStartBattle'; if (!(r.battleTypeFlags & BATTLE_TYPE_LINK)) { CreateNPCTrainerParty(r.enemyParty, 0, r); op(r, 'SetWildMonHeldItem'); } r.battleCommunication[0] = 0; }
export function BufferPartyVsScreenHealth_AtStart(r=req()): void { const flags = partyFlags(r.playerParty); r.battleStruct.multiBuffer.vsScreenHealthFlagsLo = flags & 0xff; r.battleStruct.multiBuffer.vsScreenHealthFlagsHi = flags >> 8; }
export function SetPlayerBerryDataInBattleStruct(r=req()): void { r.battleStruct.berries = r.playerParty.slice(0, PARTY_SIZE).map((p) => p.item ?? 0); }
export function SetAllPlayersBerryData(r=req()): void { SetPlayerBerryDataInBattleStruct(r); op(r, 'SetAllPlayersBerryData'); }
export function LinkBattleComputeBattleTypeFlags(numPlayers: number, multiPlayerId: number, r=req()): number { let flags = BATTLE_TYPE_LINK; if (numPlayers > 2) flags |= BATTLE_TYPE_MULTI | BATTLE_TYPE_DOUBLE; if (multiPlayerId & 1) flags |= BATTLE_TYPE_TRAINER; r.battleTypeFlags = flags; return flags; }
export function CB2_HandleStartBattle(r=req()): void { r.battleMainFunc = 'BeginBattleIntro'; r.mainCallback2 = 'BattleMainCB2'; op(r, 'CB2_HandleStartBattle'); }
export function PrepareOwnMultiPartnerBuffer(r=req()): void { r.battleStruct.multiBuffer.ownPartnerPrepared = 1; }
export function CB2_PreInitMultiBattle(r=req()): void { PrepareOwnMultiPartnerBuffer(r); r.mainCallback2 = 'CB2_HandleStartMultiBattle'; }
export function CB2_HandleStartMultiBattle(r=req()): void { SetAllPlayersBerryData(r); CB2_HandleStartBattle(r); }
export function BattleMainCB2(r=req()): void { if (r.battleMainFunc) battleMainHandlers[r.battleMainFunc]?.(r); }
export function FreeRestoreBattleData(r=req()): void { op(r, 'FreeBattleResources'); r.battleMainFunc = null; }
export function CB2_QuitPokedudeBattle(r=req()): void { FreeRestoreBattleData(r); r.mainCallback2 = 'CB2_ReturnToTeachyTV'; }
export function SpriteCB_UnusedDebugSprite(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_UnusedDebugSprite_Step'; }
export function SpriteCB_UnusedDebugSprite_Step(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.data[0]++; s.x2 = s.data[0] & 1; }
export function CreateNPCTrainerParty(party: BattleMainMon[], trainerNum: number, r=req()): number { for (let i = 0; i < PARTY_SIZE; i++) party[i] = mon(trainerNum * 10 + i + 1); op(r, `CreateNPCTrainerParty:${trainerNum}`); return PARTY_SIZE; }
export function HBlankCB_Battle(r=req()): void { op(r, 'HBlankCB_Battle'); }
export function VBlankCB_Battle(r=req()): void { op(r, 'VBlankCB_Battle'); }
export function SpriteCB_VsLetterDummy(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_VsLetterDummy'; }
export function SpriteCB_VsLetter(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.x += s.data[0] || 1; if (Math.abs(s.x) > 64) s.callback = 'SpriteCB_VsLetterDummy'; }
export function SpriteCB_VsLetterInit(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.data[0] = s.x < 120 ? 4 : -4; s.callback = 'SpriteCB_VsLetter'; }
export function BufferPartyVsScreenHealth_AtEnd(taskId: number, r=req()): void { BufferPartyVsScreenHealth_AtStart(r); destroyTask(r, taskId); }
export function CB2_InitEndLinkBattle(r=req()): void { r.mainCallback2 = 'CB2_EndLinkBattle'; }
export function CB2_EndLinkBattle(r=req()): void { EndLinkBattleInSteps(r); }
export function EndLinkBattleInSteps(r=req()): void { r.battleOutcome = B_OUTCOME_RAN; FreeRestoreBattleData(r); }
export function GetBattleBgTemplateData(arrayId: number, caseId: number, _r=req()): number { return arrayId * 16 + caseId; }
export function TryCorrectShedinjaLanguage(monArg: BattleMainMon, _r=req()): void { if (monArg.species === SPECIES_SHEDINJA && monArg.language !== 'JPN') monArg.nickname = 'SHEDINJA'; }
export function SpriteCB_EnemyMon(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_Idle'; }
export function SpriteCB_MoveWildMonToRight(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.x2 += 2; if (s.x2 >= 0) s.callback = 'SpriteCB_WildMonShowHealthbox'; }
export function SpriteCB_WildMonShowHealthbox(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_Idle'; op(r, 'ShowHealthbox'); }
export function SpriteCallbackDummy_2(_spriteId: number, _r=req()): void {}
export function SpriteCB_InitFlicker(spriteId: number, r=req()): void { getSprite(r, spriteId).data[0] = 0; getSprite(r, spriteId).callback = 'SpriteCB_Flicker'; }
export function SpriteCB_Flicker(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.invisible = !s.invisible; if (++s.data[0] > 8) s.callback = 'SpriteCB_Idle'; }
export function SpriteCB_FaintOpponentMon(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_AnimFaintOpponent'; }
export function SpriteCB_AnimFaintOpponent(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.y2 += 4; if (s.y2 > 64) s.destroyed = true; }
export function SpriteCB_ShowAsMoveTarget(spriteId: number, r=req()): void { getSprite(r, spriteId).invisible = false; }
export function SpriteCB_BlinkVisible(spriteId: number, r=req()): void { SpriteCB_Flicker(spriteId, r); }
export function SpriteCB_HideAsMoveTarget(spriteId: number, r=req()): void { getSprite(r, spriteId).invisible = true; }
export function SpriteCB_AllyMon(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'oac_poke_ally_'; }
export function oac_poke_ally_(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_Idle'; }
export function SetIdleSpriteCallback(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_Idle'; }
export function SpriteCB_Idle(_spriteId: number, _r=req()): void {}
export function SpriteCB_FaintSlideAnim(spriteId: number, r=req()): void { SpriteCB_AnimFaintOpponent(spriteId, r); }
export function DoBounceEffect(battler: number, which: number, delta: number, amplitude: number, r=req()): void { const s = getSprite(r, r.battlerSpriteIds[battler]); s.data[0] = which; s.data[1] = delta; s.data[2] = amplitude; s.callback = 'SpriteCB_BounceEffect'; }
export function EndBounceEffect(battler: number, _which: number, r=req()): void { getSprite(r, r.battlerSpriteIds[battler]).callback = 'SpriteCB_Idle'; }
export function SpriteCB_BounceEffect(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.y2 = Math.trunc(Math.sin(++s.data[3] / 2) * s.data[2]); }
export function SpriteCB_PlayerThrowInit(spriteId: number, r=req()): void { getSprite(r, spriteId).callback = 'SpriteCB_PlayerThrowUpdate'; }
export function UpdatePlayerPosInThrowAnim(spriteId: number, r=req()): void { const s = getSprite(r, spriteId); s.x2 += [-32, -16, -16, -32, -32, 0, 0, 0][Math.min(s.data[0], 7)] ?? 0; s.data[0]++; }
export function SpriteCB_PlayerThrowUpdate(spriteId: number, r=req()): void { UpdatePlayerPosInThrowAnim(spriteId, r); }
export function BeginBattleIntroDummy(r=req()): void { r.battleMainFunc = 'TryDoEventsBeforeFirstTurn'; }
export function BeginBattleIntro(r=req()): void { r.battleStruct.battleIntroState = 0; r.battleMainFunc = 'BattleMainCB1'; }
export function BattleMainCB1(r=req()): void { const steps = [BattleIntroGetMonsData, BattleIntroPrepareBackgroundSlide, BattleIntroDrawTrainersOrMonsSprites, BattleIntroDrawPartySummaryScreens, BattleIntroPrintTrainerWantsToBattle, BattleIntroPrintWildMonAttacked, BattleIntroPrintOpponentSendsOut, BattleIntroOpponentSendsOutMonAnimation, BattleIntroRecordMonsToDex, BattleIntroPrintPlayerSendsOut, BattleIntroPlayerSendsOutMonAnimation, BattleIntroSwitchInPlayerMons, TryDoEventsBeforeFirstTurn]; const fn = steps[r.battleStruct.battleIntroState++] ?? TryDoEventsBeforeFirstTurn; fn(r); }
export function BattleStartClearSetData(r=req()): void { r.currentTurnActionNumber = 0; r.currentActionFuncId = 0; r.absentBattlerFlags = 0; r.hitMarker = 0; r.moveResultFlags = 0; r.paydayMoney = 0; SpecialStatusesClear(r); }
export function SwitchInClearSetData(r=req()): void { r.statuses3[r.activeBattler] = 0; r.disableStructs[r.activeBattler] = {}; r.protectStructs[r.activeBattler] = {}; }
export function FaintClearSetData(r=req()): void { r.battleMons[r.activeBattler].fainted = true; SwitchInClearSetData(r); }
export function BattleIntroGetMonsData(r=req()): void { r.battleMons[0] = { ...r.playerParty[0] }; r.battleMons[1] = { ...r.enemyParty[0] }; op(r, 'BattleIntroGetMonsData'); }
export function BattleIntroPrepareBackgroundSlide(r=req()): void { op(r, 'BattleIntroPrepareBackgroundSlide'); }
export function BattleIntroDrawTrainersOrMonsSprites(r=req()): void { op(r, 'BattleIntroDrawTrainersOrMonsSprites'); }
export function BattleIntroDrawPartySummaryScreens(r=req()): void { op(r, 'BattleIntroDrawPartySummaryScreens'); }
export function BattleIntroPrintTrainerWantsToBattle(r=req()): void { op(r, 'BattleIntroPrintTrainerWantsToBattle'); }
export function BattleIntroPrintWildMonAttacked(r=req()): void { op(r, 'BattleIntroPrintWildMonAttacked'); }
export function BattleIntroPrintOpponentSendsOut(r=req()): void { op(r, 'BattleIntroPrintOpponentSendsOut'); }
export function BattleIntroOpponentSendsOutMonAnimation(r=req()): void { op(r, 'BattleIntroOpponentSendsOutMonAnimation'); }
export function BattleIntroRecordMonsToDex(r=req()): void { op(r, `RecordDex:${r.battleMons[1].species}`); }
export function Unused_AutoProgressToIntro(r=req()): void { BattleMainCB1(r); }
export function BattleIntroPrintPlayerSendsOut(r=req()): void { op(r, 'BattleIntroPrintPlayerSendsOut'); }
export function BattleIntroPlayerSendsOutMonAnimation(r=req()): void { op(r, 'BattleIntroPlayerSendsOutMonAnimation'); }
export function BattleTraceHarness_SkipIntro(r=req()): void { r.battleStruct.battleIntroState = 99; TryDoEventsBeforeFirstTurn(r); }
export function BattleIntroSwitchInPlayerMons(r=req()): void { SwitchInClearSetData(r); op(r, 'BattleIntroSwitchInPlayerMons'); }
export function TryDoEventsBeforeFirstTurn(r=req()): void { r.battleMainFunc = 'HandleTurnActionSelectionState'; }
export function HandleEndTurn_ContinueBattle(r=req()): void { r.currentTurnActionNumber = 0; r.battleMainFunc = 'HandleTurnActionSelectionState'; }
export function BattleTurnPassed(r=req()): boolean { return r.currentTurnActionNumber >= r.battlersCount; }
export function IsRunningFromBattleImpossible(r=req()): boolean { return !!(r.battleTypeFlags & (BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK)); }
export function UpdatePartyOwnerOnSwitch_NonMulti(battler: number, r=req()): void { r.battlerPartyIndexes[battler] = r.chosenMoveByBattler[battler] ?? 0; }
export function HandleTurnActionSelectionState(r=req()): void { SetActionsAndBattlersTurnOrder(r); r.battleMainFunc = 'RunTurnActionsFunctions'; }
export function SwapTurnOrder(id1: number, id2: number, r=req()): void { [r.battlerByTurnOrder[id1], r.battlerByTurnOrder[id2]] = [r.battlerByTurnOrder[id2], r.battlerByTurnOrder[id1]]; [r.actionsByTurnOrder[id1], r.actionsByTurnOrder[id2]] = [r.actionsByTurnOrder[id2], r.actionsByTurnOrder[id1]]; }
export function GetWhoStrikesFirst(battler1: number, battler2: number, ignoreChosenMoves: boolean, r=req()): number { const m1 = r.battleMons[battler1], m2 = r.battleMons[battler2]; if (!ignoreChosenMoves && r.chosenMoveByBattler[battler1] > r.chosenMoveByBattler[battler2]) return 1; return m1.speed >= m2.speed ? 0 : 1; }
export function SetActionsAndBattlersTurnOrder(r=req()): void { for (let i = 0; i < r.battlersCount; i++) { r.battlerByTurnOrder[i] = i; r.actionsByTurnOrder[i] = r.chosenActionByBattler[i]; } for (let i = 0; i < r.battlersCount - 1; i++) for (let j = i + 1; j < r.battlersCount; j++) if (GetWhoStrikesFirst(r.battlerByTurnOrder[i], r.battlerByTurnOrder[j], false, r)) SwapTurnOrder(i, j, r); }
export function TurnValuesCleanUp(var0: boolean, r=req()): void { r.moveResultFlags = 0; r.battleMoveDamage = 0; if (var0) r.hitMarker = 0; }
export function SpecialStatusesClear(r=req()): void { r.specialStatuses = Array.from({ length: 4 }, () => ({})); }
export function CheckFocusPunch_ClearVarsBeforeTurnStarts(r=req()): void { r.protectStructs.forEach((p) => { p.focusPunch = false; }); }
export function RunTurnActionsFunctions(r=req()): void { if (BattleTurnPassed(r)) { HandleAction_TryFinish(r); return; } r.activeBattler = r.battlerByTurnOrder[r.currentTurnActionNumber]; (actionHandlers[r.actionsByTurnOrder[r.currentTurnActionNumber]] ?? HandleAction_ActionFinished)(r); }
export function HandleEndTurn_BattleWon(r=req()): void { r.battleOutcome = B_OUTCOME_WON; HandleEndTurn_FinishBattle(r); }
export function HandleEndTurn_BattleLost(r=req()): void { r.battleOutcome = B_OUTCOME_LOST; HandleEndTurn_FinishBattle(r); }
export function HandleEndTurn_RanFromBattle(r=req()): void { r.battleOutcome = B_OUTCOME_RAN; HandleEndTurn_FinishBattle(r); }
export function HandleEndTurn_MonFled(r=req()): void { r.battleOutcome = B_OUTCOME_MON_FLED; HandleEndTurn_FinishBattle(r); }
export function HandleEndTurn_FinishBattle(r=req()): void { r.battleMainFunc = 'FreeResetData_ReturnToOvOrDoEvolutions'; }
export function FreeResetData_ReturnToOvOrDoEvolutions(r=req()): void { if (r.leveledUpInBattle) TryEvolvePokemon(r); else ReturnFromBattleToOverworld(r); }
export function TryEvolvePokemon(r=req()): void { r.battleStruct.evolutionState++; r.battleMainFunc = 'WaitForEvoSceneToFinish'; op(r, 'TryEvolvePokemon'); }
export function WaitForEvoSceneToFinish(r=req()): void { ReturnFromBattleToOverworld(r); }
export function ReturnFromBattleToOverworld(r=req()): void { FreeRestoreBattleData(r); r.mainCallback2 = 'CB2_ReturnToOverworld'; }
export function RunBattleScriptCommands_PopCallbacksStack(r=req()): void { op(r, 'RunBattleScriptCommands_PopCallbacksStack'); }
export function RunBattleScriptCommands(r=req()): void { op(r, 'RunBattleScriptCommands'); }
export function HandleAction_UseMove(r=req()): void { r.battlerAttacker = r.activeBattler; r.battlerTarget = (r.activeBattler ^ 1) % r.battlersCount; RunBattleScriptCommands(r); HandleAction_ActionFinished(r); }
export function HandleAction_Switch(r=req()): void { UpdatePartyOwnerOnSwitch_NonMulti(r.activeBattler, r); SwitchInClearSetData(r); HandleAction_ActionFinished(r); }
export function HandleAction_UseItem(r=req()): void { op(r, `UseItem:${r.activeBattler}`); HandleAction_ActionFinished(r); }
export function TryRunFromBattle(battler: number, r=req()): boolean { if (IsRunningFromBattleImpossible(r)) return false; r.battleStruct.runTries++; return r.battleStruct.runTries + r.battleMons[battler].speed >= r.battleMons[battler ^ 1]?.speed; }
export function HandleAction_Run(r=req()): void { if (TryRunFromBattle(r.activeBattler, r)) HandleEndTurn_RanFromBattle(r); else HandleAction_ActionFinished(r); }
export function HandleAction_WatchesCarefully(r=req()): void { op(r, 'SafariWatchCarefully'); HandleAction_ActionFinished(r); }
export function HandleAction_SafariZoneBallThrow(r=req()): void { op(r, 'SafariBallThrow'); HandleAction_ActionFinished(r); }
export function HandleAction_ThrowBait(r=req()): void { op(r, 'ThrowBait'); HandleAction_ActionFinished(r); }
export function HandleAction_ThrowRock(r=req()): void { op(r, 'ThrowRock'); HandleAction_ActionFinished(r); }
export function HandleAction_SafariZoneRun(r=req()): void { HandleEndTurn_RanFromBattle(r); }
export function HandleAction_OldManBallThrow(r=req()): void { op(r, 'OldManBallThrow'); HandleAction_ActionFinished(r); }
export function HandleAction_TryFinish(r=req()): void { const playerAlive = r.playerParty.some((p) => p.species && p.hp > 0 && p.species !== SPECIES_EGG); const enemyAlive = r.enemyParty.some((p) => p.species && p.hp > 0 && p.species !== SPECIES_EGG); if (!enemyAlive) HandleEndTurn_BattleWon(r); else if (!playerAlive) HandleEndTurn_BattleLost(r); else HandleEndTurn_ContinueBattle(r); }
export function HandleAction_NothingIsFainted(r=req()): void { HandleAction_ActionFinished(r); }
export function HandleAction_ActionFinished(r=req()): void { r.currentTurnActionNumber++; if (BattleTurnPassed(r)) HandleAction_TryFinish(r); }
const actionHandlers: Record<number, (r: BattleMainRuntime) => void> = { [B_ACTION_USE_MOVE]: HandleAction_UseMove, [B_ACTION_USE_ITEM]: HandleAction_UseItem, [B_ACTION_SWITCH]: HandleAction_Switch, [B_ACTION_RUN]: HandleAction_Run, [B_ACTION_SAFARI_WATCH_CAREFULLY]: HandleAction_WatchesCarefully, [B_ACTION_SAFARI_BALL]: HandleAction_SafariZoneBallThrow, [B_ACTION_SAFARI_BAIT]: HandleAction_ThrowBait, [B_ACTION_SAFARI_GO_NEAR]: HandleAction_ThrowRock, [B_ACTION_SAFARI_RUN]: HandleAction_SafariZoneRun, [B_ACTION_OLDMAN_THROW]: HandleAction_OldManBallThrow, [B_ACTION_TRY_FINISH]: HandleAction_TryFinish, [B_ACTION_FINISHED]: HandleAction_ActionFinished, [B_ACTION_NOTHING_FAINTED]: HandleAction_NothingIsFainted };
const battleMainHandlers: Record<string, (r: BattleMainRuntime) => void> = { BeginBattleIntro, BattleMainCB1, TryDoEventsBeforeFirstTurn, HandleTurnActionSelectionState, RunTurnActionsFunctions, FreeResetData_ReturnToOvOrDoEvolutions, WaitForEvoSceneToFinish };
