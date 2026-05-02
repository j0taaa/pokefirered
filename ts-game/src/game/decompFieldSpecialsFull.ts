export interface FieldPokemon {
  species: number;
  isEgg?: boolean;
  isBadEgg?: boolean;
  friendship?: number;
  types?: [number, number];
  evTotal?: number;
  effortRibbon?: boolean;
  pokerus?: boolean;
  nickname?: string;
  language?: number;
  otName?: string;
  otId?: number;
  personality?: number;
  moves?: number[];
}

export interface FieldTask {
  func: keyof typeof fieldSpecialTaskHandlers | null;
  data: number[];
  destroyed: boolean;
}

export interface FieldSpecialsRuntime {
  vars: Record<string, number>;
  flags: Set<string>;
  strings: [string, string, string, string];
  player: { x: number; y: number; gender: number; trainerId: number[]; name: string; avatarFlags: number; facing: number };
  battleOutcome: number;
  party: FieldPokemon[];
  boxes: number[][];
  currentBox: number;
  location: { mapGroup: number; mapNum: number };
  dynamicWarp: { mapGroup: number; mapNum: number };
  lastUsedWarp: { mapGroup: number; mapNum: number };
  objectEvents: Array<{ graphicsId: number; invisible?: boolean; spriteId?: number }>;
  tasks: FieldTask[];
  operations: string[];
  randomValues: number[];
  gameStats: Record<string, number>;
  mapGrid: Record<string, number>;
  listMenuInput: number;
  paletteFadeActive: boolean;
  fieldEffectActive: boolean;
  questLogPlayback: boolean;
  globalTintMode: number;
  specialResult: number;
  selectedObjectEvent: number;
  textColor: number;
  pcBoxToSendMon: number;
  elevatorScroll: number;
  elevatorCursorPos: number;
  listMenuLastScrollPosition: number;
  brailleTextCursorSpriteID: number;
}

export const MALE = 0;
export const FEMALE = 1;
export const PLAYER_AVATAR_FLAG_ON_FOOT = 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 2;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 4;
export const PLAYER_AVATAR_FLAG_SURFING = 8;
export const DIR_NORTH = 1;
export const DIR_WEST = 2;
export const DIR_EAST = 3;
export const TYPE_GRASS = 12;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const SPECIES_BULBASAUR = 1;
export const SPECIES_VENUSAUR = 3;
export const SPECIES_CHARMANDER = 4;
export const SPECIES_CHARIZARD = 6;
export const SPECIES_SQUIRTLE = 7;
export const SPECIES_BLASTOISE = 9;
export const NUM_SPECIES = 412;
export const PARTY_SIZE = 6;
export const TOTAL_BOXES_COUNT = 14;
export const IN_BOX_COUNT = 30;
export const LANGUAGE_ENGLISH = 2;
export const MOVE_NONE = 0;
export const MOVE_FRENZY_PLANT = 338;
export const MOVE_BLAST_BURN = 307;
export const MOVE_HYDRO_CANNON = 308;
export const MOVETUTOR_FRENZY_PLANT = 0;
export const MOVETUTOR_BLAST_BURN = 1;
export const MOVETUTOR_HYDRO_CANNON = 2;
export const ITEM_BIG_PEARL = 112;
export const ITEM_PEARL = 111;
export const ITEM_STARDUST = 107;
export const ITEM_STAR_PIECE = 108;
export const ITEM_NUGGET = 110;
export const ITEM_RARE_CANDY = 102;
export const ITEM_LUXURY_BALL = 11;
export const ITEM_TM01 = 289;
export const ITEM_HM08 = 354;
export const NPC_TEXT_COLOR_DEFAULT = 0xff;
export const NPC_TEXT_COLOR_NEUTRAL = 0;
export const QL_STATE_PLAYBACK = 2;
export const QL_TINT_BACKUP_GRAYSCALE = 3;
export const MAP_UNDEFINED = 0xffff;

const VAR_STARTER_MON = 'VAR_STARTER_MON';
const VAR_RESORT_GORGEOUS_REQUESTED_MON = 'VAR_RESORT_GORGEOUS_REQUESTED_MON';
const VAR_RESORT_GORGEOUS_REWARD = 'VAR_RESORT_GORGEOUS_REWARD';
const VAR_RESORT_GOREGEOUS_STEP_COUNTER = 'VAR_RESORT_GOREGEOUS_STEP_COUNTER';
const VAR_ELEVATOR_FLOOR = 'VAR_ELEVATOR_FLOOR';
const VAR_TRAINER_CARD_MON_ICON_TINT_IDX = 'VAR_TRAINER_CARD_MON_ICON_TINT_IDX';
const VAR_PC_BOX_TO_SEND_MON = 'VAR_PC_BOX_TO_SEND_MON';
const VAR_MASSAGE_COOLDOWN_STEP_COUNTER = 'VAR_MASSAGE_COOLDOWN_STEP_COUNTER';
const VAR_DEOXYS_INTERACTION_NUM = 'VAR_DEOXYS_INTERACTION_NUM';
const VAR_DEOXYS_INTERACTION_STEP_COUNTER = 'VAR_DEOXYS_INTERACTION_STEP_COUNTER';
const FLAG_SYS_RIBBON_GET = 'FLAG_SYS_RIBBON_GET';
const FLAG_SHOWN_BOX_WAS_FULL_MESSAGE = 'FLAG_SHOWN_BOX_WAS_FULL_MESSAGE';
const FLAG_SYS_DEOXYS_AWAKENED = 'FLAG_SYS_DEOXYS_AWAKENED';
const FLAG_TUTOR_FRENZY_PLANT = 'FLAG_TUTOR_FRENZY_PLANT';
const FLAG_TUTOR_BLAST_BURN = 'FLAG_TUTOR_BLAST_BURN';
const FLAG_TUTOR_HYDRO_CANNON = 'FLAG_TUTOR_HYDRO_CANNON';
const FLAG_USED_CUT_ON_RUIN_VALLEY_BRAILLE = 'FLAG_USED_CUT_ON_RUIN_VALLEY_BRAILLE';
const FLAG_TEMP_2 = 'FLAG_TEMP_2';
const FLAG_TEMP_3 = 'FLAG_TEMP_3';
const FLAG_TEMP_4 = 'FLAG_TEMP_4';
const FLAG_TEMP_5 = 'FLAG_TEMP_5';
const sSlotMachineIndices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5];
const sResortGorgeousDeluxeRewards = [ITEM_BIG_PEARL, ITEM_PEARL, ITEM_STARDUST, ITEM_STAR_PIECE, ITEM_NUGGET, ITEM_RARE_CANDY];
const sElevatorAnimationDuration = [8, 16, 24, 32, 38, 46, 53, 56, 57];
const sElevatorWindowAnimDuration = [3, 6, 9, 12, 15, 18, 21, 24, 27];
const sStarterSpecies = [SPECIES_BULBASAUR, SPECIES_SQUIRTLE, SPECIES_CHARMANDER];
const sCapeBrinkCompatibleSpecies = [SPECIES_VENUSAUR, SPECIES_CHARIZARD, SPECIES_BLASTOISE];
const sDeoxysCoords = [[15, 12], [11, 14], [15, 8], [19, 14], [12, 11], [18, 11], [15, 14], [11, 14], [19, 14], [15, 15], [15, 10]];
const sDeoxysStepCaps = [4, 8, 8, 8, 4, 4, 4, 6, 3, 3];
const pokeCenter1FMaps = [0x0101, 0x0102, 0x0103, 0x0104, 0x0105, 0x0106, 0x0107, 0x0108, 0x0109, 0x010a, 0x010b, 0x010c, 0x010d, 0x010e, 0x010f, 0x0110, 0x0111, 0x0112, 0x0113, 0x0200, MAP_UNDEFINED];

