import { describe, expect, test } from 'vitest';
import {
  ACTIVITY_BATTLE,
  ACTIVITY_CARD,
  ACTIVITY_NONE,
  ACTIVITY_TRADE,
  ArePlayerDataDifferent,
  ArePlayersDifferent,
  CreateTask_ListenForCompatiblePartners,
  CreateTask_SearchForChildOrParent,
  GetActivePartnersInfo,
  GetAwaitingCommunicationText,
  GetGroupListTextColor,
  GetIndexOfNthTradeBoardOffer,
  GetPartyPositionOfRegisteredMon,
  HasAtLeastTwoMonsOfLevel30OrLower,
  InUnionRoom,
  IsPartnerActivityAcceptable,
  IsRequestedTradeInPlayerParty,
  ListMenuHandler_AllItemsAvailable,
  PollPartnerYesNoResponse,
  ReadU16,
  RegisterTradeMonAndGetIsEgg,
  RunUnionRoom,
  ScheduleFieldMessageWithFollowupState,
  Task_ListenForCompatiblePartners,
  Task_RunUnionRoom,
  Task_TryBecomeLinkLeader,
  TradeBoardMenuHandler,
  TryAddIncomingPlayerToList,
  TryBecomeLinkLeader,
  UNION_ROOM_C_TRANSLATION_UNIT,
  UnionRoomHandleYesNo,
  ViewURoomPartnerTrainerCard,
  createUnionRoomRuntime
} from '../src/game/decompUnionRoom';

const alice = { id: 2, name: 'ALICE', trainerId: 22, gender: 1, activity: ACTIVITY_TRADE, group: ACTIVITY_TRADE, species: 25, level: 20 };
const bob = { id: 3, name: 'BOB', trainerId: 33, gender: 0, activity: ACTIVITY_BATTLE, group: ACTIVITY_BATTLE, species: 1, level: 40 };

