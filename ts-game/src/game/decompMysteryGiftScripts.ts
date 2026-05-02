export const MG_LINKID_CLIENT_SCRIPT = 16;
export const MG_LINKID_GAME_DATA = 17;
export const MG_LINKID_RESPONSE = 19;
export const MG_LINKID_READY_END = 20;
export const MG_LINKID_DYNAMIC_MSG = 21;
export const MG_LINKID_CARD = 22;
export const MG_LINKID_NEWS = 23;
export const MG_LINKID_RAM_SCRIPT = 25;

export const CLI_RETURN = 1;
export const CLI_RECV = 2;
export const CLI_SEND_LOADED = 3;
export const CLI_COPY_RECV = 4;
export const CLI_LOAD_GAME_DATA = 8;
export const CLI_SAVE_NEWS = 9;
export const CLI_SAVE_CARD = 10;
export const CLI_COPY_MSG = 12;
export const CLI_ASK_TOSS = 13;
export const CLI_LOAD_TOSS_RESPONSE = 14;
export const CLI_SAVE_RAM_SCRIPT = 17;
export const CLI_SEND_READY_END = 20;

export const CLI_MSG_NOTHING_SENT = 0;
export const CLI_MSG_CARD_RECEIVED = 2;
export const CLI_MSG_NEWS_RECEIVED = 3;
export const CLI_MSG_HAD_CARD = 5;
export const CLI_MSG_HAD_NEWS = 7;
export const CLI_MSG_COMM_CANCELED = 9;
export const CLI_MSG_CANT_ACCEPT = 10;
export const CLI_MSG_COMM_ERROR = 11;
export const CLI_MSG_BUFFER_SUCCESS = 13;

export const SVR_RETURN = 0;
export const SVR_SEND = 1;
export const SVR_RECV = 2;
export const SVR_GOTO = 3;
export const SVR_GOTO_IF_EQ = 4;
export const SVR_COPY_GAME_DATA = 5;
export const SVR_CHECK_GAME_DATA = 6;
export const SVR_CHECK_EXISTING_CARD = 7;
export const SVR_READ_RESPONSE = 8;
export const SVR_LOAD_CARD = 13;
export const SVR_LOAD_NEWS = 14;
export const SVR_LOAD_RAM_SCRIPT = 15;
export const SVR_LOAD_CLIENT_SCRIPT = 18;
export const SVR_COPY_SAVED_CARD = 26;
export const SVR_COPY_SAVED_NEWS = 27;
export const SVR_COPY_SAVED_RAM_SCRIPT = 28;

export const SVR_MSG_NOTHING_SENT = 0;
export const SVR_MSG_CARD_SENT = 2;
export const SVR_MSG_NEWS_SENT = 3;
export const SVR_MSG_HAS_CARD = 5;
export const SVR_MSG_HAS_NEWS = 7;
export const SVR_MSG_CLIENT_CANCELED = 9;
export const SVR_MSG_CANT_SEND_GIFT_1 = 10;
export const SVR_MSG_COMM_ERROR = 11;

export const HAS_NO_CARD = 0;
export const HAS_DIFF_CARD = 2;

export interface MysteryGiftClientCmd {
  instr: number;
  parameter?: number;
}

export interface MysteryGiftServerCmd {
  instr: number;
  param?: number | boolean;
  ptr?: string;
}

export const TEXT_COLLECTED_ALL_STAMPS =
  'You have collected all STAMPs!\nWant to input a CARD as a prize?';

export const gMysteryGiftClientScript_Init: MysteryGiftClientCmd[] = [
  { instr: CLI_RECV, parameter: MG_LINKID_CLIENT_SCRIPT },
  { instr: CLI_COPY_RECV }
];

export const sClientScript_SendGameData: MysteryGiftClientCmd[] = [
  { instr: CLI_LOAD_GAME_DATA },
  { instr: CLI_SEND_LOADED },
  { instr: CLI_RECV, parameter: MG_LINKID_CLIENT_SCRIPT },
  { instr: CLI_COPY_RECV }
];

export const sClientScript_CantAccept: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_CANT_ACCEPT }
];

export const sClientScript_CommError: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_COMM_ERROR }
];

export const sClientScript_NothingSent: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_NOTHING_SENT }
];

export const sClientScript_SaveCard: MysteryGiftClientCmd[] = [
  { instr: CLI_RECV, parameter: MG_LINKID_CARD },
  { instr: CLI_SAVE_CARD },
  { instr: CLI_RECV, parameter: MG_LINKID_RAM_SCRIPT },
  { instr: CLI_SAVE_RAM_SCRIPT },
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_CARD_RECEIVED }
];

export const sClientScript_SaveNews: MysteryGiftClientCmd[] = [
  { instr: CLI_RECV, parameter: MG_LINKID_NEWS },
  { instr: CLI_SAVE_NEWS },
  { instr: CLI_SEND_LOADED },
  { instr: CLI_RECV, parameter: MG_LINKID_CLIENT_SCRIPT },
  { instr: CLI_COPY_RECV }
];

