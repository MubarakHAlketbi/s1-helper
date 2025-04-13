# Schedule 1 Helper

An unofficial fan-made website designed to assist players of the game **Schedule 1**. This project aims to provide a comprehensive resource including a database, calculators, guides, and tools to help players navigate the game's mechanics and optimize their strategies.

**Game Link:** [Schedule 1 on Steam](https://store.steampowered.com/app/1579860/Schedule_1/)

## Features

*   **Comprehensive Database:** Browse detailed information on:
    *   **Items:** Products (Marijuana, Meth, Cocaine, Mixes), Ingredients, Equipment (Stations, Tools, Pots, Storage), Packaging, Seeds, Clothing, Vehicles, and more.
    *   **Effects:** Details on mixing properties, including tier, addictiveness, value modifiers, and mix vectors.
    *   **NPCs:** Information on Customers (preferences, standards), Suppliers, Employees (roles, skills), Dealers, Police, and Story characters.
    *   **Locations:** Details about Regions, Properties, Stores, and Points of Interest (POIs).
    *   **Leveling:** Information on Ranks, Tiers, XP requirements, and associated Unlocks.
*   **Calculators:** Plan and optimize gameplay with calculators for:
    *   Mixing outcomes (effects, value, addictiveness - simplified model).
    *   Growing times and watering needs.
    *   Leveling progress and XP needed.
    *   Casino game payouts (Blackjack, RTB).
    *   Customer satisfaction estimates.
    *   Utility (Power/Water) cost estimations.
*   **Guides:** Learn the basics and advanced mechanics:
    *   Getting Started walkthrough (planned).
    *   Detailed explanations of Game Mechanics (Growing, Mixing, Economy, Law, Time, etc. - planned).
*   **Tools & Planners (Uses Local Storage):** Manage your operations with:
    *   **Customer Tracker:** Log customer details, relationship levels, preferences, and cooldowns.
    *   **Delivery Tracker:** Manually track incoming supplier deliveries, contents, and arrival times.
    *   **Financial Tracker:** Log cash/online transactions and update balances.
    *   **Grow Planner:** Track planted seeds, locations, pots, and estimated harvest/watering times.
*   **Interactive Map:** (Planned Feature) Visualize the game world and key locations.
*   **Search:** (Planned/Basic Implementation) Quickly find information within the database.

## Technology Stack

*   HTML5
*   CSS3
*   Vanilla JavaScript (ES Modules)
*   Data primarily stored in `database/game_data.js` and accessed client-side.
*   Tools & Planners utilize Browser `localStorage` for data persistence (data is **not** stored remotely and will be lost if browser data is cleared).

## Status

This project is currently under active development. Many sections are functional, while others (especially detailed guides and the interactive map) are planned or under construction. Data is based on available game information and community findings and may require updates as the game evolves.

## How to Use

1.  **(If Deployed):** Visit the live website URL (link TBD).
2.  **(Locally):** Clone or download the repository. Open the `index.html` file in your web browser. A modern browser supporting ES Modules is recommended.

## Contributing

Contributions, bug reports, or suggestions are welcome! (Add details here if you plan to host this on GitHub/GitLab, e.g., "Please open an issue or submit a pull request.")

## Disclaimer

This is an **unofficial fan-made project**. It is not affiliated with, endorsed, sponsored, or specifically approved by the developers of Schedule 1.

All game assets, names, and information referenced are the property of their respective owners.

Data presented on this site is based on game files and community findings and may become outdated or contain inaccuracies, especially after game updates. Use the information as a guideline.