import menu2Source from '../../../src/menu2.c?raw';
import speciesConstantsSource from '../../../include/constants/species.h?raw';

export const PSA_MON_ATTR_TMHM_X_POS = 0;
export const PSA_MON_ATTR_TMHM_Y_POS = 1;
export const PSA_MON_ATTR_Y_OFFSET = 2;
export const PSA_MON_ATTR_ITEM_X_POS = 3;
export const PSA_MON_ATTR_ITEM_Y_POS = 4;
export const PSA_MON_ATTR_COUNT = 5;
export const REG_OFFSET_BLDALPHA = 0x52;
export const FONT_NORMAL = 1;
export const FONTATTR_LETTER_SPACING = 0;
export const FONTATTR_LINE_SPACING = 1;
export const FONTATTR_COLOR_FOREGROUND = 2;
export const FONTATTR_COLOR_BACKGROUND = 3;
export const FONTATTR_COLOR_SHADOW = 4;
export const NUM_UNOWN_FORMS = 28;

export type TextPrinterTemplate = {
  currentChar: string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
};

export type Menu2Task = {
  func: 'Task_SmoothBlendLayers';
  priority: number;
  data: number[];
  destroyed: boolean;
};

export type Bitmap4bpp = {
  width: number;
  height: number;
  pixels: number[];
};

export type Menu2Runtime = {
  tasks: Menu2Task[];
  gpuRegs: Map<number, number>;
  fontAttributes: Map<string, number>;
  gSaveBlock2Ptr: { playerName: string };
  gStringVar4: string;
  printers: Array<{ template: TextPrinterTemplate; speed: number; callback: unknown }>;
  operations: string[];
};

export const createMenu2Runtime = (): Menu2Runtime => ({
  tasks: [],
  gpuRegs: new Map(),
  fontAttributes: new Map([
    [`${FONT_NORMAL}:${FONTATTR_LETTER_SPACING}`, 1],
    [`${FONT_NORMAL}:${FONTATTR_LINE_SPACING}`, 2],
    [`${FONT_NORMAL}:${FONTATTR_COLOR_FOREGROUND}`, 3],
    [`${FONT_NORMAL}:${FONTATTR_COLOR_BACKGROUND}`, 0],
    [`${FONT_NORMAL}:${FONTATTR_COLOR_SHADOW}`, 1],
  ]),
  gSaveBlock2Ptr: { playerName: '' },
  gStringVar4: '',
  printers: [],
  operations: [],
});

export const SPECIES_CONSTANTS = parseSpeciesConstants(speciesConstantsSource);
export const SPECIES_NONE = SPECIES_CONSTANTS.SPECIES_NONE;
export const SPECIES_UNOWN = SPECIES_CONSTANTS.SPECIES_UNOWN;
export const SPECIES_OLD_UNOWN_B = SPECIES_CONSTANTS.SPECIES_OLD_UNOWN_B;
export const SPECIES_OLD_UNOWN_EMARK = SPECIES_CONSTANTS.NUM_SPECIES;
export const SPECIES_OLD_UNOWN_QMARK = SPECIES_CONSTANTS.NUM_SPECIES + 1;
export const sMonPosAttributes = parseMonPosAttributes(menu2Source, SPECIES_CONSTANTS);

