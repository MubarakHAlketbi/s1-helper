// --- General Game Constants ---
export const GAME_MINUTE_TO_REAL_MS = 1000; // 1 game minute = 1 real second = 1000 ms
export const GAME_HOURS_PER_DAY = 24;
export const GAME_DAY_ROLLOVER_TIME = 400; // 4:00 AM
export const DEFAULT_WAKE_TIME = 700; // 7:00 AM

// --- Growing Data ---

// Base grow times in GAME MINUTES
export const BASE_GROW_TIMES = {
    "Coca Seed": 2880, // ~48 real mins
    "Granddaddy Purple Seed": 1600, // ~26.7 real mins
    "Green Crack Seed": 1380, // ~23 real mins
    "OG Kush Seed": 1440, // ~24 real mins
    "Sour Diesel Seed": 1500, // ~25 real mins
    "Test Weed Seed": 1440 // Placeholder if needed
};

// Pot modifiers and watering intervals
// waterIntervalMinutes: Base GAME MINUTES before needing water (assuming standard soil baseline, standard pot)
// drainMultiplier: How much faster/slower water drains (1.0 = normal)
// growthMultiplier: How much faster/slower plants grow (1.0 = normal)
export const POT_DATA = {
    "Plastic Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.0 }, // Baseline
    "Air Pot": { waterIntervalMinutes: 1440, drainMultiplier: 1.3, growthMultiplier: 1.15 }, // Drains 30% faster, grows 15% faster
    "Moisture-Preserving Pot": { waterIntervalMinutes: 1440, drainMultiplier: 0.6, growthMultiplier: 1.0 }, // Drains 40% slower
    "Grow Tent": { waterIntervalMinutes: 1440, drainMultiplier: 1.0, growthMultiplier: 1.20 }, // Grows 20% faster (Example value, adjust if known)
};

// Additive Effects on Plants (from growing.md - Additive.cs section)
// These would be applied manually or via employee actions
export const ADDITIVE_GROWTH_EFFECTS = {
    "fertilizer": { qualityChange: +0.2, yieldChange: 0, growSpeedMultiplier: 1.0, instantGrowth: 0 }, // Example values
    "pgr": { qualityChange: -0.1, yieldChange: +0.3, growSpeedMultiplier: 1.0, instantGrowth: 0 }, // Example values
    "speedgrow": { qualityChange: -0.15, yieldChange: 0, growSpeedMultiplier: 1.0, instantGrowth: 0.5 }, // Example values
};

// Seed Data (Extracted from seeds.md)
export const SEED_DATA = {
    "cocaseed": {
        id: "cocaseed",
        name: "Coca Seed",
        description: "A single coca seed. Grows into a coca plant, which provides coca leaves, which can be turned into something else starting with coca.",
        cost: 150,
        unlockRankTier: "0-0", // Assuming available early if not specified otherwise
        legality: 0 // Assuming illegal based on context
    },
    "granddaddypurpleseed": {
        id: "granddaddypurpleseed",
        name: "Granddaddy Purple Seed",
        description: "One 'Granddaddy Purple' marijuana seed.",
        cost: 45,
        unlockRankTier: "1-4",
        legality: 0 // Assuming illegal
    },
    "greencrackseed": {
        id: "greencrackseed",
        name: "Green Crack Seed",
        description: "One 'Green Crack' marijuana seed.",
        cost: 40,
        unlockRankTier: "1-2",
        legality: 0 // Assuming illegal
    },
    "ogkushseed": {
        id: "ogkushseed",
        name: "OG Kush Seed",
        description: "One 'OG Kush' marijuana seed.",
        cost: 30,
        unlockRankTier: "0-0",
        legality: 0 // Assuming illegal
    },
    "sourdieselseed": {
        id: "sourdieselseed",
        name: "Sour Diesel Seed",
        description: "One 'Sour Diesel' marijuana seed.",
        cost: 35,
        unlockRankTier: "0-4",
        legality: 0 // Assuming illegal
    }
};


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

// Unlock Data (Expand with actual game data from all sources)
// Key: "RankIndex-Tier" -> Value: Array of unlocked item/feature names
// Updated based on cross-referencing item data
export const UNLOCKS = {
    "0-0": ["OG Kush Seed", "Chemistry Station", "Lab Oven", "Packaging Station", "Laundering Station", "Flashlight", "Trash Bag", "Trash Grabber", "Plant Trimmers", "Watering Can", "Cheap Skateboard", "Cruiser Skateboard", "Golden Skateboard", "Lightweight Skateboard", "Skateboard", "Safe", "Large Storage Rack", "Medium Storage Rack", "Small Storage Rack", "Wall-Mounted Shelf", "Grow Light"], // Starting items + Rank 0 Tier 0 unlocks
    "0-3": ["Jar Packaging", "PGR", "Speed Grow"], // Added PGR, Speed Grow
    "0-4": ["Long-Life Soil", "Plastic Pot", "Moisture-Preserving Pot", "Sour Diesel Seed", "Fertilizer"], // Added Fertilizer
    "0-5": ["Electric Plant Trimmers", "Pot Sprinkler", "Big Sprinkler"],
    "1-1": ["Mixing Station", "Westville Region Access"],
    "1-2": ["Soil Pourer", "Green Crack Seed"],
    "1-3": ["Extra Long-Life Soil"],
    "1-4": ["Granddaddy Purple Seed"],
    "1-5": ["Packaging Station Mk II"],
    "2-1": ["Downtown Region Access"],
    "2-2": ["Mixing Station Mk2"],
    "2-3": ["Air Pot"],
    "3-1": ["Docks Region Access"],
    "3-3": ["Drying Rack", "Pseudo", "Acid"],
    "4-1": ["Suburbia Region Access"],
    "4-5": ["Brick Press", "High-Quality Pseudo"],
    "5-1": ["Cauldron", "Uptown Region Access"],
    "6-1": ["Northtown Region Access"]
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
    "testweed": { name: "Test Weed", type: "Marijuana", baseMarketValue: 71, baseAddictiveness: 0, properties: ["c45539561ef11a746bfb77b48ae01268", "dab9f348050ec7b4fbac698f3b32dd4e"] }, // Shrinking, Thought-Provoking
    "defaultweed": { name: "DefaultWeed (OG Kush Base)", type: "Marijuana", baseMarketValue: 35, baseAddictiveness: 0.05, properties: [] }, // From product.md
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
    // Crafting-only ingredients don't add direct effects:
    "acid": { name: "Acid", propertyGuid: null },
    "phosphorus": { name: "Phosphorus", propertyGuid: null },
    "highqualitypseudo": { name: "High-Quality Pseudo", propertyGuid: null },
    "lowqualitypseudo": { name: "Low-Quality Pseudo", propertyGuid: null },
    "pseudo": { name: "Pseudo", propertyGuid: null },
};

