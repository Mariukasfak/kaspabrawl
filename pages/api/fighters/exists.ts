/**
 * API endpoint for checking if a fighter exists for a wallet address
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

type ResponseData = {
  exists: boolean;
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
      return res.status(400).json({ error: 'Missing or invalid wallet address', exists: false });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if fighter exists in the database
    const fighter = await db.collection('fighters').findOne(
      { walletAddress }, 
      { projection: { _id: 1 } }
    );
    
    // Return whether fighter exists
    return res.status(200).json({ exists: !!fighter });
  } catch (error) {
    console.error('Fighter exists check error:', error);
    return res.status(500).json({ error: 'Failed to check fighter existence', exists: false });
  }
}
