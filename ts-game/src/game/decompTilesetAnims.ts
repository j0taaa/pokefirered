export const TILE_SIZE_4BPP = 32;
export const TILESET_DMA_BUFFER_CAPACITY = 20;

export type TilesetAnimCallbackName =
  | 'TilesetAnim_General'
  | 'TilesetAnim_CeladonCity'
  | 'TilesetAnim_SilphCo'
  | 'TilesetAnim_MtEmber'
  | 'TilesetAnim_VermilionGym'
  | 'TilesetAnim_CeladonGym';

export type TilesetInitCallbackName =
  | 'InitTilesetAnim_General'
  | 'InitTilesetAnim_CeladonCity'
  | 'InitTilesetAnim_SilphCo'
  | 'InitTilesetAnim_MtEmber'
  | 'InitTilesetAnim_VermilionGym'
  | 'InitTilesetAnim_CeladonGym';

export interface TilesetDmaTransfer {
  src: string | null;
  dest: number;
  size: number;
}

export interface TilesetAnimRuntime {
  transferBuffer: TilesetDmaTransfer[];
  primaryCounter: number;
  primaryCounterMax: number;
  secondaryCounter: number;
  secondaryCounterMax: number;
  primaryCallback: TilesetAnimCallbackName | null;
  secondaryCallback: TilesetAnimCallbackName | null;
  primaryTilesetCallback: TilesetInitCallbackName | null;
  secondaryTilesetCallback: TilesetInitCallbackName | null;
  dmaCopyLog: Array<{ channel: number; src: string | null; dest: number; size: number }>;
}

const frameNames = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_unused, i) => `${prefix}_Frame${i}`);

export const sTilesetAnimsGeneralFlower = frameNames('sTilesetAnims_General_Flower', 5);
export const sTilesetAnimsGeneralWaterCurrentLandWatersEdge = frameNames(
  'sTilesetAnims_General_Water_Current_LandWatersEdge',
  8
);
export const sTilesetAnimsGeneralSandWatersEdge = frameNames(
  'sTilesetAnims_General_SandWatersEdge',
  8
);
export const sTilesetAnimsCeladonCityFountain = frameNames(
  'sTilesetAnims_CeladonCity_Fountain',
  5
);
export const sTilesetAnimsSilphCoFountain = frameNames('sTilesetAnims_SilphCo_Fountain', 4);
export const sTilesetAnimsMtEmberSteam = frameNames('sTilesetAnims_MtEmber_Steam', 4);
export const sTilesetAnimsVermilionGymMotorizedDoor = frameNames(
  'sTilesetAnims_VermilionGym_MotorizedDoor',
  2
);
export const sTilesetAnimsCeladonGymFlowers = [
  'sTilesetAnims_CeladonGym_Flowers_Frame0',
  'sTilesetAnims_CeladonGym_Flowers_Frame1',
  'sTilesetAnims_CeladonGym_Flowers_Frame2',
  'sTilesetAnims_CeladonGym_Flowers_Frame1'
];

export const createTilesetAnimRuntime = (): TilesetAnimRuntime => ({
  transferBuffer: [],
  primaryCounter: 0,
  primaryCounterMax: 0,
  secondaryCounter: 0,
  secondaryCounterMax: 0,
  primaryCallback: null,
  secondaryCallback: null,
  primaryTilesetCallback: null,
  secondaryTilesetCallback: null,
  dmaCopyLog: []
});

export const tileOffset4Bpp = (tile: number): number => tile * TILE_SIZE_4BPP;

export const resetTilesetAnimBuffer = (runtime: TilesetAnimRuntime): void => {
  runtime.transferBuffer = [];
};

export const appendTilesetAnimToBuffer = (
  runtime: TilesetAnimRuntime,
  src: string | null,
  dest: number,
  size: number
): void => {
  if (runtime.transferBuffer.length < TILESET_DMA_BUFFER_CAPACITY) {
    runtime.transferBuffer.push({ src, dest, size });
  }
};

export const transferTilesetAnimsBuffer = (runtime: TilesetAnimRuntime): void => {
  for (const transfer of runtime.transferBuffer) {
    runtime.dmaCopyLog.push({ channel: 3, ...transfer });
  }

  runtime.transferBuffer = [];
};

export const initTilesetAnimations = (runtime: TilesetAnimRuntime): void => {
  resetTilesetAnimBuffer(runtime);
  initPrimaryTilesetAnimation(runtime);
  initSecondaryTilesetAnimation(runtime);
};

export const initSecondaryTilesetAnimationPublic = (runtime: TilesetAnimRuntime): void => {
  initSecondaryTilesetAnimation(runtime);
};

