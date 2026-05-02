import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  GetMonNickname,
  GetNewSlotDoubleLayout,
  GetPartyMenuBgTile,
  GetPartyMenuPalBufferPtr,
  MENU_DIR_DOWN,
  MENU_DIR_LEFT,
  MENU_DIR_RIGHT,
  MENU_DIR_UP,
  MENU_L_PRESSED,
  MENU_R_PRESSED,
  PARTY_LAYOUT_DOUBLE,
  PARTY_LAYOUT_MULTI,
  PARTY_LAYOUT_MULTI_SHOWCASE,
  PARTY_LAYOUT_SINGLE,
  PartyMenuButtonHandler,
  SE_SELECT,
  SLOT_CANCEL,
  SLOT_CONFIRM,
  SPECIES_NONE,
  START_BUTTON,
  UpdateCurrentPartySelection,
  UpdatePartySelectionDoubleLayout,
  UpdatePartySelectionSingleLayout,
  createPartyMenuRuntime
  , InitPartyMenu
  , ShowPartyMenu
  , CreatePartyMonSprites
  , SwapPartyPokemon
  , GiveItemToMon
  , TryTakeMonItem
  , PartyMenuModifyHP
  , GetAilmentFromStatus
  , GetMonAilment
  , IsMonAllowedInMinigame
  , CanLearnTutorMove
  , SetUpFieldMove_Surf
  , SetUpFieldMove_Fly
  , CreatePartyMonIconSprite
  , ShowOrHideHeldItemSprite
  , BufferBattlePartyCurrentOrder
  , SetPartyIdAtBattleSlot
  , GetPartyIdFromBattleSlot
  , SwitchAliveMonIntoLeadSlot
  , UseSacredAsh
  , CB2_ShowPokemonSummaryScreen
} from '../src/game/decompPartyMenu';

