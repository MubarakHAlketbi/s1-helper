// Placeholder for shop data loading logic
console.log("shops.js loaded - Placeholder");

// TODO: Fetch shop data (locations, vendors, inventory types) from game_data.js or an API endpoint
// TODO: Populate the shop list container (needs an ID in the HTML) with shop cards/entries
//       using a structure similar to other database pages.
// TODO: Potentially use shop_template.html for rendering individual shop details if needed.
// Example structure (adjust as needed):
/*
import { SHOPS_DATA } from '../../game_data.js'; // Adjust path as needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('shop-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Shop list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!SHOPS_DATA || Object.keys(SHOPS_DATA).length === 0) {
        container.innerHTML = '<p>No shop data found.</p>';
        return;
    }

    // Sort shops, perhaps by region then name
    const sortedShopEntries = Object.entries(SHOPS_DATA)
        .sort(([, a], [, b]) => {
            if (a.region !== b.region) {
                return (a.region || '').localeCompare(b.region || '');
            }
            return a.name.localeCompare(b.name);
        });

    sortedShopEntries.forEach(([id, shop]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Use appropriate classes
        // Link might go to a map location or a detail page using shop_template.html
        const detailLink = `/database/locations/shops/shop_template.html?id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${shop.name}</a></h3>
            <div class="item-details">
                <p><strong>Region:</strong> ${shop.region || 'N/A'}</p>
                <p><strong>Vendor:</strong> ${shop.vendor || 'N/A'}</p>
                <p><strong>Sells:</strong> ${shop.inventoryType || 'N/A'}</p> // e.g., Hardware, Groceries, Pharmacy
                <p><strong>Hours:</strong> ${shop.hours || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/