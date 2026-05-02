import { describe, expect, test } from 'vitest';
import {
  MAP_OFFSET,
  QL_LoadObjects,
  QL_RecordObjects,
  QL_TryStopSurfing,
  createEmptyRuntimeObjectEvent,
  type ObjectEventTemplateLike
} from '../src/game/decompQuestLogObjects';

describe('decompQuestLogObjects', () => {
  test('QL_RecordObjects copies runtime object event fields into quest-log storage', () => {
    const object = createEmptyRuntimeObjectEvent();
    Object.assign(object, {
      active: true,
      invisible: true,
      fixedPriority: true,
      facingDirection: 3,
      currentElevation: 2,
      previousElevation: 1,
      graphicsId: 99,
      movementType: 4,
      trainerType: 5,
      localId: 7,
      mapNum: 8,
      mapGroup: 9,
      currentCoords: { x: 12, y: 13 },
      trainerRange_berryTreeId: 14,
      previousMetatileBehavior: 55,
      directionSequenceIndex: 6,
      playerCopyableMovement: 11
    });

    const scene = QL_RecordObjects([object]);

    expect(scene.objectEvents[0]).toMatchObject({
      active: true,
      invisible: true,
      fixedPriority: true,
      facingDirection: 3,
      currentElevation: 2,
      previousElevation: 1,
      graphicsId: 99,
      movementType: 4,
      trainerType: 5,
      localId: 7,
      mapNum: 8,
      mapGroup: 9,
      x: 12,
      y: 13,
      trainerRange_berryTreeId: 14,
      previousMetatileBehavior: 55,
      directionSequenceIndex: 6,
      animId: 11
    });
  });

  test('QL_LoadObjects restores template coords/ranges and previous coords in C probe order', () => {
    const object = createEmptyRuntimeObjectEvent();
    object.localId = 3;
    object.currentCoords = { x: 20, y: 30 };
    object.previousMetatileBehavior = 9;
    const scene = QL_RecordObjects([object]);
    const templates: ObjectEventTemplateLike[] = [{ localId: 3, x: 4, y: 5, movementRangeX: 6, movementRangeY: 7 }];
    const getBehavior = (x: number, y: number): number => {
      if (x === 19 && y === 30) {
        return 9;
      }
      if (x === 20 && y === 30) {
        return 1;
      }
      return 0;
    };

    const [loaded] = QL_LoadObjects(scene, templates, getBehavior);

    expect(loaded.initialCoords).toEqual({ x: 4 + MAP_OFFSET, y: 5 + MAP_OFFSET });
    expect(loaded.rangeX).toBe(6);
    expect(loaded.rangeY).toBe(7);
    expect(loaded.currentMetatileBehavior).toBe(1);
    expect(loaded.previousCoords).toEqual({ x: 19, y: 30 });
  });

  test('QL_TryStopSurfing only stops surfing during playback on non-surfable metatile', () => {
    const object = createEmptyRuntimeObjectEvent();
    object.fieldEffectSpriteId = 4;
    const player = { avatarMode: 'surfing' };

    QL_TryStopSurfing('recording', player, object, { x: 1, y: 1 }, () => 0, () => false);
    expect(player.avatarMode).toBe('surfing');

    QL_TryStopSurfing('playback', player, object, { x: 1, y: 1 }, () => 0, () => false);
    expect(player).toMatchObject({
      avatarMode: 'normal',
      transitionFlags: 'PLAYER_AVATAR_FLAG_ON_FOOT',
      fieldEffectSpriteDestroyed: true
    });
  });
});
