# KaspaWallet Integration Fixes - Update 2

## Current Issues
- React hydration errors (Server: 'KasWare Not Found' Client: 'Connect Wallet')
- "Missing signature" errors during wallet verification
- Incorrect handling of KasWare wallet API (signature format mismatch)
- Problems with wallet signature handling

## Root Cause Analysis

The main issue was an incorrect understanding of the KasWare wallet API:

- We were treating `window.kasware.signMessage(...)` as if it returns an object `{ signature, publicKey, address }` 
- In reality, per the KasWare docs, it returns a string (the signature)
- We need to call `kasware.getPublicKey()` separately to get the public key

This caused issues when we tried to access `signResult.signature` and `signResult.publicKey` - these were undefined, and when JSON.stringify processed the request body, the undefined values were dropped.

## Fixed Components

### 1. Type Definitions
- Updated type definitions for KasWare wallet API to match actual behavior:
```typescript
declare global {
  interface Window {
    kasware?: {
      requestAccounts: () => Promise<string[]>;
      signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
      getPublicKey: () => Promise<string>;
      getBalance?: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>;
    };
  }
}
```

### 2. Wallet Helper
- Fixed `KaswareApi` type to match the actual API:
```typescript
export type KaswareApi = {
  requestAccounts: () => Promise<string[]>;
  signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
  getPublicKey: () => Promise<string>;
  getBalance?: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>;
};
```

- Updated `signWithWallet` function to correctly handle signature data

### 3. Wallet Auth Hook
- Fixed the connect flow to properly handle signatures:
  - Get signature as a string from `signMessage`
  - Get public key separately from `getPublicKey`
  - Pass both to the verify endpoint

### 4. Debug Tools
- Created a comprehensive wallet debug page (`/kaspa-wallet-debug.tsx`) 
- Added enhanced debugging tools to help diagnose wallet connection issues

### 5. Headers
- Previously fixed hydration issues by using consistent rendering between server and client

## Testing

To test the implementation:
1. Start the development server with `npm run dev`
2. Navigate to `/kaspa-wallet-debug`
3. Click "Connect Wallet" to test the connection flow
4. Click "Run Diagnostic Test" to test the entire flow including signature verification

## Next Steps

- Continue to monitor for any wallet connection issues
- Test with different wallet implementations
- Consider additional fallbacks for older wallet versions
