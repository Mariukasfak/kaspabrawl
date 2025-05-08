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
        log: JSON.stringify(fightResult.steps)
      }
    });

    // Return the fight result
    return res.status(200).json({
      fightLogId: fightLog.id,
      log: fightResult.steps
    });
  } catch (error) {
    console.error('Error in fight execution:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
