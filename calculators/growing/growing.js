import { BASE_GROW_TIMES, POT_DATA, GAME_MINUTE_TO_REAL_MS } from '../../database/game_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const seedSelect = document.getElementById('calc-seed-name');
    const potSelect = document.getElementById('calc-pot-type');
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
                row.insertCell().textContent = formatDuration(realTimeMs);
            }
        }

        if (refPotModsTableBody) {
            refPotModsTableBody.innerHTML = ''; // Clear existing rows
            for (const potName in POT_DATA) {
                const row = refPotModsTableBody.insertRow();
                const data = POT_DATA[potName];
                row.insertCell().textContent = potName;
                row.insertCell().textContent = `${(data.growthMultiplier * 100).toFixed(0)}%`;
                row.insertCell().textContent = `${(data.drainMultiplier * 100).toFixed(0)}%`;
                // Base water interval could be added if needed
            }
        }
    }

    // --- Calculation Logic ---
    function calculateGrowTime() {
        const selectedSeed = seedSelect?.value;
        const selectedPot = potSelect?.value;

        if (!selectedSeed || !selectedPot) {
            displayResults({ error: "Please select both a seed and a pot." });
            return;
        }

        const baseGrowMinutes = BASE_GROW_TIMES[selectedSeed];
        const potGrowthMultiplier = POT_DATA[selectedPot].growthMultiplier;
        const potDrainMultiplier = POT_DATA[selectedPot].drainMultiplier; // For potential watering info

        if (baseGrowMinutes === undefined || potGrowthMultiplier === undefined) {
             displayResults({ error: "Invalid seed or pot data." });
            return;
        }

        const actualGrowMinutes = baseGrowMinutes / potGrowthMultiplier;
        const actualGrowMs = actualGrowMinutes * GAME_MINUTE_TO_REAL_MS;

        const plantTime = new Date(); // Use current time as planting time
        const harvestTime = new Date(plantTime.getTime() + actualGrowMs);

        // Basic watering info (can be expanded)
        const baseWaterInterval = POT_DATA[selectedPot].waterIntervalMinutes;
        const actualWaterInterval = baseWaterInterval / potDrainMultiplier;
        const waterIntervalMs = actualWaterInterval * GAME_MINUTE_TO_REAL_MS;

        displayResults({
            seed: selectedSeed,
            pot: selectedPot,
            plantTime: plantTime,
            harvestTime: harvestTime,
            growDurationMs: actualGrowMs,
            waterIntervalMinutes: actualWaterInterval.toFixed(0),
            waterIntervalDuration: formatDuration(waterIntervalMs)
        });
    }

    // --- Display Results ---
    function displayResults(data) {
        if (!resultsDiv) return;

        if (data.error) {
            resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        resultsDiv.innerHTML = `
            <h4>Calculation Results:</h4>
            <p><strong>Seed:</strong> ${data.seed}</p>
            <p><strong>Pot:</strong> ${data.pot}</p>
            <p><strong>Planted At:</strong> ${data.plantTime.toLocaleString()}</p>
            <p><strong>Estimated Grow Time:</strong> ${formatDuration(data.growDurationMs)}</p>
            <p><strong>Estimated Harvest Time:</strong> ${data.harvestTime.toLocaleString()}</p>
            <p><strong>Est. Watering Interval:</strong> Approx. every ${data.waterIntervalMinutes} game minutes (${data.waterIntervalDuration} real time)</p>
        `;
    }

    // --- Helper Functions ---
    function formatDuration(ms) {
        if (ms < 0) ms = 0;
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        let durationString = "";
        if (days > 0) durationString += `${days}d `;
        if (hours > 0) durationString += `${hours}h `;
        if (minutes > 0) durationString += `${minutes}m `;
        if (seconds > 0 || durationString === "") durationString += `${seconds}s`; // Show seconds if duration is less than a minute

        return durationString.trim();
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