#ifndef GUARD_BATTLE_TRACE_HARNESS_H
#define GUARD_BATTLE_TRACE_HARNESS_H

#include "global.h"

#define BATTLE_TRACE_HARNESS_MAGIC 0x42545243

enum BattleTraceHarnessFixtureId
{
    BATTLE_TRACE_FIXTURE_NONE = 0,
    BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE = 1,
    BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT = 2,
    BATTLE_TRACE_FIXTURE_WILD_CATCH = 3,
    BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT = 4,
    BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE = 5,
    BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH = 6,
    BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE = 7,
};

struct BattleTraceHarnessRequest
{
    u32 magic;
    u16 fixtureId;
    u16 reserved;
};

struct BattleTraceHarnessEvent
{
    u8 kind;
    u8 battler;
    u16 value;
    u16 extra;
};

struct BattleTraceHarnessBattlerResult
{
    u8 side;
    u8 partyIndex;
    u8 absent;
    u8 reserved;
    u32 status;
    u16 species;
    u16 hp;
    u16 maxHp;
    u16 chosen;
    u16 printed;
    u16 result;
    u16 landed;
};

struct BattleTraceHarnessResult
{
    u8 ready;
    u8 mode;
    u8 phase;
    u8 battlerCount;
    u8 eventCount;
    u8 reserved[3];
    u16 turn;
    u16 reserved2;
    u32 outcome;
    struct BattleTraceHarnessBattlerResult battlers[4];
    struct BattleTraceHarnessEvent events[64];
};

extern struct BattleTraceHarnessRequest gBattleTraceHarnessRequest;
extern struct BattleTraceHarnessResult gBattleTraceHarnessResult;

bool8 BattleTraceHarness_IsActive(void);
void BattleTraceHarness_TryBoot(void);
void BattleTraceHarness_Update(void);

bool8 BattleTraceHarness_TryHandleChooseAction(u8 battler, u8 *action);
bool8 BattleTraceHarness_TryHandleChooseMove(u8 battler, u8 *moveSlot, u8 *targetBattler);
bool8 BattleTraceHarness_TryHandleChooseItem(u8 battler, u16 *itemId);
bool8 BattleTraceHarness_TryHandleChoosePokemon(u8 battler, u8 *partyIndex);

void BattleTraceHarness_RecordChooseAction(u8 battler, u8 action, u16 itemId);
void BattleTraceHarness_RecordChooseMove(u8 battler, bool8 isDoubleBattle);
void BattleTraceHarness_RecordChooseItem(u8 battler);
void BattleTraceHarness_RecordChoosePokemon(u8 battler, u8 caseId, u8 slotId);
void BattleTraceHarness_RecordUnknownYesNoBox(u8 battler, u32 arg1);
void BattleTraceHarness_RecordPrintString(u8 battler, u16 stringId);

void BattleTraceHarness_Complete(void);

#endif // GUARD_BATTLE_TRACE_HARNESS_H
