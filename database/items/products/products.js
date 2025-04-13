import { BASE_PRODUCTS } from '../../game_data.js'; // Adjust path as necessary
import { formatCurrency } from '../../utils/helpers.js'; // Import shared helper

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('product-list-container');
    if (!container) {
        console.error("Error: Product list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!BASE_PRODUCTS || Object.keys(BASE_PRODUCTS).length === 0) {
        container.innerHTML = '<p>No product data found in game_data.js.</p>';
        return;
    }

    // Sort products alphabetically by name for consistency
    const sortedProductEntries = Object.entries(BASE_PRODUCTS)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedProductEntries.forEach(([id, product]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card');

        // Create a link to a detail page (assuming template approach)
        // TODO: Update this link when the item template page/logic is created
        const detailLink = `/database/items/item_template.html?type=product&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${product.name}</a></h3>
            <div class="item-details">
                <p><strong>Type:</strong> ${product.type || 'N/A'}</p>
                <p><strong>Base Market Value:</strong> ${product.baseMarketValue !== undefined ? formatCurrency(product.baseMarketValue) : 'N/A'}</p>
                <p><strong>Base Addictiveness:</strong> ${product.baseAddictiveness !== undefined ? (product.baseAddictiveness * 100).toFixed(1) + '%' : 'N/A'}</p>
                <p><strong>Properties:</strong> ${product.properties?.length > 0 ? product.properties.length : 'None'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});

// formatCurrency is now imported from utils/helpers.js