import { describe, expect, test } from 'vitest';
import {
  AnimateBoxScrollArrows,
  CreateBoxMonIconAtPos,
  CreateBoxScrollArrows,
  CreateMonIconSprite,
  CreatePartyMonsSprites,
  CreateChooseBoxArrows,
  CompactPartySprites,
  DestroyBoxMonIconAtPosition,
  DestroyReleaseMonIcon,
  DetermineBoxScrollDirection,
  DoReleaseMonAnim,
  DoReleaseMonComeBackAnim,
  DoWallpaperGfxChange,
  GetBoxTitleBaseX,
  GetMonIconPriorityByCursorArea,
  InitBoxMonIconScroll,
  InitBoxMonSprites,
  InitBoxTitle,
  InitMonIconFields,
  MODE_BOX,
  MODE_MOVE,
  MODE_PARTY,
  MovePartySprites,
  OPTION_MOVE_ITEMS,
  RELEASE_ANIM_COME_BACK,
  RELEASE_ANIM_RELEASE,
  ResetReleaseMonSpritePtr,
  ScrollToBox,
  SetMovingMonPriority,
  SetMovingMonSprite,
  SetPlacedMonSprite,
  SetShiftMonSpritePtr,
  SetWallpaperForCurrentBox,
  SetUpScrollToBox,
  ShiftMons,
  SpriteCB_BoxMonIconScrollIn,
  SpriteCB_BoxMonIconScrollOut,
  SpriteCB_BoxScrollArrow,
  SpriteCB_HeldMon,
  SpriteCB_IncomingBoxTitle,
  SpriteCB_MovePartySpriteToNextSlot,
  SpriteCB_OutgoingBoxTitle,
  StartBoxScrollArrowsSlide,
  ST_OAM_AFFINE_NORMAL,
  ST_OAM_OBJ_BLEND,
  TOTAL_BOXES_COUNT,
  TrimOldWallpaper,
  TryHideReleaseMonSprite,
  TryLoadMonIconTiles,
  UpdateBoxMonIconScroll,
  createPokemonStorageGraphicsRuntime
} from '../src/game/decompPokemonStorageSystemGraphics';

