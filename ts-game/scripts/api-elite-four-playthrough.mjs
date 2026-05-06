#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const DEFAULT_TRACE_PATH = '../.sisyphus/evidence/api-elite-four-trace.jsonl';
const DEFAULT_CHECKPOINT_DIR = '../.sisyphus/evidence/api-elite-four-checkpoints';
const DEFAULT_ROUTE_POLICY_PATH = '../.sisyphus/notepads/api-elite-four-playthrough/route-policy.json';
const DEFAULT_CHECKPOINT_INTERVAL = 25;
const DEFAULT_MAX_STEPS = 1;
const DEFAULT_STUCK_REPEAT_LIMIT = 50;
const DEFAULT_ACTIONS_WITHOUT_MILESTONE_LIMIT = 200;
const DEFAULT_REPEATED_FAILED_ACTION_LIMIT = 10;
const HARNESS_MODE = 'api-elite-four-playthrough';
const REQUIRED_MILESTONE_IDS = [
  'starter-choice',
  'boulder-badge',
  'cascade-badge',
  'thunder-badge',
  'rainbow-badge',
  'soul-badge',
  'marsh-badge',
  'volcano-badge',
  'earth-badge',
  'route-22-rival',
  'victory-road-entry',
  'victory-road-exit',
  'elite-four-lorelei',
  'elite-four-bruno',
  'elite-four-agatha',
  'elite-four-lance',
  'champion',
  'hall-of-fame'
];

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])((?:press|tap|hold|use)\s+(?:a|b|start|select|up|down|left|right)|(?:a|b|start|select|up|down|left|right)\s+(?:button|key)|button|key)(?=$|[^a-z0-9])/iu;
const TEXT_API_CONTRACT_OPTION_EXAMPLES = [
  {
    id: 'walk-north',
    label: 'Walk north',
    description: 'Move toward Route 1.',
    category: 'movement',
    enabled: true,
    action: { type: 'move', target: 'north' }
  },
  {
    id: 'inspect-home-door',
    label: 'Inspect home door',
    description: 'Check the entrance to your home.',
    category: 'inspection',
    enabled: false,
    disabledReason: 'You are not facing the entrance.',
    action: { type: 'inspect', target: 'home-door' }
  }
];

class HarnessError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'HarnessError';
    this.details = details;
  }
}

const parseArgs = (argv) => {
  const options = {
    baseUrl: process.env.TEXT_API_BASE_URL ?? DEFAULT_BASE_URL,
    trace: DEFAULT_TRACE_PATH,
    checkpointDir: DEFAULT_CHECKPOINT_DIR,
    checkpointInterval: DEFAULT_CHECKPOINT_INTERVAL,
    maxSteps: DEFAULT_MAX_STEPS,
    smoke: false,
    semanticGuard: false,
    validateRoute: false,
    testStuckDetection: false,
    evidence: null,
    debug: true,
    routePolicy: DEFAULT_ROUTE_POLICY_PATH,
    stuckRepeatLimit: DEFAULT_STUCK_REPEAT_LIMIT,
    actionsWithoutMilestoneLimit: DEFAULT_ACTIONS_WITHOUT_MILESTONE_LIMIT,
    repeatedFailedActionLimit: DEFAULT_REPEATED_FAILED_ACTION_LIMIT
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = () => {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new HarnessError(`Expected a value after ${arg}.`);
      }
      index += 1;
      return value;
    };

    if (arg === '--base-url') options.baseUrl = nextValue();
    else if (arg === '--port') options.baseUrl = `http://127.0.0.1:${nextValue()}`;
    else if (arg === '--trace') options.trace = nextValue();
    else if (arg === '--checkpoint-dir') options.checkpointDir = nextValue();
    else if (arg === '--checkpoint-interval') options.checkpointInterval = Number.parseInt(nextValue(), 10);
    else if (arg === '--max-steps') options.maxSteps = Number.parseInt(nextValue(), 10);
    else if (arg === '--stuck-repeat-limit') options.stuckRepeatLimit = Number.parseInt(nextValue(), 10);
    else if (arg === '--actions-without-milestone-limit') options.actionsWithoutMilestoneLimit = Number.parseInt(nextValue(), 10);
    else if (arg === '--repeated-failed-action-limit') options.repeatedFailedActionLimit = Number.parseInt(nextValue(), 10);
    else if (arg === '--route-policy') options.routePolicy = nextValue();
    else if (arg === '--evidence') options.evidence = nextValue();
    else if (arg === '--smoke') options.smoke = true;
    else if (arg === '--semantic-guard') options.semanticGuard = true;
    else if (arg === '--validate-route') options.validateRoute = true;
    else if (arg === '--test-stuck-detection') options.testStuckDetection = true;
    else if (arg === '--no-debug') options.debug = false;
    else if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new HarnessError(`Unknown option: ${arg}`);
    }
  }

  for (const [name, value] of Object.entries({
    checkpointInterval: options.checkpointInterval,
    maxSteps: options.maxSteps,
    stuckRepeatLimit: options.stuckRepeatLimit,
    actionsWithoutMilestoneLimit: options.actionsWithoutMilestoneLimit,
    repeatedFailedActionLimit: options.repeatedFailedActionLimit
  })) {
    if (!Number.isInteger(value) || value < 1) {
      throw new HarnessError(`${name} must be a positive integer.`);
    }
  }

  return options;
};

