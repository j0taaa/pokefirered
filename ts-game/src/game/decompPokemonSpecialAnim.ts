export const A_BUTTON = 1;
export const B_BUTTON = 2;

export const ITEM_POTION = 13;
export const ITEM_RARE_CANDY = 68;
export const ITEM_TM01 = 289;
export const ITEM_HM08 = 346;

export const PSA_ITEM_ANIM_TYPE_DEFAULT = 0;
export const PSA_ITEM_ANIM_TYPE_POTION = 1;
export const PSA_ITEM_ANIM_TYPE_UNUSED2 = 2;
export const PSA_ITEM_ANIM_TYPE_TMHM = 3;

export const PSA_TEXT_ITEM_USED = 0;
export const PSA_TEXT_FORGET_1 = 1;
export const PSA_TEXT_FORGET_2_AND = 2;
export const PSA_TEXT_FORGET_POOF = 3;
export const PSA_TEXT_FORGET_FORGOT = 4;
export const PSA_TEXT_FORGET_AND = 5;
export const PSA_TEXT_HUH = 6;
export const PSA_TEXT_MACHINE_SET = 7;
export const PSA_TEXT_LEARNED_MOVE = 8;

export const SE_M_SPIT_UP = 'SE_M_SPIT_UP';
export const MUS_LEVEL_UP = 'MUS_LEVEL_UP';

export interface PokemonSpecialAnimPokemon {
  species: number;
  friendship: number;
  personality: number;
  nickname: string;
  maxHP: number;
  atk: number;
  def: number;
  speed: number;
  spatk: number;
  spdef: number;
}

export interface PokemonSpecialAnimScene {
  animType: number;
}

export interface PokemonSpecialAnim {
  state: number;
  savedCallback: string | null;
  species: number;
  closeness: number;
  personality: number;
  slotId: number;
  itemId: number;
  animType: number;
  pokemon: PokemonSpecialAnimPokemon;
  field_00a4: number;
  nickname: string;
  nameOfMoveForgotten: string;
  nameOfMoveToTeach: string;
  cancelDisabled: boolean;
  delayTimer: number;
  sceneResources: PokemonSpecialAnimScene;
}

export type PsaTaskFunc =
  | 'Task_UseItem_Normal'
  | 'Task_ForgetMove'
  | 'Task_EvoStone_CantEvolve'
  | 'Task_UseTM_NoForget'
  | 'Task_MachineSet'
  | 'Task_CleanUp';

export interface PsaTask {
  func: PsaTaskFunc;
  ptr: PokemonSpecialAnim;
  destroyed: boolean;
}

export interface PokemonSpecialAnimRuntime {
  sCancelDisabled: boolean;
  sPSATaskId: number;
  sPSAWork: PokemonSpecialAnim | null;
  gMain: {
    inBattle: boolean;
    heldKeys: number;
    newKeys: number;
  };
  gPaletteFade: {
    active: boolean;
  };
  party: PokemonSpecialAnimPokemon[];
  tasks: Array<PsaTask | null>;
  mainCallback2: string | null;
  vBlankCallback: string | null;
  operations: string[];
  moveNames: Record<number, string>;
  itemToMove: Record<number, number>;
  allocationFails: boolean;
  sceneInitNotFinished: boolean;
  zoomTaskActive: boolean;
  levelUpVerticalSpritesTaskRunning: boolean;
  itemUseOnMonAnimActive: boolean;
  messagePrintTaskActive: boolean;
  poofAnimReturn: number;
  machineSetWobbleReturn: boolean;
  zoomOutAnimReturn: boolean;
  fanfareTaskInactive: boolean;
  cryFinished: boolean;
  itemKindOverride: Record<number, number>;
}

const clonePokemon = (pokemon: PokemonSpecialAnimPokemon): PokemonSpecialAnimPokemon => ({ ...pokemon });

export const createPsaPokemon = (
  overrides: Partial<PokemonSpecialAnimPokemon> = {}
): PokemonSpecialAnimPokemon => ({
  species: 1,
  friendship: 0,
  personality: 0,
  nickname: 'MON',
  maxHP: 10,
  atk: 10,
  def: 10,
  speed: 10,
  spatk: 10,
  spdef: 10,
  ...overrides
});

