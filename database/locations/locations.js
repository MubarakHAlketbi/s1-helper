import { LOCATION_DATA } from '../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('location-list-container');
    if (!container) {
        console.error("Error: Location list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!LOCATION_DATA || Object.keys(LOCATION_DATA).length === 0) {
        container.innerHTML = '<p>No location data found in game_data.js.</p>';
        return;
    }

    // Sort locations by type, then alphabetically by name
    const sortedLocationEntries = Object.entries(LOCATION_DATA)
        .sort(([, a], [, b]) => {
            if (a.type !== b.type) {
                return (a.type || '').localeCompare(b.type || ''); // Sort by type first
            }
            return a.name.localeCompare(b.name); // Then by name
        });

    sortedLocationEntries.forEach(([id, location]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when a location detail page/logic is created
        // Maybe link regions to the map? Properties/Stores to a template?
        const detailLink = `/map/?highlight=${id}`; // Example link to map

        let featuresHtml = '';
        if (location.features && location.features.length > 0) {
            featuresHtml = '<p><strong>Features:</strong><ul>';
            location.features.forEach(feature => {
                featuresHtml += `<li>${feature}</li>`;
            });
            featuresHtml += '</ul></p>';
        }

        card.innerHTML = `
            <h3><a href="${detailLink}">${location.name}</a></h3>
            <div class="item-details">
                <p><strong>Type:</strong> ${location.type || 'N/A'}</p>
                <p><strong>Region:</strong> ${location.region || 'N/A'}</p>
                <p><strong>Description:</strong> ${location.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${location.cost !== undefined ? formatCurrency(location.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank/Tier ${location.unlockRankTier || 'N/A'}</p>
                ${featuresHtml}
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details/Map</a>
        `;
        container.appendChild(card);
    });
});

// Helper function (consider moving to utils/helpers.js if used elsewhere)
// Or import if already there
const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        // For locations, cost might genuinely be N/A (like regions)
        return 'N/A';
    }
    // Assuming rent/purchase price
    return `$${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};