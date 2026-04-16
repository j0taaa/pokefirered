import type { CameraState } from '../core/camera';
import type { PlayerState } from '../game/player';
import type { TileMap } from '../world/tileMap';

const MAP_TILE_SIZE = 16;
const SUB_TILE_SIZE = 8;
const NUM_TILES_IN_PRIMARY = 640;
const NUM_METATILES_IN_PRIMARY = 640;
const METATILE_ENTRIES = 8;
const NUM_PALS_IN_PRIMARY = 7;

const METATILE_LAYER_TYPE_COVERED = 1;

const BG_TILE_INDEX_MASK = 0x03ff;
const BG_TILE_HFLIP_MASK = 0x0400;
const BG_TILE_VFLIP_MASK = 0x0800;
const BG_TILE_PALETTE_MASK = 0xf000;
const BG_TILE_PALETTE_SHIFT = 12;
const PNG_SIGNATURE_BYTES = 8;

type Facing = PlayerState['facing'];

interface CharacterSpriteDrawRequest {
  animationTime: number;
  camera: CameraState;
  facing: Facing;
  graphicsId?: string;
  moving: boolean;
  position: { x: number; y: number };
}

interface LoadedGraphic {
  image: HTMLImageElement;
  path: string;
}

interface MapVisualTexture {
  base: HTMLCanvasElement;
  cover: HTMLCanvasElement | null;
}

type PaletteColor = [number, number, number, number];

interface TilesetRenderSource {
  image: HTMLImageElement;
  paletteLookup: Map<string, number>;
  palettes: PaletteColor[][];
  pixelCanvas: HTMLCanvasElement;
  pixelCtx: CanvasRenderingContext2D;
}

interface PreparedMapTextures {
  visuals: NonNullable<TileMap['visual']>;
  metatiles: Map<number, MapVisualTexture>;
}

const objectGraphicModules = import.meta.glob('../../../graphics/object_events/pics/**/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const tilesetImageModules = import.meta.glob('../../../data/tilesets/{primary,secondary}/*/tiles.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const metatileBinaryModules = import.meta.glob('../../../data/tilesets/{primary,secondary}/*/metatiles.bin', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>;

const paletteModules = import.meta.glob('../../../data/tilesets/{primary,secondary}/*/palettes/*.pal', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>;

const objectGraphicUrls = new Map<string, { path: string; url: string }>();
for (const [modulePath, url] of Object.entries(objectGraphicModules)) {
  const key = modulePath.split('/').at(-1)?.replace(/\.png$/u, '');
  if (key && !objectGraphicUrls.has(key)) {
    objectGraphicUrls.set(key, { path: modulePath, url });
  }
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'sync';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image "${url}".`));
    image.src = url;
  });

const loadBinary = async (url: string): Promise<Uint16Array> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load binary asset "${url}".`);
  }

  return new Uint16Array(await response.arrayBuffer());
};

