import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { A_BUTTON, B_BUTTON, DPAD_DOWN } from '../src/game/decompMenu';
import {
  CloseMuseumFossilPic,
  CreatePCMenu,
  DrawSeagallopDestinationMenu,
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_NOT_SOMEONES_PC,
  FLAG_SYS_POKEDEX_GET,
  FOSSIL_PIC_PAL_NUM,
  GFXTAG_FOSSIL,
  IsScriptActive,
  GetMCWindowHeight,
  GetSelectedSeagallopDestination,
  MULTICHOICE_CONSTANTS,
  OpenMuseumFossilPic,
  PicboxCancel,
  QL_DestroyAbortedDisplay,
  SCR_MENU_CANCEL,
  SCR_MENU_UNSET,
  SCRIPT_MENU_C_TRANSLATION_UNIT,
  SEAGALLOP_FIVE_ISLAND,
  SEAGALLOP_FOUR_ISLAND,
  SEAGALLOP_MORE,
  SEAGALLOP_SEVEN_ISLAND,
  SEAGALLOP_SIX_ISLAND,
  SEAGALLOP_VERMILION_CITY,
  SPECIES_AERODACTYL,
  SPECIES_KABUTOPS,
  STDSTRING_CONSTANTS,
  ScriptMenu_HidePokemonPic,
  ScriptMenu_Multichoice,
  ScriptMenu_MultichoiceGrid,
  ScriptMenu_MultichoiceWithDefault,
  ScriptMenu_ShowPokemonPic,
  ScriptMenu_YesNo,
  createScriptMenuRuntime,
  gStdStringPtrs,
  sMultichoiceLists,
  tickScriptMenuTask
} from '../src/game/decompScriptMenu';

const repoRoot = resolve(__dirname, '../..');
const scriptMenuC = readFileSync(resolve(repoRoot, 'src/script_menu.c'), 'utf8');

