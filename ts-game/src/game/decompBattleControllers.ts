export const MAX_BATTLERS_COUNT = 4;
export const PARTY_SIZE = 6;
export const BATTLE_BUFFER_LINK_SIZE = 0x1000;
export const BUFFER_A = 0;
export const BUFFER_B = 1;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_IS_MASTER = 1 << 2;
export const BATTLE_TYPE_FIRST_BATTLE = 1 << 4;
export const BATTLE_TYPE_LINK_IN_BATTLE = 1 << 5;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_SAFARI = 1 << 7;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;

export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const PARTY_SUMM_SKIP_DRAW_DELAY = 1 << 7;

export const enum ControllerCmd {
  GETMONDATA,
  GETRAWMONDATA,
  SETMONDATA,
  SETRAWMONDATA,
  LOADMONSPRITE,
  SWITCHINANIM,
  RETURNMONTOBALL,
  DRAWTRAINERPIC,
  TRAINERSLIDE,
  TRAINERSLIDEBACK,
  FAINTANIMATION,
  PALETTEFADE,
  SUCCESSBALLTHROWANIM,
  BALLTHROWANIM,
  PAUSE,
  MOVEANIMATION,
  PRINTSTRING,
  PRINTSTRINGPLAYERONLY,
  CHOOSEACTION,
  UNKNOWNYESNOBOX,
  CHOOSEMOVE,
  OPENBAG,
  CHOOSEPOKEMON,
  CMD23,
  HEALTHBARUPDATE,
  EXPUPDATE,
  STATUSICONUPDATE,
  STATUSANIMATION,
  STATUSXOR,
  DATATRANSFER,
  DMA3TRANSFER,
  PLAYBGM,
  CMD32,
  TWORETURNVALUES,
  CHOSENMONRETURNVALUE,
  ONERETURNVALUE,
  ONERETURNVALUE_DUPLICATE,
  CLEARUNKVAR,
  SETUNKVAR,
  CLEARUNKFLAG,
  TOGGLEUNKFLAG,
  HITANIMATION,
  CANTSWITCH,
  PLAYSE,
  PLAYFANFARE,
  FAINTINGCRY,
  INTROSLIDE,
  INTROTRAINERBALLTHROW,
  DRAWPARTYSTATUSSUMMARY,
  HIDEPARTYSTATUSSUMMARY,
  ENDBOUNCE,
  SPRITEINVISIBILITY,
  BATTLEANIMATION,
  LINKSTANDBYMSG,
  RESETACTIONMOVESELECTION,
  ENDLINKBATTLE,
  TERMINATOR_NOP,
  CMDS_COUNT
}

export interface BattleControllerMon {
  hp: number;
  species: number;
  speciesOrEgg?: number;
  isEgg?: boolean;
  ability?: number;
}

export interface BattleControllerTask {
  func: string;
  data: number[];
}

export interface LinkPlayer {
  id: number;
  linkType?: number;
}

export interface BattleControllerRuntime {
  gBattleTypeFlags: number;
  gWirelessCommType: number;
  gReceivedRemoteLinkPlayers: number;
  gBattleMainFunc: string;
  gBattlerControllerFuncs: string[];
  gBattlerPositions: number[];
  gActionSelectionCursor: number[];
  gMoveSelectionCursor: number[];
  gBattleControllerExecFlags: number;
  gUnusedFirstBattleVar1: number;
  gUnusedFirstBattleVar2: number;
  gBattlersCount: number;
  gBattlerPartyIndexes: number[];
  gPlayerParty: BattleControllerMon[];
  gEnemyParty: BattleControllerMon[];
  gLinkPlayers: LinkPlayer[];
  multiplayerId: number;
  gBattlePartyCurrentOrder: number[];
  gBattleBufferA: number[][];
  gBattleBufferB: number[][];
  gActiveBattler: number;
  gBattlerAttacker: number;
  gBattlerTarget: number;
  gAbsentBattlerFlags: number;
  gEffectBattler: number;
  gLinkBattleSendBuffer: number[];
  gLinkBattleRecvBuffer: number[];
  gBlockRecvBuffer: number[][];
  blockReceivedStatus: number;
  linkPlayerCount: number;
  isLinkMaster: boolean;
  isLinkTaskFinished: boolean;
  tasks: BattleControllerTask[];
  sLinkSendTaskId: number;
  sLinkReceiveTaskId: number;
  sUnused: number;
  sBattleBuffersTransferData: number[];
  operations: string[];
  sentBlocks: { mask: number; offset: number; size: number; data: number[] }[];
  trace: string[];
  gMultiHitCounter: number;
  weatherHasEffect2: boolean;
  gBattleWeather: number;
  gBattleOutcome: number;
  gCurrentMove: number;
  gChosenMove: number;
  gLastUsedItem: number;
  gLastUsedAbility: number;
  gBattleScriptingBattler: number;
  scriptPartyIdx: number;
  hpScale: number;
  gPotentialItemEffectBattler: number;
  gBattleMoves: Record<number, { type: number }>;
  gBattleMons: { ability: number }[];
  gBattleTextBuff1: number[];
  gBattleTextBuff2: number[];
  gBattleTextBuff3: number[];
}

