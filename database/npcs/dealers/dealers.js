import { EMPLOYEE_DATA, MAX_CUSTOMERS_PER_DEALER } from '../../game_data.js'; // Adjust path
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dealer-list-container');
    if (!container) {
        console.error("Error: Dealer list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Filter EMPLOYEE_DATA for dealers or define a specific DEALER_NPC_DATA if available
    // For now, manually listing known dealers based on npc.md
    const knownDealers = [
        { id: "benji", name: "Benji Coleman", cost: 150, cut: 0.20 }, // Example cost/cut
        { id: "brad", name: "Brad", cost: 120, cut: 0.15 },
        { id: "jane", name: "Jane", cost: 200, cut: 0.25 },
        { id: "leo", name: "Leo", cost: 180, cut: 0.20 },
        { id: "molly", name: "Molly", cost: 160, cut: 0.18 },
        { id: "wei", name: "Wei", cost: 220, cut: 0.22 },
    ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (knownDealers.length === 0) {
        container.innerHTML = '<p>No dealer data found.</p>';
        return;
    }

    knownDealers.forEach((dealer) => {
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