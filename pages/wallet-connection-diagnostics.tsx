import { useState, useEffect } from 'react';
import { useEnhancedWalletAuth } from '../hooks/useEnhancedWalletAuth';
import { detectKaspaWallet, checkWalletCompatibility } from '../utils/kaspaWalletHelper';

/**
 * Diagnostic page for testing wallet connections
 * This page provides detailed information about wallet connection attempts
 */
export default function WalletDiagnostics() {
  const [logs, setLogs] = useState<string[]>([]);
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [compatInfo, setCompatInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<{[key: string]: boolean | string}>({});
  
  const walletAuth = useEnhancedWalletAuth();
  
  // Add a log entry
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Detect wallet on mount
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const detectWallet = async () => {
      addLog('Detecting wallet...');
      
      const wallet = detectKaspaWallet();
      setWalletDetails(wallet);
      
      if (wallet.isAvailable) {
        addLog(`Detected wallet type: ${wallet.type}`);
      } else {
        addLog('No wallet detected');
      }
      
      const compat = checkWalletCompatibility();
      setCompatInfo(compat);
      addLog(`Wallet compatibility: ${compat.compatible ? 'Compatible' : 'Incompatible'}`);
      addLog(`Message: ${compat.message}`);
    };
    
    detectWallet();
  }, []);
  
  // Handle connect attempt
  const handleConnect = async () => {
    addLog('Attempting to connect to wallet...');
    
    try {
      const result = await walletAuth.connect();
      
      if (result) {
        addLog(`✅ Connected successfully to address: ${result.address}`);
        addLog(`✅ Authentication token received: ${result.token.substring(0, 15)}...`);
        setTestResults(prev => ({...prev, connection: true}));
      } else {
        addLog('❌ Connection failed, no result returned');
        setTestResults(prev => ({...prev, connection: false}));
      }
    } catch (error) {
      addLog(`❌ Connection error: ${error instanceof Error ? error.message : String(error)}`);
      setTestResults(prev => ({...prev, connection: false}));
    }
  };
  
  // Direct signature test
  const testSignature = async () => {
    if (typeof window === 'undefined' || !window.kasware) {
      addLog('❌ KasWare not available for signature test');
      return;
    }
    
    try {
      addLog('Testing direct message signing...');
      const testMessage = `Test message: ${Date.now()}`;
      
      const signResult = await window.kasware.signMessage(testMessage);
      
      addLog('✅ Signature received from wallet');
      addLog(`Signature: ${signResult.signature.substring(0, 15)}...`);
      addLog(`Public key: ${signResult.publicKey.substring(0, 15)}...`);
      addLog(`Address: ${signResult.address}`);
      
      setTestResults(prev => ({...prev, signature: true}));
      
      // Test the debug endpoint
      try {
        addLog('Sending to debug endpoint...');
        
        const debugResponse = await fetch('/api/debug/kasware-signature-debug-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature: signResult.signature,
            publicKey: signResult.publicKey,
            address: signResult.address,
            nonce: testMessage
          })
        });
        
        const debugResult = await debugResponse.json();
        addLog('Debug endpoint response received');
        addLog(`Analysis: ${JSON.stringify(debugResult.analysis.recommendations).substring(0, 100)}...`);
        
        setTestResults(prev => ({...prev, debugEndpoint: true}));
      } catch (debugError) {
        addLog(`❌ Debug endpoint error: ${debugError instanceof Error ? debugError.message : String(debugError)}`);
        setTestResults(prev => ({...prev, debugEndpoint: false}));
      }
    } catch (error) {
      addLog(`❌ Signature test error: ${error instanceof Error ? error.message : String(error)}`);
      setTestResults(prev => ({...prev, signature: false}));
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet Connection Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Wallet Detection</h2>
          <div className="mb-4">
            <div className="bg-gray-800 p-2 rounded">
              <p><strong>Detected:</strong> {walletDetails?.isAvailable ? 'Yes' : 'No'}</p>
              <p><strong>Type:</strong> {walletDetails?.type || 'None'}</p>
              <p><strong>Compatible:</strong> {compatInfo?.compatible ? 'Yes' : 'No'}</p>
              <p><strong>Message:</strong> {compatInfo?.message || 'No information'}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Test Connection</h2>
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={handleConnect}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
            
            <button
              onClick={testSignature}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={!walletDetails?.isAvailable}
            >
              Test Signature
            </button>
            
            <button
              onClick={() => walletAuth.disconnect()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              disabled={!walletAuth.address}
            >
              Disconnect
            </button>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Test Results</h2>
          <div className="bg-gray-800 p-2 rounded mb-4">
            <p>
              <strong>Connection: </strong>
              {testResults.connection === true ? '✅ Success' : 
               testResults.connection === false ? '❌ Failed' : '⏳ Not tested'}
            </p>
            <p>
              <strong>Signature: </strong>
              {testResults.signature === true ? '✅ Success' : 
               testResults.signature === false ? '❌ Failed' : '⏳ Not tested'}
            </p>
            <p>
              <strong>Debug Endpoint: </strong>
              {testResults.debugEndpoint === true ? '✅ Success' : 
               testResults.debugEndpoint === false ? '❌ Failed' : '⏳ Not tested'}
            </p>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Current Status</h2>
          <div className="bg-gray-800 p-2 rounded mb-4">
            <p><strong>Address:</strong> {walletAuth.address || 'Not connected'}</p>
            <p><strong>Authenticated:</strong> {walletAuth.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Wallet Type:</strong> {walletAuth.walletType}</p>
            <p><strong>Error:</strong> {walletAuth.error || 'None'}</p>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Connection Logs</h2>
          <div className="bg-black text-green-400 p-2 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {logs.length === 0 && <div className="text-gray-500">No logs yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
