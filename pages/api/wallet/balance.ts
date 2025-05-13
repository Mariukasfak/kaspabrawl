/**
 * API endpoint for getting a wallet balance
 */
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  address?: string;
  balance: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', balance: 0 });
  }

  try {
    // Get wallet address from query parameters
    const { address } = req.query;

    // Validate address
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid address', balance: 0 });
    }

    // In a real implementation, this would make an API call to the Kaspa blockchain
    // For now, we'll simulate a balance with a random value
    const simulatedBalance = Math.floor(Math.random() * 10000) / 100;
    
    return res.status(200).json({
      address,
      balance: simulatedBalance
    });
  } catch (error) {
    console.error('Wallet balance error:', error);
    return res.status(500).json({ error: 'Failed to get wallet balance', balance: 0 });
  }
}
