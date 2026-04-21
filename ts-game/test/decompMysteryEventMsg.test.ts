import { describe, expect, test } from 'vitest';
import {
  formatMysteryEventMessage,
  MYSTERY_EVENT_MESSAGES
} from '../src/game/decompMysteryEventMsg';

describe('decomp mystery_event_msg', () => {
  test('exports the FireRed Mystery Gift messages', () => {
    expect(MYSTERY_EVENT_MESSAGES.cantBeUsed).toBe("This data can't be used in\nthis version.");
    expect(MYSTERY_EVENT_MESSAGES.nationalDex).toContain('NATIONAL MODE');
  });

  test('replaces STR_VAR placeholders in message templates', () => {
    expect(
      formatMysteryEventMessage(MYSTERY_EVENT_MESSAGES.berryTransform, {
        STR_VAR_1: 'ORAN',
        STR_VAR_2: 'SITRUS'
      })
    ).toBe('The ORAN BERRY transformed into\none SITRUS BERRY.');
  });
});
