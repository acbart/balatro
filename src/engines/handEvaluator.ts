import { RANK_VALUES, type Card } from '../models/card';

export type PokerHandName =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandResult {
  name: PokerHandName;
  baseChips: number;
  baseMultiplier: number;
}

const HAND_TABLE: Record<PokerHandName, HandResult> = {
  'High Card': { name: 'High Card', baseChips: 40, baseMultiplier: 1 },
  Pair: { name: 'Pair', baseChips: 70, baseMultiplier: 1.4 },
  'Two Pair': { name: 'Two Pair', baseChips: 120, baseMultiplier: 1.8 },
  'Three of a Kind': { name: 'Three of a Kind', baseChips: 180, baseMultiplier: 2.2 },
  Straight: { name: 'Straight', baseChips: 260, baseMultiplier: 2.6 },
  Flush: { name: 'Flush', baseChips: 300, baseMultiplier: 3 },
  'Full House': { name: 'Full House', baseChips: 420, baseMultiplier: 3.8 },
  'Four of a Kind': { name: 'Four of a Kind', baseChips: 600, baseMultiplier: 5 },
  'Straight Flush': { name: 'Straight Flush', baseChips: 900, baseMultiplier: 8 },
  'Royal Flush': { name: 'Royal Flush', baseChips: 1400, baseMultiplier: 12 },
};

const isStraight = (values: number[]): boolean => {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (sorted.length !== 5) return false;
  const wheel = [2, 3, 4, 5, 14];
  if (sorted.every((value, index) => value === wheel[index])) return true;
  return sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
};

export const evaluateHand = (cards: Card[]): HandResult => {
  if (cards.length !== 5) return HAND_TABLE['High Card'];

  const rankCounts = new Map<number, number>();
  const suitCounts = new Map<string, number>();
  const values = cards.map((card) => RANK_VALUES[card.rank]);

  values.forEach((value) => rankCounts.set(value, (rankCounts.get(value) ?? 0) + 1));
  cards.forEach((card) => suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1));

  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const flush = [...suitCounts.values()].some((c) => c === 5);
  const straight = isStraight(values);
  const high = Math.max(...values);

  if (straight && flush && high === 14 && values.includes(10)) return HAND_TABLE['Royal Flush'];
  if (straight && flush) return HAND_TABLE['Straight Flush'];
  if (counts[0] === 4) return HAND_TABLE['Four of a Kind'];
  if (counts[0] === 3 && counts[1] === 2) return HAND_TABLE['Full House'];
  if (flush) return HAND_TABLE.Flush;
  if (straight) return HAND_TABLE.Straight;
  if (counts[0] === 3) return HAND_TABLE['Three of a Kind'];
  if (counts[0] === 2 && counts[1] === 2) return HAND_TABLE['Two Pair'];
  if (counts[0] === 2) return HAND_TABLE.Pair;
  return HAND_TABLE['High Card'];
};
