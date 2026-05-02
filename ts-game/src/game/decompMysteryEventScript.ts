export const LANGUAGE_MASK = 0x1;
export const VERSION_MASK = 0x1;
export const PARTY_SIZE = 6;
export const SPECIES_EGG = 412;
export const BERRY_NAME_LENGTH = 6;
export const POKEMON_NAME_LENGTH = 10;
export const VAR_ENIGMA_BERRY_AVAILABLE = 0x40b4;

export const gText_MysteryGiftCantBeUsed = 'Mystery Gift cannot be used.';
export const gText_MysteryGiftBerry = 'Mystery Gift Berry';
export const gText_MysteryGiftBerryTransform = 'Mystery Gift Berry transformed';
export const gText_MysteryGiftBerryObtained = 'Mystery Gift Berry obtained';
export const gText_MysteryGiftSpecialRibbon = 'Mystery Gift Special Ribbon';
export const gText_MysteryGiftNationalDex = 'Mystery Gift National Dex';
export const gText_MysteryGiftRareWord = 'Mystery Gift Rare Word';
export const gText_EggNickname = 'EGG';
export const gText_MenuPokemon = 'POKEMON';
export const gText_MysteryGiftFullParty = 'Mystery Gift Full Party';
export const gText_MysteryGiftSentOver = 'Mystery Gift Sent Over';
export const gText_MysteryGiftNewTrainer = 'Mystery Gift New Trainer';

export interface MysteryEventPokemon {
  species: number;
  heldItem?: number;
  [key: string]: unknown;
}

export interface MysteryEventMail {
  [key: string]: unknown;
}

export interface MysteryEventScriptContext {
  script: Uint8Array;
  pc: number;
  data: number[];
  stopped: boolean;
  runtime: MysteryEventScriptRuntime;
}

export type MysteryEventCommand = (ctx: MysteryEventScriptContext) => boolean;

export interface MysteryEventScriptRuntime {
  context: MysteryEventScriptContext;
  commandTable: MysteryEventCommand[];
  memory: Map<number, unknown>;
  stringVar1: string;
  stringVar2: string;
  stringVar4: string;
  enigmaBerryName: string;
  enigmaBerryValid: boolean;
  enigmaBerryValidAfterSet: boolean | null;
  vars: Map<number, number>;
  playerParty: MysteryEventPokemon[];
  playerPartyCount: number;
  pokedexFlags: Array<{ num: number; flag: string }>;
  giftRibbons: Array<{ index: number; ribbonId: number }>;
  ramScripts: Array<{ script: Uint8Array; length: number; mapGroup: number; mapNum: number; objectId: number }>;
  nationalDexEnabled: boolean;
  rareWords: number[];
  immediateScripts: Uint8Array[];
  mailsGiven: Array<{ pokemon: MysteryEventPokemon; mail: MysteryEventMail }>;
  compactPartyCalls: number;
  calculatePartyCountCalls: number;
  trainer: unknown;
  trainerValidated: boolean;
}

export const createMysteryEventScriptRuntime = (
  overrides: Partial<Omit<MysteryEventScriptRuntime, 'context'>> & {
    context?: Partial<MysteryEventScriptContext>;
  } = {}
): MysteryEventScriptRuntime => {
  const runtime = {
    commandTable: overrides.commandTable ?? [],
    memory: overrides.memory ?? new Map(),
    stringVar1: overrides.stringVar1 ?? '',
    stringVar2: overrides.stringVar2 ?? '',
    stringVar4: overrides.stringVar4 ?? '',
    enigmaBerryName: overrides.enigmaBerryName ?? '',
    enigmaBerryValid: overrides.enigmaBerryValid ?? false,
    enigmaBerryValidAfterSet: overrides.enigmaBerryValidAfterSet ?? null,
    vars: overrides.vars ?? new Map(),
    playerParty: overrides.playerParty ?? [],
    playerPartyCount: overrides.playerPartyCount ?? (overrides.playerParty?.length ?? 0),
    pokedexFlags: overrides.pokedexFlags ?? [],
    giftRibbons: overrides.giftRibbons ?? [],
    ramScripts: overrides.ramScripts ?? [],
    nationalDexEnabled: overrides.nationalDexEnabled ?? false,
    rareWords: overrides.rareWords ?? [],
    immediateScripts: overrides.immediateScripts ?? [],
    mailsGiven: overrides.mailsGiven ?? [],
    compactPartyCalls: overrides.compactPartyCalls ?? 0,
    calculatePartyCountCalls: overrides.calculatePartyCountCalls ?? 0,
    trainer: overrides.trainer ?? null,
    trainerValidated: overrides.trainerValidated ?? false
  } as MysteryEventScriptRuntime;
  runtime.context = {
    script: overrides.context?.script ?? new Uint8Array(),
    pc: overrides.context?.pc ?? 0,
    data: overrides.context?.data ?? [0, 0, 0, 0],
    stopped: overrides.context?.stopped ?? false,
    runtime
  };
  return runtime;
};