const bitTable = [1, 2, 4, 8, 16, 32, 64, 128] as const;
const u8 = (value: number): number => value & 0xff;
const u16lo = (value: number): number => value & 0xff;
const u16hi = (value: number): number => (value >> 8) & 0xff;
const u32bytes = (value: number): number[] => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
const blankParty = (): BattleControllerMon[] => Array.from({ length: PARTY_SIZE }, () => ({ hp: 0, species: SPECIES_NONE, speciesOrEgg: SPECIES_NONE, isEgg: false }));

export const createBattleControllersRuntime = (): BattleControllerRuntime => ({
  gBattleTypeFlags: BATTLE_TYPE_IS_MASTER,
  gWirelessCommType: 0,
  gReceivedRemoteLinkPlayers: 0,
  gBattleMainFunc: 'BeginBattleIntroDummy',
  gBattlerControllerFuncs: Array(MAX_BATTLERS_COUNT).fill('BattleControllerDummy'),
  gBattlerPositions: Array(MAX_BATTLERS_COUNT).fill(0xff),
  gActionSelectionCursor: Array(MAX_BATTLERS_COUNT).fill(0),
  gMoveSelectionCursor: Array(MAX_BATTLERS_COUNT).fill(0),
  gBattleControllerExecFlags: 0,
  gUnusedFirstBattleVar1: 0,
  gUnusedFirstBattleVar2: 0,
  gBattlersCount: 0,
  gBattlerPartyIndexes: Array(MAX_BATTLERS_COUNT).fill(0),
  gPlayerParty: blankParty(),
  gEnemyParty: blankParty(),
  gLinkPlayers: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
  multiplayerId: 0,
  gBattlePartyCurrentOrder: [0, 1, 2],
  gBattleBufferA: Array.from({ length: MAX_BATTLERS_COUNT }, () => Array(0x200).fill(0)),
  gBattleBufferB: Array.from({ length: MAX_BATTLERS_COUNT }, () => Array(0x200).fill(0)),
  gActiveBattler: 0,
  gBattlerAttacker: 0,
  gBattlerTarget: 0,
  gAbsentBattlerFlags: 0,
  gEffectBattler: 0,
  gLinkBattleSendBuffer: Array(BATTLE_BUFFER_LINK_SIZE).fill(0),
  gLinkBattleRecvBuffer: Array(BATTLE_BUFFER_LINK_SIZE).fill(0),
  gBlockRecvBuffer: Array.from({ length: MAX_BATTLERS_COUNT }, () => Array(0x100).fill(0)),
  blockReceivedStatus: 0,
  linkPlayerCount: 2,
  isLinkMaster: true,
  isLinkTaskFinished: true,
  tasks: [],
  sLinkSendTaskId: 0,
  sLinkReceiveTaskId: 0,
  sUnused: 0,
  sBattleBuffersTransferData: Array(0x100).fill(0),
  operations: [],
  sentBlocks: [],
  trace: [],
  gMultiHitCounter: 0,
  weatherHasEffect2: true,
  gBattleWeather: 0,
  gBattleOutcome: 0,
  gCurrentMove: 0,
  gChosenMove: 0,
  gLastUsedItem: 0,
  gLastUsedAbility: 0,
  gBattleScriptingBattler: 0,
  scriptPartyIdx: 0,
  hpScale: 0,
  gPotentialItemEffectBattler: 0,
  gBattleMoves: {},
  gBattleMons: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ ability: 0 })),
  gBattleTextBuff1: Array(16).fill(0),
  gBattleTextBuff2: Array(16).fill(0),
  gBattleTextBuff3: Array(16).fill(0)
});

const createTask = (runtime: BattleControllerRuntime, func: string): number => {
  runtime.tasks.push({ func, data: Array(16).fill(0) });
  return runtime.tasks.length - 1;
};

const getBattlerSide2 = (runtime: BattleControllerRuntime, battler: number): number => runtime.gBattlerPositions[battler] & 1;
const monSpeciesOrEgg = (mon: BattleControllerMon): number => mon.speciesOrEgg ?? mon.species;
const monUsableSpecies = (mon: BattleControllerMon, useSpeciesTypo: boolean): number => useSpeciesTypo ? mon.species : monSpeciesOrEgg(mon);
const isUsableMon = (mon: BattleControllerMon, useSpeciesTypo = false): boolean =>
  mon.hp !== 0 && monUsableSpecies(mon, useSpeciesTypo) !== SPECIES_NONE && monSpeciesOrEgg(mon) !== SPECIES_EGG && !mon.isEgg;

export const handleLinkBattleSetup = (runtime: BattleControllerRuntime): void => {
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    if (runtime.gWirelessCommType) runtime.operations.push('SetWirelessCommType1');
    if (!runtime.gReceivedRemoteLinkPlayers) runtime.operations.push('OpenLink');
    createTask(runtime, 'Task_WaitForLinkPlayerConnection');
    createTasksForSendRecvLinkBuffers(runtime);
  }
};

