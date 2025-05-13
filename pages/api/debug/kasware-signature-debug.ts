import type { NextApiRequest, NextApiResponse } from 'next';
import { getNonce } from '../../../lib/auth';

/**
 * Debug endpoint to analyze KasWare wallet signatures
 * This helps diagnose issues with the signature verification process
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    // Extract the relevant data from the request body
    const { signature, publicKey, address, nonce } = req.body;
    
    // Check if nonce exists in the database
    const nonceCheck = nonce ? await getNonce(nonce) : null;
    
    // Create a detailed analysis of the provided data
    const analysis = {
      time: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      signatureInfo: {
        provided: !!signature,
        type: typeof signature,
        length: signature?.length || 0,
        isValidFormat: signature && typeof signature === 'string' && signature.length >= 64,
        preview: signature ? `${signature.substring(0, 10)}...` : null,
        bytes: signature ? Buffer.from(signature).length : 0
      },
      publicKeyInfo: {
        provided: !!publicKey,
        type: typeof publicKey,
        length: publicKey?.length || 0,
        isValidFormat: publicKey && typeof publicKey === 'string' && publicKey.length >= 32,
        preview: publicKey ? `${publicKey.substring(0, 10)}...` : null
      },
      addressInfo: {
        provided: !!address,
        type: typeof address,
        isKaspaAddress: address?.startsWith('kaspa:'),
        preview: address || null,
        length: address?.length || 0
      },
      nonceInfo: {
        provided: !!nonce,
        type: typeof nonce,
        length: nonce?.length || 0,
        preview: nonce ? `${nonce.substring(0, 10)}...` : null,
        validInDatabase: !!nonceCheck,
        expired: nonceCheck ? nonceCheck.expiresAt < new Date() : false,
        used: nonceCheck?.used || false
      },
      verificationSimulation: {
        wouldPassDevelopment: true, // In dev mode, all signatures pass
        wouldPassProduction: signature && typeof signature === 'string' && signature.length >= 64,
        reasonIfFailure: (!signature) 
          ? 'Missing signature' 
          : (typeof signature !== 'string')
          ? 'Invalid signature type'
          : (signature.length < 64)
          ? 'Signature too short'
          : 'Would pass'
      },
      recommendations: []
    };
    
    // Generate recommendations based on the analysis
    if (!signature) {
      analysis.recommendations.push('Signature is missing. Check that the wallet is properly signing the message.');
    } else if (typeof signature !== 'string') {
      analysis.recommendations.push(`Signature type is incorrect (${typeof signature}). It should be a string.`);
    } else if (signature.length < 64) {
      analysis.recommendations.push('Signature is too short. It should be at least 64 characters long.');
    }
    
    if (!publicKey) {
      analysis.recommendations.push('Public key is missing. Check that the wallet is providing the public key.');
    }
    
    if (!address) {
      analysis.recommendations.push('Address is missing. Make sure to use the address from the wallet connection.');
    } else if (!address.startsWith('kaspa:')) {
      analysis.recommendations.push('Address does not start with "kaspa:". Check that a valid Kaspa address is being used.');
    }
    
    if (!nonce) {
      analysis.recommendations.push('Nonce is missing. Make sure the server is generating and returning a valid nonce.');
    } else if (!nonceCheck) {
      analysis.recommendations.push('Nonce not found in database. It might be invalid or expired.');
    } else if (nonceCheck.used) {
      analysis.recommendations.push('Nonce has already been used. Generate a new nonce for each signature attempt.');
    } else if (nonceCheck.expiresAt < new Date()) {
      analysis.recommendations.push('Nonce has expired. Generate a new nonce and try again.');
    }

    // Wallet compatibility tips
    analysis.recommendations.push('If using Kasware wallet, make sure you have the latest version installed.');
    analysis.recommendations.push('Try refreshing the page and reconnecting your wallet.');
    
    // Return the analysis
    res.status(200).json({
      message: 'KasWare signature analysis',
      analysis,
      requestData: {
        headers: req.headers,
        body: req.body
      }
    });
  } catch (error) {
    console.error('Error in KasWare signature debug endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
