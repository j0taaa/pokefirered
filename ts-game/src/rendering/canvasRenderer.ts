import type { PlayerState } from '../game/player';
import type { TileMap } from '../world/tileMap';

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to create 2D canvas context');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  render(map: TileMap, player: PlayerState): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const idx = y * map.width + x;
        const walkable = map.walkable[idx];

        ctx.fillStyle = walkable ? '#4e9a51' : '#355c37';

        if (!walkable && y > 7 && x > 11) {
          ctx.fillStyle = '#2f6db0';
        }

        ctx.fillRect(x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize);
      }
    }

    ctx.fillStyle = '#ffe37f';
    ctx.fillRect(player.position.x, player.position.y, 14, 14);

    ctx.fillStyle = '#1b2234';
    switch (player.facing) {
      case 'up':
        ctx.fillRect(player.position.x + 4, player.position.y + 1, 6, 3);
        break;
      case 'down':
        ctx.fillRect(player.position.x + 4, player.position.y + 10, 6, 3);
        break;
      case 'left':
        ctx.fillRect(player.position.x + 1, player.position.y + 4, 3, 6);
        break;
      case 'right':
        ctx.fillRect(player.position.x + 10, player.position.y + 4, 3, 6);
        break;
    }
  }
}
