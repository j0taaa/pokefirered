import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  BerryCrush_BuildLocalState,
  CMD_PLAY_GAME_LEADER,
  CMD_SHOW_RESULTS,
  Cmd_TabulateResults,
  F_INPUT_HIT_SYNC,
  FIRST_BERRY_INDEX,
  HandlePartnerInput,
  HandlePlayerInput,
  INPUT_STATE_HIT,
  INPUT_STATE_HIT_SYNC,
  MAX_TIME,
  PLAY_AGAIN_YES,
  RFUCMD_SEND_PACKET,
  RUN_CMD,
  RecvLinkData,
  ResetGame,
  SEND_GAME_STATE,
  SCHEDULE_CMD,
  GetBerryFromBag,
  RunOrScheduleCommand,
  SaveResults,
  SetPaletteFadeArgs,
  SetPrintMessageArgs,
  ShowBerryCrushRankings,
  StartBerryCrush,
  Task_ShowBerryCrushRankings,
  createBerryCrushRuntime
} from '../src/game/decompBerryCrush';

describe('decompBerryCrush', () => {
  test('StartBerryCrush validates link state and initializes command scheduling', () => {
    const runtime = createBerryCrushRuntime();
    runtime.linkPlayerCount = 3;
    runtime.multiplayerId = 1;
    runtime.linkPlayers = ['RED', 'BLUE', 'GREEN'];

    StartBerryCrush('Return', runtime);

    expect(runtime.game?.savedCallback).toBe('Return');
    expect(runtime.game?.localId).toBe(1);
    expect(runtime.game?.playerCount).toBe(3);
    expect(runtime.game?.players.map((p) => p.name).slice(0, 3)).toEqual(['RED', 'BLUE', 'GREEN']);
    expect(runtime.game?.playAgainState).toBe(PLAY_AGAIN_YES);
    expect(runtime.game?.cmdCallback).toBe(4);
  });

  test('argument packing follows the C byte layout', () => {
    const args = Array.from({ length: 12 }, () => 0);
    SetPaletteFadeArgs(args, true, 0x12345678, 255, 16, 0, 0x7fff);
    expect(args.slice(0, 10)).toEqual([0x78, 0x56, 0x34, 0x12, 255, 16, 0, 0xff, 0x7f, 1]);

    SetPrintMessageArgs(args, 7, 3, A_BUTTON | 0x200, 18);
    expect(args.slice(0, 5)).toEqual([7, 3, 1, 2, 18]);
  });

  test('partner input aggregation preserves synced press, neatness, depth, and end-game math', () => {
    const runtime = createBerryCrushRuntime();
    runtime.linkPlayerCount = 2;
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    ResetGame(game, runtime);
    game.targetAPresses = 4;
    game.targetDepth = 32 << 8;
    game.timer = 10;
    runtime.recvCmds[0] = { ...runtime.recvCmds[0], rfuCmd: RFUCMD_SEND_PACKET, sendFlag: SEND_GAME_STATE, pushedAButton: true };
    runtime.recvCmds[1] = { ...runtime.recvCmds[1], rfuCmd: RFUCMD_SEND_PACKET, sendFlag: SEND_GAME_STATE, pushedAButton: true };

    HandlePartnerInput(game, runtime);
    BerryCrush_BuildLocalState(game);

    expect(game.players[0].inputState).toBe(INPUT_STATE_HIT | INPUT_STATE_HIT_SYNC);
    expect(game.players[1].numSyncedAPresses).toBe(1);
    expect(game.totalAPresses).toBe(3);
    expect(game.newDepth).toBe(0);
    expect(game.localState.inputFlags & F_INPUT_HIT_SYNC).toBe(F_INPUT_HIT_SYNC);

    game.timer = 20;
    HandlePartnerInput(game, runtime);
    expect(game.localState.endGame).toBe(true);
    expect(game.newDepth).toBe(32);
  });

  test('local input only sends from members after A and keeps the original sparkleCounter bug', () => {
    const runtime = createBerryCrushRuntime();
    runtime.linkPlayerCount = 3;
    runtime.multiplayerId = 1;
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    game.timer = 15;
    game.sparkleCounter = 7;

    HandlePlayerInput(game, runtime);
    expect(game.localState.sendFlag).toBe(0);

    runtime.newKeys = A_BUTTON;
    runtime.heldKeys = A_BUTTON;
    HandlePlayerInput(game, runtime);
    expect(game.localState.sendFlag).toBe(SEND_GAME_STATE);
    expect(game.sparkleAmount).toBe(0);
    expect(game.sparkleCounter).toBe(0);

    game.timer = MAX_TIME;
    HandlePlayerInput(game, runtime);
    expect(game.localState.endGame).toBe(true);
  });

  test('RecvLinkData applies leader packet depth, vibration, timer, effects, and end flag', () => {
    const runtime = createBerryCrushRuntime();
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    game.gfx.impactSprites = [game.gfx.sparkleSprites[0], game.gfx.sparkleSprites[1]];
    runtime.recvCmds[0] = {
      rfuCmd: RFUCMD_SEND_PACKET,
      sendFlag: SEND_GAME_STATE,
      endGame: true,
      bigSparkle: false,
      pushedAButton: false,
      playerPressedAFlags: 0,
      vibration: 3,
      depth: 12,
      timer: 99,
      inputFlags: 1,
      sparkleAmount: 0
    };

    RecvLinkData(game, runtime);
    expect(game.depth).toBe(12);
    expect(game.vibration).toBe(3);
    expect(game.timer).toBe(99);
    expect(game.endGame).toBe(true);
    expect(game.gfx.impactSprites[0].invisible).toBe(false);
  });

  test('Cmd_TabulateResults calculates, sorts, saves, and schedules results', () => {
    const runtime = createBerryCrushRuntime();
    runtime.linkPlayerCount = 2;
    runtime.randomValues = [2];
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    game.timer = 600;
    game.targetAPresses = 100;
    game.powder = 20;
    game.numBigSparkles = 3;
    game.numBigSparkleChecks = 4;
    game.players[0].numAPresses = 4;
    game.players[0].timePressingA = 300;
    game.players[1].numAPresses = 8;
    game.players[1].timePressingA = 600;

    game.cmdState = 3;
    Cmd_TabulateResults(game, game.commandParams, runtime);
    expect(game.results.randomPageId).toBe(2);
    expect(game.results.silkiness).toBe(87);

    Cmd_TabulateResults(game, game.commandParams, runtime);
    expect(game.results.playerIdsRanked[0].slice(0, 2)).toEqual([1, 0]);

    game.cmdState = 7;
    Cmd_TabulateResults(game, game.commandParams, runtime);
    expect(game.cmdCallback).toBe(CMD_SHOW_RESULTS);
    expect(runtime.berryPowder).toBe(game.results.powder);
  });

  test('SaveResults updates per-player-count record and powder capacity flag', () => {
    const runtime = createBerryCrushRuntime();
    runtime.linkPlayerCount = 5;
    runtime.berryPowderCapacity = 10;
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    game.results.time = 600;
    game.results.totalAPresses = 20;
    game.results.powder = 50;

    SaveResults(runtime);

    expect(game.newRecord).toBe(true);
    expect(runtime.savePressingSpeeds[3]).toBeGreaterThan(0);
    expect(game.noRoomForPowder).toBe(true);
  });

  test('rankings task locks controls and releases them on A/B', () => {
    const runtime = createBerryCrushRuntime();
    ShowBerryCrushRankings(runtime);
    const taskId = 0;
    expect(runtime.fieldControlsLocked).toBe(true);
    Task_ShowBerryCrushRankings(taskId, runtime);
    Task_ShowBerryCrushRankings(taskId, runtime);
    runtime.newKeys = A_BUTTON;
    Task_ShowBerryCrushRankings(taskId, runtime);
    Task_ShowBerryCrushRankings(taskId, runtime);
    expect(runtime.scriptContextEnabled).toBe(true);
    expect(runtime.fieldControlsLocked).toBe(false);
  });

  test('RunOrScheduleCommand supports immediate and scheduled command modes', () => {
    const runtime = createBerryCrushRuntime();
    StartBerryCrush('Return', runtime);
    const game = runtime.game!;
    game.nextCmd = CMD_PLAY_GAME_LEADER;
    RunOrScheduleCommand(0, RUN_CMD, game.commandParams, runtime);
    expect(game.cmdCallback).toBe(CMD_PLAY_GAME_LEADER);
    RunOrScheduleCommand(CMD_PLAY_GAME_LEADER, SCHEDULE_CMD, game.commandParams, runtime);
    expect(game.cmdCallback).toBe(CMD_PLAY_GAME_LEADER);
  });

  test('GetBerryFromBag records bag removal and selected berry id', () => {
    const runtime = createBerryCrushRuntime();
    StartBerryCrush('Return', runtime);
    runtime.specialVarItemId = FIRST_BERRY_INDEX + 3;
    GetBerryFromBag(runtime);
    expect(runtime.bagRemoved).toEqual([{ itemId: FIRST_BERRY_INDEX + 3, count: 1 }]);
    expect(runtime.game?.players[0].berryId).toBe(3);
  });
});
