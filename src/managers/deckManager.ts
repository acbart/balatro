import { createStandardDeck, type Card } from '../models/card';
import { SeededRng } from '../systems/rng';

export class DeckManager {
  constructor(private readonly rng: SeededRng) {}

  createShuffledDeck(): Card[] {
    return this.rng.shuffle(createStandardDeck());
  }

  draw(drawPile: Card[], amount: number, discardPile: Card[]): { drawPile: Card[]; cards: Card[] } {
    let pile = [...drawPile];
    if (pile.length < amount && discardPile.length > 0) {
      pile = [...pile, ...this.rng.shuffle(discardPile)];
      discardPile.length = 0;
    }
    const cards = pile.splice(0, amount);
    return { drawPile: pile, cards };
  }
}
