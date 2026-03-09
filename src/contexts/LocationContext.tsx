import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
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
  // Stats
  lastWebhookAt: string | null;
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
  lastWebhookAt: null,
});

// Allowed origins for postMessage communication with the CRM parent frame
const CRM_ORIGINS = [
  'https://app.leadconnectorhq.com',
  'https://app.gohighlevel.com',
  'https://highlevel.com',
  'https://leadconnectorhq.com',
];

// Primary CRM origin
const PRIMARY_CRM_ORIGIN = 'https://app.leadconnectorhq.com';

function isCrmOrigin(origin: string): boolean {
  return CRM_ORIGINS.some(allowed => origin.startsWith(allowed));
}

// Determine the parent CRM origin from referrer
function getParentCrmOrigin(): string {
  try {
    const referrer = document.referrer;
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const referrerOrigin = referrerUrl.origin;
      const matchedOrigin = CRM_ORIGINS.find(allowed => referrerOrigin.startsWith(allowed));
      if (matchedOrigin) {
        return referrerOrigin;
      }
    }
  } catch {
    // Ignore URL parsing errors
  }
  return PRIMARY_CRM_ORIGIN;
}

// Extract locationId from URL/referrer
function extractLocationId(): string | null {
  // 1. Check query params
  const params = new URLSearchParams(window.location.search);
  const queryLocationId = params.get('locationId') || params.get('location_id');
  if (queryLocationId) {
    console.log('📍 Found locationId in query params:', queryLocationId);
    return queryLocationId;
  }

  // 2. Check URL path (CRM pattern: /v2/location/{locationId}/...)
  const pathPatterns = [
    /\/v2\/location\/([a-zA-Z0-9]+)/,
    /\/location\/([a-zA-Z0-9]+)/,
  ];
  for (const pattern of pathPatterns) {
    const match = window.location.pathname.match(pattern);
    if (match) {
      console.log('📍 Found locationId in URL path:', match[1]);
      return match[1];
    }
  }

  // 3. Check referrer (parent iframe URL)
  if (document.referrer) {
    try {
      const referrerPatterns = [
        /\/v2\/location\/([a-zA-Z0-9]+)/,
        /\/location\/([a-zA-Z0-9]+)/,
        /locationId=([a-zA-Z0-9]+)/,
      ];
      for (const pattern of referrerPatterns) {
        const match = document.referrer.match(pattern);
        if (match) {
          console.log('📍 Found locationId in referrer:', match[1]);
          return match[1];
        }
      }
    } catch (e) {
      console.warn('Failed to parse referrer');
    }
  }

  // 4. Check localStorage as last resort
  const storedLocationId = localStorage.getItem('ghl_location_id');
  if (storedLocationId) {
    console.log('📍 Using cached locationId:', storedLocationId);
    return storedLocationId;
  }

  return null;
}

