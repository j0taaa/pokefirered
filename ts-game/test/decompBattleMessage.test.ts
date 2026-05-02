import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BATTLE_TYPE_TRAINER,
  B_BUFF_ABILITY,
  B_BUFF_EOS,
  B_BUFF_ITEM,
  B_BUFF_MON_NICK_WITH_PREFIX,
  B_BUFF_MOVE,
  B_BUFF_NUMBER,
  B_BUFF_PLACEHOLDER_BEGIN,
  B_BUFF_SPECIES,
  B_BUFF_STAT,
  B_BUFF_STRING,
  B_BUFF_TYPE,
  B_OUTCOME_LINK_BATTLE_RAN,
  B_OUTCOME_WON,
  B_WIN_MSG,
  BattlePutTextOnWindow,
  BattleStringExpandPlaceholders,
  BattleStringShouldBeColored,
  BufferStringBattle,
  ChooseMoveUsedParticle,
  ChooseTypeOfMoveUsedString,
  ExpandBattleTextBuffPlaceholders,
  GetCurrentPpToMaxPpState,
  ITEM_ENIGMA_BERRY,
  SetPpNumbersPaletteInMoveSelection,
  STRINGID_ATTACKMISSED,
  STRINGID_BATTLEEND,
  STRINGID_INTROMSG,
  STRINGID_TRAINER1LOSETEXT,
  STRINGID_TRAINER1WINTEXT,
  STRINGID_TRAINER2LOSETEXT,
  STRINGID_TRAINER2WINTEXT,
  STRINGID_USEDMOVE,
  TryGetStatusString,
  createBattleMessageRuntime
} from '../src/game/decompBattleMessage';

