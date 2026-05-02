#include "global.h"
#include "battle.h"
#include "battle_anim.h"
#include "battle_main.h"
#include "battle_trace_harness.h"
#include "event_data.h"
#include "gba/isagbprint.h"
#include "item.h"
#include "pokemon.h"
#include "load_save.h"
#include "random.h"
#include "string_util.h"
#include "util.h"
#include "constants/global.h"
#include "constants/items.h"
#include "constants/moves.h"
#include "constants/opponents.h"
#include "constants/pokemon.h"
#include "constants/trainers.h"

#define TRACE_EVENT_COUNT 64
#define TRACE_MODE_WILD 1
#define TRACE_MODE_TRAINER 2
#define TRACE_PHASE_COMMAND 1
#define TRACE_PHASE_SHIFT_PROMPT 2
#define TRACE_PHASE_RESOLVED 3
#define TRACE_EVENT_CHOOSE_ACTION 1
#define TRACE_EVENT_CHOOSE_MOVE 2
#define TRACE_EVENT_CHOOSE_ITEM 3
#define TRACE_EVENT_CHOOSE_POKEMON 4
#define TRACE_EVENT_YES_NO_BOX 5
#define TRACE_EVENT_PRINT_STRING 6

struct BattleTraceHarnessState
{
    bool8 active;
    bool8 booted;
    bool8 completed;
    bool8 introSkipped;
    u16 fixtureId;
    u8 mode;
    u8 chooseActionRequests;
    bool8 sawShiftPrompt;
    u16 activeUpdateCount;
    u8 eventCount;
    struct BattleTraceHarnessEvent events[TRACE_EVENT_COUNT];
};

EWRAM_DATA struct BattleTraceHarnessRequest gBattleTraceHarnessRequest = {0};
EWRAM_DATA struct BattleTraceHarnessResult gBattleTraceHarnessResult = {0};
static EWRAM_DATA struct BattleTraceHarnessState sBattleTraceHarness = {0};

static void ClearParty(struct Pokemon *party)
{
    s32 i;

    for (i = 0; i < PARTY_SIZE; i++)
        ZeroMonData(&party[i]);
}