const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;

export const ScriptReadByte = (ctx: MysteryEventScriptContext): number => ctx.script[ctx.pc++] ?? 0;

export const ScriptReadHalfword = (ctx: MysteryEventScriptContext): number => {
  const value = (ctx.script[ctx.pc] ?? 0) | ((ctx.script[ctx.pc + 1] ?? 0) << 8);
  ctx.pc += 2;
  return u16(value);
};

export const ScriptReadWord = (ctx: MysteryEventScriptContext): number => {
  const value = (ctx.script[ctx.pc] ?? 0)
    | ((ctx.script[ctx.pc + 1] ?? 0) << 8)
    | ((ctx.script[ctx.pc + 2] ?? 0) << 16)
    | ((ctx.script[ctx.pc + 3] ?? 0) << 24);
  ctx.pc += 4;
  return u32(value);
};

const resolvePointerOffset = (ctx: MysteryEventScriptContext, pointer: number): number =>
  u32(pointer - ctx.data[1] + ctx.data[0]);

const readPointerOffset = (ctx: MysteryEventScriptContext): number =>
  resolvePointerOffset(ctx, ScriptReadWord(ctx));

const readMemory = <T>(ctx: MysteryEventScriptContext, offset: number): T =>
  ctx.runtime.memory.get(offset) as T;

const readStringAt = (ctx: MysteryEventScriptContext, offset: number): string => {
  const value = ctx.runtime.memory.get(offset);
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) {
    const end = value.indexOf(0);
    return String.fromCharCode(...value.slice(0, end < 0 ? value.length : end));
  }
  return '';
};

const stringExpandPlaceholders = (runtime: MysteryEventScriptRuntime, message: string): void => {
  runtime.stringVar4 = message;
};

const stringCopyN = (value: string, length: number): string => value.slice(0, length);

export const CheckCompatibility = (a1: number, a2: number, a3: number, a4: number): boolean => {
  if (!(a1 & LANGUAGE_MASK)) return false;
  if (!(a2 & LANGUAGE_MASK)) return false;
  if (!(a3 & 0x1)) return false;
  if (!(a4 & VERSION_MASK)) return false;
  return true;
};

export const SetIncompatible = (runtime: MysteryEventScriptRuntime): void => {
  stringExpandPlaceholders(runtime, gText_MysteryGiftCantBeUsed);
  SetMysteryEventScriptStatus(runtime, 3);
};

export const InitMysteryEventScript = (
  runtime: MysteryEventScriptRuntime,
  ctx: MysteryEventScriptContext,
  script: Uint8Array
): void => {
  ctx.script = script;
  ctx.pc = 0;
  ctx.data[0] = 0;
  ctx.data[1] = 0;
  ctx.data[2] = 0;
  ctx.data[3] = 0;
  ctx.stopped = false;
  ctx.runtime = runtime;
};

export const RunScriptCommand = (ctx: MysteryEventScriptContext): boolean => {
  if (ctx.stopped) return false;
  const opcode = ScriptReadByte(ctx);
  const command = ctx.runtime.commandTable[opcode];
  return command ? command(ctx) : false;
};

export const RunMysteryEventScriptCommand = (ctx: MysteryEventScriptContext): boolean =>
  RunScriptCommand(ctx) && Boolean(ctx.data[3]);

export const MEventScript_InitContext = (
  runtime: MysteryEventScriptRuntime,
  script: Uint8Array
): void => {
  InitMysteryEventScript(runtime, runtime.context, script);
};

export const MEventScript_Run = (runtime: MysteryEventScriptRuntime, out: { value: number }): boolean => {
  const ret = RunMysteryEventScriptCommand(runtime.context);
  out.value = runtime.context.data[2];
  return ret;
};