export const createPokemonSpecialAnimRuntime = (
  overrides: Partial<PokemonSpecialAnimRuntime> = {}
): PokemonSpecialAnimRuntime => ({
  sCancelDisabled: false,
  sPSATaskId: 0,
  sPSAWork: null,
  gMain: { inBattle: false, heldKeys: 0, newKeys: 0, ...overrides.gMain },
  gPaletteFade: { active: false, ...overrides.gPaletteFade },
  party: [createPsaPokemon(), createPsaPokemon(), createPsaPokemon(), createPsaPokemon(), createPsaPokemon(), createPsaPokemon()],
  tasks: [],
  mainCallback2: null,
  vBlankCallback: null,
  operations: [],
  moveNames: { 1: 'POUND', 15: 'CUT', ...overrides.moveNames },
  itemToMove: { [ITEM_TM01]: 1, [ITEM_HM08]: 15, ...overrides.itemToMove },
  allocationFails: false,
  sceneInitNotFinished: false,
  zoomTaskActive: false,
  levelUpVerticalSpritesTaskRunning: false,
  itemUseOnMonAnimActive: false,
  messagePrintTaskActive: false,
  poofAnimReturn: 0,
  machineSetWobbleReturn: false,
  zoomOutAnimReturn: false,
  fanfareTaskInactive: true,
  cryFinished: true,
  itemKindOverride: {},
  ...overrides
});

const setMainCallback2 = (runtime: PokemonSpecialAnimRuntime, callback: string | null): void => {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback ?? 'NULL'}`);
};

const setVBlankCallback = (runtime: PokemonSpecialAnimRuntime, callback: string | null): void => {
  runtime.vBlankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback ?? 'NULL'}`);
};

const createTask = (runtime: PokemonSpecialAnimRuntime, func: PsaTaskFunc, ptr: PokemonSpecialAnim): number => {
  const taskId = runtime.tasks.findIndex((task) => task === null);
  const id = taskId === -1 ? runtime.tasks.length : taskId;
  runtime.tasks[id] = { func, ptr, destroyed: false };
  runtime.operations.push(`CreateTask:${func}:${id}`);
  return id;
};

const destroyTask = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId]!.destroyed = true;
    runtime.tasks[taskId] = null;
  }
  runtime.operations.push(`DestroyTask:${taskId}`);
};

const freePtr = (runtime: PokemonSpecialAnimRuntime, ptr: PokemonSpecialAnim): void => {
  if (runtime.sPSAWork === ptr) {
    runtime.sPSAWork = null;
  }
  runtime.operations.push('Free:PokemonSpecialAnim');
};

const resetTasks = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.tasks = [];
  runtime.operations.push('ResetTasks');
};

const resetSpriteData = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('ResetSpriteData');
};

const freeAllSpritePalettes = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('FreeAllSpritePalettes');
};

export const GetClosenessFromFriendship = (friendship: number): number => {
  if (friendship <= 100) {
    return 0;
  }
  if (friendship <= 150) {
    return 1;
  }
  if (friendship <= 200) {
    return 2;
  }
  return 3;
};

export const GetAnimTypeByItemId = (itemId: number): number => {
  if (itemId === ITEM_RARE_CANDY) {
    return PSA_ITEM_ANIM_TYPE_DEFAULT;
  }
  if (itemId === ITEM_POTION) {
    return PSA_ITEM_ANIM_TYPE_POTION;
  }
  if (itemId >= ITEM_TM01 && itemId <= ITEM_HM08) {
    return PSA_ITEM_ANIM_TYPE_TMHM;
  }
  return PSA_ITEM_ANIM_TYPE_DEFAULT;
};

const itemIdToBattleMoveId = (runtime: PokemonSpecialAnimRuntime, itemId: number): number =>
  runtime.itemToMove[itemId] ?? 0;

const checkIfItemIsTMHMOrEvolutionStone = (runtime: PokemonSpecialAnimRuntime, itemId: number): number =>
  runtime.itemKindOverride[itemId] ?? (itemId >= ITEM_TM01 && itemId <= ITEM_HM08 ? 1 : 0);

