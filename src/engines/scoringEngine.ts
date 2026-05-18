import type { Card } from '../models/card';
import { evaluateHand } from './handEvaluator';
import { ModifierEngine } from './modifierEngine';

export interface ScoreOutput {
  handName: string;
  chips: number;
  multiplier: number;
  total: number;
}

export class ScoringEngine {
  constructor(private readonly modifiers: ModifierEngine) {}

  score(cards: Card[], unusedDiscards: number, streak: number, currency: number): ScoreOutput {
    const hand = evaluateHand(cards);
    const modified = this.modifiers.applyScore({
      cards,
      hand,
      chips: hand.baseChips,
      multiplier: hand.baseMultiplier,
      unusedDiscards,
      streak,
      currency,
    });

    const total = Math.floor(modified.chips * modified.multiplier);
    return {
      handName: hand.name,
      chips: modified.chips,
      multiplier: Number(modified.multiplier.toFixed(2)),
      total,
    };
  }
}
