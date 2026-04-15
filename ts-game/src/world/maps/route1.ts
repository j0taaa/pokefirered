import type { CompactMapSource } from '../mapSource';

// Route 1 exported from the decomp data:
// data/maps/Route1/map.json + data/layouts/Route1/map.bin.
// "." means MAPGRID_COLLISION_MASK == 0; "#" means non-zero collision.
export const route1CompactMapSource: CompactMapSource = {
  id: 'MAP_ROUTE1',
  width: 24,
  height: 40,
  tileSize: 16,
  collisionRows: [
    '##########....##########',
    '##########....##########',
    '##....................##',
    '##....................##',
    '##......##............##',
    '################......##',
    '##......##............##',
    '##......##............##',
    '##......##............##',
    '##......##............##',
    '##########............##',
    '##......##............##',
    '##....................##',
    '##....................##',
    '##....................##',
    '################......##',
    '####......######......##',
    '##....................##',
    '##....................##',
    '##....................##',
    '####.####..#############',
    '##....................##',
    '##....................##',
    '##....................##',
    '##....................##',
    '############..........##',
    '############......######',
    '##....................##',
    '##....................##',
    '##....................##',
    '##....................##',
    '######...###############',
    '##....................##',
    '##....................##',
    '##....................##',
    '##....................##',
    '############..##########',
    '##.........#..#.......##',
    '############..##########',
    '############..##########'
  ],
  triggers: [
    {
      id: 'Route1_EventScript_RouteSign',
      x: 9,
      y: 31,
      activation: 'interact',
      scriptId: 'Route1_EventScript_RouteSign',
      facing: 'any',
      once: false
    }
  ],
  npcs: [
    {
      id: 'Route1_ObjectEvent_MartClerk',
      x: 6,
      y: 28,
      graphicsId: 'OBJ_EVENT_GFX_CLERK',
      movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      scriptId: 'Route1_EventScript_MartClerk',
      flag: '0'
    },
    {
      id: 'Route1_ObjectEvent_Boy',
      x: 19,
      y: 16,
      graphicsId: 'OBJ_EVENT_GFX_BOY',
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT',
      movementRangeX: 1,
      movementRangeY: 3,
      scriptId: 'Route1_EventScript_Boy',
      flag: '0'
    }
  ]
};
