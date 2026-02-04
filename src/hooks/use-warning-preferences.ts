import { useState, useCallback } from 'react';

export interface WarningPreferences {
  showIndividualMergeWarning: boolean;
  showBulkMergeWarning: boolean;
  showRestoreWarning: boolean;
}

const STORAGE_KEY = 'mergematch_warning_preferences';

const DEFAULT_PREFERENCES: WarningPreferences = {
  showIndividualMergeWarning: true,
  showBulkMergeWarning: true,
  showRestoreWarning: true,
};

function loadPreferences(): WarningPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any missing keys from future updates
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load warning preferences:', e);
  }
  return DEFAULT_PREFERENCES;
}

export function useWarningPreferences() {
  const [preferences, setPreferencesState] = useState<WarningPreferences>(loadPreferences);

  const setPreference = useCallback(<K extends keyof WarningPreferences>(
    key: K,
    value: WarningPreferences[K]
  ) => {
    setPreferencesState(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save warning preferences:', e);
      }
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    } catch (e) {
      console.warn('Failed to reset warning preferences:', e);
    }
    setPreferencesState(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, setPreference, resetPreferences };
}
