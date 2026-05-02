import { describe, expect, test } from 'vitest';
import {
  ASCIIToPkmnStr,
  BACKUP_QUEUE_NUM_SLOTS,
  COMM_SLOT_LENGTH,
  CopyTrainerRecord,
  CreateWirelessStatusIndicatorSprite,
  EOS,
  GAME_LANGUAGE,
  GAME_VERSION,
  GetConnectedChildStrength,
  GetParentSignalStrength,
  InitHostRfuGameData,
  LANGUAGE_JAPANESE,
  LoadWirelessStatusIndicatorSpriteGfx,
  MODE_CHILD,
  MODE_PARENT,
  PLAYER_NAME_LENGTH,
  PlayerHasMetTrainerBefore,
  PkmnStrToASCII,
  PopulateArrayWithSequence,
  RFU_GAME_NAME_LENGTH,
  RFU_SERIAL_WONDER_DISTRIBUTOR,
  RFU_STATUS_FATAL_ERROR,
  RFU_USER_NAME_LENGTH,
  RfuBackupQueue_Dequeue,
  RfuBackupQueue_Enqueue,
  Rfu_GetCompatiblePlayerData,
  Rfu_GetWonderDistributorPlayerData,
  RfuRecvQueue_Dequeue,
  RfuRecvQueue_Enqueue,
  RfuRecvQueue_Reset,
  RfuSendQueue_Dequeue,
  RfuSendQueue_Enqueue,
  RfuSendQueue_Reset,
  RfuUnusedQueue_Dequeue,
  RfuUnusedQueue_Enqueue,
  RfuUnusedQueue_Reset,
  SaveLinkTrainerNames,
  SetAndRestartWirelessStatusIndicatorAnim,
  TAG_GFX_STATUS_INDICATOR,
  TAG_PAL_STATUS_INDICATOR,
  UNUSED_QUEUE_SLOT_LENGTH,
  UpdateWirelessStatusIndicatorSprite,
  WIRELESS_STATUS_ANIM_1_BAR,
  WIRELESS_STATUS_ANIM_2_BARS,
  WIRELESS_STATUS_ANIM_3_BARS,
  WIRELESS_STATUS_ANIM_ERROR,
  ZeroName,
  createBackupQueue,
  createLinkRfu3Runtime,
  createRecvQueue,
  createRfuGameData,
  createSendQueue,
  createUnusedQueue,
  sWirelessStatusIndicatorAnims,
  sWireless_ASCIItoRSETable,
  sWireless_RSEtoASCIITable,
} from '../src/game/decompLinkRfu3';

