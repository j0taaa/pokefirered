import { describe, expect, test } from 'vitest';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';
import {
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_NOT_SOMEONES_PC,
  HallOfFamePCBeginFade,
  ReshowPCMenuAfterHallOfFamePC,
  ReturnFromHallOfFamePC,
  Task_WaitFadeAndSetCallback,
  Task_WaitForPaletteFade,
  createHofPcRuntime,
  getBedroomPcMenuOptions,
  getCenterPcMenuOptions,
  getHallOfFamePcPages
} from '../src/game/decompHofPc';

describe('decompHofPc', () => {
  test('builds the center PC menu like FireRed script_menu.c branches', () => {
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'RED';

    expect(getCenterPcMenuOptions(runtime)).toEqual([
      "SOMEONE'S PC",
      "RED'S PC",
      "PROF. OAK'S PC",
      'LOG OFF'
    ]);

    setScriptFlag(runtime, FLAG_SYS_NOT_SOMEONES_PC);
    setScriptFlag(runtime, FLAG_SYS_GAME_CLEAR);

    expect(getCenterPcMenuOptions(runtime)).toEqual([
      "BILL'S PC",
      "RED'S PC",
      "PROF. OAK'S PC",
      'HALL OF FAME',
      'LOG OFF'
    ]);
  });

  test('exposes the bedroom PC top menu and HOF viewer stub pages', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.hofDebutHours = 1;
    runtime.vars.hofDebutMinutes = 2;
    runtime.vars.hofDebutSeconds = 3;

    expect(getBedroomPcMenuOptions()).toEqual(['ITEM STORAGE', 'MAILBOX', 'TURN OFF']);
    expect(getHallOfFamePcPages(runtime)).toEqual([
      'Welcome to the HALL OF FAME!',
      'HALL OF FAME DEBUT\n001:02:03',
      'Hall of Fame record viewer stub.'
    ]);
  });

  test('ports hof_pc.c fade callbacks and task cleanup exactly', () => {
    const runtime = createHofPcRuntime();

    HallOfFamePCBeginFade(runtime);
    expect(runtime.paletteFades).toEqual([{ start: 0, end: 0x10, color: 'RGB_BLACK' }]);
    expect(runtime.playerFieldControlsLocked).toBe(true);
    expect(runtime.tasks.get(0)).toEqual({ callback: 'Task_WaitFadeAndSetCallback', priority: 0 });

    Task_WaitFadeAndSetCallback(runtime, 0);
    expect(runtime.tasks.has(0)).toBe(true);
    runtime.paletteFadeActive = false;
    Task_WaitFadeAndSetCallback(runtime, 0);
    expect(runtime.windowBuffersFreed).toBe(true);
    expect(runtime.dma3BusyFlagsReset).toBe(true);
    expect(runtime.tasks.has(0)).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_InitHofPC');

    ReturnFromHallOfFamePC(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');
    expect(runtime.fieldCallback).toBe('ReshowPCMenuAfterHallOfFamePC');

    ReshowPCMenuAfterHallOfFamePC(runtime);
    expect(runtime.specialMapMusicPlayed).toBe(true);
    expect(runtime.pcMenuCreated).toBe(true);
    expect(runtime.pcStartupPromptDisplayed).toBe(true);
    expect(runtime.paletteFades.at(-1)).toEqual({ start: 0x10, end: 0, color: 'RGB_BLACK' });
    expect(runtime.tasks.get(1)).toEqual({ callback: 'Task_WaitForPaletteFade', priority: 10 });

    Task_WaitForPaletteFade(runtime, 1);
    expect(runtime.tasks.has(1)).toBe(true);
    runtime.paletteFadeActive = false;
    Task_WaitForPaletteFade(runtime, 1);
    expect(runtime.tasks.has(1)).toBe(false);
  });
});
