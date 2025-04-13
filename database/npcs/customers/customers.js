import { CUSTOMER_DATA, EFFECTS_DATA, QUALITY_LEVELS } from '../../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('customer-list-container');
    if (!container) {
        console.error("Error: Customer list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!CUSTOMER_DATA || Object.keys(CUSTOMER_DATA).length === 0) {
        container.innerHTML = '<p>No customer data found in game_data.js.</p>';
        return;
    }

    // Sort customers alphabetically by name
    const sortedCustomerEntries = Object.entries(CUSTOMER_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedCustomerEntries.forEach(([id, customer]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the NPC template page/logic is created
        const detailLink = `/database/npcs/npc_template.html?type=customer&id=${id}`;

        // Format affinities
        let affinitiesHtml = '<ul>';
        if (customer.affinity && Object.keys(customer.affinity).length > 0) {
            Object.entries(customer.affinity).forEach(([type, score]) => {
                const scorePercent = (score * 100).toFixed(0);
                const scoreClass = score > 0 ? 'positive-value' : (score < 0 ? 'negative-value' : '');
                affinitiesHtml += `<li>${type}: <span class="${scoreClass}">${scorePercent}%</span></li>`;
            });
        } else {
            affinitiesHtml += '<li>N/A</li>';
        }
        affinitiesHtml += '</ul>';

        // Format preferred effects
        let prefsHtml = '<ul>';
        if (customer.prefs && customer.prefs.length > 0) {
            customer.prefs.forEach(effectGuid => {
                const effectName = EFFECTS_DATA[effectGuid]?.name || 'Unknown Effect';
                prefsHtml += `<li>${effectName}</li>`;
            });
        } else {
            prefsHtml += '<li>None Listed</li>';
        }
        prefsHtml += '</ul>';

        const qualityStandardName = QUALITY_LEVELS[customer.standard] || 'Unknown';

        card.innerHTML = `
            <h3><a href="${detailLink}">${customer.name}</a></h3>
            <div class="item-details">
                <p><strong>Quality Standard:</strong> ${qualityStandardName} (${customer.standard})</p>
                <div><strong>Affinities:</strong> ${affinitiesHtml}</div>
                <div><strong>Preferred Effects:</strong> ${prefsHtml}</div>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});