export const sClientScript_HadNews: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_HAD_NEWS }
];

export const sClientScript_NewsReceived: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_NEWS_RECEIVED }
];

export const sClientScript_AskToss: MysteryGiftClientCmd[] = [
  { instr: CLI_ASK_TOSS },
  { instr: CLI_LOAD_TOSS_RESPONSE },
  { instr: CLI_SEND_LOADED },
  { instr: CLI_RECV, parameter: MG_LINKID_CLIENT_SCRIPT },
  { instr: CLI_COPY_RECV }
];

export const sClientScript_Canceled: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_COMM_CANCELED }
];

export const sClientScript_HadCard: MysteryGiftClientCmd[] = [
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_HAD_CARD }
];

export const sClientScript_DynamicSuccess: MysteryGiftClientCmd[] = [
  { instr: CLI_RECV, parameter: MG_LINKID_DYNAMIC_MSG },
  { instr: CLI_COPY_MSG },
  { instr: CLI_SEND_READY_END },
  { instr: CLI_RETURN, parameter: CLI_MSG_BUFFER_SUCCESS }
];

const ptrArg = (ptr: string, script: readonly unknown[]): MysteryGiftServerCmd => ({
  instr: SVR_LOAD_CLIENT_SCRIPT,
  param: script.length,
  ptr
});

export const sServerScript_CantSend: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_CantAccept', sClientScript_CantAccept),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_CANT_SEND_GIFT_1 }
];

export const sServerScript_CommError: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_CommError', sClientScript_CommError),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_COMM_ERROR }
];

export const sServerScript_ClientCanceledNews: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_Canceled', sClientScript_Canceled),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_CLIENT_CANCELED }
];

export const sServerScript_HasNews: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_HadNews', sClientScript_HadNews),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_HAS_NEWS }
];

export const sServerScript_SendNews: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_SaveNews', sClientScript_SaveNews),
  { instr: SVR_SEND },
  { instr: SVR_LOAD_NEWS },
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_RESPONSE },
  { instr: SVR_READ_RESPONSE },
  { instr: SVR_GOTO_IF_EQ, param: true, ptr: 'sServerScript_HasNews' },
  ptrArg('sClientScript_NewsReceived', sClientScript_NewsReceived),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_NEWS_SENT }
];

export const sServerScript_SendCard: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_SaveCard', sClientScript_SaveCard),
  { instr: SVR_SEND },
  { instr: SVR_LOAD_CARD },
  { instr: SVR_SEND },
  { instr: SVR_LOAD_RAM_SCRIPT },
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_CARD_SENT }
];

export const sServerScript_TossPrompt: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_AskToss', sClientScript_AskToss),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_RESPONSE },
  { instr: SVR_READ_RESPONSE },
  { instr: SVR_GOTO_IF_EQ, param: false, ptr: 'sServerScript_SendCard' },
  { instr: SVR_GOTO, ptr: 'gServerScript_ClientCanceledCard' }
];

export const sServerScript_HasCard: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_HadCard', sClientScript_HadCard),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_HAS_CARD }
];

export const sServerScript_NothingSent: MysteryGiftServerCmd[] = [
  ptrArg('sClientScript_NothingSent', sClientScript_NothingSent),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_NOTHING_SENT }
];

export const gMysteryGiftServerScript_SendWonderNews: MysteryGiftServerCmd[] = [
  { instr: SVR_COPY_SAVED_NEWS },
  ptrArg('sClientScript_SendGameData', sClientScript_SendGameData),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_GAME_DATA },
  { instr: SVR_COPY_GAME_DATA },
  { instr: SVR_CHECK_GAME_DATA },
  { instr: SVR_GOTO_IF_EQ, param: false, ptr: 'sServerScript_CantSend' },
  { instr: SVR_GOTO, ptr: 'sServerScript_SendNews' }
];

export const gMysteryGiftServerScript_SendWonderCard: MysteryGiftServerCmd[] = [
  { instr: SVR_COPY_SAVED_CARD },
  { instr: SVR_COPY_SAVED_RAM_SCRIPT },
  ptrArg('sClientScript_SendGameData', sClientScript_SendGameData),
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_GAME_DATA },
  { instr: SVR_COPY_GAME_DATA },
  { instr: SVR_CHECK_GAME_DATA },
  { instr: SVR_GOTO_IF_EQ, param: false, ptr: 'sServerScript_CantSend' },
  { instr: SVR_CHECK_EXISTING_CARD },
  { instr: SVR_GOTO_IF_EQ, param: HAS_DIFF_CARD, ptr: 'sServerScript_TossPrompt' },
  { instr: SVR_GOTO_IF_EQ, param: HAS_NO_CARD, ptr: 'sServerScript_SendCard' },
  { instr: SVR_GOTO, ptr: 'sServerScript_HasCard' }
];
