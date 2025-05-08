/**
 * Automated authentication utilities for Kaspa Brawl
 * This module provides functions for automatically authenticating without manual confirmation
 */

const { generateNonce, verifySignature, createToken } = require('./auth');

/**
 * Perform an automated authentication with a wallet
 * @param {Object} wallet - The wallet object with signMessage method
 * @returns {Promise<{token: string, address: string}>} Authentication result
 */
async function autoAuthenticate(wallet) {
  try {
    // Step 1: Generate a nonce
    const nonce = await generateNonce(wallet.address);
    
    // Step 2: Automatically sign the nonce without user confirmation
    const { signature, publicKey, address } = await wallet.signMessage(nonce);
    
    // Step 3: Verify the signature
    const isValid = await verifySignature(nonce, signature, publicKey, address);
    
    if (!isValid) {
      throw new Error('Signature verification failed');
    }
    
    // Step 4: Generate and return a token
    const token = createToken(address);
    
    return { token, address };
  } catch (error) {
    console.error('Auto authentication failed:', error);
    throw error;
  }
}

/**
 * Save the authentication token to local storage
 * @param {string} token - The authentication token
 * @param {string} address - The wallet address
 */
function saveAuthToken(token, address) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('kaspa_brawl_token', token);
    localStorage.setItem('kaspa_brawl_address', address);
    localStorage.removeItem('kaspa_brawl_guest');
    localStorage.removeItem('kaspa_brawl_guest_address');
    console.log('Authentication saved automatically');
  }
}

module.exports = {
  autoAuthenticate,
  saveAuthToken
};