describe('decomp script_menu', () => {
  test('exports exact script_menu.c unused active predicate', () => {
    expect(SCRIPT_MENU_C_TRANSLATION_UNIT).toBe('src/script_menu.c');
    const runtime = createScriptMenuRuntime();
    expect(IsScriptActive(runtime)).toBe(false);
    runtime.gSpecialVar_Result = SCR_MENU_CANCEL;
    expect(IsScriptActive(runtime)).toBe(true);
    runtime.gSpecialVar_Result = SCR_MENU_UNSET;
    expect(IsScriptActive(runtime)).toBe(false);
  });

  test('parses every multichoice table entry and preserves FireRed/default source branches', () => {
    const tableEntryCount = [...scriptMenuC.matchAll(/\[(MULTICHOICE_[A-Z0-9_]+)\]\s*=\s*MULTICHOICE\(/gu)].length;
    expect(sMultichoiceLists).toHaveLength(tableEntryCount);
    expect(sMultichoiceLists.map((entry) => entry.id)).toEqual([...sMultichoiceLists.map((entry) => entry.id)].sort((a, b) => a - b));

    expect(sMultichoiceLists[MULTICHOICE_CONSTANTS.MULTICHOICE_YES_NO]).toMatchObject({
      constant: 'MULTICHOICE_YES_NO',
      listSymbol: 'sMultichoiceList_YesNo',
      count: 2
    });
    expect(sMultichoiceLists[MULTICHOICE_CONSTANTS.MULTICHOICE_YES_NO].items.map((item) => item.text)).toEqual(['gText_Yes', 'gText_No']);
    expect(sMultichoiceLists[MULTICHOICE_CONSTANTS.MULTICHOICE_GAME_CORNER_POKEMON_PRIZES].items.map((item) => item.text)).toEqual([
      'gText_Abra_180Coins',
      'gText_Clefairy_500Coins',
      'gText_Dratini_2800Coins',
      'gText_Scyther_5500Coins',
      'gText_Porygon_9999Coins',
      'gText_NoThanks_2'
    ]);
    expect(sMultichoiceLists[MULTICHOICE_CONSTANTS.MULTICHOICE_LINK_WIRELESS].items.map((item) => item.text)).toEqual([
      'gText_GameLinkCable',
      'gText_Wireless',
      'gOtherText_Exit'
    ]);
  });

  test('preserves std string pointer constants from gStdStringPtrs', () => {
    expect(gStdStringPtrs.size).toBe(29);
    expect(gStdStringPtrs.get(STDSTRING_CONSTANTS.STDSTRING_ITEMS)).toBe('gText_Items');
    expect(gStdStringPtrs.get(STDSTRING_CONSTANTS.STDSTRING_TM_CASE)).toBe('gText_TmCase');
    expect(gStdStringPtrs.get(STDSTRING_CONSTANTS.STDSTRING_BERRY_POUCH)).toBe('gText_BerryPouch_2');
  });

  test('keeps GetMCWindowHeight switch return values exactly as script_menu.c', () => {
    expect(Array.from({ length: 10 }, (_, count) => GetMCWindowHeight(count))).toEqual([1, 2, 4, 6, 7, 9, 11, 13, 14, 1]);
  });

  test('creates vertical multichoice tasks, clamps width, applies defaults, and finalizes A/B input like C', () => {
    const runtime = createScriptMenuRuntime();
    expect(ScriptMenu_MultichoiceWithDefault(runtime, 27, 4, MULTICHOICE_CONSTANTS.MULTICHOICE_BIKE_SHOP, 0, 1)).toBe(true);
    expect(ScriptMenu_Multichoice(runtime, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_YES_NO, 0)).toBe(false);
    expect(runtime.gSpecialVar_Result).toBe(SCR_MENU_UNSET);
    expect(runtime.windows[0]).toMatchObject({ top: 4, height: 4 });
    expect(runtime.windows[0].left + runtime.windows[0].width).toBeLessThanOrEqual(28);

    runtime.menu.newKeys = A_BUTTON;
    tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(1);
    expect(runtime.windows[0].removed).toBe(true);
    expect(runtime.scriptContextEnabled).toBe(true);

    const cancel = createScriptMenuRuntime();
    ScriptMenu_Multichoice(cancel, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_YES_NO, 0);
    cancel.menu.newKeys = B_BUTTON;
    tickScriptMenuTask(cancel, 0);
    expect(cancel.gSpecialVar_Result).toBe(SCR_MENU_CANCEL);

    const ignored = createScriptMenuRuntime();
    ScriptMenu_Multichoice(ignored, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_YES_NO, 1);
    ignored.menu.newKeys = B_BUTTON;
    tickScriptMenuTask(ignored, 0);
    expect(ignored.gSpecialVar_Result).toBe(SCR_MENU_UNSET);
    expect(ignored.tasks[0].destroyed).toBe(false);
  });

  test('delays cable club multichoice input and refreshes help descriptions on d-pad movement', () => {
    const runtime = createScriptMenuRuntime();
    ScriptMenu_Multichoice(runtime, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_CENTER_COLOSSEUM, 0);
    expect(runtime.sDelay).toBe(12);
    expect(runtime.operations).toContain('AddTextPrinterParameterized2:0:CableClub_Text_TradeMonsUsingLinkCable');

    runtime.menu.newKeys = A_BUTTON;
    for (let i = 0; i < 12; i += 1) tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(SCR_MENU_UNSET);
    tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(0);

    const moved = createScriptMenuRuntime();
    ScriptMenu_Multichoice(moved, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_COLOSSEUM_CRUSH, 0);
    moved.sDelay = 0;
    moved.menu.newKeys = DPAD_DOWN;
    tickScriptMenuTask(moved, 0);
    expect(moved.operations).toContain('AddTextPrinterParameterized2:0:CableClub_Text_YouMayBattleHere');
  });

  test('handles yes/no after the five-frame timer gate', () => {
    const runtime = createScriptMenuRuntime();
    expect(ScriptMenu_YesNo(runtime, 0, 0)).toBe(true);
    runtime.menu.newKeys = B_BUTTON;
    for (let i = 0; i < 5; i += 1) tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(SCR_MENU_UNSET);
    tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(0);
    expect(runtime.tasks[0].destroyed).toBe(true);

    const avoided = createScriptMenuRuntime();
    avoided.questLogAvoidDisplay = true;
    expect(ScriptMenu_YesNo(avoided, 0, 0)).toBe(true);
    expect(avoided.tasks).toHaveLength(0);
  });

  test('creates grid multichoice windows and honors B cancel rules', () => {
    const runtime = createScriptMenuRuntime();
    expect(ScriptMenu_MultichoiceGrid(runtime, 3, 5, MULTICHOICE_CONSTANTS.MULTICHOICE_TRAINER_CARD_ICON_TINT, 0, 2)).toBe(true);
    expect(runtime.windows[0]).toMatchObject({ left: 3, top: 5, height: 4 });
    runtime.menu.newKeys = B_BUTTON;
    tickScriptMenuTask(runtime, 0);
    expect(runtime.gSpecialVar_Result).toBe(SCR_MENU_CANCEL);

    const ignored = createScriptMenuRuntime();
    ScriptMenu_MultichoiceGrid(ignored, 0, 0, MULTICHOICE_CONSTANTS.MULTICHOICE_TRAINER_CARD_ICON_TINT, 1, 2);
    ignored.menu.newKeys = B_BUTTON;
    tickScriptMenuTask(ignored, 0);
    expect(ignored.gSpecialVar_Result).toBe(SCR_MENU_UNSET);
  });

  test('builds PC menus with the same flag-controlled item counts and labels', () => {
    const runtime = createScriptMenuRuntime();
    runtime.flags.add(FLAG_SYS_POKEDEX_GET);
    runtime.flags.add(FLAG_SYS_GAME_CLEAR);
    runtime.flags.add(FLAG_SYS_NOT_SOMEONES_PC);
    runtime.playerName = 'RED';

    expect(CreatePCMenu(runtime)).toBe(true);
    expect(runtime.windows[0]).toMatchObject({ left: 0, top: 0, width: 14, height: 10 });
    expect(runtime.operations).toContain('AddTextPrinterParameterized:0:2:gText_BillSPc:8:2:255:NULL');
    expect(runtime.operations).toContain('AddTextPrinterParameterized:0:2:gText_HallOfFame_2:8:50:255:NULL');
    expect(runtime.operations).toContain('AddTextPrinterParameterized:0:2:StringExpandPlaceholders:RED:gText_SPc:8:18:255:NULL');

    const noDex = createScriptMenuRuntime();
    CreatePCMenu(noDex);
    expect(noDex.windows[0]).toMatchObject({ width: 14, height: 6 });
    expect(noDex.operations).toContain('AddTextPrinterParameterized:0:2:gText_SomeoneSPc:8:2:255:NULL');
  });

  test('ports pokemon picbox task states, hide wait callback, and cancel cleanup', () => {
    const runtime = createScriptMenuRuntime();
    expect(ScriptMenu_ShowPokemonPic(runtime, 25, 2, 3)).toBe(true);
    expect(ScriptMenu_ShowPokemonPic(runtime, 26, 2, 3)).toBe(false);
    expect(runtime.sprites[0]).toMatchObject({ kind: 'mon', species: 25, x: 56, y: 64, priority: 0 });
    tickScriptMenuTask(runtime, 0);
    const wait = ScriptMenu_HidePokemonPic(runtime);
    expect(wait?.()).toBe(false);
    tickScriptMenuTask(runtime, 0);
    expect(runtime.sprites[0].destroyed).toBe(true);
    tickScriptMenuTask(runtime, 0);
    expect(wait?.()).toBe(true);

    const canceled = createScriptMenuRuntime();
    ScriptMenu_ShowPokemonPic(canceled, 1, 0, 0);
    PicboxCancel(canceled);
    expect(canceled.sprites[0].destroyed).toBe(true);
    expect(canceled.tasks[0].destroyed).toBe(true);
  });

  test('ports museum fossil picture open, close, task cleanup, and quest-log abort behavior', () => {
    const runtime = createScriptMenuRuntime();
    runtime.gSpecialVar_0x8004 = SPECIES_KABUTOPS;
    runtime.gSpecialVar_0x8005 = 4;
    runtime.gSpecialVar_0x8006 = 5;

    expect(OpenMuseumFossilPic(runtime)).toBe(true);
    expect(OpenMuseumFossilPic(runtime)).toBe(false);
    expect(runtime.loadedFossilSheet).toBe('kabutops');
    expect(runtime.sprites[0]).toMatchObject({ kind: 'fossil', species: SPECIES_KABUTOPS, x: 72, y: 80, paletteNum: FOSSIL_PIC_PAL_NUM });
    tickScriptMenuTask(runtime, 0);
    expect(CloseMuseumFossilPic(runtime)).toBe(true);
    tickScriptMenuTask(runtime, 0);
    expect(runtime.sprites[0].destroyed).toBe(true);
    expect(runtime.operations).toContain(`FreeSpriteTilesByTag:${GFXTAG_FOSSIL}`);
    tickScriptMenuTask(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(true);

    const invalid = createScriptMenuRuntime();
    invalid.gSpecialVar_0x8004 = SPECIES_AERODACTYL + 1;
    expect(OpenMuseumFossilPic(invalid)).toBe(false);

    const aborted = createScriptMenuRuntime();
    aborted.gSpecialVar_0x8004 = SPECIES_AERODACTYL;
    OpenMuseumFossilPic(aborted);
    QL_DestroyAbortedDisplay(aborted);
    expect(aborted.scriptContextScript).toBe('EventScript_ReleaseEnd');
    expect(aborted.sprites[0].destroyed).toBe(true);
  });

  test('draws Seagallop menus and maps selected rows exactly like script_menu.c', () => {
    const firstPage = createScriptMenuRuntime();
    firstPage.gSpecialVar_0x8004 = SEAGALLOP_VERMILION_CITY;
    firstPage.gSpecialVar_0x8005 = 0;
    DrawSeagallopDestinationMenu(firstPage);
    expect(firstPage.windows[0]).toMatchObject({ left: 17, top: 0, width: 11, height: 12 });
    expect(firstPage.operations).toContain('AddTextPrinterParameterized:0:2:gText_OneIsland:8:2:255:NULL');
    firstPage.gSpecialVar_Result = 4;
    expect(GetSelectedSeagallopDestination(firstPage)).toBe(SEAGALLOP_MORE);
    firstPage.gSpecialVar_Result = 5;
    expect(GetSelectedSeagallopDestination(firstPage)).toBe(SCR_MENU_CANCEL);

    const secondPage = createScriptMenuRuntime();
    secondPage.gSpecialVar_0x8004 = SEAGALLOP_FIVE_ISLAND;
    secondPage.gSpecialVar_0x8005 = 1;
    DrawSeagallopDestinationMenu(secondPage);
    expect(secondPage.windows[0]).toMatchObject({ left: 17, top: 2, width: 11, height: 10 });
    expect(secondPage.operations).toContain('AddTextPrinterParameterized:0:2:gText_FourIsland:8:2:255:NULL');
    secondPage.gSpecialVar_Result = 0;
    expect(GetSelectedSeagallopDestination(secondPage)).toBe(SEAGALLOP_FOUR_ISLAND);
    secondPage.gSpecialVar_Result = 1;
    expect(GetSelectedSeagallopDestination(secondPage)).toBe(SEAGALLOP_SIX_ISLAND);
    secondPage.gSpecialVar_Result = 2;
    expect(GetSelectedSeagallopDestination(secondPage)).toBe(SEAGALLOP_SEVEN_ISLAND);
    secondPage.gSpecialVar_Result = 3;
    expect(GetSelectedSeagallopDestination(secondPage)).toBe(SEAGALLOP_MORE);
  });
});
