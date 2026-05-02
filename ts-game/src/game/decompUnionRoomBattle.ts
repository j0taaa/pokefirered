export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const ACTIVITY_ACCEPT = 17;
export const ACTIVITY_DECLINE = 18;
export const IN_UNION_ROOM = 0x40;
export const TRAINER_UNION_ROOM = 0xc00;

export const gText_CommStandbyAwaitingOtherPlayer =
  'Communication standby..\nAwaiting another player to choose.';
export const gText_BattleWasRefused = 'The battle was refused.{PAUSE 0x3C}';
export const gText_RefusedBattle = 'Refused the battle.{PAUSE 0x3C}';

export interface UnionRoomBattleWork {
  textState: number;
}

export interface UnionRoomBattleRuntime {
  work: UnionRoomBattleWork | null;
  mainState: number;
  playerParty: (string | null)[];
  enemyParty: (string | null)[];
  selectedOrderFromParty: number[];
  trainerBattleOpponentA: number;
  battleTypeStarted: number | null;
  gameStats: Record<string, number>;
  playerPartyCount: number;
  mainCallback2: string | null;
  blockSendBuffer: number[];
  blockRecvBuffer: number[][];
  blockReceivedStatus: number;
  multiplayerId: number;
  receivedRemoteLinkPlayers: boolean;
  linkTaskFinished: boolean;
  closeLinkCallbackSet: boolean;
  linkStandbyCallbackSet: boolean;
  paletteFadeActive: boolean;
  windowsInitialized: boolean;
  textPrinterActive: boolean;
  printedTexts: string[];
  sendBlocks: { player: number; data: number[]; size: number }[];
  gpuRegs: Map<string, number>;
  shownBgs: number[];
  perFrameCalls: string[];
}

export const createUnionRoomBattleRuntime = (): UnionRoomBattleRuntime => ({
  work: null,
  mainState: 0,
  playerParty: Array.from({ length: 6 }, (_unused, i) => `mon${i + 1}`),
  enemyParty: Array.from({ length: 6 }, () => null),
  selectedOrderFromParty: [1, 2],
  trainerBattleOpponentA: 0,
  battleTypeStarted: null,
  gameStats: {},
  playerPartyCount: 0,
  mainCallback2: null,
  blockSendBuffer: Array.from({ length: 0x20 }, () => 0),
  blockRecvBuffer: [
    Array.from({ length: 0x20 }, () => 0),
    Array.from({ length: 0x20 }, () => 0)
  ],
  blockReceivedStatus: 0,
  multiplayerId: 0,
  receivedRemoteLinkPlayers: true,
  linkTaskFinished: false,
  closeLinkCallbackSet: false,
  linkStandbyCallbackSet: false,
  paletteFadeActive: false,
  windowsInitialized: true,
  textPrinterActive: false,
  printedTexts: [],
  sendBlocks: [],
  gpuRegs: new Map(),
  shownBgs: [],
  perFrameCalls: []
});

export const setUpPartiesAndStartBattle = (runtime: UnionRoomBattleRuntime): void => {
  runtime.battleTypeStarted = BATTLE_TYPE_LINK | BATTLE_TYPE_TRAINER;
  for (let i = 0; i < 2; i += 1) {
    runtime.enemyParty[i] = runtime.playerParty[runtime.selectedOrderFromParty[i] - 1];
  }
  for (let i = 0; i < 6; i += 1) {
    runtime.playerParty[i] = null;
  }
  for (let i = 0; i < 2; i += 1) {
    runtime.playerParty[i] = runtime.enemyParty[i];
  }
  runtime.gameStats.GAME_STAT_NUM_UNION_ROOM_BATTLES =
    (runtime.gameStats.GAME_STAT_NUM_UNION_ROOM_BATTLES ?? 0) + 1;
  runtime.playerPartyCount = runtime.playerParty.filter((mon) => mon !== null).length;
  runtime.trainerBattleOpponentA = TRAINER_UNION_ROOM;
  runtime.mainCallback2 = 'CB2_InitBattle';
};

export function SetUpPartiesAndStartBattle(runtime: UnionRoomBattleRuntime): void {
  setUpPartiesAndStartBattle(runtime);
}

export const unionRoomBattleCreateTextPrinter = (
  runtime: UnionRoomBattleRuntime,
  windowId: number,
  str: string,
  x: number,
  y: number,
  speed: number
): void => {
  runtime.printedTexts.push(`${windowId}:${x}:${y}:${speed}:${str}`);
  runtime.textPrinterActive = true;
};

export function UnionRoomBattle_CreateTextPrinter(
  runtime: UnionRoomBattleRuntime,
  windowId: number,
  str: string,
  x: number,
  y: number,
  speed: number
): void {
  unionRoomBattleCreateTextPrinter(runtime, windowId, str, x, y, speed);
}

export const unionRoomBattlePrintTextOnWindow0 = (
  runtime: UnionRoomBattleRuntime,
  state: { value: number },
  str: string,
  speed: number
): boolean => {
  switch (state.value) {
    case 0:
      unionRoomBattleCreateTextPrinter(runtime, 0, str, 0, 2, speed);
      state.value += 1;
      break;
    case 1:
      if (!runtime.textPrinterActive) {
        state.value = 0;
        return true;
      }
      break;
  }
  return false;
};

