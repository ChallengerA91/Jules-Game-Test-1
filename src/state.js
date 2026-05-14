export class Crop {
  constructor(name, growthTime, seedPrice, sellPrice, emoji = '🌱') {
    this.name = name;
    this.growthTime = growthTime; // in ticks
    this.seedPrice = seedPrice;
    this.sellPrice = sellPrice;
    this.emoji = emoji;
  }
}

export const CROP_TYPES = {
  WHEAT: new Crop('Wheat', 10, 10, 20, '🌾'),
  CORN: new Crop('Corn', 20, 25, 60, '🌽'),
  TOMATO: new Crop('Tomato', 30, 50, 150, '🍅'),
  GRAPE: new Crop('Grape', 50, 100, 400, '🍇'),
  TRUFFLE: new Crop('Truffle', 100, 500, 3000, '🍄')
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
    this.plots = Array.from({ length: 16 }, () => new Plot());
    this.upgrades = {
      irrigation: 0, // Reduces growth time
      autoHarvester: false
    };
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
    this.weather = {
        type: 'Sunny',
        multiplier: 1.0
    };
    this.events = [];
  }
}
