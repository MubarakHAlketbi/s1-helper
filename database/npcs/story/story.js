import { STORY_NPC_DATA } from '../../game_data.js'; // Import STORY_NPC_DATA
// Import helpers if needed

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('story-npc-list-container');
    if (!container) {
        console.error("Error: Story NPC list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Use STORY_NPC_DATA from game_data.js
    const storyEntries = Object.values(STORY_NPC_DATA)
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (storyEntries.length === 0) {
        container.innerHTML = '<p>No specific story character data available yet.</p>';
        return;
    }

    storyEntries.forEach((npc) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Reuse item card styling

        // Link to a generic NPC template page
        const detailLink = `/database/npcs/npc_template.html?type=story&id=${npc.id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${npc.name}</a></h3>
            <div class="item-details">
                <p><strong>Role:</strong> ${npc.role || 'N/A'}</p>
                <p><strong>Notes:</strong> ${npc.role || 'N/A'}</p> <!-- Display role as notes for now -->
                <!-- Add other relevant details if available -->
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});