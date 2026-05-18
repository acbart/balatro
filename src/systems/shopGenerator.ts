import type { ConsumableDefinition } from '../models/consumable';
import type { ModifierDefinition, ModifierRarity } from '../models/modifier';
import { SeededRng } from './rng';

export interface ShopOffer {
  id: string;
  type: 'modifier' | 'consumable';
  name: string;
  description: string;
  cost: number;
  payloadId: string;
}

const RARITY_WEIGHTS: Record<ModifierRarity, number> = {
  Common: 60,
  Uncommon: 25,
  Rare: 12,
  Legendary: 3,
};

const MODIFIER_BASE_COST: Record<ModifierRarity, number> = {
  Common: 6,
  Uncommon: 10,
  Rare: 16,
  Legendary: 26,
};

const weightedPick = (rng: SeededRng, options: ModifierDefinition[]): ModifierDefinition => {
  const total = options.reduce((sum, option) => sum + RARITY_WEIGHTS[option.rarity], 0);
  let cursor = rng.next() * total;
  for (const option of options) {
    cursor -= RARITY_WEIGHTS[option.rarity];
    if (cursor <= 0) return option;
  }
  return options[0];
};

export const generateShopOffers = (
  rng: SeededRng,
  modifiers: ModifierDefinition[],
  consumables: ConsumableDefinition[],
  size = 4,
): ShopOffer[] => {
  const offers: ShopOffer[] = [];
  const modifierPool = [...modifiers];

  for (let i = 0; i < size - 1; i += 1) {
    const pick = weightedPick(rng, modifierPool);
    offers.push({
      id: `offer-${i}-${pick.id}`,
      type: 'modifier',
      name: pick.name,
      description: pick.description,
      cost: MODIFIER_BASE_COST[pick.rarity],
      payloadId: pick.id,
    });
  }

  const consumable = rng.pick(consumables);
  offers.push({
    id: `offer-consumable-${consumable.id}`,
    type: 'consumable',
    name: consumable.name,
    description: consumable.description,
    cost: consumable.cost,
    payloadId: consumable.id,
  });
  return offers;
};
