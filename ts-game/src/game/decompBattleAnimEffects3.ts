export interface AnimSprite3 { x: number; y: number; x2: number; y2: number; data: number[]; callback: string | null; invisible: boolean; destroyed: boolean; affineScaleX: number; affineScaleY: number; angle: number; palette: number; animNum: number; priority: number; }
export interface AnimTask3 { data: number[]; func: string | null; destroyed: boolean; }
export interface BattleAnimEffects3Runtime {
  sprites: AnimSprite3[];
  tasks: AnimTask3[];
  operations: string[];
  battlerX: number[];
  battlerY: number[];
  battlerSide: number[];
  battlerInvisible: boolean[];
  attacker: number;
  target: number;
  args: number[];
  bgOffset: number;
  blend: { eva: number; evb: number; coeff: number; target: string | null };
  spotlightSpriteId: number | null;
  healingMove: boolean;
  weather: number;
  returnPowerLevel: number;
  monSubstituteState: number;
}

let activeRuntime: BattleAnimEffects3Runtime | null = null;
const makeSprite = (): AnimSprite3 => ({ x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback: null, invisible: false, destroyed: false, affineScaleX: 256, affineScaleY: 256, angle: 0, palette: 0, animNum: 0, priority: 0 });
const makeTask = (): AnimTask3 => ({ data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false });
const req = (runtime?: BattleAnimEffects3Runtime): BattleAnimEffects3Runtime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('battle anim effects 3 runtime is not active'); return r; };
const s = (r: BattleAnimEffects3Runtime, id: number): AnimSprite3 => r.sprites[id] ?? (r.sprites[id] = makeSprite());
const t = (r: BattleAnimEffects3Runtime, id: number): AnimTask3 => r.tasks[id] ?? (r.tasks[id] = makeTask());
const op = (r: BattleAnimEffects3Runtime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const destroySprite = (r: BattleAnimEffects3Runtime, id: number): void => { const sp = s(r, id); sp.destroyed = true; sp.callback = null; op(r, 'DestroySprite', id); };
const destroyTask = (r: BattleAnimEffects3Runtime, id: number): void => { const task = t(r, id); task.destroyed = true; task.func = null; op(r, 'DestroyTask', id); };
const createSprite = (r: BattleAnimEffects3Runtime, callback: string, x = 0, y = 0): number => { const id = r.sprites.length; r.sprites.push({ ...makeSprite(), callback, x, y }); op(r, 'CreateSprite', callback, id); return id; };
const setMonPos = (sp: AnimSprite3, battler: number, r: BattleAnimEffects3Runtime): void => { sp.x = r.battlerX[battler] ?? 0; sp.y = r.battlerY[battler] ?? 0; };
const stepSprite = (r: BattleAnimEffects3Runtime, id: number, dx: number, dy: number, frames: number, next?: string): void => { const sp = s(r, id); sp.x2 += dx; sp.y2 += dy; sp.data[0]++; if (sp.data[0] >= frames) { if (next) { sp.callback = next; sp.data[0] = 0; } else destroySprite(r, id); } };
const stepTask = (r: BattleAnimEffects3Runtime, id: number, frames: number, next?: string): void => { const task = t(r, id); task.data[0]++; if (task.data[0] >= frames) { if (next) { task.func = next; task.data[0] = 0; } else destroyTask(r, id); } };
const wave = (sp: AnimSprite3, amp: number, div = 2): void => { sp.y2 = Math.trunc(Math.sin(sp.data[0] / div) * amp); };
const orbit = (sp: AnimSprite3, radiusX: number, radiusY: number, speed = 8): void => { sp.data[0] += speed; sp.x2 = Math.trunc(Math.cos(sp.data[0] / 16) * radiusX); sp.y2 = Math.trunc(Math.sin(sp.data[0] / 16) * radiusY); };
const setTaskFunc = (r: BattleAnimEffects3Runtime, id: number, func: string): void => { t(r, id).func = func; };
const setSpriteCallback = (r: BattleAnimEffects3Runtime, id: number, callback: string): void => { s(r, id).callback = callback; };

export function createBattleAnimEffects3Runtime(overrides: Partial<BattleAnimEffects3Runtime> = {}): BattleAnimEffects3Runtime {
  const runtime: BattleAnimEffects3Runtime = {
    sprites: [],
    tasks: [],
    operations: [],
    battlerX: [48, 200, 72, 176],
    battlerY: [96, 56, 96, 56],
    battlerSide: [0, 1, 0, 1],
    battlerInvisible: [false, false, false, false],
    attacker: 0,
    target: 1,
    args: Array.from({ length: 16 }, () => 0),
    bgOffset: 0,
    blend: { eva: 0, evb: 0, coeff: 0, target: null },
    spotlightSpriteId: null,
    healingMove: false,
    weather: 0,
    returnPowerLevel: 0,
    monSubstituteState: 0,
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
}
export function createAnimSprite3(runtime = req()): number { const id = runtime.sprites.length; runtime.sprites.push(makeSprite()); return id; }
export function createAnimTask3(runtime = req()): number { const id = runtime.tasks.length; runtime.tasks.push(makeTask()); return id; }

export function AnimBlackSmoke(spriteId: number, r = req()): void { const sp = s(r, spriteId); setMonPos(sp, r.target, r); sp.x += r.args[0] ?? 0; sp.y += r.args[1] ?? 0; sp.data[1] = r.args[2] || 1; sp.callback = 'AnimBlackSmoke_Step'; }
export function AnimBlackSmoke_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += sp.data[1] || 1; sp.y2 -= 1; sp.invisible = (sp.data[0] & 1) === 1; stepSprite(r, spriteId, 0, 0, 32); }
export function AnimTask_SmokescreenImpact(taskId: number, r = req()): void { op(r, 'SmokescreenImpact', r.target); destroyTask(r, taskId); }
export function AnimWhiteHalo(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).affineScaleX = 64; s(r, spriteId).affineScaleY = 64; setSpriteCallback(r, spriteId, 'AnimWhiteHalo_Step1'); }
export function AnimWhiteHalo_Step1(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.affineScaleX += 32; sp.affineScaleY += 32; stepSprite(r, spriteId, 0, 0, 8, 'AnimWhiteHalo_Step2'); }
export function AnimWhiteHalo_Step2(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 16); }
export function AnimTealAlert(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).callback = 'AnimTealAlert'; stepSprite(r, spriteId, 0, -2, 24); }
export function AnimMeanLookEye(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).affineScaleX = 384; s(r, spriteId).affineScaleY = 384; setSpriteCallback(r, spriteId, 'AnimMeanLookEye_Step1'); }
export function AnimMeanLookEye_Step1(spriteId: number, r = req()): void { s(r, spriteId).palette = s(r, spriteId).data[0] & 1; stepSprite(r, spriteId, 0, 0, 12, 'AnimMeanLookEye_Step2'); }
export function AnimMeanLookEye_Step2(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX -= 24; s(r, spriteId).affineScaleY -= 24; stepSprite(r, spriteId, 0, 0, 8, 'AnimMeanLookEye_Step3'); }
export function AnimMeanLookEye_Step3(spriteId: number, r = req()): void { s(r, spriteId).invisible = false; stepSprite(r, spriteId, 0, 0, 24, 'AnimMeanLookEye_Step4'); }
export function AnimMeanLookEye_Step4(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 10); }
export function AnimTask_SetPsychicBackground(taskId: number, r = req()): void { r.blend.target = 'psychic'; setTaskFunc(r, taskId, 'SetPsychicBackground_Step'); }
export function SetPsychicBackground_Step(taskId: number, r = req()): void { r.bgOffset += 2; r.blend.coeff = Math.min(16, t(r, taskId).data[0]); stepTask(r, taskId, 16); }
export function AnimTask_FadeScreenToWhite(taskId: number, r = req()): void { r.blend.target = 'white'; setTaskFunc(r, taskId, 'FadeScreenToWhite_Step'); }
export function FadeScreenToWhite_Step(taskId: number, r = req()): void { r.blend.coeff = Math.min(16, t(r, taskId).data[0] + 1); stepTask(r, taskId, 16); }
export function AnimSpikes(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).y += 16; setSpriteCallback(r, spriteId, 'AnimSpikes_Step1'); }
export function AnimSpikes_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, -3, 8, 'AnimSpikes_Step2'); }
export function AnimSpikes_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 2, 16); }
export function AnimLeer(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 0, 0, 20); }
export function AnimLetterZ(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 1, -2, 24); }
export function AnimFang(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, r.args[0] || 2, r.args[1] || 2, 12); }
export function AnimTask_IsTargetPlayerSide(taskId: number, r = req()): void { t(r, taskId).data[0] = r.battlerSide[r.target] === 0 ? 1 : 0; destroyTask(r, taskId); }
export function AnimTask_IsHealingMove(taskId: number, r = req()): void { t(r, taskId).data[0] = r.healingMove ? 1 : 0; destroyTask(r, taskId); }
export function AnimSpotlight(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).affineScaleX = 32; s(r, spriteId).affineScaleY = 32; setSpriteCallback(r, spriteId, 'AnimSpotlight_Step1'); }
export function AnimSpotlight_Step1(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX += 32; s(r, spriteId).affineScaleY += 32; stepSprite(r, spriteId, 0, 0, 8, 'AnimSpotlight_Step2'); }
export function AnimSpotlight_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 32); }
export function AnimClappingHand(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); s(r, spriteId).data[1] = 1; setSpriteCallback(r, spriteId, 'AnimClappingHand_Step'); }
export function AnimClappingHand_Step(spriteId: number, r = req()): void { s(r, spriteId).x2 += s(r, spriteId).data[1]; s(r, spriteId).data[1] *= -1; stepSprite(r, spriteId, 0, 0, 18); }
export function AnimClappingHand2(spriteId: number, r = req()): void { AnimClappingHand(spriteId, r); s(r, spriteId).data[1] = -1; }
export function AnimTask_CreateSpotlight(taskId: number, r = req()): void { r.spotlightSpriteId = createSprite(r, 'AnimSpotlight_Step1', r.battlerX[r.target], r.battlerY[r.target]); destroyTask(r, taskId); }
export function AnimTask_RemoveSpotlight(taskId: number, r = req()): void { if (r.spotlightSpriteId !== null) destroySprite(r, r.spotlightSpriteId); r.spotlightSpriteId = null; destroyTask(r, taskId); }
export function AnimRapidSpin(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimRapidSpin_Step'); }
export function AnimRapidSpin_Step(spriteId: number, r = req()): void { s(r, spriteId).angle = (s(r, spriteId).angle + 32) & 0xff; stepSprite(r, spriteId, 0, 0, 32); }
export function AnimTask_RapinSpinMonElevation(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'RapinSpinMonElevation_Step'); }
export function RapinSpinMonElevation_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = Math.trunc(Math.sin(t(r, taskId).data[0] / 3) * 6); stepTask(r, taskId, 32); }
export function AnimTask_TormentAttacker(taskId: number, r = req()): void { const clone = createSprite(r, 'TormentAttacker_Callback', r.battlerX[r.attacker], r.battlerY[r.attacker]); t(r, taskId).data[1] = clone; setTaskFunc(r, taskId, 'TormentAttacker_Step'); }
export function TormentAttacker_Step(taskId: number, r = req()): void { t(r, taskId).data[2]++; stepTask(r, taskId, 28); }
export function TormentAttacker_Callback(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 28); }
export function AnimTriAttackTriangle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).angle += 16; stepSprite(r, spriteId, 3, -1, 24); }
export function AnimTask_DefenseCurlDeformMon(taskId: number, r = req()): void { t(r, taskId).data[1] += 16; stepTask(r, taskId, 16); }
export function AnimBatonPassPokeball(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 4, -3, 30); }
export function AnimWishStar(spriteId: number, r = req()): void { s(r, spriteId).x = r.battlerX[r.target] - 48; s(r, spriteId).y = r.battlerY[r.target] - 48; setSpriteCallback(r, spriteId, 'AnimWishStar_Step'); }
export function AnimWishStar_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, 3, 32); }
export function AnimMiniTwinklingStar(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimMiniTwinklingStar_Step'); }
export function AnimMiniTwinklingStar_Step(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, -1, 16); }
export function AnimTask_StockpileDeformMon(taskId: number, r = req()): void { t(r, taskId).data[1] += 8; stepTask(r, taskId, 16); }
export function AnimTask_SpitUpDeformMon(taskId: number, r = req()): void { t(r, taskId).data[1] -= 8; stepTask(r, taskId, 16); }
export function AnimSwallowBlueOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 0, 3, 24); }
export function AnimTask_SwallowDeformMon(taskId: number, r = req()): void { t(r, taskId).data[1] += t(r, taskId).data[0] < 8 ? 8 : -8; stepTask(r, taskId, 16); }
export function AnimTask_TransformMon(taskId: number, r = req()): void { r.battlerInvisible[r.attacker] = !r.battlerInvisible[r.attacker]; op(r, 'TransformMon', r.attacker); destroyTask(r, taskId); }
export function AnimTask_IsMonInvisible(taskId: number, r = req()): void { t(r, taskId).data[0] = r.battlerInvisible[r.args[0] ?? r.target] ? 1 : 0; destroyTask(r, taskId); }
export function AnimTask_CastformGfxChange(taskId: number, r = req()): void { op(r, 'CastformGfxChange', r.args[0] ?? 0); destroyTask(r, taskId); }
export function AnimTask_MorningSunLightBeam(taskId: number, r = req()): void { createSprite(r, 'AnimGreenStar_Step1', r.battlerX[r.target], r.battlerY[r.target] - 32); stepTask(r, taskId, 8); }
export function AnimGreenStar(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimGreenStar_Step1'); }
export function AnimGreenStar_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, -3, 8, 'AnimGreenStar_Step2'); }
export function AnimGreenStar_Step2(spriteId: number, r = req()): void { s(r, spriteId).callback = 'AnimGreenStar_Callback'; AnimGreenStar_Callback(spriteId, r); }
export function AnimGreenStar_Callback(spriteId: number, r = req()): void { s(r, spriteId).angle += 24; stepSprite(r, spriteId, 0, 2, 18); }
export function AnimTask_DoomDesireLightBeam(taskId: number, r = req()): void { createSprite(r, 'AnimWishStar_Step', r.battlerX[r.target], r.battlerY[r.target] - 48); stepTask(r, taskId, 12); }
export function AnimTask_StrongFrustrationGrowAndShrink(taskId: number, r = req()): void { t(r, taskId).data[1] += t(r, taskId).data[0] < 8 ? 32 : -32; stepTask(r, taskId, 16); }
export function AnimWeakFrustrationAngerMark(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, -1, 18); }
export function AnimTask_RockMonBackAndForth(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_RockMonBackAndForth_Step'); }
export function AnimTask_RockMonBackAndForth_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] & 1 ? -4 : 4; stepTask(r, taskId, 16); }
export function AnimSweetScentPetal(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimSweetScentPetal_Step'); }
export function AnimSweetScentPetal_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += 2; wave(sp, 10); stepSprite(r, spriteId, 0, 0, 40); }
export function AnimTask_FlailMovement(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_FlailMovement_Step'); }
export function AnimTask_FlailMovement_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] % 3 === 0 ? -8 : 8; stepTask(r, taskId, 20); }
export function AnimPainSplitProjectile(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 5, -2, 24); }
export function AnimTask_PainSplitMovement(taskId: number, r = req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] & 1 ? -3 : 3; stepTask(r, taskId, 24); }
export function AnimFlatterConfetti(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimFlatterConfetti_Step'); }
export function AnimFlatterConfetti_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.y2 += 2; sp.x2 += sp.data[0] & 1 ? 1 : -1; stepSprite(r, spriteId, 0, 0, 32); }
export function AnimFlatterSpotlight(spriteId: number, r = req()): void { AnimSpotlight(spriteId, r); s(r, spriteId).callback = 'AnimFlatterSpotlight_Step'; }
export function AnimFlatterSpotlight_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 8, 0, 16); stepSprite(r, spriteId, 0, 0, 24); }
export function AnimReversalOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimReversalOrb_Step'); }
export function AnimReversalOrb_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 16, 16, 12); stepSprite(r, spriteId, 0, 0, 32); }
export function AnimTask_RolePlaySilhouette(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_RolePlaySilhouette_Step1'); }
export function AnimTask_RolePlaySilhouette_Step1(taskId: number, r = req()): void { r.battlerInvisible[r.attacker] = true; stepTask(r, taskId, 12, 'AnimTask_RolePlaySilhouette_Step2'); }
export function AnimTask_RolePlaySilhouette_Step2(taskId: number, r = req()): void { r.battlerInvisible[r.attacker] = false; stepTask(r, taskId, 12); }
export function AnimTask_AcidArmor(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_AcidArmor_Step'); }
export function AnimTask_AcidArmor_Step(taskId: number, r = req()): void { t(r, taskId).data[1] -= 16; stepTask(r, taskId, 16); }
export function AnimTask_DeepInhale(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_DeepInhale_Step'); }
export function AnimTask_DeepInhale_Step(taskId: number, r = req()): void { t(r, taskId).data[1] += t(r, taskId).data[0] < 10 ? 4 : -4; stepTask(r, taskId, 20); }
export function InitYawnCloudPosition(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); s(r, spriteId).x -= 24; s(r, spriteId).y -= 16; }
export function UpdateYawnCloudPosition(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += 1; sp.y2 = Math.trunc(Math.sin(sp.data[0] / 4) * 4); }
export function AnimYawnCloud(spriteId: number, r = req()): void { InitYawnCloudPosition(spriteId, r); setSpriteCallback(r, spriteId, 'AnimYawnCloud_Step'); }
export function AnimYawnCloud_Step(spriteId: number, r = req()): void { UpdateYawnCloudPosition(spriteId, r); stepSprite(r, spriteId, 0, 0, 48); }
export function AnimSmokeBallEscapeCloud(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, -2, -1, 28); }
export function AnimTask_SlideMonForFocusBand_Step2(taskId: number, r = req()): void { t(r, taskId).data[1] -= 2; stepTask(r, taskId, 10); }
export function AnimTask_SlideMonForFocusBand_Step1(taskId: number, r = req()): void { t(r, taskId).data[1] += 2; stepTask(r, taskId, 10, 'AnimTask_SlideMonForFocusBand_Step2'); }
export function AnimTask_SlideMonForFocusBand(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_SlideMonForFocusBand_Step1'); }
export function AnimTask_SquishAndSweatDroplets(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_SquishAndSweatDroplets_Step'); }
export function AnimTask_SquishAndSweatDroplets_Step(taskId: number, r = req()): void { if (t(r, taskId).data[0] === 4) CreateSweatDroplets(taskId, true, r); t(r, taskId).data[1] += t(r, taskId).data[0] < 8 ? 16 : -16; stepTask(r, taskId, 16); }
export function CreateSweatDroplets(taskId: number, onAttacker: boolean, r = req()): void { const battler = onAttacker ? r.attacker : r.target; t(r, taskId).data[2] = createSprite(r, 'AnimFacadeSweatDrop', r.battlerX[battler], r.battlerY[battler] - 24); }
export function AnimFacadeSweatDrop(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 1, 2, 18); }
export function AnimTask_FacadeColorBlend(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_FacadeColorBlend_Step'); }
export function AnimTask_FacadeColorBlend_Step(taskId: number, r = req()): void { r.blend.coeff = t(r, taskId).data[0] < 8 ? t(r, taskId).data[0] : 16 - t(r, taskId).data[0]; stepTask(r, taskId, 16); }
export function AnimTask_StatusClearedEffect(taskId: number, r = req()): void { op(r, 'StatusClearedEffect', r.target); destroyTask(r, taskId); }
export function AnimRoarNoiseLine(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimRoarNoiseLine_Step'); }
export function AnimRoarNoiseLine_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 4, s(r, spriteId).data[0] & 1 ? -1 : 1, 20); }
export function AnimTask_GlareEyeDots(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_GlareEyeDots_Step'); }
export function AnimTask_GlareEyeDots_Step(taskId: number, r = req()): void { if (t(r, taskId).data[0] % 4 === 0) createSprite(r, 'AnimGlareEyeDot', r.battlerX[r.attacker], r.battlerY[r.attacker]); stepTask(r, taskId, 24); }
export function GetGlareEyeDotCoords(x1: number, y1: number, x2: number, y2: number, step: number, steps: number, outX: { value: number }, outY: { value: number }): void { outX.value = x1 + Math.trunc(((x2 - x1) * step) / Math.max(1, steps)); outY.value = y1 + Math.trunc(((y2 - y1) * step) / Math.max(1, steps)); }
export function AnimGlareEyeDot(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, 0, 16); }
export function AnimAssistPawprint(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 2, -1, 20); }
export function AnimTask_BarrageBall(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_BarrageBall_Step'); }
export function AnimTask_BarrageBall_Step(taskId: number, r = req()): void { if (t(r, taskId).data[0] % 5 === 0) createSprite(r, 'AnimTriAttackTriangle', r.battlerX[r.attacker], r.battlerY[r.attacker]); stepTask(r, taskId, 25); }
export function AnimSmellingSaltsHand(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimSmellingSaltsHand_Step'); }
export function AnimSmellingSaltsHand_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, 0, 8); }
export function AnimTask_SmellingSaltsSquish(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_SmellingSaltsSquish_Step'); }
export function AnimTask_SmellingSaltsSquish_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] & 1 ? 16 : -16; stepTask(r, taskId, 12); }
export function AnimSmellingSaltExclamation(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimSmellingSaltExclamation_Step'); }
export function AnimSmellingSaltExclamation_Step(spriteId: number, r = req()): void { s(r, spriteId).invisible = s(r, spriteId).data[0] & 1 ? true : false; stepSprite(r, spriteId, 0, -1, 18); }
export function AnimHelpingHandClap(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimHelpingHandClap_Step'); }
export function AnimHelpingHandClap_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, s(r, spriteId).data[0] < 4 ? 4 : -4, 0, 8); }
export function AnimTask_HelpingHandAttackerMovement(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_HelpingHandAttackerMovement_Step'); }
export function AnimTask_HelpingHandAttackerMovement_Step(taskId: number, r = req()): void { t(r, taskId).data[1] += t(r, taskId).data[0] < 6 ? -2 : 2; stepTask(r, taskId, 12); }
export function AnimForesightMagnifyingGlass(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimForesightMagnifyingGlass_Step'); }
export function AnimForesightMagnifyingGlass_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 20, 8, 10); stepSprite(r, spriteId, 0, 0, 36); }
export function AnimMeteorMashStar_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, -4, 2, 18); }
export function AnimMeteorMashStar(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimMeteorMashStar_Step'); }
export function AnimTask_MonToSubstitute(taskId: number, r = req()): void { r.monSubstituteState = 1; setTaskFunc(r, taskId, 'AnimTask_MonToSubstituteDoll'); }
export function AnimTask_MonToSubstituteDoll(taskId: number, r = req()): void { r.monSubstituteState = 2; stepTask(r, taskId, 16); }
export function AnimBlockX(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimBlockX_Step'); }
export function AnimBlockX_Step(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 24); }
export function AnimTask_OdorSleuthMovement(taskId: number, r = req()): void { const clone = createSprite(r, 'MoveOdorSleuthClone', r.battlerX[r.attacker], r.battlerY[r.attacker]); t(r, taskId).data[1] = clone; setTaskFunc(r, taskId, 'AnimTask_OdorSleuthMovementWaitFinish'); }
export function AnimTask_OdorSleuthMovementWaitFinish(taskId: number, r = req()): void { const clone = t(r, taskId).data[1]; if (s(r, clone).destroyed) destroyTask(r, taskId); }
export function MoveOdorSleuthClone(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, 0, 24); }
export function AnimTask_GetReturnPowerLevel(taskId: number, r = req()): void { t(r, taskId).data[0] = r.returnPowerLevel; destroyTask(r, taskId); }
export function AnimTask_SnatchOpposingMonMove(taskId: number, r = req()): void { op(r, 'SnatchOpposingMonMove'); destroyTask(r, taskId); }
export function AnimUnusedItemBagSteal(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, -3, -2, 24); }
export function AnimTask_SnatchPartnerMove(taskId: number, r = req()): void { op(r, 'SnatchPartnerMove'); destroyTask(r, taskId); }
export function AnimTask_TeeterDanceMovement(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_TeeterDanceMovement_Step'); }
export function AnimTask_TeeterDanceMovement_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = Math.trunc(Math.sin(t(r, taskId).data[0] / 2) * 8); stepTask(r, taskId, 32); }
export function AnimKnockOffStrike_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 5, 0, 10); }
export function AnimKnockOffStrike(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimKnockOffStrike_Step'); }
export function AnimRecycle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimRecycle_Step'); }
export function AnimRecycle_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 12, 12, 16); stepSprite(r, spriteId, 0, 0, 32); }
export function AnimTask_GetWeather(taskId: number, r = req()): void { t(r, taskId).data[0] = r.weather; destroyTask(r, taskId); }
export function AnimTask_SlackOffSquish(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_SlackOffSquish_Step'); }
export function AnimTask_SlackOffSquish_Step(taskId: number, r = req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] < 8 ? 16 : -16; stepTask(r, taskId, 16); }

