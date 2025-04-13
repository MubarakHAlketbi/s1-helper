import { CUSTOMER_DATA, BASE_PRODUCTS, EFFECTS_DATA, QUALITY_LEVELS, QUALITY_VALUE_MULTIPLIERS, MAX_EFFECT_CONTRIBUTION } from '../../database/game_data.js';

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


    // --- Populate Selects ---
    Object.keys(CUSTOMER_DATA).sort((a, b) => CUSTOMER_DATA[a].name.localeCompare(CUSTOMER_DATA[b].name)).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = CUSTOMER_DATA[id].name;
        customerSelect.appendChild(option);
    });

    Object.keys(BASE_PRODUCTS).sort((a, b) => BASE_PRODUCTS[a].name.localeCompare(BASE_PRODUCTS[b].name)).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = BASE_PRODUCTS[id].name;
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
        const product = BASE_PRODUCTS[productId];

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
        const deliveredPropertiesGuids = product.properties || []; // These are GUIDs from BASE_PRODUCTS
        const preferredPropertiesGuids = customer.prefs || []; // These are GUIDs from CUSTOMER_DATA
        const numPreferred = preferredPropertiesGuids.length;
        const numDelivered = deliveredPropertiesGuids.length;

        if (numPreferred > 0 && numDelivered > 0) {
            let matches = 0;
            deliveredPropertiesGuids.forEach(propGuid => {
                if (preferredPropertiesGuids.includes(propGuid)) {
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
        deliveredPropertiesGuids.forEach(propGuid => {
            effectValueMultiplier += (EFFECTS_DATA[propGuid]?.valueMod || 0);
        });

        const qualityMultiplier = QUALITY_VALUE_MULTIPLIERS[qualityDelivered] || 1.0;
        const calculatedIdealPricePerUnit = product.baseMarketValue * qualityMultiplier * effectValueMultiplier; // Use baseMarketValue
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
        resultCustomerPrefsSpan.textContent = preferredPropertiesGuids.map(guid => EFFECTS_DATA[guid]?.name || guid).join(', ') || 'None';
        resultIdealPriceSpan.textContent = formatCurrency(calculatedIdealTotalPrice);


        resultsDiv.style.display = 'block';
    };


    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateSatisfaction);

}); // End DOMContentLoaded