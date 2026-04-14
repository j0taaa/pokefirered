export interface InputSnapshot {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  interact: boolean;
  interactPressed: boolean;
}

const defaultSnapshot: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false,
  interact: false,
  interactPressed: false
};

const keyMap: Record<string, keyof Omit<InputSnapshot, 'interactPressed'>> = {
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
  Enter: 'interact'
};

export class BrowserInputAdapter {
  private readonly pressed = new Set<string>();
  private interactHeldLastFrame = false;

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

    snapshot.interactPressed = snapshot.interact && !this.interactHeldLastFrame;
    this.interactHeldLastFrame = snapshot.interact;
    return snapshot;
  }
}
