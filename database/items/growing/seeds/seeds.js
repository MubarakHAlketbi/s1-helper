import { SEED_DATA } from '../../../game_data.js'; // Adjust path to game_data
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path to helpers

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('seed-list-container');
    if (!container) {
        console.error("Error: Seed list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!SEED_DATA || Object.keys(SEED_DATA).length === 0) {
        container.innerHTML = '<p>No seed data found in game_data.js.</p>';
        return;
    }

    // Sort seeds alphabetically by name for consistency
    const sortedSeedEntries = Object.entries(SEED_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedSeedEntries.forEach(([id, seed]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card');

        // Create a link to a detail page (using the generic item template)
        // The template will need logic to fetch the correct data based on type=seed&id=...
        const detailLink = `/database/items/item_template.html?type=seed&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${seed.name}</a></h3>
            <div class="item-details">
                <p><strong>Cost:</strong> ${seed.cost !== undefined ? formatCurrency(seed.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank ${seed.unlockRankTier || '0-0'}</p>
                <p><strong>Description:</strong> ${seed.description || 'No description available.'}</p>
                <!-- Add other relevant seed details if needed -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});