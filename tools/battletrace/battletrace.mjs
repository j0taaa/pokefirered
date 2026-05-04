#!/usr/bin/env node

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const gbaPath = path.join(repoRoot, 'pokefirered_modern.gba');
const elfPath = path.join(repoRoot, 'pokefirered_modern.elf');
const harnessResultSize = 496;
const fixtureCatalog = [
  {
    id: 'wild-opening-exchange',
    categories: ['battle-mode:wild', 'end-turn-timing', 'move-exchange', 'status-end-turn-timing', 'wild-battle'],
    hostComparable: true,
    fixtureNumber: 1
  },
  {
    id: 'trainer-shift-prompt',
    categories: ['battle-mode:trainer', 'faint-replacement', 'forced-faint-replacement', 'post-battle-script', 'trainer-battle', 'trainer-class'],
    hostComparable: true,
    fixtureNumber: 2
  },
  {
    id: 'wild-catch',
    categories: ['capture', 'capture-edge-case', 'post-battle-script', 'wild-battle'],
    hostComparable: true,
    fixtureNumber: 3
  },
  {
    id: 'battle-whiteout',
    categories: ['battle-mode:trainer', 'post-battle-script', 'trainer-battle', 'whiteout'],
    hostComparable: true,
    fixtureNumber: 4
  },
  {
    id: 'wild-status-exchange',
    categories: ['end-turn-timing', 'status-end-turn-timing', 'status-move', 'wild-battle'],
    hostComparable: true,
    fixtureNumber: 5
  },
  {
    id: 'wild-player-switch',
    categories: ['player-switch', 'switching', 'wild-battle'],
    hostComparable: true,
    fixtureNumber: 6
  },
  {
    id: 'wild-run-escape',
    categories: ['battle-mode:wild', 'flee', 'wild-battle'],
    hostComparable: true,
    fixtureNumber: 7
  },
  {
    id: 'trainer-ai-item-heal',
    categories: ['ai-item', 'battle-mode:trainer', 'held-item', 'item-timing', 'trainer-ai', 'trainer-battle', 'trainer-class'],
    hostComparable: false
  },
  {
    id: 'trainer-ai-switch-perish-song',
    categories: ['ai-switch', 'battle-mode:trainer', 'switching', 'trainer-ai', 'trainer-battle'],
    hostComparable: false
  },
  {
    id: 'safari-bait-flow',
    categories: ['battle-mode:safari', 'capture', 'capture-edge-case', 'flee', 'safari', 'safari-bait', 'safari-run'],
    hostComparable: false
  },
  {
    id: 'safari-rock-capture-edge',
    categories: ['battle-mode:safari', 'capture', 'capture-edge-case', 'flee', 'safari', 'safari-rock'],
    hostComparable: false
  },
  {
    id: 'priority-quick-attack',
    categories: ['move-priority', 'priority', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'multi-hit-fury-attack',
    categories: ['multi-hit', 'multi-hit-move', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'ability-wonder-guard-block',
    categories: ['ability', 'move-effect', 'wild-battle'],
    hostComparable: false
  },
  {
    id: 'post-battle-reward-level-up',
    categories: ['evolution', 'experience', 'level-up', 'post-battle-script', 'trainer-battle'],
    hostComparable: false
  },
  {
    id: 'doubles-partner-follow-me',
    categories: ['battle-mode:trainer', 'double-battle', 'multi-battle', 'partner', 'targeting'],
    hostComparable: false
  }
];

const fixtureIds = fixtureCatalog.map((fixture) => fixture.id);
const fixtureIdToNumber = new Map(
  fixtureCatalog
    .filter((fixture) => fixture.hostComparable)
    .map((fixture) => [fixture.id, fixture.fixtureNumber])
);

const eventKindByNumber = {
  1: 'chooseAction',
  2: 'chooseMove',
  3: 'chooseItem',
  4: 'choosePokemon',
  5: 'yesNoBox',
  6: 'printString'
};

const usage = () => {
  process.stderr.write('Usage: battletrace --fixture <id> [--list]\n');
};

const parseArgs = (argv) => {
  const parsed = {
    fixtureId: null,
    list: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--fixture':
        parsed.fixtureId = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--list':
        parsed.list = true;
        break;
      default:
        process.stderr.write(`Unknown argument: ${arg}\n`);
        usage();
        process.exit(2);
    }
  }

  return parsed;
};

const toolchainBin = path.join(
  repoRoot,
  '.toolchains',
  'arm-gnu-toolchain-15.2.rel1-darwin-arm64-arm-none-eabi',
  'bin'
);

const buildEnv = {
  ...process.env,
  PATH: fs.existsSync(toolchainBin) ? `${toolchainBin}:${process.env.PATH ?? ''}` : (process.env.PATH ?? '')
};

const ensureOracleBuild = () => {
  execFileSync('make', ['MODERN=1', 'pokefirered_modern.gba'], {
    cwd: repoRoot,
    env: buildEnv,
    stdio: 'ignore'
  });
};

const getSymbolAddress = (symbolName) => {
  const nmOutput = execFileSync('arm-none-eabi-nm', ['-n', elfPath], {
    cwd: repoRoot,
    env: buildEnv,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });
  const match = nmOutput.match(new RegExp(`^([0-9a-fA-F]+)\\s+\\w\\s+${symbolName}$`, 'm'));
  if (!match) {
    throw new Error(`Could not find symbol address for ${symbolName}`);
  }
  return Number.parseInt(match[1], 16);
};

const dumpHarnessResult = async (fixtureNumber) => {
  const resultAddress = getSymbolAddress('gBattleTraceHarnessResult');
  const resultPath = path.join(os.tmpdir(), `battletrace-result-${process.pid}-${Date.now()}.bin`);
  const mgba = spawn('mgba', ['-g', '-l', '31', gbaPath], {
    cwd: repoRoot,
    env: buildEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await delay(1500);
    execFileSync('arm-none-eabi-gdb', [
      '--batch',
      '--quiet',
      '--ex', 'set pagination off',
      '--ex', 'set confirm off',
      '--ex', `file ${elfPath}`,
      '--ex', 'target remote :2345',
      '--ex', 'tbreak BattleTraceHarness_Update',
      '--ex', 'continue',
      '--ex', 'set {unsigned int}0x0202188c = 0x42545243',
      '--ex', `set {unsigned short}0x02021890 = ${fixtureNumber}`,
      '--ex', 'tbreak BattleTraceHarness_Complete',
      '--ex', 'continue',
      '--ex', `dump binary memory ${resultPath} 0x${resultAddress.toString(16)} 0x${(resultAddress + harnessResultSize).toString(16)}`,
      '--ex', 'quit'
    ], {
      cwd: repoRoot,
      env: buildEnv,
      stdio: 'ignore'
    });
    await delay(500);
  } finally {
    mgba.kill('SIGTERM');
    await delay(250);
    if (!mgba.killed) {
      mgba.kill('SIGKILL');
    }
  }

  const resultBuffer = fs.readFileSync(resultPath);
  fs.unlinkSync(resultPath);
  return resultBuffer;
};

const parseTraceResult = (fixtureId, buffer) => {
  if (buffer.length < harnessResultSize) {
    throw new Error(`decomp battle trace result was truncated: expected ${harnessResultSize}, got ${buffer.length}`);
  }

  const ready = buffer.readUInt8(0);
  if (ready !== 1) {
    throw new Error('decomp battle trace result was not marked ready');
  }

  const result = {
    fixtureId,
    mode: 'wild',
    phase: 'command',
    turn: 0,
    outcome: 0,
    battlers: []
  };

  result.mode = buffer.readUInt8(1) === 2 ? 'trainer' : 'wild';
  result.phase = ({
    1: 'command',
    2: 'shiftPrompt',
    3: 'resolved'
  })[buffer.readUInt8(2)] ?? 'unknown';
  const battlerCount = buffer.readUInt8(3);
  const eventCount = buffer.readUInt8(4);
  result.turn = buffer.readUInt16LE(8);
  result.outcome = buffer.readUInt32LE(12);

  for (let battlerIndex = 0; battlerIndex < battlerCount; battlerIndex += 1) {
    const offset = 16 + battlerIndex * 24;
    result.battlers.push({
      battlerId: battlerIndex,
      side: buffer.readUInt8(offset) === 1 ? 'opponent' : 'player',
      partyIndex: buffer.readUInt8(offset + 1),
      absent: buffer.readUInt8(offset + 2) === 1,
      species: buffer.readUInt16LE(offset + 8),
      hp: buffer.readUInt16LE(offset + 10),
      maxHp: buffer.readUInt16LE(offset + 12),
      status: buffer.readUInt32LE(offset + 4),
      chosen: buffer.readUInt16LE(offset + 14) || null,
      printed: buffer.readUInt16LE(offset + 16) || null,
      result: buffer.readUInt16LE(offset + 18) || null,
      landed: buffer.readUInt16LE(offset + 20) || null
    });
  }

  result.events = [];
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex += 1) {
    const offset = 112 + eventIndex * 6;
    result.events.push({
      kind: eventKindByNumber[buffer.readUInt8(offset)] ?? 'unknown',
      battler: buffer.readUInt8(offset + 1),
      value: buffer.readUInt16LE(offset + 2),
      extra: buffer.readUInt16LE(offset + 4)
    });
  }

  return result;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    process.stdout.write(`${JSON.stringify(fixtureCatalog.map(({ id, categories, hostComparable }) => ({
      id,
      categories,
      hostComparable
    })), null, 2)}\n`);
    return;
  }

  if (!args.fixtureId) {
    usage();
    process.exit(2);
  }

  const fixtureNumber = fixtureIdToNumber.get(args.fixtureId);
  if (!fixtureNumber) {
    if (fixtureIds.includes(args.fixtureId)) {
      process.stderr.write(`Fixture is listed for native coverage metadata but has no host-comparable trace yet: ${args.fixtureId}\n`);
    } else {
      process.stderr.write(`Unknown fixture: ${args.fixtureId}\n`);
    }
    process.exit(1);
  }

  ensureOracleBuild();
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const buffer = await dumpHarnessResult(fixtureNumber);
      process.stdout.write(`${JSON.stringify(parseTraceResult(args.fixtureId, buffer), null, 2)}\n`);
      return;
    } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !error.message.includes('not marked ready')) {
        throw error;
      }
      await delay(500);
    }
  }

  throw lastError;
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
