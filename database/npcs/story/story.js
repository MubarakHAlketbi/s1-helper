// Import data if needed, e.g., for specific roles or locations
// import { LOCATION_DATA } from '../../game_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('story-npc-list-container');
    if (!container) {
        console.error("Error: Story NPC list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Manually define known story/quest NPCs based on npc.md analysis
    const storyNPCs = [
        { id: "uncleNelson", name: "Uncle Nelson", role: "Mentor", notes: "Provides initial guidance and quests." },
        { id: "lily", name: "Lily", role: "Tutorial/Quest Giver", notes: "Involved in early game progression." },
        { id: "thomas", name: "Thomas", role: "Quest NPC", notes: "Involved in Cartel questline." },
        { id: "fixer", name: "Fixer", role: "Service Provider", notes: "Handles employee hiring." },
        { id: "igor", name: "Igor", role: "Bouncer", notes: "Controls access to the Dark Market." },
        { id: "ming", name: "Ming", role: "Property Owner?", notes: "Associated with the Chinese Restaurant property." },
        // Add other key characters like potential antagonists (Benzies family mentioned in calls?)
        // or other quest givers as they are identified.
    ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (storyNPCs.length === 0) {
        container.innerHTML = '<p>No specific story character data available yet.</p>';
        return;
    }

    storyNPCs.forEach((npc) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Reuse item card styling

        // Link to a generic NPC template page
        const detailLink = `/database/npcs/npc_template.html?type=story&id=${npc.id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${npc.name}</a></h3>
            <div class="item-details">
                <p><strong>Role:</strong> ${npc.role || 'N/A'}</p>
                <p><strong>Notes:</strong> ${npc.notes || 'N/A'}</p>
                <!-- Add other relevant details if available -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});