export const setUpBattleVars = (runtime: BattleControllerRuntime): void => {
  runtime.gBattleMainFunc = 'BeginBattleIntroDummy';
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    runtime.gBattlerControllerFuncs[i] = 'BattleControllerDummy';
    runtime.gBattlerPositions[i] = 0xff;
    runtime.gActionSelectionCursor[i] = 0;
    runtime.gMoveSelectionCursor[i] = 0;
  }
  handleLinkBattleSetup(runtime);
  runtime.gBattleControllerExecFlags = 0;
  runtime.operations.push('ClearBattleAnimationVars', 'ClearBattleMonForms', 'BattleAI_HandleItemUseBeforeAISetup');
  runtime.gUnusedFirstBattleVar1 = 0;
  runtime.gUnusedFirstBattleVar2 = 0;
};

export const initBattleControllers = (runtime: BattleControllerRuntime): void => {
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) initLinkBtlControllers(runtime);
  else initSinglePlayerBtlControllers(runtime);
  setBattlePartyIds(runtime);
  if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    for (let i = 0; i < runtime.gBattlersCount; i++) bufferBattlePartyCurrentOrderBySide(runtime, i, 0);
  }
};

export const initSinglePlayerBtlControllers = (runtime: BattleControllerRuntime): void => {
  runtime.gBattleMainFunc = 'BeginBattleIntro';
  if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
    if (runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE) {
      runtime.gBattlerControllerFuncs[0] = 'SetControllerToPokedude';
      runtime.gBattlerControllerFuncs[1] = 'SetControllerToPokedude';
    } else {
      runtime.gBattlerControllerFuncs[0] = runtime.gBattleTypeFlags & BATTLE_TYPE_SAFARI
        ? 'SetControllerToSafari'
        : runtime.gBattleTypeFlags & (BATTLE_TYPE_OLD_MAN_TUTORIAL | BATTLE_TYPE_FIRST_BATTLE)
          ? 'SetControllerToOakOrOldMan'
          : 'SetControllerToPlayer';
      runtime.gBattlerControllerFuncs[1] = 'SetControllerToOpponent';
    }
    runtime.gBattlerPositions[0] = B_POSITION_PLAYER_LEFT;
    runtime.gBattlerPositions[1] = B_POSITION_OPPONENT_LEFT;
    runtime.gBattlersCount = 2;
  } else {
    const player = runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE ? 'SetControllerToPokedude' : 'SetControllerToPlayer';
    const opponent = runtime.gBattleTypeFlags & BATTLE_TYPE_POKEDUDE ? 'SetControllerToPokedude' : 'SetControllerToOpponent';
    runtime.gBattlerControllerFuncs.splice(0, 4, player, opponent, player, opponent);
    runtime.gBattlerPositions.splice(0, 4, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT);
    runtime.gBattlersCount = MAX_BATTLERS_COUNT;
  }
};

export const initLinkBtlControllers = (runtime: BattleControllerRuntime): void => {
  if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
    if (runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER) {
      runtime.gBattleMainFunc = 'BeginBattleIntro';
      runtime.gBattlerControllerFuncs[0] = 'SetControllerToPlayer';
      runtime.gBattlerPositions[0] = B_POSITION_PLAYER_LEFT;
      runtime.gBattlerControllerFuncs[1] = 'SetControllerToLinkOpponent';
      runtime.gBattlerPositions[1] = B_POSITION_OPPONENT_LEFT;
    } else {
      runtime.gBattlerControllerFuncs[1] = 'SetControllerToPlayer';
      runtime.gBattlerPositions[1] = B_POSITION_PLAYER_LEFT;
      runtime.gBattlerControllerFuncs[0] = 'SetControllerToLinkOpponent';
      runtime.gBattlerPositions[0] = B_POSITION_OPPONENT_LEFT;
    }
    runtime.gBattlersCount = 2;
  } else if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    if (runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER) {
      runtime.gBattleMainFunc = 'BeginBattleIntro';
      runtime.gBattlerControllerFuncs.splice(0, 4, 'SetControllerToPlayer', 'SetControllerToLinkOpponent', 'SetControllerToPlayer', 'SetControllerToLinkOpponent');
      runtime.gBattlerPositions.splice(0, 4, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT);
    } else {
      runtime.gBattlerControllerFuncs.splice(0, 4, 'SetControllerToLinkOpponent', 'SetControllerToPlayer', 'SetControllerToLinkOpponent', 'SetControllerToPlayer');
      runtime.gBattlerPositions.splice(0, 4, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT, B_POSITION_PLAYER_RIGHT);
    }
    runtime.gBattlersCount = MAX_BATTLERS_COUNT;
  } else {
    const multiplayerId = runtime.multiplayerId;
    if (runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER) runtime.gBattleMainFunc = 'BeginBattleIntro';
    for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
      const id = runtime.gLinkPlayers[i].id;
      if (id === 0 || id === 3) bufferBattlePartyCurrentOrderBySide(runtime, id, 0);
      else if (id === 1 || id === 2) bufferBattlePartyCurrentOrderBySide(runtime, id, 1);
      if (i === multiplayerId) {
        runtime.gBattlerControllerFuncs[id] = 'SetControllerToPlayer';
        setMultiPosition(runtime, id, true, true);
      } else if ((!(id & 1) && !(runtime.gLinkPlayers[multiplayerId].id & 1)) || ((id & 1) && (runtime.gLinkPlayers[multiplayerId].id & 1))) {
        runtime.gBattlerControllerFuncs[id] = 'SetControllerToLinkPartner';
        setMultiPosition(runtime, id, true, false);
      } else {
        runtime.gBattlerControllerFuncs[id] = 'SetControllerToLinkOpponent';
        setMultiPosition(runtime, id, false, false);
      }
    }
    runtime.gBattlersCount = MAX_BATTLERS_COUNT;
  }
};

