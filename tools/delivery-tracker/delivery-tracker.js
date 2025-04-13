import { generateId, formatDateTime, formatDateTimeForInput, calculateTimeRemaining, loadFromLocalStorage, saveToLocalStorage } from '../../utils/helpers.js';

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
    // generateId, formatDateTime, formatDateTimeForInput, calculateTimeRemaining are imported from helpers.js


    // --- Local Storage Functions (using helpers) ---
    // loadFromLocalStorage and saveToLocalStorage are imported

    // --- Data Validation ---
    const validateDeliveryData = (data) => {
        if (!Array.isArray(data)) {
            return [];
        }
        // Ensure arrivalTime is a number (timestamp) and arrived is boolean
        return data.map(d => ({
            ...d,
            arrivalTime: Number(d.arrivalTime) || null,
            arrived: typeof d.arrived === 'boolean' ? d.arrived : false
        }));
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
        const deliveries = validateDeliveryData(loadFromLocalStorage(STORAGE_KEY, []));
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
        const deliveries = validateDeliveryData(loadFromLocalStorage(STORAGE_KEY, []));
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

        let deliveries = validateDeliveryData(loadFromLocalStorage(STORAGE_KEY, []));

        if (id) { // Editing existing delivery
             // Keep original arrived status unless explicitly changed by mark arrived button
            const existingDelivery = deliveries.find(d => d.id === id);
            deliveryData.arrived = existingDelivery ? existingDelivery.arrived : false; // Preserve arrived status on edit
            deliveries = deliveries.map(d => d.id === id ? { ...d, ...deliveryData } : d);
        } else { // Adding new delivery
            deliveryData.id = generateId();
            deliveries.push(deliveryData);
        }

        saveToLocalStorage(STORAGE_KEY, deliveries);
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
            let deliveries = validateDeliveryData(loadFromLocalStorage(STORAGE_KEY, []));
            deliveries = deliveries.map(d => d.id === deliveryId ? { ...d, arrived: true } : d);
            saveToLocalStorage(STORAGE_KEY, deliveries);
            renderDeliveryList();
        } else if (target.classList.contains('btn-danger')) {
            if (confirm('Are you sure you want to delete this delivery entry?')) {
                let deliveries = validateDeliveryData(loadFromLocalStorage(STORAGE_KEY, []));
                deliveries = deliveries.filter(d => d.id !== deliveryId);
                saveToLocalStorage(STORAGE_KEY, deliveries);
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