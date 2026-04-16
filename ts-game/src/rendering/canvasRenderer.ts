import type { CameraState } from '../core/camera';
import type { NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { TileMap } from '../world/tileMap';
import { DecompTextureStore } from './decompTextureStore';

const PLAYER_SIZE = 14;
const PLAYER_GRAPHICS_ID = 'OBJ_EVENT_GFX_RED_NORMAL';

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly textureStore: DecompTextureStore;

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

  render(map: TileMap, player: PlayerState, npcs: NpcState[], camera: CameraState): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.textureStore.ensureMapTextures(map);

    const tileSize = map.tileSize;
    const startX = Math.floor(camera.x / tileSize);
    const startY = Math.floor(camera.y / tileSize);
    const endX = Math.min(map.width, startX + Math.ceil(camera.viewportWidth / tileSize) + 1);
    const endY = Math.min(map.height, startY + Math.ceil(camera.viewportHeight / tileSize) + 1);

    if (!this.textureStore.drawMapBase(ctx, map, camera, startX, startY, endX, endY)) {
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const idx = y * map.width + x;
          const walkable = map.walkable[idx];

          ctx.fillStyle = walkable ? '#4e9a51' : '#355c37';
          if (!walkable && y > 7 && x > 11) {
            ctx.fillStyle = '#2f6db0';
          }

          ctx.fillRect(
            x * tileSize - camera.x,
            y * tileSize - camera.y,
            tileSize,
            tileSize
          );
        }
      }
    }

    for (const trigger of map.triggers) {
      const tx = trigger.x * tileSize - camera.x;
      const ty = trigger.y * tileSize - camera.y;
      this.ctx.fillStyle = trigger.activation === 'interact' ? '#f4e66a' : '#8cd3ff';
      this.ctx.fillRect(tx + 5, ty + 5, 6, 6);
    }

    this.drawEntities(player, npcs, camera);
    this.textureStore.drawMapCover(ctx, map, camera, startX, startY, endX, endY);
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
