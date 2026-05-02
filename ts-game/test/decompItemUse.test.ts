import { describe, expect, test } from 'vitest';
import { ITEM_ENIGMA_BERRY, POCKET_BERRY_POUCH, POCKET_TM_CASE } from '../src/game/decompItem';
import * as itemUse from '../src/game/decompItemUse';
import {
  BATTLE_TYPE_TRAINER,
  FLAG_SYS_BLACK_FLUTE_ACTIVE,
  FLAG_SYS_ON_CYCLING_ROAD,
  FLAG_SYS_WHITE_FLUTE_ACTIVE,
  FONT_MALE,
  FONT_NORMAL,
  ITEM_AWAKENING,
  ITEM_BLACK_FLUTE,
  ITEM_EFFECT_HEAL_HP,
  ITEM_EFFECT_HEAL_PP,
  ITEM_EFFECT_NONE,
  ITEM_EFFECT_PP_UP,
  ITEM_EFFECT_RAISE_LEVEL,
  ITEM_EFFECT_SACRED_ASH,
  ITEM_EFFECT_X_ITEM,
  ITEM_TYPE_FIELD,
  ITEM_TYPE_PARTY_MENU,
  ITEM_WHITE_FLUTE,
  MAP_GROUP_VIRIDIAN_FOREST,
  MAP_NUM_MT_EMBER_EXTERIOR,
  MAP_TYPE_ROUTE,
  PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_FLAG_UNDERWATER,
  QL_EVENT_USED_ITEM,
  VAR_REPEL_STEP_COUNT,
  battleUseFuncPokeBallEtc,
  battleUseFuncPokeDoll,
  battleUseFuncStatBooster,
  canFish,
  canUseEscapeRopeOnCurrMap,
  checkIfItemIsTMHMOrEvolutionStone,
  createItemUseRuntime,
  createItemUseTask,
  fieldCB2UseItemFromField,
  fieldUseFuncBike,
  fieldUseFuncBlackWhiteFlute,
  fieldUseFuncOakStopsYou,
  fieldUseFuncPokeFlute,
  fieldUseFuncRepel,
  fieldUseFuncRod,
  fieldUseFuncTmCase,
  fieldUseFuncVsSeeker,
  itemUseInBattleEnigmaBerry,
  itemUseOutOfBattleEnigmaBerry,
  itemUseOutOfBattleEscapeRope,
  itemUseSetQuestLogEvent,
  sUnused,
  setFieldCallback2ForItemUse,
  setUpItemUseCallback,
  setUpItemUseOnFieldCallback,
  taskBattleUseStatBoosterDelayAndPrint,
  taskDisplayPokeFluteMessage,
  taskInitTMCaseFromField,
  taskPlayPokeFlute,
  taskUseRepel,
  taskUsedBlackWhiteFlute
} from '../src/game/decompItemUse';
import {
  gText_BoxFull,
  gText_CantDismountBike,
  gText_OakForbidsUseOfItemHere,
  gText_PlayedPokeFlute,
  gText_PlayedPokeFluteCatchy,
  gText_PokeFluteAwakenedMon,
  gText_PlayerUsedVar2,
  gText_RepelEffectsLingered,
  gText_UsedVar2WildLured,
  gText_WontHaveEffect
} from '../src/game/decompStrings';

