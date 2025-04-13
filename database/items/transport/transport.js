// Placeholder for transport item data loading logic
console.log("transport.js loaded - Placeholder");

// TODO: Fetch transport item data (vehicles, skateboards) from game_data.js or an API endpoint
// TODO: Filter for items specifically in the 'transport' category if applicable
// TODO: Populate the transport list container (needs an ID in the HTML) with item cards
//       using a structure similar to other database item pages.
// Example based on other item pages (adjust as needed):
/*
import { ITEMS_DATA } from '../../game_data.js'; // Adjust path
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('transport-item-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Transport item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    const transportItems = Object.entries(ITEMS_DATA)
        .filter(([id, item]) => item.category === 'Transport'); // Example filter

    if (transportItems.length === 0) {
        container.innerHTML = '<p>No transport items found.</p>';
        return;
    }

    transportItems.sort(([, a], [, b]) => a.name.localeCompare(b.name));

    transportItems.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card');
        // Link might need to go to specific sub-pages (vehicles/skateboards) or a generic template
        const detailLink = `/database/items/item_template.html?type=transport&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                // Add other relevant details like speed, capacity if available
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/