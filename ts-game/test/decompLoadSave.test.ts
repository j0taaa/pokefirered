import { describe, expect, test } from 'vitest';
import {
  ApplyNewEncryptionKeyToAllEncryptedData,
  ApplyNewEncryptionKeyToHword,
  ApplyNewEncryptionKeyToWord,
  CheckForFlashMemory,
  ClearContinueGameWarpStatus,
  ClearContinueGameWarpStatus2,
  ClearSav1,
  ClearSav2,
  CONTINUE_GAME_WARP,
  LoadObjectEvents,
  LoadPlayerBag,
  LoadPlayerParty,
  LoadSerializedGame,
  MoveSaveBlocks_ResetHeap,
  OBJECT_EVENTS_COUNT,
  PARTY_SIZE,
  SaveObjectEvents,
  SavePlayerBag,
  SavePlayerParty,
  SaveSerializedGame,
  SetContinueGameWarpStatus,
  SetContinueGameWarpStatusToDynamicWarp,
  SetSaveBlocksPointers,
  UseContinueGameWarp,
  applyNewEncryptionKeyToAllEncryptedData,
  applyNewEncryptionKeyToHword,
  applyNewEncryptionKeyToWord,
  checkForFlashMemory,
  clearContinueGameWarpStatus,
  clearContinueGameWarpStatus2,
  clearSav1,
  clearSav2,
  createLoadSaveRuntime,
  loadObjectEvents,
  loadPlayerBag,
  loadPlayerParty,
  loadSerializedGame,
  moveSaveBlocksResetHeap,
  saveObjectEvents,
  savePlayerBag,
  savePlayerParty,
  saveSerializedGame,
  setContinueGameWarpStatus,
  setContinueGameWarpStatusToDynamicWarp,
  setSaveBlocksPointers,
  useContinueGameWarp
} from '../src/game/decompLoadSave';

