import { calcCRC16WithTable } from './decompUtil';

export const RAM_SCRIPT_MAGIC = 51;

export const SCRIPT_MODE_STOPPED = 0;
export const SCRIPT_MODE_BYTECODE = 1;
export const SCRIPT_MODE_NATIVE = 2;

export const CONTEXT_RUNNING = 0;
export const CONTEXT_WAITING = 1;
export const CONTEXT_SHUTDOWN = 2;

export const MAP_SCRIPT_ON_LOAD = 1;
export const MAP_SCRIPT_ON_FRAME_TABLE = 2;
export const MAP_SCRIPT_ON_TRANSITION = 3;
export const MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE = 4;
export const MAP_SCRIPT_ON_RESUME = 5;
export const MAP_SCRIPT_ON_DIVE_WARP = 6;
export const MAP_SCRIPT_ON_RETURN_TO_FIELD = 7;

export const QL_STATE_PLAYBACK_LAST = 3;
export const MAP_UNDEFINED = 0xffff;
export const RAM_SCRIPT_SIZE = 995;
export const SCRIPT_STACK_SIZE = 20;
export const SCRIPT_DATA_COUNT = 4;

export type ScriptPointer = {
  bytes: Uint8Array;
  offset: number;
  label?: string;
};

export type NativeScriptFunc = () => boolean;
export type ScrCmdFunc = (ctx: ScriptContext) => boolean;

export type ScriptContext = {
  stackDepth: number;
  mode: number;
  comparisonResult: number;
  nativePtr: NativeScriptFunc | null;
  scriptPtr: ScriptPointer | null;
  stack: Array<ScriptPointer | null>;
  cmdTable: ScrCmdFunc[];
  cmdTableEnd: number;
  data: number[];
};

export type RamScriptData = {
  magic: number;
  mapGroup: number;
  mapNum: number;
  objectId: number;
  script: Uint8Array;
};

export type RamScript = {
  checksum: number;
  data: RamScriptData;
};

export type ScriptRuntime = {
  gWalkAwayFromSignInhibitTimer: number;
  gRamScriptRetAddr: ScriptPointer | null;
  sGlobalScriptContextStatus: number;
  sGlobalScriptContext: ScriptContext;
  sImmediateScriptContext: ScriptContext;
  sLockFieldControls: boolean;
  sMsgBoxWalkawayDisabled: boolean;
  sMsgBoxIsCancelable: boolean;
  sQuestLogInput: number;
  sQuestLogInputIsDpad: boolean;
  sMsgIsSignpost: boolean;
  gScriptCmdTable: ScrCmdFunc[];
  gMapHeader: { mapScripts: Uint8Array | null };
  pointerTable: Map<number, ScriptPointer>;
  vars: Map<number, number>;
  gQuestLogState: number;
  gSaveBlock1Ptr: {
    location: { mapGroup: number; mapNum: number };
    ramScript: RamScript;
  };
  validateSavedWonderCardResult: boolean;
  resetContextNpcTextColorCount: number;
  nullScriptHaltCount: number;
};

export const createScriptPointer = (
  bytes: Uint8Array | readonly number[],
  offset = 0,
  label?: string
): ScriptPointer => ({
  bytes: bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes),
  offset,
  label
});

export const cloneScriptPointer = (ptr: ScriptPointer): ScriptPointer => ({
  bytes: ptr.bytes,
  offset: ptr.offset,
  label: ptr.label
});

export const gNullScriptPtr = createScriptPointer([], 0, 'gNullScriptPtr');

export const makeScriptContext = (): ScriptContext => ({
  stackDepth: 0,
  mode: SCRIPT_MODE_STOPPED,
  comparisonResult: 0,
  nativePtr: null,
  scriptPtr: null,
  stack: Array<ScriptPointer | null>(SCRIPT_STACK_SIZE).fill(null),
  cmdTable: [],
  cmdTableEnd: 0,
  data: Array(SCRIPT_DATA_COUNT).fill(0)
});

