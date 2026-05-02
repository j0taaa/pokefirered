import { describe, expect, test } from 'vitest';
import {
  BufferMonInfo,
  BufferMonMoves,
  BufferMonSkills,
  CB2_SetUpPSS,
  CreateExpBarObjs,
  CreateHpBarObjs,
  CreateMoveSelectionCursorObjs,
  CreatePokerusIconObj,
  CreateShinyStarObj,
  DestroyMoveSelectionCursorObjs,
  GetLastViewedMonIndex,
  GetMonMoveBySlotId,
  GetMonPpByMoveSlot,
  GetMoveSlotToReplace,
  HideShowPokerusIcon,
  HideShowShinyStar,
  IsPageFlipInput,
  MapSecIsInKantoOrSevii,
  PageFlipInputIsDisabled,
  PokeSum_CanForgetSelectedMove,
  PokeSum_CanSeekToMon,
  PokeSum_CreateMonMarkingsSprite,
  PokeSum_CreateMonPicSprite,
  PokeSum_DestroyMonPicSprite,
  PokeSum_FlipPages_SlideLayerLeft,
  PokeSum_HideSpritesBeforePageFlip,
  PokeSum_IsMonBoldOrGentle,
  PokeSum_IsPageFlipFinished,
  PokeSum_SeekToNextMon,
  PokeSum_ShowSpritesBeforePageFlip,
  PokeSum_TryPlayMonCry,
  PokeSum_UpdateMonMarkingsAnim,
  SeekToNextMonInMultiParty,
  SeekToNextMonInSingleParty,
  ShowPokemonSummaryScreen,
  ShowPokemonSummaryScreen_NullParty,
  ShowSelectMovePokemonSummaryScreen,
  ShowShinyStarObjIfMonShiny,
  SpriteCB_MoveSelectionCursor,
  StatusToAilment,
  SwapMonMoveSlots,
  Task_HandleInput_SelectMove,
  Task_InputHandler_Info,
  Task_InputHandler_SelectOrForgetMove,
  Task_PokeSum_FlipPages,
  UpdateExpBarObjs,
  UpdateHpBarObjs,
  createPokemonSummaryRuntime,
  type SummaryMon
} from '../src/game/decompPokemonSummaryScreen';

const mon = (overrides: Partial<SummaryMon> = {}): SummaryMon => ({
  species: 25,
  nickname: 'PIKA',
  level: 50,
  hp: 80,
  maxHp: 100,
  exp: 40,
  nextLevelExp: 80,
  status: 0x8,
  isEgg: false,
  isBadEgg: false,
  shiny: true,
  pokerus: true,
  markings: 3,
  nature: 5,
  mapSec: 10,
  fromGBA: true,
  otName: 'RED',
  ownerName: 'RED',
  ability: 'STATIC',
  abilityDesc: 'May paralyze.',
  types: [13, 13],
  moves: [
    { id: 85, pp: 10, maxPp: 15, type: 13, power: 90, accuracy: 100 },
    { id: 98, pp: 20, maxPp: 20, type: 0, power: 40, accuracy: 100 },
    { id: 15, pp: 15, maxPp: 20, type: 0, power: 50, accuracy: 95, hm: true },
    { id: 0, pp: 0, maxPp: 0, type: 0, power: 0, accuracy: 0 },
    { id: 0, pp: 0, maxPp: 0, type: 0, power: 0, accuracy: 0 }
  ],
  ...overrides
});

