import type { FieldScriptSessionState } from './decompFieldDialogue';
import type { PlayerState } from './player';
import { resetPlayerAvatarState, setPlayerAvatarTransitionFlags, PLAYER_AVATAR_FLAG_ON_FOOT } from './playerAvatarTransition';

export interface TeleportFieldMoveMapState {
  mapType?: string;
}

export interface TeleportFieldMoveRuntimeState {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  flags: Set<string>;
}

export interface TeleportFieldMoveSetup {
  ok: boolean;
  fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu' | null;
  postMenuFieldCallback: 'FieldCallback_Teleport' | null;
}

const FLDEFF_USE_TELEPORT = 'FLDEFF_USE_TELEPORT';

export const overworldMapTypeAllowsTeleportAndFly = (mapType: string | undefined): boolean =>
  mapType === 'MAP_TYPE_ROUTE'
  || mapType === 'MAP_TYPE_TOWN'
  || mapType === 'MAP_TYPE_OCEAN_ROUTE'
  || mapType === 'MAP_TYPE_CITY';

export const setUpFieldMoveTeleport = (map: TeleportFieldMoveMapState): TeleportFieldMoveSetup =>
  overworldMapTypeAllowsTeleportAndFly(map.mapType)
    ? {
        ok: true,
        fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
        postMenuFieldCallback: 'FieldCallback_Teleport'
      }
    : {
        ok: false,
        fieldCallback2: null,
        postMenuFieldCallback: null
      };

export const overworldResetStateAfterTeleport = (
  runtime: TeleportFieldMoveRuntimeState,
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

export const fieldCallbackTeleport = (
  runtime: TeleportFieldMoveRuntimeState,
  player?: PlayerState
): void => {
  overworldResetStateAfterTeleport(runtime, player);
  runtime.stringVars.activeFieldEffect = FLDEFF_USE_TELEPORT;
  runtime.vars.fieldEffectArgument_0 = Math.trunc(runtime.vars.cursorSelectionMonId ?? runtime.vars.fieldEffectArgument_0 ?? 0);
};

export const fldEffUseTeleport = (
  runtime: TeleportFieldMoveRuntimeState,
  player?: PlayerState
): false => {
  runtime.vars.fieldEffectShowMonTaskCreated = 1;
  runtime.stringVars.fieldEffectDataFunc = 'StartTeleportFieldEffect';
  if (player) {
    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ON_FOOT);
  }
  return false;
};

export const startTeleportFieldEffect = (runtime: TeleportFieldMoveRuntimeState): void => {
  runtime.stringVars.activeFieldEffect = '';
  runtime.vars.teleportFieldEffectTaskCreated = 1;
};

export const doFieldEffectTeleport = (
  runtime: TeleportFieldMoveRuntimeState,
  session: FieldScriptSessionState,
  player?: PlayerState
): void => {
  fldEffUseTeleport(runtime, player);
  startTeleportFieldEffect(runtime);
  session.specialState = { kind: 'teleportFieldEffect' };
};

export function SetUpFieldMove_Teleport(map: TeleportFieldMoveMapState): TeleportFieldMoveSetup {
  return setUpFieldMoveTeleport(map);
}

export function FieldCallback_Teleport(
  runtime: TeleportFieldMoveRuntimeState,
  player?: PlayerState
): void {
  fieldCallbackTeleport(runtime, player);
}

export function FldEff_UseTeleport(
  runtime: TeleportFieldMoveRuntimeState,
  player?: PlayerState
): false {
  return fldEffUseTeleport(runtime, player);
}

export function StartTeleportFieldEffect(runtime: TeleportFieldMoveRuntimeState): void {
  startTeleportFieldEffect(runtime);
}
