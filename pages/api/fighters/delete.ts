/**
 * API endpoint for deleting a fighter from the database
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

type RequestData = {
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
  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body as RequestData;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({ error: 'Missing wallet address' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Delete fighter from database
    const result = await db.collection('fighters').deleteOne({ walletAddress });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Fighter not found' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Fighter deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete fighter' });
  }
}
