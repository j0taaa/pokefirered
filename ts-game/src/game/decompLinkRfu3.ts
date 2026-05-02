import linkRfu3SourceRaw from '../../../src/link_rfu_3.c?raw';
import charactersSource from '../../../include/characters.h?raw';

export const WIRELESS_STATUS_ANIM_3_BARS = 0;
export const WIRELESS_STATUS_ANIM_2_BARS = 1;
export const WIRELESS_STATUS_ANIM_1_BAR = 2;
export const WIRELESS_STATUS_ANIM_SEARCHING = 3;
export const WIRELESS_STATUS_ANIM_ERROR = 4;
export const TAG_GFX_STATUS_INDICATOR = 0xd431;
export const TAG_PAL_STATUS_INDICATOR = 0xd432;
export const UNUSED_QUEUE_NUM_SLOTS = 2;
export const UNUSED_QUEUE_SLOT_LENGTH = 256;
export const COMM_SLOT_LENGTH = 14;
export const RECV_QUEUE_NUM_SLOTS = 20;
export const SEND_QUEUE_NUM_SLOTS = 40;
export const BACKUP_QUEUE_NUM_SLOTS = 2;
export const MAX_RFU_PLAYERS = 5;
export const RFU_CHILD_MAX = 4;
export const RFU_GAME_NAME_LENGTH = 13;
export const RFU_USER_NAME_LENGTH = 8;
export const PLAYER_NAME_LENGTH = 7;
export const RFU_SERIAL_WONDER_DISTRIBUTOR = 0x7f7d;
export const RFU_STATUS_FATAL_ERROR = 1;
export const MODE_CHILD = 0;
export const MODE_PARENT = 1;
export const SPRITE_NONE = 0xff;
export const STATUS_INDICATOR_ACTIVE = 0x1234;
export const RFU_LINK_ICON_LEVEL1_MAX = 24;
export const RFU_LINK_ICON_LEVEL2_MIN = 25;
export const RFU_LINK_ICON_LEVEL2_MAX = 126;
export const RFU_LINK_ICON_LEVEL3_MIN = 127;
export const RFU_LINK_ICON_LEVEL3_MAX = 228;
export const RFU_LINK_ICON_LEVEL4_MIN = 229;
export const RFU_LINK_ICON_LEVEL4_MAX = 255;
export const LANGUAGE_JAPANESE = 1;
export const GAME_LANGUAGE = 2;
export const GAME_VERSION = 1;
export const EOS = defineNumber(charactersSource, 'EOS');

const linkRfu3Source = keepRevision0Branch(linkRfu3SourceRaw);
const charDefines = parseCharDefines(charactersSource);

export interface ByteQueue {
  slots: number[][];
  recvSlot: number;
  sendSlot: number;
  count: number;
  full: boolean;
}

export interface RfuGameData {
  compatibility: {
    playerTrainerId: number[];
    language: number;
    version: number;
    hasNews: boolean;
    hasCard: boolean;
    unknown: boolean;
    canLinkNationally: boolean;
    hasNationalDex: boolean;
    gameClear: boolean;
  };
  partnerInfo: number[];
  playerGender: number;
  activity: number;
  startedActivity: boolean;
  raw?: number[];
}

export interface RfuPartner {
  serialNo: number;
  gname: number[];
  uname: number[];
}

export interface LinkPlayer {
  trainerId: number;
  name: number[];
  language: number;
}

export interface TrainerNameRecord {
  trainerId: number;
  trainerName: number[];
}

export interface WirelessSprite {
  x: number;
  y: number;
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  oam: { paletteNum: number };
  invisible: boolean;
  destroyed: boolean;
  data: number[];
}

export interface LinkRfu3Runtime {
  sWirelessStatusIndicatorSpriteId: number;
  sprites: WirelessSprite[];
  loadedSpriteSheets: Set<number>;
  loadedSpritePalettes: Set<number>;
  rfuLinkStatus: {
    parentChild: number;
    connSlotFlag: number;
    strength: number[];
    partner: RfuPartner[];
    getNameFlag: number;
  };
  lman: { parent_child: number };
  gHostRfuGameData: RfuGameData;
  gHostRfuUsername: number[];
  saveBlock2: { playerTrainerId: number[]; playerGender: number };
  saveBlock1: { trainerNameRecords: TrainerNameRecord[] };
  flags: Set<string>;
  nationalPokedexEnabled: boolean;
  wirelessCommType: number;
  linkPlayers: LinkPlayer[];
  multiplayerId: number;
  linkPlayerCount: number;
  rfuRecoveringFromLinkLoss: boolean;
  rfuStatus: number;
  oamBuffer: Array<Record<string, number>>;
  randomValues: number[];
  rngSeed: number;
  sequenceCounter: number;
  operations: string[];
}