export const AllocPSA = (
  runtime: PokemonSpecialAnimRuntime,
  slotId: number,
  itemId: number,
  callback: string | null
): PokemonSpecialAnim | null => {
  if (!runtime.gMain.inBattle) {
    resetTasks(runtime);
  }
  resetSpriteData(runtime);
  freeAllSpritePalettes(runtime);
  if (runtime.allocationFails) {
    setMainCallback2(runtime, callback);
    return null;
  }
  const pokemon = runtime.party[slotId];
  const ptr: PokemonSpecialAnim = {
    state: 0,
    savedCallback: callback,
    species: pokemon.species,
    closeness: GetClosenessFromFriendship(pokemon.friendship),
    personality: pokemon.personality,
    slotId,
    itemId,
    animType: GetAnimTypeByItemId(itemId),
    pokemon: clonePokemon(pokemon),
    field_00a4: 0,
    nickname: pokemon.nickname,
    nameOfMoveForgotten: '',
    nameOfMoveToTeach: '',
    cancelDisabled: false,
    delayTimer: 0,
    sceneResources: { animType: 0 }
  };
  if (ptr.animType === PSA_ITEM_ANIM_TYPE_TMHM) {
    const moveId = itemIdToBattleMoveId(runtime, itemId);
    ptr.nameOfMoveToTeach = runtime.moveNames[moveId] ?? '';
  }
  return ptr;
};

const setWordTaskArg = (_runtime: PokemonSpecialAnimRuntime, taskId: number, ptr: PokemonSpecialAnim): void => {
  void taskId;
  void ptr;
};

export const SetUseItemAnimCallback = (
  runtime: PokemonSpecialAnimRuntime,
  taskId: number,
  func: PsaTaskFunc
): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  task.ptr.state = 0;
  task.func = func;
};

export const SetUpUseItemAnim_Normal = (runtime: PokemonSpecialAnimRuntime, ptr: PokemonSpecialAnim): void => {
  let taskId: number;
  switch (ptr.animType) {
    case PSA_ITEM_ANIM_TYPE_DEFAULT:
    case PSA_ITEM_ANIM_TYPE_POTION:
    case PSA_ITEM_ANIM_TYPE_UNUSED2:
      taskId = createTask(runtime, 'Task_UseItem_Normal', ptr);
      break;
    case PSA_ITEM_ANIM_TYPE_TMHM:
      taskId = createTask(runtime, 'Task_UseTM_NoForget', ptr);
      break;
    default:
      setMainCallback2(runtime, ptr.savedCallback);
      freePtr(runtime, ptr);
      return;
  }
  ptr.cancelDisabled = false;
  setWordTaskArg(runtime, taskId, ptr);
  setMainCallback2(runtime, 'CB2_PSA');
  runtime.sPSATaskId = taskId;
};

export const SetUpUseItemAnim_ForgetMoveAndLearnTMorHM = (
  runtime: PokemonSpecialAnimRuntime,
  ptr: PokemonSpecialAnim
): void => {
  const taskId = createTask(runtime, 'Task_ForgetMove', ptr);
  setWordTaskArg(runtime, taskId, ptr);
  setMainCallback2(runtime, 'CB2_PSA');
  runtime.sPSATaskId = taskId;
  ptr.cancelDisabled = false;
};

export const SetUpUseItemAnim_CantEvolve = (
  runtime: PokemonSpecialAnimRuntime,
  ptr: PokemonSpecialAnim
): void => {
  const taskId = createTask(runtime, 'Task_EvoStone_CantEvolve', ptr);
  setWordTaskArg(runtime, taskId, ptr);
  setMainCallback2(runtime, 'CB2_PSA');
  runtime.sPSATaskId = taskId;
};

export const StartUseItemAnim_Normal = (
  runtime: PokemonSpecialAnimRuntime,
  slotId: number,
  itemId: number,
  callback: string | null
): void => {
  const ptr = AllocPSA(runtime, slotId, itemId, callback);
  if (ptr === null) {
    setMainCallback2(runtime, callback);
  } else {
    SetUpUseItemAnim_Normal(runtime, ptr);
  }
};

