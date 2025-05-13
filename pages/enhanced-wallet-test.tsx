import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useEnhancedWalletAuth } from '../hooks/useEnhancedWalletAuth';

/**
 * Enhanced Wallet Test Page
 * Diagnostic tool for KaspaWallet integration issues
 */
export default function EnhancedWalletTestPage() {
  const { 
    address, 
    isConnecting, 
    isAuthenticated, 
    error,
    walletType,
    token,
    connect, 
    disconnect 
  } = useEnhancedWalletAuth();
  
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check if we're running in development mode
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await fetch('/api/debug/wallet-info');
        if (response.ok) {
          const data = await response.json();
          setDebugInfo(data);
          addLog(`Environment: ${data.env.nodeEnv || 'unknown'}`);
        }
      } catch (error) {
        console.error('Error checking environment:', error);
      }
    };
    
    checkEnvironment();
  }, []);
  
  // Connect with detailed logging
  const handleConnect = async () => {
    addLog('Attempting to connect wallet...');
    
    try {
      const result = await connect();
      
      if (result) {
        addLog(`Successfully connected to wallet: ${result.address}`);
        addLog(`Authentication token received: ${result.token.substring(0, 15)}...`);
      } else {
        addLog('Connection failed or was cancelled');
      }
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Disconnect with logging
  const handleDisconnect = () => {
    disconnect();
    addLog('Disconnected from wallet');
  };
  
  // Add log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    setConnectionLog(prev => [`[${timestamp}] ${message}`, ...prev]);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-purple-400 mb-2">Enhanced Wallet Test</h1>
        <p className="text-gray-400 mb-8">Diagnose KaspaWallet connection issues</p>
        
        {/* Status Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Wallet Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-400 mb-1">Connection Status:</p>
              <p className={`font-semibold text-lg ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {isAuthenticated ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">Wallet Type:</p>
              <p className="font-semibold text-lg">
                {walletType === 'none' ? (
                  <span className="text-red-400">Not Detected</span>
                ) : (
                  <span className="text-green-400">
                    {walletType === 'kaspaWallet' ? 'KaspaWallet' : 'Kasware'}
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">Wallet Address:</p>
              <p className="font-mono text-sm overflow-ellipsis overflow-hidden">
                {address || 'None'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">Authentication:</p>
              <p className={`font-semibold ${isAuthenticated ? 'text-green-400' : 'text-gray-400'}`}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting || isAuthenticated}
              className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                isConnecting || isAuthenticated
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
            
            <button
              onClick={handleDisconnect}
              disabled={!isAuthenticated}
              className={`px-6 py-2 rounded-lg font-medium ${
                !isAuthenticated
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Disconnect
            </button>
          </div>
        </div>
        
        {/* Connection Log */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Connection Log</h2>
            <button
              onClick={() => setConnectionLog([])}
              className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
            {connectionLog.length > 0 ? (
              <ul className="space-y-1">
                {connectionLog.map((log, index) => (
                  <li key={index} className="text-gray-300">{log}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No connection attempts yet</p>
            )}
          </div>
        </div>
        
        {/* Debug Information */}
        <div className="mb-8">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center text-gray-400 hover:text-white mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showDebugPanel ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebugPanel && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Debug Information</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-400 mb-2">Window Objects:</h4>
                <ul className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                  <li className="text-gray-300">window.kaspaWallet: {typeof window !== 'undefined' && 'kaspaWallet' in window ? 'Present' : 'Not found'}</li>
                  <li className="text-gray-300">window.kasware: {typeof window !== 'undefined' && 'kasware' in window ? 'Present' : 'Not found'}</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-400 mb-2">Browser Information:</h4>
                <p className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300">
                  {typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-400 mb-2">LocalStorage:</h4>
                <ul className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
                  <li className="text-gray-300">kaspa_brawl_token: {typeof window !== 'undefined' && localStorage.getItem('kaspa_brawl_token') ? 'Present' : 'Not found'}</li>
                  <li className="text-gray-300">kaspabrawl_wallet_address: {typeof window !== 'undefined' && localStorage.getItem('kaspabrawl_wallet_address') ? 'Present' : 'Not found'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Debug Tools */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Debug Tools</h2>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Debug Mode:</span>
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                  debugMode ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span 
                  className={`inline-block w-4 h-4 transform bg-white rounded-full ${
                    debugMode ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
          </div>
          
          {debugMode && (
            <>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h3 className="text-green-400 font-semibold mb-2">Environment Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Node Environment:</div>
                  <div className="text-gray-300 font-mono">{debugInfo?.env?.nodeEnv || 'unknown'}</div>
                  
                  <div className="text-gray-400">Auth Token:</div>
                  <div className="text-gray-300 font-mono overflow-ellipsis overflow-hidden">
                    {token ? `${token.substring(0, 15)}...` : 'Not authenticated'}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/wallet-info');
                      const data = await response.json();
                      setDebugInfo(data);
                      addLog('Debug info refreshed');
                    } catch (error) {
                      addLog(`Error refreshing debug info: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  Refresh Debug Info
                </button>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('kaspa_brawl_token');
                    localStorage.removeItem('kaspabrawl_wallet_address');
                    addLog('Cleared local storage tokens');
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Clear Local Storage
                </button>
              </div>
            </>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-400 mb-2">Troubleshooting Tips:</h3>
          <ul className="text-yellow-300 space-y-2 list-disc pl-4">
            <li>Make sure you have the latest version of KaspaWallet/Kasware installed</li>
            <li>Check that your wallet is unlocked and has at least one account</li>
            <li>Try refreshing the page completely after installing the extension</li>
            <li>Ensure you're using a supported browser (Chrome or Firefox recommended)</li>
            <li>Clear your browser cache if you've updated the wallet extension recently</li>
            <li>Check the browser console for any JavaScript errors</li>
            <li>Enable Debug Mode above for more detailed diagnostics</li>
            <li>See the <a href="/docs/walletIntegration.md" className="underline">wallet integration guide</a> for more help</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
