export type RomHeaderDirectiveKind = 'instruction' | 'space' | 'byte' | 'hword' | 'word' | 'word4';

export interface RomHeaderDirective {
  label: string | null;
  offset: number;
  size: number;
  kind: RomHeaderDirectiveKind;
  value: number | string;
  global: boolean;
}

export const ROM_HEADER_TOTAL_SIZE = 0x100;
export const ROM_HEADER_BRANCH_SIZE = 4;
export const ROM_HEADER_NINTENDO_LOGO_SIZE = 156;

export const ROM_HEADER_DIRECTIVES: RomHeaderDirective[] = [
  { label: 'Start', offset: 0x000, size: 4, kind: 'instruction', value: 'b start_vector', global: true },
  { label: 'RomHeaderNintendoLogo', offset: 0x004, size: 156, kind: 'space', value: 0, global: true },
  { label: 'RomHeaderGameTitle', offset: 0x0a0, size: 12, kind: 'space', value: 0, global: false },
  { label: 'RomHeaderGameCode', offset: 0x0ac, size: 4, kind: 'space', value: 0, global: true },
  { label: 'RomHeaderMakerCode', offset: 0x0b0, size: 2, kind: 'space', value: 0, global: false },
  { label: 'RomHeaderMagic', offset: 0x0b2, size: 1, kind: 'byte', value: 0, global: false },
  { label: 'RomHeaderMainUnitCode', offset: 0x0b3, size: 1, kind: 'byte', value: 0, global: false },
  { label: 'RomHeaderDeviceType', offset: 0x0b4, size: 1, kind: 'byte', value: 0, global: false },
  { label: 'RomHeaderReserved1', offset: 0x0b5, size: 7, kind: 'space', value: 0, global: false },
  { label: 'RomHeaderSoftwareVersion', offset: 0x0bc, size: 1, kind: 'byte', value: 0, global: true },
  { label: 'RomHeaderChecksum', offset: 0x0bd, size: 1, kind: 'byte', value: 0, global: false },
  { label: 'RomHeaderReserved2', offset: 0x0be, size: 2, kind: 'space', value: 0, global: false },
  { label: null, offset: 0x0c0, size: 4, kind: 'word', value: 0, global: false },
  { label: 'GPIOPortData', offset: 0x0c4, size: 2, kind: 'hword', value: 0, global: true },
  { label: 'GPIOPortDirection', offset: 0x0c6, size: 2, kind: 'hword', value: 0, global: true },
  { label: 'GPIOPortReadEnable', offset: 0x0c8, size: 2, kind: 'hword', value: 0, global: true },
  { label: null, offset: 0x0ca, size: 6, kind: 'space', value: 0, global: false },
  { label: null, offset: 0x0d0, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0d4, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0d8, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0dc, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0e0, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0e4, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0e8, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0ec, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0f0, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0f4, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0f8, size: 4, kind: 'word4', value: 0xffffffff, global: false },
  { label: null, offset: 0x0fc, size: 4, kind: 'word4', value: 0xffffffff, global: false }
];

export const ROM_HEADER_GLOBAL_LABELS = ROM_HEADER_DIRECTIVES
  .filter((directive) => directive.global && directive.label !== null)
  .map((directive) => directive.label as string);

export const getRomHeaderDirective = (label: string): RomHeaderDirective | undefined =>
  ROM_HEADER_DIRECTIVES.find((directive) => directive.label === label);

export const createRomHeaderDataImage = (): Uint8Array => {
  const data = new Uint8Array(ROM_HEADER_TOTAL_SIZE);
  for (const directive of ROM_HEADER_DIRECTIVES) {
    if (directive.kind !== 'word4') {
      continue;
    }
    const value = directive.value as number;
    for (let i = 0; i < directive.size; i += 1) {
      data[directive.offset + i] = (value >>> (i * 8)) & 0xff;
    }
  }
  return data;
};
