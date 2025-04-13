import { EQUIPMENT_DATA } from '../../../game_data.js'; // Adjust path to game_data
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path to helpers

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('station-list-container');
    if (!container) {
        console.error("Error: Station list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!EQUIPMENT_DATA || Object.keys(EQUIPMENT_DATA).length === 0) {
        container.innerHTML = '<p>No equipment data found in game_data.js.</p>';
        return;
    }

    // Filter for stations and sort alphabetically by name
    const sortedStationEntries = Object.entries(EQUIPMENT_DATA)
        .filter(([, item]) => item.category === 'Station') // Filter for category "Station"
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    if (sortedStationEntries.length === 0) {
        container.innerHTML = '<p>No stations found in equipment data.</p>';
        return;
    }

    sortedStationEntries.forEach(([id, station]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card');

        // Create a link to a detail page (using the generic item template)
        // The template will need logic to fetch the correct data based on type=equipment&id=...
        const detailLink = `/database/items/item_template.html?type=equipment&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${station.name}</a></h3>
            <div class="item-details">
                <p><strong>Cost:</strong> ${station.cost !== undefined ? formatCurrency(station.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank ${station.unlockRankTier || '0-0'}</p>
                <p><strong>Description:</strong> ${station.description || 'No description available.'}</p>
                ${station.power ? `<p><strong>Power Usage:</strong> ${station.power} kWh/hr (Est.)</p>` : ''}
                ${station.water ? `<p><strong>Water Usage:</strong> ${station.water} L/day (Est.)</p>` : ''}
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});