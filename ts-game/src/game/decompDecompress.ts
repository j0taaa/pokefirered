export const SPECIES_UNOWN = 201;
export const SPECIES_DEOXYS = 410;
export const NUM_SPECIES = 412;
export const SPECIES_UNOWN_B = NUM_SPECIES + 1;

export interface CompressedSpriteSheet {
  data: Uint8Array;
  size: number;
  tag: number;
}

export interface CompressedSpritePalette {
  data: Uint8Array;
  tag: number;
}

export interface SpriteSheet {
  data: Uint8Array;
  size: number;
  tag: number;
}

export interface SpritePalette {
  data: Uint8Array;
  tag: number;
}

export interface DecompressRuntime {
  decompressionBuffer: Uint8Array;
  monFrontPicTable: readonly CompressedSpriteSheet[];
  monBackPicTable: readonly CompressedSpriteSheet[];
  loadedSpriteSheets: SpriteSheet[];
  loadedSpritePalettes: SpritePalette[];
  spindaSpotCalls: Array<{
    species: number;
    personality: number;
    isFrontPic: boolean;
    dest: Uint8Array;
  }>;
  allocationsFail: boolean;
}

export const createDecompressRuntime = (
  frontPicTable: readonly CompressedSpriteSheet[] = [],
  backPicTable: readonly CompressedSpriteSheet[] = [],
  decompressionBufferSize = 0x8000
): DecompressRuntime => ({
  decompressionBuffer: new Uint8Array(decompressionBufferSize),
  monFrontPicTable: frontPicTable,
  monBackPicTable: backPicTable,
  loadedSpriteSheets: [],
  loadedSpritePalettes: [],
  spindaSpotCalls: [],
  allocationsFail: false
});

export const getDecompressedDataSize = (ptr: Uint8Array): number =>
  (ptr[1] | (ptr[2] << 8) | (ptr[3] << 16)) >>> 0;

export const lz77UnComp = (src: Uint8Array, dest?: Uint8Array): Uint8Array => {
  const output = dest ?? new Uint8Array(getDecompressedDataSize(src));
  let srcOffset = 4;
  let destOffset = 0;

  while (destOffset < output.length) {
    const flags = src[srcOffset++];
    for (let bit = 7; bit >= 0 && destOffset < output.length; bit -= 1) {
      if ((flags & (1 << bit)) === 0) {
        output[destOffset++] = src[srcOffset++];
      } else {
        const byte1 = src[srcOffset++];
        const byte2 = src[srcOffset++];
        const length = (byte1 >> 4) + 3;
        const displacement = (((byte1 & 0xf) << 8) | byte2) + 1;
        for (let i = 0; i < length && destOffset < output.length; i += 1) {
          output[destOffset] = output[destOffset - displacement];
          destOffset += 1;
        }
      }
    }
  }

  return output;
};

export const lzDecompressWram = (src: Uint8Array, dest?: Uint8Array): Uint8Array =>
  lz77UnComp(src, dest);

export const lzDecompressVram = (src: Uint8Array, dest?: Uint8Array): Uint8Array =>
  lz77UnComp(src, dest);

const loadSpriteSheet = (runtime: DecompressRuntime, sheet: SpriteSheet): number => {
  runtime.loadedSpriteSheets.push(sheet);
  return sheet.tag;
};

const loadSpritePalette = (runtime: DecompressRuntime, palette: SpritePalette): void => {
  runtime.loadedSpritePalettes.push(palette);
};

export const loadCompressedSpriteSheet = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet
): number => {
  lz77UnComp(src.data, runtime.decompressionBuffer);
  return loadSpriteSheet(runtime, {
    data: runtime.decompressionBuffer,
    size: src.size,
    tag: src.tag
  });
};

export const loadCompressedSpriteSheetOverrideBuffer = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  buffer: Uint8Array
): void => {
  lz77UnComp(src.data, buffer);
  loadSpriteSheet(runtime, {
    data: buffer,
    size: src.size,
    tag: src.tag
  });
};

export const loadCompressedSpritePalette = (
  runtime: DecompressRuntime,
  src: CompressedSpritePalette
): void => {
  lz77UnComp(src.data, runtime.decompressionBuffer);
  loadSpritePalette(runtime, {
    data: runtime.decompressionBuffer,
    tag: src.tag
  });
};

export const loadCompressedSpritePaletteOverrideBuffer = (
  runtime: DecompressRuntime,
  src: CompressedSpritePalette,
  buffer: Uint8Array
): void => {
  lz77UnComp(src.data, buffer);
  loadSpritePalette(runtime, {
    data: buffer,
    tag: src.tag
  });
};

export const duplicateDeoxysTiles = (pointer: Uint8Array, species: number): void => {
  if (species === SPECIES_DEOXYS) {
    pointer.copyWithin(0, 0x800, 0x1000);
  }
};

