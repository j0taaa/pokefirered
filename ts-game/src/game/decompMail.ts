export const ITEM_ORANGE_MAIL = 121;
export const ITEM_POTION = 13;
export const ITEM_HARBOR_MAIL = 122;
export const ITEM_GLITTER_MAIL = 123;
export const ITEM_MECH_MAIL = 124;
export const ITEM_WOOD_MAIL = 125;
export const ITEM_WAVE_MAIL = 126;
export const ITEM_BEAD_MAIL = 127;
export const ITEM_SHADOW_MAIL = 128;
export const ITEM_TROPIC_MAIL = 129;
export const ITEM_DREAM_MAIL = 130;
export const ITEM_FAB_MAIL = 131;
export const ITEM_RETRO_MAIL = 132;
export const FIRST_MAIL_IDX = ITEM_ORANGE_MAIL;

export const MAIL_WORDS_COUNT = 9;
export const SPECIES_NONE = 0;
export const NUM_SPECIES = 412;
export const A_BUTTON = 1;
export const B_BUTTON = 2;

export const MAIL_ICON_NONE = 0;
export const MAIL_ICON_BEAD = 1;
export const MAIL_ICON_DREAM = 2;

export const HELPCONTEXT_BEDROOM_PC_MAILBOX = 'HELPCONTEXT_BEDROOM_PC_MAILBOX';
export const HELPCONTEXT_PLAYERS_PC_MAILBOX = 'HELPCONTEXT_PLAYERS_PC_MAILBOX';

export interface Mail {
  words: number[];
  playerName: string;
  species: number | string;
  itemId: number;
}

export interface MailEcWordLayout {
  numWordsInLine: number;
  lineXoffset: number;
  lineHeight: number;
}

export interface MailAttrStruct {
  numRows: number;
  nameY: number;
  nameX: number;
  messageTop: number;
  messageLeft: number;
  linesLayout: MailEcWordLayout[];
}

export interface MailGfxData {
  pal: string;
  tiles: string;
  map: string;
  size: number;
  textpals: [number, number];
}

export interface TextPrinterCall {
  windowId: number;
  fontId: string;
  x: number;
  y: number;
  colors: readonly number[];
  speed: number;
  text: string;
}

export interface MailViewResources {
  messageLinesBuffer: string[];
  authorNameBuffer: string;
  savedCallback: string | null;
  showMailCallback: string | null;
  mail: Mail | null;
  messageExists: boolean;
  nameX: number;
  mailType: number;
  monIconType: number;
  monIconSpriteId: number;
  unused: number;
  mailArrangementType: number;
  messageLayout: MailAttrStruct;
  bg1TilemapBuffer: number[];
  bg2TilemapBuffer: number[];
}

export interface MailRuntime {
  sMailViewResources: MailViewResources | null;
  gMain: {
    state: number;
    newKeys: number;
  };
  gPlayerPcMenuManager: {
    notInRoom: boolean;
  };
  gPaletteFade: {
    bufferTransferDisabled: boolean;
    active: boolean;
  };
  gSaveBlock2Ptr: {
    playerGender: number;
  };
  operations: string[];
  textPrinters: TextPrinterCall[];
  mainCallback2: string | null;
  vBlankCallback: string | null;
  helpContext: string | null;
  linkRecvQueueMoreThan2: boolean;
  tempTileDataBusy: boolean;
  menuHelpersLinkActive: boolean;
  convertEasyChatWordsToString?: (words: number[], length1: number, length2: number) => string;
  copyEasyChatWord?: (word: number) => string;
}

const rgb = (red: number, green: number, blue: number): number =>
  red | (green << 5) | (blue << 10);

export const ITEM_TO_MAIL = (itemId: number): number => itemId - FIRST_MAIL_IDX;

export const IS_ITEM_MAIL = (itemId: number): boolean =>
  itemId === ITEM_ORANGE_MAIL
  || itemId === ITEM_HARBOR_MAIL
  || itemId === ITEM_GLITTER_MAIL
  || itemId === ITEM_MECH_MAIL
  || itemId === ITEM_WOOD_MAIL
  || itemId === ITEM_WAVE_MAIL
  || itemId === ITEM_BEAD_MAIL
  || itemId === ITEM_SHADOW_MAIL
  || itemId === ITEM_TROPIC_MAIL
  || itemId === ITEM_DREAM_MAIL
  || itemId === ITEM_FAB_MAIL
  || itemId === ITEM_RETRO_MAIL;