export const StartUseItemAnim_ForgetMoveAndLearnTMorHM = (
  runtime: PokemonSpecialAnimRuntime,
  slotId: number,
  itemId: number,
  moveId: number,
  callback: string | null
): void => {
  const ptr = AllocPSA(runtime, slotId, itemId, callback);
  if (ptr === null) {
    setMainCallback2(runtime, callback);
  } else {
    ptr.nameOfMoveForgotten = runtime.moveNames[moveId] ?? '';
    SetUpUseItemAnim_ForgetMoveAndLearnTMorHM(runtime, ptr);
  }
};

export const StartUseItemAnim_CantEvolve = (
  runtime: PokemonSpecialAnimRuntime,
  slotId: number,
  itemId: number,
  callback: string | null
): void => {
  const ptr = AllocPSA(runtime, slotId, itemId, callback);
  if (ptr === null) {
    setMainCallback2(runtime, callback);
  } else {
    SetUpUseItemAnim_CantEvolve(runtime, ptr);
  }
};

export const VBlankCB_PSA = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('TransferPlttBuffer', 'LoadOam', 'ProcessSpriteCopyRequests');
};

export const CB2_PSA = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('RunTextPrinters', 'RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade');
};

const initPokemonSpecialAnimScene = (runtime: PokemonSpecialAnimRuntime, ptr: PokemonSpecialAnim): void => {
  ptr.sceneResources.animType = ptr.animType;
  runtime.operations.push(`InitPokemonSpecialAnimScene:${ptr.animType}`);
};

const beginNormalPaletteFade = (runtime: PokemonSpecialAnimRuntime, from: number, to: number): void => {
  runtime.gPaletteFade.active = true;
  runtime.operations.push(`BeginNormalPaletteFade:${from}->${to}`);
};

const psaPrintMessage = (runtime: PokemonSpecialAnimRuntime, messageId: number): void => {
  runtime.operations.push(`PSA_PrintMessage:${messageId}`);
};

const psaShowMessageWindow = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('PSA_ShowMessageWindow');
};

const psaHideMessageWindow = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('PSA_HideMessageWindow');
};

const psaFreeWindowBuffers = (runtime: PokemonSpecialAnimRuntime): void => {
  runtime.operations.push('PSA_FreeWindowBuffers');
};

export const Task_UseItem_Normal = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  if (!ptr.cancelDisabled && (runtime.gMain.heldKeys & (A_BUTTON | B_BUTTON)) !== 0) {
    runtime.operations.push('PSA_UseItem_CleanUpForCancel');
    SetUseItemAnimCallback(runtime, taskId, 'Task_CleanUp');
    return;
  }
  switch (ptr.state) {
    case 0:
      setVBlankCallback(runtime, null);
      initPokemonSpecialAnimScene(runtime, ptr);
      runtime.operations.push('PSA_CreateMonSpriteAtCloseness:0');
      ptr.state++;
      break;
    case 1:
      if (!runtime.sceneInitNotFinished) {
        beginNormalPaletteFade(runtime, 16, 0);
        ptr.state++;
        setVBlankCallback(runtime, 'VBlankCB_PSA');
      }
      break;
    case 2:
      if (!runtime.gPaletteFade.active) {
        ptr.state++;
      }
      break;
    case 3:
      runtime.operations.push(`PSA_SetUpZoomAnim:${ptr.closeness}`);
      ptr.state++;
      break;
    case 4:
      if (!runtime.zoomTaskActive) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 5:
      if (!runtime.levelUpVerticalSpritesTaskRunning) {
        ptr.state++;
      }
      break;
    case 6:
      runtime.operations.push(`PSA_SetUpItemUseOnMonAnim:${ptr.itemId}:${ptr.closeness}:true`);
      ptr.state++;
      break;
    case 7:
      if (!runtime.itemUseOnMonAnimActive) {
        ptr.cancelDisabled = true;
        if (ptr.closeness === 3) {
          runtime.operations.push(`PlayCry_Normal:${ptr.species}:0`);
        }
        psaShowMessageWindow(runtime);
        ptr.state++;
      }
      break;
    case 8:
      psaPrintMessage(runtime, PSA_TEXT_ITEM_USED);
      ptr.state++;
      break;
    case 9:
      if (!runtime.messagePrintTaskActive) {
        ptr.state++;
      }
      break;
    case 10:
      runtime.operations.push('PSA_SetUpZoomAnim:0');
      ptr.state++;
      break;
    case 11:
      if (!runtime.zoomTaskActive) {
        ptr.cancelDisabled = true;
        ptr.state++;
      }
      break;
    case 12:
      if ((runtime.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
        if (checkIfItemIsTMHMOrEvolutionStone(runtime, ptr.itemId) !== 2) {
          beginNormalPaletteFade(runtime, 0, 16);
          ptr.state++;
        } else {
          ptr.state += 2;
        }
      }
      break;
    case 13:
      if (!runtime.gPaletteFade.active) {
        ptr.state++;
      }
      break;
    case 14:
      setMainCallback2(runtime, ptr.savedCallback);
      psaFreeWindowBuffers(runtime);
      freePtr(runtime, ptr);
      destroyTask(runtime, taskId);
      break;
  }
};

