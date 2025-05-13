/**
 * KaspaWallet Authentication Context
 * Provides wallet connection and fighter registration functionality
 * Enhanced version that uses our kaspaWalletHelper utility
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Fighter } from '../../types/fighter';
import { SaveSystem } from '../../utils/saveSystem';
import { 
  detectKaspaWallet, 
  connectToWallet, 
  signWithWallet, 
  DetectedWallet 
} from '../../utils/kaspaWalletHelper';

interface KaspaWalletAuthContextType {
  isAuthenticated: boolean;
  walletAddress: string | null;
  token: string | null;
  balance: number;
  isConnecting: boolean;
  walletType: 'kaspaWallet' | 'kasware' | 'none';
  connect: () => Promise<boolean>;
  disconnect: () => void;
  registerFighter: (fighter: Fighter) => Promise<boolean>;
}

// Default context values
const KaspaWalletAuthContext = createContext<KaspaWalletAuthContextType>({
  isAuthenticated: false,
  walletAddress: null,
  token: null,
  balance: 0,
  isConnecting: false,
  walletType: 'none',
  connect: async () => false,
  disconnect: () => {},
  registerFighter: async () => false
});

/**
 * Hook for accessing KaspaWallet authentication context
 */
export const useKaspaWalletAuth = () => useContext(KaspaWalletAuthContext);

/**
 * KaspaWallet Authentication Provider Component
 * Enhanced version with better error handling and compatibility
 */
export const KaspaWalletAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<DetectedWallet>({ 
    type: 'none', 
    api: null, 
    address: null, 
    isAvailable: false 
  });
  
  // Check for existing connection and available wallets on mount
  useEffect(() => {
    const initWallet = async () => {
      // Detect available wallet extension
      const detectedWallet = detectKaspaWallet();
      setWallet(detectedWallet);
      
      // Check localStorage for saved wallet connection
      const savedToken = localStorage.getItem('kaspa_brawl_token');
      const savedAddress = localStorage.getItem('kaspabrawl_wallet_address');
      
      if (savedToken && savedAddress) {
        setToken(savedToken);
        setWalletAddress(savedAddress);
        setIsAuthenticated(true);
        await fetchBalance(savedAddress);
      }
    };
    
    initWallet();
  }, []);

  /**
   * Fetch wallet balance from API
   */
  const fetchBalance = async (address: string) => {
    try {
      console.log('Fetching balance for address:', address);
      // API call to get wallet balance
      const response = await fetch(`/api/wallet/balance?address=${encodeURIComponent(address)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Balance data received:', data);
        setBalance(data.balance);
      } else {
        console.error('Failed to fetch balance:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  /**
   * Connect to KaspaWallet and authenticate
   * Updated to use our kaspaWalletHelper and to handle the full authentication flow
   */
  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      console.log('Starting enhanced wallet connection flow');
      
      // Re-detect wallet to ensure we have the latest state
      const detectedWallet = detectKaspaWallet();
      setWallet(detectedWallet);
      
      if (!detectedWallet.isAvailable) {
        console.error('No wallet extension available');
        throw new Error('KaspaWallet or Kasware extension not detected. Please install a compatible wallet extension.');
      }
      
      // Connect to wallet and get address
      console.log(`Connecting to ${detectedWallet.type} wallet...`);
      const address = await connectToWallet(detectedWallet);
      
      if (!address) {
        throw new Error('Failed to get wallet address. Please make sure your wallet is unlocked.');
      }
      
      console.log('Successfully connected to wallet with address:', address);
      
      // Get nonce from server
      console.log('Requesting authentication nonce from server...');
      const nonceResponse = await fetch(`/api/auth/nonce?address=${encodeURIComponent(address)}`);
      
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json().catch(() => ({}));
        throw new Error(`Failed to get nonce: ${errorData.error || nonceResponse.statusText}`);
      }
      
      const { nonce } = await nonceResponse.json();
      console.log('Received authentication nonce');
      
      // Sign the nonce
      console.log('Signing authentication message...');
      const signResult = await signWithWallet(detectedWallet, nonce, address);
      
      if (!signResult) {
        throw new Error('Failed to sign message with wallet. Please try again.');
      }
      
      // Verify with server
      console.log('Verifying wallet signature with server...');
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nonce,
          signature: signResult.signature,
          publicKey: signResult.publicKey || '',
          address
        })
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(`Authentication failed: ${errorData.error || verifyResponse.statusText}`);
      }
      
      const { token: authToken } = await verifyResponse.json();
      
      // Update state and save to localStorage
      setWalletAddress(address);
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('kaspabrawl_wallet_address', address);
      localStorage.setItem('kaspa_brawl_token', authToken);
      
      // Fetch wallet balance
      await fetchBalance(address);
      
      console.log('Wallet authentication completed successfully');
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error connecting to wallet';
      window.alert(`Failed to connect wallet: ${errorMessage}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from KaspaWallet
   */
  const disconnect = () => {
    // Clear authentication state
    setWalletAddress(null);
    setToken(null);
    setIsAuthenticated(false);
    setBalance(0);
    
    // Clear localStorage
    localStorage.removeItem('kaspabrawl_wallet_address');
    localStorage.removeItem('kaspa_brawl_token');
    
    // Try to disconnect via wallet API if possible
    try {
      if (wallet.type === 'kaspaWallet' && wallet.api) {
        // @ts-ignore - KaspaWallet types not available
        wallet.api.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
    
    console.log('Wallet disconnected');
  };

  /**
   * Register fighter with KaspaWallet address
   * Enhanced with better error handling and JWT token usage
   */
  const registerFighter = async (fighter: Fighter): Promise<boolean> => {
    if (!isAuthenticated || !walletAddress || !token) {
      console.error('Cannot register fighter: Not authenticated');
      window.alert('Please connect your wallet first');
      return false;
    }

    try {
      console.log('Registering fighter with wallet address:', walletAddress);
      
      // Update fighter with wallet address
      const fighterWithWallet = {
        ...fighter,
        address: walletAddress
      };
      
      // Register fighter with the wallet address and authentication token
      const response = await fetch('/api/fighters/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fighter: fighterWithWallet })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration API error:', errorData);
        
        // Check if authentication error
        if (response.status === 401) {
          // Try to reconnect wallet
          setIsAuthenticated(false);
          setToken(null);
          localStorage.removeItem('kaspa_brawl_token');
          throw new Error('Authentication expired. Please reconnect your wallet.');
        }
        
        throw new Error(`Failed to register fighter: ${errorData.error || response.statusText}`);
      }

      console.log('Fighter registered successfully with API');
      
      // Save fighter data with the save system
      try {
        console.log('Saving fighter data to local storage');
        await SaveSystem.saveFighter(fighterWithWallet, true, walletAddress);
        console.log('Fighter saved successfully to storage system');
      } catch (saveError) {
        console.error('Error saving fighter data:', saveError);
        // Continue even if save fails, as the API registration succeeded
      }
      
      return true;
    } catch (error) {
      console.error('Error registering fighter:', error);
      window.alert(`Error registering fighter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    walletAddress,
    token,
    balance,
    isConnecting,
    walletType: wallet.type,
    connect,
    disconnect,
    registerFighter
  };

  return (
    <KaspaWalletAuthContext.Provider value={value}>
      {children}
    </KaspaWalletAuthContext.Provider>
  );
};
