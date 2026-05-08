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

    // Update all farms and plots
    this.state.farms.forEach(farm => {
      farm.plots.forEach(plot => {
        if (plot.isOccupied() && plot.growthStage < plot.crop.growthTime) {
          plot.growthStage++;
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