const sLayout_3x3: MailEcWordLayout[] = [
  { numWordsInLine: 3, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 3, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 3, lineXoffset: 0, lineHeight: 16 }
];

const sLayout_5x2: MailEcWordLayout[] = [
  { numWordsInLine: 2, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 2, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 2, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 2, lineXoffset: 0, lineHeight: 16 },
  { numWordsInLine: 1, lineXoffset: 0, lineHeight: 16 }
];

const mailTypeNames = [
  'orange',
  'harbor',
  'glitter',
  'mech',
  'wood',
  'wave',
  'bead',
  'shadow',
  'tropic',
  'dream',
  'fab',
  'retro'
] as const;

const gfxSizes = [0x2c0, 0x2e0, 0x400, 0x1e0, 0x2e0, 0x300, 0x140, 0x300, 0x220, 0x340, 0x2a0, 0x520];
const darkTextpals: [number, number] = [rgb(10, 10, 10), rgb(25, 25, 25)];
const lightTextpals: [number, number] = [rgb(31, 31, 31), rgb(17, 17, 17)];
const textpalByMailType: Array<[number, number]> = [
  darkTextpals,
  lightTextpals,
  darkTextpals,
  lightTextpals,
  lightTextpals,
  darkTextpals,
  lightTextpals,
  lightTextpals,
  darkTextpals,
  darkTextpals,
  darkTextpals,
  darkTextpals
];

export const sGfxHeaders: MailGfxData[] = mailTypeNames.map((name, index) => ({
  pal: `gFile_graphics_mail_${name}_palette_pal`,
  tiles: `gFile_graphics_mail_${name}_tiles_sheet`,
  map: `gFile_graphics_mail_${name}_map_tilemap`,
  size: gfxSizes[index],
  textpals: textpalByMailType[index]
}));

const layout3x3 = (overrides: Partial<Omit<MailAttrStruct, 'linesLayout'>> = {}): MailAttrStruct => ({
  numRows: 3,
  nameY: 0,
  nameX: 0,
  messageTop: 2,
  messageLeft: 4,
  linesLayout: sLayout_3x3,
  ...overrides
});

const layout5x2 = (nameY: number, nameX: number): MailAttrStruct => ({
  numRows: 5,
  nameY,
  nameX,
  messageTop: 3,
  messageLeft: 8,
  linesLayout: sLayout_5x2
});

export const sMessageLayouts_3x3: MailAttrStruct[] = [
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3(),
  layout3x3({ nameY: 8 }),
  layout3x3({ messageLeft: 0 })
];

export const sMessageLayouts_5x2: MailAttrStruct[] = [
  layout5x2(0, 8),
  layout5x2(3, 14),
  layout5x2(0, 16),
  layout5x2(0, 14),
  layout5x2(3, 12),
  layout5x2(0, 18),
  layout5x2(0, 20),
  layout5x2(6, 20),
  layout5x2(0, 16),
  layout5x2(0, 14),
  layout5x2(8, 16),
  layout5x2(0, 16)
];

const sTextColor = [0, 10, 11] as const;
const gText_From = 'From';

export const createMailRuntime = (overrides: Partial<MailRuntime> = {}): MailRuntime => ({
  sMailViewResources: null,
  gMain: { state: 0, newKeys: 0, ...overrides.gMain },
  gPlayerPcMenuManager: { notInRoom: false, ...overrides.gPlayerPcMenuManager },
  gPaletteFade: { bufferTransferDisabled: false, active: false, ...overrides.gPaletteFade },
  gSaveBlock2Ptr: { playerGender: 0, ...overrides.gSaveBlock2Ptr },
  operations: [],
  textPrinters: [],
  mainCallback2: null,
  vBlankCallback: null,
  helpContext: null,
  linkRecvQueueMoreThan2: false,
  tempTileDataBusy: false,
  menuHelpersLinkActive: false,
  ...overrides
});

const createResources = (): MailViewResources => ({
  messageLinesBuffer: Array.from({ length: 8 }, () => ''),
  authorNameBuffer: '',
  savedCallback: null,
  showMailCallback: null,
  mail: null,
  messageExists: false,
  nameX: 0,
  mailType: 0,
  monIconType: MAIL_ICON_NONE,
  monIconSpriteId: 0,
  unused: 0,
  mailArrangementType: 0,
  messageLayout: sMessageLayouts_3x3[0],
  bg1TilemapBuffer: Array.from({ length: 32 * 32 }, () => 0),
  bg2TilemapBuffer: Array.from({ length: 32 * 32 }, () => 0)
});