const loadText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load text asset "${url}".`);
  }

  return response.text();
};

const parsePngPalette = (buffer: ArrayBuffer): PaletteColor[] => {
  const bytes = new Uint8Array(buffer);
  let offset = PNG_SIGNATURE_BYTES;
  const palette: PaletteColor[] = [];
  let transparency: number[] | null = null;

  while (offset + 8 <= bytes.length) {
    const length = new DataView(buffer, offset, 4).getUint32(0);
    offset += 4;
    const type = String.fromCharCode(...bytes.slice(offset, offset + 4));
    offset += 4;
    const data = bytes.slice(offset, offset + length);
    offset += length + 4;

    if (type === 'PLTE') {
      for (let index = 0; index < data.length; index += 3) {
        palette.push([
          data[index] ?? 0,
          data[index + 1] ?? 0,
          data[index + 2] ?? 0,
          255
        ]);
      }
    } else if (type === 'tRNS') {
      transparency = [...data];
    } else if (type === 'IEND') {
      break;
    }
  }

  if (transparency) {
    for (let index = 0; index < Math.min(transparency.length, palette.length); index += 1) {
      palette[index][3] = transparency[index] ?? 255;
    }
  }

  return palette;
};

const parseJascPalette = (text: string): PaletteColor[] => {
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines[0] !== 'JASC-PAL' || lines.length < 4) {
    throw new Error('Unsupported palette file format.');
  }

  const colorCount = Number(lines[2]);
  const colors: PaletteColor[] = [];
  for (let index = 0; index < colorCount; index += 1) {
    const line = lines[index + 3];
    const [r, g, b] = line.split(/\s+/u).map((value) => Number(value));
    colors.push([r ?? 0, g ?? 0, b ?? 0, 255]);
  }

  if (colors[0]) {
    colors[0] = [colors[0][0], colors[0][1], colors[0][2], 0];
  }

  return colors;
};

const colorKey = (r: number, g: number, b: number, a: number): string => `${r},${g},${b},${a}`;

const createTextureCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_TILE_SIZE;
  canvas.height = MAP_TILE_SIZE;
  return canvas;
};

const drawSubTile = (
  ctx: CanvasRenderingContext2D,
  tileEntry: number,
  primarySource: TilesetRenderSource,
  secondarySource: TilesetRenderSource,
  destX: number,
  destY: number
): void => {
  const tileIndex = tileEntry & BG_TILE_INDEX_MASK;
  const paletteNum = (tileEntry & BG_TILE_PALETTE_MASK) >>> BG_TILE_PALETTE_SHIFT;
  const flipX = (tileEntry & BG_TILE_HFLIP_MASK) !== 0;
  const flipY = (tileEntry & BG_TILE_VFLIP_MASK) !== 0;
  const source = tileIndex < NUM_TILES_IN_PRIMARY ? primarySource : secondarySource;
  const localTileIndex = tileIndex < NUM_TILES_IN_PRIMARY
    ? tileIndex
    : tileIndex - NUM_TILES_IN_PRIMARY;
  const tilesPerRow = Math.floor(source.image.width / SUB_TILE_SIZE);
  const sourceX = (localTileIndex % tilesPerRow) * SUB_TILE_SIZE;
  const sourceY = Math.floor(localTileIndex / tilesPerRow) * SUB_TILE_SIZE;
  const palette = source.palettes[paletteNum] ?? source.palettes[0];
  const sourcePixels = source.pixelCtx.getImageData(sourceX, sourceY, SUB_TILE_SIZE, SUB_TILE_SIZE);
  const destPixels = new ImageData(SUB_TILE_SIZE, SUB_TILE_SIZE);

  for (let pixelOffset = 0; pixelOffset < sourcePixels.data.length; pixelOffset += 4) {
    const sourceIndex = source.paletteLookup.get(colorKey(
      sourcePixels.data[pixelOffset] ?? 0,
      sourcePixels.data[pixelOffset + 1] ?? 0,
      sourcePixels.data[pixelOffset + 2] ?? 0,
      sourcePixels.data[pixelOffset + 3] ?? 255
    )) ?? 0;
    const [r, g, b, a] = palette[sourceIndex] ?? palette[0] ?? [0, 0, 0, 0];
    destPixels.data[pixelOffset] = r;
    destPixels.data[pixelOffset + 1] = g;
    destPixels.data[pixelOffset + 2] = b;
    destPixels.data[pixelOffset + 3] = sourceIndex === 0 ? 0 : a;
  }

  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = SUB_TILE_SIZE;
  tileCanvas.height = SUB_TILE_SIZE;
  const tileCtx = tileCanvas.getContext('2d');
  if (!tileCtx) {
    throw new Error('Unable to create subtile canvas.');
  }
  tileCtx.putImageData(destPixels, 0, 0);

  ctx.save();
  ctx.translate(destX + (flipX ? SUB_TILE_SIZE : 0), destY + (flipY ? SUB_TILE_SIZE : 0));
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(tileCanvas, 0, 0, SUB_TILE_SIZE, SUB_TILE_SIZE);
  ctx.restore();
};

const buildMetatileTexture = (
  layerType: number,
  entries: Uint16Array,
  primarySource: TilesetRenderSource,
  secondarySource: TilesetRenderSource
): MapVisualTexture => {
  const base = createTextureCanvas();
  const baseCtx = base.getContext('2d');
  if (!baseCtx) {
    throw new Error('Unable to create map texture canvas.');
  }

  const cover = layerType === METATILE_LAYER_TYPE_COVERED ? null : createTextureCanvas();
  const coverCtx = cover?.getContext('2d') ?? null;
  const positions: Array<[number, number]> = [
    [0, 0],
    [SUB_TILE_SIZE, 0],
    [0, SUB_TILE_SIZE],
    [SUB_TILE_SIZE, SUB_TILE_SIZE]
  ];

  for (let index = 0; index < METATILE_ENTRIES; index += 1) {
    const [destX, destY] = positions[index % 4];
    const targetCtx = index < 4 || coverCtx === null ? baseCtx : coverCtx;
    drawSubTile(targetCtx, entries[index], primarySource, secondarySource, destX, destY);
  }

  return { base, cover };
};

const normalizeGraphicsId = (graphicsId: string): string =>
  graphicsId.replace(/^OBJ_EVENT_GFX_/u, '').toLowerCase();

const resolveObjectEventFrame = (
  facing: Facing,
  moving: boolean,
  animationTime: number
): { frame: number; flipX: boolean } => {
  if (!moving) {
    switch (facing) {
      case 'up':
        return { frame: 1, flipX: false };
      case 'left':
        return { frame: 2, flipX: false };
      case 'right':
        return { frame: 2, flipX: true };
      case 'down':
      default:
        return { frame: 0, flipX: false };
    }
  }

  const walkFrameIndex = Math.floor(animationTime * 8) % 4;
  switch (facing) {
    case 'up':
      return { frame: [5, 1, 6, 1][walkFrameIndex] ?? 1, flipX: false };
    case 'left':
      return { frame: [7, 2, 8, 2][walkFrameIndex] ?? 2, flipX: false };
    case 'right':
      return { frame: [7, 2, 8, 2][walkFrameIndex] ?? 2, flipX: true };
    case 'down':
    default:
      return { frame: [3, 0, 4, 0][walkFrameIndex] ?? 0, flipX: false };
  }
};

export class DecompTextureStore {
  private readonly graphicCache = new Map<string, LoadedGraphic | null>();
  private readonly graphicLoads = new Map<string, Promise<void>>();
  private readonly mapTextureCache = new Map<string, PreparedMapTextures | null>();
  private readonly mapTextureLoads = new Map<string, Promise<void>>();

  private async createTilesetRenderSource(kind: 'primary' | 'secondary', folder: string): Promise<TilesetRenderSource> {
    const imageUrl = this.getTilesetImageUrl(kind, folder);
    const paletteUrls = this.getPaletteUrls(kind, folder);
    const [image, imageBytes, ...paletteTexts] = await Promise.all([
      loadImage(imageUrl),
      fetch(imageUrl).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to load image bytes for "${imageUrl}".`);
        }

        return response.arrayBuffer();
      }),
      ...paletteUrls.map((url) => loadText(url))
    ]);

    const sourcePalette = parsePngPalette(imageBytes);
    const paletteLookup = new Map<string, number>();
    sourcePalette.forEach(([r, g, b, a], index) => {
      paletteLookup.set(colorKey(r, g, b, a), index);
    });

    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = image.width;
    pixelCanvas.height = image.height;
    const pixelCtx = pixelCanvas.getContext('2d');
    if (!pixelCtx) {
      throw new Error('Unable to create tileset source canvas.');
    }
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(image, 0, 0);

    const palettes = paletteTexts.map((text) => parseJascPalette(text));
    if (kind === 'primary' && palettes[0]?.[0]) {
      palettes[0][0] = [0, 0, 0, 0];
    }
    if (kind === 'secondary') {
      for (let index = 0; index < Math.min(NUM_PALS_IN_PRIMARY, palettes.length); index += 1) {
        if (palettes[index]?.[0]) {
          palettes[index][0] = [0, 0, 0, 0];
        }
      }
    }

    return {
      image,
      paletteLookup,
      palettes,
      pixelCanvas,
      pixelCtx
    };
  }

  ensureMapTextures(map: TileMap): void {
    if (!map.visual || this.mapTextureCache.has(map.id) || this.mapTextureLoads.has(map.id)) {
      return;
    }

    const loadPromise = this.buildMapTextures(map)
      .then((prepared) => {
        this.mapTextureCache.set(map.id, prepared);
      })
      .catch((error) => {
        console.error(error);
        this.mapTextureCache.set(map.id, null);
      })
      .finally(() => {
        this.mapTextureLoads.delete(map.id);
      });

    this.mapTextureLoads.set(map.id, loadPromise);
  }

  drawMapBase(
    ctx: CanvasRenderingContext2D,
    map: TileMap,
    camera: CameraState,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): boolean {
    const prepared = this.mapTextureCache.get(map.id);
    if (!prepared || !map.visual) {
      return false;
    }

    this.drawMapPass(ctx, prepared, map, camera, startX, startY, endX, endY, 'base');
    return true;
  }

  drawMapCover(
    ctx: CanvasRenderingContext2D,
    map: TileMap,
    camera: CameraState,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): boolean {
    const prepared = this.mapTextureCache.get(map.id);
    if (!prepared || !map.visual) {
      return false;
    }

    this.drawMapPass(ctx, prepared, map, camera, startX, startY, endX, endY, 'cover');
    return true;
  }

  drawCharacterSprite(ctx: CanvasRenderingContext2D, request: CharacterSpriteDrawRequest): boolean {
    const { graphicsId } = request;
    if (!graphicsId) {
      return false;
    }

    const graphic = this.graphicCache.get(graphicsId);
    if (graphic === undefined) {
      this.ensureGraphic(graphicsId);
      return false;
    }

    if (!graphic) {
      return false;
    }

    if (graphic.path.includes('/people/')) {
      this.drawPersonSprite(ctx, graphic.image, request);
      return true;
    }

    this.drawStaticSprite(ctx, graphic.image, request.camera, request.position);
    return true;
  }

  private async buildMapTextures(map: TileMap): Promise<PreparedMapTextures> {
    if (!map.visual) {
      throw new Error(`Map "${map.id}" does not include visual data.`);
    }

    const primaryMetatileUrl = this.getMetatileBinaryUrl('primary', map.visual.primaryTileset);
    const secondaryMetatileUrl = this.getMetatileBinaryUrl('secondary', map.visual.secondaryTileset);

    const [primarySource, secondarySource, primaryMetatiles, secondaryMetatiles] = await Promise.all([
      this.createTilesetRenderSource('primary', map.visual.primaryTileset),
      this.createTilesetRenderSource('secondary', map.visual.secondaryTileset),
      loadBinary(primaryMetatileUrl),
      loadBinary(secondaryMetatileUrl)
    ]);

    const metatiles = new Map<number, MapVisualTexture>();
    for (let tileIndex = 0; tileIndex < map.visual.metatileIds.length; tileIndex += 1) {
      const metatileId = map.visual.metatileIds[tileIndex];
      if (metatiles.has(metatileId)) {
        continue;
      }

      const sourceMetatiles = metatileId < NUM_METATILES_IN_PRIMARY
        ? primaryMetatiles
        : secondaryMetatiles;
      const localMetatileId = metatileId < NUM_METATILES_IN_PRIMARY
        ? metatileId
        : metatileId - NUM_METATILES_IN_PRIMARY;
      const start = localMetatileId * METATILE_ENTRIES;
      const entries = sourceMetatiles.slice(start, start + METATILE_ENTRIES);
      const layerType = map.visual.layerTypes[tileIndex] ?? 0;

      metatiles.set(
        metatileId,
        buildMetatileTexture(layerType, entries, primarySource, secondarySource)
      );
    }

    return {
      visuals: map.visual,
      metatiles
    };
  }

  private drawMapPass(
    ctx: CanvasRenderingContext2D,
    prepared: PreparedMapTextures,
    map: TileMap,
    camera: CameraState,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    pass: 'base' | 'cover'
  ): void {
    for (let tileY = startY; tileY < endY; tileY += 1) {
      for (let tileX = startX; tileX < endX; tileX += 1) {
        const tileIndex = tileY * map.width + tileX;
        const metatileId = prepared.visuals.metatileIds[tileIndex];
        const texture = prepared.metatiles.get(metatileId);
        if (!texture) {
          continue;
        }

        const image = pass === 'base' ? texture.base : texture.cover;
        if (!image) {
          continue;
        }

        ctx.drawImage(
          image,
          tileX * map.tileSize - camera.x,
          tileY * map.tileSize - camera.y,
          map.tileSize,
          map.tileSize
        );
      }
    }
  }

  private drawPersonSprite(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    request: CharacterSpriteDrawRequest
  ): void {
    const frameWidth = image.width / 9;
    const frameHeight = image.height;
    const { frame, flipX } = resolveObjectEventFrame(
      request.facing,
      request.moving,
      request.animationTime
    );

    const drawX = Math.round(request.position.x - request.camera.x + (MAP_TILE_SIZE - frameWidth) / 2);
    const drawY = Math.round(request.position.y - request.camera.y + MAP_TILE_SIZE - frameHeight);

    ctx.save();
    ctx.translate(drawX + (flipX ? frameWidth : 0), drawY);
    ctx.scale(flipX ? -1 : 1, 1);
    ctx.drawImage(
      image,
      frame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
    ctx.restore();
  }

  private drawStaticSprite(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    camera: CameraState,
    position: { x: number; y: number }
  ): void {
    const frameWidth = Math.min(MAP_TILE_SIZE, image.width);
    const frameHeight = image.height;
    const drawX = Math.round(position.x - camera.x + (MAP_TILE_SIZE - frameWidth) / 2);
    const drawY = Math.round(position.y - camera.y + MAP_TILE_SIZE - frameHeight);

    ctx.drawImage(image, 0, 0, frameWidth, frameHeight, drawX, drawY, frameWidth, frameHeight);
  }

  private ensureGraphic(graphicsId: string): void {
    if (this.graphicCache.has(graphicsId) || this.graphicLoads.has(graphicsId)) {
      return;
    }

    const resolved = objectGraphicUrls.get(normalizeGraphicsId(graphicsId));
    if (!resolved) {
      this.graphicCache.set(graphicsId, null);
      return;
    }

    const loadPromise = loadImage(resolved.url)
      .then((image) => {
        this.graphicCache.set(graphicsId, {
          image,
          path: resolved.path
        });
      })
      .catch((error) => {
        console.error(error);
        this.graphicCache.set(graphicsId, null);
      })
      .finally(() => {
        this.graphicLoads.delete(graphicsId);
      });

    this.graphicLoads.set(graphicsId, loadPromise);
  }

  private getTilesetImageUrl(kind: 'primary' | 'secondary', folder: string): string {
    const match = Object.entries(tilesetImageModules).find(([modulePath]) =>
      modulePath.includes(`/data/tilesets/${kind}/${folder}/tiles.png`)
    );
    if (!match) {
      throw new Error(`Unable to find ${kind} tileset image for "${folder}".`);
    }

    return match[1];
  }

  private getMetatileBinaryUrl(kind: 'primary' | 'secondary', folder: string): string {
    const match = Object.entries(metatileBinaryModules).find(([modulePath]) =>
      modulePath.includes(`/data/tilesets/${kind}/${folder}/metatiles.bin`)
    );
    if (!match) {
      throw new Error(`Unable to find ${kind} metatile data for "${folder}".`);
    }

    return match[1];
  }

  private getPaletteUrls(kind: 'primary' | 'secondary', folder: string): string[] {
    return Object.entries(paletteModules)
      .filter(([modulePath]) => modulePath.includes(`/data/tilesets/${kind}/${folder}/palettes/`))
      .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath, undefined, { numeric: true }))
      .map(([, url]) => url);
  }
}
