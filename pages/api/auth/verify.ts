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
    // Log the request for debugging
    console.log('Verify request received');
    console.log('Headers:', req.headers);
    console.log('Request body type:', typeof req.body);
    
    // Ensure request has the correct content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    // Log the entire request body for debugging
    console.log('Request body (partial):', JSON.stringify(req.body).slice(0, 200));
    
    const { nonce, signature, publicKey, address } = req.body as VerifyRequest;
    
    // Validate inputs with detailed logging
    if (!nonce) {
      console.error('Missing nonce in request');
      return res.status(400).json({ error: 'Missing nonce' });
    }
    if (!signature) {
      console.error('Missing signature in request');
      return res.status(400).json({ error: 'Missing signature' });
    }
    if (!publicKey) {
      console.error('Missing publicKey in request');
      return res.status(400).json({ error: 'Missing publicKey' });
    }
    if (!address) {
      console.error('Missing address in request');
      return res.status(400).json({ error: 'Missing address' });
    }
    
    // Log validation success
    console.log('Request validation successful');
    console.log('Nonce:', nonce.slice(0, 10) + '...');
    console.log('Signature:', signature.slice(0, 10) + '...');
    console.log('Address:', address);
    
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