export const sWireless_ASCIItoRSETable = parseByteTable(linkRfu3Source, 'sWireless_ASCIItoRSETable');
export const sWireless_RSEtoASCIITable = parseByteTable(linkRfu3Source, 'sWireless_RSEtoASCIITable');
export const sWirelessStatusIndicatorAnims = parseWirelessAnims(linkRfu3Source);

export const createLinkRfu3Runtime = (): LinkRfu3Runtime => ({
  sWirelessStatusIndicatorSpriteId: 0,
  sprites: [],
  loadedSpriteSheets: new Set(),
  loadedSpritePalettes: new Set(),
  rfuLinkStatus: {
    parentChild: MODE_CHILD,
    connSlotFlag: 0,
    strength: [0, 0, 0, 0],
    partner: Array.from({ length: RFU_CHILD_MAX }, () => ({ serialNo: 0, gname: zeroBytes(RFU_GAME_NAME_LENGTH), uname: zeroBytes(RFU_USER_NAME_LENGTH) })),
    getNameFlag: 0
  },
  lman: { parent_child: MODE_CHILD },
  gHostRfuGameData: createRfuGameData(),
  gHostRfuUsername: zeroBytes(RFU_USER_NAME_LENGTH),
  saveBlock2: { playerTrainerId: [0, 0, 0, 0], playerGender: 0 },
  saveBlock1: { trainerNameRecords: Array.from({ length: 20 }, () => ({ trainerId: 0, trainerName: zeroBytes(PLAYER_NAME_LENGTH + 1) })) },
  flags: new Set(),
  nationalPokedexEnabled: false,
  wirelessCommType: 0,
  linkPlayers: [],
  multiplayerId: 0,
  linkPlayerCount: 0,
  rfuRecoveringFromLinkLoss: false,
  rfuStatus: 0,
  oamBuffer: Array.from({ length: 128 }, () => ({})),
  randomValues: [],
  rngSeed: 0x1234,
  sequenceCounter: 0,
  operations: []
});

export function createRecvQueue(): ByteQueue {
  return createQueue(RECV_QUEUE_NUM_SLOTS, COMM_SLOT_LENGTH * MAX_RFU_PLAYERS);
}

export function createSendQueue(): ByteQueue {
  return createQueue(SEND_QUEUE_NUM_SLOTS, COMM_SLOT_LENGTH);
}

export function createBackupQueue(): ByteQueue {
  return createQueue(BACKUP_QUEUE_NUM_SLOTS, COMM_SLOT_LENGTH);
}

export function createUnusedQueue(): ByteQueue {
  return createQueue(UNUSED_QUEUE_NUM_SLOTS, UNUSED_QUEUE_SLOT_LENGTH);
}

export function RfuRecvQueue_Reset(queue: ByteQueue): void {
  resetQueue(queue, RECV_QUEUE_NUM_SLOTS, COMM_SLOT_LENGTH * MAX_RFU_PLAYERS);
}

export function RfuSendQueue_Reset(queue: ByteQueue): void {
  resetQueue(queue, SEND_QUEUE_NUM_SLOTS, COMM_SLOT_LENGTH);
}

export function RfuUnusedQueue_Reset(queue: ByteQueue): void {
  resetQueue(queue, UNUSED_QUEUE_NUM_SLOTS, UNUSED_QUEUE_SLOT_LENGTH);
}

export function RfuRecvQueue_Enqueue(queue: ByteQueue, src: number[]): void {
  if (queue.count < RECV_QUEUE_NUM_SLOTS) {
    let count = 0;
    for (let i = 0; i < COMM_SLOT_LENGTH * MAX_RFU_PLAYERS; i += COMM_SLOT_LENGTH) {
      if ((src[i] ?? 0) === 0 && (src[i + 1] ?? 0) === 0) count += 1;
    }
    if (count !== MAX_RFU_PLAYERS) {
      for (let i = 0; i < COMM_SLOT_LENGTH * MAX_RFU_PLAYERS; i += 1) queue.slots[queue.recvSlot][i] = src[i] ?? 0;
      queue.recvSlot += 1;
      queue.recvSlot %= RECV_QUEUE_NUM_SLOTS;
      queue.count += 1;
      for (let i = 0; i < COMM_SLOT_LENGTH * MAX_RFU_PLAYERS; i += 1) src[i] = 0;
    }
  } else {
    queue.full = true;
  }
}