// Request encrypted user data from CRM parent via postMessage
async function requestCrmUserData(): Promise<string> {
  return new Promise((resolve) => {
    // Skip if not in iframe
    if (window.parent === window) {
      console.log('Not in iframe, skipping postMessage');
      resolve('');
      return;
    }

    const timeout = setTimeout(() => {
      console.warn('postMessage timeout - no response from parent');
      resolve('');
    }, 5000);

    const messageHandler = (event: MessageEvent) => {
      // Validate origin
      if (!isCrmOrigin(event.origin)) {
        return;
      }

      if (event.data?.message === 'REQUEST_USER_DATA_RESPONSE') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        resolve(event.data.payload || '');
      }
    };

    window.addEventListener('message', messageHandler);
    // SECURITY: Use specific CRM origin instead of wildcard '*'
    const targetOrigin = getParentCrmOrigin();
    window.parent.postMessage({ message: 'REQUEST_USER_DATA' }, targetOrigin);
  });
}

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
  const [lastWebhookAt, setLastWebhookAt] = useState<string | null>(null);

  const canUseStrategies = plan === 'pro' || plan === 'agency';

  const markTokenExpired = useCallback(() => {
    setConnectionStatus('token_expired');
    setError('Token expired. Please reconnect your CRM.');
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      // Check for OAuth callback params
      const params = new URLSearchParams(window.location.search);
      const exchangeCode = params.get('code');
      const installed = params.get('installed');
      const oauthError = params.get('error');

      // Handle OAuth error
      if (oauthError) {
        setIsLoading(false);
        setConnectionStatus('error');
        setError(`OAuth error: ${oauthError}`);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Handle agency (bulk) install — show success toast and auto-close
      const isAgencyInstall = params.get('agency');
      if (installed === 'true' && isAgencyInstall === 'true' && !exchangeCode) {
        window.history.replaceState({}, '', window.location.pathname);
        toast.success('App installed successfully! Open MergeMatch from within your sub-account to get started.');
        setTimeout(() => window.close(), 3000);
        setIsLoading(false);
        return;
      }

      // If we got an exchange code from OAuth callback, exchange it for tokens
      // This is the secure POST redirect flow - tokens never appear in URL
      if (exchangeCode && installed === 'true') {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/auth/exchange-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: exchangeCode }),
          });

          if (response.ok) {
            const data = await response.json();
            api.setTokens({
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            });
            if (data.location_id) {
              localStorage.setItem('ghl_location_id', data.location_id);
            }
            window.history.replaceState({}, '', window.location.pathname);

            // If this is a standalone tab (not iframe), the user came here via
            // OAuth redirect from the install flow. Show success and close so
            // they return to the CRM tab where the app iframe will re-auth.
            if (window.parent === window) {
              toast.success('App installed successfully! You can close this tab.');
              setTimeout(() => window.close(), 2000);
              setIsLoading(false);
              return;
            }
          } else {
            setError('Authentication failed. Please try again.');
            setConnectionStatus('error');
            window.history.replaceState({}, '', window.location.pathname);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          setError('Authentication failed. Please try again.');
          setConnectionStatus('error');
          window.history.replaceState({}, '', window.location.pathname);
          setIsLoading(false);
          return;
        }
      }

      // Try SSO flow if in iframe (CRM custom page)
      const isInIframe = window.parent !== window;

      if (isInIframe) {
        // Request encrypted user data from CRM parent
        const encryptedData = await requestCrmUserData();
        const fallbackLocationId = extractLocationId();

        // Call backend app-context endpoint
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/auth/app-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encryptedData: encryptedData || '',
            locationId: fallbackLocationId || '',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ SSO authentication successful:', data.location?.id);

          // Store JWT tokens from SSO response
          if (data.access_token && data.refresh_token) {
            api.setTokens({
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            });
          }

          // Cache locationId
          if (data.location?.id) {
            localStorage.setItem('ghl_location_id', data.location.id);
          }

          setIsAuthenticated(true);
          setLocationId(data.location?.id || null);
          setLocationName(data.location?.name || null);
          setPlan((data.plan as Plan) || 'free');
          setConnectionStatus('connected');
          setError(null);
          setIsOnTrial(data.is_on_trial || false);
          setTrialEndsAt(data.trial_ends_at || null);
          setUpgradeUrl(data.upgrade_url || null);
          setLastWebhookAt(data.last_webhook_at || null);
          if (data.features) {
            setFeatures(data.features);
          }
          setIsLoading(false);
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('⚠️ SSO failed:', errorData);

          if (response.status === 422 && errorData.detail?.error === 'app_not_installed') {
            setConnectionStatus('disconnected');
            setError('App not installed. Please install from the Marketplace.');
          } else {
            // Fall through to try regular auth
          }
        }
      }

      // Regular auth flow (not in iframe or SSO failed)
      if (api.hasTokens()) {
        const result = await api.checkAuth();
        if (result?.authenticated) {
          setIsAuthenticated(true);
          setLocationId(result.location_id);
          setPlan((result.plan as Plan) || 'free');
          setLocationName(result.location_name || null);
          setConnectionStatus('connected');
          setError(null);
          // Billing info from /me endpoint
          if (result.is_on_trial !== undefined) {
            setIsOnTrial(result.is_on_trial || false);
          }
          if (result.trial_ends_at !== undefined) {
            setTrialEndsAt(result.trial_ends_at || null);
          }
          if (result.upgrade_url !== undefined) {
            setUpgradeUrl(result.upgrade_url || null);
          }
          if (result.last_webhook_at !== undefined) {
            setLastWebhookAt(result.last_webhook_at || null);
          }
          if (result.features) {
            setFeatures(result.features);
          }
        } else {
          setConnectionStatus('disconnected');
          setError('Not authenticated. Please install the app from the Marketplace.');
        }
      } else {
        setConnectionStatus('disconnected');
        setError('No location ID. Please install the app from the Marketplace.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (import.meta.env.DEV) {
        // Dev mode - allow access for testing
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
    // OAuth flow requires full page navigation - can't run in iframe
    // Open in new tab, or navigate parent if in iframe
    if (window.parent !== window) {
      // In iframe - open in new tab (parent navigation blocked by CRM)
      window.open(installUrl, '_blank');
    } else {
      window.location.href = installUrl;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up global 401 handler
  useEffect(() => {
    api.setOnUnauthorized(markTokenExpired);
  }, [markTokenExpired]);

  // Re-check auth when the tab regains focus (e.g. after OAuth completes in a new tab)
  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        (connectionStatus === 'disconnected' || connectionStatus === 'error')
      ) {
        checkAuth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [connectionStatus, checkAuth]);

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
      lastWebhookAt,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
