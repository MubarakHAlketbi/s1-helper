// Placeholder for growing soil data loading logic
console.log("soil.js loaded - Placeholder");

// TODO: Fetch soil item data from game_data.js or an API endpoint
// TODO: Filter for items specifically in the 'growing/soil' sub-category if applicable
// TODO: Populate the soil list container (needs an ID in the HTML) with item cards
//       using a structure similar to other database item pages.
// Example based on other item pages (adjust as needed):
/*
import { ITEMS_DATA } from '../../../game_data.js'; // Adjust path
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('soil-item-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Soil item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    const soilItems = Object.entries(ITEMS_DATA)
        .filter(([id, item]) => item.category === 'Growing' && item.subCategory === 'Soil'); // Example filter

    if (soilItems.length === 0) {
        container.innerHTML = '<p>No growing soil found.</p>';
        return;
    }

    soilItems.sort(([, a], [, b]) => a.name.localeCompare(b.name)); // Or sort by cost/uses

    soilItems.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card');
        const detailLink = `/database/items/item_template.html?type=growing&id=${id}`; // Adjust link if needed

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                <p><strong>Uses:</strong> ${item.uses || 'N/A'}</p> // Example: Add number of uses
                <p><strong>Unlock:</strong> Rank/Tier ${item.unlockRankTier || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/