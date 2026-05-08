import { CROP_TYPES } from './state.js';

export class Economy {
  constructor(state) {
    this.state = state;
    this.supplyLevels = {};
    Object.keys(CROP_TYPES).forEach(key => {
      this.supplyLevels[key] = 0;
    });
  }

  recordHarvest(cropName) {
    const key = cropName.toUpperCase();
    if (this.supplyLevels[key] !== undefined) {
      this.supplyLevels[key]++;
    }
  }

  updatePrices() {
    Object.keys(CROP_TYPES).forEach(key => {
      const basePrice = CROP_TYPES[key].sellPrice;
      const supply = this.supplyLevels[key];

      // Basic supply/demand: more supply = lower price
      // price = basePrice * (1 / (1 + supply * 0.05))
      // But we should also have a "demand" that slowly clears supply

      let newPrice = basePrice * (1 / (1 + supply * 0.1));

      // Ensure price doesn't drop too low
      newPrice = Math.max(newPrice, CROP_TYPES[key].seedPrice * 1.1);

      this.state.marketPrices[key] = Math.round(newPrice);

      // Slowly clear supply levels to simulate demand
      this.supplyLevels[key] = Math.max(0, this.supplyLevels[key] - 0.5);
    });
  }
}