const printHelp = () => {
  console.log(`API-only Elite Four harness\n\nUsage:\n  node scripts/api-elite-four-playthrough.mjs --smoke [--base-url http://127.0.0.1:3000]\n  node scripts/api-elite-four-playthrough.mjs --semantic-guard\n  node scripts/api-elite-four-playthrough.mjs --validate-route\n\nOptions:\n  --base-url <url>             Text API origin, default ${DEFAULT_BASE_URL}\n  --port <port>                Shortcut for localhost port\n  --trace <path>               JSONL trace output path\n  --checkpoint-dir <path>      Save checkpoint output directory\n  --checkpoint-interval <n>    Export save every n actions, default ${DEFAULT_CHECKPOINT_INTERVAL}\n  --max-steps <n>              Maximum semantic actions, default ${DEFAULT_MAX_STEPS}\n  --route-policy <path>        Route policy JSON, default ${DEFAULT_ROUTE_POLICY_PATH}\n  --stuck-repeat-limit <n>     Repeated state signature limit, default ${DEFAULT_STUCK_REPEAT_LIMIT}\n  --actions-without-milestone-limit <n>  Actions without milestone progress, default ${DEFAULT_ACTIONS_WITHOUT_MILESTONE_LIMIT}\n  --repeated-failed-action-limit <n>     Repeated failed action limit, default ${DEFAULT_REPEATED_FAILED_ACTION_LIMIT}\n  --evidence <path>            Write human-readable run evidence\n  --validate-route             Validate route policy and exit\n  --test-stuck-detection       Exercise stuck classifier/rollback logic without API\n  --no-debug                   Read snapshots without ?debug=true\n`);
};

const resolveFromCwd = (path) => resolve(process.cwd(), path);

const ensureParentDir = async (filePath) => {
  await mkdir(dirname(resolveFromCwd(filePath)), { recursive: true });
};

const writeTextFile = async (filePath, text) => {
  await ensureParentDir(filePath);
  await writeFile(resolveFromCwd(filePath), text);
};

const writeJsonFile = async (filePath, value) => {
  await writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const readJsonFile = async (filePath) => JSON.parse(await readFile(resolveFromCwd(filePath), 'utf8'));

const stringValuesFrom = (value) => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringValuesFrom);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(stringValuesFrom);
  return [];
};

const validateSemanticOptions = (options, source) => {
  if (!Array.isArray(options)) {
    throw new HarnessError(`Snapshot options from ${source} must be an array.`);
  }

  for (const option of options) {
    if (!option || typeof option !== 'object') {
      throw new HarnessError(`Option from ${source} must be an object.`);
    }
    if (typeof option.id !== 'string' || option.id.length === 0) {
      throw new HarnessError(`Option from ${source} is missing a semantic id.`);
    }
    if (typeof option.label !== 'string' || typeof option.description !== 'string') {
      throw new HarnessError(`Option ${option.id} from ${source} is missing text fields.`);
    }
    if (typeof option.enabled !== 'boolean') {
      throw new HarnessError(`Option ${option.id} from ${source} is missing enabled boolean.`);
    }
    if (!option.action || typeof option.action !== 'object' || typeof option.action.type !== 'string') {
      throw new HarnessError(`Option ${option.id} from ${source} is missing semantic action payload.`);
    }

    const raw = stringValuesFrom(option).find((text) => RAW_CONTROL_PATTERN.test(text));
    if (raw) {
      throw new HarnessError(`Raw control leaked from ${source}: ${raw}`, { optionId: option.id, raw });
    }
  }
};

const assertSnapshot = (snapshot, source) => {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new HarnessError(`${source} did not return a snapshot object.`);
  }
  if (typeof snapshot.mode !== 'string' || typeof snapshot.version !== 'number' || typeof snapshot.summary !== 'string') {
    throw new HarnessError(`${source} snapshot is missing mode/version/summary.`);
  }
  validateSemanticOptions(snapshot.options, source);
};

const signatureFor = (snapshot) => JSON.stringify({
  mode: snapshot.mode,
  summary: snapshot.summary,
  options: snapshot.options.map((option) => ({ id: option.id, enabled: option.enabled }))
});

const checkpointSignatureFor = (snapshot) => JSON.stringify({
  summary: snapshot.summary,
  options: snapshot.options.map((option) => ({ id: option.id, enabled: option.enabled }))
});

const snapshotSearchText = (snapshot) => stringValuesFrom(snapshot).join('\n').toLowerCase();

const includesAnyMarker = (text, markers = []) => markers.some((marker) => text.includes(String(marker).toLowerCase()));

const validateRoutePolicy = (policy) => {
  if (!policy || typeof policy !== 'object') throw new HarnessError('Route policy must be a JSON object.');
  if (!Array.isArray(policy.milestones)) throw new HarnessError('Route policy must include a milestones array.');
  if (!policy.starterTeamPolicy?.starterChoice || !policy.starterTeamPolicy?.selectionPolicy) {
    throw new HarnessError('Route policy must include starter/team policy.');
  }
  if (!Array.isArray(policy.allowedStrategies) || policy.allowedStrategies.length === 0) {
    throw new HarnessError('Route policy must include allowed API strategies.');
  }
  if (!policy.checkpointPolicy?.labels?.beforeEliteFour || !policy.checkpointPolicy?.labels?.beforeChampion || !policy.checkpointPolicy?.labels?.afterHallOfFame) {
    throw new HarnessError('Route policy checkpoint labels must cover before Elite Four, before Champion, and after Hall of Fame.');
  }
  for (const field of ['identicalSnapshotSummaryOptionsLimit', 'actionsWithoutMilestoneLimit', 'repeatedFailedActionsLimit']) {
    if (!Number.isInteger(policy.stuckDetection?.[field]) || policy.stuckDetection[field] < 1) {
      throw new HarnessError(`Route policy stuckDetection.${field} must be a positive integer.`);
    }
  }

  const milestonesById = new Map(policy.milestones.map((milestone) => [milestone.id, milestone]));
  const missing = REQUIRED_MILESTONE_IDS.filter((id) => !milestonesById.has(id));
  if (missing.length > 0) throw new HarnessError('Route policy is missing required milestones.', { missing });

  for (const id of REQUIRED_MILESTONE_IDS) {
    const milestone = milestonesById.get(id);
    if (typeof milestone.name !== 'string' || milestone.name.length === 0) throw new HarnessError(`Milestone ${id} is missing name.`);
    if (typeof milestone.checkpointLabel !== 'string' || milestone.checkpointLabel.length === 0) throw new HarnessError(`Milestone ${id} is missing checkpointLabel.`);
    if (typeof milestone.nextGoalPolicy !== 'string' || milestone.nextGoalPolicy.length === 0) throw new HarnessError(`Milestone ${id} is missing nextGoalPolicy.`);
    if (milestone.detector?.signature !== policy.detectorFunctionSignature) throw new HarnessError(`Milestone ${id} detector signature does not match policy signature.`);
    if (!Array.isArray(milestone.detector.summaryAny) || milestone.detector.summaryAny.length === 0) throw new HarnessError(`Milestone ${id} detector needs summaryAny markers.`);
  }

  return policy;
};

