/**
 * Enhanced Wallet Authentication Hook
 * Uses the kaspaWalletHelper to better handle different wallet versions
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  detectKaspaWallet, 
  connectToWallet, 
  signWithWallet, 
  isWalletAvailable,
  DetectedWallet
} from '../utils/kaspaWalletHelper';

export interface UseEnhancedWalletAuthResult {
  address: string | null;
  isConnecting: boolean;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  walletType: 'kaspaWallet' | 'kasware' | 'none';
  connect: () => Promise<{ address: string; token: string } | null>;
  disconnect: () => void;
}

/**
 * Enhanced hook for KaspaWallet authentication
 * Handles different wallet versions and implementations
 */
export function useEnhancedWalletAuth(): UseEnhancedWalletAuthResult {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedWallet, setDetectedWallet] = useState<DetectedWallet>({ 
    type: 'none', 
    api: null, 
    address: null, 
    isAvailable: false 
  });

  // Check for saved connection on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('kaspa_brawl_token');
    const savedAddress = localStorage.getItem('kaspabrawl_wallet_address');
    
    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
      setIsAuthenticated(true);
    }
    
    // Detect wallet type
    const wallet = detectKaspaWallet();
    setDetectedWallet(wallet);
  }, []);

  // Connect to wallet and authenticate
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Re-detect wallet to ensure we have the latest state
      const wallet = detectKaspaWallet();
      setDetectedWallet(wallet);
      
      if (!wallet.isAvailable) {
        throw new Error('Wallet extension not detected. Please install KaspaWallet or Kasware.');
      }
      
      // Connect to wallet and get address
      console.log('Connecting to wallet...');
      const walletAddress = await connectToWallet(wallet);
      
      if (!walletAddress) {
        throw new Error('Failed to get wallet address. Please make sure your wallet is unlocked.');
      }
      
      console.log('Connected to wallet with address:', walletAddress);
      setAddress(walletAddress);
      
      // Get nonce from server
      console.log('Requesting nonce from server...');
      const nonceResponse = await fetch(`/api/auth/nonce?address=${encodeURIComponent(walletAddress)}`);
      
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json().catch(() => ({}));
        throw new Error(`Failed to get nonce: ${errorData.error || nonceResponse.statusText}`);
      }
      
      const { nonce } = await nonceResponse.json();
      console.log(`Received nonce: ${nonce.slice(0, 10)}...`);
      
      // Sign the nonce
      console.log('Signing message...');
      const signResult = await signWithWallet(wallet, nonce, walletAddress);
      
      if (!signResult) {
        throw new Error('Failed to sign message with wallet');
      }
      
      console.log('Message signed successfully');
      
      // Verify with server
      console.log('Verifying signature with server...');
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nonce,
          signature: signResult.signature,
          publicKey: signResult.publicKey || '',
          address: walletAddress
        })
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(`Verification failed: ${errorData.error || verifyResponse.statusText}`);
      }
      
      const { token: authToken } = await verifyResponse.json();
      console.log('Verification successful, received authentication token');
      
      // Save authentication
      localStorage.setItem('kaspa_brawl_token', authToken);
      localStorage.setItem('kaspabrawl_wallet_address', walletAddress);
      
      setToken(authToken);
      setIsAuthenticated(true);
      
      return { address: walletAddress, token: authToken };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error connecting to wallet';
      console.error('Wallet connection error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    // Clear authentication state
    setAddress(null);
    setIsAuthenticated(false);
    setToken(null);
    
    // Clear stored data
    localStorage.removeItem('kaspa_brawl_token');
    localStorage.removeItem('kaspabrawl_wallet_address');
    
    // Try to disconnect via wallet API if available
    try {
      if (detectedWallet.type === 'kaspaWallet' && detectedWallet.api) {
        // @ts-ignore
        detectedWallet.api.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  }, [detectedWallet]);

  return {
    address,
    isConnecting,
    isAuthenticated,
    token,
    error,
    walletType: detectedWallet.type,
    connect,
    disconnect
  };
}