export function RfuSendQueue_Enqueue(queue: ByteQueue, src: number[]): void {
  if (queue.count < SEND_QUEUE_NUM_SLOTS) {
    let i = 0;
    for (; i < COMM_SLOT_LENGTH; i += 1) {
      if ((src[i] ?? 0) !== 0) break;
    }
    if (i !== COMM_SLOT_LENGTH) {
      for (i = 0; i < COMM_SLOT_LENGTH; i += 1) queue.slots[queue.recvSlot][i] = src[i] ?? 0;
      queue.recvSlot += 1;
      queue.recvSlot %= SEND_QUEUE_NUM_SLOTS;
      queue.count += 1;
      for (i = 0; i < COMM_SLOT_LENGTH; i += 1) src[i] = 0;
    }
  } else {
    queue.full = true;
  }
}

export function RfuRecvQueue_Dequeue(queue: ByteQueue, dest: number[]): boolean {
  if (queue.recvSlot === queue.sendSlot || queue.full) {
    for (let i = 0; i < COMM_SLOT_LENGTH * MAX_RFU_PLAYERS; i += 1) dest[i] = 0;
    return false;
  }
  for (let i = 0; i < COMM_SLOT_LENGTH * MAX_RFU_PLAYERS; i += 1) dest[i] = queue.slots[queue.sendSlot][i] ?? 0;
  queue.sendSlot += 1;
  queue.sendSlot %= RECV_QUEUE_NUM_SLOTS;
  queue.count -= 1;
  return true;
}

export function RfuSendQueue_Dequeue(queue: ByteQueue, dest: number[]): boolean {
  if (queue.recvSlot === queue.sendSlot || queue.full) return false;
  for (let i = 0; i < COMM_SLOT_LENGTH; i += 1) dest[i] = queue.slots[queue.sendSlot][i] ?? 0;
  queue.sendSlot += 1;
  queue.sendSlot %= SEND_QUEUE_NUM_SLOTS;
  queue.count -= 1;
  return true;
}

export function RfuBackupQueue_Enqueue(queue: ByteQueue, dest: number[]): void {
  if ((dest[1] ?? 0) === 0) {
    RfuBackupQueue_Dequeue(queue, null);
  } else {
    for (let i = 0; i < COMM_SLOT_LENGTH; i += 1) queue.slots[queue.recvSlot][i] = dest[i] ?? 0;
    queue.recvSlot += 1;
    queue.recvSlot %= BACKUP_QUEUE_NUM_SLOTS;
    if (queue.count < BACKUP_QUEUE_NUM_SLOTS) queue.count += 1;
    else queue.sendSlot = queue.recvSlot;
  }
}

export function RfuBackupQueue_Dequeue(queue: ByteQueue, dest: number[] | null): boolean {
  if (queue.count === 0) return false;
  if (dest !== null) {
    for (let i = 0; i < COMM_SLOT_LENGTH; i += 1) dest[i] = queue.slots[queue.sendSlot][i] ?? 0;
  }
  queue.sendSlot += 1;
  queue.sendSlot %= BACKUP_QUEUE_NUM_SLOTS;
  queue.count -= 1;
  return true;
}

export function RfuUnusedQueue_Dequeue(queue: ByteQueue, dest: number[]): void {
  if (queue.count < UNUSED_QUEUE_NUM_SLOTS) {
    for (let i = 0; i < UNUSED_QUEUE_SLOT_LENGTH; i += 1) queue.slots[queue.recvSlot][i] = dest[i] ?? 0;
    queue.recvSlot += 1;
    queue.recvSlot %= UNUSED_QUEUE_NUM_SLOTS;
    queue.count += 1;
  } else {
    queue.full = true;
  }
}

export function RfuUnusedQueue_Enqueue(queue: ByteQueue, dest: number[]): boolean {
  if (queue.recvSlot === queue.sendSlot || queue.full) return false;
  for (let i = 0; i < UNUSED_QUEUE_SLOT_LENGTH; i += 1) dest[i] = queue.slots[queue.sendSlot][i] ?? 0;
  queue.sendSlot += 1;
  queue.sendSlot %= UNUSED_QUEUE_NUM_SLOTS;
  queue.count -= 1;
  return true;
}

