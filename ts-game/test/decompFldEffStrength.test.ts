import { describe, expect, test } from 'vitest';
import { createDialogueState } from '../src/game/interaction';
import {
  FieldCB_UseStrength,
  FldEff_UseStrength,
  OBJ_EVENT_GFX_PUSHABLE_BOULDER,
  PLAYER_AVATAR_FLAG_SURFING,
  SetUpFieldMove_Strength,
  ShowMonCB_UseStrength,
  checkPartyMove,
  doFieldEffectStrength,
  getPartySizeConstant,
  setFieldEffectArgument
} from '../src/game/decompFldEffStrength';

describe('decompFldEffStrength', () => {
  test('checkpartymove returns the first matching party slot or PARTY_SIZE', () => {
    const runtime = {
      vars: {},
      stringVars: { STR_VAR_1: '' },
      party: [
        { species: 'PIDGEY', level: 10, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal', 'flying'], status: 'none' as const, moves: ['GUST'] },
        { species: 'CHARMANDER', nickname: 'BLAZE', level: 12, maxHp: 24, hp: 24, attack: 12, defense: 11, speed: 14, spAttack: 13, spDefense: 12, catchRate: 45, types: ['fire'], status: 'none' as const, moves: ['SCRATCH', 'STRENGTH'] }
      ]
    };

    expect(checkPartyMove(runtime, 'MOVE_STRENGTH')).toBe(1);
    expect(checkPartyMove(runtime, 'MOVE_SURF')).toBe(getPartySizeConstant());
  });

  test('dofieldeffect FLDEFF_USE_STRENGTH buffers the selected mon nickname and opens the field effect wait state', () => {
    const runtime = {
      vars: {},
      stringVars: { STR_VAR_1: '' },
      party: [
        { species: 'CHARMANDER', nickname: 'BLAZE', level: 12, maxHp: 24, hp: 24, attack: 12, defense: 11, speed: 14, spAttack: 13, spDefense: 12, catchRate: 45, types: ['fire'], status: 'none' as const, moves: ['SCRATCH', 'STRENGTH'] }
      ]
    };
    const dialogue = createDialogueState();
    const session = {
      rootScriptId: 'EventScript_StrengthBoulder',
      currentLabel: 'EventScript_StrengthBoulder',
      lineIndex: 0,
      lastTrainerId: null,
      hiddenItemFlag: null,
      loadedPointerTextLabel: null,
      callStack: [],
      waitingFor: null,
      movingLocalId: 0,
      waitingMovementLocalId: null,
      suspendedChoice: null,
      specialState: null,
      messageBoxFrame: 'std' as const,
      messageBoxAutoScroll: false
    };

    setFieldEffectArgument(runtime, 0, 0);
    doFieldEffectStrength(runtime, dialogue, session);

    expect(runtime.stringVars.STR_VAR_1).toBe('BLAZE');
    expect(session.specialState).toEqual({ kind: 'strengthFieldEffect' });
  });

  test('SetUpFieldMove_Strength, FieldCB_UseStrength, FldEff_UseStrength, and ShowMonCB_UseStrength preserve C handoff', () => {
    const runtime: {
      vars: Record<string, number>;
      stringVars: Record<string, string>;
      flags: Set<string>;
      party: Array<{
        species: string;
        nickname?: string;
        level: number;
        maxHp: number;
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        spAttack: number;
        spDefense: number;
        catchRate: number;
        types: string[];
        status: 'none';
        moves: string[];
      }>;
    } = {
      vars: { cursorSelectionMonId: 1 },
      stringVars: {
        STR_VAR_1: '',
        objectGraphicsInFrontOfPlayer: OBJ_EVENT_GFX_PUSHABLE_BOULDER,
        activeFieldEffect: 'FLDEFF_USE_STRENGTH'
      },
      flags: new Set<string>(),
      party: [
        { species: 'PIDGEY', level: 10, maxHp: 20, hp: 20, attack: 10, defense: 10, speed: 10, spAttack: 10, spDefense: 10, catchRate: 255, types: ['normal', 'flying'], status: 'none' as const, moves: ['GUST'] },
        { species: 'CHARMANDER', nickname: 'BLAZE', level: 12, maxHp: 24, hp: 24, attack: 12, defense: 11, speed: 14, spAttack: 13, spDefense: 12, catchRate: 45, types: ['fire'], status: 'none' as const, moves: ['SCRATCH', 'STRENGTH'] }
      ]
    };

    expect(SetUpFieldMove_Strength(runtime)).toEqual({
      ok: true,
      fieldCallback2: 'FieldCallback_PrepareFadeInFromMenu',
      postMenuFieldCallback: 'FieldCB_UseStrength'
    });
    expect(runtime.vars.gSpecialVar_Result).toBe(1);

    runtime.flags.add(PLAYER_AVATAR_FLAG_SURFING);
    expect(SetUpFieldMove_Strength(runtime).ok).toBe(false);
    runtime.flags.clear();
    runtime.stringVars.objectGraphicsInFrontOfPlayer = 'OBJ_EVENT_GFX_TREE';
    expect(SetUpFieldMove_Strength(runtime).ok).toBe(false);
    runtime.stringVars.objectGraphicsInFrontOfPlayer = OBJ_EVENT_GFX_PUSHABLE_BOULDER;

    FieldCB_UseStrength(runtime);
    expect(runtime.vars.fieldEffectArgument_0).toBe(1);
    expect(runtime.stringVars.scriptContextSetupScript).toBe('EventScript_FldEffStrength');

    expect(FldEff_UseStrength(runtime)).toBe(false);
    expect(runtime.vars.fieldEffectShowMonTaskCreated).toBe(1);
    expect(runtime.stringVars.fieldEffectDataFunc).toBe('ShowMonCB_UseStrength');
    expect(runtime.stringVars.STR_VAR_1).toBe('BLAZE');

    ShowMonCB_UseStrength(runtime);
    expect(runtime.stringVars.activeFieldEffect).toBe('');
    expect(runtime.vars.scriptContextEnabled).toBe(1);
  });
});
