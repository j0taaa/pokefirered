import { describe, expect, it } from 'vitest';
import {
  AddJumpScore,
  AddMessageWindow,
  AllowVineUpdates,
  AllPlayersJumpedOrHit,
  AskPlayAgain_Leader,
  CB2_PokemonJump,
  ClearMessageWindow,
  ClosePokeJumpLink,
  CreateJumpMonSprite,
  CreateStaticCountdownTask,
  DisallowVineUpdates,
  DidAllPlayersClearVine,
  DoGameIntro,
  DoPokeJumpCountdown,
  DoPrizeMessageAndFanfare,
  DoSameJumpTimeBonus,
  DoStarAnim,
  FreePokemonJump,
  GameRound_Leader,
  Gfx_IsMonHitShakeActive,
  Gfx_IsMonIntroBounceActive,
  Gfx_ResetMonSpriteSubpriorities,
  Gfx_StartMonHitFlash,
  Gfx_StartMonHitShake,
  Gfx_StartMonIntroBounce,
  Gfx_StopMonHitFlash,
  GetMonInfoByMultiplayerId,
  GetNumPlayersForBonus,
  GetPokeJumpPlayerName,
  GetPokeJumpRecords,
  GetPlayersAtJumpPeak,
  GetPokemonJumpSpeciesIdx,
  GetPrizeData,
  GetPrizeItemId,
  GetPrizeQuantity,
  GetVineSpeed,
  GetQuantityLimitedByBag,
  GetScoreBonus,
  HasEnoughScoreForPrize,
  InitGame,
  InitVineState,
  IsGameOver,
  IsMonHitShakeActive,
  IsMonIntroBounceActive,
  IsPokeJumpCountdownRunning,
  IsStaticCountdownRunning,
  ITEM_AGUAV_BERRY,
  ITEM_IAPAPA_BERRY,
  ITEM_LEPPA_BERRY,
  ITEM_LUM_BERRY,
  IsSpeciesAllowedInPokemonJump,
  JUMPSTATE_FAILURE,
  JUMPSTATE_NONE,
  JUMPSTATE_SUCCESS,
  JUMP_PEAK,
  JUMP_TYPE_FAST,
  JUMP_TYPE_NORMAL,
  JUMP_TYPE_SLOW,
  MAX_JUMPS,
  MAX_JUMP_SCORE,
  PLAY_AGAIN_NO,
  PLAY_AGAIN_YES,
  PokeJumpRandom,
  RecvPacket_LeaderState,
  ResetPokemonJumpRecords,
  ResetPokeJumpSpriteData,
  ResetVineAfterHit,
  ResetVineState,
  SavePokeJump,
  SE_BIKE_HOP,
  SendPacket_LeaderState,
  SetPokeJumpTask,
  SetUpPokeJumpGfxFuncById,
  ShouldPlayAgain,
  StartPokemonJump,
  StartStaticCountdown,
  StartPokeJumpCountdown,
  SpriteCB_MonHitFlash,
  SpriteCB_MonHitShake,
  SpriteCB_MonIntroBounce,
  SpriteCB_Star,
  Task_RunPokeJumpGfxFunc,
  Task_StaticCountdown,
  TryUpdateExcellentsRecord,
  TryUpdateRecords,
  UnpackPrizeData,
  UpdateVineSpeed,
  UpdateVineState,
  VINE_LOWEST,
  VINE_UPSWING_LOW,
  VINE_UPSWING_LOWER,
  createPokemonJumpGfx,
  createPokemonJumpPlayer,
  createPokemonJumpRecords,
  createPokemonJumpRuntime,
  createPokemonJumpSprite,
  sPokeJumpMons,
  IncrementGamesWithMaxPlayers
} from '../src/game/decompPokemonJump';
import { gSineTable } from '../src/game/decompTrig';

