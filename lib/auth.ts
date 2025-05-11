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
    // Look up nonce to verify it exists and hasn't been used
    const nonce = await getNonce(message);
    
    if (!nonce) {
      console.error('Invalid nonce in verification attempt');
      return false;
    }

    // Proper signature verification using Kaspa libraries
    try {
      // Create a Kaspa message object from the nonce
      const messageObj = kaspacore.Message(message);
      
      // Verify the signature against the provided public key
      const isSignatureValid = messageObj.verify(address, signature);
      
      // Verify the address matches the public key
      const derivedAddress = Address.fromPublicKey(Buffer.from(publicKey, 'hex')).toString();
      const isAddressValid = derivedAddress === address;
      
      console.log(`Signature verification: ${isSignatureValid ? 'Valid' : 'Invalid'}`);
      console.log(`Address verification: ${isAddressValid ? 'Valid' : 'Invalid'}`);
      
      // Mark the nonce as used to prevent replay attacks
      if (isSignatureValid && isAddressValid) {
        await markNonceAsUsed(message);
        return true;
      }
      
      return false;
    } catch (verifyError) {
      console.error('Error during signature verification:', verifyError);
      return false;
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
