// Placeholder for growing utility data loading logic
console.log("growing/utilities.js loaded - Placeholder");

// TODO: Fetch growing utility item data from game_data.js or an API endpoint
// TODO: Filter for items specifically in the 'growing/utilities' sub-category if applicable
// TODO: Populate the utility list container (needs an ID in the HTML) with item cards
//       using a structure similar to other database item pages.
// Example based on other item pages (adjust as needed):
/*
import { ITEMS_DATA } from '../../../game_data.js'; // Adjust path
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('growing-utility-item-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Growing utility item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    const utilityItems = Object.entries(ITEMS_DATA)
        .filter(([id, item]) => item.category === 'Growing' && item.subCategory === 'Utilities'); // Example filter

    if (utilityItems.length === 0) {
        container.innerHTML = '<p>No growing utilities found.</p>';
        return;
    }

    utilityItems.sort(([, a], [, b]) => a.name.localeCompare(b.name));

    utilityItems.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card');
        const detailLink = `/database/items/item_template.html?type=growing&id=${id}`; // Adjust link if needed

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                <p><strong>Function:</strong> ${item.function || 'N/A'}</p> // Example: Add function description
                <p><strong>Unlock:</strong> Rank/Tier ${item.unlockRankTier || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/