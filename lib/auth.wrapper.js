/**
 * CommonJS wrapper for auth.ts module
 * This allows JavaScript files to import the TypeScript auth module
 */

// Import the compiled version from the same directory
const authModule = require('../.next/server/lib/auth');

// Export all the functions
module.exports = {
  generateNonce: authModule.generateNonce,
  getNonce: authModule.getNonce,
  markNonceAsUsed: authModule.markNonceAsUsed,
  cleanupExpiredNonces: authModule.cleanupExpiredNonces,
  createToken: authModule.createToken,
  verifyToken: authModule.verifyToken,
  getOrCreateUser: authModule.getOrCreateUser,
  verifySignature: authModule.verifySignature
};
