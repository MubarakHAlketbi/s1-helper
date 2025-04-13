import { VEHICLE_DATA } from '../../../game_data.js'; // Adjust path to game_data
import { formatCurrency } from '../../../utils/helpers.js'; // Adjust path to helpers

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vehicle-list-container');
    if (!container) {
        console.error("Error: Vehicle list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!VEHICLE_DATA || Object.keys(VEHICLE_DATA).length === 0) {
        container.innerHTML = '<p>No vehicle data found in game_data.js. (Placeholder data might be present)</p>';
        // Optionally display placeholder data if needed for testing
        // return;
    }

    // Sort vehicles alphabetically by name for consistency
    const sortedVehicleEntries = Object.entries(VEHICLE_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

     if (sortedVehicleEntries.length === 0) {
        container.innerHTML = '<p>No vehicles found.</p>'; // Message if object exists but is empty
        return;
    }

    sortedVehicleEntries.forEach(([id, vehicle]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card');

        // Create a link to a detail page (using the generic item template)
        // The template will need logic to fetch the correct data based on type=vehicle&id=...
        const detailLink = `/database/items/item_template.html?type=vehicle&id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${vehicle.name}</a></h3>
            <div class="item-details">
                <p><strong>Type:</strong> ${vehicle.type || 'N/A'}</p>
                <p><strong>Cost:</strong> ${vehicle.cost !== undefined ? formatCurrency(vehicle.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank ${vehicle.unlockRankTier || 'N/A'}</p>
                <p><strong>Description:</strong> ${vehicle.description || 'No description available.'}</p>
                <p><strong>Speed:</strong> ${vehicle.speed || 'N/A'} | <strong>Handling:</strong> ${vehicle.handling || 'N/A'} | <strong>Storage:</strong> ${vehicle.storage || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});