const setMultiPosition = (runtime: BattleControllerRuntime, id: number, playerSide: boolean, own: boolean): void => {
  if (id === 0 || id === 3) {
    runtime.gBattlerPositions[id] = playerSide ? B_POSITION_PLAYER_LEFT : B_POSITION_OPPONENT_LEFT;
    runtime.gBattlerPartyIndexes[id] = B_POSITION_PLAYER_LEFT;
  } else if (id === 1 || id === 2) {
    runtime.gBattlerPositions[id] = playerSide ? B_POSITION_PLAYER_RIGHT : B_POSITION_OPPONENT_RIGHT;
    runtime.gBattlerPartyIndexes[id] = own ? 3 : B_POSITION_OPPONENT_RIGHT;
  }
};

export const setBattlePartyIds = (runtime: BattleControllerRuntime): void => {
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) return;
  for (let i = 0; i < runtime.gBattlersCount; i++) {
    const party = getBattlerSide2(runtime, i) === B_SIDE_PLAYER ? runtime.gPlayerParty : runtime.gEnemyParty;
    for (let j = 0; j < PARTY_SIZE; j++) {
      if (i < 2) {
        if (isUsableMon(party[j])) {
          runtime.gBattlerPartyIndexes[i] = j;
          break;
        }
      } else if (isUsableMon(party[j], getBattlerSide2(runtime, i) === B_SIDE_PLAYER) && runtime.gBattlerPartyIndexes[i - 2] !== j) {
        runtime.gBattlerPartyIndexes[i] = j;
        break;
      }
    }
  }
};

const bufferBattlePartyCurrentOrderBySide = (runtime: BattleControllerRuntime, battler: number, side: number): void => {
  runtime.operations.push(`BufferBattlePartyCurrentOrderBySide(${battler}, ${side})`);
};

export const prepareBufferDataTransfer = (runtime: BattleControllerRuntime, bufferId: number, data: ArrayLike<number>, size: number): void => {
  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    prepareBufferDataTransferLink(runtime, bufferId, size, data);
  } else if (bufferId === BUFFER_A) {
    for (let i = 0; i < size; i++) runtime.gBattleBufferA[runtime.gActiveBattler][i] = u8(data[i] ?? 0);
  } else if (bufferId === BUFFER_B) {
    for (let i = 0; i < size; i++) runtime.gBattleBufferB[runtime.gActiveBattler][i] = u8(data[i] ?? 0);
  }
};

export const createTasksForSendRecvLinkBuffers = (runtime: BattleControllerRuntime): void => {
  runtime.sLinkSendTaskId = createTask(runtime, 'Task_HandleSendLinkBuffersData');
  [11, 12, 13, 14, 15].forEach((i) => { runtime.tasks[runtime.sLinkSendTaskId].data[i] = 0; });
  runtime.sLinkReceiveTaskId = createTask(runtime, 'Task_HandleCopyReceivedLinkBuffersData');
  [12, 13, 14, 15].forEach((i) => { runtime.tasks[runtime.sLinkReceiveTaskId].data[i] = 0; });
  runtime.sUnused = 0;
};

export const LINK_BUFF_BUFFER_ID = 0;
export const LINK_BUFF_ACTIVE_BATTLER = 1;
export const LINK_BUFF_ATTACKER = 2;
export const LINK_BUFF_TARGET = 3;
export const LINK_BUFF_SIZE_LO = 4;
export const LINK_BUFF_SIZE_HI = 5;
export const LINK_BUFF_ABSENT_BATTLER_FLAGS = 6;
export const LINK_BUFF_EFFECT_BATTLER = 7;
export const LINK_BUFF_DATA = 8;

export const prepareBufferDataTransferLink = (runtime: BattleControllerRuntime, bufferId: number, size: number, data: ArrayLike<number>): void => {
  const task = runtime.tasks[runtime.sLinkSendTaskId];
  const alignedSize = size - (size % 4) + 4;
  if (task.data[14] + alignedSize + LINK_BUFF_DATA + 1 > BATTLE_BUFFER_LINK_SIZE) {
    task.data[12] = task.data[14];
    task.data[14] = 0;
  }
  const base = task.data[14];
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_BUFFER_ID] = bufferId;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_ACTIVE_BATTLER] = runtime.gActiveBattler;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_ATTACKER] = runtime.gBattlerAttacker;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_TARGET] = runtime.gBattlerTarget;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_SIZE_LO] = alignedSize & 0xff;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_SIZE_HI] = (alignedSize & 0xff00) >> 8;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_ABSENT_BATTLER_FLAGS] = runtime.gAbsentBattlerFlags;
  runtime.gLinkBattleSendBuffer[base + LINK_BUFF_EFFECT_BATTLER] = runtime.gEffectBattler;
  for (let i = 0; i < size; i++) runtime.gLinkBattleSendBuffer[base + LINK_BUFF_DATA + i] = u8(data[i] ?? 0);
  task.data[14] += alignedSize + LINK_BUFF_DATA;
};

