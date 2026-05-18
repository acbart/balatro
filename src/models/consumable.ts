export interface ConsumableDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: 'gain_hands' | 'gain_discards' | 'gain_currency' | 'free_reroll';
  value: number;
}
