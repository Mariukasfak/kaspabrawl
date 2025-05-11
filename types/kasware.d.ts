interface Window {
  kasware?: {
    requestAccounts: () => Promise<string[]>;
    signMessage: (message: string) => Promise<{
      signature: string;
      publicKey: string;
      address: string;
    }>;
  };
}
