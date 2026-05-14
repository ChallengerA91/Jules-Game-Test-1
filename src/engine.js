export class GameEngine {
  constructor(state) {
    this.state = state;
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  tick() {
    this.state.tick++;

    // Random Weather changes
    if (this.state.tick % 50 === 0) {
        const types = [
            { type: 'Sunny', multiplier: 1.0 },
            { type: 'Rainy', multiplier: 1.5 },
            { type: 'Heatwave', multiplier: 0.5 },
            { type: 'Storm', multiplier: 0.2 }
        ];
        const newWeather = types[Math.floor(Math.random() * types.length)];
        this.state.weather = newWeather;
    }

    // Update all farms and plots
    this.state.farms.forEach(farm => {
      farm.plots.forEach(plot => {
        if (plot.isOccupied() && plot.growthStage < plot.crop.growthTime) {
          let growthAmount = 1 * this.state.weather.multiplier;
          if (farm.upgrades.irrigation > 0) {
              growthAmount += farm.upgrades.irrigation * 0.2;
          }
          plot.growthStage += growthAmount;
        }
      });
    });

    // Notify subscribers
    this.subscribers.forEach(callback => callback(this.state));
  }

  start(intervalMs = 1000) {
    this.timer = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    clearInterval(this.timer);
  }
}