export const spriteCallbacks3 = {
  AnimBlackSmoke_Step, AnimWhiteHalo_Step1, AnimWhiteHalo_Step2, AnimTealAlert, AnimMeanLookEye_Step1, AnimMeanLookEye_Step2, AnimMeanLookEye_Step3, AnimMeanLookEye_Step4, AnimSpikes_Step1, AnimSpikes_Step2, AnimSpotlight_Step1, AnimSpotlight_Step2, AnimClappingHand_Step, AnimRapidSpin_Step, TormentAttacker_Callback, AnimWishStar_Step, AnimMiniTwinklingStar_Step, AnimGreenStar_Step1, AnimGreenStar_Step2, AnimGreenStar_Callback, AnimSweetScentPetal_Step, AnimFlatterConfetti_Step, AnimFlatterSpotlight_Step, AnimReversalOrb_Step, AnimYawnCloud_Step, AnimFacadeSweatDrop, AnimRoarNoiseLine_Step, AnimGlareEyeDot, AnimSmellingSaltsHand_Step, AnimSmellingSaltExclamation_Step, AnimHelpingHandClap_Step, AnimForesightMagnifyingGlass_Step, AnimMeteorMashStar_Step, AnimBlockX_Step, MoveOdorSleuthClone, AnimKnockOffStrike_Step, AnimRecycle_Step
};
export const taskCallbacks3 = {
  SetPsychicBackground_Step, FadeScreenToWhite_Step, RapinSpinMonElevation_Step, TormentAttacker_Step, AnimTask_RockMonBackAndForth_Step, AnimTask_FlailMovement_Step, AnimTask_RolePlaySilhouette_Step1, AnimTask_RolePlaySilhouette_Step2, AnimTask_AcidArmor_Step, AnimTask_DeepInhale_Step, AnimTask_SlideMonForFocusBand_Step1, AnimTask_SlideMonForFocusBand_Step2, AnimTask_SquishAndSweatDroplets_Step, AnimTask_FacadeColorBlend_Step, AnimTask_GlareEyeDots_Step, AnimTask_BarrageBall_Step, AnimTask_SmellingSaltsSquish_Step, AnimTask_HelpingHandAttackerMovement_Step, AnimTask_MonToSubstituteDoll, AnimTask_OdorSleuthMovementWaitFinish, AnimTask_TeeterDanceMovement_Step, AnimTask_SlackOffSquish_Step
};
