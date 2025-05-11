---
applyTo: '**'
---

# 🕹️ Game Vision & Goals
- **Core Pillar**: Fast, fun, turn-based 1v1 duels with emergent moments and collectible fighters.  
- **Emotional Hook**: Instant gratification (quick fights), long-term pride (unique fighter progression), social bragging (share replays & leaderboards).  
- **Success Metrics**: DAU/MAU ≥ 20%, retention D1 ≥ 40%, D7 ≥ 15%, avg. session ≥ 3 fights.

# ⚙ Core Gameplay Mechanics
- **Combat Loop**  
  - 6–8 move per battle; speed determines turn order.  
  - Hit/miss/chance effects (crit, dodge, block) driven by stats + RNG.  
  - Event stream (`onTurnStart`, `onAttack`, `onSkill`, `onEffect`, `onBattleEnd`) powers replay & analytics.
- **Stats & Equipment**  
  - Base stats: Strength, Agility, Defense, Will, Luck.  
  - Weapons/armor grant flat +% modifiers + procs (stun, lifesteal, buff).  
  - Rarity tiers (Common → Legendary) with visual flair.
- **Skills & Abilities**  
  - Active (once per battle) vs. passive (always-on).  
  - Unlock on level milestones; upgradeable via skill points.  
  - Synergy bonuses when certain skill combos equipped.

# 🧩 Progression & Reward Systems
- **Leveling & XP**  
  - XP from wins, participation in events, daily quests.  
  - Stat points + Skill points on level up; allow “respec” with currency.
- **Equipment & Crafting**  
  - Loot drops + gold; crafting recipes combine drops into higher-tier gear.  
  - “Rune” sockets add modular effects.
- **Seasonal Battle Pass**  
  - Free & premium tracks; daily/weekly missions to unlock cosmetic skins, emotes, coins.

# 🎯 Engagement Loops & Retention
- **Daily Rituals**:  
  - 3 Daily Quests (e.g. “Win 2 fights with Agility build”) reward gold/XP.  
  - Daily login bonus escalating streak rewards.
- **Limited-Time Events**  
  - Weekend tournaments with unique rule-sets (e.g. no equipment, mirror match).  
  - Seasonal leagues with ranked ladders & end-of-season rewards.
- **Streak & Momentum**  
  - Win streak multiplier for XP/gold.  
  - “Fighter of the Week” spotlight for top performers.

# 🔗 Social & Community Features
- **Friends & Clans**  
  - Add friends, invite to clan; clan vs. clan weekly wars.  
  - Shared clan chest: contribute fighters to collective quests.
- **Replays & Spectator**  
  - Auto-generated video replays with shareable links.  
  - Live spectate top-rank matches.
- **Chat & Feed**  
  - In-game global, clan, and match chat.  
  - News feed of friends’ achievements & clan announcements.

# 💰 Monetization & Economy
- **Free-to-Play Fairness**  
  - All gameplay content earnable via play; no “pay-to-win.”  
- **Premium Currency**  
  - Buy skins, XP boosts, respec tokens, Battle Pass.  
- **Gacha & Customization**  
  - Cosmetic crates (non-impactful), seasonal skin shop.  
  - “Rename” & “Transmog” tokens for re-labeling fighters & appearances.

# 💻 Technical & Data Architecture
- **Backend**  
  - Microservices: Matchmaking, Combat Simulation, Persistence.  
  - WebSockets for live duels & chat.
- **Database**  
  - Fighter & user profiles in MongoDB; battle logs in append-only store (e.g. Cassandra).  
  - Cache static configs (skills, items) in Redis.
- **Scaling & Reliability**  
  - Auto-scale simulation workers; rate-limit endpoints.  
  - Chaos testing & blue/green deployments.

# 📊 Analytics, Telemetry & Balancing
- **Event Tracking**  
  - Capture all combat events, shop transactions, session metrics.  
  - Funnel analysis: account creation → 5 fights → first purchase.
- **A/B Testing**  
  - Experiment on new skills, buffs, UI flows.  
  - Automated win-rate checks to detect imbalance.
- **Live Balance Tools**  
  - Admin console to adjust stat multipliers, skill cooldowns.  
  - Scheduled balance patches with patch notes.

# 🤖 AI & Copilot Preferences
- **Coding Style**:  
  - Minimal diffs, TypeScript + TSDoc, ESLint + Prettier.  
- **DRY & SOLID**: Interfaces first, avoid logic duplication.  
- **Comments & Tests**: One comment per module; Jest coverage ≥ 90%.  