export const Task_ForgetMove = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  switch (ptr.state) {
    case 0:
      setVBlankCallback(runtime, null);
      initPokemonSpecialAnimScene(runtime, ptr);
      runtime.operations.push('PSA_CreateMonSpriteAtCloseness:3');
      ptr.state++;
      break;
    case 1:
      if (!runtime.sceneInitNotFinished) {
        beginNormalPaletteFade(runtime, 16, 0);
        ptr.state++;
        setVBlankCallback(runtime, 'VBlankCB_PSA');
      }
      break;
    case 2:
      if (!runtime.gPaletteFade.active) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 3:
      ptr.delayTimer++;
      if (ptr.delayTimer > 30) {
        psaShowMessageWindow(runtime);
        ptr.state++;
      }
      break;
    case 4:
      psaPrintMessage(runtime, PSA_TEXT_FORGET_1);
      ptr.state++;
      break;
    case 5:
      if (!runtime.messagePrintTaskActive) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 6:
      ptr.delayTimer++;
      if (ptr.delayTimer > 30) {
        psaPrintMessage(runtime, PSA_TEXT_FORGET_2_AND);
        ptr.state++;
      }
      break;
    case 7:
      if (!runtime.messagePrintTaskActive) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 8:
      ptr.delayTimer++;
      if (ptr.delayTimer > 30) {
        runtime.operations.push(`PlaySE:${SE_M_SPIT_UP}`);
        psaPrintMessage(runtime, PSA_TEXT_FORGET_POOF);
        runtime.operations.push('PSA_DarkenMonSprite');
        ptr.state++;
      }
      break;
    case 9:
      if (!((runtime.poofAnimReturn | (runtime.messagePrintTaskActive ? 1 : 0)) !== 0)) {
        runtime.operations.push('PSA_AfterPoof_ClearMessageWindow');
        ptr.state++;
      }
      break;
    case 10:
      psaPrintMessage(runtime, PSA_TEXT_FORGET_FORGOT);
      ptr.state++;
      break;
    case 11:
      if (!runtime.messagePrintTaskActive) {
        psaPrintMessage(runtime, PSA_TEXT_FORGET_AND);
        ptr.state++;
      }
      break;
    case 12:
      if (!runtime.messagePrintTaskActive) {
        psaHideMessageWindow(runtime);
        ptr.state++;
      }
      break;
    case 13:
      SetUseItemAnimCallback(runtime, taskId, 'Task_MachineSet');
      break;
  }
};