const makeRamScript = (): RamScript => ({
  checksum: 0,
  data: {
    magic: 0,
    mapGroup: 0,
    mapNum: 0,
    objectId: 0,
    script: new Uint8Array(RAM_SCRIPT_SIZE)
  }
});

export const createScriptRuntime = (cmdTable: ScrCmdFunc[] = []): ScriptRuntime => ({
  gWalkAwayFromSignInhibitTimer: 0,
  gRamScriptRetAddr: null,
  sGlobalScriptContextStatus: CONTEXT_SHUTDOWN,
  sGlobalScriptContext: makeScriptContext(),
  sImmediateScriptContext: makeScriptContext(),
  sLockFieldControls: false,
  sMsgBoxWalkawayDisabled: false,
  sMsgBoxIsCancelable: false,
  sQuestLogInput: 0,
  sQuestLogInputIsDpad: false,
  sMsgIsSignpost: false,
  gScriptCmdTable: cmdTable,
  gMapHeader: { mapScripts: null },
  pointerTable: new Map<number, ScriptPointer>(),
  vars: new Map<number, number>(),
  gQuestLogState: 0,
  gSaveBlock1Ptr: {
    location: { mapGroup: 0, mapNum: 0 },
    ramScript: makeRamScript()
  },
  validateSavedWonderCardResult: false,
  resetContextNpcTextColorCount: 0,
  nullScriptHaltCount: 0
});

export const InitScriptContext = (
  ctx: ScriptContext,
  cmdTable: ScrCmdFunc[],
  cmdTableEnd: number = cmdTable.length
): void => {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptPtr = null;
  ctx.stackDepth = 0;
  ctx.nativePtr = null;
  ctx.cmdTable = cmdTable;
  ctx.cmdTableEnd = cmdTableEnd;

  for (let i = 0; i < ctx.data.length; i += 1) {
    ctx.data[i] = 0;
  }

  for (let i = 0; i < ctx.stack.length; i += 1) {
    ctx.stack[i] = null;
  }
};

export const SetupBytecodeScript = (ctx: ScriptContext, ptr: ScriptPointer): number => {
  ctx.scriptPtr = ptr;
  ctx.mode = SCRIPT_MODE_BYTECODE;
  return 1;
};

export const SetupNativeScript = (ctx: ScriptContext, ptr: NativeScriptFunc): void => {
  ctx.mode = SCRIPT_MODE_NATIVE;
  ctx.nativePtr = ptr;
};

export const StopScript = (ctx: ScriptContext): void => {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptPtr = null;
};

export class NullScriptHaltError extends Error {
  constructor() {
    super('RunScriptCommand reached gNullScriptPtr halt');
  }
}

export const ScriptReadByte = (ctx: ScriptContext): number => {
  const ptr = ctx.scriptPtr;
  if (ptr === null) {
    return 0;
  }
  const value = ptr.bytes[ptr.offset] ?? 0;
  ptr.offset += 1;
  return value & 0xff;
};

export const RunScriptCommand = (runtime: ScriptRuntime, ctx: ScriptContext): boolean => {
  switch (ctx.mode) {
    case SCRIPT_MODE_STOPPED:
      return false;
    case SCRIPT_MODE_NATIVE:
      if (ctx.nativePtr) {
        if (ctx.nativePtr() === true) {
          ctx.mode = SCRIPT_MODE_BYTECODE;
        }
        return true;
      }
      ctx.mode = SCRIPT_MODE_BYTECODE;
    // fallthrough
    case SCRIPT_MODE_BYTECODE:
      while (true) {
        if (ctx.scriptPtr === null) {
          ctx.mode = SCRIPT_MODE_STOPPED;
          return false;
        }

        if (ctx.scriptPtr === gNullScriptPtr) {
          runtime.nullScriptHaltCount += 1;
          throw new NullScriptHaltError();
        }

        const cmdCode = ScriptReadByte(ctx);
        const cmdFunc = ctx.cmdTable[cmdCode];

        if (cmdCode >= ctx.cmdTableEnd || cmdFunc === undefined) {
          ctx.mode = SCRIPT_MODE_STOPPED;
          return false;
        }

        if (cmdFunc(ctx) === true) {
          return true;
        }
      }
    default:
      return true;
  }
};

