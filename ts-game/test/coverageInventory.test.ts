import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const tsGameRoot = path.resolve(testDir, '..');
const repoRoot = path.resolve(tsGameRoot, '..');

const VALID_TASKS = new Set(Array.from({ length: 17 }, (_, index) => index + 4));

type TaskNumber = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

interface MissingEntry {
  id: string;
  task: TaskNumber;
  reason: string;
}

interface InventoryCategory {
  category: string;
  required: string[];
  implemented: string[];
  missing: MissingEntry[];
}

const readText = (relativePath: string): string => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const readJson = <T>(relativePath: string): T => JSON.parse(readText(relativePath)) as T;

const walkFiles = (root: string, predicate: (filePath: string) => boolean): string[] => {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath, predicate);
    return predicate(fullPath) ? [fullPath] : [];
  }).sort();
};

const unique = (values: Iterable<string>): string[] => [...new Set(values)].filter(Boolean).sort();

const collectRegex = (source: string, regex: RegExp, group = 1): string[] => {
  const matches: string[] = [];
  for (const match of source.matchAll(regex)) {
    const value = match[group];
    if (value) matches.push(value);
  }
  return unique(matches);
};

const readTsSource = (): string => walkFiles(path.join(tsGameRoot, 'src'), (file) => file.endsWith('.ts'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

const sourceTokens = (source: string): Set<string> => new Set(source.match(/[A-Za-z0-9_]+/gu) ?? []);

const taskForMapGap = (id: string): TaskNumber => id.includes(':warp:') ? 6 : 4;

const makeCategory = (
  category: string,
  requiredInput: string[],
  implementedInput: string[],
  task: TaskNumber | ((id: string) => TaskNumber),
  reason: string
): InventoryCategory => {
  const required = unique(requiredInput);
  const implemented = unique(implementedInput.filter((id) => required.includes(id)));
  const implementedSet = new Set(implemented);
  const missing = required
    .filter((id) => !implementedSet.has(id))
    .map((id) => ({ id, task: typeof task === 'function' ? task(id) : task, reason }));

  return { category, required, implemented, missing };
};

interface DecompMapJson {
  id: string;
  name: string;
  connections?: Array<{ map: string; direction: string }>;
  warp_events?: Array<{ x: number; y: number; elevation: number; dest_map: string; dest_warp_id: string | number }>;
  object_events?: Array<{ script?: string; movement_type?: string }>;
  coord_events?: Array<{ script?: string }>;
  bg_events?: Array<{ script?: string; item?: string }>;
}

interface RuntimeMapJson {
  id: string;
  metadata?: { name?: string; connections?: Array<{ map: string; direction: string }> };
  warps?: Array<{ x: number; y: number; elevation: number; destMap: string; destWarpId: string | number }>;
  npcs?: Array<{ script?: string; movement?: string }>;
  triggers?: Array<{ scriptId?: string }>;
  hiddenItems?: Array<{ item?: string }>;
}

const decompMaps = (): DecompMapJson[] => walkFiles(path.join(repoRoot, 'data/maps'), (file) => file.endsWith('/map.json'))
  .map((file) => JSON.parse(fs.readFileSync(file, 'utf8')) as DecompMapJson)
  .sort((a, b) => a.id.localeCompare(b.id));

const runtimeMaps = (): RuntimeMapJson[] => walkFiles(path.join(tsGameRoot, 'src/world/maps'), (file) => file.endsWith('.json') && path.basename(file) !== 'prototypeRoute.json')
  .map((file) => JSON.parse(fs.readFileSync(file, 'utf8')) as RuntimeMapJson)
  .sort((a, b) => a.id.localeCompare(b.id));

const decompWarpIds = (maps: DecompMapJson[]): string[] => maps.flatMap((map) =>
  (map.warp_events ?? []).map((warp, index) =>
    `${map.id}:warp:${index}:${warp.x},${warp.y},${warp.elevation}->${warp.dest_map}#${warp.dest_warp_id}`
  )
);

const runtimeWarpIds = (maps: RuntimeMapJson[]): string[] => maps.flatMap((map) =>
  (map.warps ?? []).map((warp, index) =>
    `${map.id}:warp:${index}:${warp.x},${warp.y},${warp.elevation}->${warp.destMap}#${warp.destWarpId}`
  )
);

const collectScriptLabels = (maps: DecompMapJson[], eventScriptsSource: string): string[] => unique([
  ...collectRegex(eventScriptsSource, /^([A-Za-z0-9_]+)::$/gmu),
  ...maps.flatMap((map) => [
    ...(map.object_events ?? []).map((event) => event.script ?? ''),
    ...(map.coord_events ?? []).map((event) => event.script ?? ''),
    ...(map.bg_events ?? []).map((event) => event.script ?? '')
  ])
]).filter((id) => id !== '0' && id !== '0x0');

const collectRuntimeScriptLabels = (maps: RuntimeMapJson[], tsSource: string): string[] => unique([
  ...collectRegex(tsSource, /['"]([A-Za-z0-9]+_EventScript_[A-Za-z0-9_]+|EventScript_[A-Za-z0-9_]+|Std_[A-Za-z0-9_]+)['"]/gu),
  ...maps.flatMap((map) => [
    ...(map.npcs ?? []).map((event) => event.script ?? ''),
    ...(map.triggers ?? []).map((event) => event.scriptId ?? '')
  ])
]);

const collectRequiredScriptCommands = (): string[] => collectRegex(
  readText('data/script_cmd_table.inc'),
  /\.4byte\s+ScrCmd_([A-Za-z0-9_]+)\s+@\s+0x[0-9a-f]+/giu
).map((cmd) => `ScrCmd_${cmd}`);

const collectImplementedScriptCommands = (tsSource: string): string[] => collectRegex(
  tsSource,
  /export function (ScrCmd_[A-Za-z0-9_]+)\b/gu
);

const collectSpecials = (): string[] => collectRegex(readText('data/specials.inc'), /def_special\s+([A-Za-z0-9_]+)/gu)
  .filter((name) => name !== 'NullFieldSpecial');

const collectMovementActions = (): string[] => collectRegex(
  readText('include/constants/event_object_movement.h'),
  /^#define\s+(MOVEMENT_ACTION_[A-Z0-9_]+)\s+/gmu
).filter((name) => !name.endsWith('_COUNT'));

const collectItems = (): Array<{ itemId: string; fieldUseFunc: string; battleUseFunc: string; pocket: string; type: string | number }> =>
  readJson<{ items: Array<{ itemId: string; fieldUseFunc: string; battleUseFunc: string; pocket: string; type: string | number }> }>('src/data/items.json').items
    .filter((item) => item.itemId !== 'ITEM_NONE' && !/^ITEM_[0-9A-F]{3}$/u.test(item.itemId));

const collectBattleScriptLabels = (): string[] => unique([
  ...collectRegex(readText('data/battle_scripts_1.s'), /\b(BattleScript_[A-Za-z0-9_]+)::/gu),
  ...collectRegex(readText('data/battle_scripts_2.s'), /\b(BattleScript_[A-Za-z0-9_]+)::/gu),
  ...collectRegex(readText('data/battle_ai_scripts.s'), /\b(BattleAI_[A-Za-z0-9_]+)::/gu)
]);

const collectBattleCommands = (): string[] => collectRegex(
  readText('src/battle_script_commands.c'),
  /^static void (Cmd_[A-Za-z0-9_]+)\(void\);/gmu
);

const requiredMenuFlows = [
  'start-menu', 'party-menu', 'bag-menu', 'tm-case', 'berry-pouch', 'pokemon-center', 'pokemon-storage-pc',
  'item-pc', 'pokedex', 'pokedex-area-mode', 'naming-screen', 'options-menu', 'save-menu', 'continue-menu',
  'new-game-menu', 'trainer-card', 'title-intro', 'credits', 'shop-buy-sell', 'list-menu', 'yes-no-menu',
  'multichoice-menu', 'battle-command-menu', 'battle-bag-menu', 'field-dialogue-window'
] as const;

const menuNeedles: Record<typeof requiredMenuFlows[number], RegExp> = {
  'start-menu': /StartMenu|startMenu/,
  'party-menu': /PartyMenu|partyMenu/,
  'bag-menu': /Bag|bagMenu/,
  'tm-case': /TM_CASE|TM Case|tmCase/i,
  'berry-pouch': /BerryPouch|BERRY_POUCH/i,
  'pokemon-center': /PokemonCenter|POK[eé]MON CENTER/i,
  'pokemon-storage-pc': /PokemonStorage|storage system/i,
  'item-pc': /ItemPc|item PC/i,
  pokedex: /Pokedex|Pok[eé]dex/i,
  'pokedex-area-mode': /area mode|DexScreen|pokedex.*area/i,
  'naming-screen': /Naming|namingScreen/i,
  'options-menu': /Option|options/i,
  'save-menu': /SavePanel|save menu|saveGame/i,
  'continue-menu': /Continue|continue game|reloadSave/i,
  'new-game-menu': /NewGame|new game/i,
  'trainer-card': /TrainerCard|trainer card/i,
  'title-intro': /Title|intro/i,
  credits: /Credits|credits/i,
  'shop-buy-sell': /Shop|buy|sell/i,
  'list-menu': /ListMenu|listmenu/i,
  'yes-no-menu': /yesno|yes\/no|YesNo/i,
  'multichoice-menu': /multichoice|MultiChoice/i,
  'battle-command-menu': /BattleCommand|BATTLE_COMMAND/i,
  'battle-bag-menu': /battle.*bag|B_ACTION_USE_ITEM/i,
  'field-dialogue-window': /dialogue|TextWindow/i
};

const requiredSaveSubstates = [
  'flags', 'vars', 'party', 'bag', 'item-pc', 'pokemon-storage-pc', 'pokedex', 'player-map-position',
  'money', 'options', 'badges', 'roamer', 'dynamic-warp', 'hall-of-fame', 'sevii-progression',
  'trainer-tower-records', 'union-room-records', 'save-version', 'corrupt-save', 'quota-failure'
] as const;

const saveNeedles: Record<typeof requiredSaveSubstates[number], RegExp> = {
  flags: /flags/,
  vars: /vars/,
  party: /party/,
  bag: /bag/,
  'item-pc': /pcItems|ItemPc/i,
  'pokemon-storage-pc': /pokemonStorage|storage/i,
  pokedex: /pokedex/i,
  'player-map-position': /mapId|player|position|x|y/,
  money: /money/,
  options: /options/,
  badges: /badge/i,
  roamer: /roamer/i,
  'dynamic-warp': /dynamicWarp|warp/i,
  'hall-of-fame': /hallOfFame|Hof/i,
  'sevii-progression': /sevii|OneIsland|TwoIsland|progression/i,
  'trainer-tower-records': /trainerTower/i,
  'union-room-records': /unionRoom/i,
  'save-version': /version|schema/i,
  'corrupt-save': /corrupt|invalid/i,
  'quota-failure': /quota|storage failure|catch/i
};

const requiredAudioEvents = [
  ...collectRequiredScriptCommands().filter((cmd) => /playse|waitse|fanfare|bgm|cry/iu.test(cmd)),
  'field-map-bgm', 'battle-bgm', 'low-hp-bgm', 'bike-bgm', 'surf-bgm', 'menu-beep', 'pokemon-center-fanfare',
  'evolution-music', 'credits-music', 'audio-fade-in', 'audio-fade-out'
];

const requiredLinkFlows = [
  'cable-club-warp', 'battle-colosseum-2p', 'battle-colosseum-4p', 'trade-center', 'record-corner',
  'wireless-union-room', 'mystery-gift-client', 'mystery-gift-server', 'mystery-event-script', 'e-reader',
  'trainer-tower-records', 'link-trainer-card', 'berry-crush', 'pokemon-jump', 'dodrio-berry-picking',
  'two-client-handshake', 'cancel-disconnect-branch'
] as const;

const linkNeedles: Record<typeof requiredLinkFlows[number], RegExp> = {
  'cable-club-warp': /CableClub|SetCableClubWarp/i,
  'battle-colosseum-2p': /BattleColosseum_2P|colosseum.*2/i,
  'battle-colosseum-4p': /BattleColosseum_4P|colosseum.*4/i,
  'trade-center': /TradeCenter|trade/i,
  'record-corner': /RecordCorner|record mixing/i,
  'wireless-union-room': /UnionRoom|wireless|librfu/i,
  'mystery-gift-client': /MysteryGiftClient|CLI_/i,
  'mystery-gift-server': /MysteryGiftServer|SVR_/i,
  'mystery-event-script': /MysteryEventScript|MEScrCmd/i,
  'e-reader': /EReader|e-Reader|ereader/i,
  'trainer-tower-records': /TrainerTower/i,
  'link-trainer-card': /LinkTrainerCard|link.*trainer card/i,
  'berry-crush': /BerryCrush|berry crush/i,
  'pokemon-jump': /PokemonJump|jump/i,
  'dodrio-berry-picking': /DodrioBerryPicking|dodrio/i,
  'two-client-handshake': /handshake|link adapter|InMemoryLinkHub|local multi-client|multi-instance/i,
  'cancel-disconnect-branch': /disconnect|cancel.*link|CloseLink/i
};

const implementedByNeedle = <T extends string>(ids: readonly T[], haystack: string, needles: Record<T, RegExp>): string[] =>
  ids.filter((id) => needles[id].test(haystack));

const buildInventory = (): InventoryCategory[] => {
  const maps = decompMaps();
  const committedMaps = runtimeMaps();
  const tsSource = readTsSource();
  const tsTokens = sourceTokens(tsSource);
  const items = collectItems();
  const sourceWithMapData = `${tsSource}\n${JSON.stringify(committedMaps)}`;
  const itemContextTokens = new Set(items.flatMap((item) => [item.fieldUseFunc, item.battleUseFunc, item.pocket, String(item.type)])
    .filter((token) => token && token !== 'NULL' && tsTokens.has(token)));

  return [
    makeCategory('maps', maps.map((map) => map.id), committedMaps.map((map) => map.id), 4, 'export/load through generated decomp-backed map registry'),
    makeCategory('warps', decompWarpIds(maps), runtimeWarpIds(committedMaps), taskForMapGap, 'close exported warp/connection traversal graph'),
    makeCategory('script labels', collectScriptLabels(maps, readText('data/event_scripts.s')), collectRuntimeScriptLabels(committedMaps, tsSource), 9, 'port reachable field/story script labels'),
    makeCategory('script commands', collectRequiredScriptCommands(), collectImplementedScriptCommands(tsSource), 9, 'port field script VM command'),
    makeCategory('specials', collectSpecials(), collectSpecials().filter((special) => tsTokens.has(special)), 9, 'port decomp field special'),
    makeCategory('movement commands', collectMovementActions(), collectMovementActions().filter((action) => tsTokens.has(action)), 9, 'port object movement command'),
    makeCategory('items', items.map((item) => item.itemId), items.filter((item) => tsTokens.has(item.itemId)).map((item) => item.itemId), 10, 'port bag/item behavior'),
    makeCategory('item-use contexts', unique(items.flatMap((item) => [
      `field:${item.fieldUseFunc}`,
      `battle:${item.battleUseFunc}`,
      `pocket:${item.pocket}`,
      `type:${String(item.type)}`
    ]).filter((id) => !id.endsWith(':NULL'))), unique(items.flatMap((item) => [
      itemContextTokens.has(item.fieldUseFunc) ? `field:${item.fieldUseFunc}` : '',
      itemContextTokens.has(item.battleUseFunc) ? `battle:${item.battleUseFunc}` : '',
      itemContextTokens.has(item.pocket) ? `pocket:${item.pocket}` : '',
      itemContextTokens.has(String(item.type)) ? `type:${String(item.type)}` : ''
    ])), 10, 'port field/battle item-use context'),
    makeCategory('battle flows', [...collectBattleScriptLabels(), ...collectBattleCommands()], [...collectBattleScriptLabels(), ...collectBattleCommands()].filter((id) => tsTokens.has(id)), (id) => id.startsWith('BattleAI_') ? 13 : 14, 'port battle script/command/native oracle flow'),
    makeCategory('menus', [...requiredMenuFlows], implementedByNeedle(requiredMenuFlows, sourceWithMapData, menuNeedles), (id) => id.includes('battle') ? 14 : id.includes('dialogue') ? 15 : 11, 'port menu scene or renderer flow'),
    makeCategory('save substates', [...requiredSaveSubstates], implementedByNeedle(requiredSaveSubstates, tsSource, saveNeedles), 12, 'persist/audit long-lived save state'),
    makeCategory('audio events', requiredAudioEvents, requiredAudioEvents.filter((id) => tsSource.toLowerCase().includes(id.toLowerCase())), 16, 'port audio event order and playback adapter'),
    makeCategory('link flows', [...requiredLinkFlows], implementedByNeedle(requiredLinkFlows, sourceWithMapData, linkNeedles), 17, 'port browser-compatible link/hardware flow')
  ];
};

const validateMissingLinks = (inventory: InventoryCategory[]): string[] => inventory.flatMap((category) =>
  category.missing
    .filter((entry) => !VALID_TASKS.has(entry.task) || entry.reason.trim().length === 0)
    .map((entry) => `${category.category}:${entry.id}:task=${entry.task}:reason=${entry.reason}`)
);

const formatReport = (inventory: InventoryCategory[]): string => {
  const lines = [
    'Task 3 parity coverage inventory',
    `Generated: ${new Date().toISOString()}`,
    'Valid missing-entry task links: 4-20',
    ''
  ];

  for (const category of inventory) {
    lines.push(`[${category.category}] required=${category.required.length} implemented=${category.implemented.length} missing=${category.missing.length}`);
    if (category.missing.length > 0) {
      for (const entry of category.missing) {
        lines.push(`- MISSING ${entry.id} -> task ${entry.task}: ${entry.reason}`);
      }
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
};

describe('parity coverage inventory gates', () => {
  test('reports explicit totals and linked missing counts for every parity category', () => {
    const inventory = buildInventory();
    const report = formatReport(inventory);
    console.log(report);

    expect(inventory.map((category) => category.category)).toEqual([
      'maps', 'warps', 'script labels', 'script commands', 'specials', 'movement commands', 'items',
      'item-use contexts', 'battle flows', 'menus', 'save substates', 'audio events', 'link flows'
    ]);
    for (const category of inventory) {
      expect(category.required.length, `${category.category} required total`).toBeGreaterThan(0);
      expect(report, `${category.category} totals line`).toContain(
        `[${category.category}] required=${category.required.length} implemented=${category.implemented.length} missing=${category.missing.length}`
      );
    }
    expect(validateMissingLinks(inventory)).toEqual([]);
  });

  test('negative fixture fails when a missing entry lacks a linked plan task', () => {
    const negativeInventory: InventoryCategory[] = [{
      category: 'negative fixture',
      required: ['REQUIRED_PARITY_ENTRY'],
      implemented: [],
      missing: [{ id: 'REQUIRED_PARITY_ENTRY', task: 21 as TaskNumber, reason: '' }]
    }];
    const failures = validateMissingLinks(negativeInventory);
    console.log([
      'Task 3 negative missing-link fixture',
      `invalidMissingEntries=${failures.length}`,
      ...failures
    ].join('\n'));

    expect(failures).toEqual(['negative fixture:REQUIRED_PARITY_ENTRY:task=21:reason=']);
  });
});
