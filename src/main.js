import { GameState, Farm, CROP_TYPES } from './state.js';
import { GameEngine } from './engine.js';
import { Renderer } from './renderer.js';
import { Economy } from './economy.js';
import { AIController } from './ai.js';
import { plantCrop, harvestPlot, buyUpgrade, UPGRADES } from './mechanics.js';

const state = new GameState();
const playerFarm = new Farm(1, 'Player (You)', true);
const aiFarms = [
    new Farm(2, 'Old MacDonald', false),
    new Farm(3, 'AgriCorp', false),
    new Farm(4, 'FarmBot 3000', false)
];

state.farms.push(playerFarm, ...aiFarms);

const engine = new GameEngine(state);
const economy = new Economy(state);
const ais = aiFarms.map(f => new AIController(f, economy));
const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas, state);

let selectedCropKey = null;

// Initialize Crop Selector UI
const cropSelector = document.getElementById('crop-selector');
Object.keys(CROP_TYPES).forEach(key => {
    const crop = CROP_TYPES[key];
    const btn = document.createElement('button');
    btn.className = 'crop-btn';
    btn.id = `btn-crop-${key}`;
    btn.innerHTML = `
        <span class="crop-emoji">${crop.emoji}</span>
        <span>${crop.name}</span>
        <div class="crop-price">$${crop.seedPrice}</div>
    `;
    btn.onclick = () => selectCrop(key);
    cropSelector.appendChild(btn);
});

function selectCrop(key) {
    selectedCropKey = key;
    document.getElementById('selected-crop-name').innerText = CROP_TYPES[key].name;
    document.querySelectorAll('.crop-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById(`btn-crop-${key}`).classList.add('selected');
}

window.handleUpgrade = (key) => {
    if (buyUpgrade(playerFarm, key)) {
        updateUI();
    }
};

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / (600 / 4));
    const row = Math.floor(y / (600 / 4));
    const index = row * 4 + col;

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
    ais.forEach(ai => ai.update(updatedState.marketPrices));
    economy.updatePrices();

    // Auto-harvest for player if upgraded
    if (playerFarm.upgrades.autoHarvester) {
        playerFarm.plots.forEach((plot, index) => {
            if (plot.isReadyToHarvest()) {
                const result = harvestPlot(playerFarm, index, state.marketPrices);
                if (result.success) economy.recordHarvest(result.cropName);
            }
        });
    }

    renderer.draw();
    updateUI();
});

function updateUI() {
    document.getElementById('money').innerText = Math.floor(playerFarm.money);
    document.getElementById('tick').innerText = state.tick;

    // Weather
    const wBox = document.getElementById('weather-box');
    wBox.className = `weather-panel weather-${state.weather.type}`;
    document.getElementById('weather-type').innerText = state.weather.type;
    document.getElementById('weather-mult').innerText = state.weather.multiplier.toFixed(1);

    // Events
    const ticker = document.getElementById('event-ticker');
    if (state.events.length > 0) {
        ticker.style.display = 'block';
        ticker.innerHTML = state.events.map(e => `⚠️ <b>${e.crop} ${e.type}!</b> Price x${e.type === 'Boom' ? '2.5' : '0.3'}`).join('<br>');
    } else {
        ticker.style.display = 'none';
    }

    // Upgrades
    document.getElementById('lvl-irrigation').innerText = playerFarm.upgrades.irrigation;
    document.getElementById('cost-irrigation').innerText = `$${200 * (playerFarm.upgrades.irrigation + 1)}`;
    if (playerFarm.upgrades.autoHarvester) {
        document.getElementById('btn-autoharvest').disabled = true;
        document.getElementById('cost-autoharvest').innerText = 'OWNED';
    }

    // Leaderboard
    const sortedFarms = [...state.farms].sort((a, b) => b.money - a.money);
    const lb = document.getElementById('leaderboard');
    lb.innerHTML = sortedFarms.map((f, i) => `
        <li>
            <span>${i+1}. ${f.name} ${f.isPlayer ? '👤' : ''}</span>
            <b>$${Math.floor(f.money)}</b>
        </li>
    `).join('');
}

engine.start(500);
renderer.draw();
updateUI();
