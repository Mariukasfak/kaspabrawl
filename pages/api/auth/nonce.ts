import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce, cleanupExpiredNonces } from '../../../lib/auth';

type NonceResponse = {
  nonce: string;
};

type ErrorResponse = {
  error: string;
};

/**
 * API endpoint to generate a random nonce for wallet signing
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NonceResponse | ErrorResponse>
) {
  try {
    if (req.method !== 'GET') {
      res.status(405).end(); // Method Not Allowed
      return;
    }

    // Optional: Get address from query params for associating with nonce
    const address = req.query.address as string | undefined;

    // Clean up expired nonces occasionally to keep the DB clean
    // Using a 10% chance to avoid doing this on every request
    if (Math.random() < 0.1) {
      await cleanupExpiredNonces()
        .catch(err => console.error('Error cleaning up expired nonces:', err));
    }

    // Generate a nonce and store it in the database
    const nonce = await generateNonce(address);
    
    console.log(`Generated nonce: ${nonce.slice(0, 10)}... for ${address || 'unknown'}`);
    
    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
}