export function PopulateArrayWithSequence(runtime: LinkRfu3Runtime, arr: number[], mode: number): void {
  let total = 0;
  switch (mode) {
    case 0:
      for (let i = 0; i < 200; i += 1) {
        arr[i] = (i + 1) & 0xff;
        total = (total + i + 1) & 0xffff;
      }
      writeU16(arr, 200, total);
      break;
    case 1:
      for (let i = 0; i < 100; i += 1) {
        arr[i] = i + 1;
        total = (total + i + 1) & 0xffff;
      }
      writeU16(arr, 200, total);
      break;
    case 2:
      for (let i = 0; i < 200; i += 1) {
        const rval = Random(runtime) & 0xff;
        arr[i] = rval;
        total = (total + rval) & 0xffff;
      }
      writeU16(arr, 200, total);
      break;
    case 3:
      for (let i = 0; i < 200; i += 1) {
        arr[i] = (i + 1 + runtime.sequenceCounter) & 0xff;
        total = (total + ((i + 1 + runtime.sequenceCounter) & 0xff)) & 0xffff;
      }
      writeU16(arr, 200, total);
      runtime.sequenceCounter = (runtime.sequenceCounter + 1) & 0xff;
      break;
  }
}

export function PkmnStrToASCII(dest: number[], src: number[]): void {
  let i = 0;
  for (; (src[i] ?? EOS) !== EOS; i += 1) dest[i] = sWireless_RSEtoASCIITable[src[i]] ?? 0;
  dest[i] = 0;
}

export function ASCIIToPkmnStr(dest: number[], src: number[]): void {
  let i = 0;
  for (; (src[i] ?? 0) !== 0; i += 1) dest[i] = sWireless_ASCIItoRSETable[src[i]] ?? 0;
  dest[i] = EOS;
}

export function GetConnectedChildStrength(runtime: LinkRfu3Runtime, maxFlags: number): number {
  let flagCount = 0;
  let flags = runtime.rfuLinkStatus.connSlotFlag;
  if (runtime.rfuLinkStatus.parentChild === MODE_PARENT) {
    for (let i = 0; i < 4; i += 1) {
      if (flags & 1) {
        if (maxFlags === flagCount + 1) return runtime.rfuLinkStatus.strength[i] ?? 0;
        flagCount += 1;
      }
      flags >>= 1;
    }
  } else {
    for (let i = 0; i < 4; i += 1) {
      if (flags & 1) return runtime.rfuLinkStatus.strength[i] ?? 0;
      flags >>= 1;
    }
  }
  return 0;
}

export function InitHostRfuGameData(runtime: LinkRfu3Runtime, data: RfuGameData, activity: number, startedActivity: boolean, partnerInfo: number): void {
  for (let i = 0; i < data.compatibility.playerTrainerId.length; i += 1) data.compatibility.playerTrainerId[i] = runtime.saveBlock2.playerTrainerId[i] ?? 0;
  for (let i = 0; i < RFU_CHILD_MAX; i += 1) {
    data.partnerInfo[i] = partnerInfo & 0xff;
    partnerInfo >>= 8;
  }
  data.playerGender = runtime.saveBlock2.playerGender;
  data.activity = activity;
  data.startedActivity = startedActivity;
  data.compatibility.language = GAME_LANGUAGE;
  data.compatibility.version = GAME_VERSION;
  data.compatibility.hasNews = false;
  data.compatibility.hasCard = false;
  data.compatibility.unknown = false;
  data.compatibility.canLinkNationally = runtime.flags.has('FLAG_SYS_CAN_LINK_WITH_RS');
  data.compatibility.hasNationalDex = runtime.nationalPokedexEnabled;
  data.compatibility.gameClear = runtime.flags.has('FLAG_SYS_GAME_CLEAR');
}

