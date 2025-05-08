import React, { useEffect } from 'react';
import { AlertProps } from '../types/index';

const Alert: React.FC<AlertProps> = ({ message, type = 'error', onDismiss }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [onDismiss]);
  
  // Determine colors based on type
  let bgColor = 'bg-red-900';
  let textColor = 'text-white';
  let borderColor = 'border-red-700';
  
  if (type === 'success') {
    bgColor = 'bg-green-900';
    borderColor = 'border-green-700';
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-800';
    borderColor = 'border-yellow-700';
  } else if (type === 'info') {
    bgColor = 'bg-blue-900';
    borderColor = 'border-blue-700';
  }
  
  return (
    <div className={`${bgColor} ${textColor} border-b ${borderColor} text-center py-2 text-sm relative`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex-grow">{message}</div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="ml-4 text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
