document.addEventListener('DOMContentLoaded', () => {
    // Input fields
    const chemStationsInput = document.getElementById('calc-chem-stations');
    const labOvensInput = document.getElementById('calc-lab-ovens');
    const growLightsInput = document.getElementById('calc-grow-lights');
    const otherPowerInput = document.getElementById('calc-other-power');
    const propertyLightsInput = document.getElementById('calc-property-lights');
    const tapsUsedInput = document.getElementById('calc-taps-used');
    const potSprinklersInput = document.getElementById('calc-pot-sprinklers');
    const bigSprinklersInput = document.getElementById('calc-big-sprinklers');
    const durationSelect = document.getElementById('calc-duration');
    const calculateBtn = document.getElementById('calculate-utility-btn');

    // Result fields
    const resultsDiv = document.getElementById('utility-results');
    const resultDurationSpan = document.getElementById('result-duration');
    const resultPowerKwhSpan = document.getElementById('result-power-kwh');
    const resultPowerCostSpan = document.getElementById('result-power-cost');
    const resultWaterLSpan = document.getElementById('result-water-l');
    const resultWaterCostSpan = document.getElementById('result-water-cost');
    const resultTotalCostSpan = document.getElementById('result-total-cost');

    // Reference fields
    const refPowerCostSpan = document.getElementById('ref-power-cost');
    const refWaterCostSpan = document.getElementById('ref-water-cost');


    // --- Game Data (From property.md - Needs confirmation) ---
    const PRICE_PER_KWH = 0.15; // Example cost, update with actual game value if found
    const PRICE_PER_LITRE = 0.05; // Example cost, update with actual game value if found

    // Estimated Consumption Rates (per GAME HOUR for power, per GAME DAY for water)
    // These are placeholders and need refinement based on gameplay observation
    const CONSUMPTION_RATES = {
        chemStation_kWh_per_Hour: 0.5,
        labOven_kWh_per_Hour: 0.8,
        growLight_kWh_per_Hour: 0.2,
        otherStation_kWh_per_Hour: 0.1,
        propertyLight_kWh_per_Hour: 0.05, // Assume lights are on ~12 hours a day? Or user estimates? Let's assume per hour ON.
        manualWater_L_per_Day: 1.0, // User inputs total daily average
        potSprinkler_L_per_Day: 10.0,
        bigSprinkler_L_per_Day: 50.0,
    };

    const GAME_HOURS_PER_DAY = 24;

    // --- Utility Functions ---
     const formatCurrency = (amount) => {
        return `$${Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`; // Add commas
    };

    // --- Populate Reference Costs ---
    refPowerCostSpan.textContent = PRICE_PER_KWH.toFixed(2);
    refWaterCostSpan.textContent = PRICE_PER_LITRE.toFixed(2);


    // --- Calculation Logic ---
    const calculateCosts = () => {
        // Get counts
        const numChemStations = parseInt(chemStationsInput.value, 10) || 0;
        const numLabOvens = parseInt(labOvensInput.value, 10) || 0;
        const numGrowLights = parseInt(growLightsInput.value, 10) || 0;
        const numOtherPower = parseInt(otherPowerInput.value, 10) || 0;
        const numPropertyLights = parseInt(propertyLightsInput.value, 10) || 0;

        const manualWaterLDay = parseFloat(tapsUsedInput.value) || 0;
        const numPotSprinklers = parseInt(potSprinklersInput.value, 10) || 0;
        const numBigSprinklers = parseInt(bigSprinklersInput.value, 10) || 0;

        const durationDays = parseInt(durationSelect.value, 10) || 1;

        // --- Calculate Power ---
        // Assume stations/lights run continuously for simplicity, except property lights
        // A more complex calc would factor in active usage time
        const hoursInDuration = durationDays * GAME_HOURS_PER_DAY;
        // Estimate property lights are on 12 hours per day
        const lightOnHours = durationDays * 12;

        const totalKwh = (
            (numChemStations * CONSUMPTION_RATES.chemStation_kWh_per_Hour * hoursInDuration) +
            (numLabOvens * CONSUMPTION_RATES.labOven_kWh_per_Hour * hoursInDuration) +
            (numGrowLights * CONSUMPTION_RATES.growLight_kWh_per_Hour * hoursInDuration) +
            (numOtherPower * CONSUMPTION_RATES.otherStation_kWh_per_Hour * hoursInDuration) +
            (numPropertyLights * CONSUMPTION_RATES.propertyLight_kWh_per_Hour * lightOnHours) // Use lightOnHours
        );

        const totalPowerCost = totalKwh * PRICE_PER_KWH;

        // --- Calculate Water ---
        const totalLitres = (
            (manualWaterLDay * durationDays) + // User provides daily average
            (numPotSprinklers * CONSUMPTION_RATES.potSprinkler_L_per_Day * durationDays) +
            (numBigSprinklers * CONSUMPTION_RATES.bigSprinkler_L_per_Day * durationDays)
        );

        const totalWaterCost = totalLitres * PRICE_PER_LITRE;

        // --- Total Cost ---
        const totalCost = totalPowerCost + totalWaterCost;

        // --- Display Results ---
        resultDurationSpan.textContent = durationDays;
        resultPowerKwhSpan.textContent = totalKwh.toFixed(1);
        resultPowerCostSpan.textContent = formatCurrency(totalPowerCost);
        resultWaterLSpan.textContent = totalLitres.toFixed(1);
        resultWaterCostSpan.textContent = formatCurrency(totalWaterCost);
        resultTotalCostSpan.textContent = formatCurrency(totalCost);

        resultsDiv.style.display = 'block';
    };


    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateCosts);

    // Optional: Recalculate when inputs change
    const inputs = [chemStationsInput, labOvensInput, growLightsInput, otherPowerInput, propertyLightsInput, tapsUsedInput, potSprinklersInput, bigSprinklersInput, durationSelect];
    inputs.forEach(input => {
        input.addEventListener('change', calculateCosts);
         // Recalculate on number input typing as well
         if (input.type === 'number') {
             input.addEventListener('input', calculateCosts);
         }
    });


    // --- Initial Calculation ---
    calculateCosts(); // Run once on load with default values

}); // End DOMContentLoaded