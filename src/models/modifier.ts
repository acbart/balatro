export type ModifierRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export type ModifierTrigger =
  | 'on_score'
  | 'on_draw'
  | 'on_discard'
  | 'on_round_start'
  | 'on_round_end'
  | 'on_shop_enter';

export type ModifierEffectType =
  | 'retrigger_face_cards'
  | 'mult_per_repeated_suit'
  | 'chips_per_unused_discard'
  | 'duplicate_score_effects'
  | 'probability_shift'
  | 'economy_bonus'
  | 'flat_chip_bonus'
  | 'flat_mult_bonus'
  | 'streak_mult_bonus'
  | 'hand_type_bonus';

export interface ModifierDefinition {
  id: string;
  name: string;
  description: string;
  rarity: ModifierRarity;
  trigger: ModifierTrigger;
  effectType: ModifierEffectType;
  values: Record<string, number | string>;
}

export interface ActiveModifier extends ModifierDefinition {
  stackCount: number;
}
