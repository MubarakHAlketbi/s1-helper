import { BASE_GROW_TIMES, POT_DATA, GAME_MINUTE_TO_REAL_MS } from '../../database/game_data.js';
import { formatDateTime, formatTimeDifference } from '../../utils/helpers.js'; // Import helpers

document.addEventListener('DOMContentLoaded', () => {
    const seedSelect = document.getElementById('calc-seed-name');
    const potSelect = document.getElementById('calc-pot-type');
    const plantTimeInput = document.getElementById('calc-plant-time');
    const lastWateredInput = document.getElementById('calc-last-watered');
    const calculateBtn = document.getElementById('calculate-grow-btn');
    const resultsDiv = document.getElementById('grow-results');
    const refGrowTimesTableBody = document.getElementById('ref-grow-times')?.querySelector('tbody');
    const refPotModsTableBody = document.getElementById('ref-pot-mods')?.querySelector('tbody');

    // --- Populate Dropdowns ---
    function populateSeedSelect() {
        if (!seedSelect) return;
        seedSelect.innerHTML = '<option value="">Select Seed...</option>'; // Clear existing options
        for (const seedName in BASE_GROW_TIMES) {
            const option = document.createElement('option');
            option.value = seedName;
            option.textContent = seedName;
            seedSelect.appendChild(option);
        }
    }

    function populatePotSelect() {
        if (!potSelect) return;
        potSelect.innerHTML = '<option value="">Select Pot...</option>'; // Clear existing options
        for (const potName in POT_DATA) {
            const option = document.createElement('option');
            option.value = potName;
            option.textContent = potName;
            potSelect.appendChild(option);
        }
    }

    // --- Populate Reference Tables ---
    function populateRefTables() {
        if (refGrowTimesTableBody) {
            refGrowTimesTableBody.innerHTML = ''; // Clear existing rows
            for (const seedName in BASE_GROW_TIMES) {
                const row = refGrowTimesTableBody.insertRow();
                const timeInMinutes = BASE_GROW_TIMES[seedName];
                const realTimeMs = timeInMinutes * GAME_MINUTE_TO_REAL_MS;
                row.insertCell().textContent = seedName;
                row.insertCell().textContent = `${timeInMinutes} min`;
                row.insertCell().textContent = formatTimeDifference(realTimeMs); // Use imported helper
                row.cells[2].title = `${realTimeMs} ms`; // Add tooltip for milliseconds
            }
        }

        if (refPotModsTableBody) {
            refPotModsTableBody.innerHTML = ''; // Clear existing rows
            for (const potName in POT_DATA) {
                const row = refPotModsTableBody.insertRow();
                const data = POT_DATA[potName];
                const growthMod = data.growthMultiplier ? `${(data.growthMultiplier * 100).toFixed(0)}%` : 'N/A';
                const drainMod = data.drainMultiplier ? `${(data.drainMultiplier * 100).toFixed(0)}%` : 'N/A';
                const waterInt = data.waterIntervalMinutes ? `${data.waterIntervalMinutes} min` : 'N/A';
                row.insertCell().textContent = potName;
                row.insertCell().textContent = growthMod;
                row.insertCell().textContent = drainMod;
                row.insertCell().textContent = waterInt;
            }
        }
    }

    // --- Calculation Logic ---
    function calculateGrowTime() {
        const selectedSeed = seedSelect?.value;
        const selectedPot = potSelect?.value;
        const plantTimeString = plantTimeInput?.value;
        const lastWateredString = lastWateredInput?.value;

        if (!selectedSeed || !selectedPot || !plantTimeString) {
            displayResults({ error: "Please select a seed, pot, and enter the planted date/time." });
            return;
        }

        const plantTime = new Date(plantTimeString);
        if (isNaN(plantTime.getTime())) {
            displayResults({ error: "Invalid Planted Date & Time." });
            return;
        }

        let lastWateredTime = plantTime; // Default to plant time if not provided or invalid
        if (lastWateredString) {
            const parsedLastWatered = new Date(lastWateredString);
            if (!isNaN(parsedLastWatered.getTime())) {
                lastWateredTime = parsedLastWatered;
            }
        }


        const baseGrowMinutes = BASE_GROW_TIMES[selectedSeed];
        const potGrowthMultiplier = POT_DATA[selectedPot].growthMultiplier;
        const potDrainMultiplier = POT_DATA[selectedPot].drainMultiplier;
        const baseWaterInterval = POT_DATA[selectedPot].waterIntervalMinutes;

        if (baseGrowMinutes === undefined || potGrowthMultiplier === undefined || potDrainMultiplier === undefined || baseWaterInterval === undefined) {
             displayResults({ error: "Invalid seed or pot data selected." });
            return;
        }

        const actualGrowMinutes = baseGrowMinutes / potGrowthMultiplier;
        const actualGrowMs = actualGrowMinutes * GAME_MINUTE_TO_REAL_MS;
        const harvestTime = new Date(plantTime.getTime() + actualGrowMs);

        const actualWaterIntervalMinutes = baseWaterInterval / potDrainMultiplier;
        const waterIntervalMs = actualWaterIntervalMinutes * GAME_MINUTE_TO_REAL_MS;
        const nextWaterTime = new Date(lastWateredTime.getTime() + waterIntervalMs);

        displayResults({
            seed: selectedSeed,
            pot: selectedPot,
            plantTime: plantTime,
            harvestTime: harvestTime,
            growDurationMs: actualGrowMs,
            waterIntervalMinutes: actualWaterIntervalMinutes.toFixed(0),
            waterIntervalDuration: formatTimeDifference(waterIntervalMs), // Use imported helper
            nextWaterTime: nextWaterTime
        });
    }

    // --- Display Results ---
    function displayResults(data) {
        if (!resultsDiv) return;

        // Ensure results div is visible (alternative to removing style in HTML)
        resultsDiv.style.display = 'block';

        if (data.error) {
            resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        resultsDiv.innerHTML = `
            <h4>Calculation Results:</h4>
            <p><strong>Seed:</strong> ${data.seed}</p>
            <p><strong>Pot:</strong> ${data.pot}</p>
            <p><strong>Planted At:</strong> ${formatDateTime(data.plantTime)}</p> <!-- Use imported helper -->
            <p><strong>Estimated Grow Time:</strong> ${formatTimeDifference(data.growDurationMs)}</p> <!-- Use imported helper -->
            <p><strong>Estimated Harvest Time:</strong> ${formatDateTime(data.harvestTime)}</p> <!-- Use imported helper -->
            <p><strong>Est. Watering Interval:</strong> Approx. every ${data.waterIntervalMinutes} game minutes (${data.waterIntervalDuration} real time)</p>
            <p><strong>Estimated Next Water Needed:</strong> ${formatDateTime(data.nextWaterTime)}</p> <!-- Use imported helper -->
        `;
    }

    // --- Initial Setup ---
    populateSeedSelect();
    populatePotSelect();
    populateRefTables();

    // --- Event Listeners ---
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateGrowTime);
    }

});