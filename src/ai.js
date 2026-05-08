import { plantCrop, harvestPlot } from './mechanics.js';
import { CROP_TYPES } from './state.js';

export class AIController {
  constructor(farm, economy) {
    this.farm = farm;
    this.economy = economy;
  }

  update(marketPrices) {
    // 1. Check for ready harvests
    this.farm.plots.forEach((plot, index) => {
      if (plot.isReadyToHarvest()) {
        const result = harvestPlot(this.farm, index, marketPrices);
        if (result.success) {
          this.economy.recordHarvest(result.cropName);
        }
      }
    });

    // 2. Decide what to plant
    // Simple AI: Find empty plot and plant most profitable crop I can afford
    this.farm.plots.forEach((plot, index) => {
      if (!plot.isOccupied()) {
        const affordableCrops = Object.keys(CROP_TYPES)
          .map(key => ({ key, ...CROP_TYPES[key] }))
          .filter(crop => crop.seedPrice <= this.farm.money)
          .sort((a, b) => (marketPrices[b.key] - b.seedPrice) - (marketPrices[a.key] - a.seedPrice));

        if (affordableCrops.length > 0) {
          // Plant the most profitable one
          plantCrop(this.farm, index, affordableCrops[0]);
        }
      }
    });
  }
}
