import { useState, useEffect, useCallback } from 'react';

export interface WalletAuthState {
  address: string | null;
  isConnecting: boolean;
  token: string | null;
  error: string | null;
  isGuest: boolean;
  kaspaBalance: string;
  brawlBalance: string;
  isLoadingBalance: boolean;
}

interface BalanceCache {
  kaspa: string;
  brawl: string;
  timestamp: number;
}

// Function to format JSON for debug logging
const formatData = (data: any) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

// Resolve Kasware type safety issues
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

export default function useWalletAuth() {
  const [state, setState] = useState<WalletAuthState>({
    address: null,
    isConnecting: false,
    token: null,
    error: null,
    isGuest: false,
    kaspaBalance: '0.00',
    brawlBalance: '0.00',
    isLoadingBalance: false,
  });
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error]);
  
  // Function to check if KasWare wallet is installed
  const isWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && Boolean(window.kasware);
  }, []);
  
  // Function to get balance
  const getKaspaBalance = useCallback(async (address: string): Promise<string> => {
    try {
      // Check if it's a guest account
      if (address.startsWith('guest-')) {
        return '500.00'; // Guests get a fixed amount
      }
      
      if (!isWalletAvailable()) {
        console.warn('KasWare wallet not available for balance check');
        return '0.00';
      }
      
      // Try to get the balance from the wallet
      // Safely check if getBalance method exists
      if (window.kasware?.getBalance) {
        console.log(`Fetching Kaspa balance for ${address}`);
        try {
          return await window.kasware.getBalance();
        } catch (err) {
          console.error('Error getting balance from wallet:', err);
          return '1000.00'; // Fallback value if API call fails
        }
      }
      
      // For demo purposes, return a mock value
      return '1000.00';
    } catch (error) {
      console.error('Failed to get Kaspa balance:', error);
      return '0.00';
    }
  }, [isWalletAvailable]);
  
  // Function to get BRAWL token balance
  const getBrawlBalance = useCallback(async (address: string): Promise<string> => {
    try {
      // Check if it's a guest account
      if (address.startsWith('guest-')) {
        return '25.00'; // Guests get a fixed amount
      }
      
      // This would normally fetch the BRAWL token balance from a smart contract
      console.log(`Fetching BRAWL balance for ${address}`);
      return '50.00';
    } catch (error) {
      console.error('Failed to get BRAWL balance:', error);
      return '0.00';
    }
  }, []);
  
  // Function to update balances
  const updateBalances = useCallback(async () => {
    if (!state.address) return;
    
    try {
      setState(prev => ({ ...prev, isLoadingBalance: true }));
      
      // Get balances in parallel
      const [kaspa, brawl] = await Promise.all([
        getKaspaBalance(state.address),
        getBrawlBalance(state.address)
      ]);
      
      // Update state with new balances
      setState(prev => ({ 
        ...prev, 
        kaspaBalance: kaspa, 
        brawlBalance: brawl,
        isLoadingBalance: false 
      }));
      
      // Cache the balances
      const cache: BalanceCache = {
        kaspa,
        brawl,
        timestamp: Date.now()
      };
      
      localStorage.setItem('kaspa_brawl_balance_cache', JSON.stringify(cache));
      console.log('Balances updated and cached');
    } catch (error) {
      console.error('Error updating balances:', error);
      setState(prev => ({ ...prev, isLoadingBalance: false }));
    }
  }, [state.address, getKaspaBalance, getBrawlBalance]);
  
  // Check if user is already connected or using guest mode
  useEffect(() => {
    const loadSavedSession = async () => {
      const token = localStorage.getItem('kaspa_brawl_token');
      const guestMode = localStorage.getItem('kaspa_brawl_guest');
      
      // Try to load cached balances
      try {
        const cachedBalance = localStorage.getItem('kaspa_brawl_balance_cache');
        if (cachedBalance) {
          const cache: BalanceCache = JSON.parse(cachedBalance);
          // Only use cache if it's less than 5 minutes old
          if (Date.now() - cache.timestamp < 5 * 60 * 1000) {
            setState(prev => ({
              ...prev,
              kaspaBalance: cache.kaspa,
              brawlBalance: cache.brawl
            }));
            console.log('Loaded balances from cache');
          }
        }
      } catch (e) {
        console.error('Failed to load cached balances', e);
      }
      
      if (guestMode === 'true') {
        const guestAddress = localStorage.getItem('kaspa_brawl_guest_address') || 'guest-' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('kaspa_brawl_guest_address', guestAddress);
        
        setState(prev => ({ 
          ...prev, 
          address: guestAddress, 
          isGuest: true 
        }));
        
        // Update balances for guest
        const kaspaBalance = await getKaspaBalance(guestAddress);
        const brawlBalance = await getBrawlBalance(guestAddress);
        
        setState(prev => ({
          ...prev,
          kaspaBalance,
          brawlBalance
        }));
      } else if (token) {
        try {
          // Simple JWT parsing to get the payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.address && payload.exp > Date.now() / 1000) {
            setState(prev => ({ 
              ...prev, 
              address: payload.address, 
              token,
              isGuest: false 
            }));
            
            // Update balances
            await updateBalances();
          } else {
            // Token expired, remove from storage
            console.log('Token expired, removing from storage');
            localStorage.removeItem('kaspa_brawl_token');
            localStorage.removeItem('kaspa_brawl_balance_cache');
          }
        } catch (e) {
          console.error('Failed to parse token', e);
          localStorage.removeItem('kaspa_brawl_token');
          localStorage.removeItem('kaspa_brawl_balance_cache');
        }
      }
    };
    
    loadSavedSession();
  }, [getKaspaBalance, getBrawlBalance, updateBalances]);
  
  // Connect wallet function
  const connectWallet = useCallback(async () => {
    // Reset state
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));
    
    try {
      // Check if KasWare is available
      if (!isWalletAvailable()) {
        throw new Error('KasWare wallet is not installed');
      }
      
      console.log('Requesting accounts from KasWare wallet');
      
      // Request accounts - check if window.kasware exists first
      if (!window.kasware) {
        throw new Error('Kasware wallet not found. Please install the extension first.');
      }
      const accounts = await window.kasware.requestAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      console.log(`Account selected: ${address}`);
      
      // Get a nonce from the server
      console.log('Requesting nonce from server');
      const nonceResponse = await fetch(`/api/auth/nonce?address=${encodeURIComponent(address)}`);
      
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(`Failed to get nonce: ${errorData.error || nonceResponse.statusText}`);
      }
      
      const { nonce } = await nonceResponse.json();
      console.log(`Received nonce: ${nonce.slice(0, 10)}...`);
      
      // Sign the nonce
      console.log('Requesting signature from wallet');
      if (!window.kasware) {
        throw new Error('Kasware wallet not found. Please install the extension first.');
      }
      
      // Per KasWare docs, signMessage returns the signature as a string
      const signature = await window.kasware.signMessage(nonce);
      console.log('Received signature from wallet');
      
      // Get the public key separately
      console.log('Requesting public key from wallet');
      const publicKey = await window.kasware.getPublicKey();
      console.log('Received public key from wallet');
      
      // Verify with the server
      console.log('Sending verification to server');
      
      // Prepare request body with correct data types
      // Use the address we got from requestAccounts()
      const requestBody = {
        nonce,
        signature,
        publicKey,
        address // Using the address from requestAccounts
      };
      
      console.log('Request body:', {
        nonce: nonce.substring(0, 10) + '...',
        signature: signature ? signature.substring(0, 10) + '...' : 'Not provided',
        publicKey: publicKey ? publicKey.substring(0, 10) + '...' : 'Not provided',
        address: address // Log the actual address being used
      });
      
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!verifyResponse.ok) {
        let errorMessage = 'Failed to verify signature';
        
        try {
          const errorData = await verifyResponse.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Verification error details:', errorData);
          
          // Add more detailed diagnostics
          console.error('Verification failed with status:', verifyResponse.status);
          console.error('Request body that was sent:', {
            nonce: nonce ? nonce.substring(0, 10) + '...' : 'missing',
            signature: signResult.signature ? signResult.signature.substring(0, 10) + '...' : 'missing',
            publicKey: signResult.publicKey ? signResult.publicKey.substring(0, 10) + '...' : 'missing',
            address: address || 'missing'
          });
        } catch (jsonError) {
          console.error('Error parsing verification response:', jsonError);
          console.error('Response status:', verifyResponse.status);
          console.error('Response text:', await verifyResponse.text().catch(() => 'Unable to get response text'));
        }
        
        throw new Error(errorMessage);
      }
      
      const { token, balance } = await verifyResponse.json();
      console.log('Verification successful, received token');
      
      // Store token and update state
      localStorage.setItem('kaspa_brawl_token', token);
      localStorage.removeItem('kaspa_brawl_guest');
      localStorage.removeItem('kaspa_brawl_guest_address');
      
      // Update state with address and token
      setState(prev => ({
        ...prev,
        address,
        isConnecting: false,
        token,
        error: null,
        isGuest: false
      }));
      
      // Update balances
      await updateBalances();
      
      return { address, token };
    } catch (error) {
      console.error('Wallet connection error:', formatData(error));
      setState(prev => ({
        ...prev,
        address: null,
        isConnecting: false,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error connecting to wallet',
        isGuest: false
      }));
      return null;
    }
  }, [isWalletAvailable, updateBalances]);
  
  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('kaspa_brawl_token');
    localStorage.removeItem('kaspa_brawl_guest');
    localStorage.removeItem('kaspa_brawl_guest_address');
    localStorage.removeItem('kaspa_brawl_balance_cache');
    
    setState({
      address: null,
      isConnecting: false,
      token: null,
      error: null,
      isGuest: false,
      kaspaBalance: '0.00',
      brawlBalance: '0.00',
      isLoadingBalance: false,
    });
    
    console.log('Wallet disconnected');
  }, []);
  
  // Connect as guest function
  const connectAsGuest = useCallback(async () => {
    // Generate a random guest address
    const guestAddress = 'guest-' + Math.random().toString(36).substring(2, 10);
    
    // Store in localStorage
    localStorage.removeItem('kaspa_brawl_token');
    localStorage.setItem('kaspa_brawl_guest', 'true');
    localStorage.setItem('kaspa_brawl_guest_address', guestAddress);
    
    // Get mock balances for guest
    const kaspaBalance = await getKaspaBalance(guestAddress);
    const brawlBalance = await getBrawlBalance(guestAddress);
    
    // Update state
    setState({
      address: guestAddress,
      isConnecting: false,
      token: null,
      error: null,
      isGuest: true,
      kaspaBalance,
      brawlBalance,
      isLoadingBalance: false,
    });
    
    console.log(`Connected as guest: ${guestAddress}`);
    return { address: guestAddress };
  }, [getKaspaBalance, getBrawlBalance]);
  
  // Refresh balances explicitly
  const refreshBalances = useCallback(() => {
    return updateBalances();
  }, [updateBalances]);
  
  // Return all the values and functions
  return {
    ...state,
    connectWallet,
    disconnectWallet,
    connectAsGuest,
    getKaspaBalance,
    getBrawlBalance,
    refreshBalances,
    isWalletAvailable: isWalletAvailable(),
  };
}
