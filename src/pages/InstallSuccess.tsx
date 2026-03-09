import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function InstallSuccess() {
  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setStatus('success');
      return;
    }

    // Exchange the code for tokens in the background
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/auth/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          api.setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          });
          if (data.location_id) {
            localStorage.setItem('ghl_location_id', data.location_id);
          }
        }
        setStatus('success');
      })
      .catch(() => {
        setErrorMsg('Could not complete setup. Please close this tab and try again from within your account.');
        setStatus('error');
      });

    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => window.close(), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center max-w-md px-6">
        {status === 'exchanging' && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Setting up MergeMatch...
            </h1>
            <p className="text-gray-500">Just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              MergeMatch Installed
            </h1>
            <p className="text-gray-500">
              You can close this tab and open MergeMatch from within your account to get started.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              This tab will close automatically...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
