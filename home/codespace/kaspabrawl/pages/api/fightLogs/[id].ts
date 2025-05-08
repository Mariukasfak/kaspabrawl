import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { FightLogResponse } from '../../../types/index';

/**
 * API route for retrieving a specific fight log
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FightLogResponse | { error: string }>
) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the fight log ID from the request
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Fight log ID is required' });
    }

    // Find the fight log in the database
    const fightLog = await prisma.fightLog.findUnique({
      where: { id },
      include: {
        playerA: true,
        playerB: true
      }
    });

    if (!fightLog) {
      return res.status(404).json({ error: 'Fight log not found' });
    }

    // Parse the log
    const parsedLog = JSON.parse(fightLog.log);

    // Return the fight log
    return res.status(200).json({
      id: fightLog.id,
      playerA: {
        id: fightLog.playerA.id,
        address: fightLog.playerA.address
      },
      playerB: {
        id: fightLog.playerB.id,
        address: fightLog.playerB.address
      },
      log: parsedLog,
      createdAt: fightLog.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error retrieving fight log:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
