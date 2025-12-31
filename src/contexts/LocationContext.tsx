import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface LocationContextType {
  locationId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  locationId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for location_id (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const urlLocationId = params.get('location_id');

    if (urlLocationId) {
      api.setLocationId(urlLocationId);
      setLocationId(urlLocationId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Try to get from localStorage
      const storedId = api.getLocationId();
      if (storedId) {
        setLocationId(storedId);
      }
    }

    // Verify authentication
    const checkAuth = async () => {
      try {
        const result = await api.checkAuth();
        if (result?.authenticated) {
          setIsAuthenticated(true);
        } else {
          setError('Not authenticated. Please install the app from GHL.');
        }
      } catch {
        // In development, allow unauthenticated access for testing
        if (import.meta.env.DEV) {
          setIsAuthenticated(true);
        } else {
          setError('Authentication failed.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (api.getLocationId()) {
      checkAuth();
    } else {
      setIsLoading(false);
      setError('No location ID. Please install the app from GHL.');
    }
  }, []);

  return (
    <LocationContext.Provider value={{ locationId, isAuthenticated, isLoading, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
