# KaspaBrawl

A MyBrute-style fighting game powered by the Kaspa blockchain, offering fast-paced 1v1 duels with collectible NFT fighters.

## Features

- **Turn-based Combat:** Strategic fighting mechanics inspired by MyBrute's classic gameplay
- **KASPA Blockchain Integration:** True ownership of fighters and items as NFTs on the KASPA blockchain
- **Collectible Fighters:** Discover and train unique fighters with special abilities
- **Equipment & Crafting:** Find rare weapons and armor to enhance your fighters
- **Social Features:** Battle friends, join clans, and climb the leaderboards
- **Play-to-Earn:** Win battles to earn KAS tokens and rare equipment

## Game Mechanics

- **Combat System:** 6-8 moves per battle with speed determining turn order
- **Stats System:** Strength, Agility, Defense, Will, and Luck attributes
- **Special Abilities:** Active (once per battle) and passive (always-on) abilities
- **Progression:** Level up fighters to unlock new abilities and gain stat points
- **Fighter Classes:** Three distinct classes - Fighter (melee), Ranged (archer), and Mage
- **Visual Progression:** Fighter sprites change appearance at key level thresholds (1, 5, 10, 15, 95, 100)

## Project Structure

```
kaspabrawl/
├── components/        # Reusable React components
│   ├── battle/        # Battle-related components
│   ├── fighter/       # Fighter profile components
│   ├── layout/        # Layout components
│   └── ui/            # Basic UI components
├── experiments/       # Experimental features
│   └── new-engine/    # New game engine with ECS architecture
├── hooks/             # Custom React hooks
├── lib/               # Auth and database utilities
├── pages/             # Next.js pages and routes
│   └── api/           # API endpoints
├── prisma/            # Database schema and migrations
├── public/            # Static assets
│   └── assets/        # Images, icons and game assets
│      ├── backgrounds/# Arena and game backgrounds
│      ├── fighters/   # Fighter sprites and animations
│      ├── equipment/  # Weapons and armor images
│      └── ui/         # UI elements and icons
├── styles/            # CSS and styling
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## KASPA Blockchain Integration

KaspaBrawl integrates with the KASPA blockchain through the following features:

1. **Wallet Connection**: Connect your KASPA wallet to the game
2. **NFT Fighters**: Each fighter is minted as an NFT on the KASPA blockchain
3. **On-chain Battle Records**: Battle results are recorded on-chain for transparency
4. **KAS Rewards**: Earn KAS tokens by winning battles and tournaments

## Development Roadmap

- [x] Basic battle mechanics
- [x] Fighter profiles and stats
- [x] Initial KASPA wallet integration
- [ ] NFT minting for fighters
- [ ] Equipment crafting system
- [ ] Clan system
- [ ] Tournament system
- [ ] Advanced battle mechanics
- [ ] Mobile-responsive UI

## License

This project is licensed under the ISC License - see the LICENSE file for details.
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Core Features

- Fighter creation and management
- Battle system with special moves
- Kaspa blockchain wallet integration
- PvP matchmaking system
