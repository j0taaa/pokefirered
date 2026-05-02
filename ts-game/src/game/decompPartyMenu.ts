export const PARTY_SIZE = 6;
export const SLOT_CONFIRM = PARTY_SIZE;
export const SLOT_CANCEL = PARTY_SIZE + 1;

export const PARTY_LAYOUT_SINGLE = 0;
export const PARTY_LAYOUT_DOUBLE = 1;
export const PARTY_LAYOUT_MULTI = 2;
export const PARTY_LAYOUT_MULTI_SHOWCASE = 3;

export const MENU_DIR_UP = -1;
export const MENU_DIR_DOWN = 1;
export const MENU_DIR_RIGHT = 2;
export const MENU_DIR_LEFT = -2;

export const MENU_L_PRESSED = 1;
export const MENU_R_PRESSED = 2;

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const START_BUTTON = 0x0008;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

export const SPECIES_NONE = 0;
export const SE_SELECT = 5;

export interface PartyMenuRuntime {
  [key: string]: unknown;
  layout: number;
  partyCount: number;
  partySpecies: number[];
  chooseMultiple: boolean;
  lastSelectedSlot: number;
  newAndRepeatedKeys: number;
  newKeys: number;
  lrKeysPressedAndHeld: number;
  playedSoundEffects: number[];
  slotAnimations: Array<{ slot: number; animNum: number }>;
}

export type PartyMenuMonLike = { nickname?: string; data?: Record<string, unknown> };

export const createPartyMenuRuntime = (overrides: Partial<PartyMenuRuntime> = {}): PartyMenuRuntime => ({
  layout: PARTY_LAYOUT_SINGLE,
  partyCount: PARTY_SIZE,
  partySpecies: Array.from({ length: PARTY_SIZE }, () => 1),
  chooseMultiple: false,
  lastSelectedSlot: 0,
  newAndRepeatedKeys: 0,
  newKeys: 0,
  lrKeysPressedAndHeld: 0,
  playedSoundEffects: [],
  slotAnimations: [],
  ...overrides
});

const joyNew = (runtime: PartyMenuRuntime, mask: number): number => runtime.newKeys & mask;

const playSE = (runtime: PartyMenuRuntime, soundEffect: number): void => {
  runtime.playedSoundEffects.push(soundEffect);
};

const animatePartySlot = (runtime: PartyMenuRuntime, slot: number, animNum: number): void => {
  runtime.slotAnimations.push({ slot, animNum });
};

const getMonSpecies = (runtime: PartyMenuRuntime, slotId: number): number => runtime.partySpecies[slotId] ?? SPECIES_NONE;

const toU8 = (value: number): number => value & 0xff;

const getPartyBgGfxTilemap = (runtime?: PartyMenuRuntime): Uint8Array => {
  if (runtime?.partyBgGfxTilemap instanceof Uint8Array)
    return runtime.partyBgGfxTilemap;
  const tilemap = new Uint8Array(0x8000);
  if (runtime)
    runtime.partyBgGfxTilemap = tilemap;
  return tilemap;
};

export const GetPartyMenuBgTile = (tileId: number, runtime?: PartyMenuRuntime): Uint8Array =>
  getPartyBgGfxTilemap(runtime).subarray((tileId & 0xffff) << 5);

export const GetMonNickname = <T extends { value?: string } | undefined = undefined>(
  mon: PartyMenuMonLike,
  dest?: T
): T extends undefined ? string : T => {
  const nickname = String(mon.data?.MON_DATA_NICKNAME ?? mon.nickname ?? '');
  if (dest && typeof dest === 'object')
    dest.value = nickname;
  return (dest ?? nickname) as T extends undefined ? string : T;
};

export const GetPartyMenuPalBufferPtr = (paletteId: number, runtime?: PartyMenuRuntime): Uint16Array => {
  if (!(runtime?.palBuffer instanceof Uint16Array)) {
    const palBuffer = new Uint16Array(0x100);
    if (runtime)
      runtime.palBuffer = palBuffer;
    return palBuffer.subarray(paletteId & 0xff);
  }
  return runtime.palBuffer.subarray(paletteId & 0xff);
};

export const PartyMenuButtonHandler = (runtime: PartyMenuRuntime, slotPtr: { value: number }): number => {
  let movementDir: number;

  switch (runtime.newAndRepeatedKeys) {
    case DPAD_UP:
      movementDir = MENU_DIR_UP;
      break;
    case DPAD_DOWN:
      movementDir = MENU_DIR_DOWN;
      break;
    case DPAD_LEFT:
      movementDir = MENU_DIR_LEFT;
      break;
    case DPAD_RIGHT:
      movementDir = MENU_DIR_RIGHT;
      break;
    default:
      switch (runtime.lrKeysPressedAndHeld) {
        case MENU_L_PRESSED:
          movementDir = MENU_DIR_UP;
          break;
        case MENU_R_PRESSED:
          movementDir = MENU_DIR_DOWN;
          break;
        default:
          movementDir = 0;
          break;
      }
      break;
  }
  if (joyNew(runtime, START_BUTTON))
    return START_BUTTON;
  if (movementDir) {
    UpdateCurrentPartySelection(runtime, slotPtr, movementDir);
    return 0;
  }
  if (joyNew(runtime, A_BUTTON) && slotPtr.value === SLOT_CANCEL)
    return B_BUTTON;
  return joyNew(runtime, A_BUTTON | B_BUTTON);
};

export const UpdateCurrentPartySelection = (
  runtime: PartyMenuRuntime,
  slotPtr: { value: number },
  movementDir: number
): void => {
  const newSlotId = slotPtr.value;
  const layout = runtime.layout;

  if (layout === PARTY_LAYOUT_SINGLE)
    UpdatePartySelectionSingleLayout(runtime, slotPtr, movementDir);
  else
    UpdatePartySelectionDoubleLayout(runtime, slotPtr, movementDir);
  if (slotPtr.value !== newSlotId) {
    playSE(runtime, SE_SELECT);
    animatePartySlot(runtime, newSlotId, 0);
    animatePartySlot(runtime, slotPtr.value, 1);
  }
};

export const UpdatePartySelectionSingleLayout = (
  runtime: PartyMenuRuntime,
  slotPtr: { value: number },
  movementDir: number
): void => {
  switch (movementDir) {
    case MENU_DIR_UP:
      if (slotPtr.value === 0)
        slotPtr.value = SLOT_CANCEL;
      else if (slotPtr.value === SLOT_CONFIRM)
        slotPtr.value = runtime.partyCount - 1;
      else if (slotPtr.value === SLOT_CANCEL) {
        if (runtime.chooseMultiple)
          slotPtr.value = SLOT_CONFIRM;
        else
          slotPtr.value = runtime.partyCount - 1;
      } else {
        --slotPtr.value;
      }
      break;
    case MENU_DIR_DOWN:
      if (slotPtr.value === SLOT_CANCEL)
        slotPtr.value = 0;
      else if (slotPtr.value === runtime.partyCount - 1) {
        if (runtime.chooseMultiple)
          slotPtr.value = SLOT_CONFIRM;
        else
          slotPtr.value = SLOT_CANCEL;
      } else {
        ++slotPtr.value;
      }
      break;
    case MENU_DIR_RIGHT:
      if (runtime.partyCount !== 1 && slotPtr.value === 0) {
        if (runtime.lastSelectedSlot === 0)
          slotPtr.value = 1;
        else
          slotPtr.value = runtime.lastSelectedSlot;
      }
      break;
    case MENU_DIR_LEFT:
      if (slotPtr.value !== 0 && slotPtr.value !== SLOT_CONFIRM && slotPtr.value !== SLOT_CANCEL) {
        runtime.lastSelectedSlot = slotPtr.value;
        slotPtr.value = 0;
      }
      break;
  }
};