const loadRoutePolicy = async (filePath) => validateRoutePolicy(await readJsonFile(filePath));

const detectMilestone = (snapshot, milestone) => {
  const text = snapshotSearchText(snapshot);
  const detector = milestone.detector ?? {};
  const modeMatches = !Array.isArray(detector.modeAny) || detector.modeAny.length === 0 || detector.modeAny.includes(snapshot.mode);
  return modeMatches && (includesAnyMarker(text, detector.summaryAny) || includesAnyMarker(text, detector.debugAny));
};

const detectNewMilestones = (snapshot, policy, completedMilestoneIds) => policy.milestones
  .filter((milestone) => !completedMilestoneIds.has(milestone.id) && detectMilestone(snapshot, milestone));

const ROUTE_PROGRESS_PATTERNS = [
  /received OAK['’]S PARCEL/iu,
  /delivered OAK['’]S PARCEL/iu,
  /POK[eé]DEX/iu,
  /great undertaking in POK[eé]MON history/iu,
  /Don't bother coming around to my place after this/iu
];

const routeProgressSignature = (snapshot) => {
  const text = snapshotSearchText(snapshot);
  const pattern = ROUTE_PROGRESS_PATTERNS.find((candidate) => candidate.test(text));
  if (pattern) return pattern.source;
  if (snapshot.mode === 'overworld' && /\b(?:ROUTE\s*\d+|VIRIDIAN FOREST|PEWTER CITY)\b/iu.test(snapshot.summary)) {
    return `overworld:${snapshot.summary}`;
  }
  if (/^(?:wild|trainer) battle:/iu.test(snapshot.summary)) {
    return `battle:${snapshot.summary}`;
  }
  if (snapshot.mode === 'trainerSee' || /spotted you\.|Hey, wait up!/iu.test(snapshot.summary)) {
    return `trainer:${snapshot.summary}`;
  }
  return null;
};

const assertNoServerError = (response, endpoint) => {
  if (response.status >= 500) {
    throw new HarnessError('Stuck detection tripped on API 5xx response.', { endpoint, status: response.status, body: response.body });
  }
};

class TextApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    const json = text.length === 0 ? null : JSON.parse(text);
    return { status: response.status, body: json };
  }

  async createSession() {
    return this.request('/sessions', { method: 'POST' });
  }

  async readState(sessionId, debug = true) {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}/state${debug ? '?debug=true' : ''}`);
  }

  async executeAction(sessionId, version, actionId) {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}/actions`, {
      method: 'POST',
      body: { version, actionId }
    });
  }

  async exportSave(sessionId) {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}/save`);
  }

  async importSave(sessionId, save) {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}/load`, {
      method: 'POST',
      body: save
    });
  }

  async deleteSession(sessionId) {
    return this.request(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  }
}

class RouteProgressTracker {
  constructor(policy) {
    this.policy = policy;
    this.completedMilestoneIds = new Set();
    this.completedRouteProgressSignatures = new Set();
    this.actionsSinceMilestone = 0;
  }

  observe(snapshot) {
    const milestones = detectNewMilestones(snapshot, this.policy, this.completedMilestoneIds);
    for (const milestone of milestones) this.completedMilestoneIds.add(milestone.id);
    const progressSignature = routeProgressSignature(snapshot);
    const isNewRouteProgress = progressSignature !== null && !this.completedRouteProgressSignatures.has(progressSignature);
    if (progressSignature !== null) this.completedRouteProgressSignatures.add(progressSignature);
    if (milestones.length > 0 || isNewRouteProgress) this.actionsSinceMilestone = 0;
    return milestones;
  }

  recordAction() {
    this.actionsSinceMilestone += 1;
  }
}

class StuckRecoveryTracker {
  constructor(options, policy) {
    this.repeatLimit = options.stuckRepeatLimit ?? policy.stuckDetection.identicalSnapshotSummaryOptionsLimit;
    this.actionsWithoutMilestoneLimit = options.actionsWithoutMilestoneLimit ?? policy.stuckDetection.actionsWithoutMilestoneLimit;
    this.repeatedFailedActionLimit = options.repeatedFailedActionLimit ?? policy.stuckDetection.repeatedFailedActionsLimit;
    this.previousSignature = null;
    this.repeatedSignatureCount = 0;
    this.failedActionCounts = new Map();
    this.blackoutSignatures = new Map();
    this.latestCheckpoint = null;
  }

  rememberCheckpoint(checkpoint) {
    this.latestCheckpoint = checkpoint;
  }

  observeSnapshot(snapshot, step, actionsSinceMilestone) {
    const signature = checkpointSignatureFor(snapshot);
    this.repeatedSignatureCount = signature === this.previousSignature ? this.repeatedSignatureCount + 1 : 1;
    this.previousSignature = signature;
    if (this.repeatedSignatureCount >= this.repeatLimit) {
      this.throwStuck('identical-snapshot-summary-options', { step, repeatedSignatureCount: this.repeatedSignatureCount });
    }
    if (actionsSinceMilestone >= this.actionsWithoutMilestoneLimit) {
      this.throwStuck('actions-without-milestone-progress', { step, actionsSinceMilestone });
    }

    const text = snapshotSearchText(snapshot);
    if (snapshot.mode === 'battle' && (text.includes('blackout') || text.includes('blacked out') || text.includes('whited out'))) {
      const count = (this.blackoutSignatures.get(signature) ?? 0) + 1;
      this.blackoutSignatures.set(signature, count);
      if (count >= this.repeatLimit) this.throwStuck('battle-blackout-loop-without-recovery', { step, count });
    }
  }

  recordActionFailure(actionId, status, body, step) {
    const key = `${actionId}:${status}:${JSON.stringify(body)}`;
    const count = (this.failedActionCounts.get(key) ?? 0) + 1;
    this.failedActionCounts.set(key, count);
    if (count >= this.repeatedFailedActionLimit) {
      this.throwStuck('repeated-failed-action', { actionId, status, body, step, repeatedFailedActionCount: count });
    }
  }

