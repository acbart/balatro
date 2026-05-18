export const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export const FACE_RANKS: Rank[] = ['J', 'Q', 'K'];
export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const createStandardDeck = (): Card[] =>
  SUITS.flatMap((suit) => RANKS.map((rank, index) => ({ id: `${suit}-${rank}-${index}`, suit, rank })));