export const UpdatePartySelectionDoubleLayout = (
  runtime: PartyMenuRuntime,
  slotPtr: { value: number },
  movementDir: number
): void => {
  let newSlot = movementDir;

  switch (movementDir) {
    case MENU_DIR_UP:
      if (slotPtr.value === 0) {
        slotPtr.value = SLOT_CANCEL;
        break;
      } else if (slotPtr.value === SLOT_CONFIRM) {
        slotPtr.value = runtime.partyCount - 1;
        break;
      } else if (slotPtr.value === SLOT_CANCEL) {
        if (runtime.chooseMultiple) {
          slotPtr.value = SLOT_CONFIRM;
          break;
        }
        --slotPtr.value;
      }
      newSlot = GetNewSlotDoubleLayout(runtime, slotPtr.value, newSlot);
      if (newSlot !== -1)
        slotPtr.value = newSlot;
      break;
    case MENU_DIR_DOWN:
      if (slotPtr.value === SLOT_CONFIRM)
        slotPtr.value = SLOT_CANCEL;
      else if (slotPtr.value === SLOT_CANCEL)
        slotPtr.value = 0;
      else {
        newSlot = GetNewSlotDoubleLayout(runtime, slotPtr.value, MENU_DIR_DOWN);
        if (newSlot === -1) {
          if (runtime.chooseMultiple)
            slotPtr.value = SLOT_CONFIRM;
          else
            slotPtr.value = SLOT_CANCEL;
        } else {
          slotPtr.value = newSlot;
        }
      }
      break;
    case MENU_DIR_RIGHT:
      if (slotPtr.value === 0) {
        if (runtime.lastSelectedSlot === 3) {
          if (getMonSpecies(runtime, 3) !== SPECIES_NONE)
            slotPtr.value = 3;
        } else if (getMonSpecies(runtime, 2) !== SPECIES_NONE) {
          slotPtr.value = 2;
        }
      } else if (slotPtr.value === 1) {
        if (runtime.lastSelectedSlot === 5) {
          if (getMonSpecies(runtime, 5) !== SPECIES_NONE)
            slotPtr.value = 5;
        } else if (getMonSpecies(runtime, 4) !== SPECIES_NONE) {
          slotPtr.value = 4;
        }
      }
      break;
    case MENU_DIR_LEFT:
      if (slotPtr.value === 2 || slotPtr.value === 3) {
        runtime.lastSelectedSlot = slotPtr.value;
        slotPtr.value = 0;
      } else if (slotPtr.value === 4 || slotPtr.value === 5) {
        runtime.lastSelectedSlot = slotPtr.value;
        slotPtr.value = 1;
      }
      break;
  }
};

export const GetNewSlotDoubleLayout = (
  runtime: PartyMenuRuntime,
  slotId: number,
  movementDir: number
): number => {
  while (true) {
    slotId += movementDir;
    if (toU8(slotId) >= SLOT_CONFIRM)
      return -1;
    if (getMonSpecies(runtime, slotId) !== SPECIES_NONE)
      return slotId;
  }
};

type PartyMenuAnyRuntime = PartyMenuRuntime & {
  operations?: string[];
  tasks?: Array<{ id: number; func: string | null; data: number[]; destroyed: boolean }>;
  sprites?: Array<{ id: number; kind: string; slot?: number; invisible: boolean; anim: number; destroyed: boolean; data: number[] }>;
  party?: Array<{ species: number; hp: number; maxHp: number; status?: number; isEgg?: boolean; item?: number; moves?: number[]; pp?: number[]; level?: number; friendship?: number; allowed?: boolean; selected?: boolean; canEvolve?: boolean }>;
  selectedSlot?: number;
  cursorSelection?: number;
  menuType?: number;
  partyMenuType?: number;
  message?: string;
  textPrinterActive?: boolean;
  mainCallback2?: string | null;
  exitCallback?: string | null;
  fieldCallback?: string | null;
  selectedOrder?: number[];
  battleOrder?: number[];
  itemId?: number;
  moveId?: number;
  tutorMove?: number;
  lastFieldMove?: string | null;
  usedFieldMoves?: string[];
  bagItems?: number[];
  mail?: Array<number | null>;
};

const asPartyRuntime = (value: unknown): PartyMenuAnyRuntime | null =>
  typeof value === 'object' && value !== null && ('partySpecies' in value || 'operations' in value) ? value as PartyMenuAnyRuntime : null;

const partyRuntimeFromArgs = (args: unknown[]): PartyMenuAnyRuntime => {
  const runtime = args.map(asPartyRuntime).find(Boolean);
  if (runtime) return runtime;
  return createPartyMenuRuntime() as PartyMenuAnyRuntime;
};

const partyOp = (runtime: PartyMenuAnyRuntime, name: string, ...args: unknown[]): void => {
  runtime.operations ??= [];
  runtime.operations.push([name, ...args.map(String)].join(':'));
};

const partyTask = (runtime: PartyMenuAnyRuntime, id = 0): { id: number; func: string | null; data: number[]; destroyed: boolean } => {
  runtime.tasks ??= [];
  return runtime.tasks[id] ?? (runtime.tasks[id] = { id, func: null, data: Array.from({ length: 16 }, () => 0), destroyed: false });
};

const partySprite = (runtime: PartyMenuAnyRuntime, kind: string, slot = 0): number => {
  runtime.sprites ??= [];
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, kind, slot, invisible: false, anim: 0, destroyed: false, data: Array.from({ length: 8 }, () => 0) });
  partyOp(runtime, 'CreateSprite', kind, slot);
  return id;
};

const monAt = (runtime: PartyMenuAnyRuntime, slot = runtime.selectedSlot ?? 0) => {
  runtime.party ??= Array.from({ length: PARTY_SIZE }, (_v, i) => ({ species: runtime.partySpecies[i] ?? 0, hp: 10, maxHp: 10, moves: [], pp: [] }));
  return runtime.party[slot];
};

