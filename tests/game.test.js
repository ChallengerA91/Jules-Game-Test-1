import { GameState, Farm, CROP_TYPES } from '../src/state.js';
import { plantCrop, harvestPlot } from '../src/mechanics.js';
import { GameEngine } from '../src/engine.js';
import { Economy } from '../src/economy.js';

describe('Farming Game Logic', () => {
  let state, farm;

  beforeEach(() => {
    state = new GameState();
    farm = new Farm(1, 'Test Farm', true);
    state.farms.push(farm);
  });

  test('should plant a crop', () => {
    const success = plantCrop(farm, 0, CROP_TYPES.WHEAT);
    expect(success).toBe(true);
    expect(farm.plots[0].isOccupied()).toBe(true);
    expect(farm.money).toBe(90); // 100 - 10
  });

  test('should not plant if money is insufficient', () => {
    farm.money = 5;
    const success = plantCrop(farm, 0, CROP_TYPES.WHEAT);
    expect(success).toBe(false);
  });

  test('should grow crop over ticks', () => {
    const engine = new GameEngine(state);
    plantCrop(farm, 0, CROP_TYPES.WHEAT);

    engine.tick();
    expect(farm.plots[0].growthStage).toBe(1);

    for(let i=0; i<9; i++) engine.tick();
    expect(farm.plots[0].isReadyToHarvest()).toBe(true);
  });

  test('should harvest crop and earn money', () => {
    plantCrop(farm, 0, CROP_TYPES.WHEAT);
    farm.plots[0].growthStage = CROP_TYPES.WHEAT.growthTime;

    const initialMoney = farm.money;
    const result = harvestPlot(farm, 0, state.marketPrices);

    expect(result.success).toBe(true);
    expect(farm.money).toBeGreaterThan(initialMoney);
    expect(farm.plots[0].isOccupied()).toBe(false);
  });

  test('economy should fluctuate prices', () => {
    const economy = new Economy(state);
    const initialPrice = state.marketPrices.WHEAT;

    economy.recordHarvest('WHEAT');
    economy.recordHarvest('WHEAT');
    economy.recordHarvest('WHEAT');
    economy.updatePrices();

    expect(state.marketPrices.WHEAT).toBeLessThan(initialPrice);
  });
});
