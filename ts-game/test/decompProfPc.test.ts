import { describe, expect, test } from 'vitest';
import {
  GetPokedexCount,
  GetProfOaksRatingMessage,
  GetProfOaksRatingMessageByCount,
  PROF_PC_C_TRANSLATION_UNIT,
  createProfPcScriptRuntime,
  getProfOaksRatingDialogue,
  getProfOaksRatingMessageByCount,
  getProfPcPokedexCount
} from '../src/game/decompProfPc';

describe('decomp prof pc parity', () => {
  test('exports the prof_pc.c translation unit marker', () => {
    expect(PROF_PC_C_TRANSLATION_UNIT).toBe('src/prof_pc.c');
  });

  test('counts Kanto and National seen/owned totals like GetPokedexCount', () => {
    const runtime = {
      pokedex: {
        seenSpecies: ['BULBASAUR', 'IVYSAUR', 'CHIKORITA'],
        caughtSpecies: ['BULBASAUR', 'CHIKORITA']
      }
    };

    expect(getProfPcPokedexCount(runtime, false)).toEqual({
      nationalDexEnabled: true,
      seenCount: 2,
      ownedCount: 1
    });
    expect(getProfPcPokedexCount(runtime, true)).toEqual({
      nationalDexEnabled: true,
      seenCount: 3,
      ownedCount: 2
    });

    const scriptRuntime = createProfPcScriptRuntime(runtime);
    expect(GetPokedexCount(scriptRuntime)).toBe(1);
    expect(scriptRuntime.specialVars.gSpecialVar_0x8005).toBe(2);
    expect(scriptRuntime.specialVars.gSpecialVar_0x8006).toBe(1);

    scriptRuntime.specialVars.gSpecialVar_0x8004 = 1;
    expect(GetPokedexCount(scriptRuntime)).toBe(1);
    expect(scriptRuntime.specialVars.gSpecialVar_0x8005).toBe(3);
    expect(scriptRuntime.specialVars.gSpecialVar_0x8006).toBe(2);
  });

  test('uses the Mew exclusion rule for Kanto completion', () => {
    expect(getProfOaksRatingMessageByCount(150, ['MEW']).complete).toBe(false);
    expect(GetProfOaksRatingMessageByCount).toBe(getProfOaksRatingMessageByCount);
    expect(GetProfOaksRatingMessageByCount(10, []).symbol).toBe('PokedexRating_Text_LessThan20');
    expect(getProfOaksRatingMessageByCount(150, ['BULBASAUR']).complete).toBe(true);
    expect(getProfOaksRatingMessageByCount(151, ['MEW']).complete).toBe(true);

    const runtime = createProfPcScriptRuntime(
      {
        pokedex: {
          seenSpecies: [],
          caughtSpecies: ['MEW']
        }
      },
      { gSpecialVar_0x8004: 150 }
    );
    GetProfOaksRatingMessage(runtime);
    expect(runtime.specialVars.gSpecialVar_Result).toBe(false);
    expect(runtime.shownFieldMessages.at(-1)?.symbol).toBe('PokedexRating_Text_LessThan150');

    runtime.pokedex.caughtSpecies = ['BULBASAUR'];
    GetProfOaksRatingMessage(runtime);
    expect(runtime.specialVars.gSpecialVar_Result).toBe(true);
    expect(runtime.shownFieldMessages.at(-1)?.symbol).toBe('PokedexRating_Text_Complete');
  });

  test('builds the in-person Oak rating dialogue sequence from decomp text', () => {
    const runtime = {
      pokedex: {
        seenSpecies: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
        caughtSpecies: ['BULBASAUR', 'IVYSAUR']
      }
    };

    const dialogue = getProfOaksRatingDialogue(runtime, false);

    expect(dialogue.pages[0]).toContain('OAK: Good to see you!');
    expect(dialogue.pages.join(' ')).toContain('2 POK');
    expect(dialogue.pages.at(-1)).toContain('Go into every patch of grass');
    expect(dialogue.kantoComplete).toBe(false);
    expect(dialogue.nationalDexEnabled).toBe(false);
  });
});
