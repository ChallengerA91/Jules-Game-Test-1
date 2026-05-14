export class Renderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.gridSize = 4;
    this.tileSize = canvas.width / this.gridSize;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const playerFarm = this.state.farms.find(f => f.isPlayer);
    if (!playerFarm) return;

    // Draw plots
    playerFarm.plots.forEach((plot, index) => {
      const col = index % this.gridSize;
      const row = Math.floor(index / this.gridSize);
      const x = col * this.tileSize;
      const y = row * this.tileSize;

      // Draw soil
      this.ctx.fillStyle = '#795548';
      this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
      this.ctx.strokeStyle = '#5d4037';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);

      if (plot.isOccupied()) {
        const progress = plot.growthStage / plot.crop.growthTime;

        // Draw emoji
        this.ctx.font = `${this.tileSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Faded if growing, solid if ready
        this.ctx.globalAlpha = 0.3 + 0.7 * Math.min(1, progress);
        this.ctx.fillText(plot.crop.emoji, x + this.tileSize / 2, y + this.tileSize / 2);
        this.ctx.globalAlpha = 1.0;

        // Growth bar
        if (progress < 1) {
            this.ctx.fillStyle = '#4caf50';
            this.ctx.fillRect(x + 10, y + this.tileSize - 15, (this.tileSize - 20) * progress, 5);
        } else {
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
        }
      }
    });

    // Draw Weather Overlay
    if (this.state.weather.type === 'Rainy' || this.state.weather.type === 'Storm') {
        this.ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.state.weather.type === 'Heatwave') {
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