export function Rfu_GetCompatiblePlayerData(runtime: LinkRfu3Runtime, gameData: number[], username: number[], idx: number): boolean {
  let retVal: boolean;
  const partner = runtime.rfuLinkStatus.partner[idx];
  if (runtime.lman.parent_child === MODE_PARENT) {
    retVal = true;
    if (IsRfuSerialNumberValid(partner.serialNo) && ((runtime.rfuLinkStatus.getNameFlag >> idx) & 1)) {
      memcpy(gameData, partner.gname, RFU_GAME_NAME_LENGTH);
      memcpy(username, partner.uname, RFU_USER_NAME_LENGTH);
    } else {
      memset(gameData, 0, RFU_GAME_NAME_LENGTH);
      memset(username, 0, RFU_USER_NAME_LENGTH);
    }
  } else {
    retVal = false;
    if (IsRfuSerialNumberValid(partner.serialNo)) {
      memcpy(gameData, partner.gname, RFU_GAME_NAME_LENGTH);
      memcpy(username, partner.uname, RFU_USER_NAME_LENGTH);
    } else {
      memset(gameData, 0, RFU_GAME_NAME_LENGTH);
      memset(username, 0, RFU_USER_NAME_LENGTH);
    }
  }
  return retVal;
}

export function Rfu_GetWonderDistributorPlayerData(runtime: LinkRfu3Runtime, gameData: number[], username: number[], idx: number): boolean {
  if (runtime.rfuLinkStatus.partner[idx].serialNo === RFU_SERIAL_WONDER_DISTRIBUTOR) {
    memcpy(gameData, runtime.rfuLinkStatus.partner[idx].gname, RFU_GAME_NAME_LENGTH);
    memcpy(username, runtime.rfuLinkStatus.partner[idx].uname, RFU_USER_NAME_LENGTH);
    return true;
  }
  memset(gameData, 0, RFU_GAME_NAME_LENGTH);
  memset(username, 0, RFU_USER_NAME_LENGTH);
  return false;
}

export function CopyHostRfuGameDataAndUsername(runtime: LinkRfu3Runtime, gameData: RfuGameData, username: number[]): void {
  Object.assign(gameData, structuredClone(runtime.gHostRfuGameData));
  memcpy(username, runtime.gHostRfuUsername, RFU_USER_NAME_LENGTH);
}

export function CreateWirelessStatusIndicatorSprite(runtime: LinkRfu3Runtime, x: number, y: number): void {
  if (x === 0 && y === 0) {
    x = 231;
    y = 8;
  }
  const sprId = CreateSprite(runtime, x, y);
  runtime.sprites[sprId].data[7] = STATUS_INDICATOR_ACTIVE;
  runtime.sprites[sprId].data[6] = GetSpriteTileStartByTag(runtime, TAG_GFX_STATUS_INDICATOR);
  runtime.sprites[sprId].invisible = true;
  runtime.sWirelessStatusIndicatorSpriteId = sprId;
}

export function DestroyWirelessStatusIndicatorSprite(runtime: LinkRfu3Runtime): void {
  const sprite = runtime.sprites[runtime.sWirelessStatusIndicatorSpriteId];
  if (sprite?.data[7] === STATUS_INDICATOR_ACTIVE) {
    sprite.data[7] = 0;
    DestroySprite(runtime, runtime.sWirelessStatusIndicatorSpriteId);
    runtime.oamBuffer[125] = {};
    runtime.operations.push('CpuCopy16:gDummyOamData:OAM+125:sizeof(struct OamData)');
  }
}

export function LoadWirelessStatusIndicatorSpriteGfx(runtime: LinkRfu3Runtime): void {
  if (GetSpriteTileStartByTag(runtime, TAG_GFX_STATUS_INDICATOR) === 0xffff) {
    runtime.loadedSpriteSheets.add(TAG_GFX_STATUS_INDICATOR);
    runtime.operations.push(`LoadCompressedSpriteSheet:${TAG_GFX_STATUS_INDICATOR}:0x0380`);
  }
  runtime.loadedSpritePalettes.add(TAG_PAL_STATUS_INDICATOR);
  runtime.operations.push(`LoadSpritePalette:${TAG_PAL_STATUS_INDICATOR}`);
  runtime.sWirelessStatusIndicatorSpriteId = SPRITE_NONE;
}

export function GetParentSignalStrength(runtime: LinkRfu3Runtime): number {
  let flags = runtime.rfuLinkStatus.connSlotFlag;
  for (let i = 0; i < RFU_CHILD_MAX; i += 1) {
    if (flags & 1) return runtime.rfuLinkStatus.strength[i] ?? 0;
    flags >>= 1;
  }
  return 0;
}

export function SetAndRestartWirelessStatusIndicatorAnim(sprite: WirelessSprite, animNum: number): void {
  if (sprite.data[2] !== animNum) {
    sprite.data[2] = animNum;
    sprite.data[3] = 0;
    sprite.data[4] = 0;
  }
}

