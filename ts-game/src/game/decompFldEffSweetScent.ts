import type { FieldScriptSessionState } from './decompFieldDialogue';

export interface SweetScentRuntimeState {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
}

export interface SweetScentSetup {
  ok: true;
  fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu';
  postMenuFieldCallback: 'FieldCallback_SweetScent';
}

export interface SweetScentTaskState {
  data0: number;
  func: 'TrySweetScentEncounter' | 'FailSweetScentEncounter';
  destroyed: boolean;
}

export const setUpFieldMoveSweetScent = (): SweetScentSetup => ({
  ok: true,
  fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
  postMenuFieldCallback: 'FieldCallback_SweetScent'
});

export function Unused_StartSweetscentFldeff(runtime: SweetScentRuntimeState): void {
  runtime.vars.partyMenuSlotId = 0;
  FieldCallback_SweetScent(runtime);
}

export function SetUpFieldMove_SweetScent(): SweetScentSetup {
  return setUpFieldMoveSweetScent();
}

export const fieldCallbackSweetScent = (runtime: SweetScentRuntimeState): void => {
  runtime.stringVars.activeFieldEffect = 'FLDEFF_SWEET_SCENT';
  runtime.vars.fieldEffectArgument_0 = Math.trunc(runtime.vars.cursorSelectionMonId ?? runtime.vars.fieldEffectArgument_0 ?? 0);
};

export function FieldCallback_SweetScent(runtime: SweetScentRuntimeState): void {
  fieldCallbackSweetScent(runtime);
}

export const fldEffSweetScent = (runtime: SweetScentRuntimeState): false => {
  runtime.vars.weatherScreenFadeOutSet = 1;
  runtime.vars.fieldEffectShowMonTaskCreated = 1;
  runtime.stringVars.fieldEffectDataFunc = 'StartSweetScentFieldEffect';
  return false;
};

export function FldEff_SweetScent(runtime: SweetScentRuntimeState): false {
  return fldEffSweetScent(runtime);
}

export const startSweetScentFieldEffect = (runtime: SweetScentRuntimeState): SweetScentTaskState => {
  runtime.stringVars.lastPlayedSE = 'SE_M_SWEET_SCENT';
  runtime.vars.sweetScentPaletteBackupAllocated = 1;
  runtime.vars.sweetScentPaletteFadeStarted = 1;
  runtime.stringVars.activeFieldEffect = '';
  return {
    data0: 0,
    func: 'TrySweetScentEncounter',
    destroyed: false
  };
};

export function StartSweetScentFieldEffect(runtime: SweetScentRuntimeState): SweetScentTaskState {
  return startSweetScentFieldEffect(runtime);
}

export const trySweetScentEncounter = (
  runtime: SweetScentRuntimeState,
  task: SweetScentTaskState,
  paletteFadeActive: boolean,
  sweetScentWildEncounter: () => boolean
): void => {
  if (paletteFadeActive) {
    return;
  }

  if (task.data0 === 64) {
    task.data0 = 0;
    if (sweetScentWildEncounter()) {
      runtime.vars.sweetScentPaletteBackupAllocated = 0;
      task.destroyed = true;
      return;
    }

    task.func = 'FailSweetScentEncounter';
    runtime.vars.sweetScentPaletteFadeRestoreStarted = 1;
    return;
  }

  task.data0 += 1;
};

export function TrySweetScentEncounter(
  runtime: SweetScentRuntimeState,
  task: SweetScentTaskState,
  paletteFadeActive: boolean,
  sweetScentWildEncounter: () => boolean
): void {
  trySweetScentEncounter(runtime, task, paletteFadeActive, sweetScentWildEncounter);
}

export const failSweetScentEncounter = (
  runtime: SweetScentRuntimeState,
  task: SweetScentTaskState,
  paletteFadeActive: boolean
): void => {
  if (paletteFadeActive) {
    return;
  }

  runtime.vars.sweetScentPaletteRestored = 1;
  runtime.vars.weatherProcessingIdle = 1;
  runtime.vars.sweetScentPaletteBackupAllocated = 0;
  runtime.stringVars.scriptContextSetupScript = 'EventScript_FailSweetScent';
  task.destroyed = true;
};

export function FailSweetScentEncounter(
  runtime: SweetScentRuntimeState,
  task: SweetScentTaskState,
  paletteFadeActive: boolean
): void {
  failSweetScentEncounter(runtime, task, paletteFadeActive);
}

export const doFieldEffectSweetScent = (
  runtime: SweetScentRuntimeState,
  session: FieldScriptSessionState
): void => {
  fldEffSweetScent(runtime);
  startSweetScentFieldEffect(runtime);
  session.specialState = { kind: 'sweetScentFieldEffect' };
};