export const updateTilesetAnimations = (runtime: TilesetAnimRuntime): void => {
  resetTilesetAnimBuffer(runtime);
  runtime.primaryCounter += 1;
  if (runtime.primaryCounter >= runtime.primaryCounterMax) {
    runtime.primaryCounter = 0;
  }
  runtime.secondaryCounter += 1;
  if (runtime.secondaryCounter >= runtime.secondaryCounterMax) {
    runtime.secondaryCounter = 0;
  }

  if (runtime.primaryCallback !== null) {
    runTilesetAnimCallback(runtime, runtime.primaryCallback, runtime.primaryCounter);
  }
  if (runtime.secondaryCallback !== null) {
    runTilesetAnimCallback(runtime, runtime.secondaryCallback, runtime.secondaryCounter);
  }
};

const initPrimaryTilesetAnimation = (runtime: TilesetAnimRuntime): void => {
  runtime.primaryCounter = 0;
  runtime.primaryCounterMax = 0;
  runtime.primaryCallback = null;
  if (runtime.primaryTilesetCallback !== null) {
    runTilesetInitCallback(runtime, runtime.primaryTilesetCallback);
  }
};

const initSecondaryTilesetAnimation = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 0;
  runtime.secondaryCallback = null;
  if (runtime.secondaryTilesetCallback !== null) {
    runTilesetInitCallback(runtime, runtime.secondaryTilesetCallback);
  }
};

export const queueAnimTilesGeneralFlower = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsGeneralFlower[timer % sTilesetAnimsGeneralFlower.length],
    tileOffset4Bpp(508),
    4 * TILE_SIZE_4BPP
  );
};

export const queueAnimTilesGeneralWaterCurrentLandWatersEdge = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsGeneralWaterCurrentLandWatersEdge[
      timer % sTilesetAnimsGeneralWaterCurrentLandWatersEdge.length
    ],
    tileOffset4Bpp(416),
    48 * TILE_SIZE_4BPP
  );
};

export const queueAnimTilesGeneralSandWatersEdge = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsGeneralSandWatersEdge[timer % sTilesetAnimsGeneralSandWatersEdge.length],
    tileOffset4Bpp(464),
    18 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimGeneral = (runtime: TilesetAnimRuntime, timer: number): void => {
  if (timer % 8 === 0) {
    queueAnimTilesGeneralSandWatersEdge(runtime, Math.trunc(timer / 8));
  }
  if (timer % 16 === 1) {
    queueAnimTilesGeneralWaterCurrentLandWatersEdge(runtime, Math.trunc(timer / 16));
  }
  if (timer % 16 === 2) {
    queueAnimTilesGeneralFlower(runtime, Math.trunc(timer / 16));
  }
};

export const initTilesetAnimGeneral = (runtime: TilesetAnimRuntime): void => {
  runtime.primaryCounter = 0;
  runtime.primaryCounterMax = 640;
  runtime.primaryCallback = 'TilesetAnim_General';
};

export const queueAnimTilesCeladonCityFountain = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsCeladonCityFountain[timer % sTilesetAnimsCeladonCityFountain.length],
    tileOffset4Bpp(744),
    8 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimCeladonCity = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  if (timer % 12 === 0) {
    queueAnimTilesCeladonCityFountain(runtime, Math.trunc(timer / 12));
  }
};

export const initTilesetAnimCeladonCity = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 120;
  runtime.secondaryCallback = 'TilesetAnim_CeladonCity';
};

export const queueAnimTilesSilphCoFountain = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsSilphCoFountain[timer % sTilesetAnimsSilphCoFountain.length],
    tileOffset4Bpp(976),
    8 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimSilphCo = (runtime: TilesetAnimRuntime, timer: number): void => {
  if (timer % 10 === 0) {
    queueAnimTilesSilphCoFountain(runtime, Math.trunc(timer / 10));
  }
};

export const initTilesetAnimSilphCo = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 160;
  runtime.secondaryCallback = 'TilesetAnim_SilphCo';
};

export const queueAnimTilesMtEmberSteam = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsMtEmberSteam[timer % sTilesetAnimsMtEmberSteam.length],
    tileOffset4Bpp(896),
    8 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimMtEmber = (runtime: TilesetAnimRuntime, timer: number): void => {
  if (timer % 16 === 0) {
    queueAnimTilesMtEmberSteam(runtime, Math.trunc(timer / 16));
  }
};

export const initTilesetAnimMtEmber = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 256;
  runtime.secondaryCallback = 'TilesetAnim_MtEmber';
};

export const queueAnimTilesVermilionGymMotorizedDoor = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  const i = timer % sTilesetAnimsVermilionGymMotorizedDoor.length;

  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsVermilionGymMotorizedDoor[i],
    tileOffset4Bpp(880),
    7 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimVermilionGym = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  if (timer % 2 === 0) {
    queueAnimTilesVermilionGymMotorizedDoor(runtime, Math.trunc(timer / 2));
  }
};

export const initTilesetAnimVermilionGym = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 240;
  runtime.secondaryCallback = 'TilesetAnim_VermilionGym';
};

