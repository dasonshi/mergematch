import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

interface LocationContextType {
  locationId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  plan: Plan;
  canUseStrategies: boolean;
}

const LocationContext = createContext<LocationContextType>({
  locationId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  plan: 'free',
  canUseStrategies: false,
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>('free');

  // Plans that can use custom merge strategies
  const canUseStrategies = plan !== 'free';

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
          setPlan((result.plan as Plan) || 'free');
        } else {
          setError('Not authenticated. Please install the app from GHL.');
        }
      } catch {
        // In development, allow unauthenticated access for testing
        if (import.meta.env.DEV) {
          setIsAuthenticated(true);
          setPlan('pro'); // Dev mode gets pro features
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
    <LocationContext.Provider value={{ locationId, isAuthenticated, isLoading, error, plan, canUseStrategies }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
