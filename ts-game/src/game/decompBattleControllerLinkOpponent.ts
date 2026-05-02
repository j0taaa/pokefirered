import * as Partner from './decompBattleControllerLinkPartner';

export * from './decompBattleControllerLinkPartner';

export const POKEBALL_OPPONENT_SENDOUT = 'POKEBALL_OPPONENT_SENDOUT';
export const B_ANIM_SWITCH_OUT_OPPONENT_MON = 'B_ANIM_SWITCH_OUT_OPPONENT_MON';
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_OUTCOME_DREW = 3;
export const TRAINER_UNION_ROOM = 0x400;
export const FACILITY_CLASS_PKMN_TRAINER_MAY = 1;
export const FACILITY_CLASS_PKMN_TRAINER_BRENDAN = 2;
export const FACILITY_CLASS_LEAF = 3;
export const FACILITY_CLASS_RED = 4;
export const MALE = 0;

export type LinkOpponentControllerFunc =
  | 'LinkOpponentBufferRunCommand'
  | 'LinkOpponentDummy'
  | 'CompleteOnBattlerSpriteCallbackDummy'
  | 'FreeTrainerSpriteAfterSlide'
  | 'Intro_DelayAndEnd'
  | 'Intro_WaitForShinyAnimAndHealthbox'
  | 'Intro_TryShinyAnimShowHealthbox'
  | 'TryShinyAnimAfterMonAnim'
  | 'CompleteOnHealthbarDone'
  | 'CompleteOnFinishedStatusAnimation'
  | 'CompleteOnFinishedBattleAnimation'
  | 'HideHealthboxAfterMonFaint'
  | 'DoSwitchOutAnimation'
  | 'FreeMonSpriteAfterSwitchOutAnim'
  | 'CompleteOnInactiveTextPrinter'
  | 'DoHitAnimBlinkSpriteEffect'
  | 'SwitchIn_ShowSubstitute'
  | 'SwitchIn_HandleSoundAndEnd'
  | 'SwitchIn_ShowHealthbox'
  | 'SwitchIn_TryShinyAnim'
  | 'LinkOpponentDoMoveAnimation'
  | 'EndDrawPartyStatusSummary'
  | 'SetBattleEndCallbacks';

export interface LinkOpponentRuntime extends Omit<Partner.LinkPartnerRuntime, 'gBattlerControllerFuncs'> {
  gBattlerControllerFuncs: LinkOpponentControllerFunc[];
  gEnemyParty: Partner.LinkPartnerMon[];
  gTrainerBattleOpponent_A: number;
  gFacilityClassToPicIndex: Record<number, number>;
  gTrainerFrontPicCoords: Record<number, { size: number }>;
  gTrainerFrontPicPaletteTable: Record<number, { tag: number }>;
  gTrainerFrontPicTable: Record<number, { tag: number }>;
  unionRoomTrainerPic: number;
}

const asPartnerRuntime = (runtime: LinkOpponentRuntime): Partner.LinkPartnerRuntime =>
  runtime as unknown as Partner.LinkPartnerRuntime;

const withEnemyParty = <T>(runtime: LinkOpponentRuntime, fn: () => T): T => {
  const partnerRuntime = asPartnerRuntime(runtime);
  const savedParty = partnerRuntime.gPlayerParty;
  partnerRuntime.gPlayerParty = runtime.gEnemyParty;
  try {
    return fn();
  } finally {
    partnerRuntime.gPlayerParty = savedParty;
  }
};

const renamePartnerFunc = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const map: Partial<Record<Partner.LinkPartnerControllerFunc, LinkOpponentControllerFunc>> = {
    LinkPartnerBufferRunCommand: 'LinkOpponentBufferRunCommand',
    LinkPartnerDummy: 'LinkOpponentDummy',
    WaitForMonAnimAfterLoad: 'TryShinyAnimAfterMonAnim',
    SwitchIn_WaitAndEnd: 'SwitchIn_HandleSoundAndEnd',
    LinkPartnerDoMoveAnimation: 'LinkOpponentDoMoveAnimation'
  };
  const current = runtime.gBattlerControllerFuncs[b] as unknown as Partner.LinkPartnerControllerFunc;
  runtime.gBattlerControllerFuncs[b] = map[current] ?? (current as unknown as LinkOpponentControllerFunc);
};

export const createLinkOpponentRuntime = (overrides: Partial<LinkOpponentRuntime> = {}): LinkOpponentRuntime => {
  const base = Partner.createLinkPartnerRuntime({
    gActiveBattler: 1,
    gBattleControllerExecFlags: 2,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'LinkOpponentBufferRunCommand' as Partner.LinkPartnerControllerFunc)
  });
  return {
    ...base,
    gBattlerControllerFuncs: Array.from({ length: 4 }, () => 'LinkOpponentBufferRunCommand'),
    gEnemyParty: Array.from({ length: 6 }, (_, i) => Partner.createLinkPartnerMon({ species: i + 101, nickname: `ENEMY${i + 1}` })),
    gTrainerBattleOpponent_A: 0,
    gFacilityClassToPicIndex: {
      [FACILITY_CLASS_PKMN_TRAINER_MAY]: 201,
      [FACILITY_CLASS_PKMN_TRAINER_BRENDAN]: 202,
      [FACILITY_CLASS_LEAF]: 203,
      [FACILITY_CLASS_RED]: 204
    },
    gTrainerFrontPicCoords: {},
    gTrainerFrontPicPaletteTable: {},
    gTrainerFrontPicTable: {},
    unionRoomTrainerPic: 250,
    ...overrides
  };
};

