# casino.md

```md
**General Casino Notes:**

*   Multiple casino games are available: Blackjack, "Ride the Bus" (RTB), and Slot Machines.
*   Games are designed for multiplayer (`NetworkBehaviour`, RPC calls, `CasinoGamePlayers`).
*   Players interact with game tables/machines (`CasinoGameInteraction`) to join (`onLocalPlayerRequestJoin`).
*   Casino games manage player lists, bets, and game states (`CasinoGameController`, `CasinoGamePlayers`).
*   Specific camera views are used for games (`DefaultCameraTransforms`, `FocusedCameraTransforms`, etc.) with transitions (`CAMERA_LERP_TIME = 0.2f`) and a set Field of View (`FOV = 65f`).
*   Card games use a standard 52-card deck representation (`PlayingCard.cs` with `ECardSuit` and `ECardValue` enums). A `CardController` likely manages the visual state and synchronization of card objects.

---

**Blackjack (`BlackjackGameController.cs`)**

*   **Game Name:** Blackjack
*   **Objective:** Get a hand value closer to 21 than the dealer without exceeding 21.
*   **Player Limit:** Max 4 players + Dealer (Implied by `Player1CardPositions` to `Player4CardPositions`).
*   **Betting:**
    *   `BET_MINIMUM`: **$10**
    *   `BET_MAXIMUM`: **$1000**
    *   Players set their bet using a slider (`BetSlider`) before the round starts (`SetLocalPlayerBet`).
*   **Gameplay Flow:**
    *   **Stages (`EStage`):** WaitingForPlayers -> Dealing -> PlayerTurn -> DealerTurn -> Ending.
    *   Players join the round (`AddPlayerToCurrentRound`).
    *   Players set bets and ready up (`ToggleLocalPlayerReady`). Game starts when all players are ready (`AreAllPlayersReady`).
    *   **Dealing:** Each player and the dealer receive two cards. One dealer card is typically dealt face down (standard Blackjack rule, implied by card reveal logic).
    *   **Player Turn:** Players decide to "Hit" (take another card) or "Stand" (keep current hand). (`HitButton`, `StandButton`).
    *   **Busting:** If a player's hand exceeds 21, they bust (`IsLocalPlayerBust`, `onLocalPlayerBust`) and lose their bet immediately.
    *   **Dealer Turn:** After all players stand or bust, the dealer reveals their face-down card and must hit until their hand value is 17 or higher (standard rule, implied). If the dealer busts, all remaining players win.
    *   **Ending:** Compare remaining player hands to the dealer's hand.
*   **Scoring:**
    *   Cards 2-10: Face value.
    *   Jack, Queen, King (`ECardValue.Jack`, `Queen`, `King`): 10 points.
    *   Ace (`ECardValue.Ace`): 1 or 11 points (counts as 11 unless it would cause a bust, then counts as 1). Logic handled by `GetHandScore`.
    *   `LocalPlayerScore`, `DealerScore`: Track current scores.
*   **Outcomes & Payouts (`EPayoutType`):**
    *   **Blackjack:** Getting 21 with the first two cards (Ace + 10-value card).
        *   `IsLocalPlayerBlackjack`: Flag for player blackjack.
        *   `BLACKJACK_PAYOUT_RATIO`: Pays **1.5x** the bet (e.g., $10 bet pays $15 profit).
    *   **Win:** Player's final score is higher than the dealer's without busting, OR the dealer busts.
        *   `PAYOUT_RATIO`: Pays **1x** the bet (e.g., $10 bet pays $10 profit).
    *   **Push:** Player's score ties with the dealer's score. Bet is returned, no win/loss.
    *   **Lose:** Player busts, or dealer's score is higher than the player's without the dealer busting. Player loses their bet.
    *   `GetPayout` function calculates winnings based on bet amount and `EPayoutType`.
*   **UI (`BlackjackInterface.cs`):**
    *   Shows player list, bet controls, Hit/Stand buttons, player/dealer scores, and win/loss/bust notifications.

---

**Ride the Bus (RTB) (`RTBGameController.cs`)**

*   **Game Name:** Ride the Bus (RTB)
*   **Objective:** Correctly guess card outcomes across 4 stages, multiplying the initial bet with each correct guess.
*   **Betting:**
    *   `BET_MINIMUM`: **$10**
    *   `BET_MAXIMUM`: **$500**
    *   Players set an initial bet (`SetLocalPlayerBet`) using a slider.
    *   `LocalPlayerBetMultiplier`: Tracks the current multiplier applied to the initial bet (starts at 1x).
    *   `MultipliedLocalPlayerBet`: Calculates the current potential winnings (Initial Bet * Multiplier).
*   **Gameplay Flow & Stages (`EStage`):**
    *   Players join, place initial bets, and ready up.
    *   Game proceeds through stages for players who answer correctly:
        1.  **Red or Black:** Guess the color of the next card. (Multiplier likely becomes 2x).
        2.  **Higher or Lower:** Guess if the next card's rank is higher or lower than the previous card. (Multiplier likely becomes 4x).
        3.  **Inside or Outside:** Guess if the next card's rank falls between or outside the ranks of the previous two cards. (Multiplier likely becomes 8x).
        4.  **Suit:** Guess the suit of the next card. (Multiplier likely becomes 32x).
    *   `GetNetBetMultiplier` function determines the cumulative multiplier for completing a given stage. *(Actual multipliers per stage aren't explicit but inferred from common RTB rules).*
*   **Answering:**
    *   For each stage, a question and answer options are presented (`onQuestionReady`, `GetQuestionsAndAnswers`).
    *   `ANSWER_MAX_TIME`: Players have **6.0 seconds** to submit an answer (`RemainingAnswerTime`, `TimerSlider`).
    *   Player selects an answer button (`AnswerButtonClicked`).
    *   `QuestionDone`: Answer period ends.
*   **Outcomes:**
    *   **Correct Answer (`onLocalPlayerCorrect`):** Player advances to the next stage, `LocalPlayerBetMultiplier` increases.
    *   **Incorrect Answer (`onLocalPlayerIncorrect`):** Player loses the *entire potential winnings* (`MultipliedLocalPlayerBet`) accumulated so far and is out of the round.
    *   **Forfeit (`ForfeitButton`):** Before answering the next question, the player can choose to forfeit and collect their current `MultipliedLocalPlayerBet`.
    *   **Win Final Stage (`onFinalCorrect`):** If the player correctly guesses the final stage (Suit), they win the fully multiplied bet.
*   **Card Ranking:** `GetCardNumberValue` is used to determine card rank for Higher/Lower and Inside/Outside stages (Ace likely low, face cards likely 11, 12, 13 or all 10 - needs clarification).
*   **UI (`RTBInterface.cs`):**
    *   Shows current stage, question, answer buttons, timer, current bet, potential winnings (multiplied bet), and win/loss feedback.

---

**Slot Machine (`SlotMachine.cs`, `SlotReel.cs`)**

*   **Game Name:** Slot Machine
*   **Objective:** Spin three reels and match symbols according to payout rules.
*   **Betting:**
    *   `BetAmounts`: A predefined array of fixed bet amounts (e.g., $10, $25, $50, $100 - *specific values not listed but array exists*).
    *   Player uses `UpButton` and `DownButton` to cycle through `BetAmounts`.
    *   `BetAmountLabel` displays the currently selected bet.
*   **Gameplay Flow:**
    *   Player selects a bet amount.
    *   Player interacts with the handle (`HandleIntObj`, `HandleInteracted`). Requires sufficient cash.
    *   `SendStartSpin`: Server initiates the spin.
    *   `StartSpin` (Observer RPC): Server determines the outcome symbols (`ESymbol[] symbols`) for the three reels and sends this result to clients.
    *   Reels spin visually (`SlotReel.Spin`, `SpinSpeed`).
    *   Reels stop sequentially on the predetermined outcome symbols (`SlotReel.Stop`).
    *   `EvaluateOutcome`: The final symbol combination is evaluated to determine the win level (`EOutcome`).
    *   `DisplayOutcome`: Win animation (`MiniWinAnimation`, etc.), sound (`MiniWinSound`, etc.), and payout amount (`WinAmountLabels`) are displayed.
*   **Symbols (`ESymbol`):** Cherry, Lemon, Grape, Watermelon, Bell, Seven.
*   **Outcomes (`EOutcome`) & Payout Logic (`EvaluateOutcome`):**
    *   The code evaluates outcomes based on these checks (payout multipliers *not specified*, only win levels):
        *   **Jackpot:** Requires uniform symbols AND the symbol is Seven (Implied: 3 Sevens).
        *   **BigWin:** Requires uniform symbols AND the symbol is Bell (Implied: 3 Bells).
        *   **SmallWin:** Requires uniform symbols AND the symbol is Watermelon OR Grape (Implied: 3 Watermelons or 3 Grapes).
        *   **MiniWin:** Requires uniform symbols (Implied: 3 Lemons or 3 Cherries) OR if `IsAllFruit` returns true (Implied: any combination of 3 Cherries, Lemons, Grapes, Watermelons).
        *   **NoWin:** Any other combination.
    *   `GetWinAmount`: Calculates the payout amount based on the `EOutcome` and the `betAmount`. The actual multipliers per outcome level are internal game balance values not shown here.
*   **UI/Effects:**
    *   Uses `SlotReel` components for visual reel spinning and stopping.
    *   Uses `AnimationClips` and `AudioSourceControllers` for win celebrations.
    *   `JackpotParticles` for the highest win level.

---

This data is extracted directly from the provided C# code snippets and reflects the rules and parameters defined therein. Some standard game rules (like Blackjack dealer hitting rules or specific RTB multipliers) are inferred based on common practice and function names, as the exact implementation logic within methods was not fully visible.
```

# combat.md

```md
**NPC Combat AI (`CombatBehaviour.cs`)**

*   **Targeting & Visibility:**
    *   NPCs target a specific `Player` (`TargetPlayer`).
    *   They rely on a vision system (`ProcessVisionEvent`, `VisionEventReceipt`).
    *   `CheckPlayerVisibility`: Regularly checks if the target player is visible.
    *   `IsPlayerVisible()`: Returns true if the player is currently visible OR was visible within the `EXTRA_VISIBILITY_TIME`.
    *   `EXTRA_VISIBILITY_TIME`: **2.5 seconds**. NPCs "remember" seeing the player for 2.5 seconds after line of sight is broken.
    *   `lastKnownTargetPosition`: NPCs store the last position where they saw the target.
    *   `timeSinceLastSighting`: Tracks time since the player was last seen. Used for giving up.
*   **Combat Engagement & Giving Up:**
    *   `StartCombat`: Initiates combat logic when a target is set or becomes hostile.
    *   `EndCombat`: Logic for when combat ceases.
    *   **Give Up Conditions:** NPCs can stop fighting based on:
        *   `GiveUpRange`: If the target gets further than this distance (value not specified here, likely on the NPC asset).
        *   `GiveUpTime`: If they haven't seen the target for this duration (value not specified here). Checked via `UpdateTimeout` using `timeSinceLastSighting`.
        *   `GiveUpAfterSuccessfulHits`: If the NPC successfully hits the player this many times (value not specified here). Tracked by `successfulHits` variable, incremented by `SucessfulHit()`.
*   **Movement & Positioning:**
    *   `DefaultMovementSpeed`: Base movement speed multiplier during combat (value likely 0-1 range). Can be changed via `SetMovementSpeed`.
    *   `RepositionToTargetRange`: NPC attempts to move to an optimal distance from the target (or last known position).
    *   `GetMinTargetDistance()`, `GetMaxTargetDistance()`: Functions defining the ideal engagement range, likely based on the `currentWeapon`.
    *   `IsTargetInRange()`: Checks if the target is within the desired weapon range.
    *   `REACHED_DESTINATION_DISTANCE`: **2.0 meters**. The AI considers itself "at" its movement destination when within this distance.
*   **Weapon Handling & Attack:**
    *   `DefaultWeapon`: The standard weapon the NPC uses.
    *   `VirtualPunchWeapon`: A fallback "weapon" representing unarmed punches if no other weapon is available/suitable.
    *   `SetWeapon`: NPCs can dynamically switch weapons during combat (e.g., from ranged to melee if target is close). Called via network command.
    *   `ClearWeapon`: Removes the NPC's current weapon.
    *   `ReadyToAttack()`: Checks conditions before attacking (e.g., weapon equipped, target visible, within range, weapon cooldown finished).
    *   `Attack()`: Executes the attack sequence for the `currentWeapon`. Called via network command.
    *   `SucessfulHit()`: Called internally when an attack hits the player target.
    *   `consecutiveMissedShots`: Tracks how many shots in a row have missed the target.
    *   `CONSECUTIVE_MISS_ACCURACY_BOOST`: **0.1 (10%)**. For *each* consecutive missed shot, the NPC gains a 10% accuracy boost on their next shot. (This makes NPCs progressively more dangerous if you only dodge).
*   **Searching Behavior:**
    *   Triggered when the target is lost (`timeSinceLastSighting` exceeds `EXTRA_VISIBILITY_TIME`).
    *   `IsSearching`: Boolean flag indicating if the NPC is actively searching.
    *   `StartSearching()`, `StopSearching()`, `SearchRoutine()`: Manages the search state and coroutine.
    *   `DefaultSearchTime`: The initial duration the NPC will search for (value not specified here). May be extended based on factors like how long the player was visible (`playerSightedDuration`).
    *   `SEARCH_RADIUS_MIN`: **25.0 meters**. Minimum radius around `lastKnownTargetPosition` to search within.
    *   `SEARCH_RADIUS_MAX`: **60.0 meters**. Maximum radius around `lastKnownTargetPosition` to search within. Radius likely expands over time.
    *   `GetNextSearchLocation()`: AI picks random reachable points within the search radius to move towards.
    *   `SEARCH_SPEED`: **0.4**. Likely influences how fast the search radius expands or the NPC's movement speed *while* searching (needs confirmation).
*   **Other Behaviors:**
    *   `UpdateLookAt`: NPC constantly turns to face the target or `lastKnownTargetPosition`.
    *   `PlayAngryVO`: Flag to enable angry voice lines during combat. Triggered periodically (`nextAngryVO` timer).

---

**Combat Management & Systems (`CombatManager.cs`)**

*   **Central Hub:** Manages global combat elements like explosions and layer masks.
*   **Layer Masks:** Defines collision layers used for different attack types:
    *   `MeleeLayerMask`: Layers checked for melee hits.
    *   `ExplosionLayerMask`: Layers checked for explosion damage/force.
    *   `RangedWeaponLayerMask`: Layers checked for ranged weapon hits (bullets, etc.). (Useful for players to know what environment objects might provide cover).
*   **Explosions:**
    *   `ExplosionPrefab`: The standard visual/audio effect template used when an explosion occurs.
    *   `CreateExplosion()`: Function called to initiate an explosion at a `origin` point using specific `ExplosionData`. Logic is handled server-side and broadcast to clients.

---

**Damage & Impact System (`Impact.cs`, `IDamageable.cs`, `EImpactType.cs`, `PhysicsDamageable.cs`)**

*   **`Impact` Class:** Represents a single instance of damage/force being applied. Contains:
    *   `HitPoint`: World position of the impact.
    *   `ImpactForceDirection`: Vector describing the direction of the force.
    *   `ImpactForce`: Magnitude of the physical push force applied.
    *   `ImpactDamage`: Amount of health damage dealt.
    *   `ImpactType` (`EImpactType`): The type of damage source.
    *   `ImpactSource`: The `NetworkObject` (e.g., Player, NPC) that caused the impact.
    *   `ImpactID`: Unique identifier to prevent duplicate processing.
*   **`EImpactType` Enum:** Categorizes damage sources:
    *   `Punch`
    *   `BluntMetal` (e.g., crowbar)
    *   `SharpMetal` (e.g., knife)
    *   `Bullet`
    *   `PhysicsProp` (e.g., being hit by a thrown object)
    *   `Explosion`
    *   `IsLethal()`: A check exists to determine if certain impact types are inherently deadly (e.g., maybe explosions under certain conditions).
*   **`IDamageable` Interface:** Any object that can take damage must implement this (Players, NPCs, potentially some props). Requires methods:
    *   `SendImpact`: Sends an impact event (likely called by the attacker).
    *   `ReceiveImpact`: Processes an incoming impact (called on the damaged object).
*   **`PhysicsDamageable` Component:** Allows physics objects (`Rigidbody`) to be affected by impacts.
    *   Applies force (`ImpactForce`) to the `Rigidbody` based on the `Impact` data.
    *   `ForceMultiplier`: Adjusts how strongly the object reacts to impact forces.

---

**Explosions (`Explosion.cs`, `ExplosionData.cs`)**

*   **`ExplosionData` Struct:** Defines the parameters of an explosion:
    *   `DamageRadius`: Radius within which health damage is applied.
    *   `MaxDamage`: Damage dealt at the epicenter (likely falls off with distance).
    *   `PushForceRadius`: Radius within which physical push force is applied.
    *   `MaxPushForce`: Force applied at the epicenter (likely falls off with distance).
    *   `DefaultSmall`: A predefined set of values for a standard small explosion exists.
*   **`Explosion` Component:** The actual explosion effect placed in the world, plays sound (`AudioSourceController`).

---

**Player Punching (`PunchController.cs`)**

*   **Activation:** Punching is enabled (`PunchingEnabled`) only when the player doesn't have an item equipped (`ShouldBeEnabled` likely checks `player.EquipController.EquippedItem`).
*   **Mechanics:**
    *   Hold input (e.g., Mouse Button) to `StartLoad` (charge the punch).
    *   `MAX_PUNCH_LOAD`: **1.0** (likely seconds) is the maximum charge time.
    *   Release input to `Release` the punch. Punch power scales with `punchLoad`.
    *   `ExecuteHit`: Performs a check (likely raycast or spherecast) forward from the player.
    *   `PUNCH_RANGE`: **1.25 meters**. Maximum reach of a punch.
    *   If a hit occurs on an `IDamageable` object/character, an `Impact` is sent.
*   **Damage & Force:**
    *   `MinPunchDamage`, `MaxPunchDamage`: Range of damage dealt, scales with charge `power`.
    *   `MinPunchForce`, `MaxPunchForce`: Range of physical force applied, scales with charge `power`.
    *   `ImpactType`: Sent as `EImpactType.Punch`.
*   **Costs & Cooldown:**
    *   `MinStaminaCost`, `MaxStaminaCost`: Stamina consumed per punch, scales with charge `power`. Player must have enough stamina (`CanStartLoading` likely checks this).
    *   `MIN_COOLDOWN`: **0.1 seconds**. Minimum time after a punch before starting the next.
    *   `MAX_COOLDOWN`: **0.2 seconds**. Maximum time after a punch before starting the next (Cooldown might vary slightly).
    *   `PUNCH_DEBOUNCE`: **0.1 seconds**. Short delay potentially preventing accidental inputs immediately after a punch.
*   **Feedback:**
    *   `PunchSound`: Plays a sound on impact.
    *   `PunchAnimator`: Uses a specific animator controller for the punching animation (likely on player's arms/viewmodel).
    *   `ViewmodelAvatarOffset`: Adjusts the viewmodel position during punching.

---

This covers the core combat systems defined in the code, including NPC behavior rules, player punching mechanics, and how damage/explosions are handled.
```

# delivery.md

```md
**Overall Delivery System (`DeliveryManager.cs`)**

*   **Central Management:** There's a global `DeliveryManager` that tracks *all* active deliveries in the game.
*   **Persistence:** The state of all ongoing deliveries (items, destination, status, time remaining) is saved when the player quits and reloaded when they continue (`ISaveable`).
*   **Time Progression:** The manager updates the status and timers of all deliveries every minute (`OnMinPass`).
*   **Initiation:** Deliveries are initiated server-side (`SendDelivery`) and synchronized to clients (`ReceiveDelivery`), likely triggered when the player places an order via an online shop interface.
*   **Dock Availability:** The manager checks if a specific loading dock at a destination property is currently occupied (`IsLoadingBayFree`). A dock can likely only handle one delivery at a time.
*   **Vehicle Despawning:** The manager seems to track how long a delivery vehicle has been empty at the dock (`minsSinceVehicleEmpty`), likely to despawn it after a certain period.

**Delivery Order (`DeliveryInstance.cs`)**

*   **Represents:** A single delivery order placed by the player.
*   **Key Information:**
    *   `DeliveryID`: A unique identifier for this specific delivery.
    *   `StoreName`: The name of the shop the order was placed from (e.g., "Hardware Store", "Seed Supplier").
    *   `DestinationCode`: An identifier for the target player-owned property.
    *   `LoadingDockIndex`: Specifies *which* loading dock at the destination property the delivery is heading to (relevant if properties have multiple docks).
    *   `Items`: An array listing the specific items (`string` Item ID) and their quantities (`int`) included in this delivery. **This is the core payload.**
    *   `Status`: The current state of the delivery, using the `EDeliveryStatus` enum.
    *   `TimeUntilArrival`: A countdown timer (in minutes) showing how long until the delivery vehicle reaches the destination. This decreases by 1 each game minute (`OnMinPass`).
*   **Status Updates:** The `Status` of the delivery changes as it progresses (see `EDeliveryStatus` below). The `DeliveryManager` handles updating this state (`SetDeliveryState`).
*   **Item Handling:** The `AddItemsToDeliveryVehicle` method suggests items are virtually loaded onto the vehicle when the delivery starts.

**Delivery Status (`EDeliveryStatus.cs`)**

*   Defines the stages a delivery goes through:
    1.  `InTransit`: The delivery vehicle is currently traveling. `TimeUntilArrival` is counting down.
    2.  `Waiting`: The vehicle has likely arrived but might be waiting for the dock to be clear or for player interaction (exact condition unclear, but distinct from just arriving).
    3.  `Arrived`: The vehicle is confirmed to be at the loading dock.
    4.  `Completed`: The items have been successfully transferred from the vehicle/dock into the property's storage, or the delivery process is otherwise finished.

**Delivery Vehicle (`DeliveryVehicle.cs`)**

*   **Represents:** The physical truck/van that performs the delivery in the game world.
*   **Association:** Each active `DeliveryVehicle` is linked to a specific `DeliveryInstance` (`Activate` method).
*   **Function:** It visually represents the delivery process and physically occupies the `LoadingDock` upon arrival.
*   **Lifecycle:** Vehicles are activated when a delivery starts and deactivated (`Deactivate`) sometime after completion, likely managed by the `DeliveryManager`.

**Loading Dock (`LoadingDock.cs`)**

*   **Represents:** The physical interaction point at a player-owned property where deliveries arrive.
*   **Identification:** Each dock has a unique `BakedGUID` and is associated with a `ParentProperty`.
*   **Occupancy:**
    *   Uses a `VehicleDetector` to sense when a `DeliveryVehicle` is present.
    *   `IsInUse`: A flag indicating if the dock is currently occupied by a delivery vehicle. This likely prevents other deliveries from using the same dock simultaneously.
*   **Interaction:**
    *   Has specific `accessPoints` where the player might need to stand.
    *   Has a `uiPoint` for potential UI elements.
    *   Can be visually outlined (`ShowOutline`, `HideOutline`).
*   **Item Transfer:**
    *   Crucially, loading docks act as `ITransitEntity` and have `InputSlots` and `OutputSlots`. This strongly implies that **items are transferred from the arrived delivery vehicle/dock slots into the property's internal storage via these slots.** The player might need to manually initiate this transfer, or it might be automated if staff are present.
*   **Connectivity:** Can be linked within a property management system (`LinkOrigin`).

**Summary of Player-Relevant Delivery Mechanics:**

1.  **Ordering:** Players order items from online shops.
2.  **Delivery Creation:** An order creates a `DeliveryInstance` tracked by the `DeliveryManager`.
3.  **Transit:** A `DeliveryVehicle` is assigned, and the delivery enters `InTransit` status with a `TimeUntilArrival` countdown (in minutes).
4.  **Arrival:** When the timer hits zero, the vehicle physically arrives at the specified `LoadingDock` of the player's property. The dock becomes `IsInUse`. The delivery status likely changes to `Arrived` or `Waiting`.
5.  **Item Transfer:** Items must be transferred from the loading dock's slots (`InputSlots`/`OutputSlots`) into the property's storage system. This might require player interaction at the dock's `accessPoints` or could potentially be automated.
6.  **Completion:** Once items are transferred, the delivery status becomes `Completed`.
7.  **Dock Clearance:** The delivery vehicle eventually despawns (`Deactivate`), freeing up the `LoadingDock` for the next delivery.
8.  **Persistence:** Delivery progress is saved, so deliveries will continue en route or wait at docks even after reloading the game.
9.  **Concurrency Limit:** Only one delivery vehicle can use a specific loading dock at a time.
```

# Economy.md

```md
**General Notes:**

*   This data comes from the game's code (`.cs` files), revealing underlying mechanics, calculations, and constants.
*   It complements the asset dumps (`.md` files) by showing *how* the game uses the items and stats defined there.
*   Many values are `const` (constants), meaning they are fixed rules in the game.
*   `[SyncVar]` indicates variables synchronized across multiplayer sessions.
*   `[ServerRpc]`, `[ObserversRpc]`, `[TargetRpc]` relate to multiplayer networking logic but often trigger functions that reveal game rules.
*   `ISaveable` indicates that the state of this object (like a Customer or Dealer) is saved between game sessions.

---

**Customer Mechanics (`Customer.cs`, `CustomerData.cs`, `CustomerAffinityData.cs`, `CustomerSatisfaction.cs`, `ECustomerStandard.cs`, `StandardsMethod.cs`)**

*   **Core Function:** Customers are NPCs who can potentially buy products from the player or their dealers. They have individual preferences, relationships, and addiction levels.
*   **Unlocking Customers:**
    *   Customers need to be unlocked.
    *   `SAMPLE_REQUIRES_RECOMMENDATION`: This is `false`, meaning you *might* be able to offer samples without a prior recommendation, but relationship likely still matters. (`CanBeDirectlyApproached` in `CustomerData` likely controls this per customer type).
    *   `MIN_NORMALIZED_RELATIONSHIP_FOR_RECOMMENDATION`: Requires **0.5** normalized relationship (likely on a 0-1 scale, so 50%) with a mutual friend/contact to get a recommendation *to* this customer.
    *   Giving a successful sample (`SampleWasSufficient`) can unlock a customer.
    *   `GuaranteeFirstSampleSuccess` (in `CustomerData`): Some customer types might automatically accept the first sample offered.
    *   `Min/MaxMutualRelationRequirement` (in `CustomerData`): Define relationship thresholds needed with mutual contacts for direct approaches to succeed (chance scales between min and max).
    *   `CallPoliceChance` (in `CustomerData`): Chance police are called if a direct approach fails.
*   **Addiction & Dependence:**
    *   `CurrentAddiction`: Tracks the customer's addiction level (synced in multiplayer).
    *   `ADDICTION_DRAIN_PER_DAY`: Addiction naturally decreases by **0.0625** (6.25%) per day if the customer doesn't consume.
    *   `DependenceMultiplier` (in `CustomerData`): Controls how quickly addiction builds for this customer type (Range 0-2).
    *   `BaseAddiction` (in `CustomerData`): The starting and minimum addiction level for this customer type (Range 0-1).
    *   `APPROACH_MIN_ADDICTION`: Customer must have at least **0.33** (33%) addiction to approach the player unsolicited asking for product.
    *   `ConsumeProduct` function increases `CurrentAddiction`. Addiction amount likely depends on the product consumed (taken from product/effect stats).
*   **Preferences:**
    *   `CustomerAffinityData`: Stores preferences for drug types.
        *   `ProductTypeAffinity`: Links `EDrugType` (e.g., Marijuana, Meth) to an `Affinity` value from **-1 (hates) to 1 (loves)**.
    *   `PreferredProperties` (in `CustomerData`): A list of specific `Property` assets (Effects like Calming, Energizing) the customer particularly likes.
    *   `Standards` (in `CustomerData`): Defines the customer's quality expectation (`ECustomerStandard` enum: VeryLow, Low, Moderate, High, VeryHigh).
        *   `StandardsMethod`: Links `ECustomerStandard` to a corresponding `EQuality` level.
    *   `GetProductEnjoyment` function calculates how much a customer likes a specific product based on type affinity, preferred properties, and quality matching their standards.
*   **Deal Generation & Contracts:**
    *   Customers can offer contracts (`OfferContract`).
    *   `CheckContractGeneration`: Logic determining if/when a customer offers a deal. Factors likely include time since last deal, relationship, addiction, preferences, and potentially `CustomerData` settings (like `Min/MaxOrdersPerWeek`, `PreferredOrderDay`).
    *   `GetWeightedRandomProduct`: Selects which product the customer wants based on their preferences.
    *   `Min/MaxWeeklySpend` (in `CustomerData`): Defines the range of money this customer type aims to spend per week. Influences offer size/frequency.
    *   `GetAdjustedWeeklySpend`: Weekly spend is adjusted based on the player's relationship with the customer.
    *   `OfferContractInfo`: Stores details of a currently offered deal (product, quantity, price, location, time).
    *   `OFFER_EXPIRY_TIME_MINS`: Offers expire after **600** minutes (10 hours) if not accepted/rejected.
    *   `DEAL_COOLDOWN`: Minimum **600** minutes (10 hours) cooldown after a deal before another can be generated/offered.
    *   `MIN_ORDER_APPEAL`: A minimum appeal threshold (calculated based on product/price/preferences) needed for a customer to even consider making an offer (**0.05**).
*   **Accepting/Rejecting/Countering Deals:**
    *   Player receives offers via messages (`NotifyPlayerOfContract`).
    *   Player can Accept (`AcceptContractClicked`), Reject (`ContractRejected`), or potentially Counter-Offer (`CounterOfferClicked`, `ProcessCounterOfferServerSide`).
    *   `EvaluateCounteroffer`: Logic for the customer deciding whether to accept a player's counter-offer. Depends on the offered product, quantity, and price compared to their preferences and budget (`GetValueProposition`).
*   **Deal Fulfillment (Handover):**
    *   `IsAwaitingDelivery`: Flag indicating the customer is waiting for the player/dealer.
    *   `DeliveryLocation`: Specifies where the deal takes place.
    *   `DealSignal`: An NPC schedule signal used to make the customer wait at the location.
    *   `DEAL_ATTENDANCE_TOLERANCE`: Customer will wait **10** minutes past the scheduled time before potentially leaving.
    *   `ProcessHandover`: Handles the exchange of items and money.
    *   `EvaluateDelivery`: **Crucial function.** Calculates customer satisfaction based on:
        *   Matching the requested `ProductDefinition`.
        *   Matching the required `EQuality` (or acceptable range based on `Standards`).
        *   Quantity provided vs requested.
        *   Price paid vs expected value.
        *   Presence of preferred/disliked properties.
        *   Resulting `satisfaction` value influences relationship and addiction changes.
    *   `CustomerRejectedDeal`: Occurs if the player offers the wrong items or tries to rip them off significantly.
    *   `DEAL_REJECTED_RELATIONSHIP_CHANGE`: Relationship decreases by **-0.5** if the player/dealer fails the deal or offers wrong items.
*   **Relationship & Satisfaction:**
    *   Relationship impacts deal generation frequency, weekly spending (`GetAdjustedWeeklySpend`), recommendation chances, and potentially prices/satisfaction.
    *   `CustomerSatisfaction.GetRelationshipChange`: Calculates relationship change based on deal `satisfaction` value.
    *   `AFFINITY_MAX_EFFECT`: Max impact of drug type affinity on satisfaction/price is **0.3** (30%).
    *   `PROPERTY_MAX_EFFECT`: Max impact of preferred/disliked properties on satisfaction/price is **0.4** (40%).
    *   `QUALITY_MAX_EFFECT`: Max impact of product quality on satisfaction/price is **0.3** (30%).
*   **Recommendations:**
    *   `CanRecommendFriends`: Flag determining if this customer can recommend other potential customers.
    *   `ContractWellReceived`: Triggers recommendations if satisfaction is high enough.
    *   `RELATIONSHIP_FOR_GUARANTEED_DEALER_RECOMMENDATION`: Requires **0.6** normalized relationship for the customer to guarantee recommending a specific dealer (if applicable).
    *   `RELATIONSHIP_FOR_GUARANTEED_SUPPLIER_RECOMMENDATION`: Requires **0.6** normalized relationship for the customer to guarantee recommending a specific supplier (if applicable).
*   **Direct ("Instant") Deals:**
    *   `ShowOfferDealOption`: Player might be able to initiate a deal directly when talking to the customer.
    *   `OfferDealValid`: Checks if conditions are met (e.g., not on cooldown, relationship high enough).
    *   `InstantDealOffered`: Triggers the instant deal UI.
    *   `GetOfferSuccessChance`: Calculates the chance the customer accepts the player's offered items/price.
*   **Demo Availability:**
    *   `AvailableInDemo`: Flag per customer whether they appear in the demo.
*   **Saving:** Customer state (addiction, relationship, cooldowns, etc.) is saved (`ISaveable`).

---

**Dealer Mechanics (`Dealer.cs`)**

*   **Core Function:** Dealers are NPCs the player can recruit to manage customers and automate sales.
*   **Recruitment:**
    *   Dealers need to be unlocked/recruited (`IsRecruited`, `InitialRecruitment`).
    *   Requires a recommendation (`HasBeenRecommended`, triggered by `MarkAsRecommended`).
    *   `SigningFee`: Cost to recruit the dealer.
    *   `RecruitDialogue`: Specific dialogue for recruitment.
*   **Customer Management:**
    *   `MAX_CUSTOMERS`: Dealers can only manage **8** customers at a time.
    *   `AssignedCustomers`: List of customers currently managed by this dealer.
    *   Player assigns/removes customers (`AssignCustomersDialogue`, `SendAddCustomer`, `SendRemoveCustomer`).
*   **Inventory & Stock:**
    *   `ItemSlots`, `OverflowSlots`: Dealers have inventory slots to hold products supplied by the player. Overflow slots (`OVERFLOW_SLOT_COUNT` = 10) likely hold items temporarily if main slots are full.
    *   Player needs to stock the dealer (`TradeItems`).
    *   `GetProductCount`: Checks how much of a specific product (within quality range) the dealer has.
    *   `RemoveContractItems`: Dealer uses items from their inventory to fulfill contracts.
    *   `SellInsufficientQualityItems`, `SellExcessQualityItems`: Flags determining if the dealer will sell items slightly below or above the requested quality.
*   **Handling Deals:**
    *   `ShouldAcceptContract`: Logic determining if the dealer accepts a contract offered by an assigned customer (likely checks if they have stock).
    *   `ContractedOffered`: Called when a customer offers the dealer a contract.
    *   `ActiveContracts`: List of deals the dealer is currently handling.
    *   `DealSignal`: NPC schedule signal to handle the deal meeting.
    *   `CompletedDeal`: Called when a deal is finished. Increases `CompletedDealsVariable`.
    *   `RELATIONSHIP_CHANGE_PER_DEAL`: Player relationship with the dealer increases by **0.05** per completed deal.
*   **Deal Timing & Location:**
    *   `EDealWindow`: Deals occur within specific time windows (Morning, Afternoon, Night, LateNight).
    *   `DEAL_ARRIVAL_DELAY`: Dealer arrives **30** minutes before the scheduled deal time.
    *   `MIN_TRAVEL_TIME`, `MAX_TRAVEL_TIME`: Defines the range (15-360 mins) for dealer travel time calculation to the deal location.
    *   Deals likely happen at the `DeliveryLocation` specified in the customer's contract.
*   **Cash Management:**
    *   `Cash`: Stores the money earned from sales (synced in multiplayer).
    *   `Cut`: The percentage of sales the dealer keeps (**value not specified in this snippet**, likely defined on the specific dealer asset).
    *   `SubmitPayment`: Called by the customer's contract logic to give the dealer money.
    *   Player collects accumulated cash from the dealer (`CollectCashDialogue`, `CollectCash`).
    *   `CASH_REMINDER_THRESHOLD`: Dealer might remind player to collect cash if it exceeds **$500**.
*   **Home Base:**
    *   `Home`: The building the dealer resides in when not working.
    *   `HomeName`: Display name of their home base.
*   **Saving:** Dealer state (cash, assigned customers, inventory) is saved.

---

**Supplier Mechanics (`Supplier.cs`, `SupplierLocation.cs`, `SupplierStash.cs`)**

*   **Core Function:** Suppliers are NPCs from whom the player orders items (seeds, ingredients, equipment).
*   **Unlocking:**
    *   Suppliers need to be unlocked (`SendUnlocked`).
    *   `SupplierUnlockHint`: Text guiding the player on how to unlock them.
    *   Likely unlocked via relationship progression with recommending NPCs (customers/dealers).
*   **Ordering - Dead Drops:**
    *   Primary method of ordering is via the phone (`PhoneShopInterface`).
    *   `OnlineShopItems`: Defines items the supplier sells online.
    *   `MinOrderLimit`, `MaxOrderLimit`: Minimum and maximum value for a single dead drop order. `GetDeadDropLimit` calculates the current effective limit, possibly based on relationship.
    *   `DEADDROP_ITEM_LIMIT`: Max **10** *distinct item types* per dead drop order.
    *   `DeaddropRequested`, `DeaddropConfirmed`: Handles the order process via messages.
    *   `deadDropPreparing`: Flag indicating an order is being prepared.
    *   `minsUntilDeaddropReady`: Countdown timer for order readiness.
    *   `DEADDROP_WAIT_PER_ITEM`: Preparation takes **30** minutes per distinct item type ordered.
    *   `DEADDROP_MAX_WAIT`: Maximum preparation time capped at **360** minutes (6 hours).
    *   `CompleteDeaddrop`: Places ordered items into a random empty `DeadDrop` location. `onDeaddropReady` event likely notifies player.
*   **Debt System:**
    *   `debt`: Tracks how much money the player owes the supplier (synced). Increases when an order is confirmed (`ChangeDebt`).
    *   Player likely needs to pay back debt, possibly via interaction (`PayDebtRequested`) or automatically (`TryRecoverDebt` - maybe deducts from player cash?).
    *   `SendDebtReminder`: Supplier sends messages reminding player to pay.
*   **Meetings:**
    *   `MEETUP_RELATIONSHIP_REQUIREMENT`: Requires **4.0** relationship (likely on a 0-5 scale) to request a direct meeting.
    *   `MeetupRequested`: Handles the request via messages.
    *   `MeetAtLocation`: Supplier travels to a `SupplierLocation`.
    *   `MEETUP_DURATION_MINS`: Meetings last **360** minutes (6 hours).
    *   `MEETING_COOLDOWN_MINS`: **720** minutes (12 hours) cooldown between meetings.
    *   Meetings might allow paying debt or accessing special stock (`ShopInterface` reference).
*   **Deliveries:**
    *   `DeliveriesEnabled`: Flag indicating if direct deliveries are unlocked.
    *   `DELIVERY_RELATIONSHIP_REQUIREMENT`: Requires **5.0** relationship (max?) to potentially unlock deliveries. The exact mechanic isn't fully detailed here, but might involve items being delivered to player-owned locations or the `SupplierLocation`'s `DeliveryBays`.
*   **Locations:**
    *   `SupplierLocation`: Specific map locations where suppliers can be met. Have `SupplierStandPoint` and potentially `DeliveryBays`.
    *   `SupplierStash`: A physical container linked to the supplier. Might hold cash collected automatically or special items. Player can interact (`Interacted`) and potentially take cash (`RemoveCash`).
*   **Saving:** Supplier state (debt, cooldowns, unlocked status) is saved.

---

**Other Key Structures & Enums:**

*   **`DeadDrop.cs`:** Represents physical dead drop locations on the map with storage (`StorageEntity`). Can be queried for random empty locations (`GetRandomEmptyDrop`).
*   **`DealGenerationEvent.cs`:** Defines potential scripted or recurring contract offers with specific products, payment, timing, locations, and requirements.
*   **`DealWindowInfo.cs`:** Defines the 4 time windows for deals: `Morning`, `Afternoon`, `Night`, `LateNight`. Each lasts **360** minutes (6 hours). Provides static methods to get the info for a window or determine the current window based on time.
*   **`DeliveryLocation.cs`:** Defines physical locations for customer/dealer meetups. Has specific standing points (`CustomerStandPoint`) and potentially teleport points for NPCs.
*   **`ECustomerStandard.cs`:** Enum defining customer quality expectations (VeryLow to VeryHigh).
*   **`EDealWindow.cs`:** Enum defining the 4 deal time windows.
*   **`ProductTypeAffinity.cs`:** Simple class linking a `EDrugType` to a float `Affinity` value (-1 to 1).

---

This extracted information provides a deep dive into the game's NPC interaction systems, economic loops, and the rules governing them. It should be sufficient to build detailed guides and calculators without needing the raw code anymore.
```

