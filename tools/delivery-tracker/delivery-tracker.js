document.addEventListener('DOMContentLoaded', () => {
    const deliveryForm = document.getElementById('delivery-form');
    const deliveryListDiv = document.getElementById('delivery-list');
    const noDeliveriesMessage = document.getElementById('no-deliveries-message');
    const formTitle = document.getElementById('form-title');
    const deliveryIdInput = document.getElementById('delivery-id');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const sortSelect = document.getElementById('sort-deliveries');

    const STORAGE_KEY = 'schedule1_deliveryTrackerData';
    let updateInterval; // To store the interval ID

    // --- Utility Functions ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
         if (isNaN(date)) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
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

    const calculateTimeRemaining = (arrivalTimestamp) => {
        if (!arrivalTimestamp) return { text: 'No arrival time set', sortValue: Infinity };
        const now = Date.now();
        const arrival = arrivalTimestamp;
        const diff = arrival - now; // Difference in milliseconds

        if (diff <= 0) { // Arrived or past due
            const pastDiff = Math.abs(diff);
            const minutes = Math.floor(pastDiff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return { text: `Arrived ${days}d ${hours % 24}h ago`, sortValue: diff };
            if (hours > 0) return { text: `Arrived ${hours}h ${minutes % 60}m ago`, sortValue: diff };
            if (minutes > 0) return { text: `Arrived ${minutes}m ago`, sortValue: diff };
            return { text: `Arrived just now`, sortValue: diff };
        } else { // Pending arrival
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return { text: `Arriving in ${days}d ${hours % 24}h`, sortValue: diff };
            if (hours > 0) return { text: `Arriving in ${hours}h ${minutes % 60}m`, sortValue: diff };
            if (minutes > 0) return { text: `Arriving in ${minutes}m ${seconds % 60}s`, sortValue: diff };
            if (seconds > 0) return { text: `Arriving in ${seconds}s`, sortValue: diff };
            return { text: `Arriving now...`, sortValue: diff };
        }
    };

    // --- Local Storage Functions ---
    const loadDeliveries = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            const deliveries = data ? JSON.parse(data) : [];
            // Ensure arrivalTime is a number (timestamp)
            return deliveries.map(d => ({ ...d, arrivalTime: Number(d.arrivalTime) || null }));
        } catch (e) {
            console.error("Error parsing delivery data from localStorage:", e);
            return [];
        }
    };

    const saveDeliveries = (deliveries) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    };

    // --- Sorting ---
    const sortDeliveries = (deliveries, sortBy) => {
        switch (sortBy) {
            case 'arrival_desc':
                return [...deliveries].sort((a, b) => (b.arrivalTime || 0) - (a.arrivalTime || 0));
            case 'store_asc':
                return [...deliveries].sort((a, b) => a.storeName.localeCompare(b.storeName));
            case 'store_desc':
                return [...deliveries].sort((a, b) => b.storeName.localeCompare(a.storeName));
            case 'arrival_asc': // Default
            default:
                return [...deliveries].sort((a, b) => (a.arrivalTime || Infinity) - (b.arrivalTime || Infinity));
        }
    };


    // --- Rendering Functions ---
    const renderDeliveryList = () => {
        deliveryListDiv.innerHTML = ''; // Clear existing list
        const deliveries = loadDeliveries();
        const sortBy = sortSelect.value;
        const sortedDeliveries = sortDeliveries(deliveries, sortBy);

        if (sortedDeliveries.length === 0) {
            noDeliveriesMessage.style.display = 'block';
            return;
        }

        noDeliveriesMessage.style.display = 'none';

        sortedDeliveries.forEach(delivery => {
            const div = document.createElement('div');
            div.classList.add('delivery-entry');
            if (delivery.arrived) {
                div.classList.add('arrived');
            }
            div.dataset.id = delivery.id;

            const timeInfo = calculateTimeRemaining(delivery.arrivalTime);

            div.innerHTML = `
                <h4>${delivery.storeName} <span style="font-weight:normal; font-size: 0.9em; color: #555;">to ${delivery.destination}</span></h4>
                <div class="delivery-info">
                    <p><strong>Items:</strong></p>
                    <pre class="item-list">${delivery.items || 'N/A'}</pre>
                    <p><strong>Expected Arrival:</strong> ${formatDateTime(delivery.arrivalTime)}</p>
                    <p><strong>Status:</strong> <span class="time-remaining">${delivery.arrived ? 'Arrived / Completed' : timeInfo.text}</span></p>
                </div>
                <div class="delivery-actions">
                    ${!delivery.arrived ? '<button class="btn btn-success btn-mark-arrived" data-id="' + delivery.id + '">Mark Arrived</button>' : ''}
                    <button class="btn btn-edit" data-id="${delivery.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${delivery.id}">Delete</button>
                </div>
            `;
            deliveryListDiv.appendChild(div);
        });
    };

    // --- Form Handling ---
    const resetForm = () => {
        deliveryForm.reset();
        deliveryIdInput.value = '';
        formTitle.textContent = 'Add New Delivery';
    };

    const populateEditForm = (id) => {
        const deliveries = loadDeliveries();
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        formTitle.textContent = `Edit Delivery from ${delivery.storeName}`;
        deliveryIdInput.value = delivery.id;
        document.getElementById('store-name').value = delivery.storeName;
        document.getElementById('items').value = delivery.items;
        document.getElementById('destination').value = delivery.destination;
        document.getElementById('arrival-time').value = formatDateTimeForInput(delivery.arrivalTime);

        window.scrollTo({ top: deliveryForm.offsetTop - 20, behavior: 'smooth' });
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const id = deliveryIdInput.value;
        const storeName = document.getElementById('store-name').value.trim();
        const items = document.getElementById('items').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const arrivalTimeString = document.getElementById('arrival-time').value;

        if (!storeName || !items || !destination || !arrivalTimeString) {
            alert('Please fill in all fields.');
            return;
        }

        let arrivalTime = null;
        try {
            arrivalTime = new Date(arrivalTimeString).getTime();
            if (isNaN(arrivalTime)) {
                throw new Error("Invalid date/time value");
            }
        } catch (e) {
            alert('Invalid Date & Time format provided.');
            console.error("Error parsing arrival time:", e);
            return;
        }


        const deliveryData = {
            storeName,
            items,
            destination,
            arrivalTime, // Store as timestamp
            arrived: false // Always reset arrived status when saving/editing
        };

        let deliveries = loadDeliveries();

        if (id) { // Editing existing delivery
             // Keep original arrived status unless explicitly changed by mark arrived button
            const existingDelivery = deliveries.find(d => d.id === id);
            deliveryData.arrived = existingDelivery ? existingDelivery.arrived : false; // Preserve arrived status on edit
            deliveries = deliveries.map(d => d.id === id ? { ...d, ...deliveryData } : d);
        } else { // Adding new delivery
            deliveryData.id = generateId();
            deliveries.push(deliveryData);
        }

        saveDeliveries(deliveries);
        renderDeliveryList();
        resetForm();
    };

    // --- Update Timer ---
    const startUpdateInterval = () => {
        if (updateInterval) clearInterval(updateInterval); // Clear existing interval
        // Update every minute initially, can be adjusted
        updateInterval = setInterval(renderDeliveryList, 60 * 1000); // Update every 60 seconds
    };

    // --- Event Listeners ---
    deliveryForm.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', resetForm);
    sortSelect.addEventListener('change', renderDeliveryList);

    // Event delegation for action buttons
    deliveryListDiv.addEventListener('click', (event) => {
        const target = event.target;
        const deliveryId = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            populateEditForm(deliveryId);
        } else if (target.classList.contains('btn-mark-arrived')) {
            let deliveries = loadDeliveries();
            deliveries = deliveries.map(d => d.id === deliveryId ? { ...d, arrived: true } : d);
            saveDeliveries(deliveries);
            renderDeliveryList();
        } else if (target.classList.contains('btn-danger')) {
            if (confirm('Are you sure you want to delete this delivery entry?')) {
                let deliveries = loadDeliveries();
                deliveries = deliveries.filter(d => d.id !== deliveryId);
                saveDeliveries(deliveries);
                renderDeliveryList();
                // If the deleted delivery was being edited, clear the form
                if (deliveryIdInput.value === deliveryId) {
                    resetForm();
                }
            }
        }
    });

    // --- Initial Load ---
    renderDeliveryList(); // Initial render on page load
    startUpdateInterval(); // Start the timer for time remaining updates
});