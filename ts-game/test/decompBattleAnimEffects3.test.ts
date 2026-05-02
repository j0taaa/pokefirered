import { describe, expect, test } from 'vitest';
import {
  AnimBlackSmoke,
  AnimBlackSmoke_Step,
  AnimMeanLookEye,
  AnimMeanLookEye_Step1,
  AnimMeanLookEye_Step2,
  AnimMeanLookEye_Step3,
  AnimMeanLookEye_Step4,
  AnimTask_CreateSpotlight,
  AnimTask_FadeScreenToWhite,
  AnimTask_GetReturnPowerLevel,
  AnimTask_GetWeather,
  AnimTask_IsHealingMove,
  AnimTask_IsMonInvisible,
  AnimTask_IsTargetPlayerSide,
  AnimTask_MonToSubstitute,
  AnimTask_MonToSubstituteDoll,
  AnimTask_RemoveSpotlight,
  AnimTask_RolePlaySilhouette,
  AnimTask_RolePlaySilhouette_Step1,
  AnimTask_RolePlaySilhouette_Step2,
  AnimTask_SetPsychicBackground,
  AnimTask_SquishAndSweatDroplets,
  AnimTask_SquishAndSweatDroplets_Step,
  AnimTask_TormentAttacker,
  AnimWhiteHalo,
  AnimWhiteHalo_Step1,
  AnimWhiteHalo_Step2,
  CreateSweatDroplets,
  FadeScreenToWhite_Step,
  GetGlareEyeDotCoords,
  SetPsychicBackground_Step,
  TormentAttacker_Callback,
  TormentAttacker_Step,
  createAnimSprite3,
  createAnimTask3,
  createBattleAnimEffects3Runtime
} from '../src/game/decompBattleAnimEffects3';