export function UnionRoomBattle_PrintTextOnWindow0(
  runtime: UnionRoomBattleRuntime,
  state: { value: number },
  str: string,
  speed: number
): boolean {
  return unionRoomBattlePrintTextOnWindow0(runtime, state, str, speed);
}

export function VBlankCB_UnionRoomBattle(runtime: UnionRoomBattleRuntime): void {
  runtime.perFrameCalls.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
}

const beginNormalPaletteFade = (runtime: UnionRoomBattleRuntime): void => {
  runtime.paletteFadeActive = true;
};

const updatePaletteFade = (runtime: UnionRoomBattleRuntime): boolean => {
  const active = runtime.paletteFadeActive;
  runtime.paletteFadeActive = false;
  return active;
};

const sendBlock = (
  runtime: UnionRoomBattleRuntime,
  player: number,
  data: number[],
  size: number
): void => {
  runtime.sendBlocks.push({ player, data: data.slice(0, size), size });
};

export const cb2UnionRoomBattle = (runtime: UnionRoomBattleRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      runtime.gpuRegs.set('DISPCNT', 0);
      runtime.work = { textState: 0 };
      if (!runtime.windowsInitialized) {
        return;
      }
      runtime.gpuRegs.set('BG_FILL', 1);
      runtime.mainState += 1;
      break;
    case 1:
      if (
        runtime.work !== null &&
        unionRoomBattlePrintTextOnWindow0(
          runtime,
          {
            get value() {
              return runtime.work?.textState ?? 0;
            },
            set value(next: number) {
              if (runtime.work !== null) {
                runtime.work.textState = next;
              }
            }
          },
          gText_CommStandbyAwaitingOtherPlayer,
          0
        )
      ) {
        runtime.mainState += 1;
      }
      break;
    case 2:
      beginNormalPaletteFade(runtime);
      runtime.shownBgs.push(0);
      runtime.mainState += 1;
      break;
    case 3:
      if (!updatePaletteFade(runtime)) {
        runtime.blockSendBuffer.fill(0, 0, 0x20);
        runtime.blockSendBuffer[0] =
          runtime.selectedOrderFromParty[0] === -runtime.selectedOrderFromParty[1]
            ? ACTIVITY_DECLINE | IN_UNION_ROOM
            : ACTIVITY_ACCEPT | IN_UNION_ROOM;
        sendBlock(runtime, 0, runtime.blockSendBuffer, 0x20);
        runtime.mainState += 1;
      }
      break;
    case 4:
      if (runtime.blockReceivedStatus === 3) {
        if (
          runtime.blockRecvBuffer[0][0] === (ACTIVITY_ACCEPT | IN_UNION_ROOM) &&
          runtime.blockRecvBuffer[1][0] === (ACTIVITY_ACCEPT | IN_UNION_ROOM)
        ) {
          beginNormalPaletteFade(runtime);
          runtime.mainState = 50;
        } else {
          runtime.closeLinkCallbackSet = true;
          if (runtime.blockRecvBuffer[runtime.multiplayerId][0] === (ACTIVITY_DECLINE | IN_UNION_ROOM)) {
            runtime.mainState = 6;
          } else {
            runtime.mainState = 8;
          }
        }
        runtime.blockReceivedStatus = 0;
      }
      break;
    case 50:
      if (!updatePaletteFade(runtime)) {
        runtime.mainState += 1;
      }
      break;
    case 51:
      if (runtime.linkTaskFinished) {
        runtime.linkStandbyCallbackSet = true;
        runtime.mainState += 1;
      }
      break;
    case 52:
      if (runtime.linkTaskFinished) {
        setUpPartiesAndStartBattle(runtime);
      }
      break;
    case 6:
      if (!runtime.receivedRemoteLinkPlayers) {
        runtime.mainState += 1;
      }
      break;
    case 7:
      if (
        runtime.work !== null &&
        unionRoomBattlePrintTextOnWindow0(
          runtime,
          {
            get value() {
              return runtime.work?.textState ?? 0;
            },
            set value(next: number) {
              if (runtime.work !== null) {
                runtime.work.textState = next;
              }
            }
          },
          gText_RefusedBattle,
          1
        )
      ) {
        runtime.mainCallback2 = 'CB2_ReturnToField';
      }
      break;
    case 8:
      if (!runtime.receivedRemoteLinkPlayers) {
        runtime.mainState += 1;
      }
      break;
    case 9:
      if (
        runtime.work !== null &&
        unionRoomBattlePrintTextOnWindow0(
          runtime,
          {
            get value() {
              return runtime.work?.textState ?? 0;
            },
            set value(next: number) {
              if (runtime.work !== null) {
                runtime.work.textState = next;
              }
            }
          },
          gText_BattleWasRefused,
          1
        )
      ) {
        runtime.mainCallback2 = 'CB2_ReturnToField';
      }
      break;
  }
  runtime.perFrameCalls.push('RunTasks', 'RunTextPrinters', 'AnimateSprites', 'BuildOamBuffer');
  updatePaletteFade(runtime);
};

export function CB2_UnionRoomBattle(runtime: UnionRoomBattleRuntime): void {
  cb2UnionRoomBattle(runtime);
}
