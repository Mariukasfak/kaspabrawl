/**
 * API endpoint for saving fighter data to the database
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
    
    // Update fighter data in database
    await db.collection('fighters').updateOne(
      { walletAddress },
      { 
        $set: { 
          ...fighter,
          updatedAt: new Date()
        } 
      },
      { upsert: false }
    );
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Fighter save error:', error);
    return res.status(500).json({ error: 'Failed to save fighter data' });
  }
}