// Effects Data (GUID -> { name, tier, addictiveness, valueMod, mixDir: [x,y], mixMag: mag })
export const EFFECTS_DATA = {
    // Tier 1
    "ff88fffc965badc409a4b46d2652a178": { name: "Calming", tier: 1, addictiveness: 0, valueMod: 0.1, mixDir: [-0.5, 0.87], mixMag: 0.8 }, // Example Mix Vector
    "3f4f290ea8487134498e81b12e62caa7": { name: "Euphoric", tier: 1, addictiveness: 0.235, valueMod: 0.18, mixDir: [0.8, 0.6], mixMag: 0.9 },
    "64dfda7c41360f545b54e42c1fef28e9": { name: "Focused", tier: 1, addictiveness: 0.104, valueMod: 0.16, mixDir: [0.9, -0.44], mixMag: 0.7 },
    "10e411647a7578940bc89f097a6653bb": { name: "Munchies", tier: 1, addictiveness: 0.096, valueMod: 0.12, mixDir: [-0.7, -0.7], mixMag: 0.6 },
    "49438371dd4ec884faffec14e0d82c1d": { name: "Paranoia", tier: 1, addictiveness: 0, valueMod: 0, mixDir: [0.1, -0.99], mixMag: 0.5 }, // Negative effect
    "1f669aa2a1321f24db07f43770fc20c9": { name: "Refreshing", tier: 1, addictiveness: 0.104, valueMod: 0.14, mixDir: [0.95, 0.31], mixMag: 0.8 },
    "3280aaf123fdf3349b86dc4565b34b60": { name: "Smelly", tier: 1, addictiveness: 0, valueMod: 0, mixDir: [-0.9, -0.4], mixMag: 0.4 }, // Negative effect
    // Tier 2
    "12826c936a1eac2408fcae55dfd02ad2": { name: "Calorie-Dense", tier: 2, addictiveness: 0.1, valueMod: 0.28, mixDir: [-0.2, -0.98], mixMag: 1.0 },
    "f97424863d141dd44a2d886552a9ffed": { name: "Disorienting", tier: 2, addictiveness: 0, valueMod: 0, mixDir: [0.3, -0.95], mixMag: 0.7 }, // Negative effect
    "8301163bca693374fbca43f5ae493605": { name: "Energizing", tier: 2, addictiveness: 0.34, valueMod: 0.22, mixDir: [0.88, 0.47], mixMag: 1.1 },
    "255ee6603a48b8f4ea0ad5b33d73afb6": { name: "Gingeritis", tier: 2, addictiveness: 0, valueMod: 0.2, mixDir: [-0.98, 0.2], mixMag: 0.9 },
    "cee302b478ed60441a0bd7023ad82e5c": { name: "Sedating", tier: 2, addictiveness: 0, valueMod: 0.26, mixDir: [-0.6, 0.8], mixMag: 1.0 },
    "51a993ea0c0d04440b1d8edefcd528e4": { name: "Sneaky", tier: 2, addictiveness: 0.327, valueMod: 0.24, mixDir: [0.1, 0.99], mixMag: 1.2 },
    "b34cc41265d8697478143dc30916100b": { name: "Toxic", tier: 2, addictiveness: 0, valueMod: 0, mixDir: [0.5, -0.87], mixMag: 0.6 }, // Negative effect
    // Tier 3
    "bc28a333fd5cf2048a8111c0c6178044": { name: "Athletic", tier: 3, addictiveness: 0.607, valueMod: 0.32, mixDir: [0.95, 0.3], mixMag: 1.4 },
    "8a18aa6111557e246823661b9136e1ab": { name: "Balding", tier: 3, addictiveness: 0, valueMod: 0.3, mixDir: [-0.8, 0.6], mixMag: 1.0 },
    "f4e8b2e3804dd174b8ef45a125d4620a": { name: "Foggy", tier: 3, addictiveness: 0.1, valueMod: 0.36, mixDir: [0.7, 0.7], mixMag: 1.3 },
    "84e743d1a3e8e864ea09facbe5736d80": { name: "Laxative", tier: 3, addictiveness: 0.1, valueMod: 0, mixDir: [-0.4, -0.9], mixMag: 0.8 }, // Negative effect
    "c9f624e2d8653c24ea25a8bd095a39cb": { name: "Seizure-Inducing", tier: 3, addictiveness: 0, valueMod: 0, mixDir: [0.6, -0.8], mixMag: 0.9 }, // Negative effect
    "09cc6fed996998f40b9411f43cfa8146": { name: "Slippery", tier: 3, addictiveness: 0.309, valueMod: 0.34, mixDir: [-0.9, -0.4], mixMag: 1.2 },
    "45255276d6b7e92409f1aeff18e7e5bd": { name: "Spicy", tier: 3, addictiveness: 0.665, valueMod: 0.38, mixDir: [0.99, -0.1], mixMag: 1.5 },
    // Tier 4
    "9a1c55c8870b7134b8d14216dbf38977": { name: "Bright-Eyed", tier: 4, addictiveness: 0.2, valueMod: 0.4, mixDir: [0.4, 0.9], mixMag: 1.6 },
    "ed5319276a4cfeb4281aae5984b5d04e": { name: "Glowing", tier: 4, addictiveness: 0.472, valueMod: 0.48, mixDir: [-0.3, 0.95], mixMag: 1.8 },
    "cbc01bf3304d3654fbb3b38b49f443ba": { name: "Jennerising", tier: 4, addictiveness: 0.343, valueMod: 0.42, mixDir: [-0.95, 0.3], mixMag: 1.5 },
    "be6ef3c6460adac459cb7b6f45e4e75f": { name: "Lethal", tier: 4, addictiveness: 0, valueMod: 0, mixDir: [0.9, -0.4], mixMag: 1.0 }, // Negative effect
    "5a7b3fa762f157a4abd69fbb4b292ea2": { name: "Schizophrenic", tier: 4, addictiveness: 0, valueMod: 0, mixDir: [0.2, -0.98], mixMag: 1.1 }, // Negative effect
    "dab9f348050ec7b4fbac698f3b32dd4e": { name: "Thought-Provoking", tier: 4, addictiveness: 0.37, valueMod: 0.44, mixDir: [0.7, 0.7], mixMag: 1.7 },
    "6b16a3f1922a5974bb14367c8c2aff04": { name: "Tropic Thunder", tier: 4, addictiveness: 0.803, valueMod: 0.46, mixDir: [-0.8, -0.6], mixMag: 1.6 },
    // Tier 5
    "40784621a2e5fbe4cbc4248de7983706": { name: "Anti-gravity", tier: 5, addictiveness: 0.611, valueMod: 0.54, mixDir: [0.5, 0.87], mixMag: 2.0 },
    "65db5bdb2fe479443bee064eeab25866": { name: "Cyclopean", tier: 5, addictiveness: 0.1, valueMod: 0.56, mixDir: [-0.7, 0.7], mixMag: 1.8 },
    "8d4588c64b65e0b46b2efcae062176a3": { name: "Electrifying", tier: 5, addictiveness: 0.235, valueMod: 0.5, mixDir: [0.98, 0.2], mixMag: 2.2 },
    "8855d004355ec0d4db89224a65f18b27": { name: "Explosive", tier: 5, addictiveness: 0, valueMod: 0, mixDir: [0.8, -0.6], mixMag: 1.2 }, // Negative effect
    "0dce587811d674b4eb7c0fe0891f004d": { name: "Long faced", tier: 5, addictiveness: 0.607, valueMod: 0.52, mixDir: [-0.9, 0.4], mixMag: 1.9 },
    "c45539561ef11a746bfb77b48ae01268": { name: "Shrinking", tier: 5, addictiveness: 0.336, valueMod: 0.6, mixDir: [0.3, 0.95], mixMag: 2.1 },
    "b8e941ae03ded1b45b9cc184df468bba": { name: "Zombifying", tier: 5, addictiveness: 0.598, valueMod: 0.58, mixDir: [-0.6, -0.8], mixMag: 2.0 },
};