describe('decompBattleAnimEffects3', () => {
  test('black smoke, white halo, and mean look eye advance through their staged sprite callbacks', () => {
    const runtime = createBattleAnimEffects3Runtime({ args: [2, -3, 4] });
    const smoke = createAnimSprite3(runtime);

    AnimBlackSmoke(smoke, runtime);
    expect(runtime.sprites[smoke]).toMatchObject({ x: 202, y: 53, callback: 'AnimBlackSmoke_Step' });
    AnimBlackSmoke_Step(smoke, runtime);
    expect(runtime.sprites[smoke].x2).toBe(4);
    expect(runtime.sprites[smoke].y2).toBe(-1);

    const halo = createAnimSprite3(runtime);
    AnimWhiteHalo(halo, runtime);
    expect(runtime.sprites[halo].callback).toBe('AnimWhiteHalo_Step1');
    for (let i = 0; i < 8; i++) AnimWhiteHalo_Step1(halo, runtime);
    expect(runtime.sprites[halo].callback).toBe('AnimWhiteHalo_Step2');
    expect(runtime.sprites[halo].affineScaleX).toBe(320);
    for (let i = 0; i < 16; i++) AnimWhiteHalo_Step2(halo, runtime);
    expect(runtime.sprites[halo].destroyed).toBe(true);

    const eye = createAnimSprite3(runtime);
    AnimMeanLookEye(eye, runtime);
    for (let i = 0; i < 12; i++) AnimMeanLookEye_Step1(eye, runtime);
    expect(runtime.sprites[eye].callback).toBe('AnimMeanLookEye_Step2');
    for (let i = 0; i < 8; i++) AnimMeanLookEye_Step2(eye, runtime);
    expect(runtime.sprites[eye].callback).toBe('AnimMeanLookEye_Step3');
    for (let i = 0; i < 24; i++) AnimMeanLookEye_Step3(eye, runtime);
    expect(runtime.sprites[eye].callback).toBe('AnimMeanLookEye_Step4');
    for (let i = 0; i < 10; i++) AnimMeanLookEye_Step4(eye, runtime);
    expect(runtime.sprites[eye].destroyed).toBe(true);
  });

  test('background fade tasks and result writer tasks keep C-style task data outputs', () => {
    const runtime = createBattleAnimEffects3Runtime({
      battlerSide: [0, 1, 0, 1],
      healingMove: true,
      weather: 7,
      returnPowerLevel: 3,
      battlerInvisible: [false, true, false, false],
      args: [1]
    });

    const psychic = createAnimTask3(runtime);
    AnimTask_SetPsychicBackground(psychic, runtime);
    expect(runtime.tasks[psychic].func).toBe('SetPsychicBackground_Step');
    for (let i = 0; i < 16; i++) SetPsychicBackground_Step(psychic, runtime);
    expect(runtime.bgOffset).toBe(32);
    expect(runtime.tasks[psychic].destroyed).toBe(true);

    const fade = createAnimTask3(runtime);
    AnimTask_FadeScreenToWhite(fade, runtime);
    for (let i = 0; i < 16; i++) FadeScreenToWhite_Step(fade, runtime);
    expect(runtime.blend.coeff).toBe(16);
    expect(runtime.tasks[fade].destroyed).toBe(true);

    const side = createAnimTask3(runtime);
    AnimTask_IsTargetPlayerSide(side, runtime);
    expect(runtime.tasks[side].data[0]).toBe(0);

    const heal = createAnimTask3(runtime);
    AnimTask_IsHealingMove(heal, runtime);
    expect(runtime.tasks[heal].data[0]).toBe(1);

    const invisible = createAnimTask3(runtime);
    AnimTask_IsMonInvisible(invisible, runtime);
    expect(runtime.tasks[invisible].data[0]).toBe(1);

    const weather = createAnimTask3(runtime);
    AnimTask_GetWeather(weather, runtime);
    expect(runtime.tasks[weather].data[0]).toBe(7);

    const power = createAnimTask3(runtime);
    AnimTask_GetReturnPowerLevel(power, runtime);
    expect(runtime.tasks[power].data[0]).toBe(3);
  });

  test('spotlight, torment, substitute, and sweat-droplet task handoffs preserve intermediate ids', () => {
    const runtime = createBattleAnimEffects3Runtime();

    const spotlight = createAnimTask3(runtime);
    AnimTask_CreateSpotlight(spotlight, runtime);
    expect(runtime.spotlightSpriteId).not.toBeNull();
    expect(runtime.tasks[spotlight].destroyed).toBe(true);
    const spotlightSpriteId = runtime.spotlightSpriteId!;
    AnimTask_RemoveSpotlight(createAnimTask3(runtime), runtime);
    expect(runtime.sprites[spotlightSpriteId].destroyed).toBe(true);

    const torment = createAnimTask3(runtime);
    AnimTask_TormentAttacker(torment, runtime);
    expect(runtime.tasks[torment].func).toBe('TormentAttacker_Step');
    const clone = runtime.tasks[torment].data[1];
    TormentAttacker_Callback(clone, runtime);
    expect(runtime.sprites[clone].callback).toBe('TormentAttacker_Callback');
    for (let i = 0; i < 28; i++) TormentAttacker_Step(torment, runtime);
    expect(runtime.tasks[torment].destroyed).toBe(true);

    const sub = createAnimTask3(runtime);
    AnimTask_MonToSubstitute(sub, runtime);
    expect(runtime.monSubstituteState).toBe(1);
    AnimTask_MonToSubstituteDoll(sub, runtime);
    expect(runtime.monSubstituteState).toBe(2);

    const rolePlay = createAnimTask3(runtime);
    AnimTask_RolePlaySilhouette(rolePlay, runtime);
    expect(runtime.tasks[rolePlay].func).toBe('AnimTask_RolePlaySilhouette_Step1');
    for (let i = 0; i < 12; i++) AnimTask_RolePlaySilhouette_Step1(rolePlay, runtime);
    expect(runtime.battlerInvisible[runtime.attacker]).toBe(true);
    expect(runtime.tasks[rolePlay].func).toBe('AnimTask_RolePlaySilhouette_Step2');
    for (let i = 0; i < 12; i++) AnimTask_RolePlaySilhouette_Step2(rolePlay, runtime);
    expect(runtime.battlerInvisible[runtime.attacker]).toBe(false);

    const sweat = createAnimTask3(runtime);
    AnimTask_SquishAndSweatDroplets(sweat, runtime);
    expect(runtime.tasks[sweat].func).toBe('AnimTask_SquishAndSweatDroplets_Step');
    for (let i = 0; i < 5; i++) AnimTask_SquishAndSweatDroplets_Step(sweat, runtime);
    expect(runtime.tasks[sweat].data[2]).toBeGreaterThanOrEqual(0);

    const manual = createAnimTask3(runtime);
    CreateSweatDroplets(manual, false, runtime);
    expect(runtime.tasks[manual].data[2]).toBeGreaterThan(runtime.tasks[sweat].data[2]);
  });

  test('glare coordinate helper linearly interpolates integer output pointers', () => {
    const outX = { value: 0 };
    const outY = { value: 0 };

    GetGlareEyeDotCoords(10, 20, 50, 100, 2, 4, outX, outY);
    expect(outX.value).toBe(30);
    expect(outY.value).toBe(60);
  });
});
