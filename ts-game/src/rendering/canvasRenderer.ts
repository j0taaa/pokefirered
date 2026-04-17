import menuCursorUrl from '../../../graphics/interface/red_arrow.png';
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
import partyBgUrl from '../../../graphics/party_menu/bg.png';
import partyPokeballUrl from '../../../graphics/party_menu/pokeball.png';
import trainerCardBadgesUrl from '../../../graphics/trainer_card/badges.png';
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
import { getDecompSpeciesInfo } from '../game/decompSpecies';
import {
  getBagDescription,
  getBagPocketLabel,
  getBagVisibleRows,
  getItemDefinition,
  type BagContextActionId,
  type BagPanelState
} from '../game/bag';
import type {
  OptionPanelState,
  PartyPanelState,
  PlayerSummaryPanelState,
  PokedexPanelState,
  RetirePanelState,
  SavePanelState,
  StartMenuState
} from '../game/menu';
import type { NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { ScriptRuntimeState } from '../game/scripts';
import type { TileMap } from '../world/tileMap';
import { DecompTextureStore } from './decompTextureStore';

const PLAYER_SIZE = 14;
const PLAYER_GRAPHICS_ID = 'OBJ_EVENT_GFX_RED_NORMAL';
const WINDOW_SLICE = 8;

interface RenderOverlayState {
  startMenu: StartMenuState;
  runtime: ScriptRuntimeState;
}

type NonBagMenuPanel = Exclude<NonNullable<StartMenuState['panel']>, BagPanelState>;

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly textureStore: DecompTextureStore;
  private readonly stdWindowFrame = this.loadImage(stdWindowFrameUrl);
  private readonly menuMessageWindow = this.loadImage(menuMessageWindowUrl);
  private readonly menuCursor = this.loadImage(menuCursorUrl);
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
  private readonly partyBg = this.loadImage(partyBgUrl);
  private readonly partyPokeball = this.loadImage(partyPokeballUrl);
  private readonly trainerCardTiles = this.loadImage(trainerCardTilesUrl);
  private readonly trainerCardBadges = this.loadImage(trainerCardBadgesUrl);
  private readonly trainerCardRed = this.loadImage(trainerRedUrl);
  private readonly trainerCardLeaf = this.loadImage(trainerLeafUrl);
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
    const labels = startMenu.options.map((option) => option.label);
    const labelWidth = Math.max(...labels.map((label) => this.measureMenuText(label)), 48);
    const width = Math.max(76, labelWidth + 28);
    const height = 16 + startMenu.options.length * 14;
    const x = this.canvas.width - width - 8;
    const y = 8;

    this.drawWindowFrame(x, y, width, height, 'std');
    startMenu.options.forEach((option, index) => {
      const rowY = y + 12 + index * 14;
      if (index === startMenu.selectedIndex) {
        this.drawCursor(x + 4, rowY - 4);
      }
      this.drawMenuText(option.label, x + 18, rowY);
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
    const x = 8;
    const y = this.canvas.height - 42;
    const width = this.canvas.width - 16;
    const height = 34;
    this.drawWindowFrame(x, y, width, height, 'message');
    const lines = this.wrapMenuText(helpText, width - 16);
    this.drawTextLines(lines, x + 8, y + 12, 12);
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
      this.drawPokedexScreen(panel);
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

  private drawPokedexScreen(panel: PokedexPanelState): void {
    const x = 8;
    const y = 8;
    const width = this.canvas.width - 16;
    const height = this.canvas.height - 16;
    this.ctx.fillStyle = '#f8f7ef';
    this.ctx.fillRect(x, y, width, height);

    this.tileImageVertical(panel.dexMode === 'NATIONAL' ? this.pokedexNationalSidebar : this.pokedexSidebar, x, y, 18, height);
    this.ctx.fillStyle = '#d6c7a5';
    this.ctx.fillRect(x + 18, y, 2, height);

    this.drawMenuText(panel.screen === 'topMenu' ? 'POKeDEX TABLE OF CONTENTS' : panel.title, x + 28, y + 10);
    this.drawSmallText(panel.description, x + 28, y + 24);

    const miniX = x + width - 88;
    const miniY = y + 14;
    if (this.pokedexMiniPage.complete && this.pokedexMiniPage.naturalWidth > 0) {
      this.ctx.drawImage(this.pokedexMiniPage, miniX, miniY, 64, 40);
    } else {
      this.drawWindowFrame(miniX, miniY, 64, 40, 'std');
    }

    if (this.pokedexCaughtMarker.complete && this.pokedexCaughtMarker.naturalWidth > 0) {
      this.ctx.drawImage(this.pokedexCaughtMarker, miniX + 8, miniY + 10, 8, 8);
      this.ctx.drawImage(this.pokedexCaughtMarker, miniX + 8, miniY + 22, 8, 8);
    }

    this.drawSmallText('SEEN', miniX + 22, miniY + 8);
    this.drawSmallText(panel.seen.toString().padStart(3, '0'), miniX + 22, miniY + 18);
    this.drawSmallText('OWN', miniX + 22, miniY + 28);
    this.drawSmallText(panel.owned.toString().padStart(3, '0'), miniX + 42, miniY + 28);

    if (panel.screen === 'topMenu') {
      this.drawPokedexTopMenu(panel, x, y, width, height);
      return;
    }

    if (panel.screen === 'orderedList') {
      this.drawPokedexOrderedList(panel, x, y, width, height);
      return;
    }

    if (panel.screen === 'categoryPage') {
      this.drawPokedexCategoryPage(panel, x, y, width, height);
      return;
    }

    if (panel.screen === 'entry') {
      this.drawPokedexEntryPage(panel, x, y, width, height);
      return;
    }

    this.drawPokedexAreaPage(panel, x, y, width, height);
  }

  private drawPokedexTopMenu(panel: PokedexPanelState, x: number, y: number, width: number, height: number): void {
    const scrollOffset = Math.max(
      0,
      Math.min(panel.topMenuSelectedIndex - 4, Math.max(0, panel.topMenuRows.length - 9))
    );
    const visibleRows = panel.topMenuRows.slice(scrollOffset, scrollOffset + 9);
    const menuX = x + 26;
    const menuY = y + 54;
    const menuW = 172;
    const menuH = 146;
    this.drawWindowFrame(menuX, menuY, menuW, menuH, 'std');

    visibleRows.forEach((row, index) => {
      const rowY = menuY + 12 + index * 14;
      const absoluteIndex = scrollOffset + index;
      if (row.kind === 'header') {
        this.drawSmallText(row.label, menuX + 10, rowY);
        return;
      }

      if (absoluteIndex === panel.topMenuSelectedIndex) {
        this.drawCursor(menuX + 4, rowY - 2);
        this.ctx.fillStyle = 'rgba(255, 240, 180, 0.55)';
        this.ctx.fillRect(menuX + 18, rowY - 1, menuW - 26, 13);
      }
      this.ctx.globalAlpha = row.enabled ? 1 : 0.5;
      this.drawMenuText(row.label, menuX + 18, rowY);
      this.ctx.globalAlpha = 1;
    });

    const selectedRow = panel.topMenuRows[panel.topMenuSelectedIndex];
    const iconX = x + width - 108;
    const iconY = y + 62;
    this.drawWindowFrame(iconX, iconY, 82, 76, 'std');
    if (selectedRow?.iconId) {
      const icon = this.pokedexIcons.get(selectedRow.iconId);
      if (icon?.complete && icon.naturalWidth > 0) {
        this.ctx.drawImage(icon, iconX + 18, iconY + 12, 46, 46);
      }
    }
    if (selectedRow?.label) {
      this.drawSmallText(selectedRow.label, iconX + 8, iconY + 62);
    }

    this.drawWindowFrame(x + 26, y + height - 54, width - 36, 34, 'message');
    this.drawTextLines(['A: SELECT', 'B: CLOSE'], x + 34, y + height - 44, 12);
  }

  private drawPokedexOrderedList(panel: PokedexPanelState, x: number, y: number, width: number, height: number): void {
    const title = panel.orderedListMode === 'numerical' ? 'POKeMON LIST' : 'SEARCH';
    this.drawWindowFrame(x + 26, y + 54, width - 36, height - 74, 'std');
    this.drawMenuText(title, x + 38, y + 66);
    this.drawSmallText(panel.description, x + 38, y + 80);
    this.ctx.fillStyle = '#d6c7a5';
    this.ctx.fillRect(x + 36, y + 88, width - 56, 1);

    const visibleEntries = panel.orderEntries.slice(panel.orderScrollOffset, panel.orderScrollOffset + 8);
    visibleEntries.forEach((entry, index) => {
      const absoluteIndex = panel.orderScrollOffset + index;
      const rowY = y + 102 + index * 18;
      if (absoluteIndex === panel.orderSelectedIndex) {
        this.drawCursor(x + 34, rowY - 2);
        this.ctx.fillStyle = 'rgba(255, 240, 180, 0.55)';
        this.ctx.fillRect(x + 48, rowY - 1, width - 72, 14);
      }

      this.drawSmallText(entry.displayNumber, x + 48, rowY);
      this.drawMenuText(entry.label, x + 78, rowY);
      if (entry.caught && this.pokedexCaughtMarker.complete && this.pokedexCaughtMarker.naturalWidth > 0) {
        this.ctx.drawImage(this.pokedexCaughtMarker, x + width - 92, rowY - 2, 8, 8);
      }
      if (entry.caught && entry.types.length > 0) {
        this.drawSmallText(
          entry.types.map((type) => type.toUpperCase()).join('/'),
          x + width - 78,
          rowY
        );
      }
    });
  }

  private drawPokedexCategoryPage(panel: PokedexPanelState, x: number, y: number, width: number, height: number): void {
    const categoryLabel = panel.categoryId ? panel.description : 'CATEGORY';
    this.drawWindowFrame(x + 24, y + 50, width - 32, height - 60, 'std');
    this.drawMenuText(categoryLabel, x + 36, y + 64);
    if (panel.categoryId) {
      this.drawSmallText(
        `PAGE ${panel.categoryPageIndex + 1} (${panel.categorySpecies.length}/4)`,
        x + width - 112,
        y + 64
      );
    }

    panel.categorySpecies.forEach((species, index) => {
      const slotX = x + 34 + (index % 2) * 142;
      const slotY = y + 82 + Math.floor(index / 2) * 88;
      const isSelected = index === panel.categoryCursorIndex;
      this.ctx.fillStyle = isSelected ? '#fff4cc' : '#fefefe';
      this.ctx.fillRect(slotX, slotY, 120, 70);
      this.ctx.strokeStyle = isSelected ? '#d48a24' : '#7a7a9a';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(slotX + 1, slotY + 1, 118, 68);
      if (isSelected) {
        this.drawCursor(slotX - 10, slotY + 18);
      }

      this.drawPokemonIcon(species, slotX + 8, slotY + 8, 32, 32);
      this.drawMenuText(species.replace(/_/gu, ' '), slotX + 44, slotY + 10);
      this.drawSmallText(
        `No. ${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`,
        slotX + 44,
        slotY + 26
      );
      this.drawSmallText(
        getDecompPokedexEntry(species)?.category ?? 'UNKNOWN',
        slotX + 44,
        slotY + 40
      );
    });
  }

  private drawPokedexEntryPage(panel: PokedexPanelState, x: number, y: number, width: number, height: number): void {
    const species = panel.entrySpecies ?? 'UNKNOWN';
    const entry = panel.entrySpecies ? getDecompPokedexEntry(panel.entrySpecies) : null;
    this.drawWindowFrame(x + 26, y + 54, width - 36, height - 66, 'std');
    this.drawMenuText(species.replace(/_/gu, ' '), x + 40, y + 68);
    this.drawSmallText(`No. ${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`, x + 40, y + 84);
    this.drawPokemonIcon(species, x + width - 112, y + 60, 56, 56);
    this.drawSmallText(`PAGE ${panel.entryPageIndex + 1}/2`, x + width - 76, y + 126);

    if (panel.entryPageIndex === 0) {
      this.drawSmallText(entry ? `${entry.category} POKeMON` : 'UNKNOWN POKeMON', x + 40, y + 104);
      this.drawSmallText(entry ? `HT  ${formatDexHeight(entry.heightDm)}` : 'HT  -----', x + 40, y + 126);
      this.drawSmallText(entry ? `WT  ${formatDexWeight(entry.weightHg)}` : 'WT  -----', x + 40, y + 140);
      const types = getDecompSpeciesInfo(species)?.types ?? [];
      if (types.length > 0) {
        this.drawSmallText(`TYPE ${types.map((type) => type.toUpperCase()).join('/')}`, x + 40, y + 154);
      }
      this.drawWindowFrame(x + 34, y + height - 84, width - 52, 64, 'message');
      this.drawTextLines(
        this.wrapMenuText('A: AREA  B: BACK  LEFT/RIGHT: PAGE', width - 68).slice(0, 2),
        x + 42,
        y + height - 72,
        12
      );
      return;
    }

    this.drawWindowFrame(x + 34, y + 102, width - 52, height - 132, 'message');
    this.drawTextLines(
      this.wrapMenuText(entry?.description ?? `${species.replace(/_/gu, ' ')} data page.`, width - 68).slice(0, 8),
      x + 42,
      y + 114,
      12
    );
  }

  private drawPokedexAreaPage(panel: PokedexPanelState, x: number, y: number, width: number, height: number): void {
    const species = panel.entrySpecies ?? 'UNKNOWN';
    this.drawWindowFrame(x + 20, y + 46, width - 28, height - 54, 'std');
    this.drawMenuText(`${species.replace(/_/gu, ' ')} AREA`, x + 32, y + 58);
    this.drawPokemonIcon(species, x + 34, y + 78, 40, 40);
    this.drawSmallText(`No. ${String(getNationalDexNumber(species) ?? 0).padStart(3, '0')}`, x + 34, y + 124);

    const mapX = x + 86;
    const mapY = y + 72;
    const scale = 2;
    this.ctx.fillStyle = '#eef2dd';
    this.ctx.fillRect(mapX, mapY, 244, 212);
    this.drawCompositePokedexMap(mapX, mapY, scale);

    if (panel.areaMarkers.length === 0) {
      this.drawWindowFrame(mapX + 54, mapY + 90, 120, 24, 'message');
      this.drawMenuText('AREA UNKNOWN', mapX + 72, mapY + 100);
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

    this.ctx.drawImage(
      image,
      baseX + sourceX * scale,
      baseY + sourceY * scale,
      width * scale,
      height * scale
    );
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

  private drawPartyScreen(panel: PartyPanelState): void {
    const x = 8;
    const y = 8;
    const width = this.canvas.width - 16;
    const height = this.canvas.height - 16;
    this.tileImage(this.partyBg, x, y, width, height);
    this.ctx.fillStyle = 'rgba(255,255,255,0.72)';
    this.ctx.fillRect(x, y, width, height);
    this.drawMenuText(panel.title, x + 10, y + 8);

    panel.members.forEach((member, index) => {
      const slotX = x + 12 + (index % 2) * ((width - 32) / 2);
      const slotY = y + 26 + Math.floor(index / 2) * 56;
      const slotW = (width - 40) / 2;
      const slotH = 46;
      const isSelected = index === panel.selectedIndex;
      const isSwitchSource = panel.mode === 'switch' && index === panel.switchingIndex;
      this.ctx.fillStyle = isSelected ? '#fff7cf' : '#f7fbff';
      this.ctx.fillRect(slotX, slotY, slotW, slotH);
      this.ctx.strokeStyle = isSelected ? '#f0b048' : isSwitchSource ? '#db6a6a' : '#6f85ba';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(slotX + 1, slotY + 1, slotW - 2, slotH - 2);
      if (isSelected) {
        this.drawCursor(slotX - 10, slotY + 14);
      }
      if (this.partyPokeball.complete && this.partyPokeball.naturalWidth > 0) {
        this.ctx.drawImage(this.partyPokeball, 0, member.hp > 0 ? 0 : 8, 8, 8, slotX + 6, slotY + 6, 12, 12);
      }
      this.drawMenuText(member.species, slotX + 22, slotY + 6);
      this.drawSmallText(`Lv${member.level}`, slotX + slotW - 28, slotY + 8);
      this.drawSmallText(`HP ${member.hp}/${member.maxHp}`, slotX + 22, slotY + 22);
      this.drawHpBar(slotX + 22, slotY + 34, slotW - 34, member.hp / Math.max(1, member.maxHp));
    });

    this.drawWindowFrame(x + 10, y + height - 42, width - 20, 30, 'message');
    this.drawTextLines(this.wrapMenuText(panel.description, width - 36).slice(0, 2), x + 18, y + height - 32, 12);

    if (panel.mode === 'actions') {
      const menuX = x + width - 94;
      const menuY = y + 22;
      this.drawWindowFrame(menuX, menuY, 84, 54, 'std');
      panel.actionRows.forEach((row, index) => {
        const rowY = menuY + 10 + index * 14;
        if (index === panel.actionIndex) {
          this.drawCursor(menuX + 4, rowY - 2);
        }
        this.drawMenuText(row, menuX + 18, rowY);
      });
    }

    if (panel.mode === 'summary') {
      const summaryX = x + 22;
      const summaryY = y + 34;
      const summaryW = width - 44;
      const summaryH = 92;
      this.drawWindowFrame(summaryX, summaryY, summaryW, summaryH, 'std');
      panel.summaryLines.forEach((line, index) => {
        this.drawMenuText(line, summaryX + 10, summaryY + 12 + index * 16);
      });
      this.drawSmallText(`PAGE ${panel.summaryPage + 1}/2`, summaryX + summaryW - 42, summaryY + summaryH - 12);
    }
  }

  private drawTrainerCardScreen(panel: PlayerSummaryPanelState, runtime: ScriptRuntimeState): void {
    const x = 18;
    const y = 16;
    const width = this.canvas.width - 36;
    const height = this.canvas.height - 32;
    this.ctx.fillStyle = '#e4edf8';
    this.ctx.fillRect(8, 8, this.canvas.width - 16, this.canvas.height - 16);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#6a91c3';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    if (this.trainerCardTiles.complete && this.trainerCardTiles.naturalWidth > 0) {
      this.ctx.drawImage(this.trainerCardTiles, x + width - 128, y, 128, 96);
    }

    const trainerId = Math.max(0, Math.trunc(runtime.vars.trainerId ?? 22796));
    const money = Math.max(0, Math.trunc(runtime.vars.money ?? 3000));
    const playTimeMinutes = Math.max(0, Math.floor((runtime.vars.playTimeSeconds ?? 0) / 60));
    const badgesCount = Math.max(0, Math.min(8, Math.trunc(runtime.vars.badges ?? 0)));
    const stars = Math.min(4, Math.floor(badgesCount / 2));
    const isFemale = Math.trunc(runtime.vars.playerGender ?? 0) === 1;
    const trainerSprite = isFemale ? this.trainerCardLeaf : this.trainerCardRed;

    this.drawMenuText(`${panel.title}'s TRAINER CARD`, x + 12, y + 12);
    this.drawSmallText(panel.description, x + 12, y + 28);

    if (panel.pageIndex === 0) {
      this.drawSmallText('NAME', x + 16, y + 54);
      this.drawMenuText(panel.title, x + 64, y + 52);
      this.drawSmallText('IDNo.', x + 16, y + 72);
      this.drawMenuText(trainerId.toString().padStart(5, '0'), x + 64, y + 70);
      this.drawSmallText('MONEY', x + 16, y + 90);
      this.drawMenuText(`$${money}`, x + 64, y + 88);
      this.drawSmallText('POKeDEX', x + 16, y + 108);
      this.drawMenuText(String(runtime.pokedex.caughtSpecies.length).padStart(3, '0'), x + 78, y + 106);
      this.drawSmallText('TIME', x + 16, y + 126);
      this.drawMenuText(`${Math.floor(playTimeMinutes / 60)}:${(playTimeMinutes % 60).toString().padStart(2, '0')}`, x + 64, y + 124);

      if (trainerSprite.complete && trainerSprite.naturalWidth > 0) {
        this.ctx.drawImage(trainerSprite, x + width - 108, y + 18, 80, 80);
      }

      if (this.trainerCardBadges.complete && this.trainerCardBadges.naturalWidth > 0) {
        for (let i = 0; i < 8; i += 1) {
          const sourceX = i * 8;
          const dx = x + 14 + i * 18;
          const dy = y + height - 28;
          this.ctx.globalAlpha = i < badgesCount ? 1 : 0.35;
          this.ctx.drawImage(this.trainerCardBadges, sourceX, 0, 8, 8, dx, dy, 12, 12);
          this.ctx.globalAlpha = 1;
        }
      }

      for (let i = 0; i < stars; i += 1) {
        this.ctx.fillStyle = '#f6c94d';
        this.ctx.fillRect(x + width - 20 - i * 10, y + height - 28, 6, 6);
      }
    } else {
      this.drawWindowFrame(x + 12, y + 50, width - 24, height - 66, 'message');
      const backLines = [
        `PROFILE`,
        ...panel.profileLines,
        `SAVES   ${runtime.saveCounter}`,
        `SEEN    ${runtime.pokedex.seenSpecies.length}`,
        `CAUGHT  ${runtime.pokedex.caughtSpecies.length}`
      ];
      backLines.forEach((row, index) => {
        this.drawMenuText(row, x + 22, y + 62 + index * 16);
      });
    }

    this.drawSmallText(panel.pageIndex === 0 ? 'FRONT' : 'BACK', x + width - 46, y + height - 22);
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

    this.drawWindowFrame(x + 10, y + height - 42, width - 20, 28, 'message');
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

    this.drawWindowFrame(x + 14, y + height - 58, width - 28, 42, 'message');
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
    const x = 8;
    const y = 8;
    const width = this.canvas.width - 16;
    const height = this.canvas.height - 16;
    this.ctx.fillStyle = '#c9e9db';
    this.ctx.fillRect(x, y, width, height);

    const artX = x + 10;
    const artY = y + 12;
    if (this.bagSprite.complete && this.bagSprite.naturalWidth > 0) {
      this.ctx.drawImage(this.bagSprite, artX, artY, 120, 160);
    }

    this.drawWindowFrame(x + 14, y + 12, 112, 22, 'std');
    this.drawSmallText(getBagPocketLabel(bag.selectedPocket), x + 24, y + 20);

    const selectedEntry = getBagVisibleRows(bag).find((row) => row.isSelected);
    const selectedIconKey = selectedEntry?.iconKey ?? null;
    if (selectedIconKey) {
      const selectedIcon = this.itemIcons.get(selectedIconKey);
      if (selectedIcon?.complete && selectedIcon.naturalWidth > 0) {
        this.ctx.drawImage(selectedIcon, x + 90, y + 134, 24, 24);
      }
    }

    const listX = x + 144;
    const listY = y + 12;
    const listW = width - 156;
    const listH = 116;
    this.drawWindowFrame(listX, listY, listW, listH, 'std');
    const rows = getBagVisibleRows(bag);
    rows.forEach((row, index) => {
      const rowTop = listY + 10 + index * 16;
      if (row.isSelected) {
        this.drawCursor(listX + 6, rowTop - 2);
      }

      if (row.iconKey) {
        const icon = this.itemIcons.get(row.iconKey);
        if (icon?.complete && icon.naturalWidth > 0) {
          this.ctx.drawImage(icon, listX + 18, rowTop - 1, 14, 14);
        }
      }

      this.drawMenuText(row.label, listX + 38, rowTop);
      if (row.isRegistered) {
        this.drawSmallText('SELECT', listX + listW - 50, rowTop + 1);
      } else if (row.quantity !== null) {
        this.drawSmallText(`x${row.quantity}`, listX + listW - 34, rowTop + 1);
      }
    });

    const descX = x + 10;
    const descY = y + height - 54;
    const descW = width - 20;
    this.drawWindowFrame(descX, descY, descW, 40, 'message');
    const description = panel.message?.text ?? getBagDescription(bag);
    this.drawTextLines(this.wrapMenuText(description, descW - 18).slice(0, 2), descX + 8, descY + 10, 12);

    if (panel.contextMenu) {
      const contextMenu = panel.contextMenu;
      const submenuW = 114;
      const submenuH = 22 + contextMenu.actions.length * 14;
      const submenuX = x + width - submenuW - 10;
      const submenuY = y + 136;
      this.drawWindowFrame(submenuX, submenuY, submenuW, submenuH, 'std');
      this.drawSmallText(getItemDefinition(contextMenu.itemId).name, submenuX + 8, submenuY + 8);
      contextMenu.actions.forEach((action, index) => {
        const actionY = submenuY + 22 + index * 14;
        if (index === contextMenu.selectedIndex) {
          this.drawCursor(submenuX + 6, actionY - 2);
        }
        this.drawMenuText(this.getBagActionLabel(action), submenuX + 20, actionY);
      });
    } else if (panel.quantityPrompt) {
      const submenuX = x + width - 122;
      const submenuY = y + 138;
      this.drawWindowFrame(submenuX, submenuY, 112, 38, 'std');
      this.drawSmallText('TOSS HOW MANY?', submenuX + 8, submenuY + 8);
      this.drawCursor(submenuX + 8, submenuY + 20);
      this.drawMenuText(`x${panel.quantityPrompt.quantity.toString().padStart(3, '0')}`, submenuX + 22, submenuY + 20);
    } else if (panel.confirmationPrompt) {
      const confirmationPrompt = panel.confirmationPrompt;
      const submenuX = x + width - 94;
      const submenuY = y + 136;
      this.drawWindowFrame(submenuX, submenuY, 84, 52, 'std');
      this.drawSmallText(`TOSS ${confirmationPrompt.quantity}?`, submenuX + 8, submenuY + 8);
      ['YES', 'NO'].forEach((choice, index) => {
        const choiceY = submenuY + 22 + index * 14;
        if (index === confirmationPrompt.selectedIndex) {
          this.drawCursor(submenuX + 6, choiceY - 2);
        }
        this.drawMenuText(choice, submenuX + 20, choiceY);
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
      this.drawNineSlice(frame, x, y, width, height, WINDOW_SLICE);
      return;
    }

    this.ctx.fillStyle = '#f8f8f8';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#7c8bbc';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  private drawNineSlice(
    image: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    slice: number
  ): void {
    const sw = image.naturalWidth;
    const sh = image.naturalHeight;
    const centerSw = sw - slice * 2;
    const centerSh = sh - slice * 2;
    const centerDw = dw - slice * 2;
    const centerDh = dh - slice * 2;

    this.ctx.drawImage(image, 0, 0, slice, slice, dx, dy, slice, slice);
    this.ctx.drawImage(image, slice, 0, centerSw, slice, dx + slice, dy, centerDw, slice);
    this.ctx.drawImage(image, sw - slice, 0, slice, slice, dx + dw - slice, dy, slice, slice);
    this.ctx.drawImage(image, 0, slice, slice, centerSh, dx, dy + slice, slice, centerDh);
    this.ctx.drawImage(image, slice, slice, centerSw, centerSh, dx + slice, dy + slice, centerDw, centerDh);
    this.ctx.drawImage(image, sw - slice, slice, slice, centerSh, dx + dw - slice, dy + slice, slice, centerDh);
    this.ctx.drawImage(image, 0, sh - slice, slice, slice, dx, dy + dh - slice, slice, slice);
    this.ctx.drawImage(image, slice, sh - slice, centerSw, slice, dx + slice, dy + dh - slice, centerDw, slice);
    this.ctx.drawImage(image, sw - slice, sh - slice, slice, slice, dx + dw - slice, dy + dh - slice, slice, slice);
  }

  private drawCursor(x: number, y: number): void {
    if (this.menuCursor.complete && this.menuCursor.naturalWidth > 0) {
      this.ctx.drawImage(this.menuCursor, x, y, 12, 12);
      return;
    }

    this.ctx.fillStyle = '#e65918';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 10, y + 5);
    this.ctx.lineTo(x, y + 10);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawMenuText(text: string, x: number, y: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = '#20305f';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  private drawTextLines(lines: string[], x: number, y: number, lineHeight: number): void {
    lines.forEach((line, index) => {
      this.drawMenuText(line, x, y + index * lineHeight);
    });
  }

  private drawSmallText(text: string, x: number, y: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 8px "Trebuchet MS", sans-serif';
    this.ctx.fillStyle = '#20305f';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  private getBagActionLabel(action: BagContextActionId): string {
    return action;
  }

  private measureMenuText(text: string): number {
    this.ctx.save();
    this.ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    const width = this.ctx.measureText(text).width;
    this.ctx.restore();
    return width;
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

  private tileImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    if (!(image.complete && image.naturalWidth > 0)) {
      this.ctx.fillStyle = '#dfeaf7';
      this.ctx.fillRect(x, y, width, height);
      return;
    }

    for (let drawY = y; drawY < y + height; drawY += image.naturalHeight) {
      for (let drawX = x; drawX < x + width; drawX += image.naturalWidth) {
        const tileW = Math.min(image.naturalWidth, x + width - drawX);
        const tileH = Math.min(image.naturalHeight, y + height - drawY);
        this.ctx.drawImage(image, 0, 0, tileW, tileH, drawX, drawY, tileW, tileH);
      }
    }
  }

  private tileImageVertical(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    if (!(image.complete && image.naturalWidth > 0)) {
      this.ctx.fillStyle = '#d7c59b';
      this.ctx.fillRect(x, y, width, height);
      return;
    }

    for (let drawY = y; drawY < y + height; drawY += image.naturalHeight) {
      const tileH = Math.min(image.naturalHeight, y + height - drawY);
      this.ctx.drawImage(image, 0, 0, Math.min(width, image.naturalWidth), tileH, x, drawY, width, tileH);
    }
  }

  private drawHpBar(x: number, y: number, width: number, ratio: number): void {
    this.ctx.fillStyle = '#31484f';
    this.ctx.fillRect(x, y, width, 5);
    const fillWidth = Math.max(0, Math.floor((width - 2) * Math.min(1, Math.max(0, ratio))));
    this.ctx.fillStyle = ratio > 0.5 ? '#58b838' : ratio > 0.2 ? '#d8c628' : '#d84c34';
    this.ctx.fillRect(x + 1, y + 1, fillWidth, 3);
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