const partyGeneric = (name: string) => (...args: unknown[]): unknown => {
  const runtime = partyRuntimeFromArgs(args);
  const nums = args.filter((arg): arg is number => typeof arg === 'number');
  const taskId = nums[0] ?? 0;
  partyOp(runtime, name, ...nums);
  switch (name) {
    case 'InitPartyMenu':
    case 'ResetPartyMenu':
      runtime.selectedSlot = 0; runtime.cursorSelection = 0; runtime.message = ''; runtime.textPrinterActive = false; runtime.selectedOrder = []; return undefined;
    case 'ShowPartyMenu':
    case 'AllocPartyMenuBg':
    case 'AllocPartyMenuBgGfx':
    case 'RenderPartyMenuBoxes':
    case 'CreatePartyMonSpritesLoop':
      return true;
    case 'ExitPartyMenu':
      runtime.mainCallback2 = runtime.exitCallback ?? null; return undefined;
    case 'Task_ExitPartyMenu':
    case 'Task_ClosePartyMenu':
    case 'Task_ClosePartyMenuAndSetCB2':
    case 'Task_ClosePartyMenuAfterText':
      partyTask(runtime, taskId).destroyed = true; runtime.mainCallback2 = runtime.exitCallback ?? null; return undefined;
    case 'FreePartyPointers':
      runtime.sprites = []; runtime.tasks = []; return undefined;
    case 'InitPartyMenuBoxes':
    case 'InitPartyMenuWindows':
      runtime.layout = nums[0] ?? runtime.layout; return undefined;
    case 'RenderPartyMenuBox':
    case 'DisplayPartyPokemonData':
    case 'DisplayPartyPokemonDescriptionData':
    case 'DisplayPartyPokemonDataForChooseMultiple':
    case 'DisplayPartyPokemonDataForWirelessMinigame':
    case 'DisplayPartyPokemonDataForMoveTutorOrEvolutionItem':
    case 'DisplayPartyPokemonDataToTeachMove':
    case 'DisplayPartyPokemonDataForMultiBattle':
      runtime.message = `${name}:${nums[0] ?? runtime.selectedSlot ?? 0}`; return name === 'DisplayPartyPokemonDataForMoveTutorOrEvolutionItem' ? true : undefined;
    case 'CreatePartyMonSprites':
      for (let i = 0; i < runtime.partyCount; i++) partySprite(runtime, 'monIcon', i); return undefined;
    case 'CreateCancelConfirmPokeballSprites':
      runtime.spriteIdConfirmPokeball = partySprite(runtime, 'confirm', SLOT_CONFIRM); runtime.spriteIdCancelPokeball = partySprite(runtime, 'cancel', SLOT_CANCEL); return undefined;
    case 'AnimatePartySlot':
      animatePartySlot(runtime, nums[0] ?? 0, nums[1] ?? 0); return undefined;
    case 'GetPartyBoxPaletteFlags': {
      const slot = nums[0] ?? 0; const mon = monAt(runtime, slot); return (mon?.hp === 0 ? 2 : 0) | (slot === runtime.selectedSlot ? 1 : 0) | (mon?.species ? 0 : 64);
    }
    case 'IsMultiBattle':
      return runtime.layout === PARTY_LAYOUT_MULTI || runtime.layout === PARTY_LAYOUT_MULTI_SHOWCASE;
    case 'SwapPartyPokemon':
    case 'SwitchPartyMon':
    case 'SwitchPartyMonSlots': {
      const a = nums[0] ?? 0, b = nums[1] ?? 1;
      [runtime.partySpecies[a], runtime.partySpecies[b]] = [runtime.partySpecies[b] ?? SPECIES_NONE, runtime.partySpecies[a] ?? SPECIES_NONE];
      if (runtime.party) [runtime.party[a], runtime.party[b]] = [runtime.party[b], runtime.party[a]];
      return undefined;
    }
    case 'GetCursorSelectionMonId':
      return runtime.selectedSlot ?? runtime.cursorSelection ?? 0;
    case 'GetPartyMenuType':
      return runtime.partyMenuType ?? runtime.menuType ?? 0;
    case 'HandleChooseMonSelection':
      runtime.selectedSlot = nums[0] ?? runtime.selectedSlot ?? 0; return true;
    case 'IsSelectedMonNotEgg':
      return !monAt(runtime)?.isEgg;
    case 'HandleChooseMonCancel':
      runtime.selectedSlot = SLOT_CANCEL; return true;
    case 'DisplayPartyMenuMessage':
    case 'PartyMenuPrintText':
    case 'DisplayPartyMenuStdMessage':
      runtime.message = String(args[0] ?? name); runtime.textPrinterActive = true; return undefined;
    case 'IsPartyMenuTextPrinterActive':
      return !!runtime.textPrinterActive;
    case 'GiveItemToMon': {
      const mon = monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0); if (!mon) return false; mon.item = nums[1] ?? runtime.itemId ?? 0; return true;
    }
    case 'TryTakeMonItem': {
      const mon = monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0); const item = mon?.item ?? 0; if (mon) mon.item = 0; runtime.itemId = item; return item !== 0;
    }
    case 'PartyMenuModifyHP': {
      const mon = monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0); if (!mon) return 0; mon.hp = Math.max(0, Math.min(mon.maxHp, mon.hp + (nums[1] ?? 0))); return mon.hp;
    }
    case 'ResetHPTaskData':
      partyTask(runtime, taskId).data.fill(0); return undefined;
    case 'GetAilmentFromStatus': {
      const status = nums[0] ?? 0; return status & 7 ? 1 : status & 8 ? 2 : status & 0x10 ? 3 : status & 0x20 ? 4 : status & 0x40 ? 5 : 0;
    }
    case 'GetMonAilment':
      return partyGeneric('GetAilmentFromStatus')(monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0)?.status ?? 0, runtime);
    case 'SetPartyMonsAllowedInMinigame':
      runtime.party?.forEach(mon => { mon.allowed = !!mon.species && !mon.isEgg; }); return undefined;
    case 'IsMonAllowedInPokemonJump':
    case 'IsMonAllowedInDodrioBerryPicking':
    case 'IsMonAllowedInMinigame':
      return !!monAt(runtime, nums[0] ?? 0)?.species && !monAt(runtime, nums[0] ?? 0)?.isEgg;
    case 'TryEnterMonForMinigame':
      return partyGeneric('IsMonAllowedInMinigame')(nums[0] ?? 0, runtime);
    case 'GetTutorMove':
      return runtime.tutorMove ?? runtime.moveId ?? 0;
    case 'CanMonLearnTMTutor':
    case 'CanLearnTutorMove': {
      const mon = monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0); const move = nums[1] ?? runtime.tutorMove ?? runtime.moveId ?? 0; return mon?.moves?.includes(move) ? 2 : mon?.isEgg ? 3 : mon?.species ? 0 : 1;
    }
    case 'CreatePartyMonIconSpriteParameterized':
    case 'CreatePartyMonIconSprite':
      return partySprite(runtime, 'monIcon', nums.at(-1) ?? runtime.selectedSlot ?? 0);
    case 'CreatePartyMonHeldItemSpriteParameterized':
    case 'CreatePartyMonHeldItemSprite':
      return partySprite(runtime, 'heldItem', nums.at(-1) ?? runtime.selectedSlot ?? 0);
    case 'CreatePartyMonPokeballSpriteParameterized':
    case 'CreatePartyMonPokeballSprite':
    case 'CreatePokeballButtonSprite':
    case 'CreateSmallPokeballButtonSprite':
      return partySprite(runtime, 'pokeball', nums.at(-1) ?? 0);
    case 'CreatePartyMonStatusSpriteParameterized':
    case 'CreatePartyMonStatusSprite':
      return partySprite(runtime, 'status', nums.at(-1) ?? runtime.selectedSlot ?? 0);
    case 'UpdateHPBar':
    case 'UpdatePartyMonHPBar': {
      const mon = monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0); return mon?.maxHp ? Math.trunc((mon.hp * 48) / mon.maxHp) : 0;
    }
    case 'ShowOrHideHeldItemSprite':
      runtime.sprites?.filter(s => s.kind === 'heldItem').forEach(s => { s.invisible = !!nums[0]; }); return undefined;
    case 'SetPartyMonAilmentGfx':
    case 'UpdatePartyMonAilmentGfx':
      return partyGeneric('GetMonAilment')(nums[0] ?? runtime.selectedSlot ?? 0, runtime);
    case 'SetPartyMonSelectionActions':
    case 'SetPartyMonFieldSelectionActions':
      runtime.actions = nums; runtime.numActions = nums.length; return undefined;
    case 'GetPartyMenuActionsType':
    case 'GetPartyMenuActionsTypeInBattle':
      return runtime.menuType ?? 0;
    case 'CB2_ShowPokemonSummaryScreen':
    case 'CB2_ShowSummaryScreenToForgetMove':
      runtime.mainCallback2 = 'ShowPokemonSummaryScreen'; return undefined;
    case 'SwitchSelectedMons':
      return partyGeneric('SwapPartyPokemon')(runtime.selectedSlot ?? 0, runtime.lastSelectedSlot || 0, runtime);
    case 'TryMovePartySlot':
      runtime.selectedSlot = nums[1] ?? runtime.selectedSlot ?? 0; return true;
    case 'MoveAndBufferPartySlot':
      return partyGeneric('SwapPartyPokemon')(nums[0] ?? 0, nums[1] ?? 1, runtime);
    case 'FinishTwoMonAction':
      runtime.lastSelectedSlot = runtime.selectedSlot ?? 0; return undefined;
    case 'SetUpFieldMove_Surf':
    case 'SetUpFieldMove_Fly':
    case 'SetUpFieldMove_Waterfall':
      runtime.lastFieldMove = name.replace('SetUpFieldMove_', ''); return true;
    case 'GetFieldMoveMonSpecies':
      return monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0)?.species ?? SPECIES_NONE;
    case 'IsHPRecoveryItem':
      return [13, 14, 15, 16, 17, 18, 19, 20].includes(nums[0] ?? runtime.itemId ?? 0);
    case 'GetMedicineItemEffectMessage':
      runtime.message = 'medicine'; return runtime.message;
    case 'NotUsingHPEVItemOnShedinja':
      return (monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0)?.species ?? 0) !== 292;
    case 'IsItemFlute':
      return [39, 40, 41, 42, 43, 44, 45].includes(nums[0] ?? runtime.itemId ?? 0);
    case 'ExecuteTableBasedItemEffect_':
      runtime.itemEffectExecuted = true; return 0;
    case 'SetSelectedMoveForPPItem':
      runtime.selectedMove = nums[0] ?? 0; return undefined;
    case 'TryUsePPItemOutsideBattle':
    case 'TryUsePPItemInBattle':
      return true;
    case 'ItemIdToBattleMoveId':
      return nums[0] ?? runtime.itemId ?? 0;
    case 'IsMoveHm':
      return (nums[0] ?? runtime.moveId ?? 0) >= 0x100;
    case 'MonKnowsMove':
      return !!monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0)?.moves?.includes(nums[1] ?? runtime.moveId ?? 0);
    case 'ItemUseCB_ReplaceMoveWithTMHM': {
      const mon = monAt(runtime); if (mon?.moves) mon.moves[runtime.selectedMove as number || 0] = runtime.moveId ?? nums[0] ?? 0; return undefined;
    }
    case 'UpdateMonDisplayInfoAfterRareCandy': {
      const mon = monAt(runtime); if (mon) mon.level = (mon.level ?? 1) + 1; return undefined;
    }
    case 'UseSacredAsh':
      runtime.party?.forEach(mon => { if (mon.species) mon.hp = mon.maxHp; }); return true;
    case 'MonCanEvolve':
      return !!monAt(runtime, nums[0] ?? runtime.selectedSlot ?? 0)?.canEvolve;
    case 'GetItemEffectType':
      return nums[0] ?? runtime.itemId ?? 0;
    case 'TryTutorSelectedMon':
      return partyGeneric('CanLearnTutorMove')(runtime.selectedSlot ?? 0, runtime.tutorMove ?? 0, runtime) === 0;
    case 'TryGiveItemOrMailToSelectedMon':
    case 'GiveItemOrMailToSelectedMon':
    case 'GiveItemToSelectedMon':
      return partyGeneric('GiveItemToMon')(runtime.selectedSlot ?? 0, runtime.itemId ?? nums[0] ?? 0, runtime);
    case 'RemoveItemToGiveFromBag':
      runtime.bagItems = (runtime.bagItems ?? []).filter(item => item !== (runtime.itemId ?? nums[0])); return undefined;
    case 'TryGiveMailToSelectedMon':
      runtime.mail ??= []; runtime.mail[runtime.selectedSlot ?? 0] = nums[0] ?? 1; return true;
    case 'InitChooseMonsForBattle':
    case 'ClearSelectedPartyOrder':
      runtime.selectedOrder = []; return undefined;
    case 'GetPartySlotEntryStatus':
      return runtime.selectedOrder?.includes(nums[0] ?? 0) ? 1 : 0;
    case 'GetBattleEntryEligibility':
      return !!monAt(runtime, nums[0] ?? 0)?.species && (monAt(runtime, nums[0] ?? 0)?.hp ?? 0) > 0;
    case 'CheckBattleEntriesAndGetMessage':
      return (runtime.selectedOrder?.length ?? 0) > 0 ? 0 : 1;
    case 'HasPartySlotAlreadyBeenSelected':
      return !!runtime.selectedOrder?.includes(nums[0] ?? 0);
    case 'GetPartyLayoutFromBattleType':
      return nums[0] ? PARTY_LAYOUT_MULTI : PARTY_LAYOUT_SINGLE;
    case 'TrySwitchInPokemon':
      return partyGeneric('GetBattleEntryEligibility')(nums[0] ?? runtime.selectedSlot ?? 0, runtime);
    case 'BufferBattlePartyCurrentOrder':
      runtime.battleOrder = Array.from({ length: runtime.partyCount }, (_v, i) => i); return runtime.battleOrder;
    case 'BufferBattlePartyOrder':
    case 'BufferBattlePartyCurrentOrderBySide':
    case 'BufferBattlePartyOrderBySide':
      runtime.battleOrder = nums.length ? nums : Array.from({ length: runtime.partyCount }, (_v, i) => i); return runtime.battleOrder;
    case 'SwitchPartyOrderLinkMulti':
      return partyGeneric('SwitchPartyMonSlots')(nums[0] ?? 0, nums[1] ?? 1, runtime);
    case 'GetPartyIdFromBattleSlot':
      return runtime.battleOrder?.[nums[0] ?? 0] ?? nums[0] ?? 0;
    case 'SetPartyIdAtBattleSlot':
      runtime.battleOrder ??= []; runtime.battleOrder[nums[0] ?? 0] = nums[1] ?? 0; return undefined;
    case 'GetPartyIdFromBattlePartyId':
      return runtime.battleOrder?.indexOf(nums[0] ?? 0) ?? -1;
    case 'UpdatePartyToBattleOrder':
    case 'UpdatePartyToFieldOrder':
      return runtime.battleOrder ?? [];
    case 'SwitchAliveMonIntoLeadSlot': {
      const idx = runtime.party?.findIndex(mon => mon.species && mon.hp > 0) ?? -1; if (idx > 0) partyGeneric('SwapPartyPokemon')(0, idx, runtime); return idx;
    }
    case 'ChoosePartyMonByMenuType':
      runtime.menuType = nums[0] ?? runtime.menuType ?? 0; return undefined;
    default:
      if (name.startsWith('Task_')) { const t = partyTask(runtime, taskId); t.data[0]++; t.func = name; return undefined; }
      if (name.startsWith('CB2_')) { runtime.mainCallback2 = name; return undefined; }
      if (name.startsWith('FieldCallback_')) { runtime.fieldCallback = name; return undefined; }
      if (name.startsWith('CursorCB_')) { runtime.lastCursorCallback = name; return undefined; }
      return undefined;
  }
};

