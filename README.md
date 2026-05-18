# Balatro-Inspired Roguelike Poker Deckbuilder

Phaser 3 + TypeScript browser game prototype focused on absurd score scaling, chained multipliers, and run-based progression.

## Architecture

### Scenes

- `BootScene` - bootstraps visuals and shared textures.
- `MainMenuScene` - new run / resume flow with optional URL seed (`?seed=...`).
- `GameplayScene` - card draw, drag-and-drop play area, scoring, blind progression, deck/discard flow.
- `ShopScene` - between-round purchases, rerolls, economy/interest loop.
- `GameOverScene` - final run summary and restart.

### Systems + Engines

- `src/models` - cards, modifiers, consumables, run state types.
- `src/managers/deckManager.ts` - deterministic deck shuffling and drawing.
- `src/engines/handEvaluator.ts` - full 10-hand five-card poker evaluation.
- `src/engines/modifierEngine.ts` - event-style trigger application for score and round start phases.
- `src/engines/scoringEngine.ts` - chips × multiplier score resolution.
- `src/systems/shopGenerator.ts` - rarity-weighted procedural shop offers.
- `src/systems/saveSystem.ts` - localStorage save/load.
- `src/systems/rng.ts` - seeded deterministic RNG.
- `src/ui` - tooltip, pooled floating numbers, hand banner, stats panel, card view.

## Data-Driven Content

- `src/data/modifiers.json` includes **120 unique modifier cards** with rarity tiers:
  - Common
  - Uncommon
  - Rare
  - Legendary
- `src/data/consumables.json` includes one-shot consumable effects.
- `src/data/cards.json` includes standard suit/rank definitions.

## Balancing (example defaults)

- Base blind target scales exponentially by ante and round.
- Initial resources: 4 hands / 3 discards / $5.
- Shop interest: +20% currency when entering shop.
- Shop reroll: $2.
- Hand scores use poker base chips and multipliers, then modifier effects stack.

## Visual + Feedback Style

- Dark casino palette with gold accents.
- Card movement tweens + drag-and-drop interactions.
- Animated hand banners and pooled floating score text.
- Screen shake + particle bursts on scoring.
- Responsive `Phaser.Scale.RESIZE` layout for desktop/tablet.

## Audio

- Lightweight procedural audio engine:
  - card interaction ticks
  - chip payout tones
  - ambient synth pulses with intensity scaling

## Development

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```