export const drawSpindaSpots = (
  runtime: DecompressRuntime,
  species: number,
  personality: number,
  dest: Uint8Array,
  isFrontPic: boolean
): void => {
  runtime.spindaSpotCalls.push({ species, personality, dest, isFrontPic });
};

export const getUnownPicSpecies = (personality: number): number => {
  let species = (
    (((personality & 0x3000000) >>> 18)
      | ((personality & 0x30000) >>> 12)
      | ((personality & 0x300) >>> 6)
      | (personality & 3)) % 0x1c
  ) >>> 0;

  if (species === 0) {
    species = SPECIES_UNOWN;
  } else {
    species += SPECIES_UNOWN_B - 1;
  }
  return species;
};

const unknownMonSheet = (runtime: DecompressRuntime): CompressedSpriteSheet =>
  runtime.monFrontPicTable[0];

export const decompressPicFromTable = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  buffer: Uint8Array,
  species: number
): void => {
  if (species > NUM_SPECIES) {
    lz77UnComp(unknownMonSheet(runtime).data, buffer);
  } else {
    lz77UnComp(src.data, buffer);
  }
  duplicateDeoxysTiles(buffer, species);
};

export const decompressPicFromTableDontHandleDeoxys = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  buffer: Uint8Array,
  species: number
): void => {
  if (species > NUM_SPECIES) {
    lz77UnComp(unknownMonSheet(runtime).data, buffer);
  } else {
    lz77UnComp(src.data, buffer);
  }
};

export const loadSpecialPokePic = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  dest: Uint8Array,
  species: number,
  personality: number,
  isFrontPic: boolean
): void => {
  if (species === SPECIES_UNOWN) {
    const unownSpecies = getUnownPicSpecies(personality);
    const table = isFrontPic ? runtime.monFrontPicTable : runtime.monBackPicTable;
    lz77UnComp(table[unownSpecies].data, dest);
  } else if (species > NUM_SPECIES) {
    lz77UnComp(unknownMonSheet(runtime).data, dest);
  } else {
    lz77UnComp(src.data, dest);
  }

  duplicateDeoxysTiles(dest, species);
  drawSpindaSpots(runtime, species, personality, dest, isFrontPic);
};

export const loadSpecialPokePicDontHandleDeoxys = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  dest: Uint8Array,
  species: number,
  personality: number,
  isFrontPic: boolean
): void => {
  if (species === SPECIES_UNOWN) {
    const unownSpecies = getUnownPicSpecies(personality);
    const table = isFrontPic ? runtime.monFrontPicTable : runtime.monBackPicTable;
    lz77UnComp(table[unownSpecies].data, dest);
  } else if (species > NUM_SPECIES) {
    lz77UnComp(unknownMonSheet(runtime).data, dest);
  } else {
    lz77UnComp(src.data, dest);
  }
  drawSpindaSpots(runtime, species, personality, dest, isFrontPic);
};

export const handleLoadSpecialPokePic = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  dest: Uint8Array,
  species: number,
  personality: number
): void => {
  loadSpecialPokePic(
    runtime,
    src,
    dest,
    species,
    personality,
    src === runtime.monFrontPicTable[species]
  );
};

export const handleLoadSpecialPokePicDontHandleDeoxys = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet,
  dest: Uint8Array,
  species: number,
  personality: number
): void => {
  loadSpecialPokePicDontHandleDeoxys(
    runtime,
    src,
    dest,
    species,
    personality,
    src === runtime.monFrontPicTable[species]
  );
};

export const loadCompressedSpriteSheetUsingHeap = (
  runtime: DecompressRuntime,
  src: CompressedSpriteSheet
): boolean => {
  if (runtime.allocationsFail) {
    return true;
  }
  const buffer = new Uint8Array(getDecompressedDataSize(src.data));
  lz77UnComp(src.data, buffer);
  loadSpriteSheet(runtime, {
    data: buffer,
    size: src.size,
    tag: src.tag
  });
  return false;
};

export const loadCompressedSpritePaletteUsingHeap = (
  runtime: DecompressRuntime,
  src: CompressedSpritePalette
): boolean => {
  if (runtime.allocationsFail) {
    return true;
  }
  const buffer = new Uint8Array(getDecompressedDataSize(src.data));
  lz77UnComp(src.data, buffer);
  loadSpritePalette(runtime, {
    data: buffer,
    tag: src.tag
  });
  return false;
};

export const unusedLzDecompressWramIndirect = (
  src: { value: Uint8Array },
  dest: Uint8Array
): void => {
  lz77UnComp(src.value, dest);
};