export const Task_EvoStone_CantEvolve = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  if (!ptr.cancelDisabled && (runtime.gMain.heldKeys & B_BUTTON) !== 0) {
    SetUseItemAnimCallback(runtime, taskId, 'Task_CleanUp');
    return;
  }
  switch (ptr.state) {
    case 0:
      setVBlankCallback(runtime, null);
      initPokemonSpecialAnimScene(runtime, ptr);
      runtime.operations.push('PSA_CreateMonSpriteAtCloseness:0');
      ptr.state++;
      break;
    case 1:
      if (!runtime.sceneInitNotFinished) {
        beginNormalPaletteFade(runtime, 16, 0);
        ptr.state++;
        setVBlankCallback(runtime, 'VBlankCB_PSA');
      }
      break;
    case 2:
      if (!runtime.gPaletteFade.active) {
        ptr.state++;
      }
      break;
    case 3:
      runtime.operations.push(`PSA_SetUpZoomAnim:${ptr.closeness}`);
      ptr.state++;
      break;
    case 4:
      runtime.operations.push(`PSA_SetUpItemUseOnMonAnim:${ptr.itemId}:${ptr.closeness}:false`);
      ptr.state++;
      break;
    case 5:
      if (!runtime.itemUseOnMonAnimActive) {
        psaShowMessageWindow(runtime);
        ptr.state++;
      }
      break;
    case 6:
      psaPrintMessage(runtime, PSA_TEXT_HUH);
      ptr.state++;
      break;
    case 7:
      if (!runtime.messagePrintTaskActive) {
        ptr.cancelDisabled = true;
        ptr.state++;
      }
      break;
    case 8:
      if ((runtime.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
        beginNormalPaletteFade(runtime, 0, 16);
        ptr.state++;
      }
      break;
    case 9:
      if (!runtime.gPaletteFade.active) {
        setMainCallback2(runtime, ptr.savedCallback);
        psaFreeWindowBuffers(runtime);
        freePtr(runtime, ptr);
        destroyTask(runtime, taskId);
      }
      break;
  }
};

export const Task_UseTM_NoForget = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  if ((runtime.gMain.newKeys & B_BUTTON) !== 0) {
    SetUseItemAnimCallback(runtime, taskId, 'Task_CleanUp');
    return;
  }
  switch (ptr.state) {
    case 0:
      setVBlankCallback(runtime, null);
      initPokemonSpecialAnimScene(runtime, ptr);
      runtime.operations.push('PSA_CreateMonSpriteAtCloseness:3');
      ptr.state++;
      break;
    case 1:
      if (!runtime.sceneInitNotFinished) {
        beginNormalPaletteFade(runtime, 16, 0);
        ptr.state++;
        setVBlankCallback(runtime, 'VBlankCB_PSA');
      }
      break;
    case 2:
      if (!runtime.gPaletteFade.active) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 3:
      ptr.delayTimer++;
      if (ptr.delayTimer > 20) {
        SetUseItemAnimCallback(runtime, taskId, 'Task_MachineSet');
      }
      break;
  }
};

export const Task_MachineSet = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  if (!ptr.cancelDisabled && (runtime.gMain.newKeys & B_BUTTON) !== 0) {
    runtime.operations.push('PSA_UseTM_CleanUpForCancel');
    SetUseItemAnimCallback(runtime, taskId, 'Task_CleanUp');
    return;
  }
  switch (ptr.state) {
    case 0:
      runtime.operations.push(`CreateItemIconSpriteAtMaxCloseness:${ptr.itemId}`);
      ptr.delayTimer = 0;
      ptr.state++;
      break;
    case 1:
      psaShowMessageWindow(runtime);
      psaPrintMessage(runtime, PSA_TEXT_MACHINE_SET);
      ptr.state++;
      break;
    case 2:
      if (!runtime.messagePrintTaskActive) {
        psaHideMessageWindow(runtime);
        ptr.state++;
      }
      break;
    case 3:
      runtime.operations.push('PSA_UseTM_SetUpMachineSetWobble');
      ptr.state++;
      break;
    case 4:
      if (!runtime.machineSetWobbleReturn) {
        ptr.state++;
      }
      break;
    case 5:
      runtime.operations.push('PSA_UseTM_SetUpZoomOutAnim');
      ptr.state++;
      break;
    case 6:
      if (!runtime.zoomOutAnimReturn) {
        ptr.delayTimer = 0;
        ptr.state++;
      }
      break;
    case 7:
      ptr.delayTimer++;
      if (ptr.delayTimer > 30) {
        psaShowMessageWindow(runtime);
        psaPrintMessage(runtime, PSA_TEXT_LEARNED_MOVE);
        ptr.state++;
      }
      break;
    case 8:
      if (!runtime.messagePrintTaskActive) {
        runtime.operations.push(`PlayFanfare:${MUS_LEVEL_UP}`);
        ptr.cancelDisabled = true;
        ptr.state++;
      }
      break;
    case 9:
      if (runtime.fanfareTaskInactive) {
        SetUseItemAnimCallback(runtime, taskId, 'Task_CleanUp');
      }
      break;
  }
};

