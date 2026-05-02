export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const SPECIES_NONE = 0;
export const DOUBLE_CRY_ROAR = 2;
export const DOUBLE_CRY_GROWL = 255;
export const CRY_MODE_HIGH_PITCH = 3;
export const CRY_MODE_ECHO_START = 4;
export const CRY_MODE_ECHO_END = 6;
export const CRY_MODE_ROAR_1 = 7;
export const CRY_MODE_ROAR_2 = 8;
export const CRY_MODE_GROWL_1 = 9;
export const CRY_MODE_GROWL_2 = 10;

export type SoundTaskFunc =
  | 'SoundTask_FireBlast_Step1'
  | 'SoundTask_FireBlast_Step2'
  | 'SoundTask_LoopSEAdjustPanning_Step'
  | 'SoundTask_PlayDoubleCry_Step'
  | 'SoundTask_PlayCryWithEcho_Step'
  | 'SoundTask_AdjustPanningVar_Step'
  | null;

export interface BattleAnimSoundTask {
  data: number[];
  func: SoundTaskFunc;
  destroyed: boolean;
  destroyKind: 'sound' | 'visual' | null;
}

export interface BattleAnimSoundRuntime {
  tasks: BattleAnimSoundTask[];
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerSides: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerPartyIndexes: Record<number, number>;
  enemyPartySpecies: number[];
  playerPartySpecies: number[];
  animBattlerSpecies: Record<number, number>;
  statusAnimActive: boolean;
  cryPlaying: boolean;
  animCustomPanning: number;
  seLog: Array<{ kind: 'SE1' | 'SE2' | 'SE12'; songId: number; pan: number }>;
  cryLog: Array<{ species: number; pan: number; mode: number }>;
}

export const createBattleAnimSoundRuntime = (): BattleAnimSoundRuntime => ({
  tasks: [],
  battleAnimArgs: Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  battlerSides: {
    0: B_SIDE_PLAYER,
    1: B_SIDE_OPPONENT,
    2: B_SIDE_PLAYER,
    3: B_SIDE_OPPONENT
  },
  battlerVisible: {
    0: true,
    1: true,
    2: true,
    3: true
  },
  battlerPartyIndexes: {
    0: 0,
    1: 0,
    2: 1,
    3: 1
  },
  enemyPartySpecies: [25, 26],
  playerPartySpecies: [1, 4],
  animBattlerSpecies: {
    0: 1,
    1: 25,
    2: 4,
    3: 26
  },
  statusAnimActive: false,
  cryPlaying: false,
  animCustomPanning: 0,
  seLog: [],
  cryLog: []
});

export const createBattleAnimSoundTask = (runtime: BattleAnimSoundRuntime): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({
    data: Array.from({ length: 16 }, () => 0),
    func: null,
    destroyed: false,
    destroyKind: null
  });
  return id;
};

const task = (runtime: BattleAnimSoundRuntime, taskId: number): BattleAnimSoundTask =>
  runtime.tasks[taskId];

const battlePartner = (battlerId: number): number => battlerId ^ 2;

const getBattlerSide = (runtime: BattleAnimSoundRuntime, battlerId: number): number =>
  runtime.battlerSides[battlerId] ?? B_SIDE_PLAYER;

const isBattlerSpriteVisible = (runtime: BattleAnimSoundRuntime, battlerId: number): boolean =>
  runtime.battlerVisible[battlerId] ?? false;

const getBattlerForAnimArg = (runtime: BattleAnimSoundRuntime, arg: number): number => {
  if (arg === ANIM_ATTACKER) {
    return runtime.battleAnimAttacker;
  }
  if (arg === ANIM_TARGET) {
    return runtime.battleAnimTarget;
  }
  if (arg === ANIM_ATK_PARTNER) {
    return battlePartner(runtime.battleAnimAttacker);
  }
  return battlePartner(runtime.battleAnimTarget);
};

const getBattlerSpecies = (runtime: BattleAnimSoundRuntime, battlerId: number): number => {
  const partyIndex = runtime.battlerPartyIndexes[battlerId] ?? 0;
  if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
    return runtime.enemyPartySpecies[partyIndex] ?? SPECIES_NONE;
  }
  return runtime.playerPartySpecies[partyIndex] ?? SPECIES_NONE;
};

