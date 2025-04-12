      
document.addEventListener('DOMContentLoaded', () => {
    const rankSelect = document.getElementById('calc-rank');
    const tierInput = document.getElementById('calc-tier');
    const currentXpInput = document.getElementById('calc-current-xp');
    const totalXpInput = document.getElementById('calc-total-xp');
    const calculateBtn = document.getElementById('calculate-level-btn');
    const resultsDiv = document.getElementById('leveling-results');

    // Result fields
    const resultRankName = document.getElementById('result-rank-name');
    const resultTier = document.getElementById('result-tier');
    const resultCurrentXp = document.getElementById('result-current-xp');
    const resultXpNeeded = document.getElementById('result-xp-needed');
    const resultXpRemaining = document.getElementById('result-xp-remaining');
    const resultTotalXp = document.getElementById('result-total-xp');
    const resultNextLevel = document.getElementById('result-next-level');
    const resultOrderMultiplier = document.getElementById('result-order-multiplier');
    const resultCurrentUnlocksUl = document.getElementById('result-current-unlocks');
    const resultNextUnlocksUl = document.getElementById('result-next-unlocks');

    // --- Game Data ---
    const TIERS_PER_RANK = 5;
    const MAX_RANK_INDEX = 10; // Rank 0 to 10
    const XP_PER_TIER_MIN = 200;
    const XP_PER_TIER_MAX = 2500;

    const RANKS = [
        { index: 0, name: "Street Rat" },
        { index: 1, name: "Hoodlum" },
        { index: 2, name: "Peddler" },
        { index: 3, name: "Hustler" },
        { index: 4, name: "Bagman" },
        { index: 5, name: "Enforcer" },
        { index: 6, name: "Shot Caller" },
        { index: 7, name: "Block Boss" },
        { index: 8, name: "Underlord" },
        { index: 9, name: "Baron" },
        { index: 10, name: "Kingpin" }
    ];

    // Simplified Unlock Data (Expand with actual game data)
    // Key: "RankIndex-Tier"
    const UNLOCKS = {
        "0-0": [], // Starting
        "0-3": ["Jar Packaging"],
        "0-4": ["Long-Life Soil", "Fertilizer", "Plastic Pot", "Moisture-Preserving Pot", "Sour Diesel Seed"],
        "0-5": ["Electric Plant Trimmers", "Pot Sprinkler", "Big Sprinkler"],
        "1-1": ["Mixing Station"],
        "1-2": ["Soil Pourer", "Green Crack Seed"],
        "1-3": ["Extra Long-Life Soil"],
        "1-4": ["Granddaddy Purple Seed"],
        "1-5": ["Packaging Station Mk II"],
        "2-2": ["Mixing Station Mk2"],
        "2-3": ["Air Pot"],
        // Add many more based on your item/station data...
        "3-3": ["Drying Rack", "Pseudo"], // Example from stations/ingredients
        "4-5": ["Brick Press", "High-Quality Pseudo"], // Example
        "5-1": ["Cauldron"], // Example
        // Map Region Unlocks (Example - Needs confirmation)
        "1-1": ["Westville Region Access"],
        "2-1": ["Downtown Region Access"],
        "3-1": ["Docks Region Access"],
        "4-1": ["Suburbia Region Access"],
        "5-1": ["Uptown Region Access"],
        "6-1": ["Northtown Region Access"] // Assuming Northtown is last?
    };

    // --- Calculation Functions ---

    // Estimate XP needed for a tier within a specific rank (linear scaling)
    const getXpForTier = (rankIndex) => {
        if (rankIndex < 0) rankIndex = 0;
        if (rankIndex > MAX_RANK_INDEX) rankIndex = MAX_RANK_INDEX;
        const scale = rankIndex / MAX_RANK_INDEX; // 0 to 1
        return Math.round(XP_PER_TIER_MIN + (XP_PER_TIER_MAX - XP_PER_TIER_MIN) * scale);
    };

    // Calculate total XP needed to REACH the start of a given rank/tier
    const getTotalXpForRankTier = (targetRankIndex, targetTier) => {
        let totalXp = 0;
        for (let r = 0; r < targetRankIndex; r++) {
            const xpPerTierInRank = getXpForTier(r);
            totalXp += xpPerTierInRank * TIERS_PER_RANK;
        }
        // Add XP for tiers within the target rank (up to targetTier - 1)
        if (targetRankIndex <= MAX_RANK_INDEX) {
            const xpPerTierInTargetRank = getXpForTier(targetRankIndex);
            totalXp += xpPerTierInTargetRank * (targetTier - 1);
        }
        return totalXp;
    };

    // Determine Rank/Tier based on total XP
    const getRankTierFromTotalXp = (totalXp) => {
        let currentTotalXp = 0;
        for (let r = 0; r <= MAX_RANK_INDEX; r++) {
            const xpPerTierInRank = getXpForTier(r);
            const xpForFullRank = xpPerTierInRank * TIERS_PER_RANK;
            if (totalXp < currentTotalXp + xpForFullRank || r === MAX_RANK_INDEX) {
                // Player is within this rank
                const xpIntoRank = totalXp - currentTotalXp;
                const tier = Math.min(TIERS_PER_RANK, Math.floor(xpIntoRank / xpPerTierInRank) + 1);
                const xpIntoTier = xpIntoRank % xpPerTierInRank;
                // Handle max rank case where XP might exceed needed
                if (r === MAX_RANK_INDEX && tier === TIERS_PER_RANK) {
                     const xpNeededForMax = getXpForTier(r);
                     return { rankIndex: r, tier: tier, currentTierXp: Math.min(xpIntoTier, xpNeededForMax), totalXp: totalXp };
                }
                return { rankIndex: r, tier: tier, currentTierXp: xpIntoTier, totalXp: totalXp };
            }
            currentTotalXp += xpForFullRank;
        }
         // Should not be reached if MAX_RANK_INDEX is correct, but fallback
        return { rankIndex: MAX_RANK_INDEX, tier: TIERS_PER_RANK, currentTierXp: getXpForTier(MAX_RANK_INDEX), totalXp: totalXp };
    };

    // Get the next rank/tier
    const getNextLevel = (rankIndex, tier) => {
        if (rankIndex === MAX_RANK_INDEX && tier === TIERS_PER_RANK) {
            return { rankIndex: rankIndex, tier: tier }; // Max level
        }
        let nextTier = tier + 1;
        let nextRankIndex = rankIndex;
        if (nextTier > TIERS_PER_RANK) {
            nextTier = 1;
            nextRankIndex++;
        }
        return { rankIndex: nextRankIndex, tier: nextTier };
    };

    // Get unlocks for a specific rank/tier
    const getUnlocksForLevel = (rankIndex, tier) => {
        const key = `${rankIndex}-${tier}`;
        return UNLOCKS[key] || [];
    };

    // Estimate Supplier Order Limit Multiplier based on Rank (Needs game data confirmation)
    const getOrderLimitMultiplier = (rankIndex) => {
        // Simple example: Starts at 1x, increases by 0.2x per rank?
        // Rank 0: 1.0x, Rank 1: 1.2x, ..., Rank 10: 3.0x
         if (rankIndex < 0) rankIndex = 0;
         if (rankIndex > MAX_RANK_INDEX) rankIndex = MAX_RANK_INDEX;
        return (1.0 + rankIndex * 0.2).toFixed(1);
    };


    // --- Populate Form ---
    RANKS.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank.index;
        option.textContent = `${rank.index}: ${rank.name}`;
        rankSelect.appendChild(option);
    });

    // --- Event Handlers ---
    calculateBtn.addEventListener('click', () => {
        let calculationInput;
        const totalXp = parseInt(totalXpInput.value, 10);
        const rankIndex = parseInt(rankSelect.value, 10);
        const tier = parseInt(tierInput.value, 10);
        const currentXp = parseInt(currentXpInput.value, 10);

        // Determine which input method was used
        if (!isNaN(totalXp) && totalXp >= 0) {
            calculationInput = getRankTierFromTotalXp(totalXp);
        } else if (!isNaN(rankIndex) && !isNaN(tier) && !isNaN(currentXp) && tier >= 1 && tier <= 5 && currentXp >= 0) {
             const xpNeededForCurrentTier = getXpForTier(rankIndex);
             const safeCurrentXp = Math.min(currentXp, xpNeededForCurrentTier); // Cap XP at max for tier
             const baseXpForLevel = getTotalXpForRankTier(rankIndex, tier);
             const calculatedTotalXp = baseXpForLevel + safeCurrentXp;
             calculationInput = { rankIndex: rankIndex, tier: tier, currentTierXp: safeCurrentXp, totalXp: calculatedTotalXp };
        } else {
            alert("Please enter valid Rank/Tier/XP OR a valid Total XP.");
            return;
        }

        // Perform calculations
        const currentRankIndex = calculationInput.rankIndex;
        const currentTier = calculationInput.tier;
        const currentTierXp = calculationInput.currentTierXp;
        const finalTotalXp = calculationInput.totalXp;

        const currentRank = RANKS.find(r => r.index === currentRankIndex) || RANKS[MAX_RANK_INDEX];
        const xpNeededForCurrentTier = getXpForTier(currentRankIndex);
        const xpRemaining = Math.max(0, xpNeededForCurrentTier - currentTierXp);

        const nextLevel = getNextLevel(currentRankIndex, currentTier);
        const nextRank = RANKS.find(r => r.index === nextLevel.rankIndex) || RANKS[MAX_RANK_INDEX];
        const nextLevelString = (currentRankIndex === MAX_RANK_INDEX && currentTier === TIERS_PER_RANK)
            ? "Max Level Reached"
            : `${nextRank.name} (Tier ${nextLevel.tier})`;

        const currentUnlocks = getUnlocksForLevel(currentRankIndex, currentTier);
        const nextUnlocks = (currentRankIndex === MAX_RANK_INDEX && currentTier === TIERS_PER_RANK)
            ? []
            : getUnlocksForLevel(nextLevel.rankIndex, nextLevel.tier);

        const orderMultiplier = getOrderLimitMultiplier(currentRankIndex);

        // Display Results
        resultRankName.textContent = `${currentRank.name} (${currentRankIndex})`;
        resultTier.textContent = currentTier;
        resultCurrentXp.textContent = currentTierXp;
        resultXpNeeded.textContent = (currentRankIndex === MAX_RANK_INDEX && currentTier === TIERS_PER_RANK) ? 'MAX' : xpNeededForCurrentTier;
        resultXpRemaining.textContent = (currentRankIndex === MAX_RANK_INDEX && currentTier === TIERS_PER_RANK) ? '0' : xpRemaining;
        resultTotalXp.textContent = finalTotalXp;
        resultNextLevel.textContent = nextLevelString;
        resultOrderMultiplier.textContent = orderMultiplier;

        const renderUnlocks = (ulElement, unlocksList) => {
            ulElement.innerHTML = ''; // Clear previous
            if (unlocksList.length === 0) {
                ulElement.innerHTML = '<li>None</li>';
            } else {
                unlocksList.forEach(unlock => {
                    const li = document.createElement('li');
                    li.textContent = unlock;
                    ulElement.appendChild(li);
                });
            }
        };

        renderUnlocks(resultCurrentUnlocksUl, currentUnlocks);
        renderUnlocks(resultNextUnlocksUl, nextUnlocks);

        resultsDiv.style.display = 'block'; // Show results
    });

    // Clear inputs when the other input type is used
    rankSelect.addEventListener('change', () => totalXpInput.value = '');
    tierInput.addEventListener('input', () => totalXpInput.value = '');
    currentXpInput.addEventListener('input', () => totalXpInput.value = '');
    totalXpInput.addEventListener('input', () => {
        rankSelect.value = '0';
        tierInput.value = '1';
        currentXpInput.value = '0';
    });


}); // End DOMContentLoaded

    