describe('decomp item_use', () => {
  test('preserves the unused byte table exactly enough to catch drift', () => {
    expect(sUnused).toHaveLength(416);
    expect(sUnused.slice(8, 19)).toEqual([0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x13]);
    expect(sUnused.slice(384, 392)).toEqual([0x00, 0x00, 0x1f, 0x00, 0xe0, 0x03, 0x00, 0x7c]);
    expect(sUnused.at(392)).toBe(0xff);
  });

  test('SetUpItemUseCallback follows item type, Enigma Berry data[4], and Berry Pouch exits', () => {
    const runtime = createItemUseRuntime({
      specialVarItemId: 100,
      itemTypes: { 100: ITEM_TYPE_FIELD },
      itemPockets: { 100: 1 }
    });
    const taskId = createItemUseTask(runtime);

    setUpItemUseCallback(runtime, taskId);
    expect(runtime.itemMenuExitCallback).toBe('CB2_ReturnToField');
    expect(runtime.operations).toContain('Bag_BeginCloseWin0Animation');
    expect(runtime.operations).toContain(`ItemMenu_StartFadeToExitCallback(${taskId})`);

    const berryRuntime = createItemUseRuntime({
      specialVarItemId: ITEM_ENIGMA_BERRY,
      itemPockets: { [ITEM_ENIGMA_BERRY]: POCKET_BERRY_POUCH }
    });
    const berryTaskId = createItemUseTask(berryRuntime, { 4: ITEM_TYPE_PARTY_MENU });
    setUpItemUseCallback(berryRuntime, berryTaskId);
    expect(berryRuntime.berryPouchExitCallback).toBe('CB2_ShowPartyMenuForItemUse');
    expect(berryRuntime.operations).toEqual([`BerryPouch_StartFadeToExitCallback(${berryTaskId})`]);
  });

  test('field setup either defers through gFieldCallback or immediately runs the saved callback', () => {
    const runtime = createItemUseRuntime({
      specialVarItemId: 10,
      itemTypes: { 10: ITEM_TYPE_FIELD },
      itemPockets: { 10: 1 },
      itemUseOnFieldCB: 'ItemUseOnFieldCB_Rod',
      itemSecondaryIds: { 10: 7 }
    });
    const bagTask = createItemUseTask(runtime, { 3: 0 });
    setUpItemUseOnFieldCallback(runtime, bagTask);
    expect(runtime.fieldCallback).toBe('FieldCB_FadeInFromBlack');
    expect(runtime.tasks[bagTask].destroyed).toBe(false);

    const fieldTask = createItemUseTask(runtime, { 3: 1 });
    setUpItemUseOnFieldCallback(runtime, fieldTask);
    expect(runtime.operations.at(-1)).toBe('StartFishing(7)');
    expect(runtime.tasks[fieldTask].destroyed).toBe(true);
  });

  test('TM/HM and evolution stone checker mirrors the C priority', () => {
    const runtime = createItemUseRuntime({
      itemPockets: { 1: POCKET_TM_CASE, 2: 1 },
      itemFieldFuncs: { 1: 'FieldUseFunc_EvoItem', 2: 'FieldUseFunc_EvoItem' }
    });
    expect(checkIfItemIsTMHMOrEvolutionStone(runtime, 1)).toBe(1);
    expect(checkIfItemIsTMHMOrEvolutionStone(runtime, 2)).toBe(2);
    expect(checkIfItemIsTMHMOrEvolutionStone(runtime, 3)).toBe(0);
  });

  test('FieldCB2_UseItemFromField and fade wait task lock then unlock field controls', () => {
    const runtime = createItemUseRuntime({ weatherNotFadingIn: false });
    setFieldCallback2ForItemUse(runtime);
    expect(runtime.fieldCallback2).toBe('FieldCB2_UseItemFromField');
    expect(fieldCB2UseItemFromField(runtime)).toBe(true);
    const waitTaskId = runtime.tasks.length - 1;
    expect(runtime.objectEventsFrozen).toBe(true);
    expect(runtime.fieldControlsLocked).toBe(true);
    expect(runtime.exitStairsMovementDisabled).toBe(false);
    expect(runtime.tasks[waitTaskId].func).toBe('Task_ItemUseWaitForFade');
  });

  test('Bike use rejects cycling road and rail tiles, otherwise toggles bike flags on field', () => {
    const blocked = createItemUseRuntime();
    blocked.flags.add(FLAG_SYS_ON_CYCLING_ROAD);
    const blockedTask = createItemUseTask(blocked, { 3: 1 });
    fieldUseFuncBike(blocked, blockedTask);
    expect(blocked.messages).toEqual([{ where: 'field', taskId: blockedTask, fontId: FONT_NORMAL, text: gText_CantDismountBike, nextFunc: 'Task_ItemUse_CloseMessageBoxAndReturnToField' }]);

    const runtime = createItemUseRuntime();
    const taskId = createItemUseTask(runtime, { 3: 1 });
    fieldUseFuncBike(runtime, taskId);
    expect(runtime.itemUseOnFieldCB).toBe('ItemUseOnFieldCB_Bicycle');
    expect(runtime.operations).toContain('PlaySE(SE_BIKE_BELL)');
    expect(runtime.avatarFlags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)).toBe(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('CanFish follows waterfall, underwater, facing water, surfable collision, and bridge branches', () => {
    const runtime = createItemUseRuntime();
    runtime.metatile.waterfall.add(1);
    runtime.frontTile.behavior = 1;
    expect(canFish(runtime)).toBe(false);

    runtime.frontTile.behavior = 2;
    runtime.avatarFlags = PLAYER_AVATAR_FLAG_UNDERWATER;
    expect(canFish(runtime)).toBe(false);

    runtime.avatarFlags = 0;
    runtime.facingSurfableFishableWater = true;
    expect(canFish(runtime)).toBe(true);

    runtime.facingSurfableFishableWater = false;
    runtime.avatarFlags = PLAYER_AVATAR_FLAG_SURFING;
    runtime.metatile.surfable.add(2);
    runtime.frontTile.collision = 1;
    expect(canFish(runtime)).toBe(false);
    runtime.frontTile.collision = 0;
    expect(canFish(runtime)).toBe(true);

    runtime.metatile.surfable.clear();
    runtime.frontTile.collision = 1;
    runtime.metatile.bridge.add(2);
    expect(canFish(runtime)).toBe(true);
  });

  test('Rod use selects the rod callback only when CanFish succeeds', () => {
    const runtime = createItemUseRuntime({ specialVarItemId: 55, itemSecondaryIds: { 55: 2 }, facingSurfableFishableWater: true });
    const taskId = createItemUseTask(runtime, { 3: 1 });
    fieldUseFuncRod(runtime, taskId);
    expect(runtime.operations.at(-1)).toBe('StartFishing(2)');

    const blocked = createItemUseRuntime();
    const blockedTask = createItemUseTask(blocked, { 3: 0 });
    fieldUseFuncRod(blocked, blockedTask);
    expect(blocked.messages[0].text).toBe(gText_OakForbidsUseOfItemHere);
  });

  test('Poke Flute wakes party members before fanfare completion message, otherwise prints catchy text', () => {
    const runtime = createItemUseRuntime({
      specialVarItemId: 350,
      playerParty: [{ species: 25, itemEffectFailsByItem: { [ITEM_AWAKENING]: false } }]
    });
    const taskId = createItemUseTask(runtime, { 3: 0 });
    fieldUseFuncPokeFlute(runtime, taskId);
    expect(runtime.messages.at(-1)).toMatchObject({ where: 'bag', text: gText_PlayedPokeFlute, nextFunc: 'Task_PlayPokeFlute' });
    expect(runtime.questLogEvents).toEqual([{ eventId: QL_EVENT_USED_ITEM, itemId: 350, itemParam: 0xffff, species: 0xffff }]);

    taskPlayPokeFlute(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_DisplayPokeFluteMessage');
    taskDisplayPokeFluteMessage(runtime, taskId);
    expect(runtime.messages.at(-1)?.text).toBe(gText_PlayedPokeFlute);
    runtime.fanfareDone = true;
    taskDisplayPokeFluteMessage(runtime, taskId);
    expect(runtime.messages.at(-1)?.text).toBe(gText_PokeFluteAwakenedMon);

    const catchy = createItemUseRuntime({ playerParty: [{ itemEffectFailsByItem: { [ITEM_AWAKENING]: true } }] });
    const catchyTask = createItemUseTask(catchy, { 3: 1 });
    fieldUseFuncPokeFlute(catchy, catchyTask);
    expect(catchy.messages).toEqual([{ where: 'field', taskId: catchyTask, fontId: FONT_NORMAL, text: gText_PlayedPokeFluteCatchy, nextFunc: 'Task_ItemUse_CloseMessageBoxAndReturnToField' }]);
  });

  test('Repel waits for sound, sets step var, removes item, and uses expanded item text', () => {
    const runtime = createItemUseRuntime({
      specialVarItemId: 85,
      itemHoldEffectParams: { 85: 100 },
      itemPockets: { 85: 1 },
      itemNames: { 85: 'REPEL' }
    });
    const taskId = createItemUseTask(runtime);
    fieldUseFuncRepel(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_UseRepel');
    expect(runtime.operations).toContain('PlaySE(SE_REPEL)');

    runtime.sePlaying = true;
    taskUseRepel(runtime, taskId);
    expect(runtime.removedItems).toEqual([]);
    runtime.sePlaying = false;
    taskUseRepel(runtime, taskId);
    expect(runtime.vars[VAR_REPEL_STEP_COUNT]).toBe(100);
    expect(runtime.removedItems).toEqual([{ itemId: 85, quantity: 1 }]);
    expect(runtime.gStringVar4).toBe(gText_PlayerUsedVar2.replace('{STR_VAR_2}', 'REPEL'));

    const linger = createItemUseRuntime({ vars: { [VAR_REPEL_STEP_COUNT]: 1 } });
    const lingerTask = createItemUseTask(linger);
    fieldUseFuncRepel(linger, lingerTask);
    expect(linger.messages[0].text).toBe(gText_RepelEffectsLingered);
  });

  test('Black and White Flute set opposing flags and delay for eight frames', () => {
    const runtime = createItemUseRuntime({ specialVarItemId: ITEM_WHITE_FLUTE, itemNames: { [ITEM_WHITE_FLUTE]: 'WHITE FLUTE' } });
    runtime.flags.add(FLAG_SYS_BLACK_FLUTE_ACTIVE);
    const taskId = createItemUseTask(runtime);
    fieldUseFuncBlackWhiteFlute(runtime, taskId);
    expect(runtime.flags.has(FLAG_SYS_WHITE_FLUTE_ACTIVE)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_BLACK_FLUTE_ACTIVE)).toBe(false);
    expect(runtime.gStringVar4).toBe(gText_UsedVar2WildLured.replace('{STR_VAR_2}', 'WHITE FLUTE'));
    for (let i = 0; i < 7; i += 1) taskUsedBlackWhiteFlute(runtime, taskId);
    expect(runtime.messages).toEqual([]);
    taskUsedBlackWhiteFlute(runtime, taskId);
    expect(runtime.operations.at(-1)).toBe('PlaySE(SE_GLASS_FLUTE)');
    expect(runtime.messages.at(-1)?.text).toBe(runtime.gStringVar4);

    const black = createItemUseRuntime({ specialVarItemId: ITEM_BLACK_FLUTE, itemNames: { [ITEM_BLACK_FLUTE]: 'BLACK FLUTE' } });
    fieldUseFuncBlackWhiteFlute(black, createItemUseTask(black));
    expect(black.flags.has(FLAG_SYS_BLACK_FLUTE_ACTIVE)).toBe(true);
  });

  test('Escape Rope checks map permission and then runs its field effect callback', () => {
    const blocked = createItemUseRuntime({ mapHeader: { allowEscaping: false, regionMapSectionId: 9, mapType: MAP_TYPE_ROUTE } });
    const blockedTask = createItemUseTask(blocked, { 3: 1 });
    expect(canUseEscapeRopeOnCurrMap(blocked)).toBe(false);
    itemUseOutOfBattleEscapeRope(blocked, blockedTask);
    expect(blocked.messages[0].fontId).toBe(FONT_MALE);

    const runtime = createItemUseRuntime({
      specialVarItemId: 85,
      mapHeader: { allowEscaping: true, regionMapSectionId: 77, mapType: MAP_TYPE_ROUTE },
      itemNames: { 85: 'ESCAPE ROPE' },
      itemPockets: { 85: 1 }
    });
    const taskId = createItemUseTask(runtime, { 3: 1 });
    itemUseOutOfBattleEscapeRope(runtime, taskId);
    expect(runtime.questLogEvents).toEqual([{ eventId: QL_EVENT_USED_ITEM, itemId: 85, itemParam: 77, species: 0xffff }]);
    expect(runtime.messages.at(-1)?.nextFunc).toBe('Task_UseDigEscapeRopeOnField');
    expect(runtime.removedItems).toEqual([{ itemId: 85, quantity: 1 }]);
  });

  test('field screen-launching items wait for palette fade before initializing from field', () => {
    const runtime = createItemUseRuntime({ paletteFadeActive: true });
    const taskId = createItemUseTask(runtime, { 3: 1 });
    fieldUseFuncTmCase(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_InitTMCaseFromField');
    taskInitTMCaseFromField(runtime, taskId);
    expect(runtime.fieldCallback2).toBeNull();
    runtime.paletteFadeActive = false;
    taskInitTMCaseFromField(runtime, taskId);
    expect(runtime.fieldCallback2).toBe('FieldCB2_UseItemFromField');
    expect(runtime.operations).toContain('InitTMCase(TMCASE_FIELD, CB2_ReturnToField, TRUE)');
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('Vs Seeker rejects invalid map types and explicit forest map list', () => {
    const runtime = createItemUseRuntime({
      mapHeader: { allowEscaping: false, regionMapSectionId: 0, mapType: MAP_TYPE_ROUTE },
      location: { mapGroup: MAP_GROUP_VIRIDIAN_FOREST, mapNum: MAP_NUM_MT_EMBER_EXTERIOR }
    });
    const taskId = createItemUseTask(runtime, { 3: 0 });
    fieldUseFuncVsSeeker(runtime, taskId);
    expect(runtime.messages[0].text).toBe(gText_OakForbidsUseOfItemHere);

    const allowed = createItemUseRuntime({ mapHeader: { allowEscaping: false, regionMapSectionId: 0, mapType: MAP_TYPE_ROUTE } });
    const allowedTask = createItemUseTask(allowed, { 3: 1 });
    fieldUseFuncVsSeeker(allowed, allowedTask);
    expect(allowed.tasks[allowedTask].func).toBe('Task_VsSeeker_0');
  });

  test('battle Pokeball, StatBooster, and Poke Doll branches match storage/trainer gates', () => {
    const storageFull = createItemUseRuntime({ storageFull: true });
    const fullTask = createItemUseTask(storageFull);
    battleUseFuncPokeBallEtc(storageFull, fullTask);
    expect(storageFull.messages[0].text).toBe(gText_BoxFull);

    const stat = createItemUseRuntime({
      specialVarItemId: 88,
      playerParty: [{ itemEffectFailsByItem: { 88: false } }],
      battlerPartyIndexes: [0]
    });
    const statTask = createItemUseTask(stat);
    battleUseFuncStatBooster(stat, statTask);
    expect(stat.tasks[statTask].func).toBe('Task_BattleUse_StatBooster_DelayAndPrint');
    for (let i = 0; i < 8; i += 1) taskBattleUseStatBoosterDelayAndPrint(stat, statTask);
    expect(stat.operations).toContain('PlaySE(SE_USE_ITEM)');
    expect(stat.removedItems).toEqual([{ itemId: 88, quantity: 1 }]);
    expect(stat.messages.at(-1)?.nextFunc).toBe('Task_BattleUse_StatBooster_WaitButton_ReturnToBattle');

    const noEffect = createItemUseRuntime({ specialVarItemId: 88, playerParty: [{ itemEffectFailsByItem: { 88: true } }] });
    const noEffectTask = createItemUseTask(noEffect);
    battleUseFuncStatBooster(noEffect, noEffectTask);
    expect(noEffect.messages[0].text).toBe(gText_WontHaveEffect);

    const trainer = createItemUseRuntime({ battleTypeFlags: BATTLE_TYPE_TRAINER });
    const trainerTask = createItemUseTask(trainer);
    battleUseFuncPokeDoll(trainer, trainerTask);
    expect(trainer.messages[0].text).toBe(gText_OakForbidsUseOfItemHere);
  });

  test('Enigma Berry routing preserves every switch arm category', () => {
    const medicine = createItemUseRuntime({
      specialVarItemId: ITEM_ENIGMA_BERRY,
      itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_HEAL_HP },
      itemPockets: { [ITEM_ENIGMA_BERRY]: 1 }
    });
    const medicineTask = createItemUseTask(medicine);
    itemUseOutOfBattleEnigmaBerry(medicine, medicineTask);
    expect(medicine.tasks[medicineTask].data[4]).toBe(1);
    expect(medicine.itemUseCB).toBe('ItemUseCB_Medicine');

    const sacredAsh = createItemUseRuntime({ specialVarItemId: ITEM_ENIGMA_BERRY, itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_SACRED_ASH } });
    const sacredTask = createItemUseTask(sacredAsh);
    itemUseOutOfBattleEnigmaBerry(sacredAsh, sacredTask);
    expect(sacredAsh.itemUseCB).toBe('ItemUseCB_SacredAsh');

    const rareCandy = createItemUseRuntime({ specialVarItemId: ITEM_ENIGMA_BERRY, itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_RAISE_LEVEL } });
    const rareTask = createItemUseTask(rareCandy);
    itemUseOutOfBattleEnigmaBerry(rareCandy, rareTask);
    expect(rareCandy.itemUseCB).toBe('ItemUseCB_RareCandy');

    const ppUp = createItemUseRuntime({ specialVarItemId: ITEM_ENIGMA_BERRY, itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_PP_UP } });
    const ppUpTask = createItemUseTask(ppUp);
    itemUseOutOfBattleEnigmaBerry(ppUp, ppUpTask);
    expect(ppUp.itemUseCB).toBe('ItemUseCB_PPUp');

    const ether = createItemUseRuntime({ specialVarItemId: ITEM_ENIGMA_BERRY, itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_HEAL_PP } });
    const etherTask = createItemUseTask(ether);
    itemUseOutOfBattleEnigmaBerry(ether, etherTask);
    expect(ether.itemUseCB).toBe('ItemUseCB_TryRestorePP');

    const oak = createItemUseRuntime({ specialVarItemId: ITEM_ENIGMA_BERRY, itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_NONE } });
    const oakTask = createItemUseTask(oak);
    itemUseOutOfBattleEnigmaBerry(oak, oakTask);
    expect(oak.tasks[oakTask].data[4]).toBe(4);
    expect(oak.messages[0].text).toBe(gText_OakForbidsUseOfItemHere);

    const battleStat = createItemUseRuntime({
      specialVarItemId: ITEM_ENIGMA_BERRY,
      itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_X_ITEM },
      playerParty: [{ itemEffectFailsByItem: { [ITEM_ENIGMA_BERRY]: true } }]
    });
    const battleTask = createItemUseTask(battleStat);
    itemUseInBattleEnigmaBerry(battleStat, battleTask);
    expect(battleStat.messages[0].text).toBe(gText_WontHaveEffect);

    const battleEther = createItemUseRuntime({
      specialVarItemId: ITEM_ENIGMA_BERRY,
      itemEffectTypes: { [ITEM_ENIGMA_BERRY]: ITEM_EFFECT_HEAL_PP }
    });
    const battleEtherTask = createItemUseTask(battleEther);
    itemUseInBattleEnigmaBerry(battleEther, battleEtherTask);
    expect(battleEther.itemUseCB).toBe('ItemUseCB_TryRestorePP');
  });

  test('OakStopsYou uses Berry Pouch dialogue and quest log event copies species or 0xffff', () => {
    const runtime = createItemUseRuntime({
      specialVarItemId: 200,
      itemPockets: { 200: POCKET_BERRY_POUCH }
    });
    const taskId = createItemUseTask(runtime);
    fieldUseFuncOakStopsYou(runtime, taskId);
    expect(runtime.messages).toEqual([{ where: 'berryPouch', taskId, fontId: FONT_MALE, text: gText_OakForbidsUseOfItemHere, nextFunc: 'Task_BerryPouch_DestroyDialogueWindowAndRefreshListMenu' }]);

    itemUseSetQuestLogEvent(runtime, 9, { species: 25 }, 200, 3);
    itemUseSetQuestLogEvent(runtime, 9, null, 201, 4);
    expect(runtime.questLogEvents.slice(-2)).toEqual([
      { eventId: 9, itemId: 200, itemParam: 3, species: 25 },
      { eventId: 9, itemId: 201, itemParam: 4, species: 0xffff }
    ]);
  });

  test('exports exact C item_use names as 1:1 entry points', () => {
    const aliases: [unknown, unknown][] = [
      [itemUse.SetUpItemUseCallback, itemUse.setUpItemUseCallback],
      [itemUse.SetUpItemUseOnFieldCallback, itemUse.setUpItemUseOnFieldCallback],
      [itemUse.FieldCB_FadeInFromBlack, itemUse.fieldCBFadeInFromBlack],
      [itemUse.Task_WaitFadeIn_CallItemUseOnFieldCB, itemUse.taskWaitFadeInCallItemUseOnFieldCB],
      [itemUse.DisplayItemMessageInCurrentContext, itemUse.displayItemMessageInCurrentContext],
      [itemUse.PrintNotTheTimeToUseThat, itemUse.printNotTheTimeToUseThat],
      [itemUse.Task_ItemUse_CloseMessageBoxAndReturnToField, itemUse.taskItemUseCloseMessageBoxAndReturnToField],
      [itemUse.CheckIfItemIsTMHMOrEvolutionStone, itemUse.checkIfItemIsTMHMOrEvolutionStone],
      [itemUse.SetFieldCallback2ForItemUse, itemUse.setFieldCallback2ForItemUse],
      [itemUse.FieldCB2_UseItemFromField, itemUse.fieldCB2UseItemFromField],
      [itemUse.Task_ItemUseWaitForFade, itemUse.taskItemUseWaitForFade],
      [itemUse.FieldUseFunc_Mail, itemUse.fieldUseFuncMail],
      [itemUse.CB2_CheckMail, itemUse.cb2CheckMail],
      [itemUse.FieldUseFunc_Bike, itemUse.fieldUseFuncBike],
      [itemUse.ItemUseOnFieldCB_Bicycle, itemUse.itemUseOnFieldCBBicycle],
      [itemUse.FieldUseFunc_Rod, itemUse.fieldUseFuncRod],
      [itemUse.CanFish, itemUse.canFish],
      [itemUse.ItemUseOnFieldCB_Rod, itemUse.itemUseOnFieldCBRod],
      [itemUse.ItemUseOutOfBattle_Itemfinder, itemUse.itemUseOutOfBattleItemfinder],
      [itemUse.FieldUseFunc_CoinCase, itemUse.fieldUseFuncCoinCase],
      [itemUse.FieldUseFunc_PowderJar, itemUse.fieldUseFuncPowderJar],
      [itemUse.FieldUseFunc_PokeFlute, itemUse.fieldUseFuncPokeFlute],
      [itemUse.Task_PlayPokeFlute, itemUse.taskPlayPokeFlute],
      [itemUse.Task_DisplayPokeFluteMessage, itemUse.taskDisplayPokeFluteMessage],
      [itemUse.FieldUseFunc_Medicine, itemUse.fieldUseFuncMedicine],
      [itemUse.FieldUseFunc_Ether, itemUse.fieldUseFuncEther],
      [itemUse.FieldUseFunc_PpUp, itemUse.fieldUseFuncPpUp],
      [itemUse.FieldUseFunc_RareCandy, itemUse.fieldUseFuncRareCandy],
      [itemUse.FieldUseFunc_EvoItem, itemUse.fieldUseFuncEvoItem],
      [itemUse.FieldUseFunc_SacredAsh, itemUse.fieldUseFuncSacredAsh],
      [itemUse.FieldUseFunc_TmCase, itemUse.fieldUseFuncTmCase],
      [itemUse.InitTMCaseFromBag, itemUse.initTMCaseFromBag],
      [itemUse.Task_InitTMCaseFromField, itemUse.taskInitTMCaseFromField],
      [itemUse.FieldUseFunc_BerryPouch, itemUse.fieldUseFuncBerryPouch],
      [itemUse.InitBerryPouchFromBag, itemUse.initBerryPouchFromBag],
      [itemUse.Task_InitBerryPouchFromField, itemUse.taskInitBerryPouchFromField],
      [itemUse.BattleUseFunc_BerryPouch, itemUse.battleUseFuncBerryPouch],
      [itemUse.InitBerryPouchFromBattle, itemUse.initBerryPouchFromBattle],
      [itemUse.FieldUseFunc_TeachyTv, itemUse.fieldUseFuncTeachyTv],
      [itemUse.InitTeachyTvFromBag, itemUse.initTeachyTvFromBag],
      [itemUse.Task_InitTeachyTvFromField, itemUse.taskInitTeachyTvFromField],
      [itemUse.FieldUseFunc_Repel, itemUse.fieldUseFuncRepel],
      [itemUse.Task_UseRepel, itemUse.taskUseRepel],
      [itemUse.RemoveUsedItem, itemUse.removeUsedItem],
      [itemUse.FieldUseFunc_BlackWhiteFlute, itemUse.fieldUseFuncBlackWhiteFlute],
      [itemUse.Task_UsedBlackWhiteFlute, itemUse.taskUsedBlackWhiteFlute],
      [itemUse.CanUseEscapeRopeOnCurrMap, itemUse.canUseEscapeRopeOnCurrMap],
      [itemUse.ItemUseOutOfBattle_EscapeRope, itemUse.itemUseOutOfBattleEscapeRope],
      [itemUse.ItemUseOnFieldCB_EscapeRope, itemUse.itemUseOnFieldCBEscapeRope],
      [itemUse.Task_UseDigEscapeRopeOnField, itemUse.taskUseDigEscapeRopeOnField],
      [itemUse.FieldUseFunc_TownMap, itemUse.fieldUseFuncTownMap],
      [itemUse.UseTownMapFromBag, itemUse.useTownMapFromBag],
      [itemUse.Task_UseTownMapFromField, itemUse.taskUseTownMapFromField],
      [itemUse.FieldUseFunc_FameChecker, itemUse.fieldUseFuncFameChecker],
      [itemUse.UseFameCheckerFromBag, itemUse.useFameCheckerFromBag],
      [itemUse.Task_UseFameCheckerFromField, itemUse.taskUseFameCheckerFromField],
      [itemUse.FieldUseFunc_VsSeeker, itemUse.fieldUseFuncVsSeeker],
      [itemUse.Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker, itemUse.taskItemUseCloseMessageBoxAndReturnToFieldVsSeeker],
      [itemUse.BattleUseFunc_PokeBallEtc, itemUse.battleUseFuncPokeBallEtc],
      [itemUse.BattleUseFunc_PokeFlute, itemUse.battleUseFuncPokeFlute],
      [itemUse.BattleUseFunc_StatBooster, itemUse.battleUseFuncStatBooster],
      [itemUse.Task_BattleUse_StatBooster_DelayAndPrint, itemUse.taskBattleUseStatBoosterDelayAndPrint],
      [itemUse.Task_BattleUse_StatBooster_WaitButton_ReturnToBattle, itemUse.taskBattleUseStatBoosterWaitButtonReturnToBattle],
      [itemUse.BattleUseFunc_Medicine, itemUse.battleUseFuncMedicine],
      [itemUse.BattleUseFunc_SacredAsh, itemUse.battleUseFuncSacredAsh],
      [itemUse.BattleUseFunc_Ether, itemUse.battleUseFuncEther],
      [itemUse.BattleUseFunc_PokeDoll, itemUse.battleUseFuncPokeDoll],
      [itemUse.ItemUseOutOfBattle_EnigmaBerry, itemUse.itemUseOutOfBattleEnigmaBerry],
      [itemUse.ItemUseInBattle_EnigmaBerry, itemUse.itemUseInBattleEnigmaBerry],
      [itemUse.FieldUseFunc_OakStopsYou, itemUse.fieldUseFuncOakStopsYou],
      [itemUse.ItemUse_SetQuestLogEvent, itemUse.itemUseSetQuestLogEvent]
    ];

    for (const [exactName, lowerCamel] of aliases) {
      expect(exactName).toBe(lowerCamel);
    }

    const setup = createItemUseRuntime({ specialVarItemId: 44, itemTypes: { 44: ITEM_TYPE_FIELD } });
    const setupTask = createItemUseTask(setup);
    itemUse.DoSetUpItemUseCallback(setup, setupTask);
    expect(setup.itemMenuExitCallback).toBe('CB2_ReturnToField');

    const battle = createItemUseRuntime({ specialVarItemId: 45 });
    const battleTask = createItemUseTask(battle);
    itemUse.ItemUse_SwitchToPartyMenuInBattle(battle, battleTask);
    expect(battle.itemMenuExitCallback).toBe('EnterPartyFromItemMenuInBattle');
  });
});