export function UpdateWirelessStatusIndicatorSprite(runtime: LinkRfu3Runtime): void {
  if (runtime.sWirelessStatusIndicatorSpriteId !== SPRITE_NONE && runtime.sprites[runtime.sWirelessStatusIndicatorSpriteId]?.data[7] === STATUS_INDICATOR_ACTIVE) {
    const sprite = runtime.sprites[runtime.sWirelessStatusIndicatorSpriteId];
    let signalStrength = RFU_LINK_ICON_LEVEL4_MAX;
    if (runtime.rfuLinkStatus.parentChild === MODE_PARENT) {
      for (let i = 0; i < GetLinkPlayerCount(runtime) - 1; i += 1) {
        if (signalStrength >= GetConnectedChildStrength(runtime, i + 1)) signalStrength = GetConnectedChildStrength(runtime, i + 1);
      }
    } else {
      signalStrength = GetParentSignalStrength(runtime);
    }
    if (runtime.rfuRecoveringFromLinkLoss === true) sprite.data[0] = WIRELESS_STATUS_ANIM_ERROR;
    else if (signalStrength <= RFU_LINK_ICON_LEVEL1_MAX) sprite.data[0] = WIRELESS_STATUS_ANIM_SEARCHING;
    else if (signalStrength >= RFU_LINK_ICON_LEVEL2_MIN && signalStrength <= RFU_LINK_ICON_LEVEL2_MAX) sprite.data[0] = WIRELESS_STATUS_ANIM_1_BAR;
    else if (signalStrength >= RFU_LINK_ICON_LEVEL3_MIN && signalStrength <= RFU_LINK_ICON_LEVEL3_MAX) sprite.data[0] = WIRELESS_STATUS_ANIM_2_BARS;
    else if (signalStrength >= RFU_LINK_ICON_LEVEL4_MIN) sprite.data[0] = WIRELESS_STATUS_ANIM_3_BARS;

    if (sprite.data[0] !== sprite.data[1]) {
      SetAndRestartWirelessStatusIndicatorAnim(sprite, sprite.data[0]);
      sprite.data[1] = sprite.data[0];
    }
    const anim = sWirelessStatusIndicatorAnims[sprite.data[2]];
    if ((anim[sprite.data[4]]?.duration ?? 0) < sprite.data[3]) {
      sprite.data[4] += 1;
      sprite.data[3] = 0;
      if (anim[sprite.data[4]]?.jump === 0) sprite.data[4] = 0;
    } else {
      sprite.data[3] += 1;
    }
    runtime.oamBuffer[125] = {
      x: sprite.x + sprite.centerToCornerVecX,
      y: sprite.y + sprite.centerToCornerVecY,
      paletteNum: sprite.oam.paletteNum,
      tileNum: sprite.data[6] + (anim[sprite.data[4]]?.frame ?? 0)
    };
    runtime.operations.push('CpuCopy16:gMain.oamBuffer+125:OAM+125:sizeof(struct OamData)');
    if (runtime.rfuStatus === RFU_STATUS_FATAL_ERROR) DestroyWirelessStatusIndicatorSprite(runtime);
  }
}

export function CopyTrainerRecord(dest: TrainerNameRecord, trainerId: number, name: number[]): void {
  let i = 0;
  dest.trainerId = trainerId;
  for (; i < PLAYER_NAME_LENGTH; i += 1) {
    if ((name[i] ?? EOS) === EOS) break;
    dest.trainerName[i] = name[i] ?? 0;
  }
  dest.trainerName[i] = EOS;
}

export function ZeroName(name: number[]): void {
  for (let i = 0; i < PLAYER_NAME_LENGTH + 1; i += 1) name[i] = 0;
}

export function NameIsEmpty(name: number[]): boolean {
  for (let i = 0; i < PLAYER_NAME_LENGTH + 1; i += 1) {
    if ((name[i] ?? 0) !== 0) return false;
  }
  return true;
}

