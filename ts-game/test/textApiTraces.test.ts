import { describe, expect, test } from 'vitest';
import { TEXT_API_COVERAGE_MATRIX } from '../src/api/coverageMatrix';
import mainRouteTrace from './fixtures/apiTraces/mainRoute.trace.json';
import postgameRouteTrace from './fixtures/apiTraces/postgameRoute.trace.json';
import obstacleCasesTrace from './fixtures/apiTraces/obstacleCases.trace.json';
import encounterInterruptTrace from './fixtures/apiTraces/encounterInterrupt.trace.json';

type TraceExpectation = 'success' | 'disabled' | 'interruptsNavigation';

interface ApiTraceStep {
  readonly id: string;
  readonly mode: string;
  readonly category: string;
  readonly provider: string;
  readonly actionType: string;
  readonly target?: string;
  readonly expected: TraceExpectation;
  readonly disabledReasonIncludes?: string;
  readonly interruptedActionId?: string;
}

interface ApiTraceFixture {
  readonly id: string;
  readonly description: string;
  readonly start: { readonly mapId: string; readonly mode: string };
  readonly steps: readonly ApiTraceStep[];
  readonly expectedOutcome: string;
}

const coverageByCategory = new Map(TEXT_API_COVERAGE_MATRIX.map((entry) => [entry.category, entry]));
const asTrace = (trace: unknown): ApiTraceFixture => trace as ApiTraceFixture;
const mainRoute = asTrace(mainRouteTrace);
const postgameRoute = asTrace(postgameRouteTrace);
const obstacleCases = asTrace(obstacleCasesTrace);
const encounterInterrupt = asTrace(encounterInterruptTrace);
const traces = [mainRoute, postgameRoute, obstacleCases, encounterInterrupt] as const;

const validateTraceCoverage = (trace: ApiTraceFixture): void => {
  expect(trace.steps.length, `${trace.id} has no trace steps`).toBeGreaterThan(0);

  for (const step of trace.steps) {
    const coverage = coverageByCategory.get(step.category);
    expect(coverage, `${trace.id}/${step.id} references uncovered category ${step.category}`).toBeDefined();
    expect(coverage?.status, `${trace.id}/${step.id} category is missing`).not.toBe('missing');
    expect(step.provider, `${trace.id}/${step.id} is missing provider`).toMatch(/^(ActionEnumerator\.|GameSession\.)/u);
    expect(step.actionType, `${trace.id}/${step.id} is missing semantic action`).not.toBe('');
  }
};

const deterministicSnapshot = (trace: ApiTraceFixture) => ({
  id: trace.id,
  start: trace.start,
  outcome: trace.expectedOutcome,
  steps: trace.steps.map((step) => ({
    id: step.id,
    mode: step.mode,
    category: step.category,
    actionType: step.actionType,
    expected: step.expected,
    reason: step.disabledReasonIncludes ?? null,
    interruptedActionId: step.interruptedActionId ?? null
  }))
});

