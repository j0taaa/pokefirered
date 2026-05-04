import { healParty, type FieldPokemon } from './pokemonStorage';
import {
  getHealLocationIdForCenterMap,
  setRespawn,
  type CenterRuntimeState
} from './pokemonCenterTemplate';

export type PokemonCenterStage =
  | 'idle'
  | 'nurseWelcome'
  | 'nurseTakePokemon'
  | 'healing'
  | 'nurseRestored'
  | 'nurseGoodbye'
  | 'pcAccess'
  | 'pcExit';

export interface PokemonCenterState {
  stage: PokemonCenterStage;
  healingTimer: number;
  pcActive: boolean;
  pcCurrentBox: number;
}

export const NURSE_WELCOME_TEXT =
  'Welcome to our POKeMON CENTER!\nWould you like me to heal your POKeMON back to perfect health?';
export const NURSE_TAKE_POKEMON_TEXT =
  "Okay, I'll take your POKeMON for a few seconds.";
export const NURSE_RESTORED_TEXT =
  "Thank you for waiting.\nWe've restored your POKeMON to full health.";
export const NURSE_GOODBYE_TEXT = 'We hope to see you again!';
export const NURSE_DECLINE_TEXT = 'We hope to see you again!';

export const HEALING_ANIMATION_DURATION_FRAMES = 120;

export const createPokemonCenterState = (): PokemonCenterState => ({
  stage: 'idle',
  healingTimer: 0,
  pcActive: false,
  pcCurrentBox: 0
});

export const startNurseDialogue = (state: PokemonCenterState): void => {
  state.stage = 'nurseWelcome';
};

export const advanceNurseDialogue = (
  state: PokemonCenterState,
  party: FieldPokemon[],
  runtime: CenterRuntimeState,
  centerMapId: string,
  choice: 'yes' | 'no'
): { text: string; done: boolean } => {
  switch (state.stage) {
    case 'nurseWelcome': {
      if (choice === 'no') {
        state.stage = 'idle';
        return { text: NURSE_DECLINE_TEXT, done: true };
      }
      state.stage = 'nurseTakePokemon';
      return { text: NURSE_TAKE_POKEMON_TEXT, done: false };
    }
    case 'nurseTakePokemon': {
      healParty(party);
      const healLocationId = getHealLocationIdForCenterMap(centerMapId);
      if (healLocationId) {
        setRespawn(runtime, healLocationId);
      }
      state.stage = 'healing';
      state.healingTimer = HEALING_ANIMATION_DURATION_FRAMES;
      return { text: '', done: false };
    }
    case 'healing': {
      state.healingTimer -= 1;
      if (state.healingTimer > 0) {
        return { text: '', done: false };
      }
      state.stage = 'nurseRestored';
      return { text: NURSE_RESTORED_TEXT, done: false };
    }
    case 'nurseRestored': {
      state.stage = 'nurseGoodbye';
      return { text: NURSE_GOODBYE_TEXT, done: false };
    }
    case 'nurseGoodbye': {
      state.stage = 'idle';
      return { text: '', done: true };
    }
    default:
      state.stage = 'idle';
      return { text: '', done: true };
  }
};

export const openPcFromCenter = (state: PokemonCenterState): void => {
  state.pcActive = true;
  state.stage = 'pcAccess';
};

export const closePcFromCenter = (state: PokemonCenterState): void => {
  state.pcActive = false;
  state.stage = 'idle';
};

export const isHealingAnimationActive = (state: PokemonCenterState): boolean =>
  state.stage === 'healing' && state.healingTimer > 0;

export const getHealingProgress = (state: PokemonCenterState): number => {
  if (state.stage !== 'healing') {
    return 1;
  }
  return 1 - state.healingTimer / HEALING_ANIMATION_DURATION_FRAMES;
};