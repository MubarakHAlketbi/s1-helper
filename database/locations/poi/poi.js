// Placeholder for Point of Interest (POI) data loading logic
console.log("poi.js loaded - Placeholder");

// TODO: Fetch POI data from game_data.js, map_data.js, or an API endpoint
// TODO: Populate the POI list container (needs an ID in the HTML) with POI cards/entries
//       using a structure similar to other database pages.
// TODO: Potentially use poi_template.html for rendering individual POI details if needed.
// Example structure (adjust as needed):
/*
import { POI_DATA } from '../../game_data.js'; // Adjust path as needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('poi-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: POI list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!POI_DATA || Object.keys(POI_DATA).length === 0) {
        container.innerHTML = '<p>No Points of Interest data found.</p>';
        return;
    }

    // Sort POIs, perhaps by region then name
    const sortedPoiEntries = Object.entries(POI_DATA)
        .sort(([, a], [, b]) => {
            if (a.region !== b.region) {
                return (a.region || '').localeCompare(b.region || '');
            }
            return a.name.localeCompare(b.name);
        });

    sortedPoiEntries.forEach(([id, poi]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Use appropriate classes
        // Link might go to a map location or a detail page using poi_template.html
        const detailLink = `/database/locations/poi/poi_template.html?id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${poi.name}</a></h3>
            <div class="item-details">
                <p><strong>Region:</strong> ${poi.region || 'N/A'}</p>
                <p><strong>Type:</strong> ${poi.type || 'N/A'}</p>
                <p><strong>Description:</strong> ${poi.description || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/