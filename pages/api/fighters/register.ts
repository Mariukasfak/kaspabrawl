/**
 * API endpoint for registering a new fighter with a wallet address
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { Fighter } from '../../../types/fighter';

type RequestData = {
  fighter: Fighter;
  walletAddress: string;
};

type ResponseData = {
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fighter, walletAddress } = req.body as RequestData;

    // Validate required fields
    if (!fighter || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if wallet already has a fighter
    const existingFighter = await db.collection('fighters').findOne({ walletAddress });
    
    if (existingFighter) {
      return res.status(400).json({ error: 'Wallet already has a registered fighter' });
    }
    
    // Add the wallet address and timestamps to the fighter
    const fighterWithMetadata = {
      ...fighter,
      walletAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the fighter into the database
    await db.collection('fighters').insertOne(fighterWithMetadata);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Fighter registration error:', error);
    return res.status(500).json({ error: 'Failed to register fighter' });
  }
}
