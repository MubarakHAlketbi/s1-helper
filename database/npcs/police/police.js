import { FINES, DAILY_INTENSITY_DRAIN, CURFEW_START_TIME, CURFEW_END_TIME } from '../../game_data.js'; // Adjust path
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('police-info-container');
    if (!container) {
        console.error("Error: Police info container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // --- Display General Police Info ---
    const infoCard = document.createElement('div');
    infoCard.classList.add('card'); // Use card styling

    let finesHTML = '<ul>';
    for (const crime in FINES) {
        finesHTML += `<li><strong>${crime.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${formatCurrency(FINES[crime])}</li>`;
    }
    finesHTML += '</ul>';

    // Format curfew times
    const formatTime = (timeInt) => {
        const hour = Math.floor(timeInt / 100);
        const minute = timeInt % 100;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    infoCard.innerHTML = `
        <h3>Law Enforcement Mechanics</h3>
        <div class="item-details">
            <p><strong>Law Intensity Decay:</strong> Intensity decreases by ${DAILY_INTENSITY_DRAIN} per day.</p>
            <p><strong>Curfew Hours:</strong> ${formatTime(CURFEW_START_TIME)} - ${formatTime(CURFEW_END_TIME)} daily (when active).</p>
            <p><strong>Pursuit Levels (Escalation):</strong></p>
            <ul>
                <li>None</li>
                <li>Investigating (Search area)</li>
                <li>Arresting (Attempt arrest on sight)</li>
                <li>Non-Lethal (Tasers used if resisting)</li>
                <li>Lethal (Firearms used)</li>
            </ul>
             <p><strong>Base Fines:</strong></p>
            ${finesHTML}
            <small>Note: Actual penalties may include arrest and item confiscation in addition to fines.</small>
        </div>
        <!-- Link to a potential detailed guide page -->
        <!-- <a href="/guides/mechanics/law/" class="btn btn-secondary btn-small">View Law Guide</a> -->
    `;
    container.appendChild(infoCard);

});