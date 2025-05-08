import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { FightLogListItem } from '../../types/index';

/**
 * API route for retrieving recent fight logs
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FightLogListItem[] | { error: string }>
) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get limit parameter (default to 5)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    // Get the most recent fight logs
    const fightLogs = await prisma.fightLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        playerA: {
          select: {
            id: true,
            address: true
          }
        },
        playerB: {
          select: {
            id: true,
            address: true
          }
        },
        log: true,
        createdAt: true
      }
    });

    // Process the logs to determine the winner
    const processedLogs = fightLogs.map(log => {
      // Parse the log to find the winner
      const logSteps = JSON.parse(log.log);
      const endStep = logSteps.find((step: { type: string }) => step.type === 'end');
      
      let winnerId = '';
      if (endStep) {
        // The attacker in the end step is the winner
        winnerId = endStep.attacker;
      }

      return {
        id: log.id,
        playerA: log.playerA,
        playerB: log.playerB,
        winner: winnerId,
        createdAt: log.createdAt.toISOString()
      };
    });

    return res.status(200).json(processedLogs);
  } catch (error) {
    console.error('Error retrieving fight logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