const u16 = (lo: number, hi: number): number => lo | (hi << 8);
const u32 = (b0: number, b1: number, b2: number, b3: number): number => (b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0;

const complete = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerControllerFuncs[b] = 'LinkOpponentBufferRunCommand';
  if (runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_LINK) {
    runtime.emittedTransfers.push({ buffer: 'link', size: 4, data: [runtime.multiplayerId & 0xff] });
    runtime.gBattleBufferA[b][0] = Partner.CONTROLLER_TERMINATOR_NOP;
  } else {
    runtime.gBattleControllerExecFlags &= ~runtime.gBitTable[b];
  }
};

const createTask = (runtime: LinkOpponentRuntime, func: string, priority: number): number => {
  const id = runtime.gTasks.length;
  runtime.gTasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${func}:${priority}:${id}`);
  return id;
};

const destroySprite = (runtime: LinkOpponentRuntime, id: number): void => {
  runtime.gSprites[id].callback = 'Destroyed';
  runtime.operations.push(`DestroySprite:${id}`);
};

export const CopyLinkOpponentMonData = (runtime: LinkOpponentRuntime, monId: number): number[] =>
  withEnemyParty(runtime, () => Partner.CopyLinkPartnerMonData(asPartnerRuntime(runtime), monId));

export const SetLinkOpponentMonData = (runtime: LinkOpponentRuntime, monId: number): void =>
  withEnemyParty(runtime, () => Partner.SetLinkPartnerMonData(asPartnerRuntime(runtime), monId));

export const LinkOpponentBufferExecCompleted = complete;

export const LinkOpponentDummy = (_runtime: LinkOpponentRuntime): void => {};

export const SetControllerToLinkOpponent = (runtime: LinkOpponentRuntime): void => {
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'LinkOpponentBufferRunCommand';
};

export const LinkOpponentBufferRunCommand = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleControllerExecFlags & runtime.gBitTable[b]) {
    const handler = sLinkOpponentBufferCommands[runtime.gBattleBufferA[b][0]];
    if (handler) handler(runtime);
    else complete(runtime);
  }
};

export const CompleteOnBattlerSpriteCallbackDummy = (runtime: LinkOpponentRuntime): void => {
  if (runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]].callback === 'SpriteCallbackDummy') complete(runtime);
};

export const FreeTrainerSpriteAfterSlide = (runtime: LinkOpponentRuntime): void => {
  const id = runtime.gBattlerSpriteIds[runtime.gActiveBattler];
  if (runtime.gSprites[id].callback === 'SpriteCallbackDummy') {
    runtime.operations.push(`FreeTrainerFrontPicPaletteAndTile:${runtime.gSprites[id].oam.matrixNum}`, `RestoreTrainerFrontTile:${id}:${runtime.gSprites[id].data[5]}`, `FreeSpriteOamMatrix:${id}`);
    destroySprite(runtime, id);
    complete(runtime);
  }
};

export const Intro_DelayAndEnd = (runtime: LinkOpponentRuntime): void => {
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler];
  hb.introEndDelay = (hb.introEndDelay - 1) & 0xff;
  if (hb.introEndDelay === 0xff) {
    hb.introEndDelay = 0;
    complete(runtime);
  }
};

export const Intro_WaitForShinyAnimAndHealthbox = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const partner = b ^ Partner.BIT_FLANK;
  let done = false;
  if (!runtime.isDoubleBattle || (runtime.isDoubleBattle && (runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI))) done = runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy';
  else done = runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy' && runtime.gSprites[runtime.gHealthboxSpriteIds[partner]].callback === runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback;
  if (runtime.cryPlaying) done = false;
  if (!done) return;
  if (b === B_POSITION_OPPONENT_LEFT) {
    if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].finishedShinyMonAnim || !runtime.gBattleSpritesDataPtr.healthBoxesData[partner].finishedShinyMonAnim) return;
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].triedShinyMonAnim = false;
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].finishedShinyMonAnim = false;
    runtime.gBattleSpritesDataPtr.healthBoxesData[partner].triedShinyMonAnim = false;
    runtime.gBattleSpritesDataPtr.healthBoxesData[partner].finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
  }
  runtime.operations.push(runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI ? 'm4aMPlayContinue:gMPlayInfo_BGM' : 'm4aMPlayVolumeControl:gMPlayInfo_BGM:TRACKS_ALL:256');
  runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay = 3;
  runtime.gBattlerControllerFuncs[b] = 'Intro_DelayAndEnd';
};

export const Intro_TryShinyAnimShowHealthbox = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const partner = b ^ Partner.BIT_FLANK;
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].ballAnimActive || runtime.gBattleSpritesDataPtr.healthBoxesData[partner].ballAnimActive) return;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].triedShinyMonAnim) runtime.operations.push(`TryShinyAnimation:${b}`);
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[partner].triedShinyMonAnim) runtime.operations.push(`TryShinyAnimation:${partner}`);
  if ((runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI) && b === 3) {
    if (++runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay === 1) return;
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].introEndDelay = 0;
  }
  if (runtime.isDoubleBattle && !(runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI)) {
    destroySprite(runtime, runtime.gBattleControllerData[partner]);
    runtime.operations.push(`UpdateHealthboxAttribute:${partner}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${partner}`, `SetHealthboxSpriteVisible:${partner}`, `SetBattlerShadowSpriteCallback:${partner}:${runtime.gEnemyParty[runtime.gBattlerPartyIndexes[partner]].species}`);
  }
  destroySprite(runtime, runtime.gBattleControllerData[b]);
  runtime.operations.push(`UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`, `SetBattlerShadowSpriteCallback:${b}:${runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]].species}`);
  runtime.gBattleSpritesDataPtr.animationData.introAnimActive = false;
  runtime.gBattlerControllerFuncs[b] = 'Intro_WaitForShinyAnimAndHealthbox';
};

export const TryShinyAnimAfterMonAnim = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (!sprite.animEnded || sprite.x2 !== 0) return;
  if (!hb.triedShinyMonAnim) runtime.operations.push(`TryShinyAnimation:${b}`);
  else if (hb.finishedShinyMonAnim) {
    hb.triedShinyMonAnim = false;
    hb.finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS');
    complete(runtime);
  }
};

export const CompleteOnHealthbarDone = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hp = runtime.moveBattleBarResults.shift() ?? -1;
  runtime.operations.push(`MoveBattleBar:${b}`, `SetHealthboxSpriteVisible:${b}`);
  if (hp !== -1) runtime.operations.push(`UpdateHpTextInHealthbox:${b}:${hp}:${Partner.HP_CURRENT}`);
  else complete(runtime);
};

export const HideHealthboxAfterMonFaint = (runtime: LinkOpponentRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]] as Partner.LinkPartnerSprite & { inUse?: boolean };
  if (sprite.inUse === false || sprite.callback === 'Destroyed') {
    runtime.operations.push(`SetHealthboxSpriteInvisible:${runtime.gActiveBattler}`);
    complete(runtime);
  }
};

export const FreeMonSpriteAfterSwitchOutAnim = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[b].specialAnimActive) {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`HideBattlerShadowSprite:${b}`, `SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