// --- Satisfaction Data ---
// Customer Data (id -> { name, standard (0-4), affinity: { Type: score (-1 to 1) }, prefs: [effectGuid1, ...] })
export const CUSTOMER_DATA = {
    "beth": { name: "Beth", standard: 1, affinity: { Marijuana: 0.30, Methamphetamine: 0.31, Cocaine: -0.20 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044"] },
    "billy": { name: "Billy", standard: 2, affinity: { Marijuana: 0.09, Methamphetamine: -0.63, Cocaine: 0.57 }, prefs: ["c45539561ef11a746bfb77b48ae01268", "09cc6fed996998f40b9411f43cfa8146", "b8e941ae03ded1b45b9cc184df468bba"] },
    "carl": { name: "Carl", standard: 3, affinity: { Marijuana: -0.81, Methamphetamine: -0.23, Cocaine: -0.58 }, prefs: ["8d4588c64b65e0b46b2efcae062176a3", "b34cc41265d8697478143dc30916100b", "8301163bca693374fbca43f5ae493605"] },
    "chloe": { name: "Chloe", standard: 1, affinity: { Marijuana: 0.44, Methamphetamine: 0.79, Cocaine: 0.25 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "be6ef3c6460adac459cb7b6f45e4e75f", "10e411647a7578940bc89f097a6653bb"] },
    "chris": { name: "Chris", standard: 3, affinity: { Marijuana: -0.83, Methamphetamine: 0.40, Cocaine: 0.79 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "3f4f290ea8487134498e81b12e62caa7", "b8e941ae03ded1b45b9cc184df468bba"] },
    "dennis": { name: "Dennis", standard: 3, affinity: { Marijuana: 0.26, Methamphetamine: 0.08, Cocaine: -0.89 }, prefs: ["b34cc41265d8697478143dc30916100b", "1f669aa2a1321f24db07f43770fc20c9", "8d4588c64b65e0b46b2efcae062176a3"] },
    "donna": { name: "Donna", standard: 1, affinity: { Marijuana: 0.93, Methamphetamine: -0.27, Cocaine: 0.25 }, prefs: ["8301163bca693374fbca43f5ae493605", "be6ef3c6460adac459cb7b6f45e4e75f", "10e411647a7578940bc89f097a6653bb"] },
    "doris": { name: "Doris", standard: 1, affinity: { Marijuana: 0.46, Methamphetamine: 0.16, Cocaine: 0.58 }, prefs: ["c45539561ef11a746bfb77b48ae01268", "6b16a3f1922a5974bb14367c8c2aff04", "40784621a2e5fbe4cbc4248de7983706"] },
    "elizabeth": { name: "Elizabeth", standard: 2, affinity: { Marijuana: 0.33, Methamphetamine: 0.45, Cocaine: 0.32 }, prefs: ["64dfda7c41360f545b54e42c1fef28e9", "6b16a3f1922a5974bb14367c8c2aff04", "255ee6603a48b8f4ea0ad5b33d73afb6"] },
    "eugene": { name: "Eugene", standard: 2, affinity: { Marijuana: 0.66, Methamphetamine: 0.11, Cocaine: 0.17 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "255ee6603a48b8f4ea0ad5b33d73afb6", "ff88fffc965badc409a4b46d2652a178"] },
    "fiona": { name: "Fiona", standard: 3, affinity: { Marijuana: 0.03, Methamphetamine: 0.08, Cocaine: -0.50 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8a18aa6111557e246823661b9136e1ab", "6b16a3f1922a5974bb14367c8c2aff04"] },
    "genghis": { name: "Genghis", standard: 0, affinity: { Marijuana: 0.85, Methamphetamine: -0.64, Cocaine: 0.45 }, prefs: ["b8e941ae03ded1b45b9cc184df468bba", "51a993ea0c0d04440b1d8edefcd528e4", "b34cc41265d8697478143dc30916100b"] },
    "greg": { name: "Greg", standard: 0, affinity: { Marijuana: 0.58, Methamphetamine: -0.58, Cocaine: -0.35 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "6b16a3f1922a5974bb14367c8c2aff04", "255ee6603a48b8f4ea0ad5b33d73afb6"] },
    "harold": { name: "Harold", standard: 3, affinity: { Marijuana: -0.95, Methamphetamine: -0.78, Cocaine: -0.70 }, prefs: ["bc28a333fd5cf2048a8111c0c6178044", "c45539561ef11a746bfb77b48ae01268", "84e743d1a3e8e864ea09facbe5736d80"] },
    "herbert": { name: "Herbert", standard: 3, affinity: { Marijuana: 0.81, Methamphetamine: 0.39, Cocaine: 0.27 }, prefs: ["cbc01bf3304d3654fbb3b38b49f443ba", "bc28a333fd5cf2048a8111c0c6178044", "b8e941ae03ded1b45b9cc184df468bba"] },
    "jack": { name: "Jack", standard: 3, affinity: { Marijuana: 0.66, Methamphetamine: 0.88, Cocaine: 0.10 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8a18aa6111557e246823661b9136e1ab"] },
    "jennifer": { name: "Jennifer", standard: 2, affinity: { Marijuana: -0.88, Methamphetamine: 0.42, Cocaine: 0.65 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "cbc01bf3304d3654fbb3b38b49f443ba", "255ee6603a48b8f4ea0ad5b33d73afb6"] },
    "jeremy": { name: "Jeremy", standard: 3, affinity: { Marijuana: 0.58, Methamphetamine: 0.53, Cocaine: 0.83 }, prefs: ["40784621a2e5fbe4cbc4248de7983706", "cbc01bf3304d3654fbb3b38b49f443ba", "1f669aa2a1321f24db07f43770fc20c9"] },
    "lisa": { name: "Lisa", standard: 2, affinity: { Marijuana: -0.82, Methamphetamine: -0.36, Cocaine: -0.28 }, prefs: ["3280aaf123fdf3349b86dc4565b34b60", "09cc6fed996998f40b9411f43cfa8146", "9a1c55c8870b7134b8d14216dbf38977"] },
    "louis": { name: "Louis", standard: 2, affinity: { Marijuana: 0.94, Methamphetamine: -0.92, Cocaine: -0.30 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044", "f97424863d141dd44a2d886552a9ffed"] },
    "lucy": { name: "Lucy", standard: 2, affinity: { Marijuana: 0.65, Methamphetamine: -0.79, Cocaine: 0.19 }, prefs: ["1f669aa2a1321f24db07f43770fc20c9", "3f4f290ea8487134498e81b12e62caa7", "8d4588c64b65e0b46b2efcae062176a3"] },
    "ludwig": { name: "Ludwig", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.59, Cocaine: -0.68 }, prefs: ["3f4f290ea8487134498e81b12e62caa7", "8301163bca693374fbca43f5ae493605", "64dfda7c41360f545b54e42c1fef28e9"] },
    "mac": { name: "Mac", standard: 2, affinity: { Marijuana: -0.57, Methamphetamine: -0.38, Cocaine: 0.27 }, prefs: ["1f669aa2a1321f24db07f43770fc20c9", "c45539561ef11a746bfb77b48ae01268", "b8e941ae03ded1b45b9cc184df468bba"] },
    "marco": { name: "Marco", standard: 2, affinity: { Marijuana: 0.34, Methamphetamine: 0.08, Cocaine: 0.54 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "b8e941ae03ded1b45b9cc184df468bba", "8301163bca693374fbca43f5ae493605"] },
    "meg": { name: "Meg", standard: 1, affinity: { Marijuana: 0.79, Methamphetamine: -0.04, Cocaine: 0.72 }, prefs: ["45255276d6b7e92409f1aeff18e7e5bd", "cbc01bf3304d3654fbb3b38b49f443ba", "8a18aa6111557e246823661b9136e1ab"] },
    "melissa": { name: "Melissa", standard: 2, affinity: { Marijuana: -0.26, Methamphetamine: 0.67, Cocaine: 0.42 }, prefs: ["9a1c55c8870b7134b8d14216dbf38977", "8301163bca693374fbca43f5ae493605", "cbc01bf3304d3654fbb3b38b49f443ba"] },
    "michael": { name: "Michael", standard: 3, affinity: { Marijuana: 0.17, Methamphetamine: 0.95, Cocaine: 0.70 }, prefs: ["84e743d1a3e8e864ea09facbe5736d80", "ff88fffc965badc409a4b46d2652a178", "09cc6fed996998f40b9411f43cfa8146"] },
    "pearl": { name: "Pearl", standard: 3, affinity: { Marijuana: 0.89, Methamphetamine: -0.89, Cocaine: 0.67 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "51a993ea0c0d04440b1d8edefcd528e4", "b8e941ae03ded1b45b9cc184df468bba"] },
    "philip": { name: "Philip", standard: 2, affinity: { Marijuana: 0.97, Methamphetamine: 0.78, Cocaine: -0.22 }, prefs: ["8301163bca693374fbca43f5ae493605", "be6ef3c6460adac459cb7b6f45e4e75f", "bc28a333fd5cf2048a8111c0c6178044"] },
    "sam": { name: "Sam", standard: 1, affinity: { Marijuana: -0.76, Methamphetamine: 0.30, Cocaine: -0.80 }, prefs: ["10e411647a7578940bc89f097a6653bb", "b34cc41265d8697478143dc30916100b", "1f669aa2a1321f24db07f43770fc20c9"] },
    "tobias": { name: "Tobias", standard: 3, affinity: { Marijuana: 0.19, Methamphetamine: 0.76, Cocaine: 0.17 }, prefs: ["be6ef3c6460adac459cb7b6f45e4e75f", "8301163bca693374fbca43f5ae493605", "c45539561ef11a746bfb77b48ae01268"] },
    "walter": { name: "Walter", standard: 3, affinity: { Marijuana: -0.14, Methamphetamine: -0.30, Cocaine: -0.44 }, prefs: ["09cc6fed996998f40b9411f43cfa8146", "ff88fffc965badc409a4b46d2652a178", "40784621a2e5fbe4cbc4248de7983706"] },
    // Add other customers if data becomes available
};

// List of known customer names (used by Customer Tracker tool)
export const KNOWN_CUSTOMER_NAMES = Object.values(CUSTOMER_DATA).map(c => c.name).sort();

// Quality System
export const QUALITY_LEVELS = ["Trash", "Poor", "Standard", "Premium", "Heavenly"]; // Index 0-4
export const QUALITY_VALUE_MULTIPLIERS = { 0: 0.5, 1: 0.8, 2: 1.0, 3: 1.2, 4: 1.5 }; // Assumed values
export const MAX_EFFECT_CONTRIBUTION = { type: 0.3, property: 0.4, quality: 0.3 }; // From economy.md

// --- Casino Data ---
export const BLACKJACK_PAYOUTS = {
    blackjack: 1.5, // 1.5x bet profit
    win: 1.0,       // 1.0x bet profit
    push: 0.0,       // Bet returned
    lose: -1.0      // Bet lost
};
export const BLACKJACK_MIN_BET = 10;
export const BLACKJACK_MAX_BET = 1000;

export const RTB_MULTIPLIERS = [2, 4, 8, 32]; // Inferred multipliers per stage
export const RTB_MIN_BET = 10;
export const RTB_MAX_BET = 500;
export const RTB_ANSWER_TIME = 6.0; // Seconds

// --- Economy & Money Data ---
export const ATM_WEEKLY_DEPOSIT_LIMIT = 10000;
export const CASH_PER_SLOT_LIMIT = 1000;
export const DEAL_COOLDOWN_MINUTES = 600; // 10 hours

// --- Utility Cost Data ---
export const PRICE_PER_KWH = 0.15; // Placeholder cost per kWh
export const PRICE_PER_LITRE = 0.01; // Placeholder cost per Litre of water

export const EQUIPMENT_POWER_WATER = {
    // Power consumption in kWh per game hour (unless specified otherwise)
    "chemStation_kWh_per_Hour": 0.5, // Estimate
    "labOven_kWh_per_Hour": 0.8, // Estimate
    "growLight_kWh_per_Hour": 0.2, // Estimate
    "otherStation_kWh_per_Hour": 0.1, // Estimate (Mixer, Press, etc.)
    "propertyLight_kWh_per_Hour": 0.05, // Estimate (only when ON)
    "cauldron_kWh_per_Hour": 1.0, // Estimate (Higher consumption)
    "packagingMk2_kWh_per_Hour": 0.15, // Estimate (Slightly more than basic)
    "mixingMk2_kWh_per_Hour": 0.2, // Estimate (Slightly more than basic)

    // Water consumption in Litres per game day
    "potSprinkler_L_per_Day": 10, // Estimate
    "bigSprinkler_L_per_Day": 50, // Estimate
    // Manual watering is handled directly in the calculator based on user input
};

// --- Equipment Data ---
// id -> { name, category, description, cost, unlockRankTier, power?, water? }
// Categories: Station, Tool, Pot, Storage, Other
// Updated costs/ranks based on markdown files
export const EQUIPMENT_DATA = {
    // Stations
    "chemStation": { name: "Chemistry Station", category: "Station", description: "General-purpose chemistry station used for mixing and cooking.", cost: 1000, unlockRankTier: "0-0", power: EQUIPMENT_POWER_WATER.chemStation_kWh_per_Hour },
    "labOven": { name: "Lab Oven", category: "Station", description: "Special-purpose laboratory oven for cooking/drying out substances.", cost: 1000, unlockRankTier: "0-0", power: EQUIPMENT_POWER_WATER.labOven_kWh_per_Hour },
    "packagingStation": { name: "Packaging Station", category: "Station", description: "Provides a clean surface to place product into packaging.", cost: 100, unlockRankTier: "0-0" },
    "launderingStation": { name: "Laundering Station", category: "Station", description: "Workstation that contains the interface for laundering money. Must be placed at a business to work.", cost: 500, unlockRankTier: "0-0" },
    "mixingStation": { name: "Mixing Station", category: "Station", description: "Used to mix product with ingredients to create unique new products.", cost: 500, unlockRankTier: "1-1", power: EQUIPMENT_POWER_WATER.otherStation_kWh_per_Hour },
    "packagingStationMk2": { name: "Packaging Station Mk II", category: "Station", description: "An upgraded version of the packaging station with a rotary packing tool. Allows for much faster packing of products.", cost: 750, unlockRankTier: "1-5", power: EQUIPMENT_POWER_WATER.packagingMk2_kWh_per_Hour },
    "mixingStationMk2": { name: "Mixing Station Mk2", category: "Station", description: "An upgraded model of the mixing station with automatic ingredient insertion, and faster mix times.", cost: 2000, unlockRankTier: "2-2", power: EQUIPMENT_POWER_WATER.mixingMk2_kWh_per_Hour },
    "dryingRack": { name: "Drying Rack", category: "Station", description: "Hang up organic items (weed, coca leaves) here to improve their quality.", cost: 250, unlockRankTier: "3-3" },
    "brickPress": { name: "Brick Press", category: "Station", description: "Industrial brick press used to squish stuff into bricks.", cost: 800, unlockRankTier: "4-5", power: EQUIPMENT_POWER_WATER.otherStation_kWh_per_Hour },
    "cauldron": { name: "Cauldron", category: "Station", description: "Industrial cauldron used for boiling a lot of stuff at once.", cost: 3000, unlockRankTier: "5-1", power: EQUIPMENT_POWER_WATER.cauldron_kWh_per_Hour },
    // Tools
    "flashlight": { name: "Flashlight", category: "Tool", description: "A small handheld flashlight used for illuminating stuff.", cost: 15, unlockRankTier: "0-0" },
    "trashBag": { name: "Trash Bag", category: "Tool", description: "Can be used to either gather up trash or to bag the contents of a trash can.", cost: 1, unlockRankTier: "0-0" },
    "trashGrabber": { name: "Trash Grabber", category: "Tool", description: "Used to easily collect trash.", cost: 20, unlockRankTier: "0-0" },
    "plantTrimmers": { name: "Plant Trimmers", category: "Tool", description: "A pair of plant trimmers. Necessity for harvesting plants.", cost: 10, unlockRankTier: "0-0" },
    "wateringCan": { name: "Watering Can", category: "Tool", description: "Holds water.", cost: 15, unlockRankTier: "0-0" },
    "electricPlantTrimmers": { name: "Electric Plant Trimmers", category: "Tool", description: "A pair of electric plant trimmers. Simply click and drag to harvest.", cost: 50, unlockRankTier: "0-5" },
    "soilPourer": { name: "Soil Pourer", category: "Tool", description: "When activated, will fill the adjacent pot or grow tent with soil.", cost: 300, unlockRankTier: "1-2" },
    // Pots (Data also in POT_DATA, linking here for completeness)
    "plasticPot": { name: "Plastic Pot", category: "Pot", description: "Flimsy plastic pot made in China.", cost: 20, unlockRankTier: "0-4", growthMultiplier: POT_DATA["Plastic Pot"].growthMultiplier },
    "moisturePreservingPot": { name: "Moisture-Preserving Pot", category: "Pot", description: "A special metal pot with moisture-preserving functionality. Soil will lose moisture 40% slower.", cost: 50, unlockRankTier: "0-4", growthMultiplier: POT_DATA["Moisture-Preserving Pot"].growthMultiplier },
    "airPot": { name: "Air Pot", category: "Pot", description: "Fancy hand woven fabric pot that keeps roots ventilated. Boosts plant growth speed by 15%, but also increases moisture drain by 30%.", cost: 120, unlockRankTier: "2-3", growthMultiplier: POT_DATA["Air Pot"].growthMultiplier },
    // Sprinklers (Could be Tool or Station)
    "potSprinkler": { name: "Pot Sprinkler", category: "Station", description: "When activated, will water the adjacent pot or grow tent.", cost: 200, unlockRankTier: "0-5", water: EQUIPMENT_POWER_WATER.potSprinkler_L_per_Day },
    "bigSprinkler": { name: "Big Sprinkler", category: "Station", description: "When activated, will water up to 8 surrounding plants. Plants must be directly next to or diagonal from the sprinkler.", cost: 600, unlockRankTier: "0-5", water: EQUIPMENT_POWER_WATER.bigSprinkler_L_per_Day },
    // Storage
    "safe": { name: "Safe", category: "Storage", description: "A big metal safe to store all your fancy stuff in.", cost: 500, unlockRankTier: "0-0" },
    "largeStorageRack": { name: "Large Storage Rack", category: "Storage", description: "A large sized, 4-tier storage rack.", cost: 60, unlockRankTier: "0-0" },
    "mediumStorageRack": { name: "Medium Storage Rack", category: "Storage", description: "A medium sized, 4-tier storage rack.", cost: 45, unlockRankTier: "0-0" },
    "smallStorageRack": { name: "Small Storage Rack", category: "Storage", description: "A small sized, 4-tier storage rack.", cost: 30, unlockRankTier: "0-0" },
    "wallMountedShelf": { name: "Wall-Mounted Shelf", category: "Storage", description: "A 2-tier wall-mounted shelf which you can place items on.", cost: 50, unlockRankTier: "0-0" },
    // Other (Skateboards listed in unlocks, maybe add here?)
    "cheapSkateboard": { name: "Cheap Skateboard", category: "Other", description: "Old wood with some wheels nailed to it. Not fancy but it rolls.", cost: 75, unlockRankTier: "0-0" },
    "cruiserSkateboard": { name: "Cruiser Skateboard", category: "Other", description: "Cruiser skateboard designed for high-speed, straight line motion. Not particularly agile.", cost: 500, unlockRankTier: "0-0" },
    "goldenSkateboard": { name: "Golden Skateboard", category: "Other", description: "Tasteful gold-plated skateboard. High top speed but slow acceleration.", cost: 1500, unlockRankTier: "0-0" },
    "lightweightSkateboard": { name: "Lightweight Skateboard", category: "Other", description: "Low-weight plastic skateboard with increased jump height.", cost: 500, unlockRankTier: "0-0" },
    "skateboard": { name: "Skateboard", category: "Other", description: "Classic double-kick popsicle skateboard. Use it to get around faster than on-foot.", cost: 250, unlockRankTier: "0-0" },
    // Grow Lights (Listed in power consumption)
    "growLight": { name: "Grow Light", category: "Station", description: "Provides light for plant growth.", cost: 120, unlockRankTier: "0-0", power: EQUIPMENT_POWER_WATER.growLight_kWh_per_Hour }, // Assuming unlocked early
};

// --- Packaging Data ---
export const PACKAGING_CAPACITY = {
    "baggie": 1,
    "jar": 5,
    "brick": 25 // Using the value from product.cs code (25) over the asset dump (20)
};

// More detailed Packaging Data (id -> { name, capacity, cost, unlockRankTier })
export const PACKAGING_DATA = {
    "baggie": { name: "Baggie", capacity: PACKAGING_CAPACITY.baggie, cost: 1, unlockRankTier: "0-0" }, // Updated cost
    "jar": { name: "Jar", capacity: PACKAGING_CAPACITY.jar, cost: 3, unlockRankTier: "0-3" }, // Updated cost
    "brick": { name: "Brick Packaging", capacity: PACKAGING_CAPACITY.brick, cost: 1, unlockRankTier: "4-5" } // Updated cost, Requires Brick Press
};

// --- Law Data ---
export const CURFEW_START_TIME = 2100; // 9:00 PM
export const CURFEW_END_TIME = 500; // 5:00 AM
export const CURFEW_WARNING_TIME = 2030; // 8:30 PM
export const DAILY_INTENSITY_DRAIN = 0.05;

export const FINES = {
    PossessingControlledSubstance: 5,
    PossessingLowSeverityDrug: 10,
    PossessingModerateSeverityDrug: 20,
    PossessingHighSeverityDrug: 30,
    FailureToComply: 50,
    Evading: 50, // Evading Arrest
    ViolatingCurfew: 100,
    AttemptingToSell: 150, // Attempt To Sell
    Assault: 75,
    DeadlyAssault: 150,
    Vandalism: 50,
    Theft: 50,
    BrandishingWeapon: 50,
    DischargeFirearm: 50
    // Add others if known (VehicularAssault, DrugTrafficking, etc.)
};

// --- Combat Data ---
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_ENERGY = 100; // Stamina for sprinting
export const PLAYER_HEALTH_REGEN_PER_MINUTE = 0.5; // Game minutes
export const SPRINT_STAMINA_DRAIN_RATE = 12.5; // per second
export const SPRINT_STAMINA_RESTORE_RATE = 25; // per second
export const SPRINT_STAMINA_RESTORE_DELAY = 1.0; // second

// --- Employee Data ---
export const MAX_CUSTOMERS_PER_DEALER = 8;
export const EMPLOYEE_MAX_ASSIGNED_STATIONS = { // From employees.md
    Chemist: 4,
    Cleaner: 3
    // Botanist MaxAssignedPots (not specified), Packager MaxAssignedStations (not specified)
};

// --- Employee Data ---
// id -> { name, role, cost, skills: [], maxAssigned?, notes? }
export const EMPLOYEE_DATA = {
    "dealer": {
        name: "Dealer",
        role: "Sales",
        cost: 100, // Placeholder cost
        skills: ["Dealing", "Customer Management"],
        maxAssigned: MAX_CUSTOMERS_PER_DEALER,
        notes: "Handles customer deals."
    },
    "botanist": {
        name: "Botanist",
        role: "Growing",
        cost: 80, // Placeholder cost
        skills: ["Planting", "Watering", "Harvesting", "Fertilizing"],
        // maxAssigned: TBC (Max pots?)
        notes: "Manages plant cultivation."
    },
     "chemist": {
        name: "Chemist",
        role: "Crafting",
        cost: 120, // Placeholder cost
        skills: ["Mixing", "Crafting (Meth/Coke)"],
        maxAssigned: EMPLOYEE_MAX_ASSIGNED_STATIONS.Chemist,
        notes: "Operates Chemistry Stations, Mixers, etc."
    },
     "packager": {
        name: "Packager",
        role: "Processing",
        cost: 60, // Placeholder cost
        skills: ["Packaging"],
        // maxAssigned: TBC (Max stations?)
        notes: "Operates Packaging Stations."
    },
     "cleaner": {
        name: "Cleaner",
        role: "Maintenance",
        cost: 50, // Placeholder cost
        skills: ["Cleaning"],
        maxAssigned: EMPLOYEE_MAX_ASSIGNED_STATIONS.Cleaner,
        notes: "Cleans properties."
    }
    // Add more specific named employees if they exist
};

// --- Specific NPC Data ---

// Specific Dealer NPCs (id -> { name, cost, cut }) - Based on dealers.js hardcoded list
export const DEALER_NPC_DATA = {
    "benji": { id: "benji", name: "Benji Coleman", cost: 150, cut: 0.20 },
    "brad": { id: "brad", name: "Brad", cost: 120, cut: 0.15 },
    "jane": { id: "jane", name: "Jane", cost: 200, cut: 0.25 },
    "leo": { id: "leo", name: "Leo", cost: 180, cut: 0.20 },
    "molly": { id: "molly", name: "Molly", cost: 160, cut: 0.18 },
    "wei": { id: "wei", name: "Wei", cost: 220, cut: 0.22 },
};

// Specific Merchant NPCs (id -> { name, role, shop? }) - Based on game_info.md analysis
export const MERCHANT_NPC_DATA = {
    "dan": { id: "dan", name: "Dan", role: "Shopkeeper", shop: "Hardware Store" },
    "fiona": { id: "fiona", name: "Fiona", role: "Shopkeeper", shop: "Gas Mart" },
    "herbert": { id: "herbert", name: "Herbert", role: "Shopkeeper", shop: "Pharmacy" },
    "mick": { id: "mick", name: "Mick", role: "Shopkeeper", shop: "Pawn Shop" },
    "steve": { id: "steve", name: "Steve", role: "Shopkeeper", shop: "Liquor Store" },
    "oscar": { id: "oscar", name: "Oscar", role: "Shopkeeper", shop: "Warehouse" },
    "ray": { id: "ray", name: "Ray", role: "Realtor", shop: "Ray's Realty" },
    "jeremy": { id: "jeremy", name: "Jeremy", role: "Shopkeeper", shop: "Dealership" },
    "marco": { id: "marco", name: "Marco", role: "Mechanic", shop: "Autoshop" },
    "dean": { id: "dean", name: "Dean", role: "Artist", shop: "Tattoo Parlor" },
    "anna": { id: "anna", name: "Anna", role: "Stylist", shop: "Hair Salon" },
    // Add other merchants if identified
};

// Specific Story NPCs (id -> { name, role }) - Based on game_info.md analysis
export const STORY_NPC_DATA = {
    "uncleNelson": { id: "uncleNelson", name: "Uncle Nelson", role: "Mentor" },
    "igor": { id: "igor", name: "Igor", role: "Bouncer (Dark Market)" },
    "fixer": { id: "fixer", name: "Fixer", role: "Employee Recruiter" },
    "thomas": { id: "thomas", name: "Thomas", role: "Cartel Contact" },
    "ming": { id: "ming", name: "Ming", role: "Restaurant Owner?" },
    "salvador": { id: "salvador", name: "Salvador", role: "Supplier (Cocaine?)" },
    "shirley": { id: "shirley", name: "Shirley", role: "Supplier (Pseudo)" },
    "lily": { id: "lily", name: "Lily", role: "Tutorial/Early Quest NPC" },
    // Add other key story characters if identified
};
}

// --- Supplier Data ---
// id -> { name, type, items: [itemId1, itemId2, ...], contactMethod, notes? }
// Types: Seeds, Ingredients, Equipment, Other
export const SUPPLIER_DATA = {
    "albertHoover": {
        name: "Albert Hoover",
        type: "Seeds",
        items: ["OG Kush Seed", "Sour Diesel Seed", "Green Crack Seed", "Granddaddy Purple Seed"], // Based on unlocks
        contactMethod: "Phone (Dead Drop)",
        notes: "Initial seed supplier."
    },
    "hardwareStore": {
        name: "Hardware Store",
        type: "Equipment/Tools",
        items: ["Plastic Pot", "Moisture-Preserving Pot", "Air Pot", "Watering Can", "Plant Trimmers", "Electric Plant Trimmers", "Soil Pourer", "Trash Bag", "Trash Grabber", "Flashlight", "Safe", "Large Storage Rack", "Medium Storage Rack", "Small Storage Rack", "Wall-Mounted Shelf", "Grow Light"], // Items likely bought here
        contactMethod: "In Person",
        notes: "Sells basic equipment and storage."
    },
    "pharmacy": {
        name: "Pharmacy",
        type: "Ingredients",
        items: ["Addy", "Flu Medicine", "Paracetamol", "Viagra"], // Example ingredients
        contactMethod: "In Person",
        notes: "Sells various legal chemicals/medicines."
    },
    // Add other potential suppliers like Gas Station (Gasoline?), Grocery (Donut, Cuke, Banana?), etc.
};

// --- Delivery Data ---
// Statuses from EDeliveryStatus.cs
export const DELIVERY_STATUS = {
    0: "InTransit",
    1: "Waiting", // Exact meaning unclear
    2: "Arrived",
    3: "Completed"
};
export const DELIVERY_DOCK_LIMIT = 1; // Only one delivery per dock at a time

// --- Map Data ---
export const MAP_REGIONS = {
    Northtown: { name: "Northtown", rankReq: { rank: 6, tier: 1 } }, // Example Rank
    Westville: { name: "Westville", rankReq: { rank: 1, tier: 1 } },
    Downtown: { name: "Downtown", rankReq: { rank: 2, tier: 1 } },
    Docks: { name: "Docks", rankReq: { rank: 3, tier: 1 } },
    Suburbia: { name: "Suburbia", rankReq: { rank: 4, tier: 1 } },
    Uptown: { name: "Uptown", rankReq: { rank: 5, tier: 1 } }
};

// --- Location Data ---
// id -> { name, type, region, cost?, description?, features?: [] }
// Types: Region, Property (Rentable/Purchasable), Store, POI (Point of Interest)
export const LOCATION_DATA = {
    // Regions (from MAP_REGIONS)
    "westville": { name: MAP_REGIONS.Westville.name, type: "Region", region: null, description: "Starting region.", unlockRankTier: "1-1" },
    "downtown": { name: MAP_REGIONS.Downtown.name, type: "Region", region: null, description: "City center.", unlockRankTier: "2-1" },
    "docks": { name: MAP_REGIONS.Docks.name, type: "Region", region: null, description: "Industrial port area.", unlockRankTier: "3-1" },
    "suburbia": { name: MAP_REGIONS.Suburbia.name, type: "Region", region: null, description: "Residential outskirts.", unlockRankTier: "4-1" },
    "uptown": { name: MAP_REGIONS.Uptown.name, type: "Region", region: null, description: "Affluent district.", unlockRankTier: "5-1" },
    "northtown": { name: MAP_REGIONS.Northtown.name, type: "Region", region: null, description: "Northern area.", unlockRankTier: "6-1" },
    // Properties
    "motelRoom": { name: "Motel Room", type: "Property", region: "Westville", cost: 50, // Rent per day?
                   description: "Initial rentable room.", features: ["Bed", "Basic Storage", "Delivery Dock"] },
    "chineseRestaurantRoom": { name: "Room Above Chinese Restaurant", type: "Property", region: "Westville", cost: 2000, // Purchase price?
                               description: "First purchasable property upgrade.", features: ["More Space", "Delivery Dock"] },
    // Stores (from SUPPLIER_DATA)
    "hardwareStore": { name: SUPPLIER_DATA.hardwareStore.name, type: "Store", region: "Westville", // Assuming Westville
                       description: SUPPLIER_DATA.hardwareStore.notes, features: ["Sells Equipment/Tools"] },
    "pharmacy": { name: SUPPLIER_DATA.pharmacy.name, type: "Store", region: "Downtown", // Assuming Downtown
                  description: SUPPLIER_DATA.pharmacy.notes, features: ["Sells Ingredients"] },
    // POIs
    "casino": { name: "Casino", type: "POI", region: "Downtown", // Assuming Downtown
                description: "Location for gambling games.", features: ["Blackjack", "Ride the Bus", "Slots"] },
    // Add more locations like Gas Station, Grocery Store, specific houses/apartments, dead drop spots etc.
};

// --- Other Items Data ---
// id -> { name, category, description, cost?, unlockRankTier? }
// Categories: Consumable, Tool, Misc, Quest
// Updated costs/ranks based on markdown files
export const OTHER_ITEMS_DATA = {
    // From EQUIPMENT_DATA (Tools/Other)
    "flashlight": { name: EQUIPMENT_DATA.flashlight.name, category: "Tool", description: EQUIPMENT_DATA.flashlight.description, cost: EQUIPMENT_DATA.flashlight.cost, unlockRankTier: EQUIPMENT_DATA.flashlight.unlockRankTier },
    "trashBag": { name: EQUIPMENT_DATA.trashBag.name, category: "Tool", description: EQUIPMENT_DATA.trashBag.description, cost: EQUIPMENT_DATA.trashBag.cost, unlockRankTier: EQUIPMENT_DATA.trashBag.unlockRankTier },
    "trashGrabber": { name: EQUIPMENT_DATA.trashGrabber.name, category: "Tool", description: EQUIPMENT_DATA.trashGrabber.description, cost: EQUIPMENT_DATA.trashGrabber.cost, unlockRankTier: EQUIPMENT_DATA.trashGrabber.unlockRankTier },
    "cheapSkateboard": { name: EQUIPMENT_DATA.cheapSkateboard.name, category: "Misc", description: EQUIPMENT_DATA.cheapSkateboard.description, cost: EQUIPMENT_DATA.cheapSkateboard.cost, unlockRankTier: EQUIPMENT_DATA.cheapSkateboard.unlockRankTier },
    "cruiserSkateboard": { name: EQUIPMENT_DATA.cruiserSkateboard.name, category: "Misc", description: EQUIPMENT_DATA.cruiserSkateboard.description, cost: EQUIPMENT_DATA.cruiserSkateboard.cost, unlockRankTier: EQUIPMENT_DATA.cruiserSkateboard.unlockRankTier },
    "goldenSkateboard": { name: EQUIPMENT_DATA.goldenSkateboard.name, category: "Misc", description: EQUIPMENT_DATA.goldenSkateboard.description, cost: EQUIPMENT_DATA.goldenSkateboard.cost, unlockRankTier: EQUIPMENT_DATA.goldenSkateboard.unlockRankTier },
    "lightweightSkateboard": { name: EQUIPMENT_DATA.lightweightSkateboard.name, category: "Misc", description: EQUIPMENT_DATA.lightweightSkateboard.description, cost: EQUIPMENT_DATA.lightweightSkateboard.cost, unlockRankTier: EQUIPMENT_DATA.lightweightSkateboard.unlockRankTier },
    "skateboard": { name: EQUIPMENT_DATA.skateboard.name, category: "Misc", description: EQUIPMENT_DATA.skateboard.description, cost: EQUIPMENT_DATA.skateboard.cost, unlockRankTier: EQUIPMENT_DATA.skateboard.unlockRankTier },
    // From UNLOCKS (Soil)
    "longLifeSoil": { name: "Long-Life Soil", category: "Consumable", description: "Long-lasting soil that can be used to grow 2 plants before expiring.", cost: 30, unlockRankTier: "0-4" }, // Updated cost
    "extraLongLifeSoil": { name: "Extra Long-Life Soil", category: "Consumable", description: "Extra long-lasting soil that can be used to grow 3 plants before expiring.", cost: 60, unlockRankTier: "1-3" }, // Updated cost
    // From ADDITIVE_GROWTH_EFFECTS (Consumables)
    "fertilizer": { name: "Fertilizer", category: "Consumable", description: "All-natural fertilizer which will increase the quality of your plants.", cost: 30, unlockRankTier: "0-4" }, // Updated cost
    "pgr": { name: "PGR", category: "Consumable", description: "Plant growth regulator (PGR) will increase the yields of your plants, at the cost of quality.", cost: 30, unlockRankTier: "0-3" }, // Updated cost
    "speedgrow": { name: "Speed Grow", category: "Consumable", description: "Instantly grows the plant by 50%, but reduces plant quality.", cost: 30, unlockRankTier: "0-3" }, // Updated cost
    // Add other misc items if known (keys, quest items etc.)
};

// --- Clothing Data (Placeholder) ---
// id -> { name, slot, description, cost?, unlockRankTier?, attributes?: {} }
// Slots: Head, Torso, Legs, Feet, Accessory
export const CLOTHING_DATA = {
    "basicTee": { name: "Basic T-Shirt", slot: "Torso", description: "A plain t-shirt.", cost: 10, unlockRankTier: "0-0" },
    "jeans": { name: "Jeans", slot: "Legs", description: "Standard blue jeans.", cost: 25, unlockRankTier: "0-0" },
    "sneakers": { name: "Sneakers", slot: "Feet", description: "Basic sneakers.", cost: 30, unlockRankTier: "0-0" },
    "hoodie": { name: "Hoodie", slot: "Torso", description: "A comfortable hoodie.", cost: 40, unlockRankTier: "0-2" },
    "baseballCap": { name: "Baseball Cap", slot: "Head", description: "A simple cap.", cost: 15, unlockRankTier: "0-1" },
    // Add more clothing items as data becomes available
};

// --- Vehicle Data (Placeholder) ---
// id -> { name, type, description, cost?, unlockRankTier?, speed?, handling?, storage? }
// Types: Car, Van, Truck, Bike
export const VEHICLE_DATA = {
    "sedan": { name: "Basic Sedan", type: "Car", description: "A reliable four-door sedan. Average performance.", cost: 5000, unlockRankTier: "0-0", speed: "Medium", handling: "Medium", storage: "Small" },
    "van": { name: "Cargo Van", type: "Van", description: "Slow and bulky, but offers large storage capacity.", cost: 8000, unlockRankTier: "1-0", speed: "Low", handling: "Low", storage: "Large" },
    "sportsCar": { name: "Sports Car", type: "Car", description: "Fast and agile, but limited storage.", cost: 25000, unlockRankTier: "3-0", speed: "High", handling: "High", storage: "Very Small" },
    // Add more vehicles as data becomes available
};