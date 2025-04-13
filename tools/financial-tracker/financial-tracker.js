import { generateId, formatCurrency, formatDateTimeForInput, formatDateTime } from '../../utils/helpers.js'; // Added formatDateTime

document.addEventListener('DOMContentLoaded', () => {
    const cashBalanceDisplay = document.getElementById('display-cash-balance');
    const onlineBalanceDisplay = document.getElementById('display-online-balance');
    const updateBalancesForm = document.getElementById('update-balances-form');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const transactionLogBody = document.getElementById('transaction-log-body');
    const noTransactionsRow = document.getElementById('no-transactions-row');
    const clearLogBtn = document.getElementById('clear-log-btn');
    const txTypeSelect = document.getElementById('tx-type');
    const txTransferNote = document.getElementById('tx-transfer-note');
    const txAffectedCashRadio = document.getElementById('tx-affect-cash');
    const txAffectedOnlineRadio = document.getElementById('tx-affect-online');

    const STORAGE_KEY = 'schedule1_financialData';

    // --- Utility Functions ---
    // generateId, formatCurrency, formatDateTimeForInput, formatDateTime imported from helpers.js

    // --- Local Storage Functions ---
    const loadData = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        const defaults = {
            cashBalance: 0,
            onlineBalance: 0,
            transactions: []
        };
        try {
            const parsed = data ? JSON.parse(data) : defaults;
            // Ensure structure is correct
            parsed.cashBalance = Number(parsed.cashBalance) || 0;
            parsed.onlineBalance = Number(parsed.onlineBalance) || 0;
            parsed.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
            // Ensure timestamps are numbers
            parsed.transactions.forEach(tx => tx.timestamp = Number(tx.timestamp) || Date.now());
            return parsed;
        } catch (e) {
            console.error("Error parsing financial data from localStorage:", e);
            return defaults;
        }
    };

    const saveData = (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // --- Rendering Functions ---
    const updateBalanceDisplay = () => {
        const data = loadData();
        cashBalanceDisplay.textContent = formatCurrency(data.cashBalance);
        onlineBalanceDisplay.textContent = formatCurrency(data.onlineBalance);
    };

    const renderTransactionLog = () => {
        transactionLogBody.innerHTML = ''; // Clear existing log
        const data = loadData();
        const transactions = data.transactions;

        if (transactions.length === 0) {
            // Ensure the row exists before trying to append it
            if (noTransactionsRow) {
                transactionLogBody.appendChild(noTransactionsRow); // Show 'no transactions' message
            }
            return;
        } else {
             // Ensure the row is removed if it exists and there are transactions
             if (noTransactionsRow && noTransactionsRow.parentNode === transactionLogBody) {
                 transactionLogBody.removeChild(noTransactionsRow);
             }
        }


        // Sort newest first
        transactions.sort((a, b) => b.timestamp - a.timestamp);

        transactions.forEach(tx => {
            const row = document.createElement('tr');
            let amountClass = '';
            let amountPrefix = '';
            let affectedBalanceText = tx.affected === 'cash' ? 'Cash' : 'Online';

            // Determine prefix and class based on the transaction type AND the affected balance recorded
            switch (tx.type) {
                case 'Income':
                case 'Laundering Payout': // Increases Online
                case 'ATM Withdrawal': // Increases Cash
                    amountClass = 'amount-income';
                    amountPrefix = '+ ';
                    break;
                case 'Expense':
                case 'Laundering Deposit': // Decreases Cash
                case 'ATM Deposit': // Decreases Cash
                    amountClass = 'amount-expense';
                    amountPrefix = '- ';
                    break;
                default: // Other or unknown
                    amountClass = 'amount-transfer';
                    amountPrefix = ''; // Could be + or - depending on description
            }

            // Specific adjustments for transfers based on the *recorded affected balance*
            if (tx.type === 'ATM Deposit') { // Cash -> Online
                if (tx.affected === 'cash') { // Log shows cash decrease
                    amountClass = 'amount-expense'; amountPrefix = '- ';
                } else { // Log shows online increase
                    amountClass = 'amount-income'; amountPrefix = '+ ';
                }
                affectedBalanceText += ' (Transfer)';
            } else if (tx.type === 'ATM Withdrawal') { // Online -> Cash
                 if (tx.affected === 'cash') { // Log shows cash increase
                    amountClass = 'amount-income'; amountPrefix = '+ ';
                } else { // Log shows online decrease
                    amountClass = 'amount-expense'; amountPrefix = '- ';
                }
                affectedBalanceText += ' (Transfer)';
            } else if (tx.type === 'Laundering Deposit') { // Cash -> Business (not tracked)
                 if (tx.affected === 'cash') { // Log shows cash decrease
                    amountClass = 'amount-expense'; amountPrefix = '- ';
                } else { // Log shows online (no change yet)
                    amountClass = 'amount-transfer'; amountPrefix = ''; // Or perhaps '-' ? Needs clarification.
                }
                 affectedBalanceText += ' (Laundering)';
            } else if (tx.type === 'Laundering Payout') { // Business -> Online
                 if (tx.affected === 'cash') { // Log shows cash (no change)
                     amountClass = 'amount-transfer'; amountPrefix = '';
                } else { // Log shows online increase
                    amountClass = 'amount-income'; amountPrefix = '+ ';
                }
                 affectedBalanceText += ' (Laundering)';
            }


            row.innerHTML = `
                <td>${formatDateTime(tx.timestamp)}</td>
                <td>${tx.type}</td>
                <td>${tx.description}</td>
                <td class="${amountClass}">${amountPrefix}${formatCurrency(tx.amount)}</td>
                <td>${formatCurrency(tx.balanceAfter)} (${affectedBalanceText})</td>
                <td class="action-cell">
                    <button class="btn btn-danger btn-small btn-delete-tx" data-id="${tx.id}">Delete</button>
                </td>
            `;
            transactionLogBody.appendChild(row);
        });
    };

    // --- Event Handlers ---

    // Update Balances Form
    updateBalancesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newCashStr = document.getElementById('update-cash').value;
        const newOnlineStr = document.getElementById('update-online').value;

        const data = loadData();

        // Only update if a value was entered
        if (newCashStr !== '') {
            const newCash = parseFloat(newCashStr);
            if (!isNaN(newCash) && newCash >= 0) {
                data.cashBalance = newCash;
            } else if (newCashStr !== '') { // Don't alert if field was left blank
                alert('Invalid Cash Balance value.');
                return;
            }
        }

        if (newOnlineStr !== '') {
            const newOnline = parseFloat(newOnlineStr);
            if (!isNaN(newOnline) && newOnline >= 0) {
                data.onlineBalance = newOnline;
            } else if (newOnlineStr !== '') {
                alert('Invalid Online Balance value.');
                return;
            }
        }

        saveData(data);
        updateBalanceDisplay();
        updateBalancesForm.reset(); // Clear the update form
        alert('Balances updated!');
    });

    // Add Transaction Form
    addTransactionForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const timestampStr = document.getElementById('tx-date').value;
        const type = document.getElementById('tx-type').value;
        const description = document.getElementById('tx-description').value.trim();
        const amountStr = document.getElementById('tx-amount').value;
        const affectedRadio = document.querySelector('input[name="tx-affect"]:checked');

        if (!affectedRadio) {
            alert('Please select which balance is primarily affected.');
            return;
        }
        const affected = affectedRadio.value;


        if (!timestampStr || !description || !amountStr) {
            alert('Please fill in Date, Description, and Amount.');
            return;
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive Amount.');
            return;
        }

        let timestamp;
        try {
            timestamp = new Date(timestampStr).getTime();
             if (isNaN(timestamp)) throw new Error("Invalid date/time value");
        } catch (e) {
            alert('Invalid Date/Time selected.');
            return;
        }


        const data = loadData();
        let balanceAfter; // This will store the balance *of the selected affected account* after the transaction

        // Apply transaction logic to actual balances
        switch (type) {
            case 'Income':
                if (affected === 'cash') {
                    data.cashBalance += amount;
                    balanceAfter = data.cashBalance;
                } else {
                    data.onlineBalance += amount;
                    balanceAfter = data.onlineBalance;
                }
                break;
            case 'Expense':
                 if (affected === 'cash') {
                    data.cashBalance -= amount;
                    balanceAfter = data.cashBalance;
                 } else {
                    data.onlineBalance -= amount;
                    balanceAfter = data.onlineBalance;
                 }
                break;
            case 'ATM Deposit': // Cash goes down, Online goes up
                data.cashBalance -= amount;
                data.onlineBalance += amount;
                balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
                break;
            case 'ATM Withdrawal': // Online goes down, Cash goes up
                data.onlineBalance -= amount;
                data.cashBalance += amount;
                balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
                break;
             case 'Laundering Deposit': // Cash goes down (into the business)
                data.cashBalance -= amount;
                // Online balance doesn't change YET
                 balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance; // Log shows selected balance
                break;
            case 'Laundering Payout': // Online goes up (from the business)
                data.onlineBalance += amount;
                // Cash balance doesn't change
                balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance; // Log shows selected balance
                break;
            case 'Other':
                // For 'Other', assume it affects the selected balance directly
                 if (affected === 'cash') {
                     data.cashBalance += amount; // Assume increase, user can use negative desc/amount if needed? Or add +/- radio?
                     balanceAfter = data.cashBalance;
                 } else {
                     data.onlineBalance += amount;
                     balanceAfter = data.onlineBalance;
                 }
                break;
        }

        // Ensure balances don't go negative (or alert user if they do)
        if (data.cashBalance < 0) {
            alert("Warning: Cash balance went negative. Adjusting to $0.00.");
            data.cashBalance = 0;
            if (affected === 'cash') balanceAfter = 0; // Adjust logged balance if needed
        }
        if (data.onlineBalance < 0) {
             alert("Warning: Online balance went negative. Adjusting to $0.00.");
            data.onlineBalance = 0;
             if (affected === 'online') balanceAfter = 0; // Adjust logged balance if needed
        }

        const newTransaction = {
            id: generateId(),
            timestamp: timestamp,
            type: type,
            description: description,
            amount: amount,
            affected: affected, // Record which balance was primarily selected for the log context
            balanceAfter: balanceAfter // Record the balance of the 'affected' account AFTER the transaction
        };

        data.transactions.push(newTransaction);
        saveData(data);
        updateBalanceDisplay();
        renderTransactionLog();
        addTransactionForm.reset(); // Clear the form
        // Set default date/time for next entry
        document.getElementById('tx-date').value = formatDateTimeForInput(Date.now());
        // Reset radio button selection note visibility
        txTransferNote.style.display = 'none';
        txAffectedCashRadio.checked = true; // Default back to cash

    });

     // Show note for transfer types
    txTypeSelect.addEventListener('change', () => {
        const selectedType = txTypeSelect.value;
        if (selectedType === 'ATM Deposit' || selectedType === 'ATM Withdrawal' ||
            selectedType === 'Laundering Deposit' || selectedType === 'Laundering Payout') {
            txTransferNote.style.display = 'block';
        } else {
            txTransferNote.style.display = 'none';
        }
    });


    // Delete Transaction (using event delegation)
    transactionLogBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete-tx')) {
            const txId = event.target.dataset.id;
            if (confirm('Are you sure you want to delete this transaction log entry?\n(This will NOT automatically adjust your current balances)')) {
                const data = loadData();
                data.transactions = data.transactions.filter(tx => tx.id !== txId);
                saveData(data);
                renderTransactionLog(); // Re-render the log
                // Balances remain unchanged as per the warning
            }
        }
    });

     // Clear Entire Log Button
     clearLogBtn.addEventListener('click', () => {
         if (confirm('Are you sure you want to clear the ENTIRE transaction log?\n(This CANNOT be undone and will NOT affect your current balances)')) {
             const data = loadData();
             data.transactions = []; // Empty the array
             saveData(data);
             renderTransactionLog();
         }
     });


    // --- Initial Load ---
    updateBalanceDisplay();
    renderTransactionLog();
    // Set default date/time for the transaction form
    document.getElementById('tx-date').value = formatDateTimeForInput(Date.now());
    // Ensure note visibility is correct on load
    txTypeSelect.dispatchEvent(new Event('change'));

}); // End DOMContentLoaded