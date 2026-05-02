import { describe, expect, it } from 'vitest';
import {
  CLI_COPY_MSG,
  CLI_MSG_BUFFER_FAILURE,
  CLI_RECV,
  CLI_RETURN,
  CLI_SEND_READY_END,
  GENDER_FEMALE,
  GENDER_MALE,
  LINK_GROUP_BERRY_CRUSH,
  LINK_GROUP_DOUBLE_BATTLE,
  LINK_GROUP_SINGLE_BATTLE,
  LINK_GROUP_TRADE,
  LINK_GROUP_WONDER_NEWS,
  MG_LINKID_DYNAMIC_MSG,
  MG_LINKID_READY_END,
  RFU_STATUS_CONNECTION_ERROR,
  RFU_STATUS_FATAL_ERROR,
  RFU_STATUS_JOIN_GROUP_NO,
  RFU_STATUS_LEAVE_GROUP,
  RFU_STATUS_OK,
  SVR_LOAD_CLIENT_SCRIPT,
  SVR_LOAD_MSG,
  SVR_MSG_CLIENT_CANCELED,
  SVR_RECV,
  SVR_RETURN,
  SVR_SEND,
  gServerScript_ClientCanceledCard,
  gText_UR_AwaitingCommunication,
  gText_UR_LinkWithFriendDropped,
  gText_UR_NameWantedOfferLv,
  gText_UR_TradingBoardInfo,
  gTexts_UR_BattleReaction,
  gTexts_UR_CardColor,
  gTexts_UR_ChooseTrainer,
  gTexts_UR_CommunicatingWait,
  gTexts_UR_GladToMeetYou,
  gTexts_UR_LinkDropped,
  gTexts_UR_PlayerDisconnected,
  gTexts_UR_PlayersNeededOrMode,
  gTexts_UR_StartActivity,
  gTexts_UR_WaitOrShowCard,
  sClientScript_DynamicError,
  sText_BattleWillBeStarted,
  sText_CanceledReadingCard,
  sText_DoneWaitingChatFemale,
  sText_MemberNoLongerAvailable,
  sText_PlayerRepliedNo,
  sText_StoppedBeingMember,
} from '../src/game/decompUnionRoomMessage';

