import { describe, expect, test } from 'vitest';
import {
  gMovementDirectionTables,
  gMovementTypeFunctionTables,
  gMovementTypePrototypes,
  getDecompMovementDirectionFacings,
  getDecompMovementDirectionTable,
  getDecompMovementTypeFunctionTable
} from '../src/game/decompObjectEventMovementTypeTables';

describe('decomp object event movement type tables', () => {
  test('parses every prototype, function pointer table, and direction table', () => {
    expect(gMovementTypePrototypes).toHaveLength(160);
    expect(gMovementTypeFunctionTables).toHaveLength(55);
    expect(gMovementDirectionTables).toHaveLength(36);
    expect(gMovementTypePrototypes[0]).toEqual({
      returnType: 'bool8',
      name: 'MovementType_WanderAround_Step0'
    });
    expect(gMovementTypePrototypes.at(-1)).toEqual({
      returnType: 'u8',
      name: 'GetLimitedVectorDirection_SouthWestEast'
    });
  });

  test('preserves movement type function table order', () => {
    expect(getDecompMovementTypeFunctionTable('gMovementTypeFuncs_WanderAround')?.functions).toEqual([
      'MovementType_WanderAround_Step0',
      'MovementType_WanderAround_Step1',
      'MovementType_WanderAround_Step2',
      'MovementType_WanderAround_Step3',
      'MovementType_WanderAround_Step4',
      'MovementType_WanderAround_Step5',
      'MovementType_WanderAround_Step6'
    ]);
    expect(getDecompMovementTypeFunctionTable('gMovementTypeFuncs_CopyPlayerInGrass')?.functions).toEqual([
      'MovementType_CopyPlayer_Step0',
      'MovementType_CopyPlayerInGrass_Step1',
      'MovementType_CopyPlayer_Step2'
    ]);
    expect(getDecompMovementTypeFunctionTable('gCopyPlayerMovementFuncs')?.functions).toEqual([
      'CopyablePlayerMovement_None',
      'CopyablePlayerMovement_FaceDirection',
      'CopyablePlayerMovement_GoSpeed0',
      'CopyablePlayerMovement_GoSpeed1',
      'CopyablePlayerMovement_GoSpeed2',
      'CopyablePlayerMovement_Slide',
      'cph_IM_DIFFERENT',
      'CopyablePlayerMovement_GoSpeed4',
      'CopyablePlayerMovement_Jump',
      'CopyablePlayerMovement_None',
      'CopyablePlayerMovement_None'
    ]);
  });

  test('preserves direction arrays and decoded runtime facings', () => {
    expect(getDecompMovementDirectionTable('gStandardDirections')?.directions).toEqual([
      'DIR_SOUTH',
      'DIR_NORTH',
      'DIR_WEST',
      'DIR_EAST'
    ]);
    expect(getDecompMovementDirectionFacings('gDownUpAndLeftDirections')).toEqual([
      'up',
      'down',
      'left',
      'down'
    ]);
    expect(getDecompMovementDirectionFacings('gRightDownLeftUpDirections')).toEqual([
      'right',
      'down',
      'left',
      'up'
    ]);
  });
});
