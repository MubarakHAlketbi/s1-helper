// Centralized Game Data for Schedule 1 Helper

// --- Growing Data ---

// Base grow times in GAME MINUTES (1 real second = 1 game minute default)
export const BASE_GROW_TIMES = {
    "Coca Seed": 2880, // ~48 real mins
    "Granddaddy Purple Seed": 1600, // ~26.7 real mins
    "Green Crack Seed": 1380, // ~23 real mins
    "OG Kush Seed": 1440, // ~24 real mins
    "Sour Diesel Seed": 1500, // ~25 real mins
    // Add more from seeds.md if available
    "Test Weed Seed": 1440 // Placeholder if needed
};

// Pot modifiers and watering intervals
// waterIntervalMinutes: Base GAME MINUTES before needing water (assuming standard soil baseline)
// drainMultiplier: How much faster/slower water drains (1.0 = normal)
// growthMultiplier: How much faster/slower plants grow (1.0 = normal)
export const POT_DATA = {
    "Plastic Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.0 }, // Baseline
    "Air Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.3, growthMultiplier: 1.15 }, // Drains 30% faster, grows 15% faster
    "Moisture-Preserving Pot": { waterIntervalMinutes: 1440, drainMultiplier: 0.6, growthMultiplier: 1.0 }, // Drains 40% slower
    "Grow Tent": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.20 }, // Grows 20% faster (Example value, adjust if known)
    // Add other pots if necessary
};

// Conversion factor
export const GAME_MINUTE_TO_REAL_MS = 1000; // 1 game minute = 1 real second = 1000 ms


// --- Leveling Data ---
export const TIERS_PER_RANK = 5;
export const MAX_RANK_INDEX = 10; // Rank 0 to 10
export const XP_PER_TIER_MIN = 200;
export const XP_PER_TIER_MAX = 2500;

export const RANKS = [
    { index: 0, name: "Street Rat" },
    { index: 1, name: "Hoodlum" },
    { index: 2, name: "Peddler" },
    { index: 3, name: "Hustler" },
    { index: 4, name: "Bagman" },
    { index: 5, name: "Enforcer" },
    { index: 6, name: "Shot Caller" },
    { index: 7, name: "Block Boss" },
    { index: 8, name: "Underlord" },
    { index: 9, name: "Baron" },
    { index: 10, name: "Kingpin" }
];

// Simplified Unlock Data (Expand with actual game data)
// Key: "RankIndex-Tier"
export const UNLOCKS = {
    "0-0": [], // Starting
    "0-3": ["Jar Packaging"],
    "0-4": ["Long-Life Soil", "Fertilizer", "Plastic Pot", "Moisture-Preserving Pot", "Sour Diesel Seed"],
    "0-5": ["Electric Plant Trimmers", "Pot Sprinkler", "Big Sprinkler"],
    "1-1": ["Mixing Station", "Westville Region Access"], // Combined region unlock
    "1-2": ["Soil Pourer", "Green Crack Seed"],
    "1-3": ["Extra Long-Life Soil"],
    "1-4": ["Granddaddy Purple Seed"],
    "1-5": ["Packaging Station Mk II"],
    "2-1": ["Downtown Region Access"],
    "2-2": ["Mixing Station Mk2"],
    "2-3": ["Air Pot"],
    "3-1": ["Docks Region Access"],
    "3-3": ["Drying Rack", "Pseudo"], // Example from stations/ingredients
    "4-1": ["Suburbia Region Access"],
    "4-5": ["Brick Press", "High-Quality Pseudo"], // Example
    "5-1": ["Cauldron", "Uptown Region Access"], // Example & Region
    "6-1": ["Northtown Region Access"] // Assuming Northtown is last?
    // Add many more based on your item/station data...
};


// --- Mixing Data ---

