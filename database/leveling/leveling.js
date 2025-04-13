import { RANKS, UNLOCKS, TIERS_PER_RANK, XP_PER_TIER_MIN, XP_PER_TIER_MAX } from '../game_data.js'; // Adjust path as necessary

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('rank-list-container');
    const xpMinSpan = document.getElementById('xp-min');
    const xpMaxSpan = document.getElementById('xp-max');

    if (!container || !xpMinSpan || !xpMaxSpan) {
        console.error("Error: Required elements not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // Display XP range
    xpMinSpan.textContent = XP_PER_TIER_MIN;
    xpMaxSpan.textContent = XP_PER_TIER_MAX;

    if (!RANKS || RANKS.length === 0) {
        container.innerHTML = '<p>No rank data found in game_data.js.</p>';
        return;
    }

    // Function to calculate XP needed for a specific tier within a rank
    const calculateXpForTier = (rankIndex) => {
        const progress = rankIndex / (RANKS.length - 1); // Progress from 0 to 1
        return Math.round(XP_PER_TIER_MIN + (XP_PER_TIER_MAX - XP_PER_TIER_MIN) * progress);
    };

    RANKS.forEach(rank => {
        const rankCard = document.createElement('div');
        rankCard.classList.add('rank-card', 'card'); // Use card styling

        let unlocksHtml = '';
        for (let tier = 1; tier <= TIERS_PER_RANK; tier++) {
            const unlockKey = `${rank.index}-${tier}`;
            const tierUnlocks = UNLOCKS[unlockKey];
            if (tierUnlocks && tierUnlocks.length > 0) {
                unlocksHtml += `<div class="tier-unlocks"><strong>Tier ${tier}:</strong><ul>`;
                tierUnlocks.forEach(unlock => {
                    // TODO: Link unlock names to their respective database pages later
                    unlocksHtml += `<li>${unlock}</li>`;
                });
                unlocksHtml += `</ul></div>`;
            }
        }
         // Check for Rank 0, Tier 0 unlocks specifically
         if (rank.index === 0) {
             const unlockKey = "0-0";
             const tierUnlocks = UNLOCKS[unlockKey];
             if (tierUnlocks && tierUnlocks.length > 0) {
                 unlocksHtml += `<div class="tier-unlocks"><strong>Starting Items:</strong><ul>`;
                 tierUnlocks.forEach(unlock => {
                     unlocksHtml += `<li>${unlock}</li>`;
                 });
                 unlocksHtml += `</ul></div>`;
             }
         }


        if (!unlocksHtml) {
            unlocksHtml = '<p>No specific unlocks listed for this rank\'s tiers.</p>';
        }

        const xpPerTier = calculateXpForTier(rank.index);
        const totalXpForRank = xpPerTier * TIERS_PER_RANK;

        rankCard.innerHTML = `
            <h3>Rank ${rank.index}: ${rank.name}</h3>
            <div class="rank-details">
                <p><strong>XP per Tier:</strong> ~${xpPerTier} XP</p>
                <p><strong>Total XP for Rank:</strong> ~${totalXpForRank} XP</p>
                <h4>Unlocks by Tier:</h4>
                ${unlocksHtml}
            </div>
        `;
        container.appendChild(rankCard);
    });
});