export const battleAnimAdjustPanning = (runtime: BattleAnimSoundRuntime, pan: number): number => {
  let adjusted = pan;
  if (runtime.statusAnimActive) {
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
      adjusted = SOUND_PAN_TARGET;
    } else {
      adjusted = SOUND_PAN_ATTACKER;
    }
  } else if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
    if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
      if (adjusted === SOUND_PAN_TARGET) {
        adjusted = SOUND_PAN_ATTACKER;
      } else if (adjusted !== SOUND_PAN_ATTACKER) {
        adjusted *= -1;
      }
    }
  } else if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_OPPONENT) {
    if (adjusted === SOUND_PAN_ATTACKER) {
      adjusted = SOUND_PAN_TARGET;
    }
  } else {
    adjusted *= -1;
  }

  if (adjusted > SOUND_PAN_TARGET) {
    adjusted = SOUND_PAN_TARGET;
  } else if (adjusted < SOUND_PAN_ATTACKER) {
    adjusted = SOUND_PAN_ATTACKER;
  }
  return adjusted;
};

export const keepPanInRange = (panArg: number, _oldPan: number): number => {
  if (panArg > SOUND_PAN_TARGET) {
    return SOUND_PAN_TARGET;
  }
  if (panArg < SOUND_PAN_ATTACKER) {
    return SOUND_PAN_ATTACKER;
  }
  return panArg;
};

export const calculatePanIncrement = (sourcePan: number, targetPan: number, incrementPan: number): number => {
  const abs = Math.abs(incrementPan);
  if (sourcePan < targetPan) {
    return abs;
  }
  if (sourcePan > targetPan) {
    return -abs;
  }
  return 0;
};

const playSE12WithPanning = (runtime: BattleAnimSoundRuntime, songId: number, pan: number): void => {
  runtime.seLog.push({ kind: 'SE12', songId, pan });
};

const playSE1WithPanning = (runtime: BattleAnimSoundRuntime, songId: number, pan: number): void => {
  runtime.seLog.push({ kind: 'SE1', songId, pan });
};

const playSE2WithPanning = (runtime: BattleAnimSoundRuntime, songId: number, pan: number): void => {
  runtime.seLog.push({ kind: 'SE2', songId, pan });
};

const playCryByMode = (
  runtime: BattleAnimSoundRuntime,
  species: number,
  pan: number,
  mode: number
): void => {
  runtime.cryLog.push({ species, pan, mode });
  runtime.cryPlaying = true;
};

const isCryPlaying = (runtime: BattleAnimSoundRuntime): boolean => runtime.cryPlaying;

const destroyAnimSoundTask = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  task(runtime, taskId).destroyed = true;
  task(runtime, taskId).destroyKind = 'sound';
  task(runtime, taskId).func = null;
};

const destroyAnimVisualTask = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  task(runtime, taskId).destroyed = true;
  task(runtime, taskId).destroyKind = 'visual';
  task(runtime, taskId).func = null;
};

export const soundTaskFireBlast = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  t.data[0] = runtime.battleAnimArgs[0];
  t.data[1] = runtime.battleAnimArgs[1];
  const pan1 = battleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER);
  const pan2 = battleAnimAdjustPanning(runtime, SOUND_PAN_TARGET);
  const panIncrement = calculatePanIncrement(pan1, pan2, 2);
  t.data[2] = pan1;
  t.data[3] = pan2;
  t.data[4] = panIncrement;
  t.data[10] = 10;
  t.func = 'SoundTask_FireBlast_Step1';
};

export const soundTaskFireBlastStep1 = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  let pan = t.data[2];
  const panIncrement = t.data[4];
  t.data[11] += 1;
  if (t.data[11] === 111) {
    t.data[10] = 5;
    t.data[11] = 0;
    t.func = 'SoundTask_FireBlast_Step2';
  } else {
    t.data[10] += 1;
    if (t.data[10] === 11) {
      t.data[10] = 0;
      playSE12WithPanning(runtime, t.data[0], pan);
    }
    pan += panIncrement;
    t.data[2] = keepPanInRange(pan, panIncrement);
  }
};

