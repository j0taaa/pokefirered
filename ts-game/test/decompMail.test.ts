import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  AddMailMessagePrinters,
  BufferMailMessage,
  CB2_InitMailView,
  CB2_RunShowMailCB,
  DoInitMailView,
  HELPCONTEXT_BEDROOM_PC_MAILBOX,
  HELPCONTEXT_PLAYERS_PC_MAILBOX,
  IS_ITEM_MAIL,
  ITEM_BEAD_MAIL,
  ITEM_DREAM_MAIL,
  ITEM_FAB_MAIL,
  ITEM_ORANGE_MAIL,
  ITEM_POTION,
  ITEM_RETRO_MAIL,
  ITEM_TO_MAIL,
  MAIL_ICON_BEAD,
  MAIL_ICON_DREAM,
  MAIL_ICON_NONE,
  ShowMailCB_Teardown,
  ShowMailCB_WaitButton,
  VBlankCB_ShowMail,
  createMailRuntime,
  sGfxHeaders,
  sMessageLayouts_3x3,
  sMessageLayouts_5x2,
  ReadMail,
  type Mail
} from '../src/game/decompMail';

const makeMail = (overrides: Partial<Mail> = {}): Mail => ({
  words: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  playerName: 'RED',
  species: 25,
  itemId: ITEM_BEAD_MAIL,
  ...overrides
});

