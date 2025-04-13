// Placeholder for skateboard item data loading logic
console.log("skateboards.js loaded - Placeholder");

// TODO: Fetch skateboard item data from game_data.js or an API endpoint
// TODO: Filter for items specifically in the 'transport/skateboards' sub-category if applicable
// TODO: Populate the skateboard list container (needs an ID in the HTML) with item cards
//       using a structure similar to other database item pages.
// Example based on other item pages (adjust as needed):
/*
import { ITEMS_DATA } from '../../../game_data.js'; // Adjust path
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('skateboard-item-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Skateboard item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    const skateboardItems = Object.entries(ITEMS_DATA)
        .filter(([id, item]) => item.category === 'Transport' && item.subCategory === 'Skateboards'); // Example filter

    if (skateboardItems.length === 0) {
        container.innerHTML = '<p>No skateboards found.</p>';
        return;
    }

    skateboardItems.sort(([, a], [, b]) => a.name.localeCompare(b.name)); // Or sort by cost/performance

    skateboardItems.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card');
        const detailLink = `/database/items/item_template.html?type=transport&id=${id}`; // Adjust link if needed

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                // Add other relevant details like performance hints
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/