import { formatCurrency } from '../../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Casino calculator script loaded!");


    function calculateBlackjackPayout() {
        const betInput = document.getElementById('bj-bet');
        const outcomeSelect = document.getElementById('bj-outcome');
        const resultDiv = document.getElementById('bj-result');

        const bet = parseFloat(betInput.value);
        const outcome = outcomeSelect.value;

        if (isNaN(bet) || bet < 10 || bet > 1000) {
            resultDiv.textContent = 'Please enter a valid bet between $10 and $1000.';
            resultDiv.style.color = '#dc3545'; // Red for error
            return;
        }

        let profit = 0;
        let message = '';
        resultDiv.style.color = '#212529'; // Default text color

        switch (outcome) {
            case 'blackjack':
                profit = bet * 1.5;
                message = `Blackjack! Profit: ${formatCurrency(profit)}`;
                resultDiv.style.color = '#28a745'; // Green for win
                break;
            case 'win':
                profit = bet * 1.0;
                message = `You Win! Profit: ${formatCurrency(profit)}`;
                resultDiv.style.color = '#28a745'; // Green for win
                break;
            case 'push':
                profit = 0;
                message = `Push! Bet returned. Profit: ${formatCurrency(profit)}`;
                break;
            case 'lose':
                profit = -bet;
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

         if (isNaN(bet) || bet < 10 || bet > 500) {
            resultDiv.innerHTML = '<p style="color: #dc3545;">Please enter a valid initial bet between $10 and $500.</p>';
            return;
        }

        const multipliers = [2, 4, 8, 32]; // Based on inferred rules
        const stages = ["Stage 1 (Red/Black)", "Stage 2 (Hi/Lo)", "Stage 3 (In/Out)", "Stage 4 (Suit)"];

        let resultHTML = '<ul>';
        for (let i = 0; i < stages.length; i++) {
            const potentialWinnings = bet * multipliers[i];
            resultHTML += `<li>After ${stages[i]}: <strong>${formatCurrency(potentialWinnings)}</strong></li>`;
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