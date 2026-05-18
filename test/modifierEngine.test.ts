import { describe, expect, it } from 'vitest';
import { ModifierEngine } from '../src/engines/modifierEngine';
import type { ModifierDefinition } from '../src/models/modifier';

const faceBoost: ModifierDefinition = {
  id: 'face_boost',
  name: 'Face Boost',
  description: 'Face card retrigger',
  rarity: 'Common',
  trigger: 'on_score',
  effectType: 'retrigger_face_cards',
  values: { amount: 10 },
};

describe('ModifierEngine', () => {
  it('applies retrigger face card bonus', () => {
    const engine = new ModifierEngine([faceBoost]);
    const result = engine.applyScore({
      cards: [
        { id: 'j', rank: 'J', suit: 'Hearts' },
        { id: 'q', rank: 'Q', suit: 'Clubs' },
        { id: '2', rank: '2', suit: 'Spades' },
        { id: '3', rank: '3', suit: 'Diamonds' },
        { id: '5', rank: '5', suit: 'Hearts' },
      ],
      hand: { name: 'Pair', baseChips: 70, baseMultiplier: 1.4 },
      chips: 100,
      multiplier: 2,
      unusedDiscards: 1,
      streak: 0,
      currency: 0,
    });

    expect(result.chips).toBe(120);
  });
});
