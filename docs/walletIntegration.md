# KaspaWallet Integration Guide for KaspaBrawl

This document provides information on how to use and troubleshoot the KaspaWallet integration in KaspaBrawl.

## Overview

KaspaBrawl integrates with Kaspa blockchain wallets for user authentication and fighter registration. The game supports both KaspaWallet and Kasware browser extensions.

## Supported Wallet Extensions

- **KaspaWallet** - Original Kaspa wallet extension
- **Kasware** - Newer Kaspa wallet implementation

## Troubleshooting Common Issues

### "Failed to verify signature" error

This error typically occurs when the wallet's signature cannot be verified. Possible solutions:

1. Make sure your wallet is unlocked before attempting to connect
2. Try refreshing the page and connecting again
3. Visit the wallet test page at `/wallet-test` or `/enhanced-wallet-test` for diagnostics
4. Clear browser cache if you recently updated your wallet extension

### "No wallet detected" error

If the game cannot detect your wallet:

1. Make sure the wallet extension is installed and enabled in your browser
2. Check if the wallet extension icon appears in your browser toolbar
3. Try using a supported browser (Chrome, Firefox, or Brave)
4. Restart your browser after installing the extension

### Connection works but fighter registration fails

If you can connect your wallet but can't register fighters:

1. Make sure your wallet has enough KAS for transaction fees
2. Check if your wallet address appears correctly in the game UI
3. Try disconnecting and reconnecting your wallet
4. If using the enhanced wallet test page, check the authentication token status

## Diagnostic Tools

KaspaBrawl includes several tools to help diagnose wallet connection issues:

1. **Basic Wallet Test**: Visit `/wallet-test` to check basic wallet connectivity
2. **Enhanced Wallet Test**: Visit `/enhanced-wallet-test` for more detailed diagnostics
3. **Wallet Info API**: Developer endpoint at `/api/debug/wallet-info` for technical details

## Technical Implementation

The wallet integration uses the following components:

- `KaspaWalletAuth.tsx` - Main wallet authentication provider component
- `useEnhancedWalletAuth.ts` - Hook for improved wallet integration
- `kaspaWalletHelper.ts` - Utility for wallet compatibility
- `/api/auth/nonce.ts` - API endpoint for nonce generation
- `/api/auth/verify.ts` - API endpoint for signature verification

## Development Mode

When running in development mode (`NODE_ENV !== 'production'`), the authentication system will bypass signature verification. This makes testing easier during development but should not be used in production.

## Support

If you encounter issues with wallet integration, please:

1. Try the troubleshooting steps above
2. Check the browser console for error messages
3. Visit the diagnostic pages for more information
4. Report persistent issues on our Discord server or GitHub repository

## Wallet Security

KaspaBrawl never has access to your private keys or wallet seed phrase. The authentication uses a signature-based approach that only requires your public wallet address.
