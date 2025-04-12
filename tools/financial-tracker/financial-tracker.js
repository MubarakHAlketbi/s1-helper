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

    const STORAGE_KEY = 'schedule1_financialData';

    // --- Utility Functions ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const formatCurrency = (amount) => {
        return `$${Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`; // Add commas
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    const formatDateTimeForInput = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
         if (isNaN(date)) return '';
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

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
            transactionLogBody.appendChild(noTransactionsRow); // Show 'no transactions' message
            return;
        }

        // Sort newest first
        transactions.sort((a, b) => b.timestamp - a.timestamp);

        transactions.forEach(tx => {
            const row = document.createElement('tr');
            let amountClass = '';
            let amountPrefix = '';

            switch (tx.type) {
                case 'Income':
                case 'Laundering Payout':
                case 'ATM Withdrawal': // Increases cash
                     amountClass = 'amount-income';
                     amountPrefix = '+ ';
                     break;
                case 'Expense':
                case 'Laundering Deposit':
                case 'ATM Deposit': // Decreases cash
                    amountClass = 'amount-expense';
                    amountPrefix = '- ';
                    break;
                default:
                    amountClass = 'amount-transfer'; // Neutral/Other
            }

            // Adjust prefix for transfers affecting online balance
            if (tx.affected === 'online') {
                 if (tx.type === 'ATM Deposit' || tx.type === 'Laundering Payout') amountPrefix = '+ ';
                 else if (tx.type === 'ATM Withdrawal' || tx.type === 'Laundering Deposit') amountPrefix = '- ';
            }


            row.innerHTML = `
                <td>${formatTimestamp(tx.timestamp)}</td>
                <td>${tx.type}</td>
                <td>${tx.description}</td>
                <td class="${amountClass}">${amountPrefix}${formatCurrency(tx.amount)}</td>
                <td>${formatCurrency(tx.balanceAfter)} (${tx.affected})</td>
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
        const affected = document.querySelector('input[name="tx-affect"]:checked').value;

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
             if (isNaN(timestamp)) throw new Error();
        } catch (e) {
            alert('Invalid Date/Time selected.');
            return;
        }


        const data = loadData();
        let currentBalance = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
        let balanceAfter = currentBalance; // Initialize

        // Apply transaction logic
        switch (type) {
            case 'Income':
                if (affected === 'cash') data.cashBalance += amount;
                else data.onlineBalance += amount;
                break;
            case 'Expense':
                 if (affected === 'cash') data.cashBalance -= amount;
                 else data.onlineBalance -= amount;
                break;
            case 'ATM Deposit': // Cash goes down, Online goes up
                data.cashBalance -= amount;
                data.onlineBalance += amount;
                break;
            case 'ATM Withdrawal': // Online goes down, Cash goes up
                data.onlineBalance -= amount;
                data.cashBalance += amount;
                break;
             case 'Laundering Deposit': // Cash goes down (into the business)
                data.cashBalance -= amount;
                // Online balance doesn't change YET
                break;
            case 'Laundering Payout': // Online goes up (from the business)
                data.onlineBalance += amount;
                // Cash balance doesn't change
                break;
            case 'Other':
                // For 'Other', assume it affects the selected balance directly
                // User needs to log separate transactions if it's a transfer
                 if (affected === 'cash') data.cashBalance += amount; // Assume increase, user can use negative desc
                 else data.onlineBalance += amount;
                break;
        }

        // Ensure balances don't go negative (or alert user if they do)
        if (data.cashBalance < 0) {
            alert("Warning: Cash balance went negative. Adjusting to $0.00.");
            data.cashBalance = 0;
        }
        if (data.onlineBalance < 0) {
             alert("Warning: Online balance went negative. Adjusting to $0.00.");
            data.onlineBalance = 0;
        }

        // Determine the 'Balance After' for the log based on the primary affected balance
        balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
         // For transfers, the log shows the balance of the *selected* radio button after the change
         if (type === 'ATM Deposit' || type === 'Laundering Deposit') {
             balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
         } else if (type === 'ATM Withdrawal' || type === 'Laundering Payout') {
             balanceAfter = (affected === 'cash') ? data.cashBalance : data.onlineBalance;
         }


        const newTransaction = {
            id: generateId(),
            timestamp: timestamp,
            type: type,
            description: description,
            amount: amount,
            affected: affected, // Record which balance was primarily selected
            balanceAfter: balanceAfter
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

}); // End DOMContentLoaded