export const Task_CleanUp = (runtime: PokemonSpecialAnimRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  const ptr = task.ptr;
  switch (ptr.state) {
    case 0:
      setVBlankCallback(runtime, 'VBlankCB_PSA');
      runtime.operations.push('BlendPalettes:ALL:16:BLACK');
      ptr.state++;
      break;
    case 1:
      if (!runtime.gPaletteFade.active && (ptr.field_00a4 !== 1 || runtime.cryFinished)) {
        runtime.sCancelDisabled = ptr.cancelDisabled;
        setMainCallback2(runtime, ptr.savedCallback);
        destroyTask(runtime, taskId);
        psaFreeWindowBuffers(runtime);
        freePtr(runtime, ptr);
      }
      break;
  }
};

export const RunPsaTask = (runtime: PokemonSpecialAnimRuntime, taskId = runtime.sPSATaskId): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  switch (task.func) {
    case 'Task_UseItem_Normal':
      Task_UseItem_Normal(runtime, taskId);
      break;
    case 'Task_ForgetMove':
      Task_ForgetMove(runtime, taskId);
      break;
    case 'Task_EvoStone_CantEvolve':
      Task_EvoStone_CantEvolve(runtime, taskId);
      break;
    case 'Task_UseTM_NoForget':
      Task_UseTM_NoForget(runtime, taskId);
      break;
    case 'Task_MachineSet':
      Task_MachineSet(runtime, taskId);
      break;
    case 'Task_CleanUp':
      Task_CleanUp(runtime, taskId);
      break;
  }
};

export const GetPSAStruct = (runtime: PokemonSpecialAnimRuntime): PokemonSpecialAnim | null =>
  runtime.tasks[runtime.sPSATaskId]?.ptr ?? null;

export const PSA_GetPokemon = (runtime: PokemonSpecialAnimRuntime): PokemonSpecialAnimPokemon | null => {
  runtime.sPSAWork = GetPSAStruct(runtime);
  return runtime.sPSAWork?.pokemon ?? null;
};

export const PSA_GetSceneWork = (runtime: PokemonSpecialAnimRuntime): PokemonSpecialAnimScene | null =>
  GetPSAStruct(runtime)?.sceneResources ?? null;

export const PSA_GetItemId = (runtime: PokemonSpecialAnimRuntime): number =>
  GetPSAStruct(runtime)?.itemId ?? 0;

export const PSA_GetNameOfMoveForgotten = (runtime: PokemonSpecialAnimRuntime): string =>
  GetPSAStruct(runtime)?.nameOfMoveForgotten ?? '';

export const PSA_GetNameOfMoveToTeach = (runtime: PokemonSpecialAnimRuntime): string =>
  GetPSAStruct(runtime)?.nameOfMoveToTeach ?? '';

export const PSA_CopyMonNickname = (runtime: PokemonSpecialAnimRuntime): string =>
  GetPSAStruct(runtime)?.nickname ?? '';

export const PSA_GetMonNickname = PSA_CopyMonNickname;

export const PSA_GetAnimType = (runtime: PokemonSpecialAnimRuntime): number =>
  GetPSAStruct(runtime)?.animType ?? 0;

export const PSA_GetMonSpecies = (runtime: PokemonSpecialAnimRuntime): number =>
  GetPSAStruct(runtime)?.species ?? 0;

export const PSA_GetMonPersonality = (runtime: PokemonSpecialAnimRuntime): number =>
  GetPSAStruct(runtime)?.personality ?? 0;

export const GetMonLevelUpWindowStats = (pokemon: PokemonSpecialAnimPokemon): number[] => [
  pokemon.maxHP,
  pokemon.atk,
  pokemon.def,
  pokemon.speed,
  pokemon.spatk,
  pokemon.spdef
];

export const PSA_IsCancelDisabled = (runtime: PokemonSpecialAnimRuntime): boolean =>
  runtime.sCancelDisabled;