describe('decompPokemonSummaryScreen', () => {
  test('show/setup path buffers selected mon strings and creates screen resources', () => {
    const party = [mon(), mon({ nickname: 'BIRD', species: 16, shiny: false, pokerus: false })];
    const runtime = createPokemonSummaryRuntime({ party });

    ShowPokemonSummaryScreen(party, 1, 1, 'ReturnCB', 0, runtime);
    expect(runtime.callbacks.main).toBe('CB2_SetUpPSS');
    expect(runtime.currentMon.nickname).toBe('BIRD');
    expect(runtime.summary.nickname).toBe('BIRD');

    CB2_SetUpPSS(runtime);
    expect(runtime.callbacks.main).toBe('CB2_RunPokemonSummaryScreen');
    expect(runtime.callbacks.vblank).toBe('VBlankCB_PokemonSummaryScreen');
    expect(runtime.spriteIds.monPic).not.toBeNull();
    expect(runtime.windows.some(w => w.startsWith('page:'))).toBe(true);

    BufferMonInfo(party[0], runtime);
    BufferMonSkills(runtime);
    BufferMonMoves(runtime);
    expect(runtime.summary.level).toBe('50');
    expect(runtime.summary.hp).toBe('80/100');
    expect(runtime.summary.moves).toContain('MOVE85');
  });

  test('page flip input, page-flip task, and sprite hide/show mirror staged state', () => {
    const runtime = createPokemonSummaryRuntime({ party: [mon()] });
    PokeSum_CreateMonPicSprite(runtime);
    CreateHpBarObjs(0, 0, runtime);
    runtime.input.right = true;

    expect(IsPageFlipInput(runtime)).toBe(true);
    expect(PageFlipInputIsDisabled(runtime)).toBe(false);
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'Task_InputHandler_Info', destroyed: false }) - 1;
    Task_InputHandler_Info(taskId, runtime);
    expect(runtime.tasks[taskId].func).toBe('Task_PokeSum_FlipPages');
    Task_PokeSum_FlipPages(taskId, runtime);
    expect(runtime.flippingPages).toBe(true);
    expect(runtime.curPageIndex).toBe(1);
    expect(runtime.sprites.every(sprite => sprite.invisible)).toBe(true);

    for (let i = 0; i < 8; i++) PokeSum_FlipPages_SlideLayerLeft(taskId, runtime);
    expect(PokeSum_IsPageFlipFinished(0, runtime)).toBe(true);
    PokeSum_ShowSpritesBeforePageFlip(runtime);
    expect(runtime.sprites.some(sprite => !sprite.invisible)).toBe(true);
    PokeSum_HideSpritesBeforePageFlip(runtime);
    expect(runtime.sprites.every(sprite => sprite.invisible)).toBe(true);
  });

  test('select-move mode swaps allowed moves and preserves HM forget restrictions', () => {
    const runtime = createPokemonSummaryRuntime({ party: [mon()] });

    ShowSelectMovePokemonSummaryScreen(runtime.party, 0, 0, 1, 'ReturnCB', runtime);
    expect(GetMoveSlotToReplace(runtime)).toBe(1);
    expect(GetMonMoveBySlotId(runtime.currentMon, 0, runtime)).toBe(85);
    expect(GetMonPpByMoveSlot(runtime.currentMon, 1, runtime)).toBe(20);

    runtime.selectedMoveSlot = 0;
    SwapMonMoveSlots(runtime);
    expect(runtime.currentMon.moves[1].id).toBe(85);

    runtime.selectedMoveSlot = 2;
    expect(PokeSum_CanForgetSelectedMove(runtime)).toBe(false);
    runtime.input.a = true;
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'Task_HandleInput_SelectMove', destroyed: false }) - 1;
    Task_HandleInput_SelectMove(taskId, runtime);
    expect(runtime.tasks[taskId].func).toBe('Task_InputHandler_SelectOrForgetMove');
    Task_InputHandler_SelectOrForgetMove(taskId, runtime);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('sprite object helpers update visibility, bars, markings, cursor, and destroy state', () => {
    const runtime = createPokemonSummaryRuntime({ party: [mon()] });
    runtime.currentMon = runtime.party[0];

    const pic = PokeSum_CreateMonPicSprite(runtime);
    expect(runtime.sprites[pic].callback).toBe('SpriteCB_PokeSum_MonPicSprite');
    CreateHpBarObjs(4, 5, runtime);
    CreateExpBarObjs(6, 7, runtime);
    UpdateHpBarObjs(runtime);
    UpdateExpBarObjs(runtime);
    expect(runtime.hpBar.value).toBe(38);
    expect(runtime.expBar.value).toBe(32);

    CreatePokerusIconObj(1, 1, runtime);
    HideShowPokerusIcon(false, runtime);
    expect(runtime.sprites[runtime.spriteIds.pokerus as number].invisible).toBe(false);
    CreateShinyStarObj(2, 2, runtime);
    ShowShinyStarObjIfMonShiny(runtime);
    expect(runtime.sprites[runtime.spriteIds.shiny as number].invisible).toBe(false);
    HideShowShinyStar(true, runtime);
    expect(runtime.sprites[runtime.spriteIds.shiny as number].invisible).toBe(true);

    PokeSum_CreateMonMarkingsSprite(runtime);
    PokeSum_UpdateMonMarkingsAnim(runtime);
    expect(runtime.sprites[runtime.spriteIds.markings as number].anim).toBe(3);
    CreateMoveSelectionCursorObjs(0, 0, runtime);
    runtime.selectedMoveSlot = 2;
    const cursorId = (runtime.spriteIds.moveCursor as number[])[0];
    SpriteCB_MoveSelectionCursor(cursorId, runtime);
    expect(runtime.sprites[cursorId].y).toBe(64);
    DestroyMoveSelectionCursorObjs(runtime);
    expect(runtime.sprites[cursorId].destroyed).toBe(true);
    PokeSum_DestroyMonPicSprite(runtime);
    expect(runtime.sprites[pic].destroyed).toBe(true);
  });

  test('seek, status, cry, and region helper logic keep C-style outputs', () => {
    const runtime = createPokemonSummaryRuntime({
      party: [mon({ nickname: 'A' }), mon({ nickname: 'BAD', isBadEgg: true }), mon({ nickname: 'C', species: 6 })],
      lastIndex: 2,
      curMonIndex: 0,
      isEnemyParty: true
    });
    runtime.currentMon = runtime.party[0];

    expect(PokeSum_CanSeekToMon(1, runtime)).toBe(false);
    expect(SeekToNextMonInSingleParty(1, runtime)).toBe(0);
    expect(SeekToNextMonInMultiParty(1, runtime)).toBe(2);
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false }) - 1;
    PokeSum_SeekToNextMon(taskId, 1, runtime);
    expect(GetLastViewedMonIndex(runtime)).toBe(2);
    expect(runtime.currentMon.nickname).toBe('C');

    expect(StatusToAilment(0x8, runtime)).toBe(2);
    expect(PokeSum_IsMonBoldOrGentle(5)).toBe(true);
    expect(MapSecIsInKantoOrSevii(0x60)).toBe(true);
    PokeSum_TryPlayMonCry(runtime);
    expect(runtime.operations.at(-1)).toBe('PlayMonCry:6');

    ShowPokemonSummaryScreen_NullParty(runtime);
    expect(runtime.party).toEqual([]);
  });
});
