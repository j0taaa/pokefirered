import { describe, expect, test } from 'vitest';
import {
  BALL_DIVE,
  BALL_GREAT,
  BALL_LUXURY,
  BALL_MASTER,
  BALL_POKE,
  BALL_PREMIER,
  BALL_ULTRA,
  B_POSITION_PLAYER_RIGHT,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  ITEM_DIVE_BALL,
  ITEM_GREAT_BALL,
  ITEM_LUXURY_BALL,
  ITEM_MASTER_BALL,
  ITEM_PREMIER_BALL,
  ITEM_ULTRA_BALL,
  POKEBALL_OPPONENT_SENDOUT,
  POKEBALL_PLAYER_SENDOUT,
  SE_BALL,
  SE_BALL_BOUNCE_1,
  SE_BALL_OPEN,
  SE_BALL_THROW,
  SE_BALL_TRADE,
  AnimateBallOpenParticlesForPokeball,
  CreatePokeballSpriteToReleaseMon,
  CreateTradePokeballSprite,
  DoHitAnimHealthboxEffect,
  DoPokeballSendOutAnimation,
  FreeBallGfx,
  GetBattlerPokeballItemId,
  HandleBallAnimEnd,
  ItemIdToBallId,
  LaunchBallFadeMonTaskForPokeball,
  LoadBallGfx,
  SpriteCB_BallThrow,
  SpriteCB_BallThrow_CaptureMon,
  SpriteCB_BallThrow_Close,
  SpriteCB_BallThrow_FallToGround,
  SpriteCB_BallThrow_Shake,
  SpriteCB_BallThrow_ShrinkMon,
  SpriteCB_BallThrow_StartCaptureMon,
  SpriteCB_BallThrow_StartShakes,
  SpriteCB_HealthboxSlideIn,
  SpriteCB_HitAnimHealthoxEffect,
  SpriteCB_OpponentMonSendOut,
  SpriteCB_PokeballReleaseMon,
  SpriteCB_PlayerMonSendOut_1,
  SpriteCB_PlayerMonSendOut_2,
  SpriteCB_ReleaseMon2FromBall,
  SpriteCB_ReleaseMonFromBall,
  SpriteCB_ReleasedMonFlyOut,
  SpriteCB_TradePokeball,
  SpriteCB_TradePokeballEnd,
  SpriteCB_TradePokeballSendOff,
  StartHealthboxSlideIn,
  Task_DoPokeballSendOutAnim,
  Task_PlayCryWhenReleasedFromBall,
  callSpriteCallback,
  createPokeballRuntime,
  gBallSpritePalettes,
  gBallSpriteSheets,
  gBallSpriteTemplates,
  type Sprite
} from '../src/game/decompPokeball';