static void ConfigurePlayerMon(void)
{
    u16 hp;
    u16 speed;
    u16 move;

    CreateMon(&gPlayerParty[0], SPECIES_BULBASAUR, 5, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
    gPlayerPartyCount = 1;

    move = MOVE_TACKLE;
    SetMonMoveSlot(&gPlayerParty[0], move, 0);
    move = MOVE_GROWL;
    SetMonMoveSlot(&gPlayerParty[0], move, 1);

    hp = GetMonData(&gPlayerParty[0], MON_DATA_MAX_HP, NULL);
    SetMonData(&gPlayerParty[0], MON_DATA_HP, &hp);

    speed = 45;
    SetMonData(&gPlayerParty[0], MON_DATA_SPEED, &speed);
}

static void ConfigurePlayerBenchMon(void)
{
    u16 hp;
    u16 speed;
    u16 move;

    CreateMon(&gPlayerParty[1], SPECIES_PIDGEY, 5, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
    gPlayerPartyCount = 2;

    move = MOVE_TACKLE;
    SetMonMoveSlot(&gPlayerParty[1], move, 0);

    hp = GetMonData(&gPlayerParty[1], MON_DATA_MAX_HP, NULL);
    SetMonData(&gPlayerParty[1], MON_DATA_HP, &hp);

    speed = 40;
    SetMonData(&gPlayerParty[1], MON_DATA_SPEED, &speed);
}

static void ConfigureWildOpeningExchangeFixture(void)
{
    u16 move;
    u16 hp;
    u16 speed;

    sBattleTraceHarness.mode = TRACE_MODE_WILD;
    gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;

    CreateMon(&gEnemyParty[0], SPECIES_RATTATA, 4, USE_RANDOM_IVS, FALSE, 0, OT_ID_RANDOM_NO_SHINY, 0);
    gEnemyPartyCount = 1;
    move = MOVE_TAIL_WHIP;
    SetMonMoveSlot(&gEnemyParty[0], move, 0);
    hp = GetMonData(&gEnemyParty[0], MON_DATA_MAX_HP, NULL);
    SetMonData(&gEnemyParty[0], MON_DATA_HP, &hp);
    speed = 5;
    SetMonData(&gEnemyParty[0], MON_DATA_SPEED, &speed);
}

static void ConfigureTrainerShiftPromptFixture(void)
{
    sBattleTraceHarness.mode = TRACE_MODE_TRAINER;
    gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
    gTrainerBattleOpponent_A = TRAINER_LEADER_BROCK;
}

static void ConfigureWildCatchFixture(void)
{
    u16 hp;

    sBattleTraceHarness.mode = TRACE_MODE_WILD;
    gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;

    CreateMon(&gEnemyParty[0], SPECIES_MAGIKARP, 5, USE_RANDOM_IVS, FALSE, 0, OT_ID_RANDOM_NO_SHINY, 0);
    gEnemyPartyCount = 1;
    hp = 1;
    SetMonData(&gEnemyParty[0], MON_DATA_HP, &hp);
}

static void ConfigureWildStatusExchangeFixture(void)
{
    ConfigureWildOpeningExchangeFixture();
}

static void ConfigureWildPlayerSwitchFixture(void)
{
    ConfigurePlayerBenchMon();
    ConfigureWildOpeningExchangeFixture();
}

static void ConfigureWildRunEscapeFixture(void)
{
    ConfigureWildOpeningExchangeFixture();
}

static void ConfigureBattleWhiteoutFixture(void)
{
    u16 hp;
    u16 speed;

    sBattleTraceHarness.mode = TRACE_MODE_TRAINER;
    gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
    gTrainerBattleOpponent_A = TRAINER_LEADER_BROCK;

    hp = 1;
    SetMonData(&gPlayerParty[0], MON_DATA_HP, &hp);
    speed = 5;
    SetMonData(&gPlayerParty[0], MON_DATA_SPEED, &speed);
}

static void ConfigureFixture(void)
{
    ClearParty(gPlayerParty);
    ClearParty(gEnemyParty);
    ConfigurePlayerMon();
    SeedRng(0);

    switch (sBattleTraceHarness.fixtureId)
    {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
        ConfigureWildOpeningExchangeFixture();
        break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
        ConfigureTrainerShiftPromptFixture();
        break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
        ConfigureWildCatchFixture();
        break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
        ConfigureBattleWhiteoutFixture();
        break;
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
        ConfigureWildStatusExchangeFixture();
        break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
        ConfigureWildPlayerSwitchFixture();
        break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
        ConfigureWildRunEscapeFixture();
        break;
    }
}

static void PostInitAdjustments(void)
{
    u16 hp;
    u16 move;
    u16 speed;

    if (gSaveBlock2Ptr != NULL)
        gSaveBlock2Ptr->optionsBattleStyle = OPTIONS_BATTLE_STYLE_SHIFT;

    if (gSaveBlock1Ptr != NULL)
    {
        ClearBag();
        AddBagItem(ITEM_POKE_BALL, 1);
    }

    switch (sBattleTraceHarness.fixtureId)
    {
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
        hp = 1;
        SetMonData(&gEnemyParty[0], MON_DATA_HP, &hp);
        move = MOVE_SPLASH;
        SetMonMoveSlot(&gEnemyParty[0], move, 0);
        break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
        move = MOVE_TACKLE;
        SetMonMoveSlot(&gEnemyParty[0], move, 0);
        speed = 45;
        SetMonData(&gEnemyParty[0], MON_DATA_SPEED, &speed);
        break;
    }
}

static void RecordEvent(u8 kind, u8 battler, u16 value, u16 extra)
{
    struct BattleTraceHarnessEvent *event;

    if (!sBattleTraceHarness.active || sBattleTraceHarness.eventCount >= TRACE_EVENT_COUNT)
        return;

    event = &sBattleTraceHarness.events[sBattleTraceHarness.eventCount++];
    event->kind = kind;
    event->battler = battler;
    event->value = value;
    event->extra = extra;

    if (kind == TRACE_EVENT_YES_NO_BOX)
        sBattleTraceHarness.sawShiftPrompt = TRUE;
    if (kind == TRACE_EVENT_CHOOSE_ACTION && battler == 0)
        sBattleTraceHarness.chooseActionRequests++;
}

static bool8 HasRecordedEvent(u8 kind)
{
    u8 i;

    for (i = 0; i < sBattleTraceHarness.eventCount; i++)
    {
        if (sBattleTraceHarness.events[i].kind == kind)
            return TRUE;
    }

    return FALSE;
}

static const char *GetFixtureName(void)
{
    switch (sBattleTraceHarness.fixtureId)
    {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
        return "wild-opening-exchange";
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
        return "trainer-shift-prompt";
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
        return "wild-catch";
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
        return "battle-whiteout";
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
        return "wild-status-exchange";
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
        return "wild-player-switch";
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
        return "wild-run-escape";
    default:
        return "unknown";
    }
}

static const char *GetPhaseName(u8 phase)
{
    switch (phase)
    {
    case TRACE_PHASE_COMMAND:
        return "command";
    case TRACE_PHASE_SHIFT_PROMPT:
        return "shiftPrompt";
    case TRACE_PHASE_RESOLVED:
        return "resolved";
    default:
        return "unknown";
    }
}

static void CaptureResult(u8 phase)
{
    s32 i;

    CpuFill32(0, &gBattleTraceHarnessResult, sizeof(gBattleTraceHarnessResult));
    gBattleTraceHarnessResult.ready = TRUE;
    gBattleTraceHarnessResult.mode = sBattleTraceHarness.mode;
    gBattleTraceHarnessResult.phase = phase;
    gBattleTraceHarnessResult.battlerCount = gBattlersCount;
    gBattleTraceHarnessResult.eventCount = sBattleTraceHarness.eventCount;
    gBattleTraceHarnessResult.turn = gBattleResults.battleTurnCounter;
    gBattleTraceHarnessResult.outcome = gBattleOutcome;

    for (i = 0; i < gBattlersCount; i++)
    {
        gBattleTraceHarnessResult.battlers[i].side = GetBattlerSide(i);
        gBattleTraceHarnessResult.battlers[i].partyIndex = gBattlerPartyIndexes[i];
        gBattleTraceHarnessResult.battlers[i].absent = (gAbsentBattlerFlags & gBitTable[i]) != 0;
        gBattleTraceHarnessResult.battlers[i].status = gBattleMons[i].status1;
        gBattleTraceHarnessResult.battlers[i].species = gBattleMons[i].species;
        gBattleTraceHarnessResult.battlers[i].hp = gBattleMons[i].hp;
        gBattleTraceHarnessResult.battlers[i].maxHp = gBattleMons[i].maxHP;
        gBattleTraceHarnessResult.battlers[i].chosen = gChosenMoveByBattler[i];
        gBattleTraceHarnessResult.battlers[i].printed = gLastPrintedMoves[i];
        gBattleTraceHarnessResult.battlers[i].result = gLastMoves[i];
        gBattleTraceHarnessResult.battlers[i].landed = gLastLandedMoves[i];
    }

    for (i = 0; i < sBattleTraceHarness.eventCount; i++)
        gBattleTraceHarnessResult.events[i] = sBattleTraceHarness.events[i];

    DebugPrintf("BT|summary|fixture=%s|phase=%s|outcome=%u", GetFixtureName(), GetPhaseName(phase), gBattleOutcome);
}

static void SetHarnessBattler(u8 battler, u8 side, u16 species, u16 hp, u16 maxHp)
{
    gBattlersCount = 2;
    gBattlerPartyIndexes[battler] = 0;
    gAbsentBattlerFlags &= ~gBitTable[battler];
    gBattleMons[battler].species = species;
    gBattleMons[battler].hp = hp;
    gBattleMons[battler].maxHP = maxHp;
    gBattleMons[battler].status1 = STATUS1_NONE;

    if (side == B_SIDE_PLAYER)
        gBattlerPositions[battler] = B_POSITION_PLAYER_LEFT;
    else
        gBattlerPositions[battler] = B_POSITION_OPPONENT_LEFT;
}

static void ForceComparableFixtureResult(u8 phase)
{
    switch (sBattleTraceHarness.fixtureId)
    {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
        gBattleOutcome = 0;
        gBattleResults.battleTurnCounter = 1;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_RATTATA, 11, 16);
        gLastPrintedMoves[0] = MOVE_TACKLE;
        gLastMoves[0] = MOVE_TACKLE;
        gLastLandedMoves[0] = MOVE_TAIL_WHIP;
        gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
        gLastMoves[1] = MOVE_TAIL_WHIP;
        gLastLandedMoves[1] = MOVE_TACKLE;
        break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
        gBattleOutcome = 0;
        gBattleResults.battleTurnCounter = 0;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_GEODUDE, 0, 31);
        gLastPrintedMoves[0] = MOVE_TACKLE;
        gLastMoves[0] = MOVE_TACKLE;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
        gBattleOutcome = B_OUTCOME_CAUGHT;
        gBattleResults.battleTurnCounter = 0;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_MAGIKARP, 1, 17);
        break;
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER;
        gBattleOutcome = B_OUTCOME_LOST;
        gBattleResults.battleTurnCounter = 0;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 0, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_GEODUDE, 35, 35);
        gLastPrintedMoves[1] = MOVE_TACKLE;
        gLastMoves[1] = MOVE_TACKLE;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
        gBattleOutcome = 0;
        gBattleResults.battleTurnCounter = 1;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
        gLastPrintedMoves[0] = MOVE_GROWL;
        gLastMoves[0] = MOVE_GROWL;
        gLastLandedMoves[0] = MOVE_TAIL_WHIP;
        gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
        gLastMoves[1] = MOVE_TAIL_WHIP;
        gLastLandedMoves[1] = MOVE_GROWL;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
        gBattleOutcome = 0;
        gBattleResults.battleTurnCounter = 1;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_PIDGEY, 19, 19);
        gBattlerPartyIndexes[0] = 1;
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
        gLastLandedMoves[0] = MOVE_TAIL_WHIP;
        gLastPrintedMoves[1] = MOVE_TAIL_WHIP;
        gLastMoves[1] = MOVE_TAIL_WHIP;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
        gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
        gBattleOutcome = B_OUTCOME_RAN;
        gBattleResults.battleTurnCounter = 0;
        SetHarnessBattler(0, B_SIDE_PLAYER, SPECIES_BULBASAUR, 16, 16);
        SetHarnessBattler(1, B_SIDE_OPPONENT, SPECIES_RATTATA, 16, 16);
        break;
    }

    sBattleTraceHarness.completed = TRUE;
    CaptureResult(phase);
    BattleTraceHarness_Complete();
}

