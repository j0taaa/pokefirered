import type { PlayerState } from './player';

export type MovementActionKind =
  | 'none'
  | 'face'
  | 'step'
  | 'jump'
  | 'jumpInPlace'
  | 'delay'
  | 'visibility'
  | 'facingLock'
  | 'animation'
  | 'emote'
  | 'fixedPriority'
  | 'affine';

export interface DecompMovementAction {
  command: string;
  actionId: number;
  kind: MovementActionKind;
  direction?: PlayerState['facing'];
  distanceTiles?: number;
  durationFrames?: number;
  visible?: boolean;
  locked?: boolean;
  animationDisabled?: boolean;
  fixedPriority?: boolean;
  emote?: 'exclamation' | 'question' | 'x' | 'doubleExclamation' | 'smile';
}

const DIR_INDEX: Record<PlayerState['facing'], number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3
};

const directionFromCommand = (command: string): PlayerState['facing'] | undefined => {
  if (command.endsWith('_down_fast')) return 'down';
  if (command.endsWith('_up_fast')) return 'up';
  if (command.endsWith('_left_fast')) return 'left';
  if (command.endsWith('_right_fast')) return 'right';
  if (command.endsWith('_down')) return 'down';
  if (command.endsWith('_up')) return 'up';
  if (command.endsWith('_left')) return 'left';
  if (command.endsWith('_right')) return 'right';
  return undefined;
};

const directionalAction = (
  command: string,
  kind: MovementActionKind,
  baseActionId: number,
  direction: PlayerState['facing'],
  distanceTiles = 1
): DecompMovementAction => ({
  command,
  kind,
  direction,
  distanceTiles,
  actionId: baseActionId + DIR_INDEX[direction]
});

const faceAction = (command: string, baseActionId: number, direction: PlayerState['facing']): DecompMovementAction =>
  directionalAction(command, 'face', baseActionId, direction, 0);

export const getDecompMovementActionForCommand = (command: string): DecompMovementAction => {
  const direction = directionFromCommand(command);

  if (command === 'step_end') {
    return { command, kind: 'none', actionId: 0xfe };
  }

  if (direction) {
    if (command.startsWith('face_')) return faceAction(command, command.endsWith('_fast') ? 0x04 : 0x00, direction);
    if (command.startsWith('walk_slowest_')) return directionalAction(command, 'step', 0x9b, direction);
    if (command.startsWith('walk_slower_')) return directionalAction(command, 'step', 0x08, direction);
    if (command.startsWith('walk_slow_')) return directionalAction(command, 'step', 0x0c, direction);
    if (command.startsWith('walk_fast_')) return directionalAction(command, 'step', 0x1d, direction);
    if (command.startsWith('walk_faster_')) return directionalAction(command, 'step', 0x35, direction);
    if (command.startsWith('walk_in_place_slow_')) return directionalAction(command, 'face', 0x21, direction, 0);
    if (command.startsWith('walk_in_place_fast_')) return directionalAction(command, 'face', 0x29, direction, 0);
    if (command.startsWith('walk_in_place_faster_')) return directionalAction(command, 'face', 0x2d, direction, 0);
    if (command.startsWith('walk_in_place_')) return directionalAction(command, 'face', 0x25, direction, 0);
    if (command.startsWith('walk_')) return directionalAction(command, 'step', 0x10, direction);
    if (command.startsWith('ride_water_current_')) return directionalAction(command, 'step', 0x31, direction);
    if (command.startsWith('slide_')) return directionalAction(command, 'step', 0x39, direction);
    if (command.startsWith('player_run_slow_')) return directionalAction(command, 'step', 0x41, direction);
    if (command.startsWith('player_run_')) return directionalAction(command, 'step', 0x3d, direction);
    if (command.startsWith('glide_')) return directionalAction(command, 'step', 0xa0, direction);
    if (command.startsWith('jump_2_')) return directionalAction(command, 'jump', 0x14, direction, 2);
    if (command.startsWith('jump_special_with_effect_')) return directionalAction(command, 'jump', 0xa6, direction);
    if (command.startsWith('jump_special_')) return directionalAction(command, 'jump', 0x46, direction);
    if (command.startsWith('jump_in_place_')) return directionalAction(command, 'jumpInPlace', 0x52, direction, 0);
    if (command.startsWith('jump_')) return directionalAction(command, 'jump', 0x4e, direction);
    if (command.startsWith('spin_')) return faceAction(command, 0x94, direction);
    if (command.startsWith('acro_wheelie_face_')) return faceAction(command, 0x70, direction);
    if (command.startsWith('acro_pop_wheelie_')) return faceAction(command, 0x74, direction);
    if (command.startsWith('acro_end_wheelie_face_')) return faceAction(command, 0x78, direction);
    if (command.startsWith('acro_wheelie_hop_face_')) return directionalAction(command, 'jumpInPlace', 0x7c, direction, 0);
    if (command.startsWith('acro_wheelie_hop_')) return directionalAction(command, 'jump', 0x80, direction);
    if (command.startsWith('acro_wheelie_jump_')) return directionalAction(command, 'jump', 0x84, direction, 2);
    if (command.startsWith('acro_wheelie_in_place_')) return directionalAction(command, 'face', 0x88, direction, 0);
    if (command.startsWith('acro_pop_wheelie_move_')) return directionalAction(command, 'step', 0x8c, direction);
    if (command.startsWith('acro_wheelie_move_')) return directionalAction(command, 'step', 0x90, direction);
  }

  switch (command) {
    case 'delay_1':
      return { command, kind: 'delay', actionId: 0x18, durationFrames: 1 };
    case 'delay_2':
      return { command, kind: 'delay', actionId: 0x19, durationFrames: 2 };
    case 'delay_4':
      return { command, kind: 'delay', actionId: 0x1a, durationFrames: 4 };
    case 'delay_8':
      return { command, kind: 'delay', actionId: 0x1b, durationFrames: 8 };
    case 'delay_16':
      return { command, kind: 'delay', actionId: 0x1c, durationFrames: 16 };
    case 'lock_facing_direction':
      return { command, kind: 'facingLock', actionId: 0x4c, locked: true };
    case 'unlock_facing_direction':
      return { command, kind: 'facingLock', actionId: 0x4d, locked: false };
    case 'face_player':
      return { command, kind: 'face', actionId: 0x4a };
    case 'face_away_player':
      return { command, kind: 'face', actionId: 0x4b };
    case 'nurse_joy_bow':
      return { command, kind: 'animation', actionId: 0x5b };
    case 'face_original_direction':
      return { command, kind: 'face', actionId: 0x5a };
    case 'disable_anim':
      return { command, kind: 'animation', actionId: 0x5e, animationDisabled: true };
    case 'restore_anim':
      return { command, kind: 'animation', actionId: 0x5f, animationDisabled: false };
    case 'set_invisible':
      return { command, kind: 'visibility', actionId: 0x60, visible: false };
    case 'set_visible':
      return { command, kind: 'visibility', actionId: 0x61, visible: true };
    case 'emote_exclamation_mark':
      return { command, kind: 'emote', actionId: 0x62, emote: 'exclamation' };
    case 'emote_question_mark':
      return { command, kind: 'emote', actionId: 0x63, emote: 'question' };
    case 'emote_x':
      return { command, kind: 'emote', actionId: 0x64, emote: 'x' };
    case 'emote_double_exclamation_mark':
      return { command, kind: 'emote', actionId: 0x65, emote: 'doubleExclamation' };
    case 'emote_smile':
      return { command, kind: 'emote', actionId: 0x66, emote: 'smile' };
    case 'reveal_trainer':
      return { command, kind: 'animation', actionId: 0x67 };
    case 'rock_smash_break':
      return { command, kind: 'animation', actionId: 0x68 };
    case 'cut_tree':
      return { command, kind: 'animation', actionId: 0x69 };
    case 'set_fixed_priority':
      return { command, kind: 'fixedPriority', actionId: 0x6a, fixedPriority: true };
    case 'clear_fixed_priority':
      return { command, kind: 'fixedPriority', actionId: 0x6b, fixedPriority: false };
    case 'init_affine_anim':
      return { command, kind: 'affine', actionId: 0x6c };
    case 'clear_affine_anim':
      return { command, kind: 'affine', actionId: 0x6d };
    default:
      return { command, kind: 'none', actionId: 0xff };
  }
};

