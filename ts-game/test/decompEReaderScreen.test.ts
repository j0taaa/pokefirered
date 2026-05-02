import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CLIENT_MAX_MSG_SIZE,
  CreateEReaderTask,
  EReader_Load,
  EReader_Reset,
  EReader_Transfer,
  EREADER_HANDSHAKE,
  ER_STATE_CONNECTING,
  ER_STATE_END,
  ER_STATE_INIT_LINK_WAIT,
  ER_STATE_LINK_ERROR,
  ER_STATE_LOAD_CARD,
  ER_STATE_SAVE,
  ER_STATE_SUCCESS_END,
  ER_STATE_SUCCESS_MSG,
  ER_STATE_TRANSFER,
  ER_STATE_TRANSFER_END,
  ER_STATE_TRANSFER_SUCCESS,
  ER_STATE_TRY_LINK,
  ER_STATE_VALIDATE_CARD,
  ER_STATE_WAIT_DISCONNECT,
  ER_STATE_WAIT_RECV_CARD,
  INTR_FLAG_VCOUNT,
  LINKTYPE_EREADER_FRLG,
  MUS_OBTAIN_ITEM,
  OpenEReaderLink,
  RECV_ACTIVE,
  RECV_CANCELED,
  RECV_DISCONNECTED,
  RECV_ERROR,
  RECV_STATE_EXCHANGE,
  RECV_STATE_INIT,
  RECV_STATE_START,
  RECV_STATE_START_DISCONNECT,
  RECV_STATE_WAIT_DISCONNECT,
  RECV_STATE_WAIT_START,
  RECV_SUCCESS,
  RECV_TIMEOUT,
  SE_DING_DONG,
  SE_SELECT,
  SLAVE_HANDSHAKE,
  TRANSFER_CANCELED,
  TRANSFER_SUCCESS,
  TRANSFER_TIMEOUT,
  Task_EReader,
  TryReceiveCard,
  UpdateTimer,
  ValidateEReaderConnection,
  createEReaderScreenRuntime,
} from '../src/game/decompEReaderScreen';
import {
  EREADER_CANCEL_KEY,
  EREADER_CANCEL_TIMEOUT,
  EREADER_CHECKSUM_OK,
  EREADER_XFR_STATE_DONE,
} from '../src/game/decompEReaderHelpers';