function parseSpeciesConstants(source: string): Record<string, number> {
  const constants: Record<string, number> = {};
  let changed = true;
  while (changed) {
    changed = false;
    for (const [, name, expression] of source.matchAll(/^#define\s+(SPECIES_[A-Z0-9_]+|NUM_SPECIES)\s+(.+)$/gm)) {
      if (constants[name] !== undefined) continue;
      const value = evalConstantExpression(expression.replace(/\/\/.*$/, '').trim(), constants);
      if (value !== undefined) {
        constants[name] = value;
        changed = true;
      }
    }
  }
  return constants;
}

function evalConstantExpression(expression: string, constants: Record<string, number>): number | undefined {
  const substituted = expression.replace(/\b[A-Z][A-Z0-9_]*\b/g, (token) => {
    if (constants[token] === undefined) return `NaN`;
    return String(constants[token]);
  });
  if (!/^[\d\s()+\-*/%xXa-fA-F]+$/.test(substituted)) return undefined;
  const value = Function(`"use strict"; return (${substituted});`)() as number;
  return Number.isFinite(value) ? value : undefined;
}

function parseMonPosAttributes(source: string, constants: Record<string, number>): number[][] {
  const localConstants: Record<string, number> = {
    ...constants,
    SPECIES_OLD_UNOWN_EMARK: constants.NUM_SPECIES,
    SPECIES_OLD_UNOWN_QMARK: constants.NUM_SPECIES + 1,
  };
  const maxSpecies = Math.max(...Object.values(localConstants).filter(Number.isFinite));
  const table = Array.from({ length: maxSpecies }, () => Array(PSA_MON_ATTR_COUNT).fill(0));
  const body = (source.match(/static const u8 sMonPosAttributes\[\]\[PSA_MON_ATTR_COUNT\] = \{([\s\S]*?)\n\};/)?.[1] ?? '')
    .replace(/#if defined\(FIRERED\)([\s\S]*?)#elif defined\(LEAFGREEN\)[\s\S]*?#endif/g, '$1');
  for (const [, speciesToken, values] of body.matchAll(/\[(SPECIES_[A-Z0-9_]+)\s*-\s*1\]\s*=\s*\{([^}]+)\}/g)) {
    const species = localConstants[speciesToken];
    if (species === undefined) continue;
    table[species - 1] = values.split(',').map((value) => Number(value.trim())).slice(0, PSA_MON_ATTR_COUNT);
  }
  return table;
}

export const GetFontAttribute = (runtime: Menu2Runtime, fontId: number, attribute: number): number => runtime.fontAttributes.get(`${fontId}:${attribute}`) ?? 0;

export const AddTextPrinter = (runtime: Menu2Runtime, printer: TextPrinterTemplate, speed: number, callback: unknown): void => {
  runtime.printers.push({ template: { ...printer }, speed, callback });
  runtime.operations.push(`AddTextPrinter:${printer.windowId}:${printer.fontId}:${printer.x}:${printer.y}:${speed}`);
};

export function AddTextPrinterParameterized3(runtime: Menu2Runtime, windowId: number, fontId: number, x: number, y: number, color: readonly number[], speed: number, str: string): void {
  const printer: TextPrinterTemplate = {
    currentChar: str,
    windowId,
    fontId,
    x,
    y,
    currentX: x,
    currentY: y,
    letterSpacing: GetFontAttribute(runtime, fontId, FONTATTR_LETTER_SPACING),
    lineSpacing: GetFontAttribute(runtime, fontId, FONTATTR_LINE_SPACING),
    unk: 0,
    fgColor: color[1],
    bgColor: color[0],
    shadowColor: color[2],
  };
  AddTextPrinter(runtime, printer, speed, null);
}

export function AddTextPrinterParameterized4(runtime: Menu2Runtime, windowId: number, fontId: number, x: number, y: number, letterSpacing: number, lineSpacing: number, color: readonly number[], speed: number, str: string): void {
  const printer: TextPrinterTemplate = {
    currentChar: str,
    windowId,
    fontId,
    x,
    y,
    currentX: x,
    currentY: y,
    letterSpacing,
    lineSpacing,
    unk: 0,
    fgColor: color[1],
    bgColor: color[0],
    shadowColor: color[2],
  };
  AddTextPrinter(runtime, printer, speed, null);
}

export function AddTextPrinterParameterized5(runtime: Menu2Runtime, windowId: number, fontId: number, str: string, x: number, y: number, speed: number, callback: unknown, letterSpacing: number, lineSpacing: number): void {
  const printer: TextPrinterTemplate = {
    currentChar: str,
    windowId,
    fontId,
    x,
    y,
    currentX: x,
    currentY: y,
    letterSpacing,
    lineSpacing,
    unk: 0,
    fgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_FOREGROUND),
    bgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_BACKGROUND),
    shadowColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_SHADOW),
  };
  AddTextPrinter(runtime, printer, speed, callback);
}

export const AddTextPrinterParameterized = (runtime: Menu2Runtime, windowId: number, fontId: number, str: string, x: number, y: number, speed: number, callback: unknown): void => {
  runtime.operations.push(`AddTextPrinterParameterized:${windowId}:${fontId}:${str}:${x}:${y}:${speed}:${callback === null ? 'NULL' : 'callback'}`);
};

export const StringExpandPlaceholders = (runtime: Menu2Runtime, src: string): string => {
  runtime.gStringVar4 = src;
  runtime.operations.push(`StringExpandPlaceholders:${src}`);
  return runtime.gStringVar4;
};

export function Menu_PrintFormatIntlPlayerName(runtime: Menu2Runtime, windowId: number, src: string, x: number, y: number): void {
  let i = 0;
  for (; i < runtime.gSaveBlock2Ptr.playerName.length; i += 1);
  StringExpandPlaceholders(runtime, src);
  if (i !== 5) AddTextPrinterParameterized(runtime, windowId, FONT_NORMAL, runtime.gStringVar4, x, y, 0xff, null);
  else AddTextPrinterParameterized5(runtime, windowId, FONT_NORMAL, runtime.gStringVar4, x, y, 0xff, null, 0, 0);
}

