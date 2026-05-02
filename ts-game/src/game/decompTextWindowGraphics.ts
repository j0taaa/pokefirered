export const gSignpostWindow_Gfx = 'graphics/text_window/signpost.4bpp' as const;
export const gStdTextWindow_Gfx = 'graphics/text_window/std.4bpp' as const;
export const gQuestLogWindow_Gfx = 'graphics/text_window/quest_log.4bpp' as const;

const makeFrame = (idx: number): { tiles: string; palette: string } => ({
  tiles: `graphics/text_window/type${idx}.4bpp`,
  palette: `graphics/text_window/type${idx}.gbapal`
});

export const gTextWindowPalettes = [
  'graphics/text_window/stdpal_0.gbapal',
  'graphics/text_window/stdpal_1.gbapal',
  'graphics/text_window/stdpal_2.gbapal',
  'graphics/text_window/stdpal_3.gbapal',
  'graphics/text_window/stdpal_4.gbapal'
] as const;

export const gUserFrames = [
  makeFrame(1),
  makeFrame(2),
  makeFrame(3),
  makeFrame(4),
  makeFrame(5),
  makeFrame(6),
  makeFrame(7),
  makeFrame(8),
  makeFrame(9),
  makeFrame(10)
] as const;

export const GetUserWindowGraphics = (idx: number): typeof gUserFrames[number] | undefined => {
  if (!Number.isInteger(idx) || idx < 0 || idx >= 20) {
    return gUserFrames[0];
  }
  return gUserFrames[idx];
};