export const queueAnimTilesCeladonGymFlowers = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  const i = timer % sTilesetAnimsCeladonGymFlowers.length;

  appendTilesetAnimToBuffer(
    runtime,
    sTilesetAnimsCeladonGymFlowers[i],
    tileOffset4Bpp(739),
    4 * TILE_SIZE_4BPP
  );
};

export const tilesetAnimCeladonGym = (
  runtime: TilesetAnimRuntime,
  timer: number
): void => {
  if (timer % 16 === 0) {
    queueAnimTilesCeladonGymFlowers(runtime, Math.trunc(timer / 16));
  }
};

export const initTilesetAnimCeladonGym = (runtime: TilesetAnimRuntime): void => {
  runtime.secondaryCounter = 0;
  runtime.secondaryCounterMax = 256;
  runtime.secondaryCallback = 'TilesetAnim_CeladonGym';
};

const runTilesetInitCallback = (
  runtime: TilesetAnimRuntime,
  callback: TilesetInitCallbackName
): void => {
  switch (callback) {
    case 'InitTilesetAnim_General':
      initTilesetAnimGeneral(runtime);
      break;
    case 'InitTilesetAnim_CeladonCity':
      initTilesetAnimCeladonCity(runtime);
      break;
    case 'InitTilesetAnim_SilphCo':
      initTilesetAnimSilphCo(runtime);
      break;
    case 'InitTilesetAnim_MtEmber':
      initTilesetAnimMtEmber(runtime);
      break;
    case 'InitTilesetAnim_VermilionGym':
      initTilesetAnimVermilionGym(runtime);
      break;
    case 'InitTilesetAnim_CeladonGym':
      initTilesetAnimCeladonGym(runtime);
      break;
  }
};

const runTilesetAnimCallback = (
  runtime: TilesetAnimRuntime,
  callback: TilesetAnimCallbackName,
  timer: number
): void => {
  switch (callback) {
    case 'TilesetAnim_General':
      tilesetAnimGeneral(runtime, timer);
      break;
    case 'TilesetAnim_CeladonCity':
      tilesetAnimCeladonCity(runtime, timer);
      break;
    case 'TilesetAnim_SilphCo':
      tilesetAnimSilphCo(runtime, timer);
      break;
    case 'TilesetAnim_MtEmber':
      tilesetAnimMtEmber(runtime, timer);
      break;
    case 'TilesetAnim_VermilionGym':
      tilesetAnimVermilionGym(runtime, timer);
      break;
    case 'TilesetAnim_CeladonGym':
      tilesetAnimCeladonGym(runtime, timer);
      break;
  }
};

export const ResetTilesetAnimBuffer = resetTilesetAnimBuffer;
export const AppendTilesetAnimToBuffer = appendTilesetAnimToBuffer;
export const TransferTilesetAnimsBuffer = transferTilesetAnimsBuffer;
export const InitTilesetAnimations = initTilesetAnimations;
export const InitSecondaryTilesetAnimation = initSecondaryTilesetAnimationPublic;
export const UpdateTilesetAnimations = updateTilesetAnimations;
export const _InitPrimaryTilesetAnimation = initPrimaryTilesetAnimation;
export const _InitSecondaryTilesetAnimation = initSecondaryTilesetAnimation;
export const QueueAnimTiles_General_Flower = queueAnimTilesGeneralFlower;
export const QueueAnimTiles_General_Water_Current_LandWatersEdge = queueAnimTilesGeneralWaterCurrentLandWatersEdge;
export const QueueAnimTiles_General_SandWatersEdge = queueAnimTilesGeneralSandWatersEdge;
export const TilesetAnim_General = tilesetAnimGeneral;
export const InitTilesetAnim_General = initTilesetAnimGeneral;
export const QueueAnimTiles_CeladonCity_Fountain = queueAnimTilesCeladonCityFountain;
export const TilesetAnim_CeladonCity = tilesetAnimCeladonCity;
export const InitTilesetAnim_CeladonCity = initTilesetAnimCeladonCity;
export const QueueAnimTiles_SilphCo_Fountain = queueAnimTilesSilphCoFountain;
export const TilesetAnim_SilphCo = tilesetAnimSilphCo;
export const InitTilesetAnim_SilphCo = initTilesetAnimSilphCo;
export const QueueAnimTiles_MtEmber_Steam = queueAnimTilesMtEmberSteam;
export const TilesetAnim_MtEmber = tilesetAnimMtEmber;
export const InitTilesetAnim_MtEmber = initTilesetAnimMtEmber;
export const QueueAnimTiles_VermilionGym_MotorizedDoor = queueAnimTilesVermilionGymMotorizedDoor;
export const TilesetAnim_VermilionGym = tilesetAnimVermilionGym;
export const InitTilesetAnim_VermilionGym = initTilesetAnimVermilionGym;
export const QueueAnimTiles_CeladonGym_Flowers = queueAnimTilesCeladonGymFlowers;
export const TilesetAnim_CeladonGym = tilesetAnimCeladonGym;
export const InitTilesetAnim_CeladonGym = initTilesetAnimCeladonGym;