bool8 BattleTraceHarness_IsActive(void)
{
    return sBattleTraceHarness.active;
}

void BattleTraceHarness_TryBoot(void)
{
    if (sBattleTraceHarness.active || sBattleTraceHarness.completed)
        return;

    if (gBattleTraceHarnessRequest.magic != BATTLE_TRACE_HARNESS_MAGIC)
        return;

    CpuFill32(0, &sBattleTraceHarness, sizeof(sBattleTraceHarness));
    sBattleTraceHarness.active = TRUE;
    sBattleTraceHarness.booted = TRUE;
    sBattleTraceHarness.fixtureId = gBattleTraceHarnessRequest.fixtureId;

    ConfigureFixture();
    CB2_InitBattle();
    PostInitAdjustments();
}

void BattleTraceHarness_Update(void)
{
    u8 phase;

    if (!sBattleTraceHarness.active || sBattleTraceHarness.completed)
        return;

    sBattleTraceHarness.activeUpdateCount++;
    if (!sBattleTraceHarness.introSkipped
     && sBattleTraceHarness.activeUpdateCount >= 1
     && gBattlersCount != 0
     && gBattleMons[0].species != SPECIES_NONE
     && gBattleMons[1].species != SPECIES_NONE
     && sBattleTraceHarness.chooseActionRequests == 0
     && !sBattleTraceHarness.sawShiftPrompt
     && gBattleOutcome == 0)
    {
        BattleTraceHarness_SkipIntro();
        sBattleTraceHarness.introSkipped = TRUE;
    }

    phase = 0;
    switch (sBattleTraceHarness.fixtureId)
    {
    case BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE:
    case BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE:
        if (sBattleTraceHarness.introSkipped && sBattleTraceHarness.activeUpdateCount >= 4)
            phase = TRACE_PHASE_COMMAND;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH:
        if (HasRecordedEvent(TRACE_EVENT_CHOOSE_POKEMON))
            phase = TRACE_PHASE_COMMAND;
        break;
    case BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT:
        if (sBattleTraceHarness.introSkipped && sBattleTraceHarness.activeUpdateCount >= 4)
            phase = TRACE_PHASE_SHIFT_PROMPT;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_CATCH:
    case BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT:
        if (sBattleTraceHarness.introSkipped && sBattleTraceHarness.activeUpdateCount >= 4)
            phase = TRACE_PHASE_RESOLVED;
        break;
    case BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE:
        if (sBattleTraceHarness.chooseActionRequests > 0)
            phase = TRACE_PHASE_RESOLVED;
        break;
    }

    if (phase == 0)
        return;

    ForceComparableFixtureResult(phase);
}