export function UnusedBlitBitmapRect(src: Bitmap4bpp, dst: Bitmap4bpp, srcX: number, srcY: number, dstX: number, dstY: number, width: number, height: number): void {
  const xEnd = dst.width - dstX < width ? dst.width - dstX + srcX : width + srcX;
  const yEnd = dst.height - dstY < height ? srcY + dst.height - dstY : srcY + height;
  const multiplierSrcY = (src.width + (src.width & 7)) >> 3;
  const multiplierDstY = (dst.width + (dst.width & 7)) >> 3;
  for (let loopSrcY = srcY, loopDstY = dstY; loopSrcY < yEnd; loopSrcY += 1, loopDstY += 1) {
    for (let loopSrcX = srcX, loopDstX = dstX; loopSrcX < xEnd; loopSrcX += 1, loopDstX += 1) {
      const srcOffset = ((loopSrcX >> 1) & 3) + ((loopSrcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + ((loopSrcY & 7) << 2);
      const dstOffset = ((loopDstX >> 1) & 3) + ((loopDstX >> 3) << 5) + (((loopDstY >> 3) * multiplierDstY) << 5) + ((loopDstY & 7) << 2);
      const srcNibble = loopSrcX & 1 ? (src.pixels[srcOffset] & 0xf0) >> 4 : src.pixels[srcOffset] & 0x0f;
      if (loopDstX & 1) dst.pixels[dstOffset] = (dst.pixels[dstOffset] & 0x0f) | (srcNibble << 4);
      else dst.pixels[dstOffset] = (dst.pixels[dstOffset] & 0xf0) | srcNibble;
    }
  }
}

export const CreateTask = (runtime: Menu2Runtime, priority: number): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({ func: 'Task_SmoothBlendLayers', priority, data: Array(16).fill(0), destroyed: false });
  return taskId;
};

export const DestroyTask = (runtime: Menu2Runtime, taskId: number): void => { runtime.tasks[taskId].destroyed = true; };
export const FuncIsActiveTask = (runtime: Menu2Runtime): boolean => runtime.tasks.some((task) => task.func === 'Task_SmoothBlendLayers' && !task.destroyed);
export const SetGpuReg = (runtime: Menu2Runtime, reg: number, value: number): void => {
  runtime.gpuRegs.set(reg, value & 0xffff);
  runtime.operations.push(`SetGpuReg:${reg}:${value & 0xffff}`);
};

export function StartBlendTask(runtime: Menu2Runtime, evaStart: number, evbStart: number, evaEnd: number, evbEnd: number, evStep: number, priority: number): number {
  const taskId = CreateTask(runtime, priority);
  const data = runtime.tasks[taskId].data;
  data[0] = evaStart << 8;
  data[1] = evbStart << 8;
  data[2] = evaEnd;
  data[3] = evbEnd;
  data[4] = Math.trunc(((evaEnd - evaStart) * 256) / evStep);
  data[5] = Math.trunc(((evbEnd - evbStart) * 256) / evStep);
  data[8] = evStep;
  SetGpuReg(runtime, REG_OFFSET_BLDALPHA, (evbStart << 8) | evaStart);
  return taskId;
}

export function IsBlendTaskActive(runtime: Menu2Runtime): boolean {
  return FuncIsActiveTask(runtime);
}

export function Task_SmoothBlendLayers(runtime: Menu2Runtime, taskId: number): void {
  const task = runtime.tasks[taskId];
  const data = task.data;
  if (data[8] !== 0) {
    if (data[6] === 0) {
      data[0] += data[4];
      data[6] = 1;
    } else {
      data[8] -= 1;
      if (data[8] !== 0) {
        data[1] += data[5];
      } else {
        data[0] = data[2] << 8;
        data[1] = data[3] << 8;
      }
      data[6] = 0;
    }
    SetGpuReg(runtime, REG_OFFSET_BLDALPHA, (data[1] & ~0xff) | ((data[0] >> 8) & 0xffff));
    if (data[8] === 0) DestroyTask(runtime, taskId);
  }
}

export const GetUnownLetterByPersonalityLoByte = (personality: number): number => (
  ((((personality >>> 0) & 0x03000000) >>> 18)
    | (((personality >>> 0) & 0x00030000) >>> 12)
    | (((personality >>> 0) & 0x00000300) >>> 6)
    | (((personality >>> 0) & 0x00000003) >>> 0)
) % NUM_UNOWN_FORMS);

export function Menu2_GetMonPosAttribute(speciesInput: number, personality: number, attributeId: number): number {
  let species = speciesInput;
  if (species === SPECIES_UNOWN) {
    const unownLetter = GetUnownLetterByPersonalityLoByte(personality);
    switch (unownLetter) {
      case 0:
        break;
      case 26:
        species = SPECIES_OLD_UNOWN_EMARK;
        break;
      case 27:
        species = SPECIES_OLD_UNOWN_QMARK;
        break;
      default:
        species = SPECIES_OLD_UNOWN_B + unownLetter - 1;
        break;
    }
  }
  if (species !== SPECIES_NONE && attributeId < PSA_MON_ATTR_COUNT) {
    species -= 1;
    if (sMonPosAttributes[species]?.[attributeId] !== 0xff) return sMonPosAttributes[species]?.[attributeId] ?? 0;
  }
  return 32;
}

export function Menu2_GetStarSpritePosAttribute(species: number, personality: number, attributeId: number): number {
  return Menu2_GetMonPosAttribute(species, personality, attributeId) - 32;
}
