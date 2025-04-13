import { generateId, formatDateTime } from '../../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    const customerForm = document.getElementById('customer-form');
    const customerListDiv = document.getElementById('customer-list');
    const noCustomersMessage = document.getElementById('no-customers-message');
    const formTitle = document.getElementById('form-title');
    const customerIdInput = document.getElementById('customer-id');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const relationshipLevelInput = document.getElementById('relationship-level');
    const relationshipCategoryDisplay = document.getElementById('relationship-category-display');
    const nameDatalist = document.getElementById('npc-names');

    const STORAGE_KEY = 'schedule1_customerTrackerData';
    const DEAL_COOLDOWN_MINUTES = 600; // From economy.md

    // --- Static Data (Populate from your database findings) ---
    const KNOWN_CUSTOMER_NAMES = [
        "Beth", "Billy", "Carl", "Chloe", "Chris", "Dennis", "Donna", "Doris",
        "Elizabeth", "Eugene", "Fiona", "Genghis", "Greg", "Harold", "Herbert",
        "Jack", "Jennifer", "Jeremy", "Lisa", "Louis", "Lucy", "Ludwig", "Mac",
        "Marco", "Meg", "Melissa", "Michael", "Pearl", "Philip", "Sam", "Tobias",
        "Walter" // Add more as identified
    ];

    const RELATIONSHIP_CATEGORIES = {
        0: { name: "Hostile", color: "#dc3545" },
        1: { name: "Unfriendly", color: "#ffc107" },
        2: { name: "Neutral", color: "#6c757d" },
        3: { name: "Friendly", color: "#28a745" },
        4: { name: "Loyal", color: "#007bff" }
    };

    // --- Utility Functions ---
    // generateId and formatDateTime imported from helpers.js

    const getRelationshipCategory = (level) => {
        if (level < 1.0) return RELATIONSHIP_CATEGORIES[0];
        if (level < 2.0) return RELATIONSHIP_CATEGORIES[1];
        if (level < 3.0) return RELATIONSHIP_CATEGORIES[2];
        if (level < 4.0) return RELATIONSHIP_CATEGORIES[3];
        return RELATIONSHIP_CATEGORIES[4]; // 4.0 to 5.0
    };

    const updateRelationshipDisplay = () => {
        const level = parseFloat(relationshipLevelInput.value);
        if (!isNaN(level)) {
            const category = getRelationshipCategory(level);
            relationshipCategoryDisplay.textContent = category.name;
            relationshipCategoryDisplay.style.backgroundColor = category.color;
            relationshipCategoryDisplay.style.color = (level < 1.0 || level >= 3.0) ? '#fff' : '#212529'; // Adjust text color for contrast
        } else {
             relationshipCategoryDisplay.textContent = 'Neutral'; // Default
             relationshipCategoryDisplay.style.backgroundColor = RELATIONSHIP_CATEGORIES[2].color;
             relationshipCategoryDisplay.style.color = '#212529';
        }
    };

    const calculateNextAvailableDeal = (lastInteractionTimestamp) => {
        if (!lastInteractionTimestamp) return null;
        const cooldownMillis = DEAL_COOLDOWN_MINUTES * 60 * 1000;
        const nextAvailableTimestamp = lastInteractionTimestamp + cooldownMillis;
        return new Date(nextAvailableTimestamp);
    };

    // formatDateTime is now imported

    // --- Local Storage Functions ---
    const loadCustomers = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing customer data from localStorage:", e);
            return [];
        }
    };

    const saveCustomers = (customers) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    };

    // --- Rendering Functions ---
    const renderCustomerList = () => {
        customerListDiv.innerHTML = ''; // Clear existing list
        const customers = loadCustomers();

        if (customers.length === 0) {
            noCustomersMessage.style.display = 'block';
            return;
        }

        noCustomersMessage.style.display = 'none';

        customers.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

        customers.forEach(customer => {
            const div = document.createElement('div');
            div.classList.add('customer-entry');
            div.dataset.id = customer.id;

            const relationship = getRelationshipCategory(customer.relationshipLevel);
            const lastInteractionDate = customer.lastInteractionTimestamp ? new Date(customer.lastInteractionTimestamp) : null;
            const nextDealDate = calculateNextAvailableDeal(customer.lastInteractionTimestamp);
            const isCooldownActive = nextDealDate && nextDealDate > new Date();

            div.innerHTML = `
                <h4>${customer.name}</h4>
                <div class="customer-info">
                    <p><strong>Relationship:</strong> ${customer.relationshipLevel.toFixed(1)} (<span class="category-label" style="background-color:${relationship.color}; color:${(customer.relationshipLevel < 1.0 || customer.relationshipLevel >= 3.0) ? '#fff' : '#212529'}">${relationship.name}</span>)</p>
                    <p><strong>Addiction:</strong> ${(customer.addictionLevel * 100).toFixed(1)}%</p>
                    <p><strong>Quality Standard:</strong> ${document.getElementById('quality-standard').options[customer.qualityStandard]?.text || 'N/A'}</p>
                    <p><strong>Pref. Drugs:</strong> ${customer.preferredDrugs || 'N/A'}</p>
                    <p><strong>Pref. Effects:</strong> ${customer.preferredEffects || 'N/A'}</p>
                    <p><strong>Last Interaction:</strong> ${formatDateTime(lastInteractionDate)}</p>
                    <p class="cooldown-info">
                        <strong>Deal Cooldown:</strong>
                        ${isCooldownActive
                            ? `Available after ${formatDateTime(nextDealDate)}`
                            : 'Available Now'
                        }
                    </p>
                    <p><strong>Notes:</strong> ${customer.notes.replace(/\n/g, '<br>') || 'N/A'}</p>
                </div>
                <div class="customer-actions">
                    <button class="btn btn-edit" data-id="${customer.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${customer.id}">Delete</button>
                </div>
            `;
            customerListDiv.appendChild(div);
        });
    };

    // --- Form Handling ---
    const resetForm = () => {
        customerForm.reset();
        customerIdInput.value = '';
        formTitle.textContent = 'Add New Customer';
        updateRelationshipDisplay(); // Reset display
    };

    const populateEditForm = (id) => {
        const customers = loadCustomers();
        const customer = customers.find(c => c.id === id);
        if (!customer) return;

        formTitle.textContent = `Edit ${customer.name}`;
        customerIdInput.value = customer.id;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('relationship-level').value = customer.relationshipLevel;
        document.getElementById('addiction-level').value = customer.addictionLevel;
        document.getElementById('preferred-drugs').value = customer.preferredDrugs;
        document.getElementById('preferred-effects').value = customer.preferredEffects;
        document.getElementById('quality-standard').value = customer.qualityStandard;
        document.getElementById('notes').value = customer.notes;

        if (customer.lastInteractionTimestamp) {
            const date = new Date(customer.lastInteractionTimestamp);
            // Format date and time for input fields (YYYY-MM-DD and HH:MM)
             const yyyy = date.getFullYear();
             const mm = String(date.getMonth() + 1).padStart(2, '0');
             const dd = String(date.getDate()).padStart(2, '0');
             const hh = String(date.getHours()).padStart(2, '0');
             const min = String(date.getMinutes()).padStart(2, '0');
            document.getElementById('last-interaction-date').value = `${yyyy}-${mm}-${dd}`;
            document.getElementById('last-interaction-time').value = `${hh}:${min}`;
        } else {
            document.getElementById('last-interaction-date').value = '';
            document.getElementById('last-interaction-time').value = '';
        }
        updateRelationshipDisplay(); // Update display for edited customer
        window.scrollTo({ top: customerForm.offsetTop - 20, behavior: 'smooth' }); // Scroll to form
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const id = customerIdInput.value;
        const name = document.getElementById('customer-name').value.trim();
        const relationshipLevel = parseFloat(document.getElementById('relationship-level').value);
        const addictionLevel = parseFloat(document.getElementById('addiction-level').value);
        const preferredDrugs = document.getElementById('preferred-drugs').value.trim();
        const preferredEffects = document.getElementById('preferred-effects').value.trim();
        const qualityStandard = document.getElementById('quality-standard').value;
        const notes = document.getElementById('notes').value.trim();
        const dateStr = document.getElementById('last-interaction-date').value;
        const timeStr = document.getElementById('last-interaction-time').value;

        let lastInteractionTimestamp = null;
        if (dateStr && timeStr) {
            try {
                 // Combine date and time, careful about local vs UTC interpretation
                 // Parsing as local time is usually intended by users for this type of input
                 lastInteractionTimestamp = new Date(`${dateStr}T${timeStr}`).getTime();
                 if (isNaN(lastInteractionTimestamp)) lastInteractionTimestamp = null; // Handle invalid date/time combo
            } catch(e) {
                console.error("Error parsing date/time", e);
                lastInteractionTimestamp = null;
            }
        } else if (dateStr) { // Handle date only input
             try {
                 lastInteractionTimestamp = new Date(dateStr).getTime();
                 if (isNaN(lastInteractionTimestamp)) lastInteractionTimestamp = null;
            } catch(e) {
                console.error("Error parsing date", e);
                lastInteractionTimestamp = null;
            }
        }


        if (!name || isNaN(relationshipLevel) || isNaN(addictionLevel)) {
            alert('Please fill in required fields (Name, Relationship, Addiction).');
            return;
        }

        const customerData = {
            name,
            relationshipLevel,
            lastInteractionTimestamp,
            addictionLevel,
            preferredDrugs,
            preferredEffects,
            qualityStandard,
            notes
        };

        let customers = loadCustomers();

        if (id) { // Editing existing customer
            customers = customers.map(c => c.id === id ? { ...c, ...customerData } : c);
        } else { // Adding new customer
            customerData.id = generateId();
            customers.push(customerData);
        }

        saveCustomers(customers);
        renderCustomerList();
        resetForm();
    };

    // --- Event Listeners ---
    customerForm.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', resetForm);
    relationshipLevelInput.addEventListener('input', updateRelationshipDisplay);

    // Event delegation for edit/delete buttons
    customerListDiv.addEventListener('click', (event) => {
        const target = event.target;
        const customerId = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            populateEditForm(customerId);
        } else if (target.classList.contains('btn-danger')) {
            if (confirm('Are you sure you want to delete this customer entry?')) {
                let customers = loadCustomers();
                customers = customers.filter(c => c.id !== customerId);
                saveCustomers(customers);
                renderCustomerList();
                // If the deleted customer was being edited, clear the form
                if (customerIdInput.value === customerId) {
                    resetForm();
                }
            }
        }
    });

    // --- Initial Load ---
     // Populate datalist
     KNOWN_CUSTOMER_NAMES.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        nameDatalist.appendChild(option);
     });

    renderCustomerList(); // Initial render on page load
    updateRelationshipDisplay(); // Set initial display for default value
});