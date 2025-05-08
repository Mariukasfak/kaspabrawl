import { useState, useEffect, useCallback } from 'react';
import { autoAuthenticate, saveAuthToken } from '../lib/autoAuth';

export interface AutoWalletAuthState {
  address: string | null;
  isConnecting: boolean;
  token: string | null;
  error: string | null;
}

/**
 * React hook for automatically authenticating with a wallet without manual confirmation
 * Use this for testing environments or systems where security is less critical
 */
export default function useAutoWalletAuth() {
  const [state, setState] = useState<AutoWalletAuthState>({
    address: null,
    isConnecting: false,
    token: null,
    error: null,
  });
  
  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('kaspa_brawl_token');
    const address = localStorage.getItem('kaspa_brawl_address');
    
    if (token && address) {
      setState(prev => ({
        ...prev,
        token,
        address,
      }));
    }
  }, []);
  
  // Auto connect function
  const autoConnect = useCallback(async () => {
    if (!window.kasware) {
      setState(prev => ({
        ...prev,
        error: 'KasWare wallet not installed',
      }));
      return null;
    }
    
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));
    
    try {
      // Request accounts
      const accounts = await window.kasware.requestAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Auto authenticate
      const { token, address } = await autoAuthenticate(window.kasware);
      
      // Save to local storage
      saveAuthToken(token, address);
      
      setState(prev => ({
        ...prev,
        token,
        address,
        isConnecting: false,
      }));
      
      return { token, address };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isConnecting: false,
      }));
      return null;
    }
  }, []);
  
  // Disconnect function
  const disconnect = useCallback(() => {
    localStorage.removeItem('kaspa_brawl_token');
    localStorage.removeItem('kaspa_brawl_address');
    
    setState({
      address: null,
      isConnecting: false,
      token: null,
      error: null,
    });
  }, []);
  
  return {
    ...state,
    autoConnect,
    disconnect,
  };
}
