export interface FieldPoisonEffectState {
  active: boolean;
  phase: 0 | 1 | 2;
  mosaic: number;
}

export const createFieldPoisonEffectState = (): FieldPoisonEffectState => ({
  active: false,
  phase: 0,
  mosaic: 0
});

export const fldEffPoisonStart = (state: FieldPoisonEffectState): void => {
  state.active = true;
  state.phase = 0;
  state.mosaic = 0;
};

export const fldEffPoisonIsActive = (state: FieldPoisonEffectState): boolean => state.active;

export const stepFieldPoisonEffect = (state: FieldPoisonEffectState): void => {
  if (!state.active) {
    return;
  }

  switch (state.phase) {
    case 0:
      state.mosaic += 1;
      if (state.mosaic > 4) {
        state.phase = 1;
      }
      return;
    case 1:
      state.mosaic -= 1;
      if (state.mosaic === 0) {
        state.phase = 2;
      }
      return;
    case 2:
      state.active = false;
      state.phase = 0;
      state.mosaic = 0;
      return;
  }
};

export const PARTY_SIZE = 6;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const STATUS1_NONE = 0;
export const STATUS1_SLEEP = (1 << 0) | (1 << 1) | (1 << 2);
export const STATUS1_POISON = 1 << 3;
export const STATUS1_BURN = 1 << 4;
export const STATUS1_FREEZE = 1 << 5;
export const STATUS1_PARALYSIS = 1 << 6;
export const STATUS1_TOXIC_POISON = 1 << 7;
export const STATUS1_PSN_ANY = STATUS1_POISON | STATUS1_TOXIC_POISON;
export const AILMENT_NONE = 0;
export const AILMENT_PSN = 1;
export const AILMENT_PRZ = 2;
export const AILMENT_SLP = 3;
export const AILMENT_FRZ = 4;
export const AILMENT_BRN = 5;
export const FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE = 8;
export const FLDPSN_NONE = 0;
export const FLDPSN_PSN = 1;
export const FLDPSN_FNT = 2;

export interface FieldPoisonPokemon {
  species: number;
  speciesOrEgg?: number;
  sanityHasSpecies?: boolean;
  hp: number;
  status: number;
  nickname: string;
  friendshipEvents: number[];
}

export interface FieldPoisonTask {
  id: number;
  data: number[];
  func: string;
  destroyed: boolean;
}

export interface FieldPoisonRuntime {
  gPlayerParty: FieldPoisonPokemon[];
  gTasks: FieldPoisonTask[];
  gSpecialVar_Result: boolean;
  scriptContextStopped: boolean;
  fieldMessageBoxHidden: boolean;
  gStringVar1: string;
  fieldPoisonEffect: FieldPoisonEffectState;
  operations: string[];
}

export const createFieldPoisonPokemon = (overrides: Partial<FieldPoisonPokemon> = {}): FieldPoisonPokemon => ({
  species: 1,
  hp: 1,
  status: STATUS1_NONE,
  nickname: 'POKEMON',
  friendshipEvents: [],
  ...overrides
});

export const createFieldPoisonRuntime = (overrides: Partial<FieldPoisonRuntime> = {}): FieldPoisonRuntime => ({
  gPlayerParty: overrides.gPlayerParty ?? Array.from({ length: PARTY_SIZE }, () => createFieldPoisonPokemon({ species: SPECIES_NONE, hp: 0 })),
  gTasks: overrides.gTasks ?? [],
  gSpecialVar_Result: overrides.gSpecialVar_Result ?? false,
  scriptContextStopped: overrides.scriptContextStopped ?? false,
  fieldMessageBoxHidden: overrides.fieldMessageBoxHidden ?? false,
  gStringVar1: overrides.gStringVar1 ?? '',
  fieldPoisonEffect: overrides.fieldPoisonEffect ?? createFieldPoisonEffectState(),
  operations: overrides.operations ?? []
});

const op = (runtime: FieldPoisonRuntime, value: string): void => {
  runtime.operations.push(value);
};

export const CreateFieldPoisonTask = (runtime: FieldPoisonRuntime, func: string, priority: number): FieldPoisonTask => {
  const task = {
    id: runtime.gTasks.length,
    data: Array.from({ length: 16 }, () => 0),
    func,
    destroyed: false
  };
  runtime.gTasks[task.id] = task;
  op(runtime, `CreateTask:${func}:${priority}`);
  return task;
};

