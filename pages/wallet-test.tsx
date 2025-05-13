import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { KaspaWalletAuthProvider, useKaspaWalletAuth } from '../components/blockchain/KaspaWalletAuth';

/**
 * Wallet Test Page
 * Helps diagnose KaspaWallet connection issues
 */
function WalletTestContent() {
  const { isAuthenticated, walletAddress, connect, disconnect } = useKaspaWalletAuth();
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check for global wallet objects
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const walletCheck = {
      hasKaspaWallet: 'kaspaWallet' in window,
      hasKasware: 'kasware' in window,
      browserInfo: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    setWalletInfo(walletCheck);
  }, []);
  
  // Function to get detailed debug info
  const fetchDebugInfo = async () => {
    try {
      setError(null);
      const response = await fetch('/api/debug/wallet-info');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch debug info: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      console.error('Error fetching debug info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching debug info');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">KaspaWallet Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Wallet Status</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="mb-2">
            <span className="font-semibold">Authentication Status:</span>{' '}
            <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </p>
          
          <p className="mb-4">
            <span className="font-semibold">Wallet Address:</span>{' '}
            <span className="text-gray-300">{walletAddress || 'Not connected'}</span>
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={connect}
              className={`px-4 py-2 rounded-lg font-medium ${
                isAuthenticated
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              disabled={isAuthenticated}
            >
              Connect Wallet
            </button>
            
            <button
              onClick={disconnect}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isAuthenticated
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              disabled={!isAuthenticated}
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Wallet Detection</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          {walletInfo ? (
            <>
              <p className="mb-2">
                <span className="font-semibold">KaspaWallet Detected:</span>{' '}
                <span className={walletInfo.hasKaspaWallet ? 'text-green-400' : 'text-red-400'}>
                  {walletInfo.hasKaspaWallet ? 'Yes' : 'No'}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-semibold">Kasware Detected:</span>{' '}
                <span className={walletInfo.hasKasware ? 'text-green-400' : 'text-red-400'}>
                  {walletInfo.hasKasware ? 'Yes' : 'No'}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-4">Browser: {walletInfo.browserInfo}</p>
            </>
          ) : (
            <p className="text-gray-400">Checking for wallet extensions...</p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Debug Information</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <button
            onClick={fetchDebugInfo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mb-4"
          >
            Fetch Debug Info
          </button>
          
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 p-4 rounded mb-4">
              {error}
            </div>
          )}
          
          {debugInfo && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">API Environment:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-40 text-gray-300 text-xs">
                {JSON.stringify(debugInfo.env, null, 2)}
              </pre>
              
              <h3 className="font-semibold mb-2 mt-4">Request Details:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-40 text-gray-300 text-xs">
                {JSON.stringify(debugInfo.requestInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-400 mb-2">Troubleshooting Tips:</h3>
        <ul className="text-yellow-300 space-y-2 list-disc pl-4">
          <li>Make sure the wallet extension is installed and enabled</li>
          <li>Try refreshing the page after connecting the wallet</li>
          <li>Check console logs for any JavaScript errors</li>
          <li>Make sure you're using a supported browser (Chrome, Firefox, or Brave)</li>
          <li>If having connection issues, try clearing your browser cache</li>
        </ul>
      </div>
    </div>
  );
}

export default function WalletTestPage() {
  return (
    <KaspaWalletAuthProvider>
      <Layout>
        <WalletTestContent />
      </Layout>
    </KaspaWalletAuthProvider>
  );
}