export const RunMysteryEventScript = (
  runtime: MysteryEventScriptRuntime,
  script: Uint8Array
): number => {
  const ret = { value: 0 };
  MEventScript_InitContext(runtime, script);
  while (MEventScript_Run(runtime, ret));
  return ret.value;
};

export const SetMysteryEventScriptStatus = (
  runtime: MysteryEventScriptRuntime,
  val: number
): void => {
  runtime.context.data[2] = u32(val);
};

export const MEScrCmd_end = (ctx: MysteryEventScriptContext): boolean => {
  ctx.stopped = true;
  return true;
};

export const MEScrCmd_checkcompat = (ctx: MysteryEventScriptContext): boolean => {
  ctx.data[1] = ScriptReadWord(ctx);
  const v1 = ScriptReadHalfword(ctx);
  const v2 = ScriptReadWord(ctx);
  const v3 = ScriptReadHalfword(ctx);
  const v4 = ScriptReadWord(ctx);
  if (CheckCompatibility(v1, v2, v3, v4)) {
    ctx.data[3] = 1;
  } else {
    SetIncompatible(ctx.runtime);
  }
  return true;
};

export const MEScrCmd_nop = (_ctx: MysteryEventScriptContext): boolean => false;

export const MEScrCmd_setstatus = (ctx: MysteryEventScriptContext): boolean => {
  ctx.data[2] = ScriptReadByte(ctx);
  return false;
};

export const MEScrCmd_setmsg = (ctx: MysteryEventScriptContext): boolean => {
  const value = ScriptReadByte(ctx);
  const strOffset = readPointerOffset(ctx);
  if (value === 0xff || value === ctx.data[2]) {
    stringExpandPlaceholders(ctx.runtime, readStringAt(ctx, strOffset));
  }
  return false;
};

export const MEScrCmd_runscript = (ctx: MysteryEventScriptContext): boolean => {
  ctx.runtime.immediateScripts.push(ctx.script.subarray(readPointerOffset(ctx)));
  return false;
};

export const MEScrCmd_setenigmaberry = (ctx: MysteryEventScriptContext): boolean => {
  const runtime = ctx.runtime;
  const haveBerry = runtime.enigmaBerryValid;
  const berryOffset = readPointerOffset(ctx);
  runtime.stringVar1 = stringCopyN(runtime.enigmaBerryName, BERRY_NAME_LENGTH + 1);
  runtime.enigmaBerryName = String(readMemory<string>(ctx, berryOffset) ?? '');
  if (runtime.enigmaBerryValidAfterSet !== null) {
    runtime.enigmaBerryValid = runtime.enigmaBerryValidAfterSet;
  }
  runtime.stringVar2 = stringCopyN(runtime.enigmaBerryName, BERRY_NAME_LENGTH + 1);

  if (!haveBerry) {
    stringExpandPlaceholders(runtime, gText_MysteryGiftBerry);
  } else if (runtime.stringVar1 !== runtime.stringVar2) {
    stringExpandPlaceholders(runtime, gText_MysteryGiftBerryTransform);
  } else {
    stringExpandPlaceholders(runtime, gText_MysteryGiftBerryObtained);
  }

  ctx.data[2] = 2;
  if (runtime.enigmaBerryValid) {
    runtime.vars.set(VAR_ENIGMA_BERRY_AVAILABLE, 1);
  } else {
    ctx.data[2] = 1;
  }
  return false;
};

export const MEScrCmd_giveribbon = (ctx: MysteryEventScriptContext): boolean => {
  const index = ScriptReadByte(ctx);
  const ribbonId = ScriptReadByte(ctx);
  ctx.runtime.giftRibbons.push({ index, ribbonId });
  stringExpandPlaceholders(ctx.runtime, gText_MysteryGiftSpecialRibbon);
  ctx.data[2] = 2;
  return false;
};

export const MEScrCmd_initramscript = (ctx: MysteryEventScriptContext): boolean => {
  const mapGroup = ScriptReadByte(ctx);
  const mapNum = ScriptReadByte(ctx);
  const objectId = ScriptReadByte(ctx);
  const script = readPointerOffset(ctx);
  const scriptEnd = readPointerOffset(ctx);
  ctx.runtime.ramScripts.push({
    script: ctx.script.subarray(script, scriptEnd),
    length: scriptEnd - script,
    mapGroup,
    mapNum,
    objectId
  });
  return false;
};