export const GetAilmentFromStatus = (status: number): number => {
  if (status & STATUS1_PSN_ANY)
    return AILMENT_PSN;
  if (status & STATUS1_PARALYSIS)
    return AILMENT_PRZ;
  if (status & STATUS1_SLEEP)
    return AILMENT_SLP;
  if (status & STATUS1_FREEZE)
    return AILMENT_FRZ;
  if (status & STATUS1_BURN)
    return AILMENT_BRN;
  return AILMENT_NONE;
};

export function IsMonValidSpecies(pokemon: FieldPoisonPokemon): boolean {
  const species = pokemon.speciesOrEgg ?? pokemon.species;
  if (species === SPECIES_NONE || species === SPECIES_EGG)
    return false;
  return true;
}

export function AllMonsFainted(runtime: FieldPoisonRuntime): boolean {
  for (let i = 0; i < PARTY_SIZE; i++) {
    const pokemon = runtime.gPlayerParty[i];
    if (pokemon && IsMonValidSpecies(pokemon) && pokemon.hp)
      return false;
  }
  return true;
}

export function FaintFromFieldPoison(runtime: FieldPoisonRuntime, partyIdx: number): void {
  const pokemon = runtime.gPlayerParty[partyIdx];
  pokemon.friendshipEvents.push(FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE);
  op(runtime, `AdjustFriendship:${partyIdx}:${FRIENDSHIP_EVENT_FAINT_OUTSIDE_BATTLE}`);
  pokemon.status = STATUS1_NONE;
  runtime.gStringVar1 = pokemon.nickname;
  op(runtime, `StringGet_Nickname:${pokemon.nickname}`);
}

export function MonFaintedFromPoison(runtime: FieldPoisonRuntime, partyIdx: number): boolean {
  const pokemon = runtime.gPlayerParty[partyIdx];
  if (pokemon && IsMonValidSpecies(pokemon) && !pokemon.hp && GetAilmentFromStatus(pokemon.status) === AILMENT_PSN)
    return true;
  return false;
}

export function Task_TryFieldPoisonWhiteOut(runtime: FieldPoisonRuntime, task: FieldPoisonTask): void {
  switch (task.data[0]) {
    case 0:
      for (; task.data[1] < PARTY_SIZE; task.data[1]++) {
        if (MonFaintedFromPoison(runtime, task.data[1])) {
          FaintFromFieldPoison(runtime, task.data[1]);
          op(runtime, 'ShowFieldMessage:gText_PkmnFainted3');
          task.data[0]++;
          return;
        }
      }
      task.data[0] = 2;
      break;
    case 1:
      if (runtime.fieldMessageBoxHidden)
        task.data[0]--;
      break;
    case 2:
      runtime.gSpecialVar_Result = AllMonsFainted(runtime);
      runtime.scriptContextStopped = false;
      op(runtime, 'ScriptContext_Enable');
      task.destroyed = true;
      op(runtime, `DestroyTask:${task.id}`);
      break;
  }
}

export function TryFieldPoisonWhiteOut(runtime: FieldPoisonRuntime): FieldPoisonTask {
  const task = CreateFieldPoisonTask(runtime, 'Task_TryFieldPoisonWhiteOut', 80);
  runtime.scriptContextStopped = true;
  op(runtime, 'ScriptContext_Stop');
  return task;
}

export function DoPoisonFieldEffect(runtime: FieldPoisonRuntime): number {
  let numPoisoned = 0;
  let numFainted = 0;

  for (let i = 0; i < PARTY_SIZE; i++) {
    const pokemon = runtime.gPlayerParty[i];
    if (pokemon && (pokemon.sanityHasSpecies ?? pokemon.species !== SPECIES_NONE) && GetAilmentFromStatus(pokemon.status) === AILMENT_PSN) {
      let hp = pokemon.hp;
      if (hp === 0 || --hp === 0)
        numFainted++;
      pokemon.hp = hp;
      numPoisoned++;
    }
  }

  if (numFainted || numPoisoned) {
    fldEffPoisonStart(runtime.fieldPoisonEffect);
    op(runtime, 'FldEffPoison_Start');
  }
  if (numFainted)
    return FLDPSN_FNT;
  if (numPoisoned)
    return FLDPSN_PSN;
  return FLDPSN_NONE;
}
