import battleAiConstantsSource from '../../../include/constants/battle_ai.h?raw';
import battleAiScriptCommandsSource from '../../../src/battle_ai_script_commands.c?raw';
import battleAiSwitchItemsSource from '../../../src/battle_ai_switch_items.c?raw';
import battleAiScriptsSource from '../../../data/battle_ai_scripts.s?raw';
import { parseAsmBlocks, type DecompAsmBlock, type DecompAsmInstruction } from './decompAsm';

export interface DecompBattleAiFlag {
  name: string;
  bit: number;
}

export interface DecompBattleAiCommand {
  id: number;
  handler: string;
  opcode: string;
  body?: string;
  advancesScriptPtr?: boolean;
  setsFuncResult?: boolean;
  setsAiAction?: boolean;
  usesRandom?: boolean;
  readsBattleHistory?: boolean;
}

export interface DecompBattleAiInstruction extends DecompAsmInstruction {}

export interface DecompBattleAiScript extends DecompAsmBlock {
  instructions: DecompBattleAiInstruction[];
}

export interface DecompBattleAiSwitchHelper {
  name: string;
  returnsSwitchAction: boolean;
  usesRandom: boolean;
  referencesLastLandedMove: boolean;
  checksSuperEffective: boolean;
}

export interface DecompBattleAiSourceFunction {
  name: string;
  returnType: string;
  isStatic: boolean;
  body: string;
}

export interface DecompBattleAiActionFlag {
  name: string;
  value: number;
}

export interface DecompBattleAiState {
  name: string;
  value: number;
}

