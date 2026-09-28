/**
 * Google Identity Services Integration (Zero external npm libraries)
 * Loads official Google SDK dynamically and initiates popup authentication.
 */

let gsiScriptPromise = null;

export function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is not defined'));
  if (window.google?.accounts) return Promise.resolve(window.google.accounts);

  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        if (window.google?.accounts) {
          resolve(window.google.accounts);
        } else {
          existingScript.addEventListener('load', () => resolve(window.google?.accounts));
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Google SDK')));
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts) {
          resolve(window.google.accounts);
        } else {
          reject(new Error('Google Identity Services SDK failed to initialize'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
      document.head.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

/**
 * Triggers Google Sign-In popup flow and resolves with { credential } or { accessToken }
 * @param {string} [customClientId] Optional client ID override
 * @returns {Promise<{ credential?: string, accessToken?: string }>}
 */
export async function triggerGoogleSignIn(customClientId) {
  const googleClientId =
    customClientId ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId.trim() === '' || googleClientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    throw new Error(
      'Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in Life-OS-frontend-/.env'
    );
  }

  const accounts = await loadGoogleScript();

  return new Promise((resolve, reject) => {
    try {
      // Primary: OAuth 2.0 Token Client (reliable popup for custom buttons)
      if (accounts.oauth2?.initTokenClient) {
        const client = accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error || 'Google login cancelled'));
            } else if (response.access_token) {
              resolve({ accessToken: response.access_token });
            } else {
              reject(new Error('No access token received from Google'));
            }
          },
          error_callback: (err) => {
            reject(new Error(err?.message || 'Google Sign-In prompt failed to open'));
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } else if (accounts.id) {
        // Fallback: Google ID Token flow
        accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              resolve({ credential: response.credential });
            } else {
              reject(new Error('No credential received from Google'));
            }
          }
        });
        accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In prompt was dismissed or blocked'));
          }
        });
      } else {
        reject(new Error('Google Identity Services SDK is unavailable'));
      }
    } catch (err) {
      reject(err);
    }
  });
}