export const ScriptPush = (ctx: ScriptContext, ptr: ScriptPointer | null): number => {
  if (ctx.stackDepth + 1 >= ctx.stack.length) {
    return 1;
  }

  ctx.stack[ctx.stackDepth] = ptr;
  ctx.stackDepth += 1;
  return 0;
};

export const ScriptPop = (ctx: ScriptContext): ScriptPointer | null => {
  if (ctx.stackDepth === 0) {
    return null;
  }

  ctx.stackDepth -= 1;
  return ctx.stack[ctx.stackDepth];
};

export const ScriptJump = (ctx: ScriptContext, ptr: ScriptPointer): void => {
  ctx.scriptPtr = ptr;
};

export const ScriptCall = (ctx: ScriptContext, ptr: ScriptPointer): void => {
  ScriptPush(ctx, ctx.scriptPtr);
  ctx.scriptPtr = ptr;
};

export const ScriptReturn = (ctx: ScriptContext): void => {
  ctx.scriptPtr = ScriptPop(ctx);
};

export const ScriptReadHalfword = (ctx: ScriptContext): number => {
  let value = ScriptReadByte(ctx);
  value |= ScriptReadByte(ctx) << 8;
  return value & 0xffff;
};

export const ScriptReadWord = (ctx: ScriptContext): number => {
  const value0 = ScriptReadByte(ctx);
  const value1 = ScriptReadByte(ctx);
  const value2 = ScriptReadByte(ctx);
  const value3 = ScriptReadByte(ctx);
  return ((((((value3 << 8) + value2) << 8) + value1) << 8) + value0) >>> 0;
};

export const LockPlayerFieldControls = (runtime: ScriptRuntime): void => {
  runtime.sLockFieldControls = true;
};

export const UnlockPlayerFieldControls = (runtime: ScriptRuntime): void => {
  runtime.sLockFieldControls = false;
};

export const ArePlayerFieldControlsLocked = (runtime: ScriptRuntime): boolean => runtime.sLockFieldControls;

export const SetQuestLogInputIsDpadFlag = (runtime: ScriptRuntime): void => {
  runtime.sQuestLogInputIsDpad = true;
};

export const ClearQuestLogInputIsDpadFlag = (runtime: ScriptRuntime): void => {
  runtime.sQuestLogInputIsDpad = false;
};

export const IsQuestLogInputDpad = (runtime: ScriptRuntime): boolean => {
  if (runtime.sQuestLogInputIsDpad === true) {
    return true;
  } else {
    return false;
  }
};

export const RegisterQuestLogInput = (runtime: ScriptRuntime, value: number): void => {
  runtime.sQuestLogInput = value & 0xff;
};

export const ClearQuestLogInput = (runtime: ScriptRuntime): void => {
  runtime.sQuestLogInput = 0;
};

export const GetRegisteredQuestLogInput = (runtime: ScriptRuntime): number => runtime.sQuestLogInput;

export const DisableMsgBoxWalkaway = (runtime: ScriptRuntime): void => {
  runtime.sMsgBoxWalkawayDisabled = true;
};

export const EnableMsgBoxWalkaway = (runtime: ScriptRuntime): void => {
  runtime.sMsgBoxWalkawayDisabled = false;
};

export const IsMsgBoxWalkawayDisabled = (runtime: ScriptRuntime): boolean => runtime.sMsgBoxWalkawayDisabled;

export const SetWalkingIntoSignVars = (runtime: ScriptRuntime): void => {
  runtime.gWalkAwayFromSignInhibitTimer = 6;
  runtime.sMsgBoxIsCancelable = true;
};

export const ClearMsgBoxCancelableState = (runtime: ScriptRuntime): void => {
  runtime.sMsgBoxIsCancelable = false;
};

export const CanWalkAwayToCancelMsgBox = (runtime: ScriptRuntime): boolean => {
  if (runtime.sMsgBoxIsCancelable === true) {
    return true;
  } else {
    return false;
  }
};

