import { describe, expect, it } from 'vitest';
import {
  ArePlayerFieldControlsLocked,
  CONTEXT_RUNNING,
  CONTEXT_SHUTDOWN,
  CONTEXT_WAITING,
  CalculateRamScriptChecksum,
  CanWalkAwayToCancelMsgBox,
  ClearQuestLogInput,
  DisableMsgBoxWalkaway,
  GetRamScript,
  GetRegisteredQuestLogInput,
  GetSavedRamScriptIfValid,
  InitRamScript,
  InitRamScript_NoObjectEvent,
  InitScriptContext,
  IsMsgBoxWalkawayDisabled,
  IsMsgSignpost,
  IsQuestLogInputDpad,
  MAP_GROUP,
  MAP_NUM,
  MAP_SCRIPT_ON_FRAME_TABLE,
  MAP_SCRIPT_ON_LOAD,
  MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE,
  MapHeaderRunScriptType,
  MAP_UNDEFINED,
  MsgSetSignpost,
  NullScriptHaltError,
  QL_STATE_PLAYBACK_LAST,
  RAM_SCRIPT_MAGIC,
  RAM_SCRIPT_SIZE,
  RegisterQuestLogInput,
  ResetFacingNpcOrSignpostVars,
  RunOnLoadMapScript,
  RunScriptCommand,
  SCRIPT_MODE_BYTECODE,
  SCRIPT_MODE_NATIVE,
  SCRIPT_MODE_STOPPED,
  ScriptCall,
  ScriptContext_Enable,
  ScriptContext_Init,
  ScriptContext_IsEnabled,
  ScriptContext_RunScript,
  ScriptContext_SetupScript,
  ScriptContext_Stop,
  ScriptJump,
  ScriptPop,
  ScriptPush,
  ScriptReadHalfword,
  ScriptReadWord,
  ScriptReturn,
  SetQuestLogInputIsDpadFlag,
  SetWalkingIntoSignVars,
  SetupBytecodeScript,
  SetupNativeScript,
  StopScript,
  TryRunOnFrameMapScript,
  TryRunOnWarpIntoMapScript,
  ValidateRamScript,
  createScriptPointer,
  createScriptRuntime,
  gNullScriptPtr,
} from '../src/game/decompScript';
import type { ScrCmdFunc } from '../src/game/decompScript';

const ptrBytes = (id: number): number[] => [id & 0xff, (id >> 8) & 0xff, (id >> 16) & 0xff, (id >> 24) & 0xff];
const halfword = (value: number): number[] => [value & 0xff, (value >> 8) & 0xff];

