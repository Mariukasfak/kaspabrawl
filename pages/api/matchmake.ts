import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { MatchmakeRequest, MatchmakeResponse } from '../../types/index';

/**
 * API route for matchmaking 
 * 
 * This is a stateless stub implementation that randomly
 * matches the player with another registered user or a guest
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchmakeResponse | { error: string }>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const { player } = req.body as MatchmakeRequest;

    if (!player) {
      return res.status(400).json({ error: 'Player ID or address is required' });
    }

    // Suraskime oponentų skaičių, kad galėtume atlikti atsitiktinį pasirinkimą
    const opponentCount = await prisma.user.count({
      where: {
        address: {
          not: player // Don't match with self
        }
      }
    });

    let randomOpponent = null;

    if (opponentCount > 0) {
      // Jei turime potencialių oponentų, atsitiktinai pasirinkime vieną
      // Naudojame SKIP, kad atsitiktinai pasirinktume vieną įrašą
      const skip = Math.floor(Math.random() * opponentCount);
      
      randomOpponent = await prisma.user.findFirst({
        where: {
          address: {
            not: player // Don't match with self
          }
        },
        skip: skip,
        take: 1
      });
    }

    // If no opponent found, create a guest opponent
    if (!randomOpponent) {
      // Generate a random guest ID
      const guestId = `guest-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create guest user in database so it can be referenced in fights
      const guestUser = await prisma.user.create({
        data: {
          address: guestId
        }
      });

      // Return the guest opponent
      return res.status(200).json({
        opponent: guestUser.address
      });
    }

    // Return the opponent ID
    return res.status(200).json({
      opponent: randomOpponent.address
    });
  } catch (error) {
    console.error('Error in matchmaking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
