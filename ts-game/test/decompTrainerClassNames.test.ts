import { describe, expect, test } from 'vitest';
import {
  TRAINER_CLASS_NAMES_SOURCE,
  gTrainerClassNames,
  getTrainerClassName
} from '../src/game/decompTrainerClassNames';

describe('decomp trainer class names', () => {
  test('parses every gTrainerClassNames row in source order', () => {
    expect(TRAINER_CLASS_NAMES_SOURCE).toContain('const u8 gTrainerClassNames[][13]');
    expect(gTrainerClassNames).toHaveLength(107);
    expect(gTrainerClassNames.slice(0, 5)).toEqual([
      { trainerClass: 'TRAINER_CLASS_NONE', name: 'PKMN TRAINER' },
      { trainerClass: 'TRAINER_CLASS_PKMN_TRAINER_UNUSED', name: 'PKMN TRAINER' },
      { trainerClass: 'TRAINER_CLASS_AQUA_LEADER', name: 'AQUA LEADER' },
      { trainerClass: 'TRAINER_CLASS_TEAM_AQUA', name: 'TEAM AQUA' },
      { trainerClass: 'TRAINER_CLASS_RS_AROMA_LADY', name: 'AROMA LADY' }
    ]);
  });

  test('preserves duplicate class labels and FireRed-specific tail entries', () => {
    expect(getTrainerClassName('TRAINER_CLASS_TEAM_ROCKET')).toBe('TEAM ROCKET');
    expect(getTrainerClassName('TRAINER_CLASS_CRUSH_GIRL')).toBe('CRUSH GIRL');
    expect(getTrainerClassName('TRAINER_CLASS_PKMN_PROF')).toBe('PKMN PROF.');
    expect(gTrainerClassNames.at(-1)).toEqual({
      trainerClass: 'TRAINER_CLASS_PAINTER',
      name: 'PAINTER'
    });
  });
});