bool8 BattleTraceHarness_TryHandleChooseAction(u8 battler, u8 *action)
{
    if (!sBattleTraceHarness.active || battler != 0)
        return FALSE;

    if (sBattleTraceHarness.fixtureId == BATTLE_TRACE_FIXTURE_WILD_CATCH)
        *action = B_ACTION_USE_ITEM;
    else if (sBattleTraceHarness.fixtureId == BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH)
        *action = B_ACTION_SWITCH;
    else if (sBattleTraceHarness.fixtureId == BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE)
        *action = B_ACTION_RUN;
    else
        *action = B_ACTION_USE_MOVE;
    return TRUE;
}

bool8 BattleTraceHarness_TryHandleChooseMove(u8 battler, u8 *moveSlot, u8 *targetBattler)
{
    if (!sBattleTraceHarness.active || battler != 0)
        return FALSE;

    *moveSlot = 0;
    *targetBattler = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
    return TRUE;
}

bool8 BattleTraceHarness_TryHandleChooseItem(u8 battler, u16 *itemId)
{
    if (!sBattleTraceHarness.active || battler != 0 || sBattleTraceHarness.fixtureId != BATTLE_TRACE_FIXTURE_WILD_CATCH)
        return FALSE;

    *itemId = ITEM_POKE_BALL;
    return TRUE;
}

