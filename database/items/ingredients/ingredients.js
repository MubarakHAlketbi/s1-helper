import { INGREDIENTS, EFFECTS_DATA } from '../../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ingredient-list-container');
    if (!container) {
        console.error("Error: Ingredient list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!INGREDIENTS || Object.keys(INGREDIENTS).length === 0) {
        container.innerHTML = '<p>No ingredient data found in game_data.js.</p>';
        return;
    }

    // Sort ingredients alphabetically by name
    const sortedIngredientEntries = Object.entries(INGREDIENTS)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedIngredientEntries.forEach(([id, ingredient]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the item template page/logic is created
        const detailLink = `/database/items/item_template.html?type=ingredient&id=${id}`;

        let effectName = 'N/A';
        let effectTier = 'N/A';
        if (ingredient.propertyGuid) {
            const effectData = EFFECTS_DATA[ingredient.propertyGuid];
            if (effectData) {
                effectName = effectData.name;
                effectTier = effectData.tier !== undefined ? ` (Tier ${effectData.tier})` : '';
            } else {
                effectName = 'Unknown Effect';
                effectTier = '';
            }
        } else {
            effectName = 'Crafting Only'; // Ingredients like Acid, Pseudo don't add direct effects
            effectTier = '';
        }


        card.innerHTML = `
            <h3><a href="${detailLink}">${ingredient.name}</a></h3>
            <div class="item-details">
                <p><strong>Adds Effect:</strong> ${effectName}${effectTier}</p>
                <!-- Add other relevant ingredient info here if available, e.g., source, unlock rank -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});