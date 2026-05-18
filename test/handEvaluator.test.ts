import { describe, expect, it } from 'vitest';
import { evaluateHand } from '../src/engines/handEvaluator';
import type { Card } from '../src/models/card';

const hand = (cards: Array<[Card['rank'], Card['suit']]>): Card[] =>
  cards.map(([rank, suit], idx) => ({ id: `${rank}-${suit}-${idx}`, rank, suit }));

describe('evaluateHand', () => {
  it('detects royal flush', () => {
    const result = evaluateHand(hand([
      ['10', 'Hearts'],
      ['J', 'Hearts'],
      ['Q', 'Hearts'],
      ['K', 'Hearts'],
      ['A', 'Hearts'],
    ]));
    expect(result.name).toBe('Royal Flush');
  });

  it('detects two pair', () => {
    const result = evaluateHand(hand([
      ['4', 'Hearts'],
      ['4', 'Spades'],
      ['9', 'Clubs'],
      ['9', 'Diamonds'],
      ['A', 'Hearts'],
    ]));
    expect(result.name).toBe('Two Pair');
  });
});
