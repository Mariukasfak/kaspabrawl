interface Window {
  kasware?: {
    requestAccounts: () => Promise<string[]>;
    signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
    getPublicKey: () => Promise<string>;
    getBalance?: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>;
  };
}
