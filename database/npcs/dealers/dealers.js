import { DEALER_NPC_DATA, MAX_CUSTOMERS_PER_DEALER } from '../../game_data.js'; // Import DEALER_NPC_DATA
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dealer-list-container');
    if (!container) {
        console.error("Error: Dealer list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Use DEALER_NPC_DATA from game_data.js
    const dealerEntries = Object.values(DEALER_NPC_DATA)
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (dealerEntries.length === 0) {
        container.innerHTML = '<p>No dealer data found.</p>';
        return;
    }

    dealerEntries.forEach((dealer) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Reuse item card styling

        // Link to a generic NPC template page
        const detailLink = `/database/npcs/npc_template.html?type=dealer&id=${dealer.id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${dealer.name}</a></h3>
            <div class="item-details">
                <p><strong>Role:</strong> Dealer</p>
                <p><strong>Recruitment Cost:</strong> ${dealer.cost ? formatCurrency(dealer.cost) : 'N/A (Quest?)'}</p>
                <p><strong>Cut:</strong> ${dealer.cut ? (dealer.cut * 100).toFixed(0) + '%' : 'N/A'}</p>
                <p><strong>Max Customers:</strong> ${MAX_CUSTOMERS_PER_DEALER || 8}</p>
                <!-- Add other relevant dealer details if available, e.g., location, unlock requirements -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});