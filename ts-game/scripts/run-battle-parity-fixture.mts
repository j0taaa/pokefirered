import { battleParityFixtures } from '../test/parity/battleParityFixtures';
import { runBattleParityFixture } from '../src/game/battleParity';

const usage = () => {
  process.stderr.write(
    'Usage: run-battle-parity-fixture --fixture <id> [--list]\n'
  );
};

const parseArgs = (argv: string[]) => {
  const parsed = {
    fixtureId: null as string | null,
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

const args = parseArgs(process.argv.slice(2));

if (args.list) {
  process.stdout.write(
    `${JSON.stringify(battleParityFixtures.map((fixture) => fixture.id), null, 2)}\n`
  );
  process.exit(0);
}

if (!args.fixtureId) {
  usage();
  process.exit(2);
}

const fixture = battleParityFixtures.find((candidate) => candidate.id === args.fixtureId);
if (!fixture) {
  process.stderr.write(`Unknown fixture: ${args.fixtureId}\n`);
  process.exit(1);
}

process.stdout.write(
  `${JSON.stringify(runBattleParityFixture(fixture), null, 2)}\n`
);
