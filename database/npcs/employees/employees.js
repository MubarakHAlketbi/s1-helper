import { EMPLOYEE_DATA } from '../../game_data.js'; // Adjust path as necessary
import { formatCurrency } from '../../utils/helpers.js'; // Import shared helper

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('employee-list-container');
    if (!container) {
        console.error("Error: Employee list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!EMPLOYEE_DATA || Object.keys(EMPLOYEE_DATA).length === 0) {
        container.innerHTML = '<p>No employee data found in game_data.js.</p>';
        return;
    }

    // Sort employees alphabetically by name/role
    const sortedEmployeeEntries = Object.entries(EMPLOYEE_DATA)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    sortedEmployeeEntries.forEach(([id, employee]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Add base card class

        // TODO: Update this link when the NPC template page/logic is created
        const detailLink = `/database/npcs/npc_template.html?type=employee&id=${id}`;

        let skillsHtml = '<ul>';
        if (employee.skills && employee.skills.length > 0) {
             employee.skills.forEach(skill => {
                 skillsHtml += `<li>${skill}</li>`;
             });
        } else {
            skillsHtml += '<li>N/A</li>';
        }
        skillsHtml += '</ul>';

        let maxAssignedInfo = '';
        if (employee.maxAssigned !== undefined) {
            let assignmentType = 'Stations'; // Default
            if (employee.role === 'Dealer') assignmentType = 'Customers';
            if (employee.role === 'Botanist') assignmentType = 'Pots'; // Assumption
            maxAssignedInfo = `<p><strong>Max Assigned:</strong> ${employee.maxAssigned} ${assignmentType}</p>`;
        }


        card.innerHTML = `
            <h3><a href="${detailLink}">${employee.name}</a></h3>
            <div class="item-details">
                <p><strong>Role:</strong> ${employee.role || 'N/A'}</p>
                <p><strong>Cost:</strong> ${employee.cost !== undefined ? formatCurrency(employee.cost) : 'N/A'} (Placeholder)</p>
                <div><strong>Skills:</strong> ${skillsHtml}</div>
                ${maxAssignedInfo}
                <p><strong>Notes:</strong> ${employee.notes || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});

// formatCurrency is now imported from utils/helpers.js