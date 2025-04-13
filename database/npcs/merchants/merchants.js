import { SUPPLIER_DATA } from '../../game_data.js'; // Adjust path
// Import helpers if needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('merchant-list-container');
    if (!container) {
        console.error("Error: Merchant list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Manually define known merchants based on npc.md and market.md
    // Combine with SUPPLIER_DATA if applicable
    const knownMerchants = [
        { id: "dan", name: "Dan", shop: "Hardware Store", type: "General Store", notes: "Sells equipment, tools, growing supplies." },
        { id: "fiona", name: "Fiona", shop: "Gas Mart", type: "General Store", notes: "Sells ingredients, consumables." },
        { id: "herbert", name: "Herbert", shop: "Pharmacy", type: "General Store", notes: "Sells ingredients, medical supplies." },
        { id: "jeremy", name: "Jeremy", shop: "Dealership", type: "Specialty", notes: "Sells vehicles." },
        { id: "marco", name: "Marco", shop: "Autoshop", type: "Service", notes: "Repairs and repaints vehicles." },
        { id: "mick", name: "Mick", shop: "Pawn Shop", type: "Specialty", notes: "Buys items from player." },
        { id: "oscar", name: "Oscar", shop: "Warehouse", type: "Underground", notes: "Sells specialized equipment, ingredients, weapons? Offers deliveries." },
        { id: "ray", name: "Ray", shop: "Ray's Realty", type: "Service", notes: "Sells properties/businesses." },
        { id: "stan", name: "Stan", shop: "Unknown", type: "General Store?", notes: "Shop type TBD." }, // Shop type needs confirmation
        { id: "steve", name: "Steve", shop: "Liquor Store", type: "General Store", notes: "Sells consumables." },
        // Add Suppliers as merchants if they have direct interaction/shop UI
        { id: "albertHoover", name: SUPPLIER_DATA.albertHoover.name, shop: "Dead Drop", type: "Supplier", notes: SUPPLIER_DATA.albertHoover.notes },
        // { id: "salvador", name: "Salvador", shop: "Dead Drop/Meeting", type: "Supplier", notes: "Sells Coca related items?" }, // Add if confirmed
        // { id: "shirley", name: "Shirley", shop: "Dead Drop/Meeting", type: "Supplier", notes: "Sells Pseudoephedrine." }, // Add if confirmed
    ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (knownMerchants.length === 0) {
        container.innerHTML = '<p>No merchant data found.</p>';
        return;
    }

    knownMerchants.forEach((merchant) => {
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