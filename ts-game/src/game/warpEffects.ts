import type { PlayerState } from './player';
import { resetPlayerAvatarState, setPlayerAvatarTransitionFlags, PLAYER_AVATAR_FLAG_ON_FOOT } from './playerAvatarTransition';
import type { ScriptRuntimeState } from './scripts';
import type { WarpEffect, WarpTransition } from './warps';

const specialByWarpEffect: Partial<Record<WarpEffect, string>> = {
  door: 'DoDoorWarp',
  stair: 'DoStairWarp',
  escalator: 'DoEscalatorWarp',
  lavaridgeB1F: 'DoLavaridgeGymB1FWarp',
  lavaridge1F: 'DoLavaridgeGym1FWarp',
  teleport: 'DoTeleportWarp',
  unionRoom: 'DoUnionRoomWarp',
  fall: 'DoFallWarp'
};

const recordWarpSpecial = (runtime: ScriptRuntimeState, specialName: string): void => {
  runtime.fieldEffects.triggeredSpecials[specialName] =
    (runtime.fieldEffects.triggeredSpecials[specialName] ?? 0) + 1;
};

export const applyWarpTransitionEffect = (
  runtime: ScriptRuntimeState,
  player: PlayerState,
  transition: WarpTransition
): void => {
  if (transition.status !== 'resolved' || !transition.effect) {
    return;
  }

  const specialName = specialByWarpEffect[transition.effect];
  if (specialName) {
    recordWarpSpecial(runtime, specialName);
  }

  if (transition.effect === 'fall') {
    runtime.fieldEffects.fallWarpCount += 1;
  }

  if (transition.effect === 'unionRoom') {
    runtime.startMenu.mode = 'unionRoom';
  }

  if (
    transition.effect === 'stair'
    && (transition.delayFrames ?? 0) > 0
    && (player.avatarMode === 'machBike' || player.avatarMode === 'acroBike')
  ) {
    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_ON_FOOT);
  }

  if (transition.resetInitialPlayerAvatarState) {
    resetPlayerAvatarState(player);
  }
};