# employees.md

```md
**General Employee Mechanics (`Employee.cs`, `EmployeeManager.cs`, `EEmployeeType.cs`)**

*   **Core Function:** Employees are NPCs hired by the player to automate tasks within a specific player-owned `Property`.
*   **Types:** There are distinct employee types (`EEmployeeType` enum):
    *   `Botanist`: Handles planting, growing, harvesting, and drying plants.
    *   `Chemist`: Operates chemistry stations, ovens, cauldrons, and mixing stations.
    *   `Cleaner`: Collects trash and manages trash bins/bags.
    *   `Packager`: Packages finished products using packaging stations and brick presses. (Seems to be the role formerly called "Handler").
*   **Hiring & Generation (`EmployeeManager.cs`):**
    *   Employees are generated by the `EmployeeManager`.
    *   Hiring likely happens through quests (`Quest_Employees`) or a management interface.
    *   Each employee gets a randomly generated name (from lists `MaleFirstNames`, `FemaleFirstNames`, `LastNames`), gender (`MALE_EMPLOYEE_CHANCE` = 67% chance of being male), appearance (`MaleAppearances`, `FemaleAppearances` lists containing `AvatarSettings` and a `Mugshot`), and voice (`MaleVoices`, `FemaleVoices`).
    *   The manager tries to ensure unique names and appearances (`takenNames`, `takenMaleAppearances`, etc.).
    *   Upon hiring, an employee is instantiated from a specific prefab (`BotanistPrefab`, `ChemistPrefab`, etc.) and assigned to the player's property.
    *   **Cost:** Requires paying a one-time `SigningFee`.
*   **Payment & Needs:**
    *   **Wage:** Requires a `DailyWage` paid each day.
    *   `PaidForToday`: Tracks if the daily wage has been paid (`SyncVar` - status shared in multiplayer).
    *   **Consequences of Non-Payment:** If not paid (`!PaidForToday`), the employee `CanWork()` check fails. They will likely stop working, trigger the `NotPaidDialogue`, potentially wait outside the property (`WaitOutside` behaviour), and may eventually leave or need to be fired.
    *   **Bed:** Employees require an assigned `BedItem` within the property (`GetBed()` method). Lack of a bed triggers `BedNotAssignedDialogue` and is considered a work issue preventing them from working properly.
*   **Work Assignment & Configuration (`IConfigurable` Interface):**
    *   Employees need to be configured by the player to perform tasks. This interface is implemented by specific employee types (Botanist, Chemist, etc.).
    *   Configuration involves assigning specific stations (pots, chem stations, bins, packagers) located within their `AssignedProperty`.
    *   Configuration likely also includes setting:
        *   **Supply Storage:** Where the employee gets raw materials (seeds, soil, additives, ingredients, packaging, trash bags).
        *   **Output Storage:** Where the employee places finished products (harvested plants, chemicals, packaged goods).
        *   **Specific Tasks/Recipes:** What seeds to plant, what chemicals to mix, what products to package.
    *   `ConfigurationReplicator`: Handles syncing this configuration data in multiplayer.
    *   `CurrentPlayerConfigurer`: Tracks which player is currently editing the employee's configuration (`SyncVar`).
*   **Work Logic & Issues:**
    *   `UpdateBehaviour`: The core loop where employees decide their next action.
    *   `CanWork()`: Checks prerequisites (assigned property, paid, has bed, possibly configured).
    *   `ShouldIdle()`: Determines if the employee has any valid tasks available. If true, they likely wander or stand idle.
    *   **Work Issues:** If an employee cannot work, they generate `NoWorkReason`s (with `Reason`, `Fix`, `Priority`). Players can likely query this status via dialogue (`WorkIssueDialogueTemplate`, `OnNotWorkingDialogue`). Common issues include:
        *   Not paid (`NotPaidDialogue`).
        *   No bed assigned (`BedNotAssignedDialogue`).
        *   Stations not assigned or configured (Specific dialogues like `NoAssignedStationsDialogue`, `UnspecifiedPotsDialogue`).
        *   Missing materials in supply storage (`MissingMaterialsDialogue`).
        *   Output storage full.
        *   Target station inaccessible.
    *   `TimeSinceLastWorked`: Tracks inactivity.
*   **Firing:**
    *   Players can fire employees (`SendFire`, `FireDialogue`).
    *   Fired employees `LeavePropertyAndDespawn`.
*   **Other Behavior:**
    *   Employees generally **do not** react to player crime (`ShouldNoticeGeneralCrime` returns false). `NPCResponses_Employee` handles reactions if attacked directly.
    *   They have basic NPC pathfinding and interaction capabilities.
*   **Saving:** Employee state (assignment, payment status, potentially configuration via the replicator) is saved (`GetSaveString` exists).

---

**Botanist Specifics (`Botanist.cs`)**

*   **Role:** Manages plants and drying racks.
*   **Stations:** Assigned `Pot`s and `DryingRack`s.
*   **Limits:** `MaxAssignedPots` (maximum number of pots assignable).
*   **Tasks & Logic:**
    *   **Watering:** Checks assigned pots. Waters if water level is below `WATERING_THRESHOLD` (critical below `CRITICAL_WATERING_THRESHOLD`). Aims to fill between `TARGET_WATER_LEVEL_MIN` and `TARGET_WATER_LEVEL_MAX`. Requires a water source accessible. Action Time: `WATER_POUR_TIME`.
    *   **Soil:** Fills empty assigned pots with soil. Requires soil in supply storage. Action Time: `SOIL_POUR_TIME`.
    *   **Sowing:** Plants seeds in assigned pots that have soil but no plant. Requires seeds (potentially specific types based on config) in supply storage. Action Time: `SEED_SOW_TIME`.
    *   **Additives:** Applies configured additives to growing plants at appropriate stages. Requires additives in supply storage. Action Time: `ADDITIVE_POUR_TIME`.
    *   **Harvesting:** Harvests fully grown plants from assigned pots. Places harvested items into configured output/supply storage. Action Time: `HARVEST_TIME`.
    *   **Drying:**
        *   Identifies dryable items (`QualityItemInstance`) in supply storage (`GetDryableInSupplies`).
        *   Finds an assigned, available `DryingRack` (`GetAssignedDryingRackFor`).
        *   Moves the item to the rack (`CanMoveDryableToRack`, uses `MoveItemBehaviour`).
        *   Starts the rack (`StartDryingRack`).
        *   Collects finished items from the rack when done (`StopDryingRack`, `GetRacksToStop`).
        *   Moves finished dried items to output storage (`GetRacksReadyToMove`).
*   **Configuration Needs:** Assigned Pots, Assigned Drying Racks, Supply Storage (Soil, Seeds, Additives, Water Source), Output Storage (Harvested items, Dried items). Needs specification of which seed/additives to use for which pot.
*   **Work Issues:** No assigned pots/racks, missing soil/seeds/additives/water, output full, pot specification missing, destination storage not set (`NullDestinationPotsDialogue`).
*   **UI:** Has a `BotanistUIElement` worldspace UI.

---

**Chemist Specifics (`Chemist.cs`)**

*   **Role:** Operates advanced crafting stations.
*   **Stations:** Assigned `ChemistryStation`, `LabOven`, `Cauldron`, `MixingStation`.
*   **Limits:** `MAX_ASSIGNED_STATIONS` = 4 (total combined stations).
*   **Tasks & Logic:**
    *   Checks assigned stations for readiness (`GetChemistryStationsReadyToStart`, etc.).
    *   Checks supply storage for required ingredients based on configured recipes/processes for each station.
    *   Starts the process on a ready station if ingredients are available (`StartChemistryStationBehaviour`, etc.).
    *   Monitors running processes.
    *   Collects finished products from stations (`FinishLabOvenBehaviour`, `GetLabOvensReadyToFinish`).
    *   Moves finished products to configured output storage (`GetLabOvensReadyToMove`, etc., uses `MoveItemBehaviour`).
*   **Configuration Needs:** Assigned Stations, Supply Storage (Ingredients, items to process/mix), Output Storage (Finished chemicals/products). Needs specification of recipes/mixes for each station.
*   **Work Issues:** No assigned stations, missing ingredients, output full, recipes not configured.
*   **UI:** Has a `ChemistUIElement` worldspace UI.

---

**Cleaner Specifics (`Cleaner.cs`)**

*   **Role:** Keeps the property tidy.
*   **Stations:** Assigned `TrashContainerItem`s (Trash Bins).
*   **Limits:** `MAX_ASSIGNED_BINS` = 3.
*   **Equipment:** Requires a `TrashGrabber` tool (`TrashGrabberDef`). The cleaner ensures they have one (`EnsureTrashGrabberInInventory`).
*   **Tasks & Logic:**
    *   Uses Trash Grabber to pick up loose trash items (`PickUpTrashBehaviour`).
    *   Empties the grabber into the nearest assigned, non-full bin (`EmptyTrashGrabberBehaviour`, `GetFirstNonFullBin`).
    *   When an assigned bin is full, bags it (`BagTrashCanBehaviour`). Requires `Trash Bag` items in supply storage.
    *   Takes the full trash bag and disposes of it (`DisposeTrashBagBehaviour`). Requires a configured disposal point (e.g., an external dumpster).
*   **Configuration Needs:** Assigned Bins, Supply Storage (Trash Bags), Disposal Point.
*   **Work Issues:** No assigned bins, no Trash Grabber available/accessible, no Trash Bags in supplies, assigned bins full and cannot be bagged, disposal point inaccessible.
*   **UI:** Has a `CleanerUIElement` worldspace UI.

---

**Packager Specifics (`Packager.cs`)**

*   **Role:** Packages finished goods.
*   **Stations:** Assigned `PackagingStation`s and `BrickPress`es.
*   **Limits:** `MaxAssignedStations` (total combined, value not specified here but likely exists).
*   **Tasks & Logic:**
    *   Checks supply storage (likely output from Botanist/Chemist) for products matching configured packaging tasks.
    *   Checks supply storage for required packaging materials (Baggie, Jar, etc.).
    *   Operates assigned `PackagingStation`s to package items (`PackagingBehaviour`, `GetStationToAttend`). Speed influenced by `PackagingSpeedMultiplier`.
    *   Operates assigned `BrickPress`es to compress specific items (e.g., cocaine) into bricks (`BrickPressBehaviour`, `GetBrickPress`).
    *   Moves finished packages/bricks to configured output storage (`StartMoveItem`, `GetStationMoveItems`, `GetBrickPressMoveItems`, uses `MoveItemBehaviour`).
*   **Configuration Needs:** Assigned Stations (Packaging, Brick Press), Supply Storage (Finished products, Packaging materials), Output Storage (Packaged goods, Bricks). Needs specification of which product gets which packaging.
*   **Work Issues:** No assigned stations, missing products in supply, missing packaging materials in supply, output storage full, packaging tasks not configured.
*   **UI:** Has a `PackagerUIElement` worldspace UI.

This detailed extraction covers the hiring, payment, needs, configuration, tasks, limits, and potential issues for each employee type, providing a solid foundation for understanding and utilizing them effectively in the game.
```

# GameTime.md

```md
**Core Time System (`TimeManager.cs`, `GameDateTime.cs`, `EDay.cs`)**

*   **Time Representation:**
    *   Time is tracked using a `GameDateTime` struct, which contains:
        *   `elapsedDays`: The total number of days passed since the game started.
        *   `time`: The current time within the day, represented as an integer (likely HHMM format, e.g., 0700 for 7:00 AM, 1430 for 2:30 PM).
    *   `GetMinSum()`: Converts `GameDateTime` into a total number of minutes passed since the very beginning of the game.
    *   `CurrentDay`: Returns the current day of the week (`EDay` enum: Monday to Sunday). `DayIndex` gives the numerical representation (0-6).
*   **Time Progression:**
    *   `CYCLE_DURATION_MINS`: A full in-game day (24 hours) lasts **24 real-world minutes** by default.
    *   `MINUTE_TIME`: Each in-game minute takes **1 real-world second** to pass by default.
    *   `TimeProgressionMultiplier`: A variable that can speed up or slow down the passage of time (default value likely 1.0). Can be modified (e.g., during tutorial or specific events).
    *   `TimeLoop`, `TickLoop`, `StaggeredMinPass`: Internal coroutines that handle the progression of time and trigger events.
*   **Time Scale & Units:**
    *   Internal time seems measured in minutes. `GetMinSumFrom24HourTime` and `Get24HourTimeFromMinSum` handle conversions between HHMM format and total minutes within a day (1440 mins).
    *   `AddMinutesTo24HourTime`: Utility function for time calculations.
*   **Day/Night Cycle:**
    *   `IsNight`: A property indicating if it's currently nighttime. The exact hours defining night aren't explicitly stated here but are likely used for curfew logic, visual changes, etc.
    *   `END_OF_DAY`: Defined as **400** (4:00 AM). This likely marks the transition to the next day/when daily calculations occur.
*   **Events Triggered by Time:**
    *   `onMinutePass`: Action triggered every in-game minute. (Used by AnalogueClock, likely affects plant growth, process timers, NPC schedules).
    *   `onHourPass`: Action triggered every in-game hour.
    *   `onDayPass`: Action triggered when a new day starts (likely at `END_OF_DAY`). Crucial for daily resets, wage payments, addiction drain, maybe new customer orders.
    *   `onWeekPass`: Action triggered when a new week starts.
    *   `onTick`: Action triggered frequently by the internal time loop.
*   **Sleeping:**
    *   `DEFAULT_WAKE_TIME`: Players wake up at **700** (7:00 AM) by default after sleeping.
    *   `SelectedWakeTime`: Seems to be fixed at **700** (7:00 AM).
    *   `sleepStartTime`, `sleepEndTime`: Variables tracking sleep duration.
    *   `onSleepStart`: Event triggered when the player starts sleeping.
    *   `onSleepEnd`: Event triggered when the player wakes up, passing the number of minutes slept.
    *   `FastForwardToWakeTime`: Function called when sleeping to advance time quickly.
    *   `onTimeSkip`: Action triggered specifically when time is fast-forwarded (like during sleep), passing the number of minutes skipped.
*   **Saving & Loading:**
    *   The `TimeManager` is `ISaveable`. Current `ElapsedDays`, `CurrentTime`, and total `Playtime` are saved and loaded.
*   **Multiplayer Synchronization:**
    *   `TimeManager` is a `NetworkSingleton`.
    *   `SetData`: Server sends the current time (`_elapsedDays`, `_time`) to clients to keep them synchronized.
*   **Time Overrides:**
    *   `TimeOverridden`: A flag indicating if the normal time flow is suspended/changed.
    *   `SetTimeOverridden`: Function to pause/set a fixed time (defaults to 1200 - Noon).

**Analogue Clock (`AnalogueClock.cs`)**

*   **Function:** Represents a visual in-game clock.
*   `MinHand`, `HourHand`: Transforms representing the clock hands.
*   `RotationAxis`: Defines how the hands rotate.
*   Subscribes to `onMinutePass` from `TimeManager` to update the hand positions visually each minute.
*   `onNoon`, `onMidnight`: Events triggered when the clock hits 12:00 PM and 12:00 AM respectively.

**Tutorial Time Control (`TutorialTimeController.cs`)**

*   **Function:** Allows for scripted changes to the game speed during the tutorial phase.
*   `KeyFrames`: An array defining specific times (`Time`) and associated speed multipliers (`SpeedMultiplier`).
*   Uses an `AnimationCurve` (`TimeProgressionCurve`) possibly for smoother transitions between keyframe speeds.
*   Can `IncrementKeyframe` to move to the next phase of the tutorial's time scale.
*   Can be `Disable`d, likely returning time control fully to the `TimeManager`'s default settings.

**Usefulness Summary:**

This code confirms:

1.  **The exact length of a day/minute.** (24 real mins / 1 real sec).
2.  **The time format used internally.** (HHMM integer).
3.  **The specific time the day rolls over.** (4:00 AM).
4.  **The existence of key time-based events** (`onMinutePass`, `onDayPass`, etc.) that drive many game systems (NPC schedules, plant growth, daily costs).
5.  **How sleeping works** (advances time to 7:00 AM).
6.  **How time is saved and synced.**
7.  That time speed can be **manipulated during the tutorial**.

This information is crucial for planning activities around the clock, understanding cooldowns, predicting when daily events occur (like wage payments), and knowing the base speed of the game world.
```

# growing.md

```md
**Extracted Player-Relevant Data from Growing Item Assets:**

*(Ignoring *_Icon.asset data and internal engine details)*

**1. Soil (Basic)**
*   **Item Name:** Soil
*   **Internal ID:** `soil`
*   **Description:** "Basic potting soil to grow stuff in."
*   **Base Purchase Price:** $10
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Number of Uses:** 1 (Can grow 1 plant before expiring)
*   **Soil Quality:** 0 (This value seems to be 0 for all soils listed, might indicate 'standard' quality or be used differently)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Legal/Uncontrolled)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2 (Likely "Seeds" or "Growing Supplies" category)
*   **Item Category (Internal):** 2

**2. Long-Life Soil**
*   **Item Name:** Long-Life Soil
*   **Internal ID:** `longlifesoil`
*   **Description:** "Long-lasting soil that can be used to grow 2 plants before expiring."
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Number of Uses:** 2 (Can grow 2 plants before expiring)
*   **Soil Quality:** 0
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 4
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2
*   **Item Category (Internal):** 2

**3. Extra Long-Life Soil**
*   **Item Name:** Extra Long-Life Soil
*   **Internal ID:** `extralonglifesoil`
*   **Description:** "Extra long-lasting soil that can be used to grow 3 plants before expiring."
*   **Base Purchase Price:** $60
*   **Resell Value:** $30 (Calculated: $60 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Number of Uses:** 3 (Can grow 3 plants before expiring)
*   **Soil Quality:** 0
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 3
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2
*   **Item Category (Internal):** 2

**4. Fertilizer**
*   **Item Name:** Fertilizer
*   **Internal ID:** `fertilizer`
*   **Description:** "All-natural fertilizer which will increase the quality of your plants."
*   **Effect:** Increases plant quality. (Mechanism/amount not specified in this file)
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 4
*   **Available In Demo:** No
*   **Shop Category:** 2
*   **Item Category (Internal):** 2
*   **(Note:** This is likely an "Additive" applied during growth.)

**5. PGR (Plant Growth Regulator)**
*   **Item Name:** PGR
*   **Internal ID:** `pgr`
*   **Description:** "Plant growth regulator (PGR) will increase the yields of your plants, at the cost of quality."
*   **Effect:** Increases yield, decreases quality. (Mechanism/amount not specified)
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 3
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2
*   **Item Category (Internal):** 2
*   **(Note:** Likely an "Additive" applied during growth.)

**6. Speed Grow**
*   **Item Name:** Speed Grow
*   **Internal ID:** `speedgrow`
*   **Description:** "Instantly grows the plant by 50%, but reduces plant quality."
*   **Effect:** Adds 50% growth progress instantly, decreases quality. (Mechanism/amount not specified)
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 3
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2
*   **Item Category (Internal):** 0 *(Note: Category 0 vs 2 for others, might be typo or different grouping)*
*   **(Note:** Likely an "Additive" applied during growth.)

This data details the cost, availability, and core function of various growing supplies. The key takeaways for the player are the different soil types offering varying uses per purchase, and the trade-offs involved with using Fertilizer, PGR, or Speed Grow (Quality vs. Yield/Speed).

let's extract the crucial information about the growing mechanics from these C# files. This covers the plant lifecycle, stats, harvesting, and how additives work.

---

**Plant Core Mechanics (`Plant.cs`)**

*   **Base Class:** This is the fundamental script for all growable plants (WeedPlant, CocaPlant inherit from this).
*   **Core Stats (Initial Values - Can be modified):**
    *   `BaseYieldLevel`: The starting potential yield amount for the plant *before* modifications from additives, pots, etc.
    *   `BaseQualityLevel`: The starting potential quality level for the plant *before* modifications.
    *   `YieldLevel`: The *current* yield level of the plant during growth, affected by game events and additives. Determines final harvest amount.
    *   `QualityLevel`: The *current* quality level of the plant during growth, affected by game events and additives. Determines final product quality (`EQuality`).
*   **Growth Cycle:**
    *   `GrowthTime`: The base time in **game minutes** required for the plant to reach full maturity from seed. (e.g., If `GrowthTime` is 1440, it takes one full 24-hour game day by default). This time can be modified by multipliers.
    *   `MinPass()`: This function runs every game minute. It's responsible for incrementing the plant's growth progress.
    *   `NormalizedGrowthProgress`: Tracks growth as a value from **0.0 (just planted) to 1.0 (fully grown)**.
    *   `IsFullyGrown`: A boolean flag that becomes `true` when `NormalizedGrowthProgress` reaches 1.0.
    *   `onGrowthDone`: An event that triggers when the plant becomes fully grown.
    *   `FullyGrownParticles`: Particle effect shown when the plant is fully grown.
*   **Visuals:**
    *   `GrowthStages`: An array of `PlantGrowthStage` objects. The plant's visual model likely changes based on `NormalizedGrowthProgress` progressing through these stages.
    *   `UpdateVisuals()`: Function called to update the plant's appearance based on its current growth stage.
    *   `VisualsContainer`: The parent transform holding the plant's visual model parts.
*   **Harvesting:**
    *   `HarvestTarget`: A string identifier used to specify which part of the plant model needs to be interacted with (e.g., clicked, targeted by trimmers) to harvest (Example: "Bud").
    *   `ActiveHarvestables`: A list tracking which specific parts of the plant are currently ready and available to be harvested. (Useful for plants that might have multiple buds/leaves appear over time or need multiple interactions).
    *   `SetHarvestableActive()` / `IsHarvestableActive()`: Functions to manage the state of individual harvestable parts.
    *   `GetHarvestedProduct(int quantity = 1)`: **Crucial Function.** This is called when a harvest action is successful. It returns an `ItemInstance` of the final product (e.g., OG Kush item).
        *   The **Quality** of the returned `ItemInstance` is determined by the plant's final `QualityLevel`.
        *   The **Amount** of product returned likely depends on the plant's final `YieldLevel` and potentially the `ProductQuantity` set on the specific `PlantHarvestable` part that was interacted with.
    *   `SnipSound`: Sound played when harvesting.
*   **Destruction:**
    *   `Destroy(bool dropScraps = false)`: Function to remove the plant from the game.
    *   `PlantScrapPrefab`: If `dropScraps` is true, an instance of this `TrashItem` may be dropped when the plant is destroyed.
    *   `DestroySound`: Sound played when the plant is destroyed.
*   **Dependencies:**
    *   Requires a `Pot` object to be initialized and grow within.
    *   Linked to a `SeedDefinition` which defines what type of plant it is.
*   **Saving:** Plant state (growth progress, quality, yield, active harvestables) is saved via `GetPlantData()`.

---

**Specific Plant Types (`WeedPlant.cs`, `CocaPlant.cs`)**

*   **Inheritance:** These scripts inherit all the logic from the base `Plant.cs`.
*   **`WeedPlant`:**
    *   `BranchPrefab`: Defines the specific `PlantHarvestable` prefab to use for marijuana plants (likely representing buds or branches).
    *   `GetHarvestedProduct()`: Overrides the base function to return the correct `ItemInstance` for the specific strain of marijuana being grown (determined by the `SeedDefinition` used).
*   **`CocaPlant`:**
    *   `Harvestable`: Defines the specific `PlantHarvestable` prefab for coca plants (likely representing leaves).
    *   `GetHarvestedProduct()`: Overrides the base function to return the correct `ItemInstance` for coca leaves (`ItemDefinition` specified in the `Harvestable` prefab).

---

**Seeds (`SeedDefinition.cs`, `FunctionalSeed.cs`, `VialCap.cs`)**

*   **`SeedDefinition` (ScriptableObject / Item Data):**
    *   This is the core data asset representing a specific seed *item* in the player's inventory.
    *   Inherits from `StorableItemDefinition` (meaning it's a standard inventory item).
    *   `PlantPrefab`: **Critically important field.** Links this seed item directly to the specific `Plant` prefab (e.g., `WeedPlant`, `CocaPlant`) that will be created and start growing when this seed is planted. This is how the game knows *what* to grow.
    *   `FunctionSeedPrefab`: Links to the physical `FunctionalSeed` object that appears in the game world when the player is holding/planting the seed.
*   **`FunctionalSeed` (In-World Object):**
    *   Represents the seed the player physically interacts with during planting.
    *   Contains references to interactive parts: `Vial` (likely the container), `VialCap` (clickable cap), `SeedCollider` (the seed itself).
    *   Handles the physics (`SeedRigidbody`) and interaction logic (`Draggable`, `TriggerExit`) for placing the seed into a pot.
    *   `onSeedExitVial`: Event that likely triggers the actual planting process (spawning the `PlantPrefab` defined in the `SeedDefinition`) when the seed leaves the vial/enters the pot.
*   **`VialCap` (Interaction):**
    *   A `Clickable` component representing the cap on the seed vial.
    *   `Pop()`: Action performed when clicked, likely removing the cap visually/physically.

---

**Additives (`Additive.cs`, `PourableAdditive.cs`)**

*   **`Additive` (Data Component - Likely attached to Additive Item Prefabs):**
    *   `AdditiveName`: Display name.
    *   `AssetPath`: Internal path to the item asset.
    *   **Plant Effector Settings:** These define how the additive modifies the plant's stats *when applied*:
        *   `QualityChange`: **Directly adds or subtracts** from the plant's `QualityLevel`. (e.g., Fertilizer might be +0.2, PGR might be -0.1).
        *   `YieldChange`: **Directly adds or subtracts** from the plant's `YieldLevel`. (e.g., PGR might be +0.3).
        *   `GrowSpeedMultiplier`: **Multiplies** the plant's base growth rate. (e.g., 1.0 is no change, 1.15 is +15% speed, 0.8 is -20% speed). Affects how quickly `NormalizedGrowthProgress` increases each `MinPass`.
        *   `InstantGrowth`: **Adds a flat percentage** directly to the plant's `NormalizedGrowthProgress`. (e.g., Speed Grow would have `InstantGrowth = 0.5` to add 50% progress instantly).
*   **`PourableAdditive` (Interaction / Application):**
    *   Represents liquid additives that need to be poured (e.g., liquid fertilizer).
    *   `AdditiveDefinition`: Links the pourable item back to its corresponding `AdditiveDefinition` asset (which contains the actual `QualityChange`, `YieldChange`, etc. effects).
    *   `NormalizedAmountForSuccess`: Constant value **0.8**. Requires the player to successfully pour **80%** of the container's contents onto the target (pot/plant) for the additive's effects to be applied.
    *   `LiquidColor`: Defines the visual appearance of the liquid being poured.

---

**Harvestable Parts (`PlantHarvestable.cs`)**

*   **Component on Plant:** This script is attached to the specific parts of a plant model that the player harvests (e.g., individual buds, leaves).
*   **Links Product:**
    *   `Product`: Specifies the `StorableItemDefinition` (the actual product like OG Kush, Coca Leaf) that is given when *this specific part* is harvested.
    *   `ProductQuantity`: Specifies how many units of the `Product` are given when *this specific part* is harvested. (e.g., a large bud might give 2 units, a small one 1).
*   **Harvest Action:**
    *   `Harvest(bool giveProduct = true)`: Method called when this part is successfully harvested by the player (e.g., via clicking or using trimmers). If `giveProduct` is true, it adds the specified `Product` and `ProductQuantity` to the player's inventory (likely triggering the `Plant.GetHarvestedProduct` logic which factors in quality/yield).

---

**Other Related Components:**

*   **`PlantGrowthStage.cs`:** Defines visual stages of the plant and `GrowthSites` which are likely attachment points for `PlantHarvestable` prefabs to appear as the plant grows.
*   **`SoilChunk.cs`:** Appears to be a purely visual/interactive component for the animation/process of adding soil to a pot.

---

**Summary of Player-Relevant Takeaways:**

1.  **Seed Dictates Plant:** The specific `SeedDefinition` item determines which `Plant` prefab grows (e.g., OG Kush Seed grows a `WeedPlant` configured for OG Kush).
2.  **Growth is Timed:** Plants have a base `GrowthTime` in minutes, progressing from 0.0 to 1.0 `NormalizedGrowthProgress`.
3.  **Stats Matter:** Plants track `QualityLevel` and `YieldLevel` throughout growth. These start at base values and are modified by additives.
4.  **Additives Modify Stats:** Grow additives (Fertilizer, PGR, Speed Grow) directly change Quality, Yield, Growth Speed (multiplier), or add Instant Growth % when applied. Liquid additives require pouring ~80% successfully.
5.  **Harvesting:** When fully grown, interact with specific parts (`PlantHarvestable`) linked to the `HarvestTarget`. This gives the `Product` defined on the harvestable, with quantity based on `YieldLevel` and quality based on `QualityLevel`.
6.  **Plant Types:** Different plants (Weed, Coca) exist with specific harvestable parts and products.
```

