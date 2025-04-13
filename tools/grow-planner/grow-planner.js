import { BASE_GROW_TIMES, POT_DATA } from '../../database/game_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const growForm = document.getElementById('grow-form');
    const plantListDiv = document.getElementById('plant-list');
    const noPlantsMessage = document.getElementById('no-plants-message');
    const formTitle = document.getElementById('form-title');
    const plantIdInput = document.getElementById('plant-id');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const seedSelect = document.getElementById('seed-name');
    const potSelect = document.getElementById('pot-type');
    const sortSelect = document.getElementById('sort-plants');

    const STORAGE_KEY = 'schedule1_growPlannerData';
    const UPDATE_INTERVAL = 10000; // Update timers every 10 seconds
    let updateIntervalId;

    // Game data is imported from ../../database/game_data.js

    // --- Utility Functions ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        if (isNaN(date)) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
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

    const formatTimeDifference = (diffMillis) => {
        if (isNaN(diffMillis)) return "N/A";

        const isPast = diffMillis <= 0;
        const absDiff = Math.abs(diffMillis);

        const totalSeconds = Math.floor(absDiff / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 && days === 0) parts.push(`${minutes}m`); // Show minutes only if less than a day
        if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}s`); // Show seconds only if less than an hour

        if (parts.length === 0) {
            return isPast ? "Now" : "Soon";
        }

        return parts.join(' ');
    };


    // --- Local Storage Functions ---
    const loadPlants = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            const plants = data ? JSON.parse(data) : [];
            // Ensure timestamps are numbers
             return plants.map(p => ({
                ...p,
                plantTime: Number(p.plantTime) || null,
                estimatedHarvestTime: Number(p.estimatedHarvestTime) || null,
                lastWateredTime: Number(p.lastWateredTime) || null
            }));
        } catch (e) {
            console.error("Error parsing plant data from localStorage:", e);
            return [];
        }
    };

    const savePlants = (plants) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    };

    // --- Calculation Functions ---
    const calculatePlantData = (plantInput) => {
        const potInfo = POT_DATA[plantInput.potType] || POT_DATA["Plastic Pot"]; // Default to plastic pot if unknown
        const baseGrowMinutes = BASE_GROW_TIMES[plantInput.seedName] || 1440; // Default grow time

        const actualGrowMinutes = baseGrowMinutes / potInfo.growthMultiplier;
        const growMillis = actualGrowMinutes * 60 * 1000; // Convert game minutes to real milliseconds

        const estimatedHarvestTime = plantInput.plantTime + growMillis;

        // Calculate water need threshold
        const baseWaterIntervalMillis = (potInfo.waterIntervalMinutes || 1440) * 60 * 1000;
        const actualWaterIntervalMillis = baseWaterIntervalMillis / potInfo.drainMultiplier; // Faster drain = shorter interval

        return {
            ...plantInput,
            estimatedHarvestTime: estimatedHarvestTime,
            _actualWaterIntervalMillis: actualWaterIntervalMillis // Store calculated interval for checks
        };
    };

    const getWaterStatus = (plant) => {
        const now = Date.now();
        const timeSinceWatered = now - (plant.lastWateredTime || plant.plantTime); // Use plant time if never watered after planting
        const waterInterval = plant._actualWaterIntervalMillis;

        if (!waterInterval) return { text: "Unknown", className: "status-unknown" }; // Pot data missing

        const waterRatio = timeSinceWatered / waterInterval;

        if (waterRatio < 0.75) { // Less than 75% of interval passed
            return { text: "OK", className: "status-ok" };
        } else if (waterRatio < 1.0) { // Between 75% and 100%
             const timeLeftMillis = waterInterval - timeSinceWatered;
             return { text: `Needs Water Soon (${formatTimeDifference(timeLeftMillis)})`, className: "status-needs-water-soon" };
        } else { // Overdue
            return { text: "Needs Water NOW", className: "status-needs-water-now" };
        }
    };

     const getHarvestStatus = (plant) => {
         const now = Date.now();
         const harvestTime = plant.estimatedHarvestTime;
         if (!harvestTime) return { text: "Calculating...", className: "status-growing", isReady: false };

         if (now >= harvestTime) {
             return { text: "Ready to Harvest", className: "status-ready", isReady: true };
         } else {
             const timeLeftMillis = harvestTime - now;
             return { text: `Growing (${formatTimeDifference(timeLeftMillis)} left)`, className: "status-growing", isReady: false };
         }
     };


    // --- Sorting ---
     const sortPlants = (plants, sortBy) => {
        const now = Date.now();
        // Pre-calculate sort values
        plants.forEach(p => {
             p._sort_waterNeed = (p.lastWateredTime || p.plantTime) + (p._actualWaterIntervalMillis || Infinity);
             p._sort_harvestTime = p.estimatedHarvestTime || Infinity;
        });

        switch (sortBy) {
            case 'harvest_desc':
                return [...plants].sort((a, b) => b._sort_harvestTime - a._sort_harvestTime);
            case 'water_asc':
                 return [...plants].sort((a, b) => a._sort_waterNeed - b._sort_waterNeed);
            case 'location_asc':
                return [...plants].sort((a, b) => a.locationId.localeCompare(b.locationId));
             case 'seed_asc':
                return [...plants].sort((a, b) => a.seedName.localeCompare(b.seedName));
            case 'harvest_asc': // Default
            default:
                return [...plants].sort((a, b) => a._sort_harvestTime - b._sort_harvestTime);
        }
    };

    // --- Rendering Functions ---
    const renderPlantList = () => {
        plantListDiv.innerHTML = ''; // Clear existing list
        const plants = loadPlants();
        const sortBy = sortSelect.value;
        const sortedPlants = sortPlants(plants, sortBy);


        if (sortedPlants.length === 0) {
            noPlantsMessage.style.display = 'block';
            return;
        }

        noPlantsMessage.style.display = 'none';

        sortedPlants.forEach(plant => {
            const div = document.createElement('div');
            div.classList.add('plant-entry');
            div.dataset.id = plant.id;

            const waterStatus = getWaterStatus(plant);
            const harvestStatus = getHarvestStatus(plant);

            // Add overall status class for border
            if (harvestStatus.isReady) {
                div.classList.add('status-ready');
            } else if (waterStatus.className === 'status-needs-water-now') {
                 div.classList.add('status-needs-water-now');
            } else if (waterStatus.className === 'status-needs-water-soon') {
                 div.classList.add('status-needs-water-soon');
            }

            div.innerHTML = `
                <h4>
                    <span class="location-id">${plant.locationId}</span> -
                    <span class="seed-name">${plant.seedName} (${plant.potType})</span>
                </h4>
                <div class="plant-info">
                    <p><strong>Planted:</strong> ${formatDateTime(plant.plantTime)}</p>
                    <p><strong>Est. Harvest:</strong> ${formatDateTime(plant.estimatedHarvestTime)}</p>
                    <p class="status-harvest ${harvestStatus.className}"><strong>Harvest Status:</strong> <span class="status-text">${harvestStatus.text}</span></p>
                    <hr style="border-color: #eee; margin: 5px 0;">
                    <p><strong>Last Watered:</strong> ${formatDateTime(plant.lastWateredTime)}</p>
                    <p class="status-water ${waterStatus.className}"><strong>Water Status:</strong> <span class="status-text">${waterStatus.text}</span></p>
                    ${plant.notes ? `<p><strong>Notes:</strong> <span class="notes-display">${plant.notes}</span></p>` : ''}
                </div>
                <div class="plant-actions">
                    <button class="btn btn-water btn-small" data-id="${plant.id}">Water Now</button>
                    ${harvestStatus.isReady ? `<button class="btn btn-harvest btn-small" data-id="${plant.id}">Harvested (Remove)</button>` : ''}
                    <button class="btn btn-edit btn-small" data-id="${plant.id}">Edit</button>
                    <button class="btn btn-danger btn-small" data-id="${plant.id}">Delete</button>
                </div>
            `;
            plantListDiv.appendChild(div);
        });
    };

    // --- Form Handling ---
    const resetForm = () => {
        growForm.reset();
        plantIdInput.value = '';
        formTitle.textContent = 'Add New Plant';
        // Set default times
        document.getElementById('plant-time').value = formatDateTimeForInput(Date.now());
        document.getElementById('last-watered').value = formatDateTimeForInput(Date.now());
    };

    const populateEditForm = (id) => {
        const plants = loadPlants();
        const plant = plants.find(p => p.id === id);
        if (!plant) return;

        formTitle.textContent = `Edit Plant at ${plant.locationId}`;
        plantIdInput.value = plant.id;
        document.getElementById('seed-name').value = plant.seedName;
        document.getElementById('location-id').value = plant.locationId;
        document.getElementById('pot-type').value = plant.potType;
        document.getElementById('plant-time').value = formatDateTimeForInput(plant.plantTime);
        document.getElementById('last-watered').value = formatDateTimeForInput(plant.lastWateredTime);
        document.getElementById('notes').value = plant.notes;

        window.scrollTo({ top: growForm.offsetTop - 20, behavior: 'smooth' });
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const id = plantIdInput.value;
        const seedName = document.getElementById('seed-name').value;
        const locationId = document.getElementById('location-id').value.trim();
        const potType = document.getElementById('pot-type').value;
        const plantTimeString = document.getElementById('plant-time').value;
        const lastWateredString = document.getElementById('last-watered').value;
        const notes = document.getElementById('notes').value.trim();

        if (!seedName || !locationId || !potType || !plantTimeString || !lastWateredString) {
            alert('Please fill in Seed, Location, Pot Type, Plant Time, and Last Watered Time.');
            return;
        }

        let plantTime, lastWateredTime;
        try {
            plantTime = new Date(plantTimeString).getTime();
            lastWateredTime = new Date(lastWateredString).getTime();
            if (isNaN(plantTime) || isNaN(lastWateredTime)) throw new Error();
        } catch (e) {
            alert('Invalid Date/Time format provided.');
            return;
        }

        const plantInputData = {
            seedName,
            locationId,
            potType,
            plantTime,
            lastWateredTime,
            notes
        };

        // Calculate derived data (harvest time, water interval)
        const fullPlantData = calculatePlantData(plantInputData);

        let plants = loadPlants();

        if (id) { // Editing existing plant
            plants = plants.map(p => p.id === id ? { ...p, ...fullPlantData } : p);
        } else { // Adding new plant
            fullPlantData.id = generateId();
            plants.push(fullPlantData);
        }

        savePlants(plants);
        renderPlantList();
        resetForm();
    };

    // --- Dynamic Update Function ---
    const startUpdateTimer = () => {
        if (updateIntervalId) clearInterval(updateIntervalId);
        updateIntervalId = setInterval(renderPlantList, UPDATE_INTERVAL);
    };

    // --- Event Listeners ---
    growForm.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', resetForm);
    sortSelect.addEventListener('change', renderPlantList);

    // Event delegation for action buttons
    plantListDiv.addEventListener('click', (event) => {
        const target = event.target;
        const plantId = target.dataset.id;
        if (!plantId) return; // Clicked somewhere else

        let plants = loadPlants();
        let needsRender = false;

        if (target.classList.contains('btn-edit')) {
            populateEditForm(plantId);
        } else if (target.classList.contains('btn-water')) {
            plants = plants.map(p => p.id === plantId ? { ...p, lastWateredTime: Date.now() } : p);
            needsRender = true;
        } else if (target.classList.contains('btn-harvest')) {
             if (confirm(`Mark plant at "${plants.find(p=>p.id===plantId)?.locationId}" as harvested and remove it?`)) {
                plants = plants.filter(p => p.id !== plantId);
                needsRender = true;
                 // If the deleted plant was being edited, clear the form
                if (plantIdInput.value === plantId) {
                    resetForm();
                }
            }
        } else if (target.classList.contains('btn-danger')) {
            if (confirm(`Are you sure you want to permanently delete the plant entry at "${plants.find(p=>p.id===plantId)?.locationId}"?`)) {
                plants = plants.filter(p => p.id !== plantId);
                needsRender = true;
                 // If the deleted plant was being edited, clear the form
                if (plantIdInput.value === plantId) {
                    resetForm();
                }
            }
        }

        if (needsRender) {
            savePlants(plants);
            renderPlantList();
        }
    });

    // --- Initial Load ---
    // Populate Selects
    Object.keys(BASE_GROW_TIMES).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        seedSelect.appendChild(option);
    });
     Object.keys(POT_DATA).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        potSelect.appendChild(option);
    });

    resetForm(); // Set default times
    renderPlantList(); // Initial render
    startUpdateTimer(); // Start dynamic updates

}); // End DOMContentLoaded