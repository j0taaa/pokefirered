export const PARTY_SIZE = 6;
export const MAX_MON_MOVES = 4;
export const NUM_STATS = 6;
export const MON_DATA_SPECIES = 'species';
export const MON_DATA_LEVEL = 'level';
export const MON_DATA_EXP = 'exp';
export const MON_DATA_PERSONALITY = 'personality';
export const MON_DATA_OT_ID = 'otId';
export const MON_DATA_NICKNAME = 'nickname';
export const MON_DATA_HP = 'hp';
export const MON_DATA_MAX_HP = 'maxHp';
export const MON_DATA_STATUS = 'status';
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const ITEM_NONE = 0;
export const ITEM_POTION = 13;
export const ITEM_ENIGMA_BERRY = 175;
export const MOVE_NONE = 0;
export const ITEM0_X_ATTACK = 0x0f;
export const ITEM0_DIRE_HIT = 0x30;
export const ITEM1_X_SPEED = 0x0f;
export const ITEM1_X_DEFEND = 0xf0;
export const ITEM2_X_SPATK = 0x0f;
export const ITEM2_X_ACCURACY = 0xf0;
export const ITEM3_GUARD_SPEC = 0x80;
export const MAX_BATTLERS_COUNT = 4;
export const MAX_MON_PIC_FRAMES = 4;
export const MON_PIC_SIZE = 0x800;
export const GFX_MANAGER_ACTIVE = true;

export interface BoxMon {
  species: number;
  level: number;
  exp: number;
  personality: number;
  otId: number;
  nickname: string;
  language: number;
  checksum: number;
  encrypted: boolean;
  ivs: number[];
  evs: number[];
  moves: number[];
  pp: number[];
  ppBonuses: number[];
  friendship: number;
  item: number;
  abilityNum: number;
  pokerus: number;
  metLevel: number;
  metLocation: number;
  isEgg: boolean;
}
export interface Pokemon extends BoxMon {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  status: number;
}
export interface BattleMon { species: number; hp: number; maxHp: number; status1: number; moves: number[]; pp: number[]; ability: number; level: number; item: number; personality: number; otId: number; }
export interface CompressedSpritePalette { species: number; shiny: boolean; data: string; }
export interface MonSpritesGfxManager {
  mode: number;
  active: boolean;
  numSprites: number;
  battlePosition: number;
  numFrames: number;
  dataSize: number;
  spriteBuffer: Uint8Array;
  spritePointers: Uint8Array[];
}
export interface PokemonLinkPlayer { id: number; name: string; }
export interface PokemonRuntime {
  operations: string[];
  playerParty: Pokemon[];
  enemyParty: Pokemon[];
  storage: Pokemon[][];
  battleMons: BattleMon[];
  playerPartyCount: number;
  enemyPartyCount: number;
  pokedex: Set<number>;
  randomSeed: number;
  multiuseSpriteTemplate: Record<string, unknown>;
  monSpritesGfxManager: MonSpritesGfxManager | null;
  battleTypeFlags: number;
  battleMusic: number;
  mapMusic: number;
  multiplayerId: number;
  flankIds: number[];
  linkPlayers: PokemonLinkPlayer[];
  battlerInMenuId: number;
  battlerAttacker: number;
  battlerTarget: number;
  potentialItemEffectBattler: number;
  inBattle: boolean;
  itemEffectTable: number[][];
  enigmaBerryItemEffect: number[];
  enigmaBerryBattleItemEffects: number[][];
  displayedBattleString: string;
  monPaletteTable: CompressedSpritePalette[];
  monShinyPaletteTable: CompressedSpritePalette[];
  stringBuffers: string[];
  learningMoveTableId: number;
}

