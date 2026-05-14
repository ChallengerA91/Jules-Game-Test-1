import { GameState, Farm, CROP_TYPES } from '../src/state.js';
import { plantCrop, harvestPlot, buyUpgrade } from '../src/mechanics.js';
import { GameEngine } from '../src/engine.js';
import { Economy } from '../src/economy.js';

describe('Farming Game Logic 100x', () => {
  let state, farm;

  beforeEach(() => {
    state = new GameState();
    farm = new Farm(1, 'Test Farm', true);
    state.farms.push(farm);
    // Ensure tick > 0 so expiry works
    state.tick = 1;
  });

  test('should plant a crop', () => {
    const success = plantCrop(farm, 0, CROP_TYPES.WHEAT);
    expect(success).toBe(true);
    expect(farm.plots[0].isOccupied()).toBe(true);
    expect(farm.money).toBe(90);
  });

  test('should grow crop with weather multiplier', () => {
    const engine = new GameEngine(state);
    state.weather = { type: 'Rainy', multiplier: 2.0 };
    plantCrop(farm, 0, CROP_TYPES.WHEAT);

    engine.tick();
    // Growth should be 2.0 (weather) + 0 (irrigation) = 2.0
    expect(farm.plots[0].growthStage).toBe(2);
  });

  test('should grow crop with irrigation upgrade', () => {
    const engine = new GameEngine(state);
    state.weather = { type: 'Sunny', multiplier: 1.0 };
    farm.upgrades.irrigation = 1;
    plantCrop(farm, 0, CROP_TYPES.WHEAT);

    engine.tick();
    // Growth should be 1.0 (weather) + 1*0.2 (irrigation) = 1.2
    expect(farm.plots[0].growthStage).toBe(1.2);
  });

  test('should apply market boom event', () => {
    const economy = new Economy(state);
    const basePrice = CROP_TYPES.WHEAT.sellPrice;

    state.events.push({
        crop: 'WHEAT',
        type: 'Boom',
        expiry: 100
    });

    economy.updatePrices();
    // Price should be 20 * 2.5 = 50
    expect(state.marketPrices.WHEAT).toBe(50);
  });

  test('should handle upgrade purchases', () => {
    farm.money = 1000;
    const success = buyUpgrade(farm, 'IRRIGATION');
    expect(success).toBe(true);
    expect(farm.upgrades.irrigation).toBe(1);
    expect(farm.money).toBe(800);
  });
});
