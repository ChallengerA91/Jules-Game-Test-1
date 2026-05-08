export class Crop {
  constructor(name, growthTime, seedPrice, sellPrice) {
    this.name = name;
    this.growthTime = growthTime; // in ticks
    this.seedPrice = seedPrice;
    this.sellPrice = sellPrice;
  }
}

export const CROP_TYPES = {
  WHEAT: new Crop('Wheat', 10, 10, 20),
  CORN: new Crop('Corn', 20, 25, 60),
  TOMATO: new Crop('Tomato', 30, 50, 150)
};

export class Plot {
  constructor() {
    this.crop = null;
    this.growthStage = 0; // 0 to crop.growthTime
  }

  isOccupied() {
    return this.crop !== null;
  }

  isReadyToHarvest() {
    return this.crop !== null && this.growthStage >= this.crop.growthTime;
  }
}

export class Farm {
  constructor(id, name, isPlayer = false) {
    this.id = id;
    this.name = name;
    this.isPlayer = isPlayer;
    this.money = 100;
    this.plots = Array.from({ length: 9 }, () => new Plot());
  }
}

export class GameState {
  constructor() {
    this.farms = [];
    this.marketPrices = {};
    Object.keys(CROP_TYPES).forEach(key => {
      this.marketPrices[key] = CROP_TYPES[key].sellPrice;
    });
    this.tick = 0;
  }
}