export const InitPartyMenu = partyGeneric('InitPartyMenu');
export const CB2_UpdatePartyMenu = partyGeneric('CB2_UpdatePartyMenu');
export const VBlankCB_PartyMenu = partyGeneric('VBlankCB_PartyMenu');
export const CB2_InitPartyMenu = partyGeneric('CB2_InitPartyMenu');
export const ShowPartyMenu = partyGeneric('ShowPartyMenu');
export const ExitPartyMenu = partyGeneric('ExitPartyMenu');
export const Task_ExitPartyMenu = partyGeneric('Task_ExitPartyMenu');
export const ResetPartyMenu = partyGeneric('ResetPartyMenu');
export const AllocPartyMenuBg = partyGeneric('AllocPartyMenuBg');
export const AllocPartyMenuBgGfx = partyGeneric('AllocPartyMenuBgGfx');
export const PartyPaletteBufferCopy = partyGeneric('PartyPaletteBufferCopy');
export const FreePartyPointers = partyGeneric('FreePartyPointers');
export const InitPartyMenuBoxes = partyGeneric('InitPartyMenuBoxes');
export const RenderPartyMenuBox = partyGeneric('RenderPartyMenuBox');
export const DisplayPartyPokemonData = partyGeneric('DisplayPartyPokemonData');
export const DisplayPartyPokemonDescriptionData = partyGeneric('DisplayPartyPokemonDescriptionData');
export const DisplayPartyPokemonDataForChooseMultiple = partyGeneric('DisplayPartyPokemonDataForChooseMultiple');
export const DisplayPartyPokemonDataForWirelessMinigame = partyGeneric('DisplayPartyPokemonDataForWirelessMinigame');
export const DisplayPartyPokemonDataForMoveTutorOrEvolutionItem = partyGeneric('DisplayPartyPokemonDataForMoveTutorOrEvolutionItem');
export const DisplayPartyPokemonDataToTeachMove = partyGeneric('DisplayPartyPokemonDataToTeachMove');
export const DisplayPartyPokemonDataForMultiBattle = partyGeneric('DisplayPartyPokemonDataForMultiBattle');
export const RenderPartyMenuBoxes = partyGeneric('RenderPartyMenuBoxes');
export const CreatePartyMonSprites = partyGeneric('CreatePartyMonSprites');
export const CreatePartyMonSpritesLoop = partyGeneric('CreatePartyMonSpritesLoop');
export const CreateCancelConfirmPokeballSprites = partyGeneric('CreateCancelConfirmPokeballSprites');
export const AnimatePartySlot = partyGeneric('AnimatePartySlot');
export const GetPartyBoxPaletteFlags = partyGeneric('GetPartyBoxPaletteFlags');
export const DrawCancelConfirmButtons = partyGeneric('DrawCancelConfirmButtons');
export const IsMultiBattle = partyGeneric('IsMultiBattle');
export const SwapPartyPokemon = partyGeneric('SwapPartyPokemon');
export const Task_ClosePartyMenu = partyGeneric('Task_ClosePartyMenu');
export const Task_ClosePartyMenuAndSetCB2 = partyGeneric('Task_ClosePartyMenuAndSetCB2');
export const GetCursorSelectionMonId = partyGeneric('GetCursorSelectionMonId');
export const GetPartyMenuType = partyGeneric('GetPartyMenuType');
export const Task_HandleChooseMonInput = partyGeneric('Task_HandleChooseMonInput');
export const HandleChooseMonSelection = partyGeneric('HandleChooseMonSelection');
export const IsSelectedMonNotEgg = partyGeneric('IsSelectedMonNotEgg');
export const HandleChooseMonCancel = partyGeneric('HandleChooseMonCancel');
export const DisplayCancelChooseMonYesNo = partyGeneric('DisplayCancelChooseMonYesNo');
export const Task_CancelChooseMonYesNo = partyGeneric('Task_CancelChooseMonYesNo');
export const Task_HandleCancelChooseMonYesNoInput = partyGeneric('Task_HandleCancelChooseMonYesNoInput');
export const DisplayPartyMenuMessage = partyGeneric('DisplayPartyMenuMessage');
export const Task_PrintAndWaitForText = partyGeneric('Task_PrintAndWaitForText');
export const IsPartyMenuTextPrinterActive = partyGeneric('IsPartyMenuTextPrinterActive');
export const Task_WaitForLinkAndReturnToChooseMon = partyGeneric('Task_WaitForLinkAndReturnToChooseMon');
export const Task_ReturnToChooseMonAfterText = partyGeneric('Task_ReturnToChooseMonAfterText');
export const DisplayGaveHeldItemMessage = partyGeneric('DisplayGaveHeldItemMessage');
export const DisplayTookHeldItemMessage = partyGeneric('DisplayTookHeldItemMessage');
export const DisplayAlreadyHoldingItemSwitchMessage = partyGeneric('DisplayAlreadyHoldingItemSwitchMessage');
export const DisplaySwitchedHeldItemMessage = partyGeneric('DisplaySwitchedHeldItemMessage');
export const GiveItemToMon = partyGeneric('GiveItemToMon');
export const TryTakeMonItem = partyGeneric('TryTakeMonItem');
export const BufferBagFullCantTakeItemMessage = partyGeneric('BufferBagFullCantTakeItemMessage');
export const Task_PartyMenuModifyHP = partyGeneric('Task_PartyMenuModifyHP');
export const PartyMenuModifyHP = partyGeneric('PartyMenuModifyHP');
export const ResetHPTaskData = partyGeneric('ResetHPTaskData');
export const GetAilmentFromStatus = partyGeneric('GetAilmentFromStatus');
export const GetMonAilment = partyGeneric('GetMonAilment');
export const SetPartyMonsAllowedInMinigame = partyGeneric('SetPartyMonsAllowedInMinigame');
export const IsMonAllowedInPokemonJump = partyGeneric('IsMonAllowedInPokemonJump');
export const IsMonAllowedInDodrioBerryPicking = partyGeneric('IsMonAllowedInDodrioBerryPicking');
export const IsMonAllowedInMinigame = partyGeneric('IsMonAllowedInMinigame');
export const TryEnterMonForMinigame = partyGeneric('TryEnterMonForMinigame');
export const CancelParticipationPrompt = partyGeneric('CancelParticipationPrompt');
export const Task_CancelParticipationYesNo = partyGeneric('Task_CancelParticipationYesNo');
export const Task_HandleCancelParticipationYesNoInput = partyGeneric('Task_HandleCancelParticipationYesNoInput');
export const CanMonLearnTMTutor = partyGeneric('CanMonLearnTMTutor');
export const GetTutorMove = partyGeneric('GetTutorMove');
export const CanLearnTutorMove = partyGeneric('CanLearnTutorMove');
export const Task_FirstBattleEnterParty_WaitFadeIn = partyGeneric('Task_FirstBattleEnterParty_WaitFadeIn');
export const Task_FirstBattleEnterParty_DarkenScreen = partyGeneric('Task_FirstBattleEnterParty_DarkenScreen');
export const Task_FirstBattleEnterParty_WaitDarken = partyGeneric('Task_FirstBattleEnterParty_WaitDarken');
export const Task_FirstBattleEnterParty_CreatePrinter = partyGeneric('Task_FirstBattleEnterParty_CreatePrinter');
export const Task_FirstBattleEnterParty_RunPrinterMsg1 = partyGeneric('Task_FirstBattleEnterParty_RunPrinterMsg1');
export const Task_FirstBattleEnterParty_LightenFirstMonIcon = partyGeneric('Task_FirstBattleEnterParty_LightenFirstMonIcon');
export const Task_FirstBattleEnterParty_WaitLightenFirstMonIcon = partyGeneric('Task_FirstBattleEnterParty_WaitLightenFirstMonIcon');
export const Task_FirstBattleEnterParty_StartPrintMsg2 = partyGeneric('Task_FirstBattleEnterParty_StartPrintMsg2');
export const Task_FirstBattleEnterParty_RunPrinterMsg2 = partyGeneric('Task_FirstBattleEnterParty_RunPrinterMsg2');
export const Task_FirstBattleEnterParty_FadeNormal = partyGeneric('Task_FirstBattleEnterParty_FadeNormal');
export const Task_FirstBattleEnterParty_WaitFadeNormal = partyGeneric('Task_FirstBattleEnterParty_WaitFadeNormal');
export const Task_PartyMenu_Pokedude = partyGeneric('Task_PartyMenu_Pokedude');
export const Task_PartyMenu_PokedudeStep = partyGeneric('Task_PartyMenu_PokedudeStep');
export const PartyMenuPokedudeIsCancelled = partyGeneric('PartyMenuPokedudeIsCancelled');
export const PartyMenuHandlePokedudeCancel = partyGeneric('PartyMenuHandlePokedudeCancel');
export const Task_PartyMenuFromBag_Pokedude = partyGeneric('Task_PartyMenuFromBag_Pokedude');
export const Task_PartyMenuFromBag_PokedudeStep = partyGeneric('Task_PartyMenuFromBag_PokedudeStep');
export const InitPartyMenuWindows = partyGeneric('InitPartyMenuWindows');
export const CreateCancelConfirmWindows = partyGeneric('CreateCancelConfirmWindows');
export const BlitBitmapToPartyWindow = partyGeneric('BlitBitmapToPartyWindow');
export const BlitBitmapToPartyWindow_LeftColumn = partyGeneric('BlitBitmapToPartyWindow_LeftColumn');
export const BlitBitmapToPartyWindow_RightColumn = partyGeneric('BlitBitmapToPartyWindow_RightColumn');
export const DrawEmptySlot = partyGeneric('DrawEmptySlot');
export const LoadPartyBoxPalette = partyGeneric('LoadPartyBoxPalette');
export const DisplayPartyPokemonBarDetail = partyGeneric('DisplayPartyPokemonBarDetail');
export const DisplayPartyPokemonNickname = partyGeneric('DisplayPartyPokemonNickname');
export const DisplayPartyPokemonLevelCheck = partyGeneric('DisplayPartyPokemonLevelCheck');
export const DisplayPartyPokemonLevel = partyGeneric('DisplayPartyPokemonLevel');
export const DisplayPartyPokemonGenderNidoranCheck = partyGeneric('DisplayPartyPokemonGenderNidoranCheck');
export const DisplayPartyPokemonGender = partyGeneric('DisplayPartyPokemonGender');
export const DisplayPartyPokemonHPCheck = partyGeneric('DisplayPartyPokemonHPCheck');
export const DisplayPartyPokemonHP = partyGeneric('DisplayPartyPokemonHP');
export const DisplayPartyPokemonMaxHPCheck = partyGeneric('DisplayPartyPokemonMaxHPCheck');
export const DisplayPartyPokemonMaxHP = partyGeneric('DisplayPartyPokemonMaxHP');
export const DisplayPartyPokemonHPBarCheck = partyGeneric('DisplayPartyPokemonHPBarCheck');
export const DisplayPartyPokemonHPBar = partyGeneric('DisplayPartyPokemonHPBar');
export const DisplayPartyPokemonDescriptionText = partyGeneric('DisplayPartyPokemonDescriptionText');
export const PartyMenuRemoveWindow = partyGeneric('PartyMenuRemoveWindow');
export const DisplayPartyMenuStdMessage = partyGeneric('DisplayPartyMenuStdMessage');
export const ShouldUseChooseMonText = partyGeneric('ShouldUseChooseMonText');
export const DisplaySelectionWindow = partyGeneric('DisplaySelectionWindow');
export const PartyMenuPrintText = partyGeneric('PartyMenuPrintText');
export const PartyMenuDisplayYesNoMenu = partyGeneric('PartyMenuDisplayYesNoMenu');
export const CreateLevelUpStatsWindow = partyGeneric('CreateLevelUpStatsWindow');
export const RemoveLevelUpStatsWindow = partyGeneric('RemoveLevelUpStatsWindow');
export const PartyMenu_Oak_PrintText = partyGeneric('PartyMenu_Oak_PrintText');
export const FirstBattleEnterParty_CreateWindowAndMsg1Printer = partyGeneric('FirstBattleEnterParty_CreateWindowAndMsg1Printer');
export const FirstBattleEnterParty_DestroyVoiceoverWindow = partyGeneric('FirstBattleEnterParty_DestroyVoiceoverWindow');
export const ToggleFieldMoveDescriptionWindow = partyGeneric('ToggleFieldMoveDescriptionWindow');
export const CreatePartyMonIconSprite = partyGeneric('CreatePartyMonIconSprite');
export const CreatePartyMonIconSpriteParameterized = partyGeneric('CreatePartyMonIconSpriteParameterized');
export const UpdateHPBar = partyGeneric('UpdateHPBar');
export const UpdatePartyMonHPBar = partyGeneric('UpdatePartyMonHPBar');
export const AnimateSelectedPartyIcon = partyGeneric('AnimateSelectedPartyIcon');
export const SpriteCB_BouncePartyMonIcon = partyGeneric('SpriteCB_BouncePartyMonIcon');
export const SpriteCB_UpdatePartyMonIcon = partyGeneric('SpriteCB_UpdatePartyMonIcon');
export const CreatePartyMonHeldItemSprite = partyGeneric('CreatePartyMonHeldItemSprite');
export const CreatePartyMonHeldItemSpriteParameterized = partyGeneric('CreatePartyMonHeldItemSpriteParameterized');
export const UpdatePartyMonHeldItemSprite = partyGeneric('UpdatePartyMonHeldItemSprite');
export const ShowOrHideHeldItemSprite = partyGeneric('ShowOrHideHeldItemSprite');
export const LoadHeldItemIcons = partyGeneric('LoadHeldItemIcons');
export const DrawHeldItemIconsForTrade = partyGeneric('DrawHeldItemIconsForTrade');
export const CreateHeldItemSpriteForTrade = partyGeneric('CreateHeldItemSpriteForTrade');
export const SpriteCB_HeldItem = partyGeneric('SpriteCB_HeldItem');
export const CreatePartyMonPokeballSprite = partyGeneric('CreatePartyMonPokeballSprite');
export const CreatePartyMonPokeballSpriteParameterized = partyGeneric('CreatePartyMonPokeballSpriteParameterized');
export const CreatePokeballButtonSprite = partyGeneric('CreatePokeballButtonSprite');
export const CreateSmallPokeballButtonSprite = partyGeneric('CreateSmallPokeballButtonSprite');
export const PartyMenuStartSpriteAnim = partyGeneric('PartyMenuStartSpriteAnim');
export const SpriteCB_BounceConfirmCancelButton = partyGeneric('SpriteCB_BounceConfirmCancelButton');
export const LoadPartyMenuPokeballGfx = partyGeneric('LoadPartyMenuPokeballGfx');
export const CreatePartyMonStatusSprite = partyGeneric('CreatePartyMonStatusSprite');
export const CreatePartyMonStatusSpriteParameterized = partyGeneric('CreatePartyMonStatusSpriteParameterized');
export const SetPartyMonAilmentGfx = partyGeneric('SetPartyMonAilmentGfx');
export const UpdatePartyMonAilmentGfx = partyGeneric('UpdatePartyMonAilmentGfx');
export const LoadPartyMenuAilmentGfx = partyGeneric('LoadPartyMenuAilmentGfx');
export const SetPartyMonSelectionActions = partyGeneric('SetPartyMonSelectionActions');
export const SetPartyMonFieldSelectionActions = partyGeneric('SetPartyMonFieldSelectionActions');
export const GetPartyMenuActionsType = partyGeneric('GetPartyMenuActionsType');
export const CreateSelectionWindow = partyGeneric('CreateSelectionWindow');
export const Task_TryCreateSelectionWindow = partyGeneric('Task_TryCreateSelectionWindow');
export const Task_HandleSelectionMenuInput = partyGeneric('Task_HandleSelectionMenuInput');
export const CursorCB_Summary = partyGeneric('CursorCB_Summary');
export const CB2_ShowPokemonSummaryScreen = partyGeneric('CB2_ShowPokemonSummaryScreen');
export const CB2_ReturnToPartyMenuFromSummaryScreen = partyGeneric('CB2_ReturnToPartyMenuFromSummaryScreen');
export const CursorCB_Switch = partyGeneric('CursorCB_Switch');
export const SwitchSelectedMons = partyGeneric('SwitchSelectedMons');
export const TryMovePartySlot = partyGeneric('TryMovePartySlot');
export const MoveAndBufferPartySlot = partyGeneric('MoveAndBufferPartySlot');
export const MovePartyMenuBoxSprites = partyGeneric('MovePartyMenuBoxSprites');
export const SlidePartyMenuBoxSpritesOneStep = partyGeneric('SlidePartyMenuBoxSpritesOneStep');
export const SlidePartyMenuBoxOneStep = partyGeneric('SlidePartyMenuBoxOneStep');
export const Task_SlideSelectedSlotsOffscreen = partyGeneric('Task_SlideSelectedSlotsOffscreen');
export const Task_SlideSelectedSlotsOnscreen = partyGeneric('Task_SlideSelectedSlotsOnscreen');
export const SwitchMenuBoxSprites = partyGeneric('SwitchMenuBoxSprites');
export const SwitchPartyMon = partyGeneric('SwitchPartyMon');
export const SetSwitchedPartyOrderQuestLogEvent = partyGeneric('SetSwitchedPartyOrderQuestLogEvent');
export const FinishTwoMonAction = partyGeneric('FinishTwoMonAction');
export const CursorCB_Cancel1 = partyGeneric('CursorCB_Cancel1');
export const CursorCB_Item = partyGeneric('CursorCB_Item');
export const CursorCB_Give = partyGeneric('CursorCB_Give');
export const CB2_SelectBagItemToGive = partyGeneric('CB2_SelectBagItemToGive');
export const CB2_GiveHoldItem = partyGeneric('CB2_GiveHoldItem');
export const Task_GiveHoldItem = partyGeneric('Task_GiveHoldItem');
export const Task_SwitchHoldItemsPrompt = partyGeneric('Task_SwitchHoldItemsPrompt');
export const Task_SwitchItemsYesNo = partyGeneric('Task_SwitchItemsYesNo');
export const Task_HandleSwitchItemsYesNoInput = partyGeneric('Task_HandleSwitchItemsYesNoInput');
export const Task_WriteMailToGiveMonAfterText = partyGeneric('Task_WriteMailToGiveMonAfterText');
export const CB2_WriteMailToGiveMon = partyGeneric('CB2_WriteMailToGiveMon');
export const CB2_ReturnToPartyMenuFromWritingMail = partyGeneric('CB2_ReturnToPartyMenuFromWritingMail');
export const Task_DisplayGaveMailFromPartyMessage = partyGeneric('Task_DisplayGaveMailFromPartyMessage');
export const Task_UpdateHeldItemSprite = partyGeneric('Task_UpdateHeldItemSprite');
export const CursorCB_TakeItem = partyGeneric('CursorCB_TakeItem');
export const CursorCB_Mail = partyGeneric('CursorCB_Mail');
export const CursorCB_Read = partyGeneric('CursorCB_Read');
export const CB2_ReadHeldMail = partyGeneric('CB2_ReadHeldMail');
export const CB2_ReturnToPartyMenuFromReadingMail = partyGeneric('CB2_ReturnToPartyMenuFromReadingMail');
export const CursorCB_TakeMail = partyGeneric('CursorCB_TakeMail');
export const Task_SendMailToPCYesNo = partyGeneric('Task_SendMailToPCYesNo');
export const Task_HandleSendMailToPCYesNoInput = partyGeneric('Task_HandleSendMailToPCYesNoInput');
export const Task_LoseMailMessageYesNo = partyGeneric('Task_LoseMailMessageYesNo');
export const Task_HandleLoseMailMessageYesNoInput = partyGeneric('Task_HandleLoseMailMessageYesNoInput');
export const CursorCB_Cancel2 = partyGeneric('CursorCB_Cancel2');
export const CursorCB_SendMon = partyGeneric('CursorCB_SendMon');
export const CursorCB_Enter = partyGeneric('CursorCB_Enter');
export const MoveCursorToConfirm = partyGeneric('MoveCursorToConfirm');
export const CursorCB_NoEntry = partyGeneric('CursorCB_NoEntry');
export const CursorCB_Store = partyGeneric('CursorCB_Store');
export const CursorCB_Register = partyGeneric('CursorCB_Register');
export const CursorCB_Trade1 = partyGeneric('CursorCB_Trade1');
export const CursorCB_Trade2 = partyGeneric('CursorCB_Trade2');
export const CursorCB_FieldMove = partyGeneric('CursorCB_FieldMove');
export const DisplayFieldMoveExitAreaMessage = partyGeneric('DisplayFieldMoveExitAreaMessage');
export const Task_FieldMoveExitAreaYesNo = partyGeneric('Task_FieldMoveExitAreaYesNo');
export const Task_HandleFieldMoveExitAreaYesNoInput = partyGeneric('Task_HandleFieldMoveExitAreaYesNoInput');
export const FieldCallback_PrepareFadeInFromMenu = partyGeneric('FieldCallback_PrepareFadeInFromMenu');
export const Task_FieldMoveWaitForFade = partyGeneric('Task_FieldMoveWaitForFade');
export const GetFieldMoveMonSpecies = partyGeneric('GetFieldMoveMonSpecies');
export const Task_CancelAfterAorBPress = partyGeneric('Task_CancelAfterAorBPress');
export const DisplayCantUseFlashMessage = partyGeneric('DisplayCantUseFlashMessage');
export const FieldCallback_Surf = partyGeneric('FieldCallback_Surf');
export const SetUpFieldMove_Surf = partyGeneric('SetUpFieldMove_Surf');
export const DisplayCantUseSurfMessage = partyGeneric('DisplayCantUseSurfMessage');
export const SetUpFieldMove_Fly = partyGeneric('SetUpFieldMove_Fly');
export const CB2_ReturnToPartyMenuFromFlyMap = partyGeneric('CB2_ReturnToPartyMenuFromFlyMap');
export const FieldCallback_Waterfall = partyGeneric('FieldCallback_Waterfall');
export const SetUpFieldMove_Waterfall = partyGeneric('SetUpFieldMove_Waterfall');
export const SetSwappedHeldItemQuestLogEvent = partyGeneric('SetSwappedHeldItemQuestLogEvent');
export const SetUsedFieldMoveQuestLogEvent = partyGeneric('SetUsedFieldMoveQuestLogEvent');
export const SetUsedFlyQuestLogEvent = partyGeneric('SetUsedFlyQuestLogEvent');
export const CB2_ShowPartyMenuForItemUse = partyGeneric('CB2_ShowPartyMenuForItemUse');
export const CB2_ReturnToBagMenu = partyGeneric('CB2_ReturnToBagMenu');
export const CB2_ReturnToTMCaseMenu = partyGeneric('CB2_ReturnToTMCaseMenu');
export const CB2_ReturnToBerryPouchMenu = partyGeneric('CB2_ReturnToBerryPouchMenu');
export const Task_DoUseItemAnim = partyGeneric('Task_DoUseItemAnim');
export const CB2_DoUseItemAnim = partyGeneric('CB2_DoUseItemAnim');
export const CB2_UseItem = partyGeneric('CB2_UseItem');
export const CB2_UseTMHMAfterForgettingMove = partyGeneric('CB2_UseTMHMAfterForgettingMove');
export const Task_SetSacredAshCB = partyGeneric('Task_SetSacredAshCB');
export const IsHPRecoveryItem = partyGeneric('IsHPRecoveryItem');
export const GetMedicineItemEffectMessage = partyGeneric('GetMedicineItemEffectMessage');
export const NotUsingHPEVItemOnShedinja = partyGeneric('NotUsingHPEVItemOnShedinja');
export const IsItemFlute = partyGeneric('IsItemFlute');
export const ExecuteTableBasedItemEffect_ = partyGeneric('ExecuteTableBasedItemEffect_');
export const ItemUseCB_Medicine = partyGeneric('ItemUseCB_Medicine');
export const ItemUseCB_MedicineStep = partyGeneric('ItemUseCB_MedicineStep');
export const Task_DisplayHPRestoredMessage = partyGeneric('Task_DisplayHPRestoredMessage');
export const Task_ClosePartyMenuAfterText = partyGeneric('Task_ClosePartyMenuAfterText');
export const ShowMoveSelectWindow = partyGeneric('ShowMoveSelectWindow');
export const Task_HandleRestoreWhichMoveInput = partyGeneric('Task_HandleRestoreWhichMoveInput');
export const ItemUseCB_TryRestorePP = partyGeneric('ItemUseCB_TryRestorePP');
export const SetSelectedMoveForPPItem = partyGeneric('SetSelectedMoveForPPItem');
export const ReturnToUseOnWhichMon = partyGeneric('ReturnToUseOnWhichMon');
export const TryUsePPItemOutsideBattle = partyGeneric('TryUsePPItemOutsideBattle');
export const ItemUseCB_RestorePP = partyGeneric('ItemUseCB_RestorePP');
export const TryUsePPItemInBattle = partyGeneric('TryUsePPItemInBattle');
export const ItemUseCB_PPUp = partyGeneric('ItemUseCB_PPUp');
export const ItemIdToBattleMoveId = partyGeneric('ItemIdToBattleMoveId');
export const IsMoveHm = partyGeneric('IsMoveHm');
export const MonKnowsMove = partyGeneric('MonKnowsMove');
export const DisplayLearnMoveMessage = partyGeneric('DisplayLearnMoveMessage');
export const DisplayLearnMoveMessageAndClose = partyGeneric('DisplayLearnMoveMessageAndClose');
export const ItemUseCB_TMHM = partyGeneric('ItemUseCB_TMHM');
export const ItemUseCB_LearnedMove = partyGeneric('ItemUseCB_LearnedMove');
export const Task_LearnedMove = partyGeneric('Task_LearnedMove');
export const Task_DoLearnedMoveFanfareAfterText = partyGeneric('Task_DoLearnedMoveFanfareAfterText');
export const Task_LearnNextMoveOrClosePartyMenu = partyGeneric('Task_LearnNextMoveOrClosePartyMenu');
export const Task_ReplaceMoveYesNo = partyGeneric('Task_ReplaceMoveYesNo');
export const Task_HandleReplaceMoveYesNoInput = partyGeneric('Task_HandleReplaceMoveYesNoInput');
export const Task_ShowSummaryScreenToForgetMove = partyGeneric('Task_ShowSummaryScreenToForgetMove');
export const CB2_ShowSummaryScreenToForgetMove = partyGeneric('CB2_ShowSummaryScreenToForgetMove');
export const CB2_ReturnToPartyMenuWhileLearningMove = partyGeneric('CB2_ReturnToPartyMenuWhileLearningMove');
export const Task_ReturnToPartyMenuWhileLearningMove = partyGeneric('Task_ReturnToPartyMenuWhileLearningMove');
export const ItemUseCB_ReplaceMoveWithTMHM = partyGeneric('ItemUseCB_ReplaceMoveWithTMHM');
export const Task_ReplaceMoveWithTMHM = partyGeneric('Task_ReplaceMoveWithTMHM');
export const DisplayPartyMenuForgotMoveMessage = partyGeneric('DisplayPartyMenuForgotMoveMessage');
export const Task_PartyMenuReplaceMove = partyGeneric('Task_PartyMenuReplaceMove');
export const StopLearningMovePrompt = partyGeneric('StopLearningMovePrompt');
export const Task_StopLearningMoveYesNo = partyGeneric('Task_StopLearningMoveYesNo');
export const Task_HandleStopLearningMoveYesNoInput = partyGeneric('Task_HandleStopLearningMoveYesNoInput');
export const Task_TryLearningNextMoveAfterText = partyGeneric('Task_TryLearningNextMoveAfterText');
export const ItemUseCB_RareCandy = partyGeneric('ItemUseCB_RareCandy');
export const ItemUseCB_RareCandyStep = partyGeneric('ItemUseCB_RareCandyStep');
export const UpdateMonDisplayInfoAfterRareCandy = partyGeneric('UpdateMonDisplayInfoAfterRareCandy');
export const Task_DisplayLevelUpStatsPg1 = partyGeneric('Task_DisplayLevelUpStatsPg1');
export const Task_DisplayLevelUpStatsPg2 = partyGeneric('Task_DisplayLevelUpStatsPg2');
export const DisplayLevelUpStatsPg1 = partyGeneric('DisplayLevelUpStatsPg1');
export const DisplayLevelUpStatsPg2 = partyGeneric('DisplayLevelUpStatsPg2');
export const Task_TryLearnNewMoves = partyGeneric('Task_TryLearnNewMoves');
export const Task_TryLearningNextMove = partyGeneric('Task_TryLearningNextMove');
export const PartyMenuTryEvolution = partyGeneric('PartyMenuTryEvolution');
export const DisplayMonNeedsToReplaceMove = partyGeneric('DisplayMonNeedsToReplaceMove');
export const DisplayMonLearnedMove = partyGeneric('DisplayMonLearnedMove');
export const ItemUseCB_SacredAsh = partyGeneric('ItemUseCB_SacredAsh');
export const UseSacredAsh = partyGeneric('UseSacredAsh');
export const Task_SacredAshLoop = partyGeneric('Task_SacredAshLoop');
export const Task_SacredAshDisplayHPRestored = partyGeneric('Task_SacredAshDisplayHPRestored');
export const ItemUseCB_EvolutionStone = partyGeneric('ItemUseCB_EvolutionStone');
export const CB2_UseEvolutionStone = partyGeneric('CB2_UseEvolutionStone');
export const MonCanEvolve = partyGeneric('MonCanEvolve');
export const GetItemEffectType = partyGeneric('GetItemEffectType');
export const TryTutorSelectedMon = partyGeneric('TryTutorSelectedMon');
export const CB2_PartyMenuFromStartMenu = partyGeneric('CB2_PartyMenuFromStartMenu');
export const CB2_ChooseMonToGiveItem = partyGeneric('CB2_ChooseMonToGiveItem');
export const TryGiveItemOrMailToSelectedMon = partyGeneric('TryGiveItemOrMailToSelectedMon');
export const GiveItemOrMailToSelectedMon = partyGeneric('GiveItemOrMailToSelectedMon');
export const GiveItemToSelectedMon = partyGeneric('GiveItemToSelectedMon');
export const Task_UpdateHeldItemSpriteAndClosePartyMenu = partyGeneric('Task_UpdateHeldItemSpriteAndClosePartyMenu');
export const CB2_WriteMailToGiveMonFromBag = partyGeneric('CB2_WriteMailToGiveMonFromBag');
export const CB2_ReturnToPartyOrBagMenuFromWritingMail = partyGeneric('CB2_ReturnToPartyOrBagMenuFromWritingMail');
export const Task_DisplayGaveMailFromBagMessage = partyGeneric('Task_DisplayGaveMailFromBagMessage');
export const Task_SwitchItemsFromBagYesNo = partyGeneric('Task_SwitchItemsFromBagYesNo');
export const Task_HandleSwitchItemsFromBagYesNoInput = partyGeneric('Task_HandleSwitchItemsFromBagYesNoInput');
export const DisplayItemMustBeRemovedFirstMessage = partyGeneric('DisplayItemMustBeRemovedFirstMessage');
export const RemoveItemToGiveFromBag = partyGeneric('RemoveItemToGiveFromBag');
export const ReturnGiveItemToBagOrPC = partyGeneric('ReturnGiveItemToBagOrPC');
export const ChooseMonToGiveMailFromMailbox = partyGeneric('ChooseMonToGiveMailFromMailbox');
export const TryGiveMailToSelectedMon = partyGeneric('TryGiveMailToSelectedMon');
export const InitChooseMonsForBattle = partyGeneric('InitChooseMonsForBattle');
export const ClearSelectedPartyOrder = partyGeneric('ClearSelectedPartyOrder');
export const GetPartySlotEntryStatus = partyGeneric('GetPartySlotEntryStatus');
export const GetBattleEntryEligibility = partyGeneric('GetBattleEntryEligibility');
export const CheckBattleEntriesAndGetMessage = partyGeneric('CheckBattleEntriesAndGetMessage');
export const HasPartySlotAlreadyBeenSelected = partyGeneric('HasPartySlotAlreadyBeenSelected');
export const Task_ValidateChosenMonsForBattle = partyGeneric('Task_ValidateChosenMonsForBattle');
export const Task_ContinueChoosingMonsForBattle = partyGeneric('Task_ContinueChoosingMonsForBattle');
export const ChooseMonForTradingBoard = partyGeneric('ChooseMonForTradingBoard');
export const ChooseMonForMoveTutor = partyGeneric('ChooseMonForMoveTutor');
export const ChooseMonForWirelessMinigame = partyGeneric('ChooseMonForWirelessMinigame');
export const GetPartyLayoutFromBattleType = partyGeneric('GetPartyLayoutFromBattleType');
export const OpenPartyMenuInTutorialBattle = partyGeneric('OpenPartyMenuInTutorialBattle');
export const Pokedude_OpenPartyMenuInBattle = partyGeneric('Pokedude_OpenPartyMenuInBattle');
export const Pokedude_ChooseMonForInBattleItem = partyGeneric('Pokedude_ChooseMonForInBattleItem');
export const EnterPartyFromItemMenuInBattle = partyGeneric('EnterPartyFromItemMenuInBattle');
export const GetPartyMenuActionsTypeInBattle = partyGeneric('GetPartyMenuActionsTypeInBattle');
export const TrySwitchInPokemon = partyGeneric('TrySwitchInPokemon');
export const BufferBattlePartyCurrentOrder = partyGeneric('BufferBattlePartyCurrentOrder');
export const BufferBattlePartyOrder = partyGeneric('BufferBattlePartyOrder');
export const BufferBattlePartyCurrentOrderBySide = partyGeneric('BufferBattlePartyCurrentOrderBySide');
export const BufferBattlePartyOrderBySide = partyGeneric('BufferBattlePartyOrderBySide');
export const SwitchPartyOrderLinkMulti = partyGeneric('SwitchPartyOrderLinkMulti');
export const GetPartyIdFromBattleSlot = partyGeneric('GetPartyIdFromBattleSlot');
export const SetPartyIdAtBattleSlot = partyGeneric('SetPartyIdAtBattleSlot');
export const SwitchPartyMonSlots = partyGeneric('SwitchPartyMonSlots');
export const GetPartyIdFromBattlePartyId = partyGeneric('GetPartyIdFromBattlePartyId');
export const UpdatePartyToBattleOrder = partyGeneric('UpdatePartyToBattleOrder');
export const UpdatePartyToFieldOrder = partyGeneric('UpdatePartyToFieldOrder');
export const SwitchAliveMonIntoLeadSlot = partyGeneric('SwitchAliveMonIntoLeadSlot');
export const CB2_SetUpExitToBattleScreen = partyGeneric('CB2_SetUpExitToBattleScreen');
export const ShowPartyMenuToShowcaseMultiBattleParty = partyGeneric('ShowPartyMenuToShowcaseMultiBattleParty');
export const Task_InitMultiPartnerPartySlideIn = partyGeneric('Task_InitMultiPartnerPartySlideIn');
export const Task_MultiPartnerPartySlideIn = partyGeneric('Task_MultiPartnerPartySlideIn');
export const Task_WaitAfterMultiPartnerPartySlideIn = partyGeneric('Task_WaitAfterMultiPartnerPartySlideIn');
export const MoveMultiPartyMenuBoxSprite = partyGeneric('MoveMultiPartyMenuBoxSprite');
export const SlideMultiPartyMenuBoxSpritesOneStep = partyGeneric('SlideMultiPartyMenuBoxSpritesOneStep');
export const ChooseMonForDaycare = partyGeneric('ChooseMonForDaycare');
export const ChoosePartyMonByMenuType = partyGeneric('ChoosePartyMonByMenuType');
export const CB2_FadeFromPartyMenu = partyGeneric('CB2_FadeFromPartyMenu');
export const Task_PartyMenuWaitForFade = partyGeneric('Task_PartyMenuWaitForFade');