let activeRuntime: FieldSpecialsRuntime | null = null;
const requireRuntime = (runtime?: FieldSpecialsRuntime): FieldSpecialsRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('field specials runtime is not active');
  return resolved;
};
const op = (runtime: FieldSpecialsRuntime, name: string): void => { runtime.operations.push(name); };
const rand = (runtime: FieldSpecialsRuntime): number => runtime.randomValues.length ? runtime.randomValues.shift() ?? 0 : 0;
const varGet = (runtime: FieldSpecialsRuntime, name: string): number => runtime.vars[name] ?? 0;
const varSet = (runtime: FieldSpecialsRuntime, name: string, value: number): void => { runtime.vars[name] = value; };
const flagGet = (runtime: FieldSpecialsRuntime, name: string): boolean => runtime.flags.has(name);
const flagSet = (runtime: FieldSpecialsRuntime, name: string): void => { runtime.flags.add(name); };
const flagClear = (runtime: FieldSpecialsRuntime, name: string): void => { runtime.flags.delete(name); };
const createTask = (runtime: FieldSpecialsRuntime, func: keyof typeof fieldSpecialTaskHandlers): number => { const id = runtime.tasks.length; runtime.tasks.push({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false }); op(runtime, `CreateTask:${func}:${id}`); return id; };
const task = (runtime: FieldSpecialsRuntime, taskId: number): FieldTask => runtime.tasks[taskId] ?? (runtime.tasks[taskId] = { func: null, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const destroyTask = (runtime: FieldSpecialsRuntime, taskId: number): void => { task(runtime, taskId).destroyed = true; task(runtime, taskId).func = null; op(runtime, `DestroyTask:${taskId}`); };
const findTask = (runtime: FieldSpecialsRuntime, func: keyof typeof fieldSpecialTaskHandlers): number => runtime.tasks.findIndex((t) => !t.destroyed && t.func === func);
const partyCount = (runtime: FieldSpecialsRuntime): number => runtime.party.filter((p) => p.species !== SPECIES_NONE).length;
const leadMon = (runtime: FieldSpecialsRuntime): FieldPokemon => runtime.party[GetLeadMonIndex(runtime)] ?? { species: SPECIES_NONE };
const playerTrainerId = (runtime: FieldSpecialsRuntime): number => ((runtime.player.trainerId[3] ?? 0) << 24) | ((runtime.player.trainerId[2] ?? 0) << 16) | ((runtime.player.trainerId[1] ?? 0) << 8) | (runtime.player.trainerId[0] ?? 0);
const mapKey = (x: number, y: number): string => `${x},${y}`;
const setMetatile = (runtime: FieldSpecialsRuntime, x: number, y: number, id: number): void => { runtime.mapGrid[mapKey(x, y)] = id; op(runtime, `MapGridSetMetatileIdAt:${x}:${y}:${id}`); };
const speciesName = (species: number): string => `SPECIES_${species}`;
const moveName = (move: number): string => `MOVE_${move}`;
const mapNo = (runtime: FieldSpecialsRuntime): number => (runtime.location.mapGroup << 8) + runtime.location.mapNum;

export function createFieldSpecialsRuntime(): FieldSpecialsRuntime {
  const runtime: FieldSpecialsRuntime = {
    vars: { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 0, gSpecialVar_0x8006: 0, gSpecialVar_0x8007: 0 },
    flags: new Set(),
    strings: ['', '', '', ''],
    player: { x: 0, y: 0, gender: MALE, trainerId: [0, 0, 0, 0], name: 'PLAYER', avatarFlags: PLAYER_AVATAR_FLAG_ON_FOOT, facing: DIR_NORTH },
    battleOutcome: 0,
    party: Array.from({ length: PARTY_SIZE }, () => ({ species: SPECIES_NONE })),
    boxes: Array.from({ length: TOTAL_BOXES_COUNT }, () => Array.from({ length: IN_BOX_COUNT }, () => SPECIES_NONE)),
    currentBox: 0,
    location: { mapGroup: 0, mapNum: 0 },
    dynamicWarp: { mapGroup: 0, mapNum: 0 },
    lastUsedWarp: { mapGroup: 0, mapNum: 0 },
    objectEvents: Array.from({ length: 16 }, () => ({ graphicsId: 0, spriteId: 0 })),
    tasks: [],
    operations: [],
    randomValues: [],
    gameStats: {},
    mapGrid: {},
    listMenuInput: -1,
    paletteFadeActive: false,
    fieldEffectActive: false,
    questLogPlayback: false,
    globalTintMode: 0,
    specialResult: 0,
    selectedObjectEvent: 0,
    textColor: NPC_TEXT_COLOR_DEFAULT,
    pcBoxToSendMon: 0,
    elevatorScroll: 0,
    elevatorCursorPos: 0,
    listMenuLastScrollPosition: 0,
    brailleTextCursorSpriteID: 0
  };
  activeRuntime = runtime;
  return runtime;
}

export function ShowDiploma(runtime = requireRuntime()): void { op(runtime, 'QuestLog_CutRecording'); op(runtime, 'SetMainCallback2:CB2_ShowDiploma'); op(runtime, 'LockPlayerFieldControls'); }
export function ForcePlayerOntoBike(runtime = requireRuntime()): void { if (runtime.player.avatarFlags & PLAYER_AVATAR_FLAG_ON_FOOT) runtime.player.avatarFlags = PLAYER_AVATAR_FLAG_MACH_BIKE; op(runtime, 'Overworld_SetSavedMusic:MUS_CYCLING'); op(runtime, 'Overworld_ChangeMusicTo:MUS_CYCLING'); }
export function ResetCyclingRoadChallengeData(_runtime = requireRuntime()): void {}
export function GetPlayerAvatarBike(runtime = requireRuntime()): number { if (runtime.player.avatarFlags & PLAYER_AVATAR_FLAG_ACRO_BIKE) return 1; if (runtime.player.avatarFlags & PLAYER_AVATAR_FLAG_MACH_BIKE) return 2; return 0; }
export function ShowFieldMessageStringVar4(runtime = requireRuntime()): void { op(runtime, `ShowFieldMessage:${runtime.strings[3]}`); }
export function GetPlayerXY(runtime = requireRuntime()): void { runtime.vars.gSpecialVar_0x8004 = runtime.player.x; runtime.vars.gSpecialVar_0x8005 = runtime.player.y; }
export function GetPlayerTrainerIdOnesDigit(runtime = requireRuntime()): number { return (((runtime.player.trainerId[1] ?? 0) << 8) | (runtime.player.trainerId[0] ?? 0)) % 10; }
export function BufferBigGuyOrBigGirlString(runtime = requireRuntime()): void { runtime.strings[0] = runtime.player.gender === MALE ? 'Big guy' : 'Big girl'; }
export function BufferSonOrDaughterString(runtime = requireRuntime()): void { runtime.strings[0] = runtime.player.gender === MALE ? 'Daughter' : 'Son'; }
export function GetBattleOutcome(runtime = requireRuntime()): number { return runtime.battleOutcome; }
export function SetHiddenItemFlag(runtime = requireRuntime()): void { flagSet(runtime, `FLAG_${runtime.vars.gSpecialVar_0x8004}`); }
export function GetLeadMonFriendship(runtime = requireRuntime()): number { const f = leadMon(runtime).friendship ?? 0; if (f === 255) return 6; if (f >= 200) return 5; if (f >= 150) return 4; if (f >= 100) return 3; if (f >= 50) return 2; if (f > 0) return 1; return 0; }
export function ShowTownMap(runtime = requireRuntime()): void { op(runtime, 'QuestLog_CutRecording'); op(runtime, 'InitRegionMapWithExitCB:REGIONMAP_TYPE_WALL'); }
export function PlayerHasGrassPokemonInParty(runtime = requireRuntime()): boolean { return runtime.party.some((p) => p.species !== SPECIES_NONE && !p.isEgg && (p.types?.[0] === TYPE_GRASS || p.types?.[1] === TYPE_GRASS)); }
export function AnimatePcTurnOn(runtime = requireRuntime()): void { if (findTask(runtime, 'Task_AnimatePcTurnOn') === -1) createTask(runtime, 'Task_AnimatePcTurnOn'); }
export function Task_AnimatePcTurnOn(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (d[1] === 6) { PcTurnOnUpdateMetatileId(d[0] & 1, runtime); op(runtime, 'DrawWholeMapView'); d[1] = 0; d[0] += 1; if (d[0] === 5) destroyTask(runtime, taskId); } d[1] += 1; }
export function PcTurnOnUpdateMetatileId(flickerOff: boolean | number, runtime = requireRuntime()): void { const direction = runtime.player.facing; const dx = direction === DIR_WEST ? -1 : direction === DIR_EAST ? 1 : 0; const dy = direction === DIR_NORTH || direction === DIR_WEST || direction === DIR_EAST ? -1 : 0; const base = flickerOff ? 100 : 200; setMetatile(runtime, runtime.player.x + dx + 7, runtime.player.y + dy + 7, base + (runtime.vars.gSpecialVar_0x8004 ?? 0)); }
export function AnimatePcTurnOff(runtime = requireRuntime()): void { PcTurnOnUpdateMetatileId(true, runtime); op(runtime, 'DrawWholeMapView'); }
export function SpawnCameraObject(runtime = requireRuntime()): void { runtime.objectEvents[0] = { graphicsId: 0, invisible: true, spriteId: 8 }; op(runtime, 'CameraObjectSetFollowedObjectId:8'); }
export function RemoveCameraObject(runtime = requireRuntime()): void { op(runtime, 'CameraObjectSetFollowedObjectId:player'); op(runtime, 'RemoveObjectEventByLocalIdAndMap:LOCALID_CAMERA'); }
export function BufferEReaderTrainerName(runtime = requireRuntime()): void { runtime.strings[0] = 'EREADER_TRAINER'; }
export function GetRandomSlotMachineId(runtime = requireRuntime()): number { return sSlotMachineIndices[rand(runtime) % sSlotMachineIndices.length] ?? 0; }
export function LeadMonHasEffortRibbon(runtime = requireRuntime()): boolean { return !!leadMon(runtime).effortRibbon; }
export function GiveLeadMonEffortRibbon(runtime = requireRuntime()): void { runtime.gameStats.GAME_STAT_RECEIVED_RIBBONS = (runtime.gameStats.GAME_STAT_RECEIVED_RIBBONS ?? 0) + 1; flagSet(runtime, FLAG_SYS_RIBBON_GET); leadMon(runtime).effortRibbon = true; }
export function AreLeadMonEVsMaxedOut(runtime = requireRuntime()): boolean { return (leadMon(runtime).evTotal ?? 0) >= 510; }
export function IsStarterFirstStageInParty(runtime = requireRuntime()): boolean { const species = GetStarterSpeciesById(varGet(runtime, VAR_STARTER_MON), runtime); return runtime.party.slice(0, partyCount(runtime)).some((p) => p.species === species); }
export function IsThereRoomInAnyBoxForMorePokemon(runtime = requireRuntime()): boolean { return runtime.boxes.some((box) => box.some((species) => species === SPECIES_NONE)); }
export function IsPokerusInParty(runtime = requireRuntime()): boolean { return runtime.party.some((p) => !!p.pokerus); }
export function ShakeScreen(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_ShakeScreen'); const d = task(runtime, id).data; d[0] = runtime.vars.gSpecialVar_0x8005; d[1] = 0; d[2] = runtime.vars.gSpecialVar_0x8006; d[3] = runtime.vars.gSpecialVar_0x8007; d[4] = runtime.vars.gSpecialVar_0x8004; op(runtime, 'SetCameraPanningCallback:NULL'); op(runtime, 'PlaySE:SE_M_STRENGTH'); }
export function Task_ShakeScreen(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; d[1] += 1; if (d[3] !== 0 && d[1] % d[3] === 0) { d[1] = 0; d[2] -= 1; d[0] = -d[0]; d[4] = -d[4]; op(runtime, `SetCameraPanning:${d[0]}:${d[4]}`); if (d[2] === 0) { Task_EndScreenShake(taskId, runtime); op(runtime, 'InstallCameraPanAheadCallback'); } } }
export function Task_EndScreenShake(taskId: number, runtime = requireRuntime()): void { destroyTask(runtime, taskId); op(runtime, 'ScriptContext_Enable'); }
export function GetLeadMonIndex(runtime = requireRuntime()): number { const count = partyCount(runtime); for (let i = 0; i < count; i += 1) if (runtime.party[i].species !== SPECIES_EGG && runtime.party[i].species !== SPECIES_NONE) return i; return 0; }
export function GetPartyMonSpecies(runtime = requireRuntime()): number { return runtime.party[runtime.vars.gSpecialVar_0x8004]?.species ?? SPECIES_NONE; }
export function IsMonOTNameNotPlayers(runtime = requireRuntime()): boolean { runtime.strings[0] = runtime.party[runtime.vars.gSpecialVar_0x8004]?.otName ?? ''; return runtime.player.name !== runtime.strings[0]; }
export function NullFieldSpecial(_runtime = requireRuntime()): void {}
export function DoPicboxCancel(runtime = requireRuntime()): void { op(runtime, 'AddTextPrinterParameterized:EOS'); op(runtime, 'PicboxCancel'); }
export function SetVermilionTrashCans(runtime = requireRuntime()): void { const idx = (rand(runtime) % 15) + 1; runtime.vars.gSpecialVar_0x8004 = idx; let second = idx; const r = rand(runtime); const add = (n: number): void => { second += n; }; if (idx === 1) add(r % 2 === 0 ? 1 : 5); else if (idx >= 2 && idx <= 4) add([1, 5, -1][r % 3] ?? 1); else if (idx === 5) add(r % 2 === 0 ? 5 : -1); else if (idx === 6) add([-5, 1, 5][r % 3] ?? -5); else if (idx >= 7 && idx <= 9) add([-5, 1, 5, -1][r % 4] ?? -5); else if (idx === 10) add([-5, 5, -1][r % 3] ?? -5); else if (idx === 11) add(r % 2 === 0 ? -5 : 1); else if (idx >= 12 && idx <= 14) add([-5, 1, -1][r % 3] ?? -5); else add(r % 2 === 0 ? -5 : -1); if (second > 15) second = idx % 5 === 0 ? idx - 1 : idx + 1; runtime.vars.gSpecialVar_0x8005 = second; }
export function IncrementResortGorgeousStepCounter(runtime = requireRuntime()): void { const requested = varGet(runtime, VAR_RESORT_GORGEOUS_REQUESTED_MON); if (requested !== SPECIES_NONE) { const count = varGet(runtime, VAR_RESORT_GOREGEOUS_STEP_COUNTER) + 1; if (count >= 250) { varSet(runtime, VAR_RESORT_GORGEOUS_REQUESTED_MON, 0xffff); varSet(runtime, VAR_RESORT_GOREGEOUS_STEP_COUNTER, 0); } else varSet(runtime, VAR_RESORT_GOREGEOUS_STEP_COUNTER, count); } }
export function SampleResortGorgeousMonAndReward(runtime = requireRuntime()): void { const requested = varGet(runtime, VAR_RESORT_GORGEOUS_REQUESTED_MON); if (requested === SPECIES_NONE || requested === 0xffff) { varSet(runtime, VAR_RESORT_GORGEOUS_REQUESTED_MON, SampleResortGorgeousMon(runtime)); varSet(runtime, VAR_RESORT_GORGEOUS_REWARD, SampleResortGorgeousReward(runtime)); varSet(runtime, VAR_RESORT_GOREGEOUS_STEP_COUNTER, 0); } runtime.strings[0] = speciesName(varGet(runtime, VAR_RESORT_GORGEOUS_REQUESTED_MON)); }
export function SampleResortGorgeousMon(runtime = requireRuntime()): number { return (rand(runtime) % (NUM_SPECIES - 1)) + 1; }
export function SampleResortGorgeousReward(runtime = requireRuntime()): number { return rand(runtime) % 100 >= 30 ? ITEM_LUXURY_BALL : sResortGorgeousDeluxeRewards[rand(runtime) % sResortGorgeousDeluxeRewards.length] ?? ITEM_BIG_PEARL; }
export function CheckAddCoins(runtime = requireRuntime()): boolean { return runtime.specialResult + runtime.vars.gSpecialVar_0x8006 <= 9999; }
export function GetElevatorFloor(runtime = requireRuntime()): void { varSet(runtime, VAR_ELEVATOR_FLOOR, elevatorFloorFor(runtime.dynamicWarp.mapGroup, runtime.dynamicWarp.mapNum)); }
const elevatorFloorFor = (group: number, num: number): number => group === 1 ? ({ 11: 14, 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 5, 1: 4, 101: 3, 102: 2, 104: 0 }[num] ?? 4) : group === 2 ? ({ 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 }[num] ?? 4) : group === 3 ? (num === 0 ? 3 : 15) : 4;
export function InitElevatorFloorSelectMenuPos(runtime = requireRuntime()): number { runtime.elevatorScroll = 0; runtime.elevatorCursorPos = Math.max(0, 14 - elevatorFloorFor(runtime.dynamicWarp.mapGroup, runtime.dynamicWarp.mapNum)); return runtime.elevatorCursorPos; }
export function AnimateElevator(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_ElevatorShake'); const d = task(runtime, id).data; d[1] = 0; d[2] = 0; d[4] = 1; let nfloors = Math.abs(runtime.vars.gSpecialVar_0x8005 - runtime.vars.gSpecialVar_0x8006); d[6] = runtime.vars.gSpecialVar_0x8005 > runtime.vars.gSpecialVar_0x8006 ? 1 : 0; if (nfloors > 8) nfloors = 8; d[5] = sElevatorAnimationDuration[nfloors] ?? 8; op(runtime, 'SetCameraPanningCallback:NULL'); AnimateElevatorWindowView(nfloors, d[6], runtime); op(runtime, 'PlaySE:SE_ELEVATOR'); }
export function Task_ElevatorShake(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; d[1] += 1; if (d[1] % 3 === 0) { d[1] = 0; d[2] += 1; d[4] = -d[4]; op(runtime, `SetCameraPanning:0:${d[4]}`); if (d[2] === d[5]) { op(runtime, 'PlaySE:SE_DING_DONG'); destroyTask(runtime, taskId); op(runtime, 'ScriptContext_Enable'); op(runtime, 'InstallCameraPanAheadCallback'); } } }
export function DrawElevatorCurrentFloorWindow(runtime = requireRuntime()): void { op(runtime, `DrawElevatorCurrentFloorWindow:${runtime.vars.gSpecialVar_0x8005}`); }
export function CloseElevatorCurrentFloorWindow(runtime = requireRuntime()): void { op(runtime, 'CloseElevatorCurrentFloorWindow'); }
export function AnimateElevatorWindowView(nfloors: number, direction: number, runtime = requireRuntime()): void { if (findTask(runtime, 'Task_AnimateElevatorWindowView') === -1) { const id = createTask(runtime, 'Task_AnimateElevatorWindowView'); const d = task(runtime, id).data; d[0] = 0; d[1] = 0; d[2] = direction; d[3] = sElevatorWindowAnimDuration[nfloors] ?? 3; } }
export function Task_AnimateElevatorWindowView(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (d[1] === 6) { d[0] += 1; op(runtime, `ElevatorWindowFrame:${d[2]}:${d[0] % 3}`); op(runtime, 'DrawWholeMapView'); d[1] = 0; if (d[0] === d[3]) destroyTask(runtime, taskId); } d[1] += 1; }
export function ListMenu(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_CreateScriptListMenu'); const d = task(runtime, id).data; const kind = runtime.vars.gSpecialVar_0x8004; const configs: Record<number, number[]> = { 0: [4, 9, 1, 1, 12, 7, 1], 1: [7, 12, 1, 1, 8, 12, 0], 5: [7, 12, 16, 1, 17, 12, 0] }; const cfg = configs[kind]; if (!cfg) { runtime.specialResult = 0x7f; destroyTask(runtime, id); return; } d.splice(0, cfg.length, ...cfg); d[15] = id; if (kind === 1) { d[7] = runtime.elevatorScroll; d[8] = runtime.elevatorCursorPos; } }
export function Task_CreateScriptListMenu(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; runtime.listMenuLastScrollPosition = runtime.vars.gSpecialVar_0x8004 === 1 ? runtime.elevatorScroll : 0; CreateScriptListMenu(runtime); d[13] = taskId + 20; Task_CreateMenuRemoveScrollIndicatorArrowPair(taskId, runtime); d[14] = taskId + 100; task(runtime, taskId).func = 'Task_ListMenuHandleInput'; op(runtime, `ListMenuInit:${d[7]}:${d[8]}`); }
export function CreateScriptListMenu(runtime = requireRuntime()): void { op(runtime, 'CreateScriptListMenuTemplate'); }
export function ScriptListMenuMoveCursorFunction(_nothing: number, _is: boolean, _used: unknown, runtime = requireRuntime()): void { op(runtime, 'PlaySE:SE_SELECT'); runtime.listMenuLastScrollPosition = runtime.elevatorScroll; }
export function Task_ListMenuHandleInput(taskId: number, runtime = requireRuntime()): void { const input = runtime.listMenuInput; const d = task(runtime, taskId).data; if (input === -1) return; if (input === -2) { runtime.specialResult = 0x7f; op(runtime, 'PlaySE:SE_SELECT'); Task_DestroyListMenu(taskId, runtime); return; } runtime.specialResult = input; op(runtime, 'PlaySE:SE_SELECT'); if (d[6] === 0 || input === d[1] - 1) Task_DestroyListMenu(taskId, runtime); else { Task_ListMenuRemoveScrollIndicatorArrowPair(taskId, runtime); task(runtime, taskId).func = 'Task_SuspendListMenu'; op(runtime, 'ScriptContext_Enable'); } }
export function Task_DestroyListMenu(taskId: number, runtime = requireRuntime()): void { Task_ListMenuRemoveScrollIndicatorArrowPair(taskId, runtime); destroyTask(runtime, taskId); op(runtime, 'ScriptContext_Enable'); }
export function Task_SuspendListMenu(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (d[6] === 2) { d[6] = 1; task(runtime, taskId).func = 'Task_RedrawScrollArrowsAndWaitInput'; } }
export function ReturnToListMenu(runtime = requireRuntime()): void { const id = findTask(runtime, 'Task_SuspendListMenu'); if (id === -1) op(runtime, 'ScriptContext_Enable'); else task(runtime, id).data[6] += 1; }
export function Task_RedrawScrollArrowsAndWaitInput(taskId: number, runtime = requireRuntime()): void { op(runtime, 'LockPlayerFieldControls'); Task_CreateMenuRemoveScrollIndicatorArrowPair(taskId, runtime); task(runtime, taskId).func = 'Task_ListMenuHandleInput'; }
export function Task_CreateMenuRemoveScrollIndicatorArrowPair(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (d[0] !== d[1]) d[12] = taskId + 200; }
export function Task_ListMenuRemoveScrollIndicatorArrowPair(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (d[0] !== d[1]) op(runtime, `RemoveScrollIndicatorArrowPair:${d[12]}`); }
export function ForcePlayerToStartSurfing(runtime = requireRuntime()): void { op(runtime, 'SetHelpContext:SURFING'); runtime.player.avatarFlags = PLAYER_AVATAR_FLAG_SURFING; }
export function GetStarterSpeciesById(idx: number, _runtime = requireRuntime()): number { return sStarterSpecies[idx] ?? sStarterSpecies[0]; }
export function GetStarterSpecies(runtime = requireRuntime()): number { return GetStarterSpeciesById(varGet(runtime, VAR_STARTER_MON), runtime); }
export function SetSeenMon(runtime = requireRuntime()): void { op(runtime, `SetSeenMon:${runtime.vars.gSpecialVar_0x8004}`); }
export function ResetContextNpcTextColor(runtime = requireRuntime()): void { runtime.selectedObjectEvent = 0; runtime.textColor = NPC_TEXT_COLOR_DEFAULT; }
export function ContextNpcGetTextColor(runtime = requireRuntime()): number { if (runtime.textColor !== NPC_TEXT_COLOR_DEFAULT) return runtime.textColor; if (runtime.selectedObjectEvent === 0) return NPC_TEXT_COLOR_NEUTRAL; return runtime.objectEvents[runtime.selectedObjectEvent]?.graphicsId ?? NPC_TEXT_COLOR_NEUTRAL; }
export function HasMonBeenRenamed(idx: number, runtime = requireRuntime()): boolean { const p = runtime.party[idx]; if (!p) return false; runtime.strings[0] = p.nickname ?? speciesName(p.species); if ((p.language ?? LANGUAGE_ENGLISH) !== LANGUAGE_ENGLISH) return true; return speciesName(p.species) !== runtime.strings[0]; }
export function HasLeadMonBeenRenamed(runtime = requireRuntime()): boolean { return HasMonBeenRenamed(GetLeadMonIndex(runtime), runtime); }
export function TV_PrintIntToStringVar(varidx: number, number: number, runtime = requireRuntime()): void { runtime.strings[varidx] = String(number); }
export function CountDigits(number: number): number { if (Math.trunc(number / 10) === 0) return 1; if (Math.trunc(number / 100) === 0) return 2; if (Math.trunc(number / 1000) === 0) return 3; if (Math.trunc(number / 10000) === 0) return 4; if (Math.trunc(number / 100000) === 0) return 5; if (Math.trunc(number / 1000000) === 0) return 6; if (Math.trunc(number / 10000000) === 0) return 7; if (Math.trunc(number / 100000000) === 0) return 8; return 1; }
export function NameRaterWasNicknameChanged(runtime = requireRuntime()): boolean { runtime.strings[0] = runtime.party[runtime.vars.gSpecialVar_0x8004]?.nickname ?? ''; return runtime.strings[2] !== runtime.strings[0]; }
export function ChangeBoxPokemonNickname(runtime = requireRuntime()): void { op(runtime, 'DoNamingScreen:BoxPokemon'); }
export function ChangeBoxPokemonNickname_CB(runtime = requireRuntime()): void { op(runtime, 'SetBoxMonNickAt'); op(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic'); }
export function ChangePokemonNickname(runtime = requireRuntime()): void { const p = runtime.party[runtime.vars.gSpecialVar_0x8004]; runtime.strings[2] = p?.nickname ?? ''; runtime.strings[1] = p?.nickname ?? ''; op(runtime, 'DoNamingScreen:Pokemon'); }
export function ChangePokemonNickname_CB(runtime = requireRuntime()): void { const p = runtime.party[runtime.vars.gSpecialVar_0x8004]; if (p) p.nickname = runtime.strings[1]; op(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic'); }
export function BufferMonNickname(runtime = requireRuntime()): void { runtime.strings[0] = runtime.party[runtime.vars.gSpecialVar_0x8004]?.nickname ?? ''; }
export function IsMonOTIDNotPlayers(runtime = requireRuntime()): void { runtime.specialResult = playerTrainerId(runtime) === (runtime.party[runtime.vars.gSpecialVar_0x8004]?.otId ?? 0) ? 0 : 1; }
export function GetPlayerTrainerId(runtime = requireRuntime()): number { return playerTrainerId(runtime); }
export function GetUnlockedSeviiAreas(runtime = requireRuntime()): number { let result = 0; for (let i = 0; i < 7; i += 1) if (flagGet(runtime, `FLAG_WORLD_MAP_${i + 1}`)) result |= 1 << i; return result; }
export function UpdateTrainerCardPhotoIcons(runtime = requireRuntime()): void { for (let i = 0; i < PARTY_SIZE; i += 1) varSet(runtime, `VAR_TRAINER_CARD_MON_ICON_${i + 1}`, runtime.party[i]?.species ?? SPECIES_NONE); varSet(runtime, VAR_TRAINER_CARD_MON_ICON_TINT_IDX, runtime.vars.gSpecialVar_0x8004); }
export function StickerManGetBragFlags(runtime = requireRuntime()): number { runtime.vars.gSpecialVar_0x8004 = runtime.gameStats.GAME_STAT_ENTERED_HOF ?? 0; runtime.vars.gSpecialVar_0x8005 = Math.min(runtime.gameStats.GAME_STAT_HATCHED_EGGS ?? 0, 0xffff); runtime.vars.gSpecialVar_0x8006 = runtime.gameStats.GAME_STAT_LINK_BATTLE_WINS ?? 0; return (runtime.vars.gSpecialVar_0x8004 ? 1 : 0) | (runtime.vars.gSpecialVar_0x8005 ? 2 : 0) | (runtime.vars.gSpecialVar_0x8006 ? 4 : 0); }
export function GetHiddenItemAttr(hiddenItem: number, attr: number, _runtime = requireRuntime()): number { if (attr === 0) return hiddenItem & 0x3ff; if (attr === 1) return ((hiddenItem >> 10) & 0x3ff) + 10000; if (attr === 2) return (hiddenItem >> 20) & 0xf; if (attr === 3) return (hiddenItem >> 24) & 1; return 1; }
export function DoesPlayerPartyContainSpecies(runtime = requireRuntime()): boolean { return runtime.party.slice(0, partyCount(runtime)).some((p) => p.species === runtime.vars.gSpecialVar_0x8004); }
export function GetMartClerkObjectId(runtime = requireRuntime()): number { return mapNo(runtime) === 0x0301 ? 3 : 1; }
export function SetUsedPkmnCenterQuestLogEvent(runtime = requireRuntime()): void { op(runtime, 'SetQuestLogEvent:QL_EVENT_USED_PKMN_CENTER'); }
export function QuestLog_CheckDepartingIndoorsMap(runtime = requireRuntime()): void { varSet(runtime, 'VAR_QL_ENTRANCE', mapNo(runtime)); flagSet(runtime, 'FLAG_SYS_QL_DEPARTED'); }
export function QuestLog_TryRecordDepartedLocation(runtime = requireRuntime()): void { if (flagGet(runtime, 'FLAG_SYS_QL_DEPARTED')) { op(runtime, `SetQuestLogEvent:QL_EVENT_DEPARTED:${varGet(runtime, 'VAR_QL_ENTRANCE')}`); flagClear(runtime, 'FLAG_SYS_QL_DEPARTED'); } }
export function GetMysteryGiftCardStat(runtime = requireRuntime()): number { return runtime.gameStats[`MYSTERY_GIFT_${runtime.specialResult}`] ?? 0; }
export function SetPCBoxToSendMon(boxId: number, runtime = requireRuntime()): void { runtime.pcBoxToSendMon = boxId; }
export function GetPCBoxToSendMon(runtime = requireRuntime()): number { return runtime.pcBoxToSendMon; }
export function ShouldShowBoxWasFullMessage(runtime = requireRuntime()): boolean { if (flagGet(runtime, FLAG_SHOWN_BOX_WAS_FULL_MESSAGE)) return false; if (runtime.currentBox === varGet(runtime, VAR_PC_BOX_TO_SEND_MON)) return false; flagSet(runtime, FLAG_SHOWN_BOX_WAS_FULL_MESSAGE); return true; }
export function IsDestinationBoxFull(runtime = requireRuntime()): boolean { SetPCBoxToSendMon(varGet(runtime, VAR_PC_BOX_TO_SEND_MON), runtime); let i = runtime.currentBox; do { for (let j = 0; j < IN_BOX_COUNT; j += 1) if ((runtime.boxes[i]?.[j] ?? SPECIES_NONE) === SPECIES_NONE) { if (GetPCBoxToSendMon(runtime) !== i) flagClear(runtime, FLAG_SHOWN_BOX_WAS_FULL_MESSAGE); varSet(runtime, VAR_PC_BOX_TO_SEND_MON, i); return ShouldShowBoxWasFullMessage(runtime); } i += 1; if (i === TOTAL_BOXES_COUNT) i = 0; } while (i !== runtime.currentBox); return false; }
export function UsedPokemonCenterWarp(runtime = requireRuntime()): boolean { const no = (runtime.lastUsedWarp.mapGroup << 8) + runtime.lastUsedWarp.mapNum; return pokeCenter1FMaps.includes(no); }
export function BufferTMHMMoveName(runtime = requireRuntime()): boolean { if (runtime.vars.gSpecialVar_0x8004 >= ITEM_TM01 && runtime.vars.gSpecialVar_0x8004 <= ITEM_HM08) { runtime.strings[0] = moveName(runtime.vars.gSpecialVar_0x8004 - ITEM_TM01 + 1); return true; } return false; }
export function RunMassageCooldownStepCounter(runtime = requireRuntime()): void { const count = varGet(runtime, VAR_MASSAGE_COOLDOWN_STEP_COUNTER); if (count < 500) varSet(runtime, VAR_MASSAGE_COOLDOWN_STEP_COUNTER, count + 1); }
export function DaisyMassageServices(runtime = requireRuntime()): void { const p = runtime.party[runtime.vars.gSpecialVar_0x8004]; if (p) p.friendship = Math.min(255, (p.friendship ?? 0) + 5); varSet(runtime, VAR_MASSAGE_COOLDOWN_STEP_COUNTER, 0); }
export function DoPokemonLeagueLightingEffect(runtime = requireRuntime()): void { const id = createTask(runtime, 'Task_RunPokemonLeagueLightingEffect'); const d = task(runtime, id).data; if (flagGet(runtime, FLAG_TEMP_3)) task(runtime, id).func = 'Task_CancelPokemonLeagueLightingEffect'; else { d[0] = 40; d[1] = 0; d[2] = 11; op(runtime, 'LoadPalette:LeagueLighting:0'); op(runtime, 'ApplyGlobalTintToPaletteSlot:7'); } }
export function Task_RunPokemonLeagueLightingEffect(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; if (!runtime.paletteFadeActive && flagGet(runtime, FLAG_TEMP_2) && !flagGet(runtime, FLAG_TEMP_5) && runtime.globalTintMode !== QL_TINT_BACKUP_GRAYSCALE) { d[0] -= 1; if (d[0] === 0) { d[1] += 1; if (d[1] === d[2]) d[1] = 0; d[0] = 12; op(runtime, `LoadPalette:LeagueLighting:${d[1]}`); } } }
export function Task_CancelPokemonLeagueLightingEffect(taskId: number, runtime = requireRuntime()): void { if (flagGet(runtime, FLAG_TEMP_4)) { op(runtime, 'LoadPalette:LeagueLighting:cancel'); destroyTask(runtime, taskId); } }
export function StopPokemonLeagueLightingEffectTask(runtime = requireRuntime()): void { const id = findTask(runtime, 'Task_RunPokemonLeagueLightingEffect'); if (id !== -1) destroyTask(runtime, id); }
export function CapeBrinkGetMoveToTeachLeadPokemon(runtime = requireRuntime()): boolean { const lead = leadMon(runtime); const slot = GetLeadMonIndex(runtime); runtime.vars.gSpecialVar_0x8007 = slot; const tutorMonId = sCapeBrinkCompatibleSpecies.indexOf(lead.species); if (tutorMonId < 0 || lead.friendship !== 255) return false; const tutors = [MOVETUTOR_FRENZY_PLANT, MOVETUTOR_BLAST_BURN, MOVETUTOR_HYDRO_CANNON]; const flags = [FLAG_TUTOR_FRENZY_PLANT, FLAG_TUTOR_BLAST_BURN, FLAG_TUTOR_HYDRO_CANNON]; const moves = [MOVE_FRENZY_PLANT, MOVE_BLAST_BURN, MOVE_HYDRO_CANNON]; runtime.strings[1] = moveName(moves[tutorMonId] ?? MOVE_NONE); runtime.vars.gSpecialVar_0x8005 = tutors[tutorMonId] ?? 0; if (flagGet(runtime, flags[tutorMonId] ?? '')) return false; runtime.vars.gSpecialVar_0x8006 = (lead.moves ?? []).filter((m) => m !== MOVE_NONE).length; return true; }
export function HasLearnedAllMovesFromCapeBrinkTutor(runtime = requireRuntime()): boolean { if (runtime.vars.gSpecialVar_0x8005 === MOVETUTOR_FRENZY_PLANT) flagSet(runtime, FLAG_TUTOR_FRENZY_PLANT); else if (runtime.vars.gSpecialVar_0x8005 === MOVETUTOR_BLAST_BURN) flagSet(runtime, FLAG_TUTOR_BLAST_BURN); else flagSet(runtime, FLAG_TUTOR_HYDRO_CANNON); return [FLAG_TUTOR_FRENZY_PLANT, FLAG_TUTOR_BLAST_BURN, FLAG_TUTOR_HYDRO_CANNON].every((f) => flagGet(runtime, f)); }
export function CutMoveRuinValleyCheck(runtime = requireRuntime()): boolean { return !flagGet(runtime, FLAG_USED_CUT_ON_RUIN_VALLEY_BRAILLE) && runtime.location.mapGroup === 6 && runtime.location.mapNum === 67 && runtime.player.x === 24 && runtime.player.y === 25 && runtime.player.facing === DIR_NORTH; }
export function CutMoveOpenDottedHoleDoor(runtime = requireRuntime()): void { setMetatile(runtime, 31, 31, 777); op(runtime, 'DrawWholeMapView'); op(runtime, 'PlaySE:SE_BANG'); flagSet(runtime, FLAG_USED_CUT_ON_RUIN_VALLEY_BRAILLE); op(runtime, 'UnlockPlayerFieldControls'); }
export function DoDeoxysTriangleInteraction(runtime = requireRuntime()): void { createTask(runtime, 'Task_DoDeoxysTriangleInteraction'); }
export function Task_DoDeoxysTriangleInteraction(taskId: number, runtime = requireRuntime()): void { if (flagGet(runtime, FLAG_SYS_DEOXYS_AWAKENED)) { runtime.specialResult = 3; op(runtime, 'ScriptContext_Enable'); destroyTask(runtime, taskId); return; } let r5 = varGet(runtime, VAR_DEOXYS_INTERACTION_NUM); const r6 = varGet(runtime, VAR_DEOXYS_INTERACTION_STEP_COUNTER); varSet(runtime, VAR_DEOXYS_INTERACTION_STEP_COUNTER, 0); if (r5 !== 0 && (sDeoxysStepCaps[r5 - 1] ?? 0) < r6) { MoveDeoxysObject(0, runtime); varSet(runtime, VAR_DEOXYS_INTERACTION_NUM, 0); runtime.specialResult = 0; } else if (r5 === 10) { flagSet(runtime, FLAG_SYS_DEOXYS_AWAKENED); runtime.specialResult = 2; op(runtime, 'ScriptContext_Enable'); } else { r5 += 1; MoveDeoxysObject(r5, runtime); varSet(runtime, VAR_DEOXYS_INTERACTION_NUM, r5); runtime.specialResult = 1; } destroyTask(runtime, taskId); }
export function MoveDeoxysObject(num: number, runtime = requireRuntime()): void { op(runtime, `LoadPalette:Deoxys:${num}`); op(runtime, num === 0 ? 'PlaySE:SE_M_CONFUSE_RAY' : 'PlaySE:SE_DEOXYS_MOVE'); createTask(runtime, 'Task_WaitDeoxysFieldEffect'); op(runtime, `FieldEffectStart:MOVE_DEOXYS_ROCK:${sDeoxysCoords[num]?.join(',')}`); }
export function Task_WaitDeoxysFieldEffect(taskId: number, runtime = requireRuntime()): void { if (!runtime.fieldEffectActive) { op(runtime, 'ScriptContext_Enable'); destroyTask(runtime, taskId); } }
export function IncrementBirthIslandRockStepCount(runtime = requireRuntime()): void { if (runtime.location.mapGroup === 7 && runtime.location.mapNum === 1) { const count = varGet(runtime, VAR_DEOXYS_INTERACTION_STEP_COUNTER) + 1; varSet(runtime, VAR_DEOXYS_INTERACTION_STEP_COUNTER, count > 99 ? 0 : count); } }
export function SetDeoxysTrianglePalette(runtime = requireRuntime()): void { op(runtime, `LoadPalette:Deoxys:${varGet(runtime, VAR_DEOXYS_INTERACTION_NUM)}`); }
export function IsBadEggInParty(runtime = requireRuntime()): boolean { return runtime.party.slice(0, partyCount(runtime)).some((p) => !!p.isBadEgg); }
export function IsPlayerNotInTrainerTowerLobby(runtime = requireRuntime()): boolean { return !(runtime.location.mapGroup === 3 && runtime.location.mapNum === 0); }
export function BrailleCursorToggle(runtime = requireRuntime()): void { if (!runtime.questLogPlayback) { const x = runtime.vars.gSpecialVar_0x8004 + 27; if (runtime.vars.gSpecialVar_0x8006 === 0) { runtime.brailleTextCursorSpriteID = x; op(runtime, `CreateTextCursorSprite:${x}:${runtime.vars.gSpecialVar_0x8005}`); } else op(runtime, `DestroyTextCursorSprite:${runtime.brailleTextCursorSpriteID}`); } }
export function PlayerPartyContainsSpeciesWithPlayerID(runtime = requireRuntime()): boolean { return runtime.party.slice(0, partyCount(runtime)).some((p) => p.species === runtime.vars.gSpecialVar_0x8004 && p.otId === playerTrainerId(runtime)); }
export function UpdateLoreleiDollCollection(runtime = requireRuntime()): void { const n = runtime.gameStats.GAME_STAT_ENTERED_HOF ?? 0; const flags = ['MEOWTH', 'CHANSEY', 'NIDORAN_F', 'JIGGLYPUFF', 'NIDORAN_M', 'FEAROW', 'PIDGEOT', 'LAPRAS']; for (let i = 0; i < flags.length; i += 1) if (n >= (i + 1) * 25) flagClear(runtime, `FLAG_HIDE_LORELEI_HOUSE_${flags[i]}_DOLL`); }
export function LoopWingFlapSound(runtime = requireRuntime()): void { createTask(runtime, 'Task_WingFlapSound'); op(runtime, 'PlaySE:SE_M_WING_ATTACK'); }
export function Task_WingFlapSound(taskId: number, runtime = requireRuntime()): void { const d = task(runtime, taskId).data; d[1] += 1; if (d[1] === runtime.vars.gSpecialVar_0x8005) { d[0] += 1; d[1] = 0; op(runtime, 'PlaySE:SE_M_WING_ATTACK'); } if (d[0] === runtime.vars.gSpecialVar_0x8004 - 1) destroyTask(runtime, taskId); }

export const fieldSpecialTaskHandlers = {
  Task_AnimatePcTurnOn,
  Task_ShakeScreen,
  Task_EndScreenShake,
  Task_ElevatorShake,
  Task_AnimateElevatorWindowView,
  Task_CreateScriptListMenu,
  Task_ListMenuHandleInput,
  Task_DestroyListMenu,
  Task_SuspendListMenu,
  Task_RedrawScrollArrowsAndWaitInput,
  Task_CreateMenuRemoveScrollIndicatorArrowPair,
  Task_ListMenuRemoveScrollIndicatorArrowPair,
  Task_RunPokemonLeagueLightingEffect,
  Task_CancelPokemonLeagueLightingEffect,
  Task_DoDeoxysTriangleInteraction,
  Task_WaitDeoxysFieldEffect,
  Task_WingFlapSound
};
