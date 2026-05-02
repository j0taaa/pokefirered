import { describe, expect, test } from 'vitest';
import {
  AllPlayersReadyToStart,
  BERRY_BLUE,
  BERRY_GOLD,
  BERRYSTATE_NONE,
  BERRYSTATE_PICKED,
  CreateBerrySprites,
  CreateCloudSprites,
  CreateDodrioSprite,
  CreateStatusBarSprites,
  DoCountdown,
  DoGameIntro,
  GetActiveBerryColumns,
  GetBerriesPicked,
  GetBerryResult,
  GetHighestBerryResult,
  GetHighestScore,
  GetNewBerryIdByDifficulty,
  GetNumPlayers,
  GetPlayerName,
  GetPlayAgainState,
  GetPrizeItemId,
  GetScore,
  GetScoreRanking,
  HandlePickBerries,
  HandleWaitPlayAgainInput,
  INPUTSTATE_PICKED,
  InitCountdown,
  InitDodrioGame,
  LoadGfx,
  Msg_SomeoneDroppedOut,
  Msg_WantToPlayAgain,
  PICK_MIDDLE,
  PLAY_AGAIN_DROPPED,
  PLAY_AGAIN_NO,
  PrintRankedScores,
  ReadyToEndGame_Leader,
  ResetBerryAndStatusBarSprites,
  ResetPickState,
  SetBerryAnim,
  SetBerryIconsInvisibility,
  SetBerryInvisibility,
  SetBerryYPos,
  SetDodrioAnim,
  SetDodrioInvisibility,
  SetGfxFunc,
  SetGfxFuncById,
  SetMaxBerriesPickedInRow,
  SetRandomPrize,
  ShowDodrioBerryPickingRecords,
  StartCloudMovement,
  StartDodrioBerryPicking,
  Task_ShowDodrioBerryPickingRecords,
  TryGivePrize,
  TryPickBerry,
  TryUpdateRecords,
  UpdateFallingBerries,
  UpdateGame_Leader,
  UpdatePickStateQueue,
  createDodrioBerryPickingRuntime
} from '../src/game/decompDodrioBerryPicking';

