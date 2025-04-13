import { EQUIPMENT_DATA } from '../../game_data.js'; // Adjust path as necessary
import { formatCurrency } from '../../utils/helpers.js'; // Import shared helper

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('equipment-list-container');
    if (!container) {
        console.error("Error: Equipment list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!EQUIPMENT_DATA || Object.keys(EQUIPMENT_DATA).length === 0) {
        container.innerHTML = '<p>No equipment data found in game_data.js.</p>';
        return;
    }

    // Sort equipment by category, then alphabetically by name
    const sortedEquipmentEntries = Object.entries(EQUIPMENT_DATA)
        .sort(([, a], [, b]) => {
            if (a.category !== b.category) {
                return (a.category || '').localeCompare(b.category || ''); // Sort by category first
            }
            return a.name.localeCompare(b.name); // Then by name
        });

    sortedEquipmentEntries.forEach(([id, equipment]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the item template page/logic is created
        const detailLink = `/database/items/item_template.html?type=equipment&id=${id}`;

        let powerInfo = '';
        if (equipment.power !== undefined) {
            powerInfo = `<p><strong>Power Usage:</strong> ${equipment.power} kWh/game hr</p>`;
        }
        let waterInfo = '';
         if (equipment.water !== undefined) {
            waterInfo = `<p><strong>Water Usage:</strong> ${equipment.water} L/game day</p>`;
        }

        card.innerHTML = `
            <h3><a href="${detailLink}">${equipment.name}</a></h3>
            <div class="item-details">
                <p><strong>Category:</strong> ${equipment.category || 'N/A'}</p>
                <p><strong>Description:</strong> ${equipment.description || 'N/A'}</p>
                <p><strong>Cost:</strong> ${equipment.cost !== undefined ? formatCurrency(equipment.cost) : 'N/A'}</p>
                <p><strong>Unlock:</strong> Rank/Tier ${equipment.unlockRankTier || 'N/A'}</p>
                ${powerInfo}
                ${waterInfo}
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});

// formatCurrency is now imported from utils/helpers.js