describe('decomp load_save', () => {
  test('exact C function names are exported as the implemented load/save routines', () => {
    expect(CheckForFlashMemory).toBe(checkForFlashMemory);
    expect(ClearSav2).toBe(clearSav2);
    expect(ClearSav1).toBe(clearSav1);
    expect(SetSaveBlocksPointers).toBe(setSaveBlocksPointers);
    expect(MoveSaveBlocks_ResetHeap).toBe(moveSaveBlocksResetHeap);
    expect(UseContinueGameWarp).toBe(useContinueGameWarp);
    expect(ClearContinueGameWarpStatus).toBe(clearContinueGameWarpStatus);
    expect(SetContinueGameWarpStatus).toBe(setContinueGameWarpStatus);
    expect(SetContinueGameWarpStatusToDynamicWarp).toBe(setContinueGameWarpStatusToDynamicWarp);
    expect(ClearContinueGameWarpStatus2).toBe(clearContinueGameWarpStatus2);
    expect(SavePlayerParty).toBe(savePlayerParty);
    expect(LoadPlayerParty).toBe(loadPlayerParty);
    expect(SaveObjectEvents).toBe(saveObjectEvents);
    expect(LoadObjectEvents).toBe(loadObjectEvents);
    expect(SaveSerializedGame).toBe(saveSerializedGame);
    expect(LoadSerializedGame).toBe(loadSerializedGame);
    expect(LoadPlayerBag).toBe(loadPlayerBag);
    expect(SavePlayerBag).toBe(savePlayerBag);
    expect(ApplyNewEncryptionKeyToHword).toBe(applyNewEncryptionKeyToHword);
    expect(ApplyNewEncryptionKeyToWord).toBe(applyNewEncryptionKeyToWord);
    expect(ApplyNewEncryptionKeyToAllEncryptedData).toBe(applyNewEncryptionKeyToAllEncryptedData);
  });

  test('flash detection follows IdentifyFlash return polarity', () => {
    const runtime = createLoadSaveRuntime();
    runtime.flashIdentifyResult = 0;
    checkForFlashMemory(runtime);
    expect(runtime.flashMemoryPresent).toBe(true);
    expect(runtime.flashTimerInits).toBe(1);

    runtime.flashIdentifyResult = 1;
    checkForFlashMemory(runtime);
    expect(runtime.flashMemoryPresent).toBe(false);
  });

  test('clear save blocks zero their modeled data', () => {
    const runtime = createLoadSaveRuntime();
    runtime.saveBlock2.encryptionKey = 5;
    runtime.saveBlock1.money = 99;

    clearSav2(runtime);
    clearSav1(runtime);

    expect(runtime.saveBlock2).toEqual({ encryptionKey: 0, specialSaveWarpFlags: 0 });
    expect(runtime.saveBlock1.money).toBe(0);
  });

  test('SetSaveBlocksPointers uses masked random offset and records ASLR old pointer', () => {
    const runtime = createLoadSaveRuntime();
    runtime.saveBlock1Offset = 12;
    runtime.randomValues = [0x7f];

    setSaveBlocksPointers(runtime);

    expect(runtime.saveBlock1Offset).toBe(0x7c);
    expect(runtime.saveBlock2Offset).toBe(0x7c);
    expect(runtime.pokemonStorageOffset).toBe(0x7c);
    expect(runtime.bagPointersSet).toBe(1);
    expect(runtime.qlASLROffsets).toEqual([12]);
  });

  test('MoveSaveBlocks_ResetHeap preserves data, resets heap, restores callbacks, and applies a new key', () => {
    const runtime = createLoadSaveRuntime();
    runtime.saveBlock1.money = 0x11111111;
    runtime.saveBlock1.coins = 0x2222;
    runtime.saveBlock1.trainerTower[0].bestTime = 0x33333333;
    runtime.saveBlock2.encryptionKey = 0x01010101;
    runtime.vblankCallback = 'vblank';
    runtime.hblankCallback = 'hblank';
    runtime.vblankCounter1 = 'counter';
    runtime.randomValues = [0x2a, 0x1234, 0x5678];

    moveSaveBlocksResetHeap(runtime);

    expect(runtime.saveBlock1Offset).toBe(0x28);
    expect(runtime.heapResetCount).toBe(1);
    expect(runtime.vblankCallback).toBe('vblank');
    expect(runtime.hblankCallback).toBe('hblank');
    expect(runtime.vblankCounter1).toBeNull();
    expect(runtime.saveBlock2.encryptionKey).toBe(0x12345678);
    expect(runtime.saveBlock1.money).toBe((0x11111111 ^ 0x01010101 ^ 0x12345678) >>> 0);
    expect(runtime.saveBlock1.coins).toBe((0x2222 ^ 0x01010101 ^ 0x12345678) & 0xffff);
    expect(runtime.encryptionApplied).toEqual([0x12345678]);
  });

  test('continue-game warp helpers mirror bit operations and dynamic warp call', () => {
    const runtime = createLoadSaveRuntime();
    expect(useContinueGameWarp(runtime)).toBe(0);
    setContinueGameWarpStatus(runtime);
    expect(useContinueGameWarp(runtime)).toBe(CONTINUE_GAME_WARP);
    clearContinueGameWarpStatus(runtime);
    expect(useContinueGameWarp(runtime)).toBe(0);
    setContinueGameWarpStatusToDynamicWarp(runtime);
    expect(runtime.dynamicWarpSetCalls).toEqual([0]);
    clearContinueGameWarpStatus2(runtime);
    expect(useContinueGameWarp(runtime)).toBe(0);
  });

  test('party and object event serialization copies all fixed slots', () => {
    const runtime = createLoadSaveRuntime();
    runtime.playerPartyCount = 2;
    runtime.playerParty[0] = { species: 'Bulbasaur' };
    runtime.playerParty[5] = { species: 'Mew' };
    runtime.objectEvents[0] = { localId: 1 };
    runtime.objectEvents[OBJECT_EVENTS_COUNT - 1] = { localId: 16 };

    saveSerializedGame(runtime);
    runtime.playerParty = Array.from({ length: PARTY_SIZE }, () => null);
    runtime.objectEvents = Array.from({ length: OBJECT_EVENTS_COUNT }, () => null);
    loadSerializedGame(runtime);

    expect(runtime.playerPartyCount).toBe(2);
    expect(runtime.playerParty[0]).toEqual({ species: 'Bulbasaur' });
    expect(runtime.playerParty[5]).toEqual({ species: 'Mew' });
    expect(runtime.objectEvents[0]).toEqual({ localId: 1 });
    expect(runtime.objectEvents[15]).toEqual({ localId: 16 });

    runtime.playerParty[0] = { species: 'Charmander' };
    savePlayerParty(runtime);
    runtime.playerParty[0] = null;
    loadPlayerParty(runtime);
    expect(runtime.playerParty[0]).toEqual({ species: 'Charmander' });

    runtime.objectEvents[1] = { localId: 2 };
    saveObjectEvents(runtime);
    runtime.objectEvents[1] = null;
    loadObjectEvents(runtime);
    expect(runtime.objectEvents[1]).toEqual({ localId: 2 });
  });

  test('bag load/save copies all pockets and applies bag key backup behavior', () => {
    const runtime = createLoadSaveRuntime();
    runtime.saveBlock1.bagPocketItems[0] = { itemId: 1, quantity: 2 };
    runtime.saveBlock1.bagPocketKeyItems[0] = { itemId: 3, quantity: 1 };
    runtime.saveBlock1.mail[0] = { msg: 'hi' };
    runtime.saveBlock2.encryptionKey = 0xaaaa;

    loadPlayerBag(runtime);
    expect(runtime.loadedSaveData.items[0]).toEqual({ itemId: 1, quantity: 2 });
    expect(runtime.loadedSaveData.keyItems[0]).toEqual({ itemId: 3, quantity: 1 });
    expect(runtime.loadedSaveData.mail[0]).toEqual({ msg: 'hi' });
    expect(runtime.lastEncryptionKey).toBe(0xaaaa);

    runtime.loadedSaveData.items[0] = { itemId: 9, quantity: 9 };
    runtime.saveBlock2.encryptionKey = 0xbbbb;
    savePlayerBag(runtime);
    expect(runtime.saveBlock1.bagPocketItems[0]).toEqual({ itemId: 9, quantity: 9 });
    expect(runtime.saveBlock2.encryptionKey).toBe(0xbbbb);
    expect(runtime.bagItemEncryptionApplied.at(-1)).toBe(0xbbbb);
  });

  test('encryption helpers xor old and new keys exactly', () => {
    const runtime = createLoadSaveRuntime();
    runtime.saveBlock2.encryptionKey = 0x11111111;
    const word = { value: 0x22222222 };
    const hword = { value: 0x3333 };

    applyNewEncryptionKeyToWord(runtime, word, 0x44444444);
    applyNewEncryptionKeyToHword(runtime, hword, 0x55555555);

    expect(word.value).toBe((0x22222222 ^ 0x11111111 ^ 0x44444444) >>> 0);
    expect(hword.value).toBe((0x3333 ^ 0x11111111 ^ 0x55555555) & 0xffff);

    runtime.saveBlock1.money = 0x10;
    runtime.saveBlock1.coins = 0x20;
    applyNewEncryptionKeyToAllEncryptedData(runtime, 0x77777777);
    expect(runtime.gameStatsEncryptionApplied.at(-1)).toBe(0x77777777);
    expect(runtime.berryPowderEncryptionApplied.at(-1)).toBe(0x77777777);
  });
});
