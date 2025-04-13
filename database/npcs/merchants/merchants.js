import { MERCHANT_NPC_DATA, SUPPLIER_DATA } from '../../game_data.js'; // Import MERCHANT_NPC_DATA
// Import helpers if needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('merchant-list-container');
    if (!container) {
        console.error("Error: Merchant list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Use MERCHANT_NPC_DATA from game_data.js
    const merchantEntries = Object.values(MERCHANT_NPC_DATA);

    // Optionally add suppliers if they function as merchants
    // Example: Add Albert Hoover from SUPPLIER_DATA
    if (SUPPLIER_DATA.albertHoover) {
         merchantEntries.push({
            id: "albertHoover",
            name: SUPPLIER_DATA.albertHoover.name,
            shop: SUPPLIER_DATA.albertHoover.contactMethod, // Use contact method as shop type for suppliers
            type: "Supplier",
            notes: SUPPLIER_DATA.albertHoover.notes
        });
    }
     // Add other suppliers here if needed following the same pattern

    merchantEntries.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (merchantEntries.length === 0) {
        container.innerHTML = '<p>No merchant data found.</p>';
        return;
    }

    merchantEntries.forEach((merchant) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Reuse item card styling

        // Link to a generic NPC template page
        const detailLink = `/database/npcs/npc_template.html?type=merchant&id=${merchant.id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${merchant.name}</a></h3>
            <div class="item-details">
                <p><strong>Shop/Service:</strong> ${merchant.shop || 'N/A'}</p>
                <p><strong>Type:</strong> ${merchant.type || 'N/A'}</p>
                <p><strong>Notes:</strong> ${merchant.notes || 'N/A'}</p>
                <!-- Add operating hours if available -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});