  throwStuck(reason, details = {}) {
    throw new HarnessError(`Stuck detection tripped: ${reason}.`, {
      reason,
      rollbackCheckpoint: this.latestCheckpoint?.path ?? null,
      checkpointLabel: this.latestCheckpoint?.label ?? null,
      ...details
    });
  }
}

const rollbackToLastCheckpoint = async (client, sessionId, stuckTracker, statuses) => {
  if (!stuckTracker.latestCheckpoint) return null;
  const loadResponse = await client.importSave(sessionId, stuckTracker.latestCheckpoint.save);
  statuses.push({ endpoint: 'POST /sessions/:id/load rollback', status: loadResponse.status, expected: 200 });
  assertNoServerError(loadResponse, 'POST /sessions/:id/load rollback');
  if (loadResponse.status !== 200) {
    throw new HarnessError('Save/load rollback failed.', {
      status: loadResponse.status,
      body: loadResponse.body,
      checkpoint: stuckTracker.latestCheckpoint.path
    });
  }
  assertSnapshot(loadResponse.body, 'POST /sessions/:id/load rollback');
  return loadResponse.body;
};

class JsonlTrace {
  constructor(filePath) {
    this.filePath = filePath;
    this.lines = [];
  }

  record(entry) {
    this.lines.push(JSON.stringify({
      timestamp: new Date().toISOString(),
      mode: HARNESS_MODE,
      ...entry
    }));
  }

  async flush() {
    await writeTextFile(this.filePath, `${this.lines.join('\n')}\n`);
  }
}

const ROUTE_LABEL_PRIORITY = [
  /bulbasaur/iu,
  /continue|next|yes|confirm|ok/iu,
  /fight|ember|vine whip|water gun|scratch|tackle|quick attack|bite|gust|wing attack|thunderbolt|surf|earthquake|flamethrower/iu,
  /exit .*pallet town/iu,
  /viridian city mart|pokemon mart|pok[eé]mon mart|\bmart\b/iu,
  /route\s*1|viridian city|route\s*2|viridian forest|pewter city|pewter gym/iu,
  /route\s*3|mt\. moon|cerulean city|cerulean gym|nugget|bill/iu,
  /route\s*5|route\s*6|vermilion city|s\.s\. anne|vermilion gym/iu,
  /rock tunnel|lavender town|celadon city|celadon gym|rocket|pokemon tower/iu,
  /fuchsia city|fuchsia gym|saffron city|saffron gym|cinnabar island|cinnabar gym|viridian gym/iu,
  /route\s*22|victory road|indigo plateau|pokemon league|elite four|lorelei|bruno|agatha|lance|champion|hall of fame/iu
];

