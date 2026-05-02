export interface AnimSprite1 { x: number; y: number; x2: number; y2: number; data: number[]; callback: string | null; invisible: boolean; destroyed: boolean; animNum: number; affineScaleX: number; affineScaleY: number; angle: number; palette: number; priority: number; }
export interface AnimTask1 { data: number[]; func: string | null; destroyed: boolean; }
export interface BattleAnimEffects1Runtime {
  sprites: AnimSprite1[];
  tasks: AnimTask1[];
  operations: string[];
  battlerX: number[];
  battlerY: number[];
  attacker: number;
  target: number;
  args: number[];
  bgOffset: number;
  healthboxesHidden: boolean;
  musicBlendActive: boolean;
  leafBladeFactor: number;
  frenzyPlantRootData: { startX: number; startY: number; targetX: number; targetY: number };
}

let activeRuntime: BattleAnimEffects1Runtime | null = null;
const makeSprite = (): AnimSprite1 => ({ x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback: null, invisible: false, destroyed: false, animNum: 0, affineScaleX: 256, affineScaleY: 256, angle: 0, palette: 0, priority: 0 });
const makeTask = (): AnimTask1 => ({ data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false });
const req = (runtime?: BattleAnimEffects1Runtime): BattleAnimEffects1Runtime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('battle anim effects 1 runtime is not active'); return r; };
const s = (r: BattleAnimEffects1Runtime, id: number): AnimSprite1 => r.sprites[id] ?? (r.sprites[id] = makeSprite());
const t = (r: BattleAnimEffects1Runtime, id: number): AnimTask1 => r.tasks[id] ?? (r.tasks[id] = makeTask());
const op = (r: BattleAnimEffects1Runtime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const destroySprite = (r: BattleAnimEffects1Runtime, id: number): void => { const sp = s(r, id); sp.destroyed = true; sp.callback = null; op(r, 'DestroySprite', id); };
const destroyTask = (r: BattleAnimEffects1Runtime, id: number): void => { const task = t(r, id); task.destroyed = true; task.func = null; op(r, 'DestroyTask', id); };
const createSprite = (r: BattleAnimEffects1Runtime, callback: string, x = 0, y = 0): number => { const id = r.sprites.length; r.sprites.push({ ...makeSprite(), callback, x, y }); op(r, 'CreateSprite', callback, id); return id; };
const setMonPos = (sp: AnimSprite1, battler: number, r: BattleAnimEffects1Runtime): void => { sp.x = r.battlerX[battler] ?? 0; sp.y = r.battlerY[battler] ?? 0; };
const stepSprite = (r: BattleAnimEffects1Runtime, id: number, dx: number, dy: number, frames: number, next?: string): void => { const sp = s(r, id); sp.x2 += dx; sp.y2 += dy; sp.data[0]++; if (sp.data[0] >= frames) { if (next) { sp.callback = next; sp.data[0] = 0; } else destroySprite(r, id); } };
const stepTask = (r: BattleAnimEffects1Runtime, id: number, frames: number, next?: string): void => { const task = t(r, id); task.data[0]++; if (task.data[0] >= frames) { if (next) { task.func = next; task.data[0] = 0; } else destroyTask(r, id); } };
const setSpriteCallback = (r: BattleAnimEffects1Runtime, id: number, callback: string): void => { s(r, id).callback = callback; };
const setTaskFunc = (r: BattleAnimEffects1Runtime, id: number, func: string): void => { t(r, id).func = func; };
const wave = (sp: AnimSprite1, amp: number, div = 2): void => { sp.y2 = Math.trunc(Math.sin(sp.data[0] / div) * amp); };
const orbit = (sp: AnimSprite1, radiusX: number, radiusY: number, speed = 8): void => { sp.data[0] += speed; sp.x2 = Math.trunc(Math.cos(sp.data[0] / 16) * radiusX); sp.y2 = Math.trunc(Math.sin(sp.data[0] / 16) * radiusY); };
const arc = (sp: AnimSprite1, dx: number, gravity = 1): void => { sp.x2 += dx; sp.data[1] += gravity; sp.y2 += sp.data[1]; };

export function createBattleAnimEffects1Runtime(overrides: Partial<BattleAnimEffects1Runtime> = {}): BattleAnimEffects1Runtime {
  const runtime: BattleAnimEffects1Runtime = {
    sprites: [],
    tasks: [],
    operations: [],
    battlerX: [48, 200, 72, 176],
    battlerY: [96, 56, 96, 56],
    attacker: 0,
    target: 1,
    args: Array.from({ length: 16 }, () => 0),
    bgOffset: 0,
    healthboxesHidden: false,
    musicBlendActive: false,
    leafBladeFactor: 0,
    frenzyPlantRootData: { startX: 0, startY: 0, targetX: 0, targetY: 0 },
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
}
export function createAnimSprite1(runtime = req()): number { const id = runtime.sprites.length; runtime.sprites.push(makeSprite()); return id; }
export function createAnimTask1(runtime = req()): number { const id = runtime.tasks.length; runtime.tasks.push(makeTask()); return id; }

export function AnimMovePowderParticle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).x += r.args[0] ?? 0; s(r, spriteId).y += r.args[1] ?? 0; setSpriteCallback(r, spriteId, 'AnimMovePowderParticle_Step'); }
export function AnimMovePowderParticle_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += 1; wave(sp, 8, 3); stepSprite(r, spriteId, 0, 0, 48); }
export function AnimPowerAbsorptionOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, -3, 1, 24); }
export function AnimSolarBeamBigOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 0, -2, 28); }
export function AnimSolarBeamSmallOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimSolarBeamSmallOrb_Step'); }
export function AnimSolarBeamSmallOrb_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 24, 10, 10); stepSprite(r, spriteId, 0, -1, 32); }
export function AnimTask_CreateSmallSolarBeamOrbs(taskId: number, r = req()): void { const count = r.args[0] || 6; for (let i = 0; i < count; i++) createSprite(r, 'AnimSolarBeamSmallOrb_Step', r.battlerX[r.attacker], r.battlerY[r.attacker]); destroyTask(r, taskId); }
export function AnimAbsorptionOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimAbsorptionOrb_Step'); }
export function AnimAbsorptionOrb_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, -3, 2, 24); }
export function AnimHyperBeamOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimHyperBeamOrb_Step'); }
export function AnimHyperBeamOrb_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 6, -1, 24); }
export function AnimLeechSeed(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimLeechSeed_Step'); }
export function AnimLeechSeed_Step(spriteId: number, r = req()): void { arc(s(r, spriteId), 4, 1); stepSprite(r, spriteId, 0, 0, 24); }
export function AnimLeechSeedSprouts(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).y += 12; stepSprite(r, spriteId, 0, -1, 20); }
export function AnimSporeParticle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimSporeParticle_Step'); }
export function AnimSporeParticle_Step(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, -1, 40); }
export function AnimTask_SporeDoubleBattle(taskId: number, r = req()): void { createSprite(r, 'AnimSporeParticle_Step', r.battlerX[r.target], r.battlerY[r.target]); createSprite(r, 'AnimSporeParticle_Step', r.battlerX[r.target] + 24, r.battlerY[r.target]); destroyTask(r, taskId); }
export function AnimPetalDanceBigFlower(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimPetalDanceBigFlower_Step'); }
export function AnimPetalDanceBigFlower_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 18, 18, 16); stepSprite(r, spriteId, 0, 0, 32); }
export function AnimPetalDanceSmallFlower(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimPetalDanceSmallFlower_Step'); }
export function AnimPetalDanceSmallFlower_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 12, 12, 12); stepSprite(r, spriteId, 1, 0, 32); }
export function AnimRazorLeafParticle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimRazorLeafParticle_Step1'); }
export function AnimRazorLeafParticle_Step1(spriteId: number, r = req()): void { s(r, spriteId).angle += 16; stepSprite(r, spriteId, 3, -2, 8, 'AnimRazorLeafParticle_Step2'); }
export function AnimRazorLeafParticle_Step2(spriteId: number, r = req()): void { s(r, spriteId).angle += 24; stepSprite(r, spriteId, 5, 1, 20); }
export function AnimTranslateLinearSingleSineWave(spriteId: number, r = req()): void { setSpriteCallback(r, spriteId, 'AnimTranslateLinearSingleSineWave_Step'); }
export function AnimTranslateLinearSingleSineWave_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += r.args[0] || 2; wave(sp, r.args[1] || 8); stepSprite(r, spriteId, 0, 0, r.args[2] || 32); }
export function AnimMoveTwisterParticle(spriteId: number, r = req()): void { setSpriteCallback(r, spriteId, 'AnimMoveTwisterParticle_Step'); }
export function AnimMoveTwisterParticle_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 16, 32, 16); stepSprite(r, spriteId, 0, -2, 40); }
export function AnimConstrictBinding(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimConstrictBinding_Step1'); }
export function AnimConstrictBinding_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 8, 'AnimConstrictBinding_Step2'); }
export function AnimConstrictBinding_Step2(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX -= 8; stepSprite(r, spriteId, 0, 0, 24); }
export function AnimTask_ShrinkTargetCopy(taskId: number, r = req()): void { t(r, taskId).data[1] = createSprite(r, 'AnimTask_LeafBlade_Step2_Callback', r.battlerX[r.target], r.battlerY[r.target]); setTaskFunc(r, taskId, 'AnimTask_DuplicateAndShrinkToPos_Step1'); }
export function AnimTask_DuplicateAndShrinkToPos_Step1(taskId: number, r = req()): void { t(r, taskId).data[2] += 16; stepTask(r, taskId, 12, 'AnimTask_DuplicateAndShrinkToPos_Step2'); }
export function AnimTask_DuplicateAndShrinkToPos_Step2(taskId: number, r = req()): void { t(r, taskId).data[2] -= 16; stepTask(r, taskId, 12); }
export function AnimMimicOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 4, -2, 24); }
export function AnimIngrainRoot(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); s(r, spriteId).y += 20; stepSprite(r, spriteId, 0, -1, 16); }
export function AnimFrenzyPlantRoot(spriteId: number, r = req()): void { const sp = s(r, spriteId); r.frenzyPlantRootData = { startX: sp.x, startY: sp.y, targetX: r.battlerX[r.target], targetY: r.battlerY[r.target] }; stepSprite(r, spriteId, 3, -2, 24); }
export function AnimRootFlickerOut(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 16); }
export function AnimIngrainOrb(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 0, -3, 24); }
export function InitItemBagData(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).data[1] = r.battlerX[r.attacker]; s(r, spriteId).data[2] = r.battlerY[r.attacker]; }
export function MoveAlongLinearPath(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += Math.trunc(((sp.data[1] || sp.x) - sp.x) / 16); sp.y2 += Math.trunc(((sp.data[2] || sp.y) - sp.y) / 16); stepSprite(r, spriteId, 0, 0, 16); }
export function AnimItemSteal_Step2(spriteId: number, r = req()): void { MoveAlongLinearPath(spriteId, r); }
export function AnimItemSteal_Step1(spriteId: number, r = req()): void { InitItemBagData(spriteId, r); setSpriteCallback(r, spriteId, 'AnimItemSteal_Step2'); }
export function AnimPresent(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); arc(s(r, spriteId), 4, 1); stepSprite(r, spriteId, 0, 0, 24); }
export function AnimKnockOffOpponentsItem(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimKnockOffItem'); }
export function AnimKnockOffItem(spriteId: number, r = req()): void { arc(s(r, spriteId), 4, 1); stepSprite(r, spriteId, 0, 0, 20); }
export function AnimPresentHealParticle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 0, -2, 24); }
export function AnimItemSteal(spriteId: number, r = req()): void { InitItemBagData(spriteId, r); setSpriteCallback(r, spriteId, 'AnimItemSteal_Step3'); }
export function AnimItemSteal_Step3(spriteId: number, r = req()): void { stepSprite(r, spriteId, -4, 1, 24); }
export function AnimTrickBag(spriteId: number, r = req()): void { InitItemBagData(spriteId, r); setSpriteCallback(r, spriteId, 'AnimTrickBag_Step1'); }
export function AnimTrickBag_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, -2, 8, 'AnimTrickBag_Step2'); }
export function AnimTrickBag_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 8, 'AnimTrickBag_Step3'); }
export function AnimTrickBag_Step3(spriteId: number, r = req()): void { stepSprite(r, spriteId, -3, 2, 16); }
export function AnimTask_LeafBlade(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_LeafBlade_Step'); }
export function AnimTask_LeafBlade_Step(taskId: number, r = req()): void { if (t(r, taskId).data[0] % 4 === 0) createSprite(r, 'AnimRazorLeafParticle_Step1', r.battlerX[r.attacker], r.battlerY[r.attacker]); stepTask(r, taskId, 24, 'AnimTask_LeafBlade_Step2'); }
export function LeafBladeGetPosFactor(spriteId: number, r = req()): number { r.leafBladeFactor = Math.abs(s(r, spriteId).x2) + Math.abs(s(r, spriteId).y2); return r.leafBladeFactor; }
export function AnimTask_LeafBlade_Step2(taskId: number, r = req()): void { t(r, taskId).data[1]++; stepTask(r, taskId, 8); }
export function AnimTask_LeafBlade_Step2_Callback(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 8); }
export function AnimFlyingParticle(spriteId: number, r = req()): void { setSpriteCallback(r, spriteId, 'AnimFlyingParticle_Step'); }
export function AnimFlyingParticle_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 4, -2, 28); }
export function AnimTask_CycleMagicalLeafPal(taskId: number, r = req()): void { op(r, 'CycleMagicalLeafPal'); stepTask(r, taskId, 16); }
export function AnimNeedleArmSpike(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimNeedleArmSpike_Step'); }
export function AnimNeedleArmSpike_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 5, -1, 16); }
export function AnimWhipHit_WaitEnd(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 8); }
export function AnimSlidingHit(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 6, 0, 12); }
export function AnimWhipHit(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimWhipHit_WaitEnd'); }
export function AnimFlickeringPunch(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 0, 12); }
export function AnimCuttingSlice(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimSlice_Step'); }
export function AnimAirCutterSlice(spriteId: number, r = req()): void { AnimCuttingSlice(spriteId, r); s(r, spriteId).palette = 1; }
export function AnimSlice_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 4, -4, 10); }
export function UnusedFlickerAnim(spriteId: number, r = req()): void { s(r, spriteId).invisible = !s(r, spriteId).invisible; stepSprite(r, spriteId, 0, 0, 16); }
export function AnimCirclingMusicNote(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimCirclingMusicNote_Step'); }
export function AnimCirclingMusicNote_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 16, 12, 10); stepSprite(r, spriteId, 0, -1, 40); }
export function AnimProtect(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimProtect_Step'); }
export function AnimProtect_Step(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX += 12; s(r, spriteId).affineScaleY += 12; stepSprite(r, spriteId, 0, 0, 24); }
export function AnimMilkBottle(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimMilkBottle_Step1'); }
export function AnimMilkBottle_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, -2, 8, 'AnimMilkBottle_Step2'); }
export function AnimMilkBottle_Step2(spriteId: number, arg1 = 0, arg2 = 0, r = req()): void { s(r, spriteId).angle += 8 + arg1 + arg2; stepSprite(r, spriteId, 0, 2, 16); }
export function AnimGrantingStars(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 0, -3, 24); }
export function AnimSparklingStars(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, -1, 20); }
export function AnimBubbleBurst(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimBubbleBurst_Step'); }
export function AnimBubbleBurst_Step(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX += 16; s(r, spriteId).affineScaleY += 16; stepSprite(r, spriteId, 0, 0, 12); }
export function AnimSleepLetterZ(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimSleepLetterZ_Step'); }
export function AnimSleepLetterZ_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 1, -2, 32); }
export function AnimLockOnTarget(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimLockOnTarget_Step1'); }
export function AnimLockOnTarget_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 4, 'AnimLockOnTarget_Step2'); }
export function AnimLockOnTarget_Step2(spriteId: number, r = req()): void { s(r, spriteId).x2 -= 2; stepSprite(r, spriteId, 0, 0, 4, 'AnimLockOnTarget_Step3'); }
export function AnimLockOnTarget_Step3(spriteId: number, r = req()): void { s(r, spriteId).y2 -= 2; stepSprite(r, spriteId, 0, 0, 4, 'AnimLockOnTarget_Step4'); }
export function AnimLockOnTarget_Step4(spriteId: number, r = req()): void { s(r, spriteId).x2 += 2; stepSprite(r, spriteId, 0, 0, 4, 'AnimLockOnTarget_Step5'); }
export function AnimLockOnTarget_Step5(spriteId: number, r = req()): void { s(r, spriteId).y2 += 2; stepSprite(r, spriteId, 0, 0, 4, 'AnimLockOnTarget_Step6'); }
export function AnimLockOnTarget_Step6(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 12); }
export function AnimLockOnMoveTarget(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 2, 0, 24); }
export function AnimBowMon(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimBowMon_Step1'); }
export function AnimBowMon_Step1(spriteId: number, r = req()): void { s(r, spriteId).affineScaleY -= 8; stepSprite(r, spriteId, 0, 1, 8, 'AnimBowMon_Step2'); }
export function AnimBowMon_Step1_Callback(spriteId: number, r = req()): void { AnimBowMon_Step1(spriteId, r); }
export function AnimBowMon_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 8, 'AnimBowMon_Step3'); }
export function AnimBowMon_Step3(spriteId: number, r = req()): void { s(r, spriteId).affineScaleY += 8; stepSprite(r, spriteId, 0, -1, 8, 'AnimBowMon_Step4'); }
export function AnimBowMon_Step3_Callback(spriteId: number, r = req()): void { AnimBowMon_Step3(spriteId, r); }
export function AnimBowMon_Step4(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 4); }
export function AnimTipMon(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimTipMon_Step'); }
export function AnimTipMon_Step(spriteId: number, r = req()): void { s(r, spriteId).angle += 8; stepSprite(r, spriteId, 0, 0, 16); }
export function AnimTask_SkullBashPosition(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_SkullBashPositionSet'); }
export function AnimTask_SkullBashPositionSet(taskId: number, r = req()): void { t(r, taskId).data[1] = -8; stepTask(r, taskId, 8); }
export function AnimTask_SkullBashPositionReset(taskId: number, r = req()): void { t(r, taskId).data[1] = 0; stepTask(r, taskId, 8); }
export function AnimSlashSlice(spriteId: number, r = req()): void { AnimCuttingSlice(spriteId, r); }
export function AnimFalseSwipeSlice(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimFalseSwipeSlice_Step1'); }
export function AnimFalseSwipePositionedSlice(spriteId: number, r = req()): void { AnimFalseSwipeSlice(spriteId, r); s(r, spriteId).x += r.args[0] ?? 0; s(r, spriteId).y += r.args[1] ?? 0; }
export function AnimFalseSwipeSlice_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 4, -4, 6, 'AnimFalseSwipeSlice_Step2'); }
export function AnimFalseSwipeSlice_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 0, 6, 'AnimFalseSwipeSlice_Step3'); }
export function AnimFalseSwipeSlice_Step3(spriteId: number, r = req()): void { stepSprite(r, spriteId, -4, 4, 6); }
export function AnimEndureEnergy(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimEndureEnergy_Step'); }
export function AnimEndureEnergy_Step(spriteId: number, r = req()): void { orbit(s(r, spriteId), 18, 18, 16); stepSprite(r, spriteId, 0, 0, 32); }
export function AnimSharpenSphere(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimSharpenSphere_Step'); }
export function AnimSharpenSphere_Step(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX -= 8; s(r, spriteId).affineScaleY += 8; stepSprite(r, spriteId, 0, 0, 20); }
export function AnimConversion(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); s(r, spriteId).palette = r.args[0] ?? 0; stepSprite(r, spriteId, 0, -2, 20); }
export function AnimTask_ConversionAlphaBlend(taskId: number, r = req()): void { op(r, 'ConversionAlphaBlend'); stepTask(r, taskId, 16); }
export function AnimConversion2(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimConversion2_Step'); }
export function AnimConversion2_Step(spriteId: number, r = req()): void { s(r, spriteId).palette = (s(r, spriteId).palette + 1) & 7; stepSprite(r, spriteId, 0, 0, 24); }
export function AnimTask_Conversion2AlphaBlend(taskId: number, r = req()): void { op(r, 'Conversion2AlphaBlend'); stepTask(r, taskId, 16); }
export function AnimTask_HideBattlersHealthbox(taskId: number, r = req()): void { r.healthboxesHidden = true; destroyTask(r, taskId); }
export function AnimTask_ShowBattlersHealthbox(taskId: number, r = req()): void { r.healthboxesHidden = false; destroyTask(r, taskId); }
export function AnimMoon(spriteId: number, r = req()): void { s(r, spriteId).x = 120; s(r, spriteId).y = 32; setSpriteCallback(r, spriteId, 'AnimMoon_Step'); }
export function AnimMoon_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 1, 40); }
export function AnimMoonlightSparkle(spriteId: number, r = req()): void { s(r, spriteId).x = r.args[0] || 120; s(r, spriteId).y = r.args[1] || 40; setSpriteCallback(r, spriteId, 'AnimMoonlightSparkle_Step'); }
export function AnimMoonlightSparkle_Step(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 0, 1, 24); }
export function AnimTask_MoonlightEndFade(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_MoonlightEndFade_Step'); }
export function AnimTask_MoonlightEndFade_Step(taskId: number, r = req()): void { r.bgOffset -= 1; stepTask(r, taskId, 16); }
export function AnimHornHit(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); setSpriteCallback(r, spriteId, 'AnimHornHit_Step'); }
export function AnimHornHit_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 5, -1, 12); }
export function AnimTask_DoubleTeam(taskId: number, r = req()): void { setTaskFunc(r, taskId, 'AnimTask_DoubleTeam_Step'); }
export function AnimTask_DoubleTeam_Step(taskId: number, r = req()): void { if (t(r, taskId).data[0] % 4 === 0) createSprite(r, 'AnimDoubleTeam', r.battlerX[r.attacker], r.battlerY[r.attacker]); stepTask(r, taskId, 24); }
export function AnimDoubleTeam(spriteId: number, r = req()): void { s(r, spriteId).invisible = (s(r, spriteId).data[0] & 1) === 0; stepSprite(r, spriteId, 2, 0, 16); }
export function AnimSuperFang(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.target, r); stepSprite(r, spriteId, 0, 4, 16); }
export function AnimTask_MusicNotesRainbowBlend(taskId: number, r = req()): void { r.musicBlendActive = true; destroyTask(r, taskId); }
export function AnimTask_MusicNotesClearRainbowBlend(taskId: number, r = req()): void { r.musicBlendActive = false; destroyTask(r, taskId); }
export function AnimWavyMusicNotes(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); setSpriteCallback(r, spriteId, 'AnimWavyMusicNotes_Step'); }
export function AnimWavyMusicNotes_CalcVelocity(x: number, y: number, outX: { value: number }, outY: { value: number }, speed: number): void { const div = Math.max(1, Math.abs(speed)); outX.value = Math.trunc(x / div); outY.value = Math.trunc(y / div); }
export function AnimWavyMusicNotes_Step(spriteId: number, r = req()): void { const sp = s(r, spriteId); sp.x2 += 2; wave(sp, 10, 2); stepSprite(r, spriteId, 0, 0, 40); }
export function AnimFlyingMusicNotes(spriteId: number, r = req()): void { setSpriteCallback(r, spriteId, 'AnimFlyingMusicNotes_Step'); }
export function AnimFlyingMusicNotes_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, -3, 28); }
export function AnimBellyDrumHand(spriteId: number, r = req()): void { setMonPos(s(r, spriteId), r.attacker, r); stepSprite(r, spriteId, 0, 4, 8); }
export function AnimSlowFlyingMusicNotes(spriteId: number, r = req()): void { setSpriteCallback(r, spriteId, 'AnimSlowFlyingMusicNotes_Step'); }
export function AnimSlowFlyingMusicNotes_Step(spriteId: number, r = req()): void { stepSprite(r, spriteId, 1, -1, 48); }
export function SetSpriteNextToMonHead(spriteId: number, battler: number, r = req()): void { setMonPos(s(r, spriteId), battler, r); s(r, spriteId).y -= 24; }
export function AnimThoughtBubble(spriteId: number, r = req()): void { SetSpriteNextToMonHead(spriteId, r.attacker, r); setSpriteCallback(r, spriteId, 'AnimThoughtBubble_Step'); }
export function AnimThoughtBubble_Step(spriteId: number, r = req()): void { s(r, spriteId).affineScaleX += 8; s(r, spriteId).affineScaleY += 8; stepSprite(r, spriteId, 0, -1, 24); }
export function AnimMetronomeFinger(spriteId: number, r = req()): void { SetSpriteNextToMonHead(spriteId, r.attacker, r); setSpriteCallback(r, spriteId, 'AnimMetronomeFinger_Step'); }
export function AnimMetronomeFinger_Step(spriteId: number, r = req()): void { s(r, spriteId).angle += s(r, spriteId).data[0] & 1 ? 8 : -8; stepSprite(r, spriteId, 0, 0, 32); }
export function AnimFollowMeFinger(spriteId: number, r = req()): void { SetSpriteNextToMonHead(spriteId, r.attacker, r); setSpriteCallback(r, spriteId, 'AnimFollowMeFinger_Step1'); }
export function AnimFollowMeFinger_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, -2, 8, 'AnimFollowMeFinger_Step2'); }
export function AnimFollowMeFinger_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, 0, 2, 16); }
export function AnimTauntFinger(spriteId: number, r = req()): void { SetSpriteNextToMonHead(spriteId, r.attacker, r); setSpriteCallback(r, spriteId, 'AnimTauntFinger_Step1'); }
export function AnimTauntFinger_Step1(spriteId: number, r = req()): void { stepSprite(r, spriteId, 3, 0, 8, 'AnimTauntFinger_Step2'); }
export function AnimTauntFinger_Step2(spriteId: number, r = req()): void { stepSprite(r, spriteId, -3, 0, 16); }

