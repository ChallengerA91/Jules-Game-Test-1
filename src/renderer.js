export class Renderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.tileSize = 200;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const playerFarm = this.state.farms.find(f => f.isPlayer);
    if (!playerFarm) return;

    playerFarm.plots.forEach((plot, index) => {
      const x = (index % 3) * this.tileSize;
      const y = Math.floor(index / 3) * this.tileSize;

      // Draw plot
      this.ctx.fillStyle = '#795548';
      this.ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
      this.ctx.strokeStyle = '#5d4037';
      this.ctx.strokeRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);

      if (plot.isOccupied()) {
        // Draw crop
        const progress = plot.growthStage / plot.crop.growthTime;
        this.ctx.fillStyle = progress >= 1 ? '#ffeb3b' : '#4caf50';
        const size = (this.tileSize - 40) * (0.2 + 0.8 * progress);
        this.ctx.fillRect(x + (this.tileSize - size) / 2, y + (this.tileSize - size) / 2, size, size);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(plot.crop.name, x + this.tileSize / 2, y + this.tileSize - 20);
      }
    });

    // Draw other farms info (simplified)
    this.state.farms.filter(f => !f.isPlayer).forEach((farm, i) => {
        // Just small indicators or text for now
    });
  }
}