// Base Product Data (id -> { name, type, baseMarketValue, baseAddictiveness, properties: [effectGuid1, ...] })
export const BASE_PRODUCTS = {
    "ogkush": { name: "OG Kush", type: "Marijuana", baseMarketValue: 38, baseAddictiveness: 0, properties: ["ff88fffc965badc409a4b46d2652a178"] },
    "sourdiesel": { name: "Sour Diesel", type: "Marijuana", baseMarketValue: 40, baseAddictiveness: 0, properties: ["1f669aa2a1321f24db07f43770fc20c9"] },
    "greencrack": { name: "Green Crack", type: "Marijuana", baseMarketValue: 43, baseAddictiveness: 0, properties: ["8301163bca693374fbca43f5ae493605"] },
    "granddaddypurple": { name: "Granddaddy Purple", type: "Marijuana", baseMarketValue: 44, baseAddictiveness: 0, properties: ["cee302b478ed60441a0bd7023ad82e5c"] },
    "cocaine": { name: "Cocaine", type: "Cocaine", baseMarketValue: 150, baseAddictiveness: 0.4, properties: [] },
    "meth": { name: "Meth", type: "Methamphetamine", baseMarketValue: 70, baseAddictiveness: 0.6, properties: [] },
    "babyblue": { name: "Baby Blue", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
    "bikercrank": { name: "Biker Crank", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
    "glass": { name: "Glass", type: "Methamphetamine", baseMarketValue: 1, baseAddictiveness: 0, properties: [] }, // Value likely comes from added effects
    // Add more base products if needed
};

// Ingredient Data (id -> { name, propertyGuid })
export const INGREDIENTS = {
    "addy": { name: "Addy", propertyGuid: "dab9f348050ec7b4fbac698f3b32dd4e" }, // Thought-Provoking
    "banana": { name: "Banana", propertyGuid: "255ee6603a48b8f4ea0ad5b33d73afb6" }, // Gingeritis
    "battery": { name: "Battery", propertyGuid: "9a1c55c8870b7134b8d14216dbf38977" }, // Bright-Eyed
    "chili": { name: "Chili", propertyGuid: "45255276d6b7e92409f1aeff18e7e5bd" }, // Spicy
    "cuke": { name: "Cuke", propertyGuid: "8301163bca693374fbca43f5ae493605" }, // Energizing
    "donut": { name: "Donut", propertyGuid: "12826c936a1eac2408fcae55dfd02ad2" }, // Calorie-Dense
    "energydrink": { name: "Energy Drink", propertyGuid: "bc28a333fd5cf2048a8111c0c6178044" }, // Athletic
    "flumedicine": { name: "Flu Medicine", propertyGuid: "cee302b478ed60441a0bd7023ad82e5c" }, // Sedating
    "gasoline": { name: "Gasoline", propertyGuid: "b34cc41265d8697478143dc30916100b" }, // Toxic
    "horsesemen": { name: "Horse Semen", propertyGuid: "0dce587811d674b4eb7c0fe0891f004d" }, // Long faced
    "iodine": { name: "Iodine", propertyGuid: "cbc01bf3304d3654fbb3b38b49f443ba" }, // Jennerising
    "megabean": { name: "Mega Bean", propertyGuid: "f4e8b2e3804dd174b8ef45a125d4620a" }, // Foggy
    "motoroil": { name: "Motor Oil", propertyGuid: "09cc6fed996998f40b9411f43cfa8146" }, // Slippery
    "mouthwash": { name: "Mouth Wash", propertyGuid: "8a18aa6111557e246823661b9136e1ab" }, // Balding
    "paracetamol": { name: "Paracetamol", propertyGuid: "51a993ea0c0d04440b1d8edefcd528e4" }, // Sneaky
    "viagra": { name: "Viagra", propertyGuid: "6b16a3f1922a5974bb14367c8c2aff04" }, // Tropic Thunder
    // Add Acid, Phosphorus, Pseudos if they add effects (unlikely)
};

// Effects Data (GUID -> { name, tier, addictiveness, valueMod }) // Also used by satisfaction calc
export const EFFECTS_DATA = {
    "ff88fffc965badc409a4b46d2652a178": { name: "Calming", tier: 1, addictiveness: 0, valueMod: 0.1 },
    "1f669aa2a1321f24db07f43770fc20c9": { name: "Refreshing", tier: 1, addictiveness: 0.104, valueMod: 0.14 },
    "8301163bca693374fbca43f5ae493605": { name: "Energizing", tier: 2, addictiveness: 0.34, valueMod: 0.22 },
    "cee302b478ed60441a0bd7023ad82e5c": { name: "Sedating", tier: 2, addictiveness: 0, valueMod: 0.26 },
    "dab9f348050ec7b4fbac698f3b32dd4e": { name: "Thought-Provoking", tier: 4, addictiveness: 0.37, valueMod: 0.44 },
    "255ee6603a48b8f4ea0ad5b33d73afb6": { name: "Gingeritis", tier: 2, addictiveness: 0, valueMod: 0.2 },
    "9a1c55c8870b7134b8d14216dbf38977": { name: "Bright-Eyed", tier: 4, addictiveness: 0.2, valueMod: 0.4 },
    "45255276d6b7e92409f1aeff18e7e5bd": { name: "Spicy", tier: 3, addictiveness: 0.665, valueMod: 0.38 },
    "12826c936a1eac2408fcae55dfd02ad2": { name: "Calorie-Dense", tier: 2, addictiveness: 0.1, valueMod: 0.28 },
    "bc28a333fd5cf2048a8111c0c6178044": { name: "Athletic", tier: 3, addictiveness: 0.607, valueMod: 0.32 },
    "b34cc41265d8697478143dc30916100b": { name: "Toxic", tier: 2, addictiveness: 0, valueMod: 0 }, // Negative
    "0dce587811d674b4eb7c0fe0891f004d": { name: "Long faced", tier: 5, addictiveness: 0.607, valueMod: 0.52 },
    "cbc01bf3304d3654fbb3b38b49f443ba": { name: "Jennerising", tier: 4, addictiveness: 0.343, valueMod: 0.42 },
    "f4e8b2e3804dd174b8ef45a125d4620a": { name: "Foggy", tier: 3, addictiveness: 0.1, valueMod: 0.36 },
    "09cc6fed996998f40b9411f43cfa8146": { name: "Slippery", tier: 3, addictiveness: 0.309, valueMod: 0.34 },
    "8a18aa6111557e246823661b9136e1ab": { name: "Balding", tier: 3, addictiveness: 0, valueMod: 0.3 },
    "51a993ea0c0d04440b1d8edefcd528e4": { name: "Sneaky", tier: 2, addictiveness: 0.327, valueMod: 0.24 },
    "6b16a3f1922a5974bb14367c8c2aff04": { name: "Tropic Thunder", tier: 4, addictiveness: 0.803, valueMod: 0.46 },
    // Add ALL effects from properties.md here
    "3f4f290ea8487134498e81b12e62caa7": { name: "Euphoric", tier: 1, addictiveness: 0.235, valueMod: 0.18 },
    "64dfda7c41360f545b54e42c1fef28e9": { name: "Focused", tier: 1, addictiveness: 0.104, valueMod: 0.16 },
    "10e411647a7578940bc89f097a6653bb": { name: "Munchies", tier: 1, addictiveness: 0.096, valueMod: 0.12 },
    "49438371dd4ec884faffec14e0d82c1d": { name: "Paranoia", tier: 1, addictiveness: 0, valueMod: 0 },
    "3280aaf123fdf3349b86dc4565b34b60": { name: "Smelly", tier: 1, addictiveness: 0, valueMod: 0 },
    "f97424863d141dd44a2d886552a9ffed": { name: "Disorienting", tier: 2, addictiveness: 0, valueMod: 0 },
    "84e743d1a3e8e864ea09facbe5736d80": { name: "Laxative", tier: 3, addictiveness: 0.1, valueMod: 0 },
    "c9f624e2d8653c24ea25a8bd095a39cb": { name: "Seizure-Inducing", tier: 3, addictiveness: 0, valueMod: 0 },
    "ed5319276a4cfeb4281aae5984b5d04e": { name: "Glowing", tier: 4, addictiveness: 0.472, valueMod: 0.48 },
    "be6ef3c6460adac459cb7b6f45e4e75f": { name: "Lethal", tier: 4, addictiveness: 0, valueMod: 0 },
    "5a7b3fa762f157a4abd69fbb4b292ea2": { name: "Schizophrenic", tier: 4, addictiveness: 0, valueMod: 0 },
    "40784621a2e5fbe4cbc4248de7983706": { name: "Anti-gravity", tier: 5, addictiveness: 0.611, valueMod: 0.54 },
    "65db5bdb2fe479443bee064eeab25866": { name: "Cyclopean", tier: 5, addictiveness: 0.1, valueMod: 0.56 },
    "8d4588c64b65e0b46b2efcae062176a3": { name: "Electrifying", tier: 5, addictiveness: 0.235, valueMod: 0.5 },
    "8855d004355ec0d4db89224a65f18b27": { name: "Explosive", tier: 5, addictiveness: 0, valueMod: 0 },
    "c45539561ef11a746bfb77b48ae01268": { name: "Shrinking", tier: 5, addictiveness: 0.336, valueMod: 0.6 },
    "b8e941ae03ded1b45b9cc184df468bba": { name: "Zombifying", tier: 5, addictiveness: 0.598, valueMod: 0.58 },
};


// --- Satisfaction Data ---
// Customer Data (id -> { name, standard (0-4), affinity: { Type: score (-1 to 1) }, prefs: [effectGuid1, ...] }) // Also used by customer tracker tool
export const CUSTOMER_DATA = {
    "beth": { name: "Beth", standard: 1, affinity: { Marijuana: 0.30, Methamphetamine: 0.31, Cocaine: -0.20 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044"] }, // Slippery, Lethal, Athletic
    "billy": { name: "Billy", standard: 2, affinity: { Marijuana: 0.09, Methamphetamine: -0.63, Cocaine: 0.57 }, prefs: ["c45539561ef11a746bfb77b48ae01268", "09cc6fed996998f40b9411f43cfa8146", "b8e941ae03ded1b45b9cc184df468bba"] }, // Shrinking, Slippery, Zombifying
    "carl": { name: "Carl", standard: 3, affinity: { Marijuana: -0.81, Methamphetamine: -0.23, Cocaine: -0.58 }, prefs: ["8d4588c64b65e0b46b2efcae062176a3", "b34cc41265d8697478143dc30916100b", "8301163bca693374fbca43f5ae493605"] }, // Electrifying, Toxic, Energizing
    "chloe": { name: "Chloe", standard: 1, affinity: { Marijuana: 0.44, Methamphetamine: 0.79, Cocaine: 0.25 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "be6ef3c6460adac459cb7b6f45e4e75f", "10e411647a7578940bc89f097a6653bb"] }, // Euphoric, Lethal, Munchies
    "chris": { name: "Chris", standard: 3, affinity: { Marijuana: -0.83, Methamphetamine: 0.40, Cocaine: 0.79 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "3f4f290ea8487134498e81b12e62caa7", "b8e941ae03ded1b45b9cc184df468bba"] }, // Spicy, Euphoric, Zombifying
    "dennis": { name: "Dennis", standard: 3, affinity: { Marijuana: 0.26, Methamphetamine: 0.08, Cocaine: -0.89 }, prefs: ["b34cc41265d8697478143dc30916100b", "1f669aa2a1321f24db07f43770fc20c9", "8d4588c64b65e0b46b2efcae062176a3"] }, // Toxic, Refreshing, Electrifying
    "donna": { name: "Donna", standard: 1, affinity: { Marijuana: 0.93, Methamphetamine: -0.27, Cocaine: 0.25 }, prefs: ["8301163bca693374fbca43f5ae493605", "be6ef3c6460adac459cb7b6f45e4e75f", "10e411647a7578940bc89f097a6653bb"] }, // Energizing, Lethal, Munchies
    "doris": { name: "Doris", standard: 1, affinity: { Marijuana: 0.46, Methamphetamine: 0.16, Cocaine: 0.58 }, prefs: ["c45539561ef11a746bfb77b48ae01268", "6b16a3f1922a5974bb14367c8c2aff04", "40784621a2e5fbe4cbc4248de7983706"] }, // Shrinking, Tropic Thunder, Anti-gravity
    "elizabeth": { name: "Elizabeth", standard: 2, affinity: { Marijuana: 0.33, Methamphetamine: 0.45, Cocaine: 0.32 }, prefs: ["64dfda7c41360f545b54e42c1fef28e9", "6b16a3f1922a5974bb14367c8c2aff04", "255ee6603a48b8f4ea0ad5b33d73afb6"] }, // Focused, Tropic Thunder, Gingeritis
    "eugene": { name: "Eugene", standard: 2, affinity: { Marijuana: 0.66, Methamphetamine: 0.11, Cocaine: 0.17 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "255ee6603a48b8f4ea0ad5b33d73afb6", "ff88fffc965badc409a4b46d2652a178"] }, // Slippery, Gingeritis, Calming
    "fiona": { name: "Fiona", standard: 3, affinity: { Marijuana: 0.03, Methamphetamine: 0.08, Cocaine: -0.50 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8a18aa6111557e246823661b9136e1ab", "6b16a3f1922a5974bb14367c8c2aff04"] }, // Lethal, Balding, Tropic Thunder
    "genghis": { name: "Genghis", standard: 0, affinity: { Marijuana: 0.85, Methamphetamine: -0.64, Cocaine: 0.45 }, prefs: ["b8e941ae03ded1b45b9cc184df468bba", "51a993ea0c0d04440b1d8edefcd528e4", "b34cc41265d8697478143dc30916100b"] }, // Zombifying, Sneaky, Toxic
    "greg": { name: "Greg", standard: 0, affinity: { Marijuana: 0.58, Methamphetamine: -0.58, Cocaine: -0.35 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "6b16a3f1922a5974bb14367c8c2aff04", "255ee6603a48b8f4ea0ad5b33d73afb6"] }, // Euphoric, Tropic Thunder, Gingeritis
    "harold": { name: "Harold", standard: 3, affinity: { Marijuana: -0.95, Methamphetamine: -0.78, Cocaine: -0.70 }, prefs: ["bc28a333fd5cf2048a8111c0c6178044", "c45539561ef11a746bfb77b48ae01268", "84e743d1a3e8e864ea09facbe5736d80"] }, // Athletic, Shrinking, Laxative
    "herbert": { name: "Herbert", standard: 3, affinity: { Marijuana: 0.81, Methamphetamine: 0.39, Cocaine: 0.27 }, prefs: ["cbc01bf3304d3654fbb3b38b49f443ba", "bc28a333fd5cf2048a8111c0c6178044", "b8e941ae03ded1b45b9cc184df468bba"] }, // Jennerising, Athletic, Zombifying
    "jack": { name: "Jack", standard: 3, affinity: { Marijuana: 0.66, Methamphetamine: 0.88, Cocaine: 0.10 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8a18aa6111557e246823661b9136e1ab"] }, // Lethal, Balding
    "jennifer": { name: "Jennifer", standard: 2, affinity: { Marijuana: -0.88, Methamphetamine: 0.42, Cocaine: 0.65 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "cbc01bf3304d3654fbb3b38b49f443ba", "255ee6603a48b8f4ea0ad5b33d73afb6"] }, // Lethal, Jennerising, Gingeritis
    "jeremy": { name: "Jeremy", standard: 3, affinity: { Marijuana: 0.58, Methamphetamine: 0.53, Cocaine: 0.83 }, prefs: ["40784621a2e5fbe4cbc4248de7983706", "cbc01bf3304d3654fbb3b38b49f443ba", "1f669aa2a1321f24db07f43770fc20c9"] }, // Anti-gravity, Jennerising, Refreshing
    "lisa": { name: "Lisa", standard: 2, affinity: { Marijuana: -0.82, Methamphetamine: -0.36, Cocaine: -0.28 }, prefs: ["3280aaf123fdf3349b86dc4565b34b60", "09cc6fed996998f40b9411f43cfa8146", "9a1c55c8870b7134b8d14216dbf38977"] }, // Smelly, Slippery, Bright-Eyed
    "louis": { name: "Louis", standard: 2, affinity: { Marijuana: 0.94, Methamphetamine: -0.92, Cocaine: -0.30 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044", "f97424863d141dd44a2d886552a9ffed"] }, // Lethal, Athletic, Disorienting
    "lucy": { name: "Lucy", standard: 2, affinity: { Marijuana: 0.65, Methamphetamine: -0.79, Cocaine: 0.19 }, prefs: ["1f669aa2a1321f24db07f43770fc20c9", "3f4f290ea8487134498e81b12e62caa7", "8d4588c64b65e0b46b2efcae062176a3"] }, // Refreshing, Euphoric, Electrifying
    "ludwig": { name: "Ludwig", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.59, Cocaine: -0.68 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "8301163bca693374fbca43f5ae493605", "64dfda7c41360f545b54e42c1fef28e9"] }, // Euphoric, Energizing, Focused
    "mac": { name: "Mac", standard: 2, affinity: { Marijuana: -0.57, Methamphetamine: -0.38, Cocaine: 0.27 }, prefs: ["1f669aa2a1321f24db07f43770fc20c9", "c45539561ef11a746bfb77b48ae01268", "b8e941ae03ded1b45b9cc184df468bba"] }, // Refreshing, Shrinking, Zombifying
    "marco": { name: "Marco", standard: 2, affinity: { Marijuana: 0.34, Methamphetamine: 0.08, Cocaine: 0.54 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "b8e941ae03ded1b45b9cc184df468bba", "8301163bca693374fbca43f5ae493605"] }, // Spicy, Zombifying, Energizing
    "meg": { name: "Meg", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.04, Cocaine: 0.72 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "cbc01bf3304d3654fbb3b38b49f443ba", "8a18aa6111557e246823661b9136e1ab"] }, // Spicy, Jennerising, Balding
    "melissa": { name: "Melissa", standard: 2, affinity: { Marijuana: -0.26, Methamphetamine: 0.67, Cocaine: 0.42 }, prefs: ["9a1c55c8870b7134b8d14216dbf38977", "8301163bca693374fbca43f5ae493605", "cbc01bf3304d3654fbb3b38b49f443ba"] }, // Bright-Eyed, Energizing, Jennerising
    "michael": { name: "Michael", standard: 3, affinity: { Marijuana: 0.17, Methamphetamine: 0.95, Cocaine: 0.70 }, prefs: ["84e743d1a3e8e864ea09facbe5736d80", "ff88fffc965badc409a4b46d2652a178", "09cc6fed996998f40b9411f43cfa8146"] }, // Laxative, Calming, Slippery
    "pearl": { name: "Pearl", standard: 3, affinity: { Marijuana: 0.89, Methamphetamine: -0.89, Cocaine: 0.67 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "51a993ea0c0d04440b1d8edefcd528e4", "b8e941ae03ded1b45b9cc184df468bba"] }, // Slippery, Sneaky, Zombifying
    "philip": { name: "Philip", standard: 2, affinity: { Marijuana: 0.97, Methamphetamine: 0.78, Cocaine: -0.22 }, prefs: ["8301163bca693374fbca43f5ae493605", "be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044"] }, // Energizing, Lethal, Athletic
    "sam": { name: "Sam", standard: 1, affinity: { Marijuana: -0.76, Methamphetamine: 0.30, Cocaine: -0.80 }, prefs: ["10e411647a7578940bc89f097a6653bb", "b34cc41265d8697478143dc30916100b", "1f669aa2a1321f24db07f43770fc20c9"] }, // Munchies, Toxic, Refreshing
    "tobias": { name: "Tobias", standard: 3, affinity: { Marijuana: 0.19, Methamphetamine: 0.76, Cocaine: 0.17 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8301163bca693374fbca43f5ae493605", "c45539561ef11a746bfb77b48ae01268"] }, // Lethal, Energizing, Shrinking
    "walter": { name: "Walter", standard: 3, affinity: { Marijuana: -0.14, Methamphetamine: -0.30, Cocaine: -0.44 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "ff88fffc965badc409a4b46d2652a178", "40784621a2e5fbe4cbc4248de7983706"] }, // Slippery, Calming, Anti-gravity
};

export const QUALITY_LEVELS = ["Trash", "Poor", "Standard", "Premium", "Heavenly"]; // Index 0-4
export const QUALITY_VALUE_MULTIPLIERS = { 0: 0.5, 1: 0.8, 2: 1.0, 3: 1.2, 4: 1.5 }; // Assumed values
export const MAX_EFFECT_CONTRIBUTION = { type: 0.3, property: 0.4, quality: 0.3 }; // From economy.md


// --- Casino Data ---
// (No hardcoded data found in casino.js)

// --- Utility Cost Data ---
// (To be added later from utilities.js)
export const EQUIPMENT_POWER_WATER = {};

// --- Customer Tracker Data ---
// (Uses CUSTOMER_DATA from Satisfaction)

// --- Delivery Tracker Data ---
// (No hardcoded game data)

// --- Financial Tracker Data ---
// (No hardcoded game data)

// --- Grow Planner Data ---
// (Uses BASE_GROW_TIMES and POT_DATA from Growing)