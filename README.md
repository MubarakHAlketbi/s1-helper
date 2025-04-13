# Schedule 1 Helper 🎮

**Your comprehensive companion website for the game [Schedule 1 on Steam](https://store.steampowered.com/app/1579860/Schedule_1/).**

This unofficial fan-made project provides a collection of resources, calculators, and tools designed to assist players in navigating the complexities of Schedule 1, optimizing their operations, and maximizing their in-game success.

**(Link to Live Site - Placeholder)**: `[https://your-schedule1-helper-url.com]` (Update when deployed)

---

## ✨ Features

This helper website aims to include:

*   **📚 Comprehensive Database:** Browse detailed, searchable information on core game elements:
    *   **Items:** Products (Marijuana strains, Meth variants, Cocaine), Ingredients & Additives, Equipment (Stations, Tools, Pots, Storage), Packaging, Seeds, Clothing, Vehicles, and other miscellaneous items.
    *   **Effects (Properties):** In-depth details on product effects, including tier, addictiveness, value modifiers, and the underlying mix vectors used in calculations.
    *   **NPCs:** Profiles for Customers (preferences, quality standards, affinities), Suppliers (inventory, contact methods), Employees (roles, skills, costs), Dealers (cut, capacity), Police mechanics, and key Story characters.
    *   **Locations:** Information on map Regions, purchasable Properties (bases, businesses), Stores, and Points of Interest (POIs).
    *   **Game Systems:** Data on Leveling (Ranks, Tiers, XP, Unlocks), Law Enforcement (Intensity, Curfew, Fines), Time progression, Economy rules, etc.

*   **🧮 Calculators:** Tools to plan and optimize gameplay:
    *   **Mixing Calculator:** Estimate outcomes (effects, value, addictiveness) of mixing products with ingredients (*Note: Uses a simplified additive model; the game's Mixer Map system is more complex*).
    *   **Growing Calculator:** Calculate plant grow times, harvest dates, and watering schedules based on seed and pot types.
    *   **Leveling & Rank Calculator:** Determine current rank/tier from XP, calculate XP needed for next level, and view associated unlocks.
    *   **Casino Calculators:** Check Blackjack payouts and potential Ride the Bus (RTB) winnings.
    *   **Customer Satisfaction Calculator:** Estimate deal satisfaction and relationship changes based on product, quality, price, and effects.
    *   **Utility Cost Calculator:** Estimate daily/weekly power and water costs based on equipment usage.

*   **📖 Guides (Planned/In Progress):**
    *   **Getting Started:** Step-by-step walkthrough for new players.
    *   **Game Mechanics:** Deep dives into Growing, Mixing, Economy, Law & Police, Employees, Deliveries, Combat, Time, etc.
    *   **Strategies:** Tips for optimization and profit maximization.

*   **📝 Tools & Planners (Uses Local Storage):** Manage your in-game operations:
    *   **Customer Tracker:** Log customer details, relationship levels, preferences, addiction, and deal cooldowns.
    *   **Delivery Tracker:** Manually track incoming supplier deliveries, contents, and estimated arrival times.
    *   **Financial Tracker:** Log cash/online transactions, manually update balances, and view transaction history.
    *   **Grow Planner:** Track individual plants, locations, pots, estimated harvest times, and watering needs.
    *   *(**Important:** Tool data is stored ONLY in your browser's `localStorage`. Clearing browser data will erase your tracked information.)*

*   **🗺️ Interactive Map (Planned):** Visualize the game world, key locations, POIs, and potentially track dynamic events.

*   **🔍 Search (Basic):** Basic search functionality across the database (implementation ongoing).

---

## 💻 Technology Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
*   **Data:** Game information is primarily extracted from game files and stored statically within the project (e.g., `database/game_data.js`). Accessed client-side.
*   **Persistence:** Tools & Planners use the browser's `localStorage` API for data storage. No server-side database is used for user data.
*   **Deployment:** (Specify if planned, e.g., GitHub Pages, Netlify, Vercel)

*Rationale for Vanilla JS: Chosen for simplicity, performance, and ease of deployment without requiring complex build steps or frameworks.*

---

## 🚀 Project Status

This project is **under active development**.

*   **Functional:** Core database structure, data loading for many categories (Items, Effects, NPCs, Leveling), all Calculators, and the local storage-based Tools & Planners.
*   **In Progress:** Populating all database sections with complete data, refining calculator accuracy, implementing item/NPC detail template pages.
*   **Planned:** Detailed Guides section, Interactive Map integration, advanced Search functionality, potentially more tools.

Data accuracy depends on the game version the information was extracted from. Updates will be made as new information becomes available or the game changes.

---

## 🛠️ How to Use

**Online (Recommended):**

1.  Visit the live website: `[Link TBD]`

**Locally:**

1.  Clone or download this repository.
2.  Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, Safari) that supports ES Modules. No web server is strictly required for basic browsing and calculator use due to the client-side nature.

---

## 🤝 Contributing

Contributions are welcome! If you find bugs, have suggestions for improvements, want to contribute data, or add new features:

1.  **Issues:** Please check the existing issues or open a new one to discuss your idea or report a problem.
2.  **Pull Requests:** Fork the repository, create a new branch for your feature or fix, make your changes, and submit a pull request. Please ensure your code follows the existing style and structure.

---

## 📜 License

(Consider adding a license, e.g., MIT License)
Example: `This project is licensed under the MIT License - see the LICENSE.md file for details.`

---

## ⚠️ Disclaimer

This is an **unofficial fan-made project** created for educational and informational purposes. It is not affiliated with, endorsed, sponsored, or specifically approved by the developers or publishers of Schedule 1.

All game assets, names, trademarks, and other copyrighted information referenced belong to their respective owners.

The data presented on this site is based on analysis of game files and community contributions. While efforts are made to ensure accuracy, information may become outdated or contain errors, especially following game updates. Use this website as a helpful guideline, not as an absolute source of truth. The creators of this helper site are not responsible for any actions taken based on the information provided.