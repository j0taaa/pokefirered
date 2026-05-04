export type TitleScreenStage =
  | 'title'
  | 'intro'
  | 'newGame'
  | 'continue'
  | 'options'
  | 'credits';

export interface TitleScreenState {
  stage: TitleScreenStage;
  selectedIndex: number;
  hasSaveData: boolean;
  introTimer: number;
  creditsScrollY: number;
  creditsSpeed: number;
}

export const INTRO_DURATION_FRAMES = 300;
export const CREDITS_LINE_HEIGHT = 16;
export const CREDITS_SCROLL_SPEED = 1;

export const createTitleScreenState = (hasSaveData: boolean): TitleScreenState => ({
  stage: 'title',
  selectedIndex: hasSaveData ? 0 : 1,
  hasSaveData,
  introTimer: 0,
  creditsScrollY: 0,
  creditsSpeed: CREDITS_SCROLL_SPEED
});

export const TITLE_MENU_OPTIONS_HAS_SAVE = ['CONTINUE', 'NEW GAME', 'OPTION'] as const;
export const TITLE_MENU_OPTIONS_NO_SAVE = ['NEW GAME', 'OPTION'] as const;

export const getTitleMenuOptions = (state: TitleScreenState): readonly string[] =>
  state.hasSaveData ? TITLE_MENU_OPTIONS_HAS_SAVE : TITLE_MENU_OPTIONS_NO_SAVE;

export const stepTitleScreen = (
  state: TitleScreenState,
  input: { upPressed: boolean; downPressed: boolean; interactPressed: boolean; startPressed: boolean; cancelPressed: boolean }
): TitleScreenStage | null => {
  switch (state.stage) {
    case 'title': {
      if (input.startPressed || input.interactPressed) {
        const options = getTitleMenuOptions(state);
        const selected = options[state.selectedIndex];
        if (selected === 'CONTINUE') {
          state.stage = 'continue';
          return 'continue';
        }
        if (selected === 'NEW GAME') {
          state.stage = 'newGame';
          return 'newGame';
        }
        if (selected === 'OPTION') {
          state.stage = 'options';
          return 'options';
        }
      }

      if (input.upPressed) {
        const options = getTitleMenuOptions(state);
        state.selectedIndex = (state.selectedIndex - 1 + options.length) % options.length;
      }
      if (input.downPressed) {
        const options = getTitleMenuOptions(state);
        state.selectedIndex = (state.selectedIndex + 1) % options.length;
      }
      return null;
    }

    case 'intro': {
      state.introTimer += 1;
      if (state.introTimer >= INTRO_DURATION_FRAMES || input.interactPressed || input.startPressed) {
        state.stage = 'title';
        return 'title';
      }
      return null;
    }

    case 'credits': {
      state.creditsScrollY += state.creditsSpeed;
      if (input.interactPressed || input.startPressed || input.cancelPressed) {
        state.stage = 'title';
        return 'title';
      }
      return null;
    }

    default:
      return null;
  }
};

export const startIntro = (state: TitleScreenState): void => {
  state.stage = 'intro';
  state.introTimer = 0;
};

export const startCredits = (state: TitleScreenState): void => {
  state.stage = 'credits';
  state.creditsScrollY = 0;
};

export const returnToTitle = (state: TitleScreenState): void => {
  state.stage = 'title';
  state.selectedIndex = state.hasSaveData ? 0 : 0;
};