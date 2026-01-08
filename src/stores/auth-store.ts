import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Auth Store - Zustand store for managing authentication preferences
 * 
 * This store manages:
 * - rememberMe: Whether the user wants to stay logged in
 * - loginExpiry: Timestamp when the login session expires (7 days if rememberMe is true)
 * 
 * Uses localStorage for persistence with 7-day expiry for "remember me" sessions.
 */

interface AuthState {
  rememberMe: boolean;
  loginExpiry: number | null;
  
  // Actions
  setRememberMe: (remember: boolean) => void;
  setLoginExpiry: () => void;
  clearAuth: () => void;
  isSessionValid: () => boolean;
}

// 7 days in milliseconds
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      rememberMe: false,
      loginExpiry: null,

      /**
       * Set the remember me preference
       */
      setRememberMe: (remember: boolean) => {
        set({ rememberMe: remember });
      },

      /**
       * Set login expiry to 7 days from now (only if rememberMe is true)
       */
      setLoginExpiry: () => {
        const state = get();
        if (state.rememberMe) {
          set({ loginExpiry: Date.now() + SEVEN_DAYS_MS });
        } else {
          // If not remembering, set expiry to null (session-only)
          set({ loginExpiry: null });
        }
      },

      /**
       * Clear auth state (on logout or session expiry)
       */
      clearAuth: () => {
        set({ rememberMe: false, loginExpiry: null });
      },

      /**
       * Check if the current session is still valid
       * Returns true if:
       * - rememberMe is true AND loginExpiry is in the future
       * - OR rememberMe is false (handled by session storage separately)
       */
      isSessionValid: () => {
        const state = get();
        
        // If not using remember me, session validity is handled elsewhere
        if (!state.rememberMe) {
          return false;
        }
        
        // Check if expiry exists and is in the future
        if (state.loginExpiry && state.loginExpiry > Date.now()) {
          return true;
        }
        
        // Session expired, clear auth
        if (state.loginExpiry && state.loginExpiry <= Date.now()) {
          set({ rememberMe: false, loginExpiry: null });
        }
        
        return false;
      },
    }),
    {
      name: 'linkpro-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        loginExpiry: state.loginExpiry,
      }),
    }
  )
);

// Selector hooks
export const useRememberMe = () => useAuthStore((state) => state.rememberMe);
export const useIsSessionValid = () => useAuthStore((state) => state.isSessionValid());

// Action hooks
export const useAuthActions = () => useAuthStore((state) => ({
  setRememberMe: state.setRememberMe,
  setLoginExpiry: state.setLoginExpiry,
  clearAuth: state.clearAuth,
  isSessionValid: state.isSessionValid,
}));