const parseAiBitValue = (value: string): number | null => {
  const shiftMatch = value.match(/\(1 << (\d+)\)/u);
  if (shiftMatch) {
    return 2 ** Number.parseInt(shiftMatch[1], 10);
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const parseBattleAiFlags = (): Map<string, DecompBattleAiFlag> => {
  const flags = new Map<string, DecompBattleAiFlag>();
  const defineRegex = /^#define (AI_SCRIPT_[A-Z0-9_]+)\s+(.+)$/gmu;

  for (const match of battleAiConstantsSource.matchAll(defineRegex)) {
    const bit = parseAiBitValue(match[2].trim());
    if (bit === null) {
      continue;
    }

    flags.set(match[1], {
      name: match[1],
      bit
    });
  }

  return flags;
};

const parseBattleAiCommands = (): Map<number, DecompBattleAiCommand> => {
  const commands = new Map<number, DecompBattleAiCommand>();
  const tableMatch = battleAiScriptCommandsSource.match(/static const BattleAICmdFunc sBattleAICmdTable\[\] =\s*\{([\s\S]*?)\n\};/u);
  if (!tableMatch) {
    return commands;
  }

  const commandRegex = /^\s*(Cmd_[A-Za-z0-9_]+),\s*\/\/\s*0x([0-9A-F]+)/gmu;
  for (const match of tableMatch[1].matchAll(commandRegex)) {
    const handler = match[1];
    const id = Number.parseInt(match[2], 16);
    commands.set(id, {
      id,
      handler,
      opcode: handler.replace(/^Cmd_/u, '')
    });
  }

  return commands;
};

const parseBattleAiActionFlags = (): Map<string, DecompBattleAiActionFlag> => {
  const flags = new Map<string, DecompBattleAiActionFlag>();
  for (const match of battleAiScriptCommandsSource.matchAll(/^#define (AI_ACTION_[A-Z0-9_]+)\s+0x([0-9A-Fa-f]+)$/gmu)) {
    flags.set(match[1], { name: match[1], value: Number.parseInt(match[2], 16) });
  }
  return flags;
};

const parseBattleAiStates = (): DecompBattleAiState[] => {
  const enumMatch = battleAiScriptCommandsSource.match(/\/\/ AI states\s*enum\s*\{([\s\S]*?)\};/u);
  if (!enumMatch) {
    return [];
  }
  return enumMatch[1]
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((name, value) => ({ name, value }));
};

const parseDiscouragedPowerfulMoveEffects = (): string[] => {
  const tableMatch = battleAiScriptCommandsSource.match(/static const u16 sDiscouragedPowerfulMoveEffects\[\]\s*=\s*\{([\s\S]*?)\n\};/u);
  if (!tableMatch) {
    return [];
  }
  return tableMatch[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/u, '').replace(/,/gu, '').trim())
    .filter((line) => line.length > 0 && line !== '0xFFFF');
};

const parseBattleAiSourceFunctions = (): Map<string, DecompBattleAiSourceFunction> => {
  const functions = new Map<string, DecompBattleAiSourceFunction>();
  const functionRegex = /^(static\s+)?((?:bool8|u8|void)\s+\*?|bool8|u8|void)\s+([A-Za-z0-9_]+)\([^)]*\)\s*\{/gmu;

  for (const match of battleAiScriptCommandsSource.matchAll(functionRegex)) {
    const openBraceIndex = (match.index ?? 0) + match[0].length - 1;
    const body = readBraceBody(battleAiScriptCommandsSource, openBraceIndex);
    if (!body) {
      continue;
    }
    functions.set(match[3], {
      name: match[3],
      returnType: match[2].trim(),
      isStatic: !!match[1],
      body: body.trim()
    });
  }
  return functions;
};

const annotateBattleAiCommands = (
  commands: Map<number, DecompBattleAiCommand>,
  functions: Map<string, DecompBattleAiSourceFunction>
): Map<number, DecompBattleAiCommand> => {
  const annotated = new Map<number, DecompBattleAiCommand>();
  for (const command of commands.values()) {
    const body = functions.get(command.handler)?.body;
    annotated.set(command.id, {
      ...command,
      body,
      advancesScriptPtr: body == null ? undefined : /\bsAIScriptPtr\s*(?:=|\+=)/u.test(body),
      setsFuncResult: body == null ? undefined : /\bAI_THINKING_STRUCT->funcResult\s*=/u.test(body),
      setsAiAction: body == null ? undefined : /\bAI_THINKING_STRUCT->aiAction\s*(?:\|=|=)/u.test(body),
      usesRandom: body == null ? undefined : /\bRandom\(\)/u.test(body),
      readsBattleHistory: body == null ? undefined : /\bBATTLE_HISTORY\b/u.test(body)
    });
  }
  return annotated;
};

const parseBattleAiScripts = (): Map<string, DecompBattleAiScript> =>
  parseAsmBlocks(battleAiScriptsSource, 'battle_ai_scripts.s');

const parseBattleAiScriptTable = (scripts: Map<string, DecompBattleAiScript>): string[] => {
  const table = scripts.get('gBattleAI_ScriptsTable');
  if (!table) {
    return [];
  }

  return table.instructions
    .filter((instruction) => instruction.opcode === '.4byte')
    .map((instruction) => instruction.args[0] ?? '')
    .filter((label) => label.length > 0);
};

const readBraceBody = (source: string, openBraceIndex: number): string | null => {
  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char !== '}') {
      continue;
    }

    depth -= 1;
    if (depth === 0) {
      return source.slice(openBraceIndex + 1, index);
    }
  }

  return null;
};