let activeRuntime: PokemonRuntime | null = null;
const expForLevel = (level: number): number => level * level * level;
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const req = (runtime?: PokemonRuntime): PokemonRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('pokemon runtime is not active'); return r; };
const op = (r: PokemonRuntime, name: string, ...args: Array<number | string | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const rng = (r: PokemonRuntime): number => { r.randomSeed = (r.randomSeed * 1103515245 + 12345) >>> 0; return r.randomSeed; };
const emptyBoxMon = (): BoxMon => ({ species: 0, level: 0, exp: 0, personality: 0, otId: 0, nickname: '', language: 1, checksum: 0, encrypted: false, ivs: [0, 0, 0, 0, 0, 0], evs: [0, 0, 0, 0, 0, 0], moves: [0, 0, 0, 0], pp: [0, 0, 0, 0], ppBonuses: [0, 0, 0, 0], friendship: 70, item: 0, abilityNum: 0, pokerus: 0, metLevel: 0, metLocation: 0, isEgg: false });
const emptyMon = (): Pokemon => ({ ...emptyBoxMon(), hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0, status: 0 });
const asMon = (value?: Partial<Pokemon> | Partial<BoxMon>): Pokemon => Object.assign(emptyMon(), value ?? {});
const baseStat = (species: number, stat: number): number => 35 + ((species * (stat + 3)) % 75);
const maxPpForMove = (move: number): number => move ? 5 + (move % 36) : 0;
const monListCount = (mons: Pokemon[]): number => mons.filter(m => m.species !== SPECIES_NONE).length;
const natureInc = [1,2,3,4,0,2,3,4,0,1,3,4,0,1,2,4,0,1,2,3,0,1,2,3,4];
const natureDec = [1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,0,0,0,0,0];
const sStatsToRaise = [1, 1, 3, 2, 4, 5];

const defaultPaletteTable = (shiny: boolean): CompressedSpritePalette[] =>
  Array.from({ length: SPECIES_EGG + 1 }, (_v, species) => ({ species, shiny, data: `${shiny ? 'shiny' : 'normal'}:${species}` }));

export function createPokemonRuntime(overrides: Partial<PokemonRuntime> = {}): PokemonRuntime {
  const runtime: PokemonRuntime = {
    operations: [],
    playerParty: Array.from({ length: PARTY_SIZE }, () => emptyMon()),
    enemyParty: Array.from({ length: PARTY_SIZE }, () => emptyMon()),
    storage: Array.from({ length: 14 }, () => []),
    battleMons: Array.from({ length: 4 }, () => ({ species: 0, hp: 0, maxHp: 0, status1: 0, moves: [0, 0, 0, 0], pp: [0, 0, 0, 0], ability: 0, level: 0, item: 0, personality: 0, otId: 0 })),
    playerPartyCount: 0,
    enemyPartyCount: 0,
    pokedex: new Set(),
    randomSeed: 1,
    multiuseSpriteTemplate: {},
    monSpritesGfxManager: null,
    battleTypeFlags: 0,
    battleMusic: 0,
    mapMusic: 0,
    multiplayerId: 0,
    flankIds: [0, 1, 0, 1],
    linkPlayers: Array.from({ length: 4 }, (_v, i) => ({ id: i, name: `PLAYER${i}` })),
    battlerInMenuId: 0,
    battlerAttacker: 0,
    battlerTarget: 0,
    potentialItemEffectBattler: 0,
    inBattle: false,
    itemEffectTable: [],
    enigmaBerryItemEffect: [0, 0, 0, 0],
    enigmaBerryBattleItemEffects: Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    displayedBattleString: '',
    monPaletteTable: defaultPaletteTable(false),
    monShinyPaletteTable: defaultPaletteTable(true),
    stringBuffers: ['', '', '', ''],
    learningMoveTableId: 0,
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
}

export function ZeroBoxMonData(boxMon: BoxMon): void { Object.assign(boxMon, emptyBoxMon()); }
export function ZeroMonData(mon: Pokemon): void { Object.assign(mon, emptyMon()); }
export function ZeroPlayerPartyMons(r = req()): void { r.playerParty = Array.from({ length: PARTY_SIZE }, () => emptyMon()); r.playerPartyCount = 0; }
export function ZeroEnemyPartyMons(r = req()): void { r.enemyParty = Array.from({ length: PARTY_SIZE }, () => emptyMon()); r.enemyPartyCount = 0; }
export function CreateMon(mon: Pokemon, species: number, level: number, fixedIV = 0, hasFixedPersonality = false, personality = 0, otIdType = 0, otId = 0, r = req()): void { const p = hasFixedPersonality ? personality >>> 0 : rng(r); Object.assign(mon, emptyMon(), { species, level, exp: expForLevel(level), personality: p, otId: otIdType ? otId : rng(r), nickname: GetSpeciesName(species), ivs: Array.from({ length: NUM_STATS }, () => fixedIV ? fixedIV & 31 : rng(r) & 31), metLevel: level }); GiveMonInitialMoveset(mon); CalculateMonStats(mon); }
export function CreateBoxMon(boxMon: BoxMon, species: number, level: number, fixedIV = 0, hasFixedPersonality = false, personality = 0, otIdType = 0, otId = 0, r = req()): void { const mon = asMon(boxMon); CreateMon(mon, species, level, fixedIV, hasFixedPersonality, personality, otIdType, otId, r); Object.assign(boxMon, mon); }
export function CreateMonWithNature(mon: Pokemon, species: number, level: number, fixedIV: number, nature: number, r = req()): void { let p = rng(r); while (GetNatureFromPersonality(p) !== nature) p++; CreateMon(mon, species, level, fixedIV, true, p, 0, 0, r); }
export function CreateMonWithGenderNatureLetter(mon: Pokemon, species: number, level: number, fixedIV: number, gender: number, nature: number, letter: number, r = req()): void { let p = rng(r); while (GetGenderFromSpeciesAndPersonality(species, p) !== gender || GetNatureFromPersonality(p) !== nature || p % 28 !== letter) p++; CreateMon(mon, species, level, fixedIV, true, p, 0, 0, r); }
export function CreateMaleMon(mon: Pokemon, species: number, level: number, r = req()): void { CreateMonWithGenderNatureLetter(mon, species, level, 0, 0, 0, 0, r); }
export function CreateMonWithIVsPersonality(mon: Pokemon, species: number, level: number, ivs: number[], personality: number, r = req()): void { CreateMon(mon, species, level, 0, true, personality, 0, 0, r); mon.ivs = ivs.slice(0, 6).map(v => v & 31); CalculateMonStats(mon); }
export function CreateMonWithIVsOTID(mon: Pokemon, species: number, level: number, ivs: number[], otId: number, r = req()): void { CreateMonWithIVsPersonality(mon, species, level, ivs, rng(r), r); mon.otId = otId; }
export function CreateMonWithEVSpread(mon: Pokemon, species: number, level: number, fixedIV: number, evSpread: number, r = req()): void { CreateMon(mon, species, level, fixedIV, false, 0, 0, 0, r); mon.evs = Array.from({ length: 6 }, (_v, i) => i === evSpread ? 252 : 0); CalculateMonStats(mon); }
export function CreateBattleTowerMon(mon: Pokemon, species: number, level: number, r = req()): void { CreateMon(mon, species, level, 31, false, 0, 0, 0, r); mon.friendship = 255; }
export function CreateEventMon(mon: Pokemon, species: number, level: number, fixedIV: number, personality: number, r = req()): void { CreateMon(mon, species, level, fixedIV, true, personality, 0, 0, r); }
export function ConvertPokemonToBattleTowerPokemon(mon: Pokemon): BattleMon { return { species: mon.species, hp: mon.hp, maxHp: mon.maxHp, status1: mon.status, moves: mon.moves.slice(0, 4), pp: mon.pp.slice(0, 4), ability: GetMonAbility(mon), level: mon.level, item: mon.item, personality: mon.personality, otId: mon.otId }; }
export function CalculateBoxMonChecksum(boxMon: BoxMon): number { const vals = [boxMon.species, boxMon.level, boxMon.exp, boxMon.personality, boxMon.otId, ...boxMon.ivs, ...boxMon.evs, ...boxMon.moves, ...boxMon.pp]; boxMon.checksum = vals.reduce((a, b) => (a + b) & 0xffff, 0); return boxMon.checksum; }
export function CalculateMonStats(mon: Pokemon): void { mon.level = GetLevelFromMonExp(mon); mon.maxHp = Math.max(1, Math.trunc(((2 * baseStat(mon.species, 0) + mon.ivs[0] + Math.trunc(mon.evs[0] / 4)) * mon.level) / 100) + mon.level + 10); mon.attack = ModifyStatByNature(GetNature(mon), Math.trunc(((2 * baseStat(mon.species, 1) + mon.ivs[1] + Math.trunc(mon.evs[1] / 4)) * mon.level) / 100) + 5, 1); mon.defense = ModifyStatByNature(GetNature(mon), Math.trunc(((2 * baseStat(mon.species, 2) + mon.ivs[2] + Math.trunc(mon.evs[2] / 4)) * mon.level) / 100) + 5, 2); mon.speed = ModifyStatByNature(GetNature(mon), Math.trunc(((2 * baseStat(mon.species, 3) + mon.ivs[3] + Math.trunc(mon.evs[3] / 4)) * mon.level) / 100) + 5, 3); mon.spAttack = ModifyStatByNature(GetNature(mon), Math.trunc(((2 * baseStat(mon.species, 4) + mon.ivs[4] + Math.trunc(mon.evs[4] / 4)) * mon.level) / 100) + 5, 4); mon.spDefense = ModifyStatByNature(GetNature(mon), Math.trunc(((2 * baseStat(mon.species, 5) + mon.ivs[5] + Math.trunc(mon.evs[5] / 4)) * mon.level) / 100) + 5, 5); if (mon.hp <= 0) mon.hp = mon.maxHp; }
export function BoxMonToMon(boxMon: BoxMon, mon: Pokemon): void { Object.assign(mon, asMon(boxMon)); CalculateMonStats(mon); }
export function GetLevelFromMonExp(mon: Pokemon): number { return clamp(Math.floor(Math.cbrt(mon.exp || 1)), 1, 100); }
export function GetLevelFromBoxMonExp(boxMon: BoxMon): number { return clamp(Math.floor(Math.cbrt(boxMon.exp || 1)), 1, 100); }
export function GiveMoveToMon(mon: Pokemon, move: number): number { const slot = mon.moves.findIndex(m => m === 0); if (slot < 0) return 0xffff; SetMonMoveSlot(mon, move, slot); return move; }
export function GiveMoveToBoxMon(boxMon: BoxMon, move: number): number { const slot = boxMon.moves.findIndex(m => m === 0); if (slot < 0) return 0xffff; boxMon.moves[slot] = move; boxMon.pp[slot] = maxPpForMove(move); return move; }
export function GiveMoveToBattleMon(battleMon: BattleMon, move: number): number { const slot = battleMon.moves.findIndex(m => m === 0); if (slot < 0) return 0xffff; SetBattleMonMoveSlot(battleMon, move, slot); return move; }
export function SetMonMoveSlot(mon: Pokemon, move: number, slot: number): void { mon.moves[slot] = move; mon.pp[slot] = maxPpForMove(move); }
export function SetBattleMonMoveSlot(mon: BattleMon, move: number, slot: number): void { mon.moves[slot] = move; mon.pp[slot] = maxPpForMove(move); }
export function GiveMonInitialMoveset(mon: Pokemon): void { mon.moves = [mon.species + 1, mon.species + 2, 0, 0]; mon.pp = mon.moves.map(maxPpForMove); }
export function GiveBoxMonInitialMoveset(boxMon: BoxMon): void { boxMon.moves = [boxMon.species + 1, boxMon.species + 2, 0, 0]; boxMon.pp = boxMon.moves.map(maxPpForMove); }
export function MonTryLearningNewMove(mon: Pokemon, firstMove: boolean = false): number { const move = mon.species + mon.level + (firstMove ? 0 : 1); return GiveMoveToMon(mon, move); }
export function DeleteFirstMoveAndGiveMoveToMon(mon: Pokemon, move: number): void { mon.moves.shift(); mon.pp.shift(); mon.ppBonuses.shift(); mon.moves.push(move); mon.pp.push(maxPpForMove(move)); mon.ppBonuses.push(0); }
export function DeleteFirstMoveAndGiveMoveToBoxMon(boxMon: BoxMon, move: number): void { boxMon.moves.shift(); boxMon.pp.shift(); boxMon.ppBonuses.shift(); boxMon.moves.push(move); boxMon.pp.push(maxPpForMove(move)); boxMon.ppBonuses.push(0); }
export function CalculateBaseDamage(attacker: Pokemon | BattleMon, defender: Pokemon | BattleMon, movePower: number, type = 0, attack: number = (attacker as Pokemon).attack ?? 50, defense: number = (defender as Pokemon).defense ?? 50): number { return Math.max(1, Math.trunc((((2 * attacker.level / 5 + 2) * movePower * attack / Math.max(1, defense)) / 50 + 2) * (type ? 1.5 : 1))); }
export function CountAliveMonsInBattle(r = req()): number { return r.battleMons.filter(m => m.species && m.hp > 0).length; }
export function GetDefaultMoveTarget(attacker: number, _move: number, r = req()): number { return (attacker ^ 1) % Math.max(2, r.battleMons.length); }
export function GetMonGender(mon: Pokemon): number { return GetGenderFromSpeciesAndPersonality(mon.species, mon.personality); }
export function GetBoxMonGender(boxMon: BoxMon): number { return GetGenderFromSpeciesAndPersonality(boxMon.species, boxMon.personality); }
export function GetGenderFromSpeciesAndPersonality(species: number, personality: number): number { if (species === 29 || species === 30 || species === 31) return 1; if (species === 32 || species === 33 || species === 34) return 0; return personality & 1; }
export function SetMultiuseSpriteTemplateToPokemon(species: number, battlerPosition: number, r = req()): void { r.multiuseSpriteTemplate = { kind: 'pokemon', species, battlerPosition }; }
export function SetMultiuseSpriteTemplateToTrainerBack(trainerPicId: number, battlerPosition: number, r = req()): void { r.multiuseSpriteTemplate = { kind: 'trainerBack', trainerPicId, battlerPosition }; }
export function EncryptBoxMon(boxMon: BoxMon): void { boxMon.encrypted = true; }
export function DecryptBoxMon(boxMon: BoxMon): void { boxMon.encrypted = false; }
export function GetMonData3(mon: Pokemon, field: string): unknown { return (mon as unknown as Record<string, unknown>)[field]; }
export function GetBoxMonData3(mon: BoxMon, field: string): unknown { return (mon as unknown as Record<string, unknown>)[field]; }
export function SetMonData(mon: Pokemon, field: string, value: unknown): void { (mon as unknown as Record<string, unknown>)[field] = value; }
export function SetBoxMonData(mon: BoxMon, field: string, value: unknown): void { (mon as unknown as Record<string, unknown>)[field] = value; }
export function CopyMon(src: Pokemon, dst: Pokemon): void { Object.assign(dst, structuredClone(src)); }
export function GiveMonToPlayer(mon: Pokemon, r = req()): number { const idx = r.playerParty.findIndex(m => m.species === SPECIES_NONE); if (idx >= 0) { CopyMon(mon, r.playerParty[idx]); CalculatePlayerPartyCount(r); return 0; } return SendMonToPC(mon, r); }
export function SendMonToPC(mon: Pokemon, r = req()): number { const box = r.storage.find(b => b.length < 30); if (!box) return 2; box.push(structuredClone(mon)); return 1; }
export function CalculatePlayerPartyCount(r = req()): number { r.playerPartyCount = monListCount(r.playerParty); return r.playerPartyCount; }
export function CalculateEnemyPartyCount(r = req()): number { r.enemyPartyCount = monListCount(r.enemyParty); return r.enemyPartyCount; }
export function GetMonsStateToDoubles(r = req()): number { return r.playerParty.filter(m => m.species && m.hp > 0).length >= 2 ? 2 : 1; }
export function GetAbilityBySpecies(species: number, abilityNum = 0): number { return species * 2 + (abilityNum & 1); }
export function GetMonAbility(mon: Pokemon): number { return GetAbilityBySpecies(mon.species, mon.abilityNum); }
export function CreateSecretBaseEnemyParty(r = req()): void { r.enemyParty = Array.from({ length: 3 }, (_v, i) => { const mon = emptyMon(); CreateMon(mon, 25 + i, 30, 10, false, 0, 0, 0, r); return mon; }); CalculateEnemyPartyCount(r); }
export function GetSecretBaseTrainerPicIndex(trainerId: number): number { return trainerId % 92; }
export function GetSecretBaseTrainerNameIndex(trainerId: number): number { return trainerId % 20; }
export function IsPlayerPartyAndPokemonStorageFull(r = req()): boolean { return CalculatePlayerPartyCount(r) >= PARTY_SIZE && IsPokemonStorageFull(r); }
export function IsPokemonStorageFull(r = req()): boolean { return r.storage.every(box => box.length >= 30); }
export function GetSpeciesName(species: number): string { return species ? `SPECIES_${species}` : '??????????'; }
export function CalculatePPWithBonus(move: number, ppBonuses: number, moveIndex: number): number { const bonus = (ppBonuses >> (moveIndex * 2)) & 3; return maxPpForMove(move) + Math.trunc(maxPpForMove(move) * bonus / 5); }
export function RemoveMonPPBonus(mon: Pokemon, moveIndex: number): void { mon.ppBonuses[moveIndex] = 0; mon.pp[moveIndex] = maxPpForMove(mon.moves[moveIndex]); }
export function RemoveBattleMonPPBonus(mon: BattleMon, moveIndex: number): void { mon.pp[moveIndex] = maxPpForMove(mon.moves[moveIndex]); }
export function CopyPlayerPartyMonToBattleData(slot: number, battler: number, r = req()): void { r.battleMons[battler] = ConvertPokemonToBattleTowerPokemon(r.playerParty[slot]); }
export function ExecuteTableBasedItemEffect(mon: Pokemon, item: number, r = req()): number { op(r, 'ExecuteTableBasedItemEffect', item); if (PokemonUseItemEffects(mon, item, r)) return 0; return 1; }
export function PokemonUseItemEffects(mon: Pokemon, item: number, _r = req()): boolean { if (item >= 13 && item <= 20) { mon.hp = mon.maxHp; return true; } if (item >= 30 && item <= 35) return HealStatusConditions(mon, 0, 0xffffffff, 0); return false; }
export function HealStatusConditions(mon: Pokemon, _unused: number, healMask: number, _battleId: number): boolean { const old = mon.status; mon.status &= ~healMask; return old !== mon.status; }
export function PokemonItemUseNoEffect(mon: Pokemon, item: number, r = req()): boolean { return !PokemonUseItemEffects(structuredClone(mon), item, r); }
export function PartyMonHasStatus(mon: Pokemon, _unused: number, healMask: number, _battleId: number): boolean { return (mon.status & healMask) !== 0; }
export function GetItemEffectParamOffset(effectByte: number, bit: number): number { return effectByte * 8 + bit; }
export function BufferStatRoseMessage(statId: number, r = req()): void { r.displayedBattleString = `STAT_${sStatsToRaise[statId] ?? statId}_ROSE`; r.stringBuffers[0] = r.displayedBattleString; }
export function GetNature(mon: Pokemon): number { return GetNatureFromPersonality(mon.personality); }
export function GetNatureFromPersonality(personality: number): number { return personality % 25; }
export function GetEvolutionTargetSpecies(mon: Pokemon, _type = 0, evolutionItem = 0): number { if (evolutionItem || mon.level >= 16 || mon.friendship >= 220) return mon.species + 1; return mon.species; }
export function HoennPokedexNumToSpecies(num: number): number { return num; }
export function NationalPokedexNumToSpecies(num: number): number { return num; }
export function NationalToHoennOrder(num: number): number { return num; }
export function SpeciesToNationalPokedexNum(species: number): number { return species; }
export function SpeciesToHoennPokedexNum(species: number): number { return species; }
export function HoennToNationalOrder(num: number): number { return num; }
export function SpeciesToCryId(species: number): number { return species; }
export function DrawSpindaSpotsUnused(mon: Pokemon, r = req()): void { DrawSpindaSpots(mon, r); }
export function DrawSpindaSpots(mon: Pokemon, r = req()): void { op(r, 'DrawSpindaSpots', mon.personality); }
export function EvolutionRenameMon(mon: Pokemon): void { mon.nickname = GetSpeciesName(mon.species); }
export function GetPlayerFlankId(r = req()): number { return r.flankIds[r.multiplayerId] ?? 0; }
export function GetLinkTrainerFlankId(linkPlayerId: number, r = req()): number { return r.flankIds[linkPlayerId] ?? 0; }
export function GetBattlerMultiplayerId(battler: number, r = req()): number { return battler % Math.max(1, r.flankIds.length); }
export function GetTrainerEncounterMusicId(trainerClass: number): number { return 1000 + trainerClass; }
export function ModifyStatByNature(nature: number, n: number, statIndex: number): number { if (natureInc[nature] === statIndex) return Math.trunc(n * 110 / 100); if (natureDec[nature] === statIndex) return Math.trunc(n * 90 / 100); return n; }
export function AdjustFriendship(mon: Pokemon, event: number): void { const delta = [5, 3, 1, -5, -10][event] ?? 0; mon.friendship = clamp(mon.friendship + delta, 0, 255); }
export function MonGainEVs(mon: Pokemon, defeatedSpecies: number): void { const idx = defeatedSpecies % 6; if (GetMonEVCount(mon) < 510) mon.evs[idx] = Math.min(252, mon.evs[idx] + 1); }
export function GetMonEVCount(mon: Pokemon): number { return mon.evs.reduce((a, b) => a + b, 0); }
export function RandomlyGivePartyPokerus(r = req()): void { const mon = r.playerParty.find(m => m.species && !m.pokerus); if (mon && (rng(r) & 3) === 0) mon.pokerus = 0x10 | ((rng(r) & 3) + 1); }
export function CheckPartyPokerus(mask: number, r = req()): boolean { return r.playerParty.some((_m, i) => (mask & (1 << i)) && r.playerParty[i].pokerus); }
export function CheckPartyHasHadPokerus(mask: number, r = req()): boolean { return r.playerParty.some((_m, i) => (mask & (1 << i)) && (r.playerParty[i].pokerus === 0 || r.playerParty[i].pokerus > 0)); }
export function UpdatePartyPokerusTime(days: number, r = req()): void { r.playerParty.forEach(mon => { if (mon.pokerus) mon.pokerus = Math.max(0, mon.pokerus - days); }); }
export function PartySpreadPokerus(r = req()): void { for (let i = 0; i < PARTY_SIZE; i++) if (r.playerParty[i].pokerus) { if (i > 0 && !r.playerParty[i - 1].pokerus) r.playerParty[i - 1].pokerus = r.playerParty[i].pokerus; if (i < PARTY_SIZE - 1 && !r.playerParty[i + 1].pokerus) r.playerParty[i + 1].pokerus = r.playerParty[i].pokerus; } }
export function SetMonExpWithMaxLevelCheck(mon: Pokemon, exp: number): void { mon.exp = Math.min(exp, expForLevel(100)); CalculateMonStats(mon); }
export function TryIncrementMonLevel(mon: Pokemon): boolean { const old = mon.level; mon.exp = Math.max(mon.exp, expForLevel(mon.level + 1)); CalculateMonStats(mon); return mon.level > old; }
export function CanMonLearnTMHM(mon: Pokemon, tm: number): boolean { return !mon.isEgg && !!mon.species && !mon.moves.includes(tm); }
export function GetMoveRelearnerMoves(mon: Pokemon): number[] { return [mon.species + 1, mon.species + 2, mon.species + 3].filter(m => !mon.moves.includes(m)); }
export function GetLevelUpMovesBySpecies(species: number): number[] { return [species + 1, species + 2, species + 3]; }
export function GetNumberOfRelearnableMoves(mon: Pokemon): number { return GetMoveRelearnerMoves(mon).length; }
export function SpeciesToPokedexNum(species: number): number { return SpeciesToNationalPokedexNum(species); }
export function ClearBattleMonForms(r = req()): void { r.battleMons.forEach(mon => { mon.species = Math.trunc(mon.species); }); }
export function GetBattleBGM(r = req()): number { return r.battleMusic || 100; }
export function PlayBattleBGM(r = req()): void { op(r, 'PlayBattleBGM', GetBattleBGM(r)); }
export function PlayMapChosenOrBattleBGM(r = req()): void { op(r, 'PlayBGM', r.mapMusic || GetBattleBGM(r)); }
export function IsHMMove2(move: number): boolean { return move >= 0x100 && move <= 0x107; }
export function IsMonSpriteNotFlipped(species: number): boolean { return species % 2 === 0; }
export function GetMonFlavorRelation(mon: Pokemon, flavor: number): number { return GetFlavorRelationByPersonality(mon.personality, flavor); }
export function GetFlavorRelationByPersonality(personality: number, flavor: number): number { const nature = GetNatureFromPersonality(personality); return natureInc[nature] === flavor ? 1 : natureDec[nature] === flavor ? -1 : 0; }
export function IsTradedMon(mon: Pokemon, playerOtId = 0, playerName = 'PLAYER'): boolean { return IsOtherTrainer(mon, playerOtId, playerName); }
export function IsOtherTrainer(mon: Pokemon, playerOtId = 0, playerName = 'PLAYER'): boolean { return mon.otId !== playerOtId || mon.otId === playerOtId && mon.nickname !== playerName && mon.otId !== 0; }
export function MonRestorePP(mon: Pokemon): void { mon.pp = mon.moves.map(maxPpForMove); }
export function BoxMonRestorePP(mon: BoxMon): void { mon.pp = mon.moves.map(maxPpForMove); }
export function SetMonPreventsSwitchingString(mon: Pokemon, r = req()): void { r.stringBuffers[0] = `${mon.nickname} prevents switching!`; }
export function SetWildMonHeldItem(mon: Pokemon, item = 0): void { mon.item = item || (mon.species % 10 === 0 ? 1 : 0); }
export function IsMonShiny(mon: Pokemon): boolean { return IsShinyOtIdPersonality(mon.otId, mon.personality); }
export function IsShinyOtIdPersonality(otId: number, personality: number): boolean { return (((otId >>> 16) ^ (otId & 0xffff) ^ (personality >>> 16) ^ (personality & 0xffff)) < 8); }
export function GetPlayerPartyHighestLevel(r = req()): number { return Math.max(1, ...r.playerParty.filter(m => m.species).map(m => m.level)); }
export function FacilityClassToPicIndex(facilityClass: number): number { return facilityClass % 92; }
export function ShouldIgnoreDeoxysForm(_caseId = 0, _r = req()): boolean { return false; }
export function GetDeoxysStat(mon: Pokemon, statId: number): number { return [mon.maxHp, mon.attack, mon.defense, mon.speed, mon.spAttack, mon.spDefense][statId] ?? 0; }
export function SetDeoxysStats(mon: Pokemon): void { CalculateMonStats(mon); mon.attack += 10; mon.speed += 10; }
export function GetUnionRoomTrainerPic(id: number): number { return id % 92; }
export function GetUnionRoomTrainerClass(id: number): number { return id % 32; }
export function CreateEnemyEventMon(species: number, level: number, r = req()): void { CreateMon(r.enemyParty[0], species, level, 0, false, 0, 0, 0, r); CalculateEnemyPartyCount(r); }
export function HandleSetPokedexFlag(species: number, _caseId = 0, r = req()): void { r.pokedex.add(species); }
export function CheckBattleTypeGhost(r = req()): boolean { return (r.battleTypeFlags & 0x80) !== 0; }
const setDisplayedBattleString = (r: PokemonRuntime, text: string): string => { r.displayedBattleString = text; r.stringBuffers[0] = text; return r.displayedBattleString; };
const getItemEffect = (itemId: number, r: PokemonRuntime): number[] => {
  if (itemId === ITEM_ENIGMA_BERRY)
    return r.inBattle ? (r.enigmaBerryBattleItemEffects[r.battlerInMenuId] ?? r.enigmaBerryItemEffect) : r.enigmaBerryItemEffect;
  return r.itemEffectTable[itemId - ITEM_POTION] ?? [0, 0, 0, 0];
};
const allocateMonSpritesGfxManager = (battlePosition: number, mode: number): MonSpritesGfxManager => {
  let numSprites: number;
  let position = battlePosition;
  let resolvedMode = mode;
  if (mode === 1) {
    if (position === MAX_BATTLERS_COUNT) {
      numSprites = 4;
      position = 4;
    } else {
      if (position > MAX_BATTLERS_COUNT)
        position = 0;
      numSprites = 1;
      position = 1;
    }
  } else {
    if (!position)
      position = 1;
    if (position > 8)
      position = 8;
    numSprites = position;
    resolvedMode = 0;
  }
  const numFrames = MAX_MON_PIC_FRAMES;
  const dataSize = numFrames * MON_PIC_SIZE;
  const spriteBuffer = new Uint8Array(numSprites * dataSize);
  const spritePointers = Array.from({ length: numSprites }, (_v, i) => spriteBuffer.subarray(i * dataSize, (i + 1) * dataSize));
  return { mode: resolvedMode, active: GFX_MANAGER_ACTIVE, numSprites, battlePosition: position, numFrames, dataSize, spriteBuffer, spritePointers };
};

export function Battle_PrintStatBoosterEffectMessage(itemId: number, r = req()): string {
  const itemEffect = getItemEffect(itemId, r);
  r.potentialItemEffectBattler = r.battlerInMenuId;
  for (let i = 0; i < 3; i++) {
    if ((itemEffect[i] ?? 0) & [ITEM0_X_ATTACK, ITEM1_X_SPEED, ITEM2_X_SPATK][i])
      BufferStatRoseMessage(i * 2, r);
    if ((itemEffect[i] ?? 0) & [ITEM0_DIRE_HIT, ITEM1_X_DEFEND, ITEM2_X_ACCURACY][i]) {
      if (i !== 0)
        BufferStatRoseMessage(i * 2 + 1, r);
      else {
        r.battlerAttacker = r.battlerInMenuId;
        setDisplayedBattleString(r, 'gBattleText_GetPumped');
      }
    }
  }
  if ((itemEffect[3] ?? 0) & ITEM3_GUARD_SPEC) {
    r.battlerAttacker = r.battlerInMenuId;
    setDisplayedBattleString(r, 'gBattleText_MistShroud');
  }
  return r.displayedBattleString;
}
export function GetMonSpritePalStruct(mon: Pokemon, r = req()): CompressedSpritePalette { return GetMonSpritePalStructFromOtIdPersonality(mon.species, mon.otId, mon.personality, r); }
export function GetMonSpritePalStructFromOtIdPersonality(species: number, otId: number, personality: number, r = req()): CompressedSpritePalette { return IsShinyOtIdPersonality(otId, personality) ? r.monShinyPaletteTable[species] : r.monPaletteTable[species]; }
export function GetTrainerPartnerName(r = req()): string {
  const id = r.multiplayerId;
  const partnerLinkPlayerId = (r.linkPlayers[id]?.id ?? 0) ^ 2;
  const partnerId = r.linkPlayers.findIndex(player => player.id === partnerLinkPlayerId);
  return r.linkPlayers[partnerId < 0 ? 0 : partnerId]?.name ?? '';
}
export function CreateMonSpritesGfxManager(battlePosition: number, mode: number, r = req()): MonSpritesGfxManager | null {
  if (r.monSpritesGfxManager?.active === GFX_MANAGER_ACTIVE)
    return null;
  r.monSpritesGfxManager = allocateMonSpritesGfxManager(battlePosition, mode);
  return r.monSpritesGfxManager;
}
export function MonSpritesGfxManager_GetSpritePtr(spriteNum: number, r = req()): Uint8Array | null {
  const manager = r.monSpritesGfxManager;
  if (!manager || manager.active !== GFX_MANAGER_ACTIVE)
    return null;
  let sprite = spriteNum;
  if (sprite >= (manager.numSprites << 24 >> 24))
    sprite = 0;
  return manager.spritePointers[sprite] ?? manager.spritePointers[0] ?? null;
}
export function InitMonSpritesGfx_Mode1(numSprites = 4, r = req()): void { r.monSpritesGfxManager = allocateMonSpritesGfxManager(numSprites === MAX_BATTLERS_COUNT ? MAX_BATTLERS_COUNT : 0, 1); if (numSprites !== r.monSpritesGfxManager.numSprites) r.monSpritesGfxManager.numSprites = numSprites; }
export function InitMonSpritesGfx_Mode0(numSprites = 4, r = req()): void { r.monSpritesGfxManager = allocateMonSpritesGfxManager(numSprites, 0); }
export function DestroyMonSpritesGfxManager(r = req()): void { r.monSpritesGfxManager = null; }
