import type { FieldScriptSessionState } from './decompFieldDialogue';
import type { PlayerState } from './player';
import { resetPlayerAvatarState, setPlayerAvatarTransitionFlags, PLAYER_AVATAR_FLAG_ON_FOOT } from './playerAvatarTransition';

export interface DigFieldMoveMapState {
  allowEscaping?: boolean;
}

export interface DigFieldMoveRuntimeState {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  flags: Set<string>;
}

export interface DigFieldMoveSetup {
  ok: boolean;
  fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu' | null;
  postMenuFieldCallback: 'FieldCallback_Dig' | null;
}

const FLDEFF_USE_DIG = 'FLDEFF_USE_DIG';

export const canUseEscapeRopeOnCurrMap = (map: DigFieldMoveMapState): boolean =>
  map.allowEscaping === true;

export const setUpFieldMoveDig = (map: DigFieldMoveMapState): DigFieldMoveSetup =>
  canUseEscapeRopeOnCurrMap(map)
    ? {
        ok: true,
        fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
        postMenuFieldCallback: 'FieldCallback_Dig'
      }
    : {
        ok: false,
        fieldCallback2: null,
        postMenuFieldCallback: null
      };

export const overworldResetStateAfterDigEscRope = (
  runtime: DigFieldMoveRuntimeState,
  player?: PlayerState
): void => {
  if (player) {
    resetPlayerAvatarState(player);
  }

  runtime.flags.delete('FLAG_SYS_ON_CYCLING_ROAD');
  runtime.vars.VAR_MAP_SCENE_ROUTE16 = 0;
  runtime.flags.delete('FLAG_SYS_CRUISE_MODE');
  runtime.flags.delete('FLAG_SYS_SAFARI_MODE');
  runtime.vars.VAR_MAP_SCENE_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE = 0;
  runtime.flags.delete('FLAG_SYS_USE_STRENGTH');
  runtime.flags.delete('FLAG_SYS_FLASH_ACTIVE');
  runtime.flags.delete('FLAG_SYS_QL_DEPARTED');
  runtime.vars.VAR_QL_ENTRANCE = 0;
};

export const fieldCallbackDig = (
  runtime: DigFieldMoveRuntimeState,
  player?: PlayerState
): void => {
  overworldResetStateAfterDigEscRope(runtime, player);
  runtime.stringVars.activeFieldEffect = FLDEFF_USE_DIG;
  runtime.vars.fieldEffectArgument_0 = Math.trunc(runtime.vars.cursorSelectionMonId ?? runtime.vars.fieldEffectArgument_0 ?? 0);
};

export const fldEffUseDig = (
  runtime: DigFieldMoveRuntimeState,
  player?: PlayerState
): false => {
  runtime.vars.fieldEffectShowMonTaskCreated = 1;
  runtime.stringVars.fieldEffectDataFunc = 'StartDigFieldEffect';
  if (player) {
    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ON_FOOT);
  }
  return false;
};

export const startDigFieldEffect = (runtime: DigFieldMoveRuntimeState): void => {
  runtime.stringVars.activeFieldEffect = '';
  runtime.vars.useDigEscapeRopeTaskCreated = 1;
  runtime.vars.useDigEscapeRopeTaskData0 = 0;
};

export const doFieldEffectDig = (
  runtime: DigFieldMoveRuntimeState,
  session: FieldScriptSessionState,
  player?: PlayerState
): void => {
  fldEffUseDig(runtime, player);
  startDigFieldEffect(runtime);
  session.specialState = { kind: 'digFieldEffect' };
};

export function SetUpFieldMove_Dig(map: DigFieldMoveMapState): DigFieldMoveSetup {
  return setUpFieldMoveDig(map);
}

export function FieldCallback_Dig(
  runtime: DigFieldMoveRuntimeState,
  player?: PlayerState
): void {
  fieldCallbackDig(runtime, player);
}

export function FldEff_UseDig(
  runtime: DigFieldMoveRuntimeState,
  player?: PlayerState
): false {
  return fldEffUseDig(runtime, player);
}

export function StartDigFieldEffect(runtime: DigFieldMoveRuntimeState): void {
  startDigFieldEffect(runtime);
}
