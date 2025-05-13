/**
 * KaspaWallet Compatibility Helper
 * Provides utilities to work with different versions of KaspaWallet/Kasware
 */

// Types for wallet objects
export type KaspaWalletApi = {
  connect: () => Promise<{ address: string }>;
  disconnect: () => void;
  signMessage?: (message: string) => Promise<{ signature: string }>;
};

export type KaswareApi = {
  requestAccounts: () => Promise<string[]>;
  signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
  getPublicKey: () => Promise<string>;
  getBalance?: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>;
};

export type DetectedWallet = {
  type: 'kaspaWallet' | 'kasware' | 'none';
  api: KaspaWalletApi | KaswareApi | null;
  address: string | null;
  isAvailable: boolean;
};

/**
 * Detect available Kaspa wallet
 * This function checks for different versions of KaspaWallet/Kasware
 * and returns the appropriate API
 */
export function detectKaspaWallet(): DetectedWallet {
  // Only run in browser
  if (typeof window === 'undefined') {
    return { type: 'none', api: null, address: null, isAvailable: false };
  }

  // Check for KaspaWallet (older version)
  if ('kaspaWallet' in window) {
    console.log('Detected kaspaWallet extension');
    return {
      type: 'kaspaWallet',
      api: (window as any).kaspaWallet as KaspaWalletApi,
      address: null, // Will be set after connecting
      isAvailable: true
    };
  }

  // Check for Kasware (newer version)
  if ('kasware' in window) {
    console.log('Detected kasware extension');
    return {
      type: 'kasware',
      api: (window as any).kasware as KaswareApi,
      address: null, // Will be set after connecting
      isAvailable: true
    };
  }

  console.log('No Kaspa wallet extension detected');
  return { type: 'none', api: null, address: null, isAvailable: false };
}

/**
 * Connect to the detected wallet
 * @param wallet The detected wallet
 * @returns The wallet address if connection successful
 */
export async function connectToWallet(wallet: DetectedWallet): Promise<string | null> {
  if (!wallet.isAvailable || !wallet.api) {
    console.error('No wallet available to connect');
    return null;
  }

  try {
    if (wallet.type === 'kaspaWallet') {
      const { address } = await (wallet.api as KaspaWalletApi).connect();
      return address;
    } else if (wallet.type === 'kasware') {
      const accounts = await (wallet.api as KaswareApi).requestAccounts();
      return accounts && accounts.length > 0 ? accounts[0] : null;
    }
    return null;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
}

/**
 * Sign a message with the detected wallet
 * @param wallet The detected wallet
 * @param message The message to sign
 * @returns The signature object
 */
export async function signWithWallet(
  wallet: DetectedWallet, 
  message: string, 
  address: string
): Promise<{ signature: string; publicKey?: string; address: string } | null> {
  if (!wallet.isAvailable || !wallet.api) {
    console.error('No wallet available to sign message');
    return null;
  }

  try {
    if (wallet.type === 'kaspaWallet') {
      const kaspaWalletApi = wallet.api as KaspaWalletApi;
      
      if (!kaspaWalletApi.signMessage) {
        console.error('KaspaWallet does not support signMessage');
        return null;
      }
      
      const { signature } = await kaspaWalletApi.signMessage(message);
      
      // Validate signature
      if (!signature || typeof signature !== 'string' || signature.length < 10) {
        console.error('Invalid signature received from KaspaWallet', signature);
        return null;
      }
      
      console.log(`KaspaWallet signature received (${signature.length} chars): ${signature.substring(0, 15)}...`);
      return { signature, address }; // Use the provided address
    } else if (wallet.type === 'kasware') {
      try {
        console.log('Requesting signature from Kasware wallet...');
        console.log('Message to sign:', message.substring(0, 20) + (message.length > 20 ? '...' : ''));
        
        // According to KasWare docs, signMessage returns a string
        const signature = await (wallet.api as KaswareApi).signMessage(message);
        
        // Enhanced validation for signature
        if (!signature) {
          console.error('Wallet returned empty signature');
          return null;
        }
        
        // Get the public key separately
        console.log('Requesting public key from Kasware wallet...');
        const publicKey = await (wallet.api as KaswareApi).getPublicKey();
        
        // Log the raw result for debugging
        console.log('Signature received:', signature ? `${signature.substring(0, 15)}... (${signature.length} chars)` : 'EMPTY');
        console.log('Public key received:', publicKey ? `${publicKey.substring(0, 15)}... (${publicKey.length} chars)` : 'EMPTY');
        
        // Create a validated result object with the signature and public key
        const validatedResult = {
          signature: signature || '',
          publicKey: publicKey || '',
          address: address // Use the address that was passed in
        };
        
        // Log the result for debugging
        console.log('Processed signature:', validatedResult.signature ? 
          `${validatedResult.signature.substring(0, 15)}... (${validatedResult.signature.length} chars)` : 'Empty');
        
        // Make absolutely sure we have a signature
        if (!validatedResult.signature || typeof validatedResult.signature !== 'string' || validatedResult.signature.length < 10) {
          console.error('Empty or invalid signature received from wallet');
          return null;
        }
        
        return validatedResult;
      } catch (walletError) {
        console.error('Error from wallet while signing:', walletError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error signing message with wallet:', error);
    return null;
  }
}

/**
 * Check if wallet is available in the current environment
 */
export function isWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'kaspaWallet' in window || 'kasware' in window;
}

/**
 * Check if the wallet extension is the correct version
 * This helps detect potential version incompatibilities
 * @returns Information about wallet compatibility
 */
export function checkWalletCompatibility(): { 
  compatible: boolean; 
  walletType: string; 
  message: string;
  recommendedAction: string;
} {
  // Only run in browser
  if (typeof window === 'undefined') {
    return { 
      compatible: false, 
      walletType: 'none', 
      message: 'Cannot check wallet in server environment',
      recommendedAction: 'Try refreshing the page'
    };
  }
  
  // Check for KaspaWallet
  if ('kaspaWallet' in window) {
    const kaspaWallet = (window as any).kaspaWallet;
    
    // Check for critical methods
    if (!kaspaWallet.connect || !kaspaWallet.signMessage) {
      return {
        compatible: false,
        walletType: 'kaspaWallet',
        message: 'KaspaWallet extension found but appears to be outdated or incompatible',
        recommendedAction: 'Please update your KaspaWallet extension to the latest version'
      };
    }
    
    return {
      compatible: true,
      walletType: 'kaspaWallet',
      message: 'KaspaWallet extension detected and compatible',
      recommendedAction: 'You can connect with KaspaWallet'
    };
  }
  
  // Check for Kasware
  if ('kasware' in window) {
    const kasware = (window as any).kasware;
    
    // Check for critical methods
    if (!kasware.requestAccounts || !kasware.signMessage) {
      return {
        compatible: false,
        walletType: 'kasware',
        message: 'Kasware extension found but appears to be outdated or incompatible',
        recommendedAction: 'Please update your Kasware extension to the latest version'
      };
    }
    
    return {
      compatible: true,
      walletType: 'kasware',
      message: 'Kasware extension detected and compatible',
      recommendedAction: 'You can connect with Kasware'
    };
  }
  
  // No wallet found
  return {
    compatible: false,
    walletType: 'none',
    message: 'No Kaspa wallet extension detected',
    recommendedAction: 'Please install KaspaWallet or Kasware extension'
  };
}

export default {
  detectKaspaWallet,
  connectToWallet,
  signWithWallet,
  isWalletAvailable,
  checkWalletCompatibility
};
