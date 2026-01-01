import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

type Plan = 'free' | 'starter' | 'pro' | 'enterprise';
type ConnectionStatus = 'connecting' | 'connected' | 'token_expired' | 'disconnected' | 'error';

interface LocationContextType {
  locationId: string | null;
  locationName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  plan: Plan;
  canUseStrategies: boolean;
  connectionStatus: ConnectionStatus;
  markTokenExpired: () => void;
  reconnect: () => void;
}

const LocationContext = createContext<LocationContextType>({
  locationId: null,
  locationName: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  plan: 'free',
  canUseStrategies: false,
  connectionStatus: 'connecting',
  markTokenExpired: () => {},
  reconnect: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>('free');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  const canUseStrategies = plan !== 'free';

  const markTokenExpired = useCallback(() => {
    setConnectionStatus('token_expired');
    setError('Token expired. Please reconnect to GoHighLevel.');
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    try {
      const result = await api.checkAuth();
      if (result?.authenticated) {
        setIsAuthenticated(true);
        setPlan((result.plan as Plan) || 'free');
        setLocationName(result.location_name || null);
        setConnectionStatus('connected');
        setError(null);
      } else {
        setConnectionStatus('disconnected');
        setError('Not authenticated. Please install the app from GHL.');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        setIsAuthenticated(true);
        setPlan('pro');
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setError('Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    const installUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/install`;
    window.location.href = installUrl;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLocationId = params.get('location_id');

    if (urlLocationId) {
      api.setLocationId(urlLocationId);
      setLocationId(urlLocationId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const storedId = api.getLocationId();
      if (storedId) {
        setLocationId(storedId);
      }
    }

    if (api.getLocationId()) {
      checkAuth();
    } else {
      setIsLoading(false);
      setConnectionStatus('disconnected');
      setError('No location ID. Please install the app from GHL.');
    }
  }, [checkAuth]);

  // Set up global 401 handler
  useEffect(() => {
    api.setOnUnauthorized(markTokenExpired);
  }, [markTokenExpired]);

  return (
    <LocationContext.Provider value={{
      locationId,
      locationName,
      isAuthenticated,
      isLoading,
      error,
      plan,
      canUseStrategies,
      connectionStatus,
      markTokenExpired,
      reconnect,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
