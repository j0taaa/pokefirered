import type { GameRuntimeState, GameSession } from '../core/gameSession';
import { getBattleBagChoices, type BattleCommand } from '../game/battle';
import { determineTextApiMode } from './stateObserver';
import type { TextApiAction, TextApiMode, TextApiOption } from './textApiTypes';

type Direction = 'north' | 'south' | 'west' | 'east';

type VersionedGameSession = GameSession & { readonly version?: number };

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])(a|b|start|select|up|down|left|right|button|key)(?=$|[^a-z0-9])/iu;

const DIRECTION_LABELS: Record<Direction, string> = {
  north: 'north',
  south: 'south',
  west: 'west',
  east: 'east'
};

const safePublicText = (value: string, fallback: string): string => {
  const normalized = value.replace(/\s+/gu, ' ').trim();
  if (!normalized || RAW_CONTROL_PATTERN.test(normalized)) {
    return fallback;
  }
  return normalized;
};

const lowerStable = (value: string): string =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '') || 'option';

const versionOf = (session: GameSession): number => (session as VersionedGameSession).version ?? 0;

const commandLabel = (command: BattleCommand): string => {
  switch (command) {
    case 'fight':
      return 'Fight';
    case 'bag':
      return 'Open Bag';
    case 'pokemon':
      return 'Open Pokémon party';
    case 'run':
      return 'Try to flee';
    case 'safariBall':
      return 'Throw Safari Ball';
    case 'safariBait':
      return 'Throw bait';
    case 'safariRock':
      return 'Throw rock';
  }
};

const commandDescription = (command: BattleCommand): string => {
  switch (command) {
    case 'fight':
      return 'Choose one of your Pokémon moves.';
    case 'bag':
      return 'Choose battle-usable inventory from the Bag.';
    case 'pokemon':
      return 'Review the party and choose Pokémon.';
    case 'run':
      return 'Attempt to leave this battle.';
    case 'safariBall':
      return 'Use one Safari Ball to try catching the wild Pokémon.';
    case 'safariBait':
      return 'Offer bait to affect the wild Pokémon.';
    case 'safariRock':
      return 'Throw one rock to affect the wild Pokémon.';
  }
};

const battleCommandActionType = (command: BattleCommand): string => {
  switch (command) {
    case 'run':
      return 'flee';
    case 'safariBall':
      return 'safariBall';
    case 'safariBait':
      return 'safariBait';
    case 'safariRock':
      return 'safariRock';
    default:
      return command;
  }
};

const optionId = (version: number, mode: TextApiMode, parts: readonly string[]): string =>
  [`v${version}`, mode, ...parts.map(lowerStable)].join(':');

const makeOption = ({
  version,
  mode,
  idParts,
  label,
  description,
  category,
  enabled = true,
  disabledReason,
  action
}: {
  readonly version: number;
  readonly mode: TextApiMode;
  readonly idParts: readonly string[];
  readonly label: string;
  readonly description: string;
  readonly category: string;
  readonly enabled?: boolean;
  readonly disabledReason?: string;
  readonly action: TextApiAction;
}): TextApiOption => ({
  id: optionId(version, mode, idParts),
  label,
  description,
  category,
  enabled,
  ...(enabled ? {} : { disabledReason: disabledReason ?? 'This option is not available right now.' }),
  action
});

const indexedRows = (rows: readonly string[] | undefined): readonly string[] => rows ?? [];

export class ActionEnumerator {
  enumerate(session: GameSession): TextApiOption[] {
    const state = session.getRuntimeState();
    const mode = determineTextApiMode(state);
    const version = versionOf(session);

    switch (mode) {
      case 'overworld':
        return this.enumerateOverworld(version, mode);
      case 'dialogue':
        return this.enumerateDialogue(state, version, mode);
      case 'menu':
        return this.enumerateMenu(state, version, mode);
      case 'battle':
        return this.enumerateBattle(state, version, mode);
      case 'transition':
        return [this.waitOption(version, mode, 'Transition animation is in progress.')];
      case 'fieldAction':
        return [
          this.waitOption(version, mode, 'Let the field action continue.'),
          makeOption({
            version,
            mode,
            idParts: ['cancel'],
            label: 'Cancel field action',
            description: 'Try to stop the current field action.',
            category: 'fieldAction',
            action: { type: 'cancel' }
          })
        ];
      case 'trainerSee':
        return [this.waitOption(version, mode, 'Trainer encounter is starting.')];
      case 'script':
        return [this.waitOption(version, mode, 'Game input is locked by running script logic.')];
      case 'saveLoad':
        return this.enumerateSaveLoad(state, version, mode);
      case 'resolvedBattle':
        return [
          makeOption({
            version,
            mode,
            idParts: ['continue'],
            label: 'Continue',
            description: 'Leave the completed battle result and return to the game.',
            category: 'battle',
            action: { type: 'continue' }
          })
        ];
    }
  }

  private enumerateOverworld(version: number, mode: TextApiMode): TextApiOption[] {
    const movement = (['north', 'south', 'west', 'east'] as const).map((direction) => makeOption({
      version,
      mode,
      idParts: ['move', direction],
      label: `Walk ${DIRECTION_LABELS[direction]}`,
      description: `Face ${DIRECTION_LABELS[direction]} and try to move one step.`,
      category: 'movement',
      action: { type: 'move', target: direction }
    }));

    return [
      ...movement,
      makeOption({
        version,
        mode,
        idParts: ['interact'],
        label: 'Interact with what is ahead',
        description: 'Talk with someone or inspect the object in front of you.',
        category: 'interaction',
        action: { type: 'interact' }
      }),
      makeOption({
        version,
        mode,
        idParts: ['menu', 'open'],
        label: 'Open main menu',
        description: 'Open the game menu for party, Bag, save, and options.',
        category: 'menu',
        action: { type: 'openMenu' }
      })
    ];
  }

