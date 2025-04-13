import { BASE_GROW_TIMES, POT_DATA, GAME_MINUTE_TO_REAL_MS } from '../../database/game_data.js';
import { formatDateTime, formatDuration } from '../../utils/helpers.js'; // Import shared helpers
document.addEventListener('DOMContentLoaded', () => {
    const seedSelect = document.getElementById('calc-seed-name');
    const potSelect = document.getElementById('calc-pot-type');
    const plantTimeInput = document.getElementById('calc-plant-time');
    const lastWateredInput = document.getElementById('calc-last-watered');
    const calculateBtn = document.getElementById('calculate-grow-btn');
    const resultsDiv = document.getElementById('grow-results');
    const resultGrowTimeP = document.getElementById('result-grow-time');
    const resultHarvestTimeP = document.getElementById('result-harvest-time');
    const resultNextWaterP = document.getElementById('result-next-water');
    const resultNotesP = document.getElementById('result-notes');

    // Game data is imported from ../../database/game_data.js
    // Helper functions (formatDateTime, formatDuration) are imported from ../../utils/helpers.js
    // --- Populate Selects ---
    Object.keys(BASE_GROW_TIMES).sort().forEach(seedName => {
        const option = document.createElement('option');
        option.value = seedName;
        option.textContent = seedName;
        seedSelect.appendChild(option);
    });

    Object.keys(POT_DATA).sort().forEach(potName => {
        const option = document.createElement('option');
        option.value = potName;
        option.textContent = potName;
        potSelect.appendChild(option);
    });

     // --- Populate Reference Data ---
    const refGrowUl = document.getElementById('ref-grow-times');
    Object.entries(BASE_GROW_TIMES).sort((a,b) => a[0].localeCompare(b[0])).forEach(([seed, time]) => {
        const li = document.createElement('li');
        const realTime = formatDuration(time * GAME_MINUTE_TO_REAL_MS);
        li.innerHTML = `<strong>${seed}:</strong> ${time} mins <i>(~${realTime} real time)</i>`;
        refGrowUl.appendChild(li);
    });

    const refPotUl = document.getElementById('ref-pot-mods');
     Object.entries(POT_DATA).sort((a,b) => a[0].localeCompare(b[0])).forEach(([pot, data]) => {
        const li = document.createElement('li');
        const waterInterval = data.waterIntervalMinutes || 1440; // Assume base if missing
        const actualInterval = waterInterval / data.drainMultiplier;
        li.innerHTML = `<strong>${pot}:</strong> Growth x${data.growthMultiplier.toFixed(2)}, Water Drain x${data.drainMultiplier.toFixed(2)} <i>(Needs water ~every ${actualInterval.toFixed(0)} game mins)</i>`;
        refPotUl.appendChild(li);
    });


    // --- Calculation Logic ---
    const performCalculation = () => {
        const selectedSeed = seedSelect.value;
        const selectedPot = potSelect.value;
        const plantTimeString = plantTimeInput.value;

        if (!selectedSeed || !selectedPot || !plantTimeString) {
            alert('Please select a Seed, Pot Type, and Plant Time.');
            resultsDiv.style.display = 'none';
            return;
        }

        let plantTimestamp;
        try {
            plantTimestamp = new Date(plantTimeString).getTime();
            if (isNaN(plantTimestamp)) throw new Error();
        } catch (e) {
            alert('Invalid Plant Date & Time format provided.');
            resultsDiv.style.display = 'none';
            return;
        }

        const baseGrowMinutes = BASE_GROW_TIMES[selectedSeed] || 1440; // Default if seed unknown
        const potInfo = POT_DATA[selectedPot] || POT_DATA["Plastic Pot"]; // Default if pot unknown

        // Calculate Grow Time
        const actualGrowMinutes = baseGrowMinutes / potInfo.growthMultiplier;
        const growMillis = actualGrowMinutes * GAME_MINUTE_TO_REAL_MS;
        const estimatedHarvestTimestamp = plantTimestamp + growMillis;

        resultGrowTimeP.innerHTML = `Estimated Grow Time: <strong>${formatDuration(growMillis)}</strong> (Real Time) / ${actualGrowMinutes.toFixed(0)} Game Minutes`;
        resultHarvestTimeP.innerHTML = `Estimated Harvest Time: <strong>${formatDateTime(estimatedHarvestTimestamp)}</strong>`;

        // Calculate Watering Need
        const lastWateredString = lastWateredInput.value;
        if (lastWateredString) {
            try {
                const lastWateredTimestamp = new Date(lastWateredString).getTime();
                if (isNaN(lastWateredTimestamp)) throw new Error();

                const baseWaterIntervalMillis = (potInfo.waterIntervalMinutes || 1440) * GAME_MINUTE_TO_REAL_MS;
                const actualWaterIntervalMillis = baseWaterIntervalMillis / potInfo.drainMultiplier;
                const nextWaterTimestamp = lastWateredTimestamp + actualWaterIntervalMillis;

                resultNextWaterP.innerHTML = `Estimated Next Watering: <strong>${formatDateTime(nextWaterTimestamp)}</strong>`;
                resultNextWaterP.style.display = 'block';

            } catch (e) {
                resultNextWaterP.innerHTML = 'Estimated Next Watering: <em>Invalid Last Watered time entered.</em>';
                resultNextWaterP.style.display = 'block';
            }
        } else {
            resultNextWaterP.style.display = 'none'; // Hide if no last watered time
        }

        resultNotesP.textContent = `Calculations based on ${selectedSeed} in a ${selectedPot}. Does not account for soil type or additives like Speed Grow.`;
        resultsDiv.style.display = 'block';
    };

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', performCalculation);

    // Set default plant time to now when page loads
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone for input default
    now.setSeconds(0); // Clear seconds for cleaner default
    plantTimeInput.value = now.toISOString().slice(0, 16);


}); // End DOMContentLoaded