export const DoSwitchOutAnimation = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.animationState === 0) {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_SUBSTITUTE_TO_MON}`);
    hb.animationState = 1;
  } else if (!hb.specialAnimActive) {
    hb.animationState = 0;
    runtime.operations.push(`InitAndLaunchSpecialAnimation:${B_ANIM_SWITCH_OUT_OPPONENT_MON}`);
    runtime.gBattlerControllerFuncs[b] = 'FreeMonSpriteAfterSwitchOutAnim';
  }
};

export const CompleteOnInactiveTextPrinter = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.textPrinterActive) complete(runtime);
};

export const DoHitAnimBlinkSpriteEffect = (runtime: LinkOpponentRuntime): void => {
  Partner.DoHitAnimBlinkSpriteEffect(asPartnerRuntime(runtime));
  renamePartnerFunc(runtime);
};

export const SwitchIn_ShowSubstitute = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gSprites[runtime.gHealthboxSpriteIds[b]].callback === 'SpriteCallbackDummy') {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_MON_TO_SUBSTITUTE}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_HandleSoundAndEnd';
  }
};

export const SwitchIn_HandleSoundAndEnd = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].specialAnimActive && !runtime.cryPlaying) {
    runtime.operations.push('m4aMPlayVolumeControl:gMPlayInfo_BGM:TRACKS_ALL:256');
    complete(runtime);
  }
};

export const SwitchIn_ShowHealthbox = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.finishedShinyMonAnim) {
    hb.triedShinyMonAnim = false;
    hb.finishedShinyMonAnim = false;
    runtime.operations.push('FreeSpriteTilesByTag:ANIM_TAG_GOLD_STARS', 'FreeSpritePaletteByTag:ANIM_TAG_GOLD_STARS', `StartSpriteAnim:${runtime.gBattlerSpriteIds[b]}:0`, `UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_ALL}`, `StartHealthboxSlideIn:${b}`, `SetHealthboxSpriteVisible:${b}`, `CopyBattleSpriteInvisibility:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_ShowSubstitute';
  }
};

export const SwitchIn_TryShinyAnim = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (!hb.ballAnimActive && !hb.triedShinyMonAnim) runtime.operations.push(`TryShinyAnimation:${b}`);
  if (runtime.gSprites[runtime.gBattleControllerData[b]].callback === 'SpriteCallbackDummy' && !hb.ballAnimActive) {
    destroySprite(runtime, runtime.gBattleControllerData[b]);
    runtime.operations.push(`SetBattlerShadowSpriteCallback:${b}:${runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]].species}`);
    runtime.gBattlerControllerFuncs[b] = 'SwitchIn_ShowHealthbox';
  }
};