export const MsgSetSignpost = (runtime: ScriptRuntime): void => {
  runtime.sMsgIsSignpost = true;
};

export const MsgSetNotSignpost = (runtime: ScriptRuntime): void => {
  runtime.sMsgIsSignpost = false;
};

export const IsMsgSignpost = (runtime: ScriptRuntime): boolean => {
  if (runtime.sMsgIsSignpost === true) {
    return true;
  } else {
    return false;
  }
};

export const ResetContextNpcTextColor = (runtime: ScriptRuntime): void => {
  runtime.resetContextNpcTextColorCount += 1;
};

export const ResetFacingNpcOrSignpostVars = (runtime: ScriptRuntime): void => {
  ResetContextNpcTextColor(runtime);
  MsgSetNotSignpost(runtime);
};

export const ScriptContext_IsEnabled = (runtime: ScriptRuntime): boolean => {
  if (runtime.sGlobalScriptContextStatus === CONTEXT_RUNNING) {
    return true;
  } else {
    return false;
  }
};

export const ScriptContext_Init = (runtime: ScriptRuntime): void => {
  InitScriptContext(runtime.sGlobalScriptContext, runtime.gScriptCmdTable, runtime.gScriptCmdTable.length);
  runtime.sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
};

export const ScriptContext_RunScript = (runtime: ScriptRuntime): boolean => {
  if (runtime.sGlobalScriptContextStatus === CONTEXT_SHUTDOWN) {
    return false;
  }

  if (runtime.sGlobalScriptContextStatus === CONTEXT_WAITING) {
    return false;
  }

  LockPlayerFieldControls(runtime);

  if (!RunScriptCommand(runtime, runtime.sGlobalScriptContext)) {
    runtime.sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
    UnlockPlayerFieldControls(runtime);
    return false;
  }

  return true;
};

export const ScriptContext_SetupScript = (runtime: ScriptRuntime, ptr: ScriptPointer): void => {
  ClearMsgBoxCancelableState(runtime);
  EnableMsgBoxWalkaway(runtime);
  ClearQuestLogInputIsDpadFlag(runtime);

  InitScriptContext(runtime.sGlobalScriptContext, runtime.gScriptCmdTable, runtime.gScriptCmdTable.length);
  SetupBytecodeScript(runtime.sGlobalScriptContext, ptr);
  LockPlayerFieldControls(runtime);
  runtime.sGlobalScriptContextStatus = CONTEXT_RUNNING;
};

export const ScriptContext_Stop = (runtime: ScriptRuntime): void => {
  runtime.sGlobalScriptContextStatus = CONTEXT_WAITING;
};

export const ScriptContext_Enable = (runtime: ScriptRuntime): void => {
  runtime.sGlobalScriptContextStatus = CONTEXT_RUNNING;
  LockPlayerFieldControls(runtime);
};

export const RunScriptImmediately = (runtime: ScriptRuntime, ptr: ScriptPointer): void => {
  InitScriptContext(runtime.sImmediateScriptContext, runtime.gScriptCmdTable, runtime.gScriptCmdTable.length);
  SetupBytecodeScript(runtime.sImmediateScriptContext, ptr);
  while (RunScriptCommand(runtime, runtime.sImmediateScriptContext) === true) {
    // Loop exactly like the C helper until bytecode stops.
  }
};

const read16 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8)) & 0xffff;

const read32 = (bytes: Uint8Array, offset: number): number =>
  (((bytes[offset] ?? 0)
    | ((bytes[offset + 1] ?? 0) << 8)
    | ((bytes[offset + 2] ?? 0) << 16)
    | ((bytes[offset + 3] ?? 0) << 24)) >>> 0);

const T2_READ_PTR = (runtime: ScriptRuntime, bytes: Uint8Array, offset: number): ScriptPointer | null => {
  const ptrId = read32(bytes, offset);
  return runtime.pointerTable.get(ptrId) ?? null;
};

