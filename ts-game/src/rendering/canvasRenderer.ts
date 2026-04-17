import helpMessageWindowUrl from '../../../graphics/help_system/msg_window.png';
import bagSpriteUrl from '../../../graphics/interface/bag_male.png';
import caughtMarkerUrl from '../../../graphics/pokedex/caught_marker.png';
import pokedexMiniPageUrl from '../../../graphics/pokedex/mini_page.png';
import pokedexSidebarUrl from '../../../graphics/pokedex/kanto_dex_bgtiles.png';
import pokedexNationalSidebarUrl from '../../../graphics/pokedex/national_dex_bgtiles.png';
import pokedexIconAbcUrl from '../../../graphics/pokedex/cat_icon_abc.png';
import pokedexIconCancelUrl from '../../../graphics/pokedex/cat_icon_cancel.png';
import pokedexIconCaveUrl from '../../../graphics/pokedex/cat_icon_cave.png';
import pokedexIconForestUrl from '../../../graphics/pokedex/cat_icon_forest.png';
import pokedexIconGrasslandUrl from '../../../graphics/pokedex/cat_icon_grassland.png';
import pokedexIconLightestUrl from '../../../graphics/pokedex/cat_icon_lightest.png';
import pokedexIconMountainUrl from '../../../graphics/pokedex/cat_icon_mountain.png';
import pokedexIconNumericalUrl from '../../../graphics/pokedex/cat_icon_numerical.png';
import pokedexIconRareUrl from '../../../graphics/pokedex/cat_icon_rare.png';
import pokedexIconRoughTerrainUrl from '../../../graphics/pokedex/cat_icon_rough_terrain.png';
import pokedexIconSeaUrl from '../../../graphics/pokedex/cat_icon_sea.png';
import pokedexIconSmallestUrl from '../../../graphics/pokedex/cat_icon_smallest.png';
import pokedexIconTypeUrl from '../../../graphics/pokedex/cat_icon_type.png';
import pokedexIconUrbanUrl from '../../../graphics/pokedex/cat_icon_urban.png';
import pokedexIconWatersEdgeUrl from '../../../graphics/pokedex/cat_icon_waters_edge.png';
import pokedexMapKantoUrl from '../../../graphics/pokedex/map_kanto.png';
import pokedexMapOneIslandUrl from '../../../graphics/pokedex/map_one_island.png';
import pokedexMapTwoIslandUrl from '../../../graphics/pokedex/map_two_island.png';
import pokedexMapThreeIslandUrl from '../../../graphics/pokedex/map_three_island.png';
import pokedexMapFourIslandUrl from '../../../graphics/pokedex/map_four_island.png';
import pokedexMapFiveIslandUrl from '../../../graphics/pokedex/map_five_island.png';
import pokedexMapSixIslandUrl from '../../../graphics/pokedex/map_six_island.png';
import pokedexMapSevenIslandUrl from '../../../graphics/pokedex/map_seven_island.png';
import areaMarker0Url from '../../../graphics/pokedex/area_markers/marker_0.png';
import areaMarker1Url from '../../../graphics/pokedex/area_markers/marker_1.png';
import areaMarker2Url from '../../../graphics/pokedex/area_markers/marker_2.png';
import areaMarker3Url from '../../../graphics/pokedex/area_markers/marker_3.png';
import areaMarker4Url from '../../../graphics/pokedex/area_markers/marker_4.png';
import areaMarker5Url from '../../../graphics/pokedex/area_markers/marker_5.png';
import areaMarker6Url from '../../../graphics/pokedex/area_markers/marker_6.png';
import trainerLeafUrl from '../../../graphics/trainers/front_pics/leaf_front_pic.png';
import trainerRedUrl from '../../../graphics/trainers/front_pics/red_front_pic.png';
import battleHealthboxOpponentUrl from '../../../graphics/battle_interface/healthbox_singles_opponent.png';
import battleHealthboxPlayerUrl from '../../../graphics/battle_interface/healthbox_singles_player.png';
import battleTextboxTilesUrl from '../../../graphics/battle_interface/textbox.png';
import partyBgTilesheetUrl from '../../../graphics/party_menu/bg.png';
import partyPokeballUrl from '../../../graphics/party_menu/pokeball.png';
import trainerCardBackBinUrl from '../../../graphics/trainer_card/back.bin?url';
import trainerCardBgBinUrl from '../../../graphics/trainer_card/bg.bin?url';
import trainerCardBadgesUrl from '../../../graphics/trainer_card/badges.png';
import trainerCardFrontBinUrl from '../../../graphics/trainer_card/front.bin?url';
import trainerCardTilesUrl from '../../../graphics/trainer_card/tiles.png';
import menuMessageWindowUrl from '../../../graphics/text_window/menu_message.png';
import stdWindowFrameUrl from '../../../graphics/text_window/std.png';
import stdWindowFrameType1Url from '../../../graphics/text_window/type1.png';
import stdWindowFrameType2Url from '../../../graphics/text_window/type2.png';
import stdWindowFrameType3Url from '../../../graphics/text_window/type3.png';
import stdWindowFrameType4Url from '../../../graphics/text_window/type4.png';
import stdWindowFrameType5Url from '../../../graphics/text_window/type5.png';
import stdWindowFrameType6Url from '../../../graphics/text_window/type6.png';
import stdWindowFrameType7Url from '../../../graphics/text_window/type7.png';
import stdWindowFrameType8Url from '../../../graphics/text_window/type8.png';
import stdWindowFrameType9Url from '../../../graphics/text_window/type9.png';
import stdWindowFrameType10Url from '../../../graphics/text_window/type10.png';
import type { CameraState } from '../core/camera';
import {
  formatDexHeight,
  formatDexWeight,
  getDecompPokedexEntry,
  getNationalDexNumber
} from '../game/decompPokedex';
import { getPokedexCounts, isNationalDexEnabled } from '../game/decompPokedexUi';
import { getDecompSpeciesInfo } from '../game/decompSpecies';
import {
  getBagDescription,
  getBagPocketLabel,
  getBagVisibleRows,
  getItemDefinition,
  type BagState,
  type BagContextActionId,
  type BagPanelState
} from '../game/bag';
import { getBattleBagChoices, type BattleState } from '../game/battle';
import type {
  OptionPanelState,
  PartyActionId,
  PartyPanelState,
  PlayerSummaryPanelState,
  PokedexPanelState,
  RetirePanelState,
  SavePanelState,
  StartMenuState
} from '../game/menu';
import { PARTY_SCREEN_SLOT_COUNT } from '../game/menu';
import { getSpeciesDisplayName } from '../game/pokemonStorage';
import type { NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { ScriptRuntimeState } from '../game/scripts';
import type { TileMap } from '../world/tileMap';
import { DecompTextureStore } from './decompTextureStore';
import {
  DEX_AREA_MAP_KANTO_RECT,
  DEX_CATEGORY_ICON_SIZE,
  DEX_CATEGORY_ICON_TILE_BG,
  DEX_COUNTS_KANTO,
  DEX_COUNTS_NATIONAL,
  DEX_ENTRY_FLAVOR,
  DEX_ENTRY_MON_PIC,
  DEX_ENTRY_SPECIES_STATS,
  DEX_FOOTER_CONTROL_TEXT,
  DEX_GBA_HEIGHT,
  DEX_GBA_WIDTH,
  DEX_LEFT_DECOR_WIDTH,
  DEX_MODE_LIST_CURSOR_X,
  DEX_MODE_LIST_HEADER_X,
  DEX_MODE_LIST_ITEM_DISABLED,
  DEX_MODE_LIST_ITEM_ENABLED,
  DEX_MODE_LIST_ITEM_X,
  DEX_MODE_LIST_LETTER_SPACING,
  DEX_MODE_LIST_MAX_SHOWED,
  DEX_MODE_LIST_ROW_STRIDE,
  DEX_MODE_LIST_UP_TEXT_Y,
  DEX_ORDERED_LIST_CURSOR_X,
  DEX_ORDERED_LIST_ITEM_X,
  DEX_ORDERED_LIST_MAX_SHOWED,
  DEX_ORDERED_LIST_ROW_STRIDE,
  DEX_ORDERED_LIST_UP_TEXT_Y,
  DEX_RECT_DEX_COUNTS,
  DEX_RECT_FOOTER,
  DEX_RECT_HEADER,
  DEX_RECT_MODE_SELECT,
  DEX_RECT_ORDERED_LIST,
  DEX_RECT_SELECTION_ICON,
  DEX_WINDOW_INNER_PIXEL0,
  DEX_WINDOW_INNER_PIXEL15,
  DEX_STRING_PICK_OK,
  DEX_STRING_PICK_OK_EXIT,
  DEX_STRING_POKEMON_LIST,
  DEX_STRING_SEARCH,
  DEX_STRING_TABLE_OF_CONTENTS,
  getPokedexCategorySlots
} from './pokedexScreenLayout';
import {
  TC_BACK_BERRY_COUNT_X,
  TC_BACK_BERRY_Y,
  TC_BACK_HOF_Y,
  TC_BACK_LINK_LABEL_Y,
  TC_BACK_LINK_LOSSES_X,
  TC_BACK_LINK_WINLOSS_X,
  TC_BACK_LINK_WINS_X,
  TC_BACK_NAME,
  TC_BACK_STAT_LEFT,
  TC_BACK_STAT_VALUE_X,
  TC_BACK_TRADE_COUNT_X,
  TC_BACK_TRADES_Y,
  TC_BACK_UNION_COUNT_X,
  TC_BACK_UNION_Y,
  TC_BADGE_FIRST_TILE,
  TC_BADGE_TILE_STRIDE,
  TC_DEX_LABEL,
  TC_FOOTER_RECT,
  TC_FRONT_NAME,
  TC_GBA_H,
  TC_GBA_W,
  TC_ID,
  TC_MONEY_LABEL,
  TC_STAR_CHARSET_TILE,
  TC_STAR_TILE,
  TC_STR,
  TC_TIME_COLON,
  TC_TIME_HOURS,
  TC_TIME_LABEL,
  TC_TIME_MINUTES,
  TC_TRAINER_PIC_DX,
  TC_TRAINER_PIC_DY,
  TC_TRAINER_PIC_SIZE,
  TC_WIN2_OX,
  TC_WIN2_OY,
  tcDexCountLeftX,
  tcMoneyValueLeftX,
  tcWin1X,
  tcWin1Y
} from './trainerCardScreenLayout';
import {
  buildTrainerCardComposite,
  decodeTrainerCardTilemap,
  drawTrainerCardCharsetTile
} from './trainerCardTilemap';
import {
  buildPartyMenuBackgroundCanvas,
  loadPartyMenuTilemapBytes,
  PARTY_MENU_BG_DRAW_W,
  PARTY_MENU_BG_PIXEL_H
} from './partyMenuBackground';
import {
  blitPartySlotTilemap,
  loadPartySlotTilemaps,
  partyBgTilesPerRow,
  type PartySlotTilemaps
} from './partySlotBlit';
import {
  getPartyMessageWindowRect,
  getPartyMonWindowRect,
  PARTY_CANCEL_BUTTON_BG_BLIT,
  PARTY_CANCEL_BUTTON_WINDOW,
  PARTY_GBA_WIDTH,
  PARTY_SINGLE_SPRITES,
  PARTY_TEXT_LEFT,
  PARTY_TEXT_RIGHT,
  partyActionsWindowTiles,
  tilesToPixels
} from './partyScreenLayout';
import {
  BATTLE_ACTION_MENU_WINDOW,
  BATTLE_ACTION_PROMPT_WINDOW,
  BATTLE_COMMAND_CHAR_ADVANCE,
  BATTLE_COMMAND_LABELS,
  BATTLE_GBA_HEIGHT,
  BATTLE_GBA_WIDTH,
  BATTLE_HEALTHBOX_OVERLAY,
  BATTLE_LIST_WINDOW,
  BATTLE_MESSAGE_WINDOW,
  BATTLE_MOVE_MENU_WINDOW,
  BATTLE_MOVE_SLOTS,
  BATTLE_PP_BOX,
  BATTLE_SINGLE_BATTLER_COORDS,
  BATTLE_SINGLE_HEALTHBOX_COORDS,
  BATTLE_TYPE_BOX
} from './battleScreenLayout';
import { blitSinglesOpponentHealthbox, blitSinglesPlayerHealthbox } from './battleHealthboxBlit';
import {
  buildBattleTextboxBackgroundCanvas,
  loadBattleTextboxTilemapBytes
} from './battleTextboxBackground';
import {
  BAG_CONTEXT_MENU_CURSOR_X,
  BAG_CONTEXT_MENU_FIRST_ROW_Y,
  BAG_CONTEXT_MENU_ROW_PITCH,
  BAG_CONTEXT_MENU_TEXT_X,
  BAG_CONTEXT_TITLE_RECT,
  BAG_ITEM_ICON_DRAW_SIZE,
  BAG_ITEM_ICON_X,
  BAG_ITEM_ICON_Y,
  BAG_LIST_CURSOR_X,
  BAG_LIST_ITEM_X,
  BAG_LIST_QTY_X,
  BAG_LIST_SELECT_BLIT_X,
  BAG_LIST_ROW_PITCH,
  BAG_LIST_UP_TEXT_Y,
  BAG_LIST_WINDOW,
  BAG_MESSAGE_WINDOW,
  BAG_POCKET_ARROW_LEFT,
  BAG_POCKET_ARROW_RIGHT,
  BAG_POCKET_NAME_TEXT_Y,
  BAG_POCKET_NAME_WINDOW,
  BAG_SPRITE_SRC_H,
  BAG_SPRITE_SRC_W,
  BAG_SPRITE_X,
  BAG_SPRITE_Y,
  BAG_SPRITE_Y2_INITIAL,
  BAG_TOSS_PROMPT_RECT,
  BAG_TOSS_QTY_RECT,
  BAG_YESNO_BOTTOM_RIGHT_RECT,
  bagContextActionsRect
} from './bagScreenLayout';

const PLAYER_SIZE = 14;
const PLAYER_GRAPHICS_ID = 'OBJ_EVENT_GFX_RED_NORMAL';
const WINDOW_SLICE = 8;
/** `start_menu.c` / `help_message.c` field layer size in pixels. */
const GBA_VIEW_WIDTH = 240;
const GBA_VIEW_HEIGHT = 160;

interface RenderOverlayState {
  startMenu: StartMenuState;
  runtime: ScriptRuntimeState;
  battle?: BattleState;
  bag?: BagState;
}

type NonBagMenuPanel = Exclude<NonNullable<StartMenuState['panel']>, BagPanelState>;

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly textureStore: DecompTextureStore;
  private readonly stdWindowFrame = this.loadImage(stdWindowFrameUrl);
  private readonly menuMessageWindow = this.loadImage(menuMessageWindowUrl);
  private readonly helpMessageWindowTiles = this.loadImage(helpMessageWindowUrl);
  private readonly pokedexMiniPage = this.loadImage(pokedexMiniPageUrl);
  private readonly pokedexSidebar = this.loadImage(pokedexSidebarUrl);
  private readonly pokedexNationalSidebar = this.loadImage(pokedexNationalSidebarUrl);
  private readonly pokedexCaughtMarker = this.loadImage(caughtMarkerUrl);
  private readonly pokedexIcons = new Map([
    ['abc', this.loadImage(pokedexIconAbcUrl)],
    ['cancel', this.loadImage(pokedexIconCancelUrl)],
    ['cave', this.loadImage(pokedexIconCaveUrl)],
    ['forest', this.loadImage(pokedexIconForestUrl)],
    ['grassland', this.loadImage(pokedexIconGrasslandUrl)],
    ['lightest', this.loadImage(pokedexIconLightestUrl)],
    ['mountain', this.loadImage(pokedexIconMountainUrl)],
    ['numerical', this.loadImage(pokedexIconNumericalUrl)],
    ['rare', this.loadImage(pokedexIconRareUrl)],
    ['rough_terrain', this.loadImage(pokedexIconRoughTerrainUrl)],
    ['sea', this.loadImage(pokedexIconSeaUrl)],
    ['smallest', this.loadImage(pokedexIconSmallestUrl)],
    ['type', this.loadImage(pokedexIconTypeUrl)],
    ['urban', this.loadImage(pokedexIconUrbanUrl)],
    ['waters_edge', this.loadImage(pokedexIconWatersEdgeUrl)]
  ]);
  private readonly pokedexAreaMaps = new Map([
    ['kanto', this.loadImage(pokedexMapKantoUrl)],
    ['one', this.loadImage(pokedexMapOneIslandUrl)],
    ['two', this.loadImage(pokedexMapTwoIslandUrl)],
    ['three', this.loadImage(pokedexMapThreeIslandUrl)],
    ['four', this.loadImage(pokedexMapFourIslandUrl)],
    ['five', this.loadImage(pokedexMapFiveIslandUrl)],
    ['six', this.loadImage(pokedexMapSixIslandUrl)],
    ['seven', this.loadImage(pokedexMapSevenIslandUrl)]
  ]);
  private readonly pokedexAreaMarkers = new Map([
    ['MARKER_CIRCULAR', this.loadImage(areaMarker0Url)],
    ['MARKER_SMALL_H', this.loadImage(areaMarker1Url)],
    ['MARKER_SMALL_V', this.loadImage(areaMarker2Url)],
    ['MARKER_MED_H', this.loadImage(areaMarker3Url)],
    ['MARKER_MED_V', this.loadImage(areaMarker4Url)],
    ['MARKER_LARGE_H', this.loadImage(areaMarker5Url)],
    ['MARKER_LARGE_V', this.loadImage(areaMarker6Url)]
  ]);
  private readonly partyBgTilesheet = this.loadImage(partyBgTilesheetUrl);
  private readonly partyPokeball = this.loadImage(partyPokeballUrl);
  private partyMenuBgCanvas: HTMLCanvasElement | null = null;
  private partySlotTilemaps: PartySlotTilemaps | null = null;
  private partyMenuAssetsReady: Promise<void> | null = null;
  private readonly trainerCardTiles = this.loadImage(trainerCardTilesUrl);
  private readonly trainerCardBadges = this.loadImage(trainerCardBadgesUrl);
  private readonly trainerCardRed = this.loadImage(trainerRedUrl);
  private readonly trainerCardLeaf = this.loadImage(trainerLeafUrl);
  /** `bg.bin` + `front.bin` / `back.bin` + `tiles.png` — same sources as `trainer_card.c`. */
  private trainerCardTilemaps: { bg: Uint16Array; front: Uint16Array; back: Uint16Array } | null = null;
  private trainerCardLayerCache: { front: HTMLCanvasElement; back: HTMLCanvasElement } | null = null;
  private readonly bagSprite = this.loadImage(bagSpriteUrl);
  private readonly stdWindowFrames = [
    this.loadImage(stdWindowFrameType1Url),
    this.loadImage(stdWindowFrameType2Url),
    this.loadImage(stdWindowFrameType3Url),
    this.loadImage(stdWindowFrameType4Url),
    this.loadImage(stdWindowFrameType5Url),
    this.loadImage(stdWindowFrameType6Url),
    this.loadImage(stdWindowFrameType7Url),
    this.loadImage(stdWindowFrameType8Url),
    this.loadImage(stdWindowFrameType9Url),
    this.loadImage(stdWindowFrameType10Url)
  ];
  private readonly itemIcons = this.loadItemIcons();
  private readonly pokemonIcons = this.loadPokemonIcons();
  private readonly pokemonBattlePics = this.loadPokemonBattlePics();
  private readonly battleTextboxTiles = this.loadImage(battleTextboxTilesUrl);
  private readonly battleHealthboxOpponent = this.loadImage(battleHealthboxOpponentUrl);
  private readonly battleHealthboxPlayer = this.loadImage(battleHealthboxPlayerUrl);
  private battleTextboxComposite: HTMLCanvasElement | null = null;
  private battleTextboxAssetsReady: Promise<void> | null = null;
  private activeFrameType = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to create 2D canvas context');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.textureStore = new DecompTextureStore();
    this.beginTrainerCardTilemapLoad();
    this.trainerCardTiles.addEventListener('load', () => {
      this.trainerCardLayerCache = null;
    });
  }

  /** Loads `graphics/trainer_card/{bg,front,back}.bin` (same tilemaps as `LZ77UnCompWram` in `trainer_card.c`). */
  private beginTrainerCardTilemapLoad(): void {
    void Promise.all([
      fetch(trainerCardBgBinUrl).then((r) => r.arrayBuffer()),
      fetch(trainerCardFrontBinUrl).then((r) => r.arrayBuffer()),
      fetch(trainerCardBackBinUrl).then((r) => r.arrayBuffer())
    ])
      .then(([bgBuf, frontBuf, backBuf]) => {
        this.trainerCardTilemaps = {
          bg: decodeTrainerCardTilemap(bgBuf),
          front: decodeTrainerCardTilemap(frontBuf),
          back: decodeTrainerCardTilemap(backBuf)
        };
        this.trainerCardLayerCache = null;
      })
      .catch(() => {
        this.trainerCardTilemaps = null;
        this.trainerCardLayerCache = null;
      });
  }

  private ensureTrainerCardLayerCache(): void {
    const tileset = this.trainerCardTiles;
    const maps = this.trainerCardTilemaps;
    if (!(tileset.complete && tileset.naturalWidth > 0 && maps)) {
      return;
    }
    if (this.trainerCardLayerCache) {
      return;
    }
    this.trainerCardLayerCache = {
      front: buildTrainerCardComposite(tileset, maps.bg, maps.front),
      back: buildTrainerCardComposite(tileset, maps.bg, maps.back)
    };
  }

  /** Loads party BG tilemap + slot panel tilemaps (`BlitBitmapToPartyWindow` sources). */
  preloadPartyMenuBackground(): Promise<void> {
    return this.ensurePartyMenuAssetsLoaded();
  }

  private async waitForImageLoad(image: HTMLImageElement): Promise<void> {
    if (image.complete && image.naturalWidth > 0) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('Image failed to load')), { once: true });
    });
  }

  private ensurePartyMenuAssetsLoaded(): Promise<void> {
    if (this.partyMenuBgCanvas && this.partySlotTilemaps) {
      return Promise.resolve();
    }
    if (!this.partyMenuAssetsReady) {
      this.partyMenuAssetsReady = (async () => {
        await this.waitForImageLoad(this.partyBgTilesheet);
        const [tilemap, slots] = await Promise.all([
          loadPartyMenuTilemapBytes(),
          loadPartySlotTilemaps()
        ]);
        this.partyMenuBgCanvas = buildPartyMenuBackgroundCanvas(this.partyBgTilesheet, tilemap);
        this.partySlotTilemaps = slots;
      })().finally(() => {
        this.partyMenuAssetsReady = null;
      });
    }
    return this.partyMenuAssetsReady;
  }

  private ensureBattleTextboxAssetsLoaded(): Promise<void> {
    if (this.battleTextboxComposite) {
      return Promise.resolve();
    }
    if (!this.battleTextboxAssetsReady) {
      this.battleTextboxAssetsReady = (async () => {
        try {
          await this.waitForImageLoad(this.battleTextboxTiles);
          const tilemap = await loadBattleTextboxTilemapBytes();
          this.battleTextboxComposite = buildBattleTextboxBackgroundCanvas(this.battleTextboxTiles, tilemap);
        } catch {
          this.battleTextboxComposite = null;
        }
      })().finally(() => {
        this.battleTextboxAssetsReady = null;
      });
    }
    return this.battleTextboxAssetsReady;
  }

  /** Preload battle BG textbox + healthbox images before first battle frame (optional). */
  preloadBattleUiAssets(): Promise<void> {
    return Promise.all([
      this.ensureBattleTextboxAssetsLoaded(),
      this.waitForImageLoad(this.battleHealthboxOpponent),
      this.waitForImageLoad(this.battleHealthboxPlayer)
    ]).then(() => {});
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  render(
    map: TileMap,
    player: PlayerState,
    npcs: NpcState[],
    camera: CameraState,
    overlays?: RenderOverlayState
  ): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (overlays?.battle?.active) {
      this.drawBattleScreen(overlays.battle, overlays.runtime, overlays.bag);
      return;
    }

    this.textureStore.ensureMapTextures(map);
    const renderCamera = this.snapCamera(camera);

    const tileSize = map.tileSize;
    const startX = Math.floor(renderCamera.x / tileSize);
    const startY = Math.floor(renderCamera.y / tileSize);
    const endX = Math.min(map.width, startX + Math.ceil(renderCamera.viewportWidth / tileSize) + 1);
    const endY = Math.min(map.height, startY + Math.ceil(renderCamera.viewportHeight / tileSize) + 1);

    if (!this.textureStore.drawMapBase(ctx, map, renderCamera, startX, startY, endX, endY)) {
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const idx = y * map.width + x;
          const walkable = map.walkable[idx];

          ctx.fillStyle = walkable ? '#4e9a51' : '#355c37';
          if (!walkable && y > 7 && x > 11) {
            ctx.fillStyle = '#2f6db0';
          }

          ctx.fillRect(
            x * tileSize - renderCamera.x,
            y * tileSize - renderCamera.y,
            tileSize,
            tileSize
          );
        }
      }
    }

    for (const trigger of map.triggers) {
      const tx = trigger.x * tileSize - renderCamera.x;
      const ty = trigger.y * tileSize - renderCamera.y;
      this.ctx.fillStyle = trigger.activation === 'interact' ? '#f4e66a' : '#8cd3ff';
      this.ctx.fillRect(tx + 5, ty + 5, 6, 6);
    }

    this.drawEntities(player, npcs, renderCamera);
    this.textureStore.drawMapCover(ctx, map, renderCamera, startX, startY, endX, endY);
    if (overlays) {
      this.drawStartMenuOverlay(overlays.startMenu, overlays.runtime);
    }
  }

  private snapCamera(camera: CameraState): CameraState {
    return {
      ...camera,
      x: Math.round(camera.x),
      y: Math.round(camera.y)
    };
  }

  private loadImage(src: string): HTMLImageElement {
    const image = new Image();
    image.src = src;
    return image;
  }

  private loadItemIcons(): Map<string, HTMLImageElement> {
    const modules = import.meta.glob('../../../graphics/items/icons/*.png', {
      eager: true,
      import: 'default'
    }) as Record<string, string>;

    const icons = new Map<string, HTMLImageElement>();
    for (const [modulePath, src] of Object.entries(modules)) {
      const key = modulePath.split('/').at(-1)?.replace(/\.png$/u, '');
      if (!key) {
        continue;
      }

      icons.set(key, this.loadImage(src));
    }
    return icons;
  }

  private loadPokemonIcons(): Map<string, HTMLImageElement> {
    const modules = import.meta.glob('../../../graphics/pokemon/**/icon.png', {
      eager: true,
      import: 'default'
    }) as Record<string, string>;

    const icons = new Map<string, HTMLImageElement>();
    for (const [modulePath, src] of Object.entries(modules)) {
      const speciesDir = modulePath.split('/').at(-2);
      if (!speciesDir) {
        continue;
      }

      icons.set(speciesDir.toUpperCase(), this.loadImage(src));
    }

    return icons;
  }

  private loadPokemonBattlePics(): Map<string, { front: HTMLImageElement; back: HTMLImageElement }> {
    const frontModules = import.meta.glob('../../../graphics/pokemon/**/front.png', {
      eager: true,
      import: 'default'
    }) as Record<string, string>;
    const backModules = import.meta.glob('../../../graphics/pokemon/**/back.png', {
      eager: true,
      import: 'default'
    }) as Record<string, string>;

    const byDir = new Map<string, { front?: HTMLImageElement; back?: HTMLImageElement }>();
    for (const [modulePath, src] of Object.entries(frontModules)) {
      const speciesDir = modulePath.split('/').at(-2);
      if (!speciesDir) {
        continue;
      }
      const row = byDir.get(speciesDir) ?? {};
      row.front = this.loadImage(src);
      byDir.set(speciesDir, row);
    }
    for (const [modulePath, src] of Object.entries(backModules)) {
      const speciesDir = modulePath.split('/').at(-2);
      if (!speciesDir) {
        continue;
      }
      const row = byDir.get(speciesDir) ?? {};
      row.back = this.loadImage(src);
      byDir.set(speciesDir, row);
    }

    const out = new Map<string, { front: HTMLImageElement; back: HTMLImageElement }>();
    for (const [speciesDir, pair] of byDir) {
      if (pair.front && pair.back) {
        out.set(speciesDir.toUpperCase(), { front: pair.front, back: pair.back });
      }
    }
    return out;
  }

  /** Map GBA X (0–239) to canvas pixels (`start_menu.c` uses 240-wide field BG). */
  private gbaX(px: number): number {
    return (px * this.canvas.width) / GBA_VIEW_WIDTH;
  }

  /** Map GBA Y (0–159) to canvas pixels. */
  private gbaY(px: number): number {
    return (px * this.canvas.height) / GBA_VIEW_HEIGHT;
  }

  /**
   * Same tiling as `DrawHelpMessageWindowTilesById` in `src/help_message.c`:
   * top row tile 0, middle rows tile 5, bottom row tile 14, each repeated across width.
   */
  private drawHelpMessageWindowTiled(dx: number, dy: number, dw: number, dh: number): void {
    const img = this.helpMessageWindowTiles;
    if (!img.complete || img.naturalWidth <= 0) {
      this.ctx.save();
      this.ctx.fillStyle = '#c8d8e8';
      this.ctx.fillRect(dx, dy, dw, dh);
      this.ctx.strokeStyle = '#486878';
      this.ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1);
      this.ctx.restore();
      return;
    }

    const tilesPerRow = 10;
    const tw = 8;
    const th = 8;
    const rows = Math.ceil(dh / th);
    const cols = Math.ceil(dw / tw);
    for (let i = 0; i < rows; i++) {
      const tileId = i === 0 ? 0 : i === rows - 1 ? 14 : 5;
      const srcCol = tileId % tilesPerRow;
      const srcRow = Math.floor(tileId / tilesPerRow);
      const sx = srcCol * tw;
      const sy = srcRow * th;
      for (let j = 0; j < cols; j++) {
        const destX0 = dx + j * tw;
        const destY0 = dy + i * th;
        const sliceW = Math.min(tw, dx + dw - destX0);
        const sliceH = Math.min(th, dy + dh - destY0);
        if (sliceW <= 0 || sliceH <= 0) {
          continue;
        }
        this.ctx.drawImage(img, sx, sy, sliceW, sliceH, destX0, destY0, sliceW, sliceH);
      }
    }
  }

  private getBattleTerrainColors(terrain: BattleState['terrain']): { sky: string; horizon: string; floor: string; accent: string } {
    switch (terrain) {
      case 'BATTLE_TERRAIN_CAVE':
        return { sky: '#5e5b74', horizon: '#82758f', floor: '#5b4f46', accent: '#3a2f2a' };
      case 'BATTLE_TERRAIN_WATER':
      case 'BATTLE_TERRAIN_POND':
      case 'BATTLE_TERRAIN_UNDERWATER':
        return { sky: '#86d0f7', horizon: '#b6ebff', floor: '#3e9ac4', accent: '#216f8d' };
      case 'BATTLE_TERRAIN_GYM':
      case 'BATTLE_TERRAIN_BUILDING':
      case 'BATTLE_TERRAIN_INDOOR_1':
      case 'BATTLE_TERRAIN_INDOOR_2':
      case 'BATTLE_TERRAIN_LEADER':
      case 'BATTLE_TERRAIN_LINK':
      case 'BATTLE_TERRAIN_LORELEI':
      case 'BATTLE_TERRAIN_BRUNO':
      case 'BATTLE_TERRAIN_AGATHA':
      case 'BATTLE_TERRAIN_LANCE':
      case 'BATTLE_TERRAIN_CHAMPION':
        return { sky: '#d4d8e4', horizon: '#edf0f6', floor: '#a89fb0', accent: '#6c6074' };
      case 'BATTLE_TERRAIN_SAND':
        return { sky: '#f8daa4', horizon: '#fff2d0', floor: '#d4aa58', accent: '#9a7834' };
      case 'BATTLE_TERRAIN_MOUNTAIN':
        return { sky: '#b6d0ef', horizon: '#ebf5ff', floor: '#8a9bb0', accent: '#5a687b' };
      default:
        return { sky: '#8cc6ff', horizon: '#dff7ff', floor: '#73c056', accent: '#357f32' };
    }
  }

  private drawBattleMonster(species: string, x: number, y: number, side: 'player' | 'opponent'): void {
    const key = species.toUpperCase();
    const pics = this.pokemonBattlePics.get(key);
    const pic = side === 'opponent' ? pics?.front : pics?.back;
    const icon = this.pokemonIcons.get(key);
    const img = pic?.complete && pic.naturalWidth > 0 ? pic : icon;

    this.ctx.save();
    this.ctx.translate(x, y);
    if (side === 'player') {
      this.ctx.scale(-1, 1);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const dw = 64;
      const dh = 64;
      this.ctx.drawImage(img, 0, 0, nw, nh, -dw / 2, -dh / 2, dw, dh);
    } else {
      this.ctx.fillStyle = side === 'player' ? '#f7f7fb' : '#f4f4f4';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#20305f';
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawBattleHealthbox(
    battle: BattleState,
    side: 'player' | 'opponent'
  ): void {
    const pokemon = side === 'player' ? battle.playerMon : battle.wildMon;
    const box = side === 'player' ? BATTLE_SINGLE_HEALTHBOX_COORDS.player : BATTLE_SINGLE_HEALTHBOX_COORDS.opponent;

    const hb = side === 'opponent' ? this.battleHealthboxOpponent : this.battleHealthboxPlayer;
    if (hb.complete && hb.naturalWidth > 0) {
      if (side === 'opponent') {
        blitSinglesOpponentHealthbox(this.ctx, hb, box.x, box.y, box.w, box.h);
      } else {
        blitSinglesPlayerHealthbox(this.ctx, hb, box.x, box.y, box.w, box.h);
      }
    } else {
      const fallback =
        side === 'opponent'
          ? { x: 44, y: 30, w: 92, h: 30 }
          : { x: 158, y: 88, w: 74, h: 30 };
      this.drawWindowFrame(fallback.x, fallback.y, fallback.w, fallback.h, 'std');
    }

    if (side === 'player') {
      const ov = BATTLE_HEALTHBOX_OVERLAY.player;
      const speciesX = box.x + ov.species.dx;
      const speciesY = box.y + ov.species.dy;
      this.drawSmallText(pokemon.species, speciesX, speciesY);
      const lvStr = `Lv${pokemon.level}`;
      this.drawSmallText(
        lvStr,
        box.x + box.w - ov.levelFromRight - this.measureSmallTextWidth(lvStr),
        speciesY
      );
      this.drawSmallText(`HP ${pokemon.hp}/${pokemon.maxHp}`, box.x + ov.hpText.dx, box.y + ov.hpText.dy);
      this.drawPartyHpBarGba(box.x + ov.hpBar.dx, box.y + ov.hpBar.dy, ov.hpBar.w, pokemon.hp, pokemon.maxHp);
      if (pokemon.status !== 'none') {
        this.drawSmallText(
          pokemon.status.toUpperCase(),
          box.x + ov.species.dx,
          box.y + box.h - ov.statusFromBottom,
          '#7a2432'
        );
      }
    } else {
      const ov = BATTLE_HEALTHBOX_OVERLAY.opponent;
      const speciesX = box.x + ov.species.dx;
      const speciesY = box.y + ov.species.dy;
      this.drawSmallText(`FOE ${pokemon.species}`, speciesX, speciesY);
      const lvStr = `Lv${pokemon.level}`;
      this.drawSmallText(
        lvStr,
        box.x + box.w - ov.levelFromRight - this.measureSmallTextWidth(lvStr),
        speciesY
      );
      this.drawPartyHpBarGba(box.x + ov.hpBar.dx, box.y + ov.hpBar.dy, ov.hpBar.w, pokemon.hp, pokemon.maxHp);
      if (pokemon.status !== 'none') {
        this.drawSmallText(
          pokemon.status.toUpperCase(),
          box.x + ov.species.dx,
          box.y + box.h - ov.statusFromBottom,
          '#7a2432'
        );
      }
    }
  }

  private battleTextboxLayerReady(): boolean {
    const c = this.battleTextboxComposite;
    return !!(c && c.width > 0);
  }

  private drawBattleMonoCommandLabel(text: string, x: number, y: number, fillStyle = '#20305f'): void {
    this.ctx.save();
    this.ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = fillStyle;
    this.ctx.textBaseline = 'top';
    let cx = x;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]!;
      this.ctx.fillText(ch, cx, y);
      cx += BATTLE_COMMAND_CHAR_ADVANCE;
    }
    this.ctx.restore();
  }

  private drawBattleCommandMenu(battle: BattleState): void {
    const tiled = this.battleTextboxLayerReady();
    if (!tiled) {
      this.drawWindowFrame(
        BATTLE_ACTION_PROMPT_WINDOW.x,
        BATTLE_ACTION_PROMPT_WINDOW.y,
        BATTLE_ACTION_PROMPT_WINDOW.w,
        BATTLE_ACTION_PROMPT_WINDOW.h,
        'std'
      );
    }
    const promptLines = this.wrapMenuText(battle.turnSummary, BATTLE_ACTION_PROMPT_WINDOW.w - 12);
    this.drawTextLines(promptLines.slice(0, 2), BATTLE_ACTION_PROMPT_WINDOW.x + 6, BATTLE_ACTION_PROMPT_WINDOW.y + 6, 12);

    if (!tiled) {
      this.drawWindowFrame(
        BATTLE_ACTION_MENU_WINDOW.x,
        BATTLE_ACTION_MENU_WINDOW.y,
        BATTLE_ACTION_MENU_WINDOW.w,
        BATTLE_ACTION_MENU_WINDOW.h,
        'std'
      );
    }

    BATTLE_COMMAND_LABELS.forEach((entry, index) => {
      if (battle.commands[index] === undefined) {
        return;
      }
      if (index === battle.selectedCommandIndex) {
        this.drawCursor(entry.x - 8, entry.y - 2);
      }
      this.drawBattleMonoCommandLabel(entry.label, entry.x, entry.y);
    });
  }

  private drawBattleMoveMenu(battle: BattleState): void {
    if (!this.battleTextboxLayerReady()) {
      this.drawWindowFrame(
        BATTLE_MOVE_MENU_WINDOW.x,
        BATTLE_MOVE_MENU_WINDOW.y,
        BATTLE_MOVE_MENU_WINDOW.w,
        BATTLE_MOVE_MENU_WINDOW.h,
        'std'
      );
    }

    BATTLE_MOVE_SLOTS.forEach((slot) => {
      const move = battle.moves[slot.index];
      if (!move) {
        return;
      }
      if (slot.index === battle.selectedMoveIndex) {
        this.drawCursor(slot.x - 10, slot.y - 2);
      }
      this.drawSmallText(move.name, slot.x, slot.y);
    });

    const move = battle.moves[battle.selectedMoveIndex];
    if (!move) {
      return;
    }

    if (!this.battleTextboxLayerReady()) {
      this.drawWindowFrame(BATTLE_PP_BOX.x, BATTLE_PP_BOX.y, BATTLE_PP_BOX.w, BATTLE_PP_BOX.h, 'std');
    }
    this.drawSmallText(`PP ${move.ppRemaining}/${move.pp}`, BATTLE_PP_BOX.x + 4, BATTLE_PP_BOX.y + 3);
    if (!this.battleTextboxLayerReady()) {
      this.drawWindowFrame(BATTLE_TYPE_BOX.x, BATTLE_TYPE_BOX.y, BATTLE_TYPE_BOX.w, BATTLE_TYPE_BOX.h, 'std');
    }
    this.drawSmallText(move.type.toUpperCase(), BATTLE_TYPE_BOX.x + 4, BATTLE_TYPE_BOX.y + 1);
  }

  private drawBattleListWindow(battle: BattleState, bag?: BagState): void {
    this.drawWindowFrame(BATTLE_LIST_WINDOW.x, BATTLE_LIST_WINDOW.y, BATTLE_LIST_WINDOW.w, BATTLE_LIST_WINDOW.h, 'std');
    const rows = battle.phase === 'partySelect'
      ? battle.party.map((member, index) => ({
        label: `${member.species} ${member.hp > 0 ? `HP ${member.hp}/${member.maxHp}` : 'FNT'}`,
        selected: index === battle.selectedPartyIndex
      }))
      : getBattleBagChoices(battle, bag).map((choice, index) => ({
        label: choice.quantity === null ? choice.label : `${choice.label} x${choice.quantity}`,
        selected: index === battle.selectedBagIndex
      }));

    rows.slice(0, 4).forEach((row, index) => {
      const y = BATTLE_LIST_WINDOW.y + 6 + index * 12;
      if (row.selected) {
        this.drawCursor(BATTLE_LIST_WINDOW.x + 4, y - 2);
      }
      this.drawSmallText(row.label, BATTLE_LIST_WINDOW.x + 16, y);
    });
  }

  private drawBattleMessageWindow(battle: BattleState): void {
    if (!this.battleTextboxLayerReady()) {
      this.drawWindowFrame(BATTLE_MESSAGE_WINDOW.x, BATTLE_MESSAGE_WINDOW.y, BATTLE_MESSAGE_WINDOW.w, BATTLE_MESSAGE_WINDOW.h, 'std');
    }
    const lines = this.wrapMenuText(battle.turnSummary, BATTLE_MESSAGE_WINDOW.w - 12);
    this.drawTextLines(lines.slice(0, 2), BATTLE_MESSAGE_WINDOW.x + 6, BATTLE_MESSAGE_WINDOW.y + 6, 12);
  }

  private drawBattleScreen(battle: BattleState, runtime: ScriptRuntimeState, bag?: BagState): void {
    void this.ensureBattleTextboxAssetsLoaded();
    this.activeFrameType = Math.max(0, Math.min(runtime.options.frameType ?? 0, this.stdWindowFrames.length - 1));
    const { end } = this.beginPartyScreenPixelSpace();
    const palette = this.getBattleTerrainColors(battle.terrain);

    this.ctx.fillStyle = palette.sky;
    this.ctx.fillRect(0, 0, BATTLE_GBA_WIDTH, BATTLE_GBA_HEIGHT);
    this.ctx.fillStyle = palette.horizon;
    this.ctx.fillRect(0, 0, BATTLE_GBA_WIDTH, 54);
    this.ctx.fillStyle = palette.floor;
    this.ctx.beginPath();
    this.ctx.ellipse(182, 92, 56, 18, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(64, 102, 64, 22, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = palette.accent;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    const tb = this.battleTextboxComposite;
    if (tb) {
      this.ctx.drawImage(tb, 0, 0);
    }

    this.drawBattleMonster(battle.wildMon.species, BATTLE_SINGLE_BATTLER_COORDS.opponent.x, BATTLE_SINGLE_BATTLER_COORDS.opponent.y, 'opponent');
    this.drawBattleMonster(battle.playerMon.species, BATTLE_SINGLE_BATTLER_COORDS.player.x, BATTLE_SINGLE_BATTLER_COORDS.player.y, 'player');
    this.drawBattleHealthbox(battle, 'opponent');
    this.drawBattleHealthbox(battle, 'player');

    if (battle.phase === 'command') {
      this.drawBattleCommandMenu(battle);
    } else if (battle.phase === 'moveSelect') {
      this.drawBattleMoveMenu(battle);
    } else if (battle.phase === 'partySelect' || battle.phase === 'bagSelect') {
      this.drawBattleListWindow(battle, bag);
      this.drawBattleMessageWindow(battle);
    } else {
      this.drawBattleMessageWindow(battle);
    }

    end();
  }

  private drawStartMenuOverlay(startMenu: StartMenuState, runtime: ScriptRuntimeState): void {
    if (!startMenu.active && !startMenu.panel) {
      return;
    }

    this.activeFrameType = Math.max(0, Math.min(runtime.options.frameType ?? 0, this.stdWindowFrames.length - 1));

    if (startMenu.panel?.kind === 'bag') {
      this.drawBagScreen(startMenu.panel, runtime);
      return;
    }

    if (startMenu.active) {
      this.drawStartMenuWindow(startMenu);
      if (!startMenu.panel) {
        this.drawStartMenuHelp(startMenu, runtime);
        if (runtime.startMenu.mode === 'safari') {
          this.drawSafariStats(runtime);
        }
      }
    }

    if (startMenu.panel) {
      this.drawStartMenuPanel(startMenu.panel, runtime);
    }
  }

  private drawStartMenuWindow(startMenu: StartMenuState): void {
    const itemCount = startMenu.options.length;
    const innerTileHeight = itemCount * 2 - 1;
    const innerWgba = 7 * 8;
    const innerHgba = innerTileHeight * 8;
    const outerWgba = innerWgba + 16;
    const outerHgba = innerHgba + 16;
    const outerXgba = 168;
    const outerYgba = 0;
    const outerX = this.gbaX(outerXgba);
    const outerY = this.gbaY(outerYgba);
    const outerW = this.gbaX(outerWgba);
    const outerH = this.gbaY(outerHgba);

    this.drawWindowFrame(outerX, outerY, outerW, outerH, 'std');

    const innerLeft = outerX + WINDOW_SLICE;
    const innerTop = outerY + WINDOW_SLICE;
    const rowPitch = this.gbaY(15);
    const textInset = this.gbaX(8);

    startMenu.options.forEach((option, index) => {
      const rowY = innerTop + index * rowPitch;
      if (index === startMenu.selectedIndex) {
        this.drawCursor(innerLeft, rowY);
      }
      this.drawMenuText(option.label, innerLeft + textInset, rowY);
    });
  }

  private drawStartMenuHelp(startMenu: StartMenuState, runtime: ScriptRuntimeState): void {
    if (
      runtime.options.buttonMode !== 'help'
      || runtime.startMenu.mode === 'link'
      || runtime.startMenu.mode === 'unionRoom'
    ) {
      return;
    }

    const selected = startMenu.options[startMenu.selectedIndex];
    if (!selected) {
      return;
    }

    const helpText = this.getStartMenuDescription(selected.id);
    const helpH = this.gbaY(5 * 8);
    const helpY = this.canvas.height - helpH;
    const helpX = 0;
    const helpW = this.canvas.width;
    this.drawHelpMessageWindowTiled(helpX, helpY, helpW, helpH);
    const textX = helpX + this.gbaX(2);
    const textY = helpY + this.gbaY(5);
    const maxLineW = helpW - this.gbaX(4);
    const lines = this.wrapMenuText(helpText, maxLineW);
    const lineStep = this.gbaY(14);
    this.drawTextLines(lines, textX, textY, lineStep);
  }

  private drawSafariStats(runtime: ScriptRuntimeState): void {
    const totalSteps = 600;
    const stepsTaken = Math.max(0, Math.trunc(runtime.vars.safariStepsTaken ?? 0));
    const currentSteps = Math.max(0, totalSteps - Math.min(stepsTaken, totalSteps));
    const balls = Math.max(0, Math.trunc(runtime.vars.safariBalls ?? 30));
    const x = 8;
    const y = 8;
    const width = 68;
    const height = 34;
    this.drawWindowFrame(x, y, width, height, 'std');
    this.drawMenuText(`${currentSteps.toString().padStart(3, ' ')}/${totalSteps}`, x + 8, y + 12);
    this.drawMenuText(`BALLS ${balls.toString().padStart(2, ' ')}`, x + 8, y + 24);
  }

  private drawStartMenuPanel(panel: NonBagMenuPanel, runtime: ScriptRuntimeState): void {
    if (panel.kind === 'pokedex') {
      this.drawPokedexScreen(panel, runtime);
      return;
    }

    if (panel.kind === 'party') {
      this.drawPartyScreen(panel);
      return;
    }

    if (panel.kind === 'summary' && panel.id === 'PLAYER') {
      this.drawTrainerCardScreen(panel, runtime);
      return;
    }

    if (panel.kind === 'options') {
      this.drawOptionsScreen(panel);
      return;
    }

    if (panel.kind === 'save') {
      this.drawSaveScreen(panel, runtime);
      return;
    }

    if (panel.kind === 'retire') {
      this.drawRetireScreen(panel, runtime);
      return;
    }

    const exhaustiveCheck: never = panel;
    return exhaustiveCheck;
  }

  private drawPokedexScreen(panel: PokedexPanelState, runtime: ScriptRuntimeState): void {
    const panelW = this.canvas.width;
    const panelH = this.canvas.height;
    const uniform = Math.min(panelW / DEX_GBA_WIDTH, panelH / DEX_GBA_HEIGHT);
    const drawnW = DEX_GBA_WIDTH * uniform;
    const drawnH = DEX_GBA_HEIGHT * uniform;
    const offX = Math.floor((panelW - drawnW) / 2);
    const offY = Math.floor((panelH - drawnH) / 2);

    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.fillStyle = '#080810';
    this.ctx.fillRect(0, 0, panelW, panelH);
    this.ctx.translate(offX, offY);
    this.ctx.scale(uniform, uniform);

    this.drawPokedexBackground(panel);

    if (panel.screen === 'topMenu') {
      this.drawPokedexHeaderTitle(DEX_STRING_TABLE_OF_CONTENTS);
      this.drawPokedexFooterHelp(DEX_STRING_PICK_OK);
      this.drawPokedexDexCountsWindow(panel, runtime);
      this.drawPokedexModeSelectList(panel);
      this.drawPokedexSelectionIconWindow(panel);
    } else if (panel.screen === 'orderedList') {
      const head = panel.orderedListMode === 'numerical' ? DEX_STRING_POKEMON_LIST : DEX_STRING_SEARCH;
      this.drawPokedexHeaderTitle(head);
      this.drawPokedexFooterHelp(DEX_STRING_PICK_OK_EXIT);
      this.drawPokedexOrderedListDecomp(panel);
    } else if (panel.screen === 'categoryPage') {
      this.drawPokedexCategoryPageDecomp(panel);
    } else if (panel.screen === 'entry') {
      this.drawPokedexEntryPageDecomp(panel);
    } else {
      this.drawPokedexAreaPageDecomp(panel);
    }

    this.ctx.restore();
  }

  /**
   * Composite BG under dex windows: approximates `FillBgTilemapBufferRect` on BG1–BG3 in
   * `DexScreen_InitGfxForTopMenu` (tile 0x00E / 0x000 + palette 17) plus the left decor strip.
   */
  private drawPokedexBackground(panel: PokedexPanelState): void {
    const g = this.ctx.createLinearGradient(0, 0, DEX_GBA_WIDTH, DEX_GBA_HEIGHT);
    g.addColorStop(0, '#88a4b8');
    g.addColorStop(0.45, '#b8ccd8');
    g.addColorStop(1, '#98b0c0');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, DEX_GBA_WIDTH, DEX_GBA_HEIGHT);

    this.ctx.save();
    this.ctx.globalAlpha = 0.12;
    this.ctx.fillStyle = '#305070';
    for (let x = DEX_LEFT_DECOR_WIDTH; x < DEX_GBA_WIDTH; x += 8) {
      this.ctx.fillRect(x, 0, 4, DEX_GBA_HEIGHT);
    }
    this.ctx.restore();

    this.tileImageVerticalPokedexSidebar(
      panel.dexMode === 'NATIONAL' ? this.pokedexNationalSidebar : this.pokedexSidebar,
      0,
      0,
      DEX_LEFT_DECOR_WIDTH,
      DEX_GBA_HEIGHT
    );
  }

  /** After `drawWindowFrame`, overwrite nine-slice center like `FillWindowPixelBuffer` before text. */
  private drawPokedexWindowInnerFill(x: number, y: number, w: number, h: number, fill: string): void {
    const pad = WINDOW_SLICE;
    const iw = Math.max(0, w - pad * 2);
    const ih = Math.max(0, h - pad * 2);
    if (iw <= 0 || ih <= 0) {
      return;
    }
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x + pad, y + pad, iw, ih);
  }

  /** `sWindowTemplates[0]` + `DexScreen_PrintStringWithAlignment` (TEXT_CENTER). */
  private drawPokedexHeaderTitle(title: string): void {
    const r = DEX_RECT_HEADER;
    this.drawWindowFrame(r.x, r.y, r.w, r.h, 'std');
    this.drawPokedexWindowInnerFill(r.x, r.y, r.w, r.h, DEX_WINDOW_INNER_PIXEL15);
    const tw = this.measureMenuText(title);
    /** `DexScreen_PrintStringWithAlignment` uses y=2. */
    this.drawMenuText(title, r.x + Math.floor((DEX_GBA_WIDTH - tw) / 2), r.y + 2);
  }

  /** `sWindowTemplates[1]` + `DexScreen_PrintControlInfo` — FONT_SMALL analog, colorIdx 4; x = 236 - width, y = 2. */
  private drawPokedexFooterHelp(text: string): void {
    const r = DEX_RECT_FOOTER;
    this.drawWindowFrame(r.x, r.y, r.w, r.h, 'std');
    this.drawPokedexWindowInnerFill(r.x, r.y, r.w, r.h, DEX_WINDOW_INNER_PIXEL15);
    const tw = this.measureSmallTextWidth(text);
    this.drawSmallText(text, 236 - tw, r.y + 2, DEX_FOOTER_CONTROL_TEXT);
  }

  /** `DexScreen_PrintNum3RightAlign` — left edge of the 3-char cell; leading `0` → space (see `pokedex_screen.c`). */
  private formatPokedexThreeDigitCell(num: number): string {
    const n = Math.min(999, Math.max(0, Math.trunc(num)));
    const raw = n.toString().padStart(3, '0');
    let out = '';
    let seenNonZero = false;
    for (const c of raw) {
      if (c !== '0' || seenNonZero) {
        seenNonZero = true;
        out += c;
      } else {
        out += ' ';
      }
    }
    return out;
  }

  /** `sWindowTemplate_DexCounts` + `DexScreen_InitGfxForTopMenu` Kanto / National branches. */
  private drawPokedexDexCountsWindow(panel: PokedexPanelState, runtime: ScriptRuntimeState): void {
    const r = DEX_RECT_DEX_COUNTS;
    this.drawWindowFrame(r.x, r.y, r.w, r.h, 'std');
    this.drawPokedexWindowInnerFill(r.x, r.y, r.w, r.h, DEX_WINDOW_INNER_PIXEL0);

    /** Offsets in `DEX_COUNTS_*` are already relative to the dex-counts window (see `DexScreen_InitGfxForTopMenu`). */
    const miniX = r.x + 4;
    const miniY = r.y + 2;
    if (this.pokedexMiniPage.complete && this.pokedexMiniPage.naturalWidth > 0) {
      this.ctx.drawImage(this.pokedexMiniPage, miniX, miniY, 64, 40);
    }

    const counts = getPokedexCounts(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies);
    const natUi = isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies);

    /** `DexScreen_AddTextPrinterParameterized` colorIdx 0 (labels) vs 2 (right-aligned counts). */
    const dexLabel = '#183028';
    const dexCount = '#e01868';

    if (natUi) {
      const n = DEX_COUNTS_NATIONAL;
      this.drawSmallText('Seen:', r.x + n.seen.x, r.y + n.seen.y, dexLabel);
      this.drawSmallText('KANTO', r.x + n.seenKantoLabel.x, r.y + n.seenKantoLabel.y, dexLabel);
      this.drawSmallText(this.formatPokedexThreeDigitCell(counts.seenKanto), r.x + n.seenKantoNumRight, r.y + n.seenKantoNumY, dexCount);
      this.drawSmallText('NATIONAL', r.x + n.seenNatLabel.x, r.y + n.seenNatLabel.y, dexLabel);
      this.drawSmallText(this.formatPokedexThreeDigitCell(counts.seenNational), r.x + n.seenNatNumRight, r.y + n.seenNatNumY, dexCount);
      this.drawSmallText('Owned:', r.x + n.owned.x, r.y + n.owned.y, dexLabel);
      this.drawSmallText('KANTO', r.x + n.ownKantoLabel.x, r.y + n.ownKantoLabel.y, dexLabel);
      this.drawSmallText(this.formatPokedexThreeDigitCell(counts.ownedKanto), r.x + n.ownKantoNumRight, r.y + n.ownKantoNumY, dexCount);
      this.drawSmallText('NATIONAL', r.x + n.ownNatLabel.x, r.y + n.ownNatLabel.y, dexLabel);
      this.drawSmallText(this.formatPokedexThreeDigitCell(counts.ownedNational), r.x + n.ownNatNumRight, r.y + n.ownNatNumY, dexCount);
    } else {
      const k = DEX_COUNTS_KANTO;
      this.drawMenuText('Seen:', r.x + k.seenLabel.x, r.y + k.seenLabel.y, dexLabel);
      this.drawMenuText(this.formatPokedexThreeDigitCell(panel.seen), r.x + k.seenNumRight, r.y + k.seenNumY, dexCount);
      this.drawMenuText('Owned:', r.x + k.ownedLabel.x, r.y + k.ownedLabel.y, dexLabel);
      this.drawMenuText(this.formatPokedexThreeDigitCell(panel.owned), r.x + k.ownedNumRight, r.y + k.ownedNumY, dexCount);
    }

    if (this.pokedexCaughtMarker.complete && this.pokedexCaughtMarker.naturalWidth > 0) {
      this.ctx.drawImage(this.pokedexCaughtMarker, miniX + 8, miniY + 10, 8, 8);
      this.ctx.drawImage(this.pokedexCaughtMarker, miniX + 8, miniY + 22, 8, 8);
    }
  }

  /** `sWindowTemplate_ModeSelect` + `sListMenuTemplate_*ModeSelect`. */
  private drawPokedexModeSelectList(panel: PokedexPanelState): void {
    const w = DEX_RECT_MODE_SELECT;
    this.drawWindowFrame(w.x, w.y, w.w, w.h, 'std');
    this.drawPokedexWindowInnerFill(w.x, w.y, w.w, w.h, DEX_WINDOW_INNER_PIXEL0);

    const row0 = w.y + DEX_MODE_LIST_UP_TEXT_Y;
    const maxVisible = Math.min(DEX_MODE_LIST_MAX_SHOWED, panel.topMenuRows.length);
    const scrollOffset = panel.topMenuListCursorPos;
    const selectedFlat = panel.topMenuListCursorPos + panel.topMenuListItemsAbove;
    const visibleRows = panel.topMenuRows.slice(scrollOffset, scrollOffset + maxVisible);

    visibleRows.forEach((row, index) => {
      const rowY = row0 + index * DEX_MODE_LIST_ROW_STRIDE;
      const absoluteIndex = scrollOffset + index;
      const textX = w.x + (row.kind === 'header' ? DEX_MODE_LIST_HEADER_X : DEX_MODE_LIST_ITEM_X);

      if (absoluteIndex === selectedFlat && row.kind === 'item') {
        this.drawPokedexSelectorArrow(w.x + DEX_MODE_LIST_CURSOR_X, rowY - 2);
      }

      if (row.kind === 'header') {
        this.drawSmallText(row.label, textX, rowY);
      } else if (row.enabled) {
        this.drawMenuTextSpaced(row.label, textX, rowY, DEX_MODE_LIST_ITEM_ENABLED, DEX_MODE_LIST_LETTER_SPACING);
      } else {
        this.drawMenuTextSpaced(row.label, textX, rowY, DEX_MODE_LIST_ITEM_DISABLED, DEX_MODE_LIST_LETTER_SPACING);
      }
    });

    this.drawPokedexListScrollArrows(w, scrollOffset, panel.topMenuRows.length, maxVisible);
  }

  /** `sWindowTemplate_SelectionIcon` — full 64×48 tile (matches cat icon asset). */
  private drawPokedexSelectionIconWindow(panel: PokedexPanelState): void {
    const r = DEX_RECT_SELECTION_ICON;
    /** ROM fills this window from `CopyToWindowPixelBuffer` — no second std frame. */
    this.ctx.fillStyle = DEX_CATEGORY_ICON_TILE_BG;
    this.ctx.fillRect(r.x, r.y, r.w, r.h);
    this.ctx.strokeStyle = '#a8a8c0';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    const selectedRow = panel.topMenuRows[panel.topMenuSelectedIndex];
    if (!selectedRow?.iconId) {
      return;
    }
    const icon = this.pokedexIcons.get(selectedRow.iconId);
    if (icon?.complete && icon.naturalWidth > 0) {
      this.ctx.drawImage(icon, r.x, r.y, r.w, r.h);
    }
  }

  /** `sWindowTemplate_OrderedListMenu` + `sListMenuTemplate_OrderedListMenu`. */
  private drawPokedexOrderedListDecomp(panel: PokedexPanelState): void {
    const w = DEX_RECT_ORDERED_LIST;
    this.drawWindowFrame(w.x, w.y, w.w, w.h, 'std');
    this.drawPokedexWindowInnerFill(w.x, w.y, w.w, w.h, DEX_WINDOW_INNER_PIXEL0);

    const row0 = w.y + DEX_ORDERED_LIST_UP_TEXT_Y;
    const maxVisible = Math.min(DEX_ORDERED_LIST_MAX_SHOWED, panel.orderEntries.length);
    const scrollOffset = panel.orderListCursorPos;
    const selectedFlat = panel.orderListCursorPos + panel.orderListItemsAbove;
    const visibleEntries = panel.orderEntries.slice(scrollOffset, scrollOffset + maxVisible);

    visibleEntries.forEach((entry, index) => {
      const absoluteIndex = scrollOffset + index;
      const rowY = row0 + index * DEX_ORDERED_LIST_ROW_STRIDE;
      if (absoluteIndex === selectedFlat) {
        this.drawPokedexSelectorArrow(w.x + DEX_ORDERED_LIST_CURSOR_X, rowY - 2);
      }

      this.drawSmallText(entry.displayNumber, w.x + 12, rowY);
      this.drawMenuTextSpaced(
        entry.label,
        w.x + DEX_ORDERED_LIST_ITEM_X,
        rowY,
        DEX_MODE_LIST_ITEM_ENABLED,
        DEX_MODE_LIST_LETTER_SPACING
      );
      if (entry.caught && this.pokedexCaughtMarker.complete && this.pokedexCaughtMarker.naturalWidth > 0) {
        this.ctx.drawImage(this.pokedexCaughtMarker, w.x + 0x28, rowY - 1, 8, 8);
      }
      if (entry.caught && entry.types.length > 0) {
        this.drawSmallText(
          entry.types.map((type) => type.toUpperCase()).join('/'),
          w.x + 0x78,
          rowY
        );
      }
    });

    this.drawPokedexListScrollArrows(w, scrollOffset, panel.orderEntries.length, maxVisible);
  }

  /** Category page windows from `sCategoryPageIconCoords` / `DexScreen_CreateCategoryListGfx`. */
  private drawPokedexCategoryPageDecomp(panel: PokedexPanelState): void {
    const label = panel.categoryId ? panel.description : 'CATEGORY';
    this.drawPokedexHeaderTitle(label);
    this.drawPokedexFooterHelp('PICK    A: PAGE    B: BACK');

    const n = panel.categorySpecies.length;
    const slots = getPokedexCategorySlots(n);
    panel.categorySpecies.forEach((species, index) => {
      const slot = slots[index];
      if (!slot) {
        return;
      }
      const isSelected = index === panel.categoryCursorIndex;
      this.drawWindowFrame(slot.info.x, slot.info.y, 64, 40, 'std');
      this.drawPokedexWindowInnerFill(slot.info.x, slot.info.y, 64, 40, DEX_WINDOW_INNER_PIXEL0);
      if (this.pokedexMiniPage.complete && this.pokedexMiniPage.naturalWidth > 0) {
        this.ctx.drawImage(this.pokedexMiniPage, slot.info.x + 2, slot.info.y + 2, 48, 22);
      }
      this.drawSmallText(`No.${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`, slot.info.x + 10, slot.info.y + 2);
      this.drawMenuText(species.replace(/_/gu, ' '), slot.info.x + 4, slot.info.y + 14);
      this.ctx.fillStyle = DEX_CATEGORY_ICON_TILE_BG;
      this.ctx.fillRect(slot.icon.x, slot.icon.y, DEX_CATEGORY_ICON_SIZE, DEX_CATEGORY_ICON_SIZE);
      if (isSelected) {
        this.drawPokedexSelectorArrow(slot.icon.x - 2, slot.icon.y + 24);
      }
      this.drawPokemonIcon(species, slot.icon.x, slot.icon.y, DEX_CATEGORY_ICON_SIZE, DEX_CATEGORY_ICON_SIZE);
      if (isSelected) {
        this.ctx.strokeStyle = '#d48a24';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(slot.icon.x, slot.icon.y, DEX_CATEGORY_ICON_SIZE, DEX_CATEGORY_ICON_SIZE);
      }
    });
  }

  /** `sWindowTemplate_DexEntry_*` layout. */
  private drawPokedexEntryPageDecomp(panel: PokedexPanelState): void {
    const species = panel.entrySpecies ?? 'UNKNOWN';
    const entry = panel.entrySpecies ? getDecompPokedexEntry(panel.entrySpecies) : null;
    const pic = DEX_ENTRY_MON_PIC;
    const stats = DEX_ENTRY_SPECIES_STATS;
    const flavor = DEX_ENTRY_FLAVOR;

    this.drawWindowFrame(stats.x, stats.y, stats.w, stats.h, 'std');
    this.drawPokedexWindowInnerFill(stats.x, stats.y, stats.w, stats.h, DEX_WINDOW_INNER_PIXEL0);
    this.drawMenuText(species.replace(/_/gu, ' '), stats.x + 4, stats.y + 6);
    this.drawSmallText(`No. ${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`, stats.x + 4, stats.y + 22);
    this.drawPokemonIcon(species, pic.x, pic.y, pic.w, pic.h);

    if (panel.entryPageIndex === 0) {
      this.drawSmallText(entry ? `${entry.category} POKeMON` : 'UNKNOWN POKeMON', stats.x + 4, stats.y + 38);
      this.drawSmallText(entry ? `HT  ${formatDexHeight(entry.heightDm)}` : 'HT  -----', stats.x + 4, stats.y + 50);
      this.drawSmallText(entry ? `WT  ${formatDexWeight(entry.weightHg)}` : 'WT  -----', stats.x + 4, stats.y + 62);
      const types = getDecompSpeciesInfo(species)?.types ?? [];
      if (types.length > 0) {
        this.drawSmallText(`TYPE ${types.map((type) => type.toUpperCase()).join('/')}`, stats.x + 4, stats.y + 74);
      }
      this.drawPokedexFooterHelp('A: AREA    B: BACK    ←→: PAGE');
      return;
    }

    this.drawWindowFrame(flavor.x, flavor.y, flavor.w, flavor.h, 'std');
    this.drawPokedexWindowInnerFill(flavor.x, flavor.y, flavor.w, flavor.h, DEX_WINDOW_INNER_PIXEL0);
    this.drawTextLines(
      this.wrapMenuText(entry?.description ?? `${species.replace(/_/gu, ' ')} data page.`, flavor.w - 16).slice(0, 7),
      flavor.x + 8,
      flavor.y + 8,
      12
    );
    this.drawPokedexFooterHelp('A: AREA    B: BACK    ←→: PAGE');
  }

  /** Area map — positions derived from `sWindowTemplate_AreaMap_*` (composite map region). */
  private drawPokedexAreaPageDecomp(panel: PokedexPanelState): void {
    const species = panel.entrySpecies ?? 'UNKNOWN';
    this.drawPokedexHeaderTitle(`${species.replace(/_/gu, ' ')} AREA`);
    this.drawPokemonIcon(species, 8, 16, 32, 32);
    this.drawSmallText(`No. ${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`, 40, 20);

    const mapX = DEX_AREA_MAP_KANTO_RECT.x;
    const mapY = DEX_AREA_MAP_KANTO_RECT.y;
    const mapInnerW = DEX_AREA_MAP_KANTO_RECT.w;
    const mapInnerH = DEX_AREA_MAP_KANTO_RECT.h;
    const maxMapW = DEX_GBA_WIDTH - 8 - mapX;
    const maxMapH = DEX_RECT_FOOTER.y - 8 - mapY;
    const mapFit = Math.min(maxMapW / mapInnerW, maxMapH / mapInnerH, 1);
    const scale = 2 * mapFit;

    this.ctx.fillStyle = '#eef2dd';
    this.ctx.fillRect(mapX, mapY, mapInnerW * mapFit, mapInnerH * mapFit);
    this.drawCompositePokedexMap(mapX, mapY, scale);

    if (panel.areaMarkers.length === 0) {
      const ux = mapX + 40;
      const uy = mapY + 72;
      this.drawWindowFrame(ux, uy, 112, 24, 'std');
      this.drawPokedexWindowInnerFill(ux, uy, 112, 24, DEX_WINDOW_INNER_PIXEL0);
      this.drawMenuText('AREA UNKNOWN', mapX + 52, mapY + 80);
      this.drawPokedexFooterHelp('B: BACK');
      return;
    }

    for (const marker of panel.areaMarkers) {
      const markerImage = this.pokedexAreaMarkers.get(marker.type);
      if (!markerImage?.complete || markerImage.naturalWidth === 0) {
        continue;
      }
      this.ctx.drawImage(
        markerImage,
        mapX + marker.x * scale,
        mapY + marker.y * scale,
        markerImage.naturalWidth * scale,
        markerImage.naturalHeight * scale
      );
    }
    this.drawPokedexFooterHelp('B: BACK');
  }

  private drawCompositePokedexMap(x: number, y: number, scale: number): void {
    this.drawMapPiece('one', x, y, 0, 0, 18, 18, scale);
    this.drawMapPiece('two', x, y, 0, 24, 18, 18, scale);
    this.drawMapPiece('three', x, y, 0, 46, 18, 16, scale);
    this.drawMapPiece('four', x, y, 0, 74, 18, 18, scale);
    this.drawMapPiece('five', x, y, 34, 72, 22, 18, scale);
    this.drawMapPiece('six', x, y, 66, 74, 22, 18, scale);
    this.drawMapPiece('seven', x, y, 94, 72, 20, 20, scale);
    this.drawMapPiece('kanto', x, y, 32, 0, 88, 64, scale);
  }

  private drawMapPiece(
    key: string,
    baseX: number,
    baseY: number,
    sourceX: number,
    sourceY: number,
    width: number,
    height: number,
    scale: number
  ): void {
    const image = this.pokedexAreaMaps.get(key);
    if (!image?.complete || image.naturalWidth === 0) {
      return;
    }

    const sw = Math.min(width, image.naturalWidth);
    const sh = Math.min(height, image.naturalHeight);
    const dx = baseX + sourceX * scale;
    const dy = baseY + sourceY * scale;
    const dw = width * scale;
    const dh = height * scale;
    this.ctx.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);
  }

  private drawPokemonIcon(species: string, x: number, y: number, width: number, height: number): void {
    const icon = this.pokemonIcons.get(species.toUpperCase());
    if (icon?.complete && icon.naturalWidth > 0) {
      this.ctx.drawImage(icon, x, y, width, height);
      return;
    }

    this.ctx.fillStyle = '#d7d7e7';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#8a8aa4';
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  private measureSmallTextWidth(text: string): number {
    return this.measureTextAdvanceUserSpace('bold 8px "Trebuchet MS", sans-serif', text);
  }

  private partyActionLabel(action: PartyActionId): string {
    switch (action) {
      case 'SUMMARY':
        return 'SUMMARY';
      case 'SWITCH':
        return 'SWITCH';
      case 'CANCEL':
        return 'CANCEL';
      default: {
        const exhaustive: never = action;
        return exhaustive;
      }
    }
  }

  /** `GetHPBarLevel` / bar fill (`battle_interface.c`, `party_menu.c`). */
  private partyHpBarLevel(hp: number, maxHp: number, barPixels: number): 'full' | 'green' | 'yellow' | 'red' | 'empty' {
    if (maxHp <= 0) {
      return 'empty';
    }
    if (hp === maxHp) {
      return 'full';
    }
    const filled = Math.round((hp * barPixels) / maxHp);
    if (filled > (barPixels * 50) / 100) {
      return 'green';
    }
    if (filled > (barPixels * 20) / 100) {
      return 'yellow';
    }
    if (filled > 0) {
      return 'red';
    }
    return 'empty';
  }

  /** `DisplayPartyPokemonHPBar` — two-row bar in `dimensions[20..22]`. */
  private drawPartyHpBarGba(x: number, y: number, barW: number, hp: number, maxHp: number): void {
    const level = this.partyHpBarLevel(hp, maxHp, Math.round(barW));
    const fillW = maxHp > 0 ? Math.max(0, Math.min(barW, Math.round((hp * barW) / maxHp))) : 0;
    const topColor = level === 'green' || level === 'full' ? '#58b838' : level === 'yellow' ? '#d8c628' : '#d84c34';
    const bottomColor = level === 'green' || level === 'full' ? '#389028' : level === 'yellow' ? '#a89818' : '#a02820';
    const emptyTop = '#31484f';
    const emptyBottom = '#182830';
    this.ctx.fillStyle = emptyTop;
    this.ctx.fillRect(x, y, barW, 1);
    this.ctx.fillStyle = emptyBottom;
    this.ctx.fillRect(x, y + 1, barW, 2);
    if (fillW > 0) {
      this.ctx.fillStyle = topColor;
      this.ctx.fillRect(x, y, fillW, 1);
      this.ctx.fillStyle = bottomColor;
      this.ctx.fillRect(x, y + 1, fillW, 2);
    }
  }

  private partyMemberAt(panel: PartyPanelState, slot: number) {
    return slot < panel.members.length ? panel.members[slot] : undefined;
  }

  /**
   * Party menu (and other full-screen GBA panels) must scale X and Y by the same factor
   * so 8×8 tiles stay square; `gbaX`/`gbaY` alone stretch when the canvas is not 3:2.
   */
  private partyScreenUniformScale(): number {
    const sx = this.canvas.width / GBA_VIEW_WIDTH;
    const sy = this.canvas.height / GBA_VIEW_HEIGHT;
    const fit = Math.min(sx, sy);
    if (fit >= 1) {
      return Math.max(1, Math.floor(fit));
    }
    return Math.max(fit, 1e-6);
  }

  private beginPartyScreenPixelSpace(): { end: () => void } {
    const scale = this.partyScreenUniformScale();
    const ox = (this.canvas.width - GBA_VIEW_WIDTH * scale) / 2;
    const oy = (this.canvas.height - GBA_VIEW_HEIGHT * scale) / 2;
    this.ctx.save();
    this.ctx.translate(ox, oy);
    this.ctx.scale(scale, scale);
    return {
      end: () => {
        this.ctx.restore();
      }
    };
  }

  private drawPartyScreen(panel: PartyPanelState): void {
    void this.ensurePartyMenuAssetsLoaded();
    const { end } = this.beginPartyScreenPixelSpace();
    const W = PARTY_GBA_WIDTH;

    if (this.partyMenuBgCanvas) {
      this.ctx.drawImage(
        this.partyMenuBgCanvas,
        0,
        0,
        PARTY_MENU_BG_DRAW_W,
        PARTY_MENU_BG_PIXEL_H,
        0,
        0,
        PARTY_MENU_BG_DRAW_W,
        PARTY_MENU_BG_PIXEL_H
      );
    } else {
      this.ctx.fillStyle = '#98c0a8';
      this.ctx.fillRect(0, 0, W, GBA_VIEW_HEIGHT);
    }

    const tpl = this.partyBgTilesheet;
    const slotMaps = this.partySlotTilemaps;
    const canBlitSlots = !!(slotMaps && tpl.complete && tpl.naturalWidth > 0);
    const tilesPerRow = canBlitSlots ? partyBgTilesPerRow(tpl) : 8;
    const partyBgArt = !!this.partyMenuBgCanvas;

    for (let slot = 0; slot < PARTY_SCREEN_SLOT_COUNT; slot += 1) {
      const win = getPartyMonWindowRect(slot);
      const { x: wx, y: wy, w: ww, h: wh } = win;
      const member = this.partyMemberAt(panel, slot);

      if (canBlitSlots && slotMaps) {
        if (slot === 0) {
          if (member) {
            blitPartySlotTilemap(this.ctx, wx, wy, slotMaps.main, 10, 10, 7, tpl, tilesPerRow);
          }
        } else if (member) {
          blitPartySlotTilemap(this.ctx, wx, wy, slotMaps.wide, 18, 18, 3, tpl, tilesPerRow);
        } else {
          blitPartySlotTilemap(this.ctx, wx, wy, slotMaps.wideEmpty, 18, 18, 3, tpl, tilesPerRow);
        }
      } else if (slot > 0 && !member) {
        this.ctx.fillStyle = 'rgba(248, 248, 248, 0.35)';
        this.ctx.fillRect(wx, wy, ww, wh);
      }

      const isSelected =
        slot === panel.selectedIndex && (panel.mode === 'list' || panel.mode === 'switch' || panel.mode === 'actions');
      const isSwitchSource = panel.mode === 'switch' && slot === panel.switchingIndex;
      if (isSwitchSource) {
        this.ctx.strokeStyle = 'rgba(200, 72, 72, 0.95)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wx + 0.5, wy + 0.5, ww - 1, wh - 1);
      } else if (isSelected) {
        this.ctx.strokeStyle = 'rgba(232, 168, 32, 0.95)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wx + 0.5, wy + 0.5, ww - 1, wh - 1);
      }

      if (isSelected) {
        const sp = PARTY_SINGLE_SPRITES[slot];
        this.drawCursor(sp.mon.x - 2, sp.mon.y + 8);
      }

      const sprites = PARTY_SINGLE_SPRITES[slot];
      const pb = sprites.pokeball;
      if (this.partyPokeball.complete && this.partyPokeball.naturalWidth > 0 && member) {
        const srcY = member.hp > 0 ? 0 : 8;
        this.ctx.drawImage(this.partyPokeball, 0, srcY, 8, 8, pb.x, pb.y, 8, 8);
      }

      if (member) {
        const text = win.column === 'left' ? PARTY_TEXT_LEFT : PARTY_TEXT_RIGHT;
        const nick = getSpeciesDisplayName(member.species);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(wx, wy, ww, wh);
        this.ctx.clip();

        this.drawPartyMenuClippedText(nick, wx + text.nickname.x, wy + text.nickname.y, text.nickname.w);
        const lvStr = `Lv${member.level.toString().padStart(2, ' ')}`;
        this.drawSmallText(lvStr, wx + text.level.x, wy + text.level.y);

        const hpStr = member.hp.toString().padStart(3, ' ');
        this.drawSmallText(hpStr, wx + text.hp.x + text.hp.w - this.measureSmallTextWidth(hpStr), wy + text.hp.y);
        const maxStr = `/${member.maxHp.toString().padStart(3, ' ')}`;
        this.drawSmallText(maxStr, wx + text.maxHp.x + text.maxHp.w - this.measureSmallTextWidth(maxStr), wy + text.maxHp.y);

        const barX = wx + text.hpBar.x;
        const barY = wy + text.hpBar.y;
        const barW = text.hpBar.w;
        this.drawPartyHpBarGba(barX, barY, barW, member.hp, member.maxHp);

        this.ctx.restore();

        this.drawPokemonIcon(member.species, sprites.mon.x, sprites.mon.y, 32, 32);

        if (member.status !== 'OK' && member.status !== 'none') {
          this.drawSmallText(member.status, sprites.status.x, sprites.status.y);
        }
      }
    }

    const msg = getPartyMessageWindowRect();
    const { x: mx, y: my, w: mw, h: mh } = msg;
    if (!partyBgArt) {
      this.drawWindowFrame(mx, my, mw, mh, 'std');
    }
    const msgInnerPadX = partyBgArt ? 8 : WINDOW_SLICE;
    const msgInnerPadY = partyBgArt ? 5 : WINDOW_SLICE;
    const msgLineH = 12;
    this.drawTextLines(
      this.wrapMenuText(panel.description, mw - msgInnerPadX * 2).slice(0, 2),
      mx + msgInnerPadX,
      my + msgInnerPadY,
      msgLineH
    );

    const cancelT = PARTY_CANCEL_BUTTON_WINDOW;
    const cancelR = tilesToPixels(cancelT.tileLeft, cancelT.tileTop, cancelT.tileW, cancelT.tileH);
    if (!partyBgArt) {
      this.drawWindowFrame(cancelR.x, cancelR.y, cancelR.w, cancelR.h, 'std');
    }
    const cancelLabel = 'CANCEL';
    const cw = this.measureMenuText(cancelLabel);
    const cancelVisual = tilesToPixels(
      PARTY_CANCEL_BUTTON_BG_BLIT.tileLeft,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileTop,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileW,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileH
    );
    const cancelTextRect = partyBgArt ? cancelVisual : cancelR;
    const menuFontH = 10;
    this.drawMenuText(
      cancelLabel,
      cancelTextRect.x + (cancelTextRect.w - cw) / 2,
      cancelTextRect.y + (cancelTextRect.h - menuFontH) / 2
    );

    if (panel.mode === 'actions') {
      const n = panel.actionRows.length;
      const tw = partyActionsWindowTiles(n);
      const aw = tilesToPixels(tw.tileLeft, tw.tileTop, tw.tileW, tw.tileH);
      const { x: ax, y: ay, w: awPx, h: ahPx } = aw;
      this.drawWindowFrame(ax, ay, awPx, ahPx, 'std');
      const textStartX = ax + 8;
      panel.actionRows.forEach((action, index) => {
        const rowY = ay + 2 + index * 16;
        if (index === panel.actionIndex) {
          this.drawCursor(ax + 2, rowY - 2);
        }
        this.drawMenuText(this.partyActionLabel(action), textStartX, rowY, '#f8f8f8');
      });
    }

    if (panel.mode === 'summary') {
      const summaryX = 16;
      const summaryY = 28;
      const summaryW = PARTY_GBA_WIDTH - 32;
      const summaryH = 96;
      this.drawWindowFrame(summaryX, summaryY, summaryW, summaryH, 'std');
      panel.summaryLines.forEach((line, index) => {
        this.drawMenuText(line, summaryX + 8, summaryY + 10 + index * 16);
      });
      const pageStr = `PAGE ${panel.summaryPage + 1}/2`;
      this.drawSmallText(pageStr, summaryX + summaryW - this.measureSmallTextWidth(pageStr) - 6, summaryY + summaryH - 12);
    }

    end();
  }

  /**
   * Trainer card fills the canvas edge-to-edge (GBA 240×160 mapped to the whole viewport).
   * Footer uses `DrawStdWindowFrame` / `LoadStdWindowFrameGfx` (`trainer_card.c`), not the message box.
   */
  private drawTrainerCardScreen(panel: PlayerSummaryPanelState, runtime: ScriptRuntimeState): void {
    this.ctx.save();
    this.ctx.scale(this.canvas.width / GBA_VIEW_WIDTH, this.canvas.height / GBA_VIEW_HEIGHT);

    const labelColor = '#385060';
    const valueColor = '#20305f';
    const statColor = '#c02850';
    const statLight = '#f090a0';

    this.ensureTrainerCardLayerCache();
    const layer = panel.pageIndex === 0 ? this.trainerCardLayerCache?.front : this.trainerCardLayerCache?.back;
    if (layer) {
      this.ctx.drawImage(layer, 0, 0);
    } else {
      this.ctx.fillStyle = '#8898a8';
      this.ctx.fillRect(0, 0, TC_GBA_W, TC_GBA_H);
    }

    if (panel.pageIndex === 0) {
      this.drawTrainerCardFront(panel, runtime, { labelColor, valueColor, statColor, statLight });
    } else {
      this.drawTrainerCardBack(panel, runtime, { labelColor, valueColor, statColor, statLight });
    }

    const foot = TC_FOOTER_RECT;
    this.drawWindowFrame(foot.x, foot.y, foot.w, foot.h, 'std');
    const footerText = panel.pageIndex === 0 ? TC_STR.footerFront : TC_STR.footerBack;
    this.drawSmallText(footerText, foot.x + 8, foot.y + 10, valueColor);

    this.ctx.restore();
  }

  private drawTrainerCardFront(
    panel: PlayerSummaryPanelState,
    runtime: ScriptRuntimeState,
    colors: { labelColor: string; valueColor: string; statColor: string; statLight: string }
  ): void {
    const { labelColor, valueColor } = colors;
    const trainerId = Math.max(0, Math.min(0xffff, Math.trunc(runtime.vars.trainerId ?? 22796)));
    const money = Math.max(0, Math.min(999_999, Math.trunc(runtime.vars.money ?? 3000)));
    const moneyBuffer = `${TC_STR.yen}${money.toString().padStart(6, ' ')}`;
    const hasPokedex = runtime.startMenu.hasPokedex;
    const caughtCount = hasPokedex ? Math.min(999, runtime.pokedex.caughtSpecies.length) : 0;
    const dexBuffer = caughtCount.toString().padStart(3, '0');

    const playSec = Math.max(0, runtime.vars.playTimeSeconds ?? 0);
    let hours = Math.floor(playSec / 3600);
    let minutes = Math.floor((playSec % 3600) / 60);
    if (hours > 999) {
      hours = 999;
    }
    if (minutes > 59) {
      minutes = 59;
    }
    const hoursStr = hours.toString().padStart(3, ' ');
    const minutesStr = minutes.toString().padStart(2, '0');
    const colonBlink = Math.floor(performance.now() / 500) % 2 === 0;

    const nm = TC_FRONT_NAME;
    this.drawMenuText(`${TC_STR.namePrefix}${panel.title}`, tcWin1X(nm.x), tcWin1Y(nm.y), labelColor);

    const idStr = `${TC_STR.idNo}${trainerId.toString().padStart(5, '0')}`;
    this.drawMenuText(idStr, tcWin1X(TC_ID.x), tcWin1Y(TC_ID.y), labelColor);

    this.drawMenuText(TC_STR.money, tcWin1X(TC_MONEY_LABEL.x), tcWin1Y(TC_MONEY_LABEL.y), labelColor);
    this.drawMenuText(moneyBuffer, tcMoneyValueLeftX(moneyBuffer), tcWin1Y(TC_MONEY_LABEL.y), valueColor);

    if (hasPokedex) {
      this.drawMenuText(TC_STR.pokedex, tcWin1X(TC_DEX_LABEL.x), tcWin1Y(TC_DEX_LABEL.y), labelColor);
      this.drawMenuText(dexBuffer, tcDexCountLeftX(dexBuffer), tcWin1Y(TC_DEX_LABEL.y), valueColor);
    }

    this.drawMenuText(TC_STR.time, tcWin1X(TC_TIME_LABEL.x), tcWin1Y(TC_TIME_LABEL.y), labelColor);
    this.drawMenuText(
      hoursStr,
      tcWin1X(TC_TIME_HOURS.x),
      tcWin1Y(TC_TIME_HOURS.y),
      valueColor
    );
    if (colonBlink) {
      this.drawMenuText(
        TC_STR.colon,
        tcWin1X(TC_TIME_COLON.x),
        tcWin1Y(TC_TIME_COLON.y),
        valueColor
      );
    }
    this.drawMenuText(
      minutesStr,
      tcWin1X(TC_TIME_MINUTES.x),
      tcWin1Y(TC_TIME_MINUTES.y),
      valueColor
    );

    const isFemale = Math.trunc(runtime.vars.playerGender ?? 0) === 1;
    const trainerSprite = isFemale ? this.trainerCardLeaf : this.trainerCardRed;
    const picX = TC_WIN2_OX + TC_TRAINER_PIC_DX;
    const picY = TC_WIN2_OY + TC_TRAINER_PIC_DY;
    if (trainerSprite.complete && trainerSprite.naturalWidth > 0) {
      this.ctx.drawImage(
        trainerSprite,
        picX,
        picY,
        TC_TRAINER_PIC_SIZE,
        TC_TRAINER_PIC_SIZE
      );
    }

    const badgesEarned = Math.max(0, Math.min(8, Math.trunc(runtime.vars.badges ?? 0)));
    if (this.trainerCardBadges.complete && this.trainerCardBadges.naturalWidth > 0) {
      for (let i = 0; i < 8; i += 1) {
        const tileX = TC_BADGE_FIRST_TILE.x + i * TC_BADGE_TILE_STRIDE;
        const px = tileX * 8;
        const py = TC_BADGE_FIRST_TILE.y * 8;
        const sourceX = i * 8;
        this.ctx.globalAlpha = i < badgesEarned ? 1 : 0.32;
        this.ctx.drawImage(this.trainerCardBadges, sourceX, 0, 8, 8, px, py, 16, 16);
        this.ctx.globalAlpha = 1;
      }
    }

    const starPx = TC_STAR_TILE.x * 8;
    const starPy = TC_STAR_TILE.y * 8;
    const starCount = Math.min(4, Math.max(0, Math.trunc(runtime.vars.trainerCardStars ?? 0)));
    const charset = this.trainerCardTiles;
    if (charset.complete && charset.naturalWidth > 0) {
      for (let i = 0; i < starCount; i += 1) {
        drawTrainerCardCharsetTile(this.ctx, charset, TC_STAR_CHARSET_TILE, starPx + i * 8, starPy);
      }
    }
  }

  private drawTrainerCardBack(
    panel: PlayerSummaryPanelState,
    runtime: ScriptRuntimeState,
    colors: { labelColor: string; valueColor: string; statColor: string; statLight: string }
  ): void {
    const { labelColor, statColor } = colors;
    const lx = tcWin1X(TC_BACK_STAT_LEFT);

    this.drawMenuText(panel.title, tcWin1X(TC_BACK_NAME.x), tcWin1Y(TC_BACK_NAME.y), labelColor);

    const hH = Math.trunc(runtime.vars.hofDebutHours ?? 0);
    const hM = Math.trunc(runtime.vars.hofDebutMinutes ?? 0);
    const hS = Math.trunc(runtime.vars.hofDebutSeconds ?? 0);
    const hasHof = hH !== 0 || hM !== 0 || hS !== 0;
    if (hasHof) {
      const hofStr = `${hH.toString().padStart(3, ' ')}:${hM.toString().padStart(2, '0')}:${hS.toString().padStart(2, '0')}`;
      this.drawMenuText(TC_STR.hallOfFameDebut, lx, tcWin1Y(TC_BACK_HOF_Y), labelColor);
      this.drawMenuText(hofStr, tcWin1X(TC_BACK_STAT_VALUE_X), tcWin1Y(TC_BACK_HOF_Y), statColor);
    }

    const linkW = Math.trunc(runtime.vars.linkBattleWins ?? 0);
    const linkL = Math.trunc(runtime.vars.linkBattleLosses ?? 0);
    if (linkW !== 0 || linkL !== 0) {
      this.drawMenuText(TC_STR.linkBattles, lx, tcWin1Y(TC_BACK_LINK_LABEL_Y), labelColor);
      this.drawMenuText(
        TC_STR.winLoss,
        tcWin1X(TC_BACK_LINK_WINLOSS_X),
        tcWin1Y(TC_BACK_LINK_LABEL_Y),
        labelColor
      );
      this.drawMenuText(
        linkW.toString().padStart(4, ' '),
        tcWin1X(TC_BACK_LINK_WINS_X),
        tcWin1Y(TC_BACK_LINK_LABEL_Y),
        statColor
      );
      this.drawMenuText(
        linkL.toString().padStart(4, ' '),
        tcWin1X(TC_BACK_LINK_LOSSES_X),
        tcWin1Y(TC_BACK_LINK_LABEL_Y),
        statColor
      );
    }

    const trades = Math.trunc(runtime.vars.pokemonTrades ?? 0);
    if (trades !== 0) {
      this.drawMenuText(TC_STR.pokemonTrades, lx, tcWin1Y(TC_BACK_TRADES_Y), labelColor);
      this.drawMenuText(
        trades.toString().padStart(5, ' '),
        tcWin1X(TC_BACK_TRADE_COUNT_X),
        tcWin1Y(TC_BACK_TRADES_Y),
        statColor
      );
    }

    const unionNum = Math.trunc(runtime.vars.unionRoomNum ?? 0);
    if (unionNum !== 0) {
      this.drawMenuText(TC_STR.unionTradesBattles, lx, tcWin1Y(TC_BACK_UNION_Y), labelColor);
      this.drawMenuText(
        unionNum.toString().padStart(5, ' '),
        tcWin1X(TC_BACK_UNION_COUNT_X),
        tcWin1Y(TC_BACK_UNION_Y),
        statColor
      );
    }

    const berry = Math.trunc(runtime.vars.berryCrushPoints ?? 0);
    if (berry !== 0) {
      this.drawMenuText(TC_STR.berryCrush, lx, tcWin1Y(TC_BACK_BERRY_Y), labelColor);
      this.drawMenuText(
        berry.toString().padStart(5, ' '),
        tcWin1X(TC_BACK_BERRY_COUNT_X),
        tcWin1Y(TC_BACK_BERRY_Y),
        statColor
      );
    }
  }

  private drawOptionsScreen(panel: OptionPanelState): void {
    const x = 12;
    const y = 12;
    const width = this.canvas.width - 24;
    const height = this.canvas.height - 24;
    this.ctx.fillStyle = '#f6f1df';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#8b7959';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    this.drawMenuText(panel.title, x + 12, y + 10);

    panel.rows.forEach((row, index) => {
      const rowY = y + 28 + index * 18;
      const [label, value] = row.includes('  ') ? row.trim().split(/\s{2,}/u) : [row, ''];
      if (index === panel.selectedIndex) {
        this.drawCursor(x + 10, rowY - 2);
      }
      this.drawMenuText(label, x + 26, rowY);
      if (value) {
        this.drawMenuText(value, x + width - 92, rowY);
      }
    });

    this.drawWindowFrame(x + 10, y + height - 42, width - 20, 28, 'std');
    this.drawTextLines(this.wrapMenuText(panel.description, width - 36).slice(0, 2), x + 18, y + height - 32, 12);
  }

  private drawSaveScreen(panel: SavePanelState, runtime: ScriptRuntimeState): void {
    const x = 18;
    const y = 18;
    const width = this.canvas.width - 36;
    const height = this.canvas.height - 36;
    this.drawWindowFrame(x, y, width, height, 'std');
    this.drawMenuText(panel.title, x + 12, y + 12);

    this.drawWindowFrame(x + 14, y + 28, 140, 74, 'std');
    this.drawSmallText(`PLAYER ${runtime.startMenu.playerName}`, x + 24, y + 40);
    this.drawSmallText(`BADGES ${Math.max(0, Math.trunc(runtime.vars.badges ?? 0))}`, x + 24, y + 54);
    this.drawSmallText(`POKeDEX ${runtime.startMenu.seenPokemonCount}`, x + 24, y + 68);
    this.drawSmallText(`TIME ${Math.floor((runtime.vars.playTimeSeconds ?? 0) / 60)} MIN`, x + 24, y + 82);

    this.drawWindowFrame(x + 14, y + height - 58, width - 28, 42, 'std');
    this.drawTextLines(this.wrapMenuText(panel.description, width - 44).slice(0, 3), x + 22, y + height - 48, 12);

    if (panel.stage !== 'result') {
      const choiceX = x + width - 94;
      const choiceY = y + height - 92;
      this.drawWindowFrame(choiceX, choiceY, 74, 38, 'std');
      ['YES', 'NO'].forEach((label, index) => {
        const rowY = choiceY + 10 + index * 14;
        if (panel.selectedIndex === index) {
          this.drawCursor(choiceX + 4, rowY - 2);
        }
        this.drawMenuText(label, choiceX + 18, rowY);
      });
    }
  }

  private drawRetireScreen(panel: RetirePanelState, runtime: ScriptRuntimeState): void {
    this.drawSaveScreen({
      kind: 'save',
      id: 'SAVE',
      title: panel.title,
      stage: 'ask',
      prompt: panel.description,
      description: panel.description,
      selectedIndex: 0,
      returnToMenuOnClose: panel.returnToMenuOnClose
    }, runtime);
    const boxW = 66;
    const boxH = 40;
    const x = this.canvas.width - boxW - 20;
    const y = this.canvas.height - boxH - 24;
    this.drawWindowFrame(x, y, boxW, boxH, 'std');
    ['YES', 'NO'].forEach((label, index) => {
      const rowY = y + 10 + index * 14;
      if (panel.selectedIndex === index) {
        this.drawCursor(x + 4, rowY - 2);
      }
      this.drawMenuText(label, x + 18, rowY);
    });
  }

  private drawBagScreen(panel: BagPanelState, runtime: ScriptRuntimeState): void {
    const bag = runtime.bag;
    /** One GBA tile border inside scaled windows (`drawWindowFrameGbaBorder`). */
    const winPadX = this.gbaX(8);
    const winPadY = this.gbaY(8);

    /** `LoadCompressedPalette(gBagBgPalette, …)` — solid fill until full BG tilemap is ported. */
    this.ctx.fillStyle = '#88b0c8';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const pocketIdx = bag.selectedPocket === 'items' ? 0 : bag.selectedPocket === 'keyItems' ? 1 : 2;

    const bagSx = pocketIdx * BAG_SPRITE_SRC_W;
    const bagDx = this.gbaX(BAG_SPRITE_X);
    const bagDy = this.gbaY(BAG_SPRITE_Y + BAG_SPRITE_Y2_INITIAL);
    const bagDw = this.gbaX(BAG_SPRITE_SRC_W);
    const bagDh = this.gbaY(BAG_SPRITE_SRC_H);
    if (this.bagSprite.complete && this.bagSprite.naturalWidth > 0) {
      this.ctx.drawImage(
        this.bagSprite,
        bagSx,
        0,
        BAG_SPRITE_SRC_W,
        BAG_SPRITE_SRC_H,
        bagDx,
        bagDy,
        bagDw,
        bagDh
      );
    }

    const pocketWin = BAG_POCKET_NAME_WINDOW;
    const px = this.gbaX(pocketWin.x);
    const py = this.gbaY(pocketWin.y);
    const pw = this.gbaX(pocketWin.w);
    const ph = this.gbaY(pocketWin.h);
    this.drawWindowFrameGbaBorder(px, py, pw, ph, 'std');
    const pocketLabel = getBagPocketLabel(bag.selectedPocket);
    const pocketTextX = px + (pw - this.measureMenuText(pocketLabel)) / 2;
    this.drawMenuText(pocketLabel, pocketTextX, py + this.gbaY(BAG_POCKET_NAME_TEXT_Y));

    const listWin = BAG_LIST_WINDOW;
    const lx = this.gbaX(listWin.x);
    const ly = this.gbaY(listWin.y);
    const lw = this.gbaX(listWin.w);
    const lh = this.gbaY(listWin.h);
    this.drawWindowFrameGbaBorder(lx, ly, lw, lh, 'std');

    const rows = getBagVisibleRows(bag);
    const listInnerRight = lx + lw - winPadX;
    const listNameMaxW = listInnerRight - this.gbaX(2) - (lx + this.gbaX(BAG_LIST_ITEM_X)) - this.gbaX(36);

    rows.forEach((row, index) => {
      const rowYWin = BAG_LIST_UP_TEXT_Y + index * BAG_LIST_ROW_PITCH;
      const rowTop = ly + this.gbaY(rowYWin);
      if (row.isSelected) {
        this.drawCursor(lx + this.gbaX(BAG_LIST_CURSOR_X), rowTop - this.gbaY(2));
      }

      const nameX = lx + this.gbaX(BAG_LIST_ITEM_X);
      const nameLines = this.wrapMenuText(row.label, Math.max(this.gbaX(24), listNameMaxW));
      this.drawTextLines(nameLines.slice(0, 1), nameX, rowTop, this.gbaY(14));

      if (!row.isExit && row.quantity !== null && bag.selectedPocket !== 'keyItems') {
        const qtyStr = `×${row.quantity.toString().padStart(3, '0')}`;
        const qtyRight = Math.min(lx + this.gbaX(BAG_LIST_QTY_X), listInnerRight - this.gbaX(2));
        this.drawSmallText(qtyStr, qtyRight - this.measureSmallTextWidth(qtyStr), rowTop + this.gbaY(1));
      } else if (row.isRegistered) {
        const selectX = Math.min(
          lx + this.gbaX(BAG_LIST_SELECT_BLIT_X),
          listInnerRight - this.measureSmallTextWidth('SELECT')
        );
        this.drawSmallText('SELECT', selectX, rowTop + this.gbaY(1));
      }
    });

    const selectedEntry = rows.find((r) => r.isSelected);
    const selectedIconKey = selectedEntry?.iconKey ?? null;
    if (selectedIconKey && !selectedEntry?.isExit) {
      const selectedIcon = this.itemIcons.get(selectedIconKey);
      if (selectedIcon?.complete && selectedIcon.naturalWidth > 0) {
        const ix = this.gbaX(BAG_ITEM_ICON_X);
        const iy = this.gbaY(BAG_ITEM_ICON_Y);
        const is = this.gbaX(BAG_ITEM_ICON_DRAW_SIZE);
        this.ctx.drawImage(selectedIcon, ix, iy, is, is);
      }
    }

    const msgWin = BAG_MESSAGE_WINDOW;
    const mx = this.gbaX(msgWin.x);
    const my = this.gbaY(msgWin.y);
    const mw = this.gbaX(msgWin.w);
    const mh = this.gbaY(msgWin.h);
    this.drawWindowFrameGbaBorder(mx, my, mw, mh, 'message');
    const description = panel.message?.text ?? getBagDescription(bag);
    const msgTextX = mx + winPadX + this.gbaX(2);
    const msgTextY = my + winPadY + this.gbaY(3);
    const msgInnerW = mw - winPadX * 2 - this.gbaX(4);
    this.drawTextLines(
      this.wrapMenuText(description, Math.max(this.gbaX(40), msgInnerW)).slice(0, 2),
      msgTextX,
      msgTextY,
      this.gbaY(14)
    );

    const arrowColor = '#e82838';
    this.ctx.save();
    this.ctx.fillStyle = arrowColor;
    const drawTri = (cx: number, cy: number, dir: 'left' | 'right'): void => {
      this.ctx.beginPath();
      if (dir === 'left') {
        this.ctx.moveTo(cx + this.gbaX(4), cy);
        this.ctx.lineTo(cx, cy + this.gbaY(4));
        this.ctx.lineTo(cx + this.gbaX(4), cy + this.gbaY(8));
      } else {
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + this.gbaX(4), cy + this.gbaY(4));
        this.ctx.lineTo(cx, cy + this.gbaY(8));
      }
      this.ctx.closePath();
      this.ctx.fill();
    };
    if (bag.selectedPocket !== 'items') {
      drawTri(this.gbaX(BAG_POCKET_ARROW_LEFT.x), this.gbaY(BAG_POCKET_ARROW_LEFT.y), 'left');
    }
    if (bag.selectedPocket !== 'pokeBalls') {
      drawTri(this.gbaX(BAG_POCKET_ARROW_RIGHT.x), this.gbaY(BAG_POCKET_ARROW_RIGHT.y), 'right');
    }
    this.ctx.restore();

    if (panel.quantityPrompt) {
      const tossPrompt = BAG_TOSS_PROMPT_RECT;
      const tpx = this.gbaX(tossPrompt.x);
      const tpy = this.gbaY(tossPrompt.y);
      const tpw = this.gbaX(tossPrompt.w);
      const tph = this.gbaY(tossPrompt.h);
      this.drawWindowFrameGbaBorder(tpx, tpy, tpw, tph, 'std');
      const itemName = getItemDefinition(panel.quantityPrompt.itemId).name;
      const tossHead = `Toss out how many\n${itemName}(s)?`;
      const tossInnerW = tpw - winPadX * 2 - this.gbaX(4);
      this.drawTextLines(
        this.wrapMenuText(tossHead, Math.max(this.gbaX(40), tossInnerW)).slice(0, 2),
        tpx + winPadX + this.gbaX(2),
        tpy + winPadY + this.gbaY(2),
        this.gbaY(14)
      );

      const qtyBox = BAG_TOSS_QTY_RECT;
      const qx = this.gbaX(qtyBox.x);
      const qy = this.gbaY(qtyBox.y);
      const qw = this.gbaX(qtyBox.w);
      const qh = this.gbaY(qtyBox.h);
      this.drawWindowFrameGbaBorder(qx, qy, qw, qh, 'std');
      const qtyStr = `×${panel.quantityPrompt.quantity.toString().padStart(3, '0')}`;
      this.drawSmallText(qtyStr, qx + winPadX + this.gbaX(4), qy + winPadY + this.gbaY(10));
    } else if (panel.confirmationPrompt) {
      const cp = panel.confirmationPrompt;
      const titleRect = BAG_CONTEXT_TITLE_RECT;
      const cx = this.gbaX(titleRect.x);
      const cy = this.gbaY(titleRect.y);
      const cw = this.gbaX(titleRect.w);
      const ch = this.gbaY(titleRect.h);
      this.drawWindowFrameGbaBorder(cx, cy, cw, ch, 'std');
      const qStr = cp.quantity.toString().padStart(3, ' ');
      const confirmText = `Throw away ${qStr} of\nthis item?`;
      const confirmInnerW = cw - winPadX * 2 - this.gbaX(4);
      this.drawTextLines(
        this.wrapMenuText(confirmText, Math.max(this.gbaX(40), confirmInnerW)).slice(0, 2),
        cx + winPadX + this.gbaX(2),
        cy + winPadY + this.gbaY(2),
        this.gbaY(14)
      );

      const yn = BAG_YESNO_BOTTOM_RIGHT_RECT;
      const yx = this.gbaX(yn.x);
      const yy = this.gbaY(yn.y);
      const yw = this.gbaX(yn.w);
      const yh = this.gbaY(yn.h);
      this.drawWindowFrameGbaBorder(yx, yy, yw, yh, 'std');
      ['YES', 'NO'].forEach((choice, index) => {
        const rowY = yy + winPadY + this.gbaY(8 + index * 14);
        if (index === cp.selectedIndex) {
          this.drawCursor(yx + winPadX + this.gbaX(4), rowY - this.gbaY(2));
        }
        this.drawMenuText(choice, yx + winPadX + this.gbaX(12), rowY);
      });
    } else if (panel.contextMenu) {
      const contextMenu = panel.contextMenu;
      const titleRect = BAG_CONTEXT_TITLE_RECT;
      const tx = this.gbaX(titleRect.x);
      const ty = this.gbaY(titleRect.y);
      const tw = this.gbaX(titleRect.w);
      const th = this.gbaY(titleRect.h);
      this.drawWindowFrameGbaBorder(tx, ty, tw, th, 'std');
      const itemName = getItemDefinition(contextMenu.itemId).name;
      const titleInnerW = tw - winPadX * 2 - this.gbaX(4);
      const titleLine1 = this.wrapMenuText(`${itemName} is`, Math.max(this.gbaX(24), titleInnerW))[0] ?? `${itemName} is`;
      this.drawTextLines([titleLine1, 'selected.'], tx + winPadX + this.gbaX(2), ty + winPadY + this.gbaY(2), this.gbaY(14));

      const actionsRect = bagContextActionsRect(contextMenu.actions.length);
      const ax = this.gbaX(actionsRect.x);
      const ay = this.gbaY(actionsRect.y);
      const aw = this.gbaX(actionsRect.w);
      const ah = this.gbaY(actionsRect.h);
      this.drawWindowFrameGbaBorder(ax, ay, aw, ah, 'std');

      contextMenu.actions.forEach((action, index) => {
        const rowY = ay + winPadY + this.gbaY(BAG_CONTEXT_MENU_FIRST_ROW_Y + index * BAG_CONTEXT_MENU_ROW_PITCH);
        if (index === contextMenu.selectedIndex) {
          this.drawCursor(ax + winPadX + this.gbaX(BAG_CONTEXT_MENU_CURSOR_X - 2), rowY - this.gbaY(2));
        }
        this.drawMenuText(
          this.getBagActionLabel(action),
          ax + winPadX + this.gbaX(BAG_CONTEXT_MENU_TEXT_X + 4),
          rowY
        );
      });
    }
  }

  private getStartMenuDescription(id: string): string {
    switch (id) {
      case 'POKEDEX':
        return 'A device that records POKeMON secrets upon meeting or catching them.';
      case 'POKEMON':
        return 'Check and organize POKeMON that are traveling with you in your party.';
      case 'BAG':
        return 'Equipped with pockets for storing items you bought, received, or found.';
      case 'PLAYER':
        return 'Check your money and other game data.';
      case 'SAVE':
        return 'Save your game with a complete record of your progress to take a break.';
      case 'OPTION':
        return 'Adjust various game settings such as text speed, game rules, etc.';
      case 'EXIT':
        return 'Close this MENU window.';
      case 'RETIRE':
        return 'Retire from the SAFARI GAME and return to the registration counter.';
      default:
        return '';
    }
  }

  private drawWindowFrame(x: number, y: number, width: number, height: number, variant: 'std' | 'message'): void {
    const frame = variant === 'message'
      ? this.menuMessageWindow
      : this.stdWindowFrames[this.activeFrameType] ?? this.stdWindowFrame;
    if (frame.complete && frame.naturalWidth > 0) {
      this.drawNineSlice(frame, x, y, width, height, WINDOW_SLICE, WINDOW_SLICE);
      return;
    }

    this.ctx.fillStyle = '#f8f8f8';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#7c8bbc';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  /**
   * Bag / full-screen overlays scale window rects with `gbaX`/`gbaY` but GBA tiles are still 8×8
   * logical pixels — border thickness must scale too (fixed `WINDOW_SLICE` would be only ~8 CSS px).
   */
  private drawWindowFrameGbaBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    variant: 'std' | 'message'
  ): void {
    const frame = variant === 'message'
      ? this.menuMessageWindow
      : this.stdWindowFrames[this.activeFrameType] ?? this.stdWindowFrame;
    if (frame.complete && frame.naturalWidth > 0) {
      const sx = this.gbaX(8);
      const sy = this.gbaY(8);
      this.drawNineSlice(frame, x, y, width, height, sx, sy);
      return;
    }

    this.drawWindowFrame(x, y, width, height, variant);
  }

  private drawNineSlice(
    image: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    destSliceX: number,
    destSliceY: number
  ): void {
    const srcSlice = WINDOW_SLICE;
    const sx = Math.min(destSliceX, Math.floor(dw / 2));
    const sy = Math.min(destSliceY, Math.floor(dh / 2));
    const sw = image.naturalWidth;
    const sh = image.naturalHeight;
    const centerSw = sw - srcSlice * 2;
    const centerSh = sh - srcSlice * 2;
    const centerDw = Math.max(0, dw - sx * 2);
    const centerDh = Math.max(0, dh - sy * 2);

    this.ctx.drawImage(image, 0, 0, srcSlice, srcSlice, dx, dy, sx, sy);
    this.ctx.drawImage(image, srcSlice, 0, centerSw, srcSlice, dx + sx, dy, centerDw, sy);
    this.ctx.drawImage(image, sw - srcSlice, 0, srcSlice, srcSlice, dx + dw - sx, dy, sx, sy);
    this.ctx.drawImage(image, 0, srcSlice, srcSlice, centerSh, dx, dy + sy, sx, centerDh);
    this.ctx.drawImage(image, srcSlice, srcSlice, centerSw, centerSh, dx + sx, dy + sy, centerDw, centerDh);
    this.ctx.drawImage(image, sw - srcSlice, srcSlice, srcSlice, centerSh, dx + dw - sx, dy + sy, sx, centerDh);
    this.ctx.drawImage(image, 0, sh - srcSlice, srcSlice, srcSlice, dx, dy + dh - sy, sx, sy);
    this.ctx.drawImage(image, srcSlice, sh - srcSlice, centerSw, srcSlice, dx + sx, dy + dh - sy, centerDw, sy);
    this.ctx.drawImage(image, sw - srcSlice, sh - srcSlice, srcSlice, srcSlice, dx + dw - sx, dy + dh - sy, sx, sy);
  }

  /**
   * Menu hand cursor: `Menu_RedrawCursor` in `src/menu.c` prints `gText_SelectorArrow2` ("▶")
   * at `(left, top)` with `GetMenuCursorDimensionByFont` → 8×14 for `FONT_NORMAL`.
   */
  private drawCursor(x: number, y: number): void {
    this.ctx.save();
    this.ctx.fillStyle = '#e82838';
    this.ctx.strokeStyle = '#682028';
    this.ctx.lineWidth = 1;
    const ty = y + 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 1, ty);
    this.ctx.lineTo(x + 6, ty + 4);
    this.ctx.lineTo(x + 1, ty + 8);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawMenuText(text: string, x: number, y: number, fillStyle = '#20305f'): void {
    this.ctx.save();
    this.ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = fillStyle;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  /** `FONT_NORMAL` + `lettersSpacing` from `sListMenuTemplate_*ModeSelect` (advance in user space). */
  private drawMenuTextSpaced(text: string, x: number, y: number, fillStyle: string, letterSpacing: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = fillStyle;
    this.ctx.textBaseline = 'top';
    let cx = x;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]!;
      this.ctx.fillText(ch, cx, y);
      cx += this.measureMenuText(ch) + (i < text.length - 1 ? letterSpacing : 0);
    }
    this.ctx.restore();
  }

  /** `ListMenuDrawCursor` / `gText_SelectorArrow2` ("▶") for dex lists. */
  private drawPokedexSelectorArrow(x: number, y: number): void {
    this.drawSmallText('▶', x, y, DEX_MODE_LIST_ITEM_ENABLED);
  }

  /** Minimal scroll affordance when `AddScrollIndicatorArrowPair` would show in ROM. */
  private drawPokedexListScrollArrows(
    w: { x: number; y: number; w: number; h: number },
    scrollOffset: number,
    totalRows: number,
    maxVisible: number
  ): void {
    if (totalRows <= maxVisible) {
      return;
    }
    const cx = w.x + Math.floor(w.w / 2) - 4;
    const fg = DEX_MODE_LIST_ITEM_ENABLED;
    if (scrollOffset > 0) {
      this.drawSmallText('▲', cx, w.y + 4, fg);
    }
    if (scrollOffset + maxVisible < totalRows) {
      this.drawSmallText('▼', cx, w.y + w.h - 12, fg);
    }
  }

  /** Party nickname rect from `sPartyBoxInfoRects` — ellipsize so long names stay inside the slot. */
  private drawPartyMenuClippedText(text: string, x: number, y: number, maxWidth: number): void {
    if (this.measureMenuText(text) <= maxWidth) {
      this.drawMenuText(text, x, y);
      return;
    }
    const ell = '…';
    for (let i = text.length; i >= 1; i -= 1) {
      const candidate = `${text.slice(0, i)}${ell}`;
      if (this.measureMenuText(candidate) <= maxWidth) {
        this.drawMenuText(candidate, x, y);
        return;
      }
    }
    this.drawMenuText(ell, x, y);
  }

  private drawTextLines(lines: string[], x: number, y: number, lineHeight: number): void {
    lines.forEach((line, index) => {
      this.drawMenuText(line, x, y + index * lineHeight);
    });
  }

  private drawSmallText(text: string, x: number, y: number, fillStyle = '#20305f'): void {
    this.ctx.save();
    this.ctx.font = 'bold 8px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = fillStyle;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  /** `sItemMenuContextActions` / `gOtherText_*` in `src/strings.c`. */
  private getBagActionLabel(action: BagContextActionId): string {
    switch (action) {
      case 'USE':
        return 'USE';
      case 'GIVE':
        return 'GIVE';
      case 'TOSS':
        return 'TOSS';
      case 'REGISTER':
        return 'REGISTER';
      case 'DESELECT':
        return 'DESELECT';
      case 'OPEN':
        return 'OPEN';
      case 'CANCEL':
        return 'CANCEL';
      default: {
        const exhaustive: never = action;
        return exhaustive;
      }
    }
  }

  /**
   * Horizontal advance in **current user-space units** (accounts for `ctx.scale` on the Pokédex path).
   * `measureText` is in CSS pixels with identity CTM; the Pokédex screen applies a uniform scale from 240×160.
   */
  private measureTextAdvanceUserSpace(font: string, text: string): number {
    const t = this.ctx.getTransform();
    const scaleX = Math.hypot(t.a, t.b);
    const sx = scaleX < 1e-8 ? 1 : scaleX;
    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.font = font;
    const cssWidth = this.ctx.measureText(text).width;
    this.ctx.restore();
    return cssWidth / sx;
  }

  private measureMenuText(text: string): number {
    return this.measureTextAdvanceUserSpace('bold 10px "Trebuchet MS", sans-serif', text);
  }

  private wrapMenuText(text: string, maxWidth: number): string[] {
    const paragraphs = text.split('\n');
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/u).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
        continue;
      }

      let line = words[0];
      for (let i = 1; i < words.length; i += 1) {
        const nextLine = `${line} ${words[i]}`;
        if (this.measureMenuText(nextLine) <= maxWidth) {
          line = nextLine;
        } else {
          lines.push(line);
          line = words[i];
        }
      }
      lines.push(line);
    }

    return lines;
  }

  /** 8px-wide GBA tiles scaled 2× to 16px, then tiled to `destW` (e.g. 16+2 divider = 18). */
  private tileImageVerticalPokedexSidebar(
    image: HTMLImageElement,
    x: number,
    y: number,
    destW: number,
    height: number
  ): void {
    const srcW = image.naturalWidth;
    const srcH = image.naturalHeight;
    if (!(image.complete && srcW > 0)) {
      this.ctx.fillStyle = '#98a8b8';
      this.ctx.fillRect(x, y, destW, height);
      return;
    }

    const scale2 = 2;
    const stripW = srcW * scale2;
    for (let drawY = y; drawY < y + height; drawY += srcH) {
      const tileH = Math.min(srcH, y + height - drawY);
      let dx = x;
      let remaining = destW;
      while (remaining > 0) {
        const dw = Math.min(stripW, remaining);
        const sw = Math.max(1, Math.round((dw / stripW) * srcW));
        this.ctx.drawImage(image, 0, 0, sw, tileH, dx, drawY, dw, tileH);
        dx += dw;
        remaining -= dw;
      }
    }
  }

  private drawEntities(player: PlayerState, npcs: NpcState[], camera: CameraState): void {
    const drawQueue = [
      ...npcs.map((npc) => ({ kind: 'npc' as const, sortY: npc.position.y + 16, npc })),
      { kind: 'player' as const, sortY: player.position.y + 16, player }
    ].sort((left, right) => left.sortY - right.sortY);

    for (const entity of drawQueue) {
      if (entity.kind === 'npc') {
        this.drawNpc(entity.npc, camera);
      } else {
        this.drawPlayer(entity.player, camera);
      }
    }
  }

  private drawNpc(npc: NpcState, camera: CameraState): void {
    if (this.textureStore.drawCharacterSprite(this.ctx, {
      position: npc.position,
      camera,
      facing: npc.facing,
      moving: npc.moving,
      animationTime: npc.animationTime ?? 0,
      graphicsId: npc.graphicsId
    })) {
      return;
    }

    const screenX = npc.position.x - camera.x;
    const screenY = npc.position.y - camera.y;

    this.ctx.fillStyle = '#f8b5b5';
    this.ctx.fillRect(screenX, screenY, PLAYER_SIZE, PLAYER_SIZE);

    this.ctx.fillStyle = '#5f2f2f';
    this.ctx.fillRect(screenX + 2, screenY + 8, 10, 5);

    this.ctx.fillStyle = '#2a1010';
    switch (npc.facing) {
      case 'up':
        this.ctx.fillRect(screenX + 4, screenY + 1, 6, 3);
        break;
      case 'down':
        this.ctx.fillRect(screenX + 4, screenY + 10, 6, 3);
        break;
      case 'left':
        this.ctx.fillRect(screenX + 1, screenY + 4, 3, 6);
        break;
      case 'right':
        this.ctx.fillRect(screenX + 10, screenY + 4, 3, 6);
        break;
    }
  }

  private drawPlayer(player: PlayerState, camera: CameraState): void {
    if (this.textureStore.drawCharacterSprite(this.ctx, {
      position: player.position,
      camera,
      facing: player.facing,
      moving: player.moving,
      animationTime: player.animationTime,
      graphicsId: PLAYER_GRAPHICS_ID
    })) {
      return;
    }

    const screenX = player.position.x - camera.x;
    const screenY = player.position.y - camera.y;
    const stepFrame = player.moving ? Math.floor(player.animationTime * 10) % 2 : 0;
    const bobOffset = player.moving && stepFrame === 1 ? 1 : 0;

    this.ctx.fillStyle = '#f2d07c';
    this.ctx.fillRect(screenX, screenY - bobOffset, PLAYER_SIZE, PLAYER_SIZE);

    this.ctx.fillStyle = '#355c7d';
    this.ctx.fillRect(screenX + 2, screenY + 8 - bobOffset, 10, 5);

    this.ctx.fillStyle = '#1b2234';
    switch (player.facing) {
      case 'up':
        this.ctx.fillRect(screenX + 4, screenY + 1 - bobOffset, 6, 3);
        break;
      case 'down':
        this.ctx.fillRect(screenX + 4, screenY + 10 - bobOffset, 6, 3);
        break;
      case 'left':
        this.ctx.fillRect(screenX + 1, screenY + 4 - bobOffset, 3, 6);
        break;
      case 'right':
        this.ctx.fillRect(screenX + 10, screenY + 4 - bobOffset, 3, 6);
        break;
    }
  }
}
