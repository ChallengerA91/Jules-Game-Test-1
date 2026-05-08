import { GameState, Farm, CROP_TYPES } from './state.js';
import { GameEngine } from './engine.js';
import { Renderer } from './renderer.js';
import { Economy } from './economy.js';
import { AIController } from './ai.js';
import { plantCrop, harvestPlot } from './mechanics.js';

const state = new GameState();
const playerFarm = new Farm(1, 'Player Farm', true);
const aiFarm = new Farm(2, 'AI Farm', false);

state.farms.push(playerFarm, aiFarm);

const engine = new GameEngine(state);
const economy = new Economy(state);
const ai = new AIController(aiFarm, economy);
const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas, state);

let selectedCropKey = null;

window.selectCrop = (key) => {
    selectedCropKey = key;
    document.getElementById('selected-crop').innerText = CROP_TYPES[key].name;
};

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / 200);
    const row = Math.floor(y / 200);
    const index = row * 3 + col;

    if (index >= 0 && index < playerFarm.plots.length) {
        const plot = playerFarm.plots[index];
        if (plot.isReadyToHarvest()) {
            const result = harvestPlot(playerFarm, index, state.marketPrices);
            if (result.success) {
                economy.recordHarvest(result.cropName);
            }
        } else if (!plot.isOccupied() && selectedCropKey) {
            plantCrop(playerFarm, index, CROP_TYPES[selectedCropKey]);
        }
    }
});

engine.subscribe((updatedState) => {
    ai.update(updatedState.marketPrices);
    economy.updatePrices();
    renderer.draw();
    updateUI();
});

function updateUI() {
    document.getElementById('money').innerText = playerFarm.money;
    document.getElementById('tick').innerText = state.tick;

    const pricesDiv = document.getElementById('prices');
    pricesDiv.innerHTML = Object.keys(CROP_TYPES).map(key => {
        return `<div>${CROP_TYPES[key].name}: $${state.marketPrices[key]}</div>`;
    }).join('');
}

engine.start(500); // Faster tick for better feel
renderer.draw();
updateUI();