const MART_PRIORITY_PATTERN = /viridian city mart|pokemon mart|pok[eé]mon mart|viridian mart clerk|\bmart\b/iu;
const OAKS_PARCEL_PATTERN = /OAK['’]S PARCEL/iu;

const createActionSelectionContext = () => ({ oakParcelReceived: false, parcelPickupNeeded: true, forestNorthReached: false });

const snapshotHasOakParcel = (snapshot) => {
  if (OAKS_PARCEL_PATTERN.test(snapshot.summary)) return true;
  const keyItems = snapshot.debug?.inventory?.keyItems;
  return Array.isArray(keyItems) && keyItems.includes('ITEM_OAKS_PARCEL');
};

const observeActionSelectionSnapshot = (context, snapshot) => {
  if (snapshotHasOakParcel(snapshot)) {
    context.oakParcelReceived = true;
    context.parcelPickupNeeded = false;
  }
  if (/POK[eé]DEX/iu.test(snapshot.summary)) {
    context.oakParcelReceived = false;
    context.parcelPickupNeeded = false;
  }
  const forestPosition = /VIRIDIAN FOREST, facing \w+ at \d+, (\d+)\./iu.exec(snapshot.summary);
  if (forestPosition && Number.parseInt(forestPosition[1], 10) <= 20) context.forestNorthReached = true;
};

const enabledOptionMatching = (enabled, pattern) => enabled.find((option) =>
  pattern.test(`${option.label}\n${option.description}\n${option.action?.target ?? ''}`)
);

const chooseFirstEnabledSemanticAction = (snapshot, context = createActionSelectionContext()) => {
  const enabled = snapshot.options.filter((option) => option.enabled);
  if (snapshot.mode === 'battle') {
    const battleAction = enabled.find((option) => /continue/iu.test(option.label))
      ?? enabled.find((option) => /^fight$/iu.test(option.label))
      ?? enabled.find((option) => /^use\s+/iu.test(option.label))
      ?? enabled.find((option) => /^switch to /iu.test(option.label))
      ?? enabled.find((option) => !/^review active /iu.test(option.label));
    if (battleAction) return battleAction;
  }
  if (/nickname/iu.test(snapshot.summary)) {
    const declineNickname = enabled.find((option) => /choose\s+no|\bno\b/iu.test(`${option.label}\n${option.description}`));
    if (declineNickname) return declineNickname;
  }
  if (context.oakParcelReceived) {
    const parcelDeliveryAction = /VIRIDIAN CITY/iu.test(snapshot.summary)
      ? enabledOptionMatching(enabled, /route\s*1|MAP_ROUTE1/iu)
      : /ROUTE\s*1/iu.test(snapshot.summary)
        ? enabledOptionMatching(enabled, /pallet town|MAP_PALLET_TOWN/iu)
        : /PALLET TOWN/iu.test(snapshot.summary)
          ? enabledOptionMatching(enabled, /oak'?s lab|professor oak|MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB/iu)
          : null;
    if (parcelDeliveryAction) return parcelDeliveryAction;
  }
  if (/ROUTE\s*2.*\b79\b/iu.test(snapshot.summary)) {
    const forestEntrance = enabledOptionMatching(enabled, /viridian forest south entrance|MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE/iu);
    if (forestEntrance) return forestEntrance;
  }
  if (/VIRIDIAN FOREST/iu.test(snapshot.summary)) {
    const northEntrance = enabledOptionMatching(enabled, /viridian forest north entrance|MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE/iu);
    if (northEntrance) {
      context.forestNorthReached = true;
      return northEntrance;
    }
  }
  if (context.forestNorthReached && /ROUTE\s*2/iu.test(snapshot.summary)) {
    const pewterConnection = enabledOptionMatching(enabled, /pewter city|MAP_PEWTER_CITY/iu);
    if (pewterConnection) return pewterConnection;
    const route2Exit = enabledOptionMatching(enabled, /^Exit to Route2\b|MAP_ROUTE2$/iu);
    if (route2Exit) return route2Exit;
  }
  if (/ROUTE\s*2/iu.test(snapshot.summary)) {
    const forestWarp = enabledOptionMatching(enabled, /viridian forest|MAP_VIRIDIAN_FOREST/iu);
    if (forestWarp) return forestWarp;
  }
  const action = ROUTE_LABEL_PRIORITY
    .map((pattern) => enabled.find((option) => {
      if (/^Enter .*(Pokemon Center|House)/iu.test(option.label)) return false;
      const text = `${option.label}\n${option.description}\n${option.action?.target ?? ''}`;
      if (!context.parcelPickupNeeded && MART_PRIORITY_PATTERN.test(text)) return false;
      return pattern.test(text);
    }))
    .find(Boolean)
    ?? enabled.find((option) => /^Exit to /iu.test(option.label))
    ?? enabled.find((option) => option.category === 'interaction' && option.label !== 'Interact with what is ahead')
    ?? enabled.find((option) => option.category === 'navigation' && !/sign|^Enter .*(Pokemon Center|House)/iu.test(option.label))
    ?? enabled.find((option) => option.category === 'navigation' && !/sign/iu.test(option.label))
    ?? (snapshot.mode === 'overworld' ? enabled.find((option) => option.category === 'navigation') : null)
    ?? (snapshot.mode === 'overworld' ? enabled.find((option) => option.category !== 'menu' && option.label !== 'Interact with what is ahead') : null)
    ?? enabled[0];
  if (!action) {
    throw new HarnessError('No enabled semantic action is available.', {
      mode: snapshot.mode,
      version: snapshot.version,
      summary: snapshot.summary
    });
  }
  return action;
};

const writeCheckpoint = async (checkpointDir, sessionId, step, saveBlob, label = `step-${step}`) => {
  const safeLabel = label.replace(/[^a-z0-9._-]+/giu, '-').replace(/^-|-$/gu, '');
  const fileName = `checkpoint-${String(step).padStart(4, '0')}-${safeLabel}.json`;
  const filePath = join(checkpointDir, fileName);
  await writeJsonFile(filePath, { sessionId, step, label, save: saveBlob });
  return filePath;
};

const runSemanticGuard = async (options) => {
  validateSemanticOptions(TEXT_API_CONTRACT_OPTION_EXAMPLES, 'TEXT_API_CONTRACT_OPTION_EXAMPLES');
  const evidence = [
    'Semantic guard: PASS',
    `Corpus: TEXT_API_CONTRACT_OPTION_EXAMPLES (${TEXT_API_CONTRACT_OPTION_EXAMPLES.length} options)`,
    `Raw-control pattern: ${RAW_CONTROL_PATTERN}`,
    'Validated fields: id, label, description, category, disabledReason, action strings',
    ''
  ].join('\n');
  if (options.evidence) await writeTextFile(options.evidence, evidence);
  console.log(evidence.trim());
};

const routePolicyEvidence = (policy, policyPath) => [
  'API Elite Four route policy: PASS',
  `Policy: ${policyPath}`,
  `Milestones: ${policy.milestones.length}`,
  `Detector signature: ${policy.detectorFunctionSignature}`,
  `Starter policy: ${policy.starterTeamPolicy.starterChoice}`,
  `Stuck thresholds: identical=${policy.stuckDetection.identicalSnapshotSummaryOptionsLimit}, noMilestone=${policy.stuckDetection.actionsWithoutMilestoneLimit}, failedActions=${policy.stuckDetection.repeatedFailedActionsLimit}`,
  'Required milestones:',
  ...REQUIRED_MILESTONE_IDS.map((id) => {
    const milestone = policy.milestones.find((entry) => entry.id === id);
    return `- ${id}: checkpoint=${milestone.checkpointLabel}; next=${milestone.nextGoalPolicy}`;
  }),
  'Allowed strategies:',
  ...policy.allowedStrategies.map((strategy) => `- ${strategy}`),
  'Forbidden strategies:',
  ...policy.forbiddenStrategies.map((strategy) => `- ${strategy}`),
  ''
].join('\n');

const runRouteValidation = async (options) => {
  const policy = await loadRoutePolicy(options.routePolicy);
  const evidence = routePolicyEvidence(policy, options.routePolicy);
  if (options.evidence) await writeTextFile(options.evidence, evidence);
  console.log(evidence.trim());
};

const runStuckDetectionTest = async (options) => {
  const policy = await loadRoutePolicy(options.routePolicy);
  const tracker = new StuckRecoveryTracker({ ...options, stuckRepeatLimit: 3, actionsWithoutMilestoneLimit: 5 }, policy);
  tracker.rememberCheckpoint({ path: '../.sisyphus/evidence/api-elite-four-checkpoints/checkpoint-0000-test.json', label: 'test-checkpoint', save: { schemaVersion: 1 } });
  const snapshot = {
    mode: 'overworld',
    version: 1,
    summary: 'Repeated deterministic test snapshot.',
    options: [
      { id: 'wait-semantically', label: 'Wait here', description: 'Remain in place.', enabled: true, action: { type: 'wait' } }
    ]
  };

  const results = [];
  try {
    for (let step = 1; step <= 3; step += 1) tracker.observeSnapshot(snapshot, step, 0);
  } catch (error) {
    results.push({ detector: 'identical-snapshot-summary-options', message: error.message, details: error.details });
  }

  const progressTracker = new StuckRecoveryTracker({ ...options, stuckRepeatLimit: 50, actionsWithoutMilestoneLimit: 2 }, policy);
  progressTracker.rememberCheckpoint(tracker.latestCheckpoint);
  try {
    progressTracker.observeSnapshot({ ...snapshot, version: 2, summary: 'No milestone progress test.' }, 2, 2);
  } catch (error) {
    results.push({ detector: 'actions-without-milestone-progress', message: error.message, details: error.details });
  }

  const routeProgress = new RouteProgressTracker(policy);
  routeProgress.recordAction();
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, summary: "system: PLAYER received OAK'S PARCEL from the POKéMON MART clerk." });
  if (routeProgress.actionsSinceMilestone !== 0) {
    throw new HarnessError('Route progress text did not reset the no-milestone counter.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, summary: "system: PLAYER received OAK'S PARCEL from the POKéMON MART clerk." });
  if (routeProgress.actionsSinceMilestone !== 1) {
    throw new HarnessError('Repeated route progress text reset the no-milestone counter more than once.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, summary: "LOCALID_OAKS_LAB_PROF_OAK: This is a great undertaking in POKéMON history!" });
  if (routeProgress.actionsSinceMilestone !== 0) {
    throw new HarnessError('Late Pokédex mission progress did not reset the no-milestone counter.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, mode: 'overworld', summary: 'VIRIDIAN FOREST, facing up at 39, 43.' });
  if (routeProgress.actionsSinceMilestone !== 0) {
    throw new HarnessError('Unique route movement progress did not reset the no-milestone counter.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, mode: 'overworld', summary: 'VIRIDIAN FOREST, facing up at 39, 43.' });
  if (routeProgress.actionsSinceMilestone !== 1) {
    throw new HarnessError('Repeated route movement progress reset the no-milestone counter more than once.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }
  routeProgress.recordAction();
  routeProgress.observe({ ...snapshot, mode: 'battle', summary: 'trainer battle: BULBASAUR faces WEEDLE.' });
  if (routeProgress.actionsSinceMilestone !== 0) {
    throw new HarnessError('Battle progress did not reset the no-milestone counter.', { actionsSinceMilestone: routeProgress.actionsSinceMilestone });
  }

  const failedActionTracker = new StuckRecoveryTracker({ ...options, repeatedFailedActionLimit: 2 }, policy);
  failedActionTracker.rememberCheckpoint(tracker.latestCheckpoint);
  try {
    failedActionTracker.recordActionFailure('retry-same-action', 409, { success: false }, 1);
    failedActionTracker.recordActionFailure('retry-same-action', 409, { success: false }, 2);
  } catch (error) {
    results.push({ detector: 'repeated-failed-action', message: error.message, details: error.details });
  }

  const actionSelection = createActionSelectionContext();
  observeActionSelectionSnapshot(actionSelection, {
    ...snapshot,
    summary: "system: PLAYER received OAK'S PARCEL from the POKéMON MART clerk.",
    debug: { inventory: { keyItems: ['ITEM_OAKS_PARCEL'] } },
    options: []
  });
  const parcelDeliveryCases = [
    {
      summary: 'VIRIDIAN CITY, facing up at 4, 4.',
      expectedId: 'go-route1',
      options: [
        { id: 'go-clerk', label: 'Go to LOCALID VIRIDIAN MART CLERK', description: 'Approach the PokéMart clerk.', enabled: true, action: { type: 'navigate', target: 'LOCALID_VIRIDIAN_MART_CLERK' } },
        { id: 'enter-gym', label: 'Enter Viridian City Gym', description: 'Try the currently closed gym.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_CITY_GYM' } },
        { id: 'exit-mart', label: 'Exit to Viridian City', description: 'Leave the PokéMart.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_CITY' } },
        { id: 'go-route1', label: 'Exit south to Route1', description: 'Return toward Pallet Town.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE1' } }
      ]
    },
    {
      summary: 'ROUTE 1, facing down at 10, 0.',
      expectedId: 'go-pallet',
      options: [
        { id: 'go-viridian', label: 'Go north to Viridian City', description: 'Return to Viridian City.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_CITY' } },
        { id: 'go-pallet', label: 'Go south to Pallet Town', description: 'Return to Pallet Town.', enabled: true, action: { type: 'navigate', target: 'MAP_PALLET_TOWN' } }
      ]
    },
    {
      summary: 'PALLET TOWN, facing down at 6, 1.',
      expectedId: 'enter-oak-lab',
      options: [
        { id: 'go-route1', label: 'Exit north to Route1', description: 'Head back toward Viridian City.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE1' } },
        { id: 'enter-oak-lab', label: 'Enter Pallet Town Professor Oaks Lab', description: 'Deliver Oak’s Parcel to Professor Oak.', enabled: true, action: { type: 'navigate', target: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB' } }
      ]
    }
  ];
  for (const parcelCase of parcelDeliveryCases) {
    const action = chooseFirstEnabledSemanticAction({ ...snapshot, summary: parcelCase.summary, options: parcelCase.options }, actionSelection);
    if (action.id !== parcelCase.expectedId) {
      throw new HarnessError('Post-parcel selector chose the wrong delivery route.', { summary: parcelCase.summary, selected: action });
    }
  }
  observeActionSelectionSnapshot(actionSelection, { ...snapshot, summary: 'LOCALID_OAKS_LAB_PROF_OAK: On the desk there is my invention, the POKéDEX!', options: [] });
  const postPokedexMartAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'VIRIDIAN CITY, facing up at 4, 4.',
    options: [
      { id: 'exit-mart', label: 'Exit to Viridian City', description: 'Leave the PokéMart.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_CITY' } },
      { id: 'go-clerk', label: 'Go to LOCALID VIRIDIAN MART CLERK', description: 'Approach the PokéMart clerk.', enabled: true, action: { type: 'navigate', target: 'LOCALID_VIRIDIAN_MART_CLERK' } }
    ]
  }, actionSelection);
  if (postPokedexMartAction.id !== 'exit-mart') {
    throw new HarnessError('Post-Pokédex selector still prioritized Viridian Mart clerk.', { selected: postPokedexMartAction });
  }
  const route2SouthAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'ROUTE 2, facing up at 10, 79.',
    options: [
      { id: 'go-pewter', label: 'Go north to Pewter City', description: 'Try the northern Route 2 connection.', enabled: true, action: { type: 'navigate', target: 'MAP_PEWTER_CITY' } },
      { id: 'enter-forest-south', label: 'Enter Route2 Viridian Forest South Entrance', description: 'Enter the gatehouse toward Viridian Forest.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE' } }
    ]
  }, actionSelection);
  if (route2SouthAction.id !== 'enter-forest-south') {
    throw new HarnessError('Route 2 south selector skipped Viridian Forest.', { selected: route2SouthAction });
  }
  const route2GatehouseAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'ROUTE 2, facing up at 7, 10.',
    options: [
      { id: 'exit-route2', label: 'Exit to Route2', description: 'Return to Route 2.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2' } },
      { id: 'enter-forest', label: 'Exit to Viridian Forest', description: 'Continue into Viridian Forest.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_FOREST' } }
    ]
  }, actionSelection);
  if (route2GatehouseAction.id !== 'enter-forest') {
    throw new HarnessError('Route 2 gatehouse selector returned to Route 2 instead of Viridian Forest.', { selected: route2GatehouseAction });
  }
  const viridianForestAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'VIRIDIAN FOREST, facing up at 29, 62.',
    options: [
      { id: 'south-entrance', label: 'Enter Route2 Viridian Forest South Entrance', description: 'Backtrack to the Route 2 south gatehouse.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE' } },
      { id: 'north-entrance', label: 'Enter Route2 Viridian Forest North Entrance', description: 'Continue toward Pewter City.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE' } }
    ]
  }, actionSelection);
  if (viridianForestAction.id !== 'north-entrance') {
    throw new HarnessError('Viridian Forest selector backtracked to the south entrance.', { selected: viridianForestAction });
  }
  const route2NorthGatehouseAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'ROUTE 2, facing right at 7, 10.',
    options: [
      { id: 'exit-route2', label: 'Exit to Route2', description: 'Continue onto the Route 2 north segment.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2' } },
      { id: 'enter-forest', label: 'Enter Viridian Forest', description: 'Backtrack into Viridian Forest.', enabled: true, action: { type: 'navigate', target: 'MAP_VIRIDIAN_FOREST' } }
    ]
  }, actionSelection);
  if (route2NorthGatehouseAction.id !== 'exit-route2') {
    throw new HarnessError('Route 2 north gatehouse selector backtracked into Viridian Forest.', { selected: route2NorthGatehouseAction });
  }
  const route2NorthSegmentAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    summary: 'ROUTE 2, facing up at 5, 13.',
    options: [
      { id: 'enter-north-gatehouse', label: 'Enter Route2 Viridian Forest North Entrance', description: 'Backtrack into the north gatehouse.', enabled: true, action: { type: 'navigate', target: 'MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE' } },
      { id: 'go-pewter', label: 'Go north to Pewter City', description: 'Continue to Pewter City.', enabled: true, action: { type: 'navigate', target: 'MAP_PEWTER_CITY' } }
    ]
  }, actionSelection);
  if (route2NorthSegmentAction.id !== 'go-pewter') {
    throw new HarnessError('Route 2 north segment selector backtracked into the gatehouse.', { selected: route2NorthSegmentAction });
  }
  const battleAction = chooseFirstEnabledSemanticAction({
    ...snapshot,
    mode: 'battle',
    summary: 'trainer battle: BULBASAUR faces WEEDLE.',
    options: [
      { id: 'review-bulbasaur', label: 'Review active BULBASAUR', description: 'Inspect the active battler.', enabled: true, action: { type: 'battle', target: 'BULBASAUR' } },
      { id: 'fight', label: 'Fight', description: 'Open the move list.', enabled: true, action: { type: 'battle', target: 'fight' } }
    ]
  }, actionSelection);
  if (battleAction.id !== 'fight') {
    throw new HarnessError('Battle selector reviewed the active Pokémon instead of fighting.', { selected: battleAction });
  }

  const serverError = { status: 500, body: { error: 'synthetic server failure' } };
  try {
    assertNoServerError(serverError, 'GET /sessions/:id/state');
  } catch (error) {
    results.push({ detector: 'api-5xx', message: error.message, details: error.details });
  }

  if (results.length !== 4) throw new HarnessError('Synthetic stuck detection did not cover every expected detector.', { results });
  const evidence = [
    'API Elite Four stuck detection: PASS',
    `Policy: ${options.routePolicy}`,
    `Rollback checkpoint: ${tracker.latestCheckpoint.path}`,
    'Synthetic detector results:',
    ...results.map((result) => `- ${result.detector}: ${result.message}; checkpoint=${result.details?.rollbackCheckpoint ?? 'n/a'}`),
    'Save/load rollback policy: implemented via POST /sessions/:id/load using the latest checkpoint save blob; non-200 or 5xx load responses are classified as save/load failure.',
    ''
  ].join('\n');
  if (options.evidence) await writeTextFile(options.evidence, evidence);
  console.log(evidence.trim());
};

