export const LE_MAX_TIME = [
  10, 65469, 0x00c2,
  10, 65469, 0x00c2,
  2000, 65469, 0x00c2,
  2000, 65469, 0x00c2
] as const;

export interface FlashSectorLayout {
  sectorSize: number;
  sectorShift: number;
  sectorCount: number;
  unused: number;
}

export interface FlashSetupInfo {
  programFlashByte: string;
  programFlashSector: string;
  eraseFlashChip: string;
  eraseFlashSector: string;
  waitForFlashWrite: string;
  maxTime: readonly number[];
  romSize: number;
  sector: FlashSectorLayout;
  waitStateSetup: readonly [number, number];
  id: readonly [number, number];
}

export const LE26FV10N1TS: FlashSetupInfo = {
  programFlashByte: 'ProgramFlashByte_MX',
  programFlashSector: 'ProgramFlashSector_MX',
  eraseFlashChip: 'EraseFlashChip_MX',
  eraseFlashSector: 'EraseFlashSector_MX',
  waitForFlashWrite: 'WaitForFlashWrite_Common',
  maxTime: LE_MAX_TIME,
  romSize: 131072,
  sector: {
    sectorSize: 4096,
    sectorShift: 12,
    sectorCount: 32,
    unused: 0
  },
  waitStateSetup: [3, 1],
  id: [0x62, 0x13]
};