export const stitchObjectsOn8x8Canvas = (
  objectSize: number,
  objectCount: number,
  srcTiles: Uint8Array,
  destTiles: Uint8Array
): void => {
  let src = 0;
  let dest = 0;

  if ((objectSize & 1) !== 0) {
    const bottomOff = (objectSize >> 1) + 4;
    for (let l = 0; l < objectCount; l += 1) {
      for (let j = 0; j < 8 - objectSize; j += 1) {
        for (let k = 0; k < 8; k += 1) {
          for (let i = 0; i < 16; i += 1) {
            if ((j % 2) === 0) {
              destTiles[dest + i + (k << 5) + ((j >> 1) << 8)] = 0;
              destTiles[(bottomOff << 8) + dest + i + (k << 5) + 16 + ((j >> 1) << 8)] = 0;
            } else {
              destTiles[dest + i + (k << 5) + 16 + ((j >> 1) << 8)] = 0;
              destTiles[(bottomOff << 8) + dest + i + (k << 5) + 256 + ((j >> 1) << 8)] = 0;
            }
          }
        }
      }

      for (let j = 0; j < 2; j += 1) {
        for (let i = 0; i < 8; i += 1) {
          for (let k = 0; k < 32; k += 1) {
            destTiles[dest + k + (i << 8) + (j << 5)] = 0;
            destTiles[dest + k + (i << 8) + (j << 5) + 192] = 0;
          }
        }
      }

      if (objectSize === 5) {
        dest += 0x120;
      }

      for (let j = 0; j < objectSize; j += 1) {
        for (let k = 0; k < objectSize; k += 1) {
          for (let i = 0; i < 4; i += 1) {
            destTiles[dest + (i << 2) + 18] = srcTiles[src + (i << 2)];
            destTiles[dest + (i << 2) + 19] = srcTiles[src + (i << 2) + 1];
            destTiles[dest + (i << 2) + 48] = srcTiles[src + (i << 2) + 2];
            destTiles[dest + (i << 2) + 49] = srcTiles[src + (i << 2) + 3];

            destTiles[dest + (i << 2) + 258] = srcTiles[src + (i << 2) + 16];
            destTiles[dest + (i << 2) + 259] = srcTiles[src + (i << 2) + 17];
            destTiles[dest + (i << 2) + 288] = srcTiles[src + (i << 2) + 18];
            destTiles[dest + (i << 2) + 289] = srcTiles[src + (i << 2) + 19];
          }
          src += 32;
          dest += 32;
        }

        if (objectSize === 7) {
          dest += 0x20;
        } else if (objectSize === 5) {
          dest += 0x60;
        }
      }

      if (objectSize === 7) {
        dest += 0x100;
      } else if (objectSize === 5) {
        dest += 0x1e0;
      }
    }
  } else {
    for (let i = 0; i < objectCount; i += 1) {
      if (objectSize === 6) {
        for (let k = 0; k < 256; k += 1) {
          destTiles[dest] = 0;
          dest += 1;
        }
      }

      for (let j = 0; j < objectSize; j += 1) {
        if (objectSize === 6) {
          for (let k = 0; k < 32; k += 1) {
            destTiles[dest] = 0;
            dest += 1;
          }
        }

        for (let k = 0; k < 32 * objectSize; k += 1) {
          destTiles[dest] = srcTiles[src];
          src += 1;
          dest += 1;
        }

        if (objectSize === 6) {
          for (let k = 0; k < 32; k += 1) {
            destTiles[dest] = 0;
            dest += 1;
          }
        }
      }

      if (objectSize === 6) {
        for (let k = 0; k < 256; k += 1) {
          destTiles[dest] = 0;
          dest += 1;
        }
      }
    }
  }
};

export const LZDecompressWram = lzDecompressWram;
export const LZDecompressVram = lzDecompressVram;
export const LoadCompressedSpriteSheet = loadCompressedSpriteSheet;
export const LoadCompressedSpriteSheetOverrideBuffer = loadCompressedSpriteSheetOverrideBuffer;
export const LoadCompressedSpritePalette = loadCompressedSpritePalette;
export const LoadCompressedSpritePaletteOverrideBuffer = loadCompressedSpritePaletteOverrideBuffer;
export const DecompressPicFromTable = decompressPicFromTable;
export const HandleLoadSpecialPokePic = handleLoadSpecialPokePic;
export const LoadSpecialPokePic = loadSpecialPokePic;
export const DuplicateDeoxysTiles = duplicateDeoxysTiles;
export const Unused_LZDecompressWramIndirect = unusedLzDecompressWramIndirect;
export const StitchObjectsOn8x8Canvas = stitchObjectsOn8x8Canvas;
export const LoadCompressedSpriteSheetUsingHeap = loadCompressedSpriteSheetUsingHeap;
export const LoadCompressedSpritePaletteUsingHeap = loadCompressedSpritePaletteUsingHeap;
export const GetDecompressedDataSize = getDecompressedDataSize;
export const DecompressPicFromTable_DontHandleDeoxys = decompressPicFromTableDontHandleDeoxys;
export const HandleLoadSpecialPokePic_DontHandleDeoxys = handleLoadSpecialPokePicDontHandleDeoxys;
export const LoadSpecialPokePic_DontHandleDeoxys = loadSpecialPokePicDontHandleDeoxys;