describe('decompScript', () => {
  it('initializes, starts, stops, and reads bytecode in little-endian order', () => {
    const ctx = createScriptRuntime().sGlobalScriptContext;
    const cmdTable: ScrCmdFunc[] = [() => true];
    ctx.mode = SCRIPT_MODE_NATIVE;
    ctx.scriptPtr = createScriptPointer([1]);
    ctx.stackDepth = 3;
    ctx.nativePtr = () => false;
    ctx.data = [1, 2, 3, 4];
    ctx.stack[0] = createScriptPointer([9]);

    InitScriptContext(ctx, cmdTable);

    expect(ctx.mode).toBe(SCRIPT_MODE_STOPPED);
    expect(ctx.scriptPtr).toBeNull();
    expect(ctx.stackDepth).toBe(0);
    expect(ctx.nativePtr).toBeNull();
    expect(ctx.cmdTable).toBe(cmdTable);
    expect(ctx.data).toEqual([0, 0, 0, 0]);
    expect(ctx.stack.every((entry) => entry === null)).toBe(true);

    const script = createScriptPointer([0x34, 0x12, 0xef, 0xcd, 0xab, 0x89]);
    expect(SetupBytecodeScript(ctx, script)).toBe(1);
    expect(ctx.mode).toBe(SCRIPT_MODE_BYTECODE);
    expect(ScriptReadHalfword(ctx)).toBe(0x1234);
    expect(ScriptReadWord(ctx)).toBe(0x89abcdef);

    StopScript(ctx);
    expect(ctx.mode).toBe(SCRIPT_MODE_STOPPED);
    expect(ctx.scriptPtr).toBeNull();
  });

  it('RunScriptCommand matches native and bytecode command-loop control flow', () => {
    const calls: string[] = [];
    const runtime = createScriptRuntime([
      (ctx) => {
        calls.push(`skip@${ctx.scriptPtr?.offset}`);
        return false;
      },
      (ctx) => {
        calls.push(`wait@${ctx.scriptPtr?.offset}`);
        return true;
      },
    ]);
    const ctx = runtime.sGlobalScriptContext;
    InitScriptContext(ctx, runtime.gScriptCmdTable);
    SetupBytecodeScript(ctx, createScriptPointer([0, 1]));

    expect(RunScriptCommand(runtime, ctx)).toBe(true);
    expect(calls).toEqual(['skip@1', 'wait@2']);
    expect(ctx.mode).toBe(SCRIPT_MODE_BYTECODE);

    SetupBytecodeScript(ctx, createScriptPointer([99]));
    expect(RunScriptCommand(runtime, ctx)).toBe(false);
    expect(ctx.mode).toBe(SCRIPT_MODE_STOPPED);

    SetupNativeScript(ctx, () => true);
    expect(RunScriptCommand(runtime, ctx)).toBe(true);
    expect(ctx.mode).toBe(SCRIPT_MODE_BYTECODE);

    SetupNativeScript(ctx, () => false);
    expect(RunScriptCommand(runtime, ctx)).toBe(true);
    expect(ctx.mode).toBe(SCRIPT_MODE_NATIVE);

    ctx.nativePtr = null;
    ctx.scriptPtr = null;
    expect(RunScriptCommand(runtime, ctx)).toBe(false);
    expect(ctx.mode).toBe(SCRIPT_MODE_STOPPED);
  });

  it('ScriptPush, ScriptCall, ScriptReturn, and null-script halt preserve C edge behavior', () => {
    const runtime = createScriptRuntime();
    const ctx = runtime.sGlobalScriptContext;
    const first = createScriptPointer([1], 1);
    const second = createScriptPointer([2], 0);

    expect(ScriptPush(ctx, first)).toBe(0);
    expect(ctx.stackDepth).toBe(1);
    expect(ScriptPop(ctx)).toBe(first);
    expect(ScriptPop(ctx)).toBeNull();

    ctx.stackDepth = 19;
    expect(ScriptPush(ctx, first)).toBe(1);
    expect(ctx.stackDepth).toBe(19);

    ctx.stackDepth = 0;
    ctx.scriptPtr = first;
    ScriptCall(ctx, second);
    expect(ctx.scriptPtr).toBe(second);
    ScriptReturn(ctx);
    expect(ctx.scriptPtr).toBe(first);
    ScriptJump(ctx, second);
    expect(ctx.scriptPtr).toBe(second);

    ctx.mode = SCRIPT_MODE_BYTECODE;
    ctx.scriptPtr = gNullScriptPtr;
    expect(() => RunScriptCommand(runtime, ctx)).toThrow(NullScriptHaltError);
    expect(runtime.nullScriptHaltCount).toBe(1);
  });

  it('global flags and primary script context helpers mirror script.c', () => {
    const runtime = createScriptRuntime([() => true]);
    ScriptContext_Init(runtime);
    expect(runtime.sGlobalScriptContextStatus).toBe(CONTEXT_SHUTDOWN);
    expect(ScriptContext_IsEnabled(runtime)).toBe(false);

    DisableMsgBoxWalkaway(runtime);
    SetQuestLogInputIsDpadFlag(runtime);
    SetWalkingIntoSignVars(runtime);
    ScriptContext_SetupScript(runtime, createScriptPointer([0]));

    expect(runtime.sGlobalScriptContextStatus).toBe(CONTEXT_RUNNING);
    expect(ArePlayerFieldControlsLocked(runtime)).toBe(true);
    expect(IsMsgBoxWalkawayDisabled(runtime)).toBe(false);
    expect(CanWalkAwayToCancelMsgBox(runtime)).toBe(false);
    expect(IsQuestLogInputDpad(runtime)).toBe(false);
    expect(ScriptContext_IsEnabled(runtime)).toBe(true);

    expect(ScriptContext_RunScript(runtime)).toBe(true);
    ScriptContext_Stop(runtime);
    expect(runtime.sGlobalScriptContextStatus).toBe(CONTEXT_WAITING);
    expect(ScriptContext_RunScript(runtime)).toBe(false);

    ScriptContext_Enable(runtime);
    expect(runtime.sGlobalScriptContextStatus).toBe(CONTEXT_RUNNING);
    expect(ArePlayerFieldControlsLocked(runtime)).toBe(true);
    runtime.sGlobalScriptContext.scriptPtr = null;
    expect(ScriptContext_RunScript(runtime)).toBe(false);
    expect(runtime.sGlobalScriptContextStatus).toBe(CONTEXT_SHUTDOWN);
    expect(ArePlayerFieldControlsLocked(runtime)).toBe(false);

    RegisterQuestLogInput(runtime, 0x1ff);
    expect(GetRegisteredQuestLogInput(runtime)).toBe(0xff);
    ClearQuestLogInput(runtime);
    expect(GetRegisteredQuestLogInput(runtime)).toBe(0);

    MsgSetSignpost(runtime);
    expect(IsMsgSignpost(runtime)).toBe(true);
    ResetFacingNpcOrSignpostVars(runtime);
    expect(runtime.resetContextNpcTextColorCount).toBe(1);
    expect(IsMsgSignpost(runtime)).toBe(false);
  });

  it('map header scripts resolve tagged pointer entries and run immediate scripts', () => {
    const executed: number[] = [];
    const runtime = createScriptRuntime([
      () => {
        executed.push(0);
        runtime.sImmediateScriptContext.scriptPtr = null;
        return false;
      },
      () => {
        executed.push(1);
        return true;
      },
    ]);
    const loadScript = createScriptPointer([1, 0]);
    runtime.pointerTable.set(0x1000, loadScript);
    runtime.gMapHeader.mapScripts = Uint8Array.from([
      MAP_SCRIPT_ON_LOAD,
      ...ptrBytes(0x1000),
      0,
    ]);

    MapHeaderRunScriptType(runtime, MAP_SCRIPT_ON_LOAD);
    expect(executed).toEqual([1, 0]);
    expect(runtime.sImmediateScriptContext.mode).toBe(SCRIPT_MODE_STOPPED);
    expect(loadScript.offset).toBe(0);

    executed.length = 0;
    RunOnLoadMapScript(runtime);

    expect(executed).toEqual([1, 0]);
    expect(runtime.sImmediateScriptContext.mode).toBe(SCRIPT_MODE_STOPPED);
    expect(loadScript.offset).toBe(0);
  });

  it('frame and warp map script tables compare vars and respect quest-log playback-last gating', () => {
    const executed: number[] = [];
    const runtime = createScriptRuntime([
      () => {
        executed.push(0);
        runtime.sImmediateScriptContext.scriptPtr = null;
        return false;
      },
    ]);
    const frameTable = createScriptPointer([
      ...halfword(1),
      ...halfword(2),
      ...ptrBytes(0x2000),
      ...halfword(3),
      ...halfword(4),
      ...ptrBytes(0x3000),
      0,
      0,
    ]);
    const warpTable = createScriptPointer([
      ...halfword(5),
      ...halfword(6),
      ...ptrBytes(0x4000),
      0,
      0,
    ]);
    const frameScript = createScriptPointer([0]);
    const warpScript = createScriptPointer([0]);
    runtime.pointerTable.set(0x1000, frameTable);
    runtime.pointerTable.set(0x1001, warpTable);
    runtime.pointerTable.set(0x3000, frameScript);
    runtime.pointerTable.set(0x4000, warpScript);
    runtime.gMapHeader.mapScripts = Uint8Array.from([
      MAP_SCRIPT_ON_FRAME_TABLE,
      ...ptrBytes(0x1000),
      MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE,
      ...ptrBytes(0x1001),
      0,
    ]);
    runtime.vars.set(1, 7);
    runtime.vars.set(2, 8);
    runtime.vars.set(3, 9);
    runtime.vars.set(4, 9);
    runtime.vars.set(5, 12);
    runtime.vars.set(6, 12);

    runtime.gQuestLogState = QL_STATE_PLAYBACK_LAST;
    expect(TryRunOnFrameMapScript(runtime)).toBe(false);

    runtime.gQuestLogState = 0;
    expect(TryRunOnFrameMapScript(runtime)).toBe(true);
    expect(runtime.sGlobalScriptContext.scriptPtr?.bytes).toBe(frameScript.bytes);
    expect(runtime.sGlobalScriptContext.scriptPtr?.offset).toBe(0);

    TryRunOnWarpIntoMapScript(runtime);
    expect(executed).toEqual([0]);
  });

  it('RAM script init, lookup, validation, and corruption clearing match script.c', () => {
    const runtime = createScriptRuntime();
    const fallback = createScriptPointer([0xaa]);
    runtime.gSaveBlock1Ptr.location = { mapGroup: 3, mapNum: 4 };

    expect(InitRamScript(runtime, [1, 2, 3], RAM_SCRIPT_SIZE + 1, 3, 4, 5)).toBe(false);
    expect(runtime.gSaveBlock1Ptr.ramScript.data.magic).toBe(0);

    expect(InitRamScript(runtime, [1, 2, 3], 3, 3, 4, 5)).toBe(true);
    expect(runtime.gSaveBlock1Ptr.ramScript.data).toMatchObject({
      magic: RAM_SCRIPT_MAGIC,
      mapGroup: 3,
      mapNum: 4,
      objectId: 5,
    });
    expect(runtime.gSaveBlock1Ptr.ramScript.checksum).toBe(CalculateRamScriptChecksum(runtime));

    const ramScript = GetRamScript(runtime, 5, fallback);
    expect(ramScript.bytes[0]).toBe(1);
    expect(runtime.gRamScriptRetAddr).toBe(fallback);

    runtime.gSaveBlock1Ptr.ramScript.data.script[0] = 99;
    expect(GetRamScript(runtime, 5, fallback)).toBe(fallback);
    expect(runtime.gSaveBlock1Ptr.ramScript.data.magic).toBe(0);

    InitRamScript_NoObjectEvent(runtime, Array.from({ length: RAM_SCRIPT_SIZE + 10 }, (_unused, i) => i), RAM_SCRIPT_SIZE + 10);
    expect(ValidateRamScript(runtime)).toBe(true);
    expect(runtime.gSaveBlock1Ptr.ramScript.data.mapGroup).toBe(MAP_GROUP(MAP_UNDEFINED));
    expect(runtime.gSaveBlock1Ptr.ramScript.data.mapNum).toBe(MAP_NUM(MAP_UNDEFINED));
    expect(runtime.gSaveBlock1Ptr.ramScript.data.objectId).toBe(0xff);

    expect(GetSavedRamScriptIfValid(runtime)).toBeNull();
    runtime.validateSavedWonderCardResult = true;
    expect(GetSavedRamScriptIfValid(runtime)?.bytes[0]).toBe(0);

    runtime.gSaveBlock1Ptr.ramScript.data.script[0] = 42;
    expect(GetSavedRamScriptIfValid(runtime)).toBeNull();
    expect(runtime.gSaveBlock1Ptr.ramScript.data.magic).toBe(0);
  });
});