describe('decomp pokeball', () => {
  test('ports ball ids, gfx tags, templates, and item-to-ball mapping', () => {
    expect(gBallSpriteSheets).toHaveLength(12);
    expect(gBallSpriteSheets[BALL_POKE]).toEqual({ data: 'gBallGfx_Poke', size: 384, tag: 55000 });
    expect(gBallSpritePalettes[BALL_PREMIER]).toEqual({ data: 'gBallPal_Premier', tag: 55011 });
    expect(gBallSpriteTemplates[BALL_ULTRA]).toMatchObject({ tileTag: 55003, paletteTag: 55003, callback: 'SpriteCB_BallThrow' });
    expect([
      ItemIdToBallId(ITEM_MASTER_BALL),
      ItemIdToBallId(ITEM_ULTRA_BALL),
      ItemIdToBallId(ITEM_GREAT_BALL),
      ItemIdToBallId(ITEM_DIVE_BALL),
      ItemIdToBallId(ITEM_LUXURY_BALL),
      ItemIdToBallId(ITEM_PREMIER_BALL),
      ItemIdToBallId(999)
    ]).toEqual([BALL_MASTER, BALL_ULTRA, BALL_GREAT, BALL_DIVE, BALL_LUXURY, BALL_PREMIER, BALL_POKE]);
  });

  test('send-out task waits one frame then creates player, opponent, or unused throw sprites', () => {
    const runtime = createPokeballRuntime();
    runtime.gActiveBattler = 0;
    expect(DoPokeballSendOutAnimation(runtime, -25, POKEBALL_PLAYER_SENDOUT)).toBe(0);
    expect(runtime.gDoingBattleAnim).toBe(true);
    expect(runtime.gBattleSpritesDataPtr.healthBoxesData[0].ballAnimActive).toBe(true);
    Task_DoPokeballSendOutAnim(runtime, 0);
    expect(runtime.gTasks[0].data[0]).toBe(1);
    Task_DoPokeballSendOutAnim(runtime, 0);
    expect(runtime.gTasks[0].destroyed).toBe(true);
    expect(runtime.gSprites.at(-1)).toMatchObject({ x: 48, y: 70, callback: 'SpriteCB_PlayerMonSendOut_1' });

    const opponent = createPokeballRuntime({ gActiveBattler: 1 });
    DoPokeballSendOutAnimation(opponent, 25, POKEBALL_OPPONENT_SENDOUT);
    Task_DoPokeballSendOutAnim(opponent, 0);
    Task_DoPokeballSendOutAnim(opponent, 0);
    expect(opponent.gSprites.at(-1)).toMatchObject({ x: 176, y: 64, callback: 'SpriteCB_OpponentMonSendOut' });

    const unused = createPokeballRuntime({ translationResults: [true] });
    DoPokeballSendOutAnimation(unused, 0, 3);
    Task_DoPokeballSendOutAnim(unused, 0);
    Task_DoPokeballSendOutAnim(unused, 0);
    expect(unused.sounds).toContain(SE_BALL_THROW);
    expect(unused.gTasks[0].func).toBe('TaskDummy');
    const ball = unused.gSprites.at(-1)!;
    SpriteCB_BallThrow(unused, ball);
    expect(ball.callback).toBe('SpriteCB_BallThrow_ReachMon');
  });

  test('throw callback chain shrinks, closes, bounces, shakes, releases, and captures like C data slots', () => {
    const runtime = createPokeballRuntime();
    const sprite: Sprite = runtime.gSprites[8] = { ...runtime.gSprites[0], id: 8, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_BallThrow_StartShrinkMon', x: 50, y: 50 };
    sprite.data[6] = 1;
    for (let i = 0; i < 10; i++) SpriteCB_BallThrow_StartShakes(runtime, sprite);
    sprite.callback = 'SpriteCB_BallThrow_StartShrinkMon';
    for (let i = 0; i < 10; i++) callSpriteCallback(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_ShrinkMon');

    runtime.gSprites[runtime.gBattlerSpriteIds[1]].affineAnimEnded = false;
    for (let i = 0; i < 11; i++) SpriteCB_BallThrow_ShrinkMon(runtime, sprite);
    expect(runtime.sounds).toContain(SE_BALL_TRADE);
    runtime.gSprites[runtime.gBattlerSpriteIds[1]].affineAnimEnded = true;
    SpriteCB_BallThrow_ShrinkMon(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_Close');

    sprite.animEnded = true;
    SpriteCB_BallThrow_Close(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_FallToGround');
    for (let i = 0; i < 80 && (sprite.callback as string) === 'SpriteCB_BallThrow_FallToGround'; i++) SpriteCB_BallThrow_FallToGround(runtime, sprite);
    expect(runtime.sounds).toContain(SE_BALL_BOUNCE_1);

    sprite.callback = 'SpriteCB_BallThrow_StartShakes';
    sprite.data[3] = 0;
    for (let i = 0; i < 31; i++) SpriteCB_BallThrow_StartShakes(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_Shake');
    expect(runtime.sounds).toContain(SE_BALL);
    sprite.data[3] = 0x203;
    sprite.data[7] = 4;
    SpriteCB_BallThrow_Shake(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_StartCaptureMon');
    SpriteCB_BallThrow_StartCaptureMon(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCB_BallThrow_CaptureMon');
  });

  test('release from ball launches fade, schedules cry task, and finalizes animation when both anims end', () => {
    const runtime = createPokeballRuntime({ isDoubleBattle: true });
    runtime.gBattleSpritesDataPtr.animationData.introAnimActive = true;
    const sprite = runtime.gSprites[8] = { ...runtime.gSprites[0], id: 8, x: 60, y: 60, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_ReleaseMonFromBall' };
    sprite.data[6] = 0;
    SpriteCB_ReleaseMonFromBall(runtime, sprite);
    expect(sprite.callback).toBe('HandleBallAnimEnd');
    expect(runtime.gTasks.at(-1)?.func).toBe('Task_PlayCryWhenReleasedFromBall');

    sprite.animEnded = true;
    runtime.gSprites[runtime.gBattlerSpriteIds[0]].affineAnimEnded = true;
    HandleBallAnimEnd(runtime, sprite);
    expect(runtime.gDoingBattleAnim).toBe(false);
    expect(runtime.gBattleSpritesDataPtr.healthBoxesData[0].ballAnimActive).toBe(false);
    expect(runtime.operations.some((op) => op.startsWith('FreeSpriteTilesByTag:'))).toBe(true);
  });

  test('cry task follows single, first-double, and second-double delay states', () => {
    const runtime = createPokeballRuntime();
    const single = runtime.gTasks.push({ id: 0, func: 'Task_PlayCryWhenReleasedFromBall', data: Array.from({ length: 16 }, () => 0), destroyed: false }) - 1;
    runtime.gTasks[single].data[0] = 25;
    runtime.gTasks[single].data[1] = -25;
    runtime.gTasks[single].data[2] = 0;
    runtime.gTasks[single].data[3] = 1;
    for (let i = 0; i < 5; i++) Task_PlayCryWhenReleasedFromBall(runtime, single);
    expect(runtime.operations).toContain('PlayCry:25:-25:CRY_MODE_NORMAL');
    expect(runtime.gTasks[single].destroyed).toBe(true);

    const second = runtime.gTasks.push({ id: 1, func: 'Task_PlayCryWhenReleasedFromBall', data: Array.from({ length: 16 }, () => 0), destroyed: false }) - 1;
    runtime.gTasks[second].data[2] = 2;
    runtime.gTasks[second].data[3] = 0;
    runtime.cryPlayingResults = [false];
    for (let i = 0; i < 20; i++) Task_PlayCryWhenReleasedFromBall(runtime, second);
    expect(runtime.operations).toContain('PlayCry:0:0:CRY_MODE_WEAK');
  });

  test('intro and trade pokeball helpers preserve data-slot layout and callbacks', () => {
    const runtime = createPokeballRuntime();
    runtime.gSprites[0].x = 100;
    runtime.gSprites[0].y = 80;
    CreatePokeballSpriteToReleaseMon(runtime, 0, 3, 20, 30, 2, 5, 1, 0x12345678);
    const introBall = runtime.gSprites.at(-1)!;
    expect(introBall.data.slice(0, 7)).toEqual([0, 1, 3, 0x5678, 0x1234, 100, 80]);
    expect(runtime.gSprites[0]).toMatchObject({ x: 20, y: 30, invisible: true });
    SpriteCB_PokeballReleaseMon(runtime, introBall);
    expect(introBall.data[1]).toBe(0);
    SpriteCB_PokeballReleaseMon(runtime, introBall);
    expect(introBall.callback).toBe('SpriteCB_ReleasedMonFlyOut');
    runtime.gSprites[0].affineAnimEnded = true;
    introBall.animEnded = true;
    introBall.data[7] = 128;
    SpriteCB_ReleasedMonFlyOut(runtime, introBall);
    expect(runtime.gSprites[0]).toMatchObject({ x: 100, y: 80, x2: 0, y2: 0 });

    const tradeId = CreateTradePokeballSprite(runtime, 0, 4, 40, 50, 1, 2, 0, 0xabcd0001);
    const tradeBall = runtime.gSprites[tradeId];
    SpriteCB_TradePokeball(runtime, tradeBall);
    expect(tradeBall.callback).toBe('SpriteCB_TradePokeballSendOff');
    runtime.gSprites[0].affineAnimEnded = false;
    for (let i = 0; i < 11; i++) SpriteCB_TradePokeballSendOff(runtime, tradeBall);
    expect(runtime.sounds).toContain(SE_BALL_TRADE);
    runtime.gSprites[0].affineAnimEnded = true;
    SpriteCB_TradePokeballSendOff(runtime, tradeBall);
    expect(tradeBall.callback).toBe('SpriteCB_TradePokeballEnd');
    tradeBall.animEnded = true;
    SpriteCB_TradePokeballEnd(runtime, tradeBall);
    expect(tradeBall.callback).toBe('SpriteCallbackDummy');
  });

  test('send-out callbacks, healthbox slide, hit effect, and gfx loading match C side effects', () => {
    const runtime = createPokeballRuntime({ translationResults: [true] });
    const ball = runtime.gSprites[8] = { ...runtime.gSprites[0], id: 8, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_PlayerMonSendOut_1' };
    ball.data[6] = 0;
    SpriteCB_PlayerMonSendOut_1(runtime, ball);
    expect(ball.callback).toBe('SpriteCB_PlayerMonSendOut_2');
    SpriteCB_PlayerMonSendOut_2(runtime, ball);
    expect(ball.callback).toBe('SpriteCB_ReleaseMonFromBall');

    const delayBall = runtime.gSprites[9] = { ...ball, id: 9, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_ReleaseMon2FromBall' };
    for (let i = 0; i < 26; i++) SpriteCB_ReleaseMon2FromBall(runtime, delayBall);
    expect(delayBall.callback).toBe('SpriteCB_ReleaseMonFromBall');

    const opponentBall = runtime.gSprites[10] = { ...ball, id: 10, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_OpponentMonSendOut' };
    for (let i = 0; i < 16; i++) SpriteCB_OpponentMonSendOut(runtime, opponentBall);
    expect(opponentBall.callback).toBe('SpriteCB_ReleaseMonFromBall');

    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    StartHealthboxSlideIn(runtime, 1);
    const healthbox = runtime.gSprites[runtime.gHealthboxSpriteIds[1]];
    expect(healthbox).toMatchObject({ x2: -0x73, callback: 'SpriteCB_HealthboxSlideIn' });
    healthbox.x2 = 5;
    healthbox.data[0] = 5;
    SpriteCB_HealthboxSlideIn(runtime, healthbox);
    expect(healthbox.callback).toBe('SpriteCallbackDummy');

    runtime.battlerPositions[2] = B_POSITION_PLAYER_RIGHT;
    runtime.battlerSides[2] = B_SIDE_PLAYER;
    StartHealthboxSlideIn(runtime, 2);
    expect(runtime.gSprites[runtime.gHealthboxSpriteIds[2]].callback).toBe('SpriteCB_HealthboxSlideInDelayed');

    DoHitAnimHealthboxEffect(runtime, 0);
    const hit = runtime.gSprites.at(-1)!;
    for (let i = 0; i < 21; i++) SpriteCB_HitAnimHealthoxEffect(runtime, hit);
    expect(hit.callback).toBe('SpriteCallbackDummy');

    LoadBallGfx(runtime, BALL_POKE);
    expect(runtime.operations).toContain('LZDecompressVram:gOpenPokeballGfx:0');
    LoadBallGfx(runtime, BALL_DIVE);
    expect(runtime.operations).not.toContain('LZDecompressVram:gOpenPokeballGfx:6');
    FreeBallGfx(runtime, BALL_POKE);
    expect(runtime.loadedBallGfx.has(BALL_POKE)).toBe(false);
  });

  test('pokeball-only helper wrappers force BALL_POKE and choose party pokeballs by battler side', () => {
    const runtime = createPokeballRuntime();
    runtime.gPlayerParty[0].pokeball = ITEM_GREAT_BALL;
    runtime.gEnemyParty[0].pokeball = ITEM_ULTRA_BALL;
    runtime.battlerSides[0] = B_SIDE_PLAYER;
    runtime.battlerSides[1] = B_SIDE_OPPONENT;
    runtime.gBattlerPartyIndexes[0] = 0;
    runtime.gBattlerPartyIndexes[1] = 0;

    expect(GetBattlerPokeballItemId(runtime, 0)).toBe(ITEM_GREAT_BALL);
    expect(GetBattlerPokeballItemId(runtime, 1)).toBe(ITEM_ULTRA_BALL);

    const particleTaskId = AnimateBallOpenParticlesForPokeball(runtime, 9, 10, 1, 28);
    expect(runtime.gTasks[particleTaskId].data.slice(1, 5)).toEqual([9, 10, 1, 28]);
    expect(runtime.gTasks[particleTaskId].data[15]).toBe(BALL_POKE);
    expect(runtime.sounds).toContain(SE_BALL_OPEN);
    expect(runtime.operations).toContain('AnimateBallOpenParticles:9:10:1:28:0');

    const fadeTaskId = LaunchBallFadeMonTaskForPokeball(runtime, true, 3, 0x12345678);
    expect(fadeTaskId).toBe(64);
    expect(runtime.operations).toContain('LaunchBallFadeMonTask:1:3:305419896:0:64');
  });

  test('capture animation stops battle anim, plays caught intro, and destroys sprites at final frame', () => {
    const runtime = createPokeballRuntime();
    const sprite = runtime.gSprites[8] = { ...runtime.gSprites[0], id: 8, data: Array.from({ length: 8 }, () => 0), callback: 'SpriteCB_BallThrow_CaptureMon' };
    sprite.data[6] = 0;
    for (let i = 0; i < 95; i++) SpriteCB_BallThrow_CaptureMon(runtime, sprite);
    expect(runtime.gDoingBattleAnim).toBe(false);
    expect(runtime.operations).toContain('m4aMPlayAllStop');
    for (let i = 95; i < 315; i++) SpriteCB_BallThrow_CaptureMon(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
  });
});
