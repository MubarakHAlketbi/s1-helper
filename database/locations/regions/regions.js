// Placeholder for map region data loading logic
console.log("regions.js loaded - Placeholder");

// TODO: Fetch region data (names, unlock requirements) from game_data.js, map_data.js, or an API endpoint
// TODO: Populate the region list container (needs an ID in the HTML) with region cards/entries
//       using a structure similar to other database pages.
// Example structure (adjust as needed):
/*
import { REGIONS_DATA } from '../../game_data.js'; // Adjust path as needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('region-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Region list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!REGIONS_DATA || Object.keys(REGIONS_DATA).length === 0) {
        container.innerHTML = '<p>No region data found.</p>';
        return;
    }

    // Sort regions, perhaps by unlock rank or name
    const sortedRegionEntries = Object.entries(REGIONS_DATA)
        .sort(([, a], [, b]) => (a.unlockRankTier || '').localeCompare(b.unlockRankTier || '')); // Example sort by unlock

    sortedRegionEntries.forEach(([id, region]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Use appropriate classes
        // Link might go to a specific region page (e.g., downtown.html) or map view
        const detailLink = `/database/locations/regions/${id}.html`; // Assuming region pages exist

        card.innerHTML = `
            <h3><a href="${detailLink}">${region.name}</a></h3>
            <div class="item-details">
                <p><strong>Unlock Requirement:</strong> Rank/Tier ${region.unlockRankTier || 'N/A'}</p>
                // Add other relevant details like description or key locations
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/