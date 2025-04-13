import { CUSTOMER_DATA } from '../../game_data.js'; // Adjust path to game_data
// Import helpers if needed for formatting, e.g., formatCurrency

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('civilian-list-container');
    if (!container) {
        console.error("Error: Civilian list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!CUSTOMER_DATA || Object.keys(CUSTOMER_DATA).length === 0) {
        container.innerHTML = '<p>No civilian/customer data found in game_data.js.</p>';
        return;
    }

    // Sort civilians alphabetically by name for consistency
    const sortedCivilianEntries = Object.entries(CUSTOMER_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    if (sortedCivilianEntries.length === 0) {
        container.innerHTML = '<p>No civilians found.</p>';
        return;
    }

    sortedCivilianEntries.forEach(([id, civilian]) => {
        const card = document.createElement('div');
        // Add base card class and a specific class for potential styling
        card.classList.add('database-item-card', 'card'); // Reuse item card styling

        // Create a link to a detail page (using a generic NPC template)
        // The template will need logic to fetch the correct data based on type=npc&id=...
        const detailLink = `/database/npcs/npc_template.html?type=civilian&id=${id}`; // Assuming civilian type

        // Determine primary preference for display
        let primaryPref = 'Mixed';
        let maxAffinity = -Infinity;
        if (civilian.affinity) {
            for (const type in civilian.affinity) {
                if (civilian.affinity[type] > maxAffinity) {
                    maxAffinity = civilian.affinity[type];
                    primaryPref = type;
                }
            }
            if (maxAffinity < 0.1) primaryPref = 'None'; // If no strong preference
        }


        card.innerHTML = `
            <h3><a href="${detailLink}">${civilian.name}</a></h3>
            <div class="item-details">
                <p><strong>Quality Standard:</strong> ${civilian.standard !== undefined ? ['Very Low', 'Low', 'Moderate', 'High', 'Very High'][civilian.standard] : 'N/A'}</p>
                <p><strong>Primary Preference:</strong> ${primaryPref}</p>
                <p><strong>Preferred Effects:</strong> ${civilian.prefs?.length > 0 ? civilian.prefs.length : 'None'}</p>
                <!-- Add other relevant civilian details if needed -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});