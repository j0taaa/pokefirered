import { evaluateFieldCollision } from './fieldCollision';
import { getNpcRuntimeObject, type NpcState } from './npc';
import { getPlayerRuntimeObject, type PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';
import type { TileDirection, TileMap } from '../world/tileMap';

export const evaluatePlayerFieldCollision = (
  map: TileMap,
  player: PlayerState,
  visibleNpcs: readonly NpcState[],
  runtime: ScriptRuntimeState,
  loadMapById: (mapId: string) => TileMap | null,
  direction: TileDirection
) => evaluateFieldCollision({
  map,
  object: {
    ...getPlayerRuntimeObject(player, map),
    strengthActive: runtime.flags.has('FLAG_SYS_USE_STRENGTH')
  },
  direction,
  objects: visibleNpcs.map((npc) => getNpcRuntimeObject(npc, map)),
  loadMapById
});
