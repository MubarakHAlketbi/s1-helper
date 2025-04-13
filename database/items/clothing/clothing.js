import { CLOTHING_DATA } from '../../game_data.js'; // Adjust path to game_data
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path to helpers

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('clothing-list-container');
    if (!container) {
        console.error("Error: Clothing list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!CLOTHING_DATA || Object.keys(CLOTHING_DATA).length === 0) {
        container.innerHTML = '<p>No clothing data found in game_data.js. (Placeholder data might be present)</p>';
        // Optionally display placeholder data if needed for testing
        // return;
    }

    // Sort clothing items alphabetically by name for consistency
    const sortedClothingEntries = Object.entries(CLOTHING_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

     if (sortedClothingEntries.length === 0) {
        container.innerHTML = '<p>No clothing items found.</p>'; // Message if object exists but is empty
        return;
    }

    sortedClothingEntries.forEach(([id, clothing]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card');

        // Create a link to a detail page (using the generic item template)
        // The template will need logic to fetch the correct data based on type=clothing&id=...
        const detailLink = `/database/items/item_template.html?type=clothing&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${clothing.name}</a></h3>
            <div class="item-details">
                <p><strong>Slot:</strong> ${clothing.slot || 'N/A'}</p>
                <p><strong>Cost:</strong> ${clothing.cost !== undefined ? formatCurrency(clothing.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank ${clothing.unlockRankTier || '0-0'}</p>
                <p><strong>Description:</strong> ${clothing.description || 'No description available.'}</p>
                <!-- Add other relevant clothing details if needed, e.g., attributes -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});