# ingredients.md

```md
**Extracted Player-Relevant Data from Ingredient/Additive Assets:**

*(Organized alphabetically. Ignoring *_Icon.asset data, GUIDs unless clarifying a link, prefab links, material links, and other non-player-facing fields)*

**1. Acid**
*   **Item Name:** Acid
*   **Internal ID:** `acid`
*   **Description:** "A common ingredient used in a chemistry station." (Confirms usage)
*   **Base Purchase Price:** $40
*   **Resell Value:** $20 (Calculated: $40 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal/Uncontrolled)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 3, Tier 3
*   **Shop Category:** 6 (Likely Additive/Chemistry/Hardware Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** No
*   **Properties (Linked Effects):** None listed. (Implies it's used in crafting, not directly as a product additive for effects).

**2. Addy**
*   **Item Name:** Addy
*   **Internal ID:** `addy`
*   **Description:** "Like meth except legal. Used to stimulate cognition."
*   **Base Purchase Price:** $9 *(Matches manual data)*
*   **Resell Value:** $4.5 (Calculated: $9 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Likely Legal/Uncontrolled, despite description comparing to meth)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 3, Tier 2
*   **Shop Category:** 6 (Likely Additive/Pharmacy Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `dab9f34...` - Confirmed 'Thought-Provoking' from previous dump)

**3. Banana**
*   **Item Name:** Banana
*   **Internal ID:** `banana`
*   **Description:** "Elongated yellow fruit, rich in potassium."
*   **Base Purchase Price:** $2 *(Matches manual data)*
*   **Resell Value:** $1 (Calculated: $2 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 1, Tier 5
*   **Shop Category:** 6 (Likely Additive/Grocery Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `255ee66...` - Confirmed 'Gingeritis' from previous dump)

**4. Battery**
*   **Item Name:** Battery
*   **Internal ID:** `battery`
*   **Description:** "Small battery used to power stuff." (May have other uses beyond additive)
*   **Base Purchase Price:** $8 *(Matches manual data)*
*   **Resell Value:** $4 (Calculated: $8 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 5
*   **Shop Category:** 6 (Likely Additive/Hardware Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `9a1c55c...` - Confirmed 'Bright-Eyed' from previous dump)

**5. Chili**
*   **Item Name:** Chili
*   **Internal ID:** `chili`
*   **Description:** "Yummy spicy chili."
*   **Base Purchase Price:** $7 *(Matches manual data)*
*   **Resell Value:** $3.5 (Calculated: $7 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 4
*   **Shop Category:** 6 (Likely Additive/Grocery Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `4525527...` - Confirmed 'Spicy' from previous dump)

**6. Coca Leaf**
*   **Item Name:** Coca Leaf
*   **Internal ID:** `cocaleaf`
*   **Description:** "A single leaf from a coca plant. The main ingredient in cocaine." (Confirms usage)
*   **Base Purchase Price:** $10 *(Note: This is likely a placeholder or internal value, not a market buy price)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 3 (Likely High Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but harvested)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed (Supports not being purchasable)
*   **Item Category (Internal):** 9 (Likely Ingredients/Raw Materials)
*   **Available In Demo:** No
*   **Default Quality:** 2 (Indicates a quality system exists for harvested/crafted items)
*   **Properties (Linked Effects):** None listed. (Raw material)

**7. Cocaine Base**
*   **Item Name:** Cocaine Base
*   **Internal ID:** `cocainebase`
*   **Description:** "Raw cocaine base ready to be cooked into cocaine." (Intermediate crafting item)
*   **Base Purchase Price:** $10 *(Placeholder/internal value)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 1 (Likely Precursor/Medium Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but crafted)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed
*   **Item Category (Internal):** 9 (Likely Ingredients/Intermediate)
*   **Available In Demo:** No
*   **Default Quality:** 2
*   **Properties (Linked Effects):** None listed. (Intermediate material)

**8. Cuke**
*   **Item Name:** Cuke
*   **Internal ID:** `cuke`
*   **Description:** "A refreshing can of Cuke that leaves you feeling energized. It's heaven in a can."
*   **Base Purchase Price:** $2 *(Matches manual data)*
*   **Resell Value:** $1 (Calculated: $2 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** 6 (Likely Additive/Grocery Store)
*   **Item Category (Internal):** 7 (Likely Consumables - can be drunk OR used as additive)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `8301163...` - Confirmed 'Energizing' from previous dump)

**9. Donut**
*   **Item Name:** Donut
*   **Internal ID:** `donut`
*   **Description:** "Yummy strawberry frosted donut."
*   **Base Purchase Price:** $3 *(Matches manual data)*
*   **Resell Value:** $1.5 (Calculated: $3 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 1, Tier 1
*   **Shop Category:** 6 (Likely Additive/Grocery Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `12826c9...` - Confirmed 'Calorie-Dense' from previous dump)

**10. Energy Drink**
*   **Item Name:** Energy Drink
*   **Internal ID:** `energydrink`
*   **Description:** "Tasty energy drink filled with lots of yummy chemicals to make you feel refreshed. Removes the effects of drugs when consumed." (Dual use: additive + drug cure)
*   **Base Purchase Price:** $6 *(Note: Manual data listed $5, slight discrepancy)*
*   **Resell Value:** $3 (Calculated: $6 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 1
*   **Shop Category:** 6 (Likely Additive/Grocery Store)
*   **Item Category (Internal):** 7 (Likely Consumables)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `bc28a33...` - Confirmed 'Athletic' from previous dump) *(Interesting link - Athletic effect for an energy drink)*

**11. Flu Medicine**
*   **Item Name:** Flu Medicine
*   **Internal ID:** `flumedicine`
*   **Description:** "Pain reliever and mild sedative used to alleviate flu symptoms."
*   **Base Purchase Price:** $5 *(Matches manual data)*
*   **Resell Value:** $2.5 (Calculated: $5 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 4
*   **Shop Category:** 6 (Likely Additive/Pharmacy Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `cee302b...` - Confirmed 'Sedating' from previous dump)

**12. Gasoline**
*   **Item Name:** Gasoline
*   **Internal ID:** `gasoline`
*   **Description:** "A jerry can full of gasoline." (May have other uses)
*   **Base Purchase Price:** $5 *(Matches manual data)*
*   **Resell Value:** $2.5 (Calculated: $5 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 5
*   **Shop Category:** 6 (Likely Additive/Hardware Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `b34cc41...` - Confirmed 'Toxic' from previous dump)

**13. Horse Semen**
*   **Item Name:** Horse Semen
*   **Internal ID:** `horsesemen`
*   **Description:** "A big jug of ethically sourced horse semen."
*   **Base Purchase Price:** $9 *(Matches manual data)*
*   **Resell Value:** $4.5 (Calculated: $9 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal... presumably)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 3, Tier 3
*   **Shop Category:** 6 (Likely Additive/Specialty Store?)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `0dce587...` - Confirmed 'Long faced' from previous dump)

**14. Iodine**
*   **Item Name:** Iodine
*   **Internal ID:** `iodine`
*   **Description:** "Chemical element that is an essential nutrient in a healthy diet. It also has other purposes." (Hints at chemistry use)
*   **Base Purchase Price:** $8 *(Matches manual data)*
*   **Resell Value:** $4 (Calculated: $8 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 3, Tier 1
*   **Shop Category:** 6 (Likely Additive/Pharmacy/Chemical Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `cbc01bf...` - Confirmed 'Jennerising' from previous dump)

**15. Liquid Baby Blue**
*   **Item Name:** Baby Blue (Liquid)
*   **Internal ID:** `liquidbabyblue`
*   **Description:** "The 'Baby Blue' methamphetamine variant in liquid form. Use a drying oven to bake into solid form." (Intermediate crafting item)
*   **Base Purchase Price:** $10 *(Placeholder/internal value)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 4 (Likely Very High Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but crafted)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed
*   **Item Category (Internal):** 9 (Likely Ingredients/Intermediate)
*   **Available In Demo:** No
*   **Default Quality:** 2
*   **Properties (Linked Effects):** None listed. (Intermediate material)

**16. Liquid Biker Crank**
*   **Item Name:** Biker Crank (Liquid)
*   **Internal ID:** `liquidbikercrank`
*   **Description:** "The 'Biker Crank' methamphetamine variant in liquid form. Use a drying oven to bake into solid form." (Intermediate crafting item)
*   **Base Purchase Price:** $10 *(Placeholder/internal value)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 4 (Likely Very High Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but crafted)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed
*   **Item Category (Internal):** 9 (Likely Ingredients/Intermediate)
*   **Available In Demo:** No
*   **Default Quality:** 2
*   **Properties (Linked Effects):** None listed. (Intermediate material)

**17. Liquid Glass**
*   **Item Name:** Glass (Liquid)
*   **Internal ID:** `liquidglass`
*   **Description:** "The 'Glass' methamphetamine variant in liquid form. Use a drying oven to bake into solid form." (Intermediate crafting item)
*   **Base Purchase Price:** $10 *(Placeholder/internal value)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 4 (Likely Very High Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but crafted)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed
*   **Item Category (Internal):** 9 (Likely Ingredients/Intermediate)
*   **Available In Demo:** No
*   **Default Quality:** 2
*   **Properties (Linked Effects):** None listed. (Intermediate material)

**18. Liquid Meth**
*   **Item Name:** Meth (Liquid)
*   **Internal ID:** `liquidmeth`
*   **Description:** "Methamphetamine in liquid form. Use a drying oven to bake into solid form." (Intermediate crafting item)
*   **Base Purchase Price:** $10 *(Placeholder/internal value)*
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 4 (Likely Very High Illegality)
*   **Required Player Level to Purchase:** 0 *(Likely not purchasable, but crafted)*
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** None listed
*   **Item Category (Internal):** 9 (Likely Ingredients/Intermediate)
*   **Available In Demo:** No
*   **Default Quality:** 2
*   **Properties (Linked Effects):** None listed. (Intermediate material)

**19. Mega Bean**
*   **Item Name:** Mega Bean
*   **Internal ID:** `megabean`
*   **Description:** "An unusually large bean of mysterious origin."
*   **Base Purchase Price:** $7 *(Matches manual data)*
*   **Resell Value:** $3.5 (Calculated: $7 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 3
*   **Shop Category:** 6 (Likely Additive/Specialty Store?)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `f4e8b2e...` - Confirmed 'Foggy' from previous dump)

**20. Motor Oil**
*   **Item Name:** Motor Oil
*   **Internal ID:** `motoroil`
*   **Description:** "Specially formulated oil used for lubricating the moving stuff in an engine." (May have other uses)
*   **Base Purchase Price:** $6 *(Matches manual data)*
*   **Resell Value:** $3 (Calculated: $6 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 2
*   **Shop Category:** 6 (Likely Additive/Hardware Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `09cc6fe...` - Confirmed 'Slippery' from previous dump)

**21. Mouth Wash**
*   **Item Name:** Mouth Wash
*   **Internal ID:** `mouthwash`
*   **Description:** "Antiseptic mouth wash for a minty fresh breath."
*   **Base Purchase Price:** $4 *(Matches manual data)*
*   **Resell Value:** $2 (Calculated: $4 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 3
*   **Shop Category:** 6 (Likely Additive/Grocery/Pharmacy Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `8a18aa6...` - Confirmed 'Balding' from previous dump)

**22. Paracetamol**
*   **Item Name:** Paracetamol
*   **Internal ID:** `paracetamol`
*   **Description:** "Mild over-the-counter painkiller"
*   **Base Purchase Price:** $3 *(Matches manual data)*
*   **Resell Value:** $1.5 (Calculated: $3 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 2, Tier 2
*   **Shop Category:** 6 (Likely Additive/Pharmacy Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `51a993e...` - Confirmed 'Sneaky' from previous dump)

**23. Phosphorus**
*   **Item Name:** Phosphorus
*   **Internal ID:** `phosphorus`
*   **Description:** "Common chemical ingredient in powder form. Used in matches and meth." (Confirms usage)
*   **Base Purchase Price:** $40
*   **Resell Value:** $20 (Calculated: $40 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 1 (Likely Precursor/Medium Illegality)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** 6 (Likely Additive/Chemical Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** None listed. (Implies it's used in crafting, not directly as a product additive for effects).

**24. Pseudoephedrine (High Quality)**
*   **Item Name:** High-Quality Pseudo
*   **Internal ID:** `highqualitypseudo`
*   **Description:** "High-quality pseudoephedrine in tablet form. A common precursor for meth." (Crafting item)
*   **Base Purchase Price:** $110
*   **Resell Value:** $55 (Calculated: $110 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 1 (Likely Precursor/Medium Illegality)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 4, Tier 5
*   **Shop Category:** 6 (Likely Additive/Pharmacy/Chemical Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** No
*   **Default Quality:** 3 (Highest quality precursor)
*   **Properties (Linked Effects):** None listed. (Crafting item)

**25. Pseudoephedrine (Low Quality)**
*   **Item Name:** Low-Quality Pseudo
*   **Internal ID:** `lowqualitypseudo`
*   **Description:** "Low-quality pseudoephedrine in tablet form. A common precursor for meth." (Crafting item)
*   **Base Purchase Price:** $60
*   **Resell Value:** $30 (Calculated: $60 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 1 (Likely Precursor/Medium Illegality)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Shop Category:** 6 (Likely Additive/Pharmacy/Chemical Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** No
*   **Default Quality:** 1 (Lowest quality precursor)
*   **Properties (Linked Effects):** None listed. (Crafting item)

**26. Pseudoephedrine (Standard Quality)**
*   **Item Name:** Pseudo
*   **Internal ID:** `pseudo`
*   **Description:** "Standard-quality pseudoephedrine in tablet form. A common precursor for meth." (Crafting item)
*   **Base Purchase Price:** $80
*   **Resell Value:** $40 (Calculated: $80 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 1 (Likely Precursor/Medium Illegality)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 3, Tier 3
*   **Shop Category:** 6 (Likely Additive/Pharmacy/Chemical Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Chemicals)
*   **Available In Demo:** No
*   **Default Quality:** 2 (Standard quality precursor)
*   **Properties (Linked Effects):** None listed. (Crafting item)

**27. Viagra**
*   **Item Name:** Viagra
*   **Internal ID:** `viagra`
*   **Description:** "Medication that is used to get you chubbed-up."
*   **Base Purchase Price:** $4 *(Matches manual data)*
*   **Resell Value:** $2 (Calculated: $4 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 0 (Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 2
*   **Shop Category:** 6 (Likely Additive/Pharmacy Store)
*   **Item Category (Internal):** 9 (Likely Ingredients/Additives)
*   **Available In Demo:** Yes
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `6b16a3f...` - Confirmed 'Tropic Thunder' from previous dump)

This detailed list confirms your manual additive prices and links each purchasable additive to the specific effect (and its mechanics) it imparts, which is extremely valuable for building the logic in your planner. It also clarifies which items are likely just for crafting and introduces the concept of item quality for precursors.
```

# law.md

```md
**Law System Overview:**

*   The game features a dynamic law enforcement system controlled by an "Intensity" level.
*   Player actions, particularly illegal ones, increase Intensity. Intensity naturally decays over time.
*   Higher Intensity leads to increased police presence and stricter enforcement activities like patrols, checkpoints, and curfews.
*   Police activities are scheduled based on the day of the week and the current Intensity level.
*   Committing crimes can lead to fines and potentially other consequences (like arrest, though not explicitly detailed in `PenaltyHandler`).

---

**Law Intensity (`LawController.cs`)**

*   **`LE_Intensity`:** The core variable tracking the current level of law enforcement attention, ranging from **1 to 10**.
*   **Intensity Increase:** Player actions increase `internalLawIntensity`. (The specific amounts per action aren't in this code but were hinted at in `product.md` via `LawIntensityChange` for different drug types).
*   **Intensity Decay:**
    *   `DAILY_INTENSITY_DRAIN`: Intensity naturally decreases by **0.05** per in-game day.
*   **Activity Scheduling:**
    *   The game uses `LawActivitySettings` for each day of the week (MondaySettings, TuesdaySettings, etc.).
    *   These settings define *potential* police activities (patrols, checkpoints, curfews, sentries) for that day.
    *   An activity only becomes *active* if the current `LE_Intensity` meets or exceeds the activity's `IntensityRequirement` and the current game time is within its scheduled `StartTime` and `EndTime`.
    *   The system can be overridden by specific game events (`OverrideSettings`).
*   **Saving:** The current `LE_Intensity` is saved (`ISaveable`).

---

**Curfew System (`CurfewManager.cs`, `CurfewInstance.cs`)**

*   **Timing:**
    *   `CURFEW_START_TIME`: Curfew begins at **21:00** (9:00 PM).
    *   `CURFEW_END_TIME`: Curfew ends at **05:00** (5:00 AM).
    *   `WARNING_TIME`: A warning (sound `CurfewWarningSound`, possibly visual cues `VMSBoards`) is issued at **20:30** (8:30 PM).
*   **Activation:**
    *   A `CurfewInstance` defines a potential curfew period.
    *   It requires a specific `IntensityRequirement` (1-10) to be met for the curfew to be enabled for that period (`CurfewInstance.Enable`).
    *   `CurfewManager` tracks the overall state (`IsEnabled`, `IsCurrentlyActive`).
*   **Consequences:**
    *   Being outside during an active curfew is the crime `ViolatingCurfew`.
    *   Sound (`CurfewAlarmSound`) and visual cues (`VMSBoards`) likely indicate an active curfew.
    *   Police presence is generally higher during curfew (see `OnlyIfCurfewEnabled` flags below).

---

**Police Checkpoints (`CheckpointManager.cs`, `CheckpointInstance.cs`)**

*   **Locations:** Checkpoints can appear at predefined locations (`ECheckpointLocation`): Western, Docks, NorthResidential, WestResidential. Managed by `CheckpointManager`.
*   **Activation (`CheckpointInstance`):**
    *   Defined by a `CheckpointInstance`.
    *   Requires a specific `IntensityRequirement` (1-10).
    *   Has a scheduled `StartTime` and `EndTime`.
    *   Specifies the number of officers (`Members`).
    *   Can be set to activate `OnlyIfCurfewEnabled`.
    *   `MIN_ACTIVATION_DISTANCE`: Will not activate if the player is within **50 meters** when the activation conditions are met (prevents sudden pop-in).
*   **Functionality:** Active checkpoints (`RoadCheckpoint`) likely force the player to stop and be searched if they attempt to pass through. Finding illegal items or failing to comply results in crimes.

---

**Police Patrols (`PatrolInstance.cs`, `VehiclePatrolInstance.cs`)**

*   **Foot Patrols (`PatrolInstance`):**
    *   Defined by a `PatrolInstance` along a specific `FootPatrolRoute`.
    *   Requires a specific `IntensityRequirement` (1-10).
    *   Has a scheduled `StartTime` and `EndTime`.
    *   Specifies the number of officers (`Members`).
    *   Can be set to activate `OnlyIfCurfewEnabled`.
    *   Active patrols (`PatrolGroup`) will have officers walking the specified route.
*   **Vehicle Patrols (`VehiclePatrolInstance`):**
    *   Defined by a `VehiclePatrolInstance` along a specific `VehiclePatrolRoute`.
    *   Requires a specific `IntensityRequirement` (1-10).
    *   Has a scheduled `StartTime`. (End time likely determined by route completion or despawn logic).
    *   Can be set to activate `OnlyIfCurfewEnabled`.
    *   Launches a police vehicle (`PoliceOfficer` in a vehicle) from the nearest police station.

---

**Police Sentries (`SentryInstance.cs`, `SentryLocation.cs`)**

*   **Functionality:** Static police officers guarding a fixed location.
*   **Locations (`SentryLocation`):** Predefined locations with specific standing points (`StandPoints`) for officers.
*   **Activation (`SentryInstance`):**
    *   Defined by a `SentryInstance` at a specific `SentryLocation`.
    *   Requires a specific `IntensityRequirement` (1-10).
    *   Has a scheduled `StartTime` and `EndTime`.
    *   Specifies the number of officers (`Members`).
    *   Can be set to activate `OnlyIfCurfewEnabled`.

---

**Crimes (`Crime.cs` and specific crime files)**

*   These files define the types of illegal activities the player can commit. The specific *detection* logic isn't here, but the *classification* is.
*   **List of Defined Crimes:**
    *   `Assault`
    *   `AttemptingToSell` (Likely triggered by failed direct sales attempts or police observation)
    *   `BrandishingWeapon` (Displaying a weapon)
    *   `DeadlyAssault` (Likely causing lethal harm)
    *   `DischargeFirearm` (Shooting a gun)
    *   `DrugTrafficking` (Possibly related to large quantity sales or specific missions)
    *   `Evading` (Running from police after being told to stop)
    *   `FailureToComply` (Ignoring police orders, e.g., at a checkpoint)
    *   `PossessingControlledSubstances` (Holding illegal items, severity likely based on item's `legalStatus`)
    *   `PossessingLowSeverityDrug`
    *   `PossessingModerateSeverityDrug`
    *   `PossessingHighSeverityDrug`
    *   `Theft`
    *   `TransportingIllicitItems` (Possibly related to vehicle searches or specific item types)
    *   `Vandalism`
    *   `VehicularAssault` (Hitting someone with a vehicle)
    *   `ViolatingCurfew` (Being outside between 21:00 and 05:00 during an active curfew)

---

**Police Dispatch & Response (`LawManager.cs`)**

*   `PoliceCalled`: This function is triggered when a crime is reported against the player (`target`).
*   `DISPATCH_OFFICER_COUNT`: When police are dispatched specifically for a reported crime, **2** officers are sent.
*   `DISPATCH_VEHICLE_USE_THRESHOLD`: (Value not defined here) A threshold likely exists (distance? crime severity?) that determines if dispatched officers arrive in a vehicle.
*   `LawManager` is also responsible for initiating scheduled patrols.

---

**Penalties (`PenaltyHandler.cs`)**

*   This class defines the monetary fines associated with specific crimes. (Note: Other penalties like arrest/jail time are not detailed here but are likely).
*   **Defined Fines:**
    *   Possessing Controlled Substance: **$5** (Likely per unit or type)
    *   Possessing Low Severity Drug: **$10** (Likely per unit or type)
    *   Possessing Moderate Severity Drug: **$20** (Likely per unit or type)
    *   Possessing High Severity Drug: **$30** (Likely per unit or type)
    *   Failure To Comply: **$50**
    *   Evading Arrest: **$50**
    *   Violating Curfew: **$100**
    *   Attempt To Sell: **$150**
    *   Assault: **$75**
    *   Deadly Assault: **$150**
    *   Vandalism: **$50**
    *   Theft: **$50**
    *   Brandishing Weapon: **$50**
    *   Discharge Firearm: **$50**
*   `ProcessCrimeList`: This function takes a list of committed crimes and likely calculates the total fines.

---

This detailed breakdown covers the core mechanics, rules, and consequences of the law system as revealed by the code.

**Police System Overview (`Investigation.cs`, `NPCResponses_Police.cs`, `Offense.cs`, `PoliceOfficer.cs`)**

*   **Core Function:** Police NPCs patrol, respond to crimes, investigate suspicious activity, conduct searches, pursue suspects, and manage checkpoints. Their goal is to detect and penalize player offenses.
*   **Detection:** Police react to various player actions and world events.
*   **Investigation:** Police can initiate investigations against the player, tracking progress over time (`Investigation.cs`). This likely contributes to wanted levels or targeted actions like searches.
*   **Offenses & Penalties:** When caught, the player faces specific charges (`Offense.cs`) based on their actions, resulting in penalties (details likely defined elsewhere, but the structure includes charge names, crime index, quantity, and a list of penalty descriptions).
*   **Persistence:** Individual officer states are generally *not* saved (`ShouldSave` is false in `PoliceOfficer.cs`), meaning their specific suspicion or investigation progress might reset if the player reloads, but the overall police *presence* and player's *wanted level/criminal record* (managed by a higher system) likely *are* saved.

---

**Police Officer Behavior & Reactions (`PoliceOfficer.cs`, `NPCResponses_Police.cs`)**

*   **Officer Types/Roles:** Officers can be assigned different tasks:
    *   Foot Patrol (`FootPatrolBehaviour`)
    *   Vehicle Patrol (`VehiclePatrolBehaviour`)
    *   Checkpoint Duty (`CheckpointBehaviour`, `AssignToCheckpoint`)
    *   Pursuit (Foot: `PursuitBehaviour`, Vehicle: `VehiclePursuitBehaviour`)
    *   Body Searches (`BodySearchBehaviour`)
    *   Stationary Guard Duty (`SentryBehaviour`, `AssignToSentryLocation`)
*   **Individual Officer Settings:**
    *   `Suspicion` (0-1): How quickly an officer becomes suspicious or escalates.
    *   `Leniency` (0-1): How likely they are to warn vs. immediately act on minor offenses.
    *   `BodySearchChance` (0-1): Officer-specific chance to initiate a body search (overrides default). Default is `BODY_SEARCH_CHANCE_DEFAULT` = **0.1 (10%)**.
    *   `BodySearchDuration` (1-10s): How long the search animation/process takes.
*   **Actions Triggering Police Response (`NPCResponses_Police.cs`):** Police will react (escalate suspicion, investigate, pursue, arrest) if they notice the player:
    *   Conducting a Drug Deal (`NoticedDrugDeal`)
    *   Committing Petty Crime (`NoticedPettyCrime`)
    *   Committing Vandalism (`NoticedVandalism`)
    *   Pickpocketing (`SawPickpocketing`)
    *   Brandishing a Weapon (Just holding it out - `NoticePlayerBrandishingWeapon`)
    *   Discharging a Weapon (Firing it - `NoticePlayerDischargingWeapon`)
    *   Being Wanted (`NoticedWantedPlayer`)
    *   Being "Suspicious" (`NoticedSuspiciousPlayer` - criteria unclear, could relate to carrying illegal items openly, trespassing, etc.)
    *   Violating Curfew (`NoticedViolatingCurfew`)
    *   Aiming a weapon at them (`RespondToAimedAt`)
    *   Hitting them with a vehicle (`HitByCar`)
    *   Attacking them (Responses vary based on lethal/non-lethal, first/repeated attack)
    *   Annoying them (Minor impacts - `RespondToAnnoyingImpact`)
*   **Indirect Detection:**
    *   Police react to nearby Gunshots (`GunshotHeard` via `NoiseEvent`).
*   **Equipment:** Police can carry and use: `Baton`, `Taser`, `Gun`.
*   **Chatter:** Officers have random voice lines (`PoliceChatterVO`) playing every **15-45 seconds** (`MIN/MAX_CHATTER_INTERVAL`) if `ChatterEnabled` is true.
*   **Vision & Investigation:**
    *   Police have a vision system (`ProcessVisionEvent`).
    *   `OnPoliceVisionEvent`: An event triggered when police see something noteworthy.
*   **Body Search Investigation (Pre-Search Check):**
    *   Before initiating a full body search, officers may conduct a visual "investigation".
    *   Requires player to be within `INVESTIGATION_MAX_DISTANCE` = **8 meters**.
    *   Requires player visibility to be at least `INVESTIGATION_MIN_VISIBILITY` = **0.2 (20%)**.
    *   Progress is checked every `INVESTIGATION_CHECK_INTERVAL` = **1 second**.
    *   If the investigation completes successfully, the officer initiates the actual `ConductBodySearch`.
    *   There's an `INVESTIGATION_COOLDOWN` = **60 seconds** after stopping an investigation before starting another on the same target.
*   **Pursuit:**
    *   Can initiate foot or vehicle pursuits (`BeginFootPursuit_Networked`, `BeginVehiclePursuit_Networked`).
    *   Can call for backup (`includeColleagues = true`).

---

**Road Checkpoints (`RoadCheckpoint.cs`)**

*   **Function:** Controllable roadblocks designed to stop and potentially search vehicles.
*   **Activation:** Can be `Enabled` or `Disabled`. Can be set to be `EnabledOnStart`.
*   **Structure:** Typically includes:
    *   Barriers/Gates (`Stopper1`, `Stopper2`, `VehicleObstacle1`, `VehicleObstacle2`) that open/close.
    *   Detection Areas (`SearchArea1`, `SearchArea2`, `NPCVehicleDetectionArea1`, `NPCVehicleDetectionArea2`, `ImmediateVehicleDetector`).
    *   Standing points for assigned officers (`StandPoints`).
*   **Operation:**
    *   Gates control traffic flow (`Gate1Open`, `Gate2Open`).
    *   Gates automatically close after `MAX_TIME_OPEN` = **15 seconds** if nothing passes through.
    *   `OpenForNPCs`: If true, non-player vehicles are allowed through (likely opening gates automatically). If false, NPC vehicles might be stopped too.
*   **Stealth Interaction:**
    *   `MaxStealthLevel`: **Crucial Mechanic.** Vehicles or packages with a `StealthLevel` *at or below* this value might be allowed through the checkpoint without triggering a search or alert. Higher stealth items/vehicles will likely be stopped/searched. (The exact `EStealthLevel` enum values aren't shown here but likely correspond to packaging/vehicle stats).
*   **Player Interaction:**
    *   Driving through a search area while the checkpoint is active will likely trigger a stop/search unless stealth is sufficient.
    *   Walking through on foot triggers a specific event (`onPlayerWalkThrough`, `PlayerDetected`), likely alerting nearby officers.

---

This detailed extraction covers the core mechanics, constants, triggers, and interactions related to the police system as revealed by the code. It provides valuable insights for players looking to understand police behavior, avoidance strategies, and the consequences of criminal activity.
```

# leveling.md

```md
**Core Leveling System Mechanics (`LevelManager.cs`, `ERank.cs`, `FullRank.cs`, `RankData.cs`)**

1.  **Ranks and Tiers:**
    *   The progression system uses Ranks and Tiers.
    *   **Ranks (`ERank.cs`):** There are 11 distinct ranks, named as follows (from lowest Rank 0 to highest Rank 10):
        *   0: Street Rat
        *   1: Hoodlum
        *   2: Peddler
        *   3: Hustler
        *   4: Bagman
        *   5: Enforcer
        *   6: Shot Caller
        *   7: Block Boss
        *   8: Underlord
        *   9: Baron
        *   10: Kingpin
    *   **Tiers (`LevelManager.cs`, `FullRank.cs`):** Each Rank is further divided into **5 Tiers**. Tiers are numbered **1 through 5**.
    *   **Full Rank (`FullRank.cs`):** A player's specific progression point is represented by their `FullRank`, which combines their current `ERank` and `Tier` (e.g., Hustler Tier 3). The game logic allows direct comparison between `FullRank` values (e.g., checking if Rank A is higher than Rank B).

2.  **Experience Points (XP):**
    *   Players progress by gaining XP (`LevelManager.cs`).
    *   `AddXP(int xp)`: This is the function used to grant XP to the player.
    *   **Tracked Values:** The system tracks:
        *   `XP`: Current XP accumulated *within the current Tier*.
        *   `TotalXP`: Total cumulative XP earned throughout the game.
        *   `Rank`: Current `ERank`.
        *   `Tier`: Current Tier (1-5).
    *   **Tier Progression:**
        *   When `XP` reaches the amount required for the current tier (`XPToNextTier`), the `IncreaseTier` function is called.
        *   `XP` resets (likely to 0 or the remainder after leveling up), and `Tier` increments by 1.
    *   **Rank Progression:**
        *   If `Tier` increments past 5, `Tier` resets to 1, and the player's `Rank` (`ERank`) increases to the next one.
    *   `onRankUp`: An event fires whenever the player's `FullRank` (Tier or Rank) increases, which can trigger UI notifications or other game events.

3.  **XP Requirements:**
    *   `XP_PER_TIER_MIN`: The minimum XP required for *any* single tier increase is **200 XP**.
    *   `XP_PER_TIER_MAX`: The maximum XP required for *any* single tier increase is **2500 XP**.
    *   `GetXPForTier(ERank rank)`: This function calculates the specific amount of XP needed *per tier* within a given `ERank`. This implies that the XP needed per tier increases as the player achieves higher Ranks, scaling between the 200 minimum and 2500 maximum. The exact scaling formula isn't visible, but the function confirms it varies by Rank.
    *   `GetTotalXPForRank(FullRank fullrank)`: Calculates the total cumulative XP required to reach a specific `FullRank`.
    *   `GetFullRank(int totalXp)`: Can determine the player's `FullRank` based solely on their `TotalXP`.

4.  **Gameplay Impact of Rank:**
    *   `GetOrderLimitMultiplier(FullRank rank)`: **Critically important.** This function calculates a multiplier based on the player's `FullRank` that directly affects the **order limit** when purchasing from Suppliers. Higher ranks allow for larger orders. The calculation seems primarily based on the `ERank` itself (`GetRankOrderLimitMultiplier`). This links progression directly to the player's economic potential.

5.  **Unlocks (`Unlockable.cs`, `LevelManager.cs`):**
    *   Items, features, or abilities can be locked behind specific ranks.
    *   `Unlockable`: A data structure representing something that can be unlocked. It stores:
        *   `Rank`: The specific `FullRank` (Rank and Tier) required for the unlock.
        *   `Title`: The name of the unlock (e.g., "Long-Life Soil", "Mixing Station Mk2").
        *   `Icon`: A sprite used for UI display.
    *   `Unlockables` (in `LevelManager`): A dictionary that maps each `FullRank` to a list of `Unlockable` items/features that become available when the player reaches that rank. This is likely populated at game start by checking all items' requirements.

6.  **Saving:**
    *   The player's leveling progress (`Rank`, `Tier`, `XP`, `TotalXP`) is saved (`ISaveable`, `RankData`).

---

**Summary for Players & Website:**

This leveling system is a core progression loop. Players gain XP (presumably from selling products, completing deals/quests) which fills a bar for their current Tier. Completing 5 Tiers advances them to the next Rank.

*   **Key Goal:** Reaching higher Ranks and Tiers.
*   **Reward:** Unlocks new items/features (`Unlockable` items tied to specific `FullRank`).
*   **Benefit:** Significantly increases Supplier **Order Limits** (`GetOrderLimitMultiplier`), allowing for larger scale operations.
*   **Tracking:** Players can track their current Rank, Tier, and XP towards the next Tier.
*   **Website Utility:**
    *   Display the list of Ranks and Tiers.
    *   Show the XP required for each Tier/Rank (if the scaling formula can be deduced or estimated).
    *   List all unlockables and the specific `FullRank` required for each.
    *   Explain the crucial benefit of increased Supplier Order Limits at higher ranks.

This system provides clear goals and tangible rewards for player progression.
```

