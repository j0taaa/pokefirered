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
