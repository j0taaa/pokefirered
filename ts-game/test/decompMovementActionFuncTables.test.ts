import { describe, expect, test } from 'vitest';
import {
  gMovementActionFunctionPrototypes,
  gMovementActionFunctionTableDeclarations,
  gMovementActionStepTables,
  getDecompMovementActionFuncEntry,
  getDecompMovementActionStepTable,
  sDirectionAnimFuncsBySpeed,
  sMovementActionFuncs
} from '../src/game/decompMovementActionFuncTables';

describe('decomp movement action function tables', () => {
  test('parses every prototype, table declaration, and master action entry', () => {
    expect(gMovementActionFunctionPrototypes).toHaveLength(288);
    expect(gMovementActionFunctionTableDeclarations).toHaveLength(170);
    expect(sMovementActionFuncs).toHaveLength(170);
    expect(gMovementActionStepTables).toHaveLength(170);
    expect(gMovementActionFunctionPrototypes.slice(0, 5)).toEqual([
      'MovementAction_FaceDown_Step0',
      'MovementAction_FaceUp_Step0',
      'MovementAction_FaceLeft_Step0',
      'MovementAction_FaceRight_Step0',
      'MovementAction_PauseSpriteAnim'
    ]);
    expect(gMovementActionFunctionPrototypes.slice(-5)).toEqual([
      'MovementAction_JumpSpecialWithEffectLeft_Step1',
      'MovementAction_JumpSpecialWithEffectRight_Step0',
      'MovementAction_JumpSpecialWithEffectRight_Step1',
      'MovementAction_WaitSpriteAnim',
      'MovementAction_Finish'
    ]);
  });

  test('preserves master movement action indexes and concrete step tables', () => {
    expect(getDecompMovementActionFuncEntry('MOVEMENT_ACTION_FACE_DOWN')).toEqual({
      index: 'MOVEMENT_ACTION_FACE_DOWN',
      symbol: 'sMovementActionFuncs_FaceDown'
    });
    expect(getDecompMovementActionStepTable('sMovementActionFuncs_FaceDown')?.functions).toEqual([
      'MovementAction_FaceDown_Step0',
      'MovementAction_PauseSpriteAnim'
    ]);
    expect(getDecompMovementActionStepTable('sMovementActionFuncs_WalkSlowestDown')?.functions).toEqual([
      'MovementAction_WalkSlowestDown_Step0',
      'MovementAction_WalkSlowestDown_Step1',
      'MovementAction_PauseSpriteAnim'
    ]);
    expect(getDecompMovementActionFuncEntry('MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_RIGHT')).toEqual({
      index: 'MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_RIGHT',
      symbol: 'sMovementActionFuncs_JumpSpecialWithEffectRight'
    });
  });

  test('preserves shared terminal functions and unusual table reuse', () => {
    expect(getDecompMovementActionStepTable('sMovementActionFuncs_FlyDown')?.functions).toEqual([
      'MovementAction_FlyDown_Step0',
      'MovementAction_FlyDown_Step1',
      'MovementAction_FlyUp_Step2'
    ]);
    expect(getDecompMovementActionStepTable('sMovementActionFuncs_RaiseHandAndSwim')?.functions).toEqual([
      'MovementAction_RaiseHand_Step0',
      'MovementAction_RaiseHandAndSwim_Step1'
    ]);
    expect(gMovementActionStepTables.reduce((sum, table) => sum + table.functions.length, 0)).toBe(476);
  });

  test('preserves speed-to-direction-animation helper table', () => {
    expect(sDirectionAnimFuncsBySpeed).toEqual([
      { index: 'MOVE_SPEED_NORMAL', symbol: 'GetMoveDirectionAnimNum' },
      { index: 'MOVE_SPEED_FAST_1', symbol: 'GetMoveDirectionFastAnimNum' },
      { index: 'MOVE_SPEED_FAST_2', symbol: 'GetMoveDirectionFastAnimNum' },
      { index: 'MOVE_SPEED_FASTER', symbol: 'GetMoveDirectionFasterAnimNum' },
      { index: 'MOVE_SPEED_FASTEST', symbol: 'GetMoveDirectionFastestAnimNum' }
    ]);
  });
});
