import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { FightRequest, FightResponse } from '../../types';
import { simulateFight } from '../../utils/simulateFight';

/**
 * API route for executing a fight between two players
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FightResponse | { error: string }>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const { playerA, playerB } = req.body as FightRequest;

    if (!playerA || !playerB) {
      return res.status(400).json({ error: 'Both player IDs are required' });
    }

    // Check if players exist
    let playerAUser = await prisma.user.findFirst({
      where: { address: playerA }
    });
    
    let playerBUser = await prisma.user.findFirst({
      where: { address: playerB }
    });

    // Create users if they don't exist (for guests or new addresses)
    if (!playerAUser) {
      playerAUser = await prisma.user.create({
        data: {
          address: playerA
        }
      });
    }

    if (!playerBUser) {
      playerBUser = await prisma.user.create({
        data: {
          address: playerB
        }
      });
    }

    // Simulate the fight
    const fightResult = await simulateFight(playerAUser.id, playerBUser.id);

    // Create a new fight log in the database
    const fightLog = await prisma.fightLog.create({
      data: {
        playerA: { connect: { id: playerAUser.id } },
        playerB: { connect: { id: playerBUser.id } },
        log: JSON.stringify(fightResult.steps),
        progressionData: fightResult.progression ? JSON.stringify(fightResult.progression) : null
      }
    });
    
    // Update player progression data in the database
    if (fightResult.progression) {
      // Update winner progression
      const winnerData = fightResult.progression.winner;
      const winnerId = fightResult.winner;
      
      // Check if FighterData already exists for the winner
      const existingWinnerData = await prisma.fighterData.findUnique({
        where: { userId: winnerId }
      });
      
      if (existingWinnerData) {
        // Update existing fighter data
        await prisma.fighterData.update({
          where: { userId: winnerId },
          data: {
            level: winnerData.leveledUp ? (winnerData.newLevel || existingWinnerData.level + 1) : existingWinnerData.level,
            experience: existingWinnerData.experience + winnerData.xpGained,
            // Add 3 unallocated stat points if leveled up
            unallocatedStatPoints: winnerData.leveledUp ? 
              existingWinnerData.unallocatedStatPoints + 3 : 
              existingWinnerData.unallocatedStatPoints
          }
        });
      } else {
        // Create new fighter data
        await prisma.fighterData.create({
          data: {
            user: { connect: { id: winnerId } },
            level: winnerData.leveledUp ? (winnerData.newLevel || 2) : 1,
            experience: winnerData.xpGained,
            unallocatedStatPoints: winnerData.leveledUp ? 3 : 0
          }
        });
      }
      
      // Update loser progression
      const loserData = fightResult.progression.loser;
      const loserId = fightResult.loser;
      
      // Check if FighterData already exists for the loser
      const existingLoserData = await prisma.fighterData.findUnique({
        where: { userId: loserId }
      });
      
      if (existingLoserData) {
        // Update existing fighter data
        await prisma.fighterData.update({
          where: { userId: loserId },
          data: {
            level: loserData.leveledUp ? (loserData.newLevel || existingLoserData.level + 1) : existingLoserData.level,
            experience: existingLoserData.experience + loserData.xpGained,
            // Add 3 unallocated stat points if leveled up
            unallocatedStatPoints: loserData.leveledUp ? 
              existingLoserData.unallocatedStatPoints + 3 : 
              existingLoserData.unallocatedStatPoints
          }
        });
      } else {
        // Create new fighter data
        await prisma.fighterData.create({
          data: {
            user: { connect: { id: loserId } },
            level: loserData.leveledUp ? (loserData.newLevel || 2) : 1,
            experience: loserData.xpGained,
            unallocatedStatPoints: loserData.leveledUp ? 3 : 0
          }
        });
      }
    }

    // Return the fight result with progression data
    return res.status(200).json({
      fightLogId: fightLog.id,
      log: fightResult.steps,
      progression: fightResult.progression
    });
  } catch (error) {
    console.error('Error in fight execution:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
