// Placeholder for individual location detail loading logic
console.log("location_template.js loaded - Placeholder");

// TODO: Get location ID/type from URL query parameters (e.g., ?type=shop&id=hardware_store)
// TODO: Fetch specific location data from game_data.js/map_data.js based on ID/type
// TODO: Populate the location detail container in location_template.html with the fetched data
// Example structure (adjust as needed):
/*
import { LOCATIONS_DATA } from '../../game_data.js'; // Adjust path as needed
import { getQueryParam } from '../../utils/helpers.js'; // Helper to get URL params

document.addEventListener('DOMContentLoaded', () => {
    const locationId = getQueryParam('id');
    const locationType = getQueryParam('type'); // e.g., 'shop', 'property', 'poi'
    const container = document.getElementById('location-detail-container'); // Ensure this ID exists in the HTML

    if (!container) {
        console.error("Error: Location detail container not found!");
        return;
    }
     if (!locationId || !locationType) {
        container.innerHTML = '<p>No location ID or type specified in URL.</p>';
        return;
    }

    // Find the correct data source based on type
    let locationData = null;
    if (locationType === 'shop' && SHOPS_DATA && SHOPS_DATA[locationId]) {
         locationData = SHOPS_DATA[locationId];
    } else if (locationType === 'property' && PROPERTIES_DATA && PROPERTIES_DATA[locationId]) {
         locationData = PROPERTIES_DATA[locationId];
    } // Add more types (POI, etc.) as needed

    if (!locationData) {
        container.innerHTML = `<p>${locationType} with ID "${locationId}" not found.</p>`;
        return;
    }

    // Update title and breadcrumb dynamically
    document.title = `Schedule 1 Helper - ${locationData.name}`;
    const breadcrumbSpan = document.getElementById('breadcrumb-location-name');
    if (breadcrumbSpan) breadcrumbSpan.textContent = locationData.name;


    // Populate container based on location type
    let detailsHtml = `<h2>${locationData.name}</h2>`;
    detailsHtml += `<p><strong>Region:</strong> ${locationData.region || 'N/A'}</p>`;
    detailsHtml += `<p><strong>Type:</strong> ${locationType}</p>`;

    if (locationType === 'shop') {
        detailsHtml += `<p><strong>Vendor:</strong> ${locationData.vendor || 'N/A'}</p>`;
        detailsHtml += `<p><strong>Sells:</strong> ${locationData.inventoryType || 'N/A'}</p>`;
        detailsHtml += `<p><strong>Hours:</strong> ${locationData.hours || 'N/A'}</p>`;
    } else if (locationType === 'property') {
        detailsHtml += `<p><strong>Price:</strong> ${locationData.price !== undefined ? formatCurrency(locationData.price) : 'N/A'}</p>`;
        detailsHtml += `<p><strong>Employee Capacity:</strong> ${locationData.employeeCapacity || 'N/A'}</p>`;
        detailsHtml += `<p><strong>Loading Docks:</strong> ${locationData.loadingDocks || 'N/A'}</p>`;
    }
    // Add more details specific to POIs or other types

    container.innerHTML = detailsHtml;
});
*/