const setMainCallback2 = (runtime: MailRuntime, callback: string | null): void => {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback ?? 'NULL'}`);
};

const setVBlankCallback = (runtime: MailRuntime, callback: string | null): void => {
  runtime.vBlankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback ?? 'NULL'}`);
};

const setHelpContext = (runtime: MailRuntime, context: string): void => {
  runtime.helpContext = context;
  runtime.operations.push(`SetHelpContext:${context}`);
};

const beginNormalPaletteFade = (runtime: MailRuntime, start: number, end: number): void => {
  runtime.gPaletteFade.active = true;
  runtime.operations.push(`BeginNormalPaletteFade:${start}->${end}`);
};

const updatePaletteFade = (runtime: MailRuntime): boolean => {
  const wasActive = runtime.gPaletteFade.active;
  runtime.gPaletteFade.active = false;
  return wasActive;
};

const convertEasyChatWordsToString = (
  runtime: MailRuntime,
  words: number[],
  length1: number,
  length2: number
): string => {
  if (runtime.convertEasyChatWordsToString) {
    return runtime.convertEasyChatWordsToString(words, length1, length2);
  }
  return words.slice(0, length1 * length2).map((word) => `WORD${word}`).join(' ');
};

const stringLength = (text: string): number => text.length;

const getStringWidth = (text: string): number => text.length * 8;

const convertInternationalString = (text: string): string => `${text}<JP>`;

const mailSpeciesToSpecies = (mailSpecies: number | string): number => {
  if (typeof mailSpecies === 'number') {
    if (mailSpecies >= 30000) {
      return 201;
    }
    return mailSpecies;
  }
  if (mailSpecies === 'SPECIES_NONE') {
    return SPECIES_NONE;
  }
  return 1;
};

const mailSpeciesToIconSpecies = (mailSpecies: number | string): number => mailSpeciesToSpecies(mailSpecies);

export function ReadMail(
  runtime: MailRuntime,
  mail: Mail,
  savedCallback: string | null,
  messageExists: boolean
): void {
  const resources = createResources();
  resources.unused = 2;
  resources.mailArrangementType = 1;
  if (IS_ITEM_MAIL(mail.itemId)) {
    resources.mailType = ITEM_TO_MAIL(mail.itemId);
  } else {
    resources.mailType = ITEM_TO_MAIL(ITEM_ORANGE_MAIL);
    messageExists = false;
  }
  switch (resources.mailArrangementType) {
    case 0:
    default:
      resources.messageLayout = sMessageLayouts_3x3[resources.mailType];
      break;
    case 1:
      resources.messageLayout = sMessageLayouts_5x2[resources.mailType];
      break;
  }
  const species = mailSpeciesToSpecies(mail.species);
  if (species !== SPECIES_NONE && species < NUM_SPECIES) {
    switch (resources.mailType) {
      default:
        resources.monIconType = MAIL_ICON_NONE;
        break;
      case ITEM_TO_MAIL(ITEM_BEAD_MAIL):
        resources.monIconType = MAIL_ICON_BEAD;
        break;
      case ITEM_TO_MAIL(ITEM_DREAM_MAIL):
        resources.monIconType = MAIL_ICON_DREAM;
        break;
    }
  } else {
    resources.monIconType = MAIL_ICON_NONE;
  }
  resources.mail = mail;
  resources.savedCallback = savedCallback;
  resources.messageExists = messageExists;
  runtime.sMailViewResources = resources;
  setMainCallback2(runtime, 'CB2_InitMailView');
}

export function BufferMailMessage(runtime: MailRuntime): void {
  const resources = runtime.sMailViewResources;
  if (!resources?.mail) {
    return;
  }
  let j = 0;
  for (let i = 0; i < resources.messageLayout.numRows; i += 1) {
    const wordsInLine = resources.messageLayout.linesLayout[i].numWordsInLine;
    resources.messageLinesBuffer[i] = convertEasyChatWordsToString(
      runtime,
      resources.mail.words.slice(j),
      wordsInLine,
      1
    );
    j += wordsInLine;
  }
  if (resources.mailArrangementType === 0) {
    resources.authorNameBuffer = `${resources.mail.playerName}${gText_From}`;
    resources.nameX = resources.messageLayout.nameX + 0x60 - 8 * stringLength(resources.authorNameBuffer);
  } else {
    resources.authorNameBuffer = resources.mail.playerName;
    if (stringLength(resources.authorNameBuffer) < 6) {
      resources.authorNameBuffer = convertInternationalString(resources.authorNameBuffer);
    }
    resources.nameX = resources.messageLayout.nameX;
  }
}

