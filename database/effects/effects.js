import { EFFECTS_DATA } from '../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('effects-table-body');
    const loadingRow = document.getElementById('loading-row');

    if (!tableBody) {
        console.error("Error: Effects table body not found!");
        return;
    }

    if (loadingRow) {
        loadingRow.remove(); // Remove the loading message row
    }

    if (!EFFECTS_DATA || Object.keys(EFFECTS_DATA).length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5; // Span across all columns
        cell.textContent = 'No effects data found in game_data.js.';
        return;
    }

    // Sort effects by Tier, then alphabetically by name
    const sortedEffectsEntries = Object.entries(EFFECTS_DATA)
        .sort(([, a], [, b]) => {
            if (a.tier !== b.tier) {
                return a.tier - b.tier; // Sort by tier first
            }
            return a.name.localeCompare(b.name); // Then by name
        });

    sortedEffectsEntries.forEach(([guid, effect]) => {
        const row = tableBody.insertRow();

        const nameCell = row.insertCell();
        nameCell.textContent = effect.name || 'N/A';
        if (effect.valueMod === 0 && effect.addictiveness === 0) {
             nameCell.classList.add('negative-effect'); // Add class for potential styling
             nameCell.title = 'Likely a negative or neutral effect';
        }

        const tierCell = row.insertCell();
        tierCell.textContent = effect.tier !== undefined ? effect.tier : 'N/A';
        tierCell.style.textAlign = 'center';

        const addictivenessCell = row.insertCell();
        addictivenessCell.textContent = effect.addictiveness !== undefined ? `${(effect.addictiveness * 100).toFixed(1)}%` : 'N/A';
        addictivenessCell.style.textAlign = 'right';

        const valueModCell = row.insertCell();
        valueModCell.textContent = effect.valueMod !== undefined ? `${(effect.valueMod * 100).toFixed(0)}%` : 'N/A';
        valueModCell.style.textAlign = 'right';
        if (effect.valueMod < 0) valueModCell.classList.add('negative-value');
        else if (effect.valueMod > 0) valueModCell.classList.add('positive-value');


        const mixVectorCell = row.insertCell();
        if (effect.mixDir && effect.mixMag !== undefined) {
            mixVectorCell.textContent = `[${effect.mixDir[0].toFixed(2)}, ${effect.mixDir[1].toFixed(2)}] / ${effect.mixMag.toFixed(1)}`;
            mixVectorCell.title = `Direction: (${effect.mixDir[0].toFixed(2)}, ${effect.mixDir[1].toFixed(2)}), Magnitude: ${effect.mixMag.toFixed(1)}`;
        } else {
            mixVectorCell.textContent = 'N/A';
        }
        mixVectorCell.style.textAlign = 'center';

        // Add GUID as a data attribute for potential future use (e.g., linking)
        row.dataset.guid = guid;
    });
});