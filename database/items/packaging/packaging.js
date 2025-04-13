import { PACKAGING_DATA } from '../../game_data.js'; // Adjust path as necessary
import { formatCurrency } from '../../utils/helpers.js'; // Import shared helper

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('packaging-list-container');
    if (!container) {
        console.error("Error: Packaging list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!PACKAGING_DATA || Object.keys(PACKAGING_DATA).length === 0) {
        container.innerHTML = '<p>No packaging data found in game_data.js.</p>';
        return;
    }

    // Sort packaging by capacity (ascending)
    const sortedPackagingEntries = Object.entries(PACKAGING_DATA)
        .sort(([, a], [, b]) => a.capacity - b.capacity);

    sortedPackagingEntries.forEach(([id, item]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the item template page/logic is created
        const detailLink = `/database/items/item_template.html?type=packaging&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${item.name}</a></h3>
            <div class="item-details">
                <p><strong>Capacity:</strong> ${item.capacity} unit(s)</p>
                <p><strong>Cost:</strong> ${item.cost !== undefined ? formatCurrency(item.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank/Tier ${item.unlockRankTier || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});

// formatCurrency is now imported from utils/helpers.js