describe('decomp mail.c parity', () => {
  test('mail item macros and data tables preserve C indices', () => {
    expect(IS_ITEM_MAIL(ITEM_ORANGE_MAIL)).toBe(true);
    expect(IS_ITEM_MAIL(ITEM_RETRO_MAIL)).toBe(true);
    expect(IS_ITEM_MAIL(ITEM_POTION)).toBe(false);
    expect(ITEM_TO_MAIL(ITEM_BEAD_MAIL)).toBe(6);
    expect(sGfxHeaders[ITEM_TO_MAIL(ITEM_RETRO_MAIL)]).toMatchObject({
      tiles: 'gFile_graphics_mail_retro_tiles_sheet',
      size: 0x520
    });
    expect(sMessageLayouts_3x3[ITEM_TO_MAIL(ITEM_RETRO_MAIL)].messageLeft).toBe(0);
    expect(sMessageLayouts_5x2[ITEM_TO_MAIL(ITEM_BEAD_MAIL)].nameX).toBe(20);
    expect(sMessageLayouts_5x2[ITEM_TO_MAIL(ITEM_FAB_MAIL)].nameY).toBe(8);
  });

  test('ReadMail selects layout, icon type, callback, and invalid-mail fallback exactly like C', () => {
    const runtime = createMailRuntime();
    const mail = makeMail({ itemId: ITEM_BEAD_MAIL, species: 25 });

    ReadMail(runtime, mail, 'SavedCB', true);

    expect(runtime.mainCallback2).toBe('CB2_InitMailView');
    expect(runtime.sMailViewResources).toMatchObject({
      unused: 2,
      mailArrangementType: 1,
      mailType: ITEM_TO_MAIL(ITEM_BEAD_MAIL),
      monIconType: MAIL_ICON_BEAD,
      savedCallback: 'SavedCB',
      messageExists: true
    });
    expect(runtime.sMailViewResources?.messageLayout).toBe(sMessageLayouts_5x2[ITEM_TO_MAIL(ITEM_BEAD_MAIL)]);

    const invalid = createMailRuntime();
    ReadMail(invalid, makeMail({ itemId: ITEM_POTION, species: 25 }), 'Back', true);
    expect(invalid.sMailViewResources?.mailType).toBe(ITEM_TO_MAIL(ITEM_ORANGE_MAIL));
    expect(invalid.sMailViewResources?.messageExists).toBe(false);

    const noSpecies = createMailRuntime();
    ReadMail(noSpecies, makeMail({ itemId: ITEM_DREAM_MAIL, species: 0 }), null, true);
    expect(noSpecies.sMailViewResources?.monIconType).toBe(MAIL_ICON_NONE);

    const dream = createMailRuntime();
    ReadMail(dream, makeMail({ itemId: ITEM_DREAM_MAIL, species: 150 }), null, true);
    expect(dream.sMailViewResources?.monIconType).toBe(MAIL_ICON_DREAM);
  });

  test('BufferMailMessage uses 5x2 word layout and Japanese conversion for short names', () => {
    const runtime = createMailRuntime({
      convertEasyChatWordsToString: (words, length1) => words.slice(0, length1).join('/')
    });
    ReadMail(runtime, makeMail({ itemId: ITEM_ORANGE_MAIL, playerName: 'RED' }), 'SavedCB', true);

    BufferMailMessage(runtime);

    expect(runtime.sMailViewResources?.messageLinesBuffer.slice(0, 5)).toEqual([
      '1/2',
      '3/4',
      '5/6',
      '7/8',
      '9'
    ]);
    expect(runtime.sMailViewResources?.authorNameBuffer).toBe('RED<JP>');
    expect(runtime.sMailViewResources?.nameX).toBe(sMessageLayouts_5x2[0].nameX);
  });

  test('BufferMailMessage 3x3 branch appends From before nameX calculation', () => {
    const runtime = createMailRuntime({
      convertEasyChatWordsToString: (words, length1) => words.slice(0, length1).join('-')
    });
    ReadMail(runtime, makeMail({ itemId: ITEM_RETRO_MAIL, playerName: 'GREEN' }), 'SavedCB', true);
    if (runtime.sMailViewResources) {
      runtime.sMailViewResources.mailArrangementType = 0;
      runtime.sMailViewResources.messageLayout = sMessageLayouts_3x3[ITEM_TO_MAIL(ITEM_RETRO_MAIL)];
    }

    BufferMailMessage(runtime);

    expect(runtime.sMailViewResources?.messageLinesBuffer.slice(0, 3)).toEqual([
      '1-2-3',
      '4-5-6',
      '7-8-9'
    ]);
    expect(runtime.sMailViewResources?.authorNameBuffer).toBe('GREENFrom');
    expect(runtime.sMailViewResources?.nameX).toBe(0x60 - 8 * 'GREENFrom'.length);
  });

  test('AddMailMessagePrinters skips blank/space-starting lines and prints From plus author', () => {
    const runtime = createMailRuntime();
    ReadMail(runtime, makeMail({ itemId: ITEM_ORANGE_MAIL, playerName: 'BLUE' }), 'SavedCB', true);
    const resources = runtime.sMailViewResources!;
    resources.messageLinesBuffer[0] = 'HELLO';
    resources.messageLinesBuffer[1] = ' WORLD';
    resources.messageLinesBuffer[2] = '';
    resources.messageLinesBuffer[3] = 'BYE';
    resources.authorNameBuffer = 'BLUE';
    resources.nameX = 12;

    AddMailMessagePrinters(runtime);

    expect(runtime.textPrinters.map((printer) => printer.text)).toEqual(['HELLO', 'BYE', 'From', 'BLUE']);
    expect(runtime.textPrinters[0]).toMatchObject({ windowId: 0, x: 8, y: 3 });
    expect(runtime.textPrinters[1]).toMatchObject({ windowId: 0, x: 8, y: 19 });
    expect(runtime.textPrinters.at(-1)).toMatchObject({ windowId: 1, x: 44 });
  });

  test('DoInitMailView advances through init states and stalls on busy tile/link checks', () => {
    const runtime = createMailRuntime({ gPlayerPcMenuManager: { notInRoom: true } });
    ReadMail(runtime, makeMail({ itemId: ITEM_ORANGE_MAIL }), 'SavedCB', true);

    expect(DoInitMailView(runtime)).toBe(false);
    expect(runtime.gMain.state).toBe(1);
    expect(runtime.helpContext).toBe(HELPCONTEXT_PLAYERS_PC_MAILBOX);

    runtime.gMain.state = 0;
    runtime.gPlayerPcMenuManager.notInRoom = false;
    DoInitMailView(runtime);
    expect(runtime.helpContext).toBe(HELPCONTEXT_BEDROOM_PC_MAILBOX);

    runtime.gMain.state = 9;
    runtime.tempTileDataBusy = true;
    expect(DoInitMailView(runtime)).toBe(false);
    expect(runtime.gMain.state).toBe(9);
    runtime.tempTileDataBusy = false;
    DoInitMailView(runtime);
    expect(runtime.gMain.state).toBe(10);

    runtime.gMain.state = 15;
    runtime.linkRecvQueueMoreThan2 = true;
    expect(DoInitMailView(runtime)).toBe(false);
    expect(runtime.gMain.state).toBe(15);
  });

  test('CB2_InitMailView reaches run callback, creates bead icon, and starts fade at state 18', () => {
    const runtime = createMailRuntime();
    ReadMail(runtime, makeMail({ itemId: ITEM_BEAD_MAIL, species: 25 }), 'SavedCB', true);

    for (let i = 0; i < 19; i += 1) {
      CB2_InitMailView(runtime);
    }

    expect(runtime.mainCallback2).toBe('CB2_RunShowMailCB');
    expect(runtime.sMailViewResources?.showMailCallback).toBe('ShowMailCB_WaitFadeIn');
    expect(runtime.sMailViewResources?.monIconSpriteId).toBe(1);
    expect(runtime.operations).toContain('CreateMonIcon:25:96:128');
    expect(runtime.gPaletteFade.bufferTransferDisabled).toBe(false);
  });

  test('VBlank and show callbacks mirror fade, input, sprite animation, and teardown flow', () => {
    const runtime = createMailRuntime();
    ReadMail(runtime, makeMail({ itemId: ITEM_DREAM_MAIL, species: 150 }), 'SavedCB', true);
    const resources = runtime.sMailViewResources!;
    resources.showMailCallback = 'ShowMailCB_WaitFadeIn';
    resources.monIconSpriteId = 7;

    VBlankCB_ShowMail(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    runtime.gPaletteFade.active = false;
    CB2_RunShowMailCB(runtime);
    expect(runtime.operations).toContain('AnimateSprites');
    expect(resources.showMailCallback).toBe('ShowMailCB_WaitButton');

    runtime.gMain.newKeys = A_BUTTON;
    ShowMailCB_WaitButton(runtime);
    expect(resources.showMailCallback).toBe('ShowMailCB_Teardown');
    expect(runtime.gPaletteFade.active).toBe(true);

    ShowMailCB_Teardown(runtime);
    expect(runtime.sMailViewResources).not.toBeNull();
    ShowMailCB_Teardown(runtime);
    expect(runtime.mainCallback2).toBe('SavedCB');
    expect(runtime.sMailViewResources).toBeNull();
    expect(runtime.operations).toContain('FreeMonIconPalette:150');
    expect(runtime.operations).toContain('DestroyMonIcon:7');
  });
});