describe('decompDodrioBerryPicking', () => {
  test('startup and intro/countdown state match the leader game flow', () => {
    const runtime = createDodrioBerryPickingRuntime({ numPlayers: 2, multiplayerId: 0 });
    runtime.players[1].name = 'BLUE';
    expect(GetPlayerName(1, runtime)).toBe('BLUE');

    StartDodrioBerryPicking('ExitCB', runtime);
    expect(runtime.exitCallback).toBe('ExitCB');
    expect(runtime.taskId).toBe(0);
    expect(runtime.tasks[0].func).toBe('Task_StartDodrioGame');

    InitDodrioGame(runtime);
    expect(runtime.berryState.every(state => state === BERRYSTATE_NONE)).toBe(true);
    expect(runtime.readyToStart[0]).toBe(true);
    expect(AllPlayersReadyToStart(runtime)).toBe(false);

    DoGameIntro(runtime);
    expect(runtime.gfx.func).toBe('InitCountdown');
    InitCountdown(runtime);
    expect(runtime.startCountdown).toBe(true);
    runtime.countdownEndDelay = 1;
    DoCountdown(runtime);
    expect(runtime.gfx.func).toBe('WaitGameStart');
  });

  test('berry picking updates column state, score counters, streaks, and game-over readiness', () => {
    const runtime = createDodrioBerryPickingRuntime({ numPlayers: 1, randomSeed: 3 });
    runtime.fallTimer[0] = 7;
    runtime.prevBerryIds[0] = BERRY_GOLD;

    expect(TryPickBerry(0, 0, runtime)).toBe(true);
    expect(runtime.berryState[0]).toBe(BERRYSTATE_PICKED);
    expect(runtime.berryEatenBy[0]).toBe(0);
    expect(runtime.inputState[0]).toBe(INPUTSTATE_PICKED);
    expect(GetBerryResult(0, BERRY_GOLD, runtime)).toBe(1);
    expect(GetBerriesPicked(0, runtime)).toBe(1);
    expect(GetScore(0, runtime)).toBe(50);
    expect(runtime.berriesPickedInRow).toBe(1);

    runtime.players[0].pickState = PICK_MIDDLE;
    runtime.fallTimer[1] = 7;
    runtime.prevBerryIds[1] = BERRY_BLUE;
    HandlePickBerries(runtime);
    expect(GetBerryResult(0, BERRY_BLUE, runtime)).toBe(1);

    runtime.numGraySquares = 10;
    expect(ReadyToEndGame_Leader(runtime)).toBe(true);
    expect(runtime.allReadyToEnd).toBe(true);

    runtime.fallTimer[2] = 10;
    runtime.berryState[2] = BERRYSTATE_NONE;
    UpdateFallingBerries(runtime);
    expect(runtime.fallTimer[2]).toBe(0);
    expect(runtime.berryEatenBy[2]).toBe(0xff);
    expect(GetActiveBerryColumns(runtime)).toBeGreaterThanOrEqual(0);
  });

  test('score ranking, records, prizes, queues, and play-again prompt follow bounded counters', () => {
    const runtime = createDodrioBerryPickingRuntime({ numPlayers: 3, randomSeed: 9 });
    runtime.berryResults[0][BERRY_GOLD] = 10;
    runtime.berryResults[1][BERRY_BLUE] = 100;
    runtime.berryResults[2][BERRY_GOLD] = 1;

    expect(GetHighestScore(runtime)).toBe(1000);
    expect(GetScoreRanking(1, runtime)).toBe(1);
    expect(TryUpdateRecords(runtime)).toBe(true);
    expect(runtime.records.highestScore).toBe(1000);
    expect(GetHighestBerryResult(runtime)).toBe(100);

    runtime.berryResults[0][BERRY_GOLD] = 100;
    expect(TryGivePrize(runtime)).toBe(true);
    expect(runtime.prizeGiven).toBe(true);
    expect(GetPrizeItemId(runtime)).toBeGreaterThan(0);
    SetRandomPrize(runtime);
    expect(runtime.prizeItemId).toBeGreaterThan(0);

    UpdatePickStateQueue(1, runtime);
    UpdatePickStateQueue(2, runtime);
    expect(runtime.pickStateQueue.slice(-2)).toEqual([1, 2]);

    runtime.gfx.cursorSelection = 1;
    HandleWaitPlayAgainInput(runtime);
    expect(GetPlayAgainState(runtime)).toBe(PLAY_AGAIN_NO);
    Msg_SomeoneDroppedOut(runtime);
    expect(GetPlayAgainState(runtime)).toBe(PLAY_AGAIN_DROPPED);

    SetMaxBerriesPickedInRow(runtime);
    expect(runtime.maxBerriesPickedInRow).toBe(runtime.berriesPickedInRow);
  });

  test('sprite, status, berry, cloud, and gfx helpers mutate the same runtime slots', () => {
    const runtime = createDodrioBerryPickingRuntime();

    const dodrio = CreateDodrioSprite(0, runtime);
    expect(runtime.dodrioSpriteIds[0]).toBe(dodrio);
    SetDodrioAnim(0, PICK_MIDDLE, runtime);
    expect(runtime.sprites[dodrio].anim).toBe(PICK_MIDDLE);
    SetDodrioInvisibility(0, true, runtime);
    expect(runtime.sprites[dodrio].invisible).toBe(true);

    CreateBerrySprites(runtime);
    expect(runtime.berrySpriteIds[0]).toBeGreaterThanOrEqual(0);
    SetBerryYPos(0, 88, runtime);
    SetBerryAnim(0, BERRY_GOLD, runtime);
    SetBerryInvisibility(0, true, runtime);
    expect(runtime.sprites[runtime.berrySpriteIds[0]]).toMatchObject({ y: 88, anim: BERRY_GOLD, invisible: true });
    SetBerryIconsInvisibility(true, runtime);
    expect(runtime.sprites[runtime.berryIconSpriteIds[0]].invisible).toBe(true);

    CreateStatusBarSprites(runtime);
    expect(runtime.statusBar.spriteIds[0]).toBeGreaterThanOrEqual(0);
    CreateCloudSprites(runtime);
    StartCloudMovement(runtime);
    expect(runtime.sprites[runtime.cloudSpriteIds[0]].callback).toBe('SpriteCB_Cloud');
    ResetBerryAndStatusBarSprites(runtime);
    expect(runtime.berrySpriteIds[0]).toBeGreaterThanOrEqual(0);
    expect(runtime.statusBar.spriteIds[0]).toBeGreaterThanOrEqual(0);

    LoadGfx(runtime);
    expect(runtime.gfx.active).toBe(true);
    Msg_WantToPlayAgain(runtime);
    expect(runtime.gfx.messages.at(-1)).toBe('Want to play again?');
    SetGfxFunc('ShowNames', runtime);
    expect(runtime.gfx.func).toBe('ShowNames');
    SetGfxFuncById(2, runtime);
    expect(runtime.gfx.func).toBe('ShowResults');
    PrintRankedScores(runtime);
    ShowDodrioBerryPickingRecords(runtime);
    const recordTask = runtime.tasks.find(task => task.func === 'Task_ShowDodrioBerryPickingRecords')?.id ?? 0;
    Task_ShowDodrioBerryPickingRecords(recordTask, runtime);
    expect(runtime.gfx.messages.some(message => message.startsWith('HIGH SCORE'))).toBe(true);
  });

  test('difficulty, random berries, player counts, and reset helpers preserve limits', () => {
    const runtime = createDodrioBerryPickingRuntime({ numPlayers: 6, randomSeed: 1 });

    expect(GetNumPlayers(runtime)).toBe(6);
    expect(GetNewBerryIdByDifficulty(6, runtime)).toBeGreaterThanOrEqual(0);
    runtime.berriesEaten[0] = 10;
    expect(UpdateGame_Leader(runtime)).toBeUndefined();
    expect(runtime.difficulty[0]).toBe(1);

    ResetPickState(-1, runtime);
    expect(runtime.players.every(player => player.pickState === 0)).toBe(true);
  });
});
