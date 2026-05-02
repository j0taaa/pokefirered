import type { DialogueState } from './interaction';
import type { FieldScriptSessionState } from './decompFieldDialogue';
import { getFieldPokemonDisplayName, type FieldPokemon } from './pokemonStorage';

const PARTY_SIZE = 6;

export interface FieldEffectRuntime {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  party: FieldPokemon[];
  flags?: Set<string>;
}

export interface StrengthFieldMoveSetup {
  ok: boolean;
  fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu' | null;
  postMenuFieldCallback: 'FieldCB_UseStrength' | null;
}

export const PLAYER_AVATAR_FLAG_SURFING = 'PLAYER_AVATAR_FLAG_SURFING';
export const OBJ_EVENT_GFX_PUSHABLE_BOULDER = 'OBJ_EVENT_GFX_PUSHABLE_BOULDER';

const normalizeMoveName = (value: string): string =>
  value
    .replace(/^MOVE_/u, '')
    .replace(/_/gu, ' ')
    .trim()
    .toUpperCase();

export const getPartySizeConstant = (): number => PARTY_SIZE;

export const checkPartyMove = (
  runtime: FieldEffectRuntime,
  moveToken: string
): number => {
  const targetMove = normalizeMoveName(moveToken);
  for (let i = 0; i < runtime.party.length; i += 1) {
    const pokemon = runtime.party[i];
    if (!pokemon || pokemon.isEgg) {
      continue;
    }

    const hasMove = (pokemon.moves ?? []).some((move) => normalizeMoveName(move) === targetMove);
    if (hasMove) {
      return i;
    }
  }

  return PARTY_SIZE;
};

export const setFieldEffectArgument = (
  runtime: FieldEffectRuntime,
  index: number,
  value: number
): void => {
  runtime.vars[`fieldEffectArgument_${index}`] = value;
};

export const getFieldEffectArgument = (
  runtime: FieldEffectRuntime,
  index: number
): number => runtime.vars[`fieldEffectArgument_${index}`] ?? 0;

export const setUpFieldMoveStrength = (
  runtime: FieldEffectRuntime,
  isSurfing = runtime.flags?.has(PLAYER_AVATAR_FLAG_SURFING) === true,
  objectGraphicsInFrontOfPlayer = runtime.stringVars.objectGraphicsInFrontOfPlayer
): StrengthFieldMoveSetup => {
  if (isSurfing || objectGraphicsInFrontOfPlayer !== OBJ_EVENT_GFX_PUSHABLE_BOULDER) {
    return {
      ok: false,
      fieldCallback2: null,
      postMenuFieldCallback: null
    };
  }

  runtime.vars.gSpecialVar_Result = Math.trunc(runtime.vars.cursorSelectionMonId ?? 0);
  return {
    ok: true,
    fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
    postMenuFieldCallback: 'FieldCB_UseStrength'
  };
};

export const fieldCBUseStrength = (runtime: FieldEffectRuntime): void => {
  setFieldEffectArgument(runtime, 0, Math.trunc(runtime.vars.cursorSelectionMonId ?? 0));
  runtime.stringVars.scriptContextSetupScript = 'EventScript_FldEffStrength';
};

export const fldEffUseStrength = (runtime: FieldEffectRuntime): false => {
  const partyIndex = getFieldEffectArgument(runtime, 0);
  const pokemon = runtime.party[partyIndex];
  runtime.vars.fieldEffectShowMonTaskCreated = 1;
  runtime.stringVars.fieldEffectDataFunc = 'ShowMonCB_UseStrength';
  runtime.stringVars.STR_VAR_1 = pokemon ? getFieldPokemonDisplayName(pokemon) : '';
  return false;
};

export const showMonCBUseStrength = (runtime: FieldEffectRuntime): void => {
  runtime.stringVars.activeFieldEffect = '';
  runtime.vars.scriptContextEnabled = 1;
};

export const doFieldEffectStrength = (
  runtime: FieldEffectRuntime,
  _dialogue: DialogueState,
  session: FieldScriptSessionState
): void => {
  const partyIndex = getFieldEffectArgument(runtime, 0);
  const pokemon = runtime.party[partyIndex];
  runtime.stringVars.STR_VAR_1 = pokemon ? getFieldPokemonDisplayName(pokemon) : '';
  session.specialState = {
    kind: 'strengthFieldEffect'
  };
};

export function SetUpFieldMove_Strength(
  runtime: FieldEffectRuntime,
  isSurfing = runtime.flags?.has(PLAYER_AVATAR_FLAG_SURFING) === true,
  objectGraphicsInFrontOfPlayer = runtime.stringVars.objectGraphicsInFrontOfPlayer
): StrengthFieldMoveSetup {
  return setUpFieldMoveStrength(runtime, isSurfing, objectGraphicsInFrontOfPlayer);
}

export function FieldCB_UseStrength(runtime: FieldEffectRuntime): void {
  fieldCBUseStrength(runtime);
}

export function FldEff_UseStrength(runtime: FieldEffectRuntime): false {
  return fldEffUseStrength(runtime);
}

export function ShowMonCB_UseStrength(runtime: FieldEffectRuntime): void {
  showMonCBUseStrength(runtime);
}