export const taskHandleSendLinkBuffersData = (runtime: BattleControllerRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  switch (data[11]) {
    case 0:
      data[10] = 100;
      data[11]++;
      break;
    case 1:
      data[10]--;
      if (data[10] === 0) {
        data[11]++;
        if (runtime.gReceivedRemoteLinkPlayers) data[11] = 3;
      }
      break;
    case 2:
      if (((runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) && runtime.linkPlayerCount > 3) || (!(runtime.gBattleTypeFlags & BATTLE_TYPE_MULTI) && runtime.linkPlayerCount > 1)) {
        if (runtime.isLinkMaster) runtime.operations.push('CheckShouldAdvanceLinkState');
        data[11]++;
      }
      break;
    case 3:
      if (data[15] !== data[14]) {
        if (data[13] === 0) {
          if (data[15] > data[14] && data[15] === data[12]) {
            data[12] = 0;
            data[15] = 0;
          }
          const blockSize = (runtime.gLinkBattleSendBuffer[data[15] + LINK_BUFF_SIZE_LO] | (runtime.gLinkBattleSendBuffer[data[15] + LINK_BUFF_SIZE_HI] << 8)) + LINK_BUFF_DATA;
          runtime.sentBlocks.push({ mask: bitmaskAllOtherLinkPlayers(), offset: data[15], size: blockSize, data: runtime.gLinkBattleSendBuffer.slice(data[15], data[15] + blockSize) });
          data[11]++;
        } else {
          data[13]--;
        }
      }
      break;
    case 4:
      if (runtime.isLinkTaskFinished) {
        const blockSize = runtime.gLinkBattleSendBuffer[data[15] + LINK_BUFF_SIZE_LO] | (runtime.gLinkBattleSendBuffer[data[15] + LINK_BUFF_SIZE_HI] << 8);
        data[13] = 5;
        data[15] += blockSize + LINK_BUFF_DATA;
        data[11] = 3;
      }
      break;
    case 5:
      if (--data[13] === 0) {
        data[13] = 5;
        data[11] = 3;
      }
      break;
  }
};

const bitmaskAllOtherLinkPlayers = (): number => 0xe;

export const tryReceiveLinkBattleData = (runtime: BattleControllerRuntime): void => {
  if (runtime.gReceivedRemoteLinkPlayers !== 0 && (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK_IN_BATTLE) && runtime.gLinkPlayers[0].linkType === 0x2211) {
    runtime.operations.push('DestroyTask_RfuIdle');
    for (let i = 0; i < runtime.linkPlayerCount; i++) {
      if (runtime.blockReceivedStatus & bitTable[i]) {
        runtime.blockReceivedStatus &= ~bitTable[i];
        const recvBuffer = runtime.gBlockRecvBuffer[i];
        const dataSize = recvBuffer[2];
        const task = runtime.tasks[runtime.sLinkReceiveTaskId];
        if (task.data[14] + 9 + dataSize > 0x1000) {
          task.data[12] = task.data[14];
          task.data[14] = 0;
        }
        for (let j = 0; j < dataSize + 8; j++) runtime.gLinkBattleRecvBuffer[task.data[14] + j] = recvBuffer[j];
        task.data[14] += dataSize + 8;
      }
    }
  }
};

export const taskHandleCopyReceivedLinkBuffersData = (runtime: BattleControllerRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  if (data[15] === data[14]) return;
  if (data[15] > data[14] && data[15] === data[12]) {
    data[12] = 0;
    data[15] = 0;
  }
  const battlerId = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_ACTIVE_BATTLER];
  const blockSize = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_SIZE_LO] | (runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_SIZE_HI] << 8);
  switch (runtime.gLinkBattleRecvBuffer[data[15]]) {
    case BUFFER_A:
      if (runtime.gBattleControllerExecFlags & bitTable[battlerId]) return;
      runtime.gBattleBufferA[battlerId].splice(0, blockSize, ...runtime.gLinkBattleRecvBuffer.slice(data[15] + LINK_BUFF_DATA, data[15] + LINK_BUFF_DATA + blockSize));
      markBattlerReceivedLinkData(runtime, battlerId);
      if (!(runtime.gBattleTypeFlags & BATTLE_TYPE_IS_MASTER)) {
        runtime.gBattlerAttacker = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_ATTACKER];
        runtime.gBattlerTarget = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_TARGET];
        runtime.gAbsentBattlerFlags = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_ABSENT_BATTLER_FLAGS];
        runtime.gEffectBattler = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_EFFECT_BATTLER];
      }
      break;
    case BUFFER_B:
      runtime.gBattleBufferB[battlerId].splice(0, blockSize, ...runtime.gLinkBattleRecvBuffer.slice(data[15] + LINK_BUFF_DATA, data[15] + LINK_BUFF_DATA + blockSize));
      break;
    case 2: {
      const v = runtime.gLinkBattleRecvBuffer[data[15] + LINK_BUFF_DATA];
      runtime.gBattleControllerExecFlags &= ~(bitTable[battlerId] << (v * 4));
      break;
    }
  }
  data[15] += blockSize + LINK_BUFF_DATA;
};