export const MEScrCmd_givenationaldex = (ctx: MysteryEventScriptContext): boolean => {
  ctx.runtime.nationalDexEnabled = true;
  stringExpandPlaceholders(ctx.runtime, gText_MysteryGiftNationalDex);
  ctx.data[2] = 2;
  return false;
};

export const MEScrCmd_addrareword = (ctx: MysteryEventScriptContext): boolean => {
  ctx.runtime.rareWords.push(ScriptReadByte(ctx));
  stringExpandPlaceholders(ctx.runtime, gText_MysteryGiftRareWord);
  ctx.data[2] = 2;
  return false;
};

export const MEScrCmd_setrecordmixinggift = (ctx: MysteryEventScriptContext): boolean => {
  SetIncompatible(ctx.runtime);
  ctx.data[3] = 0;
  return true;
};

export const MEScrCmd_givepokemon = (ctx: MysteryEventScriptContext): boolean => {
  const runtime = ctx.runtime;
  const data = readPointerOffset(ctx);
  const pokemon = readMemory<MysteryEventPokemon>(ctx, data);
  const mail = readMemory<MysteryEventMail>(ctx, data + 1);
  const species = pokemon.species;
  runtime.stringVar1 = species === SPECIES_EGG
    ? stringCopyN(gText_EggNickname, POKEMON_NAME_LENGTH + 1)
    : stringCopyN(gText_MenuPokemon, POKEMON_NAME_LENGTH + 1);

  if (runtime.playerPartyCount === PARTY_SIZE) {
    stringExpandPlaceholders(runtime, gText_MysteryGiftFullParty);
    ctx.data[2] = 3;
  } else {
    runtime.playerParty[5] = { ...pokemon };
    if (species !== SPECIES_EGG) {
      runtime.pokedexFlags.push({ num: species, flag: 'seen' }, { num: species, flag: 'caught' });
    }
    if (pokemon.heldItem !== undefined && pokemon.heldItem !== 0) {
      runtime.mailsGiven.push({ pokemon: runtime.playerParty[5], mail });
    }
    runtime.compactPartyCalls += 1;
    runtime.calculatePartyCountCalls += 1;
    runtime.playerPartyCount = runtime.playerParty.filter(Boolean).length;
    stringExpandPlaceholders(runtime, gText_MysteryGiftSentOver);
    ctx.data[2] = 2;
  }
  return false;
};

export const MEScrCmd_addtrainer = (ctx: MysteryEventScriptContext): boolean => {
  const data = readPointerOffset(ctx);
  ctx.runtime.trainer = readMemory(ctx, data);
  ctx.runtime.trainerValidated = true;
  stringExpandPlaceholders(ctx.runtime, gText_MysteryGiftNewTrainer);
  ctx.data[2] = 2;
  return false;
};

export const MEScrCmd_enableresetrtc = (ctx: MysteryEventScriptContext): boolean => {
  SetIncompatible(ctx.runtime);
  ctx.data[3] = 0;
  return true;
};

export const CalcByteArraySum = (data: Uint8Array): number =>
  data.reduce((sum, value) => (sum + value) >>> 0, 0);

export const CalcCRC16 = (data: Uint8Array): number => {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xa001) : (crc >>> 1);
    }
  }
  return u16(crc);
};

export const MEScrCmd_checksum = (ctx: MysteryEventScriptContext): boolean => {
  const checksum = ScriptReadWord(ctx);
  const data = readPointerOffset(ctx);
  const dataEnd = readPointerOffset(ctx);
  if (checksum !== CalcByteArraySum(ctx.script.subarray(data, dataEnd))) {
    ctx.data[3] = 0;
    ctx.data[2] = 1;
  }
  return true;
};

export const MEScrCmd_crc = (ctx: MysteryEventScriptContext): boolean => {
  const crc = ScriptReadWord(ctx);
  const data = readPointerOffset(ctx);
  const dataEnd = readPointerOffset(ctx);
  if (crc !== CalcCRC16(ctx.script.subarray(data, dataEnd))) {
    ctx.data[3] = 0;
    ctx.data[2] = 1;
  }
  return true;
};
