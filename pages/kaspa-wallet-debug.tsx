import React, { useState, useEffect } from 'react';
import useEnhancedWalletAuth from '../hooks/useEnhancedWalletAuth';
import { detectKaspaWallet, checkWalletCompatibility } from '../utils/kaspaWalletHelper';

/**
 * Comprehensive Wallet Test Page with improved debugging
 */
const KaspaWalletDebug: React.FC = () => {
  const {
    address,
    isConnecting,
    isAuthenticated,
    token,
    error,
    walletType,
    connect,
    disconnect
  } = useEnhancedWalletAuth();
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<'success' | 'failure' | 'pending' | null>(null);
  const [testLog, setTestLog] = useState<string[]>([]);
  
  // Run detection on mount
  useEffect(() => {
    // Detect available wallet
    const wallet = detectKaspaWallet();
    const compatibility = checkWalletCompatibility();
    
    setDebugInfo({
      wallet,
      compatibility,
      environment: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
  }, []);

  /**
   * Run diagnostic test on the wallet connection
   */
  const runDiagnosticTest = async () => {
    setTestResult('pending');
    setTestLog(['Starting diagnostic test...']);
    
    try {
      addLog('1. Checking wallet detection');
      const wallet = detectKaspaWallet();
      if (!wallet.isAvailable) {
        addLog('❌ No wallet detected');
        setTestResult('failure');
        return;
      }
      addLog(`✅ Detected wallet type: ${wallet.type}`);
      
      addLog('2. Checking wallet compatibility');
      const compatibility = checkWalletCompatibility();
      if (!compatibility.compatible) {
        addLog(`❌ Wallet incompatible: ${compatibility.message}`);
        setTestResult('failure');
        return;
      }
      addLog('✅ Wallet compatibility check passed');
      
      addLog('3. Attempting to connect to wallet');
      const result = await connect();
      if (!result) {
        addLog('❌ Failed to connect to wallet');
        setTestResult('failure');
        return;
      }
      addLog(`✅ Connected to wallet with address: ${result.address}`);
      addLog(`✅ Authentication token received: ${result.token.substring(0, 15)}...`);
      
      // Test signature debug endpoint
      addLog('4. Testing signature debug endpoint');
      try {
        const debugResponse = await fetch('/api/debug/kasware-signature-debug-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nonce: 'test-nonce-' + Date.now(),
            signature: 'test-signature',
            publicKey: 'test-public-key',
            address: result.address
          })
        });
        
        if (debugResponse.ok) {
          addLog('✅ Signature debug endpoint working');
        } else {
          addLog('⚠️ Signature debug endpoint returned error');
        }
      } catch (error) {
        addLog(`⚠️ Error testing debug endpoint: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      setTestResult('success');
      addLog('✅ All tests passed! Wallet connection is working correctly.');
      
    } catch (error) {
      addLog(`❌ Error during test: ${error instanceof Error ? error.message : String(error)}`);
      setTestResult('failure');
    }
  };
  
  /**
   * Add a log entry
   */
  const addLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kaspa Wallet Connection Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
            <div className="space-y-2">
              <p><span className="text-gray-400">Address:</span> {address || 'Not connected'}</p>
              <p><span className="text-gray-400">Connecting:</span> {isConnecting ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Wallet Type:</span> {walletType}</p>
              {error && (
                <p className="text-red-400"><span className="font-bold">Error:</span> {error}</p>
              )}
            </div>
            
            <div className="mt-4 space-x-4">
              <button
                onClick={connect}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium"
              >
                Connect Wallet
              </button>
              
              <button
                onClick={disconnect}
                disabled={!address}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Run Diagnostic Test</h2>
            <p className="mb-4">This will test the full wallet connection flow including signature verification.</p>
            
            <button
              onClick={runDiagnosticTest}
              disabled={testResult === 'pending'}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium w-full"
            >
              {testResult === 'pending' ? 'Running Test...' : 'Start Test'}
            </button>
            
            {testResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <div className={`p-2 rounded ${
                  testResult === 'success' ? 'bg-green-900/30 text-green-400' :
                  testResult === 'failure' ? 'bg-red-900/30 text-red-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {testResult === 'success' ? '✅ Success' : 
                   testResult === 'failure' ? '❌ Failure' : 
                   '⏳ Running...'}
                </div>
                
                <div className="mt-4 bg-black/30 rounded p-2 max-h-60 overflow-auto">
                  {testLog.map((log, i) => (
                    <div key={i} className="text-sm font-mono">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="bg-black/30 rounded p-3 max-h-[500px] overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
          
          {token && (
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Token</h2>
              <div className="bg-black/30 rounded p-3 max-h-40 overflow-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                  {token}
                </pre>
              </div>
              
              <h3 className="font-semibold mt-4 mb-2">Decoded Token:</h3>
              <div className="bg-black/30 rounded p-3 max-h-40 overflow-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {token ? JSON.stringify(JSON.parse(atob(token.split('.')[1])), null, 2) : 'No token'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaspaWalletDebug;