describe('decomp pokemon_storage_system_graphics', () => {
  test('initializes icon fields and reference-counts icon tile slots like C', () => {
    const runtime = createPokemonStorageGraphicsRuntime();
    runtime.iconSpeciesList[0] = 25;
    runtime.numIconsPerSpecies[0] = 2;
    runtime.partySprites[0] = CreateMonIconSprite(runtime, 1, 0, 1, 2, 1, 1);
    InitMonIconFields(runtime);
    expect(runtime.iconSpeciesList.every((species) => species === 0)).toBe(true);
    expect(runtime.numIconsPerSpecies.every((count) => count === 0)).toBe(true);
    expect(runtime.partySprites.every((sprite) => sprite == null)).toBe(true);

    expect(TryLoadMonIconTiles(runtime, 25)).toBe(0);
    expect(TryLoadMonIconTiles(runtime, 25)).toBe(0);
    expect(runtime.numIconsPerSpecies[0]).toBe(2);

    const sprite = CreateMonIconSprite(runtime, 26, 0, 10, 20, 2, 7);
    expect(sprite).toMatchObject({ x: 10, y: 20, subpriority: 7 });
    expect(sprite?.oam).toMatchObject({ priority: 2, tileNum: 16 });

    DestroyBoxMonIconAtPosition(runtime, 0);
    expect(runtime.boxMonsSprites[0]).toBeNull();
  });

  test('creates box icons, move-item blending, and scrolls columns in/out', () => {
    const runtime = createPokemonStorageGraphicsRuntime({ boxOption: OPTION_MOVE_ITEMS });
    runtime.boxes[0][0] = { species: 1, personality: 11, heldItem: 0 };
    runtime.boxes[0][1] = { species: 2, personality: 22, heldItem: 99 };
    runtime.boxes[1][0] = { species: 3, personality: 33, heldItem: 0 };
    runtime.boxes[1][6] = { species: 4, personality: 44, heldItem: 5 };

    InitBoxMonSprites(runtime, 0);
    expect(runtime.boxMonsSprites[0]).toMatchObject({ x: 100, y: 44, subpriority: 19 });
    expect(runtime.boxMonsSprites[0]?.oam.objMode).toBe(ST_OAM_OBJ_BLEND);
    expect(runtime.boxMonsSprites[1]?.oam.objMode).not.toBe(ST_OAM_OBJ_BLEND);

    runtime.currentBox = 0;
    CreateBoxMonIconAtPos(runtime, 1);
    expect(runtime.boxMonsSprites[1]).toMatchObject({ x: 124, y: 44, subpriority: 18 });

    InitBoxMonIconScroll(runtime, 1, 1);
    expect(runtime.iconScrollSpeed).toBe(-6);
    expect(runtime.iconScrollCurColumn).toBe(0);
    expect(runtime.boxSpecies[0]).toBe(3);

    runtime.iconScrollPos = 65;
    expect(UpdateBoxMonIconScroll(runtime)).toBe(true);
    expect(runtime.iconScrollState).toBe(1);
    expect(runtime.boxMonsSprites[0]).toBeNull();

    expect(UpdateBoxMonIconScroll(runtime)).toBe(true);
    expect(runtime.iconScrollNumIncoming).toBeGreaterThan(0);
    const incoming = runtime.boxMonsSprites[0]!;
    expect(incoming.callback).toBe('SpriteCB_BoxMonIconScrollIn');
    const previousX = incoming.x;
    incoming.data[1] = 1;
    SpriteCB_BoxMonIconScrollIn(runtime, incoming);
    expect(incoming.x).toBe(previousX + incoming.data[2]);
    SpriteCB_BoxMonIconScrollIn(runtime, incoming);
    expect(incoming.callback).toBe('SpriteCallbackDummy');

    const outgoing = CreateMonIconSprite(runtime, 7, 0, 69, 44, 2, 1)!;
    outgoing.data[2] = -6;
    outgoing.data[4] = 0;
    SpriteCB_BoxMonIconScrollOut(runtime, outgoing);
    expect(outgoing.callback).toBe('SpriteCallbackDummy');
  });

  test('party sprites compact, move, shift, and release with the original callback state', () => {
    const runtime = createPokemonStorageGraphicsRuntime({ boxOption: OPTION_MOVE_ITEMS });
    runtime.playerParty[0] = { species: 1, personality: 10, heldItem: 1 };
    runtime.playerParty[1] = { species: 0, personality: 0, heldItem: 0 };
    runtime.playerParty[2] = { species: 16, personality: 20, heldItem: 0 };
    CreatePartyMonsSprites(runtime, false);
    expect(runtime.partySprites[0]).toMatchObject({ x: 104, y: -96, invisible: true });
    expect(runtime.partySprites[2]).toMatchObject({ x: 152, y: 40, invisible: false });
    expect(runtime.partySprites[2]?.oam.objMode).toBe(ST_OAM_OBJ_BLEND);

    MovePartySprites(runtime, 300);
    expect(runtime.partySprites[0]?.invisible).toBe(true);

    CompactPartySprites(runtime);
    expect(runtime.partySprites[2]).toBeNull();
    expect(runtime.numPartySpritesToCompact).toBe(1);
    const movingDown = runtime.sprites.find((sprite) => sprite.callback === 'SpriteCB_MovePartySpriteToNextSlot')!;
    for (let i = 0; i < 9; i++) SpriteCB_MovePartySpriteToNextSlot(runtime, movingDown);
    expect(runtime.partySprites[1]).toBe(movingDown);
    expect(runtime.numPartySpritesToCompact).toBe(0);

    runtime.cursorSprite.data[0] = MODE_BOX;
    SetMovingMonSprite(runtime, MODE_PARTY, 1);
    expect(runtime.movingMonSprite).toBe(movingDown);
    expect(runtime.movingMonSprite?.oam.priority).toBe(2);
    SetPlacedMonSprite(runtime, TOTAL_BOXES_COUNT, 3);
    expect(runtime.partySprites[3]).toBe(movingDown);
    expect(runtime.partySprites[3]?.subpriority).toBe(12);

    SetMovingMonSprite(runtime, MODE_PARTY, 3);
    runtime.boxMonsSprites[4] = CreateMonIconSprite(runtime, 99, 1, 100, 44, 2, 15);
    SetShiftMonSpritePtr(runtime, MODE_BOX, 4);
    for (let i = 0; i < 16; i++) expect(ShiftMons(runtime)).toBe(true);
    expect(ShiftMons(runtime)).toBe(false);
    expect(runtime.movingMonSprite?.callback).toBe('SpriteCB_HeldMon');

    DoReleaseMonAnim(runtime, MODE_MOVE, 0);
    expect(runtime.movingMonSprite?.oam.affineMode).toBe(ST_OAM_AFFINE_NORMAL);
    expect(runtime.movingMonSprite?.affineAnim).toBe(RELEASE_ANIM_RELEASE);
    runtime.movingMonSprite!.affineAnimEnded = true;
    expect(TryHideReleaseMonSprite(runtime)).toBe(true);
    expect(runtime.movingMonSprite?.invisible).toBe(true);
    DoReleaseMonComeBackAnim(runtime);
    expect(runtime.movingMonSprite?.affineAnim).toBe(RELEASE_ANIM_COME_BACK);
    runtime.movingMonSprite!.affineAnimEnded = true;
    expect(ResetReleaseMonSpritePtr(runtime)).toBe(true);
    expect(runtime.releaseMonSpritePtr).toBeNull();

    SetMovingMonPriority(runtime, 3);
    expect(runtime.movingMonSprite?.oam.priority).toBe(3);
    DestroyReleaseMonIcon(runtime);
  });

  test('moving icon, held callback, wallpaper change, scroll setup, and title callbacks mirror C state', () => {
    const runtime = createPokemonStorageGraphicsRuntime();
    runtime.cursorSprite.x = 77;
    runtime.cursorSprite.y = 88;
    runtime.cursorSprite.y2 = 5;
    runtime.movingMon = { species: 25, personality: 1, heldItem: 0 };
    expect(GetMonIconPriorityByCursorArea(runtime)).toBe(1);
    runtime.cursorSprite.data[0] = MODE_BOX;
    expect(GetMonIconPriorityByCursorArea(runtime)).toBe(2);

    runtime.movingMonSprite = CreateMonIconSprite(runtime, 25, 1, 0, 0, 2, 7);
    SpriteCB_HeldMon(runtime, runtime.movingMonSprite!);
    expect(runtime.movingMonSprite).toMatchObject({ x: 77, y: 97 });

    expect(DetermineBoxScrollDirection(createPokemonStorageGraphicsRuntime({ currentBox: 0 }), 5)).toBe(1);
    expect(DetermineBoxScrollDirection(createPokemonStorageGraphicsRuntime({ currentBox: 0 }), 8)).toBe(-1);
    SetUpScrollToBox(runtime, 8);
    expect(runtime).toMatchObject({ scrollSpeed: -6, scrollTimer: 32, scrollDirection: -1, scrollUnused3: 56 });

    InitBoxTitle(runtime, 0);
    CreateBoxScrollArrows(runtime);
    expect(runtime.curBoxTitleSprites[0]).toMatchObject({ x: GetBoxTitleBaseX(runtime.boxNames[0]), y: 28 });
    runtime.boxNames[1] = 'NEXTBOX';
    ScrollToBox(runtime);
    expect(runtime.scrollState).toBe(2);
    expect(runtime.nextBoxTitleSprites[0]?.callback).toBe('SpriteCB_IncomingBoxTitle');

    const incoming = runtime.nextBoxTitleSprites[0]!;
    while (incoming.callback !== 'SpriteCallbackDummy') SpriteCB_IncomingBoxTitle(runtime, incoming);
    expect(incoming.x).toBe(incoming.data[1]);

    const outgoing = runtime.curBoxTitleSprites[0]!;
    outgoing.data[1] = 0;
    outgoing.data[0] = -6;
    outgoing.x = 60;
    SpriteCB_OutgoingBoxTitle(runtime, outgoing);
    expect(outgoing.destroyed).toBe(true);

    TrimOldWallpaper(runtime);
    SetWallpaperForCurrentBox(runtime, 3);
    expect(runtime.wallpaperChangeState).toBe(0);
    expect(DoWallpaperGfxChange(runtime)).toBe(true);
    runtime.paletteFadeActive = false;
    expect(DoWallpaperGfxChange(runtime)).toBe(true);
    expect(DoWallpaperGfxChange(runtime)).toBe(true);
    runtime.paletteFadeActive = false;
    expect(DoWallpaperGfxChange(runtime)).toBe(true);
    expect(DoWallpaperGfxChange(runtime)).toBe(false);
  });

  test('box scroll arrows and choose-box arrows keep animation states exactly', () => {
    const runtime = createPokemonStorageGraphicsRuntime({ cursorOnBoxTitle: true, scrollSpeed: 6 });
    CreateBoxScrollArrows(runtime);
    expect(runtime.arrowSprites[0]).toMatchObject({ x: 92, y: 28, anim: 0 });
    expect(runtime.arrowSprites[1]).toMatchObject({ x: 228, y: 28, anim: 1 });
    expect(runtime.arrowSprites[0]?.data[0]).toBe(1);

    const left = runtime.arrowSprites[0]!;
    for (let i = 0; i < 4; i++) SpriteCB_BoxScrollArrow(runtime, left);
    expect(left.x2).toBe(-1);
    AnimateBoxScrollArrows(runtime, false);
    SpriteCB_BoxScrollArrow(runtime, left);
    expect(left.x2).toBe(0);

    StartBoxScrollArrowsSlide(runtime, 1);
    expect(runtime.arrowSprites[0]?.data[1]).toBe(5);
    expect(runtime.arrowSprites[1]?.data[1]).toBe(29);
    SpriteCB_BoxScrollArrow(runtime, left);
    expect(left.data[0]).toBe(3);
    for (let i = 0; i < 5; i++) SpriteCB_BoxScrollArrow(runtime, left);
    expect(left.data[0]).toBe(4);
    expect(left.x).toBe(248);

    const choose = CreateChooseBoxArrows(runtime, 10, 20, 3, 2, 9);
    expect(choose).toMatchObject({ x: 10, y: 20, anim: 1, subpriority: 9 });
    expect(choose?.oam.priority).toBe(2);
  });
});