describe('decompUnionRoomMessage', () => {
  it('ports standalone text with source control escapes preserved', () => {
    expect(gText_UR_AwaitingCommunication).toBe('{STR_VAR_1}! Awaiting\ncommunication from another player.');
    expect(gText_UR_NameWantedOfferLv).toBe('NAME{CLEAR_TO 0x3C}WANTED{CLEAR_TO 0x6E}OFFER{CLEAR_TO 0xC6}LV.');
    expect(gText_UR_TradingBoardInfo).toContain('This TRADING BOARD is used for\noffering a POKéMON for a trade.\\p');
    expect(gText_UR_TradingBoardInfo).toContain('many, many\\lother TRAINERS.\\p');
    expect(gTexts_UR_CommunicatingWait[0]).toContain('Communicating{PAUSE 15}.');
  });

  it('keeps player-needed/mode table row order and sparse row lengths', () => {
    expect(gTexts_UR_PlayersNeededOrMode).toEqual([
      ['1 player\nneeded.', '2-PLAYER\nMODE'],
      ['3 players\nneeded.', '2 players\nneeded.', '1 player\nneeded.', '4-PLAYER\nMODE'],
      ['1 player\nneeded.', '2-PLAYER\nMODE', '3-PLAYER\nMODE', '4-PLAYER\nMODE', '5-PLAYER\nMODE'],
      ['2 players\nneeded.', '1 player\nneeded.', '3-PLAYER\nMODE', '4-PLAYER\nMODE', '5-PLAYER\nMODE'],
    ]);
  });

  it('preserves RFU status designated arrays with null holes', () => {
    expect(gTexts_UR_PlayerDisconnected[RFU_STATUS_OK]).toBeNull();
    expect(gTexts_UR_PlayerDisconnected[RFU_STATUS_FATAL_ERROR]).toBe(sText_MemberNoLongerAvailable);
    expect(gTexts_UR_PlayerDisconnected[RFU_STATUS_JOIN_GROUP_NO]).toBe(sText_PlayerRepliedNo);
    expect(gTexts_UR_PlayerDisconnected[RFU_STATUS_LEAVE_GROUP]).toBe(sText_StoppedBeingMember);

    expect(gTexts_UR_LinkDropped[RFU_STATUS_CONNECTION_ERROR]).toBe(gText_UR_LinkWithFriendDropped);
    expect(gTexts_UR_LinkDropped[RFU_STATUS_JOIN_GROUP_NO]).toBe('{STR_VAR_1} replied, “No…”');
    expect(gTexts_UR_LinkDropped[RFU_STATUS_LEAVE_GROUP]).toBeNull();
  });

  it('keeps gendered tables and intentional null entries exactly indexed', () => {
    expect(gTexts_UR_WaitOrShowCard[GENDER_MALE][0]).toBe('A battle, huh?\nAll right, just give me some time.');
    expect(gTexts_UR_WaitOrShowCard[GENDER_MALE][2]).toBeNull();
    expect(gTexts_UR_WaitOrShowCard[GENDER_FEMALE][3]).toBe("As my introduction, I'll show you\nmy TRAINER CARD.");

    expect(gTexts_UR_StartActivity[0][GENDER_MALE][0]).toBe(sText_BattleWillBeStarted);
    expect(gTexts_UR_StartActivity[1][GENDER_FEMALE][1]).toBe(sText_DoneWaitingChatFemale);
    expect(gTexts_UR_BattleReaction[GENDER_FEMALE][3]).toBe('You have exquisite timing for\nswitching POKéMON!\\p');
    expect(gTexts_UR_GladToMeetYou[GENDER_FEMALE]).toBe('{DYNAMIC 1}: Glad to meet you!{PAUSE 60}');
  });

  it('preserves link group designated text table indices', () => {
    expect(gTexts_UR_ChooseTrainer[LINK_GROUP_SINGLE_BATTLE]).toBe('Please choose a TRAINER for\na SINGLE BATTLE.');
    expect(gTexts_UR_ChooseTrainer[LINK_GROUP_DOUBLE_BATTLE]).toBe('Please choose a TRAINER for\na DOUBLE BATTLE.');
    expect(gTexts_UR_ChooseTrainer[LINK_GROUP_TRADE]).toBe('Please choose the TRAINER to\ntrade with.');
    expect(gTexts_UR_ChooseTrainer[LINK_GROUP_BERRY_CRUSH]).toBe('BERRY CRUSH!\nPlease choose the LEADER.');
    expect(gTexts_UR_ChooseTrainer[LINK_GROUP_WONDER_NEWS]).toBe('Please choose the TRAINER who is\nsharing WONDER NEWS.');
  });

  it('ports card color text and the Mystery Gift canceled-card scripts', () => {
    expect(gTexts_UR_CardColor).toEqual([
      "It's a NORMAL CARD.",
      "It's a BRONZE CARD!",
      "It's a COPPER CARD!",
      "It's a SILVER CARD!",
      "It's a GOLD CARD!",
    ]);

    expect(sClientScript_DynamicError).toEqual([
      { instr: CLI_RECV, parameter: MG_LINKID_DYNAMIC_MSG },
      { instr: CLI_COPY_MSG, parameter: 0 },
      { instr: CLI_SEND_READY_END, parameter: 0 },
      { instr: CLI_RETURN, parameter: CLI_MSG_BUFFER_FAILURE },
    ]);

    expect(gServerScript_ClientCanceledCard).toEqual([
      { instr: SVR_LOAD_CLIENT_SCRIPT, param: sClientScript_DynamicError.length, ptr: sClientScript_DynamicError },
      { instr: SVR_SEND },
      { instr: SVR_LOAD_MSG, param: sText_CanceledReadingCard.length + 1, ptr: sText_CanceledReadingCard },
      { instr: SVR_SEND },
      { instr: SVR_RECV, param: MG_LINKID_READY_END },
      { instr: SVR_RETURN, param: SVR_MSG_CLIENT_CANCELED },
    ]);
  });
});
