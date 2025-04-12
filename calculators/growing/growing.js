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

    // --- Static Game Data (From game files) ---
    // Base grow times in GAME MINUTES (1 real second = 1 game minute default)
    const BASE_GROW_TIMES = {
        "Coca Seed": 2880, // ~48 real mins
        "Granddaddy Purple Seed": 1600, // ~26.7 real mins
        "Green Crack Seed": 1380, // ~23 real mins
        "OG Kush Seed": 1440, // ~24 real mins
        "Sour Diesel Seed": 1500, // ~25 real mins
        // Add more from seeds.md if available
        "Test Weed Seed": 1440 // Placeholder if needed
    };

    // Pot modifiers and watering intervals
    // waterIntervalMinutes: Base GAME MINUTES before needing water (assuming standard soil baseline)
    // drainMultiplier: How much faster/slower water drains (1.0 = normal)
    // growthMultiplier: How much faster/slower plants grow (1.0 = normal)
    const POT_DATA = {
        "Plastic Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.0 }, // Baseline
        "Air Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.3, growthMultiplier: 1.15 }, // Drains 30% faster, grows 15% faster
        "Moisture-Preserving Pot": { waterIntervalMinutes: 1440, drainMultiplier: 0.6, growthMultiplier: 1.0 }, // Drains 40% slower
        "Grow Tent": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.20 }, // Grows 20% faster (Example value, adjust if known)
        // Add other pots if necessary
    };
    // Note: Soil type also affects uses and potentially drain/growth, but this calculator focuses on pots for simplicity.
    // Note: Additives like Speed Grow (instant %) or Fertilizer/PGR (quality/yield) are not calculated here.

    const GAME_MINUTE_TO_REAL_MS = 1000; // 1 game minute = 1 real second = 1000 ms

    // --- Utility Functions ---
    const formatDateTime = (timestamp) => {
        if (!timestamp || isNaN(timestamp)) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const formatDuration = (milliseconds) => {
        if (isNaN(milliseconds) || milliseconds < 0) return 'N/A';

        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 && parts.length < 2) parts.push(`${seconds}s`); // Only show seconds if duration is short

        return parts.length > 0 ? parts.join(' ') : 'Instant';
    };

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