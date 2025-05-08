import type { NextApiRequest, NextApiResponse } from 'next';
import { createToken, verifySignature, getOrCreateUser, getNonce } from '../../../lib/auth';

type VerifyRequest = {
  nonce: string;
  signature: string;
  publicKey: string;
  address: string;
};

type VerifyResponse = {
  token: string;
  address: string;
  balance?: string;
};

/**
 * API endpoint to verify a signed nonce and issue a JWT
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  try {
    // Ensure request has the correct content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    const { nonce, signature, publicKey, address } = req.body as VerifyRequest;
    
    // Validate inputs
    if (!nonce) {
      return res.status(400).json({ error: 'Missing nonce' });
    }
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }
    if (!publicKey) {
      return res.status(400).json({ error: 'Missing publicKey' });
    }
    if (!address) {
      return res.status(400).json({ error: 'Missing address' });
    }
    
    // Verify nonce exists in the database
    const storedNonce = await getNonce(nonce);
    if (!storedNonce) {
      console.error('Invalid or expired nonce');
      return res.status(401).json({ error: 'Invalid or expired nonce' });
    }
    
    // Log verification attempt
    console.log(`Verifying signature for address: ${address}`);
    console.log(`Nonce: ${nonce.slice(0, 10)}...`);
    
    // Verify the signature
    const isValid = await verifySignature(nonce, signature, publicKey, address);
    
    if (!isValid) {
      console.error('Signature verification failed');
      return res.status(401).json({ error: 'Failed to verify signature' });
    }
    
    console.log(`Signature verified successfully for ${address}`);
    
    // Get or create user
    const user = await getOrCreateUser(address);
    
    // Create JWT
    const token = createToken(address);
    
    // Return token and address
    res.status(200).json({ 
      token, 
      address,
      // Include a mock balance for the frontend to display
      balance: '100.00'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verification error:', error);
    res.status(500).json({ error: `Server error during verification: ${errorMessage}` });
  }
}
