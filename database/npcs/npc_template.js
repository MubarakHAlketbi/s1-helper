import {
    CUSTOMER_DATA,
    SUPPLIER_DATA,
    EMPLOYEE_DATA,
    EFFECTS_DATA, // Needed for customer prefs
    QUALITY_LEVELS // Needed for customer standard
} from '../game_data.js';
import { formatCurrency } from '../../utils/helpers.js'; // Assuming formatCurrency is moved/available in helpers

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const npcType = params.get('type');
    const npcId = params.get('id');

    const nameElement = document.getElementById('npc-name');
    const typeElement = document.getElementById('npc-type');
    const notesElement = document.getElementById('npc-notes');
    const errorElement = document.getElementById('loading-error');
    const breadcrumbContainer = document.getElementById('breadcrumb-container');

    if (!npcId || !npcType) {
        showError("NPC type or ID missing from URL.");
        return;
    }

    let npcData = null;
    let categoryName = 'Unknown';
    let categoryLink = '/database/npcs/'; // Default link

    // Find the NPC data based on type
    switch (npcType) {
        case 'customer':
            npcData = CUSTOMER_DATA[npcId];
            categoryName = 'Customers';
            categoryLink = '/database/npcs/customers/';
            break;
        case 'supplier':
            npcData = SUPPLIER_DATA[npcId];
            categoryName = 'Suppliers';
            categoryLink = '/database/npcs/suppliers/';
            break;
        case 'employee':
            npcData = EMPLOYEE_DATA[npcId];
            categoryName = 'Employees';
            categoryLink = '/database/npcs/employees/';
            break;
        // Add cases for 'police' etc. if needed later
        default:
            showError(`Unknown NPC type: ${npcType}`);
            return;
    }

    if (!npcData) {
        showError(`NPC with ID "${npcId}" of type "${npcType}" not found.`);
        return;
    }

    // --- Populate Common Fields ---
    document.title = `${npcData.name || 'NPC'} Details - Schedule 1 Helper`; // Set page title
    nameElement.textContent = npcData.name || 'Unknown NPC';
    typeElement.textContent = npcType.charAt(0).toUpperCase() + npcType.slice(1); // Capitalize type
    notesElement.textContent = npcData.notes || 'No notes available.';

     // --- Populate Breadcrumbs ---
     if (breadcrumbContainer) {
        const ol = breadcrumbContainer.querySelector('ol');
        if (ol) {
            const categoryLi = document.createElement('li');
            categoryLi.innerHTML = `<a href="${categoryLink}">${categoryName}</a>`;
            ol.appendChild(categoryLi);

            const npcLi = document.createElement('li');
            npcLi.setAttribute('aria-current', 'page');
            npcLi.textContent = npcData.name || 'NPC';
            ol.appendChild(npcLi);
        }
    }

    // --- Populate Type-Specific Fields ---
    populateTypeSpecificInfo(npcType, npcData);

});

function populateTypeSpecificInfo(type, data) {
    // Hide all specific info sections first
    document.querySelectorAll('.type-specific-info').forEach(el => el.style.display = 'none');

    switch (type) {
        case 'customer':
            const customerInfoDiv = document.getElementById('customer-info');
            if (customerInfoDiv) {
                const standardName = QUALITY_LEVELS[data.standard] || 'Unknown';
                document.getElementById('customer-standard').textContent = `${standardName} (${data.standard})`;

                const affinitiesList = document.getElementById('customer-affinities');
                affinitiesList.innerHTML = ''; // Clear default
                if (data.affinity && Object.keys(data.affinity).length > 0) {
                     Object.entries(data.affinity).forEach(([drugType, score]) => {
                        const scorePercent = (score * 100).toFixed(0);
                        const scoreClass = score > 0 ? 'positive-value' : (score < 0 ? 'negative-value' : '');
                        const li = document.createElement('li');
                        li.innerHTML = `${drugType}: <span class="${scoreClass}">${scorePercent}%</span>`;
                        affinitiesList.appendChild(li);
                    });
                } else {
                    affinitiesList.innerHTML = '<li>N/A</li>';
                }

                const prefsList = document.getElementById('customer-prefs');
                prefsList.innerHTML = ''; // Clear default
                if (data.prefs && data.prefs.length > 0) {
                    data.prefs.forEach(guid => {
                        const effect = EFFECTS_DATA[guid];
                        const li = document.createElement('li');
                        // TODO: Link effect name later
                        li.textContent = effect ? `${effect.name} (Tier ${effect.tier})` : `Unknown Effect (${guid.substring(0, 8)}...)`;
                        prefsList.appendChild(li);
                    });
                } else {
                     prefsList.innerHTML = '<li>None Listed</li>';
                }

                customerInfoDiv.style.display = 'block';
            }
            break;

        case 'supplier':
            const supplierInfoDiv = document.getElementById('supplier-info');
             if (supplierInfoDiv) {
                 document.getElementById('supplier-contact').textContent = data.contactMethod || 'N/A';
                 const itemsList = document.getElementById('supplier-items');
                 itemsList.innerHTML = ''; // Clear default
                 if (data.items && data.items.length > 0) {
                     data.items.forEach(itemName => {
                         const li = document.createElement('li');
                         // TODO: Link item name later
                         li.textContent = itemName;
                         itemsList.appendChild(li);
                     });
                 } else {
                     itemsList.innerHTML = '<li>None Known</li>';
                 }
                 supplierInfoDiv.style.display = 'block';
             }
            break;

        case 'employee':
             const employeeInfoDiv = document.getElementById('employee-info');
             if (employeeInfoDiv) {
                 document.getElementById('employee-role').textContent = data.role || 'N/A';
                 document.getElementById('employee-cost').textContent = data.cost !== undefined ? `${formatCurrency(data.cost)} (Placeholder)` : 'N/A';

                 const skillsList = document.getElementById('employee-skills');
                 skillsList.innerHTML = ''; // Clear default
                 if (data.skills && data.skills.length > 0) {
                     data.skills.forEach(skill => {
                         const li = document.createElement('li');
                         li.textContent = skill;
                         skillsList.appendChild(li);
                     });
                 } else {
                     skillsList.innerHTML = '<li>None Listed</li>';
                 }

                 let maxAssignedText = 'N/A';
                 if (data.maxAssigned !== undefined) {
                     let assignmentType = 'Stations'; // Default
                     if (data.role === 'Dealer') assignmentType = 'Customers';
                     if (data.role === 'Botanist') assignmentType = 'Pots'; // Assumption
                     maxAssignedText = `${data.maxAssigned} ${assignmentType}`;
                 }
                 document.getElementById('employee-max-assigned').textContent = maxAssignedText;

                 employeeInfoDiv.style.display = 'block';
             }
            break;
    }
}


function showError(message) {
    const nameElement = document.getElementById('npc-name');
    const errorElement = document.getElementById('loading-error');
    const detailsContent = document.getElementById('npc-details-content');

    if (nameElement) nameElement.textContent = 'Error';
    if (detailsContent) detailsContent.style.display = 'none'; // Hide details section
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    console.error(message);
}