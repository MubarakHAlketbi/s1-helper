// Placeholder for property data loading logic
console.log("properties.js loaded - Placeholder");

// TODO: Fetch property data (buyable locations) from game_data.js or an API endpoint
// TODO: Populate the property list container (needs an ID in the HTML) with property cards/entries
//       using a structure similar to other database pages.
// TODO: Potentially use property_template.html for rendering individual property details if needed.
// Example structure (adjust as needed):
/*
import { PROPERTIES_DATA } from '../../game_data.js'; // Adjust path as needed
import { formatCurrency } from '../../utils/helpers.js'; // Adjust path

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('property-list-container'); // Ensure this ID exists in the HTML
    if (!container) {
        console.error("Error: Property list container not found!");
        return;
    }
    container.innerHTML = ''; // Clear loading message

    if (!PROPERTIES_DATA || Object.keys(PROPERTIES_DATA).length === 0) {
        container.innerHTML = '<p>No property data found.</p>';
        return;
    }

    // Sort properties, perhaps by region then price or name
    const sortedPropertyEntries = Object.entries(PROPERTIES_DATA)
        .sort(([, a], [, b]) => {
            if (a.region !== b.region) {
                return (a.region || '').localeCompare(b.region || '');
            }
            return a.price - b.price; // Example: sort by price after region
        });

    sortedPropertyEntries.forEach(([id, property]) => {
        const card = document.createElement('div');
        card.classList.add('database-item-card', 'card'); // Use appropriate classes
        // Link might go to a map location or a detail page using property_template.html
        const detailLink = `/database/locations/properties/property_template.html?id=${id}`;

        card.innerHTML = `
            <h3><a href="${detailLink}">${property.name}</a></h3>
            <div class="item-details">
                <p><strong>Region:</strong> ${property.region || 'N/A'}</p>
                <p><strong>Type:</strong> ${property.type || 'N/A'}</p> // e.g., Motel Room, Bungalow, Business
                <p><strong>Price:</strong> ${property.price !== undefined ? formatCurrency(property.price) : 'N/A'}</p>
                <p><strong>Employee Capacity:</strong> ${property.employeeCapacity || 'N/A'}</p>
                <p><strong>Loading Docks:</strong> ${property.loadingDocks || 'N/A'}</p>
            </div>
            <a href="${detailLink}" class="btn btn-secondary btn-small">View Details</a>
        `;
        container.appendChild(card);
    });
});
*/