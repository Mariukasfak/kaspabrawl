import React from 'react';
import Spinner from './Spinner';

interface TokenBadgeProps {
  symbol: string;
  amount: string;
  isLoading?: boolean;
}

const TokenBadge: React.FC<TokenBadgeProps> = ({ symbol, amount, isLoading = false }) => {
  return (
    <div className="wallet-badge relative bg-gray-800 px-3 py-1 rounded-md flex items-center">
      <span className="text-purple-400 mr-1">{symbol}:</span>
      <span>{isLoading ? '...' : amount}</span>
      {isLoading && (
        <span className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <Spinner size="sm" color="text-purple-500" />
        </span>
      )}
    </div>
  );
};

export default TokenBadge;
