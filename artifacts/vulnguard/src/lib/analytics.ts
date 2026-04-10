/**
 * Analytics utility - Umami Analytics integration
 * Privacy-first, GDPR-compliant analytics that respects cookie consent
 * Switched to Umami (100% free, self-hosted or cloud)
 */

import { getCookieConsent } from "./cookies";

declare global {
  interface Window {
    umami?: {
      trackEvent: (name: string, data?: Record<string, string | number | boolean>) => void;
      trackPage: (url?: string) => void;
    };
  }
}

/**
 * Initialize Umami analytics
 * Umami is privacy-first and GDPR-compliant
 * The script is loaded asynchronously in index.html
 */
export function initUmami() {
  if (typeof window === "undefined") return false;
  return "umami" in window;
}

/**
 * Track custom event
 * Only tracks if analytics consent is given
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;

  const consent = getCookieConsent();

  // Only track if user hasn't explicitly rejected analytics
  if (consent && !consent.analytics) return;

  // Umami is loaded asynchronously
  if (typeof window.umami?.trackEvent === "function") {
    try {
      // Umami trackEvent signature: trackEvent(name, data)
      const propsToSend = props
        ? Object.fromEntries(
            Object.entries(props)
              .filter(([, v]) => v !== null && v !== undefined)
              .map(([k, v]) => [k, v])
          )
        : {};

      window.umami.trackEvent(eventName, propsToSend);
    } catch (e) {
      console.error("Umami tracking error:", e);
    }
  }
}

/**
 * Track page view (automatic with Umami, explicit tracking also available)
 */
export function trackPageView(pageName: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  const consent = getCookieConsent();
  if (consent && !consent.analytics) return;

  try {
    // Umami tracks pages automatically via trackPage
    // Manual tracking is optional
    if (typeof window.umami?.trackPage === "function") {
      window.umami.trackPage();
    }
  } catch (e) {
    console.error("Umami page view error:", e);
  }
}

// ── User Journey Events ──

export const userEvents = {
  signup: (method: "email" | "github" | "google" | "magic-link") => {
    trackEvent("user_signup", { method });
  },

  login: (method: "email" | "github" | "google" | "magic-link") => {
    trackEvent("user_login", { method });
  },

  passwordReset: () => {
    trackEvent("password_reset_requested");
  },

  profileCompleted: (fields: string[]) => {
    trackEvent("profile_completed", { fields: fields.join(",") });
  },
};

// ── Scan Events ──

export const scanEvents = {
  started: (sizeKB: number) => {
    trackEvent("scan_started", { size_kb: sizeKB });
  },

  completed: (vulnerabilityCount: number, riskScore: number, durationSeconds: number) => {
    trackEvent("scan_completed", {
      vulnerabilities: vulnerabilityCount,
      risk_score: riskScore,
      duration_seconds: durationSeconds,
    });
  },

  failed: (error: string) => {
    trackEvent("scan_failed", { error });
  },

  charCodeLoaded: (contractName: string) => {
    trackEvent("contract_code_loaded", { contract_name: contractName });
  },

  exampleLoaded: (exampleName: string) => {
    trackEvent("example_contract_loaded", { example: exampleName });
  },
};

// ── Report Events ──

export const reportEvents = {
  downloaded: (format: "pdf") => {
    trackEvent("report_downloaded", { format });
  },

  fixGenerated: (vulnerabilityId: string) => {
    trackEvent("fix_generated", { vulnerability_id: vulnerabilityId });
  },

  fixCopied: () => {
    trackEvent("fix_code_copied");
  },
};

// ── Team Events ──

export const teamEvents = {
  created: () => {
    trackEvent("team_created");
  },

  memberInvited: () => {
    trackEvent("team_member_invited");
  },

  switched: () => {
    trackEvent("team_switched");
  },
};

// ── Feature Engagement ──

export const engagementEvents = {
  featureViewed: (featureName: string) => {
    trackEvent("feature_viewed", { feature: featureName });
  },

  supportContacted: (topic: string) => {
    trackEvent("support_contacted", { topic });
  },

  faqViewed: (question: string) => {
    trackEvent("faq_viewed", { question });
  },

  documentationViewed: (docName: string) => {
    trackEvent("documentation_viewed", { doc: docName });
  },

  privacyPolicyViewed: () => {
    trackEvent("privacy_policy_viewed");
  },

  termsViewed: () => {
    trackEvent("terms_viewed");
  },
};

// ── Cookie Consent Events ──

export const consentEvents = {
  accepted: (categories: { analytics: boolean; marketing: boolean; preferences: boolean }) => {
    trackEvent("cookie_consent_accepted", {
      analytics: categories.analytics ? "yes" : "no",
      marketing: categories.marketing ? "yes" : "no",
      preferences: categories.preferences ? "yes" : "no",
    });
  },

  rejected: () => {
    trackEvent("cookie_consent_rejected");
  },

  customized: () => {
    trackEvent("cookie_consent_customized");
  },
};

export default {
  initUmami,
  trackEvent,
  trackPageView,
  userEvents,
  scanEvents,
  reportEvents,
  teamEvents,
  engagementEvents,
  consentEvents,
};
