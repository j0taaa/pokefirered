export interface AnimSprite2 { x: number; y: number; x2: number; y2: number; data: number[]; callback: keyof typeof spriteCallbacks2 | null; invisible: boolean; destroyed: boolean; affineScale: number; palette: number; }
export interface AnimTask2 { data: number[]; func: keyof typeof taskCallbacks2 | null; destroyed: boolean; }
export interface BattleAnimEffects2Runtime { sprites: AnimSprite2[]; tasks: AnimTask2[]; operations: string[]; battlerX: number[]; battlerY: number[]; attacker: number; target: number; args: number[]; bgOffset: number; furyCutterHitCount: number; furyCutterHitRight: boolean; }
let activeRuntime: BattleAnimEffects2Runtime | null = null;
const req = (runtime?: BattleAnimEffects2Runtime): BattleAnimEffects2Runtime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('battle anim effects 2 runtime is not active'); return r; };
const op = (r: BattleAnimEffects2Runtime, s: string): void => { r.operations.push(s); };
const makeSprite = (): AnimSprite2 => ({ x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), callback: null, invisible: false, destroyed: false, affineScale: 256, palette: 0 });
const makeTask = (): AnimTask2 => ({ data: Array.from({ length: 16 }, () => 0), func: null, destroyed: false });
const s = (r: BattleAnimEffects2Runtime, id: number): AnimSprite2 => r.sprites[id] ?? (r.sprites[id] = makeSprite());
const t = (r: BattleAnimEffects2Runtime, id: number): AnimTask2 => r.tasks[id] ?? (r.tasks[id] = makeTask());
const destroySprite = (r: BattleAnimEffects2Runtime, id: number): void => { s(r, id).destroyed = true; s(r, id).callback = null; op(r, `DestroySprite:${id}`); };
const destroyTask = (r: BattleAnimEffects2Runtime, id: number): void => { t(r, id).destroyed = true; t(r, id).func = null; op(r, `DestroyTask:${id}`); };
const createSprite = (r: BattleAnimEffects2Runtime, cb: keyof typeof spriteCallbacks2): number => { const id = r.sprites.length; r.sprites.push(makeSprite()); r.sprites[id].callback = cb; op(r, `CreateSprite:${cb}:${id}`); return id; };
const stepSprite = (r: BattleAnimEffects2Runtime, id: number, dx: number, dy: number, frames: number, next?: keyof typeof spriteCallbacks2): void => { const sp = s(r, id); sp.x2 += dx; sp.y2 += dy; sp.data[0]++; if (sp.data[0] >= frames) next ? (sp.callback = next, sp.data[0] = 0) : destroySprite(r, id); };
const stepTask = (r: BattleAnimEffects2Runtime, id: number, frames: number, next?: keyof typeof taskCallbacks2): void => { const tk = t(r, id); tk.data[0]++; if (tk.data[0] >= frames) next ? (tk.func = next, tk.data[0] = 0) : destroyTask(r, id); };
const wave = (sp: AnimSprite2, amp: number, speed: number): void => { sp.data[0]++; sp.y2 = Math.trunc(Math.sin(sp.data[0] / speed) * amp); };
export function createBattleAnimEffects2Runtime(): BattleAnimEffects2Runtime { const r = { sprites: [], tasks: [], operations: [], battlerX: [40, 200, 70, 170], battlerY: [96, 48, 96, 48], attacker: 0, target: 1, args: Array.from({ length: 16 }, () => 0), bgOffset: 0, furyCutterHitCount: 0, furyCutterHitRight: false }; activeRuntime = r; return r; }
export function createAnimSprite2(runtime = req()): number { const id = runtime.sprites.length; runtime.sprites.push(makeSprite()); return id; }
export function createAnimTask2(runtime = req()): number { const id = runtime.tasks.length; runtime.tasks.push(makeTask()); return id; }
export function AnimCirclingFinger(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x = r.battlerX[r.target]; sp.y = r.battlerY[r.target]; sp.callback = 'AnimOrbitFast_Step'; sp.data[1] = 16; }
export function AnimBouncingMusicNote(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimBouncingMusicNote_Step'; }
export function AnimBouncingMusicNote_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 += 2; wave(sp, 8, 2); if (sp.data[0] > 32) destroySprite(r, spriteId); }
export function AnimVibrateBattlerBack_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 = sp.data[0] % 2 ? -2 : 2; if (++sp.data[0] > 12) destroySprite(r, spriteId); }
export function AnimVibrateBattlerBack(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimVibrateBattlerBack_Step'; }
export function AnimMovingClamp(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimMovingClamp_Step'; }
export function AnimMovingClamp_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 3, 0, 10, 'AnimMovingClamp_End'); }
export function AnimMovingClamp_End(spriteId: number, r=req()): void { stepSprite(r, spriteId, -2, 0, 8); }
export function AnimTask_Withdraw(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_Withdraw_Step'; }
export function AnimTask_Withdraw_Step(taskId: number, r=req()): void { t(r, taskId).data[1] -= 2; stepTask(r, taskId, 16); }
export function AnimKinesisZapEnergy(spriteId: number, r=req()): void { stepSprite(r, spriteId, 4, -2, 20); }
export function AnimSwordsDanceBlade(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimSwordsDanceBlade_Step'; }
export function AnimSwordsDanceBlade_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 += Math.trunc(Math.sin(sp.data[0] / 3) * 4); sp.y2 -= 2; if (++sp.data[0] > 24) destroySprite(r, spriteId); }
export function AnimSonicBoomProjectile(spriteId: number, r=req()): void { stepSprite(r, spriteId, 6, 0, 30); }
export function AnimAirWaveProjectile_Step2(spriteId: number, r=req()): void { stepSprite(r, spriteId, 6, 0, 16); }
export function AnimAirWaveProjectile_Step1(spriteId: number, r=req()): void { stepSprite(r, spriteId, 4, 0, 8, 'AnimAirWaveProjectile_Step2'); }
export function AnimAirWaveProjectile(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimAirWaveProjectile_Step1'; }
export function AirCutterProjectile_Step2(taskId: number, r=req()): void { r.bgOffset += 4; stepTask(r, taskId, 12); }
export function AirCutterProjectile_Step1(taskId: number, r=req()): void { r.bgOffset += 2; stepTask(r, taskId, 8, 'AirCutterProjectile_Step2'); }
export function AnimTask_AirCutterProjectile(taskId: number, r=req()): void { t(r, taskId).func = 'AirCutterProjectile_Step1'; }
export function AnimVoidLines(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimVoidLines_Step'; }
export function AnimVoidLines_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, -3, 20); }
export function AnimCoinThrow(spriteId: number, r=req()): void { stepSprite(r, spriteId, 5, -4, 18); }
export function AnimFallingCoin(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimFallingCoin_Step'; }
export function AnimFallingCoin_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.y2 += ++sp.data[1]; if (++sp.data[0] > 20) destroySprite(r, spriteId); }
export function AnimBulletSeed(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimBulletSeed_Step1'; }
export function AnimBulletSeed_Step1(spriteId: number, r=req()): void { stepSprite(r, spriteId, 5, -1, 8, 'AnimBulletSeed_Step2'); }
export function AnimBulletSeed_Step2(spriteId: number, r=req()): void { stepSprite(r, spriteId, 5, 2, 20); }
export function AnimRazorWindTornado(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 += Math.trunc(Math.sin(++sp.data[0]) * 6); sp.y2 -= 2; if (sp.data[0] > 28) destroySprite(r, spriteId); }
export function AnimViceGripPincer(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimViceGripPincer_Step'; }
export function AnimViceGripPincer_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, s(r, spriteId).data[1] || 2, 0, 12); }
export function AnimGuillotinePincer(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimGuillotinePincer_Step1'; }
export function AnimGuillotinePincer_Step1(spriteId: number, r=req()): void { stepSprite(r, spriteId, 4, 0, 8, 'AnimGuillotinePincer_Step2'); }
export function AnimGuillotinePincer_Step2(spriteId: number, r=req()): void { stepSprite(r, spriteId, -2, 0, 6, 'AnimGuillotinePincer_Step3'); }
export function AnimGuillotinePincer_Step3(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, 2, 10); }
export function AnimTask_GrowAndGrayscale(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_GrowAndGrayscale_Step'; }
export function AnimTask_GrowAndGrayscale_Step(taskId: number, r=req()): void { t(r, taskId).data[1] += 16; op(r, `BlendGrayscale:${t(r, taskId).data[1]}`); stepTask(r, taskId, 16); }
export function AnimTask_Minimize(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_Minimize_Step1'; }
export function AnimTask_Minimize_Step1(taskId: number, r=req()): void { t(r, taskId).data[1] -= 16; stepTask(r, taskId, 12); }
export function CreateMinimizeSprite(taskObj: AnimTask2, taskId: number, r=req()): number { const id = createSprite(r, 'ClonedMinizeSprite_Step'); taskObj.data[2] = id; t(r, taskId).data[2] = id; return id; }
export function ClonedMinizeSprite_Step(spriteId: number, r=req()): void { s(r, spriteId).affineScale -= 16; if (++s(r, spriteId).data[0] > 12) destroySprite(r, spriteId); }
export function AnimTask_Splash(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_Splash_Step'; }
export function AnimTask_Splash_Step(taskId: number, r=req()): void { t(r, taskId).data[1] = Math.trunc(Math.sin(t(r, taskId).data[0] / 2) * 10); stepTask(r, taskId, 20); }
export function AnimTask_GrowAndShrink(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_GrowAndShrink_Step'; }
export function AnimTask_GrowAndShrink_Step(taskId: number, r=req()): void { t(r, taskId).data[1] += t(r, taskId).data[0] < 8 ? 16 : -16; stepTask(r, taskId, 16); }
export function AnimBreathPuff(spriteId: number, r=req()): void { stepSprite(r, spriteId, 2, -1, 24); }
export function AnimAngerMark(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.invisible = sp.data[0] % 2 === 0; if (++sp.data[0] > 20) destroySprite(r, spriteId); }
export function AnimTask_ThrashMoveMonHorizontal(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_ThrashMoveMonHorizontal_Step'; }
export function AnimTask_ThrashMoveMonHorizontal_Step(taskId: number, r=req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] % 2 ? -8 : 8; stepTask(r, taskId, 12); }
export function AnimTask_ThrashMoveMonVertical(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_ThrashMoveMonVertical_Step'; }
export function AnimTask_ThrashMoveMonVertical_Step(taskId: number, r=req()): void { t(r, taskId).data[1] = t(r, taskId).data[0] % 2 ? -8 : 8; stepTask(r, taskId, 12); }
export function AnimTask_SketchDrawMon(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_SketchDrawMon_Step'; }
export function AnimTask_SketchDrawMon_Step(taskId: number, r=req()): void { op(r, `SketchLine:${t(r, taskId).data[0]}`); stepTask(r, taskId, 16); }
export function AnimPencil(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimPencil_Step'; }
export function AnimPencil_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 2, 1, 18); }
export function AnimBlendThinRing(spriteId: number, r=req()): void { s(r, spriteId).affineScale += 16; if (++s(r, spriteId).data[0] > 18) destroySprite(r, spriteId); }
export function AnimHyperVoiceRing_WaitEnd(spriteId: number, r=req()): void { if (++s(r, spriteId).data[0] > 24) destroySprite(r, spriteId); }
export function AnimHyperVoiceRing(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimHyperVoiceRing_WaitEnd'; }
export function AnimUproarRing(spriteId: number, r=req()): void { AnimHyperVoiceRing(spriteId, r); s(r, spriteId).palette = 1; }
export function AnimSoftBoiledEgg(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimSoftBoiledEgg_Step1'; }
export function AnimSoftBoiledEgg_Step1(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, -3, 8, 'AnimSoftBoiledEgg_Step2'); }
export function AnimSoftBoiledEgg_Step2(spriteId: number, r=req()): void { stepSprite(r, spriteId, 2, 4, 8, 'AnimSoftBoiledEgg_Step3'); }
export function AnimSoftBoiledEgg_Step3(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, 0, 4, 'AnimSoftBoiledEgg_Step4'); }
export function AnimSoftBoiledEgg_Step3_Callback1(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimSoftBoiledEgg_Step3_Callback2'; }
export function AnimSoftBoiledEgg_Step3_Callback2(spriteId: number, r=req()): void { AnimSoftBoiledEgg_Step3(spriteId, r); }
export function AnimSoftBoiledEgg_Step4(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, 3, 10); }
export function AnimSoftBoiledEgg_Step4_Callback(spriteId: number, r=req()): void { AnimSoftBoiledEgg_Step4(spriteId, r); }
export function AnimTask_AttackerStretchAndDisappear(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_AttackerStretchAndDisappear_Step'; }
export function AnimTask_AttackerStretchAndDisappear_Step(taskId: number, r=req()): void { t(r, taskId).data[1] += 32; stepTask(r, taskId, 10); }
export function AnimTask_ExtremeSpeedImpact(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_ExtremeSpeedImpact_Step'; }
export function AnimTask_ExtremeSpeedImpact_Step(taskId: number, r=req()): void { op(r, `ExtremeSpeedImpact:${t(r, taskId).data[0]}`); stepTask(r, taskId, 8); }
export function AnimTask_ExtremeSpeedMonReappear(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_ExtremeSpeedMonReappear_Step'; }
export function AnimTask_ExtremeSpeedMonReappear_Step(taskId: number, r=req()): void { t(r, taskId).data[1] -= 16; stepTask(r, taskId, 8); }
export function AnimTask_SpeedDust(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_SpeedDust_Step'; }
export function AnimTask_SpeedDust_Step(taskId: number, r=req()): void { createSprite(r, 'AnimSpeedDust'); stepTask(r, taskId, 6); }
export function AnimSpeedDust(spriteId: number, r=req()): void { stepSprite(r, spriteId, -4, 1, 12); }
export function AnimTask_LoadMusicNotesPals(taskId: number, r=req()): void { op(r, 'LoadMusicNotesPals'); destroyTask(r, taskId); }
export function AnimTask_FreeMusicNotesPals(taskId: number, r=req()): void { op(r, 'FreeMusicNotesPals'); destroyTask(r, taskId); }
export function SetMusicNotePalette(spriteId: number, a: number, b: number, r=req()): void { s(r, spriteId).palette = (a << 4) | b; }
export function AnimHealBellMusicNote(spriteId: number, r=req()): void { AnimBouncingMusicNote(spriteId, r); SetMusicNotePalette(spriteId, 1, 2, r); }
export function AnimMagentaHeart(spriteId: number, r=req()): void { s(r, spriteId).palette = 5; stepSprite(r, spriteId, 0, -2, 24); }
export function AnimTask_FakeOut(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_FakeOut_Step1'; }
export function AnimTask_FakeOut_Step1(taskId: number, r=req()): void { op(r, 'FakeOutStep1'); stepTask(r, taskId, 4, 'AnimTask_FakeOut_Step2'); }
export function AnimTask_FakeOut_Step2(taskId: number, r=req()): void { op(r, 'FakeOutStep2'); stepTask(r, taskId, 8); }
export function AnimTask_StretchTargetUp(taskId: number, r=req()): void { t(r, taskId).data[1] += 16; stepTask(r, taskId, 12); }
export function AnimTask_StretchAttackerUp(taskId: number, r=req()): void { AnimTask_StretchTargetUp(taskId, r); }
export function AnimRedHeartProjectile(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimRedHeartProjectile_Step'; }
export function AnimRedHeartProjectile_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 3, -1, 24); }
export function AnimParticleBurst(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 += sp.data[1] || 2; sp.y2 += sp.data[2] || -2; if (++sp.data[0] > 16) destroySprite(r, spriteId); }
export function AnimRedHeartRising(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimRedHeartRising_Step'; }
export function AnimRedHeartRising_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, -2, 20); }
export function AnimTask_HeartsBackground(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_HeartsBackground_Step'; }
export function AnimTask_HeartsBackground_Step(taskId: number, r=req()): void { r.bgOffset += 1; stepTask(r, taskId, 32); }
export function AnimTask_ScaryFace(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_ScaryFace_Step'; }
export function AnimTask_ScaryFace_Step(taskId: number, r=req()): void { op(r, `ScaryFace:${t(r, taskId).data[0]}`); stepTask(r, taskId, 20); }
export function AnimOrbitFast(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimOrbitFast_Step'; }
export function AnimOrbitFast_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.data[0] += 8; sp.x2 = Math.trunc(Math.cos(sp.data[0] / 16) * (sp.data[1] || 16)); sp.y2 = Math.trunc(Math.sin(sp.data[0] / 16) * (sp.data[1] || 16)); if (sp.data[0] > 128) destroySprite(r, spriteId); }
export function AnimOrbitScatter(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimOrbitScatter_Step'; }
export function AnimOrbitScatter_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, s(r, spriteId).x2 >= 0 ? 3 : -3, s(r, spriteId).y2 >= 0 ? 3 : -3, 20); }
export function AnimSpitUpOrb_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 4, -2, 20); }
export function AnimSpitUpOrb(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimSpitUpOrb_Step'; }
export function AnimEyeSparkle_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.invisible = sp.data[0] % 2 === 0; if (++sp.data[0] > 16) destroySprite(r, spriteId); }
export function AnimEyeSparkle(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimEyeSparkle_Step'; }
export function AnimAngel(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, -1, 30); }
export function AnimPinkHeart_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 1, -2, 20); }
export function AnimPinkHeart(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimPinkHeart_Step'; }
export function AnimDevil(spriteId: number, r=req()): void { stepSprite(r, spriteId, 0, 1, 30); }
export function AnimFurySwipes(spriteId: number, r=req()): void { stepSprite(r, spriteId, 5, -5, 10); }
export function AnimMovementWaves(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimMovementWaves_Step'; }
export function AnimMovementWaves_Step(spriteId: number, r=req()): void { stepSprite(r, spriteId, 4, 0, 24); }
export function AnimTask_UproarDistortion(taskId: number, r=req()): void { t(r, taskId).func = 'AnimTask_UproarDistortion_Step'; }
export function AnimTask_UproarDistortion_Step(taskId: number, r=req()): void { r.bgOffset = Math.trunc(Math.sin(t(r, taskId).data[0] / 2) * 8); stepTask(r, taskId, 32); }
export function AnimJaggedMusicNote(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimJaggedMusicNote_Step'; }
export function AnimJaggedMusicNote_Step(spriteId: number, r=req()): void { const sp = s(r, spriteId); sp.x2 += 3; sp.y2 += sp.data[0] % 2 ? -3 : 3; if (++sp.data[0] > 24) destroySprite(r, spriteId); }
export function AnimPerishSongMusicNote2(spriteId: number, r=req()): void { AnimPerishSongMusicNote(spriteId, r); s(r, spriteId).palette = 2; }
export function AnimPerishSongMusicNote(spriteId: number, r=req()): void { s(r, spriteId).callback = 'AnimPerishSongMusicNote_Step1'; }
export function AnimPerishSongMusicNote_Step1(spriteId: number, r=req()): void { stepSprite(r, spriteId, 1, -2, 12, 'AnimPerishSongMusicNote_Step2'); }
export function AnimPerishSongMusicNote_Step2(spriteId: number, r=req()): void { stepSprite(r, spriteId, 2, 2, 18); }
export function AnimGuardRing(spriteId: number, r=req()): void { s(r, spriteId).affineScale += 8; if (++s(r, spriteId).data[0] > 24) destroySprite(r, spriteId); }
export function AnimTask_IsFuryCutterHitRight(taskId: number, r=req()): void { t(r, taskId).data[0] = r.furyCutterHitRight ? 1 : 0; destroyTask(r, taskId); }
export function AnimTask_GetFuryCutterHitCount(taskId: number, r=req()): void { t(r, taskId).data[0] = r.furyCutterHitCount; destroyTask(r, taskId); }
export const spriteCallbacks2 = { AnimBouncingMusicNote_Step, AnimVibrateBattlerBack_Step, AnimMovingClamp_Step, AnimMovingClamp_End, AnimSwordsDanceBlade_Step, AnimAirWaveProjectile_Step1, AnimAirWaveProjectile_Step2, AnimVoidLines_Step, AnimFallingCoin_Step, AnimBulletSeed_Step1, AnimBulletSeed_Step2, AnimViceGripPincer_Step, AnimGuillotinePincer_Step1, AnimGuillotinePincer_Step2, AnimGuillotinePincer_Step3, ClonedMinizeSprite_Step, AnimPencil_Step, AnimHyperVoiceRing_WaitEnd, AnimSoftBoiledEgg_Step1, AnimSoftBoiledEgg_Step2, AnimSoftBoiledEgg_Step3, AnimSoftBoiledEgg_Step3_Callback1, AnimSoftBoiledEgg_Step3_Callback2, AnimSoftBoiledEgg_Step4, AnimSoftBoiledEgg_Step4_Callback, AnimSpeedDust, AnimRedHeartProjectile_Step, AnimRedHeartRising_Step, AnimOrbitFast_Step, AnimOrbitScatter_Step, AnimSpitUpOrb_Step, AnimEyeSparkle_Step, AnimPinkHeart_Step, AnimMovementWaves_Step, AnimJaggedMusicNote_Step, AnimPerishSongMusicNote_Step1, AnimPerishSongMusicNote_Step2, AnimGuardRing, AnimRazorWindTornado, AnimBreathPuff, AnimAngerMark, AnimParticleBurst, AnimAngel, AnimDevil, AnimFurySwipes };
export const taskCallbacks2 = { AnimTask_Withdraw_Step, AirCutterProjectile_Step1, AirCutterProjectile_Step2, AnimTask_GrowAndGrayscale_Step, AnimTask_Minimize_Step1, AnimTask_Splash_Step, AnimTask_GrowAndShrink_Step, AnimTask_ThrashMoveMonHorizontal_Step, AnimTask_ThrashMoveMonVertical_Step, AnimTask_SketchDrawMon_Step, AnimTask_AttackerStretchAndDisappear_Step, AnimTask_ExtremeSpeedImpact_Step, AnimTask_ExtremeSpeedMonReappear_Step, AnimTask_SpeedDust_Step, AnimTask_FakeOut_Step1, AnimTask_FakeOut_Step2, AnimTask_HeartsBackground_Step, AnimTask_ScaryFace_Step, AnimTask_UproarDistortion_Step };
