export interface InputSnapshot {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  upPressed: boolean;
  downPressed: boolean;
  leftPressed: boolean;
  rightPressed: boolean;
  run: boolean;
  interact: boolean;
  interactPressed: boolean;
  start: boolean;
  startPressed: boolean;
  cancel: boolean;
  cancelPressed: boolean;
}

const defaultSnapshot: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

const keyMap: Record<string, keyof Omit<InputSnapshot, 'upPressed' | 'downPressed' | 'leftPressed' | 'rightPressed' | 'interactPressed' | 'startPressed' | 'cancelPressed'>> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  KeyZ: 'interact',
  Enter: 'interact',
  Escape: 'start',
  KeyX: 'cancel',
  Backspace: 'cancel'
};

export class BrowserInputAdapter {
  private readonly pressed = new Set<string>();
  private heldLastFrame: Partial<Record<keyof InputSnapshot, boolean>> = {};

  private readonly onKeyDown = (evt: KeyboardEvent): void => {
    if (evt.code in keyMap) {
      this.pressed.add(evt.code);
      evt.preventDefault();
    }
  };

  private readonly onKeyUp = (evt: KeyboardEvent): void => {
    if (evt.code in keyMap) {
      this.pressed.delete(evt.code);
      evt.preventDefault();
    }
  };

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  readSnapshot(): InputSnapshot {
    const snapshot = { ...defaultSnapshot };

    for (const code of this.pressed) {
      const mapped = keyMap[code];
      snapshot[mapped] = true;
    }

    snapshot.upPressed = snapshot.up && !this.heldLastFrame.up;
    snapshot.downPressed = snapshot.down && !this.heldLastFrame.down;
    snapshot.leftPressed = snapshot.left && !this.heldLastFrame.left;
    snapshot.rightPressed = snapshot.right && !this.heldLastFrame.right;
    snapshot.interactPressed = snapshot.interact && !this.heldLastFrame.interact;
    snapshot.startPressed = snapshot.start && !this.heldLastFrame.start;
    snapshot.cancelPressed = snapshot.cancel && !this.heldLastFrame.cancel;

    this.heldLastFrame = {
      up: snapshot.up,
      down: snapshot.down,
      left: snapshot.left,
      right: snapshot.right,
      interact: snapshot.interact,
      start: snapshot.start,
      cancel: snapshot.cancel
    };

    return snapshot;
  }
}
