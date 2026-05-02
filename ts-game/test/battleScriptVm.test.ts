import { describe, expect, test } from 'vitest';
import { createBattlePokemonFromSpecies, createBattleState } from '../src/game/battle';
import {
  advanceBattleScriptVmToCommand,
  advanceBattleScriptVmToInstruction,
  beginBattleMoveVm,
  cloneBattlePostResult,
  createBattlePostResult,
  createBattleVmState,
  getBattleScriptCommandPlan,
  runEnemyOnlyTurnVm,
  runBattleScriptCommand,
  runSingleBattleTurnVm,
  resetBattlePostResult,
  resetBattleVmState,
  stepBattleScriptVmInstruction
} from '../src/game/battleScriptVm';

describe('battle script VM scaffolding', () => {
  test('extracts decomp battle script command plans through goto flow', () => {
    expect(getBattleScriptCommandPlan('BattleScript_EffectHit')).toEqual(expect.arrayContaining([
      'attackcanceler',
      'accuracycheck',
      'attackstring',
      'ppreduce',
      'critcalc',
      'damagecalc',
      'typecalc',
      'adjustnormaldamage',
      'healthbarupdate',
      'datahpupdate',
      'resultmessage',
      'tryfaintmon',
      'moveendall',
      'end'
    ]));
    expect(getBattleScriptCommandPlan('BattleScript_EffectAttackDown')).toEqual(expect.arrayContaining([
      'setstatchanger',
      'attackcanceler',
      'accuracycheck',
      'attackstring',
      'ppreduce',
      'statbuffchange',
      'moveendall'
    ]));
  });

  test('advances the VM program counter by real decomp command names', () => {
    const battle = createBattleState();
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');

    advanceBattleScriptVmToCommand(battle, 'attackcanceler');
    const afterAttackCanceler = battle.vm.pc;
    advanceBattleScriptVmToCommand(battle, 'accuracycheck');

    expect(afterAttackCanceler).toBeGreaterThan(0);
    expect(battle.vm.currentLabel).toBe('BattleScript_HitFromAccCheck');
    expect(battle.vm.pc).toBe(1);
    expect(battle.vm.locals.executedScriptCommands).toBe('attackcanceler,accuracycheck');
    expect(String(battle.vm.locals.visitedScriptInstructions)).toContain('jumpifnotmove');
  });

  test('steps decomp script control flow across labels and gotos', () => {
    const battle = createBattleState();
    battle.vm.currentLabel = 'BattleScript_EffectAttackDown';
    battle.currentScriptLabel = 'BattleScript_EffectAttackDown';

    const found = advanceBattleScriptVmToInstruction(battle, 'attackcanceler');

    expect(found?.opcode).toBe('attackcanceler');
    expect(String(battle.vm.locals.visitedScriptInstructions)).toBe('setstatchanger,goto,attackcanceler');
    expect(battle.vm.currentLabel).toBe('BattleScript_EffectStatDown');
    expect(battle.currentScriptLabel).toBe('BattleScript_EffectStatDown');
  });

  test('steps conditional jump targets when a branch resolver takes them', () => {
    const battle = createBattleState();
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.currentScriptLabel = 'BattleScript_EffectHit';

    const first = stepBattleScriptVmInstruction(battle, {
      shouldTakeBranch: (_battle, instruction) => instruction.opcode === 'jumpifnotmove'
    });

    expect(first.instruction?.opcode).toBeUndefined();
    expect(String(battle.vm.locals.visitedScriptInstructions)).toBe('jumpifnotmove');
    expect(battle.vm.currentLabel).toBe('BattleScript_HitFromAtkCanceler');
    expect(battle.vm.pc).toBe(0);
  });

  test('runtime branch resolver follows move, status, type, ability, and side checks', () => {
    const sleepBattle = createBattleState();
    sleepBattle.vm.currentLabel = 'BattleScript_EffectSleep';
    sleepBattle.currentScriptLabel = 'BattleScript_EffectSleep';
    sleepBattle.wildMon.status = 'sleep';
    advanceBattleScriptVmToCommand(sleepBattle, 'accuracycheck', {
      attackerSide: 'player',
      attacker: sleepBattle.playerMon,
      defender: sleepBattle.wildMon,
      move: { ...sleepBattle.moves[0]!, id: 'SLEEP_POWDER' }
    });
    expect(String(sleepBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifstatus');
    expect(String(sleepBattle.vm.locals.visitedScriptInstructions)).not.toContain('accuracycheck');

    const doublesUproarBattle = createBattleState({
      format: 'doubles',
      playerParty: [
        createBattlePokemonFromSpecies('CHARMANDER', 8),
        createBattlePokemonFromSpecies('PIDGEY', 7)
      ],
      opponentParty: [
        createBattlePokemonFromSpecies('GEODUDE', 8),
        createBattlePokemonFromSpecies('RATTATA', 7)
      ]
    });
    doublesUproarBattle.vm.currentLabel = 'BattleScript_EffectSleep';
    doublesUproarBattle.currentScriptLabel = 'BattleScript_EffectSleep';
    doublesUproarBattle.playerSide.party[1]!.volatile.uproarTurns = 2;
    advanceBattleScriptVmToCommand(doublesUproarBattle, 'accuracycheck', {
      attackerSide: 'player',
      attacker: doublesUproarBattle.playerMon,
      defender: doublesUproarBattle.wildMon,
      move: { ...doublesUproarBattle.moves[0]!, id: 'SLEEP_POWDER' }
    });
    expect(String(doublesUproarBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifcantmakeasleep');
    expect(String(doublesUproarBattle.vm.locals.visitedScriptInstructions)).not.toContain('accuracycheck');

    const poisonBattle = createBattleState();
    poisonBattle.vm.currentLabel = 'BattleScript_EffectPoison';
    poisonBattle.currentScriptLabel = 'BattleScript_EffectPoison';
    poisonBattle.wildMon.types = ['poison'];
    advanceBattleScriptVmToCommand(poisonBattle, 'setmoveeffect', {
      attackerSide: 'player',
      attacker: poisonBattle.playerMon,
      defender: poisonBattle.wildMon,
      move: { ...poisonBattle.moves[0]!, id: 'POISON_POWDER' }
    });
    expect(String(poisonBattle.vm.locals.visitedScriptInstructions)).toContain('jumpiftype');

    const abilityBattle = createBattleState();
    abilityBattle.vm.currentLabel = 'BattleScript_EffectConfuse';
    abilityBattle.currentScriptLabel = 'BattleScript_EffectConfuse';
    abilityBattle.wildMon.abilityId = 'OWN_TEMPO';
    advanceBattleScriptVmToCommand(abilityBattle, 'accuracycheck', {
      attackerSide: 'player',
      attacker: abilityBattle.playerMon,
      defender: abilityBattle.wildMon,
      move: { ...abilityBattle.moves[0]!, id: 'CONFUSE_RAY' }
    });
    expect(String(abilityBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifability');

    const safeguardBattle = createBattleState();
    safeguardBattle.vm.currentLabel = 'BattleScript_EffectSleep';
    safeguardBattle.currentScriptLabel = 'BattleScript_EffectSleep';
    safeguardBattle.sideState.opponent.safeguardTurns = 3;
    advanceBattleScriptVmToCommand(safeguardBattle, 'setmoveeffect', {
      attackerSide: 'player',
      attacker: safeguardBattle.playerMon,
      defender: safeguardBattle.wildMon,
      move: { ...safeguardBattle.moves[0]!, id: 'SLEEP_POWDER' }
    });
    expect(String(safeguardBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifsideaffecting');
  });

  test('runtime branch resolver follows no-effect, ability-present, weather, and chosen-move checks', () => {
    const noEffectBattle = createBattleState();
    noEffectBattle.vm.currentLabel = 'BattleScript_EffectAbsorb';
    noEffectBattle.currentScriptLabel = 'BattleScript_EffectAbsorb';
    noEffectBattle.vm.locals.lastTypeEffectiveness = 0;
    advanceBattleScriptVmToCommand(noEffectBattle, 'moveendall', {
      attackerSide: 'player',
      attacker: noEffectBattle.playerMon,
      defender: noEffectBattle.wildMon,
      move: { ...noEffectBattle.moves[0]!, id: 'ABSORB' }
    });
    expect(String(noEffectBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifmovehadnoeffect');

    const solarBattle = createBattleState();
    solarBattle.vm.currentLabel = 'BattleScript_EffectSolarBeam';
    solarBattle.currentScriptLabel = 'BattleScript_EffectSolarBeam';
    solarBattle.weather = 'sun';
    advanceBattleScriptVmToCommand(solarBattle, 'attackcanceler', {
      attackerSide: 'player',
      attacker: solarBattle.playerMon,
      defender: solarBattle.wildMon,
      move: { ...solarBattle.moves[0]!, id: 'SOLAR_BEAM' }
    });
    expect(String(solarBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifhalfword');

    const weatherAbilityBattle = createBattleState();
    weatherAbilityBattle.vm.currentLabel = 'BattleScript_EffectSolarBeam';
    weatherAbilityBattle.currentScriptLabel = 'BattleScript_EffectSolarBeam';
    weatherAbilityBattle.playerMon.abilityId = 'CLOUD_NINE';
    advanceBattleScriptVmToCommand(weatherAbilityBattle, 'attackcanceler', {
      attackerSide: 'player',
      attacker: weatherAbilityBattle.playerMon,
      defender: weatherAbilityBattle.wildMon,
      move: { ...weatherAbilityBattle.moves[0]!, id: 'SOLAR_BEAM' }
    });
    expect(String(weatherAbilityBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifabilitypresent');

    const chosenMoveBattle = createBattleState();
    chosenMoveBattle.vm.currentLabel = 'BattleScript_EffectMultiHit';
    chosenMoveBattle.currentScriptLabel = 'BattleScript_EffectMultiHit';
    advanceBattleScriptVmToCommand(chosenMoveBattle, 'critcalc', {
      attackerSide: 'player',
      attacker: chosenMoveBattle.playerMon,
      defender: chosenMoveBattle.wildMon,
      move: { ...chosenMoveBattle.moves[0]!, id: 'SLEEP_TALK' }
    });
    expect(String(chosenMoveBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifhalfword');
  });

  test('runtime branch resolver follows battle-type, hp, stat, and byte comparison checks', () => {
    const trainerTeleport = createBattleState({ mode: 'trainer' });
    trainerTeleport.vm.currentLabel = 'BattleScript_EffectTeleport';
    trainerTeleport.currentScriptLabel = 'BattleScript_EffectTeleport';
    advanceBattleScriptVmToCommand(trainerTeleport, 'getifcantrunfrombattle', {
      attackerSide: 'player',
      attacker: trainerTeleport.playerMon,
      defender: trainerTeleport.wildMon,
      move: { ...trainerTeleport.moves[0]!, id: 'TELEPORT' }
    });
    expect(String(trainerTeleport.vm.locals.visitedScriptInstructions)).toContain('jumpifbattletype');
    expect(String(trainerTeleport.vm.locals.visitedScriptInstructions)).not.toContain('getifcantrunfrombattle');

    const faintedMultiHit = createBattleState();
    faintedMultiHit.vm.currentLabel = 'BattleScript_EffectMultiHit';
    faintedMultiHit.currentScriptLabel = 'BattleScript_EffectMultiHit';
    faintedMultiHit.playerMon.hp = 0;
    advanceBattleScriptVmToCommand(faintedMultiHit, 'critcalc', {
      attackerSide: 'player',
      attacker: faintedMultiHit.playerMon,
      defender: faintedMultiHit.wildMon,
      move: { ...faintedMultiHit.moves[0]!, id: 'DOUBLE_SLAP' }
    });
    expect(String(faintedMultiHit.vm.locals.visitedScriptInstructions)).toContain('jumpifhasnohp');
    expect(String(faintedMultiHit.vm.locals.visitedScriptInstructions)).not.toContain('critcalc');

    const cappedCurse = createBattleState();
    cappedCurse.vm.currentLabel = 'BattleScript_EffectCurse';
    cappedCurse.currentScriptLabel = 'BattleScript_EffectCurse';
    cappedCurse.playerMon.statStages.speed = -6;
    cappedCurse.playerMon.statStages.attack = 6;
    cappedCurse.playerMon.statStages.defense = 6;
    advanceBattleScriptVmToCommand(cappedCurse, 'attackanimation', {
      attackerSide: 'player',
      attacker: cappedCurse.playerMon,
      defender: cappedCurse.wildMon,
      move: { ...cappedCurse.moves[0]!, id: 'CURSE' }
    });
    expect(String(cappedCurse.vm.locals.visitedScriptInstructions)).toContain('jumpifstat');
    expect(String(cappedCurse.vm.locals.visitedScriptInstructions)).not.toContain('attackanimation');

    const perishSong = createBattleState({ format: 'doubles' });
    perishSong.vm.currentLabel = 'BattleScript_EffectPerishSong';
    perishSong.currentScriptLabel = 'BattleScript_EffectPerishSong';
    advanceBattleScriptVmToCommand(perishSong, 'moveendall', {
      attackerSide: 'player',
      attacker: perishSong.playerMon,
      defender: perishSong.wildMon,
      move: { ...perishSong.moves[0]!, id: 'PERISH_SONG' }
    });
    expect(String(perishSong.vm.locals.visitedScriptInstructions)).toContain('jumpifbytenotequal');
    expect(Number(perishSong.vm.locals.sBATTLER)).toBeGreaterThan(0);
  });

  test('runtime branch resolver follows sleep, switch, first-turn, no-damage, and byte-equal checks', () => {
    const sleepBattle = createBattleState();
    sleepBattle.vm.currentLabel = 'BattleScript_EffectSleep';
    sleepBattle.currentScriptLabel = 'BattleScript_EffectSleep';
    sleepBattle.wildMon.abilityId = 'INSOMNIA';
    advanceBattleScriptVmToCommand(sleepBattle, 'setmoveeffect', {
      attackerSide: 'player',
      attacker: sleepBattle.playerMon,
      defender: sleepBattle.wildMon,
      move: { ...sleepBattle.moves[0]!, id: 'SLEEP_POWDER' }
    });
    expect(String(sleepBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifcantmakeasleep');
    expect(String(sleepBattle.vm.locals.visitedScriptInstructions)).not.toContain('setmoveeffect');

    const batonPassBattle = createBattleState();
    batonPassBattle.vm.currentLabel = 'BattleScript_EffectBatonPass';
    batonPassBattle.currentScriptLabel = 'BattleScript_EffectBatonPass';
    batonPassBattle.playerMon.volatile.rooted = true;
    advanceBattleScriptVmToCommand(batonPassBattle, 'openpartyscreen', {
      attackerSide: 'player',
      attacker: batonPassBattle.playerMon,
      defender: batonPassBattle.wildMon,
      move: { ...batonPassBattle.moves[0]!, id: 'BATON_PASS' }
    });
    expect(String(batonPassBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifcantswitch');
    expect(String(batonPassBattle.vm.locals.visitedScriptInstructions)).not.toContain('openpartyscreen');

    const fakeOutBattle = createBattleState();
    fakeOutBattle.vm.currentLabel = 'BattleScript_EffectFakeOut';
    fakeOutBattle.currentScriptLabel = 'BattleScript_EffectFakeOut';
    fakeOutBattle.playerMon.volatile.activeTurns = 1;
    advanceBattleScriptVmToCommand(fakeOutBattle, 'setmoveeffect', {
      attackerSide: 'player',
      attacker: fakeOutBattle.playerMon,
      defender: fakeOutBattle.wildMon,
      move: { ...fakeOutBattle.moves[0]!, id: 'FAKE_OUT' }
    });
    expect(String(fakeOutBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifnotfirstturn');
    expect(String(fakeOutBattle.vm.locals.visitedScriptInstructions)).not.toContain('setmoveeffect');

    const focusPunchBattle = createBattleState();
    focusPunchBattle.vm.currentLabel = 'BattleScript_EffectFocusPunch';
    focusPunchBattle.currentScriptLabel = 'BattleScript_EffectFocusPunch';
    focusPunchBattle.vm.locals.lastCalculatedDamage = 0;
    advanceBattleScriptVmToCommand(focusPunchBattle, 'ppreduce', {
      attackerSide: 'player',
      attacker: focusPunchBattle.playerMon,
      defender: focusPunchBattle.wildMon,
      move: { ...focusPunchBattle.moves[0]!, id: 'FOCUS_PUNCH' }
    });
    expect(String(focusPunchBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifnodamage');
    expect(String(focusPunchBattle.vm.locals.visitedScriptInstructions)).toContain('accuracycheck');

    const teeterDanceBattle = createBattleState();
    teeterDanceBattle.vm.currentLabel = 'BattleScript_EffectTeeterDance';
    teeterDanceBattle.currentScriptLabel = 'BattleScript_EffectTeeterDance';
    teeterDanceBattle.vm.locals.gBattlerTarget = 0;
    advanceBattleScriptVmToCommand(teeterDanceBattle, 'jumpifability', {
      attackerSide: 'player',
      attacker: teeterDanceBattle.playerMon,
      defender: teeterDanceBattle.wildMon,
      move: { ...teeterDanceBattle.moves[0]!, id: 'TEETER_DANCE' }
    });
    expect(String(teeterDanceBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifbyteequal');
    expect(Number(teeterDanceBattle.vm.locals.gBattlerTarget)).toBeGreaterThan(0);

    const swaggerBattle = createBattleState();
    swaggerBattle.vm.currentLabel = 'BattleScript_EffectSwagger';
    swaggerBattle.currentScriptLabel = 'BattleScript_EffectSwagger';
    swaggerBattle.wildMon.volatile.confusionTurns = 2;
    swaggerBattle.wildMon.statStages.attack = 6;
    advanceBattleScriptVmToCommand(swaggerBattle, 'attackanimation', {
      attackerSide: 'player',
      attacker: swaggerBattle.playerMon,
      defender: swaggerBattle.wildMon,
      move: { ...swaggerBattle.moves[0]!, id: 'SWAGGER' }
    });
    expect(String(swaggerBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifconfusedandstatmaxed');
    expect(String(swaggerBattle.vm.locals.visitedScriptInstructions)).not.toContain('attackanimation');
  });

  test('runtime branch resolver follows pursuit and spread-target continuation checks', () => {
    const pursuitBattle = createBattleState();
    pursuitBattle.vm.currentLabel = 'BattleScript_PursuitSwitchDmgLoop';
    pursuitBattle.currentScriptLabel = 'BattleScript_PursuitSwitchDmgLoop';
    pursuitBattle.vm.locals.pursuitSwitchDamage = false;
    advanceBattleScriptVmToCommand(pursuitBattle, 'swapattackerwithtarget', {
      attackerSide: 'player',
      attacker: pursuitBattle.playerMon,
      defender: pursuitBattle.wildMon
    });
    expect(String(pursuitBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifnopursuitswitchdmg');
    expect(String(pursuitBattle.vm.locals.visitedScriptInstructions)).not.toContain('swapattackerwithtarget');

    const explosionBattle = createBattleState();
    explosionBattle.vm.currentLabel = 'BattleScript_ExplosionLoop';
    explosionBattle.currentScriptLabel = 'BattleScript_ExplosionLoop';
    explosionBattle.vm.locals.nextTargetValid = false;
    advanceBattleScriptVmToCommand(explosionBattle, 'moveendall', {
      attackerSide: 'player',
      attacker: explosionBattle.playerMon,
      defender: explosionBattle.wildMon,
      move: { ...explosionBattle.moves[0]!, id: 'EXPLOSION' }
    });
    expect(String(explosionBattle.vm.locals.visitedScriptInstructions)).toContain('jumpifnexttargetvalid');
  });

  test('records common decomp controller and message script commands while stepping', () => {
    const battle = createBattleState();
    battle.vm.currentLabel = 'BattleScript_EffectAbsorb';
    battle.currentScriptLabel = 'BattleScript_EffectAbsorb';

    advanceBattleScriptVmToCommand(battle, 'healthbarupdate', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move: { ...battle.moves[0]!, id: 'ABSORB' }
    });

    expect(battle.vm.locals.lastAnimationCommand).toBe('hitanimation');
    expect(battle.vm.locals.lastAnimationBattler).toBe('BS_TARGET');
    expect(String(battle.vm.locals.controllerScriptCommands)).toContain('attackanimation');
    expect(String(battle.vm.locals.controllerScriptCommands)).toContain('waitanimation');
    expect(String(battle.vm.locals.controllerScriptCommands)).toContain('effectivenesssound');
    expect(String(battle.vm.locals.controllerScriptCommands)).toContain('waitstate');

    const perishSong = createBattleState();
    perishSong.vm.currentLabel = 'BattleScript_EffectPerishSong';
    perishSong.currentScriptLabel = 'BattleScript_EffectPerishSong';
    advanceBattleScriptVmToCommand(perishSong, 'setbyte', {
      attackerSide: 'player',
      attacker: perishSong.playerMon,
      defender: perishSong.wildMon,
      move: { ...perishSong.moves[0]!, id: 'PERISH_SONG' }
    });

    expect(perishSong.vm.locals.lastPrintedStringId).toBe('STRINGID_FAINTINTHREE');
    expect(String(perishSong.vm.locals.printedStringIds)).toContain('STRINGID_FAINTINTHREE');
    expect(perishSong.vm.locals.lastWaitMessageDuration).toBe('B_WAIT_TIME_LONG');
  });

  test('records explicit decomp state-intent commands while stepping', () => {
    const screenBattle = createBattleState();
    screenBattle.vm.currentLabel = 'BattleScript_EffectLightScreen';
    screenBattle.currentScriptLabel = 'BattleScript_EffectLightScreen';
    advanceBattleScriptVmToCommand(screenBattle, 'moveendall', {
      attackerSide: 'player',
      attacker: screenBattle.playerMon,
      defender: screenBattle.wildMon,
      move: { ...screenBattle.moves[0]!, id: 'LIGHT_SCREEN' }
    });
    expect(String(screenBattle.vm.locals.stateScriptCommands)).toContain('setlightscreen');
    expect(screenBattle.vm.locals.lastPrintedStringTable).toBe('gReflectLightScreenSafeguardStringIds');

    const weatherBattle = createBattleState();
    weatherBattle.vm.currentLabel = 'BattleScript_EffectSandstorm';
    weatherBattle.currentScriptLabel = 'BattleScript_EffectSandstorm';
    advanceBattleScriptVmToCommand(weatherBattle, 'moveendall', {
      attackerSide: 'player',
      attacker: weatherBattle.playerMon,
      defender: weatherBattle.wildMon,
      move: { ...weatherBattle.moves[0]!, id: 'SANDSTORM' }
    });
    expect(String(weatherBattle.vm.locals.stateScriptCommands)).toContain('setsandstorm');

    const sonicboomBattle = createBattleState();
    sonicboomBattle.vm.currentLabel = 'BattleScript_EffectSonicboom';
    sonicboomBattle.currentScriptLabel = 'BattleScript_EffectSonicboom';
    advanceBattleScriptVmToCommand(sonicboomBattle, 'healthbarupdate', {
      attackerSide: 'player',
      attacker: sonicboomBattle.playerMon,
      defender: sonicboomBattle.wildMon,
      move: { ...sonicboomBattle.moves[0]!, id: 'SONIC_BOOM' }
    });
    expect(String(sonicboomBattle.vm.locals.stateScriptCommands)).toContain('adjustsetdamage');
  });

  test('records low-frequency decomp mechanic commands instead of silently skipping them', () => {
    const disableBattle = createBattleState();
    disableBattle.vm.currentLabel = 'BattleScript_EffectDisable';
    disableBattle.currentScriptLabel = 'BattleScript_EffectDisable';
    advanceBattleScriptVmToCommand(disableBattle, 'attackanimation', {
      attackerSide: 'player',
      attacker: disableBattle.playerMon,
      defender: disableBattle.wildMon,
      move: { ...disableBattle.moves[0]!, id: 'DISABLE' }
    });
    expect(String(disableBattle.vm.locals.stateScriptCommands)).toContain('disablelastusedattack:BattleScript_ButItFailed');

    const futureSightBattle = createBattleState();
    futureSightBattle.vm.currentLabel = 'BattleScript_EffectFutureSight';
    futureSightBattle.currentScriptLabel = 'BattleScript_EffectFutureSight';
    advanceBattleScriptVmToCommand(futureSightBattle, 'attackanimation', {
      attackerSide: 'player',
      attacker: futureSightBattle.playerMon,
      defender: futureSightBattle.wildMon,
      move: { ...futureSightBattle.moves[0]!, id: 'FUTURE_SIGHT' }
    });
    expect(String(futureSightBattle.vm.locals.stateScriptCommands)).toContain('trysetfutureattack:BattleScript_ButItFailed');

    const stockpileBattle = createBattleState();
    stockpileBattle.vm.currentLabel = 'BattleScript_EffectStockpile';
    stockpileBattle.currentScriptLabel = 'BattleScript_EffectStockpile';
    advanceBattleScriptVmToCommand(stockpileBattle, 'attackanimation', {
      attackerSide: 'player',
      attacker: stockpileBattle.playerMon,
      defender: stockpileBattle.wildMon,
      move: { ...stockpileBattle.moves[0]!, id: 'STOCKPILE' }
    });
    expect(String(stockpileBattle.vm.locals.stateScriptCommands)).toContain('stockpile');
  });

  test('applies side-condition and weather commands through VM handlers', () => {
    const screenBattle = createBattleState();
    const messages: string[] = [];
    screenBattle.vm.currentLabel = 'BattleScript_EffectLightScreen';
    screenBattle.currentScriptLabel = 'BattleScript_EffectLightScreen';

    runBattleScriptCommand(screenBattle, 'setlightscreen', {
      attackerSide: 'player',
      pushMessage: (text) => messages.push(text)
    });
    expect(screenBattle.sideState.player.lightScreenTurns).toBe(5);
    expect(messages).toEqual(['Your team became protected by Light Screen!']);

    runBattleScriptCommand(screenBattle, 'setlightscreen', {
      attackerSide: 'player',
      pushMessage: (text) => messages.push(text)
    });
    expect(messages.at(-1)).toBe('But it failed!');

    const weatherBattle = createBattleState();
    const weatherMessages: string[] = [];
    weatherBattle.vm.currentLabel = 'BattleScript_EffectSandstorm';
    weatherBattle.currentScriptLabel = 'BattleScript_EffectSandstorm';
    runBattleScriptCommand(weatherBattle, 'setsandstorm', {
      pushMessage: (text) => weatherMessages.push(text)
    });
    expect(weatherBattle.weather).toBe('sandstorm');
    expect(weatherBattle.weatherTurns).toBe(5);
    expect(weatherMessages).toEqual(['A sandstorm brewed!']);
  });

  test('applies volatile setup commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    battle.vm.currentLabel = 'BattleScript_EffectTorment';
    battle.currentScriptLabel = 'BattleScript_EffectTorment';

    runBattleScriptCommand(battle, 'settorment', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.wildMon.volatile.tormented).toBe(true);
    expect(messages.at(-1)).toContain('torment');

    runBattleScriptCommand(battle, 'setfocusenergy', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.volatile.focusEnergy).toBe(true);

    runBattleScriptCommand(battle, 'setseeded', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.wildMon.volatile.leechSeededBy).toBe('player');

    runBattleScriptCommand(battle, 'setyawn', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.wildMon.volatile.yawnTurns).toBe(2);
  });

  test('applies last-used-move restriction commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const lastMove = { ...battle.wildMoves[0]!, id: 'TACKLE', name: 'Tackle', ppRemaining: 10 };
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      },
      getLastUsedMove: () => lastMove,
      nextBattleRng: () => 1,
      pushMessage: (text: string) => messages.push(text)
    };

    battle.vm.currentLabel = 'BattleScript_EffectDisable';
    battle.currentScriptLabel = 'BattleScript_EffectDisable';
    runBattleScriptCommand(battle, 'disablelastusedattack', runtime);
    expect(battle.wildMon.volatile.disabledMoveId).toBe('TACKLE');
    expect(battle.wildMon.volatile.disableTurns).toBe(3);

    battle.vm.currentLabel = 'BattleScript_EffectEncore';
    battle.currentScriptLabel = 'BattleScript_EffectEncore';
    runBattleScriptCommand(battle, 'trysetencore', runtime);
    expect(battle.wildMon.volatile.encoreMoveId).toBe('TACKLE');
    expect(battle.wildMon.volatile.encoreTurns).toBe(4);

    battle.vm.currentLabel = 'BattleScript_EffectSpite';
    battle.currentScriptLabel = 'BattleScript_EffectSpite';
    runBattleScriptCommand(battle, 'tryspiteppreduce', runtime);
    expect(lastMove.ppRemaining).toBe(7);
    expect(messages.at(-1)).toContain('lost 3 PP');
  });

  test('applies setup utility commands through VM handlers', () => {
    const battle = createBattleState({ format: 'doubles' });
    const messages: string[] = [];
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text: string) => messages.push(text)
    };

    runBattleScriptCommand(battle, 'trysetspikes', runtime);
    expect(battle.sideState.opponent.spikesLayers).toBe(1);

    runBattleScriptCommand(battle, 'trysetgrudge', runtime);
    expect(battle.playerMon.volatile.grudge).toBe(true);

    runBattleScriptCommand(battle, 'trysetroots', runtime);
    expect(battle.playerMon.volatile.rooted).toBe(true);

    runBattleScriptCommand(battle, 'setminimize', runtime);
    expect(battle.playerMon.volatile.minimized).toBe(true);

    runBattleScriptCommand(battle, 'setdefensecurlbit', runtime);
    expect(battle.playerMon.volatile.defenseCurl).toBe(true);

    runBattleScriptCommand(battle, 'trysetmagiccoat', { ...runtime, defenderCanStillAct: true });
    expect(battle.playerMon.volatile.magicCoat).toBe(true);

    runBattleScriptCommand(battle, 'trysetsnatch', { ...runtime, defenderCanStillAct: true });
    expect(battle.playerMon.volatile.snatch).toBe(true);

    battle.playerMon.moves = [{ ...battle.moves[0]!, id: 'TACKLE' }];
    battle.wildMon.moves = [{ ...battle.wildMoves[0]!, id: 'TACKLE' }];
    runBattleScriptCommand(battle, 'tryimprison', runtime);
    expect(battle.playerMon.volatile.imprisoning).toBe(true);
  });

  test('applies field and targeting setup commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text: string) => messages.push(text)
    };

    runBattleScriptCommand(battle, 'settypebasedhalvers', {
      ...runtime,
      move: { ...battle.moves[0]!, effect: 'EFFECT_MUD_SPORT' }
    });
    expect(battle.mudSport).toBe(true);

    runBattleScriptCommand(battle, 'settypebasedhalvers', {
      ...runtime,
      move: { ...battle.moves[0]!, effect: 'EFFECT_WATER_SPORT' }
    });
    expect(battle.waterSport).toBe(true);

    battle.playerMon.types = ['fire'];
    runBattleScriptCommand(battle, 'settypetoterrain', {
      ...runtime,
      typeByTerrain: { [battle.terrain]: 'grass' }
    });
    expect(battle.playerMon.types).toEqual(['grass']);

    runBattleScriptCommand(battle, 'setalwayshitflag', runtime);
    expect(battle.wildMon.volatile.lockOnBy).toBe('player');
    expect(battle.wildMon.volatile.lockOnTurns).toBe(2);

    runBattleScriptCommand(battle, 'setforcedtarget', runtime);
    expect(battle.playerMon.volatile.followMe).toBe(true);

    runBattleScriptCommand(battle, 'seteffectprimary', {
      ...runtime,
      moveEffect: 'MOVE_EFFECT_PREVENT_ESCAPE'
    });
    expect(battle.wildMon.volatile.escapePreventedBy).toBe('player');

    battle.wildMon.statStages.attack = 2;
    battle.wildMon.statStages.evasion = -1;
    runBattleScriptCommand(battle, 'copyfoestats', runtime);
    expect(battle.playerMon.statStages.attack).toBe(2);
    expect(battle.playerMon.statStages.evasion).toBe(-1);

    battle.playerMon.statStages.attack = 4;
    battle.wildMon.statStages.defense = -3;
    runBattleScriptCommand(battle, 'normalisebuffs', runtime);
    expect(battle.playerMon.statStages.attack).toBe(0);
    expect(battle.wildMon.statStages.defense).toBe(0);

    const doublesBattle = createBattleState({
      format: 'doubles',
      playerParty: [
        createBattlePokemonFromSpecies('CHARMANDER', 8),
        createBattlePokemonFromSpecies('PIDGEY', 7)
      ],
      opponentParty: [
        createBattlePokemonFromSpecies('GEODUDE', 8),
        createBattlePokemonFromSpecies('RATTATA', 7)
      ]
    });
    doublesBattle.playerSide.party[1]!.statStages.speed = 3;
    doublesBattle.opponentSide.party[1]!.statStages.evasion = -4;
    runBattleScriptCommand(doublesBattle, 'normalisebuffs', runtime);
    expect(doublesBattle.playerSide.party[1]!.statStages.speed).toBe(0);
    expect(doublesBattle.opponentSide.party[1]!.statStages.evasion).toBe(0);

    battle.playerMon.status = 'burn';
    battle.playerMon.volatile.toxicCounter = 2;
    runBattleScriptCommand(battle, 'healpartystatus', runtime);
    expect(battle.playerMon.status).toBe('none');
    expect(battle.playerMon.volatile.toxicCounter).toBe(0);
  });

  test('applies setup status commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const queuedHp: Array<{ side: string; hp: number }> = [];
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text: string) => messages.push(text),
      applyQueuedDamage: (_battle: typeof battle, side: 'player' | 'opponent', hp: number) => queuedHp.push({ side, hp })
    };

    battle.playerMon.hp = 40;
    battle.playerMon.maxHp = 40;
    runBattleScriptCommand(battle, 'setsubstitute', runtime);
    expect(battle.playerMon.hp).toBe(30);
    expect(battle.playerMon.volatile.substituteHp).toBe(10);
    expect(queuedHp).toContainEqual({ side: 'player', hp: 30 });

    const protectMessages: string[] = [];
    runBattleScriptCommand(battle, 'setprotectlike', {
      ...runtime,
      move: { ...battle.moves[0]!, effect: 'EFFECT_ENDURE' },
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      },
      messages: protectMessages,
      defenderCanStillAct: true,
      tryUseProtect: (pokemon, _encounterState, targetMessages, _targetCanStillAct, successMessage) => {
        pokemon.volatile.protected = true;
        targetMessages.push(successMessage);
        return true;
      }
    });
    expect(battle.playerMon.volatile.protected).toBe(false);
    expect(battle.playerMon.volatile.enduring).toBe(true);
    expect(protectMessages).toEqual([`${battle.playerMon.species} braced itself!`]);

    runBattleScriptCommand(battle, 'tryinfatuating', runtime);
    expect(battle.wildMon.volatile.infatuatedBy).toBe('player');

    battle.playerMon.hp = 40;
    battle.playerMon.maxHp = 40;
    battle.wildMon.volatile.cursed = false;
    battle.wildMon.volatile.substituteHp = 0;
    runBattleScriptCommand(battle, 'cursetarget', runtime);
    expect(battle.playerMon.hp).toBe(20);
    expect(battle.wildMon.volatile.cursed).toBe(true);

    battle.playerMon.hp = 40;
    battle.playerMon.statStages.attack = 0;
    runBattleScriptCommand(battle, 'maxattackhalvehp', runtime);
    expect(battle.playerMon.hp).toBe(20);
    expect(battle.playerMon.statStages.attack).toBe(6);

    battle.playerMon.hp = 40;
    battle.wildMon.statStages.attack = 0;
    battle.wildMon.statStages.spAttack = 0;
    runBattleScriptCommand(battle, 'trymemento', {
      ...runtime,
      messages,
      applyDirectStageChange: (pokemon, stat, delta, targetMessages) => {
        pokemon.statStages[stat] = Math.max(-6, Math.min(6, pokemon.statStages[stat] + delta));
        targetMessages.push(`${pokemon.species}'s ${stat} changed!`);
      }
    });
    runBattleScriptCommand(battle, 'setatkhptozero', runtime);
    expect(battle.playerMon.hp).toBe(0);
    expect(battle.wildMon.statStages.attack).toBe(-2);
    expect(battle.wildMon.statStages.spAttack).toBe(-2);
  });

  test('applies post-hit move-effect commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move: battle.moves[0]!,
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      },
      nextBattleRng: () => 1,
      pushMessage: (text: string) => messages.push(text)
    };

    runBattleScriptCommand(battle, 'seteffectprimary', { ...runtime, moveEffect: 'MOVE_EFFECT_PAYDAY' });
    expect(battle.payDayMoney).toBe(battle.playerMon.level * 5);

    runBattleScriptCommand(battle, 'seteffectprimary', { ...runtime, moveEffect: 'MOVE_EFFECT_RAGE' });
    expect(battle.playerMon.volatile.rage).toBe(true);

    runBattleScriptCommand(battle, 'seteffectprimary', { ...runtime, moveEffect: 'MOVE_EFFECT_RECHARGE' });
    expect(battle.playerMon.volatile.rechargeTurns).toBe(1);

    runBattleScriptCommand(battle, 'seteffectprimary', { ...runtime, moveEffect: 'MOVE_EFFECT_WRAP' });
    expect(battle.wildMon.volatile.trapTurns).toBe(4);
    expect(battle.wildMon.volatile.trappedBy).toBe('player');

    battle.playerMon.volatile.trapTurns = 2;
    battle.playerMon.volatile.trappedBy = 'opponent';
    battle.playerMon.volatile.leechSeededBy = 'opponent';
    battle.sideState.player.spikesLayers = 2;
    runBattleScriptCommand(battle, 'rapidspinfree', runtime);
    expect(battle.playerMon.volatile.trapTurns).toBe(0);
    expect(battle.playerMon.volatile.trappedBy).toBeNull();
    expect(battle.playerMon.volatile.leechSeededBy).toBeNull();
    expect(battle.sideState.player.spikesLayers).toBe(0);

    battle.wildMon.status = 'paralysis';
    runBattleScriptCommand(battle, 'clearstatusfromeffect', runtime);
    expect(battle.wildMon.status).toBe('none');

    runBattleScriptCommand(battle, 'seteffectprimary', {
      ...runtime,
      move: { ...battle.moves[0]!, id: 'THRASH', effect: 'EFFECT_RAMPAGE' },
      moveEffect: 'MOVE_EFFECT_RAMPAGE'
    });
    expect(battle.playerMon.volatile.rampageMoveId).toBe('THRASH');
    expect(battle.playerMon.volatile.rampageTurns).toBe(3);
    runBattleScriptCommand(battle, 'confuseifrepeatingattackends', {
      ...runtime,
      move: { ...battle.moves[0]!, effect: 'EFFECT_RAMPAGE' },
      messages,
      applyConfusion: (pokemon) => {
        pokemon.volatile.confusionTurns = 2;
        return true;
      }
    });
    expect(battle.playerMon.volatile.rampageTurns).toBe(2);

    runBattleScriptCommand(battle, 'seteffectprimary', {
      ...runtime,
      move: { ...battle.moves[0]!, id: 'UPROAR', effect: 'EFFECT_UPROAR' },
      moveEffect: 'MOVE_EFFECT_UPROAR'
    });
    expect(battle.playerMon.volatile.uproarMoveId).toBe('UPROAR');
    expect(battle.playerMon.volatile.uproarTurns).toBe(3);
  });

  test('applies special setup commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const runtime = {
      attackerSide: 'player' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move: battle.moves[0]!,
      messages,
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      }
    };

    runBattleScriptCommand(battle, 'setbide', {
      ...runtime,
      useBide: (_battle, _attackerSide, _defenderSide, attacker, _defender, move, targetMessages) => {
        attacker.volatile.bideMoveId = move.id;
        attacker.volatile.bideTurns = 2;
        targetMessages.push(`${attacker.species} began storing energy!`);
        return true;
      }
    });
    expect(battle.playerMon.volatile.bideTurns).toBe(2);

    runBattleScriptCommand(battle, 'transformdataexecution', {
      ...runtime,
      applyTransform: (attacker, defender, targetMessages) => {
        attacker.species = defender.species;
        attacker.volatile.transformed = true;
        targetMessages.push(`${attacker.species} transformed!`);
        return true;
      }
    });
    expect(battle.playerMon.volatile.transformed).toBe(true);

    runBattleScriptCommand(battle, 'tryconversiontypechange', {
      ...runtime,
      applyConversion: (attacker, _encounterState, targetMessages) => {
        attacker.types = ['water'];
        targetMessages.push(`${attacker.species} changed type!`);
        return true;
      }
    });
    expect(battle.playerMon.types).toEqual(['water']);

    runBattleScriptCommand(battle, 'settypetorandomresistance', {
      ...runtime,
      applyConversion2: (_battle, attacker, _encounterState, targetMessages) => {
        attacker.types = ['steel'];
        targetMessages.push(`${attacker.species} changed type!`);
        return true;
      }
    });
    expect(battle.playerMon.types).toEqual(['steel']);

    runBattleScriptCommand(battle, 'trysetfutureattack', {
      ...runtime,
      useFutureAttack: (targetBattle, attackerSide, defenderSide, _attacker, _defender, move, targetMessages) => {
        targetBattle.sideState[defenderSide].futureAttack = {
          move: { ...move },
          damage: 12,
          sourceSide: attackerSide,
          countdown: 3
        };
        targetMessages.push('The attack was foreseen!');
        return true;
      }
    });
    expect(battle.sideState.opponent.futureAttack?.damage).toBe(12);

    runBattleScriptCommand(battle, 'forcerandomswitch', {
      ...runtime,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.moveEndedBattle).toBe(true);
    expect(messages.at(-1)).toContain('blown away');
  });

  test('calculates dynamic and fixed damage through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const runtime = {
      attackerSide: 'player' as const,
      defenderSide: 'opponent' as const,
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move: battle.moves[0]!,
      messages,
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      }
    };

    const dynamicMove = { ...battle.moves[0]!, id: 'FLAIL', effect: 'EFFECT_FLAIL', power: 1 };
    const dynamicResult = runBattleScriptCommand(battle, 'remaininghptopower', {
      ...runtime,
      move: dynamicMove,
      getMoveWithDynamicPower: (move) => ({ ...move, power: 200 })
    });
    expect(dynamicResult.move?.power).toBe(200);
    expect(battle.vm.locals.lastDynamicDamageCommand).toBe('remaininghptopower');

    battle.playerMon.volatile.lastDamageTaken = 13;
    battle.playerMon.volatile.lastDamageCategory = 'physical';
    battle.playerMon.volatile.lastDamagedBy = 'opponent';
    const counterResult = runBattleScriptCommand(battle, 'counterdamagecalculator', {
      ...runtime,
      move: { ...battle.moves[0]!, id: 'COUNTER', effect: 'EFFECT_COUNTER' },
      getCounterMirrorDamage: () => 26
    });
    expect(counterResult.damage).toBe(26);
    expect(battle.vm.locals.lastCounterMirrorCommand).toBe('counterdamagecalculator');

    const fixedResult = runBattleScriptCommand(battle, 'damagetohalftargethp', {
      ...runtime,
      move: { ...battle.moves[0]!, id: 'SUPER_FANG', effect: 'EFFECT_SUPER_FANG' },
      calculateFixedDamage: (_move, _attacker, defender) => Math.floor(defender.hp / 2)
    });
    expect(fixedResult.damage).toBe(Math.floor(battle.wildMon.hp / 2));
    expect(battle.vm.locals.lastFixedDamageCommand).toBe('damagetohalftargethp');

    battle.wildMon.hp = 60;
    battle.playerMon.hp = 25;
    const endeavorResult = runBattleScriptCommand(battle, 'setdamagetohealthdifference', runtime);
    expect(endeavorResult.damage).toBe(35);
  });

  test('applies healing commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const healed: Array<{ side: string; amount: number }> = [];
    const healBattler = (_battle: typeof battle, side: 'player' | 'opponent', pokemon: typeof battle.playerMon, amount: number, targetMessages: string[]): boolean => {
      healed.push({ side, amount });
      pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + amount);
      targetMessages.push(`${pokemon.species} regained health!`);
      return true;
    };

    battle.playerMon.hp = 10;
    battle.playerMon.maxHp = 40;
    runBattleScriptCommand(battle, 'tryhealhalfhealth', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      messages,
      healBattler
    });
    expect(healed.at(-1)).toEqual({ side: 'player', amount: 20 });
    expect(messages.at(-1)).toContain('regained health');

    battle.weather = 'sun';
    runBattleScriptCommand(battle, 'recoverbasedonsunlight', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      messages,
      healBattler
    });
    expect(healed.at(-1)).toEqual({ side: 'player', amount: 26 });

    const queuedHp: number[] = [];
    battle.playerMon.hp = 5;
    battle.playerMon.status = 'burn';
    runBattleScriptCommand(battle, 'trysetrest', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      applyQueuedDamage: (_battle, _side, hp) => queuedHp.push(hp),
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.hp).toBe(40);
    expect(battle.playerMon.status).toBe('sleep');
    expect(queuedHp).toEqual([40]);

    runBattleScriptCommand(battle, 'trywish', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.sideState.player.wishTurns).toBe(2);
    expect(battle.sideState.player.wishHp).toBe(20);
  });

  test('applies refresh status cure through VM handler', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    battle.playerMon.status = 'burn';
    battle.playerMon.volatile.toxicCounter = 3;

    runBattleScriptCommand(battle, 'cureifburnedparalysedorpoisoned', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      pushMessage: (text) => messages.push(text)
    });

    expect(battle.playerMon.status).toBe('none');
    expect(battle.playerMon.volatile.toxicCounter).toBe(0);
    expect(messages).toEqual([`${battle.playerMon.species} became healthy!`]);
  });

  test('applies special-effect commands through VM handlers', () => {
    const battle = createBattleState();
    const messages: string[] = [];
    const queuedHp: Array<{ side: string; hp: number }> = [];

    runBattleScriptCommand(battle, 'stockpile', {
      attacker: battle.playerMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.volatile.stockpile).toBe(1);

    battle.playerMon.hp = 10;
    runBattleScriptCommand(battle, 'stockpiletohpheal', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      messages,
      healBattler: (_battle, side, pokemon, amount, targetMessages) => {
        pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + amount);
        targetMessages.push(`${pokemon.species} regained health!`);
        queuedHp.push({ side, hp: pokemon.hp });
        return true;
      }
    });
    expect(battle.playerMon.volatile.stockpile).toBe(0);
    expect(battle.playerMon.hp).toBeGreaterThan(10);

    runBattleScriptCommand(battle, 'trysetperishsong', {
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.volatile.perishTurns).toBe(3);
    expect(battle.wildMon.volatile.perishTurns).toBe(3);

    const doublesPerish = createBattleState({
      format: 'doubles',
      playerParty: [
        createBattlePokemonFromSpecies('CHARMANDER', 8),
        createBattlePokemonFromSpecies('PIDGEY', 7)
      ],
      opponentParty: [
        createBattlePokemonFromSpecies('GEODUDE', 8),
        createBattlePokemonFromSpecies('RATTATA', 7)
      ]
    });
    doublesPerish.opponentSide.party[1]!.abilityId = 'SOUNDPROOF';
    runBattleScriptCommand(doublesPerish, 'trysetperishsong', {
      pushMessage: (text) => messages.push(text)
    });
    expect(doublesPerish.playerSide.party[0]!.volatile.perishTurns).toBe(3);
    expect(doublesPerish.playerSide.party[1]!.volatile.perishTurns).toBe(3);
    expect(doublesPerish.opponentSide.party[0]!.volatile.perishTurns).toBe(3);
    expect(doublesPerish.opponentSide.party[1]!.volatile.perishTurns).toBe(0);

    battle.playerMon.hp = 30;
    battle.wildMon.maxHp = 40;
    battle.wildMon.hp = 6;
    runBattleScriptCommand(battle, 'painsplitdmgcalc', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      applyQueuedDamage: (_battle, side, hp) => queuedHp.push({ side, hp }),
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.hp).toBe(18);
    expect(battle.wildMon.hp).toBe(18);
    expect(queuedHp).toEqual(expect.arrayContaining([{ side: 'player', hp: 18 }, { side: 'opponent', hp: 18 }]));

    battle.playerMon.heldItemId = 'ITEM_ORAN_BERRY';
    battle.wildMon.heldItemId = 'ITEM_CHERI_BERRY';
    runBattleScriptCommand(battle, 'tryswapitems', {
      attacker: battle.playerMon,
      defender: battle.wildMon,
      messages,
      useTrick: (attacker, defender, targetMessages) => {
        const item = attacker.heldItemId;
        attacker.heldItemId = defender.heldItemId;
        defender.heldItemId = item;
        targetMessages.push('Items were switched!');
        return true;
      }
    });
    expect(battle.playerMon.heldItemId).toBe('ITEM_CHERI_BERRY');
    expect(battle.wildMon.heldItemId).toBe('ITEM_ORAN_BERRY');

    battle.playerMon.heldItemId = null;
    battle.playerMon.recycledItemId = 'ITEM_ORAN_BERRY';
    runBattleScriptCommand(battle, 'tryrecycleitem', {
      attacker: battle.playerMon,
      messages,
      useRecycle: (attacker, targetMessages) => {
        attacker.heldItemId = attacker.recycledItemId;
        attacker.recycledItemId = null;
        targetMessages.push(`${attacker.species} found one ${attacker.heldItemId}!`);
        return true;
      }
    });
    expect(battle.playerMon.heldItemId).toBe('ITEM_ORAN_BERRY');
    expect(battle.playerMon.recycledItemId).toBeNull();

    battle.playerMon.abilityId = 'OVERGROW';
    battle.wildMon.abilityId = 'CHLOROPHYLL';
    runBattleScriptCommand(battle, 'trycopyability', {
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.abilityId).toBe('CHLOROPHYLL');

    battle.playerMon.abilityId = 'OVERGROW';
    battle.wildMon.abilityId = 'CHLOROPHYLL';
    runBattleScriptCommand(battle, 'tryswapabilities', {
      attacker: battle.playerMon,
      defender: battle.wildMon,
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.playerMon.abilityId).toBe('CHLOROPHYLL');
    expect(battle.wildMon.abilityId).toBe('OVERGROW');

    battle.wildMon.status = 'sleep';
    runBattleScriptCommand(battle, 'seteffectprimary', {
      defender: battle.wildMon,
      moveEffect: 'MOVE_EFFECT_NIGHTMARE',
      pushMessage: (text) => messages.push(text)
    });
    expect(battle.wildMon.volatile.nightmare).toBe(true);
  });

  test('runs prelude commands as state-mutating script handlers', () => {
    const battle = createBattleState();
    const attacker = battle.playerMon;
    const move = battle.moves[0]!;
    const messages: string[] = [];
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');
    move.ppRemaining = 4;

    expect(runBattleScriptCommand(battle, 'attackcanceler', {
      canMoveThisTurn: () => true
    })).toEqual({});
    runBattleScriptCommand(battle, 'attackstring', {
      attackerSide: 'player',
      attacker,
      move,
      options: { announce: true },
      pushMessage: (text) => messages.push(text),
      getActorLabel: () => attacker.species
    });
    runBattleScriptCommand(battle, 'ppreduce', {
      move,
      options: { consumePp: true }
    });

    expect(messages).toEqual([`${attacker.species} used ${move.name}!`]);
    expect(attacker.volatile.lastPrintedMoveId).toBe(move.id);
    expect(battle.moveMemory[0].printedMoveId).toBe(move.id);
    expect(move.ppRemaining).toBe(3);
    expect(battle.vm.locals.executedScriptCommands).toBe('attackcanceler,attackstring,ppreduce');
    expect(battle.vm.locals.attackStringApplied).toBe(true);
    expect(battle.vm.locals.ppReduceApplied).toBe(true);
  });

  test('reports accuracy command misses through the script handler', () => {
    const battle = createBattleState();
    const move = battle.moves[0]!;
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');

    const result = runBattleScriptCommand(battle, 'accuracycheck', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move,
      encounterState: {
        stepsSinceLastEncounter: 0,
        encounterRate: 0,
        rngState: 1
      },
      attemptAccuracy: () => false
    });

    expect(result).toEqual({ missed: true });
    expect(battle.vm.locals.executedScriptCommands).toBe('accuracycheck');
  });

  test('runs type calculation and result message through script handlers', () => {
    const battle = createBattleState();
    const move = battle.moves[0]!;
    const messages: string[] = [];
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');

    const typeResult = runBattleScriptCommand(battle, 'typecalc', {
      move,
      defender: battle.wildMon,
      getBattleTypeEffectiveness: () => 2
    });
    runBattleScriptCommand(battle, 'resultmessage', {
      pushMessage: (text) => messages.push(text)
    });

    expect(typeResult).toEqual({ typeEffectiveness: 2 });
    expect(battle.vm.locals.lastTypeEffectiveness).toBe(2);
    expect(messages).toEqual(["It's super effective!"]);
    expect(battle.vm.locals.executedScriptCommands).toBe('typecalc,resultmessage');
  });

  test('records damage and move-end pipeline commands through handlers', () => {
    const battle = createBattleState();
    const defender = battle.wildMon;
    const move = battle.moves[0]!;
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');
    defender.hp = 7;

    runBattleScriptCommand(battle, 'critcalc', { critical: true });
    runBattleScriptCommand(battle, 'damagecalc', { damage: 9 });
    runBattleScriptCommand(battle, 'adjustnormaldamage');
    runBattleScriptCommand(battle, 'healthbarupdate', { defender });
    runBattleScriptCommand(battle, 'datahpupdate', { defender });
    runBattleScriptCommand(battle, 'setmoveeffect', { move });
    runBattleScriptCommand(battle, 'seteffectprimary', { moveEffect: 'poison' });
    runBattleScriptCommand(battle, 'tryfaintmon');
    runBattleScriptCommand(battle, 'moveendall');

    expect(battle.vm.locals).toMatchObject({
      lastCriticalHit: true,
      lastCalculatedDamage: 9,
      normalDamageAdjusted: true,
      lastHealthbarHp: 7,
      lastDataHp: 7,
      lastMoveEffect: move.effect,
      primaryEffectApplied: true
    });
    expect(battle.vm.locals.executedScriptCommands).toContain('moveendall');
  });

  test('tracks stat changer command memory for stat buff branches', () => {
    const battle = createBattleState();
    battle.vm.currentLabel = 'BattleScript_EffectAttackDown';
    battle.currentScriptLabel = 'BattleScript_EffectAttackDown';
    battle.wildMon.statStages.attack = -6;

    runBattleScriptCommand(battle, 'statbuffchange', {
      attackerSide: 'player',
      attacker: battle.playerMon,
      defender: battle.wildMon,
      move: battle.moves[0]
    });

    expect(battle.vm.locals.statChangerStat).toBe('STAT_ATK');
    expect(battle.vm.locals.statChangerAmount).toBe(1);
    expect(battle.vm.locals.statChangerDown).toBe(true);
    expect(battle.vm.locals.cMULTISTRING_CHOOSER).toBe('B_MSG_STAT_WONT_DECREASE');
    expect(String(battle.vm.locals.visitedScriptInstructions)).toBe('setstatchanger,goto,attackcanceler,jumpifstatus2,accuracycheck,attackstring,ppreduce,statbuffchange');
  });

  test('creates default VM and post-battle state', () => {
    expect(createBattleVmState()).toEqual({
      currentLabel: null,
      pc: 0,
      callStack: [],
      locals: {},
      pendingCommands: [],
      pendingMessages: []
    });

    expect(createBattlePostResult()).toMatchObject({
      outcome: 'none',
      payouts: 0,
      losses: 0,
      payDayTotal: 0,
      levelUps: [],
      pendingMoveLearn: false,
      pendingEvolution: false,
      caughtSpecies: null,
      caughtPokemon: null,
      pendingMoveLearns: [],
      pendingEvolutions: []
    });
  });

  test('move prelude mirrors script label and queues the attack announcement', () => {
    const battle = createBattleState();
    const move = { ...battle.moves[0]!, effectScriptLabel: 'BattleScript_EffectHit' };
    const result = beginBattleMoveVm(
      battle,
      'player',
      battle.playerMon,
      move,
      {},
      {
        canMoveThisTurn: () => true,
        emitCommand: (command) => {
          battle.vm.pendingCommands.push(command);
        },
        pushMessage: (text) => {
          battle.vm.pendingMessages.push(text);
        },
        getActorLabel: () => battle.playerMon.species
      }
    );

    expect(result).toMatchObject({
      shouldContinue: true,
      moveWasAttempted: true
    });
    expect(battle.currentScriptLabel).toBe('BattleScript_HitFromAtkCanceler');
    expect(battle.vm.currentLabel).toBe('BattleScript_HitFromAtkCanceler');
    expect(battle.vm.locals.moveId).toBe(move.id);
    expect(String(battle.vm.locals.scriptCommandPlan)).toContain('attackcanceler');
    expect(battle.vm.locals.executedScriptCommands).toBe('attackcanceler');
    expect(String(battle.vm.locals.visitedScriptInstructions)).toBe('jumpifnotmove,attackcanceler');
    expect(battle.vm.locals.deferAttackStringAndPp).toBe(true);
    expect(battle.vm.locals.attackStringApplied).toBe(true);
    expect(battle.vm.locals.ppReduceApplied).toBe(true);
    expect(battle.vm.pendingCommands[0]).toMatchObject({ type: 'script', label: 'BattleScript_EffectHit' });
    expect(battle.vm.pendingMessages[0]).toContain(`used ${move.name}`);
  });

  test('can clone and reset VM and post-battle state in place', () => {
    const vm = createBattleVmState();
    vm.currentLabel = 'BattleScript_Test';
    vm.pc = 3;
    vm.callStack = [{ label: 'BattleScript_Parent', pc: 1 }];
    vm.locals.turn = 2;
    vm.pendingCommands.push({ type: 'script', label: 'BattleScript_Test' });
    vm.pendingMessages.push('message');

    const postResult = createBattlePostResult();
    postResult.outcome = 'won';
    postResult.payouts = 1400;
    postResult.levelUps.push({ side: 'player', species: 'PIDGEY', level: 19 });
    postResult.pendingMoveLearns.push({ species: 'PIDGEY', level: 19, moveId: 'WHIRLWIND', moveName: 'WHIRLWIND' });
    postResult.pendingEvolutions.push({ species: 'CHARMANDER', evolvesTo: 'CHARMELEON', level: 16 });
    postResult.caughtPokemon = { species: 'MAGIKARP', level: 10 };

    const cloned = cloneBattlePostResult(postResult);
    expect(cloned).toEqual(postResult);
    expect(cloned.levelUps).not.toBe(postResult.levelUps);
    expect(cloned.pendingMoveLearns).not.toBe(postResult.pendingMoveLearns);
    expect(cloned.pendingEvolutions).not.toBe(postResult.pendingEvolutions);

    resetBattleVmState(vm);
    resetBattlePostResult(postResult);

    expect(vm).toEqual(createBattleVmState());
    expect(postResult).toEqual(createBattlePostResult());
  });

  test('single-turn VM runner records action order and enqueues the turn result', () => {
    const battle = createBattleState();
    const playerMove = battle.moves[0]!;
    const enemyMove = battle.wildMoves[0]!;
    const executed: string[] = [];
    let terminalMessages: string[] | null = null;

    runSingleBattleTurnVm(battle, {
      getPlayerMove: () => playerMove,
      getEnemyMove: () => enemyMove,
      getActionOrder: () => ['player', 'opponent'],
      tryUseOpponentTrainerItem: () => false,
      executeMove: (actor) => {
        executed.push(actor);
        return [`${actor} move`];
      },
      resolveEndOfTurn: () => ['end of turn'],
      enqueueTurnMessages: (messages) => {
        terminalMessages = [...messages];
      },
      queueResolvedMessages: (messages) => {
        terminalMessages = [...messages, 'resolved'];
      }
    });

    expect(executed).toEqual(['player', 'opponent']);
    expect(terminalMessages).toEqual(['player move', 'opponent move', 'end of turn']);
    expect(battle.vm.locals.turnResolver).toBe('selectedMove');
    expect(battle.vm.locals.turnActionOrder).toBe('player,opponent');
  });

  test('enemy-only VM runner records trainer-item turns without forcing a move', () => {
    const battle = createBattleState();
    let terminalMessages: string[] | null = null;

    runEnemyOnlyTurnVm(battle, ['opening'], {
      getEnemyMove: () => battle.wildMoves[0]!,
      tryUseOpponentTrainerItem: (messages) => {
        messages.push('item');
        return true;
      },
      executeEnemyMove: () => ['should not run'],
      resolveEndOfTurn: () => ['end of turn'],
      enqueueTurnMessages: (messages) => {
        terminalMessages = [...messages];
      },
      queueResolvedMessages: (messages) => {
        terminalMessages = [...messages, 'resolved'];
      }
    });

    expect(terminalMessages).toEqual(['opening', 'item', 'end of turn']);
    expect(battle.vm.locals.turnResolver).toBe('enemyOnly');
    expect(battle.vm.locals.turnActionOrder).toBeUndefined();
  });
});