describe('decompUnionRoomFull', () => {
  test('anchors the exact union_room.c translation unit', () => {
    expect(UNION_ROOM_C_TRANSLATION_UNIT).toBe('src/union_room.c');
  });

  test('leader task initializes wireless state and membership', () => {
    const runtime = createUnionRoomRuntime();
    TryBecomeLinkLeader(runtime);
    const taskId = runtime.tasks.length - 1;
    Task_TryBecomeLinkLeader(taskId, runtime);
    expect(runtime.wirelessActive).toBe(true);
    expect(runtime.groupMembers).toEqual([runtime.player]);
    Task_TryBecomeLinkLeader(taskId, runtime);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.state).toBe(1);
  });

  test('incoming player list helpers compare, add, filter, and expose partners', () => {
    const runtime = createUnionRoomRuntime();
    expect(ArePlayersDifferent(alice, { ...alice }, runtime)).toBe(false);
    expect(ArePlayerDataDifferent(alice, { ...alice, activity: ACTIVITY_CARD }, runtime)).toBe(true);

    const list = [alice];
    expect(TryAddIncomingPlayerToList(list, alice, runtime)).toBe(false);
    expect(TryAddIncomingPlayerToList(list, bob, runtime)).toBe(true);

    const id = CreateTask_SearchForChildOrParent([alice], [bob], ACTIVITY_TRADE, runtime);
    expect(runtime.incoming.map((p) => p.name)).toEqual(['ALICE', 'BOB']);
    Task_RunUnionRoom(id, runtime);
    expect(runtime.candidates.length).toBe(2);

    const listen = CreateTask_ListenForCompatiblePartners(runtime.incoming, ACTIVITY_TRADE, runtime);
    Task_ListenForCompatiblePartners(listen, runtime);
    expect(GetActivePartnersInfo(runtime).map((p) => p.name)).toEqual(['ALICE']);
  });

  test('activity acceptability and list colors follow group compatibility', () => {
    const runtime = createUnionRoomRuntime();
    runtime.linkGroup = ACTIVITY_TRADE;
    expect(IsPartnerActivityAcceptable(ACTIVITY_TRADE, runtime.linkGroup, runtime)).toBe(true);
    expect(IsPartnerActivityAcceptable(ACTIVITY_NONE, runtime.linkGroup, runtime)).toBe(false);
    expect(IsPartnerActivityAcceptable(ACTIVITY_BATTLE, runtime.linkGroup, runtime)).toBe(false);
    expect(GetGroupListTextColor({ players: [alice, bob] }, 0, runtime)).toBe(0);
    expect(GetGroupListTextColor({ players: [alice, bob] }, 1, runtime)).toBe(2);
  });

  test('message, yes-no, and raw-read helpers update runtime state', () => {
    const runtime = createUnionRoomRuntime();
    const dst: string[] = [];
    expect(GetAwaitingCommunicationText(dst, 1, runtime)).toBe('Awaiting response...');
    expect(dst[0]).toBe('Awaiting response...');
    expect(ReadU16([0x34, 0x12], runtime)).toBe(0x1234);

    ScheduleFieldMessageWithFollowupState(7, 'hello', runtime);
    expect(runtime.nextState).toBe(7);
    expect(runtime.messages).toContain('hello');

    runtime.yesNoInput = 1;
    const state = { value: 0 };
    expect(UnionRoomHandleYesNo(state, false, runtime)).toBe(1);
    expect(state.value).toBe(1);
    expect(PollPartnerYesNoResponse(runtime)).toBe(1);
  });

  test('trade-board and list-menu handlers preserve selected list results', () => {
    const runtime = createUnionRoomRuntime();
    runtime.listInput = 3;
    const state = { value: 0 };
    const windowId = { value: 0 };
    const listMenuId = { value: 0 };
    expect(ListMenuHandler_AllItemsAvailable(state, windowId, listMenuId, {}, {}, runtime)).toBe(3);
    expect([state.value, windowId.value, listMenuId.value]).toEqual([3, 1, 1]);

    const header = { value: 0 };
    TradeBoardMenuHandler(state, windowId, listMenuId, header, {}, {}, { players: [alice, bob] }, runtime);
    expect(runtime.tradeBoard.map((p) => p.name)).toEqual(['ALICE', 'BOB']);
    expect(header.value).toBe(2);
    expect(GetIndexOfNthTradeBoardOffer(0, runtime)).toBe(0);
  });

  test('trade registration and requested trade checks match party state', () => {
    const runtime = createUnionRoomRuntime();
    runtime.party = [
      { id: 0, name: 'MON1', trainerId: 1, gender: 0, activity: 0, group: 0, species: 25, level: 20 },
      { id: 1, name: 'EGG', trainerId: 1, gender: 0, activity: 0, group: 0, species: 1, level: 1, isEgg: true }
    ];
    runtime.tradeBoard = [alice];
    runtime.selectedId = 0;
    expect(IsRequestedTradeInPlayerParty(runtime)).toBe(true);
    expect(RegisterTradeMonAndGetIsEgg(1, runtime)).toBe(true);
    expect(GetPartyPositionOfRegisteredMon(runtime)).toBe(1);
    expect(HasAtLeastTwoMonsOfLevel30OrLower(runtime)).toBe(false);
    runtime.party.push({ id: 2, name: 'MON2', trainerId: 1, gender: 0, activity: 0, group: 0, species: 4, level: 10 });
    expect(HasAtLeastTwoMonsOfLevel30OrLower(runtime)).toBe(true);
  });

  test('union room run and trainer card helpers expose room state', () => {
    const runtime = createUnionRoomRuntime();
    RunUnionRoom(runtime);
    expect(InUnionRoom(runtime)).toBe(true);
    runtime.activePartners = [alice];
    ViewURoomPartnerTrainerCard(runtime);
    expect(runtime.trainerCard).toMatchObject({ name: 'ALICE', trainerId: 22 });
  });
});
