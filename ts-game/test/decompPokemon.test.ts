import { describe, expect, it } from 'vitest';
import {
  CalculateBaseDamage,
  CalculateBoxMonChecksum,
  CalculateEnemyPartyCount,
  CalculateMonStats,
  CalculatePPWithBonus,
  CanMonLearnTMHM,
  CheckBattleTypeGhost,
  CheckPartyHasHadPokerus,
  CheckPartyPokerus,
  ClearBattleMonForms,
  CopyPlayerPartyMonToBattleData,
  CountAliveMonsInBattle,
  CreateEnemyEventMon,
  CreateMon,
  CreateMonSpritesGfxManager,
  CreateMonWithEVSpread,
  CreateMonWithIVsPersonality,
  CreateSecretBaseEnemyParty,
  DeleteFirstMoveAndGiveMoveToMon,
  DestroyMonSpritesGfxManager,
  DrawSpindaSpots,
  EncryptBoxMon,
  EvolutionRenameMon,
  ExecuteTableBasedItemEffect,
  FacilityClassToPicIndex,
  GetAbilityBySpecies,
  GetBattleBGM,
  GetDefaultMoveTarget,
  GetDeoxysStat,
  GetEvolutionTargetSpecies,
  GetFlavorRelationByPersonality,
  GetGenderFromSpeciesAndPersonality,
  GetItemEffectParamOffset,
  GetLevelFromMonExp,
  GetMonAbility,
  GetMonData3,
  GetMonEVCount,
  GetMonFlavorRelation,
  GetMonGender,
  GetMonSpritePalStruct,
  GetMonSpritePalStructFromOtIdPersonality,
  GetMoveRelearnerMoves,
  GetNature,
  GetNatureFromPersonality,
  GetNumberOfRelearnableMoves,
  GetPlayerFlankId,
  GetPlayerPartyHighestLevel,
  GetSpeciesName,
  GetTrainerPartnerName,
  GiveMonToPlayer,
  GiveMoveToMon,
  HandleSetPokedexFlag,
  HealStatusConditions,
  HoennPokedexNumToSpecies,
  InitMonSpritesGfx_Mode0,
  InitMonSpritesGfx_Mode1,
  IsHMMove2,
  IsMonShiny,
  IsMonSpriteNotFlipped,
  IsOtherTrainer,
  IsPlayerPartyAndPokemonStorageFull,
  IsPokemonStorageFull,
  IsShinyOtIdPersonality,
  IsTradedMon,
  ITEM0_DIRE_HIT,
  ITEM0_X_ATTACK,
  ITEM1_X_DEFEND,
  ITEM3_GUARD_SPEC,
  ITEM_ENIGMA_BERRY,
  ITEM_POTION,
  MON_DATA_LEVEL,
  MON_DATA_NICKNAME,
  MON_DATA_STATUS,
  ModifyStatByNature,
  MonGainEVs,
  MonSpritesGfxManager_GetSpritePtr,
  MonRestorePP,
  NationalPokedexNumToSpecies,
  PARTY_SIZE,
  PartyMonHasStatus,
  PartySpreadPokerus,
  PlayBattleBGM,
  PlayMapChosenOrBattleBGM,
  PokemonItemUseNoEffect,
  PokemonUseItemEffects,
  RemoveMonPPBonus,
  SendMonToPC,
  SetDeoxysStats,
  SetMonData,
  SetMonExpWithMaxLevelCheck,
  SetMonPreventsSwitchingString,
  SetMultiuseSpriteTemplateToPokemon,
  SetMultiuseSpriteTemplateToTrainerBack,
  SetWildMonHeldItem,
  SpeciesToCryId,
  SpeciesToNationalPokedexNum,
  TryIncrementMonLevel,
  UpdatePartyPokerusTime,
  ZeroEnemyPartyMons,
  ZeroPlayerPartyMons,
  Battle_PrintStatBoosterEffectMessage,
  createPokemonRuntime
} from '../src/game/decompPokemon';

