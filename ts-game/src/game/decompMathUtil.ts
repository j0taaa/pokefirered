export function Q_8_8_mul(x: number, y: number): number { return Math.trunc((x * y) / 256); }

export function Q_N_S_mul(s: number, x: number, y: number): number { return Math.trunc((x * y) / (1 << s)); }

export function Q_24_8_mul(x: number, y: number): number { return Math.trunc((x * y) / 256); }

export function Q_8_8_div(x: number, y: number): number {
  if (y === 0) {
    return 0;
  }

  return Math.trunc((x * 256) / y);
}

export function Q_N_S_div(s: number, x: number, y: number): number {
  if (y === 0) {
    return 0;
  }

  return Math.trunc((x * (1 << s)) / y);
}

export function Q_24_8_div(x: number, y: number): number {
  if (y === 0) {
    return 0;
  }

  return Math.trunc((x * 256) / y);
}

export function Q_8_8_inv(y: number): number { return Math.trunc(0x10000 / y); }

export function Q_N_S_inv(s: number, y: number): number { return Math.trunc((0x100 << s) / y); }

export function Q_24_8_inv(y: number): number { return Math.trunc(0x10000 / y); }