export function SaveLinkTrainerNames(runtime: LinkRfu3Runtime): void {
  if (runtime.wirelessCommType !== 0) {
    const connectedTrainerRecordIndices = Array.from({ length: 5 }, () => -1);
    const newRecords = Array.from({ length: runtime.saveBlock1.trainerNameRecords.length }, () => ({ trainerId: 0, trainerName: zeroBytes(PLAYER_NAME_LENGTH + 1) }));
    for (let i = 0; i < GetLinkPlayerCount(runtime); i += 1) {
      connectedTrainerRecordIndices[i] = -1;
      for (let j = 0; j < runtime.saveBlock1.trainerNameRecords.length; j += 1) {
        if (
          (runtime.linkPlayers[i].trainerId & 0xffff) === runtime.saveBlock1.trainerNameRecords[j].trainerId
          && StringCompare(runtime.linkPlayers[i].name, runtime.saveBlock1.trainerNameRecords[j].trainerName) === 0
        ) {
          connectedTrainerRecordIndices[i] = j;
        }
      }
    }
    let nextSpace = 0;
    for (let i = 0; i < GetLinkPlayerCount(runtime); i += 1) {
      if (i !== GetMultiplayerId(runtime) && runtime.linkPlayers[i].language !== LANGUAGE_JAPANESE) {
        CopyTrainerRecord(newRecords[nextSpace], runtime.linkPlayers[i].trainerId & 0xffff, runtime.linkPlayers[i].name);
        if (connectedTrainerRecordIndices[i] >= 0) ZeroName(runtime.saveBlock1.trainerNameRecords[connectedTrainerRecordIndices[i]].trainerName);
        nextSpace += 1;
      }
    }
    for (let i = 0; i < runtime.saveBlock1.trainerNameRecords.length; i += 1) {
      if (!NameIsEmpty(runtime.saveBlock1.trainerNameRecords[i].trainerName)) {
        CopyTrainerRecord(newRecords[nextSpace], runtime.saveBlock1.trainerNameRecords[i].trainerId, runtime.saveBlock1.trainerNameRecords[i].trainerName);
        nextSpace += 1;
        if (nextSpace >= runtime.saveBlock1.trainerNameRecords.length) break;
      }
    }
    runtime.saveBlock1.trainerNameRecords = newRecords;
  }
}

export function PlayerHasMetTrainerBefore(runtime: LinkRfu3Runtime, id: number, name: number[]): boolean {
  for (let i = 0; i < runtime.saveBlock1.trainerNameRecords.length; i += 1) {
    if (StringCompareN(runtime.saveBlock1.trainerNameRecords[i].trainerName, name, PLAYER_NAME_LENGTH) === 0 && runtime.saveBlock1.trainerNameRecords[i].trainerId === id) return true;
    if (NameIsEmpty(runtime.saveBlock1.trainerNameRecords[i].trainerName)) return false;
  }
  return false;
}

export function createRfuGameData(): RfuGameData {
  return {
    compatibility: {
      playerTrainerId: [0, 0, 0, 0],
      language: 0,
      version: 0,
      hasNews: false,
      hasCard: false,
      unknown: false,
      canLinkNationally: false,
      hasNationalDex: false,
      gameClear: false
    },
    partnerInfo: [0, 0, 0, 0],
    playerGender: 0,
    activity: 0,
    startedActivity: false
  };
}

function createQueue(numSlots: number, slotLength: number): ByteQueue {
  return { slots: Array.from({ length: numSlots }, () => zeroBytes(slotLength)), recvSlot: 0, sendSlot: 0, count: 0, full: false };
}

function resetQueue(queue: ByteQueue, numSlots: number, slotLength: number): void {
  queue.slots = Array.from({ length: numSlots }, () => zeroBytes(slotLength));
  queue.sendSlot = 0;
  queue.recvSlot = 0;
  queue.count = 0;
  queue.full = false;
}

function zeroBytes(length: number): number[] {
  return Array.from({ length }, () => 0);
}

function writeU16(arr: number[], offset: number, value: number): void {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >> 8) & 0xff;
}

function Random(runtime: LinkRfu3Runtime): number {
  if (runtime.randomValues.length > 0) return runtime.randomValues.shift() ?? 0;
  runtime.rngSeed = (Math.imul(runtime.rngSeed, 1103515245) + 24691) >>> 0;
  return runtime.rngSeed >>> 16;
}

function IsRfuSerialNumberValid(serialNo: number): boolean {
  return serialNo !== 0 && serialNo !== 0xffff;
}

function memcpy(dest: number[], src: number[], length: number): void {
  for (let i = 0; i < length; i += 1) dest[i] = src[i] ?? 0;
}

function memset(dest: number[], value: number, length: number): void {
  for (let i = 0; i < length; i += 1) dest[i] = value;
}

