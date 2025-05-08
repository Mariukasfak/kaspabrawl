import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AutoLoginButton from '../components/AutoLoginButton';
import config from '../config';

export default function AutoLoginExample() {
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
  const [loggedInAddress, setLoggedInAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState({ kaspa: '0.00', brawl: '0.00' });
  
  // Handle successful login
  const handleLoginSuccess = (address: string) => {
    setLoggedInAddress(address);
    
    // Simulate fetching balances
    setTimeout(() => {
      setBalances({
        kaspa: '1000.00',
        brawl: '50.00'
      });
    }, 500);
  };
  
  useEffect(() => {
    // Check if automatic authentication is enabled in config
    setAutoLoginEnabled(config.autoAuthentication);
  }, []);
  
  return (
    <Layout title="Auto Login Example - Kaspa Brawl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">Automatic Login Example</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Settings</h2>
          
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="auto-login-toggle"
              checked={autoLoginEnabled}
              onChange={(e) => setAutoLoginEnabled(e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="auto-login-toggle">
              Enable automatic login without confirmation
            </label>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg mb-6">
            <p className="text-yellow-300 text-sm mb-2">⚠️ Warning</p>
            <p className="text-sm text-gray-300">
              Automatic login should only be used for testing purposes or environments
              where security is less critical. In production, always require user confirmation
              for wallet actions.
            </p>
          </div>
          
          <div className="flex justify-center">
            <AutoLoginButton 
              autoLoginEnabled={autoLoginEnabled}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
        
        {loggedInAddress && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <p className="font-mono text-sm break-all">{loggedInAddress}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Balances</h3>
                <div className="flex justify-between mb-2">
                  <span>KASPA:</span>
                  <span>{balances.kaspa}</span>
                </div>
                <div className="flex justify-between">
                  <span>BRAWL:</span>
                  <span>{balances.brawl}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
