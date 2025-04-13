// Placeholder for growing pot data loading logic
console.log("pots.js loaded - Placeholder");

// TODO: Fetch pot item data from game_data.js or an API endpoint
// TODO: Filter for items specifically in the 'growing/pots' sub-category if applicable
// TODO: Populate the pot list container (needs an ID in the HTML) with item cards
//       using a structure similar to other database item pages.
// Example based on other item pages (adjust as needed):
/*
import { ITEMS_DATA } from '../../../game_data.js'; // Adjust path
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('pot-item-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Pot item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    const potItems = Object.entries(ITEMS_DATA)
        .filter(([id, item]) => item.category === 'Growing' && item.subCategory === 'Pots'); // Example filter

    if (potItems.length === 0) {
        container.innerHTML = '<p>No growing pots found.</p>';
        return;
    }

    potItems.sort(([, a], [, b]) => a.name.localeCompare(b.name)); // Or sort by cost/effect

    potItems.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card');
        const detailLink = `/database/items/item_template.html?type=growing&id=${id}`; // Adjust link if needed

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p> // Example: Add effect description (e.g., +15% growth speed)
                <p><strong>Unlock:</strong> Rank/Tier ${item.unlockRankTier || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/