  private enumerateDialogue(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const choice = state.dialogue.choice;
    if (choice && choice.options.length > 0) {
      const options = choice.options.map((rawLabel, index) => {
        const safeLabel = safePublicText(rawLabel, `choice ${index + 1}`);
        return makeOption({
          version,
          mode,
          idParts: ['choice', `${index}`, safeLabel],
          label: `Choose ${safeLabel}`,
          description: `Choose dialogue choice ${index + 1}.`,
          category: 'dialogue',
          action: { type: 'choose', target: 'dialogue', value: index }
        });
      });

      if (!choice.ignoreCancel) {
        options.push(makeOption({
          version,
          mode,
          idParts: ['choice', 'cancel'],
          label: 'Go back',
          description: 'Leave this choice without choosing one listed answer.',
          category: 'dialogue',
          action: { type: 'back', target: 'dialogue' }
        }));
      }

      return options;
    }

    return [
      makeOption({
        version,
        mode,
        idParts: ['continue'],
        label: 'Continue dialogue',
        description: 'Advance to the next line or close this message.',
        category: 'dialogue',
        action: { type: 'continue' }
      })
    ];
  }

  private enumerateMenu(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const panel = state.startMenu.panel;
    if (!panel) {
      return [
        ...state.startMenu.options.map((entry, index) => {
          const safeLabel = safePublicText(entry.label, `menu item ${index + 1}`);
          return makeOption({
            version,
            mode,
            idParts: ['menu', `${index}`, entry.id],
            label: `Choose ${safeLabel}`,
            description: `Open or activate ${safeLabel}.`,
            category: 'menu',
            action: { type: 'choose', target: 'menu', value: index }
          });
        }),
        makeOption({
          version,
          mode,
          idParts: ['menu', 'back'],
          label: 'Close menu',
          description: 'Return to the field.',
          category: 'menu',
          action: { type: 'back', target: 'menu' }
        })
      ];
    }

    if (panel.kind === 'save') {
      return this.enumerateSaveLoad(state, version, 'saveLoad');
    }

    const rows = 'rows' in panel ? indexedRows(panel.rows) : [];
    const rowOptions = rows.map((rawRow, index) => {
      const safeLabel = safePublicText(rawRow, `menu row ${index + 1}`);
      return makeOption({
        version,
        mode,
        idParts: ['panel', panel.kind, `${index}`],
        label: `Choose ${safeLabel}`,
        description: `Choose row ${index + 1} in ${safePublicText(panel.title, 'this panel')}.`,
        category: 'menu',
        action: { type: 'choose', target: 'panel', value: index }
      });
    });

    return [
      ...rowOptions,
      makeOption({
        version,
        mode,
        idParts: ['panel', panel.kind, 'back'],
        label: 'Go back',
        description: 'Return to the previous menu.',
        category: 'menu',
        action: { type: 'back', target: 'panel' }
      })
    ];
  }

  private enumerateBattle(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const battle = state.battle;
    const inCommandPhase = battle.phase === 'command';
    const commands = battle.commands.length > 0 ? battle.commands : (['fight', 'bag', 'pokemon', 'run'] as BattleCommand[]);

    return commands.map((command, index) => {
      let enabled = inCommandPhase;
      let disabledReason = inCommandPhase ? undefined : 'Battle commands are unavailable while the battle is resolving.';
      if (enabled && command === 'bag' && !getBattleBagChoices(battle, state.scriptRuntime.bag).some((choice) => !choice.isExit)) {
        enabled = false;
        disabledReason = 'No battle-usable items are available.';
      }
      const party = battle.party ?? battle.playerSide.party ?? [];
      if (enabled && command === 'pokemon' && party.filter((pokemon) => pokemon.hp > 0).length <= 1) {
        enabled = false;
        disabledReason = 'No other able Pokémon can switch in.';
      }
      if (enabled && command === 'run' && (battle.mode === 'trainer' || battle.battleTypeFlags.includes('trainer'))) {
        enabled = false;
        disabledReason = 'You cannot flee trainer battles.';
      }

      return makeOption({
        version,
        mode,
        idParts: ['battle', `${index}`, battleCommandActionType(command)],
        label: commandLabel(command),
        description: commandDescription(command),
        category: 'battle',
        enabled,
        disabledReason,
        action: { type: battleCommandActionType(command), target: 'battleCommand', value: index }
      });
    });
  }

  private enumerateSaveLoad(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const panel = state.startMenu.panel?.kind === 'save' ? state.startMenu.panel : null;
    const resultStage = panel?.stage === 'result';
    if (resultStage) {
      return [
        makeOption({
          version,
          mode,
          idParts: ['save', 'continue'],
          label: 'Continue',
          description: 'Close the save result message.',
          category: 'saveLoad',
          action: { type: 'continue', target: 'saveLoad' }
        })
      ];
    }

    return [
      makeOption({
        version,
        mode,
        idParts: ['save', 'confirm'],
        label: 'Confirm save',
        description: 'Confirm the current save prompt.',
        category: 'saveLoad',
        action: { type: 'confirm', target: 'saveLoad' }
      }),
      makeOption({
        version,
        mode,
        idParts: ['save', 'cancel'],
        label: 'Cancel save',
        description: 'Leave the save prompt without saving.',
        category: 'saveLoad',
        action: { type: 'cancel', target: 'saveLoad' }
      })
    ];
  }

  private waitOption(version: number, mode: TextApiMode, description: string): TextApiOption {
    return makeOption({
      version,
      mode,
      idParts: ['wait'],
      label: 'Wait',
      description,
      category: 'system',
      action: { type: 'wait' }
    });
  }
}