const runSmoke = async (options) => {
  const policy = await loadRoutePolicy(options.routePolicy);
  const client = new TextApiClient(options.baseUrl);
  const trace = new JsonlTrace(options.trace);
  const progress = new RouteProgressTracker(policy);
  const stuck = new StuckRecoveryTracker(options, policy);
  const actionSelection = createActionSelectionContext();
  const statuses = [];
  let sessionId = null;
  let latestSnapshot = null;
  let checkpointPath = null;

  const exportCheckpoint = async (step, label) => {
    const checkpoint = await client.exportSave(sessionId);
    statuses.push({ endpoint: 'GET /sessions/:id/save checkpoint', status: checkpoint.status, expected: 200 });
    assertNoServerError(checkpoint, 'GET /sessions/:id/save checkpoint');
    if (checkpoint.status !== 200) throw new HarnessError('Checkpoint export failed.', { status: checkpoint.status, body: checkpoint.body });
    checkpointPath = await writeCheckpoint(options.checkpointDir, sessionId, step, checkpoint.body, label);
    stuck.rememberCheckpoint({ path: checkpointPath, label, save: checkpoint.body, step });
    return checkpointPath;
  };

  try {
    const created = await client.createSession();
    statuses.push({ endpoint: 'POST /sessions', status: created.status, expected: 201 });
    assertNoServerError(created, 'POST /sessions');
    if (created.status !== 201) throw new HarnessError('Session creation failed.', { status: created.status, body: created.body });
    sessionId = created.body.sessionId;
    assertSnapshot(created.body.snapshot, 'POST /sessions');

    const stateResponse = await client.readState(sessionId, options.debug);
    statuses.push({ endpoint: `GET /sessions/:id/state${options.debug ? '?debug=true' : ''}`, status: stateResponse.status, expected: 200 });
    assertNoServerError(stateResponse, 'GET /sessions/:id/state');
    if (stateResponse.status !== 200) throw new HarnessError('Initial state read failed.', { status: stateResponse.status, body: stateResponse.body });
    assertSnapshot(stateResponse.body, 'GET /sessions/:id/state');
    latestSnapshot = stateResponse.body;
    progress.observe(latestSnapshot);

    for (let step = 1; step <= options.maxSteps; step += 1) {
      stuck.observeSnapshot(latestSnapshot, step, progress.actionsSinceMilestone);
      observeActionSelectionSnapshot(actionSelection, latestSnapshot);

      const action = chooseFirstEnabledSemanticAction(latestSnapshot, actionSelection);
      trace.record({
        step,
        version: latestSnapshot.version,
        actionId: action.id,
        label: action.label,
        summary: latestSnapshot.summary
      });

      const actionResponse = await client.executeAction(sessionId, latestSnapshot.version, action.id);
      statuses.push({ endpoint: 'POST /sessions/:id/actions', status: actionResponse.status, expected: 200 });
      assertNoServerError(actionResponse, 'POST /sessions/:id/actions');
      if (actionResponse.status !== 200 || !actionResponse.body?.success) {
        stuck.recordActionFailure(action.id, actionResponse.status, actionResponse.body, step);
        throw new HarnessError('Semantic action failed.', { status: actionResponse.status, body: actionResponse.body, actionId: action.id });
      }
      assertSnapshot(actionResponse.body.snapshot, 'POST /sessions/:id/actions');
      if (actionResponse.body.snapshot.version !== actionResponse.body.newVersion) {
        throw new HarnessError('Action response returned mismatched snapshot/newVersion.', actionResponse.body);
      }
      latestSnapshot = actionResponse.body.snapshot;
      progress.recordAction();
      const milestones = progress.observe(latestSnapshot);
      for (const milestone of milestones) await exportCheckpoint(step, milestone.checkpointLabel);

      if (step % options.checkpointInterval === 0) {
        await exportCheckpoint(step, `interval-${step}`);
      }
    }

    const saveResponse = await client.exportSave(sessionId);
    statuses.push({ endpoint: 'GET /sessions/:id/save', status: saveResponse.status, expected: 200 });
    assertNoServerError(saveResponse, 'GET /sessions/:id/save');
    if (saveResponse.status !== 200) throw new HarnessError('Save export failed.', { status: saveResponse.status, body: saveResponse.body });
    checkpointPath = await writeCheckpoint(options.checkpointDir, sessionId, options.maxSteps, saveResponse.body, 'final-smoke');
    stuck.rememberCheckpoint({ path: checkpointPath, label: 'final-smoke', save: saveResponse.body, step: options.maxSteps });

    const deleteResponse = await client.deleteSession(sessionId);
    statuses.push({ endpoint: 'DELETE /sessions/:id', status: deleteResponse.status, expected: 204 });
    assertNoServerError(deleteResponse, 'DELETE /sessions/:id');
    if (deleteResponse.status !== 204) throw new HarnessError('Session cleanup failed.', { status: deleteResponse.status, body: deleteResponse.body });
    sessionId = null;

    await trace.flush();
    const evidence = [
      'API harness smoke: PASS',
      `Base URL: ${options.baseUrl}`,
      `Actions executed: ${options.maxSteps}`,
      `Trace: ${options.trace}`,
      `Latest checkpoint: ${checkpointPath}`,
      `Final mode/version: ${latestSnapshot.mode}/${latestSnapshot.version}`,
      `Milestones observed: ${Array.from(progress.completedMilestoneIds).join(', ') || 'none'}`,
      'HTTP statuses:',
      ...statuses.map((entry) => `- ${entry.endpoint}: ${entry.status} (expected ${entry.expected})`),
      ''
    ].join('\n');
    if (options.evidence) await writeTextFile(options.evidence, evidence);
    console.log(evidence.trim());
  } catch (error) {
    if (sessionId && error instanceof HarnessError && error.details?.reason) {
      const rolledBackSnapshot = await rollbackToLastCheckpoint(client, sessionId, stuck, statuses);
      if (rolledBackSnapshot) {
        trace.record({
          event: 'rollback',
          reason: error.details.reason,
          checkpoint: stuck.latestCheckpoint.path,
          checkpointLabel: stuck.latestCheckpoint.label,
          mode: rolledBackSnapshot.mode,
          version: rolledBackSnapshot.version,
          summary: rolledBackSnapshot.summary
        });
        await trace.flush();
      }
    }
    throw error;
  } finally {
    if (sessionId) {
      await client.deleteSession(sessionId).catch(() => undefined);
    }
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.validateRoute) await runRouteValidation(options);
  if (options.testStuckDetection) await runStuckDetectionTest(options);
  if (options.semanticGuard) await runSemanticGuard(options);
  if (options.smoke) await runSmoke(options);
  if (!options.validateRoute && !options.testStuckDetection && !options.semanticGuard && !options.smoke) {
    await runSmoke({ ...options, maxSteps: Math.max(options.maxSteps, 1) });
  }
};

main().catch(async (error) => {
  const details = error instanceof HarnessError ? error.details : undefined;
  const message = error instanceof Error ? error.message : String(error);
  console.error(`API harness failed: ${message}`);
  if (details && Object.keys(details).length > 0) console.error(JSON.stringify(details, null, 2));
  await delay(0);
  process.exit(1);
});