export const MapHeaderGetScriptTable = (runtime: ScriptRuntime, tag: number): ScriptPointer | null => {
  const mapScripts = runtime.gMapHeader.mapScripts;

  if (mapScripts === null) {
    return null;
  }

  let offset = 0;
  while (true) {
    if ((mapScripts[offset] ?? 0) === 0) {
      return null;
    }
    if ((mapScripts[offset] ?? 0) === (tag & 0xff)) {
      offset += 1;
      return T2_READ_PTR(runtime, mapScripts, offset);
    }
    offset += 5;
  }
};

export const MapHeaderRunScriptType = (runtime: ScriptRuntime, tag: number): void => {
  const ptr = MapHeaderGetScriptTable(runtime, tag);
  if (ptr !== null) {
    RunScriptImmediately(runtime, cloneScriptPointer(ptr));
  }
};

export const VarGet = (runtime: ScriptRuntime, index: number): number => runtime.vars.get(index & 0xffff) ?? 0;

export const MapHeaderCheckScriptTable = (runtime: ScriptRuntime, tag: number): ScriptPointer | null => {
  const tablePtr = MapHeaderGetScriptTable(runtime, tag);

  if (tablePtr === null) {
    return null;
  }

  const bytes = tablePtr.bytes;
  let offset = tablePtr.offset;
  while (true) {
    let varIndex1 = read16(bytes, offset);
    if (!varIndex1) {
      return null;
    }
    offset += 2;

    const varIndex2 = read16(bytes, offset);
    offset += 2;

    if (VarGet(runtime, varIndex1) === VarGet(runtime, varIndex2)) {
      return T2_READ_PTR(runtime, bytes, offset);
    }
    offset += 4;
    varIndex1 = varIndex1 & 0xffff;
  }
};

export const RunOnLoadMapScript = (runtime: ScriptRuntime): void => {
  MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_LOAD);
};

export const RunOnTransitionMapScript = (runtime: ScriptRuntime): void => {
  MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_TRANSITION);
};

export const RunOnResumeMapScript = (runtime: ScriptRuntime): void => {
  MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_RESUME);
};

export const RunOnReturnToFieldMapScript = (runtime: ScriptRuntime): void => {
  MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_RETURN_TO_FIELD);
};

export const RunOnDiveWarpMapScript = (runtime: ScriptRuntime): void => {
  MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_DIVE_WARP);
};

export const TryRunOnFrameMapScript = (runtime: ScriptRuntime): boolean => {
  if (runtime.gQuestLogState === QL_STATE_PLAYBACK_LAST) {
    return false;
  }

  const ptr = MapHeaderCheckScriptTable(runtime, MAP_SCRIPT_ON_FRAME_TABLE);

  if (!ptr) {
    return false;
  }

  ScriptContext_SetupScript(runtime, cloneScriptPointer(ptr));
  return true;
};

export const TryRunOnWarpIntoMapScript = (runtime: ScriptRuntime): void => {
  const ptr = MapHeaderCheckScriptTable(runtime, MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE);
  if (ptr) {
    RunScriptImmediately(runtime, cloneScriptPointer(ptr));
  }
};

const serializeRamScriptData = (data: RamScriptData): Uint8Array => {
  const bytes = new Uint8Array(4 + RAM_SCRIPT_SIZE);
  bytes[0] = data.magic & 0xff;
  bytes[1] = data.mapGroup & 0xff;
  bytes[2] = data.mapNum & 0xff;
  bytes[3] = data.objectId & 0xff;
  bytes.set(data.script.subarray(0, RAM_SCRIPT_SIZE), 4);
  return bytes;
};

export const CalculateRamScriptChecksum = (runtime: ScriptRuntime): number =>
  calcCRC16WithTable(serializeRamScriptData(runtime.gSaveBlock1Ptr.ramScript.data));

export const ClearRamScript = (runtime: ScriptRuntime): void => {
  runtime.gSaveBlock1Ptr.ramScript = makeRamScript();
};

