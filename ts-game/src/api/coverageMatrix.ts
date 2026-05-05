import { allDecompMapIds, EXPORTED_DECOMP_MAP_COUNT } from '../world/mapRegistry';

export type CoverageStatus = 'covered' | 'partial' | 'missing';

export interface CoverageMatrixEntry {
  readonly category: string;
  readonly provider: string;
  readonly testFile: string;
  readonly status: CoverageStatus;
  readonly required: boolean;
  readonly evidence: readonly string[];
}

export interface CoverageReport {
  readonly generatedFrom: 'text-api-action-enumerator';
  readonly exportedMapCount: number;
  readonly totalCategories: number;
  readonly requiredCategories: number;
  readonly coveredRequiredCategories: number;
  readonly partialRequiredCategories: number;
  readonly missingRequiredCategories: number;
  readonly entries: readonly CoverageMatrixEntry[];
}

export const REQUIRED_TEXT_API_CATEGORIES = [
  'maps/warps/connections',
  'NPCs',
  'signs',
  'triggers',
  'hidden items',
  'field moves',
  'wild/trainer battles',
  'start menu',
  'bag',
  'party',
  'PC',
  'shop',
  'Pokémon Center',
  'Pokédex',
  'options',
  'save',
  'battle commands',
  'battle moves',
  'battle items',
  'battle party',
  'battle run/Safari',
  'dialogue choices',
  'locked states'
] as const;

export type RequiredTextApiCategory = typeof REQUIRED_TEXT_API_CATEGORIES[number];

export const TEXT_API_COVERAGE_MATRIX: readonly CoverageMatrixEntry[] = [
  {
    category: 'maps/warps/connections',
    provider: 'ActionEnumerator.enumerateSemanticNavigation',
    testFile: 'test/textApiNavigation.test.ts',
    status: EXPORTED_DECOMP_MAP_COUNT === allDecompMapIds.length ? 'covered' : 'partial',
    required: true,
    evidence: ['navigation options for map connections', 'door and warp navigation targets', `${allDecompMapIds.length} registered decomp maps`]
  },
  {
    category: 'NPCs',
    provider: 'ActionEnumerator.enumerateSemanticNavigation + enumerateFieldInteractions',
    testFile: 'test/textApiFieldInteractions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['talk-to-* options', 'Go to NPC navigation options', 'item-ball NPC pickup options']
  },
  {
    category: 'signs',
    provider: 'ActionEnumerator.enumerateSemanticNavigation + enumerateFieldInteractions',
    testFile: 'test/textApiFieldInteractions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['read-sign action', 'sign trigger navigation']
  },
  {
    category: 'triggers',
    provider: 'ActionEnumerator.enumerateFieldInteractions',
    testFile: 'test/textApiNavigation.test.ts',
    status: 'covered',
    required: true,
    evidence: ['interact trigger inspection', 'conditional trigger filtering']
  },
  {
    category: 'hidden items',
    provider: 'ActionEnumerator.enumerateFieldInteractions',
    testFile: 'test/textApiFieldInteractions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['exact-tile hidden item discovery', 'collected-flag suppression']
  },
  {
    category: 'field moves',
    provider: 'ActionEnumerator.enumerateFieldMoves',
    testFile: 'test/textApiFieldInteractions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['Cut', 'Strength', 'Rock Smash', 'Surf', 'Waterfall', 'Fishing']
  },
  {
    category: 'wild/trainer battles',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['wild command flow', 'trainer battle run lock', 'resolved battle continuation']
  },
  {
    category: 'start menu',
    provider: 'ActionEnumerator.enumerateMenu',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['START entries', 'menu close/back actions']
  },
  {
    category: 'bag',
    provider: 'ActionEnumerator.enumerateBag',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['pockets', 'items', 'context actions', 'toss confirmations']
  },
  {
    category: 'party',
    provider: 'ActionEnumerator.enumerateParty',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['party list', 'summary', 'switch actions']
  },
  {
    category: 'PC',
    provider: 'ActionEnumerator.enumeratePcStorage',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['PC boxes', 'stored Pokémon rows', 'PC action order']
  },
  {
    category: 'shop',
    provider: 'ActionEnumerator.enumerateShop',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['buy/sell menu', 'stock prices', 'quantity and confirm flows']
  },
  {
    category: 'Pokémon Center',
    provider: 'ActionEnumerator.enumerateDialogue + enumerateSemanticNavigation',
    testFile: 'test/textApiTraces.test.ts',
    status: 'covered',
    required: true,
    evidence: ['center entry navigation', 'healing dialogue continuation trace']
  },
  {
    category: 'Pokédex',
    provider: 'ActionEnumerator.enumerateMenu',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['POKéDEX START menu entry', 'generic panel row choices']
  },
  {
    category: 'options',
    provider: 'ActionEnumerator.enumerateOptions',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['option setting rows', 'semantic optionAdjust actions']
  },
  {
    category: 'save',
    provider: 'ActionEnumerator.enumerateSaveLoad',
    testFile: 'test/textApiMenus.test.ts',
    status: 'covered',
    required: true,
    evidence: ['confirm save', 'cancel save', 'save result continuation']
  },
  {
    category: 'battle commands',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['Fight', 'Bag', 'Pokémon', 'Run command options']
  },
  {
    category: 'battle moves',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['move PP/type descriptions', 'move disabled reasons']
  },
  {
    category: 'battle items',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['battle Bag choices', 'trainer battle ball filtering']
  },
  {
    category: 'battle party',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['party switch choices', 'fainted Pokémon lock reasons']
  },
  {
    category: 'battle run/Safari',
    provider: 'ActionEnumerator.enumerateBattle',
    testFile: 'test/textApiBattle.test.ts',
    status: 'covered',
    required: true,
    evidence: ['wild flee action', 'trainer flee disabled reason', 'Safari Ball/Bait/Rock commands']
  },
  {
    category: 'dialogue choices',
    provider: 'ActionEnumerator.enumerateDialogue',
    testFile: 'test/textApiFieldInteractions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['yes/no choices', 'multichoice labels', 'dialogue cancel']
  },
  {
    category: 'locked states',
    provider: 'ActionEnumerator.enumerate + waitOption',
    testFile: 'test/textApiActions.test.ts',
    status: 'covered',
    required: true,
    evidence: ['transition wait', 'field action wait/cancel', 'trainer-see wait', 'script lock wait']
  }
] as const;

export const getCoverageStatus = (): CoverageReport => {
  const requiredEntries = TEXT_API_COVERAGE_MATRIX.filter((entry) => entry.required);
  const coveredRequiredCategories = requiredEntries.filter((entry) => entry.status === 'covered').length;
  const partialRequiredCategories = requiredEntries.filter((entry) => entry.status === 'partial').length;
  const missingRequiredCategories = requiredEntries.filter((entry) => entry.status === 'missing').length;

  return {
    generatedFrom: 'text-api-action-enumerator',
    exportedMapCount: allDecompMapIds.length,
    totalCategories: TEXT_API_COVERAGE_MATRIX.length,
    requiredCategories: requiredEntries.length,
    coveredRequiredCategories,
    partialRequiredCategories,
    missingRequiredCategories,
    entries: TEXT_API_COVERAGE_MATRIX
  };
};
