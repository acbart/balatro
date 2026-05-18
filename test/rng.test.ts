import { describe, expect, it } from 'vitest';
import { SeededRng } from '../src/systems/rng';

describe('SeededRng', () => {
  it('is deterministic for same seed', () => {
    const a = new SeededRng('seed-123');
    const b = new SeededRng('seed-123');
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different values for different seeds', () => {
    const a = new SeededRng('a').next();
    const b = new SeededRng('b').next();
    expect(a).not.toBe(b);
  });
});