# map.md

```md
**Map Structure & Regions (`Map.cs`, `MapRegionData.cs`, `EMapRegion.cs`)**

*   **Map Regions:** The game world is divided into distinct regions defined by the `EMapRegion` enum:
    *   `Northtown`
    *   `Westville`
    *   `Downtown`
    *   `Docks`
    *   `Suburbia`
    *   `Uptown`
*   **Region Data (`MapRegionData`):** Each region has associated data:
    *   `Name`: Display name of the region.
    *   `RankRequirement`: **Crucial:** The specific `FullRank` (Tier and Level) the player must achieve to unlock/access this region. Unlocking likely happens automatically upon reaching the rank (`Map.OnRankUp`).
    *   `StartingNPCs`: A list of NPCs initially present or unlocked within this region.
    *   `RegionSprite`: The icon/image used for this region on the map UI.
    *   `RegionDeliveryLocations`: An array of potential `DeliveryLocation` objects within this region, used for customer/dealer deals. `GetRandomUnscheduledDeliveryLocation` suggests the game picks from available spots.
    *   `IsUnlocked`: Tracks if the player currently meets the rank requirement for this region.
*   **Map Manager (`Map.cs`):** A central script that holds data for all regions (`Regions`) and likely manages region unlocking based on player rank. References key locations like `PoliceStation` and `MedicalCentre`.

---

**Points of Interest & UI (`POI.cs`, `NPCPoI.cs`, `MapPositionUtility.cs`)**

*   **POI Basics (`POI.cs`):** Represents points of interest that appear on the map UI.
    *   `UIPrefab`: Defines the visual appearance (icon, label).
    *   `DefaultMainText`: The default label text. Can be changed (`SetMainText`).
    *   `TextShowMode`: Controls when the label is visible (Always, OnHover, Off).
    *   Handles hover and click interactions.
*   **NPC POIs (`NPCPoI.cs`):** A specific type of POI linked directly to an `NPC`. Its UI likely updates based on the NPC's status or location.
*   **Map Coordinates (`MapPositionUtility.cs`):** Converts 3D world positions to 2D map coordinates using an `OriginPoint`, `EdgePoint`, and overall `MapDimensions`. Useful for understanding how the map display relates to the game world.

---

**Access Control (`AccessZone.cs`, `TimedAccessZone.cs`, `NPCPresenceAccessZone.cs`)**

*   **General Access Zones (`AccessZone.cs`):** Controls access to areas by managing associated `Doors` and `Lights`.
    *   `IsOpen`: Tracks the current state.
    *   `AllowExitWhenClosed`: Determines if the player can leave a zone even if it's logically "closed".
    *   `AutoCloseDoor`: If doors linked to the zone close automatically.
*   **Time-Based Access (`TimedAccessZone.cs`):** An `AccessZone` that opens and closes based on game time.
    *   `OpenTime`, `CloseTime`: Defines the daily window (in minutes or time format) when the zone is open.
*   **NPC Presence Access (`NPCPresenceAccessZone.cs`):** An `AccessZone` controlled by the presence of a specific `TargetNPC` within a `DetectionZone`.
    *   Opens when the target NPC is detected, closes when they leave (with a 0.5s `CooldownTime` to prevent flickering).

---

**Specific Locations & Interactions**

*   **Dark Market (`DarkMarket.cs`, `DarkMarketAccessZone.cs`, `DarkMarketMainDoor.cs`):**
    *   **Unlock Condition:** Requires the player to reach a specific `UnlockRank` (defined in `DarkMarket.UnlockRank`).
    *   **Access Timing:** The market has specific open/close times, managed by `DarkMarketAccessZone` (inherits `TimedAccessZone`). Access is only possible if the player is unlocked *and* the market is currently open.
    *   **Entry Procedure:**
        1.  Interact with the `DarkMarketMainDoor`.
        2.  Requires knocking (`KnockSound`).
        3.  Interaction involves an NPC named `Igor` (likely a bouncer) and a `Peephole`.
        4.  Outcome depends on player unlock status and market open state (`FailDialogue`, `SuccessDialogue`, `SuccessDialogueNotOpen`).
    *   **Vendor:** Contains an NPC named `Oscar` (likely the main vendor here).
*   **Autoshop (`AutoshopAccessZone.cs`):**
    *   Access controlled by NPC presence (`NPCPresenceAccessZone`) and vehicle detection (`VehicleDetection`).
    *   Features an animated `RollerDoorAnim`.
*   **Dealership (`Dealership.cs`):**
    *   Location for acquiring vehicles.
    *   `SpawnVehicle(string vehicleCode)`: Function to spawn a specific vehicle type.
    *   `SpawnPoints`: Multiple locations where spawned vehicles appear.
*   **Manor Gate (`ManorGate.cs`):**
    *   A specific, interactable gate (`Gate` base class).
    *   Features an `IntercomInt` (Interactable Object). Requires buzzing (`IntercomBuzzed`) to potentially open.
    *   Uses `VehicleDetector` and `PlayerDetector` (both interior and exterior) to potentially manage opening/closing automatically based on proximity.
    *   `SetEnterable`: Controls if the intercom interaction is enabled.
*   **Medical Centre (`MedicalCentre.cs`):**
    *   An `NPCEnterableBuilding`.
    *   **Respawn Point:** Contains the `RespawnPoint` transform where the player appears after death/incapacitation.
*   **Police Station (`PoliceStation.cs`):**
    *   An `NPCEnterableBuilding`.
    *   **Dispatch Logic:**
        *   `Dispatch` function sends police officers after the `targetPlayer`.
        *   Can dispatch a specific `requestedOfficerCount`.
        *   `EDispatchType`: Can be `Auto` (game decides), `UseVehicle`, or `OnFoot`.
        *   `VehicleLimit`: Maximum number of police vehicles the station can have deployed at once.
    *   **Spawning:**
        *   `SpawnPoint`: Where officers appear when dispatched on foot.
        *   `VehicleSpawnPoints`: Where police vehicles spawn.
        *   `PoliceVehiclePrefabs`: List of vehicle types the station can spawn.
        *   `OfficerPool`: List of available `PoliceOfficer` NPCs managed by the station.
    *   `GetClosestPoliceStation`: Utility to find the nearest station to a point.

---

**Environmental & Simulation Elements**

*   **Building Entry/Exit (`NPCEnterableBuilding.cs`):** Base class for buildings NPCs can go into. Tracks `Occupants` (NPCs currently inside) and manages `Doors`.
*   **Gates (`Gate.cs`):** Base class for animated gates with open/closed states, movement speed, and sounds.
*   **Ocean (`OceanCollider.cs`):** Acts as a boundary. If the player or a land vehicle enters the trigger:
    *   Plays a `SplashSound`.
    *   Initiates a warp sequence (`WarpPlayer`, `WarpVehicle`) involving a screen fade, moving the player/vehicle to a safe location (likely last ground position), and fading back in. Prevents player/vehicles from being lost at sea.
*   **Parking (`ParkingLot.cs`, `ParkingSpot.cs`):** System for AI vehicles to find parking spots within designated lots. Defines entry/exit points and individual spots with alignment. Likely background simulation.
*   **Street Lights (`Infrastructure\StreetLight.cs`):**
    *   Turn on between `StartTime` and `EndTime` (game time).
    *   `StartTimeOffset` adds variability to when individual lights turn on.
    *   Visuals change (`LightOnMat`, `LightOffMat`).
    *   Shadow casting behaviour can change based on distance (`ShadowsEnabled`, distance thresholds).
*   **Traffic Lights (`Infrastructure\TrafficLight.cs`, `Infrastructure\Intersection.cs`):**
    *   Simulates traffic light cycles at intersections.
    *   `Intersection` script manages sets of lights (`path1Lights`, `path2Lights`) and associated `obstacles` (likely invisible colliders to stop AI cars).
    *   Cycles through Red, Orange (Amber), Green states based on timers (`path1Time`, `path2Time`). `TrafficLight.amberTime` is likely a global setting for the duration of the orange light.
*   **Cosmetic Details:**
    *   `FoliageRustleSound`: Sound effect when moving through bushes.
    *   `Grave`: Random visual variations for graves.
    *   `ScheduledMaterialChange`: Changes object appearances based on time (e.g., shop signs turning on/off).

---

This extraction covers the key map locations, region unlocking, access control mechanics, points of interest, and relevant simulation details like police dispatch and respawn points. It omits purely cosmetic or deep background simulation details unless they hint at a player-relevant rule.
```

# market.md

```md
**Merchant Mechanics (`Merchant.cs`)**

*   **Type:** Base definition for interactable shopkeeper NPCs.
*   **Core Function:** Represents an NPC the player can interact with, presumably to open a shop interface.
*   **Key Player-Facing Properties:**
    *   `shopName`: The display name of the shop associated with this merchant.
    *   `openTime`: The in-game time (likely minutes from midnight) when the merchant becomes available/the shop opens.
    *   `closeTime`: The in-game time when the merchant becomes unavailable/the shop closes.
*   **Interaction:**
    *   `Interacted()`: This function is called when the player interacts with the merchant. It's the trigger to open the specific shop UI associated with this merchant type (though the base class doesn't specify *which* shop UI).
*   **Note:** Specific items sold are not defined in this base class, but likely in associated ShopInterface assets or configurations linked to the specific merchant types.

---

**General Store Merchant Mechanics (`GeneralStoreMerchant.cs`)**

*   **Type:** Specific type of Merchant.
*   **Inherits:** All properties and base interaction logic from `Merchant.cs` (Shop Name, Open Time, Close Time, Interaction opens shop).
*   **Purpose:** Represents a standard general store, likely selling common legal goods (based on the name). The specific inventory is defined elsewhere.

---

**Underground Merchant Mechanics (`UndergroundMerchant.cs`)**

*   **Type:** Specific type of Merchant.
*   **Inherits:** All properties and base interaction logic from `Merchant.cs` (Shop Name, Open Time, Close Time, Interaction opens shop).
*   **Purpose:** Represents a hidden or illegal merchant. Implies they likely sell restricted, illegal, or specialized items not found in general stores. Operating hours or location might be less conventional. The specific inventory is defined elsewhere.

---

**Builder Merchant Mechanics (`BuilderMerchant.cs`)**

*   **Type:** Specific type of interactable NPC, likely distinct from standard item merchants.
*   **Purpose:** Seems to be an NPC focused on property or building transactions.
*   **Key Player-Facing Properties:**
    *   `openTime`: Time the builder merchant is available.
    *   `closeTime`: Time the builder merchant becomes unavailable.
*   **Interaction:**
    *   `Interacted()`: Triggered when the player clicks the merchant. This interaction appears to be linked to opening a `PropertySelector` UI, allowing the player to view or purchase properties/buildings.
    *   `PropertySelected(Property p)`: Internal callback after a property is chosen in the UI.

---

**Vendor Zone Mechanics (`VendorZone.cs`)**

*   **Type:** A physical area/zone in the game world, not an NPC.
*   **Purpose:** Controls access to a specific area (likely containing multiple vendors or shops) based on time.
*   **Key Player-Facing Properties:**
    *   `openTime`: The in-game time the zone becomes accessible (doors likely unlock/open).
    *   `closeTime`: The in-game time the zone becomes inaccessible (doors likely lock/close).
    *   `isOpen` (Property): A boolean indicating if the zone is currently accessible based on game time.
*   **Functionality:**
    *   Manages a list of `doors` associated with the zone.
    *   Checks the game time (`MinPassed`) and activates/deactivates the doors (`SetDoorsActive`) to enforce the open/close times.
    *   Players can only enter/access the vendors within this zone during its operating hours.

---

**Summary of Market Information:**

This code establishes that the game has different types of merchants (General Store, Underground, Builder) with specific operating hours (`openTime`, `closeTime`) and interaction results (opening item shops or property selectors). It also introduces the concept of `VendorZone`s, physical areas that control player access to potentially multiple vendors based on a schedule, physically opening/closing doors. This information is crucial for players planning their shopping trips and understanding when/where they can buy specific types of goods or properties. The exact inventory of each merchant type is not detailed in these specific scripts but is referenced by them.
```

# money.md

```md
**ATM Mechanics (`ATM.cs`)**

*   **Core Function:** ATMs allow players to deposit physical cash into their online bank balance and potentially withdraw cash (though withdrawal isn't explicitly shown in the interaction logic here, the UI likely handles it).
*   **Interaction:**
    *   Players interact with ATMs using the standard interaction system (`InteractableObject`).
    *   Using an ATM transitions the player camera (`camPos`) and opens a dedicated UI (`ATMInterface`).
    *   `AccessPoint`: The specific transform defining where the player needs to stand to use the ATM.
    *   `isInUse`: Tracks if another player (in multiplayer) is currently using the ATM, preventing simultaneous use.
*   **Deposit Limit:**
    *   `DepositLimitEnabled`: **True** - There is a limit on deposits.
    *   `WEEKLY_DEPOSIT_LIMIT`: Players can only deposit a maximum of **$10,000** into ATMs per in-game week.
    *   `WeeklyDepositSum`: A static variable tracking the total amount deposited across all ATMs by the player in the current week.
    *   `WeekPass()`: This function likely resets `WeeklyDepositSum` to zero at the start of each new week.
*   **Breaking ATMs:**
    *   ATMs have health and can be broken (`PhysicsDamageable`).
    *   `IMPACT_THRESHOLD_BREAK`: Requires an impact force of **165f** or higher to break the ATM.
    *   `IsBroken`: Tracks the broken state. Broken ATMs cannot be used.
    *   `onBreak`: An event triggered when the ATM breaks.
    *   When broken, the ATM drops physical cash pickups (`DropCash()`).
        *   `CashPrefab`: The type of cash pickup object spawned.
        *   `CashSpawnPoint`: Where the cash pickups appear.
        *   `MIN_CASH_DROP`: Drops a minimum of **2** cash pickups.
        *   `MAX_CASH_DROP`: Drops a maximum of **8** cash pickups. (Note: This is the number of pickups, not the total cash value).
*   **Repairing ATMs:**
    *   Broken ATMs repair themselves automatically over time.
    *   `REPAIR_TIME_DAYS`: Takes **2** in-game days to repair.
    *   `DaysUntilRepair`: Tracks the remaining repair time. `DayPass()` function reduces this count daily.
    *   `onRepair`: An event triggered when the ATM is repaired.
*   **Saving:** The state of each ATM (IsBroken, DaysUntilRepair) is saved (`IGenericSaveable`). The `WeeklyDepositSum` is likely saved globally as part of the `MoneyManager`.
*   **Player Relevance:** ATMs are the primary way to convert potentially illicit cash into usable online balance, but the weekly limit is a significant constraint, pushing players towards laundering mechanics for larger sums. ATMs can also be a risky source of small amounts of physical cash if broken.

---

**Cash Inventory (`CashSlot.cs`)**

*   **Core Function:** Defines the properties of inventory slots specifically designated for holding physical cash.
*   **Capacity Limit:**
    *   `MAX_CASH_PER_SLOT`: Each dedicated cash slot in the player's inventory can hold a maximum of **$1,000** in physical cash.
*   **Functionality:**
    *   Inherits from `HotbarSlot`, suggesting these might be usable on the hotbar.
    *   `CanSlotAcceptCash()` returning `false` is slightly unusual syntax - it likely means this slot *only* accepts cash items (`CashInstance`) and rejects other item types trying to be placed into it, rather than meaning it cannot accept cash at all. Cash pickup probably bypasses this check or uses a different mechanism to add to the slot.
*   **Player Relevance:** Limits how much physical cash the player can carry efficiently. Carrying large amounts requires multiple inventory slots. This influences logistics, risk (dropping cash on death/arrest), and the need to deposit or launder funds.

---

**Money Management (`MoneyManager.cs`)**

*   **Core Function:** This is the central script managing the player's financial state. It tracks both physical cash and online bank balance, handles transactions, and calculates net worth. It's a Network Singleton, meaning one instance manages this for the game/server.
*   **Two Currency Types:**
    *   **Cash Balance (`cashBalance`):** Physical money held by the player. This value is *calculated* by summing the value of `CashInstance` items in the player's inventory (likely using the `PlayerInventory`). `ChangeCashBalance` adds/removes these cash items.
    *   **Online Balance (`onlineBalance`):** Money held in the player's bank account. This is a directly tracked `SyncVar` (synchronized variable in multiplayer). Changes happen via ATM deposits/withdrawals or `CreateOnlineTransaction`.
*   **Transactions & Ledger:**
    *   `ledger`: A list storing records of `Transaction` objects, primarily for online balance changes (purchases, business income, laundering deposits).
    *   `CreateOnlineTransaction`: Adds a transaction to the ledger and updates `onlineBalance`. Takes transaction name, unit amount, quantity, and note as parameters.
    *   `Transaction.cs`: Defines the structure of a transaction record (name, unit amount, quantity, note, calculated total amount).
*   **Lifetime Earnings:**
    *   `LifetimeEarnings`: Tracks the total cumulative online balance earned throughout the game. This is a `SyncVar`.
    *   `ChangeLifetimeEarnings`: Modifies this value (e.g., when receiving payment for deals or business income).
*   **Net Worth:**
    *   `GetNetWorth()`: Calculates the player's total financial value by summing `cashBalance`, `onlineBalance`, and potentially the value of other assets (indicated by the `onNetworthCalculation` event, which other systems like property or vehicle ownership might hook into).
    *   `LastCalculatedNetworth`: Stores the result of the last calculation.
    *   `CheckNetworthAchievements`: Likely checks if the player's net worth has reached thresholds for unlocking achievements.
*   **UI & Feedback:**
    *   `ShowOnlineBalanceChange`, `ShowCashChange`: Functions that create temporary UI elements (`moneyChangePrefab`, `cashChangePrefab`) on screen to visually confirm changes in money.
    *   `FormatAmount`: Utility function to display monetary values as strings, potentially including currency symbols and specific colors (`MONEY_TEXT_COLOR` = green "#54E717", `ONLINE_BALANCE_COLOR` = blue "#4CBFFF").
    *   `CashSound`: An `AudioSourceController` used to play sound effects when cash balance changes.
*   **Laundering Hint:**
    *   `LaunderingNotificationIcon`: Existence of this suggests a notification system related to money laundering, which is likely the primary method for exceeding the ATM's weekly deposit limit. Laundering probably involves interacting with player-owned businesses.
*   **Saving:** The `MoneyManager` saves its state (`ISaveable`), including `onlineBalance`, `lifetimeEarnings`, and the transaction `ledger`. The physical cash balance is implicitly saved via the player's inventory save data.
*   **Player Relevance:** This script is the backbone of the player's economy. It defines the two currency types, tracks balances, provides transaction history, and likely interacts with other systems (businesses, inventory, UI) to form the complete financial loop. Understanding the difference between cash and online balance, and the limits associated with converting cash (ATM limit), is crucial for game progression.

---

This detailed breakdown covers the rules, limits, and interactions within the game's money systems as revealed by the code.
```

# npc.md

