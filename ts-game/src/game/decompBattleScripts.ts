import battleScripts1Source from '../../../data/battle_scripts_1.s?raw';
import battleScripts2Source from '../../../data/battle_scripts_2.s?raw';
import { parseAsmBlocks, type DecompAsmBlock, type DecompAsmInstruction } from './decompAsm';

export interface DecompBattleScriptInstruction extends DecompAsmInstruction {}

export interface DecompBattleScript extends DecompAsmBlock {
  instructions: DecompBattleScriptInstruction[];
}

const sourceEntries = [
  ['battle_scripts_1.s', battleScripts1Source],
  ['battle_scripts_2.s', battleScripts2Source]
] as const;

const parseBattleScripts = (): Map<string, DecompBattleScript> => {
  const scripts = new Map<string, DecompBattleScript>();

  for (const [sourceFile, source] of sourceEntries) {
    for (const [label, block] of parseAsmBlocks(source, sourceFile)) {
      scripts.set(label, block);
    }
  }

  return scripts;
};

const battleScriptMap = parseBattleScripts();

export const getDecompBattleScript = (label: string): DecompBattleScript | null =>
  battleScriptMap.get(label) ?? null;

export const hasDecompBattleScript = (label: string): boolean =>
  battleScriptMap.has(label);

export const getAllDecompBattleScripts = (): DecompBattleScript[] =>
  [...battleScriptMap.values()];