describe('decompPokemonJump', () => {
  it('species table preserves exact C order, species ids, jump types, and -1 lookup fallback', () => {
    expect(sPokeJumpMons).toHaveLength(100);
    expect(sPokeJumpMons[0]).toEqual({ species: 1, jumpType: JUMP_TYPE_SLOW });
    expect(sPokeJumpMons[1]).toEqual({ species: 4, jumpType: JUMP_TYPE_FAST });
    expect(sPokeJumpMons[9]).toEqual({ species: 25, jumpType: JUMP_TYPE_NORMAL });
    expect(sPokeJumpMons[99]).toEqual({ species: 395, jumpType: JUMP_TYPE_FAST });
    expect(GetPokemonJumpSpeciesIdx(1)).toBe(0);
    expect(GetPokemonJumpSpeciesIdx(395)).toBe(99);
    expect(GetPokemonJumpSpeciesIdx(129)).toBe(-1);
    expect(IsSpeciesAllowedInPokemonJump(133)).toBe(true);
    expect(IsSpeciesAllowedInPokemonJump(0)).toBe(false);
  });

  it('C-name player and record accessors return backing Pokemon Jump struct slots', () => {
    const runtime = createPokemonJumpRuntime();
    const compat = runtime as typeof runtime & {
      monInfo: Array<{ species: number; otId: number; personality: number }>;
      playerNames: string[];
    };
    compat.monInfo = [
      { species: 25, otId: 1, personality: 2 },
      { species: 133, otId: 3, personality: 4 }
    ];
    compat.playerNames = ['RED', 'BLUE'];

    expect(GetMonInfoByMultiplayerId(1, runtime)).toBe(compat.monInfo[1]);
    expect(GetPokeJumpPlayerName(1, runtime)).toBe('BLUE');
    expect(GetPokeJumpRecords(runtime)).toBe(runtime.records);
  });

  it('jump completion helpers count only active players and require success for every player', () => {
    const runtime = createPokemonJumpRuntime({
      numPlayers: 3,
      players: [
        createPokemonJumpPlayer({ jumpState: JUMPSTATE_SUCCESS }),
        createPokemonJumpPlayer({ jumpState: JUMPSTATE_FAILURE }),
        createPokemonJumpPlayer({ jumpState: JUMPSTATE_NONE }),
        createPokemonJumpPlayer({ jumpState: JUMPSTATE_SUCCESS }),
        createPokemonJumpPlayer({ jumpState: JUMPSTATE_SUCCESS })
      ]
    });

    expect(AllPlayersJumpedOrHit(runtime)).toBe(false);
    runtime.players[2].jumpState = JUMPSTATE_SUCCESS;
    expect(AllPlayersJumpedOrHit(runtime)).toBe(true);
    expect(DidAllPlayersClearVine(runtime)).toBe(false);
    runtime.players[1].jumpState = JUMPSTATE_SUCCESS;
    expect(DidAllPlayersClearVine(runtime)).toBe(true);
  });

  it('ShouldPlayAgain checks leader first, then member states starting at index 1', () => {
    const runtime = createPokemonJumpRuntime({
      numPlayers: 3,
      playAgainState: PLAY_AGAIN_YES,
      playAgainStates: [PLAY_AGAIN_NO, PLAY_AGAIN_YES, PLAY_AGAIN_YES, PLAY_AGAIN_NO, PLAY_AGAIN_NO]
    });

    expect(ShouldPlayAgain(runtime)).toBe(true);
    runtime.playAgainStates[2] = PLAY_AGAIN_NO;
    expect(ShouldPlayAgain(runtime)).toBe(false);
    runtime.playAgainStates[2] = PLAY_AGAIN_YES;
    runtime.playAgainState = PLAY_AGAIN_NO;
    expect(ShouldPlayAgain(runtime)).toBe(false);
  });

  it('AddJumpScore sets update flag and caps at MAX_JUMP_SCORE', () => {
    const runtime = createPokemonJumpRuntime();

    AddJumpScore(runtime, 500);
    expect(runtime.comm.jumpScore).toBe(500);
    expect(runtime.updateScore).toBe(true);
    AddJumpScore(runtime, MAX_JUMP_SCORE);
    expect(runtime.comm.jumpScore).toBe(MAX_JUMP_SCORE);
  });

  it('vine state helpers preserve init, reset, speed acceleration, RNG, wrap, and hit-reset behavior', () => {
    const runtime = createPokemonJumpRuntime({
      vineTimer: 9,
      vineState: 3,
      vineStateTimer: 99,
      vineSpeed: 44,
      ignoreJumpInput: 7,
      gameOver: true
    });

    InitVineState(runtime);
    expect(runtime).toMatchObject({
      vineTimer: 0,
      vineState: VINE_UPSWING_LOWER,
      vineStateTimer: 0,
      vineSpeed: 0,
      ignoreJumpInput: 0,
      gameOver: false
    });

    ResetVineState(runtime);
    expect(runtime.vineTimer).toBe(0);
    expect(runtime.vineStateTimer).toBe((VINE_UPSWING_LOWER << 8) | 0xff);
    expect(runtime.vineState).toBe(VINE_UPSWING_LOW);
    expect(runtime.vineSpeedStage).toBe(0);
    expect(runtime.vineBaseSpeedIdx).toBe(1);
    expect(runtime.vineSpeedAccel).toBe(0);
    expect(runtime.vineSpeedDelay).toBe(2);
    expect(runtime.vineSpeed).toBe(26);

    runtime.vineStateTimer = (VINE_LOWEST << 8) | 0xff;
    runtime.vineSpeed = 20;
    runtime.vineSpeedAccel = 0;
    expect(GetVineSpeed(runtime)).toBe(20);
    expect(runtime.vineSpeedAccel).toBe(80);
    GetVineSpeed(runtime);
    GetVineSpeed(runtime);
    expect(GetVineSpeed(runtime)).toBe(21);
    runtime.gameOver = true;
    expect(GetVineSpeed(runtime)).toBe(0);

    runtime.gameOver = false;
    runtime.allowVineUpdates = true;
    runtime.vineTimer = 0;
    runtime.vineState = VINE_UPSWING_LOWER;
    runtime.prevVineState = VINE_UPSWING_LOWER;
    runtime.vineStateTimer = (VINE_UPSWING_LOWER << 8) | 0xff;
    runtime.vineSpeed = 300;
    runtime.vineSpeedDelay = 0;
    runtime.vineBaseSpeedIdx = 0;
    runtime.ignoreJumpInput = 0;
    UpdateVineState(runtime);
    expect(runtime.vineTimer).toBe(1);
    expect(runtime.prevVineState).toBe(VINE_UPSWING_LOWER);
    expect(runtime.vineState).toBe(8);
    expect(runtime.ignoreJumpInput).toBe(1);
    expect(runtime.vineSpeed).toBe(26);

    runtime.vineStateTimer = ((9 << 8) | 0xff) - 5;
    runtime.vineSpeed = 10;
    runtime.vineSpeedAccel = 0;
    runtime.vineBaseSpeedIdx = 1;
    runtime.vineSpeedDelay = 1;
    UpdateVineState(runtime);
    expect(runtime.vineStateTimer).toBe(5);

    runtime.vineBaseSpeedIdx = 8;
    runtime.vineSpeedStage = 0;
    runtime.vineSpeedDelay = 0;
    runtime.atMaxSpeedStage = false;
    UpdateVineSpeed(runtime);
    expect(runtime.vineSpeedStage).toBe(1);
    expect(runtime.nextVineSpeed).toBe(68);
    expect(runtime.vineSpeed).toBe(68);
    expect(runtime.vineBaseSpeedIdx).toBe(9);

    runtime.vineBaseSpeedIdx = 15;
    runtime.vineSpeedStage = 0;
    runtime.rngSeed = 0;
    UpdateVineSpeed(runtime);
    expect(runtime.nextVineSpeed).toBe(21);
    expect(runtime.vineBaseSpeedIdx).toBe(0);

    ResetVineAfterHit(runtime);
    expect(runtime.gameOver).toBe(true);
    expect(runtime.vineState).toBe(VINE_UPSWING_LOWER);
    expect(runtime.vineStateTimer).toBe((VINE_LOWEST << 8) | 0xff);
    expect(runtime.allowVineUpdates).toBe(true);

    DisallowVineUpdates(runtime);
    expect(runtime.allowVineUpdates).toBe(false);
    AllowVineUpdates(runtime);
    expect(runtime.allowVineUpdates).toBe(true);

    runtime.rngSeed = 0;
    expect(PokeJumpRandom(runtime)).toBe(0);
    expect(runtime.rngSeed).toBe(24691);
  });

  it('GetPlayersAtJumpPeak mutates atJumpPeak for active players and returns count', () => {
    const runtime = createPokemonJumpRuntime({
      numPlayers: 4,
      players: [
        createPokemonJumpPlayer({ jumpOffset: JUMP_PEAK }),
        createPokemonJumpPlayer({ jumpOffset: JUMP_PEAK + 1 }),
        createPokemonJumpPlayer({ jumpOffset: JUMP_PEAK }),
        createPokemonJumpPlayer({ jumpOffset: 0 }),
        createPokemonJumpPlayer({ jumpOffset: JUMP_PEAK })
      ],
      atJumpPeak: [true, true, false, true, true]
    });

    expect(GetPlayersAtJumpPeak(runtime)).toBe(2);
    expect(runtime.atJumpPeak).toEqual([true, false, true, false, true]);
  });

  it('GetNumPlayersForBonus packs flags for all five RFU slots and only sets showBonus when nonzero', () => {
    const runtime = createPokemonJumpRuntime();

    expect(GetNumPlayersForBonus(runtime, [false, false, false, false, false])).toBe(0);
    expect(runtime.comm.receivedBonusFlags).toBe(0);
    expect(runtime.showBonus).toBe(false);

    expect(GetNumPlayersForBonus(runtime, [true, false, true, false, true])).toBe(3);
    expect(runtime.comm.receivedBonusFlags).toBe(0b10101);
    expect(runtime.showBonus).toBe(true);
  });

  it('score bonuses and excellent record update preserve thresholds and no-op lower values', () => {
    const runtime = createPokemonJumpRuntime({ excellentsInRowRecord: 4 });

    expect([0, 1, 2, 3, 4, 5].map(GetScoreBonus)).toEqual([0, 0, 50, 100, 200, 500]);
    TryUpdateExcellentsRecord(runtime, 3);
    expect(runtime.excellentsInRowRecord).toBe(4);
    TryUpdateExcellentsRecord(runtime, 5);
    expect(runtime.excellentsInRowRecord).toBe(5);
  });

  it('prize helpers use C score thresholds, item random modulo, and packed quantity high nibble', () => {
    const runtime = createPokemonJumpRuntime();

    expect(HasEnoughScoreForPrize(runtime)).toBe(false);
    expect(GetPrizeQuantity(runtime)).toBe(0);
    runtime.comm.jumpScore = 4999;
    expect(GetPrizeQuantity(runtime)).toBe(0);
    runtime.comm.jumpScore = 5000;
    expect(HasEnoughScoreForPrize(runtime)).toBe(true);
    expect(GetPrizeQuantity(runtime)).toBe(1);
    runtime.comm.jumpScore = 8000;
    expect(GetPrizeQuantity(runtime)).toBe(2);
    runtime.comm.jumpScore = 12000;
    expect(GetPrizeQuantity(runtime)).toBe(3);
    runtime.comm.jumpScore = 16000;
    expect(GetPrizeQuantity(runtime)).toBe(4);
    runtime.comm.jumpScore = 20000;
    expect(GetPrizeQuantity(runtime)).toBe(5);

    expect(GetPrizeItemId(0)).toBe(ITEM_LEPPA_BERRY);
    expect(GetPrizeItemId(1)).toBe(ITEM_LUM_BERRY);
    expect(GetPrizeItemId(6)).toBe(ITEM_AGUAV_BERRY);
    expect(GetPrizeItemId(7)).toBe(ITEM_IAPAPA_BERRY);
    expect(GetPrizeItemId(8)).toBe(ITEM_LEPPA_BERRY);

    const packed = GetPrizeData(runtime, 1);
    expect(packed).toBe((5 << 12) | ITEM_LUM_BERRY);
    expect(UnpackPrizeData(packed)).toEqual({ itemId: ITEM_LUM_BERRY, quantity: 5 });
  });

  it('GetQuantityLimitedByBag decrements until CheckBagHasSpace succeeds or reaches zero', () => {
    const calls: number[] = [];
    const quantity = GetQuantityLimitedByBag(ITEM_LEPPA_BERRY, 5, (_item, qty) => {
      calls.push(qty);
      return qty <= 2;
    });

    expect(quantity).toBe(2);
    expect(calls).toEqual([5, 4, 3, 2]);
    expect(GetQuantityLimitedByBag(ITEM_LEPPA_BERRY, 2, () => false)).toBe(0);
  });

  it('records reset, update with caps, and max-player increment saturates at 9999', () => {
    const records = createPokemonJumpRecords({
      jumpsInRow: 10,
      bestJumpScore: 20,
      excellentsInRow: 30,
      gamesWithMaxPlayers: 40,
      unused1: 50,
      unused2: 60
    });

    ResetPokemonJumpRecords(records);
    expect(records).toEqual({
      jumpsInRow: 0,
      bestJumpScore: 0,
      excellentsInRow: 0,
      gamesWithMaxPlayers: 0,
      unused1: 0,
      unused2: 0
    });

    expect(TryUpdateRecords(records, 100, 200, 300)).toBe(true);
    expect(records).toMatchObject({ bestJumpScore: 100, jumpsInRow: 200, excellentsInRow: 300 });
    expect(TryUpdateRecords(records, MAX_JUMP_SCORE + 1, MAX_JUMPS + 1, MAX_JUMPS + 1)).toBe(false);
    expect(records).toMatchObject({ bestJumpScore: 100, jumpsInRow: 200, excellentsInRow: 300 });

    records.gamesWithMaxPlayers = 9998;
    IncrementGamesWithMaxPlayers(records);
    expect(records.gamesWithMaxPlayers).toBe(9999);
    IncrementGamesWithMaxPlayers(records);
    expect(records.gamesWithMaxPlayers).toBe(9999);
  });

  it('star animation setup resets sprite data, stores mon sprite id, starts anim 1, and callbacks match C states', () => {
    const runtime = createPokemonJumpRuntime({
      gfx: createPokemonJumpGfx({
        monSprites: [
          createPokemonJumpSprite({ spriteId: 22 }),
          createPokemonJumpSprite({ spriteId: 23 }),
          createPokemonJumpSprite({ spriteId: 24 }),
          createPokemonJumpSprite({ spriteId: 25 }),
          createPokemonJumpSprite({ spriteId: 26 })
        ],
        starSprites: [
          createPokemonJumpSprite({ data: [9, 9, 9, 9, 9, 9, 9, 9], invisible: true }),
          createPokemonJumpSprite({ invisible: true }),
          createPokemonJumpSprite({ invisible: true }),
          createPokemonJumpSprite({ invisible: true }),
          createPokemonJumpSprite({ invisible: true })
        ]
      })
    });

    DoStarAnim(runtime, 0);
    const star = runtime.gfx.starSprites[0]!;
    expect(star.data).toEqual([0, 0, 0, 0, 0, 0, 0, 22]);
    expect(star).toMatchObject({ invisible: false, y: 96, callback: 'SpriteCB_Star', animNum: 1, animEnded: false });

    star.animEnded = true;
    SpriteCB_Star(star);
    expect(star.invisible).toBe(true);
    expect(star.callback).toBe('SpriteCallbackDummy');

    star.data[0] = 1;
    star.data[1] = 0;
    star.y = 73;
    star.invisible = false;
    star.callback = 'SpriteCB_Star';
    SpriteCB_Star(star);
    expect(star.y).toBe(72);
    expect(star.data[0]).toBe(2);
    expect(star.data[1]).toBe(1);

    star.data[1] = 47;
    SpriteCB_Star(star);
    expect(star.invisible).toBe(true);
    expect(star.callback).toBe('SpriteCallbackDummy');
  });

  it('same jump time bonus scans flags from bit 0 through all RFU slots and shows numPlayers - 2', () => {
    const runtime = createPokemonJumpRuntime();

    expect(DoSameJumpTimeBonus(runtime, 0b10101)).toBe(3);
    expect(runtime.gfx.starSprites[0]?.callback).toBe('SpriteCB_Star');
    expect(runtime.gfx.starSprites[1]?.callback).toBe('SpriteCallbackDummy');
    expect(runtime.gfx.starSprites[2]?.callback).toBe('SpriteCB_Star');
    expect(runtime.gfx.starSprites[4]?.callback).toBe('SpriteCB_Star');
    expect(runtime.shownBonuses).toEqual([1]);
  });

  it('hit shake uses two-frame timer, alternates y2, and ends after more than 12 shakes', () => {
    const runtime = createPokemonJumpRuntime();
    const sprite = runtime.gfx.monSprites[1]!;
    sprite.data = [7, 7, 7, 7, 7, 7, 7, 7];

    Gfx_StartMonHitShake(runtime, 1);
    expect(sprite.callback).toBe('SpriteCB_MonHitShake');
    expect(sprite.y2).toBe(0);
    expect(sprite.data).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(Gfx_IsMonHitShakeActive(runtime, 1)).toBe(true);
    expect(IsMonHitShakeActive(1, runtime)).toBe(1);

    SpriteCB_MonHitShake(sprite);
    expect(sprite.data[1]).toBe(1);
    expect(sprite.y2).toBe(0);
    SpriteCB_MonHitShake(sprite);
    expect(sprite.data[1]).toBe(0);
    expect(sprite.data[2]).toBe(1);
    expect(sprite.y2).toBe(2);
    SpriteCB_MonHitShake(sprite);
    SpriteCB_MonHitShake(sprite);
    expect(sprite.data[2]).toBe(2);
    expect(sprite.y2).toBe(-2);

    while (sprite.callback !== 'SpriteCallbackDummy') {
      SpriteCB_MonHitShake(sprite);
    }
    expect(sprite.data[2]).toBe(13);
    expect(sprite.y2).toBe(0);
    expect(Gfx_IsMonHitShakeActive(runtime, 1)).toBe(false);
    expect(IsMonHitShakeActive(1, runtime)).toBe(0);
  });

  it('hit flash resets data, toggles invisibility every four callbacks, and stop only affects active players', () => {
    const runtime = createPokemonJumpRuntime({ numPlayers: 3 });
    const active = runtime.gfx.monSprites[0]!;
    const otherActive = runtime.gfx.monSprites[2]!;
    const inactiveOutsideCount = runtime.gfx.monSprites[4]!;
    active.data[0] = 99;

    Gfx_StartMonHitFlash(runtime, 0);
    Gfx_StartMonHitFlash(runtime, 2);
    inactiveOutsideCount.callback = 'SpriteCB_MonHitFlash';
    expect(active.data).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);

    for (let i = 0; i < 3; i += 1)
      SpriteCB_MonHitFlash(active);
    expect(active.invisible).toBe(false);
    SpriteCB_MonHitFlash(active);
    expect(active.data[0]).toBe(0);
    expect(active.invisible).toBe(true);

    Gfx_StopMonHitFlash(runtime);
    expect(active).toMatchObject({ invisible: false, callback: 'SpriteCallbackDummy', subpriority: 10 });
    expect(otherActive).toMatchObject({ invisible: false, callback: 'SpriteCallbackDummy', subpriority: 10 });
    expect(inactiveOutsideCount.callback).toBe('SpriteCB_MonHitFlash');
  });

  it('subpriority reset and intro bounce mirror C callbacks and sine-table y2 math', () => {
    const runtime = createPokemonJumpRuntime({ numPlayers: 2 });
    runtime.gfx.monSprites[0]!.subpriority = 99;
    runtime.gfx.monSprites[1]!.subpriority = 98;
    runtime.gfx.monSprites[2]!.subpriority = 97;
    runtime.gfx.monSpriteSubpriorities = [3, 5, 7, 9, 11];

    Gfx_ResetMonSpriteSubpriorities(runtime);
    expect(runtime.gfx.monSprites[0]!.subpriority).toBe(3);
    expect(runtime.gfx.monSprites[1]!.subpriority).toBe(5);
    expect(runtime.gfx.monSprites[2]!.subpriority).toBe(97);

    const sprite = runtime.gfx.monSprites[1]!;
    ResetPokeJumpSpriteData(sprite);
    Gfx_StartMonIntroBounce(runtime, 1);
    expect(Gfx_IsMonIntroBounceActive(runtime)).toBe(true);
    expect(IsMonIntroBounceActive(runtime)).toBe(1);
    SpriteCB_MonIntroBounce(runtime, sprite);
    expect(runtime.playedSoundEffects).toEqual([SE_BIKE_HOP]);
    expect(sprite.data[0]).toBe(1);
    expect(sprite.data[1]).toBe(4);
    expect(sprite.y2).toBe(-(gSineTable[4] >> 3));

    while (sprite.callback !== 'SpriteCallbackDummy') {
      SpriteCB_MonIntroBounce(runtime, sprite);
    }
    expect(runtime.playedSoundEffects).toEqual([SE_BIKE_HOP, SE_BIKE_HOP]);
    expect(sprite.data[2]).toBe(2);
    expect(sprite.data[1]).toBe(0);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
    expect(Gfx_IsMonIntroBounceActive(runtime)).toBe(false);
    expect(IsMonIntroBounceActive(runtime)).toBe(0);
  });

  it('C-named Pokemon Jump entrypoints expose countdown, task, packet, gfx, prize, and save state', () => {
    const runtime = createPokemonJumpRuntime({ numPlayers: 2 });
    const compat = runtime as typeof runtime & {
      tasks?: Array<{ func: string; data: number[]; destroyed: boolean }>;
      packets?: Array<{ type: string; payload: unknown }>;
      operations?: string[];
      mainFunc?: string;
      gfxFunc?: string | null;
      gfxFuncFinished?: boolean;
      countdownRunning?: boolean;
      staticCountdownRunning?: boolean;
      closedLink?: boolean;
      saved?: boolean;
      message?: string;
      messageWindowId?: number | null;
      prizeItemId?: number;
      prizeItemQuantity?: number;
    };

    StartPokemonJump(runtime);
    expect(compat.mainFunc).toBe('Task_StartPokemonJump');
    expect(runtime.vineState).toBe(VINE_UPSWING_LOWER);
    runtime.gameOver = true;
    expect(IsGameOver(runtime)).toBe(1);
    runtime.gameOver = false;
    expect(IsGameOver(runtime)).toBe(0);

    const countdownTask = CreateStaticCountdownTask(0, 3, runtime);
    expect(compat.tasks?.[countdownTask].data[8]).toBe(3);
    expect(StartStaticCountdown(runtime)).toBe(true);
    expect(IsStaticCountdownRunning(runtime)).toBe(true);
    Task_StaticCountdown(countdownTask, runtime);
    expect(compat.tasks?.[countdownTask].data[0]).toBe(3);

    InitGame(runtime);
    SetPokeJumpTask('Task_PokemonJump_Leader', runtime);
    expect(compat.mainFunc).toBe('Task_PokemonJump_Leader');
    expect(DoGameIntro(runtime)).toBe(true);
    expect(IsPokeJumpCountdownRunning(runtime)).toBe(true);
    DoPokeJumpCountdown(runtime);
    StartPokeJumpCountdown(runtime.gfx, runtime);
    expect(compat.countdownRunning).toBe(true);

    runtime.players[0].monState = 1;
    runtime.players[0].jumpOffsetIdx = 0;
    expect(GameRound_Leader(runtime)).toBe(false);
    expect(runtime.players[0].jumpOffsetIdx).toBe(1);

    SendPacket_LeaderState(runtime.players[0], runtime.comm, runtime);
    const playerCopy = createPokemonJumpPlayer();
    const commCopy = { jumpScore: 0, receivedBonusFlags: 0, jumpsInRow: 0 };
    expect(RecvPacket_LeaderState(playerCopy, commCopy, runtime)).toBe(true);
    expect(commCopy.jumpScore).toBe(runtime.comm.jumpScore);
    expect(compat.packets?.[0].type).toBe('PACKET_LEADER_STATE');

    SetUpPokeJumpGfxFuncById(4, runtime);
    expect(compat.gfxFunc).toBe('Msg_WantToPlayAgain');
    const gfxTask = compat.tasks!.length;
    compat.tasks!.push({ func: 'Task_RunPokeJumpGfxFunc', data: Array.from({ length: 16 }, () => 0), destroyed: false });
    Task_RunPokeJumpGfxFunc(gfxTask, runtime);
    expect(compat.gfxFuncFinished).toBe(true);
    expect(compat.tasks?.[gfxTask].destroyed).toBe(true);

    CreateJumpMonSprite(runtime.gfx, null, 12, 44, 1);
    expect(runtime.gfx.monSprites[1]).toMatchObject({ y: 44 });

    AddMessageWindow(1, 2, 3, 4, runtime);
    expect(compat.messageWindowId).toBe(1);
    expect(AskPlayAgain_Leader(runtime)).toBe(true);
    expect(compat.message).toBe('WantToPlayAgain');
    ClearMessageWindow(runtime);
    expect(compat.message).toBe('');

    runtime.comm.jumpScore = 12000;
    expect(DoPrizeMessageAndFanfare(runtime)).toBe(true);
    expect(SavePokeJump(runtime)).toBe(true);
    expect(compat.saved).toBe(true);

    expect(ClosePokeJumpLink(runtime)).toBe(true);
    expect(compat.closedLink).toBe(true);
    CB2_PokemonJump(runtime);
    expect(compat.operations).toContain('CB2_PokemonJump');

    FreePokemonJump(runtime);
    expect(compat.tasks).toEqual([]);
  });
});
