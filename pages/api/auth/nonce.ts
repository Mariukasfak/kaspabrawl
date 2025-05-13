import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce, cleanupExpiredNonces } from '../../../lib/auth';

type NonceResponse = {
  nonce: string;
  expiresIn?: number;
  debug?: any;
};

type ErrorResponse = {
  error: string;
  details?: any;
};

/**
 * API endpoint to generate a random nonce for wallet signing
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NonceResponse | ErrorResponse>
) {
  // Log detailed request information for debugging
  console.log('Nonce request received');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers));
  console.log('Request query:', JSON.stringify(req.query));
  
  try {
    if (req.method !== 'GET') {
      console.warn(`Invalid request method: ${req.method}`);
      res.status(405).json({ error: 'Method not allowed. Use GET' }); // Method Not Allowed
      return;
    }

    // Optional: Get address from query params for associating with nonce
    const address = req.query.address as string | undefined;
    console.log(`Generating nonce for address: ${address || 'not provided'}`);

    // Clean up expired nonces occasionally to keep the DB clean
    // Using a 10% chance to avoid doing this on every request
    if (Math.random() < 0.1) {
      console.log('Cleaning up expired nonces');
      await cleanupExpiredNonces()
        .catch(err => console.error('Error cleaning up expired nonces:', err));
    }

    // Generate a nonce and store it in the database
    const nonce = await generateNonce(address);
    
    console.log(`Generated nonce: ${nonce.slice(0, 10)}... for ${address || 'unknown'}`);
    
    // Include expiration time for client information
    const response: NonceResponse = {
      nonce,
      expiresIn: 10 * 60 // 10 minutes in seconds
    };
    
    // In development mode, include debugging information
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        time: new Date().toISOString(),
        addressProvided: !!address,
        nonceLength: nonce.length
      };
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating nonce:', error);
    const errorResponse: ErrorResponse = { 
      error: 'Failed to generate nonce'
    };
    
    // Include more details in development mode
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : { raw: String(error) };
    }
    
    res.status(500).json(errorResponse);
  }
}
