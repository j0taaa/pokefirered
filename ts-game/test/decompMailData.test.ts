import { describe, expect, test } from 'vitest';
import { createClearedMailSlot } from '../src/game/decompNewGame';
import {
  ClearMailData,
  ClearMailItemId,
  ClearMailStruct,
  DummyMailFunc,
  GiveMailToMon,
  GiveMailToMon2,
  ItemIsMail,
  MailSpeciesToSpecies,
  MonHasMail,
  SpeciesToMailSpecies,
  TakeMailFromMon,
  TakeMailFromMon2,
  clearMailData,
  clearMailItemId,
  clearMailStruct,
  getUnownLetterByPersonality,
  giveMailToMon,
  giveMailToMon2,
  itemIsMail,
  mailSpeciesToSpecies,
  monHasMail,
  speciesToMailSpecies,
  takeMailFromMon,
  takeMailFromMon2
} from '../src/game/decompMailData';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('decomp mail_data parity', () => {
  test('clears a mail struct and the whole save mail array like ClearMailStruct / ClearMailData', () => {
    const runtime = createScriptRuntimeState();
    const mail = runtime.newGame.mail[0]!;
    mail.words = Array.from({ length: 9 }, (_, index) => index);
    mail.playerName = 'RED   ';
    mail.trainerId = 0x12345678;
    mail.species = 30027;
    mail.itemId = 'ITEM_RETRO_MAIL';

    clearMailStruct(mail);

    expect(mail).toEqual(createClearedMailSlot());

    runtime.newGame.mail[1]!.itemId = 'ITEM_ORANGE_MAIL';
    clearMailData(runtime);

    expect(runtime.newGame.mail.every((entry) => entry.itemId === null)).toBe(true);
    expect(runtime.newGame.mail[1]).toEqual(createClearedMailSlot());
  });

  test('encodes and decodes Unown mail species with the exact personality formula', () => {
    expect(getUnownLetterByPersonality(0)).toBe(0);
    expect(getUnownLetterByPersonality(0x12345678)).toBe(24);

    const mailSpecies = speciesToMailSpecies('UNOWN', 0x12345678);
    expect(mailSpecies).toBe(30024);
    expect(mailSpeciesToSpecies(mailSpecies)).toEqual({
      species: 'SPECIES_UNOWN',
      unownLetter: 24
    });
    expect(mailSpeciesToSpecies('BULBASAUR')).toEqual({
      species: 'SPECIES_BULBASAUR',
      unownLetter: 0
    });
  });

  test('allocates party mail slots exactly like GiveMailToMon', () => {
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'RED';
    runtime.vars.playerTrainerId = 0x1234abcd;
    const pokemon = runtime.party[0]!;
    pokemon.species = 'UNOWN';
    pokemon.personality = 0x12345678;
    pokemon.heldItemId = null;
    pokemon.mailId = 0xff;

    const mailId = giveMailToMon(runtime, pokemon, 'ITEM_BEAD_MAIL');

    expect(mailId).toBe(0);
    expect(pokemon.heldItemId).toBe('ITEM_BEAD_MAIL');
    expect(pokemon.mailId).toBe(0);
    expect(monHasMail(pokemon)).toBe(true);
    expect(runtime.newGame.mail[0]).toMatchObject({
      playerName: 'RED   ',
      trainerId: 0x1234abcd,
      species: 30024,
      itemId: 'ITEM_BEAD_MAIL'
    });
    expect(runtime.newGame.mail[0]?.words).toEqual(Array.from({ length: 9 }, () => 0xffff));
  });

  test('copies a provided mail struct and moves party mail into storage slots like GiveMailToMon2 / TakeMailFromMon2', () => {
    const runtime = createScriptRuntimeState();
    const pokemon = runtime.party[0]!;
    const mail = {
      ...createClearedMailSlot(),
      words: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      playerName: 'GREEN ',
      trainerId: 0x01020304,
      species: 'SPECIES_PIKACHU',
      itemId: 'ITEM_FAB_MAIL'
    };

    const mailId = giveMailToMon2(runtime, pokemon, mail);
    expect(mailId).toBe(0);
    expect(runtime.newGame.mail[0]).toEqual(mail);

    const storedMailId = takeMailFromMon2(runtime, pokemon);
    expect(storedMailId).toBe(6);
    expect(pokemon.mailId).toBe(0xff);
    expect(pokemon.heldItemId).toBeNull();
    expect(runtime.newGame.mail[6]).toEqual(mail);
    expect(runtime.newGame.mail[0]?.itemId).toBeNull();
    expect(runtime.newGame.mail[0]?.words).toEqual(mail.words);
  });

  test('clears held mail exactly like TakeMailFromMon / ClearMailItemId and recognizes mail items only', () => {
    const runtime = createScriptRuntimeState();
    const pokemon = runtime.party[0]!;
    const mailId = giveMailToMon(runtime, pokemon, 'ITEM_ORANGE_MAIL');
    expect(mailId).toBe(0);

    clearMailItemId(runtime, mailId);
    expect(runtime.newGame.mail[0]?.itemId).toBeNull();
    expect(monHasMail(pokemon)).toBe(true);

    runtime.newGame.mail[0]!.itemId = 'ITEM_ORANGE_MAIL';
    pokemon.heldItemId = 'ITEM_ORANGE_MAIL';
    pokemon.mailId = 0;
    takeMailFromMon(runtime, pokemon);
    expect(pokemon.heldItemId).toBeNull();
    expect(pokemon.mailId).toBe(0xff);
    expect(runtime.newGame.mail[0]?.itemId).toBeNull();

    expect(itemIsMail('ITEM_RETRO_MAIL')).toBe(true);
    expect(itemIsMail('ITEM_POTION')).toBe(false);
    expect(itemIsMail(null)).toBe(false);
  });

  test('exact C-name mail_data exports preserve mail clearing, species conversion, item checks, and transfers', () => {
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'LEAF';
    runtime.vars.playerTrainerId = 0x01020304;
    const pokemon = runtime.party[0]!;
    pokemon.species = 'UNOWN';
    pokemon.personality = 0x12345678;
    pokemon.heldItemId = null;
    pokemon.mailId = 0xff;

    runtime.newGame.mail[0]!.itemId = 'ITEM_RETRO_MAIL';
    ClearMailStruct(runtime.newGame.mail[0]!);
    expect(runtime.newGame.mail[0]).toEqual(createClearedMailSlot());

    expect(SpeciesToMailSpecies('UNOWN', 0x12345678)).toBe(30024);
    expect(MailSpeciesToSpecies(30024)).toEqual({
      species: 'SPECIES_UNOWN',
      unownLetter: 24
    });
    expect(ItemIsMail('ITEM_BEAD_MAIL')).toBe(true);
    expect(ItemIsMail('ITEM_POTION')).toBe(false);
    expect(DummyMailFunc()).toBe(false);

    const mailId = GiveMailToMon(runtime, pokemon, 'ITEM_BEAD_MAIL');
    expect(mailId).toBe(0);
    expect(MonHasMail(pokemon)).toBe(true);
    expect(runtime.newGame.mail[0]).toMatchObject({
      playerName: 'LEAF  ',
      trainerId: 0x01020304,
      species: 30024,
      itemId: 'ITEM_BEAD_MAIL'
    });

    ClearMailItemId(runtime, mailId);
    expect(runtime.newGame.mail[0]?.itemId).toBeNull();
    runtime.newGame.mail[0]!.itemId = 'ITEM_BEAD_MAIL';

    const storedMailId = TakeMailFromMon2(runtime, pokemon);
    expect(storedMailId).toBe(6);
    expect(runtime.newGame.mail[6]?.itemId).toBe('ITEM_BEAD_MAIL');
    expect(pokemon.mailId).toBe(0xff);
    expect(pokemon.heldItemId).toBeNull();

    const copiedMail = {
      ...createClearedMailSlot(),
      itemId: 'ITEM_FAB_MAIL',
      playerName: 'RED   ',
      trainerId: 0x11111111,
      species: 'SPECIES_PIKACHU'
    };
    expect(GiveMailToMon2(runtime, pokemon, copiedMail)).toBe(0);
    expect(runtime.newGame.mail[0]).toEqual(copiedMail);

    TakeMailFromMon(runtime, pokemon);
    expect(runtime.newGame.mail[0]?.itemId).toBeNull();

    runtime.newGame.mail[1]!.itemId = 'ITEM_ORANGE_MAIL';
    ClearMailData(runtime);
    expect(runtime.newGame.mail.every((entry) => entry.itemId === null)).toBe(true);
  });
});
