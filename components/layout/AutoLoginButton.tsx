import { useEffect } from 'react';
import useAutoWalletAuth from '../../hooks/useAutoWalletAuth';

interface AutoLoginButtonProps {
  autoLoginEnabled?: boolean;
  onLoginSuccess?: (address: string) => void;
}

/**
 * A button component that can automatically log the user in without requiring confirmation
 * This is useful for testing environments or situations where security is less critical
 */
const AutoLoginButton: React.FC<AutoLoginButtonProps> = ({ 
  autoLoginEnabled = false,
  onLoginSuccess 
}) => {
  const { address, isConnecting, error, autoConnect, disconnect } = useAutoWalletAuth();
  
  // Automatically log in if enabled
  useEffect(() => {
    if (autoLoginEnabled && !address && !isConnecting) {
      autoConnect().then(result => {
        if (result?.address && onLoginSuccess) {
          onLoginSuccess(result.address);
        }
      });
    }
  }, [autoLoginEnabled, address, isConnecting, autoConnect, onLoginSuccess]);
  
  return (
    <div className="auto-login-container">
      {!address ? (
        <button
          onClick={autoConnect}
          disabled={isConnecting}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {isConnecting ? 'Connecting...' : 'Auto Login'}
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-sm mb-2">
            Auto-logged in as: <span className="font-mono">{address.slice(0, 8)}...{address.slice(-6)}</span>
          </p>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
          >
            Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default AutoLoginButton;
