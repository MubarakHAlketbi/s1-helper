import { SUPPLIER_DATA } from '../../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('supplier-list-container');
    if (!container) {
        console.error("Error: Supplier list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!SUPPLIER_DATA || Object.keys(SUPPLIER_DATA).length === 0) {
        container.innerHTML = '<p>No supplier data found in game_data.js.</p>';
        return;
    }

    // Sort suppliers alphabetically by name
    const sortedSupplierEntries = Object.entries(SUPPLIER_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedSupplierEntries.forEach(([id, supplier]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the NPC template page/logic is created
        const detailLink = `/database/npcs/npc_template.html?type=supplier&id=${id}`;

        let itemsHtml = '<ul>';
        if (supplier.items && supplier.items.length > 0) {
             // Limit displayed items for brevity, maybe show first 5?
             const itemsToShow = supplier.items.slice(0, 5);
             itemsToShow.forEach(item => {
                 // TODO: Link item names to their database pages later
                 itemsHtml += `<li>${item}</li>`;
             });
             if (supplier.items.length > 5) {
                 itemsHtml += `<li>...and more</li>`;
             }
        } else {
            itemsHtml += '<li>N/A</li>';
        }
        itemsHtml += '</ul>';


        card.innerHTML = `
            <h3><a href="${detailLink}">${supplier.name}</a></h3>
            <div class="item-details">
                <p><strong>Type:</strong> ${supplier.type || 'N/A'}</p>
                <p><strong>Contact:</strong> ${supplier.contactMethod || 'N/A'}</p>
                <div><strong>Known Items:</strong> ${itemsHtml}</div>
                <p><strong>Notes:</strong> ${supplier.notes || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});