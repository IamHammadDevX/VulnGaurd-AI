/**
 * Cookie consent management utilities
 */

export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
};

const CONSENT_KEY = "cookie-consent";
const CONSENT_EXPIRY_DAYS = 365;

export function getCookieConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const expiry = localStorage.getItem(`${CONSENT_KEY}-expiry`);

    if (expiry && new Date(expiry) < new Date()) {
      // Expired, clear it
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(`${CONSENT_KEY}-expiry`);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);

  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  localStorage.setItem(`${CONSENT_KEY}-expiry`, expiry.toISOString());
}

export function hasUserConsented(): boolean {
  return getCookieConsent() !== null;
}

export function revokeCookieConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(`${CONSENT_KEY}-expiry`);
}
