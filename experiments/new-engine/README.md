# KASPABRAWL Experimental New Engine

This directory contains experimental code for developing a new game engine for KASPABRAWL. The new engine focuses on:

1. **Entity Component System (ECS)** - A modern architecture for game development
2. **KASPA Blockchain Integration** - Native support for NFTs, transactions and on-chain stats
3. **MyBrute-style Gameplay** - Enhanced turn-based combat with improved mechanics

## Directory Structure

- `/src/core` - Core ECS implementation (entity, component, system, world)
- `/src/components` - Component definitions (stats, abilities, blockchain, etc.)
- `/src/systems` - Game systems (combat, movement, blockchain integration)
- `/src/types` - TypeScript types and interfaces
- `/src/ui` - User interface components for the new engine
- `/src/web3` - Blockchain integration utilities
- `/assets` - Game assets for the new engine
- `/docs` - Documentation
- `/public` - Static files for web serving

## Development

This is a work in progress. Do not merge to main branch until stable.

```
cd /workspaces/kaspabrawl/experiments/new-engine
npm install
npm run dev
```
