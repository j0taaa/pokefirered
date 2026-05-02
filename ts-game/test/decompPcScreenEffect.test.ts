import { describe, expect, test } from 'vitest';
import {
  BeginPCScreenEffect,
  BeginPCScreenEffect_TurnOff,
  BeginPCScreenEffect_TurnOn,
  IsPCScreenEffectRunning_TurnOff,
  IsPCScreenEffectRunning_TurnOn,
  Task_PCScreenEffect_TurnOff,
  Task_PCScreenEffect_TurnOn,
  beginPcScreenEffectTurnOff,
  beginPcScreenEffectTurnOn,
  createPcScreenEffectState,
  isPcScreenEffectRunningTurnOff,
  isPcScreenEffectRunningTurnOn,
  stepPcScreenEffect
} from '../src/game/decompPcScreenEffect';

describe('decompPcScreenEffect', () => {
  test('turn-on effect expands from the center and finishes clear', () => {
    const effect = createPcScreenEffectState();
    beginPcScreenEffectTurnOn(effect);

    expect(isPcScreenEffectRunningTurnOn(effect)).toBe(true);

    stepPcScreenEffect(effect);
    stepPcScreenEffect(effect);
    expect(effect.win0Left).toBe(120);
    expect(effect.win0Top).toBe(80);

    stepPcScreenEffect(effect);
    expect(effect.win0Left).toBe(104);
    expect(effect.win0Right).toBe(136);

    while (effect.active) {
      stepPcScreenEffect(effect);
    }

    expect(effect.mode).toBeNull();
    expect(effect.win0Left).toBe(0);
    expect(effect.win0Right).toBe(240);
    expect(effect.win0Top).toBe(0);
    expect(effect.win0Bottom).toBe(160);
  });

  test('turn-off effect collapses back to the center line', () => {
    const effect = createPcScreenEffectState();
    beginPcScreenEffectTurnOff(effect);

    expect(isPcScreenEffectRunningTurnOff(effect)).toBe(true);

    while (effect.active) {
      stepPcScreenEffect(effect);
    }

    expect(effect.mode).toBeNull();
    expect(effect.win0Left).toBe(120);
    expect(effect.win0Right).toBe(120);
    expect(effect.win0Top).toBe(80);
    expect(effect.win0Bottom).toBe(81);
  });

  test('exact C-name entry points start, report, and step the same state machine', () => {
    const turnOn = createPcScreenEffectState();
    BeginPCScreenEffect_TurnOn(turnOn, 4, 99, 7);
    expect(turnOn.priority).toBe(7);
    expect(turnOn.xSpeed).toBe(4);
    expect(turnOn.ySpeed).toBe(4);
    expect(turnOn.state).toBe(1);
    expect(IsPCScreenEffectRunning_TurnOn(turnOn)).toBe(true);
    Task_PCScreenEffect_TurnOn(turnOn);
    expect(turnOn.state).toBe(2);
    Task_PCScreenEffect_TurnOn(turnOn);
    expect(turnOn.win0Left).toBe(116);
    expect(turnOn.win0Right).toBe(124);

    const turnOff = createPcScreenEffectState();
    BeginPCScreenEffect(turnOff, 'Task_PCScreenEffect_TurnOff', 0, 99, 3);
    expect(turnOff.priority).toBe(3);
    expect(turnOff.xSpeed).toBe(16);
    expect(turnOff.ySpeed).toBe(20);
    expect(IsPCScreenEffectRunning_TurnOff(turnOff)).toBe(true);
    BeginPCScreenEffect_TurnOff(turnOff, 8, 1, 2);
    expect(turnOff.ySpeed).toBe(8);
    Task_PCScreenEffect_TurnOff(turnOff);
    expect(turnOff.state).toBe(2);
  });
});
