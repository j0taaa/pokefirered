export interface DecompAsmInstruction {
  opcode: string;
  args: string[];
  raw: string;
  line: number;
}

export interface DecompAsmBlock {
  label: string;
  sourceFile: string;
  startLine: number;
  instructions: DecompAsmInstruction[];
}

const stripAsmComment = (line: string): string => {
  const commentIndex = line.indexOf('@');
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
};

const parseInstruction = (line: string, lineNumber: number): DecompAsmInstruction | null => {
  const raw = stripAsmComment(line).trim();
  if (raw.length === 0) {
    return null;
  }

  const firstWhitespace = raw.search(/\s/u);
  const opcode = firstWhitespace >= 0 ? raw.slice(0, firstWhitespace) : raw;
  const argSource = firstWhitespace >= 0 ? raw.slice(firstWhitespace + 1).trim() : '';
  const args = argSource.length === 0
    ? []
    : argSource.split(',').map((arg) => arg.trim()).filter((arg) => arg.length > 0);

  return {
    opcode,
    args,
    raw,
    line: lineNumber
  };
};

export const parseAsmBlocks = (
  source: string,
  sourceFile: string
): Map<string, DecompAsmBlock> => {
  const blocks = new Map<string, DecompAsmBlock>();
  const lines = source.split(/\r?\n/u);
  let current: DecompAsmBlock | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      return;
    }

    const labelMatch = trimmed.match(/^([A-Za-z0-9_.$]+)::?$/u);
    if (labelMatch) {
      current = {
        label: labelMatch[1],
        sourceFile,
        startLine: index + 1,
        instructions: []
      };
      blocks.set(current.label, current);
      return;
    }

    if (!current) {
      return;
    }

    const instruction = parseInstruction(trimmed, index + 1);
    if (!instruction) {
      return;
    }

    current.instructions.push(instruction);
  });

  return blocks;
};