function CreateSprite(runtime: LinkRfu3Runtime, x: number, y: number): number {
  const id = runtime.sprites.length;
  runtime.sprites.push({ x, y, centerToCornerVecX: 0, centerToCornerVecY: 0, oam: { paletteNum: 0 }, invisible: false, destroyed: false, data: Array.from({ length: 8 }, () => 0) });
  runtime.operations.push(`CreateSprite:${id}:${x}:${y}:0`);
  return id;
}

function DestroySprite(runtime: LinkRfu3Runtime, spriteId: number): void {
  runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`DestroySprite:${spriteId}`);
}

function GetSpriteTileStartByTag(runtime: LinkRfu3Runtime, tag: number): number {
  return runtime.loadedSpriteSheets.has(tag) ? 0x20 : 0xffff;
}

function GetLinkPlayerCount(runtime: LinkRfu3Runtime): number {
  return runtime.linkPlayerCount || runtime.linkPlayers.length;
}

function GetMultiplayerId(runtime: LinkRfu3Runtime): number {
  return runtime.multiplayerId;
}

function StringCompare(a: number[], b: number[]): number {
  let i = 0;
  for (;; i += 1) {
    const av = a[i] ?? EOS;
    const bv = b[i] ?? EOS;
    if (av !== bv) return av - bv;
    if (av === EOS || av === 0) return 0;
  }
}

function StringCompareN(a: number[], b: number[], n: number): number {
  for (let i = 0; i < n; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function keepRevision0Branch(source: string): string {
  return source.replace(/#if REVISION >= 0xA[\s\S]*?#else([\s\S]*?)#endif/u, '$1');
}

function parseByteTable(source: string, symbol: string): number[] {
  const body = source.match(new RegExp(`static const u8 ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  const values: number[] = [];
  let cursor = 0;
  for (const raw of body.split(',')) {
    const token = raw.replace(/\/\/.*$/u, '').trim();
    if (!token) continue;
    const assign = token.match(/^\['(.)'\]\s*=\s*(.+)$/u) ?? token.match(/^\[([A-Za-z0-9_]+)\]\s*=\s*(.+)$/u);
    let expr = token;
    if (assign) {
      cursor = assign[1].length === 1 ? assign[1].charCodeAt(0) : resolveByteExpr(assign[1]);
      expr = assign[2];
    }
    values[cursor] = resolveByteExpr(expr);
    cursor += 1;
  }
  return values.map((value) => value ?? 0);
}

function parseWirelessAnims(source: string): Array<Array<{ frame: number; duration: number; jump?: number }>> {
  const names = [
    'sWirelessStatusIndicator_3Bars',
    'sWirelessStatusIndicator_2Bars',
    'sWirelessStatusIndicator_1Bar',
    'sWirelessStatusIndicator_Searching',
    'sWirelessStatusIndicator_Error'
  ];
  return names.map((name) => {
    const body = source.match(new RegExp(`static const union AnimCmd ${name}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
    const frames: Array<{ frame: number; duration: number; jump?: number }> = [];
    for (const line of body.split('\n')) {
      const frame = line.match(/ANIMCMD_FRAME\(\s*(\d+),\s*(\d+)\)/u);
      if (frame) frames.push({ frame: Number.parseInt(frame[1], 10), duration: Number.parseInt(frame[2], 10) });
      const jump = line.match(/ANIMCMD_JUMP\((\d+)\)/u);
      if (jump) frames.push({ frame: 0, duration: 0, jump: Number.parseInt(jump[1], 10) });
    }
    return frames;
  });
}

function resolveByteExpr(expr: string): number {
  const trimmed = expr.trim();
  if (/^'.'$/u.test(trimmed)) return trimmed.charCodeAt(1);
  if (/^0x[0-9a-f]+$/iu.test(trimmed) || /^\d+$/u.test(trimmed)) return Number.parseInt(trimmed, 0) & 0xff;
  return charDefines.get(trimmed) ?? 0;
}

function defineNumber(source: string, name: string): number {
  return parseCharDefines(source).get(name) ?? 0;
}

function parseCharDefines(source: string): Map<string, number> {
  const values = new Map<string, number>();
  for (const [, name, value] of source.matchAll(/^#define\s+([A-Za-z0-9_]+)\s+((?:0x[0-9A-Fa-f]+)|(?:\d+))(?:\s|$)/gmu)) {
    values.set(name, Number.parseInt(value, 0));
  }
  return values;
}