const parseBattleAiSwitchHelpers = (): Map<string, DecompBattleAiSwitchHelper> => {
  const helpers = new Map<string, DecompBattleAiSwitchHelper>();
  const functionRegex = /(?:static\s+)?(?:bool8|u8) ([A-Za-z0-9_]+)\(void\)\s*\{/gu;

  for (const match of battleAiSwitchItemsSource.matchAll(functionRegex)) {
    const name = match[1];
    const body = readBraceBody(battleAiSwitchItemsSource, (match.index ?? 0) + match[0].length - 1);
    if (!body) {
      continue;
    }

    helpers.set(name, {
      name,
      returnsSwitchAction: /BtlController_EmitTwoReturnValues\(1,\s*B_ACTION_SWITCH,\s*0\)/u.test(body),
      usesRandom: /\bRandom\(\)/u.test(body),
      referencesLastLandedMove: /\bgLastLandedMoves\b/u.test(body),
      checksSuperEffective: /\bMOVE_RESULT_SUPER_EFFECTIVE\b/u.test(body)
    });
  }

  return helpers;
};

const battleAiFlagMap = parseBattleAiFlags();
const battleAiActionFlagMap = parseBattleAiActionFlags();
const battleAiStates = parseBattleAiStates();
const battleAiDiscouragedPowerfulMoveEffects = parseDiscouragedPowerfulMoveEffects();
const battleAiSourceFunctionMap = parseBattleAiSourceFunctions();
const battleAiCommandMap = annotateBattleAiCommands(parseBattleAiCommands(), battleAiSourceFunctionMap);
const battleAiScriptMap = parseBattleAiScripts();
const battleAiRootScripts = parseBattleAiScriptTable(battleAiScriptMap);
const battleAiSwitchHelperMap = parseBattleAiSwitchHelpers();

const sortedFlags = [...battleAiFlagMap.values()].sort((left, right) => left.bit - right.bit);
const rootScriptByFlag = new Map<string, string>();
sortedFlags.forEach((flag) => {
  const tableIndex = Math.log2(flag.bit);
  const label = Number.isInteger(tableIndex) ? battleAiRootScripts[tableIndex] : null;
  if (label) {
    rootScriptByFlag.set(flag.name, label);
  }
});

export const getDecompBattleAiFlag = (name: string): DecompBattleAiFlag | null =>
  battleAiFlagMap.get(name) ?? null;

export const getAllDecompBattleAiFlags = (): DecompBattleAiFlag[] =>
  [...battleAiFlagMap.values()];

export const getDecompBattleAiCommand = (id: number): DecompBattleAiCommand | null =>
  battleAiCommandMap.get(id) ?? null;

export const getAllDecompBattleAiCommands = (): DecompBattleAiCommand[] =>
  [...battleAiCommandMap.values()].sort((left, right) => left.id - right.id);

export const getDecompBattleAiActionFlag = (name: string): DecompBattleAiActionFlag | null =>
  battleAiActionFlagMap.get(name) ?? null;

export const getAllDecompBattleAiActionFlags = (): DecompBattleAiActionFlag[] =>
  [...battleAiActionFlagMap.values()].sort((left, right) => left.value - right.value);

export const getDecompBattleAiStates = (): DecompBattleAiState[] =>
  [...battleAiStates];

export const getDecompBattleAiDiscouragedPowerfulMoveEffects = (): string[] =>
  [...battleAiDiscouragedPowerfulMoveEffects];

export const getDecompBattleAiSourceFunction = (name: string): DecompBattleAiSourceFunction | null =>
  battleAiSourceFunctionMap.get(name) ?? null;

export const getAllDecompBattleAiSourceFunctions = (): DecompBattleAiSourceFunction[] =>
  [...battleAiSourceFunctionMap.values()];

export const getDecompBattleAiScript = (label: string): DecompBattleAiScript | null =>
  battleAiScriptMap.get(label) ?? null;

export const getAllDecompBattleAiScripts = (): DecompBattleAiScript[] =>
  [...battleAiScriptMap.values()];

export const getDecompBattleAiRootScripts = (): string[] =>
  [...battleAiRootScripts];

export const getDecompBattleAiScriptLabelForFlag = (flagName: string): string | null =>
  rootScriptByFlag.get(flagName) ?? null;

export const getDecompBattleAiSwitchHelper = (name: string): DecompBattleAiSwitchHelper | null =>
  battleAiSwitchHelperMap.get(name) ?? null;

export const getAllDecompBattleAiSwitchHelpers = (): DecompBattleAiSwitchHelper[] =>
  [...battleAiSwitchHelperMap.values()];