describe('decompPartyMenu', () => {
  it('C-name helpers return party tile/palette buffer pointers and nickname destination', () => {
    const runtime = createPartyMenuRuntime({
      partyBgGfxTilemap: Uint8Array.from({ length: 128 }, (_v, i) => i),
      palBuffer: Uint16Array.from({ length: 32 }, (_v, i) => i + 100)
    });
    const dest = { value: '' };

    expect(GetPartyMenuBgTile(2, runtime)[0]).toBe(64);
    expect(GetPartyMenuBgTile(2, runtime).byteOffset).toBe((runtime.partyBgGfxTilemap as Uint8Array).byteOffset + 64);
    expect(GetPartyMenuPalBufferPtr(3, runtime)[0]).toBe(103);
    expect(GetPartyMenuPalBufferPtr(3, runtime).byteOffset).toBe((runtime.palBuffer as Uint16Array).byteOffset + 6);
    expect(GetMonNickname({ nickname: 'PIKA' }, dest)).toBe(dest);
    expect(dest.value).toBe('PIKA');
  });

  it('single layout up/down navigation preserves confirm, cancel, and choose-multiple rules', () => {
    const runtime = createPartyMenuRuntime({ layout: PARTY_LAYOUT_SINGLE, partyCount: 4 });
    const slotPtr = { value: 0 };

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(SLOT_CANCEL);

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(3);

    slotPtr.value = SLOT_CONFIRM;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(3);

    slotPtr.value = SLOT_CANCEL;
    runtime.chooseMultiple = true;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(SLOT_CONFIRM);

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CANCEL);

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(0);

    slotPtr.value = 3;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CONFIRM);

    runtime.chooseMultiple = false;
    slotPtr.value = 3;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CANCEL);
  });

  it('single layout left/right uses lastSelectedSlot exactly like the C branch', () => {
    const runtime = createPartyMenuRuntime({ layout: PARTY_LAYOUT_SINGLE, partyCount: 3 });
    const slotPtr = { value: 0 };

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(1);

    slotPtr.value = 2;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_LEFT);
    expect(slotPtr.value).toBe(0);
    expect(runtime.lastSelectedSlot).toBe(2);

    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(2);

    slotPtr.value = SLOT_CONFIRM;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_LEFT);
    expect(slotPtr.value).toBe(SLOT_CONFIRM);

    runtime.partyCount = 1;
    slotPtr.value = 0;
    UpdatePartySelectionSingleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(0);
  });

  it('GetNewSlotDoubleLayout skips empty species and preserves the C u8 negative guard', () => {
    const runtime = createPartyMenuRuntime({
      partySpecies: [1, SPECIES_NONE, SPECIES_NONE, 4, SPECIES_NONE, 6]
    });

    expect(GetNewSlotDoubleLayout(runtime, 0, MENU_DIR_DOWN)).toBe(3);
    expect(GetNewSlotDoubleLayout(runtime, 3, MENU_DIR_DOWN)).toBe(5);
    expect(GetNewSlotDoubleLayout(runtime, 5, MENU_DIR_DOWN)).toBe(-1);
    expect(GetNewSlotDoubleLayout(runtime, 3, MENU_DIR_UP)).toBe(0);
    expect(GetNewSlotDoubleLayout(runtime, 0, MENU_DIR_UP)).toBe(-1);
  });

  it('double layout up/down navigation matches confirm, cancel, gaps, and choose-multiple paths', () => {
    const runtime = createPartyMenuRuntime({
      layout: PARTY_LAYOUT_DOUBLE,
      partyCount: 5,
      partySpecies: [1, SPECIES_NONE, 3, SPECIES_NONE, 5, SPECIES_NONE]
    });
    const slotPtr = { value: 0 };

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(SLOT_CANCEL);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(0);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(2);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(4);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CANCEL);

    slotPtr.value = SLOT_CONFIRM;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CANCEL);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(4);

    slotPtr.value = SLOT_CONFIRM;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(4);

    runtime.chooseMultiple = true;
    slotPtr.value = SLOT_CANCEL;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_UP);
    expect(slotPtr.value).toBe(SLOT_CONFIRM);

    slotPtr.value = 4;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_DOWN);
    expect(slotPtr.value).toBe(SLOT_CONFIRM);
  });

  it('double layout horizontal navigation preserves remembered right-column slots', () => {
    const runtime = createPartyMenuRuntime({
      layout: PARTY_LAYOUT_DOUBLE,
      partySpecies: [1, 2, 3, 4, 5, 6]
    });
    const slotPtr = { value: 0 };

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(2);

    slotPtr.value = 3;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_LEFT);
    expect(slotPtr.value).toBe(0);
    expect(runtime.lastSelectedSlot).toBe(3);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(3);

    runtime.partySpecies[3] = SPECIES_NONE;
    slotPtr.value = 0;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(0);

    runtime.lastSelectedSlot = 0;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(2);

    slotPtr.value = 5;
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_LEFT);
    expect(slotPtr.value).toBe(1);
    expect(runtime.lastSelectedSlot).toBe(5);

    UpdatePartySelectionDoubleLayout(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(5);
  });

  it('UpdateCurrentPartySelection treats every non-single layout as double and only animates changes', () => {
    const runtime = createPartyMenuRuntime({ layout: PARTY_LAYOUT_MULTI, partySpecies: [1, 2, 3, 4, 5, 6] });
    const slotPtr = { value: 0 };

    UpdateCurrentPartySelection(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(2);
    expect(runtime.playedSoundEffects).toEqual([SE_SELECT]);
    expect(runtime.slotAnimations).toEqual([
      { slot: 0, animNum: 0 },
      { slot: 2, animNum: 1 }
    ]);

    runtime.layout = PARTY_LAYOUT_MULTI_SHOWCASE;
    runtime.playedSoundEffects = [];
    runtime.slotAnimations = [];
    UpdateCurrentPartySelection(runtime, slotPtr, MENU_DIR_RIGHT);
    expect(slotPtr.value).toBe(2);
    expect(runtime.playedSoundEffects).toEqual([]);
    expect(runtime.slotAnimations).toEqual([]);
  });

  it('PartyMenuButtonHandler follows key priority, LR fallback, cancel remap, and raw A/B return', () => {
    const runtime = createPartyMenuRuntime({ layout: PARTY_LAYOUT_SINGLE, partyCount: 3 });
    const slotPtr = { value: 0 };

    runtime.newAndRepeatedKeys = DPAD_DOWN;
    runtime.newKeys = START_BUTTON;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(START_BUTTON);
    expect(slotPtr.value).toBe(0);

    runtime.newKeys = 0;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(1);

    runtime.newAndRepeatedKeys = DPAD_UP;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(0);

    runtime.newAndRepeatedKeys = DPAD_LEFT;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(0);

    runtime.newAndRepeatedKeys = DPAD_RIGHT;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(1);

    runtime.newAndRepeatedKeys = 0;
    runtime.lrKeysPressedAndHeld = MENU_L_PRESSED;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(0);

    runtime.lrKeysPressedAndHeld = MENU_R_PRESSED;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(0);
    expect(slotPtr.value).toBe(1);

    runtime.lrKeysPressedAndHeld = 0;
    runtime.newKeys = A_BUTTON;
    slotPtr.value = SLOT_CANCEL;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(B_BUTTON);

    slotPtr.value = 0;
    runtime.newKeys = A_BUTTON | B_BUTTON;
    expect(PartyMenuButtonHandler(runtime, slotPtr)).toBe(A_BUTTON | B_BUTTON);
  });

  it('full party menu port keeps init, sprite creation, swapping, item, HP, and status state', () => {
    const runtime = createPartyMenuRuntime({
      partySpecies: [25, 4, 0, 7, 1, 2],
      partyCount: 6
    }) as ReturnType<typeof createPartyMenuRuntime> & {
      party: Array<{ species: number; hp: number; maxHp: number; status?: number; isEgg?: boolean; item?: number; moves?: number[] }>;
      selectedSlot: number;
      sprites: Array<{ kind: string; invisible: boolean; destroyed: boolean }>;
      operations: string[];
    };
    runtime.party = [
      { species: 25, hp: 12, maxHp: 35, status: 0x8, moves: [85] },
      { species: 4, hp: 0, maxHp: 30, status: 0x40, item: 99, moves: [52] },
      { species: 0, hp: 0, maxHp: 0 },
      { species: 7, hp: 10, maxHp: 44, isEgg: true },
      { species: 1, hp: 1, maxHp: 20 },
      { species: 2, hp: 9, maxHp: 25 }
    ];
    runtime.selectedSlot = 0;

    InitPartyMenu(runtime);
    expect(runtime.selectedSlot).toBe(0);
    expect(ShowPartyMenu(runtime)).toBe(true);
    CreatePartyMonSprites(runtime);
    expect(runtime.sprites.filter(sprite => sprite.kind === 'monIcon')).toHaveLength(6);

    SwapPartyPokemon(0, 1, runtime);
    expect(runtime.partySpecies.slice(0, 2)).toEqual([4, 25]);
    expect(runtime.party[0].species).toBe(4);

    expect(GiveItemToMon(0, 77, runtime)).toBe(true);
    expect(runtime.party[0].item).toBe(77);
    expect(TryTakeMonItem(0, runtime)).toBe(true);
    expect(runtime.party[0].item).toBe(0);

    expect(PartyMenuModifyHP(0, 5, runtime)).toBe(5);
    expect(GetAilmentFromStatus(0x40, runtime)).toBe(5);
    expect(GetMonAilment(0, runtime)).toBe(5);
  });

  it('full party menu port preserves minigame, tutor, field move, sprite visibility, battle order, and callbacks', () => {
    const runtime = createPartyMenuRuntime({ partySpecies: [25, 4, 0, 7, 1, 2] }) as ReturnType<typeof createPartyMenuRuntime> & {
      party: Array<{ species: number; hp: number; maxHp: number; isEgg?: boolean; item?: number; moves?: number[]; canEvolve?: boolean }>;
      selectedSlot: number;
      sprites: Array<{ kind: string; invisible: boolean; destroyed: boolean }>;
      battleOrder: number[];
      mainCallback2: string | null;
      lastFieldMove: string | null;
    };
    runtime.party = [
      { species: 25, hp: 0, maxHp: 35, moves: [85] },
      { species: 4, hp: 20, maxHp: 30, moves: [52], canEvolve: true },
      { species: 0, hp: 0, maxHp: 0 },
      { species: 7, hp: 10, maxHp: 44, isEgg: true },
      { species: 1, hp: 1, maxHp: 20 },
      { species: 2, hp: 9, maxHp: 25 }
    ];
    runtime.selectedSlot = 1;

    expect(IsMonAllowedInMinigame(1, runtime)).toBe(true);
    expect(IsMonAllowedInMinigame(3, runtime)).toBe(false);
    expect(CanLearnTutorMove(1, 99, runtime)).toBe(0);
    expect(CanLearnTutorMove(1, 52, runtime)).toBe(2);

    expect(SetUpFieldMove_Surf(runtime)).toBe(true);
    expect(runtime.lastFieldMove).toBe('Surf');
    expect(SetUpFieldMove_Fly(runtime)).toBe(true);
    expect(runtime.lastFieldMove).toBe('Fly');

    CreatePartyMonIconSprite(runtime);
    CreatePartyMonIconSprite(runtime);
    expect(runtime.sprites.length).toBe(2);
    ShowOrHideHeldItemSprite(1, runtime);

    expect(BufferBattlePartyCurrentOrder(runtime)).toEqual([0, 1, 2, 3, 4, 5]);
    SetPartyIdAtBattleSlot(0, 4, runtime);
    expect(GetPartyIdFromBattleSlot(0, runtime)).toBe(4);
    expect(SwitchAliveMonIntoLeadSlot(runtime)).toBe(1);
    expect(runtime.party[0].species).toBe(4);

    runtime.party.forEach(mon => { mon.hp = 0; });
    UseSacredAsh(runtime);
    expect(runtime.party.every(mon => !mon.species || mon.hp === mon.maxHp)).toBe(true);

    CB2_ShowPokemonSummaryScreen(runtime);
    expect(runtime.mainCallback2).toBe('ShowPokemonSummaryScreen');
  });
});
