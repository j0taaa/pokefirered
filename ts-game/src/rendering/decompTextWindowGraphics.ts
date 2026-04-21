export const USER_WINDOW_GRAPHICS_COUNT = 10;

export const getUserWindowGraphicsIndex = (idx: number): number => {
  if (!Number.isInteger(idx) || idx < 0 || idx >= USER_WINDOW_GRAPHICS_COUNT) {
    return 0;
  }

  return idx;
};
