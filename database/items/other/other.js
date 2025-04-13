import { OTHER_ITEMS_DATA } from '../../game_data.js'; // Adjust path as necessary
import { formatCurrency } from '../../utils/helpers.js'; // Import shared helper

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('other-item-list-container');
    if (!container) {
        console.error("Error: Other item list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!OTHER_ITEMS_DATA || Object.keys(OTHER_ITEMS_DATA).length === 0) {
        container.innerHTML = '<p>No other item data found in game_data.js.</p>';
        return;
    }

    // Sort items by category, then alphabetically by name
    const sortedItemEntries = Object.entries(OTHER_ITEMS_DATA)
        .sort(([, a], [, b]) => {
            if (a.category !== b.category) {
                return (a.category || '').localeCompare(b.category || ''); // Sort by category first
            }
            return a.name.localeCompare(b.name); // Then by name
        });

    sortedItemEntries.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the item template page/logic is created
        const detailLink = `/database/items/item_template.html?type=other&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank/Tier ${item.unlockRankTier || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});

// formatCurrency is now imported from utils/helpers.js