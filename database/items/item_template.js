import {
    BASE_PRODUCTS,
    INGREDIENTS,
    EQUIPMENT_DATA,
    PACKAGING_DATA,
    OTHER_ITEMS_DATA,
    EFFECTS_DATA
} from '../game_data.js';
import { formatCurrency } from '../../utils/helpers.js'; // Assuming formatCurrency is moved/available in helpers

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const itemType = params.get('type');
    const itemId = params.get('id');

    const nameElement = document.getElementById('item-name');
    const categoryElement = document.getElementById('item-category');
    const descriptionElement = document.getElementById('item-description');
    const costElement = document.getElementById('item-cost');
    const unlockElement = document.getElementById('item-unlock');
    const errorElement = document.getElementById('loading-error');
    const breadcrumbContainer = document.getElementById('breadcrumb-container');

    if (!itemId || !itemType) {
        showError("Item type or ID missing from URL.");
        return;
    }

    let itemData = null;
    let categoryName = 'Unknown';
    let categoryLink = '/database/items/'; // Default link

    // Find the item data based on type
    switch (itemType) {
        case 'product':
            itemData = BASE_PRODUCTS[itemId];
            categoryName = 'Products';
            categoryLink = '/database/items/products/';
            break;
        case 'ingredient':
            itemData = INGREDIENTS[itemId];
            categoryName = 'Ingredients';
            categoryLink = '/database/items/ingredients/';
            break;
        case 'equipment':
            itemData = EQUIPMENT_DATA[itemId];
            categoryName = 'Equipment';
            categoryLink = '/database/items/equipment/';
            break;
        case 'packaging':
            itemData = PACKAGING_DATA[itemId];
            categoryName = 'Packaging';
            categoryLink = '/database/items/packaging/';
            break;
        case 'other':
            itemData = OTHER_ITEMS_DATA[itemId];
            categoryName = 'Other Items';
            categoryLink = '/database/items/other/';
            break;
        default:
            showError(`Unknown item type: ${itemType}`);
            return;
    }

    if (!itemData) {
        showError(`Item with ID "${itemId}" of type "${itemType}" not found.`);
        return;
    }

    // --- Populate Common Fields ---
    document.title = `${itemData.name || 'Item'} Details - Schedule 1 Helper`; // Set page title
    nameElement.textContent = itemData.name || 'Unknown Item';
    descriptionElement.textContent = itemData.description || 'No description available.';
    costElement.textContent = itemData.cost !== undefined ? formatCurrency(itemData.cost) : 'N/A';
    unlockElement.textContent = itemData.unlockRankTier || 'N/A';
    categoryElement.textContent = itemData.category || categoryName; // Use item's category if available, else use type name

    // --- Populate Breadcrumbs ---
    if (breadcrumbContainer) {
        const ol = breadcrumbContainer.querySelector('ol');
        if (ol) {
            const categoryLi = document.createElement('li');
            categoryLi.innerHTML = `<a href="${categoryLink}">${categoryName}</a>`;
            ol.appendChild(categoryLi);

            const itemLi = document.createElement('li');
            itemLi.setAttribute('aria-current', 'page');
            itemLi.textContent = itemData.name || 'Item';
            ol.appendChild(itemLi);
        }
    }


    // --- Populate Type-Specific Fields ---
    populateTypeSpecificInfo(itemType, itemData);

});

function populateTypeSpecificInfo(type, data) {
    // Hide all specific info sections first
    document.querySelectorAll('.type-specific-info').forEach(el => el.style.display = 'none');

    switch (type) {
        case 'product':
            const productInfoDiv = document.getElementById('product-info');
            if (productInfoDiv) {
                document.getElementById('product-type').textContent = data.type || 'N/A';
                document.getElementById('product-value').textContent = data.baseMarketValue !== undefined ? formatCurrency(data.baseMarketValue) : 'N/A';
                document.getElementById('product-addictiveness').textContent = data.baseAddictiveness !== undefined ? `${(data.baseAddictiveness * 100).toFixed(1)}%` : 'N/A';

                const propertiesList = document.getElementById('product-properties');
                propertiesList.innerHTML = ''; // Clear default
                if (data.properties && data.properties.length > 0) {
                    data.properties.forEach(guid => {
                        const effect = EFFECTS_DATA[guid];
                        const li = document.createElement('li');
                        // TODO: Link effect name to effect detail page later
                        li.textContent = effect ? `${effect.name} (Tier ${effect.tier})` : `Unknown Effect (${guid.substring(0, 8)}...)`;
                        propertiesList.appendChild(li);
                    });
                } else {
                    propertiesList.innerHTML = '<li>None</li>';
                }
                productInfoDiv.style.display = 'block';
            }
            break;

        case 'ingredient':
            const ingredientInfoDiv = document.getElementById('ingredient-info');
            if (ingredientInfoDiv) {
                let effectText = 'Crafting Only / None';
                if (data.propertyGuid) {
                    const effect = EFFECTS_DATA[data.propertyGuid];
                    effectText = effect ? `${effect.name} (Tier ${effect.tier})` : `Unknown Effect (${data.propertyGuid.substring(0, 8)}...)`;
                }
                document.getElementById('ingredient-effect').textContent = effectText;
                ingredientInfoDiv.style.display = 'block';
            }
            break;

        case 'equipment':
             const equipmentInfoDiv = document.getElementById('equipment-info');
             if (equipmentInfoDiv) {
                 document.getElementById('equipment-power').textContent = data.power !== undefined ? `${data.power} kWh/game hr` : 'N/A';
                 document.getElementById('equipment-water').textContent = data.water !== undefined ? `${data.water} L/game day` : 'N/A';
                 document.getElementById('equipment-growth').textContent = data.growthMultiplier !== undefined ? `x${data.growthMultiplier.toFixed(2)}` : 'N/A (Not a Pot)';
                 equipmentInfoDiv.style.display = 'block';
             }
            break;

        case 'packaging':
             const packagingInfoDiv = document.getElementById('packaging-info');
             if (packagingInfoDiv) {
                 document.getElementById('packaging-capacity').textContent = data.capacity !== undefined ? `${data.capacity} unit(s)` : 'N/A';
                 packagingInfoDiv.style.display = 'block';
             }
            break;

        case 'other':
             const otherInfoDiv = document.getElementById('other-item-info');
             if (otherInfoDiv) {
                 // Add specific fields here if needed for 'other' items
                 otherInfoDiv.style.display = 'block';
             }
            break;
    }
}


function showError(message) {
    const nameElement = document.getElementById('item-name');
    const errorElement = document.getElementById('loading-error');
    const detailsContent = document.getElementById('item-details-content');

    if (nameElement) nameElement.textContent = 'Error';
    if (detailsContent) detailsContent.style.display = 'none'; // Hide details section
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    console.error(message);
}