import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

type Plan = 'free' | 'starter' | 'pro' | 'agency';
type ConnectionStatus = 'connecting' | 'connected' | 'token_expired' | 'disconnected' | 'error';

interface PlanFeatures {
  unlimited_merges: boolean;
  auto_merge: boolean;
  scheduled_scans: boolean;
  company_matching: boolean;
  white_label: boolean;
}

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
  // Billing
  isOnTrial: boolean;
  trialEndsAt: string | null;
  upgradeUrl: string | null;
  features: PlanFeatures;
}

const defaultFeatures: PlanFeatures = {
  unlimited_merges: false,
  auto_merge: false,
  scheduled_scans: false,
  company_matching: false,
  white_label: false,
};

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
  isOnTrial: false,
  trialEndsAt: null,
  upgradeUrl: null,
  features: defaultFeatures,
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>('free');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);
  const [features, setFeatures] = useState<PlanFeatures>(defaultFeatures);

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
        setLocationId(result.location_id);
        setPlan((result.plan as Plan) || 'free');
        setLocationName(result.location_name || null);
        setConnectionStatus('connected');
        setError(null);
        // Billing info
        setIsOnTrial(result.is_on_trial || false);
        setTrialEndsAt(result.trial_ends_at || null);
        setUpgradeUrl(result.upgrade_url || null);
        if (result.features) {
          setFeatures(result.features);
        }
      } else {
        setConnectionStatus('disconnected');
        setError('Not authenticated. Please install the app from GHL.');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        setIsAuthenticated(true);
        setPlan('pro');
        setConnectionStatus('connected');
        setFeatures({
          unlimited_merges: true,
          auto_merge: true,
          scheduled_scans: true,
          company_matching: true,
          white_label: false,
        });
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

    // Check for JWT tokens from OAuth callback (new method)
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    // Also check for legacy location_id
    const urlLocationId = params.get('location_id');

    // Handle error from OAuth
    const oauthError = params.get('error');
    if (oauthError) {
      setIsLoading(false);
      setConnectionStatus('error');
      setError(`OAuth error: ${oauthError}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // If we received JWT tokens, store them (preferred method)
    if (accessToken && refreshToken) {
      api.setTokens({ accessToken, refreshToken });
      // Clean up URL immediately (tokens in URL are sensitive)
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Also store legacy location_id for backward compatibility
    else if (urlLocationId) {
      api.setLocationId(urlLocationId);
      setLocationId(urlLocationId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Try to load from localStorage
      const storedId = api.getLocationId();
      if (storedId) {
        setLocationId(storedId);
      }
    }

    // Check if we have any auth method available
    if (api.hasTokens()) {
      checkAuth();
    } else {
      setIsLoading(false);
      setConnectionStatus('disconnected');
      setError('No authentication found. Please install the app from GHL.');
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
      isOnTrial,
      trialEndsAt,
      upgradeUrl,
      features,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
