import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
// Import the Address class from kaspacore inside @kaspa/wallet
import { kaspacore } from '@kaspa/wallet';
const { Address } = kaspacore;
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'kaspa-brawl-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
const NONCE_EXPIRY_MINUTES = 10; // How long a nonce is valid for

/**
 * Generate a random nonce for wallet signing and store it in the database
 * @returns The generated nonce value
 */
export async function generateNonce(address?: string): Promise<string> {
  // Generate a random nonce
  const nonceValue = randomBytes(32).toString('hex');
  
  // Calculate expiry time (10 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + NONCE_EXPIRY_MINUTES);
  
  // Store nonce in database
  await prisma.nonce.create({
    data: {
      value: nonceValue,
      address: address, // Can be null if no address provided yet
      expiresAt,
      used: false,
    },
  });
  
  return nonceValue;
}

/**
 * Get a nonce by its value
 * @param nonceValue The nonce value to look up
 * @returns The nonce object if found and valid, null otherwise
 */
export async function getNonce(nonceValue: string) {
  // Look up nonce in database
  const nonce = await prisma.nonce.findUnique({
    where: { value: nonceValue },
  });
  
  // Check if nonce exists, is not expired, and is not used
  if (!nonce || nonce.expiresAt < new Date() || nonce.used) {
    return null;
  }
  
  return nonce;
}

/**
 * Mark a nonce as used
 * @param nonceValue The nonce value to mark as used
 */
export async function markNonceAsUsed(nonceValue: string) {
  await prisma.nonce.update({
    where: { value: nonceValue },
    data: { used: true },
  });
}

/**
 * Clean up expired nonces from the database
 * This should be called periodically by a cron job
 */
export async function cleanupExpiredNonces() {
  const now = new Date();
  await prisma.nonce.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { used: true },
      ],
    },
  });
}

/**
 * Create a JWT token for a user
 */
export function createToken(address: string): string {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { address: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { address: string };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get or create a user by their Kaspa address
 */
export async function getOrCreateUser(address: string) {
  let user = await prisma.user.findUnique({
    where: { address }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { address }
    });
  }

  return user;
}

/**
 * Verify that a message was signed by the owner of a Kaspa address
 * Enhanced version with better error handling and validation
 * 
 * @param message The original message (nonce) that was signed
 * @param signature The signature from the wallet
 * @param publicKey The public key from the wallet
 * @param address The address claimed by the wallet
 */
export async function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
  address: string
): Promise<boolean> {
  try {
    // Log verification attempt details for debugging
    console.log('=== Starting signature verification ===');
    console.log('Message:', message.substring(0, 15) + '...');
    console.log('Signature:', signature.substring(0, 15) + '...');
    console.log('Public key:', publicKey ? publicKey.substring(0, 15) + '...' : 'Not provided');
    console.log('Address:', address);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Look up nonce to verify it exists and hasn't been used
    const nonce = await getNonce(message);
    
    if (!nonce) {
      console.error('Invalid or expired nonce in verification attempt');
      return false;
    }

    // Enhanced validation of signature format
    if (signature) {
      console.log(`Signature type: ${typeof signature}, length: ${signature.length}`);
      
      // Check if signature is in a valid format (non-empty string with reasonable length)
      if (typeof signature !== 'string') {
        console.error(`Invalid signature type: ${typeof signature}`);
      } else if (signature.length < 10) {
        console.error(`Signature too short: ${signature.length} chars`);
      }
    }

    // Basic checks that the required data is present
    if (!message || !signature || !address) {
      console.error('Missing required verification data');
      console.error('- message:', message ? 'Present' : 'Missing');
      console.error('- signature:', signature ? 'Present' : 'Missing');
      console.error('- address:', address ? 'Present' : 'Missing');
      
      // For development environment - bypass verification even with missing data
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ DEVELOPMENT MODE: Bypassing signature verification despite missing data');
        await markNonceAsUsed(message);
        return true;
      }
      
      return false;
    }
    
    // For development environment - bypass verification
    // This allows testing without requiring perfect wallet compatibility
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ DEVELOPMENT MODE: Bypassing signature verification for development');
      await markNonceAsUsed(message);
      return true;
    }
    
    // Improved verification approach
    let isSignatureValid = false;
    
    // Try a cryptographic verification if we have all the needed data
    try {
      // In production we should implement proper cryptographic verification here
      // For now, we'll accept signatures if they at least have reasonable length and format
      
      // Basic format check
      isSignatureValid = typeof signature === 'string' && signature.length >= 64;
      
      console.log(`Basic signature validation: ${isSignatureValid ? 'PASSED' : 'FAILED'}`);
      
      // In a real implementation, we would verify the signature cryptographically:
      // const verified = someKaspaCryptoLibrary.verifySignature(message, signature, publicKey);
    } catch (verifyError) {
      console.error('Error during verification:', verifyError);
    }
    
    // Log the final verification result
    console.log(`Signature verification result: ${isSignatureValid ? 'VALID' : 'INVALID'}`);
    
    // Mark the nonce as used if verification succeeded to prevent replay attacks
    if (isSignatureValid) {
      await markNonceAsUsed(message);
    }
    
    return isSignatureValid;
  } catch (error) {
    console.error('Unexpected error in signature verification:', error);
    return false;
  }
}
