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
    const price = marketPrices[plot.crop.name.toUpperCase()] || plot.crop.sellPrice;
    farm.money += price;
    const harvestedCropName = plot.crop.name;
    plot.crop = null;
    plot.growthStage = 0;
    return { success: true, price, cropName: harvestedCropName };
  }
  return { success: false };
}

export const UPGRADES = {
    IRRIGATION: { name: 'Irrigation', basePrice: 200, type: 'irrigation' },
    AUTO_HARVESTER: { name: 'Auto-Harvester', price: 1000, type: 'autoHarvester' }
};

export function buyUpgrade(farm, upgradeKey) {
    if (upgradeKey === 'IRRIGATION') {
        const cost = UPGRADES.IRRIGATION.basePrice * (farm.upgrades.irrigation + 1);
        if (farm.money >= cost) {
            farm.money -= cost;
            farm.upgrades.irrigation++;
            return true;
        }
    } else if (upgradeKey === 'AUTO_HARVESTER') {
        const cost = UPGRADES.AUTO_HARVESTER.price;
        if (farm.money >= cost && !farm.upgrades.autoHarvester) {
            farm.money -= cost;
            farm.upgrades.autoHarvester = true;
            return true;
        }
    }
    return false;
}
