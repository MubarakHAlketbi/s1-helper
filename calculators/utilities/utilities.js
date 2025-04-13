import { PRICE_PER_KWH, PRICE_PER_LITRE, EQUIPMENT_POWER_WATER, GAME_HOURS_PER_DAY } from '../../database/game_data.js';
import { formatCurrency } from '../../utils/helpers.js';

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


    // Game data is imported from ../../database/game_data.js

    // Game data and helpers are imported

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
            (numChemStations * EQUIPMENT_POWER_WATER.chemStation_kWh_per_Hour * hoursInDuration) +
            (numLabOvens * EQUIPMENT_POWER_WATER.labOven_kWh_per_Hour * hoursInDuration) +
            (numGrowLights * EQUIPMENT_POWER_WATER.growLight_kWh_per_Hour * hoursInDuration) +
            (numOtherPower * EQUIPMENT_POWER_WATER.otherStation_kWh_per_Hour * hoursInDuration) +
            (numPropertyLights * EQUIPMENT_POWER_WATER.propertyLight_kWh_per_Hour * lightOnHours) // Use lightOnHours
        );

        const totalPowerCost = totalKwh * PRICE_PER_KWH;

        // --- Calculate Water ---
        const totalLitres = (
            (manualWaterLDay * durationDays) + // User provides daily average
            (numPotSprinklers * EQUIPMENT_POWER_WATER.potSprinkler_L_per_Day * durationDays) +
            (numBigSprinklers * EQUIPMENT_POWER_WATER.bigSprinkler_L_per_Day * durationDays)
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