export const spriteCallbacks1 = {
  AnimMovePowderParticle_Step, AnimSolarBeamSmallOrb_Step, AnimAbsorptionOrb_Step, AnimHyperBeamOrb_Step, AnimLeechSeed_Step, AnimSporeParticle_Step, AnimPetalDanceBigFlower_Step, AnimPetalDanceSmallFlower_Step, AnimRazorLeafParticle_Step1, AnimRazorLeafParticle_Step2, AnimTranslateLinearSingleSineWave_Step, AnimMoveTwisterParticle_Step, AnimConstrictBinding_Step1, AnimConstrictBinding_Step2, AnimRootFlickerOut, AnimItemSteal_Step2, AnimItemSteal_Step3, AnimKnockOffItem, AnimTrickBag_Step1, AnimTrickBag_Step2, AnimTrickBag_Step3, AnimTask_LeafBlade_Step2_Callback, AnimFlyingParticle_Step, AnimNeedleArmSpike_Step, AnimWhipHit_WaitEnd, AnimSlice_Step, AnimCirclingMusicNote_Step, AnimProtect_Step, AnimMilkBottle_Step1, AnimMilkBottle_Step2, AnimBubbleBurst_Step, AnimSleepLetterZ_Step, AnimLockOnTarget_Step1, AnimLockOnTarget_Step2, AnimLockOnTarget_Step3, AnimLockOnTarget_Step4, AnimLockOnTarget_Step5, AnimLockOnTarget_Step6, AnimBowMon_Step1, AnimBowMon_Step1_Callback, AnimBowMon_Step2, AnimBowMon_Step3, AnimBowMon_Step3_Callback, AnimBowMon_Step4, AnimTipMon_Step, AnimFalseSwipeSlice_Step1, AnimFalseSwipeSlice_Step2, AnimFalseSwipeSlice_Step3, AnimEndureEnergy_Step, AnimSharpenSphere_Step, AnimConversion2_Step, AnimMoon_Step, AnimMoonlightSparkle_Step, AnimHornHit_Step, AnimDoubleTeam, AnimWavyMusicNotes_Step, AnimFlyingMusicNotes_Step, AnimSlowFlyingMusicNotes_Step, AnimThoughtBubble_Step, AnimMetronomeFinger_Step, AnimFollowMeFinger_Step1, AnimFollowMeFinger_Step2, AnimTauntFinger_Step1, AnimTauntFinger_Step2
};
export const taskCallbacks1 = {
  AnimTask_DuplicateAndShrinkToPos_Step1, AnimTask_DuplicateAndShrinkToPos_Step2, AnimTask_LeafBlade_Step, AnimTask_LeafBlade_Step2, AnimTask_SkullBashPositionSet, AnimTask_SkullBashPositionReset, AnimTask_MoonlightEndFade_Step, AnimTask_DoubleTeam_Step
};
