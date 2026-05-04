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
  | 'affine'
  | 'groundEffect';

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
  jumpLandingGroundEffect?: boolean;
  emote?: 'exclamation' | 'question' | 'x' | 'doubleExclamation' | 'smile';
}

export const DECOMP_MOVEMENT_ACTION_IDS = {
  MOVEMENT_ACTION_FACE_DOWN: 0x00,
  MOVEMENT_ACTION_FACE_UP: 0x01,
  MOVEMENT_ACTION_FACE_LEFT: 0x02,
  MOVEMENT_ACTION_FACE_RIGHT: 0x03,
  MOVEMENT_ACTION_FACE_DOWN_FAST: 0x04,
  MOVEMENT_ACTION_FACE_UP_FAST: 0x05,
  MOVEMENT_ACTION_FACE_LEFT_FAST: 0x06,
  MOVEMENT_ACTION_FACE_RIGHT_FAST: 0x07,
  MOVEMENT_ACTION_WALK_SLOWER_DOWN: 0x08,
  MOVEMENT_ACTION_WALK_SLOWER_UP: 0x09,
  MOVEMENT_ACTION_WALK_SLOWER_LEFT: 0x0a,
  MOVEMENT_ACTION_WALK_SLOWER_RIGHT: 0x0b,
  MOVEMENT_ACTION_WALK_SLOW_DOWN: 0x0c,
  MOVEMENT_ACTION_WALK_SLOW_UP: 0x0d,
  MOVEMENT_ACTION_WALK_SLOW_LEFT: 0x0e,
  MOVEMENT_ACTION_WALK_SLOW_RIGHT: 0x0f,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN: 0x10,
  MOVEMENT_ACTION_WALK_NORMAL_UP: 0x11,
  MOVEMENT_ACTION_WALK_NORMAL_LEFT: 0x12,
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT: 0x13,
  MOVEMENT_ACTION_JUMP_2_DOWN: 0x14,
  MOVEMENT_ACTION_JUMP_2_UP: 0x15,
  MOVEMENT_ACTION_JUMP_2_LEFT: 0x16,
  MOVEMENT_ACTION_JUMP_2_RIGHT: 0x17,
  MOVEMENT_ACTION_DELAY_1: 0x18,
  MOVEMENT_ACTION_DELAY_2: 0x19,
  MOVEMENT_ACTION_DELAY_4: 0x1a,
  MOVEMENT_ACTION_DELAY_8: 0x1b,
  MOVEMENT_ACTION_DELAY_16: 0x1c,
  MOVEMENT_ACTION_WALK_FAST_DOWN: 0x1d,
  MOVEMENT_ACTION_WALK_FAST_UP: 0x1e,
  MOVEMENT_ACTION_WALK_FAST_LEFT: 0x1f,
  MOVEMENT_ACTION_WALK_FAST_RIGHT: 0x20,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN: 0x21,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP: 0x22,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT: 0x23,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT: 0x24,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN: 0x25,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP: 0x26,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT: 0x27,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT: 0x28,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN: 0x29,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP: 0x2a,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT: 0x2b,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT: 0x2c,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN: 0x2d,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP: 0x2e,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT: 0x2f,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT: 0x30,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN: 0x31,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP: 0x32,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT: 0x33,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT: 0x34,
  MOVEMENT_ACTION_WALK_FASTER_DOWN: 0x35,
  MOVEMENT_ACTION_WALK_FASTER_UP: 0x36,
  MOVEMENT_ACTION_WALK_FASTER_LEFT: 0x37,
  MOVEMENT_ACTION_WALK_FASTER_RIGHT: 0x38,
  MOVEMENT_ACTION_SLIDE_DOWN: 0x39,
  MOVEMENT_ACTION_SLIDE_UP: 0x3a,
  MOVEMENT_ACTION_SLIDE_LEFT: 0x3b,
  MOVEMENT_ACTION_SLIDE_RIGHT: 0x3c,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN: 0x3d,
  MOVEMENT_ACTION_PLAYER_RUN_UP: 0x3e,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT: 0x3f,
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT: 0x40,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN_SLOW: 0x41,
  MOVEMENT_ACTION_PLAYER_RUN_UP_SLOW: 0x42,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT_SLOW: 0x43,
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT_SLOW: 0x44,
  MOVEMENT_ACTION_START_ANIM_IN_DIRECTION: 0x45,
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN: 0x46,
  MOVEMENT_ACTION_JUMP_SPECIAL_UP: 0x47,
  MOVEMENT_ACTION_JUMP_SPECIAL_LEFT: 0x48,
  MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT: 0x49,
  MOVEMENT_ACTION_FACE_PLAYER: 0x4a,
  MOVEMENT_ACTION_FACE_AWAY_PLAYER: 0x4b,
  MOVEMENT_ACTION_LOCK_FACING_DIRECTION: 0x4c,
  MOVEMENT_ACTION_UNLOCK_FACING_DIRECTION: 0x4d,
  MOVEMENT_ACTION_JUMP_DOWN: 0x4e,
  MOVEMENT_ACTION_JUMP_UP: 0x4f,
  MOVEMENT_ACTION_JUMP_LEFT: 0x50,
  MOVEMENT_ACTION_JUMP_RIGHT: 0x51,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN: 0x52,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP: 0x53,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT: 0x54,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT: 0x55,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP: 0x56,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN: 0x57,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT: 0x58,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT: 0x59,
  MOVEMENT_ACTION_FACE_ORIGINAL_DIRECTION: 0x5a,
  MOVEMENT_ACTION_NURSE_JOY_BOW_DOWN: 0x5b,
  MOVEMENT_ACTION_ENABLE_JUMP_LANDING_GROUND_EFFECT: 0x5c,
  MOVEMENT_ACTION_DISABLE_JUMP_LANDING_GROUND_EFFECT: 0x5d,
  MOVEMENT_ACTION_DISABLE_ANIMATION: 0x5e,
  MOVEMENT_ACTION_RESTORE_ANIMATION: 0x5f,
  MOVEMENT_ACTION_SET_INVISIBLE: 0x60,
  MOVEMENT_ACTION_SET_VISIBLE: 0x61,
  MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK: 0x62,
  MOVEMENT_ACTION_EMOTE_QUESTION_MARK: 0x63,
  MOVEMENT_ACTION_EMOTE_X: 0x64,
  MOVEMENT_ACTION_EMOTE_DOUBLE_EXCL_MARK: 0x65,
  MOVEMENT_ACTION_EMOTE_SMILE: 0x66,
  MOVEMENT_ACTION_REVEAL_TRAINER: 0x67,
  MOVEMENT_ACTION_ROCK_SMASH_BREAK: 0x68,
  MOVEMENT_ACTION_CUT_TREE: 0x69,
  MOVEMENT_ACTION_SET_FIXED_PRIORITY: 0x6a,
  MOVEMENT_ACTION_CLEAR_FIXED_PRIORITY: 0x6b,
  MOVEMENT_ACTION_INIT_AFFINE_ANIM: 0x6c,
  MOVEMENT_ACTION_CLEAR_AFFINE_ANIM: 0x6d,
  MOVEMENT_ACTION_WALK_DOWN_START_AFFINE: 0x6e,
  MOVEMENT_ACTION_WALK_DOWN_AFFINE: 0x6f,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN: 0x70,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP: 0x71,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT: 0x72,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT: 0x73,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN: 0x74,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP: 0x75,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT: 0x76,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT: 0x77,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN: 0x78,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP: 0x79,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT: 0x7a,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT: 0x7b,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN: 0x7c,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP: 0x7d,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT: 0x7e,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT: 0x7f,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN: 0x80,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP: 0x81,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT: 0x82,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT: 0x83,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN: 0x84,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP: 0x85,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT: 0x86,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT: 0x87,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN: 0x88,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP: 0x89,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT: 0x8a,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT: 0x8b,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN: 0x8c,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP: 0x8d,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT: 0x8e,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT: 0x8f,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN: 0x90,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP: 0x91,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT: 0x92,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT: 0x93,
  MOVEMENT_ACTION_SPIN_DOWN: 0x94,
  MOVEMENT_ACTION_SPIN_UP: 0x95,
  MOVEMENT_ACTION_SPIN_LEFT: 0x96,
  MOVEMENT_ACTION_SPIN_RIGHT: 0x97,
  MOVEMENT_ACTION_RAISE_HAND_AND_STOP: 0x98,
  MOVEMENT_ACTION_RAISE_HAND_AND_JUMP: 0x99,
  MOVEMENT_ACTION_RAISE_HAND_AND_SWIM: 0x9a,
  MOVEMENT_ACTION_WALK_SLOWEST_DOWN: 0x9b,
  MOVEMENT_ACTION_WALK_SLOWEST_UP: 0x9c,
  MOVEMENT_ACTION_WALK_SLOWEST_LEFT: 0x9d,
  MOVEMENT_ACTION_WALK_SLOWEST_RIGHT: 0x9e,
  MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE: 0x9f,
  MOVEMENT_ACTION_GLIDE_DOWN: 0xa0,
  MOVEMENT_ACTION_GLIDE_UP: 0xa1,
  MOVEMENT_ACTION_GLIDE_LEFT: 0xa2,
  MOVEMENT_ACTION_GLIDE_RIGHT: 0xa3,
  MOVEMENT_ACTION_FLY_UP: 0xa4,
  MOVEMENT_ACTION_FLY_DOWN: 0xa5,
  MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_DOWN: 0xa6,
  MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_UP: 0xa7,
  MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT: 0xa8,
  MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_RIGHT: 0xa9,
  MOVEMENT_ACTION_STEP_END: 0xfe,
  MOVEMENT_ACTION_NONE: 0xff
} as const;

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
    case 'enable_jump_landing_ground_effect':
      return { command, kind: 'groundEffect', actionId: 0x5c, jumpLandingGroundEffect: true };
    case 'disable_jump_landing_ground_effect':
      return { command, kind: 'groundEffect', actionId: 0x5d, jumpLandingGroundEffect: false };
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
    case 'walk_down_start_affine':
      return { command, kind: 'affine', actionId: 0x6e, direction: 'down', distanceTiles: 1 };
    case 'walk_down_affine':
      return { command, kind: 'affine', actionId: 0x6f, direction: 'down', distanceTiles: 1 };
    case 'raise_hand_and_stop':
      return { command, kind: 'animation', actionId: 0x98 };
    case 'raise_hand_and_jump':
      return { command, kind: 'jumpInPlace', actionId: 0x99, distanceTiles: 0 };
    case 'raise_hand_and_swim':
      return { command, kind: 'animation', actionId: 0x9a };
    case 'shake_head_or_walk_in_place':
      return { command, kind: 'animation', actionId: 0x9f };
    case 'fly_up':
      return { command, kind: 'step', actionId: 0xa4, direction: 'up', distanceTiles: 1 };
    case 'fly_down':
      return { command, kind: 'step', actionId: 0xa5, direction: 'down', distanceTiles: 1 };
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
  'walk_down_start_affine',
  'walk_down_affine',
  'enable_jump_landing_ground_effect',
  'disable_jump_landing_ground_effect',
  'raise_hand_and_stop',
  'raise_hand_and_jump',
  'raise_hand_and_swim',
  'shake_head_or_walk_in_place',
  'fly_up',
  'fly_down',
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
