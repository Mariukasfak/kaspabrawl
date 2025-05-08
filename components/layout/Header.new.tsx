import { useRef } from 'react';
import Link from 'next/link';
import useWalletAuth from '../../hooks/useWalletAuth';
import TokenBadge from '../ui/TokenBadge';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';

const Header: React.FC = () => {
  const { 
    address, 
    isConnecting,
    isLoadingBalance,
    error,
    isGuest,
    connectWallet, 
    disconnectWallet,
    connectAsGuest,
    refreshBalances,
    kaspaBalance,
    brawlBalance,
    isWalletAvailable
  } = useWalletAuth();
  
  const refreshBtnRef = useRef<HTMLButtonElement>(null);
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Handle refreshing balances with animation
  const handleRefreshBalances = async () => {
    if (refreshBtnRef.current) {
      refreshBtnRef.current.classList.add('animate-spin');
    }
    
    await refreshBalances();
    
    if (refreshBtnRef.current) {
      refreshBtnRef.current.classList.remove('animate-spin');
    }
  };
  
  return (
    <header className="bg-gray-900 py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors">
            Kaspa Brawl
          </Link>
        </div>
        
        <div className="flex space-x-4 items-center">
          {address ? (
            <>
              <div className="flex space-x-2">
                <TokenBadge 
                  symbol="KASPA" 
                  amount={kaspaBalance} 
                  isLoading={isLoadingBalance} 
                />
                <TokenBadge 
                  symbol="$BRAWL" 
                  amount={brawlBalance} 
                  isLoading={isLoadingBalance} 
                />
                <button
                  ref={refreshBtnRef}
                  onClick={handleRefreshBalances}
                  disabled={isLoadingBalance}
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  title="Refresh balances"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-300">
                  {isGuest ? (
                    <span className="bg-yellow-800 px-2 py-1 rounded text-xs mr-1">GUEST</span>
                  ) : null}
                  {address && formatAddress(address)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-gray-400 hover:text-gray-200"
                >
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={connectWallet}
                disabled={isConnecting || !isWalletAvailable}
                className="kaspa-button relative"
              >
                {isConnecting ? (
                  <span className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Connecting...
                  </span>
                ) : !isWalletAvailable ? (
                  'KasWare Not Found'
                ) : (
                  'Connect Wallet'
                )}
              </button>
              
              <button
                onClick={connectAsGuest}
                disabled={isConnecting}
                className="border border-purple-600 text-purple-400 hover:bg-purple-900 hover:text-white font-bold py-2 px-4 rounded transition-all duration-200"
              >
                Play as Guest
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <Alert 
          message={`Error: ${error}`} 
          type="error" 
          onDismiss={() => {
            // We don't need to set state here because the error auto-clears after 5 seconds
          }} 
        />
      )}
      
      {!isWalletAvailable && !isGuest && !address && (
        <Alert
          message="KasWare wallet extension not detected. Install it to connect with your Kaspa wallet."
          type="warning"
        />
      )}
    </header>
  );
};

export default Header;
