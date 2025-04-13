import {
    BLACKJACK_MIN_BET, BLACKJACK_MAX_BET, BLACKJACK_PAYOUTS,
    RTB_MIN_BET, RTB_MAX_BET, RTB_MULTIPLIERS
    // Add Slot Machine data if available later
} from '../../game_data.js'; // Adjust path to game_data
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path to helpers

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('casino-game-list-container');
    if (!container) {
        console.error("Error: Casino game list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    // --- Blackjack Card ---
    const bjCard = document.createElement('div');
    bjCard.classList.add('database-item-card', 'card'); // Reuse item card styling
    bjCard.innerHTML = `
        <h3>Blackjack</h3>
        <div class="item-details">
            <p><strong>Objective:</strong> Get closer to 21 than the dealer without going over.</p>
            <p><strong>Bet Limits:</strong> ${formatCurrency(BLACKJACK_MIN_BET)} - ${formatCurrency(BLACKJACK_MAX_BET)}</p>
            <p><strong>Payouts:</strong></p>
            <ul>
                <li>Blackjack: ${BLACKJACK_PAYOUTS.blackjack}x Bet Profit</li>
                <li>Win: ${BLACKJACK_PAYOUTS.win}x Bet Profit</li>
                <li>Push: Bet Returned</li>
                <li>Lose: Bet Lost</li>
            </ul>
        </div>
        <!-- Link to a potential detailed guide page -->
        <!-- <a href="/guides/casino/blackjack/" class="btn btn-secondary btn-small">View Guide</a> -->
    `;
    container.appendChild(bjCard);

    // --- Ride the Bus (RTB) Card ---
    const rtbCard = document.createElement('div');
    rtbCard.classList.add('database-item-card', 'card');
    rtbCard.innerHTML = `
        <h3>Ride the Bus (RTB)</h3>
        <div class="item-details">
            <p><strong>Objective:</strong> Correctly guess card outcomes across 4 stages.</p>
            <p><strong>Bet Limits:</strong> ${formatCurrency(RTB_MIN_BET)} - ${formatCurrency(RTB_MAX_BET)} (Initial Bet)</p>
            <p><strong>Potential Multipliers:</strong></p>
            <ul>
                <li>Stage 1 (Red/Black): ${RTB_MULTIPLIERS[0]}x</li>
                <li>Stage 2 (Hi/Lo): ${RTB_MULTIPLIERS[1]}x</li>
                <li>Stage 3 (In/Out): ${RTB_MULTIPLIERS[2]}x</li>
                <li>Stage 4 (Suit): ${RTB_MULTIPLIERS[3]}x</li>
            </ul>
            <small>Losing any stage loses the entire potential amount.</small>
        </div>
        <!-- <a href="/guides/casino/rtb/" class="btn btn-secondary btn-small">View Guide</a> -->
    `;
    container.appendChild(rtbCard);

    // --- Slot Machine Card ---
    // TODO: Add Slot Machine data when available in game_data.js
    const slotCard = document.createElement('div');
    slotCard.classList.add('database-item-card', 'card');
    slotCard.innerHTML = `
        <h3>Slot Machine</h3>
        <div class="item-details">
            <p><strong>Objective:</strong> Spin three reels and match symbols.</p>
            <p><strong>Bet Amounts:</strong> Fixed amounts (e.g., $10, $25, $50, $100 - specific values TBD)</p>
            <p><strong>Payouts:</strong> Based on symbol combinations (details TBD).</p>
        </div>
        <!-- <a href="/guides/casino/slots/" class="btn btn-secondary btn-small">View Guide</a> -->
    `;
    container.appendChild(slotCard);

});