export const soundTaskFireBlastStep2 = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  t.data[10] += 1;
  if (t.data[10] === 6) {
    t.data[10] = 0;
    const pan = battleAnimAdjustPanning(runtime, SOUND_PAN_TARGET);
    playSE12WithPanning(runtime, t.data[1], pan);
    t.data[11] += 1;
    if (t.data[11] === 2) {
      destroyAnimSoundTask(runtime, taskId);
    }
  }
};

export const soundTaskLoopSEAdjustPanning = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  const songId = runtime.battleAnimArgs[0];
  const sourcePan = battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[1]);
  const targetPan = battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[2]);
  const panIncrement = calculatePanIncrement(sourcePan, targetPan, runtime.battleAnimArgs[3]);
  t.data[0] = songId;
  t.data[1] = sourcePan;
  t.data[2] = targetPan;
  t.data[3] = panIncrement;
  t.data[4] = runtime.battleAnimArgs[4];
  t.data[5] = runtime.battleAnimArgs[5];
  t.data[6] = runtime.battleAnimArgs[6];
  t.data[10] = 0;
  t.data[11] = sourcePan;
  t.data[12] = runtime.battleAnimArgs[6];
  t.func = 'SoundTask_LoopSEAdjustPanning_Step';
  soundTaskLoopSEAdjustPanningStep(runtime, taskId);
};

export const soundTaskLoopSEAdjustPanningStep = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  if (t.data[12]++ === t.data[6]) {
    t.data[12] = 0;
    playSE12WithPanning(runtime, t.data[0], t.data[11]);
    t.data[4] -= 1;
    if (t.data[4] === 0) {
      destroyAnimSoundTask(runtime, taskId);
      return;
    }
  }
  if (t.data[10]++ === t.data[5]) {
    t.data[10] = 0;
    const dPan = t.data[3];
    const oldPan = t.data[11];
    t.data[11] = keepPanInRange(dPan + oldPan, oldPan);
  }
};

export const soundTaskPlayCryHighPitch = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const animArg = runtime.battleAnimArgs[0];
  const battlerId = getBattlerForAnimArg(runtime, animArg);
  const pan = battleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER);
  if ((animArg === ANIM_TARGET || animArg === ANIM_DEF_PARTNER) && !isBattlerSpriteVisible(runtime, battlerId)) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  const species = getBattlerSpecies(runtime, battlerId);
  if (species !== SPECIES_NONE) {
    playCryByMode(runtime, species, pan, CRY_MODE_HIGH_PITCH);
  }
  destroyAnimVisualTask(runtime, taskId);
};

export const soundTaskPlayDoubleCry = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const animArg = runtime.battleAnimArgs[0];
  const battlerId = getBattlerForAnimArg(runtime, animArg);
  const pan = battleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER);
  if ((animArg === ANIM_TARGET || animArg === ANIM_DEF_PARTNER) && !isBattlerSpriteVisible(runtime, battlerId)) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  const species = getBattlerSpecies(runtime, battlerId);
  const t = task(runtime, taskId);
  t.data[0] = runtime.battleAnimArgs[1];
  t.data[1] = species;
  t.data[2] = pan;
  if (species !== SPECIES_NONE) {
    playCryByMode(runtime, species, pan, runtime.battleAnimArgs[1] === DOUBLE_CRY_GROWL ? CRY_MODE_GROWL_1 : CRY_MODE_ROAR_1);
    t.func = 'SoundTask_PlayDoubleCry_Step';
  } else {
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const soundTaskPlayDoubleCryStep = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  if (t.data[9] < 2) {
    t.data[9] += 1;
  } else if (t.data[0] === DOUBLE_CRY_GROWL) {
    if (!isCryPlaying(runtime)) {
      playCryByMode(runtime, t.data[1], t.data[2], CRY_MODE_GROWL_2);
      destroyAnimVisualTask(runtime, taskId);
    }
  } else if (!isCryPlaying(runtime)) {
    playCryByMode(runtime, t.data[1], t.data[2], CRY_MODE_ROAR_2);
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const soundTaskWaitForCry = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  if (t.data[9] < 2) {
    t.data[9] += 1;
  } else if (!isCryPlaying(runtime)) {
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const soundTaskPlayCryWithEcho = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const species = runtime.animBattlerSpecies[runtime.battleAnimAttacker] ?? SPECIES_NONE;
  const pan = battleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER);
  const t = task(runtime, taskId);
  t.data[1] = species;
  t.data[2] = pan;
  if (species !== SPECIES_NONE) {
    playCryByMode(runtime, species, pan, CRY_MODE_ECHO_START);
    t.func = 'SoundTask_PlayCryWithEcho_Step';
  } else {
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const soundTaskPlayCryWithEchoStep = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  if (t.data[9] < 2) {
    t.data[9] += 1;
  } else if (!isCryPlaying(runtime)) {
    playCryByMode(runtime, t.data[1], t.data[2], CRY_MODE_ECHO_END);
    destroyAnimVisualTask(runtime, taskId);
  }
};

export const soundTaskPlaySE1WithPanning = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  playSE1WithPanning(runtime, runtime.battleAnimArgs[0], battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[1]));
  destroyAnimVisualTask(runtime, taskId);
};

