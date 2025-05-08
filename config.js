/**
 * Application configuration
 * Different settings can be applied depending on the environment
 */

const environment = process.env.NODE_ENV || 'development';

const config = {
  // Common configuration for all environments
  common: {
    appName: 'Kaspa Brawl',
    apiBaseUrl: '/api',
  },
  
  // Development-specific configuration
  development: {
    debug: true,
    autoAuthentication: true,   // Enable automatic authentication without confirmation
    mockBalances: true,
    nonceExpiryMinutes: 30,     // Longer expiry for testing
  },
  
  // Production-specific configuration
  production: {
    debug: false,
    autoAuthentication: false,  // Disable automatic authentication in production
    mockBalances: false,
    nonceExpiryMinutes: 10,
  },
  
  // Test-specific configuration
  test: {
    debug: true,
    autoAuthentication: true,
    mockBalances: true,
    nonceExpiryMinutes: 60,
  }
};

// Export the configuration for the current environment
module.exports = {
  ...config.common,
  ...config[environment],
  environment
};