const markBattlerReceivedLinkData = (runtime: BattleControllerRuntime, battlerId: number): void => {
  runtime.gBattleControllerExecFlags |= bitTable[battlerId];
};

const emit = (runtime: BattleControllerRuntime, bufferId: number, bytes: number[], size = bytes.length): void => {
  runtime.sBattleBuffersTransferData.fill(0);
  for (let i = 0; i < bytes.length; i++) runtime.sBattleBuffersTransferData[i] = u8(bytes[i]);
  prepareBufferDataTransfer(runtime, bufferId, runtime.sBattleBuffersTransferData, size);
};

const repeated = (cmd: number): number[] => [cmd, cmd, cmd, cmd];

export const BtlController_EmitGetMonData = (r: BattleControllerRuntime, b: number, requestId: number, monToCheck: number): void => emit(r, b, [ControllerCmd.GETMONDATA, requestId, monToCheck, 0], 4);
export const BtlController_EmitGetRawMonData = (r: BattleControllerRuntime, b: number, monId: number, bytes: number): void => emit(r, b, [ControllerCmd.GETRAWMONDATA, monId, bytes, 0], 4);
export const BtlController_EmitSetMonData = (r: BattleControllerRuntime, b: number, requestId: number, monToCheck: number, bytes: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.SETMONDATA, requestId, monToCheck, ...Array.from({ length: bytes }, (_, i) => data[i] ?? 0)], 3 + bytes);
export const BtlController_EmitSetRawMonData = (r: BattleControllerRuntime, b: number, monId: number, bytes: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.SETRAWMONDATA, monId, bytes, ...Array.from({ length: bytes }, (_, i) => data[i] ?? 0)], bytes + 3);
export const BtlController_EmitLoadMonSprite = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.LOADMONSPRITE), 4);
export const BtlController_EmitSwitchInAnim = (r: BattleControllerRuntime, b: number, partyId: number, dontClearSubstituteBit: number): void => emit(r, b, [ControllerCmd.SWITCHINANIM, partyId, dontClearSubstituteBit, 5], 4);
export const BtlController_EmitReturnMonToBall = (r: BattleControllerRuntime, b: number, skipAnim: number): void => emit(r, b, [ControllerCmd.RETURNMONTOBALL, skipAnim], 2);
export const BtlController_EmitDrawTrainerPic = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.DRAWTRAINERPIC), 4);
export const BtlController_EmitTrainerSlide = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.TRAINERSLIDE), 4);
export const BtlController_EmitTrainerSlideBack = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.TRAINERSLIDEBACK), 4);
export const BtlController_EmitFaintAnimation = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.FAINTANIMATION), 4);
export const BtlController_EmitPaletteFade = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.PALETTEFADE), 4);
export const BtlController_EmitSuccessBallThrowAnim = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.SUCCESSBALLTHROWANIM), 4);
export const BtlController_EmitBallThrowAnim = (r: BattleControllerRuntime, b: number, caseId: number): void => emit(r, b, [ControllerCmd.BALLTHROWANIM, caseId], 2);
export const BtlController_EmitPause = (r: BattleControllerRuntime, b: number, toWait: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.PAUSE, toWait, ...Array.from({ length: toWait * 3 }, (_, i) => data[i] ?? 0)], toWait * 3 + 2);
export const BtlController_EmitMoveAnimation = (r: BattleControllerRuntime, b: number, move: number, turnOfMove: number, movePower: number, dmg: number, friendship: number, disableStruct: ArrayLike<number>): void => emit(r, b, [ControllerCmd.MOVEANIMATION, u16lo(move), u16hi(move), turnOfMove, u16lo(movePower), u16hi(movePower), ...u32bytes(dmg), friendship, r.gMultiHitCounter, ...(r.weatherHasEffect2 ? [u16lo(r.gBattleWeather), u16hi(r.gBattleWeather)] : [0, 0]), 0, 0, ...Array.from(disableStruct)], 16 + disableStruct.length);

const battleMsgData = (r: BattleControllerRuntime, includeMore: boolean): number[] => {
  const bytes = [
    u16lo(r.gCurrentMove), u16hi(r.gCurrentMove), u16lo(r.gChosenMove), u16hi(r.gChosenMove),
    u16lo(r.gLastUsedItem), u16hi(r.gLastUsedItem), r.gLastUsedAbility, r.gBattleScriptingBattler,
    r.scriptPartyIdx
  ];
  if (includeMore) bytes.push(r.hpScale, r.gPotentialItemEffectBattler, r.gBattleMoves[r.gCurrentMove]?.type ?? 0);
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) bytes.push(r.gBattleMons[i].ability);
  bytes.push(...r.gBattleTextBuff1, ...r.gBattleTextBuff2, ...r.gBattleTextBuff3);
  return bytes;
};

