import { describe, expect, test } from 'vitest';
import {
  FailSweetScentEncounter,
  FieldCallback_SweetScent,
  FldEff_SweetScent,
  SetUpFieldMove_SweetScent,
  StartSweetScentFieldEffect,
  TrySweetScentEncounter,
  Unused_StartSweetscentFldeff,
  doFieldEffectSweetScent,
  failSweetScentEncounter,
  fieldCallbackSweetScent,
  fldEffSweetScent,
  setUpFieldMoveSweetScent,
  startSweetScentFieldEffect,
  trySweetScentEncounter
} from '../src/game/decompFldEffSweetScent';
import { createScriptRuntimeState } from '../src/game/scripts';
import type { FieldScriptSessionState } from '../src/game/decompFieldDialogue';

const createSession = (): FieldScriptSessionState => ({
  rootScriptId: 'EventScript_Test',
  currentLabel: 'EventScript_Test',
  lineIndex: 0,
  lastTrainerId: null,
  hiddenItemFlag: null,
  loadedPointerTextLabel: null,
  callStack: [],
  waitingFor: null,
  movingLocalId: 0,
  waitingMovementLocalId: null,
  suspendedChoice: null,
  specialState: null,
  messageBoxFrame: 'std',
  messageBoxAutoScroll: false
});

describe('decompFldEffSweetScent', () => {
  test('SetUpFieldMove_SweetScent always installs the menu fade and callback', () => {
    expect(setUpFieldMoveSweetScent()).toEqual({
      ok: true,
      fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
      postMenuFieldCallback: 'FieldCallback_SweetScent'
    });
  });

  test('FieldCallback_SweetScent starts the field effect and stores selected mon id', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.cursorSelectionMonId = 4;

    fieldCallbackSweetScent(runtime);

    expect(runtime.stringVars.activeFieldEffect).toBe('FLDEFF_SWEET_SCENT');
    expect(runtime.vars.fieldEffectArgument_0).toBe(4);
  });

  test('FldEff_SweetScent and StartSweetScentFieldEffect preserve task setup', () => {
    const runtime = createScriptRuntimeState();

    expect(fldEffSweetScent(runtime)).toBe(false);
    expect(runtime.vars.weatherScreenFadeOutSet).toBe(1);
    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.stringVars.fieldEffectDataFunc).toBe('StartSweetScentFieldEffect');

    runtime.stringVars.activeFieldEffect = 'FLDEFF_SWEET_SCENT';
    const task = startSweetScentFieldEffect(runtime);

    expect(runtime.stringVars.lastPlayedSE).toBe('SE_M_SWEET_SCENT');
    expect(runtime.vars.sweetScentPaletteBackupAllocated).toBe(1);
    expect(runtime.vars.sweetScentPaletteFadeStarted).toBe(1);
    expect(runtime.stringVars.activeFieldEffect).toBe('');
    expect(task).toEqual({ data0: 0, func: 'TrySweetScentEncounter', destroyed: false });
  });

  test('TrySweetScentEncounter waits 64 ticks, then destroys or switches to failure task', () => {
    const runtime = createScriptRuntimeState();
    const task = startSweetScentFieldEffect(runtime);

    trySweetScentEncounter(runtime, task, true, () => {
      throw new Error('should not encounter during active fade');
    });
    expect(task.data0).toBe(0);

    for (let i = 0; i < 64; i += 1) {
      trySweetScentEncounter(runtime, task, false, () => false);
    }
    expect(task.data0).toBe(64);

    trySweetScentEncounter(runtime, task, false, () => false);
    expect(task.data0).toBe(0);
    expect(task.func).toBe('FailSweetScentEncounter');
    expect(runtime.vars.sweetScentPaletteFadeRestoreStarted).toBe(1);

    const successTask = startSweetScentFieldEffect(runtime);
    successTask.data0 = 64;
    trySweetScentEncounter(runtime, successTask, false, () => true);
    expect(successTask.destroyed).toBe(true);
    expect(runtime.vars.sweetScentPaletteBackupAllocated).toBe(0);
  });

  test('FailSweetScentEncounter restores weather/palette and starts EventScript_FailSweetScent', () => {
    const runtime = createScriptRuntimeState();
    const task = startSweetScentFieldEffect(runtime);

    failSweetScentEncounter(runtime, task, true);
    expect(task.destroyed).toBe(false);

    failSweetScentEncounter(runtime, task, false);
    expect(runtime.vars.sweetScentPaletteRestored).toBe(1);
    expect(runtime.vars.weatherProcessingIdle).toBe(1);
    expect(runtime.vars.sweetScentPaletteBackupAllocated).toBe(0);
    expect(runtime.stringVars.scriptContextSetupScript).toBe('EventScript_FailSweetScent');
    expect(task.destroyed).toBe(true);
  });

  test('dofieldeffect FLDEFF_SWEET_SCENT opens the field-effect wait state', () => {
    const runtime = createScriptRuntimeState();
    const session = createSession();

    doFieldEffectSweetScent(runtime, session);

    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.vars.sweetScentPaletteFadeStarted).toBe(1);
    expect(session.specialState).toEqual({ kind: 'sweetScentFieldEffect' });
  });

  test('exact C-name Sweet Scent entry points preserve callback and task flow', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.cursorSelectionMonId = 5;

    expect(SetUpFieldMove_SweetScent()).toEqual(setUpFieldMoveSweetScent());
    FieldCallback_SweetScent(runtime);
    expect(runtime.stringVars.activeFieldEffect).toBe('FLDEFF_SWEET_SCENT');
    expect(runtime.vars.fieldEffectArgument_0).toBe(5);

    runtime.vars.cursorSelectionMonId = 2;
    Unused_StartSweetscentFldeff(runtime);
    expect(runtime.vars.partyMenuSlotId).toBe(0);
    expect(runtime.vars.fieldEffectArgument_0).toBe(2);

    expect(FldEff_SweetScent(runtime)).toBe(false);
    expect(runtime.stringVars.fieldEffectDataFunc).toBe('StartSweetScentFieldEffect');

    const task = StartSweetScentFieldEffect(runtime);
    for (let i = 0; i < 65; i += 1) TrySweetScentEncounter(runtime, task, false, () => false);
    expect(task).toMatchObject({ data0: 0, func: 'FailSweetScentEncounter', destroyed: false });
    FailSweetScentEncounter(runtime, task, false);
    expect(runtime.stringVars.scriptContextSetupScript).toBe('EventScript_FailSweetScent');
    expect(task.destroyed).toBe(true);
  });
});
