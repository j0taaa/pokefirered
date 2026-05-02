import { describe, expect, test } from 'vitest';
import {
  CLI_COPY_RECV,
  CLI_LOAD_GAME_DATA,
  CLI_RECV,
  CLI_RETURN,
  CLI_SAVE_CARD,
  CLI_SAVE_RAM_SCRIPT,
  CLI_SEND_LOADED,
  CLI_SEND_READY_END,
  MG_LINKID_CARD,
  MG_LINKID_CLIENT_SCRIPT,
  MG_LINKID_GAME_DATA,
  MG_LINKID_READY_END,
  SVR_CHECK_EXISTING_CARD,
  SVR_COPY_GAME_DATA,
  SVR_COPY_SAVED_CARD,
  SVR_COPY_SAVED_NEWS,
  SVR_COPY_SAVED_RAM_SCRIPT,
  SVR_GOTO,
  SVR_GOTO_IF_EQ,
  SVR_LOAD_CARD,
  SVR_LOAD_CLIENT_SCRIPT,
  SVR_LOAD_RAM_SCRIPT,
  SVR_RECV,
  SVR_RETURN,
  SVR_SEND,
  gMysteryGiftClientScript_Init,
  gMysteryGiftServerScript_SendWonderCard,
  gMysteryGiftServerScript_SendWonderNews,
  sClientScript_SaveCard,
  sClientScript_SendGameData,
  sServerScript_SendCard,
  sServerScript_TossPrompt
} from '../src/game/decompMysteryGiftScripts';

describe('decompMysteryGiftScripts', () => {
  test('client init and save-card scripts preserve C command order', () => {
    expect(gMysteryGiftClientScript_Init).toEqual([
      { instr: CLI_RECV, parameter: MG_LINKID_CLIENT_SCRIPT },
      { instr: CLI_COPY_RECV }
    ]);
    expect(sClientScript_SendGameData.map((cmd) => cmd.instr)).toEqual([
      CLI_LOAD_GAME_DATA,
      CLI_SEND_LOADED,
      CLI_RECV,
      CLI_COPY_RECV
    ]);
    expect(sClientScript_SaveCard).toMatchObject([
      { instr: CLI_RECV, parameter: MG_LINKID_CARD },
      { instr: CLI_SAVE_CARD },
      { instr: CLI_RECV },
      { instr: CLI_SAVE_RAM_SCRIPT },
      { instr: CLI_SEND_READY_END },
      { instr: CLI_RETURN }
    ]);
  });

  test('server send-card and top-level wonder-card scripts match branch layout', () => {
    expect(sServerScript_SendCard.map((cmd) => cmd.instr)).toEqual([
      SVR_LOAD_CLIENT_SCRIPT,
      SVR_SEND,
      SVR_LOAD_CARD,
      SVR_SEND,
      SVR_LOAD_RAM_SCRIPT,
      SVR_SEND,
      SVR_RECV,
      SVR_RETURN
    ]);
    expect(sServerScript_SendCard[6]).toEqual({ instr: SVR_RECV, param: MG_LINKID_READY_END });

    expect(gMysteryGiftServerScript_SendWonderCard.map((cmd) => cmd.instr)).toEqual([
      SVR_COPY_SAVED_CARD,
      SVR_COPY_SAVED_RAM_SCRIPT,
      SVR_LOAD_CLIENT_SCRIPT,
      SVR_SEND,
      SVR_RECV,
      SVR_COPY_GAME_DATA,
      6,
      SVR_GOTO_IF_EQ,
      SVR_CHECK_EXISTING_CARD,
      SVR_GOTO_IF_EQ,
      SVR_GOTO_IF_EQ,
      SVR_GOTO
    ]);
    expect(gMysteryGiftServerScript_SendWonderCard[4]).toEqual({ instr: SVR_RECV, param: MG_LINKID_GAME_DATA });
    expect(gMysteryGiftServerScript_SendWonderCard.at(-1)).toEqual({
      instr: SVR_GOTO,
      ptr: 'sServerScript_HasCard'
    });
  });

  test('wonder-news and toss-prompt scripts retain their C branch targets', () => {
    expect(gMysteryGiftServerScript_SendWonderNews[0]).toEqual({ instr: SVR_COPY_SAVED_NEWS });
    expect(gMysteryGiftServerScript_SendWonderNews.at(-1)).toEqual({
      instr: SVR_GOTO,
      ptr: 'sServerScript_SendNews'
    });
    expect(sServerScript_TossPrompt.slice(-2)).toEqual([
      { instr: SVR_GOTO_IF_EQ, param: false, ptr: 'sServerScript_SendCard' },
      { instr: SVR_GOTO, ptr: 'gServerScript_ClientCanceledCard' }
    ]);
  });
});