export function AddMailMessagePrinters(runtime: MailRuntime): void {
  const resources = runtime.sMailViewResources;
  if (!resources) {
    return;
  }
  runtime.operations.push('PutWindowTilemap:0', 'PutWindowTilemap:1', 'FillWindowPixelBuffer:0', 'FillWindowPixelBuffer:1');
  let y = 0;
  for (let i = 0; i < resources.messageLayout.numRows; i += 1) {
    const line = resources.messageLinesBuffer[i];
    if (line[0] !== undefined && line[0] !== '' && line[0] !== ' ') {
      runtime.textPrinters.push({
        windowId: 0,
        fontId: 'FONT_NORMAL_COPY_1',
        x: resources.messageLayout.linesLayout[i].lineXoffset + resources.messageLayout.messageLeft,
        y: y + resources.messageLayout.messageTop,
        colors: sTextColor,
        speed: 0,
        text: line
      });
      y += resources.messageLayout.linesLayout[i].lineHeight;
    }
  }
  const width = getStringWidth(gText_From);
  runtime.textPrinters.push({
    windowId: 1,
    fontId: 'FONT_NORMAL_COPY_1',
    x: resources.nameX,
    y: resources.messageLayout.nameY,
    colors: sTextColor,
    speed: 0,
    text: gText_From
  });
  runtime.textPrinters.push({
    windowId: 1,
    fontId: 'FONT_NORMAL_COPY_1',
    x: resources.nameX + width,
    y: resources.messageLayout.nameY,
    colors: sTextColor,
    speed: 0,
    text: resources.authorNameBuffer
  });
  runtime.operations.push('CopyWindowToVram:0', 'CopyWindowToVram:1');
}

export function DoInitMailView(runtime: MailRuntime): boolean {
  const resources = runtime.sMailViewResources;
  if (!resources) {
    return false;
  }
  switch (runtime.gMain.state) {
    case 0:
      setVBlankCallback(runtime, null);
      runtime.operations.push('ScanlineEffect_Stop', 'SetGpuReg:DISPCNT=0');
      if (runtime.gPlayerPcMenuManager.notInRoom === false) {
        setHelpContext(runtime, HELPCONTEXT_BEDROOM_PC_MAILBOX);
      } else {
        setHelpContext(runtime, HELPCONTEXT_PLAYERS_PC_MAILBOX);
      }
      break;
    case 1:
      runtime.operations.push('CpuFill16:OAM');
      break;
    case 2:
      runtime.operations.push('ResetPaletteFade');
      break;
    case 3:
      runtime.operations.push('ResetTasks');
      break;
    case 4:
      runtime.operations.push('ResetSpriteData');
      break;
    case 5:
      runtime.operations.push('FreeAllSpritePalettes', 'ResetTempTileDataBuffers', 'ResetGpuOffsetsAndBlend');
      break;
    case 6:
      runtime.operations.push('ResetBgsAndClearDma3BusyFlags', 'InitBgsFromTemplates', 'SetBgTilemapBuffer:1', 'SetBgTilemapBuffer:2');
      break;
    case 7:
      runtime.operations.push('InitWindows', 'DeactivateAllTextPrinters');
      break;
    case 8:
      runtime.operations.push(`DecompressAndCopyTileDataToVram:${sGfxHeaders[resources.mailType].tiles}`);
      break;
    case 9:
      if (runtime.tempTileDataBusy) {
        return false;
      }
      break;
    case 10:
      runtime.operations.push('FillBgTilemapBufferRect:0', 'FillBgTilemapBufferRect:2', `CopyToBgTilemapBuffer:${sGfxHeaders[resources.mailType].map}`);
      break;
    case 11:
      runtime.operations.push('CopyBgTilemapBufferToVram:0', 'CopyBgTilemapBufferToVram:1', 'CopyBgTilemapBufferToVram:2');
      break;
    case 12:
      runtime.operations.push(`LoadPalette:text:${sGfxHeaders[resources.mailType].textpals.join(',')}`, `LoadPalette:mail:${resources.mailType}`);
      break;
    case 13:
      if (resources.messageExists) {
        BufferMailMessage(runtime);
      }
      break;
    case 14:
      if (resources.messageExists) {
        AddMailMessagePrinters(runtime);
        runtime.operations.push('RunTextPrinters');
      }
      break;
    case 15:
      if (runtime.linkRecvQueueMoreThan2) {
        return false;
      }
      break;
    case 16:
      setVBlankCallback(runtime, 'VBlankCB_ShowMail');
      runtime.gPaletteFade.bufferTransferDisabled = true;
      break;
    case 17: {
      const iconId = mailSpeciesToIconSpecies(resources.mail?.species ?? SPECIES_NONE);
      switch (resources.monIconType) {
        case MAIL_ICON_BEAD:
          runtime.operations.push(`LoadMonIconPalette:${iconId}`, `CreateMonIcon:${iconId}:96:128`);
          resources.monIconSpriteId = 1;
          break;
        case MAIL_ICON_DREAM:
          runtime.operations.push(`LoadMonIconPalette:${iconId}`, `CreateMonIcon:${iconId}:40:128`);
          resources.monIconSpriteId = 1;
          break;
      }
      break;
    }
    case 18:
      runtime.operations.push('SetGpuReg:DISPCNT=MODE0_OBJ', 'ShowBg:0', 'ShowBg:1', 'ShowBg:2');
      beginNormalPaletteFade(runtime, 16, 0);
      runtime.gPaletteFade.bufferTransferDisabled = false;
      resources.showMailCallback = 'ShowMailCB_WaitFadeIn';
      return true;
    default:
      return false;
  }
  runtime.gMain.state += 1;
  return false;
}