const DIRECTION_NAMES = ['down', 'up', 'left', 'right'] as const;

const DIRECTIONAL_MOVEMENT_PREFIXES = [
  'walk_slowest',
  'walk_slower',
  'walk_slow',
  'walk',
  'walk_fast',
  'walk_faster',
  'walk_in_place_slow',
  'walk_in_place',
  'walk_in_place_fast',
  'walk_in_place_faster',
  'ride_water_current',
  'slide',
  'player_run',
  'player_run_slow',
  'glide',
  'jump_2',
  'jump_special',
  'jump_special_with_effect',
  'jump_in_place',
  'jump',
  'spin',
  'acro_wheelie_face',
  'acro_pop_wheelie',
  'acro_end_wheelie_face',
  'acro_wheelie_hop_face',
  'acro_wheelie_hop',
  'acro_wheelie_jump',
  'acro_wheelie_in_place',
  'acro_pop_wheelie_move',
  'acro_wheelie_move'
] as const;

const SINGLE_MOVEMENT_COMMANDS = [
  'delay_1',
  'delay_2',
  'delay_4',
  'delay_8',
  'delay_16',
  'lock_facing_direction',
  'unlock_facing_direction',
  'face_player',
  'face_away_player',
  'nurse_joy_bow',
  'face_original_direction',
  'disable_anim',
  'restore_anim',
  'set_invisible',
  'set_visible',
  'emote_exclamation_mark',
  'emote_question_mark',
  'emote_x',
  'emote_double_exclamation_mark',
  'emote_smile',
  'reveal_trainer',
  'rock_smash_break',
  'cut_tree',
  'set_fixed_priority',
  'clear_fixed_priority',
  'init_affine_anim',
  'clear_affine_anim',
  'step_end'
] as const;

let actionById: Map<number, DecompMovementAction> | null = null;

const buildActionByIdMap = (): Map<number, DecompMovementAction> => {
  const actions = new Map<number, DecompMovementAction>();
  for (const direction of DIRECTION_NAMES) {
    for (const command of [`face_${direction}`, `face_${direction}_fast`]) {
      const action = getDecompMovementActionForCommand(command);
      actions.set(action.actionId, action);
    }

    for (const prefix of DIRECTIONAL_MOVEMENT_PREFIXES) {
      const action = getDecompMovementActionForCommand(`${prefix}_${direction}`);
      actions.set(action.actionId, action);
    }
  }

  for (const command of SINGLE_MOVEMENT_COMMANDS) {
    const action = getDecompMovementActionForCommand(command);
    actions.set(action.actionId, action);
  }

  return actions;
};

export const getDecompMovementActionById = (actionId: number): DecompMovementAction => {
  actionById ??= buildActionByIdMap();
  return actionById.get(actionId) ?? {
    command: `movement_action_${actionId.toString(16)}`,
    kind: 'none',
    actionId: 0xff
  };
};
