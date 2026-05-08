export function plantCrop(farm, plotIndex, crop) {
  const plot = farm.plots[plotIndex];
  if (!plot.isOccupied() && farm.money >= crop.seedPrice) {
    farm.money -= crop.seedPrice;
    plot.crop = { ...crop };
    plot.growthStage = 0;
    return true;
  }
  return false;
}

export function harvestPlot(farm, plotIndex, marketPrices) {
  const plot = farm.plots[plotIndex];
  if (plot.isReadyToHarvest()) {
    // We expect marketPrices to be an object where keys are crop names or types
    // To keep it simple, let's assume crop.name is the key in marketPrices
    const price = marketPrices[plot.crop.name.toUpperCase()] || plot.crop.sellPrice;
    farm.money += price;
    const harvestedCropName = plot.crop.name;
    plot.crop = null;
    plot.growthStage = 0;
    return { success: true, price, cropName: harvestedCropName };
  }
  return { success: false };
}