```md
**Core NPC System & General Mechanics (`NPC.cs`, `NPCManager.cs`, `NPCMovement.cs`, `NPCHealth.cs`, `NPCInventory.cs`, `NPCAwareness.cs`)**

*   **Identification:**
    *   NPCs have `FirstName`, `LastName` (optional), and a unique `ID`.
    *   Have a `MugshotSprite` (potentially auto-generated).
    *   Assigned to a specific `EMapRegion`.
*   **Persistence & Management (`NPCManager.cs`, `NPC.cs`):**
    *   `NPCManager` keeps a registry (`NPCRegistry`) of all NPCs.
    *   NPC state (health, inventory, relationships, etc.) is saved (`ISaveable`).
    *   `IsImportant` flag: If true, NPC respawns the next day after death/knockout instead of the default **3 days** (`NPCHealth.REVIVE_DAYS`).
    *   NPCs can be found using `NPCManager.GetNPC(id)`.
*   **Health & Consciousness (`NPCHealth.cs`, `NPC.cs`):**
    *   NPCs have `MaxHealth` and current `Health`.
    *   Can be `Invincible`.
    *   Can be `IsDead` or `IsKnockedOut`.
    *   `IsConscious` is true if neither dead nor knocked out.
    *   Taking damage (`TakeDamage`) reduces health. Lethal damage can kill, non-lethal damage can knock out.
    *   Specific thresholds in `NPCMovement.cs` determine reactions to impacts/collisions (see Movement section).
    *   `onDie`, `onKnockedOut`, `Revive` events handle state changes.
*   **Movement & Position (`NPCMovement.cs`):**
    *   Uses `NavMeshAgent` for pathfinding. Different agent types exist (`EAgentType`: Humanoid, BigHumanoid, IgnoreCosts).
    *   Has `WalkSpeed` and `RunSpeed`, modified by `MoveSpeedMultiplier`.
    *   Can have `SlipperyMode` enabled (affects traction).
    *   Can navigate to specific `Vector3` positions or `ITransitEntity` (like doors, chairs).
    *   Pathfinding can fail (`WalkResult.Failed`). NPCs might teleport if pathing fails repeatedly (`MAX_CONSECUTIVE_PATHING_FAILURES` = 5).
    *   `CanGetTo`: Checks if a path exists to a location.
    *   `Stop()`: Halts current movement.
    *   `PauseMovement()` / `ResumeMovement()`: Temporarily stops/starts the agent.
    *   `Warp()`: Instantly moves the NPC.
    *   Can `FacePoint` or `FaceDirection`.
    *   `SetStance`: Can adopt different stances (e.g., sitting).
    *   `SetGravityMultiplier`: Can alter gravity effect (e.g., for ragdoll).
*   **Ragdoll & Impacts (`NPCMovement.cs`):**
    *   NPCs can enter a ragdoll state (`ActivateRagdoll`).
    *   Collision/Impact Force Thresholds:
        *   Light Flinch: **50f**
        *   Heavy Flinch: **100f**
        *   Ragdoll: **150f**
    *   Momentum-Based Thresholds (e.g., bumping into them):
        *   Annoyed Reaction: **10f**
        *   Light Flinch: **20f**
        *   Heavy Flinch: **40f**
        *   Ragdoll: **60f**
    *   Can `Stumble` (duration **0.66s**, force **7f**).
    *   `CanRecoverFromRagdoll()`: Checks if conditions allow standing up.
    *   `ApplyRagdollForce`: Pushes the ragdoll.
    *   Ragdoll can be made draggable (`SetRagdollDraggable`).
*   **Inventory (`NPCInventory.cs`):**
    *   Has a fixed number of `SlotCount`.
    *   `CanBePickpocketed` flag determines if the player can attempt pickpocketing.
        *   Pickpocketing has a cooldown (`COOLDOWN` = **30 seconds**).
        *   Failed pickpocket attempts are noticed (`PlayerFailedPickpocket` response).
    *   `ClearInventoryEachNight`: If true, inventory is wiped daily.
    *   Can spawn with `RandomCash` (between `RandomCashMin` and `RandomCashMax`).
    *   Can spawn with `RandomItems` (between `RandomItemMin` and `RandomItemMax` count) chosen from `RandomItemDefinitions`.
    *   Functions exist to check item counts (`GetItemAmount`), if items can fit (`CanItemFit`, `HowManyCanFit`), and retrieve items (`GetFirstItem`).
*   **Awareness & Perception (`NPCAwareness.cs`):**
    *   Uses `VisionCone` to see events.
    *   Uses `Listener` to hear `NoiseEvent`s (like gunshots, explosions).
    *   Detects being aimed at within `PLAYER_AIM_DETECTION_RANGE` (**15m**).
    *   Triggers specific `NPCResponses` based on events noticed (crime, curfew violations, suspicious activity, being hit by car, hearing loud noises).
*   **Responses & Reactions (`NPCResponses.cs`, `NPCResponses_Civilian.cs`):**
    *   Base responses define relationship changes for hostile actions:
        *   Assault (Non-Lethal): **-0.25** Relationship
        *   Deadly Assault: **-1.0** Relationship
        *   Being Aimed At: **-0.5** Relationship
        *   Failed Pickpocket Attempt: **-0.25** Relationship
    *   Civilians (`NPCResponses_Civilian`) have specific threat responses (`EAttackResponse`):
        *   `Panic`: Cower in place.
        *   `Flee`: Run away from the threat.
        *   `CallPolice`: Attempt to call police (if `CanCallPolice` is true).
        *   `Fight`: Engage in combat (depends on `Aggression`).
    *   Response depends on `ThreatType` (AimedAt, Gunshot, Explosion) and NPC `Aggression`.
    *   NPCs become `isUnsettled` after witnessing crime or being threatened.
    *   Can enter `IsPanicked` state for `PANIC_DURATION` (**20 seconds**).
*   **Actions (`NPCActions.cs`):**
    *   Provides methods for specific actions like `Cower`, `CallPolice_Networked`, `FacePlayer`.
*   **Behaviours (`NPCBehaviour.cs`, `Behaviour/*.cs`):**
    *   NPCs have a stack of potential `Behaviour`s.
    *   `NPCBehaviour` manages the stack and determines the `activeBehaviour` based on `Priority`. Higher priority behaviours interrupt lower ones.
    *   Behaviours define states and logic (e.g., Idle, Fleeing, Patrolling, Working, Fighting, Talking).
    *   Specific behaviours extracted below.
*   **Relationships (`NPCRelationData.cs`, `RelationshipCategory.cs`):**
    *   `RelationDelta`: Tracks relationship value (range **0.0f** to **5.0f**, default **2.0f**).
    *   `NormalizedRelationDelta`: Scales relationship to 0-1 range.
    *   `ERelationshipCategory`: Defines relationship levels based on delta: `Hostile`, `Unfriendly`, `Neutral`, `Friendly`, `Loyal`. Each has an associated UI color.
    *   `Unlocked`: Tracks if the player has formally met/unlocked the NPC.
    *   `UnlockType`: How they were unlocked (`Recommendation` or `DirectApproach`).
    *   `Connections`: List of other NPCs this NPC knows. Used for recommendations.
    *   Relationship changes affect interactions (prices, deal success, recommendations).
*   **Scheduling (`NPCScheduleManager.cs`, `Schedules/*.cs`):**
    *   NPCs follow a list of `NPCAction`s based on game time (`TimeManager`).
    *   `NPCEvent`: Actions with a start time and duration.
    *   `NPCSignal`: Actions triggered at a specific start time.
    *   `ActiveAction`: The currently running schedule item.
    *   Handles `CurfewModeEnabled` (activating/deactivating specific GameObjects).
*   **Other:**
    *   `CanOpenDoors`: Flag if NPC can use doors.
    *   `Avatar`: Handles the visual appearance and animation.
    *   `VoiceOverEmitter`: Plays voice lines (`PlayVO`).
    *   Can enter/exit vehicles (`EnterVehicle`, `ExitVehicle`). `CurrentVehicle` tracks the vehicle they are in.
    *   Can enter/exit buildings (`EnterBuilding`, `ExitBuilding`). `CurrentBuilding` tracks the building they are in.

---

**Specific NPC Behaviours (Extracted from `Behaviour/*.cs`)**

*   **IdleBehaviour:** Stand at an `IdlePoint`.
*   **StationaryBehaviour:** Stand still (likely used during conversations or specific actions).
*   **ScheduleBehaviour:** Follows the assigned `NPCScheduleManager`.
*   **FacePlayerBehaviour:** Turn to face the `Player` for a `Countdown` duration (default 5s).
*   **GenericDialogueBehaviour:** Handles generic dialogue interactions with a `targetPlayer`.
*   **CoweringBehaviour:** Play cowering animation.
*   **HeavyFlinchBehaviour:** Play heavy flinch animation for `FLINCH_DURATION` (**1.25s**).
*   **RagdollBehaviour:** Controls the ragdoll state, potentially including `Seizure` effect.
*   **UnconsciousBehaviour:** Plays unconscious effects (e.g., `Particles`, `SnoreSounds` every `SnoreInterval` = 6s).
*   **DeadBehaviour:** Handles the dead state, including potential respawn logic at a medical center.
*   **FleeBehaviour:** Run away from an `EntityToFlee` or `PointToFlee`. Runs between `FLEE_DIST_MIN` (**20m**) and `FLEE_DIST_MAX` (**40m**) away. Speed is `FLEE_SPEED` (**0.7x** base?).
*   **CallPoliceBehaviour:**
    *   NPC stops, equips a `PhonePrefab`, plays `CallSound`.
    *   Takes `CALL_POLICE_TIME` (**4 seconds**) to complete the call.
    *   Reports a specific `Crime` related to the `Target` player.
*   **ConsumeProductBehaviour:**
    *   Handles the animation and effects of consuming a `ProductItemInstance`.
    *   Uses different prefabs/sounds based on product type (`JointPrefab`, `PipePrefab`, `WeedConsumeSound`, `MethConsumeSound`, `SnortSound`).
    *   Applies status effects (`ApplyEffects`).
*   **RequestProductBehaviour:** (Likely for Customers approaching Player)
    *   Approaches `TargetPlayer` within `CONVERSATION_RANGE` (**2.5m**).
    *   Initiates dialogue (`StartInitialDialogue`).
    *   Can enter `FollowPlayer` state if player agrees but needs to move (stays within `FOLLOW_MAX_RANGE` = **5m**).
    *   Cooldown before asking again: `MINS_TO_ASK_AGAIN` (**90 minutes**).
    *   Opens Handover screen if player accepts (`RequestAccepted`).
*   **AttendingDealBehaviour:** State for waiting at a deal location.
*   **FootPatrolBehaviour:**
    *   Follows a `FootPatrolRoute` defined by waypoints.
    *   Moves at `MOVE_SPEED` (**0.08x** base?).
    *   Can use a flashlight (`UseFlashlight`, `FLASHLIGHT_ASSET_PATH`) between `FLASHLIGHT_MIN_TIME` (**19:30**) and `FLASHLIGHT_MAX_TIME`.
    *   Works in `PatrolGroup`s, waiting for other members before advancing.
*   **VehiclePatrolBehaviour:**
    *   Drives a `Vehicle` along a `VehiclePatrolRoute`.
    *   Uses `VehicleAgent` for AI driving.
*   **SentryBehaviour:**
    *   Stands guard at a `SentryLocation`.
    *   Can use a flashlight (same times/asset as FootPatrol).
    *   Has a `BODY_SEARCH_CHANCE` (**75%**) to initiate a body search on players detected doing something suspicious (likely linked from `NPCAwareness`).
*   **BodySearchBehaviour:** (Police Action)
    *   Targets a specific `Player`.
    *   Requires player to stay within `BODY_SEARCH_RANGE` (**2m**).
    *   Takes `BODY_SEARCH_TIME` (calculated, max **15s**) to complete.
    *   Player moving too far away (`RANGE_TO_ESCALATE` = **15m**) or staying outside range for too long (`MAX_TIME_OUTSIDE_RANGE` = **4s**) causes the search to fail/escalate.
    *   Detects illicit items based on `EStealthLevel` (up to `MAX_STEALTH_LEVEL` = `None`, meaning *any* illegal item might be found unless packaging provides stealth).
    *   Results in `onSearchComplete_Clear` or `onSearchComplete_ItemsFound`.
    *   Cooldown after search: `BODY_SEARCH_COOLDOWN` (**30s**).
*   **CheckpointBehaviour:** (Police Action)
    *   Operates at a `RoadCheckpoint`.
    *   Can initiate a vehicle search (`StartSearch`) on `targetVehicle`.
    *   Search involves looking (`LOOK_TIME` = **1.5s**) and potentially checking trunk.
    *   Detects illicit items in the vehicle.
*   **PursuitBehaviour:** (Police Action - On Foot)
    *   Targets a `Player`.
    *   Different movement speeds based on state (`MOVE_SPEED_INVESTIGATING`=0.35x, `MOVE_SPEED_ARRESTING`=0.6x, `MOVE_SPEED_CHASE`=0.8x).
    *   `IsSearching` state when target is not visible (`isTargetVisible` flag). Searches near last known position (`SearchRoutine`). Search radius **25m-80m**.
    *   Attempts arrest if within `ARREST_RANGE` (**2.5m**). Takes `ARREST_TIME` (**1.75s**) to complete arrest. Progress resets if player leaves range.
    *   `LEAVE_ARREST_CIRCLE_LIMIT` (**3 times**): Leaving the arrest circle too many times might cause escalation.
    *   Can engage in combat (`UpdateLethalBehaviour`). Uses `AvatarRangedWeapon`. Accuracy increases on consecutive misses (`CONSECUTIVE_MISS_ACCURACY_BOOST` = **+10%**). Moves slower while shooting (`MOVE_SPEED_SHOOTING`=0.15x).
*   **VehiclePursuitBehaviour:** (Police Action - In Vehicle)
    *   Drives `vehicle` to chase `TargetPlayer`.
    *   Uses `VehicleAgent` AI. Can enable `aggressiveDrivingEnabled`.
    *   Tries to get within `CLOSE_ENOUGH_THRESHOLD` (**10m**) of the player's vehicle or predicted path.
    *   Exits vehicle (`CheckExitVehicle`) if target is stationary for too long (`TIME_STATIONARY_TO_EXIT` = **3s**) or moving slowly (`EXIT_VEHICLE_MAX_SPEED` = **4 m/s?**). Likely transitions to `PursuitBehaviour`.
*   **Employee Task Behaviours:** (Botanist, Packager, Chemist, Cleaner)
    *   **MoveItemBehaviour:** Core logic for employees moving items between `TransitRoute` source/destination (e.g., storage to station). Handles pathing, grabbing, placing.
    *   **PotActionBehaviour:** (Botanist) Performs actions on `Pot`s (`PourSoil`, `SowSeed`, `Water`, `ApplyAdditive`, `Harvest`). Requires walking to supplies if needed. Specific timings (`GetWaitTime`) and animations (`GetActionAnimation`) per action. Checks if pot needs action (`CanPotBe...`).
    *   **PackagingStationBehaviour:** (Packager) Uses a `PackagingStation`. Takes `BASE_PACKAGING_TIME` (**5s**) per item.
    *   **BrickPressBehaviour:** (Packager/Chemist?) Uses a `BrickPress`. Takes `BASE_PACKAGING_TIME` (**15s**).
    *   **StartChemistryStationBehaviour:** (Chemist) Uses `ChemistryStation`. Involves placing ingredients (**8s**), stirring (**6s**), using burner (**6s**). Requires recipe ingredients.
    *   **StartLabOvenBehaviour:** (Chemist) Uses `LabOven`. Involves pouring time (**5s**).
    *   **FinishLabOvenBehaviour:** (Chemist) Harvests finished product from `LabOven`. Takes `HARVEST_TIME` (**10s**).
    *   **StartMixingStationBehaviour:** (Chemist) Uses `MixingStation`. Involves inserting ingredients (**1s** base time per ingredient).
    *   **StartDryingRackBehaviour:** (Botanist/Chemist?) Places items onto `DryingRack`. Takes `TIME_PER_ITEM` (**1s**).
    *   **StopDryingRackBehaviour:** (Botanist/Chemist?) Removes items from `DryingRack`. Takes `TIME_PER_ITEM` (**1s**).
    *   **BagTrashCanBehaviour:** (Cleaner) Empties a `TrashContainerItem`. Takes `BAG_TIME` (**3s**). Requires being within `ACTION_MAX_DISTANCE` (**2m**).
    *   **PickUpTrashBehaviour:** (Cleaner) Picks up `TrashItem` using grabber. Requires being within `ACTION_MAX_DISTANCE` (**2m**). Uses `TrashGrabber_AvatarEquippable`.
    *   **EmptyTrashGrabberBehaviour:** (Cleaner) Empties collected trash into `TrashContainerItem`. Requires being within `ACTION_MAX_DISTANCE` (**2m**).
    *   **DisposeTrashBagBehaviour:** (Cleaner) Takes a filled `TrashBag` to a dumpster (likely). Uses `TRASH_BAG_ASSET_PATH`.

---

**Named NPC Details (from `CharacterClasses/*.cs` and root NPC files)**

*   **Albert:** Supplier (`Albert.cs` inherits `Supplier`).
*   **Alison:** Standard NPC.
*   **Anna:** Standard NPC. Has a check `HairCutChoiceValid` suggesting a haircut interaction.
*   **Austin:** Standard NPC.
*   **Benji:** Dealer (`Benji.cs` inherits `Dealer`). `onRecruitmentRequested` event suggests specific recruitment logic/quest step.
*   **Beth:** Standard NPC. (Mentioned as a friend of Benji in `phonecalls.md`).
*   **Billy:** Standard NPC.
*   **Brad:** Dealer (`Brad.cs` inherits `Dealer`).
*   **Carl:** Standard NPC.
*   **Charles:** Standard NPC.
*   **Chloe:** Standard NPC.
*   **Chris:** Standard NPC.
*   **Dan:** Standard NPC. Shopkeeper at Hardware Store (`ShopInterface` reference). Has `OrderCompletedLines`.
*   **Dean:** Standard NPC. Has a check `TattooChoiceValid` suggesting a tattoo interaction.
*   **Dennis:** Standard NPC.
*   **Donna:** Standard NPC.
*   **Doris:** Standard NPC.
*   **Elizabeth:** Standard NPC.
*   **Eugene:** Standard NPC.
*   **Fiona:** Standard NPC. Shopkeeper at Gas Mart (`ShopInterface` reference). Has `OrderCompletedLines`.
*   **Fixer:** Standard NPC. Likely involved in employee hiring. Has special logic for calculating `AdditionalSigningFee` (**$100 / $250 / max $500**) based on how many employees hired (`ADDITIONAL_FEE_THRESHOLD` = 5). Has `GreetingDialogue`.
*   **Frank:** Standard NPC.
*   **Genghis:** Standard NPC.
*   **George:** Standard NPC.
*   **Geraldine:** Standard NPC.
*   **Greg:** Standard NPC.
*   **Harold:** Standard NPC.
*   **Herbert:** Standard NPC. Shopkeeper at Pharmacy (`ShopInterface` reference). Has `OrderCompletedLines`.
*   **Igor:** Standard NPC.
*   **Jack:** Standard NPC.
*   **Jackie:** Standard NPC.
*   **Jane:** Dealer (`Jane.cs` inherits `Dealer`).
*   **Javier:** Standard NPC.
*   **Jeff:** Standard NPC.
*   **Jen:** Standard NPC.
*   **Jennifer:** Standard NPC.
*   **Jeremy:** Standard NPC. Runs the vehicle `Dealership`. Has `Listings` of vehicles for sale.
*   **Jerry:** Standard NPC.
*   **Jessi:** Standard NPC.
*   **Joyce:** Standard NPC.
*   **Karen:** Standard NPC.
*   **Kathy:** Standard NPC.
*   **Keith:** Standard NPC.
*   **Kevin:** Standard NPC.
*   **Kim:** Standard NPC.
*   **Kyle:** Standard NPC.
*   **Leo:** Dealer (`Leo.cs` inherits `Dealer`).
*   **Lily:** Standard NPC. Has different schedule groups (`TutorialScheduleGroup`, `RegularScheduleGroup`) based on `TutorialConditions`. Likely involved in early game quests.
*   **Lisa:** Standard NPC.
*   **Louis:** Standard NPC.
*   **Lucy:** Standard NPC.
*   **Ludwig:** Standard NPC. (Mentioned as a friend of Benji in `phonecalls.md`).
*   **Mac:** Standard NPC.
*   **Marco:** Standard NPC. Runs the vehicle repair/repaint shop (`VehicleRecoveryPoint`, `VehicleDetector`). Has `RecoveryConversation`. Checks `RecoverVehicleValid`, `RepaintVehicleValid`.
*   **Meg:** Standard NPC.
*   **Melissa:** Standard NPC.
*   **Michael:** Standard NPC.
*   **Mick:** Standard NPC. Runs the Pawn Shop. Has a check `CanPawn`.
*   **Ming:** Standard NPC. Associated with a `Property` (likely the Chinese Restaurant). Has custom `GetNameAddress`.
*   **Molly:** Dealer (`Molly.cs` inherits `Dealer`).
*   **Oscar:** Standard NPC. Runs the Warehouse shop (`ShopInterface`). Sells specific items (likely meth equipment/ingredients based on phone calls). Has `GreetingDialogue`. `EnableDeliveries` method suggests unlockable delivery service.
*   **Pearl:** Standard NPC.
*   **Peggy:** Standard NPC. (Mentioned as a friend of Benji in `phonecalls.md`).
*   **Peter:** Standard NPC.
*   **Philip:** Standard NPC.
*   **Randy:** Standard NPC.
*   **Ray:** Standard NPC. Runs the Realty (`Ray's Realty`). Involved in buying businesses (`Property`). Has intro message logic based on player `IntroRank`, `IntroDaysPlayed`, `IntroNetworth`.
*   **Salvador:** Supplier (`Salvador.cs` inherits `Supplier`). Likely sells Cocaine related items (Coca Seeds?).
*   **Sam:** Standard NPC.
*   **SchizoGoblin:** Special NPC type. Can be activated and assigned a `targetPlayer`. Likely related to a negative status effect (Schizophrenic).
*   **Shirley:** Supplier (`Shirley.cs` inherits `Supplier`). Sells Pseudoephedrine (based on phone calls).
*   **Stan:** Standard NPC. Has `GreetingDialogue`.
*   **Steve:** Standard NPC. Shopkeeper at Liquor Store (`ShopInterface` reference). Has `OrderCompletedLines`.
*   **Thomas:** Standard NPC. Involved in a Cartel questline. Has specific meeting/handover events (`FirstMeetingEvent`, `HandoverEvent`). Deals with specific contract (`CARTEL_CONTRACT_QUANTITY`=15, `CARTEL_CONTRACT_PAYMENT`=$100).
*   **Tobias:** Standard NPC.
*   **Trent:** Standard NPC.
*   **UncleNelson:** Standard NPC. Mentor figure. Sends initial messages (`InitialMessage_Demo`, `InitialMessage`). Likely triggers phone calls.
*   **Walter:** Standard NPC.
*   **Wei:** Dealer (`Wei.cs` inherits `Dealer`).

---

This detailed extraction covers the core systems, behaviours, interactions, and specific details for named NPCs revealed in the code. It should serve as a comprehensive reference for understanding how NPCs function in the game.
```

# packaging.md

```md
**Analysis Notes:**

*   These items define how products are stored and potentially sold.
*   The crucial piece of information here is the `Quantity` field, which tells the player how many units of a product (like 1g of weed or 1 dose of meth) each package holds.
*   `StealthLevel` is present but set to 0 for all, suggesting these basic packages offer no concealment benefit.
*   The `Brick` description notes "You probably shouldn't be able to read this descriptjon," implying it might be an unfinished or internal item, although it has defined stats. Its `Icon` field is also empty (`{fileID: 0}`), further suggesting it might not be fully implemented for player use in the way the Baggie and Jar are.

**Extracted Player-Relevant Data from Packaging Assets:**

*(Ignoring *_Icon.asset data, GUIDs unless clarifying a link, prefab links, functional/filled item links, and other non-player-facing fields)*

**1. Baggie**

*   **Item Name:** Baggie
*   **Internal ID:** `baggie`
*   **Description:** "A small plastic baggie. Holds 1x unit of any product."
*   **Product Quantity Held:** 1 unit
*   **Base Purchase Price:** $1
*   **Resell Value:** $0.50 (Calculated: $1 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory - Empty):** 20
*   **Legality Status:** 0 (Likely Neutral/Not inherently illegal)
*   **Stealth Level:** 0 (No bonus)
*   **Shop Category:** 7 (Likely Packaging or General Supplies)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 1 (Packaging)
*   **GUID:** `b2374e72137ba4140b4f300e45400550` *(Referenced by products)*

**2. Brick**

*   **Item Name:** Brick
*   **Internal ID:** `brick`
*   **Description:** "Brick. Holds 20x product. You probably shouldn't be able to read this descriptjon." *(Indicates potential WIP/internal status)*
*   **Product Quantity Held:** 20 units
*   **Base Purchase Price:** $1
*   **Resell Value:** $0.50 (Calculated: $1 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory - Empty):** 10
*   **Legality Status:** 0 (Likely Neutral/Not inherently illegal)
*   **Stealth Level:** 0 (No bonus)
*   **Shop Category:** 7 (Likely Packaging or General Supplies)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** No
*   **Item Category (Internal):** 1 (Packaging)
*   **GUID:** `11cc6b5412d4f3f44b5a0399f7b67a94` *(Referenced by products)*

**3. Jar**

*   **Item Name:** Jar
*   **Internal ID:** `jar`
*   **Description:** "A clear glass jar to keep various substances in. Holds 5x units of any product."
*   **Product Quantity Held:** 5 units
*   **Base Purchase Price:** $3
*   **Resell Value:** $1.50 (Calculated: $3 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory - Empty):** 20
*   **Legality Status:** 0 (Likely Neutral/Not inherently illegal)
*   **Stealth Level:** 0 (No bonus)
*   **Shop Category:** 7 (Likely Packaging or General Supplies)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 3
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 1 (Packaging)
*   **GUID:** `c86466657328223498b6d350eae006dd` *(Referenced by products)*

This information tells players the cost, capacity, and availability of different ways to package their final products for storage or sale. The quantity held per package is key for inventory management and potential sale strategies.
```

# phonecalls.md

```md
**General Observations:**

*   **Caller:** Most calls seem to come from the same Caller ID (GUID `b20cae68b0168d64e98c4628ce9259db`), likely a mentor figure (referred to as "Uncle" in `Call_NelsonIntro`).
*   **Tutorial Function:** These calls guide the player through game mechanics and objectives step-by-step.
*   **Quest Integration:** Many calls trigger or update specific quests (`QuestSetters`), linking the calls directly to game progression.
*   **Highlighted Terms:** Terms within `<h1>` tags emphasize important concepts for the player.
*   **Demo vs. Mentor:** There are separate sets for "demo" and "mentor", suggesting slightly different introductory paths or call triggers depending on the game version or context.

**Extracted Player-Relevant Data (Organized by Call Name):**

**Demo Calls:**

*   **Call_5DealsDone:**
    *   **Trigger:** Likely after completing 5 deals.
    *   **Goal:** Expand operations (more product, more customers).
    *   **Mechanic Explained:** Gain new customers by giving `free samples` to friends of existing customers.
    *   **Tool:** Use the `map` to view potential customers.
    *   **Goal:** Acquire more space; a room above the `Chinese restaurant` (north of motel) costs `$800`.
    *   **Quest Update:** Sets "On the Grind" quest, entry 5, to state 2 (likely active/complete).
*   **Call_10Customers:**
    *   **Trigger:** Likely after reaching 10 customers.
    *   **Goal:** Recruit a `dealer` to manage customers.
    *   **Character Introduced:** First dealer available is `Benji Coleman`.
    *   **Mechanic Explained:** Need a recommendation from a dealer's friend to hire them.
    *   **Characters Mentioned (Benji's Friends):** `Peggy`, `Beth`, `Ludwig`. Sell to them to get a recommendation.
    *   **Quest Update:** Sets "Dodgy Dealing" quest, entry 0, to state 2.
*   **Call_BungalowKeys:**
    *   **Goal/Hint:** Find keys located in a vent on the left side of a specific house (likely related to a previous step/quest not shown).
*   **Call_BuyPackaging:**
    *   **Timing:** Occurs while waiting for a plant to grow.
    *   **Goal:** Buy equipment for `packaging`.
    *   **Location:** Packaging equipment sold at the `hardware store`.
*   **Call_BuyRoom:**
    *   **Trigger:** Likely after reaching a certain customer count or income.
    *   **Goal:** Acquire more space for expansion.
    *   **Location/Price:** Room above the `Chinese restaurant` (north of motel) costs `$800`.
*   **Call_BuySoil:**
    *   **Trigger:** After the first deal.
    *   **Goal:** Buy more `soil` to grow more plants.
    *   **Location:** Soil sold at the `hardware store`.
    *   **Mechanic Explained:** Customers pay in `cash`, legal stores often require `card` (online balance).
    *   **Tool/Mechanic:** Use an `ATM` to deposit cash.
*   **Call_EnterMotel:**
    *   **Trigger:** After acquiring the motel room.
    *   **Goal:** Buy basic growing equipment.
    *   **Items:** Need `grow tent`, `soil`, `watering can`.
    *   **Location:** Items sold at the `hardware store`.
    *   **Quest Update:** Sets "Getting Started" quest, entry 6, to state 2.
*   **Call_ExplainCurfew:**
    *   **Mechanic Explained:** `Curfew` exists between `8PM` and `5AM`.
    *   **Gameplay Rule:** Police `arrest` people outside during curfew. Staying inside is safer.
    *   **Gameplay Tip:** Customers pay `extra` for deals during curfew (Risk vs. Reward).
*   **Call_ExplainCurrency:**
    *   **Mechanic Explained:** Two currency types: `cash` and `online balance`.
    *   **Gameplay Rule:** Customers pay in `cash`, legal shops often only accept `online balance`.
    *   **Tool/Mechanic:** Use `ATM` to deposit/withdraw cash.
*   **Call_FindCash:**
    *   **Trigger:** After finding the initial cash stash.
    *   **Goal:** Rent a motel room.
    *   **Location:** Go to the `motel office`.
*   **Call_FirstSampleRejection:**
    *   **Trigger:** When a potential customer rejects a free sample.
    *   **Gameplay Tip:** Can try giving a sample again `tomorrow`.
*   **Call_MixingDone:**
    *   **Trigger:** After completing the first mix using a mixing station.
    *   **Mechanic Explained:** Mixing `ingredients` have `unique effects` and affect product value differently.
    *   **Gameplay Tip:** Experiment with mix recipes for valuable products.
    *   **End of Tutorial Hint:** Mentor indicates the player now has the basics.
    *   **Quest Update:** Sets "Mixing Mania" quest to state 1 (Completed), updates entry 8 to state 2.
*   **Call_MixingIngredients:**
    *   **Goal:** Buy a `mixing ingredient`.
    *   **Mechanic Explained:** Ingredients add unique effects when mixed.
    *   **Location:** Mixing ingredients sold at the `Gas-Mart`.
*   **Call_MixingIngredients1:**
    *   **Trigger:** Likely upon entering the Gas-Mart for mixers.
    *   **Goal:** Buy mixing ingredients ("mixers").
    *   **Gameplay Tip:** Experimentation is needed; suggests buying multiple different mixers.
*   **Call_MixingIntro:**
    *   **Trigger:** After hiring Benji (Implied prerequisite).
    *   **Goal:** Start making higher-value products via mixing.
    *   **Mechanic Explained:** Different seed strains exist. A `mixing station` allows combining products with `ingredients` for `unique effects` and higher prices.
    *   **Goal:** Purchase a `mixing station`.
    *   **Location:** Mixing station sold at `Dan's hardware`.
    *   **Goal:** Buy mixing ingredients.
    *   **Location:** Mixing ingredients sold at the `Gas-Mart`.
    *   **Quest Update:** Sets "Mixing Mania" quest, entry 0, to state 2.
*   **Call_NelsonIntro:** *(Demo version of intro)*
    *   **Context:** Mentor figure ("Uncle") is incarcerated. Player is starting out in Hyland Point.
    *   **Goal:** Find stashed cash.
    *   **Location:** Cash is hidden `near the skatepark`.
    *   **Quest Update:** Sets "Getting Started" quest, entry 0 & 1, to state 2 (likely marks finding the call trigger/starting the quest).
*   **Call_ScheduleDeal:**
    *   **Trigger:** After packaging the first product.
    *   **Goal:** Schedule a deal with a customer.
    *   **Mechanic Explained:** Customers message when they want to buy. Player accepts/rejects and schedules the deal.
    *   **Tool:** Use the `messages app` on the in-game phone.
*   **Call_SecondProductCreated:**
    *   **Trigger:** Creating a second distinct product type (e.g., a new strain or mix).
    *   **Gameplay Tip/Mechanic:** Reminds player to list new products for sale in the `product manager app`.
*   **Call_SupplierIntro:**
    *   **Trigger:** After getting growing equipment.
    *   **Goal:** Obtain `weed seeds`.
    *   **Mechanic Explained:** Need to contact a supplier.
    *   **Character Introduced:** `Albert Hoover` (local weed seed supplier).
    *   **Mechanic Explained:** Message supplier to request a `dead drop`.
    *   **Mechanic Explained:** Orders go on a tab (pay later) because the mentor vouched for the player.
    *   **Tool:** Use the `message` app.
    *   **Quest Update:** Sets "Gearing Up" quest, entry 6, to state 2.

**Mentor Calls:** *(Likely part of the main game flow, potentially non-demo)*

*   **Call_AfterExplosion:**
    *   **Context:** Suggests a story event involving an explosion.
    *   **Character Introduced:** `Benzies family` (powerful cartel, antagonistic).
    *   **Goal:** Find a new place to stay.
    *   **Location:** Rent a room at the `motel`.
    *   **Goal:** Buy new equipment.
    *   **Items:** Need `grow tent`, `soil`, `watering can`.
    *   **Location:** `Hardware store` (north-east of motel).
    *   **Quest Update:** Sets "Welcome to Hyland Point" quest, entry 8, to state 2.
*   **Call_CleanCashIntro:**
    *   **Trigger:** Hitting the `weekly deposit limit` at ATMs.
    *   **Mechanic Explained:** ATM deposits are limited weekly to avoid suspicion.
    *   **Mechanic Explained:** Need to `launder` cash to convert more to online balance.
    *   **Mechanic Explained:** Laundering uses a legal business front.
    *   **Goal:** Buy a business.
    *   **Location:** Check `Rays Realty` for businesses for sale.
    *   **Quest Update:** Sets "Clean Cash" quest, entry 0, to state 2.
*   **Call_MethIntro:**
    *   **Trigger:** Reaching a certain progression point (implied connections made).
    *   **Goal:** Start manufacturing `methamphetamine`.
    *   **Mechanic Explained:** Meth requires specialized equipment and ingredients.
    *   **Items (Equipment):** `chemistry station`, `lab oven`.
    *   **Location (Equipment):** Sold by `Oscar` at the `warehouse`.
    *   **Items (Ingredients):** `acid`, `phosphorus`, `pseudo`.
    *   **Location (Acid/Phosphorus):** Sold by `Oscar` at the `warehouse`.
    *   **Location (Pseudo):** Need to talk to `Shirley`.
    *   **Quest Update:** Sets "We Need To Cook" quest, entry 0, to state 2.
*   **Call_MixingDone (Mentor Version):**
    *   *(Content is very similar to the demo version)*
    *   **End of Tutorial Hint:** Mentor hints at introducing harder drugs later.
    *   **Quest Update:** Sets "Mixing Mania" quest to state 1 (Completed), updates entry 8 to state 2.
*   **Call_NelsonIntro (Mentor Version):**
    *   *(Slightly different intro dialogue, same core purpose)*
    *   **Goal:** Find stashed cash.
    *   **Locations:** Cash hidden near `town hall fountain`, `in the canal`, `behind the supermarket`.
    *   **Goal:** Return to the `RV` after finding cash.
    *   **Quest Update:** Sets "Welcome to Hyland Point" quest, entry 1, to state 2.
*   **Call_ShirleyIntro:**
    *   **Context:** Need `pseudo` for meth.
    *   **Character Mentioned:** `Oscar` sells other meth equipment/ingredients.
    *   **Goal:** Find a pseudo supplier. Mentor doesn't know one.
    *   **Location Hint:** Look for a supplier in `Westville`.
    *   **Gameplay Tip:** Unlock customers in Westville to attract the supplier's attention.
    *   **Tool:** Use `contacts app`.
    *   **Quest Update:** Sets "We Need To Cook" quest, entry 0, to state 2. *(Note: This seems to re-activate the quest step, possibly after buying other equipment first)*
*   **Call_WarehouseIntro:**
    *   **Trigger:** Reaching $10K earnings (Implied).
    *   **Goal:** Gain access to the `warehouse` to buy specialized items/services.
    *   **Location:** Warehouse is the big brick building behind the `liquor store`.
    *   **Mechanic Explained:** Warehouse offers weapons, specialized equipment, workers for hire.
    *   **Requirement:** Need to build reputation ("rep") to be allowed entry.
    *   **Quest Update:** Sets "Wretched Hive of Scum and Villainy" quest, entry 0, to state 2.

This dump provides a huge amount of information about game flow, mechanics, locations, items, and characters, perfect for building a comprehensive helper.
```

# player.md

```md
**Extracted Player-Relevant Data from PlayerScripts Code**

**Player Core Mechanics (`Player.cs`)**

*   **Identity:**
    *   Each player has a `PlayerName` and a unique `PlayerCode`.
    *   `Local`: Special reference to the player's own character instance.
*   **State Flags:** Tracks numerous player conditions:
    *   `Crouched`: True if currently crouching.
    *   `IsSkating`: True if currently riding a skateboard.
    *   `IsSleeping`: True if currently using a bed/sleeping.
    *   `IsRagdolled`: True if the physics ragdoll is active (e.g., after impact).
    *   `IsArrested`: True if currently arrested by police.
    *   `IsTased`: True if currently incapacitated by a taser.
    *   `IsUnconscious`: True if passed out (e.g., from low energy or effects).
*   **Location/Interaction Context:**
    *   `CurrentVehicle`: Tracks the `LandVehicle` the player is currently driving.
    *   `CurrentBed`: Tracks the bed object the player is interacting with for sleep.
    *   `CurrentProperty`: Tracks the `Property` (likely player-owned house/base) the player is currently inside.
    *   `CurrentBusiness`: Tracks the `Business` the player is currently inside.
*   **Appearance & Customization:**
    *   Manages player `Avatar` and `Clothing`.
    *   `SetAvatarSettings`: Applies appearance customization. Saved/Loaded via `GetAppearanceString`/`LoadAppearance`.
    *   `LoadClothing`/`GetClothingString`: Handles saving/loading equipped clothing.
*   **Status Effects (Linked to Product Properties):**
    *   Boolean flags directly correspond to effects from consumed products:
        *   `Paranoid`
        *   `Sneaky` (Likely silences footsteps, see `properties.md`)
        *   `Disoriented`
        *   `Seizure`
        *   `Slippery` (Likely affects movement control, see `PlayerMovement.cs`)
        *   `Schizophrenic` (Links to `SchizoVoices` audio in `PlayerCamera.cs`)
    *   `ConsumeProduct`: Method called when player uses a product item. Tracks `ConsumedProduct` and `TimeSinceProductConsumed`. Sets the relevant status flags.
    *   `ClearProduct`: Removes active product effects.
*   **Actions & Capabilities:**
    *   `SendPunch`: Player can perform a melee punch.
    *   `EnterVehicle`/`ExitVehicle`: Player can enter/exit vehicles.
    *   `MountSkateboard`/`DismountSkateboard`: Player can use skateboards.
    *   `Arrest`/`Free`: Player can be arrested and potentially freed.
    *   `PassOut`/`PassOutRecovery`: Player can pass out and recover.
    *   `Taze`: Player can be tased.
*   **Saving & Loading:**
    *   Player state is saved (`ISaveable`). Includes inventory, appearance, clothing, variables, health, energy, crime data, location, etc.
*   **Player Variables:**
    *   A system (`PlayerVariables`) allows storing custom key-value data on the player (e.g., quest progress, specific stats). Accessed via `GetValue`/`SetVariableValue`.
*   **Collision:**
    *   Uses a `CapsuleCollider` (`CapCol`).
    *   `CapColDefaultHeight`: Default height is **2.0** units. Height changes when crouching.
*   **Scale:** Player scale can be changed (`SetScale`), potentially linked to effects like 'Shrinking'.

**Player Health (`Health\PlayerHealth.cs`)**

*   **Max Health:** `MAX_HEALTH = 100f` (100 points).
*   **Health Regeneration:** `HEALTH_RECOVERY_PER_MINUTE = 0.5f` (Player naturally recovers 0.5 health per in-game minute).
*   **Damage:**
    *   `TakeDamage`: Function handles receiving damage. Can cause flinching and blood particle effects (`BloodParticles`).
    *   `CanTakeDamage`: Property indicates if the player is currently vulnerable.
*   **Death & Revival:**
    *   `Die`: Triggered when health reaches 0. Player enters a dead state (`IsAlive = false`). `onDie` event triggered.
    *   `Revive`: Resets player state to alive (`IsAlive = true`). Player likely respawns at a set location (`SendRevive` includes position/rotation). `onRevive` event triggered.
*   **Lethal Effect:**
    *   `AfflictedWithLethalEffect`: Boolean flag set if the player consumed a product with the 'Lethal' effect. Likely causes death after a short delay.

**Player Energy / Stamina (`PlayerEnergy.cs`)**

*   **Max Energy:** `MAX_ENERGY = 100f` (100 points).
*   **Energy Drain:**
    *   Energy depletes over time. Full energy lasts `EnergyDuration_Hours` (value not specified here, likely set in editor).
    *   Sprinting increases drain rate (`SPRINT_DRAIN_MULTIPLIER = 1.3f` - 30% faster drain while sprinting, handled in `PlayerMovement.cs`).
*   **Energy Recharge:**
    *   Energy recharges fully over `EnergyRechargeTime_Hours` (value not specified here), likely primarily through sleeping (`SleepEnd` calls `RestoreEnergy`).
*   **Critical Threshold:** `CRITICAL_THRESHOLD = 20f` (Below 20 energy is considered critical).
*   **Depletion:**
    *   `onEnergyDepleted` event triggers when energy hits 0. Likely causes player to `PassOut` (see `Player.cs`).
*   **Energy Drinks:**
    *   `RestoreEnergy`: Can be called to instantly restore energy (likely by consumables like Energy Drink).
    *   `EnergyDrinksConsumed`: Tracks count, suggesting diminishing returns or limits. Resets on sleep (`ResetEnergyDrinks`).
*   **Debug:** `DEBUG_DISABLE_ENERGY` flag can turn off energy drain for testing.

**Player Movement (`PlayerMovement.cs`)**

*   **Base Speeds:**
    *   `WalkSpeed`: Base walking speed (value set in editor).
    *   `SprintMultiplier`: Factor applied to `WalkSpeed` when sprinting (value set in editor).
    *   `StaticMoveSpeedMultiplier`: An overall multiplier affecting movement speed (value set in editor).
*   **Sprinting:**
    *   Toggled action (`sprintActive`).
    *   `SprintingRequiresStamina`: Boolean flag (likely true by default).
    *   `StaminaDrainRate = 12.5f`: Stamina drains at 12.5 points per second while sprinting.
    *   `StaminaRestoreRate = 25f`: Stamina recovers at 25 points per second when not sprinting/draining.
    *   `StaminaRestoreDelay = 1f`: **1 second** delay after stopping stamina drain before regeneration begins.
    *   `StaminaReserveMax`: Maximum stamina value (value set in editor).
    *   `CurrentStaminaReserve`: Tracks current stamina.
    *   `AddSprintBlocker`/`RemoveSprintBlocker`: System to temporarily prevent sprinting (e.g., low health, specific effects).
*   **Jumping:**
    *   `canJump`: Boolean flag controlling ability to jump.
    *   `jumpForce`: Force applied for jumping (value set in editor).
    *   `gravityMultiplier`: Modifies standard gravity effect (value set in editor).
    *   `airTime`: Tracks time spent airborne. `onJump` and `onLand` events trigger.
*   **Crouching:**
    *   Toggled action (`isCrouched`).
    *   `CrouchHeightMultiplier`: Reduces player collider height (value set in editor).
    *   `CrouchTime`: Duration it takes to transition into/out of crouch (value set in editor).
    *   `crouchSpeedMultipler`: Reduces movement speed while crouched (value set in editor).
    *   `CanStand`: Checks for obstacles above before allowing player to stand up.
*   **Grounding & Slopes:**
    *   `IsGrounded`: Boolean indicating if the player is on the ground. Uses `GROUNDED_THRESHOLD`.
    *   `groundDetectionMask`: Layers considered as ground.
    *   `slopeForce`: Force applied to prevent sliding down steep slopes or assist climbing shallow ones (value set in editor). Uses `SLOPE_THRESHOLD`.
*   **Movement Modifiers:**
    *   `MoveSpeedMultiplier`: General multiplier applied to movement.
    *   `SlipperyMovementMultiplier`: Multiplier applied when player has the 'Slippery' status effect (likely < 1.0).
*   **Teleportation:**
    *   `Teleport(Vector3 position)`: Function to instantly move the player.
    *   `WarpToNavMesh`: Utility to move player to the nearest valid NavMesh position.
*   **State Control:** `canMove` flag enables/disables movement input processing.

**Player Inventory & Equipping (`PlayerInventory.cs`, `HotbarSlot.cs`)**

*   **Inventory Size:** `INVENTORY_SLOT_COUNT = 8` main slots. Also includes `hotbarSlots` and a `cashSlot`.
*   **Hotbar:**
    *   Player has a hotbar (`hotbarSlots`) for quick access to equippable items.
    *   Uses number keys or scroll wheel (`UpdateHotbarSelection`) to select slots.
    *   `EquippedSlotIndex`: Tracks the currently selected hotbar slot index.
    *   `isAnythingEquipped`: Boolean indicating if an item is currently equipped.
*   **Equipping:**
    *   `Equip(HotbarSlot slot)`: Equips the item in the selected slot.
    *   `SetEquippable`: Updates the currently held item visual/functionality (calls `Player.cs`).
    *   `EquippingEnabled`: Boolean flag to enable/disable equipping actions.
    *   `equipContainer`: Transform where the viewmodel/equipped item is attached.
*   **Item Management:**
    *   `AddItemToInventory`: Adds an item instance to the first available slot or stacks if possible.
    *   `CanItemFitInInventory`: Checks if there's space for an item.
    *   `GetAmountOfItem`: Counts how many of a specific item ID the player has.
    *   `RemoveAmountOfItem`: Removes a specified quantity of an item by ID.
    *   `ClearInventory`: Removes all items.
*   **Consequences:**
    *   `RemoveProductFromInventory`: Removes packaged products based on `EStealthLevel` (likely during police searches).
    *   `RemoveRandomItemsFromInventory`: Removes random items (likely on death/arrest).
*   **Cash:** Has a dedicated `cashSlot` to hold `CashInstance`.
*   **Discarding:** Items can be discarded (`discardSlot`, `DISCARD_TIME = 1.5f`).
*   **Item Variables:** System (`ItemVariables`) to link having specific items in inventory to player variables (flags/stats).

**Player Crime & Police Interaction (`PlayerCrimeData.cs`)**

*   **Pursuit Levels (`EPursuitLevel`):**
    *   `None`: No pursuit.
    *   `Investigating`: Police check out last known position, search briefly.
    *   `Arresting`: Police attempt to arrest on sight.
    *   `NonLethal`: Police use non-lethal force (tasers) if player resists arrest.
    *   `Lethal`: Police use lethal force.
*   **Detection & Pursuit:**
    *   `Crimes`: Dictionary tracking committed crimes (`Crime` type and quantity).
    *   `LastKnownPosition`: Where police last saw the player. Updated via `RecordLastKnownPosition`.
    *   `TimeSinceSighted`: Tracks time since police lost line of sight.
    *   `Pursuers`: List of `PoliceOfficer` NPCs currently chasing the player.
*   **Timers & Escalation:**
    *   Search Times (after losing sight):
        *   Investigating: **60s**
        *   Arresting: **25s**
        *   NonLethal: **30s**
        *   Lethal: **40s**
    *   Escalation Times (time at current level before potentially escalating):
        *   Arresting -> NonLethal: **25s**
        *   NonLethal -> Lethal: **120s**
    *   `UpdateEscalation`, `UpdateTimeout`: Handle level changes based on time and visibility.
    *   `TimeoutPursuit`: Called when search timer expires, pursuit ends. `onPursuitEscapedSound` plays.
*   **Arrest:**
    *   `CurrentArrestProgress`: Tracks progress of an officer arresting the player.
    *   `EvadedArrest`: Flag set if player escapes during arrest attempt.
*   **Body Search:**
    *   `BodySearchPending`: Flag indicating police intend to search the player.
    *   `CurrentBodySearchProgress`: Tracks progress of the search.
    *   `TimeSinceLastBodySearch`: Cooldown related to searches.
*   **Combat:**
    *   `SHOT_COOLDOWN_MIN`/`MAX`: Police firing rate is between **2s** and **8s**.
    *   `GetShotAccuracyMultiplier`: Calculates police accuracy based on factors (likely time since last shot).
*   **Vehicle Collisions:**
    *   `RecordVehicleCollision`: Tracks hitting NPCs with vehicles.
    *   `VEHICLE_COLLISION_LIFETIME`: Collision record lasts **30s**.
    *   `VEHICLE_COLLISION_LIMIT`: Hitting **3** NPCs within the lifetime likely escalates pursuit significantly.
*   **Music:** Pursuit level affects background music (`_lightCombatTrack`, `_heavyCombatTrack`).

**Player Visual State (`PlayerVisualState.cs`)**

*   **States (`EVisualState`):** Defines labels for player actions/status visible to NPCs:
    *   Visible, Suspicious, DisobeyingCurfew, Vandalizing, PettyCrime, DrugDealing, SearchedFor, Wanted, Pickpocketing, DischargingWeapon, Brandishing.
*   **Mechanics:**
    *   States can be applied (`ApplyState`) and removed (`RemoveState`), potentially with timers (`autoRemoveAfter`).
    *   These states likely influence NPC reactions and police detection/escalation.
    *   `Suspiciousness`: A float value accumulating based on actions.

**Player Camera & View (`PlayerCamera.cs`, `ViewmodelAvatar.cs`, `ViewmodelSway.cs`)**

*   **Camera Control:**
    *   Handles first-person camera rotation based on mouse input (`RotateCamera`).
    *   `canLook`: Boolean enabling/disabling mouse look. Affected by UI elements being open (`activeUIElementCount`).
    *   `LockMouse`/`FreeMouse`: Controls cursor visibility and confinement.
*   **Camera Modes (`ECameraMode`):** Default, Vehicle, Skateboard. Affects camera position and behavior.
*   **Field of View (FoV):**
    *   Base FoV adjustable.
    *   `SprintFoVBoost`: FoV increases while sprinting.
    *   `FoVChangeRate`: Speed at which FoV transitions.
*   **Camera Effects:**
    *   Head Bob: `HorizontalCameraBob`, `VerticalCameraBob`, `BobRate`. Simulates head movement while walking/running.
    *   Depth of Field (DoF): Can be toggled (`SetDoFActive`).
    *   Camera Shake: Can be triggered (`StartCameraShake`).
    *   Visual Effects Linked to Consumables:
        *   `MethVisuals`, `CocaineVisuals` flags trigger specific post-processing or effects.
        *   `HeartbeatSoundController`, `Flies` particles, `MethRumble` audio, `SchizoVoices` audio linked to specific states/effects.
*   **Interaction:**
    *   `LookRaycast`/`MouseRaycast`: Used to detect objects the player is looking at for interaction.
*   **Viewmodel:**
    *   Manages the first-person arms/held item (`ViewmodelAvatar`).
    *   Applies procedural sway and bob animations (`ViewmodelSway`) for immersion (breathing, walking, jumping, landing).

**Player Clothing (`PlayerClothing.cs`)**

*   **Slots:** Uses `EClothingSlot` enum to define specific slots (Head, Torso, Legs, Feet, etc. - exact enum values not shown).
*   **Functionality:**
    *   Holds `ClothingInstance` items in corresponding `ItemSlot`s.
    *   `RefreshAppearance`: Applies the visual changes of equipped clothing to the player's `Avatar`. Works in conjunction with `Player.cs` appearance system.

**Cursor Management (`CursorManager.cs`)**

*   **Cursor Types (`ECursorType`):** Default, Finger (pointing), OpenHand (hover), Grab (holding), Scissors (trimming).
*   **Functionality:** Changes the mouse cursor icon based on the interaction context.

**Miscellaneous:**

*   **`PlayerManager.cs`:** Handles the overall saving and loading orchestration for all players in the game session.
*   **`LocalPlayerFootstepGenerator.cs`:** Handles playing footstep sounds based on distance moved and ground surface material.
*   **`PlayerTeleporter.cs`:** Utility for instant player movement.

---

This detailed breakdown covers the core rules, constants, and systems governing the player character based on the provided code.
```

# pots.md

```md
**Analysis Notes:**

*   **Key Modifiers:** The `Description` field is crucial here, as it explicitly states the gameplay effects (growth speed, moisture drain, plant size).
*   **Progression:** Like seeds, these have Level and Rank/Tier requirements for purchase.
*   **Grow Tent:** This seems to be a special type of "pot" or growing station with its own unique effects (faster growth, smaller plants).

**Extracted Player-Relevant Data from Pot/Tent Assets:**

*(Ignoring *_Icon.asset data, GUIDs, internal links, etc.)*

**1. Air Pot**
*   **Item Name:** Air Pot
*   **Internal ID:** `airpot`
*   **Description:** "Fancy hand woven fabric pot that keeps roots ventilated. Boosts plant growth speed by 15%, but also increases moisture drain by 30%."
*   **Effect Summary:**
    *   Growth Speed: +15%
    *   Moisture Drain: +30%
*   **Purchase Price:** $120
*   **Resell Value:** $60 (Calculated: $120 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 3
*   **Available In Demo:** No
*   **Shop Category:** 2 (Likely "Growing Equipment")
*   **Item Category (Internal):** 2

**2. Plastic Pot (Cheap Plastic Pot)**
*   **Item Name:** Plastic Pot
*   **Internal ID:** `plasticpot`
*   **Description:** "Flimsy plastic pot made in China." (Implies no special effects, likely the baseline)
*   **Effect Summary:** None mentioned (Standard/Baseline)
*   **Purchase Price:** $20
*   **Resell Value:** $10 (Calculated: $20 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 4
*   **Available In Demo:** No
*   **Shop Category:** 2 (Likely "Growing Equipment")
*   **Item Category (Internal):** 2

**3. Grow Tent**
*   **Item Name:** Grow Tent
*   **Internal ID:** `growtent`
*   **Description:** "A small grow tent with built-in lighting and pot. Plants will grow faster but smaller."
*   **Effect Summary:**
    *   Growth Speed: Increased (Amount not specified, just "faster")
    *   Plant Size/Yield: Decreased (Amount not specified, just "smaller")
    *   Contains Built-in Light: Yes (Implied)
    *   Contains Built-in Pot: Yes (Implied)
*   **Purchase Price:** $100
*   **Resell Value:** $50 (Calculated: $100 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** Yes
*   **Shop Category:** 2 (Likely "Growing Equipment")
*   **Item Category (Internal):** 2

**4. Moisture-Preserving Pot**
*   **Item Name:** Moisture-Preserving Pot
*   **Internal ID:** `moisturepreservingpot`
*   **Description:** "A special metal pot with moisture-preserving functionality. Soil will lose moisture 40% slower."
*   **Effect Summary:**
    *   Moisture Drain: -40% (Slower loss)
*   **Purchase Price:** $50
*   **Resell Value:** $25 (Calculated: $50 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 4
*   **Available In Demo:** No
*   **Shop Category:** 2 (Likely "Growing Equipment")
*   **Item Category (Internal):** 2

**Summary of Player-Relevant Fields Extracted:**

*   **Name:** Display name.
*   **ID:** Internal identifier.
*   **Description:** Crucial for understanding effects.
*   **Effect Summary:** Explicit modifiers (Growth Speed, Moisture Drain, Plant Size).
*   **Purchase Price:** Cost to acquire.
*   **Resell Value / Multiplier:** Value when sold back.
*   **StackLimit:** Inventory management detail.
*   **Legality Status:** Item legality.
*   **Purchase Requirements:** Level and Rank/Tier needed.
*   **Availability:** Demo status, shop category.

This data clearly shows how different pots modify the core growing gameplay loop, making them important choices for the player.
```

# product.md

```md
**Analysis Notes:**

*   **Product Types:** We see assets for Marijuana strains (OG Kush, Sour Diesel, Green Crack, Granddaddy Purple), Methamphetamine variants (Meth, Baby Blue, Biker Crank, Glass), Cocaine, and a "Test Weed".
*   **Pricing Fields:** There are three price-related fields:
    *   `BasePurchasePrice`: Seems very low for most products ($10 for weed, $10-$50 for meth, $80 for coke). It *might* represent a cost if the player *could* buy these directly, or it might be an internal calculation value. Its direct use for the player is unclear based only on this data.
    *   `BasePrice`: Varies significantly ($35 for weed, $1/$70 for meth, $150 for coke). This looks like a base value used internally to calculate the final market price, potentially before effect modifiers.
    *   `MarketValue`: **This seems the most important value for the player.** It often aligns with your manually gathered "suggested Price" and likely represents the base selling price *before* market fluctuations or quality multipliers.
*   **Addictiveness:** The `BaseAddictiveness` field on the product asset itself seems inconsistent or overridden. For products with listed `Properties` (linked Effect assets), the addictiveness seems to be derived from those linked effects. For products *without* listed `Properties` (like base Meth or Cocaine), this field seems to hold the final base addictiveness.
*   **Properties/Effects:** The `Properties` field is crucial. It lists links (by GUID) to Effect assets (like Calming, Refreshing, etc., from your first dump). These linked effects likely determine the actual base addictiveness and contribute to the `MarketValue`.
*   **Legality:** `legalStatus` ranges from 2 (Weed) to 3 (Cocaine) to 4 (Meth), indicating different levels of illegality.
*   **Law Intensity:** `LawIntensityChange` (1 for Weed, 2 for Meth/Coke) likely affects police attention when dealing/possessing.

**Extracted Player-Relevant Data from Product Assets:**

*(Ignoring *_Icon.asset data, GUIDs unless clarifying a link, prefab links, material links, and other non-player-facing fields)*

**1. Baby Blue**
*   **Item Name:** Baby Blue
*   **Internal ID:** `babyblue`
*   **Description:** "Potent methamphetamine variant that induces intense euphoria and relaxation."
*   **Base Market Value / Sell Price:** $1 *(Note: This seems extremely low, might be modified heavily by effects/quality in-game. BasePrice is also $1)*
*   **Base Addictiveness:** 0 *(Note: Description implies effects add addictiveness. See functional product link.)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 4 (Likely Very High)
*   **Drug Type:** 1 (Methamphetamine)
*   **Law Intensity Change:** 2 (Higher police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5 (Sells for 50% of BasePurchasePrice if bought)
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** No
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)

**2. Biker Crank**
*   **Item Name:** Biker Crank
*   **Internal ID:** `bikercrank`
*   **Description:** "Extremely powerful and addictive methamphetamine variant with stimulating and hallucinogenic effects."
*   **Base Market Value / Sell Price:** $1 *(Note: Same low value as Baby Blue. BasePrice is also $1)*
*   **Base Addictiveness:** 0 *(Note: Description implies effects add addictiveness. See functional product link.)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 4 (Likely Very High)
*   **Drug Type:** 1 (Methamphetamine)
*   **Law Intensity Change:** 2 (Higher police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** No
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)

**3. Cocaine**
*   **Item Name:** Cocaine
*   **Internal ID:** `cocaine`
*   **Description:** "Powerful stimulant commonly snorted for a euphoric but short-lived high."
*   **Base Market Value / Sell Price:** $150 *(BasePrice is also $150)*
*   **Base Addictiveness:** 0.4 (40%) *(Defined directly on product)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 3 (Likely High)
*   **Drug Type:** 2 (Cocaine)
*   **Law Intensity Change:** 2 (Higher police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $80 *(Usefulness unclear)*
*   **Available In Demo:** No
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)

**4. DefaultWeed (Appears to be a base template or early OG Kush definition)**
*   **Item Name:** OG Kush *(Note: Name conflicts with file name, likely represents OG Kush)*
*   **Internal ID:** `defaultweed`
*   **Description:** "Old school OG Kush. Offers a balanced, relaxing high with subtle physical effects."
*   **Base Market Value / Sell Price:** $35 *(BasePrice is also $35)*
*   **Base Addictiveness:** 0.05 (5%) *(Note: OG Kush final asset links to Calming which is 0%)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** None listed explicitly, assume 0 (Marijuana) based on context.
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** None listed directly on this asset.

**5. Glass**
*   **Item Name:** Glass
*   **Internal ID:** `glass`
*   **Description:** "Highly pure methamphetamine variant that refreshes and focusses the user."
*   **Base Market Value / Sell Price:** $1 *(Note: Same low value as Baby Blue. BasePrice is also $1)*
*   **Base Addictiveness:** 0 *(Note: Description implies effects add addictiveness. See functional product link.)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 4 (Likely Very High)
*   **Drug Type:** 1 (Methamphetamine)
*   **Law Intensity Change:** 2 (Higher police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** No
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)

**6. Granddaddy Purple (Product)**
*   **Item Name:** Granddaddy Purple
*   **Internal ID:** `granddaddypurple`
*   **Description:** "A potent classic with intense sedating and euphoric effects."
*   **Base Market Value / Sell Price:** $44 *(Matches manual data! BasePrice is $35)*
*   **Base Addictiveness:** 0 *(Derived from linked Property/Effect asset)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** 0 (Marijuana)
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `cee302b...` - Likely 'Sedating' or similar based on description/manual data)

**7. Green Crack (Product)**
*   **Item Name:** Green Crack
*   **Internal ID:** `greencrack`
*   **Description:** "A potent, highly energizing strain that leaves you with a focussed buzz."
*   **Base Market Value / Sell Price:** $43 *(Matches manual data! BasePrice is $35)*
*   **Base Addictiveness:** 0 *(Derived from linked Property/Effect asset. Manual data shows 34%, so linked effect must define this)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** 0 (Marijuana)
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `8301163...` - Likely 'Energizing' based on description/manual data)

**8. Meth**
*   **Item Name:** Meth
*   **Internal ID:** `meth`
*   **Description:** "Classic methamphetamine. A powerful stimulant with intense physical and mentral addictiveness."
*   **Base Market Value / Sell Price:** $70 *(BasePrice is also $70)*
*   **Base Addictiveness:** 0.6 (60%) *(Defined directly on product)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 4 (Likely Very High)
*   **Drug Type:** 1 (Methamphetamine)
*   **Law Intensity Change:** 2 (Higher police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $50 *(Usefulness unclear)*
*   **Available In Demo:** No
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)

**9. OG Kush (Product)**
*   **Item Name:** OG Kush
*   **Internal ID:** `ogkush`
*   **Description:** "Old school OG Kush. Offers a balanced, relaxing high with subtle physical effects."
*   **Base Market Value / Sell Price:** $38 *(Matches manual data! BasePrice is $35)*
*   **Base Addictiveness:** 0 *(Derived from linked Property/Effect asset)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** 0 (Marijuana)
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `ff88fff...` - Confirmed 'Calming' from first dump)

**10. Sour Diesel (Product)**
*   **Item Name:** Sour Diesel
*   **Internal ID:** `sourdiesel`
*   **Description:** "An uplifting yet easy-going strain with mild cerebral effects."
*   **Base Market Value / Sell Price:** $40 *(Matches manual data! BasePrice is $35)*
*   **Base Addictiveness:** 0 *(Derived from linked Property/Effect asset. Linked 'Refreshing' asset is 10.4%, matching manual data)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** 0 (Marijuana)
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** Yes, 1 linked (GUID `1f669aa...` - Confirmed 'Refreshing' from first dump)

**11. Test Weed**
*   **Item Name:** Test Weed
*   **Internal ID:** `testweed`
*   **Description:** "Old school OG Kush. Offers a balanced, relaxing high with subtle physical effects." *(Description seems copied)*
*   **Base Market Value / Sell Price:** $71 *(BasePrice is $35)*
*   **Base Addictiveness:** 0 *(Derived from linked Property/Effect assets)*
*   **Stack Limit (Inventory):** 20
*   **Legality Status:** 2 (Likely Medium/Low)
*   **Drug Type:** 0 (Marijuana)
*   **Law Intensity Change:** 1 (Lower police attention)
*   **Effects Duration:** 180 seconds (presumably)
*   **Resell Multiplier:** 0.5
*   **Base Purchase Price:** $10 *(Usefulness unclear)*
*   **Available In Demo:** Yes
*   **Item Category (Internal):** 0
*   **Requires Level/Rank:** 0/0/0
*   **Valid Packaging:** Yes (Specific types linked internally)
*   **Properties (Linked Effects):** Yes, 2 linked (GUIDs `c455395...` and `dab9f34...` - Need to identify corresponding effect assets)

Okay, let's extract the useful information from these product-related C# files. This gives us deeper insight into how products are defined, function, and interact with other game systems.

---

**Product Definition (`ProductDefinition.cs`, `WeedDefinition.cs`, `CocaineDefinition.cs`, `MethDefinition.cs`)**

*   **Core Concept:** A `ProductDefinition` is a ScriptableObject asset that defines a *type* of product (e.g., base OG Kush, or a specific named mix like "OG Kush + Cuke"). It holds the base stats and properties before quality or packaging is considered.
*   **Inheritance:** Specific types like `WeedDefinition`, `CocaineDefinition`, `MethDefinition` inherit from `ProductDefinition` and add type-specific visual information (Materials, Appearance Settings).
*   **Key Fields:**
    *   `DrugTypes` (List<`DrugTypeContainer`>): Specifies the base `EDrugType`(s) associated with this product (e.g., Marijuana, Methamphetamine).
    *   `Properties` (List<`ScheduleOne.Properties.Property`>): **Crucial.** Links to the functional Effect assets (from `properties.md`) that define this product's effects, addictiveness modifiers, and value modifiers.
    *   `BaseAddictiveness` (float, 0-1): The inherent addictiveness of the product *before* considering effects from the `Properties` list. The final addictiveness is calculated by `GetAddictiveness()`, likely summing this base value with contributions from linked `Properties`.
    *   `BasePrice` (float): An internal base value, likely used in calculations.
    *   `MarketValue` (float): The base selling price of the product (per unit, before quality/property modifiers). **This is the key value seen in `product.md`.**
    *   `LawIntensityChange` (float): How much police attention increases when dealing/possessing this product type (e.g., 1 for Weed, 2 for Meth/Coke).
    *   `EffectsDuration` (int): How many seconds the product's effects last when consumed.
    *   `ValidPackaging` (Array<`PackagingDefinition`>): Lists which packaging items (Baggie, Jar, Brick) can be used with this product. **Must be ordered from lowest to highest quantity.**
    *   `FunctionalProduct`: Link to associated functional logic asset.
    *   `(Type Specific)`: `Weed/Cocaine/MethAppearanceSettings` and `Material` references define the visual look. `GetAppearanceSettings()` static method suggests appearance might be derived from the combined `Properties`.
*   **Saving:** Product definitions (especially dynamically created mixes) are saveable (`ISaveable`).

---

**Product Instance (`ProductItemInstance.cs`, `WeedInstance.cs`, `CocaineInstance.cs`, `MethInstance.cs`)**

*   **Core Concept:** Represents an actual stack of a specific product in the player's inventory, a container, or the world. It has a specific `ProductDefinition`, `Quantity`, `EQuality`, and potentially applied `PackagingDefinition`.
*   **Key Fields/Properties:**
    *   `Definition`: Links back to the `ProductDefinition` asset.
    *   `Quantity`: The number of *units* of the product in this stack.
    *   `Quality` (`EQuality` enum): The quality level of this specific batch.
    *   `PackagingID` (string): Stores the ID of the applied packaging.
    *   `AppliedPackaging` (`PackagingDefinition`): Gets the definition of the applied packaging. Returns `null` if unpackaged.
    *   `Amount` (int): Returns the quantity *per package* based on `AppliedPackaging.Quantity`. If unpackaged, likely returns `Quantity`.
*   **Calculated Properties:**
    *   `Name`: Display name, likely combines product name and packaging type (e.g., "OG Kush (Baggie)").
    *   `Icon`: Sprite used in UI, likely changes based on `AppliedPackaging`.
    *   `Equippable`: The component defining how it behaves when equipped (changes based on packaging).
    *   `StoredItem`: The component defining how it looks/behaves when placed in storage grids (changes based on packaging).
*   **Key Methods & Mechanics:**
    *   `CanStackWith()`: Determines if two instances can merge. Requires same `Definition`, `Quality`, and `PackagingID`. Also considers quantity limits (`MaxStackSize` from Definition and package capacity).
    *   `SetPackaging()`: Applies a `PackagingDefinition` to the instance.
    *   `GetMonetaryValue()`: Calculates the sell price of *this specific instance*. Likely uses `Definition.MarketValue` adjusted by `Quality` and potentially the value modifiers from the `Definition.Properties`.
    *   `GetAddictiveness()`: Returns the addictiveness value derived from the `Definition`.
    *   `ApplyEffectsToNPC()`, `ApplyEffectsToPlayer()`: Called when the item is consumed, triggers the effects defined in the `Definition.Properties`.
    *   `SetupPackagingVisuals()`: Updates the visual model based on the applied packaging and product type.

---

**Drug Types (`EDrugType.cs`, `DrugTypeMethods.cs`, `DrugTypeContainer.cs`)**

*   **Enum `EDrugType`:** Defines the primary categories of drugs:
    *   `Marijuana` (0)
    *   `Methamphetamine` (1)
    *   `Cocaine` (2)
    *   `MDMA` (3)
    *   `Shrooms` (4)
    *   `Heroin` (5)
*   **Helpers:** `DrugTypeMethods` provides `GetName()` and `GetColor()` for UI display based on the enum value. `DrugTypeContainer` is just a wrapper for lists.

---

**Properties / Effects (`EProperty.cs`, `PropertyMethods.cs`, `PropertyContainer.cs`, `PropertyItemDefinition.cs`, `PropertyUtility.cs`)**

*   **Important Distinction:**
    *   `ScheduleOne.Properties.Property` (referenced in `ProductDefinition` and `PropertyItemDefinition`): These appear to be the **functional effects** detailed in your `properties.md` dump (e.g., Calming, Sneaky, Balding) which have Tiers, Addictiveness, and Value Modifiers. `PropertyUtility.AllProperties` likely holds these.
    *   `EProperty` (enum defined here): Seems to be a different system, possibly for more general descriptors (Mild, Potent, Sedating, Stimulating, Euphoric, Addictive, etc.). `PropertyUtility.PropertyDatas` maps these enum values to Names, Descriptions, and Colors. It's unclear if/how these are used alongside the main functional effects, but they might be applied as descriptive tags.
*   **`PropertyItemDefinition`:** Base class for items that *can* have functional properties (like `ProductDefinition` and Additives/Ingredients). Contains the `List<ScheduleOne.Properties.Property> Properties`.
*   **`PropertyUtility`:** A manager (`Singleton`) that provides access to data about both `EProperty` descriptors and the functional `ScheduleOne.Properties.Property` effects. Can retrieve effects by tier or ID. `GetOrderedPropertyColors` suggests colors might be derived from the functional effects for visuals.

---

**Mixing (`ProductManager.cs`, `MixRecipeData.cs`, `NewMixOperation.cs`, `NewMixDiscoveryBox.cs`)**

*   **Core Manager:** `ProductManager` orchestrates mixing.
*   **Process:**
    1.  Player likely uses a Mixing Station (`stations.md`).
    2.  Player selects a base `ProductDefinition` and an `Ingredient` (`PropertyItemDefinition` from `ProductManager.ValidMixIngredients`).
    3.  `ProductManager` checks if a `StationRecipe` already exists for this combination (`GetRecipe`).
    4.  If not, a `NewMixOperation` is started.
    5.  The game calculates the resulting properties (combining base product properties + ingredient property).
    6.  A *new* `ProductDefinition` is dynamically created (`CreateWeed/Cocaine/Meth_Server`) representing the unique mix. This new definition stores the combined `Properties` list and derived `DrugTypes`, `AppearanceSettings`, etc.
    7.  The player likely names the new mix (`FinishAndNameMix`).
    8.  The new mix is added to `DiscoveredProducts`.
    9.  A `StationRecipe` (linking inputs to the new output Product ID) is created and stored (`CreateMixRecipe`).
*   **Mix Maps:** `WeedMixMap`, `MethMixMap`, `CokeMixMap` (references in `ProductManager`) likely store predefined outcomes or rules for mixing specific base types, potentially overriding simple property combination in some cases or defining unique results.
*   **Discovery:** The `NewMixDiscoveryBox` provides a UI element to showcase newly created mixes.
*   **Recipes:** `MixRecipeData` stores the simple relationship: Input Product ID + Mixer ID -> Output Product ID.

---

**Packaging (`PackagingDefinition.cs`, `EStealthLevel.cs`, `ProductQuantities.cs`)**

*   **`PackagingDefinition`:** Defines packaging items (Baggie, Jar, Brick).
    *   `Quantity` (int): How many units of product it holds.
    *   `StealthLevel` (`EStealthLevel` enum): `None` (0), `Basic` (1), `Advanced` (2). Affects concealment.
    *   Links to components for visual representation (`FunctionalPackaging`, `Equippable_Filled`, `StoredItem_Filled`).
*   **`ProductQuantities` Constants:**
    *   `BagQuantity`: **1**
    *   `JarQuantity`: **5**
    *   `BrickQuantity`: **25** (*Note: This differs from the `packaging.md` dump which listed 20 for Brick. The code value 25 is likely correct or more current.*)

---

**Pricing & Value (`ProductManager.cs`, `ProductDefinition.cs`, `ProductItemInstance.cs`)**

*   `ProductDefinition.MarketValue`: Base value per unit.
*   `ProductManager.CalculateProductValue()`: Calculates final value based on `baseValue` and the list of `Properties` (functional effects). Effects have value modifiers (from `properties.md`).
*   `ProductItemInstance.GetMonetaryValue()`: Calculates the value of a specific instance, factoring in `MarketValue`, `Quality`, and `Properties`.
*   `ProductManager.ProductPrices`: Dictionary suggests prices might be dynamic or player-settable via `SetPrice()`.
*   `MIN_PRICE`: **1**
*   `MAX_PRICE`: **999** (Likely the max price the player can set per unit when listing).

---

**Consumption (`Product_Equippable.cs`, `ProductItemInstance.cs`)**

*   Products can be `Consumable`.
*   `ConsumeTime` (float): Time required to consume the item via the equipable action.
*   `EffectsApplyDelay` (float): Delay after consumption starts/finishes before effects trigger.
*   `ApplyEffectsToNPC()`, `ApplyEffectsToPlayer()`: Methods called to trigger the effects logic.

---

**Product Management (UI/Player Facing - `ProductManager.cs`, `ProductEntry.cs`)**

*   `DiscoveredProducts`: List of products the player knows about.
*   `ListedProducts`: List of discovered products the player has chosen to make available for sale (to customers/dealers). Toggled via `SetProductListed()`.
*   `FavouritedProducts`: List of products marked as favorites by the player. Toggled via `SetProductFavourited()`.
*   `ProductEntry`: UI element representing a product in lists (e.g., in the product management app). Shows icon, allows selection, favouriting, and indicates listed status.

---

This detailed breakdown covers the core mechanics related to products derived from the code, including definitions, instances, types, effects, mixing, packaging, pricing, and consumption.
```

# properties.md

```md
**Extracted Player-Relevant Data from Effect Assets:**

*(Organized by Tier, then alphabetically. Ignoring colors, mix vectors, internal flags, etc.)*

**Tier 1 Effects**

*   **Effect Name:** Calming
    *   **Internal ID:** `calming`
    *   **Description:** "Induces a slight calmness in the user."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0.1 (Adds 10% to base product value)
    *   **GUID:** `ff88fffc965badc409a4b46d2652a178` *(Matches OG Kush Product Property)*
*   **Effect Name:** Euphoric
    *   **Internal ID:** `Euphoric`
    *   **Description:** "Induces mild euphoric in the user."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0.235 (23.5%)
    *   **Base Value Modifier:** +0.18 (Adds 18% to base product value)
    *   **GUID:** `3f4f290ea8487134498e81b12e62caa7`
*   **Effect Name:** Focused
    *   **Internal ID:** `Focused`
    *   **Description:** "Focuses the user's mind."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0.104 (10.4%)
    *   **Base Value Modifier:** +0.16 (Adds 16% to base product value)
    *   **GUID:** `64dfda7c41360f545b54e42c1fef28e9`
*   **Effect Name:** Munchies
    *   **Internal ID:** `munchies`
    *   **Description:** "Makes the user hungry."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0.096 (9.6%)
    *   **Base Value Modifier:** +0.12 (Adds 12% to base product value)
    *   **GUID:** `10e411647a7578940bc89f097a6653bb`
*   **Effect Name:** Paranoia
    *   **Internal ID:** `paranoia`
    *   **Description:** "Induces paranoia in the user."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `49438371dd4ec884faffec14e0d82c1d`
*   **Effect Name:** Refreshing
    *   **Internal ID:** `refreshing`
    *   **Description:** "Slightly energizes the user."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0.104 (10.4%)
    *   **Base Value Modifier:** +0.14 (Adds 14% to base product value)
    *   **GUID:** `1f669aa2a1321f24db07f43770fc20c9` *(Matches Sour Diesel Product Property)*
*   **Effect Name:** Smelly
    *   **Internal ID:** `smelly`
    *   **Description:** "Makes the user unbearably smelly."
    *   **Tier:** 1
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `3280aaf123fdf3349b86dc4565b34b60`

**Tier 2 Effects**

*   **Effect Name:** Calorie-Dense
    *   **Internal ID:** `caloriedense`
    *   **Description:** "Results in immediate weight gain."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0.1 (10%)
    *   **Base Value Modifier:** +0.28 (Adds 28% to base product value)
    *   **GUID:** `12826c936a1eac2408fcae55dfd02ad2`
*   **Effect Name:** Disorienting
    *   **Internal ID:** `disorienting`
    *   **Description:** "Causes unpredictable movement and slight visual impairment in the user."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `f97424863d141dd44a2d886552a9ffed`
*   **Effect Name:** Energizing
    *   **Internal ID:** `energizing`
    *   **Description:** "Increases the users energy."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0.34 (34%)
    *   **Base Value Modifier:** +0.22 (Adds 22% to base product value)
    *   **GUID:** `8301163bca693374fbca43f5ae493605` *(Matches Green Crack Product Property)*
*   **Effect Name:** Gingeritis
    *   **Internal ID:** `gingeritis`
    *   **Description:** "After consumption, the user will become a ginger."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0.2 (Adds 20% to base product value)
    *   **GUID:** `255ee6603a48b8f4ea0ad5b33d73afb6`
*   **Effect Name:** Sedating
    *   **Internal ID:** `sedating`
    *   **Description:** "Induces heavy sleepiness in the user."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0.26 (Adds 26% to base product value)
    *   **GUID:** `cee302b478ed60441a0bd7023ad82e5c` *(Matches Granddaddy Purple Product Property)*
*   **Effect Name:** Sneaky
    *   **Internal ID:** `sneaky`
    *   **Description:** "Silences the users foot steps."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0.327 (32.7%)
    *   **Base Value Modifier:** +0.24 (Adds 24% to base product value)
    *   **GUID:** `51a993ea0c0d04440b1d8edefcd528e4`
*   **Effect Name:** Toxic
    *   **Internal ID:** `toxic`
    *   **Description:** "Damages the user's liver and induces vomiting."
    *   **Tier:** 2
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **Other Player Effects:** TintColor suggests visual effect on player/product.
    *   **GUID:** `b34cc41265d8697478143dc30916100b`

**Tier 3 Effects**

*   **Effect Name:** Athletic
    *   **Internal ID:** `athletic`
    *   **Description:** "After consumption, the user is only able to run."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0.607 (60.7%)
    *   **Base Value Modifier:** +0.32 (Adds 32% to base product value)
    *   **Other Player Effects:** TintColor suggests visual effect on player/product.
    *   **GUID:** `bc28a333fd5cf2048a8111c0c6178044`
*   **Effect Name:** Balding
    *   **Internal ID:** `balding`
    *   **Description:** "Causes balding in the user."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0.3 (Adds 30% to base product value)
    *   **GUID:** `8a18aa6111557e246823661b9136e1ab`
*   **Effect Name:** Foggy
    *   **Internal ID:** `foggy`
    *   **Description:** "Causes a cloud of fog to form around the user."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0.1 (10%)
    *   **Base Value Modifier:** +0.36 (Adds 36% to base product value)
    *   **GUID:** `f4e8b2e3804dd174b8ef45a125d4620a`
*   **Effect Name:** Laxative
    *   **Internal ID:** `laxative`
    *   **Description:** "Causes the user to fart and shit uncontrollably."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0.1 (10%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `84e743d1a3e8e864ea09facbe5736d80`
*   **Effect Name:** Seizure-Inducing
    *   **Internal ID:** `seizure`
    *   **Description:** "Consumption results in an instant seizure."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `c9f624e2d8653c24ea25a8bd095a39cb`
*   **Effect Name:** Slippery
    *   **Internal ID:** `slippery`
    *   **Description:** "Reduces the user's ability to maintain traction on the ground."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0.309 (30.9%)
    *   **Base Value Modifier:** +0.34 (Adds 34% to base product value)
    *   **GUID:** `09cc6fed996998f40b9411f43cfa8146`
*   **Effect Name:** Spicy
    *   **Internal ID:** `spicy`
    *   **Description:** "Consumption results in the user's eyes turning blue."
    *   **Tier:** 3
    *   **Base Addictiveness:** 0.665 (66.5%)
    *   **Base Value Modifier:** +0.38 (Adds 38% to base product value)
    *   **Other Player Effects:** TintColor suggests visual effect on player/product.
    *   **GUID:** `45255276d6b7e92409f1aeff18e7e5bd`

**Tier 4 Effects**

*   **Effect Name:** Bright-Eyed
    *   **Internal ID:** `brighteyed`
    *   **Description:** "Causes the user's eyes to emit light."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0.2 (20%)
    *   **Base Value Modifier:** +0.4 (Adds 40% to base product value)
    *   **Other Player Effects:** Defines EyeColor, Emission, LightIntensity - strong visual effect.
    *   **GUID:** `9a1c55c8870b7134b8d14216dbf38977`
*   **Effect Name:** Glowing
    *   **Internal ID:** `glowie`
    *   **Description:** "Imbues a bioluminescence on the user."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0.472 (47.2%)
    *   **Base Value Modifier:** +0.48 (Adds 48% to base product value)
    *   **Other Player Effects:** Defines GlowColor - strong visual effect.
    *   **GUID:** `ed5319276a4cfeb4281aae5984b5d04e`
*   **Effect Name:** Jennerising
    *   **Internal ID:** `jennerising`
    *   **Description:** "Inverts the user's gender."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0.343 (34.3%)
    *   **Base Value Modifier:** +0.42 (Adds 42% to base product value)
    *   **GUID:** `cbc01bf3304d3654fbb3b38b49f443ba`
*   **Effect Name:** Lethal
    *   **Internal ID:** `lethal`
    *   **Description:** "Causes total organ failure shortly after consumption."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `be6ef3c6460adac459cb7b6f45e4e75f`
*   **Effect Name:** Schizophrenic
    *   **Internal ID:** `schizophrenic`
    *   **Description:** "Induces hallucinations and unpredictable behaviour in the user."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `5a7b3fa762f157a4abd69fbb4b292ea2`
*   **Effect Name:** Thought-Provoking
    *   **Internal ID:** `thoughtprovoking`
    *   **Description:** "Increases the size of the user's head."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0.37 (37%)
    *   **Base Value Modifier:** +0.44 (Adds 44% to base product value)
    *   **GUID:** `dab9f348050ec7b4fbac698f3b32dd4e` *(Matches one Property on Test Weed)*
*   **Effect Name:** Tropic Thunder
    *   **Internal ID:** `tropicthunder`
    *   **Description:** "Inverts the user's skin color."
    *   **Tier:** 4
    *   **Base Addictiveness:** 0.803 (80.3%)
    *   **Base Value Modifier:** +0.46 (Adds 46% to base product value)
    *   **GUID:** `6b16a3f1922a5974bb14367c8c2aff04`

**Tier 5 Effects**

*   **Effect Name:** Anti-gravity
    *   **Internal ID:** `antigravity`
    *   **Description:** "Weakens the effects of gravity on the user."
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.611 (61.1%)
    *   **Base Value Modifier:** +0.54 (Adds 54% to base product value)
    *   **GUID:** `40784621a2e5fbe4cbc4248de7983706`
*   **Effect Name:** Cyclopean
    *   **Internal ID:** `cyclopean`
    *   **Description:** *(Empty)* - Effect unknown from data.
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.1 (10%)
    *   **Base Value Modifier:** +0.56 (Adds 56% to base product value)
    *   **GUID:** `65db5bdb2fe479443bee064eeab25866`
*   **Effect Name:** Electrifying
    *   **Internal ID:** `electrifying`
    *   **Description:** "Electrifies the user, causing arcs of electricity to be emitted, zapping anyone nearby."
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.235 (23.5%)
    *   **Base Value Modifier:** +0.5 (Adds 50% to base product value)
    *   **Other Player Effects:** Defines EyeColor - strong visual effect.
    *   **GUID:** `8d4588c64b65e0b46b2efcae062176a3`
*   **Effect Name:** Explosive
    *   **Internal ID:** `explosive`
    *   **Description:** "Causes the user to explode shortly after consumption."
    *   **Tier:** 5
    *   **Base Addictiveness:** 0 (0%)
    *   **Base Value Modifier:** +0 (Adds 0% to base product value - Negative Effect)
    *   **GUID:** `8855d004355ec0d4db89224a65f18b27`
*   **Effect Name:** Long faced *(Note: space in Name)*
    *   **Internal ID:** `giraffying`
    *   **Description:** "Considerably increases the size of the user's head and neck."
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.607 (60.7%)
    *   **Base Value Modifier:** +0.52 (Adds 52% to base product value)
    *   **GUID:** `0dce587811d674b4eb7c0fe0891f004d`
*   **Effect Name:** Shrinking
    *   **Internal ID:** `shrinking`
    *   **Description:** "Shrinks the user."
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.336 (33.6%)
    *   **Base Value Modifier:** +0.6 (Adds 60% to base product value)
    *   **GUID:** `c45539561ef11a746bfb77b48ae01268` *(Matches one Property on Test Weed)*
*   **Effect Name:** Zombifying
    *   **Internal ID:** `zombifying`
    *   **Description:** *(Empty)* - Effect likely involves zombie sounds based on `zombieVODatabase` link.
    *   **Tier:** 5
    *   **Base Addictiveness:** 0.598 (59.8%)
    *   **Base Value Modifier:** +0.58 (Adds 58% to base product value)
    *   **Other Player Effects:** Links to zombie voice-over database.
    *   **GUID:** `b8e941ae03ded1b45b9cc184df468bba`

This detailed breakdown of effects, their tiers, addictiveness, and value modifiers is crucial for understanding how product mixing works and predicting the value and consequences of different combinations. You can now link the GUIDs found in the Product assets' `Properties` field back to these effect definitions.

Okay, let's break down the C# code related to Properties (Effects). This gives us the functional implementation details behind the data seen in `properties.md`.

---

**Core Property Definition (`Property.cs`)**

*   **Base Class:** This is the fundamental `ScriptableObject` asset type for all functional effects in the game. Each specific effect (like Calming, Athletic, etc.) inherits from this.
*   **Key Fields (Matches & Expands on `properties.md`):**
    *   `Name` (string): Display name (e.g., "Calming").
    *   `Description` (string): In-game text description.
    *   `ID` (string): Unique identifier (e.g., "calming").
    *   `Tier` (int, 1-5): The power level or rarity tier of the effect.
    *   `Addictiveness` (float, 0-1): How much this specific effect contributes to the product's overall addictiveness.
    *   `ValueChange` (int, -100 to 100): *Seems less used/relevant based on previous dumps; `AddBaseValueMultiple` appears to be the primary value modifier.* Might be a flat value change applied after multipliers.
    *   `ValueMultiplier` (float, 0-2): A multiplier applied to the product's value. (Likely `1.0` means no change, `1.2` means +20%).
    *   `AddBaseValueMultiple` (float, -1 to 1): **Likely the direct source for the `BaseValueModifier` seen in `properties.md`.** Adds a percentage of the *base product's* value (e.g., 0.2 means +20% of the base strain's value).
    *   `ProductColor` (Color): Suggests the effect might tint the visual appearance of the product itself (e.g., weed buds, meth crystals).
    *   `LabelColor` (Color): Color used for UI elements associated with this property.
    *   `MixDirection` (Vector2): A 2D vector used in the advanced mixing map calculation.
    *   `MixMagnitude` (float): The strength or length of the `MixDirection` vector.
*   **Abstract Methods:**
    *   `ApplyToNPC(NPC npc)`, `ClearFromNPC(NPC npc)`: Defines how the effect starts and stops affecting an NPC character.
    *   `ApplyToPlayer(Player player)`, `ClearFromPlayer(Player player)`: Defines how the effect starts and stops affecting the player character. Each specific effect class implements these.

---

**Specific Effect Implementations (e.g., `AntiGravity.cs`, `Athletic.cs`, etc.)**

This confirms *how* each effect functions mechanically:

*   **`AntiGravity`:**
    *   Reduces gravity's effect on the player/NPC.
    *   `GravityMultiplier = 0.3f`: Gravity is set to 30% of normal.
*   **`Athletic`:**
    *   Forces player/NPC to only run (likely disables walking).
    *   `SPEED_MULTIPLIER = 1.3f`: Movement speed increased by 30%? (Or run speed specifically).
    *   `TintColor`: Applies a visual color tint to the player/NPC.
*   **`Balding`:**
    *   Applies a visual change to the player/NPC model to make them appear bald.
*   **`BrightEyed`:**
    *   Causes player/NPC eyes to emit light.
    *   `EyeColor`: Sets the color of the eyes/light.
    *   `Emission`: Controls the intensity/brightness of the eye material's emission.
    *   `LightIntensity`: Controls the strength of an actual light source potentially attached to the eyes.
*   **`Calming`:**
    *   Likely applies a status effect reducing stress, affecting AI behavior, or potentially visual filters. (No specific values here).
*   **`CalorieDense`:**
    *   Likely increases a hidden "weight" variable for the player/NPC, potentially affecting appearance or stamina. (No specific values here).
*   **`Cyclopean`:**
    *   Applies a visual change to make the player/NPC appear to have one eye. (No specific values here).
*   **`Disorienting`:**
    *   Affects player controls (unpredictable movement) and applies visual impairment effects (blur, screen warp?). (No specific values here).
*   **`Electrifying`:**
    *   Causes player/NPC to emit electrical arcs, potentially damaging nearby entities.
    *   `EyeColor`: Changes eye color.
*   **`Energizing`:**
    *   Increases movement speed.
    *   `SPEED_MULTIPLIER = 1.15f`: Movement speed increased by 15%.
*   **`Euphoric`:**
    *   Likely applies a status effect influencing AI mood or player visuals (color saturation?). (No specific values here).
*   **`Explosive`:**
    *   Causes the player/NPC to explode after a short delay upon consumption.
*   **`Focused`:**
    *   Likely affects player aiming (reduced sway?) or applies a visual effect (vignette?). (No specific values here).
*   **`Foggy`:**
    *   Creates a visual fog particle effect around the player/NPC.
*   **`Gingeritis`:**
    *   Applies a visual change to make the player/NPC have ginger hair/skin characteristics.
    *   `Color`: Defines the specific ginger color used (static, shared by all instances).
*   **`Glowie`:** (Internal ID for "Glowing")
    *   Makes the player/NPC emit a bioluminescent glow.
    *   `GlowColor`: Sets the color of the glow.
*   **`Jennerising`:**
    *   Applies a visual change to invert the apparent gender of the player/NPC model.
*   **`Laxative`:**
    *   Triggers uncontrollable fart/poop animations and sound effects.
*   **`Lethal`:**
    *   Causes rapid health drain, leading to death.
    *   `HEALTH_DRAIN_PLAYER = 15f`: Player loses 15 health per second (?).
    *   `HEALTH_DRAIN_NPC = 15f`: NPCs lose 15 health per second (?).
*   **`LongFaced`:**
    *   Applies a visual change to elongate the head and neck of the player/NPC model ("Giraffying").
*   **`Munchies`:**
    *   Likely triggers a hunger status effect or AI behavior related to finding food. (No specific values here).
*   **`Paranoia`:**
    *   Likely affects player visuals/audio (shadows, whispers?) or NPC AI behavior (increased suspicion?). (No specific values here).
*   **`Refreshing`:**
    *   Likely provides a small stamina boost or minor speed increase. (No specific values here).
*   **`Schizophrenic`:**
    *   Induces visual/audio hallucinations and potentially erratic AI behavior. (No specific values here).
*   **`Sedating`:**
    *   Causes sleepiness, likely slowing movement, blurring vision, and potentially forcing the player/NPC into an unconscious state. (No specific values here).
*   **`Seizure`:**
    *   Triggers seizure animation/state for player/NPC.
    *   `CAMERA_JITTER_INTENSITY = 1f`: Strength of camera shake for the player.
    *   `DURATION_NPC = 60f`: Seizure lasts 60 seconds for NPCs.
    *   `DURATION_PLAYER = 30f`: Seizure lasts 30 seconds for the player.
*   **`Shrinking`:**
    *   Reduces the scale of the player/NPC model.
    *   `Scale = 0.8f`: Character shrinks to 80% of normal size.
    *   `LerpTime = 1f`: Takes 1 second to smoothly shrink/grow.
*   **`Slippery`:**
    *   Reduces traction, making movement difficult (sliding). (No specific values here).
*   **`Smelly`:**
    *   Likely applies a particle effect (stink lines?) and potentially affects NPC reactions (avoidance?). (No specific values here).
*   **`Sneaky`:**
    *   Silences footsteps.
    *   Applies a `VisibilityAttribute`, likely reducing the range at which AI can detect the player/NPC by sound.
*   **`Spicy`:**
    *   Changes eye color. (Description in `properties.md` mentioned blue eyes).
    *   `TintColor`: Applies a visual color tint to the player/NPC.
*   **`ThoughtProvoking`:**
    *   Applies a visual change to increase the head size of the player/NPC model.
*   **`Toxic`:**
    *   Damages health/liver (potentially a slow drain or status effect) and triggers vomiting animation/sound.
    *   `TintColor`: Applies a visual color tint (often greenish) to the player/NPC.
*   **`TropicThunder`:**
    *   Applies a visual change to invert the skin color of the player/NPC model.
*   **`Zombifying`:**
    *   Likely changes player/NPC appearance to look like a zombie and forces them to use zombie sounds/animations.
    *   `zombieVODatabase`: Links to the specific voice-over sounds for the zombie effect.

---

**Mixing Calculation (`PropertyMixCalculator.cs`, `MixMaps`/*)

*   **Core Logic:** `PropertyMixCalculator.MixProperties()` is the central function determining the outcome of mixing a base product (with existing properties) and an ingredient (adding a new property).
*   **Property Limit:** A product can have a maximum of **8** properties (`MAX_PROPERTIES`). If mixing would exceed this, some properties must be removed or replaced.
*   **Mixer Map System:** This is a significant mechanic revealed here.
    *   Mixing isn't purely additive. The outcome depends on the `MixDirection` and `MixMagnitude` vectors associated with each property.
    *   These vectors likely position the properties on a 2D plane (`MixerMap`).
    *   Adding a new property shifts the "center point" of the existing properties based on the new property's vector.
    *   The `MixerMap` (specific maps exist for Weed, Meth, Coke) defines regions on this 2D plane, each associated with a resulting `Property`.
    *   The final position of the "center point" after adding the new property determines which region it falls into (`GetEffectAtPoint`), and thus which *single* effect might dominate or emerge from the mix, potentially replacing some or all of the input properties.
    *   This allows for complex interactions where combining specific effects can lead to unexpected or unique resulting effects, rather than just a longer list.
*   **Reactions:** The `Reaction` class suggests some properties might directly react and replace others during the mixing calculation, possibly before the Mixer Map lookup.
*   **Randomness:** `Shuffle()` suggests that if the property limit is exceeded, the selection of which properties remain might involve some randomness, potentially seeded for consistency.

---

This detailed breakdown provides the functional mechanics behind each effect and reveals the sophisticated, non-additive `MixerMap` system used for calculating mix results. This is crucial for building an accurate mixing calculator on a helper website.
```

# property.md

```md
Okay, let's break down the code related to properties and utilities. This reveals how players acquire, manage, and utilize different locations and the resources within them.

**Property System Overview (`Property.cs`)**

*   **Core Concept:** Properties are distinct locations/buildings in the game world that the player can potentially own and utilize. Examples include Bungalows, Motel Rooms, Businesses, RVs, Sweatshops.
*   **Ownership:**
    *   Properties have an `IsOwned` status.
    *   They can be `OwnedByDefault` or purchased (`Price`).
    *   Unowned properties typically display a `ForSaleSign`.
    *   Acquiring a property triggers events (`onPropertyAcquired`, `onThisPropertyAcquired`).
    *   Ownership status is saved (`ISaveable`) and synced in multiplayer (`SetOwned_Server`, `ReceiveOwned_Networked`).
    *   `DEBUG_SET_OWNED` suggests a developer cheat to instantly own properties.
*   **Identification:**
    *   Each property has a display `propertyName` and an internal `propertyCode`.
*   **Functionality & Contents:**
    *   `PropertyContentsContainer`: A component likely holding all placeable items within the property.
    *   `BuildableItems`: List of items the player has built/placed inside.
    *   `SpawnPoint`, `InteriorSpawnPoint`: Define where the player appears when entering/loading into the property.
    *   `NPCSpawnPoint`: Where NPCs might spawn within the property.
    *   `EmployeeIdlePoints`: Specific spots where hired employees will stand when idle.
    *   `EmployeeCapacity`: Defines the maximum number of employees that can be assigned to this property. (Managed via `RegisterEmployee`, `DeregisterEmployee`).
    *   `LoadingDocks`: Specific interaction points for delivery/logistics systems. `LoadingDockCount` provides the number available.
    *   `Toggleables`: Interactive elements within the property (like light switches) whose state (`on`/`off`) is saved and synced (`SendToggleableState`, `SetToggleableState`).
    *   `PropertyDisposalArea`: A designated spot (`StandPoint`, `TrashDropPoint`) for getting rid of trash within the property.
*   **Map & UI:**
    *   `PoI` (Point of Interest): Links the property to a marker on the game map.
    *   `WorldspaceUIContainer`: Likely holds UI elements displayed in the world related to the property (e.g., status indicators).
*   **Demo Availability:**
    *   `AvailableInDemo`: Flag indicating if the property exists/is accessible in the demo version.
*   **Performance:**
    *   `ContentCullingEnabled`, `MinimumCullingDistance`, `ObjectsToCull`: System to hide/disable objects within the property when the player is far away to save performance. `IsContentCulled` tracks the current state.
*   **Saving:** Property state (ownership, built items, toggleable states, assigned employees) is saved via `ISaveable` interface (`WriteData`, `Load`).

---

**Specific Property Types**

*   **`Bungalow.cs`, `MotelRoom.cs`, `Sweatshop.cs`:**
    *   These appear to be distinct types of properties inheriting the base `Property` features.
    *   Their primary distinction might be size, layout, purchase price, employee capacity, or role in quests/game progression.
    *   They contain `UpdateVariables` calls, suggesting they might update specific global game flags upon being acquired or interacted with.
*   **`RV.cs` (Recreational Vehicle):**
    *   A unique type of `Property`.
    *   **Destructible:** Contains logic (`SetExploded`, `_isExploded`) indicating it can be destroyed. This likely ties into the story event mentioned in `phonecalls.md` (`Call_AfterExplosion`). `onSetExploded` event triggers visual/gameplay changes.
    *   **Interactable:** Has a `Ransack` method, suggesting it can be searched for items/information.
    *   **Non-Standard Saving:** `ShouldSave()` returns `false`, implying its state (like being exploded) might be temporary, event-driven, or saved through a different mechanism (e.g., quest flags) rather than the standard property saving.
*   **`Business.cs`:**
    *   A specialized `Property` focused on **Money Laundering**.
    *   **Laundering Mechanics:**
        *   `LaunderCapacity`: The maximum amount of money that can be processed simultaneously or within a specific timeframe.
        *   `LaunderingOperations`: A list tracking active laundering jobs.
        *   `StartLaunderingOperation`: Player initiates a laundering job by providing a cash `amount`.
        *   `LaunderingOperation.cs`: Defines the data for a job: `business`, `amount`, `minutesSinceStarted`, `completionTime_Minutes`. Time is required to complete the process.
        *   Jobs progress over time (`MinPass`, `MinsPass`).
        *   `CompleteOperation`: Finishes the job, converting the dirty cash into clean (likely online balance). `onOperationFinished` event triggers.
        *   Requires a `Laundering Station` (`stations.md`) to be placed inside to function (as per `Call_CleanCashIntro`).
    *   **Management:** Tracked separately (`Businesses`, `UnownedBusinesses`, `OwnedBusinesses`). `BusinessManager` likely handles loading/saving/tracking all businesses.
    *   **Saving:** Business state, including active laundering operations, is saved.

---

**Utility Systems**

**Power Utility System (`PowerManager.cs`, `PowerNode.cs`, `PowerLine.cs`)**

*   **Core Concept:** A system simulating electricity consumption and cost. Players likely need to build power networks for certain equipment.
*   **Consumption & Cost:**
    *   `PowerManager.pricePerkWh`: Defines the **cost per kilowatt-hour** of electricity consumed.
    *   Appliances/equipment call `PowerManager.ConsumePower(float kwh)` to register usage.
    *   Usage is tracked (`usageThisMinute`, `usageAtTime`).
    *   Total usage is calculated (`GetTotalUsage`), and costs are likely applied periodically (e.g., daily via `DayPass`).
*   **Network Building:**
    *   `PowerNode`: Connection points on buildings or equipment. Can be a source (`poweredNode`), consumer (`consumptionNode`), or junction. `isConnectedToPower` tracks if it's receiving power.
    *   `PowerLine`: Connects two `PowerNode`s.
        *   Players likely build these (`Constructable`).
        *   `PowerManager.CreatePowerLine`: Function to instantiate a power line.
        *   Placement Rules: Lines have limits on length (`maxLineLength`) and the number of visual segments (`powerLine_MinSegments`, `powerLine_MaxSegments`). `CanNodesBeConnected` checks validity.
    *   Equipment likely only functions if its `PowerNode` has `isConnectedToPower` true, tracing back through the network to a `poweredNode`.

**Water Utility System (`WaterManager.cs`, `Tap.cs`)**

*   **Core Concept:** System simulating water consumption and cost, primarily used for filling watering cans.
*   **Consumption & Cost:**
    *   `WaterManager.pricePerL`: Defines the **cost per litre** of water consumed.
    *   Using a `Tap` calls `WaterManager.ConsumeWater(float litres)`.
    *   Usage is tracked (`usageThisMinute`, `usageAtTime`).
    *   Total usage is calculated (`GetTotalUsage`), and costs are likely applied periodically (e.g., daily via `DayPass`).
*   **Taps (`Tap.cs`):**
    *   Interactive objects (`IUsable`, `InteractableObject`) found in properties.
    *   Used to fill containers (like watering cans - `CreateWateringCanModel`).
    *   `MaxFlowRate`: Max rate water comes out (**6.0** units/time). `ActualFlowRate` depends on interaction.
    *   `IsHeldOpen`: Tracks if the tap is currently running.
    *   Visuals (`WaterParticles`) and sound (`WaterRunningSound`) provide feedback.
    *   Can be used by the player (`SetPlayerUser`) or NPCs (`SetNPCUser`).

---

This detailed breakdown covers the acquisition and core functions of properties, the specifics of businesses for laundering, and the mechanics of power and water utilities, including their costs and how players interact with them.
```

# seeds.md

```md
**1. Coca Seed**

*   **Item Name:** Coca Seed
*   **Internal ID:** `cocaseed`
*   **Description:** "A single coca seed. Grows into a coca plant, which provides coca leaves, which can be turned into something else starting with coca." (Hints at multi-stage processing)
*   **Base Purchase Price:** $150
*   **Resell Value:** $75 (Calculated: $150 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Illegal/Controlled)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** No (Value: 0)
*   **Shop Category:** 2 (Likely means "Seeds" category in shops)
*   **Item Category (Internal):** 2
*   **Label Display Color:** White {r: 1, g: 1, b: 1, a: 1} (Relevant for potential UI coding in planner)

**2. Granddaddy Purple Seed**

*   **Item Name:** Granddaddy Purple Seed
*   **Internal ID:** `granddaddypurpleseed`
*   **Description:** "One 'Granddaddy Purple' marijuana seed."
*   **Base Purchase Price:** $45
*   **Resell Value:** $22.5 (Calculated: $45 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Illegal/Controlled)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 4
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2 (Likely means "Seeds" category in shops)
*   **Item Category (Internal):** 2
*   **Label Display Color:** White {r: 1, g: 1, b: 1, a: 1}

**3. Green Crack Seed**

*   **Item Name:** Green Crack Seed
*   **Internal ID:** `greencrackseed`
*   **Description:** "One 'Green Crack' marijuana seed."
*   **Base Purchase Price:** $40
*   **Resell Value:** $20 (Calculated: $40 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Illegal/Controlled)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 2
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2 (Likely means "Seeds" category in shops)
*   **Item Category (Internal):** 2
*   **Label Display Color:** White {r: 1, g: 1, b: 1, a: 1}

**4. OG Kush Seed**

*   **Item Name:** OG Kush Seed
*   **Internal ID:** `ogkushseed`
*   **Description:** "One 'OG Kush' marijuana seed."
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Illegal/Controlled)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2 (Likely means "Seeds" category in shops)
*   **Item Category (Internal):** 2
*   **Label Display Color:** White {r: 1, g: 1, b: 1, a: 1}

**5. Sour Diesel Seed**

*   **Item Name:** Sour Diesel Seed
*   **Internal ID:** `sourdieselseed`
*   **Description:** "One 'Sour Diesel' marijuana seed."
*   **Base Purchase Price:** $35
*   **Resell Value:** $17.5 (Calculated: $35 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely indicates Illegal/Controlled)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 4
*   **Available In Demo:** Yes (Value: 1)
*   **Shop Category:** 2 (Likely means "Seeds" category in shops)
*   **Item Category (Internal):** 2
*   **Label Display Color:** White {r: 1, g: 1, b: 1, a: 1}

**Summary of Player-Relevant Fields Extracted:**

*   **Name:** The display name of the seed.
*   **ID:** Unique identifier.
*   **Description:** In-game text description, sometimes hints at use.
*   **BasePurchasePrice:** Cost to buy from a shop.
*   **ResellMultiplier / Resell Value:** How much you get back selling it.
*   **StackLimit:** How many fit in one inventory slot.
*   **legalStatus:** Likely affects risk or sale restrictions.
*   **RequiresLevelToPurchase:** Player level gate.
*   **RequiredRank:** Rank/Tier gate.
*   **AvailableInDemo:** If it's in the demo version.
*   **ShopCategories:** Where it can be purchased.
*   **Item Category:** Internal grouping, potentially useful for filtering.
*   **LabelDisplayColor:** Potential UI colour info.
```

# skateboards.md

```md
**Analysis Notes:**

*   These are equipment items used for transportation.
*   The descriptions provide key hints about their performance differences (speed, agility, jump height, acceleration).
*   Prices vary significantly, indicating different tiers of equipment.
*   They all seem legal (`legalStatus: 0`).
*   Stack limit is 1, as expected for unique equipment.
*   No level or rank requirements listed for these specific items.

**Extracted Player-Relevant Data from Skateboard Assets:**

*(Ignoring *_Icon.asset data, GUIDs, prefab links, etc.)*

**1. Cheap Skateboard**

*   **Item Name:** Cheap Skateboard
*   **Internal ID:** `cheapskateboard`
*   **Description:** "Old wood with some wheels nailed to it. Not fancy but it rolls." (Implies basic, low performance)
*   **Base Purchase Price:** $75
*   **Resell Value:** $37.5 (Calculated: $75 * 0.5)
*   **Resell Multiplier:** 0.5 (Sells for 50% of base purchase price)
*   **Stack Limit (Inventory):** 1
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes (Value: 1)
*   **Item Category (Internal):** 3 (Likely Skateboard/Equipment category)
*   **Requires Level/Rank:** 0/0/0
*   **Shop Categories:** None listed (Sold elsewhere or default?)

**2. Cruiser**

*   **Item Name:** Cruiser
*   **Internal ID:** `cruiser`
*   **Description:** "Cruiser skateboard designed for high-speed, straight line motion. Not particularly agile." (Implies high top speed, low turning ability)
*   **Base Purchase Price:** $500
*   **Resell Value:** $250 (Calculated: $500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes (Value: 1)
*   **Item Category (Internal):** 3
*   **Requires Level/Rank:** 0/0/0
*   **Shop Categories:** None listed

**3. Golden Skateboard**

*   **Item Name:** Golden Skateboard
*   **Internal ID:** `goldenskateboard`
*   **Description:** "Tasteful gold-plated skateboard. High top speed but slow acceleration." (Implies high top speed, poor acceleration, cosmetic value)
*   **Base Purchase Price:** $1500
*   **Resell Value:** $750 (Calculated: $1500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes (Value: 1)
*   **Item Category (Internal):** 3
*   **Requires Level/Rank:** 0/0/0
*   **Shop Categories:** None listed

**4. Lightweight Skateboard**

*   **Item Name:** Lightweight Skateboard
*   **Internal ID:** `lightweightskateboard`
*   **Description:** "Low-weight plastic skateboard with increased jump height." (Implies better jumping ability, potentially standard speed/acceleration)
*   **Base Purchase Price:** $500
*   **Resell Value:** $250 (Calculated: $500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes (Value: 1)
*   **Item Category (Internal):** 3
*   **Requires Level/Rank:** 0/0/0
*   **Shop Categories:** None listed

**5. Skateboard**

*   **Item Name:** Skateboard
*   **Internal ID:** `skateboard`
*   **Description:** "Classic double-kick popsicle skateboard. Use it to get around faster than on-foot." (Implies standard, balanced performance)
*   **Base Purchase Price:** $250
*   **Resell Value:** $125 (Calculated: $250 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes (Value: 1)
*   **Item Category (Internal):** 3
*   **Requires Level/Rank:** 0/0/0
*   **Shop Categories:** None listed

This data gives players the cost, resale value, and crucially, descriptive hints about the performance characteristics of each skateboard to help them choose which one to buy based on their needs (speed, agility, jumping, cost).
```

# stations.md

```md
**Extracted Player-Relevant Data from Station Assets:**

*(Ignoring *_Icon.asset data, GUIDs, prefab/BuiltItem links, and other non-player-facing fields)*

**1. Brick Press**
*   **Item Name:** Brick Press
*   **Internal ID:** `brickpress`
*   **Description:** "Industrial brick press used to squish stuff into bricks." (Likely for compacting drugs like cocaine).
*   **Base Purchase Price:** $800
*   **Resell Value:** $400 (Calculated: $800 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10 (Can carry multiple before placing)
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 4, Tier 5 (Mid-late game unlock)
*   **Available In Demo:** No
*   **Shop Category:** 1 (Likely "Equipment" or "Hardware" category in shops)
*   **Item Category (Internal):** 8 (Likely Equipment/Stations)
*   **Build Sound Type:** 2

**2. Cauldron**
*   **Item Name:** Cauldron
*   **Internal ID:** `cauldron`
*   **Description:** "Industrial cauldron used for boiling a lot of stuff at once." (Suggests large-batch processing, possibly for meth or other cooked items).
*   **Base Purchase Price:** $3000
*   **Resell Value:** $1500 (Calculated: $3000 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 5, Tier 1 (Late game unlock)
*   **Available In Demo:** No
*   **Shop Category:** None listed (Might be a special purchase or quest reward?)
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**3. Chemistry Station**
*   **Item Name:** Chemistry Station
*   **Internal ID:** `chemistrystation`
*   **Description:** "General-purpose chemistry station used for mixing and cooking." (Likely essential for meth production).
*   **Base Purchase Price:** $1000
*   **Resell Value:** $500 (Calculated: $1000 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0 (Available early)
*   **Available In Demo:** No
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**4. Drying Rack**
*   **Item Name:** Drying Rack
*   **Internal ID:** `dryingrack`
*   **Description:** "Hang up organic items (weed, coca leaves) here to improve their quality." (Directly states function and applicable items).
*   **Base Purchase Price:** $250
*   **Resell Value:** $125 (Calculated: $250 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 3, Tier 3 (Mid-game unlock)
*   **Available In Demo:** No
*   **Shop Category:** None listed (Might be a special purchase or quest reward?)
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**5. Lab Oven**
*   **Item Name:** Lab Oven
*   **Internal ID:** `laboven`
*   **Description:** "Special-purpose laboratory oven for cooking/drying out substances." (Function overlaps slightly with Drying Rack/Cauldron/Chem Station descriptions, but likely specific recipes).
*   **Base Purchase Price:** $1000
*   **Resell Value:** $500 (Calculated: $1000 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0 (Available early)
*   **Available In Demo:** No
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**6. Laundering Station**
*   **Item Name:** Laundering Station
*   **Internal ID:** `launderingstation`
*   **Description:** "Workstation that contains the interface for laundering money. Must be placed at a business to work." (Clear function and placement requirement).
*   **Base Purchase Price:** $500
*   **Resell Value:** $250 (Calculated: $500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own, though its *use* might be illegal)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0 (Available early, but needs a business)
*   **Available In Demo:** No
*   **Shop Category:** None listed (Might be a special purchase or quest reward?)
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 1

**7. Mixing Station**
*   **Item Name:** Mixing Station
*   **Internal ID:** `mixingstation`
*   **Description:** "Used to mix product with ingredients to create unique new products." (Key for using additives).
*   **Base Purchase Price:** $500
*   **Resell Value:** $250 (Calculated: $500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 1 (Early-mid game unlock)
*   **Available In Demo:** Yes
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**8. Mixing Station Mk2**
*   **Item Name:** Mixing Station Mk2
*   **Internal ID:** `mixingstationmk2`
*   **Description:** "An upgraded model of the mixing station with automatic ingredient insertion, and faster mix times." (Clear upgrade path).
*   **Base Purchase Price:** $2000
*   **Resell Value:** $1000 (Calculated: $2000 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 2, Tier 2 (Mid-game unlock)
*   **Available In Demo:** Yes
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**9. Packaging Station**
*   **Item Name:** Packaging Station
*   **Internal ID:** `packagingstation`
*   **Description:** "Provides a clean surface to place product into packaging." (Essential for preparing products for sale).
*   **Base Purchase Price:** $100
*   **Resell Value:** $50 (Calculated: $100 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0 (Available early)
*   **Available In Demo:** Yes
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

**10. Packaging Station Mk II**
*   **Item Name:** Packaging Station Mk II
*   **Internal ID:** `packagingstationmk2`
*   **Description:** "An upgraded version of the packaging station with a rotary packing tool. Allows for much faster packing of products." (Clear upgrade path).
*   **Base Purchase Price:** $750
*   **Resell Value:** $375 (Calculated: $750 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal to own)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 5 (Mid-game unlock)
*   **Available In Demo:** Yes
*   **Shop Category:** 1
*   **Item Category (Internal):** 8
*   **Build Sound Type:** 2

This gives a good overview of the available workstations, their functions, costs, and when they become available to the player.
```

# storage.md

```md
**Analysis Notes:**

*   **Item Type:** These are placeable furniture items used for storage.
*   **Key Info:** For a player, the most important aspects are likely Name, Cost, Resale Value, *Storage Capacity* (how many slots/items it holds), and potentially any placement restrictions (like wall-mounted) or item type restrictions (like 'documents' for filing cabinet, 'fancy stuff' for display/safe).
*   **Capacity Data:** The provided assets define the *buyable/inventory item* version of the storage. The actual storage capacity (number of slots, allowed items) is likely defined in the linked `BuiltItem` asset (the object placed in the world). **This capacity information is NOT present in the provided files.** We can only note hints from names and descriptions (e.g., "4-tier", "Small/Medium/Large").
*   **Shop Categories:** Most are sold in Shop Category 4 (presumably furniture/storage). Display Cabinet and Filing Cabinet are exceptions, suggesting they might be acquired differently (e.g., built, found, quest reward).

**Extracted Player-Relevant Data from Storage Assets:**

*(Ignoring *_Icon.asset data, GUIDs, prefab/item links unless clarifying function, build sounds, and other non-player-facing fields)*

**1. Display Cabinet**
*   **Item Name:** Display Cabinet
*   **Internal ID:** `displaycabinet`
*   **Description:** "Wooden display cabinet for putting all your fancy stuff in." (Suggests primarily for visual display, possibly limited item types).
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $250
*   **Resell Value:** $125 (Calculated: $250 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10 (How many unplaced cabinets stack)
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** None listed (Suggests not bought directly from standard shops, maybe built or found?)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Description implies multiple items but focus is on display.

**2. Filing Cabinet**
*   **Item Name:** Filing Cabinet
*   **Internal ID:** `filingcabinet`
*   **Description:** "Metal cabinet made for storing documents in." (Strongly suggests it may only hold 'document' type items).
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $40
*   **Resell Value:** $20 (Calculated: $40 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** None listed (Suggests not bought directly from standard shops, maybe built or found?)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Description implies potentially restricted to documents.

**3. Safe**
*   **Item Name:** Safe
*   **Internal ID:** `safe`
*   **Description:** "A big metal safe to store all your fancy stuff in." (Implies secure storage, potentially for valuable items).
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $500
*   **Resell Value:** $250 (Calculated: $500 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** 4 (Available for purchase in furniture/storage shops)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Name/Description imply secure, likely general storage.

**4. Large Storage Rack**
*   **Item Name:** Large Storage Rack
*   **Internal ID:** `largestoragerack`
*   **Description:** "A large sized, 4-tier storage rack."
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $60
*   **Resell Value:** $30 (Calculated: $60 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** 4 (Available for purchase in furniture/storage shops)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Name/Description imply largest capacity of the racks, 4 tiers suggest multiple slots.

**5. Medium Storage Rack**
*   **Item Name:** Medium Storage Rack
*   **Internal ID:** `mediumstoragerack`
*   **Description:** "A medium sized, 4-tier storage rack."
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $45
*   **Resell Value:** $22.50 (Calculated: $45 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** 4 (Available for purchase in furniture/storage shops)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Name/Description imply medium capacity, 4 tiers suggest multiple slots.

**6. Small Storage Rack**
*   **Item Name:** Small Storage Rack
*   **Internal ID:** `smallstoragerack`
*   **Description:** "A small sized, 4-tier storage rack."
*   **Item Type:** Placeable Storage Furniture
*   **Base Purchase Price:** $30
*   **Resell Value:** $15 (Calculated: $30 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** 4 (Available for purchase in furniture/storage shops)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Name/Description imply smallest capacity of the racks, 4 tiers suggest multiple slots.

**7. Wall-Mounted Shelf**
*   **Item Name:** Wall-Mounted Shelf
*   **Internal ID:** `wallmountedshelf`
*   **Description:** "A 2-tier wall-mounted shelf which you can place items on." (Specifies wall placement, 2 tiers).
*   **Item Type:** Placeable Storage Furniture (Wall Mounted)
*   **Base Purchase Price:** $50
*   **Resell Value:** $25 (Calculated: $50 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Legal)
*   **Available In Demo:** Yes
*   **Shop Category:** 4 (Available for purchase in furniture/storage shops)
*   **Requires Level/Rank:** 0/0/0
*   **Storage Capacity:** *Unknown from these files.* Description implies 2 tiers, likely fewer slots than floor racks.

This extraction covers the purchase/acquisition details and general characteristics. The critical piece missing for a truly useful planner entry is the exact number of storage slots each provides once placed.
```

# supporting_data.md

```md
Okay, let's extract the requested data points from the provided files.

**I. NPC & Customer Preference Data:**

*(Note: `.json` files represent saved runtime data for specific instances, while `.asset` files define the base templates. We'll primarily use the `.asset` files for defining preferences and the `.cs` files for structure.)*

1.  **NPC Identification:**
    *   *(Data extracted for NPCs where CustomerData was provided)*
    *   **Beth:** ID: `beth`, Prefab GUID: `eb35e9b95c29714858de4fa4a7f9317f`
    *   **Billy:** ID: `billy`, Prefab GUID: `a0fa877bf63a1baafee19cf3a706b7bc`
    *   **Carl:** ID: `carl`, Prefab GUID: `7e6fa3bcb3a1941a83ed856707e9fd4d`
    *   **Chloe:** ID: `chloe`, Prefab GUID: `7777264e2c22987f284046e944733890`
    *   **Chris:** ID: `chris`, Prefab GUID: `29b26ef25a33b56c34afcc3843e68028`
    *   **Dennis:** ID: `dennis`, Prefab GUID: `ee8e867fb55940ca67c940743e6eb770`
    *   **Donna:** ID: `donna`, Prefab GUID: `a6989b5b0c37334fb350beb8e1c9ce2d`
    *   **Doris:** ID: `doris`, Prefab GUID: `b43904b3f7b27cb996e79a509bd89cd0`
    *   **Elizabeth:** ID: `elizabeth`, Prefab GUID: `520dc5caa2738d8ad1e81746f106e761`
    *   **Eugene:** ID: `eugene`, Prefab GUID: `5c065ff3a56d643bbdf3eb134704d6f2`
    *   **Fiona:** ID: `fiona`, Prefab GUID: `29f03c894d670e07cc97442ec3794738`
    *   **Genghis:** ID: `genghis`, Prefab GUID: `46c62c5bc31878ad70a95377779c85df`
    *   **Greg:** ID: `greg`, Prefab GUID: `54f49c411e4b7b844d7a09814140378f`
    *   **Harold:** ID: `harold`, Prefab GUID: `212719a3650501eebff36f5603c0d981`
    *   **Herbert:** ID: `herbert`, Prefab GUID: `2d7d73255fc8f1ab64e8dafe3816405a`
    *   **Jack:** ID: `jack`, Prefab GUID: `444c00641b42bc349649654a02669277`
    *   **Jennifer:** ID: `jennifer`, Prefab GUID: `c80bd24e5d8f50420f621efe71e41018`
    *   **Jeremy:** ID: `jeremy`, Prefab GUID: `b9e075379ef5d03d6ea2a57c784e4734`
    *   **Lisa:** ID: `lisa`, Prefab GUID: `f2f0b4b500e1ec268368f12e31150684`
    *   **Louis:** ID: `louis`, Prefab GUID: `e78e9b659b8e1e897494e1f21ff6db50`
    *   **Lucy:** ID: `lucy`, Prefab GUID: `f6780da2d0941cb02bb1868dabfb6586`
    *   **Ludwig:** ID: `ludwig`, Prefab GUID: `3b089557d29767d0eeffa38331c27880`
    *   **Mac:** ID: `mac`, Prefab GUID: `028f73fa468a0dd65610c6f3b12762f5`
    *   **Marco:** ID: `marco`, Prefab GUID: `3c7f98ce0cc25f9f2201f20932ee6516`
    *   **Meg:** ID: `meg`, Prefab GUID: `5bdf17d5bc9d2d3b0a712d9af1bd8e7c`
    *   **Melissa:** ID: `melissa`, Prefab GUID: `79f18bd7c0af05892065864b99d8e595`
    *   **Michael:** ID: `michael`, Prefab GUID: `c8a1a52905b523c225b241a05d151309`
    *   **Pearl:** ID: `pearl`, Prefab GUID: `da6168dd4a04fbc0bc6d502c8c0b5dcb`
    *   **Philip:** ID: `philip`, Prefab GUID: `d9c784d61f63a5c72e3c496f404253bc`
    *   **Sam:** ID: `sam`, Prefab GUID: `6263979d1634f3b8569c72ebe4ab34b9`
    *   **Tobias:** ID: `tobias`, Prefab GUID: `f40fd9599d421fd8f93e6e27aac1ae37` (Note: Asset name is "Tobas")
    *   **Walter:** ID: `walter`, Prefab GUID: `14ad6b6cdbe1fb33ffd6abf34bef655a`
    *   *(Note: Andy, Austin, Jessi, Joe, Kathy, Kyle, Mick, Doug data came from `.json` saves, representing runtime states, not base definitions. Their base `.asset` files are needed for static preferences.)*

2.  **Customer Component Link:** Confirmed by the presence of `Customer.cs` logic and `CustomerData.asset` files for the NPCs listed above.

3.  **Customer Data Asset Link:** Each NPC listed above has a corresponding `[NPCName]_CustomerData.asset` file linked via the `customerData` field in `Customer.cs`.

4.  **Drug Type Affinities:** Extracted from the `DefaultAffinityData` section within each `_CustomerData.asset` file. (Scores range -1 to 1).
    *   **Beth:** Marijuana: 0.30, Meth: 0.31, Cocaine: -0.20
    *   **Billy:** Marijuana: 0.09, Meth: -0.63, Cocaine: 0.57
    *   **Carl:** Marijuana: -0.81, Meth: -0.23, Cocaine: -0.58
    *   **Chloe:** Marijuana: 0.44, Meth: 0.79, Cocaine: 0.25
    *   **Chris:** Marijuana: -0.83, Meth: 0.40, Cocaine: 0.79
    *   **Dennis:** Marijuana: 0.26, Meth: 0.08, Cocaine: -0.89
    *   **Donna:** Marijuana: 0.93, Meth: -0.27, Cocaine: 0.25
    *   **Doris:** Marijuana: 0.46, Meth: 0.16, Cocaine: 0.58
    *   **Elizabeth:** Marijuana: 0.33, Meth: 0.45, Cocaine: 0.32
    *   **Eugene:** Marijuana: 0.66, Meth: 0.11, Cocaine: 0.17
    *   **Fiona:** Marijuana: 0.03, Meth: 0.08, Cocaine: -0.50
    *   **Genghis:** Marijuana: 0.85, Meth: -0.64, Cocaine: 0.45
    *   **Greg:** Marijuana: 0.58, Meth: -0.58, Cocaine: -0.35
    *   **Harold:** Marijuana: -0.95, Meth: -0.78, Cocaine: -0.70
    *   **Herbert:** Marijuana: 0.81, Meth: 0.39, Cocaine: 0.27
    *   **Jack:** Marijuana: 0.66, Meth: 0.88, Cocaine: 0.10
    *   **Jennifer:** Marijuana: -0.88, Meth: 0.42, Cocaine: 0.65
    *   **Jeremy:** Marijuana: 0.58, Meth: 0.53, Cocaine: 0.83
    *   **Lisa:** Marijuana: -0.82, Meth: -0.36, Cocaine: -0.28
    *   **Louis:** Marijuana: 0.94, Meth: -0.92, Cocaine: -0.30
    *   **Lucy:** Marijuana: 0.65, Meth: -0.79, Cocaine: 0.19
    *   **Ludwig:** Marijuana: 0.79, Meth: -0.59, Cocaine: -0.68
    *   **Mac:** Marijuana: -0.57, Meth: -0.38, Cocaine: 0.27
    *   **Marco:** Marijuana: 0.34, Meth: 0.08, Cocaine: 0.54
    *   **Meg:** Marijuana: 0.79, Meth: -0.04, Cocaine: 0.72
    *   **Melissa:** Marijuana: -0.26, Meth: 0.67, Cocaine: 0.42
    *   **Michael:** Marijuana: 0.17, Meth: 0.95, Cocaine: 0.70
    *   **Pearl:** Marijuana: 0.89, Meth: -0.89, Cocaine: 0.67
    *   **Philip:** Marijuana: 0.97, Meth: 0.78, Cocaine: -0.22
    *   **Sam:** Marijuana: -0.76, Meth: 0.30, Cocaine: -0.80
    *   **Tobias:** Marijuana: 0.19, Meth: 0.76, Cocaine: 0.17
    *   **Walter:** Marijuana: -0.14, Meth: -0.30, Cocaine: -0.44
    *   *(Note: Affinities for MDMA, Shrooms, Heroin are likely 0 or undefined for these customers based on the provided assets)*

5.  **Preferred Properties (Effects):** Extracted from the `PreferredProperties` list within each `_CustomerData.asset` file. Mapped GUIDs to Effect Names using the provided Effect `.asset` files.
    *   **Beth:** [Slippery (09cc...), Lethal (be6e...), Athletic (bc28...)]
    *   **Billy:** [Shrinking (c455...), Slippery (09cc...), Zombifying (b8e9...)]
    *   **Carl:** [Electrifying (8d45...), Toxic (b34c...), Energizing (8301...)]
    *   **Chloe:** [Euphoric (3f4f...), Lethal (be6e...), Munchies (10e4...)]
    *   **Chris:** [Spicy (4525...), Euphoric (3f4f...), Zombifying (b8e9...)]
    *   **Dennis:** [Toxic (b34c...), Refreshing (1f66...), Electrifying (8d45...)]
    *   **Donna:** [Energizing (8301...), Lethal (be6e...), Munchies (10e4...)]
    *   **Doris:** [Shrinking (c455...), Tropic Thunder (6b16...), Anti-gravity (4078...)]
    *   **Elizabeth:** [Focused (64df...), Tropic Thunder (6b16...), Gingeritis (255e...)]
    *   **Eugene:** [Slippery (09cc...), Gingeritis (255e...), Calming (ff88...)]
    *   **Fiona:** [Lethal (be6e...), Balding (8a18...), Tropic Thunder (6b16...)]
    *   **Genghis:** [Zombifying (b8e9...), Sneaky (51a9...), Toxic (b34c...)]
    *   **Greg:** [Euphoric (3f4f...), Tropic Thunder (6b16...), Gingeritis (255e...)]
    *   **Harold:** [Athletic (bc28...), Shrinking (c455...), Laxative (84e7...)]
    *   **Herbert:** [Jennerising (cbc0...), Athletic (bc28...), Zombifying (b8e9...)]
    *   **Jack:** [Lethal (be6e...), Balding (8a18...), Lethal (be6e...)] *(Duplicate Lethal listed)*
    *   **Jennifer:** [Lethal (be6e...), Jennerising (cbc0...), Gingeritis (255e...)]
    *   **Jeremy:** [Anti-gravity (4078...), Jennerising (cbc0...), Refreshing (1f66...)]
    *   **Lisa:** [Smelly (3280...), Slippery (09cc...), Bright-Eyed (9a1c...)]
    *   **Louis:** [Lethal (be6e...), Athletic (bc28...), Disorienting (f974...)]
    *   **Lucy:** [Refreshing (1f66...), Euphoric (3f4f...), Electrifying (8d45...)]
    *   **Ludwig:** [Euphoric (3f4f...), Energizing (8301...), Focused (64df...)]
    *   **Mac:** [Refreshing (1f66...), Shrinking (c455...), Zombifying (b8e9...)]
    *   **Marco:** [Spicy (4525...), Zombifying (b8e9...), Energizing (8301...)]
    *   **Meg:** [Spicy (4525...), Jennerising (cbc0...), Balding (8a18...)]
    *   **Melissa:** [Bright-Eyed (9a1c...), Energizing (8301...), Jennerising (cbc0...)]
    *   **Michael:** [Laxative (84e7...), Calming (ff88...), Slippery (09cc...)]
    *   **Pearl:** [Slippery (09cc...), Sneaky (51a9...), Zombifying (b8e9...)]
    *   **Philip:** [Energizing (8301...), Lethal (be6e...), Athletic (bc28...)]
    *   **Sam:** [Munchies (10e4...), Toxic (b34c...), Refreshing (1f66...)]
    *   **Tobias:** [Lethal (be6e...), Energizing (8301...), Shrinking (c455...)]
    *   **Walter:** [Slippery (09cc...), Calming (ff88...), Anti-gravity (4078...)]

6.  **Quality Standard:** Extracted from the `Standards` field within each `_CustomerData.asset` file.
    *   **Beth:** 1 (Low)
    *   **Billy:** 2 (Moderate)
    *   **Carl:** 3 (High)
    *   **Chloe:** 1 (Low)
    *   **Chris:** 3 (High)
    *   **Dennis:** 3 (High)
    *   **Donna:** 1 (Low)
    *   **Doris:** 1 (Low)
    *   **Elizabeth:** 2 (Moderate)
    *   **Eugene:** 2 (Moderate)
    *   **Fiona:** 3 (High)
    *   **Genghis:** 0 (Very Low)
    *   **Greg:** 0 (Very Low)
    *   **Harold:** 3 (High)
    *   **Herbert:** 3 (High)
    *   **Jack:** 3 (High)
    *   **Jennifer:** 2 (Moderate)
    *   **Jeremy:** 3 (High)
    *   **Lisa:** 2 (Moderate)
    *   **Louis:** 2 (Moderate)
    *   **Lucy:** 2 (Moderate)
    *   **Ludwig:** 1 (Low)
    *   **Mac:** 2 (Moderate)
    *   **Marco:** 2 (Moderate)
    *   **Meg:** 1 (Low)
    *   **Melissa:** 2 (Moderate)
    *   **Michael:** 3 (High)
    *   **Pearl:** 3 (High)
    *   **Philip:** 2 (Moderate)
    *   **Sam:** 1 (Low)
    *   **Tobias:** 3 (High)
    *   **Walter:** 3 (High)

7.  **Standard-to-Quality Mapping:** From `StandardsMethod.cs` (`GetCorrespondingQuality` logic):
    *   `ECustomerStandard.VeryLow` (0) -> `EQuality.Trash` (0)
    *   `ECustomerStandard.Low` (1) -> `EQuality.Poor` (1)
    *   `ECustomerStandard.Moderate` (2) -> `EQuality.Standard` (2)
    *   `ECustomerStandard.High` (3) -> `EQuality.Premium` (3)
    *   `ECustomerStandard.VeryHigh` (4) -> `EQuality.Heavenly` (4)

8.  **Addiction Level:** Dynamic value (`CurrentAddiction` in `Customer.cs`). Cannot be statically determined, must be tracked in-game or loaded from save (`.json` examples show this).

9.  **Base Addiction & Dependence:** Extracted from `BaseAddiction` and `DependenceMultiplier` fields within each `_CustomerData.asset` file.
    *   *(All listed customers have BaseAddiction: 0 and DependenceMultiplier: 1)*

**II. Product Data:**

10. **Product Definition Identification:**
    *   **OG Kush:** ID: `ogkush`, Name: "OG Kush", GUID: `40f2ab167b6d417499b6199a7698f25b` (from `OG Kush.asset.meta`, assuming it matches)
    *   **Sour Diesel:** ID: `sourdiesel`, Name: "Sour Diesel", GUID: (Need `.meta`)
    *   **Green Crack:** ID: `greencrack`, Name: "Green Crack", GUID: (Need `.meta`)
    *   **Granddaddy Purple:** ID: `granddaddypurple`, Name: "Granddaddy Purple", GUID: (Need `.meta`)
    *   **Cocaine:** ID: `cocaine`, Name: "Cocaine", GUID: `1db6143035543af4a859982b4df95e23` (from `Cocaine.asset.meta`)
    *   **Meth:** ID: `meth`, Name: "Meth", GUID: `52daaa62160de704fb4272934bfeca83` (from `Meth.asset.meta`)
    *   **Baby Blue:** ID: `babyblue`, Name: "Baby Blue", GUID: (Need `.meta`)
    *   **Biker Crank:** ID: `bikercrank`, Name: "Biker Crank", GUID: (Need `.meta`)
    *   **Glass:** ID: `glass`, Name: "Glass", GUID: (Need `.meta`)
    *   **Test Weed:** ID: `testweed`, Name: "Test Weed", GUID: (Need `.meta`)
    *   **DefaultWeed:** ID: `defaultweed`, Name: "OG Kush", GUID: `40f2ab167b6d417499b6199a7698f25b` (from `DefaultWeed.asset.meta`)

11. **Product Drug Types:**
    *   **OG Kush, Sour Diesel, Green Crack, Granddaddy Purple, Test Weed, DefaultWeed:** Marijuana (0)
    *   **Cocaine:** Cocaine (2)
    *   **Meth, Baby Blue, Biker Crank, Glass:** Methamphetamine (1)

12. **Product Base Properties (Effects):**
    *   **OG Kush:** [Calming (ff88...)]
    *   **Sour Diesel:** [Refreshing (1f66...)]
    *   **Green Crack:** [Energizing (8301...)]
    *   **Granddaddy Purple:** [Sedating (cee3...)]
    *   **Test Weed:** [Shrinking (c455...), Thought-Provoking (dab9...)]
    *   **Cocaine, Meth, Baby Blue, Biker Crank, Glass, DefaultWeed:** None

13. **Product Base Market Value:**
    *   **OG Kush:** 38
    *   **Sour Diesel:** 40
    *   **Green Crack:** 43
    *   **Granddaddy Purple:** 44
    *   **Cocaine:** 150
    *   **Meth:** 70
    *   **Baby Blue:** 1
    *   **Biker Crank:** 1
    *   **Glass:** 1
    *   **Test Weed:** 71
    *   **DefaultWeed:** 35

14. **Product Base Addictiveness:**
    *   **OG Kush, Sour Diesel, Green Crack, Granddaddy Purple, Baby Blue, Biker Crank, Glass, Test Weed:** 0
    *   **Cocaine:** 0.4
    *   **Meth:** 0.6
    *   **DefaultWeed:** 0.05

15. **Product Instance Quality:** Dynamic value (`EQuality` enum) stored on the `ProductItemInstance`.

**III. Effect (Property) Data:**

*(Details extracted from individual Effect `.asset` files)*

16. **Effect Identification:** (Name, ID, GUID - GUIDs extracted from `.asset` files match those referenced)
17. **Effect Tier:** (1-5, as listed in files)
18. **Effect Addictiveness Contribution:** (Float 0-1, as listed in files)
19. **Effect Value Modifier:** (`AddBaseValueMultiple` float -1 to 1, as listed in files)
20. **Effect Mix Vectors:** (`MixDirection` Vector2, `MixMagnitude` float, as listed in files)

**IV. Ingredient/Additive Data:**

21. **Ingredient Identification:** (Name, ID, GUID - From previous dump and confirmed structure)
22. **Property Added by Ingredient:** (GUID link in the ingredient's `Properties` list - From previous dump and confirmed structure)

**V. Quality System Data:**

23. **Quality Enum Definition:** From `EQuality.cs`:
    *   `Trash` = 0
    *   `Poor` = 1
    *   `Standard` = 2
    *   `Premium` = 3
    *   `Heavenly` = 4
24. **Quality Thresholds:** From `ItemQuality.cs`:
    *   `Heavenly`: >= 0.9f
    *   `Premium`: >= 0.75f
    *   `Standard`: >= 0.4f
    *   `Poor`: >= 0.25f
    *   `Trash`: < 0.25f

**VI. Mixing System Data:**

25. **Maximum Properties:** From `PropertyMixCalculator.cs`: `MAX_PROPERTIES` = 8.
26. **Mixing Algorithm Structure:** From `PropertyMixCalculator.cs` description: Combine properties, calculate weighted center point using `MixDirection` and `MixMagnitude`, look up resulting property in the relevant `MixerMap` based on the center point's location, potentially remove/replace properties if `MAX_PROPERTIES` is exceeded.
27. **Mixer Map Structure:** From `MixerMap.cs` and `MixerMapEffect.cs`: A `MixerMap` asset contains a `MapRadius` and a list of `MixerMapEffect`s. Each `MixerMapEffect` defines a circular area (`Position`, `Radius`) and the resulting `Property` (Effect GUID) if the calculated center point falls within that area.
28. **Weed Mixer Map Data:** Extracted from `Weed Map.asset`:
    *   `MapRadius`: 4
    *   `Effects`: (List of 34 effects with Position, Radius, and Property GUID - *See Weed Map.asset content above for the full list*)

This extraction provides almost all the necessary static data. The key remaining pieces are the Quality Value Multiplier logic and the Meth/Coke Mixer Map data.
```

# tools.md

```md
**Extracted Player-Relevant Data from Tool Assets:**

**1. Electric Plant Trimmers**
*   **Item Name:** Electric Plant Trimmers
*   **Internal ID:** `electrictrimmers`
*   **Description:** "A pair of electric plant trimmers. Simply click and drag to harvest." (Explains usage)
*   **Function:** Harvesting plants (faster/easier method inferred).
*   **Purchase Price:** $50
*   **Resell Value:** $25 (Calculated: $50 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** 3 (Tools)
*   **Requires Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 5
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes
*   **Tool Category (Internal):** 3

**2. Flashlight**
*   **Item Name:** Flashlight
*   **Internal ID:** `flashlight`
*   **Description:** "A small handheld flashlight used for illuminating stuff."
*   **Function:** Provides light.
*   **Purchase Price:** $15
*   **Resell Value:** $7.5 (Calculated: $15 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** 3 (Tools)
*   **Keywords (for searching):** light, torch, flash, bright, shine
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes
*   **Tool Category (Internal):** 3

**3. Management Clipboard**
*   **Item Name:** Management Clipboard
*   **Internal ID:** `managementclipboard`
*   **Description:** "Clipboard used to manage equipment and employees."
*   **Function:** Managing equipment and employees (likely opens a specific UI).
*   **Purchase Price:** $10
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** None listed (May be obtained differently, e.g., quest reward or starting item)
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** No (Value: 0)
*   **Equippable:** Yes
*   **Tool Category (Internal):** 3

**4. Trash Bag**
*   **Item Name:** Trash Bag
*   **Internal ID:** `trashbag`
*   **Description:** "Can be used to either gather up trash or to bag the contents of a trash can."
*   **Function:** Trash collection/disposal.
*   **Purchase Price:** $1
*   **Resell Value:** $0.5 (Calculated: $1 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10 (Consumable/Stackable unlike most tools)
*   **Shop Category:** 3 (Tools)
*   **Keywords (for searching):** garbage, bin
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes
*   **Tool Category (Internal):** 3

**5. Trash Grabber**
*   **Item Name:** Trash Grabber
*   **Internal ID:** `trashgrabber`
*   **Description:** "Used to easily collect trash."
*   **Function:** Easier trash collection (potentially longer reach or cleaner?).
*   **Purchase Price:** $20
*   **Resell Value:** $10 (Calculated: $20 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** 3 (Tools)
*   **Keywords (for searching):** garbage, trash, picker
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes (Has custom UI elements)
*   **Tool Category (Internal):** 3

**6. Plant Trimmers**
*   **Item Name:** Plant Trimmers
*   **Internal ID:** `trimmers`
*   **Description:** "A pair of plant trimmers. Necessity for harvesting plants."
*   **Function:** Basic plant harvesting (required).
*   **Purchase Price:** $10
*   **Resell Value:** $5 (Calculated: $10 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** 3 (Tools)
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes
*   **Tool Category (Internal):** 3

**7. Watering Can**
*   **Item Name:** Watering Can
*   **Internal ID:** `wateringcan`
*   **Description:** "Holds water."
*   **Function:** Watering plants.
*   **Purchase Price:** $15
*   **Resell Value:** $7.5 (Calculated: $15 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 1
*   **Shop Category:** 3 (Tools)
*   **Requires Level to Purchase:** 0
*   **Required Rank to Purchase:** Rank 0, Tier 0
*   **Legality Status:** 0 (Legal/Unrestricted)
*   **Available In Demo:** Yes (Value: 1)
*   **Equippable:** Yes (Has custom UI elements, likely water level)
*   **Tool Category (Internal):** 3

This covers the essential tools, their functions, costs, and unlock requirements relevant for a player planning their progression and spending.
```

# utilities.md

```md
**Analysis Notes:**

*   **Item Types:** This dump contains assets for Sprinklers (Big and Pot/Small), a Soil Pourer, and icons for a Dumpster, Power Line, and Small Power Tower. We only have full data for the Sprinklers and Soil Pourer from this dump.
*   **Functionality:** The descriptions clearly state what these items do (water plants, add soil).
*   **Placement:** These seem to be placeable items (`BuiltItem` field exists, though the link is internal).
*   **Shop Categories:** Category 2 seems to be Seeds/Growing Supplies, Category 3 might be general Hardware/Tools. Category 8 is likely "Utilities" or "Placeables".

**Extracted Player-Relevant Data from Utility Assets:**

*(Ignoring *_Icon.asset data, GUIDs, prefab/item links, sound types, etc.)*

**1. Big Sprinkler**
*   **Item Name:** Big Sprinkler
*   **Internal ID:** `bigsprinkler`
*   **Description:** "When activated, will water up to 8 surrounding plants. Plants must be directly next to or diagonal from the sprinkler." (Clarifies 3x3 area minus center)
*   **Keywords:** `water`, `watering`
*   **Base Purchase Price:** $600
*   **Resell Value:** $300 (Calculated: $600 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 5
*   **Available In Demo:** No
*   **Shop Categories:** 2, 3 (Available in Seed/Grow shop and Hardware/Tool shop)
*   **Item Category (Internal):** 8 (Utility/Placeable)
*   **Label Display Color:** White

**2. Soil Pourer**
*   **Item Name:** Soil Pourer
*   **Internal ID:** `soilpourer`
*   **Description:** "When activated, will fill the adjacent pot or grow tent with soil." (Specifies adjacent target)
*   **Keywords:** `soil`, `dirt`, `plant`, `dispenser`
*   **Base Purchase Price:** $300
*   **Resell Value:** $150 (Calculated: $300 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 1, Tier 2
*   **Available In Demo:** Yes
*   **Shop Categories:** 2, 3 (Available in Seed/Grow shop and Hardware/Tool shop)
*   **Item Category (Internal):** 8 (Utility/Placeable)
*   **Label Display Color:** White

**3. Pot Sprinkler (Regular Sprinkler)**
*   **Item Name:** Pot Sprinkler
*   **Internal ID:** `potsprinkler`
*   **Description:** "When activated, will water the adjacent pot or grow tent." (Specifies adjacent target)
*   **Keywords:** `water`, `watering`
*   **Base Purchase Price:** $200
*   **Resell Value:** $100 (Calculated: $200 * 0.5)
*   **Resell Multiplier:** 0.5
*   **Stack Limit (Inventory):** 10
*   **Legality Status:** 0 (Likely Legal)
*   **Required Player Level to Purchase:** 1
*   **Required Rank to Purchase:** Rank 0, Tier 5
*   **Available In Demo:** Yes
*   **Shop Categories:** 2, 3 (Available in Seed/Grow shop and Hardware/Tool shop)
*   **Item Category (Internal):** 8 (Utility/Placeable)
*   **Label Display Color:** White

**Missing Data:**

*   The assets for `Dumpster`, `PowerLine`, and `SmallPowerTower` are needed to extract their details (Price, Description, Requirements etc.). Only their Icon assets were included in this dump.

This data provides costs, unlock requirements, and functional descriptions for key automation/utility items in the game, crucial for planning farm layouts and expenses.
```