export const LinkOpponentHandleGetMonData = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const data: number[] = [];
  if (runtime.gBattleBufferA[b][2] === 0) data.push(...CopyLinkOpponentMonData(runtime, runtime.gBattlerPartyIndexes[b]));
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) data.push(...CopyLinkOpponentMonData(runtime, i));
      mask >>= 1;
    }
  }
  runtime.emittedTransfers.push({ buffer: 'B', size: data.length, data });
  complete(runtime);
};

export const LinkOpponentHandleSetMonData = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][2] === 0) SetLinkOpponentMonData(runtime, runtime.gBattlerPartyIndexes[b]);
  else {
    let mask = runtime.gBattleBufferA[b][2];
    for (let i = 0; i < 6; i++) {
      if (mask & 1) SetLinkOpponentMonData(runtime, i);
      mask >>= 1;
    }
  }
  complete(runtime);
};

export const LinkOpponentHandleSetRawMonData = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const mon = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]];
  for (let i = 0; i < runtime.gBattleBufferA[b][2]; i++) mon.raw[runtime.gBattleBufferA[b][1] + i] = runtime.gBattleBufferA[b][3 + i];
  complete(runtime);
};

export const StartSendOutAnim = (runtime: LinkOpponentRuntime, battlerId: number, dontClearSubstituteBit: number): void => {
  const species = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[battlerId]].species;
  runtime.operations.push(`ClearTemporarySpeciesSpriteData:${battlerId}:${dontClearSubstituteBit}`, `CreateInvisibleSpriteWithCallback:${battlerId}`, `BattleLoadOpponentMonSpriteGfx:${battlerId}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${battlerId}`);
  const controllerSpriteId = runtime.gBattleControllerData[battlerId];
  const monSpriteId = runtime.gBattlerSpriteIds[battlerId];
  runtime.gSprites[controllerSpriteId].callback = 'SpriteCB_WaitForBattlerBallReleaseAnim';
  runtime.gSprites[controllerSpriteId].data[1] = monSpriteId;
  runtime.gSprites[monSpriteId] = { ...runtime.gSprites[monSpriteId], x: 160 - battlerId * 16, y: 64, data: Array.from({ length: 8 }, () => 0), invisible: true, callback: 'SpriteCallbackDummy' };
  runtime.gSprites[monSpriteId].data[0] = battlerId;
  runtime.gSprites[monSpriteId].data[2] = species;
  runtime.gSprites[monSpriteId].oam.paletteNum = battlerId;
  runtime.gSprites[monSpriteId].anim = runtime.gBattleMonForms[battlerId];
  runtime.gSprites[controllerSpriteId].data[0] = 1;
  runtime.operations.push(`DoPokeballSendOutAnimation:0:${POKEBALL_OPPONENT_SENDOUT}`);
};

export const LinkOpponentHandleLoadMonSprite = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const species = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]].species;
  runtime.operations.push(`BattleLoadOpponentMonSpriteGfx:${b}`, `SetMultiuseSpriteTemplateToPokemon:${species}:${b}`);
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].x2 = -Partner.DISPLAY_WIDTH;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[0] = b;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].oam.paletteNum = b;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].anim = runtime.gBattleMonForms[b];
  runtime.operations.push(`SetBattlerShadowSpriteCallback:${b}:${species}`);
  runtime.gBattlerControllerFuncs[b] = 'TryShinyAnimAfterMonAnim';
};

export const LinkOpponentHandleSwitchInAnim = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattlerPartyIndexes[b] = runtime.gBattleBufferA[b][1];
  StartSendOutAnim(runtime, b, runtime.gBattleBufferA[b][2]);
  runtime.gBattlerControllerFuncs[b] = 'SwitchIn_TryShinyAnim';
};

export const LinkOpponentHandleReturnMonToBall = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] === 0) {
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].animationState = 0;
    runtime.gBattlerControllerFuncs[b] = 'DoSwitchOutAnimation';
  } else {
    runtime.operations.push(`FreeSpriteOamMatrix:${runtime.gBattlerSpriteIds[b]}`);
    destroySprite(runtime, runtime.gBattlerSpriteIds[b]);
    runtime.operations.push(`HideBattlerShadowSprite:${b}`, `SetHealthboxSpriteInvisible:${b}`);
    complete(runtime);
  }
};

