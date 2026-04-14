export type UpdateFn = (dtSeconds: number) => void;
export type RenderFn = (alpha: number) => void;

interface GameLoopDeps {
  update: UpdateFn;
  render: RenderFn;
  fixedStep?: number;
}

export class GameLoop {
  private readonly update: UpdateFn;
  private readonly render: RenderFn;
  private readonly fixedStep: number;
  private accumulator = 0;
  private lastTs = 0;
  private rafId: number | null = null;

  constructor({ update, render, fixedStep = 1 / 60 }: GameLoopDeps) {
    this.update = update;
    this.render = render;
    this.fixedStep = fixedStep;
  }

  start = (): void => {
    if (this.rafId !== null) {
      return;
    }

    this.lastTs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  };

  stop = (): void => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  private tick = (ts: number): void => {
    const dtMs = Math.min(ts - this.lastTs, 100);
    this.lastTs = ts;
    this.accumulator += dtMs / 1000;

    while (this.accumulator >= this.fixedStep) {
      this.update(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    this.render(this.accumulator / this.fixedStep);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