describe('decompBattleMessage', () => {
  test('BufferStringBattle follows intro and used-move branches before expanding placeholders', () => {
    const trainerRuntime = createBattleMessageRuntime({
      battleTypeFlags: BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK | BATTLE_TYPE_MULTI,
      linkPlayers: [
        { id: 0, name: 'RED' },
        { id: 1, name: 'BLUE' },
        { id: 2, name: 'GREEN' },
        { id: 3, name: 'YELLOW' }
      ]
    });
    BufferStringBattle(trainerRuntime, STRINGID_INTROMSG);
    expect(trainerRuntime.displayedStringBattle).toContain('BLUE and YELLOW');
    expect(trainerRuntime.displayedStringBattle).toContain('want to battle');

    const wildRuntime = createBattleMessageRuntime({
      battleTypeFlags: BATTLE_TYPE_OLD_MAN_TUTORIAL,
      enemyParty: [{ nickname: 'WEEDLE' }]
    });
    BufferStringBattle(wildRuntime, STRINGID_INTROMSG);
    expect(wildRuntime.displayedStringBattle).toContain('Wild WEEDLE appeared!');
    expect(wildRuntime.displayedStringBattle).toContain('{PAUSE 127}');

    const moveRuntime = createBattleMessageRuntime({
      battlerAttacker: 0,
      battleMsgData: {
        currentMove: 1,
        originallyUsedMove: 0,
        lastItem: 0,
        lastAbility: 0,
        scrActive: 0,
        bakScriptPartyIdx: 0,
        hpScale: 0,
        itemEffectBattler: 0,
        moveType: 0,
        abilities: [0, 0, 0, 0],
        textBuffs: [[], [], []]
      },
      moveNames: Array.from({ length: 355 }, (_, i) => (i === 1 ? 'POUND' : `MOVE_${i}`)),
      playerParty: [{ nickname: 'CHARMANDER' }]
    });
    BufferStringBattle(moveRuntime, STRINGID_USEDMOVE);
    expect(moveRuntime.displayedStringBattle).toBe('CHARMANDER used\nPOUND!');
  });

  test('placeholder expansion preserves battle text buff sub-opcodes and trainer pause append', () => {
    const runtime = createBattleMessageRuntime({
      battleTypeFlags: BATTLE_TYPE_TRAINER,
      playerParty: [{ nickname: 'PIKA' }],
      enemyParty: [{ nickname: 'RATTA' }],
      moveNames: Array.from({ length: 355 }, (_, i) => (i === 33 ? 'TACKLE' : `MOVE_${i}`)),
      typeNames: ['NORMAL', 'FIGHTING'],
      abilityNames: ['NONE', 'STATIC'],
      speciesNames: ['NONE', 'BULBASAUR'],
      itemNames: ['NONE', 'POTION']
    });

    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_NUMBER, 2, 3, 0x34, 0x12, B_BUFF_EOS])).toBe('466');
    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_MOVE, 33, 0, B_BUFF_TYPE, 1, B_BUFF_STAT, 2, B_BUFF_EOS])).toBe('TACKLEFIGHTINGDEFENSE');
    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_SPECIES, 1, 0, B_BUFF_EOS])).toBe('BULBASAUR');
    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_MON_NICK_WITH_PREFIX, 1, 0, B_BUFF_ABILITY, 1, B_BUFF_EOS])).toBe('Foe RATTASTATIC');
    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_ITEM, 1, 0, B_BUFF_EOS])).toBe('POTION');
    expect(ExpandBattleTextBuffPlaceholders(runtime, [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_STRING, STRINGID_ATTACKMISSED, 0, B_BUFF_EOS])).toContain('attack missed');

    runtime.battleTextBuff1 = [B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_MOVE, 33, 0, B_BUFF_EOS];
    expect(BattleStringExpandPlaceholders(runtime, '{B_BUFF1} {B_TRAINER1_LOSE_TEXT}')).toBe('TACKLE {TRAINER_A_LOSE_TEXT}{PAUSE_UNTIL_PRESS}');

    runtime.battleTypeFlags = BATTLE_TYPE_LINK;
    runtime.lastUsedItem = ITEM_ENIGMA_BERRY;
    runtime.potentialItemEffectBattler = 0;
    runtime.enigmaBerries = [{ name: 'MYSTERY' }];
    expect(BattleStringExpandPlaceholders(runtime, '{B_LAST_ITEM}')).toBe('MYSTERY BERRY');
  });

  test('battle-end branch mutates link-ran outcome exactly like the C path', () => {
    const runtime = createBattleMessageRuntime({
      activeBattler: 1,
      battlerPositions: [0, 1, 2, 3],
      battleMsgData: {
        currentMove: 0,
        originallyUsedMove: 0,
        lastItem: 0,
        lastAbility: 0,
        scrActive: 0,
        bakScriptPartyIdx: 0,
        hpScale: 0,
        itemEffectBattler: 0,
        moveType: 0,
        abilities: [0, 0, 0, 0],
        textBuffs: [[B_OUTCOME_LINK_BATTLE_RAN | B_OUTCOME_WON], [], []]
      }
    });

    BufferStringBattle(runtime, STRINGID_BATTLEEND);
    expect(runtime.battleTextBuff1[0]).toBe(2);
    expect(runtime.displayedStringBattle).toContain('Got away safely');
  });

  test('grammar helpers, color predicate, PP palette, and window text flags mirror utility functions', () => {
    const runtime = createBattleMessageRuntime({
      battleMsgData: {
        currentMove: 1,
        originallyUsedMove: 0,
        lastItem: 0,
        lastAbility: 0,
        scrActive: 0,
        bakScriptPartyIdx: 0,
        hpScale: 0,
        itemEffectBattler: 0,
        moveType: 0,
        abilities: [0, 0, 0, 0],
        textBuffs: [[], [], []]
      },
      battleTypeFlags: BATTLE_TYPE_LINK,
      chooseMoveCurrentPp: [0, 3],
      chooseMoveMaxPp: [10, 3],
      moveSelectionCursor: [0]
    });

    expect(ChooseMoveUsedParticle(runtime, 1)).toBe("'s");
    expect(ChooseTypeOfMoveUsedString(runtime, 'CUT')).toBe('CUT!');
    expect(BattleStringShouldBeColored(STRINGID_TRAINER1LOSETEXT)).toBe(true);
    expect(BattleStringShouldBeColored(STRINGID_TRAINER2LOSETEXT)).toBe(true);
    expect(BattleStringShouldBeColored(STRINGID_TRAINER1WINTEXT)).toBe(true);
    expect(BattleStringShouldBeColored(STRINGID_TRAINER2WINTEXT)).toBe(true);
    expect(BattleStringShouldBeColored(STRINGID_ATTACKMISSED)).toBe(false);
    expect(TryGetStatusString('PAR')).toBe('paralysis');
    expect(TryGetStatusString('UNKNOWN')).toBeNull();

    expect(GetCurrentPpToMaxPpState(10, 10)).toBe(3);
    expect(GetCurrentPpToMaxPpState(0, 10)).toBe(2);
    expect(GetCurrentPpToMaxPpState(2, 10)).toBe(1);
    expect(GetCurrentPpToMaxPpState(5, 10)).toBe(0);
    SetPpNumbersPaletteInMoveSelection(runtime);
    expect(runtime.gPlttBufferUnfaded[5 * 16 + 12]).toBe(0x03e0);
    expect(runtime.gPlttBufferFaded[5 * 16 + 12]).toBe(0x03e0);

    BattlePutTextOnWindow(runtime, 'Hello', B_WIN_MSG);
    expect(runtime.textFlags).toMatchObject({ useAlternateDownArrow: true, autoScroll: true, canABSpeedUpPrint: true });
    expect(runtime.printers.at(-1)).toMatchObject({ text: 'Hello', windowId: B_WIN_MSG, speed: 1 });
  });
});
