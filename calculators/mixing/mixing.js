      
import { EFFECTS_DATA, BASE_PRODUCTS, INGREDIENTS } from '../../database/game_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const baseProductTypeSelect = document.getElementById('base-product-type');
    const baseProductSelect = document.getElementById('base-product');
    const ingredientSelect = document.getElementById('ingredient');
    const calculateBtn = document.getElementById('calculate-mix-btn');
    const resultsDiv = document.getElementById('mixing-results');

    // Result fields
    const resultBaseProductName = document.getElementById('result-base-product-name');
    const resultIngredientName = document.getElementById('result-ingredient-name');
    const resultEffectsListUl = document.getElementById('result-effects-list');
    const resultAddictivenessSpan = document.getElementById('result-addictiveness');
    const resultValueModSpan = document.getElementById('result-value-mod');
    const resultMarketValueSpan = document.getElementById('result-market-value');

    const MAX_PROPERTIES = 8;

    // Game data is imported from ../../database/game_data.js
    // --- Populate Selects ---
    const populateBaseProducts = (productType) => {
        baseProductSelect.innerHTML = '<option value="" disabled selected>-- Select Base Product --</option>'; // Clear and add default
        Object.entries(BASE_PRODUCTS)
            .filter(([id, data]) => data.type === productType)
            .sort(([,a], [,b]) => a.name.localeCompare(b.name))
            .forEach(([id, data]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = data.name;
                baseProductSelect.appendChild(option);
            });
    };

    Object.entries(INGREDIENTS)
        .sort(([,a], [,b]) => a.name.localeCompare(b.name))
        .forEach(([id, data]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = data.name;
            ingredientSelect.appendChild(option);
        });

    // --- Event Listeners ---
    baseProductTypeSelect.addEventListener('change', (e) => {
        populateBaseProducts(e.target.value);
        resultsDiv.style.display = 'none'; // Hide results when type changes
    });

     baseProductSelect.addEventListener('change', () => {
        resultsDiv.style.display = 'none'; // Hide results when base changes
    });
     ingredientSelect.addEventListener('change', () => {
        resultsDiv.style.display = 'none'; // Hide results when ingredient changes
    });

    calculateBtn.addEventListener('click', () => {
        const baseProductId = baseProductSelect.value;
        const ingredientId = ingredientSelect.value;

        if (!baseProductId || !ingredientId) {
            alert('Please select a Base Product and an Ingredient.');
            return;
        }

        const baseProduct = BASE_PRODUCTS[baseProductId];
        const ingredient = INGREDIENTS[ingredientId];
        const ingredientEffectGuid = ingredient.propertyGuid;

        if (!baseProduct || !ingredient || !ingredientEffectGuid) {
            console.error("Missing data for selected product or ingredient");
            alert("Error: Missing data for calculation.");
            return;
        }

        // --- Simplified Mixing Logic ---
        let combinedEffectsGuids = [...baseProduct.properties];

        // Add ingredient effect if not already present and under the limit
        if (!combinedEffectsGuids.includes(ingredientEffectGuid) && combinedEffectsGuids.length < MAX_PROPERTIES) {
            combinedEffectsGuids.push(ingredientEffectGuid);
        } else if (combinedEffectsGuids.includes(ingredientEffectGuid)) {
            // If effect already exists, maybe slightly boost value/addictiveness? (Optional complexity)
            console.log("Ingredient effect already present, no change in effect list.");
        } else {
             console.log(`Max properties (${MAX_PROPERTIES}) reached. Ingredient effect not added.`);
             // In a more complex sim, decide which effect gets removed. Here, we just don't add.
        }

        // Sort effects by tier, then name for consistent display
        const combinedEffectsData = combinedEffectsGuids
            .map(guid => ({ guid, ...EFFECTS_DATA[guid] }))
            .filter(effect => effect.name) // Filter out potentially missing effects
            .sort((a, b) => {
                if (a.tier !== b.tier) {
                    return a.tier - b.tier;
                }
                return a.name.localeCompare(b.name);
            });

        // Calculate total addictiveness and value modifier
        let totalAddictiveness = baseProduct.baseAddictiveness;
        let totalValueModifier = 0; // Start from 0, add modifiers

        combinedEffectsData.forEach(effect => {
            totalAddictiveness += effect.addictiveness || 0;
            totalValueModifier += effect.valueMod || 0;
        });

        // Cap addictiveness at 1.0 (100%)
        totalAddictiveness = Math.min(1.0, totalAddictiveness);

        // Calculate final estimated market value
        const estimatedMarketValue = baseProduct.baseMarketValue * (1 + totalValueModifier);

        // --- Display Results ---
        resultBaseProductName.textContent = baseProduct.name;
        resultIngredientName.textContent = ingredient.name;

        resultEffectsListUl.innerHTML = ''; // Clear previous list
        if (combinedEffectsData.length > 0) {
            combinedEffectsData.forEach(effect => {
                const li = document.createElement('li');
                li.textContent = `${effect.name}`;
                const tierSpan = document.createElement('span');
                tierSpan.classList.add('tier');
                tierSpan.textContent = ` (T${effect.tier})`;
                li.appendChild(tierSpan);
                resultEffectsListUl.appendChild(li);
            });
        } else {
            resultEffectsListUl.innerHTML = '<li>None</li>';
        }

        resultAddictivenessSpan.textContent = (totalAddictiveness * 100).toFixed(1);
        resultValueModSpan.textContent = (totalValueModifier * 100).toFixed(1);
        resultMarketValueSpan.textContent = estimatedMarketValue.toFixed(2);

        resultsDiv.style.display = 'block';
    });


    // --- Initial Population ---
    populateBaseProducts(baseProductTypeSelect.value); // Populate based on default selection

}); // End DOMContentLoaded

    