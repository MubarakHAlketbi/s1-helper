document.addEventListener('DOMContentLoaded', () => {
    const customerSelect = document.getElementById('calc-customer');
    const productSelect = document.getElementById('calc-product');
    const qualitySelect = document.getElementById('calc-quality');
    const quantityInput = document.getElementById('calc-quantity');
    const pricePaidInput = document.getElementById('calc-price-paid');
    const relationshipInput = document.getElementById('calc-current-relationship');
    const calculateBtn = document.getElementById('calculate-satisfaction-btn');
    const resultsDiv = document.getElementById('satisfaction-results');

    // Result fields
    const resultScoreSpan = document.getElementById('result-satisfaction-score');
    const resultRelChangeSpan = document.getElementById('result-relationship-change');
    const resultFactorsUl = document.getElementById('result-factors-list');
    const resultCustomerStandardSpan = document.getElementById('result-customer-standard');
    const resultCustomerPrefsSpan = document.getElementById('result-customer-prefs');
    const resultIdealPriceSpan = document.getElementById('result-ideal-price');

    // --- Game Data (Needs full population from database/supporting_data.md) ---
    const CUSTOMER_DATA = {
        // Example structure - Populate with ALL customers
        "beth": { name: "Beth", standard: 1, affinity: { Marijuana: 0.30, Methamphetamine: 0.31, Cocaine: -0.20 }, prefs: ["slippery", "lethal", "athletic"] },
        "billy": { name: "Billy", standard: 2, affinity: { Marijuana: 0.09, Methamphetamine: -0.63, Cocaine: 0.57 }, prefs: ["shrinking", "slippery", "zombifying"] },
        "carl": { name: "Carl", standard: 3, affinity: { Marijuana: -0.81, Methamphetamine: -0.23, Cocaine: -0.58 }, prefs: ["electrifying", "toxic", "energizing"] },
        "chloe": { name: "Chloe", standard: 1, affinity: { Marijuana: 0.44, Methamphetamine: 0.79, Cocaine: 0.25 }, prefs: ["euphoric", "lethal", "munchies"] },
        "chris": { name: "Chris", standard: 3, affinity: { Marijuana: -0.83, Methamphetamine: 0.40, Cocaine: 0.79 }, prefs: ["spicy", "euphoric", "zombifying"] },
        "dennis": { name: "Dennis", standard: 3, affinity: { Marijuana: 0.26, Methamphetamine: 0.08, Cocaine: -0.89 }, prefs: ["toxic", "refreshing", "electrifying"] },
        "donna": { name: "Donna", standard: 1, affinity: { Marijuana: 0.93, Methamphetamine: -0.27, Cocaine: 0.25 }, prefs: ["energizing", "lethal", "munchies"] },
        "doris": { name: "Doris", standard: 1, affinity: { Marijuana: 0.46, Methamphetamine: 0.16, Cocaine: 0.58 }, prefs: ["shrinking", "tropicthunder", "antigravity"] },
        "elizabeth": { name: "Elizabeth", standard: 2, affinity: { Marijuana: 0.33, Methamphetamine: 0.45, Cocaine: 0.32 }, prefs: ["focused", "tropicthunder", "gingeritis"] },
        "eugene": { name: "Eugene", standard: 2, affinity: { Marijuana: 0.66, Methamphetamine: 0.11, Cocaine: 0.17 }, prefs: ["slippery", "gingeritis", "calming"] },
        "fiona": { name: "Fiona", standard: 3, affinity: { Marijuana: 0.03, Methamphetamine: 0.08, Cocaine: -0.50 }, prefs: ["lethal", "balding", "tropicthunder"] },
        "genghis": { name: "Genghis", standard: 0, affinity: { Marijuana: 0.85, Methamphetamine: -0.64, Cocaine: 0.45 }, prefs: ["zombifying", "sneaky", "toxic"] },
        "greg": { name: "Greg", standard: 0, affinity: { Marijuana: 0.58, Methamphetamine: -0.58, Cocaine: -0.35 }, prefs: ["euphoric", "tropicthunder", "gingeritis"] },
        "harold": { name: "Harold", standard: 3, affinity: { Marijuana: -0.95, Methamphetamine: -0.78, Cocaine: -0.70 }, prefs: ["athletic", "shrinking", "laxative"] },
        "herbert": { name: "Herbert", standard: 3, affinity: { Marijuana: 0.81, Methamphetamine: 0.39, Cocaine: 0.27 }, prefs: ["jennerising", "athletic", "zombifying"] },
        "jack": { name: "Jack", standard: 3, affinity: { Marijuana: 0.66, Methamphetamine: 0.88, Cocaine: 0.10 }, prefs: ["lethal", "balding"] }, // Duplicate lethal removed
        "jennifer": { name: "Jennifer", standard: 2, affinity: { Marijuana: -0.88, Methamphetamine: 0.42, Cocaine: 0.65 }, prefs: ["lethal", "jennerising", "gingeritis"] },
        "jeremy": { name: "Jeremy", standard: 3, affinity: { Marijuana: 0.58, Methamphetamine: 0.53, Cocaine: 0.83 }, prefs: ["antigravity", "jennerising", "refreshing"] },
        "lisa": { name: "Lisa", standard: 2, affinity: { Marijuana: -0.82, Methamphetamine: -0.36, Cocaine: -0.28 }, prefs: ["smelly", "slippery", "brighteyed"] },
        "louis": { name: "Louis", standard: 2, affinity: { Marijuana: 0.94, Methamphetamine: -0.92, Cocaine: -0.30 }, prefs: ["lethal", "athletic", "disorienting"] },
        "lucy": { name: "Lucy", standard: 2, affinity: { Marijuana: 0.65, Methamphetamine: -0.79, Cocaine: 0.19 }, prefs: ["refreshing", "euphoric", "electrifying"] },
        "ludwig": { name: "Ludwig", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.59, Cocaine: -0.68 }, prefs: ["euphoric", "energizing", "focused"] },
        "mac": { name: "Mac", standard: 2, affinity: { Marijuana: -0.57, Methamphetamine: -0.38, Cocaine: 0.27 }, prefs: ["refreshing", "shrinking", "zombifying"] },
        "marco": { name: "Marco", standard: 2, affinity: { Marijuana: 0.34, Methamphetamine: 0.08, Cocaine: 0.54 }, prefs: ["spicy", "zombifying", "energizing"] },
        "meg": { name: "Meg", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.04, Cocaine: 0.72 }, prefs: ["spicy", "jennerising", "balding"] },
        "melissa": { name: "Melissa", standard: 2, affinity: { Marijuana: -0.26, Methamphetamine: 0.67, Cocaine: 0.42 }, prefs: ["brighteyed", "energizing", "jennerising"] },
        "michael": { name: "Michael", standard: 3, affinity: { Marijuana: 0.17, Methamphetamine: 0.95, Cocaine: 0.70 }, prefs: ["laxative", "calming", "slippery"] },
        "pearl": { name: "Pearl", standard: 3, affinity: { Marijuana: 0.89, Methamphetamine: -0.89, Cocaine: 0.67 }, prefs: ["slippery", "sneaky", "zombifying"] },
        "philip": { name: "Philip", standard: 2, affinity: { Marijuana: 0.97, Methamphetamine: 0.78, Cocaine: -0.22 }, prefs: ["energizing", "lethal", "athletic"] },
        "sam": { name: "Sam", standard: 1, affinity: { Marijuana: -0.76, Methamphetamine: 0.30, Cocaine: -0.80 }, prefs: ["munchies", "toxic", "refreshing"] },
        "tobias": { name: "Tobias", standard: 3, affinity: { Marijuana: 0.19, Methamphetamine: 0.76, Cocaine: 0.17 }, prefs: ["lethal", "energizing", "shrinking"] },
        "walter": { name: "Walter", standard: 3, affinity: { Marijuana: -0.14, Methamphetamine: -0.30, Cocaine: -0.44 }, prefs: ["slippery", "calming", "antigravity"] },
    };

    const PRODUCT_DATA = {
        // Example - Populate with base products
        "ogkush": { name: "OG Kush", type: "Marijuana", baseValue: 38, properties: ["calming"] },
        "sourdiesel": { name: "Sour Diesel", type: "Marijuana", baseValue: 40, properties: ["refreshing"] },
        "greencrack": { name: "Green Crack", type: "Marijuana", baseValue: 43, properties: ["energizing"] },
        "granddaddypurple": { name: "Granddaddy Purple", type: "Marijuana", baseValue: 44, properties: ["sedating"] },
        "cocaine": { name: "Cocaine", type: "Cocaine", baseValue: 150, properties: [] },
        "meth": { name: "Meth", type: "Methamphetamine", baseValue: 70, properties: [] },
        "babyblue": { name: "Baby Blue", type: "Methamphetamine", baseValue: 1, properties: [] }, // Needs effect data for value
        "bikercrank": { name: "Biker Crank", type: "Methamphetamine", baseValue: 1, properties: [] }, // Needs effect data for value
        "glass": { name: "Glass", type: "Methamphetamine", baseValue: 1, properties: [] }, // Needs effect data for value
        "testweed": { name: "Test Weed", type: "Marijuana", baseValue: 71, properties: ["shrinking", "thoughtprovoking"] },
    };

    const EFFECT_DATA = {
        // Example - Populate with ALL effects and their value modifiers
        "calming": { name: "Calming", valueMod: 0.1 },
        "refreshing": { name: "Refreshing", valueMod: 0.14 },
        "energizing": { name: "Energizing", valueMod: 0.22 },
        "sedating": { name: "Sedating", valueMod: 0.26 },
        "slippery": { name: "Slippery", valueMod: 0.34 },
        "lethal": { name: "Lethal", valueMod: 0 }, // Negative
        "athletic": { name: "Athletic", valueMod: 0.32 },
        "shrinking": { name: "Shrinking", valueMod: 0.6 },
        "zombifying": { name: "Zombifying", valueMod: 0.58 },
        "toxic": { name: "Toxic", valueMod: 0 }, // Negative
        "euphoric": { name: "Euphoric", valueMod: 0.18 },
        "munchies": { name: "Munchies", valueMod: 0.12 },
        "tropicthunder": { name: "Tropic Thunder", valueMod: 0.46 },
        "antigravity": { name: "Anti-gravity", valueMod: 0.54 },
        "focused": { name: "Focused", valueMod: 0.16 },
        "gingeritis": { name: "Gingeritis", valueMod: 0.2 },
        "balding": { name: "Balding", valueMod: 0.3 },
        "spicy": { name: "Spicy", valueMod: 0.38 },
        "jennerising": { name: "Jennerising", valueMod: 0.42 },
        "sneaky": { name: "Sneaky", valueMod: 0.24 },
        "electrifying": { name: "Electrifying", valueMod: 0.5 },
        "smelly": { name: "Smelly", valueMod: 0 }, // Negative
        "brighteyed": { name: "Bright-Eyed", valueMod: 0.4 },
        "disorienting": { name: "Disorienting", valueMod: 0 }, // Negative
        "laxative": { name: "Laxative", valueMod: 0 }, // Negative
        "thoughtprovoking": { name: "Thought-Provoking", valueMod: 0.44 },
        // Add all others...
    };

    const QUALITY_LEVELS = ["Trash", "Poor", "Standard", "Premium", "Heavenly"];
    const QUALITY_VALUE_MULTIPLIERS = { 0: 0.5, 1: 0.8, 2: 1.0, 3: 1.2, 4: 1.5 }; // Assumed values
    const MAX_EFFECT_CONTRIBUTION = { type: 0.3, property: 0.4, quality: 0.3 }; // From economy.md

    // --- Populate Selects ---
    Object.keys(CUSTOMER_DATA).sort((a, b) => CUSTOMER_DATA[a].name.localeCompare(CUSTOMER_DATA[b].name)).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = CUSTOMER_DATA[id].name;
        customerSelect.appendChild(option);
    });

    Object.keys(PRODUCT_DATA).sort((a, b) => PRODUCT_DATA[a].name.localeCompare(PRODUCT_DATA[b].name)).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = PRODUCT_DATA[id].name;
        productSelect.appendChild(option);
    });

    // --- Calculation Logic ---
    const calculateSatisfaction = () => {
        const customerId = customerSelect.value;
        const productId = productSelect.value;
        const qualityDelivered = parseInt(qualitySelect.value, 10);
        const quantity = parseInt(quantityInput.value, 10);
        const pricePaid = parseFloat(pricePaidInput.value);
        // const currentRelationship = parseFloat(relationshipInput.value); // Not used in v1 calc

        if (!customerId || !productId || isNaN(qualityDelivered) || isNaN(quantity) || quantity <= 0 || isNaN(pricePaid)) {
            alert('Please fill in all required fields with valid numbers.');
            resultsDiv.style.display = 'none';
            return;
        }

        const customer = CUSTOMER_DATA[customerId];
        const product = PRODUCT_DATA[productId];

        if (!customer || !product) {
            alert('Error: Could not find data for selected customer or product.');
            resultsDiv.style.display = 'none';
            return;
        }

        // 1. Quality Satisfaction
        const customerStandardQuality = customer.standard; // 0-4
        const qualityDifference = qualityDelivered - customerStandardQuality;
        // Normalize difference to -1 to 1 range (approx)
        // Max diff is 4 (Heavenly delivered to VeryLow standard) or -4
        let qualityFactor = qualityDifference / 4; // Simple linear scaling for now
        // Clamp and apply max contribution
        qualityFactor = Math.max(-1, Math.min(1, qualityFactor)) * MAX_EFFECT_CONTRIBUTION.quality;

        // 2. Type Affinity Satisfaction
        const productType = product.type; // "Marijuana", "Methamphetamine", etc.
        const typeAffinity = customer.affinity[productType] || 0; // Get affinity score (-1 to 1)
        // Apply max contribution
        const typeFactor = typeAffinity * MAX_EFFECT_CONTRIBUTION.type;

        // 3. Preferred Property Satisfaction
        let propertyMatchScore = 0;
        const deliveredProperties = product.properties || [];
        const preferredProperties = customer.prefs || [];
        const numPreferred = preferredProperties.length;
        const numDelivered = deliveredProperties.length;

        if (numPreferred > 0 && numDelivered > 0) {
            let matches = 0;
            deliveredProperties.forEach(propId => {
                if (preferredProperties.includes(propId)) {
                    matches++;
                }
            });
            // Simple match ratio
            propertyMatchScore = (matches / numPreferred);
        } else if (numPreferred === 0) {
            propertyMatchScore = 0; // No preference, neutral score
        } else {
            propertyMatchScore = -0.5; // Has preferences, but delivered product has none - slightly negative?
        }
         // Clamp and apply max contribution
        const propertyFactor = Math.max(-1, Math.min(1, propertyMatchScore)) * MAX_EFFECT_CONTRIBUTION.property;


        // 4. Price Satisfaction (Compare paid vs calculated ideal)
        // Calculate base value from effects
        let effectValueMultiplier = 1.0;
        deliveredProperties.forEach(propId => {
            effectValueMultiplier += (EFFECT_DATA[propId]?.valueMod || 0);
        });

        const qualityMultiplier = QUALITY_VALUE_MULTIPLIERS[qualityDelivered] || 1.0;
        const calculatedIdealPricePerUnit = product.baseValue * qualityMultiplier * effectValueMultiplier;
        const calculatedIdealTotalPrice = calculatedIdealPricePerUnit * quantity;

        let priceFactor = 0;
        if (calculatedIdealTotalPrice > 0) {
            // Value between -1 (paid >2x ideal) and +1 (paid <0.5x ideal)
            const priceRatio = pricePaid / calculatedIdealTotalPrice;
             if (priceRatio <= 0.5) priceFactor = 1.0; // Very good deal
             else if (priceRatio <= 1.0) priceFactor = 1.0 - (priceRatio - 0.5) * 2; // Linear scale from 1.0 down to 0.0
             else if (priceRatio <= 2.0) priceFactor = 0.0 - (priceRatio - 1.0); // Linear scale from 0.0 down to -1.0
             else priceFactor = -1.0; // Very bad deal
        } else {
             priceFactor = (pricePaid > 1) ? -1.0 : 0.0; // If ideal price is near zero, any price is bad
        }
        // Price satisfaction might contribute more or less depending on game balance, let's give it a standard weight for now
        const priceSatisfactionWeight = 0.5; // How much price affects overall satisfaction (0 to 1)
        priceFactor *= priceSatisfactionWeight;


        // 5. Combine Factors (Weighted sum? Simple average? Needs testing)
        // Let's try a simple weighted average approach, ensuring it stays within a reasonable range (e.g., 0 to 1, or -1 to 1)
        // Max possible positive score: 0.3 (type) + 0.4 (prop) + 0.3 (qual) + 0.5 (price) = 1.5
        // Max possible negative score: -0.3 (type) - 0.4 (prop) - 0.3 (qual) - 0.5 (price) = -1.5
        let rawSatisfactionScore = typeFactor + propertyFactor + qualityFactor + priceFactor;

        // Normalize to 0-1 range (approximate)
        // Map -1.5 to 0, 0 to 0.5, 1.5 to 1
        let overallSatisfaction = (rawSatisfactionScore + 1.5) / 3.0;
        overallSatisfaction = Math.max(0, Math.min(1, overallSatisfaction)); // Clamp 0-1


        // 6. Estimate Relationship Change (Based on CustomerSatisfaction.cs logic - non-linear)
        let relationshipChange = 0;
        if (overallSatisfaction >= 0.9) relationshipChange = 0.25; // Very Happy
        else if (overallSatisfaction >= 0.7) relationshipChange = 0.15; // Happy
        else if (overallSatisfaction >= 0.5) relationshipChange = 0.05; // Content
        else if (overallSatisfaction >= 0.3) relationshipChange = -0.05; // Disappointed
        else if (overallSatisfaction >= 0.1) relationshipChange = -0.20; // Unhappy
        else relationshipChange = -0.50; // Very Unhappy / Rejected Deal Level

        // Handle deal rejection case override from economy.md
        if (qualityDelivered < customerStandardQuality - 1) { // Delivered quality 2+ levels below standard
            relationshipChange = -0.5;
            overallSatisfaction = 0; // Force low satisfaction
            console.log("Deal likely rejected due to very low quality.");
        }
        if (pricePaid > calculatedIdealTotalPrice * 2.5) { // Paid > 2.5x ideal price
             relationshipChange = -0.5;
             overallSatisfaction = 0;
             console.log("Deal likely rejected due to very high price.");
        }


        // --- Display Results ---
        resultScoreSpan.textContent = overallSatisfaction.toFixed(2);
        resultRelChangeSpan.textContent = relationshipChange.toFixed(2);
        resultRelChangeSpan.className = relationshipChange > 0 ? 'change-positive' : (relationshipChange < 0 ? 'change-negative' : 'change-neutral');

        resultFactorsUl.innerHTML = `
            <li>Quality Match: <span class="factor-value ${qualityFactor > 0.1 ? 'factor-good' : (qualityFactor < -0.1 ? 'factor-bad' : 'factor-neutral')}">${(qualityFactor / MAX_EFFECT_CONTRIBUTION.quality * 100).toFixed(0)}%</span> (Diff: ${qualityDifference > 0 ? '+' : ''}${qualityDifference})</li>
            <li>Type Affinity: <span class="factor-value ${typeFactor > 0.1 ? 'factor-good' : (typeFactor < -0.1 ? 'factor-bad' : 'factor-neutral')}">${(typeFactor / MAX_EFFECT_CONTRIBUTION.type * 100).toFixed(0)}%</span> (Aff: ${typeAffinity.toFixed(2)})</li>
            <li>Effect Match: <span class="factor-value ${propertyFactor > 0.1 ? 'factor-good' : (propertyFactor < -0.1 ? 'factor-bad' : 'factor-neutral')}">${(propertyFactor / MAX_EFFECT_CONTRIBUTION.property * 100).toFixed(0)}%</span> (Score: ${propertyMatchScore.toFixed(2)})</li>
             <li>Price Value: <span class="factor-value ${priceFactor > 0.1 ? 'factor-good' : (priceFactor < -0.1 ? 'factor-bad' : 'factor-neutral')}">${(priceFactor / priceSatisfactionWeight * 100).toFixed(0)}%</span> (Paid: ${formatCurrency(pricePaid)})</li>
        `;

        resultCustomerStandardSpan.textContent = QUALITY_LEVELS[customerStandardQuality];
        resultCustomerPrefsSpan.textContent = preferredProperties.map(p => EFFECT_DATA[p]?.name || p).join(', ') || 'None';
        resultIdealPriceSpan.textContent = formatCurrency(calculatedIdealTotalPrice);


        resultsDiv.style.display = 'block';
    };


    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateSatisfaction);

}); // End DOMContentLoaded