const opponentTrainerPicId = (runtime: LinkOpponentRuntime): number => {
  const b = runtime.gActiveBattler;
  const linkIndex = runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI ? b : runtime.multiplayerId ^ 2;
  const link = runtime.gLinkPlayers[linkIndex] ?? runtime.gLinkPlayers[0];
  const version = link.version & 0xff;
  if (!(runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI) && runtime.gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) return runtime.unionRoomTrainerPic;
  if (version === Partner.VERSION_RUBY || version === Partner.VERSION_SAPPHIRE || version === Partner.VERSION_EMERALD) return link.gender !== MALE ? runtime.gFacilityClassToPicIndex[FACILITY_CLASS_PKMN_TRAINER_MAY] : runtime.gFacilityClassToPicIndex[FACILITY_CLASS_PKMN_TRAINER_BRENDAN];
  return link.gender !== MALE ? runtime.gFacilityClassToPicIndex[FACILITY_CLASS_LEAF] : runtime.gFacilityClassToPicIndex[FACILITY_CLASS_RED];
};

export const LinkOpponentHandleDrawTrainerPic = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  let x = 176;
  if (runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI) x = (b & Partner.BIT_FLANK) !== 0 ? 152 : 200;
  const trainerPicId = opponentTrainerPicId(runtime);
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  sprite.x = x;
  sprite.y = (8 - (runtime.gTrainerFrontPicCoords[trainerPicId]?.size ?? 8)) * 4 + 40;
  sprite.x2 = -Partner.DISPLAY_WIDTH;
  sprite.data[0] = 2;
  sprite.data[5] = sprite.oam.matrixNum;
  sprite.oam.paletteNum = runtime.gTrainerFrontPicPaletteTable[trainerPicId]?.tag ?? trainerPicId;
  sprite.oam.matrixNum = trainerPicId;
  sprite.callback = 'SpriteCB_TrainerSlideIn';
  runtime.operations.push(`DecompressTrainerFrontPic:${trainerPicId}:${b}`, `SetMultiuseSpriteTemplateToTrainerBack:${trainerPicId}:${b}`, `GetSpriteTileStartByTag:${runtime.gTrainerFrontPicTable[trainerPicId]?.tag ?? trainerPicId}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnBattlerSpriteCallbackDummy';
};

export const LinkOpponentHandleTrainerSlideBack = (runtime: LinkOpponentRuntime): void => {
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[runtime.gActiveBattler]];
  sprite.data[0] = 35;
  sprite.data[2] = 280;
  sprite.data[4] = sprite.y;
  sprite.callback = 'StartAnimLinearTranslation';
  runtime.operations.push(`StoreSpriteCallbackInData6:${sprite.id}:SpriteCallbackDummy`);
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'FreeTrainerSpriteAfterSlide';
};

export const LinkOpponentHandleFaintAnimation = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b];
  if (hb.animationState === 0) {
    if (runtime.gBattleSpritesDataPtr.battlerData[b].behindSubstitute) runtime.operations.push(`InitAndLaunchSpecialAnimation:${Partner.B_ANIM_SUBSTITUTE_TO_MON}`);
    hb.animationState++;
  } else if (!hb.specialAnimActive) {
    hb.animationState = 0;
    runtime.sounds.push({ kind: 'SE_PAN', id: Partner.SE_FAINT, pan: Partner.SOUND_PAN_TARGET });
    runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'SpriteCB_FaintOpponentMon';
    runtime.gBattlerControllerFuncs[b] = 'HideHealthboxAfterMonFaint';
  }
};

export const LinkOpponentHandleMoveAnimation = (runtime: LinkOpponentRuntime): void => {
  Partner.LinkPartnerHandleMoveAnimation(asPartnerRuntime(runtime));
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'LinkOpponentDoMoveAnimation';
};

export const LinkOpponentDoMoveAnimation = (runtime: LinkOpponentRuntime): void => {
  Partner.LinkPartnerDoMoveAnimation(asPartnerRuntime(runtime));
  renamePartnerFunc(runtime);
};

export const LinkOpponentHandlePrintString = (runtime: LinkOpponentRuntime): void => {
  Partner.LinkPartnerHandlePrintString(asPartnerRuntime(runtime));
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'CompleteOnInactiveTextPrinter';
};

export const LinkOpponentHandleHealthBarUpdate = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const hpVal = u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3]);
  const mon = runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]];
  runtime.operations.push('LoadBattleBarGfx:0', `SetBattleBarStruct:${b}:${mon.maxHP}:${hpVal !== Partner.INSTANT_HP_BAR_DROP ? mon.hp : 0}:${hpVal}`);
  runtime.gBattlerControllerFuncs[b] = 'CompleteOnHealthbarDone';
};

export const LinkOpponentHandleStatusIconUpdate = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`UpdateHealthboxAttribute:${b}:${Partner.HEALTHBOX_STATUS_ICON}`);
    runtime.gBattleSpritesDataPtr.healthBoxesData[b].statusAnimActive = false;
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};

export const LinkOpponentHandleStatusAnimation = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`InitAndLaunchChosenStatusAnimation:${runtime.gBattleBufferA[b][1]}:${u32(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3], runtime.gBattleBufferA[b][4], runtime.gBattleBufferA[b][5])}`);
    runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedStatusAnimation';
  }
};

export const CompleteOnFinishedStatusAnimation = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].statusAnimActive) complete(runtime);
};

export const CompleteOnFinishedBattleAnimation = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler].animFromTableActive) complete(runtime);
};

export const LinkOpponentHandleGetRawMonData = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleTrainerSlide = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandlePaletteFade = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleSuccessBallThrowAnim = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleBallThrowAnim = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandlePause = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandlePrintSelectionString = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleChooseAction = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleUnknownYesNoBox = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleChooseMove = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleChooseItem = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleChoosePokemon = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleCmd23 = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleExpUpdate = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleStatusXor = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleDataTransfer = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleDMA3Transfer = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandlePlayBGM = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleCmd32 = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleTwoReturnValues = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleChosenMonReturnValue = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleOneReturnValue = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleOneReturnValue_Duplicate = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleCantSwitch = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleEndBounceEffect = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleLinkStandbyMsg = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentHandleResetActionMoveSelection = (runtime: LinkOpponentRuntime): void => complete(runtime);
export const LinkOpponentCmdEnd = (_runtime: LinkOpponentRuntime): void => {};

export const LinkOpponentHandleClearUnkVar = (runtime: LinkOpponentRuntime): void => {
  runtime.gUnusedControllerStruct.unk = 0;
  complete(runtime);
};
export const LinkOpponentHandleSetUnkVar = (runtime: LinkOpponentRuntime): void => {
  runtime.gUnusedControllerStruct.unk = runtime.gBattleBufferA[runtime.gActiveBattler][1];
  complete(runtime);
};
export const LinkOpponentHandleClearUnkFlag = (runtime: LinkOpponentRuntime): void => {
  runtime.gUnusedControllerStruct.flag = 0;
  complete(runtime);
};
export const LinkOpponentHandleToggleUnkFlag = (runtime: LinkOpponentRuntime): void => {
  runtime.gUnusedControllerStruct.flag ^= 1;
  complete(runtime);
};

export const LinkOpponentHandleHitAnimation = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (sprite.invisible) complete(runtime);
  else {
    runtime.gDoingBattleAnim = true;
    sprite.data[1] = 0;
    runtime.operations.push(`DoHitAnimHealthboxEffect:${b}`);
    runtime.gBattlerControllerFuncs[b] = 'DoHitAnimBlinkSpriteEffect';
  }
};

export const LinkOpponentHandlePlaySE = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const pan = b % 2 === Partner.B_SIDE_PLAYER ? Partner.SOUND_PAN_ATTACKER : Partner.SOUND_PAN_TARGET;
  runtime.sounds.push({ kind: 'SE_PAN', id: u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]), pan });
  complete(runtime);
};
export const LinkOpponentHandlePlayFanfare = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'FANFARE', id: u16(runtime.gBattleBufferA[b][1], runtime.gBattleBufferA[b][2]) });
  complete(runtime);
};
export const LinkOpponentHandleFaintingCry = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.sounds.push({ kind: 'CRY', id: runtime.gEnemyParty[runtime.gBattlerPartyIndexes[b]].species, pan: Partner.SOUND_PAN_TARGET });
  runtime.operations.push(`PlayCry_ByMode:${Partner.CRY_MODE_FAINT}`);
  complete(runtime);
};
export const LinkOpponentHandleIntroSlide = (runtime: LinkOpponentRuntime): void => {
  runtime.operations.push(`HandleIntroSlide:${runtime.gBattleBufferA[runtime.gActiveBattler][1]}`);
  runtime.gIntroSlideFlags |= 1;
  complete(runtime);
};
export const LinkOpponentHandleIntroTrainerBallThrow = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[0] = 35;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[2] = 280;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].data[4] = runtime.gSprites[runtime.gBattlerSpriteIds[b]].y;
  runtime.gSprites[runtime.gBattlerSpriteIds[b]].callback = 'StartAnimLinearTranslation';
  runtime.operations.push(`StoreSpriteCallbackInData6:${runtime.gBattlerSpriteIds[b]}:SpriteCB_FreeOpponentSprite`);
  const taskId = createTask(runtime, 'Task_StartSendOutAnim', 5);
  runtime.gTasks[taskId].data[0] = b;
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown) runtime.gTasks[runtime.gBattlerStatusSummaryTaskId[b]].func = 'Task_HidePartyStatusSummary';
  runtime.gBattleSpritesDataPtr.animationData.introAnimActive = true;
  runtime.gBattlerControllerFuncs[b] = 'LinkOpponentDummy';
};
export const Task_StartSendOutAnim = (runtime: LinkOpponentRuntime, taskId: number): void => {
  const saved = runtime.gActiveBattler;
  runtime.gActiveBattler = runtime.gTasks[taskId].data[0];
  runtime.gBattleBufferA[runtime.gActiveBattler][1] = runtime.gBattlerPartyIndexes[runtime.gActiveBattler];
  StartSendOutAnim(runtime, runtime.gActiveBattler, 0);
  if (runtime.isDoubleBattle && !(runtime.gBattleTypeFlags & Partner.BATTLE_TYPE_MULTI)) {
    runtime.gActiveBattler ^= Partner.BIT_FLANK;
    runtime.gBattleBufferA[runtime.gActiveBattler][1] = runtime.gBattlerPartyIndexes[runtime.gActiveBattler];
    StartSendOutAnim(runtime, runtime.gActiveBattler, 0);
    runtime.gActiveBattler ^= Partner.BIT_FLANK;
  }
  runtime.gBattlerControllerFuncs[runtime.gActiveBattler] = 'Intro_TryShinyAnimShowHealthbox';
  runtime.gActiveBattler = saved;
  runtime.gTasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};
export const SpriteCB_FreeOpponentSprite = (runtime: LinkOpponentRuntime, spriteId: number): void => {
  runtime.operations.push(`FreeTrainerFrontPicPaletteAndTile:${runtime.gSprites[spriteId].oam.matrixNum}`, `RestoreTrainerFrontTile:${spriteId}:${runtime.gSprites[spriteId].data[5]}`, `FreeSpriteOamMatrix:${spriteId}`);
  destroySprite(runtime, spriteId);
};
export const LinkOpponentHandleDrawPartyStatusSummary = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleBufferA[b][1] !== 0 && b % 2 === Partner.B_SIDE_PLAYER) complete(runtime);
  else {
    const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[b] as Partner.LinkPartnerHealthboxData & { opponentDrawPartyStatusSummaryDelay?: number };
    hb.partyStatusSummaryShown = true;
    if (runtime.gBattleBufferA[b][2] !== 0) {
      hb.opponentDrawPartyStatusSummaryDelay ??= 0;
      if (hb.opponentDrawPartyStatusSummaryDelay < 2) {
        hb.opponentDrawPartyStatusSummaryDelay++;
        return;
      }
      hb.opponentDrawPartyStatusSummaryDelay = 0;
    }
    runtime.gBattlerStatusSummaryTaskId[b] = createTask(runtime, 'CreatePartyStatusSummarySprites', 0);
    hb.partyStatusDelayTimer = runtime.gBattleBufferA[b][2] !== 0 ? 93 : 0;
    runtime.gBattlerControllerFuncs[b] = 'EndDrawPartyStatusSummary';
  }
};
export const EndDrawPartyStatusSummary = (runtime: LinkOpponentRuntime): void => {
  const hb = runtime.gBattleSpritesDataPtr.healthBoxesData[runtime.gActiveBattler];
  if (hb.partyStatusDelayTimer++ > 92) {
    hb.partyStatusDelayTimer = 0;
    complete(runtime);
  }
};
export const LinkOpponentHandleHidePartyStatusSummary = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  if (runtime.gBattleSpritesDataPtr.healthBoxesData[b].partyStatusSummaryShown) runtime.gTasks[runtime.gBattlerStatusSummaryTaskId[b]].func = 'Task_HidePartyStatusSummary';
  complete(runtime);
};
export const LinkOpponentHandleSpriteInvisibility = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[b]];
  if (sprite) {
    sprite.invisible = !!runtime.gBattleBufferA[b][1];
    runtime.operations.push(`CopyBattleSpriteInvisibility:${b}`);
  }
  complete(runtime);
};
export const LinkOpponentHandleBattleAnimation = (runtime: LinkOpponentRuntime): void => {
  if (!runtime.battleSEPlaying) {
    const b = runtime.gActiveBattler;
    runtime.operations.push(`TryHandleLaunchBattleTableAnimation:${b}:${runtime.gBattleBufferA[b][1]}:${u16(runtime.gBattleBufferA[b][2], runtime.gBattleBufferA[b][3])}`);
    if (runtime.tryHandleBattleAnimationResult) complete(runtime);
    else runtime.gBattlerControllerFuncs[b] = 'CompleteOnFinishedBattleAnimation';
  }
};
export const LinkOpponentHandleEndLinkBattle = (runtime: LinkOpponentRuntime): void => {
  const b = runtime.gActiveBattler;
  runtime.gBattleOutcome = runtime.gBattleBufferA[b][1] === B_OUTCOME_DREW ? runtime.gBattleBufferA[b][1] : runtime.gBattleBufferA[b][1] ^ B_OUTCOME_DREW;
  runtime.operations.push('FadeOutMapMusic:5', 'BeginFastPaletteFade:3');
  complete(runtime);
  runtime.gBattlerControllerFuncs[b] = 'SetBattleEndCallbacks';
};

export const sLinkOpponentBufferCommands: Array<((runtime: LinkOpponentRuntime) => void) | undefined> = [
  LinkOpponentHandleGetMonData,
  LinkOpponentHandleGetRawMonData,
  LinkOpponentHandleSetMonData,
  LinkOpponentHandleSetRawMonData,
  LinkOpponentHandleLoadMonSprite,
  LinkOpponentHandleSwitchInAnim,
  LinkOpponentHandleReturnMonToBall,
  LinkOpponentHandleDrawTrainerPic,
  LinkOpponentHandleTrainerSlide,
  LinkOpponentHandleTrainerSlideBack,
  LinkOpponentHandleFaintAnimation,
  LinkOpponentHandlePaletteFade,
  LinkOpponentHandleSuccessBallThrowAnim,
  LinkOpponentHandleBallThrowAnim,
  LinkOpponentHandlePause,
  LinkOpponentHandleMoveAnimation,
  LinkOpponentHandlePrintString,
  LinkOpponentHandlePrintSelectionString,
  LinkOpponentHandleChooseAction,
  LinkOpponentHandleUnknownYesNoBox,
  LinkOpponentHandleChooseMove,
  LinkOpponentHandleChooseItem,
  LinkOpponentHandleChoosePokemon,
  LinkOpponentHandleCmd23,
  LinkOpponentHandleHealthBarUpdate,
  LinkOpponentHandleExpUpdate,
  LinkOpponentHandleStatusIconUpdate,
  LinkOpponentHandleStatusAnimation,
  LinkOpponentHandleStatusXor,
  LinkOpponentHandleDataTransfer,
  LinkOpponentHandleDMA3Transfer,
  LinkOpponentHandlePlayBGM,
  LinkOpponentHandleCmd32,
  LinkOpponentHandleTwoReturnValues,
  LinkOpponentHandleChosenMonReturnValue,
  LinkOpponentHandleOneReturnValue,
  LinkOpponentHandleOneReturnValue_Duplicate,
  LinkOpponentHandleClearUnkVar,
  LinkOpponentHandleSetUnkVar,
  LinkOpponentHandleClearUnkFlag,
  LinkOpponentHandleToggleUnkFlag,
  LinkOpponentHandleHitAnimation,
  LinkOpponentHandleCantSwitch,
  LinkOpponentHandlePlaySE,
  LinkOpponentHandlePlayFanfare,
  LinkOpponentHandleFaintingCry,
  LinkOpponentHandleIntroSlide,
  LinkOpponentHandleIntroTrainerBallThrow,
  LinkOpponentHandleDrawPartyStatusSummary,
  LinkOpponentHandleHidePartyStatusSummary,
  LinkOpponentHandleEndBounceEffect,
  LinkOpponentHandleSpriteInvisibility,
  LinkOpponentHandleBattleAnimation,
  LinkOpponentHandleLinkStandbyMsg,
  LinkOpponentHandleResetActionMoveSelection,
  LinkOpponentHandleEndLinkBattle,
  LinkOpponentCmdEnd
];

export const callLinkOpponentControllerFunc = (runtime: LinkOpponentRuntime, func: LinkOpponentControllerFunc): void => {
  switch (func) {
    case 'LinkOpponentBufferRunCommand':
      LinkOpponentBufferRunCommand(runtime);
      break;
    case 'CompleteOnBattlerSpriteCallbackDummy':
      CompleteOnBattlerSpriteCallbackDummy(runtime);
      break;
    case 'FreeTrainerSpriteAfterSlide':
      FreeTrainerSpriteAfterSlide(runtime);
      break;
    case 'Intro_DelayAndEnd':
      Intro_DelayAndEnd(runtime);
      break;
    case 'Intro_WaitForShinyAnimAndHealthbox':
      Intro_WaitForShinyAnimAndHealthbox(runtime);
      break;
    case 'Intro_TryShinyAnimShowHealthbox':
      Intro_TryShinyAnimShowHealthbox(runtime);
      break;
    case 'TryShinyAnimAfterMonAnim':
      TryShinyAnimAfterMonAnim(runtime);
      break;
    case 'CompleteOnHealthbarDone':
      CompleteOnHealthbarDone(runtime);
      break;
    case 'HideHealthboxAfterMonFaint':
      HideHealthboxAfterMonFaint(runtime);
      break;
    case 'DoSwitchOutAnimation':
      DoSwitchOutAnimation(runtime);
      break;
    case 'FreeMonSpriteAfterSwitchOutAnim':
      FreeMonSpriteAfterSwitchOutAnim(runtime);
      break;
    case 'CompleteOnInactiveTextPrinter':
      CompleteOnInactiveTextPrinter(runtime);
      break;
    case 'DoHitAnimBlinkSpriteEffect':
      DoHitAnimBlinkSpriteEffect(runtime);
      break;
    case 'SwitchIn_ShowSubstitute':
      SwitchIn_ShowSubstitute(runtime);
      break;
    case 'SwitchIn_HandleSoundAndEnd':
      SwitchIn_HandleSoundAndEnd(runtime);
      break;
    case 'SwitchIn_ShowHealthbox':
      SwitchIn_ShowHealthbox(runtime);
      break;
    case 'SwitchIn_TryShinyAnim':
      SwitchIn_TryShinyAnim(runtime);
      break;
    case 'LinkOpponentDoMoveAnimation':
      LinkOpponentDoMoveAnimation(runtime);
      break;
    case 'EndDrawPartyStatusSummary':
      EndDrawPartyStatusSummary(runtime);
      break;
    case 'CompleteOnFinishedStatusAnimation':
      CompleteOnFinishedStatusAnimation(runtime);
      break;
    case 'CompleteOnFinishedBattleAnimation':
      CompleteOnFinishedBattleAnimation(runtime);
      break;
    case 'LinkOpponentDummy':
      LinkOpponentDummy(runtime);
      break;
    case 'SetBattleEndCallbacks':
      break;
  }
};
