      
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

    // --- Game Data (Simplified - Needs full population from your database) ---
    // Effects Data (GUID -> { name, tier, addictiveness, valueMod })
    const EFFECTS_DATA = {
        "ff88fffc965badc409a4b46d2652a178": { name: "Calming", tier: 1, addictiveness: 0, valueMod: 0.1 },
        "1f669aa2a1321f24db07f43770fc20c9": { name: "Refreshing", tier: 1, addictiveness: 0.104, valueMod: 0.14 },
        "8301163bca693374fbca43f5ae493605": { name: "Energizing", tier: 2, addictiveness: 0.34, valueMod: 0.22 },
        "cee302b478ed60441a0bd7023ad82e5c": { name: "Sedating", tier: 2, addictiveness: 0, valueMod: 0.26 },
        "dab9f348050ec7b4fbac698f3b32dd4e": { name: "Thought-Provoking", tier: 4, addictiveness: 0.37, valueMod: 0.44 },
        "255ee6603a48b8f4ea0ad5b33d73afb6": { name: "Gingeritis", tier: 2, addictiveness: 0, valueMod: 0.2 },
        "9a1c55c8870b7134b8d14216dbf38977": { name: "Bright-Eyed", tier: 4, addictiveness: 0.2, valueMod: 0.4 },
        "45255276d6b7e92409f1aeff18e7e5bd": { name: "Spicy", tier: 3, addictiveness: 0.665, valueMod: 0.38 },
        "12826c936a1eac2408fcae55dfd02ad2": { name: "Calorie-Dense", tier: 2, addictiveness: 0.1, valueMod: 0.28 },
        "bc28a333fd5cf2048a8111c0c6178044": { name: "Athletic", tier: 3, addictiveness: 0.607, valueMod: 0.32 },
        "b34cc41265d8697478143dc30916100b": { name: "Toxic", tier: 2, addictiveness: 0, valueMod: 0 }, // Negative
        "0dce587811d674b4eb7c0fe0891f004d": { name: "Long faced", tier: 5, addictiveness: 0.607, valueMod: 0.52 },
        "cbc01bf3304d3654fbb3b38b49f443ba": { name: "Jennerising", tier: 4, addictiveness: 0.343, valueMod: 0.42 },
        "f4e8b2e3804dd174b8ef45a125d4620a": { name: "Foggy", tier: 3, addictiveness: 0.1, valueMod: 0.36 },
        "09cc6fed996998f40b9411f43cfa8146": { name: "Slippery", tier: 3, addictiveness: 0.309, valueMod: 0.34 },
        "8a18aa6111557e246823661b9136e1ab": { name: "Balding", tier: 3, addictiveness: 0, valueMod: 0.3 },
        "51a993ea0c0d04440b1d8edefcd528e4": { name: "Sneaky", tier: 2, addictiveness: 0.327, valueMod: 0.24 },
        "6b16a3f1922a5974bb14367c8c2aff04": { name: "Tropic Thunder", tier: 4, addictiveness: 0.803, valueMod: 0.46 },
        // Add ALL effects from properties.md here
        "3f4f290ea8487134498e81b12e62caa7": { name: "Euphoric", tier: 1, addictiveness: 0.235, valueMod: 0.18 },
        "64dfda7c41360f545b54e42c1fef28e9": { name: "Focused", tier: 1, addictiveness: 0.104, valueMod: 0.16 },
        "10e411647a7578940bc89f097a6653bb": { name: "Munchies", tier: 1, addictiveness: 0.096, valueMod: 0.12 },
        "49438371dd4ec884faffec14e0d82c1d": { name: "Paranoia", tier: 1, addictiveness: 0, valueMod: 0 },
        "3280aaf123fdf3349b86dc4565b34b60": { name: "Smelly", tier: 1, addictiveness: 0, valueMod: 0 },
        "f97424863d141dd44a2d886552a9ffed": { name: "Disorienting", tier: 2, addictiveness: 0, valueMod: 0 },
        "84e743d1a3e8e864ea09facbe5736d80": { name: "Laxative", tier: 3, addictiveness: 0.1, valueMod: 0 },
        "c9f624e2d8653c24ea25a8bd095a39cb": { name: "Seizure-Inducing", tier: 3, addictiveness: 0, valueMod: 0 },
        "ed5319276a4cfeb4281aae5984b5d04e": { name: "Glowing", tier: 4, addictiveness: 0.472, valueMod: 0.48 },
        "be6ef3c6460adac459cb7b6f45e4e75f": { name: "Lethal", tier: 4, addictiveness: 0, valueMod: 0 },
        "5a7b3fa762f157a4abd69fbb4b292ea2": { name: "Schizophrenic", tier: 4, addictiveness: 0, valueMod: 0 },
        "40784621a2e5fbe4cbc4248de7983706": { name: "Anti-gravity", tier: 5, addictiveness: 0.611, valueMod: 0.54 },
        "65db5bdb2fe479443bee064eeab25866": { name: "Cyclopean", tier: 5, addictiveness: 0.1, valueMod: 0.56 },
        "8d4588c64b65e0b46b2efcae062176a3": { name: "Electrifying", tier: 5, addictiveness: 0.235, valueMod: 0.5 },
        "8855d004355ec0d4db89224a65f18b27": { name: "Explosive", tier: 5, addictiveness: 0, valueMod: 0 },
        "c45539561ef11a746bfb77b48ae01268": { name: "Shrinking", tier: 5, addictiveness: 0.336, valueMod: 0.6 },
        "b8e941ae03ded1b45b9cc184df468bba": { name: "Zombifying", tier: 5, addictiveness: 0.598, valueMod: 0.58 },
    };

    // Base Product Data (id -> { name, type, baseMarketValue, baseAddictiveness, properties: [effectGuid1, ...] })
    const BASE_PRODUCTS = {
        "ogkush": { name: "OG Kush", type: "Marijuana", baseMarketValue: 38, baseAddictiveness: 0, properties: ["ff88fffc965badc409a4b46d2652a178"] },
        "sourdiesel": { name: "Sour Diesel", type: "Marijuana", baseMarketValue: 40, baseAddictiveness: 0, properties: ["1f669aa2a1321f24db07f43770fc20c9"] },
        "greencrack": { name: "Green Crack", type: "Marijuana", baseMarketValue: 43, baseAddictiveness: 0, properties: ["8301163bca693374fbca43f5ae493605"] },
        "granddaddypurple": { name: "Granddaddy Purple", type: "Marijuana", baseMarketValue: 44, baseAddictiveness: 0, properties: ["cee302b478ed60441a0bd7023ad82e5c"] },
        "cocaine": { name: "Cocaine", type: "Cocaine", baseMarketValue: 150, baseAddictiveness: 0.4, properties: [] },
        "meth": { name: "Meth", type: "Methamphetamine", baseMarketValue: 70, baseAddictiveness: 0.6, properties: [] },
        "babyblue": { name: "Baby Blue", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
        "bikercrank": { name: "Biker Crank", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
        "glass": { name: "Glass", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
        // Add more base products if needed
    };

    // Ingredient Data (id -> { name, propertyGuid })
    const INGREDIENTS = {
        "addy": { name: "Addy", propertyGuid: "dab9f348050ec7b4fbac698f3b32dd4e" }, // Thought-Provoking
        "banana": { name: "Banana", propertyGuid: "255ee6603a48b8f4ea0ad5b33d73afb6" }, // Gingeritis
        "battery": { name: "Battery", propertyGuid: "9a1c55c8870b7134b8d14216dbf38977" }, // Bright-Eyed
        "chili": { name: "Chili", propertyGuid: "45255276d6b7e92409f1aeff18e7e5bd" }, // Spicy
        "cuke": { name: "Cuke", propertyGuid: "8301163bca693374fbca43f5ae493605" }, // Energizing
        "donut": { name: "Donut", propertyGuid: "12826c936a1eac2408fcae55dfd02ad2" }, // Calorie-Dense
        "energydrink": { name: "Energy Drink", propertyGuid: "bc28a333fd5cf2048a8111c0c6178044" }, // Athletic
        "flumedicine": { name: "Flu Medicine", propertyGuid: "cee302b478ed60441a0bd7023ad82e5c" }, // Sedating
        "gasoline": { name: "Gasoline", propertyGuid: "b34cc41265d8697478143dc30916100b" }, // Toxic
        "horsesemen": { name: "Horse Semen", propertyGuid: "0dce587811d674b4eb7c0fe0891f004d" }, // Long faced
        "iodine": { name: "Iodine", propertyGuid: "cbc01bf3304d3654fbb3b38b49f443ba" }, // Jennerising
        "megabean": { name: "Mega Bean", propertyGuid: "f4e8b2e3804dd174b8ef45a125d4620a" }, // Foggy
        "motoroil": { name: "Motor Oil", propertyGuid: "09cc6fed996998f40b9411f43cfa8146" }, // Slippery
        "mouthwash": { name: "Mouth Wash", propertyGuid: "8a18aa6111557e246823661b9136e1ab" }, // Balding
        "paracetamol": { name: "Paracetamol", propertyGuid: "51a993ea0c0d04440b1d8edefcd528e4" }, // Sneaky
        "viagra": { name: "Viagra", propertyGuid: "6b16a3f1922a5974bb14367c8c2aff04" }, // Tropic Thunder
        // Add Acid, Phosphorus, Pseudos if they add effects (unlikely)
    };

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

    