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
    // Occasional market events
    if (this.state.tick % 100 === 0 && Math.random() > 0.7) {
        const keys = Object.keys(CROP_TYPES);
        const randomCrop = keys[Math.floor(Math.random() * keys.length)];
        const isBoom = Math.random() > 0.5;
        this.state.events.push({
            crop: randomCrop,
            type: isBoom ? 'Boom' : 'Bust',
            expiry: this.state.tick + 50
        });
    }

    // Filter out expired events
    this.state.events = this.state.events.filter(e => e.expiry > this.state.tick);

    Object.keys(CROP_TYPES).forEach(key => {
      const basePrice = CROP_TYPES[key].sellPrice;
      const supply = this.supplyLevels[key];

      let priceMult = 1 / (1 + supply * 0.1);

      // Apply active events
      this.state.events.forEach(e => {
          if (e.crop === key) {
              priceMult *= (e.type === 'Boom' ? 2.5 : 0.3);
          }
      });

      let newPrice = basePrice * priceMult;

      // Ensure price doesn't drop too low
      newPrice = Math.max(newPrice, CROP_TYPES[key].seedPrice * 1.1);

      this.state.marketPrices[key] = Math.round(newPrice);

      // Slowly clear supply levels to simulate demand
      this.supplyLevels[key] = Math.max(0, this.supplyLevels[key] - 0.3);
    });
  }
}
