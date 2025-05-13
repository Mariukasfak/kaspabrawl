/**
 * SaveSystem - Handles persistence of fighter data
 * Supports both local storage (for guest users) and MongoDB (for authenticated users)
 */

import { Fighter } from '../types/fighter';

// Keys for local storage
const STORAGE_KEY = 'kaspa_brawl_fighter';
const GUEST_STORAGE_KEY = 'kaspa_brawl_guest_fighter';

// Error types for better error handling
export enum SaveErrorType {
  STORAGE_UNAVAILABLE = 'storage_unavailable',
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Error class for save operations
export class SaveError extends Error {
  type: SaveErrorType;
  
  constructor(message: string, type: SaveErrorType) {
    super(message);
    this.type = type;
    this.name = 'SaveError';
  }
}

// Main save system class
export class SaveSystem {
  /**
   * Save fighter data to persistent storage
   * @param fighter - Fighter data to save
   * @param isAuthenticated - Whether the user is authenticated
   * @param walletAddress - Optional wallet address for authenticated users
   * @returns Promise that resolves when save is complete
   * @throws SaveError if save fails
   */
  static async saveFighter(fighter: Fighter, isAuthenticated: boolean, walletAddress?: string): Promise<void> {
    try {
      if (isAuthenticated && walletAddress) {
        // Save to database via API for authenticated users
        const response = await fetch('/api/fighters/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fighter,
            walletAddress
          })
        });
        
        if (!response.ok) {
          // Handle different error types based on response status
          if (response.status === 401) {
            throw new SaveError('Authentication required to save fighter data', SaveErrorType.AUTHENTICATION_ERROR);
          } else if (response.status === 400) {
            throw new SaveError('Invalid fighter data', SaveErrorType.VALIDATION_ERROR);
          } else {
            throw new SaveError(`Failed to save fighter data: ${response.statusText}`, SaveErrorType.NETWORK_ERROR);
          }
        }
      } else {
        // Save to local storage for guest users
        if (typeof window === 'undefined') {
          throw new SaveError('Cannot save fighter in server environment', SaveErrorType.STORAGE_UNAVAILABLE);
        }
        
        try {
          const storageKey = isAuthenticated ? STORAGE_KEY : GUEST_STORAGE_KEY;
          localStorage.setItem(storageKey, JSON.stringify(fighter));
        } catch (err) {
          throw new SaveError('Failed to save to local storage. Storage may be full or disabled', SaveErrorType.STORAGE_UNAVAILABLE);
        }
      }
      
      console.log('Fighter saved successfully:', fighter.name);
    } catch (err) {
      // Re-throw SaveError instances
      if (err instanceof SaveError) {
        throw err;
      }
      
      // Wrap other errors
      console.error('Error saving fighter:', err);
      throw new SaveError(
        `Unexpected error saving fighter data: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        SaveErrorType.UNKNOWN_ERROR
      );
    }
  }
  
  /**
   * Load fighter data from persistent storage
   * @param isAuthenticated - Whether the user is authenticated
   * @param walletAddress - Optional wallet address for authenticated users
   * @returns Fighter data or null if not found
   * @throws SaveError if load fails
   */
  static async loadFighter(isAuthenticated: boolean, walletAddress?: string): Promise<Fighter | null> {
    try {
      if (isAuthenticated && walletAddress) {
        // Load from database via API for authenticated users
        const response = await fetch(`/api/fighters/load?walletAddress=${encodeURIComponent(walletAddress)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No fighter found is not an error
            return null;
          }
          
          // Handle different error types
          if (response.status === 401) {
            throw new SaveError('Authentication required to load fighter data', SaveErrorType.AUTHENTICATION_ERROR);
          } else {
            throw new SaveError(`Failed to load fighter data: ${response.statusText}`, SaveErrorType.NETWORK_ERROR);
          }
        }
        
        const data = await response.json();
        return data.fighter;
      } else {
        // Load from local storage for guest users
        if (typeof window === 'undefined') {
          return null; // Cannot load from localStorage on server
        }
        
        try {
          const storageKey = isAuthenticated ? STORAGE_KEY : GUEST_STORAGE_KEY;
          const fighterData = localStorage.getItem(storageKey);
          
          if (!fighterData) {
            return null;
          }
          
          return JSON.parse(fighterData);
        } catch (err) {
          console.warn('Failed to load from local storage:', err);
          return null;
        }
      }
    } catch (err) {
      // Re-throw SaveError instances
      if (err instanceof SaveError) {
        throw err;
      }
      
      // Wrap other errors
      console.error('Error loading fighter:', err);
      throw new SaveError(
        `Unexpected error loading fighter data: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        SaveErrorType.UNKNOWN_ERROR
      );
    }
  }
  
  /**
   * Check if a saved fighter exists
   * @param isAuthenticated - Whether the user is authenticated
   * @param walletAddress - Optional wallet address for authenticated users
   * @returns True if fighter exists
   */
  static async hasSavedFighter(isAuthenticated: boolean, walletAddress?: string): Promise<boolean> {
    try {
      if (isAuthenticated && walletAddress) {
        // Check database via API for authenticated users
        const response = await fetch(`/api/fighters/exists?walletAddress=${encodeURIComponent(walletAddress)}`);
        if (!response.ok) {
          return false;
        }
        
        const data = await response.json();
        return data.exists;
      } else {
        // Check local storage for guest users
        if (typeof window === 'undefined') {
          return false; // Cannot check localStorage on server
        }
        
        const storageKey = isAuthenticated ? STORAGE_KEY : GUEST_STORAGE_KEY;
        return localStorage.getItem(storageKey) !== null;
      }
    } catch (err) {
      console.error('Error checking if fighter exists:', err);
      return false;
    }
  }
  
  /**
   * Delete a saved fighter
   * @param isAuthenticated - Whether the user is authenticated
   * @param walletAddress - Optional wallet address for authenticated users
   * @returns True if deletion was successful
   */
  static async deleteSavedFighter(isAuthenticated: boolean, walletAddress?: string): Promise<boolean> {
    try {
      if (isAuthenticated && walletAddress) {
        // Delete from database via API for authenticated users
        const response = await fetch('/api/fighters/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            walletAddress
          })
        });
        
        return response.ok;
      } else {
        // Delete from local storage for guest users
        if (typeof window === 'undefined') {
          return false; // Cannot modify localStorage on server
        }
        
        const storageKey = isAuthenticated ? STORAGE_KEY : GUEST_STORAGE_KEY;
        localStorage.removeItem(storageKey);
        return true;
      }
    } catch (err) {
      console.error('Error deleting fighter:', err);
      return false;
    }
  }
}
