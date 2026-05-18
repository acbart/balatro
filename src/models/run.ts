import type { Card } from './card';
import type { ActiveModifier } from './modifier';

export interface RunState {
  seed: string;
  ante: number;
  round: number;
  blindTarget: number;
  score: number;
  currency: number;
  handsRemaining: number;
  discardsRemaining: number;
  streak: number;
  deck: Card[];
  discardPile: Card[];
  drawPile: Card[];
  modifiers: ActiveModifier[];
}