describe('decompPokemon', () => {
  it('creates mons, initializes moves/stats, and preserves box data operations', () => {
    const runtime = createPokemonRuntime({ randomSeed: 7 });
    const mon = runtime.playerParty[0];

    CreateMon(mon, 25, 20, 10, true, 12345, 1, 999, runtime);

    expect(mon.species).toBe(25);
    expect(mon.level).toBe(20);
    expect(mon.exp).toBe(8000);
    expect(mon.otId).toBe(999);
    expect(mon.nickname).toBe('SPECIES_25');
    expect(mon.ivs).toEqual([10, 10, 10, 10, 10, 10]);
    expect(mon.moves).toEqual([26, 27, 0, 0]);
    expect(mon.maxHp).toBeGreaterThan(0);

    expect(GiveMoveToMon(mon, 85)).toBe(85);
    expect(mon.moves).toEqual([26, 27, 85, 0]);
    DeleteFirstMoveAndGiveMoveToMon(mon, 99);
    expect(mon.moves).toEqual([27, 85, 0, 99]);

    expect(CalculateBoxMonChecksum(mon)).toBeGreaterThan(0);
    EncryptBoxMon(mon);
    expect(mon.encrypted).toBe(true);
    SetMonData(mon, MON_DATA_NICKNAME, 'CUTIE');
    expect(GetMonData3(mon, MON_DATA_NICKNAME)).toBe('CUTIE');
    expect(GetMonData3(mon, MON_DATA_LEVEL)).toBe(20);
  });

  it('moves mons through player party, storage, and battle data exactly by slot state', () => {
    const runtime = createPokemonRuntime();
    const mon = runtime.playerParty[0];

    CreateMon(mon, 4, 12, 7, true, 2, 1, 22, runtime);
    ZeroPlayerPartyMons(runtime);
    expect(GiveMonToPlayer(mon, runtime)).toBe(0);
    expect(runtime.playerPartyCount).toBe(1);

    for (let i = 1; i < PARTY_SIZE; i++) {
      CreateMon(runtime.playerParty[i], 10 + i, 8 + i, 4, true, i, 1, i, runtime);
    }
    expect(GiveMonToPlayer(mon, runtime)).toBe(1);
    expect(runtime.storage[0]).toHaveLength(1);
    expect(SendMonToPC(mon, runtime)).toBe(1);

    CopyPlayerPartyMonToBattleData(0, 0, runtime);
    expect(runtime.battleMons[0].species).toBe(4);
    expect(CountAliveMonsInBattle(runtime)).toBe(1);
    expect(GetDefaultMoveTarget(0, 33, runtime)).toBe(1);

    runtime.storage = Array.from({ length: 14 }, () => Array.from({ length: 30 }, () => mon));
    expect(IsPokemonStorageFull(runtime)).toBe(true);
    expect(IsPlayerPartyAndPokemonStorageFull(runtime)).toBe(true);
  });

  it('applies item/status/PP/level/evolution paths using the same mutable mon data', () => {
    const runtime = createPokemonRuntime();
    const mon = runtime.playerParty[0];
    CreateMon(mon, 30, 10, 5, true, 11, 1, 1, runtime);

    mon.status = 0b1010;
    expect(PartyMonHasStatus(mon, 0, 0b1000, 0)).toBe(true);
    expect(HealStatusConditions(mon, 0, 0b1000, 0)).toBe(true);
    expect(mon.status).toBe(0b0010);

    mon.hp = 1;
    expect(PokemonUseItemEffects(mon, 13, runtime)).toBe(true);
    expect(mon.hp).toBe(mon.maxHp);
    expect(PokemonItemUseNoEffect(mon, 1, runtime)).toBe(true);
    expect(ExecuteTableBasedItemEffect(mon, 13, runtime)).toBe(0);

    mon.moves[0] = 44;
    mon.pp[0] = 0;
    expect(CalculatePPWithBonus(44, 3, 0)).toBeGreaterThan(mon.pp[0]);
    RemoveMonPPBonus(mon, 0);
    expect(mon.pp[0]).toBeGreaterThan(0);
    mon.pp = [0, 0, 0, 0];
    MonRestorePP(mon);
    expect(mon.pp[0]).toBeGreaterThan(0);

    SetMonExpWithMaxLevelCheck(mon, 16 * 16 * 16);
    expect(GetLevelFromMonExp(mon)).toBe(16);
    expect(TryIncrementMonLevel(mon)).toBe(true);
    mon.friendship = 220;
    expect(GetEvolutionTargetSpecies(mon)).toBe(31);
    expect(CanMonLearnTMHM(mon, 1)).toBe(true);
    expect(GetMoveRelearnerMoves(mon)).toContain(31);
    expect(GetNumberOfRelearnableMoves(mon)).toBeGreaterThan(0);
    expect(GetItemEffectParamOffset(3, 5)).toBe(29);
  });

  it('keeps battle, nature, EV, pokerus, shiny, and traded helper logic wired together', () => {
    const runtime = createPokemonRuntime();
    const mon = runtime.playerParty[0];
    CreateMonWithIVsPersonality(mon, 33, 20, [1, 2, 3, 4, 5, 6], 26, runtime);

    expect(GetNature(mon)).toBe(GetNatureFromPersonality(26));
    expect(GetMonGender(mon)).toBe(GetGenderFromSpeciesAndPersonality(33, 26));
    expect(GetMonAbility(mon)).toBe(GetAbilityBySpecies(33, mon.abilityNum));
    expect(ModifyStatByNature(0, 100, 1)).toBe(110);
    expect(GetMonFlavorRelation(mon, 1)).toBe(GetFlavorRelationByPersonality(mon.personality, 1));

    CreateMonWithEVSpread(mon, 33, 20, 5, 2, runtime);
    expect(GetMonEVCount(mon)).toBe(252);
    MonGainEVs(mon, 5);
    expect(GetMonEVCount(mon)).toBe(253);

    mon.pokerus = 0x13;
    expect(CheckPartyPokerus(1, runtime)).toBe(true);
    expect(CheckPartyHasHadPokerus(1, runtime)).toBe(true);
    PartySpreadPokerus(runtime);
    expect(runtime.playerParty[1].pokerus).toBe(0x13);
    UpdatePartyPokerusTime(1, runtime);
    expect(runtime.playerParty[0].pokerus).toBe(0x12);

    mon.otId = 0;
    mon.personality = 0;
    expect(IsShinyOtIdPersonality(0, 0)).toBe(true);
    expect(IsMonShiny(mon)).toBe(true);
    expect(IsOtherTrainer(mon, 10, 'PLAYER')).toBe(true);
    expect(IsTradedMon(mon, 10, 'PLAYER')).toBe(true);

    const damage = CalculateBaseDamage(mon, mon, 40);
    expect(damage).toBeGreaterThan(0);
  });

  it('exposes misc pokedex, sprite, music, secret base, and gfx manager behavior', () => {
    const runtime = createPokemonRuntime({ battleMusic: 321, mapMusic: 654, battleTypeFlags: 0x80, multiplayerId: 1 });

    expect(HoennPokedexNumToSpecies(9)).toBe(9);
    expect(NationalPokedexNumToSpecies(9)).toBe(9);
    expect(SpeciesToNationalPokedexNum(9)).toBe(9);
    expect(SpeciesToCryId(9)).toBe(9);
    expect(GetSpeciesName(9)).toBe('SPECIES_9');

    SetMultiuseSpriteTemplateToPokemon(9, 2, runtime);
    expect(runtime.multiuseSpriteTemplate).toEqual({ kind: 'pokemon', species: 9, battlerPosition: 2 });
    SetMultiuseSpriteTemplateToTrainerBack(7, 3, runtime);
    expect(runtime.multiuseSpriteTemplate).toEqual({ kind: 'trainerBack', trainerPicId: 7, battlerPosition: 3 });

    CreateSecretBaseEnemyParty(runtime);
    expect(CalculateEnemyPartyCount(runtime)).toBe(3);
    ZeroEnemyPartyMons(runtime);
    CreateEnemyEventMon(92, 40, runtime);
    expect(runtime.enemyPartyCount).toBe(1);

    expect(GetBattleBGM(runtime)).toBe(321);
    PlayBattleBGM(runtime);
    PlayMapChosenOrBattleBGM(runtime);
    expect(runtime.operations).toContain('PlayBattleBGM:321');
    expect(runtime.operations).toContain('PlayBGM:654');
    expect(CheckBattleTypeGhost(runtime)).toBe(true);
    expect(GetPlayerFlankId(runtime)).toBe(1);

    InitMonSpritesGfx_Mode1(3, runtime);
    expect(runtime.monSpritesGfxManager).toMatchObject({ mode: 1, active: true, numSprites: 3 });
    InitMonSpritesGfx_Mode0(2, runtime);
    expect(runtime.monSpritesGfxManager).toMatchObject({ mode: 0, active: true, numSprites: 2 });
    DestroyMonSpritesGfxManager(runtime);
    expect(runtime.monSpritesGfxManager).toBeNull();

    const mon = runtime.playerParty[0];
    CreateMon(mon, 386, 50, 31, true, 1, 1, 2, runtime);
    expect(GetPlayerPartyHighestLevel(runtime)).toBe(50);
    SetDeoxysStats(mon);
    expect(GetDeoxysStat(mon, 1)).toBeGreaterThan(0);
    SetWildMonHeldItem(mon, 88);
    expect(mon.item).toBe(88);
    SetMonPreventsSwitchingString(mon, runtime);
    expect(runtime.stringBuffers[0]).toContain(mon.nickname);
    DrawSpindaSpots(mon, runtime);
    expect(runtime.operations.at(-1)).toBe(`DrawSpindaSpots:${mon.personality}`);
    HandleSetPokedexFlag(mon.species, 0, runtime);
    expect(runtime.pokedex.has(mon.species)).toBe(true);
    EvolutionRenameMon(mon);
    expect(mon.nickname).toBe('SPECIES_386');

    runtime.battleMons[0].species = 386.9;
    ClearBattleMonForms(runtime);
    expect(runtime.battleMons[0].species).toBe(386);
    expect(FacilityClassToPicIndex(95)).toBe(3);
    expect(IsHMMove2(0x102)).toBe(true);
    expect(IsMonSpriteNotFlipped(10)).toBe(true);
    expect(GetMonData3(mon, MON_DATA_STATUS)).toBe(0);
    CalculateMonStats(mon);
    expect(mon.maxHp).toBeGreaterThan(0);
  });

  it('ports exact C-name battle item, palette, partner, and mon sprite manager helpers', () => {
    const runtime = createPokemonRuntime({
      battlerInMenuId: 2,
      itemEffectTable: [[ITEM0_X_ATTACK, 0, 0, 0]],
      linkPlayers: [
        { id: 0, name: 'RED' },
        { id: 1, name: 'BLUE' },
        { id: 2, name: 'GREEN' },
        { id: 3, name: 'LEAF' }
      ],
      multiplayerId: 0
    });

    expect(Battle_PrintStatBoosterEffectMessage(ITEM_POTION, runtime)).toBe('STAT_1_ROSE');
    expect(runtime.potentialItemEffectBattler).toBe(2);

    runtime.itemEffectTable[0] = [ITEM0_DIRE_HIT, 0, 0, 0];
    expect(Battle_PrintStatBoosterEffectMessage(ITEM_POTION, runtime)).toBe('gBattleText_GetPumped');
    expect(runtime.battlerAttacker).toBe(2);

    runtime.itemEffectTable[0] = [0, 0, 0, ITEM3_GUARD_SPEC];
    expect(Battle_PrintStatBoosterEffectMessage(ITEM_POTION, runtime)).toBe('gBattleText_MistShroud');

    runtime.enigmaBerryItemEffect = [0, ITEM1_X_DEFEND, 0, 0];
    expect(Battle_PrintStatBoosterEffectMessage(ITEM_ENIGMA_BERRY, runtime)).toBe('STAT_2_ROSE');

    runtime.playerParty[0].species = 25;
    runtime.playerParty[0].otId = 0;
    runtime.playerParty[0].personality = 0;
    expect(GetMonSpritePalStruct(runtime.playerParty[0], runtime)).toBe(runtime.monShinyPaletteTable[25]);
    expect(GetMonSpritePalStructFromOtIdPersonality(25, 0xffff, 0, runtime)).toBe(runtime.monPaletteTable[25]);
    expect(GetTrainerPartnerName(runtime)).toBe('GREEN');

    const manager = CreateMonSpritesGfxManager(0, 0, runtime);
    expect(manager).toMatchObject({ mode: 0, active: true, numSprites: 1, battlePosition: 1, numFrames: 4, dataSize: 0x2000 });
    expect(manager?.spriteBuffer.byteLength).toBe(0x2000);
    expect(MonSpritesGfxManager_GetSpritePtr(99, runtime)).toBe(manager?.spritePointers[0]);
    expect(CreateMonSpritesGfxManager(4, 1, runtime)).toBeNull();

    DestroyMonSpritesGfxManager(runtime);
    const manager2 = CreateMonSpritesGfxManager(4, 1, runtime);
    expect(manager2).toMatchObject({ mode: 1, active: true, numSprites: 4, battlePosition: 4, numFrames: 4, dataSize: 0x2000 });
    expect(manager2?.spriteBuffer.byteLength).toBe(0x8000);
  });
});
