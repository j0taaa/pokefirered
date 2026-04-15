import type { CompactMapSource } from '../mapSource';

// Compact adapter generated from the original FireRed assets:
// data/maps/PalletTown/map.json + data/layouts/PalletTown/map.bin.
export const palletTownCompactMapSource: CompactMapSource = {
  id: 'MAP_PALLET_TOWN',
  metadata: {
    name: 'PalletTown',
    layout: 'LAYOUT_PALLET_TOWN',
    music: 'MUS_PALLET',
    regionMapSection: 'MAPSEC_PALLET_TOWN',
    weather: 'WEATHER_SUNNY',
    mapType: 'MAP_TYPE_TOWN',
    allowCycling: true,
    allowEscaping: false,
    allowRunning: true,
    showMapName: true,
    battleScene: 'MAP_BATTLE_SCENE_NORMAL',
    connections: [
      { map: 'MAP_ROUTE1', offset: 0, direction: 'up' },
      { map: 'MAP_ROUTE21_NORTH', offset: 0, direction: 'down' }
    ]
  },
  wildEncounters: {},
  width: 24,
  height: 20,
  tileSize: 16,
  collisionRows: [
    '############..##########',
    '############..##########',
    '##....................##',
    '##....................##',
    '##...#####....#####...##',
    '##...#####....#####...##',
    '##...#####....#####...##',
    '##..######...######...##',
    '##....................##',
    '##....................##',
    '##...........#######..##',
    '##...#####...#######..##',
    '##...........#######..##',
    '##...........#######..##',
    '##...#................##',
    '##....................##',
    '##...........######...##',
    '##....................##',
    '##....................##',
    '##....................##'
  ],
  encounterRows: [
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........WW..............',
    '.......WWWW.............',
    '.......WWWW.............'
  ],
  behaviorRows: [
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000840000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000084000000000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '000000000000000000000000000000008400000000000000',
    '000000000000000015150000000000000000000000000000',
    '000000000000001515151500000000000000000000000000',
    '000000000000001515151500000000000000000000000000'
  ],
  triggers: [
    {
      id: 'PalletTown_EventScript_OaksLabSign',
      x: 16,
      y: 16,
      activation: 'interact',
      scriptId: 'PalletTown_EventScript_OaksLabSign',
      facing: 'any',
      once: false
    },
    {
      id: 'PalletTown_EventScript_PlayersHouseSign',
      x: 4,
      y: 7,
      activation: 'interact',
      scriptId: 'PalletTown_EventScript_PlayersHouseSign',
      facing: 'any',
      once: false
    },
    {
      id: 'PalletTown_EventScript_RivalsHouseSign',
      x: 13,
      y: 7,
      activation: 'interact',
      scriptId: 'PalletTown_EventScript_RivalsHouseSign',
      facing: 'any',
      once: false
    },
    {
      id: 'PalletTown_EventScript_TownSign',
      x: 9,
      y: 11,
      activation: 'interact',
      scriptId: 'PalletTown_EventScript_TownSign',
      facing: 'any',
      once: false
    },
    {
      id: 'PalletTown_EventScript_TrainerTips',
      x: 5,
      y: 14,
      activation: 'interact',
      scriptId: 'PalletTown_EventScript_TrainerTips',
      facing: 'any',
      once: false
    }
  ],
  npcs: [
    {
      id: 'LOCALID_PALLET_SIGN_LADY',
      x: 3,
      y: 10,
      graphicsId: 'OBJ_EVENT_GFX_WOMAN_1',
      movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
      movementRangeX: 1,
      movementRangeY: 4,
      scriptId: 'PalletTown_EventScript_SignLady',
      flag: '0'
    },
    {
      id: 'LOCALID_PALLET_FAT_MAN',
      x: 13,
      y: 17,
      graphicsId: 'OBJ_EVENT_GFX_FAT_MAN',
      movementType: 'MOVEMENT_TYPE_WANDER_AROUND',
      movementRangeX: 6,
      movementRangeY: 2,
      scriptId: 'PalletTown_EventScript_FatMan',
      flag: '0'
    },
    {
      id: 'LOCALID_PALLET_PROF_OAK',
      x: 10,
      y: 8,
      graphicsId: 'OBJ_EVENT_GFX_PROF_OAK',
      movementType: 'MOVEMENT_TYPE_FACE_UP',
      movementRangeX: 1,
      movementRangeY: 1,
      scriptId: '0x0',
      flag: 'FLAG_HIDE_OAK_IN_PALLET_TOWN'
    }
  ]
};
