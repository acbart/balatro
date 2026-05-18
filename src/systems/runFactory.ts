import modifiers from '../data/modifiers.json';
import { createStandardDeck } from '../models/card';
import type { ModifierDefinition } from '../models/modifier';
import type { RunState } from '../models/run';
import { DeckManager } from '../managers/deckManager';
import { SeededRng } from './rng';

const blindForRound = (ante: number, round: number, rng: SeededRng): number => {
  const baseline = 300 * Math.pow(1.65, ante - 1) * Math.pow(1.28, round - 1);
  const jitter = 0.9 + rng.next() * 0.3;
  return Math.floor(baseline * jitter);
};

export const createRun = (seed: string): RunState => {
  const rng = new SeededRng(seed);
  const deck = createStandardDeck();
  const manager = new DeckManager(rng);
  const drawPile = manager.createShuffledDeck();
  return {
    seed,
    ante: 1,
    round: 1,
    blindTarget: blindForRound(1, 1, rng),
    score: 0,
    currency: 5,
    handsRemaining: 4,
    discardsRemaining: 3,
    streak: 0,
    deck,
    discardPile: [],
    drawPile,
    modifiers: [],
  };
};

export const nextRound = (state: RunState): RunState => {
  const rng = new SeededRng(`${state.seed}:${state.ante}:${state.round + 1}`);
  const nextRoundNum = state.round + 1;
  const nextAnte = nextRoundNum > 3 ? state.ante + 1 : state.ante;
  return {
    ...state,
    ante: nextAnte,
    round: nextRoundNum > 3 ? 1 : nextRoundNum,
    handsRemaining: 4,
    discardsRemaining: 3,
    score: 0,
    streak: 0,
    blindTarget: blindForRound(nextAnte, nextRoundNum > 3 ? 1 : nextRoundNum, rng),
  };
};

export const modifierDefinitions = modifiers as ModifierDefinition[];