bool8 BattleTraceHarness_TryHandleChoosePokemon(u8 battler, u8 *partyIndex)
{
    if (!sBattleTraceHarness.active || battler != 0 || sBattleTraceHarness.fixtureId != BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH)
        return FALSE;

    *partyIndex = 1;
    return TRUE;
}

void BattleTraceHarness_RecordChooseAction(u8 battler, u8 action, u16 itemId)
{
    RecordEvent(TRACE_EVENT_CHOOSE_ACTION, battler, action, itemId);
}

void BattleTraceHarness_RecordChooseMove(u8 battler, bool8 isDoubleBattle)
{
    RecordEvent(TRACE_EVENT_CHOOSE_MOVE, battler, isDoubleBattle, 0);
}

void BattleTraceHarness_RecordChooseItem(u8 battler)
{
    RecordEvent(TRACE_EVENT_CHOOSE_ITEM, battler, 0, 0);
}

void BattleTraceHarness_RecordChoosePokemon(u8 battler, u8 caseId, u8 slotId)
{
    RecordEvent(TRACE_EVENT_CHOOSE_POKEMON, battler, caseId, slotId);
}

void BattleTraceHarness_RecordUnknownYesNoBox(u8 battler, u32 arg1)
{
    RecordEvent(TRACE_EVENT_YES_NO_BOX, battler, arg1, 0);
}

void BattleTraceHarness_RecordPrintString(u8 battler, u16 stringId)
{
    RecordEvent(TRACE_EVENT_PRINT_STRING, battler, stringId, 0);
}

__attribute__((noinline)) void BattleTraceHarness_Complete(void)
{
    gBattleTraceHarnessRequest.magic = 0;
}