export function CB2_InitMailView(runtime: MailRuntime): void {
  do {
    if (DoInitMailView(runtime) === true) {
      setMainCallback2(runtime, 'CB2_RunShowMailCB');
      break;
    }
  } while (runtime.menuHelpersLinkActive !== true);
}

export function VBlankCB_ShowMail(runtime: MailRuntime): void {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
}

export function ShowMailCB_WaitFadeIn(runtime: MailRuntime): void {
  if (!updatePaletteFade(runtime) && runtime.sMailViewResources) {
    runtime.sMailViewResources.showMailCallback = 'ShowMailCB_WaitButton';
  }
}

export function ShowMailCB_WaitButton(runtime: MailRuntime): void {
  if ((runtime.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0 && runtime.sMailViewResources) {
    beginNormalPaletteFade(runtime, 0, 16);
    runtime.sMailViewResources.showMailCallback = 'ShowMailCB_Teardown';
  }
}

export function ShowMailCB_Teardown(runtime: MailRuntime): void {
  const resources = runtime.sMailViewResources;
  if (!resources) {
    return;
  }
  if (!updatePaletteFade(runtime)) {
    setMainCallback2(runtime, resources.savedCallback);
    switch (resources.monIconType) {
      case MAIL_ICON_BEAD:
      case MAIL_ICON_DREAM:
        runtime.operations.push(`FreeMonIconPalette:${mailSpeciesToIconSpecies(resources.mail?.species ?? SPECIES_NONE)}`, `DestroyMonIcon:${resources.monIconSpriteId}`);
        break;
    }
    runtime.operations.push('ResetPaletteFade', 'FreeAllWindowBuffers', 'FREE_AND_SET_NULL:sMailViewResources');
    runtime.sMailViewResources = null;
  }
}

export function CB2_RunShowMailCB(runtime: MailRuntime): void {
  const resources = runtime.sMailViewResources;
  if (!resources) {
    return;
  }
  if (resources.monIconType !== MAIL_ICON_NONE) {
    runtime.operations.push('AnimateSprites', 'BuildOamBuffer');
  }
  switch (resources.showMailCallback) {
    case 'ShowMailCB_WaitFadeIn':
      ShowMailCB_WaitFadeIn(runtime);
      break;
    case 'ShowMailCB_WaitButton':
      ShowMailCB_WaitButton(runtime);
      break;
    case 'ShowMailCB_Teardown':
      ShowMailCB_Teardown(runtime);
      break;
  }
}