describe('decompEReaderScreen', () => {
  it('EReader_Load and EReader_Reset preserve IME and install/restore helper state', () => {
    const runtime = createEReaderScreenRuntime();
    runtime.REG_IME = 7;
    const data = [1, 2, 3];

    EReader_Load(runtime, runtime.gEReaderData, data.length, data);

    expect(runtime.REG_IME).toBe(7);
    expect(runtime.gIntrTable[1]).toBe('EReaderHelper_SerialCallback');
    expect(runtime.gIntrTable[2]).toBe('EReaderHelper_Timer3Callback');
    expect(runtime.REG_IE & INTR_FLAG_VCOUNT).toBe(INTR_FLAG_VCOUNT);
    expect(runtime.gEReaderData).toEqual({ status: 0, size: 3, data });

    EReader_Reset(runtime, runtime.gEReaderData);
    expect(runtime.REG_IME).toBe(7);
    expect(runtime.operations.at(-1)).toEqual({ op: 'RestoreSerialTimer3IntrHandlers', args: [] });
  });

  it('EReader_Transfer returns success, canceled, or timeout using the same status-bit priority', () => {
    const success = createEReaderScreenRuntime();
    success.helper.mgr.state = EREADER_XFR_STATE_DONE;
    success.helper.mgr.checksumResult = EREADER_CHECKSUM_OK;
    success.gEReaderData.size = 0;
    success.gEReaderData.data = [];
    expect(EReader_Transfer(success, success.gEReaderData)).toBe(TRANSFER_SUCCESS);
    expect(success.gShouldAdvanceLinkState).toBe(0);

    const canceled = createEReaderScreenRuntime();
    canceled.helper.mgr.state = EREADER_XFR_STATE_DONE;
    canceled.helper.mgr.checksumResult = EREADER_CHECKSUM_OK;
    canceled.helper.mgr.cancellationReason = EREADER_CANCEL_KEY;
    expect(EReader_Transfer(canceled, canceled.gEReaderData)).toBe(TRANSFER_CANCELED);

    const timeout = createEReaderScreenRuntime();
    timeout.helper.mgr.state = EREADER_XFR_STATE_DONE;
    timeout.helper.mgr.checksumResult = EREADER_CHECKSUM_OK;
    timeout.helper.mgr.cancellationReason = EREADER_CANCEL_TIMEOUT;
    expect(EReader_Transfer(timeout, timeout.gEReaderData)).toBe(TRANSFER_TIMEOUT);
  });

  it('OpenEReaderLink clears the decompression buffer and configures link type', () => {
    const runtime = createEReaderScreenRuntime();
    runtime.gDecompressionBuffer.fill(0xaa);

    OpenEReaderLink(runtime);

    expect(runtime.gDecompressionBuffer.slice(0, 0x2000).every((value) => value === 0)).toBe(true);
    expect(runtime.gDecompressionBuffer[0x2000]).toBe(0xaa);
    expect(runtime.gLinkType).toBe(LINKTYPE_EREADER_FRLG);
    expect(runtime.operations).toEqual([
      { op: 'OpenLink', args: [] },
      { op: 'SetSuppressLinkErrorMessage', args: [true] },
    ]);
  });

  it('ValidateEReaderConnection matches the four-handshake check exactly', () => {
    const runtime = createEReaderScreenRuntime();
    runtime.REG_IME = 3;
    runtime.gLink.tempRecvBuffer = [SLAVE_HANDSHAKE, EREADER_HANDSHAKE, 0xffff, 0xffff];
    expect(ValidateEReaderConnection(runtime)).toBe(true);
    expect(runtime.REG_IME).toBe(3);

    runtime.gLink.tempRecvBuffer[2] = 0;
    expect(ValidateEReaderConnection(runtime)).toBe(false);
  });

  it('TryReceiveCard handles wait/start/exchange success and cancel paths', () => {
    const runtime = createEReaderScreenRuntime();
    const ref = { state: RECV_STATE_INIT, timer: 0 };

    expect(TryReceiveCard(runtime, ref)).toBe(RECV_ACTIVE);
    expect(ref.state).toBe(RECV_STATE_INIT);

    runtime.isLinkMaster = true;
    runtime.linkPlayerCount = 2;
    expect(TryReceiveCard(runtime, ref)).toBe(RECV_ACTIVE);
    expect(ref.state).toBe(RECV_STATE_WAIT_START);

    for (let i = 0; i < 6; i += 1) TryReceiveCard(runtime, ref);
    expect(ref).toEqual({ state: RECV_STATE_START, timer: 0 });

    expect(TryReceiveCard(runtime, ref)).toBe(RECV_ACTIVE);
    expect(ref.state).toBe(RECV_STATE_EXCHANGE);
    expect(runtime.playedSE).toEqual([SE_DING_DONG]);

    runtime.linkConnectionEstablished = true;
    runtime.gReceivedRemoteLinkPlayers = 1;
    runtime.linkPlayerDataExchangeComplete = true;
    expect(TryReceiveCard(runtime, ref)).toBe(RECV_SUCCESS);
    expect(ref.state).toBe(0);

    const canceled = createEReaderScreenRuntime();
    canceled.newKeys = B_BUTTON;
    const cancelRef = { state: RECV_STATE_INIT, timer: 0 };
    expect(TryReceiveCard(canceled, cancelRef)).toBe(RECV_CANCELED);
  });

  it('TryReceiveCard covers timeout, link error, and disconnect substates', () => {
    const timeout = createEReaderScreenRuntime();
    const timeoutRef = { state: RECV_STATE_EXCHANGE, timer: 30 };
    expect(TryReceiveCard(timeout, timeoutRef)).toBe(RECV_TIMEOUT);
    expect(timeoutRef.state).toBe(0);

    const error = createEReaderScreenRuntime();
    error.linkErrorOccurred = true;
    const errorRef = { state: RECV_STATE_START_DISCONNECT, timer: 0 };
    expect(TryReceiveCard(error, errorRef)).toBe(RECV_ERROR);

    const disconnect = createEReaderScreenRuntime();
    const disconnectRef = { state: RECV_STATE_START_DISCONNECT, timer: 0 };
    expect(TryReceiveCard(disconnect, disconnectRef)).toBe(RECV_ACTIVE);
    expect(disconnectRef.state).toBe(RECV_STATE_WAIT_DISCONNECT);
    expect(disconnect.operations).toEqual([{ op: 'SetCloseLinkCallbackAndType', args: [0] }]);
    expect(TryReceiveCard(disconnect, disconnectRef)).toBe(RECV_DISCONNECTED);
  });

  it('CreateEReaderTask initializes every task data field and allocates the unused buffer', () => {
    const runtime = createEReaderScreenRuntime();
    const taskId = CreateEReaderTask(runtime);

    expect(taskId).toBe(0);
    expect(runtime.tasks[0].priority).toBe(0);
    expect(runtime.tasks[0].data).toMatchObject({
      timer: 0,
      unused1: 0,
      unused2: 0,
      unused3: 0,
      state: 0,
      textState: 0,
      unused4: 0,
      unused5: 0,
      unused6: 0,
      unused7: 0,
      status: 0,
    });
    expect(runtime.tasks[0].data.unusedBuffer).toHaveLength(CLIENT_MAX_MSG_SIZE);
  });

  it('Task_EReader follows connection success into transfer state', () => {
    const runtime = createEReaderScreenRuntime();
    const taskId = CreateEReaderTask(runtime);
    runtime.tasks[taskId].data.state = ER_STATE_TRY_LINK;
    runtime.gLink.tempRecvBuffer = [SLAVE_HANDSHAKE, EREADER_HANDSHAKE, 0xffff, 0xffff];

    Task_EReader(runtime, taskId);

    expect(runtime.playedSE).toEqual([SE_SELECT]);
    expect(runtime.operations).toContainEqual({ op: 'CloseLink', args: [] });
    expect(runtime.tasks[taskId].data.state).toBe(ER_STATE_CONNECTING);

    runtime.multiBootProgram = [1, 2, 3, 4];
    Task_EReader(runtime, taskId);
    expect(runtime.printedMessages.at(-1)).toBe('gJPText_Connecting');
    expect(runtime.gEReaderData.size).toBe(4);
    expect(runtime.tasks[taskId].data.state).toBe(ER_STATE_TRANSFER);
  });

  it('Task_EReader handles transfer-end success, timeout, and canceled branches', () => {
    const success = createEReaderScreenRuntime();
    CreateEReaderTask(success);
    success.tasks[0].data.state = ER_STATE_TRANSFER_END;
    success.tasks[0].data.status = TRANSFER_SUCCESS;
    Task_EReader(success, 0);
    expect(success.tasks[0].data.state).toBe(ER_STATE_TRANSFER_SUCCESS);
    expect(success.printedMessages.at(-1)).toBe('gJPText_PleaseWaitAMoment');

    const timeout = createEReaderScreenRuntime();
    CreateEReaderTask(timeout);
    timeout.tasks[0].data.state = ER_STATE_TRANSFER_END;
    timeout.tasks[0].data.status = TRANSFER_TIMEOUT;
    Task_EReader(timeout, 0);
    expect(timeout.tasks[0].data.state).toBe(ER_STATE_LINK_ERROR);

    const canceled = createEReaderScreenRuntime();
    CreateEReaderTask(canceled);
    canceled.tasks[0].data.state = ER_STATE_TRANSFER_END;
    canceled.tasks[0].data.status = TRANSFER_CANCELED;
    Task_EReader(canceled, 0);
    expect(canceled.tasks[0].data.state).toBe(0);
  });

  it('Task_EReader loads card, receives block, validates, saves, and reaches success end', () => {
    const runtime = createEReaderScreenRuntime();
    const taskId = CreateEReaderTask(runtime);
    const data = runtime.tasks[taskId].data;

    data.state = ER_STATE_LOAD_CARD;
    data.textState = RECV_STATE_EXCHANGE;
    runtime.linkConnectionEstablished = true;
    runtime.gReceivedRemoteLinkPlayers = 1;
    runtime.linkPlayerDataExchangeComplete = true;
    Task_EReader(runtime, taskId);
    expect(data.state).toBe(ER_STATE_WAIT_RECV_CARD);
    expect(runtime.printedMessages.at(-1)).toBe('gJPText_Connecting');

    runtime.blockReceivedStatus = 1;
    Task_EReader(runtime, taskId);
    expect(data.state).toBe(ER_STATE_VALIDATE_CARD);
    expect(runtime.operations).toContainEqual({ op: 'ResetBlockReceivedFlags', args: [] });

    runtime.validateTrainerTowerDataResult = true;
    Task_EReader(runtime, taskId);
    expect(data.status).toBe(1);
    expect(data.state).toBe(ER_STATE_WAIT_DISCONNECT);
    expect(runtime.operations).toContainEqual({ op: 'SetCloseLinkCallbackAndType', args: [1] });

    runtime.gReceivedRemoteLinkPlayers = 0;
    Task_EReader(runtime, taskId);
    expect(data.state).toBe(ER_STATE_SAVE);

    runtime.saveTrainerTowerResult = true;
    Task_EReader(runtime, taskId);
    expect(data.state).toBe(ER_STATE_SUCCESS_MSG);
    expect(runtime.printedMessages.at(-1)).toBe('gJPText_ConnectionComplete');

    data.timer = 120;
    Task_EReader(runtime, taskId);
    expect(data.state).toBe(ER_STATE_SUCCESS_END);
    expect(runtime.printedMessages.at(-1)).toBe('gJPText_NewTrainerHasComeToSevii');
    expect(runtime.fanfares).toEqual([MUS_OBTAIN_ITEM]);
  });

  it('Task_EReader final state enables help, frees buffer, destroys task, and sets title callback', () => {
    const runtime = createEReaderScreenRuntime();
    const taskId = CreateEReaderTask(runtime);
    runtime.tasks[taskId].data.state = ER_STATE_SUCCESS_END;
    runtime.fanfareTaskInactive = true;
    runtime.newKeys = A_BUTTON;
    Task_EReader(runtime, taskId);
    expect(runtime.tasks[taskId].data.state).toBe(ER_STATE_END);

    Task_EReader(runtime, taskId);
    expect(runtime.operations).toContainEqual({ op: 'HelpSystem_Enable', args: [] });
    expect(runtime.tasks[taskId].data.unusedBuffer).toBeNull();
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.mainCallback2).toBe('MainCB_FreeAllBuffersAndReturnToInitTitleScreen');
  });

  it('UpdateTimer increments until strictly greater than the target, then resets', () => {
    const ref = { timer: 0 };
    expect(UpdateTimer(ref, 2)).toBe(false);
    expect(ref.timer).toBe(1);
    expect(UpdateTimer(ref, 2)).toBe(false);
    expect(ref.timer).toBe(2);
    expect(UpdateTimer(ref, 2)).toBe(true);
    expect(ref.timer).toBe(0);
  });

  it('Task_EReader waits in init link delay and then checks the link', () => {
    const runtime = createEReaderScreenRuntime();
    const taskId = CreateEReaderTask(runtime);
    runtime.tasks[taskId].data.state = ER_STATE_INIT_LINK_WAIT;
    runtime.tasks[taskId].data.timer = 10;

    Task_EReader(runtime, taskId);

    expect(runtime.tasks[taskId].data.timer).toBe(0);
    expect(runtime.tasks[taskId].data.state).toBe(3);
  });
});