describe('decomp link_rfu_3', () => {
  test('parses wireless text conversion and indicator animation tables from link_rfu_3.c', () => {
    expect(sWireless_ASCIItoRSETable['A'.charCodeAt(0)]).toBe(0xbb);
    expect(sWireless_ASCIItoRSETable['a'.charCodeAt(0)]).toBe(0xd5);
    expect(sWireless_ASCIItoRSETable['0'.charCodeAt(0)]).toBe(0xa1);
    expect(sWireless_ASCIItoRSETable['-'.charCodeAt(0)]).toBe(0xae);
    expect(sWireless_RSEtoASCIITable[0xbb]).toBe('A'.charCodeAt(0));
    expect(sWireless_RSEtoASCIITable[0xd5]).toBe('a'.charCodeAt(0));
    expect(sWireless_RSEtoASCIITable[EOS]).toBe(0);
    expect(sWirelessStatusIndicatorAnims[WIRELESS_STATUS_ANIM_3_BARS].map((frame) => frame.frame)).toEqual([4, 8, 12, 16, 12, 8, 0]);
    expect(sWirelessStatusIndicatorAnims[WIRELESS_STATUS_ANIM_ERROR]).toEqual([{ frame: 24, duration: 10 }, { frame: 4, duration: 10 }, { frame: 0, duration: 0, jump: 0 }]);
  });

  test('resets, enqueues, dequeues, and rejects empty/full RFU recv and send queues like C', () => {
    const recv = createRecvQueue();
    const allEmpty = Array.from({ length: COMM_SLOT_LENGTH * 5 }, () => 0);
    RfuRecvQueue_Enqueue(recv, allEmpty);
    expect(recv.count).toBe(0);

    const recvSrc = Array.from({ length: COMM_SLOT_LENGTH * 5 }, (_, i) => (i === 0 ? 1 : i & 0xff));
    RfuRecvQueue_Enqueue(recv, recvSrc);
    expect(recv.count).toBe(1);
    expect(recvSrc.every((value) => value === 0)).toBe(true);
    const recvDest: number[] = [];
    expect(RfuRecvQueue_Dequeue(recv, recvDest)).toBe(true);
    expect(recvDest[0]).toBe(1);
    expect(recv.count).toBe(0);
    expect(RfuRecvQueue_Dequeue(recv, recvDest)).toBe(false);
    expect(recvDest.every((value) => value === 0)).toBe(true);

    recv.count = 20;
    RfuRecvQueue_Enqueue(recv, Array.from({ length: COMM_SLOT_LENGTH * 5 }, () => 1));
    expect(recv.full).toBe(true);
    RfuRecvQueue_Reset(recv);
    expect(recv.full).toBe(false);

    const send = createSendQueue();
    RfuSendQueue_Enqueue(send, Array.from({ length: COMM_SLOT_LENGTH }, () => 0));
    expect(send.count).toBe(0);
    const sendSrc = Array.from({ length: COMM_SLOT_LENGTH }, (_, i) => i + 1);
    RfuSendQueue_Enqueue(send, sendSrc);
    expect(sendSrc.every((value) => value === 0)).toBe(true);
    const sendDest: number[] = [];
    expect(RfuSendQueue_Dequeue(send, sendDest)).toBe(true);
    expect(sendDest.slice(0, 3)).toEqual([1, 2, 3]);
    send.count = 40;
    RfuSendQueue_Enqueue(send, Array.from({ length: COMM_SLOT_LENGTH }, () => 1));
    expect(send.full).toBe(true);
    RfuSendQueue_Reset(send);
    expect(send.count).toBe(0);
  });

  test('mirrors backup and unused queue wraparound behavior', () => {
    const backup = createBackupQueue();
    RfuBackupQueue_Enqueue(backup, bytes([1, 2]));
    RfuBackupQueue_Enqueue(backup, bytes([3, 4]));
    RfuBackupQueue_Enqueue(backup, bytes([5, 6]));
    expect(backup.count).toBe(BACKUP_QUEUE_NUM_SLOTS);
    const first: number[] = [];
    expect(RfuBackupQueue_Dequeue(backup, first)).toBe(true);
    expect(first.slice(0, 2)).toEqual([3, 4]);
    RfuBackupQueue_Enqueue(backup, bytes([7, 0]));
    expect(backup.count).toBe(0);

    const unused = createUnusedQueue();
    const src = Array.from({ length: UNUSED_QUEUE_SLOT_LENGTH }, (_, i) => i & 0xff);
    RfuUnusedQueue_Dequeue(unused, src);
    expect(unused.count).toBe(1);
    const dest: number[] = [];
    expect(RfuUnusedQueue_Enqueue(unused, dest)).toBe(true);
    expect(dest.slice(0, 4)).toEqual([0, 1, 2, 3]);
    expect(RfuUnusedQueue_Enqueue(unused, dest)).toBe(false);
    RfuUnusedQueue_Reset(unused);
    expect(unused.count).toBe(0);
  });

  test('populates unused sequence arrays and writes little-endian totals', () => {
    const runtime = createLinkRfu3Runtime();
    const arr: number[] = [];
    PopulateArrayWithSequence(runtime, arr, 0);
    expect(arr[0]).toBe(1);
    expect(arr[199]).toBe(200);
    expect(readU16(arr, 200)).toBe(20100);

    const arr1: number[] = [];
    PopulateArrayWithSequence(runtime, arr1, 1);
    expect(arr1[99]).toBe(100);
    expect(readU16(arr1, 200)).toBe(5050);

    runtime.randomValues = [1, 2, 255];
    const arr2: number[] = [];
    PopulateArrayWithSequence(runtime, arr2, 2);
    expect(arr2.slice(0, 3)).toEqual([1, 2, 255]);

    const arr3: number[] = [];
    PopulateArrayWithSequence(runtime, arr3, 3);
    expect(arr3[0]).toBe(1);
    expect(runtime.sequenceCounter).toBe(1);
    PopulateArrayWithSequence(runtime, arr3, 3);
    expect(arr3[0]).toBe(2);
  });

  test('converts Pokemon strings to ASCII and back through the parsed tables', () => {
    const ascii: number[] = [];
    PkmnStrToASCII(ascii, [0xbb, 0xd5, 0xa1, EOS]);
    expect(ascii).toEqual(['A'.charCodeAt(0), 'a'.charCodeAt(0), '0'.charCodeAt(0), 0]);

    const pkmn: number[] = [];
    ASCIIToPkmnStr(pkmn, ['A'.charCodeAt(0), '-'.charCodeAt(0), 'z'.charCodeAt(0), 0]);
    expect(pkmn).toEqual([0xbb, 0xae, 0xee, EOS]);
  });

  test('copies host RFU game data and compatible partner payloads with parent/child rules', () => {
    const runtime = createLinkRfu3Runtime();
    const data = createRfuGameData();
    runtime.saveBlock2.playerTrainerId = [9, 8, 7, 6];
    runtime.saveBlock2.playerGender = 1;
    runtime.flags.add('FLAG_SYS_CAN_LINK_WITH_RS');
    runtime.nationalPokedexEnabled = true;
    InitHostRfuGameData(runtime, data, 12, true, 0x44332211);
    expect(data.compatibility.playerTrainerId).toEqual([9, 8, 7, 6]);
    expect(data.partnerInfo).toEqual([0x11, 0x22, 0x33, 0x44]);
    expect(data.compatibility).toMatchObject({ language: GAME_LANGUAGE, version: GAME_VERSION, canLinkNationally: true, hasNationalDex: true });

    runtime.rfuLinkStatus.partner[1] = { serialNo: 2, gname: bytes([1, 2, 3], RFU_GAME_NAME_LENGTH), uname: bytes([4, 5], RFU_USER_NAME_LENGTH) };
    runtime.lman.parent_child = MODE_PARENT;
    let gameDataBytes: number[] = [];
    let username: number[] = [];
    expect(runtime.rfuLinkStatus.getNameFlag).toBe(0);
    expect(Rfu_GetCompatiblePlayerData(runtime, gameDataBytes, username, 1)).toBe(true);
    expect(gameDataBytes.every((value) => value === 0)).toBe(true);
    runtime.rfuLinkStatus.getNameFlag = 1 << 1;
    gameDataBytes = [];
    username = [];
    expect(Rfu_GetCompatiblePlayerData(runtime, gameDataBytes, username, 1)).toBe(true);
    expect(gameDataBytes.slice(0, 3)).toEqual([1, 2, 3]);
    expect(username.slice(0, 2)).toEqual([4, 5]);

    runtime.lman.parent_child = MODE_CHILD;
    gameDataBytes = [];
    username = [];
    expect(Rfu_GetCompatiblePlayerData(runtime, gameDataBytes, username, 1)).toBe(false);
    expect(gameDataBytes[0]).toBe(1);
  });

  test('handles wonder distributor data and wireless indicator sprite lifecycle/animation', () => {
    const runtime = createLinkRfu3Runtime();
    runtime.rfuLinkStatus.partner[0] = { serialNo: RFU_SERIAL_WONDER_DISTRIBUTOR, gname: bytes([7, 8], RFU_GAME_NAME_LENGTH), uname: bytes([9], RFU_USER_NAME_LENGTH) };
    const gameData: number[] = [];
    const username: number[] = [];
    expect(Rfu_GetWonderDistributorPlayerData(runtime, gameData, username, 0)).toBe(true);
    expect(gameData.slice(0, 2)).toEqual([7, 8]);
    expect(username[0]).toBe(9);

    LoadWirelessStatusIndicatorSpriteGfx(runtime);
    expect(runtime.loadedSpriteSheets.has(TAG_GFX_STATUS_INDICATOR)).toBe(true);
    expect(runtime.loadedSpritePalettes.has(TAG_PAL_STATUS_INDICATOR)).toBe(true);
    expect(runtime.sWirelessStatusIndicatorSpriteId).toBe(0xff);

    runtime.rfuLinkStatus.parentChild = MODE_PARENT;
    runtime.linkPlayerCount = 3;
    runtime.rfuLinkStatus.connSlotFlag = 0b0011;
    runtime.rfuLinkStatus.strength = [240, 130, 0, 0];
    CreateWirelessStatusIndicatorSprite(runtime, 0, 0);
    const sprite = runtime.sprites[runtime.sWirelessStatusIndicatorSpriteId];
    expect(sprite.x).toBe(231);
    expect(sprite.y).toBe(8);
    UpdateWirelessStatusIndicatorSprite(runtime);
    expect(sprite.data[0]).toBe(WIRELESS_STATUS_ANIM_2_BARS);
    expect(runtime.oamBuffer[125].tileNum).toBe(0x20 + 4);

    runtime.rfuRecoveringFromLinkLoss = true;
    UpdateWirelessStatusIndicatorSprite(runtime);
    expect(sprite.data[0]).toBe(WIRELESS_STATUS_ANIM_ERROR);
    runtime.rfuStatus = RFU_STATUS_FATAL_ERROR;
    UpdateWirelessStatusIndicatorSprite(runtime);
    expect(sprite.destroyed).toBe(true);
  });

  test('calculates child/parent signal strength and restarts animations only on changes', () => {
    const runtime = createLinkRfu3Runtime();
    runtime.rfuLinkStatus.parentChild = MODE_PARENT;
    runtime.rfuLinkStatus.connSlotFlag = 0b1011;
    runtime.rfuLinkStatus.strength = [10, 20, 30, 40];
    expect(GetConnectedChildStrength(runtime, 1)).toBe(10);
    expect(GetConnectedChildStrength(runtime, 2)).toBe(20);
    expect(GetConnectedChildStrength(runtime, 3)).toBe(40);

    runtime.rfuLinkStatus.parentChild = MODE_CHILD;
    expect(GetConnectedChildStrength(runtime, 1)).toBe(10);
    expect(GetParentSignalStrength(runtime)).toBe(10);

    const sprite = { x: 0, y: 0, centerToCornerVecX: 0, centerToCornerVecY: 0, oam: { paletteNum: 0 }, invisible: false, destroyed: false, data: [0, 0, WIRELESS_STATUS_ANIM_1_BAR, 4, 2, 0, 0, 0] };
    SetAndRestartWirelessStatusIndicatorAnim(sprite, WIRELESS_STATUS_ANIM_1_BAR);
    expect(sprite.data[3]).toBe(4);
    SetAndRestartWirelessStatusIndicatorAnim(sprite, WIRELESS_STATUS_ANIM_3_BARS);
    expect(sprite.data[2]).toBe(WIRELESS_STATUS_ANIM_3_BARS);
    expect(sprite.data[3]).toBe(0);
    expect(sprite.data[4]).toBe(0);
  });

  test('saves link trainer names at the top and detects prior trainers with C list stop rules', () => {
    const runtime = createLinkRfu3Runtime();
    runtime.wirelessCommType = 1;
    runtime.multiplayerId = 0;
    runtime.linkPlayers = [
      { trainerId: 1, name: nameBytes('SELF'), language: 2 },
      { trainerId: 2, name: nameBytes('ALICE'), language: 2 },
      { trainerId: 3, name: nameBytes('BOB'), language: LANGUAGE_JAPANESE },
      { trainerId: 4, name: nameBytes('CARA'), language: 2 }
    ];
    runtime.linkPlayerCount = 4;
    CopyTrainerRecord(runtime.saveBlock1.trainerNameRecords[0], 9, nameBytes('OLD'));
    CopyTrainerRecord(runtime.saveBlock1.trainerNameRecords[1], 2, nameBytes('ALICE'));

    SaveLinkTrainerNames(runtime);
    expect(runtime.saveBlock1.trainerNameRecords[0]).toMatchObject({ trainerId: 2 });
    expect(runtime.saveBlock1.trainerNameRecords[0].trainerName.slice(0, 5)).toEqual(nameBytes('ALICE').slice(0, 5));
    expect(runtime.saveBlock1.trainerNameRecords[1]).toMatchObject({ trainerId: 4 });
    expect(runtime.saveBlock1.trainerNameRecords[2]).toMatchObject({ trainerId: 9 });
    expect(PlayerHasMetTrainerBefore(runtime, 2, nameBytes('ALICE'))).toBe(true);
    expect(PlayerHasMetTrainerBefore(runtime, 3, nameBytes('BOB'))).toBe(false);
    ZeroName(runtime.saveBlock1.trainerNameRecords[0].trainerName);
    expect(PlayerHasMetTrainerBefore(runtime, 9, nameBytes('OLD'))).toBe(false);
  });
});

function bytes(values: number[], length = COMM_SLOT_LENGTH): number[] {
  const result = Array.from({ length }, () => 0);
  values.forEach((value, i) => {
    result[i] = value;
  });
  return result;
}

function readU16(arr: number[], offset: number): number {
  return (arr[offset] ?? 0) | ((arr[offset + 1] ?? 0) << 8);
}

function nameBytes(text: string): number[] {
  const dest: number[] = [];
  ASCIIToPkmnStr(dest, [...text].map((char) => char.charCodeAt(0)).concat(0));
  while (dest.length < PLAYER_NAME_LENGTH + 1) dest.push(0);
  return dest;
}
