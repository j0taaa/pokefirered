import { addPokedexSeenSpecies } from './pokemonStorage';
import type { BattleState } from './battle';
import { startTrainerBattle } from './battle';
import type { DialogueState } from './interaction';
import type { ScriptRuntimeState } from './scripts';
import type { TileMap } from '../world/tileMap';

export interface TrainerBattleHandoffContext {
  runtime: ScriptRuntimeState;
  battle: BattleState;
  dialogue: DialogueState;
  map: TileMap;
}

export const startPendingTrainerBattleIfReady = ({
  runtime,
  battle,
  dialogue,
  map
}: TrainerBattleHandoffContext): boolean => {
  const pending = runtime.pendingTrainerBattle;
  if (!pending || pending.started || dialogue.active || battle.active) {
    return false;
  }

  startTrainerBattle(battle, {
    opponentName: pending.trainerName,
    trainerId: pending.trainerId,
    format: pending.format,
    opponentParty: pending.opponentParty,
    opponentTrainerItems: pending.trainerItems,
    opponentTrainerAiFlags: pending.trainerAiFlags,
    battleStyle: runtime.options.battleStyle,
    playerName: runtime.startMenu.playerName,
    playerParty: battle.playerSide.party,
    activePlayerPartyIndex: battle.playerSide.activePartyIndexes[0],
    mapBattleScene: map.battleScene
  });
  for (const pokemon of pending.opponentParty) {
    addPokedexSeenSpecies(runtime.pokedex, pokemon.species);
  }
  runtime.startMenu.seenPokemonCount = runtime.pokedex.seenSpecies.length;
  pending.started = true;
  runtime.lastScriptId = `battle.trainer.start.${pending.trainerId.toLowerCase()}`;
  return true;
};