export const BtlController_EmitPrintString = (r: BattleControllerRuntime, b: number, stringID: number): void => { r.trace.push(`PrintString:${r.gActiveBattler}:${stringID}`); emit(r, b, [ControllerCmd.PRINTSTRING, r.gBattleOutcome, u16lo(stringID), u16hi(stringID), ...battleMsgData(r, true)], 4 + battleMsgData(r, true).length); };
export const BtlController_EmitPrintSelectionString = (r: BattleControllerRuntime, b: number, stringID: number): void => emit(r, b, [ControllerCmd.PRINTSTRINGPLAYERONLY, ControllerCmd.PRINTSTRINGPLAYERONLY, u16lo(stringID), u16hi(stringID), ...battleMsgData(r, false)], 4 + battleMsgData(r, false).length);
export const BtlController_EmitChooseAction = (r: BattleControllerRuntime, b: number, action: number, itemId: number): void => { r.trace.push(`ChooseAction:${r.gActiveBattler}:${action}:${itemId}`); emit(r, b, [ControllerCmd.CHOOSEACTION, action, u16lo(itemId), u16hi(itemId)], 4); };
export const BtlController_EmitUnknownYesNoBox = (r: BattleControllerRuntime, b: number, arg1: number): void => { r.trace.push(`UnknownYesNoBox:${r.gActiveBattler}:${arg1}`); emit(r, b, [ControllerCmd.UNKNOWNYESNOBOX, arg1], 2); };
export const BtlController_EmitChooseMove = (r: BattleControllerRuntime, b: number, isDoubleBattle: number, noPpNumber: number, movePpData: ArrayLike<number>): void => { r.trace.push(`ChooseMove:${r.gActiveBattler}:${isDoubleBattle}`); emit(r, b, [ControllerCmd.CHOOSEMOVE, isDoubleBattle, noPpNumber, 0, ...Array.from(movePpData)], 4 + movePpData.length); };
export const BtlController_EmitChooseItem = (r: BattleControllerRuntime, b: number, order: ArrayLike<number>): void => { r.trace.push(`ChooseItem:${r.gActiveBattler}`); emit(r, b, [ControllerCmd.OPENBAG, order[0] ?? 0, order[1] ?? 0, order[2] ?? 0], 4); };
export const BtlController_EmitChoosePokemon = (r: BattleControllerRuntime, b: number, caseId: number, slotId: number, abilityId: number, data: ArrayLike<number>): void => { r.trace.push(`ChoosePokemon:${r.gActiveBattler}:${caseId}:${slotId}`); emit(r, b, [ControllerCmd.CHOOSEPOKEMON, caseId, slotId, abilityId, data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, 0], 8); };
export const BtlController_EmitCmd23 = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.CMD23), 4);
export const BtlController_EmitHealthBarUpdate = (r: BattleControllerRuntime, b: number, hpValue: number): void => emit(r, b, [ControllerCmd.HEALTHBARUPDATE, 0, u16lo(hpValue), u16hi(hpValue)], 4);
export const BtlController_EmitExpUpdate = (r: BattleControllerRuntime, b: number, partyId: number, expPoints: number): void => emit(r, b, [ControllerCmd.EXPUPDATE, partyId, u16lo(expPoints), u16hi(expPoints)], 4);
export const BtlController_EmitStatusIconUpdate = (r: BattleControllerRuntime, b: number, status1: number, status2: number): void => emit(r, b, [ControllerCmd.STATUSICONUPDATE, ...u32bytes(status1), ...u32bytes(status2)], 9);
export const BtlController_EmitStatusAnimation = (r: BattleControllerRuntime, b: number, status2: number, status: number): void => emit(r, b, [ControllerCmd.STATUSANIMATION, status2, ...u32bytes(status)], 6);
export const BtlController_EmitStatusXor = (r: BattleControllerRuntime, b: number, v: number): void => emit(r, b, [ControllerCmd.STATUSXOR, v], 2);
export const BtlController_EmitDataTransfer = (r: BattleControllerRuntime, b: number, size: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.DATATRANSFER, ControllerCmd.DATATRANSFER, u16lo(size), u16hi(size), ...Array.from({ length: size }, (_, i) => data[i] ?? 0)], size + 4);
export const BtlController_EmitDMA3Transfer = (r: BattleControllerRuntime, b: number, dst: number, size: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.DMA3TRANSFER, ...u32bytes(dst), u16lo(size), u16hi(size), ...Array.from({ length: size }, (_, i) => data[i] ?? 0)], size + 7);
export const BtlController_EmitPlayBGM = (r: BattleControllerRuntime, b: number, songId: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.PLAYBGM, u16lo(songId), u16hi(songId), ...Array.from({ length: songId }, (_, i) => data[i] ?? 0)], songId + 3);
export const BtlController_EmitCmd32 = (r: BattleControllerRuntime, b: number, size: number, data: ArrayLike<number>): void => emit(r, b, [ControllerCmd.CMD32, u16lo(size), u16hi(size), ...Array.from({ length: size }, (_, i) => data[i] ?? 0)], size + 3);
export const BtlController_EmitTwoReturnValues = (r: BattleControllerRuntime, b: number, ret8: number, ret16: number): void => emit(r, b, [ControllerCmd.TWORETURNVALUES, ret8, u16lo(ret16), u16hi(ret16)], 4);
export const BtlController_EmitChosenMonReturnValue = (r: BattleControllerRuntime, b: number, partyId: number, order: ArrayLike<number>): void => emit(r, b, [ControllerCmd.CHOSENMONRETURNVALUE, partyId, order[0] ?? 0, order[1] ?? 0, order[2] ?? 0], 5);
export const BtlController_EmitOneReturnValue = (r: BattleControllerRuntime, b: number, ret: number): void => emit(r, b, [ControllerCmd.ONERETURNVALUE, u16lo(ret), u16hi(ret), 0], 4);
export const BtlController_EmitOneReturnValue_Duplicate = (r: BattleControllerRuntime, b: number, ret: number): void => emit(r, b, [ControllerCmd.ONERETURNVALUE_DUPLICATE, u16lo(ret), u16hi(ret), 0], 4);
export const BtlController_EmitClearUnkVar = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.CLEARUNKVAR), 4);
export const BtlController_EmitSetUnkVar = (r: BattleControllerRuntime, b: number, v: number): void => emit(r, b, [ControllerCmd.SETUNKVAR, v], 2);
export const BtlController_EmitClearUnkFlag = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.CLEARUNKFLAG), 4);
export const BtlController_EmitToggleUnkFlag = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.TOGGLEUNKFLAG), 4);
export const BtlController_EmitHitAnimation = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.HITANIMATION), 4);
export const BtlController_EmitCantSwitch = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.CANTSWITCH), 4);
export const BtlController_EmitPlaySE = (r: BattleControllerRuntime, b: number, songId: number): void => emit(r, b, [ControllerCmd.PLAYSE, u16lo(songId), u16hi(songId), 0], 4);
export const BtlController_EmitPlayFanfare = (r: BattleControllerRuntime, b: number, songId: number): void => emit(r, b, [ControllerCmd.PLAYFANFARE, u16lo(songId), u16hi(songId), 0], 4);
export const BtlController_EmitFaintingCry = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.FAINTINGCRY), 4);
export const BtlController_EmitIntroSlide = (r: BattleControllerRuntime, b: number, terrainId: number): void => emit(r, b, [ControllerCmd.INTROSLIDE, terrainId], 2);
export const BtlController_EmitIntroTrainerBallThrow = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.INTROTRAINERBALLTHROW), 4);
export const BtlController_EmitDrawPartyStatusSummary = (r: BattleControllerRuntime, b: number, hpAndStatus: ArrayLike<number>, flags: number): void => emit(r, b, [ControllerCmd.DRAWPARTYSTATUSSUMMARY, flags & ~PARTY_SUMM_SKIP_DRAW_DELAY, (flags & PARTY_SUMM_SKIP_DRAW_DELAY) >> 7, ControllerCmd.DRAWPARTYSTATUSSUMMARY, ...Array.from(hpAndStatus)], 4 + hpAndStatus.length);
export const BtlController_EmitHidePartyStatusSummary = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.HIDEPARTYSTATUSSUMMARY), 4);
export const BtlController_EmitEndBounceEffect = (r: BattleControllerRuntime, b: number): void => emit(r, b, repeated(ControllerCmd.ENDBOUNCE), 4);
export const BtlController_EmitSpriteInvisibility = (r: BattleControllerRuntime, b: number, invisible: number): void => emit(r, b, [ControllerCmd.SPRITEINVISIBILITY, invisible, ControllerCmd.SPRITEINVISIBILITY, ControllerCmd.SPRITEINVISIBILITY], 4);
export const BtlController_EmitBattleAnimation = (r: BattleControllerRuntime, b: number, animationId: number, argument: number): void => emit(r, b, [ControllerCmd.BATTLEANIMATION, animationId, u16lo(argument), u16hi(argument)], 4);
export const BtlController_EmitLinkStandbyMsg = (r: BattleControllerRuntime, b: number, mode: number): void => emit(r, b, [ControllerCmd.LINKSTANDBYMSG, mode], 2);
export const BtlController_EmitResetActionMoveSelection = (r: BattleControllerRuntime, b: number, caseId: number): void => emit(r, b, [ControllerCmd.RESETACTIONMOVESELECTION, caseId], 2);
export const BtlController_EmitEndLinkBattle = (r: BattleControllerRuntime, b: number, battleOutcome: number): void => emit(r, b, [ControllerCmd.ENDLINKBATTLE, battleOutcome], 2);

export const HandleLinkBattleSetup = handleLinkBattleSetup;
export const SetUpBattleVars = setUpBattleVars;
export const InitBattleControllers = initBattleControllers;
export const InitSinglePlayerBtlControllers = initSinglePlayerBtlControllers;
export const InitLinkBtlControllers = initLinkBtlControllers;
export const SetBattlePartyIds = setBattlePartyIds;
export const PrepareBufferDataTransfer = prepareBufferDataTransfer;
export const CreateTasksForSendRecvLinkBuffers = createTasksForSendRecvLinkBuffers;
export const PrepareBufferDataTransferLink = prepareBufferDataTransferLink;
export const Task_HandleSendLinkBuffersData = taskHandleSendLinkBuffersData;
export const TryReceiveLinkBattleData = tryReceiveLinkBattleData;
export const Task_HandleCopyReceivedLinkBuffersData =
  taskHandleCopyReceivedLinkBuffersData;
