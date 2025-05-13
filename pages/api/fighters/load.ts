/**
 * API endpoint for loading fighter data from the database
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { Fighter } from '../../../types/fighter';

type ResponseData = {
  fighter?: Fighter;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get wallet address from query parameters
    const { walletAddress } = req.query;

    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid wallet address' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find the fighter in the database
    const fighter = await db.collection('fighters').findOne({ walletAddress });
    
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found' });
    }
    
    // Remove MongoDB _id field before sending response
    const { _id, ...fighterData } = fighter;
    
    return res.status(200).json({ fighter: fighterData as Fighter });
  } catch (error) {
    console.error('Fighter load error:', error);
    return res.status(500).json({ error: 'Failed to load fighter data' });
  }
}
