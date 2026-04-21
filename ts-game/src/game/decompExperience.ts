import type { DecompGrowthRate } from './decompSpecies';

const cube = (value: number): number => value * value * value;
const square = (value: number): number => value * value;

export const getExperienceForLevel = (
  growthRate: DecompGrowthRate,
  level: number
): number => {
  const n = Math.max(1, Math.min(100, Math.trunc(level)));

  switch (growthRate) {
    case 'GROWTH_FAST':
      return Math.floor((4 * cube(n)) / 5);
    case 'GROWTH_MEDIUM_FAST':
      return cube(n);
    case 'GROWTH_MEDIUM_SLOW':
      return Math.floor((6 * cube(n)) / 5 - (15 * square(n)) + (100 * n) - 140);
    case 'GROWTH_SLOW':
      return Math.floor((5 * cube(n)) / 4);
    case 'GROWTH_ERRATIC':
      if (n <= 50) {
        return Math.floor(((100 - n) * cube(n)) / 50);
      }
      if (n <= 68) {
        return Math.floor(((150 - n) * cube(n)) / 100);
      }
      if (n <= 98) {
        return Math.floor((Math.floor((1911 - (10 * n)) / 3) * cube(n)) / 500);
      }
      return Math.floor(((160 - n) * cube(n)) / 100);
    case 'GROWTH_FLUCTUATING':
      if (n <= 15) {
        return Math.floor(((Math.floor((n + 1) / 3) + 24) * cube(n)) / 50);
      }
      if (n <= 36) {
        return Math.floor(((n + 14) * cube(n)) / 50);
      }
      return Math.floor(((Math.floor(n / 2) + 32) * cube(n)) / 50);
  }
};

export const getLevelForExperience = (
  growthRate: DecompGrowthRate,
  experience: number
): number => {
  const cappedExperience = Math.max(0, experience);
  let level = 1;

  while (level < 100 && getExperienceForLevel(growthRate, level + 1) <= cappedExperience) {
    level += 1;
  }

  return level;
};
