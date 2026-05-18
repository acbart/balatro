import { FACE_RANKS, type Card } from '../models/card';
import type { ActiveModifier, ModifierDefinition } from '../models/modifier';
import type { HandResult } from './handEvaluator';

export interface ScoreContext {
  cards: Card[];
  hand: HandResult;
  chips: number;
  multiplier: number;
  unusedDiscards: number;
  streak: number;
  currency: number;
}

export interface RoundContext {
  currency: number;
  blindTarget: number;
}

export class ModifierEngine {
  private readonly active: ActiveModifier[] = [];

  constructor(definitions: ModifierDefinition[] = []) {
    definitions.forEach((definition) => this.addModifier(definition));
  }

  addModifier(definition: ModifierDefinition): void {
    const existing = this.active.find((modifier) => modifier.id === definition.id);
    if (existing) {
      existing.stackCount += 1;
      return;
    }
    this.active.push({ ...definition, stackCount: 1 });
  }

  getModifiers(): ActiveModifier[] {
    return [...this.active];
  }

  applyScore(ctx: ScoreContext): ScoreContext {
    let next = { ...ctx };
    for (const modifier of this.active.filter((m) => m.trigger === 'on_score')) {
      for (let stack = 0; stack < modifier.stackCount; stack += 1) {
        next = this.applySingleScoreModifier(modifier, next);
      }
    }
    return next;
  }

  applyRoundStart(ctx: RoundContext): RoundContext {
    let next = { ...ctx };
    for (const modifier of this.active.filter((m) => m.trigger === 'on_round_start')) {
      const amount = Number(modifier.values.amount ?? 0) * modifier.stackCount;
      if (modifier.effectType === 'economy_bonus') next.currency += amount;
      if (modifier.effectType === 'probability_shift') next.blindTarget = Math.max(100, next.blindTarget - amount * 5);
    }
    return next;
  }

  private applySingleScoreModifier(modifier: ActiveModifier, ctx: ScoreContext): ScoreContext {
    const amount = Number(modifier.values.amount ?? 0);
    switch (modifier.effectType) {
      case 'retrigger_face_cards': {
        const faces = ctx.cards.filter((card) => FACE_RANKS.includes(card.rank)).length;
        return { ...ctx, chips: ctx.chips + faces * amount };
      }
      case 'mult_per_repeated_suit': {
        const suits = ctx.cards.reduce<Record<string, number>>((acc, card) => {
          acc[card.suit] = (acc[card.suit] ?? 0) + 1;
          return acc;
        }, {});
        const repeated = Object.values(suits)
          .map((count) => Math.max(0, count - 1))
          .reduce((sum, count) => sum + count, 0);
        return { ...ctx, multiplier: ctx.multiplier + repeated * amount };
      }
      case 'chips_per_unused_discard':
        return { ...ctx, chips: ctx.chips + ctx.unusedDiscards * amount };
      case 'duplicate_score_effects':
        return { ...ctx, chips: ctx.chips + Math.floor(ctx.chips * amount), multiplier: ctx.multiplier + ctx.multiplier * amount };
      case 'flat_chip_bonus':
        return { ...ctx, chips: ctx.chips + amount };
      case 'flat_mult_bonus':
        return { ...ctx, multiplier: ctx.multiplier + amount };
      case 'streak_mult_bonus':
        return { ...ctx, multiplier: ctx.multiplier + ctx.streak * amount };
      case 'hand_type_bonus':
        if (ctx.hand.name === modifier.values.handName) {
          return { ...ctx, chips: ctx.chips + amount, multiplier: ctx.multiplier + amount / 10 };
        }
        return ctx;
      default:
        return ctx;
    }
  }
}