describe('Text API playability traces', () => {
  test('main route trace completes successfully', () => {
    validateTraceCoverage(mainRoute);

    expect(mainRoute.expectedOutcome).toBe('completed');
    expect(mainRoute.steps.at(0)?.mode).toBe('overworld');
    expect(mainRoute.steps.at(-1)).toEqual(expect.objectContaining({ actionType: 'exportSaveBlob', expected: 'success' }));
    expect(mainRoute.steps.every((step) => step.expected === 'success')).toBe(true);
    expect(mainRoute.steps.map((step) => step.category)).toEqual(expect.arrayContaining([
      'maps/warps/connections',
      'NPCs',
      'dialogue choices',
      'start menu',
      'bag',
      'battle commands',
      'battle moves',
      'save'
    ]));
  });

  test('postgame route keeps link-adjacent surfaces covered when feasible', () => {
    validateTraceCoverage(postgameRoute);

    expect(postgameRoute.expectedOutcome).toBe('completed');
    expect(postgameRoute.start.mapId).toBe('oneIsland');
    expect(postgameRoute.steps.map((step) => step.category)).toEqual(expect.arrayContaining([
      'Pokémon Center',
      'PC',
      'Pokédex',
      'options',
      'party'
    ]));
  });

  test('obstacle cases show correct disabled reasons', () => {
    validateTraceCoverage(obstacleCases);

    expect(obstacleCases.expectedOutcome).toBe('blocked-with-reasons');
    for (const step of obstacleCases.steps) {
      expect(step.expected, `${step.id} should be a disabled obstacle case`).toBe('disabled');
      expect(step.disabledReasonIncludes, `${step.id} missing disabled reason assertion`).toBeTruthy();
    }
    expect(obstacleCases.steps.map((step) => step.disabledReasonIncludes)).toEqual([
      'HM01 Cut',
      'HM04 Strength',
      'HM06 Rock Smash',
      'Soul Badge',
      'fishing rod item'
    ]);
  });

  test('encounter interruption stops navigation and hands off to battle choices', () => {
    validateTraceCoverage(encounterInterrupt);

    const interrupt = encounterInterrupt.steps.find((step) => step.expected === 'interruptsNavigation');
    expect(encounterInterrupt.expectedOutcome).toBe('navigation-interrupted');
    expect(interrupt).toEqual(expect.objectContaining({
      mode: 'battle',
      category: 'wild/trainer battles',
      interruptedActionId: 'route-navigation-start'
    }));
    expect(encounterInterrupt.steps.at(-1)).toEqual(expect.objectContaining({ actionType: 'flee', category: 'battle run/Safari' }));
  });

  test('traces produce deterministic snapshots', () => {
    for (const trace of traces) {
      validateTraceCoverage(trace);
    }

    expect(traces.map(deterministicSnapshot)).toMatchInlineSnapshot(`
      [
        {
          "id": "mainRoute",
          "outcome": "completed",
          "start": {
            "mapId": "route2",
            "mode": "overworld",
          },
          "steps": [
            {
              "actionType": "navigate-to-connection-up-route2",
              "category": "maps/warps/connections",
              "expected": "success",
              "id": "overworld-navigation",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": null,
            },
            {
              "actionType": "talk-to-professor-oak",
              "category": "NPCs",
              "expected": "success",
              "id": "npc-dialogue",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": null,
            },
            {
              "actionType": "dialogue-choice-0",
              "category": "dialogue choices",
              "expected": "success",
              "id": "dialogue-choice",
              "interruptedActionId": null,
              "mode": "dialogue",
              "reason": null,
            },
            {
              "actionType": "openMenu",
              "category": "start menu",
              "expected": "success",
              "id": "open-start-menu",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": null,
            },
            {
              "actionType": "choose",
              "category": "bag",
              "expected": "success",
              "id": "open-bag",
              "interruptedActionId": null,
              "mode": "menu",
              "reason": null,
            },
            {
              "actionType": "fight",
              "category": "battle commands",
              "expected": "success",
              "id": "battle-command",
              "interruptedActionId": null,
              "mode": "battle",
              "reason": null,
            },
            {
              "actionType": "battleMove",
              "category": "battle moves",
              "expected": "success",
              "id": "battle-move",
              "interruptedActionId": null,
              "mode": "battle",
              "reason": null,
            },
            {
              "actionType": "confirm",
              "category": "save",
              "expected": "success",
              "id": "save-confirm",
              "interruptedActionId": null,
              "mode": "saveLoad",
              "reason": null,
            },
            {
              "actionType": "exportSaveBlob",
              "category": "save",
              "expected": "success",
              "id": "export-save",
              "interruptedActionId": null,
              "mode": "saveLoad",
              "reason": null,
            },
          ],
        },
        {
          "id": "postgameRoute",
          "outcome": "completed",
          "start": {
            "mapId": "oneIsland",
            "mode": "overworld",
          },
          "steps": [
            {
              "actionType": "navigate-to-door-one-island-pokemon-center",
              "category": "maps/warps/connections",
              "expected": "success",
              "id": "sevii-map-connection",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": null,
            },
            {
              "actionType": "dialogue-continue",
              "category": "Pokémon Center",
              "expected": "success",
              "id": "pokemon-center-dialogue",
              "interruptedActionId": null,
              "mode": "dialogue",
              "reason": null,
            },
            {
              "actionType": "choose",
              "category": "PC",
              "expected": "success",
              "id": "pc-storage",
              "interruptedActionId": null,
              "mode": "menu",
              "reason": null,
            },
            {
              "actionType": "choose",
              "category": "Pokédex",
              "expected": "success",
              "id": "pokedex-panel",
              "interruptedActionId": null,
              "mode": "menu",
              "reason": null,
            },
            {
              "actionType": "optionAdjust",
              "category": "options",
              "expected": "success",
              "id": "options-panel",
              "interruptedActionId": null,
              "mode": "menu",
              "reason": null,
            },
            {
              "actionType": "choose",
              "category": "party",
              "expected": "success",
              "id": "party-panel",
              "interruptedActionId": null,
              "mode": "menu",
              "reason": null,
            },
          ],
        },
        {
          "id": "obstacleCases",
          "outcome": "blocked-with-reasons",
          "start": {
            "mapId": "route2",
            "mode": "overworld",
          },
          "steps": [
            {
              "actionType": "use-cut",
              "category": "field moves",
              "expected": "disabled",
              "id": "cut-missing-move",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": "HM01 Cut",
            },
            {
              "actionType": "use-strength",
              "category": "field moves",
              "expected": "disabled",
              "id": "strength-missing-move",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": "HM04 Strength",
            },
            {
              "actionType": "use-rock-smash",
              "category": "field moves",
              "expected": "disabled",
              "id": "rock-smash-missing-move",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": "HM06 Rock Smash",
            },
            {
              "actionType": "use-surf",
              "category": "field moves",
              "expected": "disabled",
              "id": "surf-missing-badge",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": "Soul Badge",
            },
            {
              "actionType": "fish",
              "category": "field moves",
              "expected": "disabled",
              "id": "fishing-missing-rod",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": "fishing rod item",
            },
          ],
        },
        {
          "id": "encounterInterrupt",
          "outcome": "navigation-interrupted",
          "start": {
            "mapId": "route1",
            "mode": "overworld",
          },
          "steps": [
            {
              "actionType": "navigate-to-connection-up-route1",
              "category": "maps/warps/connections",
              "expected": "success",
              "id": "route-navigation-start",
              "interruptedActionId": null,
              "mode": "overworld",
              "reason": null,
            },
            {
              "actionType": "fight",
              "category": "wild/trainer battles",
              "expected": "interruptsNavigation",
              "id": "wild-encounter-interrupt",
              "interruptedActionId": "route-navigation-start",
              "mode": "battle",
              "reason": null,
            },
            {
              "actionType": "flee",
              "category": "battle run/Safari",
              "expected": "success",
              "id": "battle-run-choice",
              "interruptedActionId": null,
              "mode": "battle",
              "reason": null,
            },
          ],
        },
      ]
    `);
  });
});
