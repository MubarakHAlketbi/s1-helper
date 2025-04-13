import { formatCurrency } from '../../utils/helpers.js';
// Import constants from game_data.js
import {
    BLACKJACK_MIN_BET,
    BLACKJACK_MAX_BET,
    BLACKJACK_PAYOUTS,
    RTB_MIN_BET,
    RTB_MAX_BET,
    RTB_MULTIPLIERS
} from '../../database/game_data.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Casino calculator script loaded!");


    function calculateBlackjackPayout() {
        const betInput = document.getElementById('bj-bet');
        const outcomeSelect = document.getElementById('bj-outcome');
        const resultDiv = document.getElementById('bj-result');

        const bet = parseFloat(betInput.value);
        const outcome = outcomeSelect.value;

        // Use imported constants for validation
        if (isNaN(bet) || bet < BLACKJACK_MIN_BET || bet > BLACKJACK_MAX_BET) {
            resultDiv.textContent = `Please enter a valid bet between ${formatCurrency(BLACKJACK_MIN_BET)} and ${formatCurrency(BLACKJACK_MAX_BET)}.`;
            resultDiv.style.color = '#dc3545'; // Red for error
            return;
        }

        let profit = 0;
        let message = '';
        resultDiv.style.color = '#212529'; // Default text color

        // Use imported constants for payouts
        switch (outcome) {
            case 'blackjack':
                profit = bet * BLACKJACK_PAYOUTS.blackjack;
                message = `Blackjack! Profit: ${formatCurrency(profit)}`;
                resultDiv.style.color = '#28a745'; // Green for win
                break;
            case 'win':
                profit = bet * BLACKJACK_PAYOUTS.win;
                message = `You Win! Profit: ${formatCurrency(profit)}`;
                resultDiv.style.color = '#28a745'; // Green for win
                break;
            case 'push':
                profit = bet * BLACKJACK_PAYOUTS.push; // Will be 0
                message = `Push! Bet returned. Profit: ${formatCurrency(profit)}`;
                break;
            case 'lose':
                profit = bet * BLACKJACK_PAYOUTS.lose; // Will be -bet
                message = `You Lose. Loss: ${formatCurrency(Math.abs(profit))}`;
                 resultDiv.style.color = '#dc3545'; // Red for loss
                break;
            default:
                message = 'Invalid outcome selected.';
                 resultDiv.style.color = '#dc3545';
        }

        resultDiv.textContent = message;
    }

    function calculateRtbPayout() {
        const betInput = document.getElementById('rtb-bet');
        const resultDiv = document.getElementById('rtb-result');

        const bet = parseFloat(betInput.value);

         // Use imported constants for validation
         if (isNaN(bet) || bet < RTB_MIN_BET || bet > RTB_MAX_BET) {
            resultDiv.innerHTML = `<p style="color: #dc3545;">Please enter a valid initial bet between ${formatCurrency(RTB_MIN_BET)} and ${formatCurrency(RTB_MAX_BET)}.</p>`;
            return;
        }

        // Use imported constants for multipliers
        const multipliers = RTB_MULTIPLIERS;
        const stages = ["Stage 1 (Red/Black)", "Stage 2 (Hi/Lo)", "Stage 3 (In/Out)", "Stage 4 (Suit)"];

        let resultHTML = '<ul>';
        for (let i = 0; i < stages.length; i++) {
            // Ensure multiplier exists for the stage
            const multiplier = multipliers[i] !== undefined ? multipliers[i] : (multipliers[multipliers.length - 1] || 1); // Fallback if stages > multipliers
            const potentialWinnings = bet * multiplier;
            resultHTML += `<li>After ${stages[i]}: <strong>${formatCurrency(potentialWinnings)}</strong> (Multiplier: ${multiplier}x)</li>`;
        }
         resultHTML += '</ul><p><em>Note: Losing any stage loses the entire potential amount. You can forfeit before answering the next stage.</em></p>';


        resultDiv.innerHTML = resultHTML;
    }

    // Add event listeners to buttons
    const bjButton = document.querySelector('#blackjack-payout-form button.btn-primary');
    if (bjButton) {
        bjButton.addEventListener('click', calculateBlackjackPayout);
    }

    const rtbButton = document.querySelector('#rtb-payout-form button.btn-primary');
    if (rtbButton) {
        rtbButton.addEventListener('click', calculateRtbPayout);
    }

    // Optional: Add listeners for input/change for real-time updates if desired
    // const bjBetInput = document.getElementById('bj-bet');
    // const bjOutcomeSelect = document.getElementById('bj-outcome');
    // const rtbBetInput = document.getElementById('rtb-bet');
    // if (bjBetInput) bjBetInput.addEventListener('input', calculateBlackjackPayout);
    // if (bjOutcomeSelect) bjOutcomeSelect.addEventListener('change', calculateBlackjackPayout);
    // if (rtbBetInput) rtbBetInput.addEventListener('input', calculateRtbPayout);

}); // End DOMContentLoaded