export const InitRamScript = (
  runtime: ScriptRuntime,
  script: Uint8Array | readonly number[],
  scriptSize: number,
  mapGroup: number,
  mapNum: number,
  objectId: number
): boolean => {
  const source = script instanceof Uint8Array ? script : Uint8Array.from(script);
  ClearRamScript(runtime);

  if (scriptSize > RAM_SCRIPT_SIZE) {
    return false;
  }

  const scriptData = runtime.gSaveBlock1Ptr.ramScript.data;
  scriptData.magic = RAM_SCRIPT_MAGIC;
  scriptData.mapGroup = mapGroup & 0xff;
  scriptData.mapNum = mapNum & 0xff;
  scriptData.objectId = objectId & 0xff;
  scriptData.script.set(source.subarray(0, scriptSize));
  runtime.gSaveBlock1Ptr.ramScript.checksum = CalculateRamScriptChecksum(runtime);
  return true;
};

export const GetRamScript = (
  runtime: ScriptRuntime,
  objectId: number,
  script: ScriptPointer
): ScriptPointer => {
  const scriptData = runtime.gSaveBlock1Ptr.ramScript.data;
  runtime.gRamScriptRetAddr = null;
  if (scriptData.magic !== RAM_SCRIPT_MAGIC) {
    return script;
  }
  if (scriptData.mapGroup !== runtime.gSaveBlock1Ptr.location.mapGroup) {
    return script;
  }
  if (scriptData.mapNum !== runtime.gSaveBlock1Ptr.location.mapNum) {
    return script;
  }
  if (scriptData.objectId !== (objectId & 0xff)) {
    return script;
  }
  if (CalculateRamScriptChecksum(runtime) !== runtime.gSaveBlock1Ptr.ramScript.checksum) {
    ClearRamScript(runtime);
    return script;
  } else {
    runtime.gRamScriptRetAddr = script;
    return createScriptPointer(scriptData.script, 0, 'ramScript');
  }
};

export const MAP_GROUP = (map: number): number => (map >> 8) & 0xff;
export const MAP_NUM = (map: number): number => map & 0xff;

export const ValidateRamScript = (runtime: ScriptRuntime): boolean => {
  const scriptData = runtime.gSaveBlock1Ptr.ramScript.data;
  if (scriptData.magic !== RAM_SCRIPT_MAGIC) {
    return false;
  }
  if (scriptData.mapGroup !== MAP_GROUP(MAP_UNDEFINED)) {
    return false;
  }
  if (scriptData.mapNum !== MAP_NUM(MAP_UNDEFINED)) {
    return false;
  }
  if (scriptData.objectId !== 0xff) {
    return false;
  }
  if (CalculateRamScriptChecksum(runtime) !== runtime.gSaveBlock1Ptr.ramScript.checksum) {
    return false;
  }
  return true;
};

export const ValidateSavedWonderCard = (runtime: ScriptRuntime): boolean => runtime.validateSavedWonderCardResult;

export const GetSavedRamScriptIfValid = (runtime: ScriptRuntime): ScriptPointer | null => {
  const scriptData = runtime.gSaveBlock1Ptr.ramScript.data;
  if (!ValidateSavedWonderCard(runtime)) {
    return null;
  }
  if (scriptData.magic !== RAM_SCRIPT_MAGIC) {
    return null;
  }
  if (scriptData.mapGroup !== MAP_GROUP(MAP_UNDEFINED)) {
    return null;
  }
  if (scriptData.mapNum !== MAP_NUM(MAP_UNDEFINED)) {
    return null;
  }
  if (scriptData.objectId !== 0xff) {
    return null;
  }
  if (CalculateRamScriptChecksum(runtime) !== runtime.gSaveBlock1Ptr.ramScript.checksum) {
    ClearRamScript(runtime);
    return null;
  } else {
    return createScriptPointer(scriptData.script, 0, 'savedRamScript');
  }
};

export const InitRamScript_NoObjectEvent = (
  runtime: ScriptRuntime,
  script: Uint8Array | readonly number[],
  scriptSize: number
): void => {
  let size = scriptSize;
  if (size > RAM_SCRIPT_SIZE) {
    size = RAM_SCRIPT_SIZE;
  }
  InitRamScript(runtime, script, size, MAP_GROUP(MAP_UNDEFINED), MAP_NUM(MAP_UNDEFINED), 0xff);
};