export const soundTaskPlaySE2WithPanning = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  playSE2WithPanning(runtime, runtime.battleAnimArgs[0], battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[1]));
  destroyAnimVisualTask(runtime, taskId);
};

export const soundTaskAdjustPanningVar = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  const sourcePan = battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[0]);
  const targetPan = battleAnimAdjustPanning(runtime, runtime.battleAnimArgs[1]);
  const panIncrement = calculatePanIncrement(sourcePan, targetPan, runtime.battleAnimArgs[2]);
  t.data[1] = sourcePan;
  t.data[2] = targetPan;
  t.data[3] = panIncrement;
  t.data[5] = runtime.battleAnimArgs[3];
  t.data[10] = 0;
  t.data[11] = sourcePan;
  t.func = 'SoundTask_AdjustPanningVar_Step';
  soundTaskAdjustPanningVarStep(runtime, taskId);
};

export const soundTaskAdjustPanningVarStep = (runtime: BattleAnimSoundRuntime, taskId: number): void => {
  const t = task(runtime, taskId);
  const panIncrement = t.data[3];
  if (t.data[10]++ === t.data[5]) {
    t.data[10] = 0;
    const oldPan = t.data[11];
    t.data[11] = keepPanInRange(panIncrement + oldPan, oldPan);
  }
  runtime.animCustomPanning = t.data[11];
  if (t.data[11] === t.data[2]) {
    destroyAnimVisualTask(runtime, taskId);
  }
};

export function SoundTask_FireBlast(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskFireBlast(runtime, taskId);
}

export function SoundTask_FireBlast_Step1(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskFireBlastStep1(runtime, taskId);
}

export function SoundTask_FireBlast_Step2(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskFireBlastStep2(runtime, taskId);
}

export function SoundTask_LoopSEAdjustPanning(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskLoopSEAdjustPanning(runtime, taskId);
}

export function SoundTask_LoopSEAdjustPanning_Step(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskLoopSEAdjustPanningStep(runtime, taskId);
}

export function SoundTask_PlayCryHighPitch(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlayCryHighPitch(runtime, taskId);
}

export function SoundTask_PlayDoubleCry(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlayDoubleCry(runtime, taskId);
}

export function SoundTask_PlayDoubleCry_Step(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlayDoubleCryStep(runtime, taskId);
}

export function SoundTask_WaitForCry(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskWaitForCry(runtime, taskId);
}

export function SoundTask_PlayCryWithEcho(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlayCryWithEcho(runtime, taskId);
}

export function SoundTask_PlayCryWithEcho_Step(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlayCryWithEchoStep(runtime, taskId);
}

export function SoundTask_PlaySE1WithPanning(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlaySE1WithPanning(runtime, taskId);
}

export function SoundTask_PlaySE2WithPanning(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskPlaySE2WithPanning(runtime, taskId);
}

export function SoundTask_AdjustPanningVar(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskAdjustPanningVar(runtime, taskId);
}

export function SoundTask_AdjustPanningVar_Step(runtime: BattleAnimSoundRuntime, taskId: number): void {
  soundTaskAdjustPanningVarStep(runtime, taskId);
}
