import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import {
  getCookieConsent,
  setCookieConsent,
  hasUserConsented,
  type CookieConsent,
} from "@/lib/cookies";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });

  useEffect(() => {
    // Only show banner if user hasn't consented yet
    if (!hasUserConsented()) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      preferences: true,
      marketing: true,
    };
    setCookieConsent(newConsent);
    setIsOpen(false);
  };

  const handleAcceptNecessary = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
    };
    setCookieConsent(newConsent);
    setIsOpen(false);
  };

  const handleCustomConsent = () => {
    // Ensure necessary is always true
    const newConsent = { ...consent, necessary: true };
    setCookieConsent(newConsent);
    setIsOpen(false);
  };

  const handleConsentChange = (key: keyof CookieConsent, value: boolean) => {
    if (key === "necessary") return; // Never allow disabling necessary cookies
    setConsent((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-950 max-w-4xl mx-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Cookie Consent
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
                Please review our{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
                {" "}for more details.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Close cookie consent"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-4 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Checkbox
                    checked={consent.necessary}
                    disabled
                    id="necessary"
                  />
                  <Label
                    htmlFor="necessary"
                    className="font-medium cursor-not-allowed opacity-75"
                  >
                    Necessary Cookies
                  </Label>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-8">
                  Essential for the site to function. These cannot be disabled.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Checkbox
                    id="analytics"
                    checked={consent.analytics}
                    onCheckedChange={(checked) =>
                      handleConsentChange("analytics", checked as boolean)
                    }
                  />
                  <Label htmlFor="analytics" className="font-medium cursor-pointer">
                    Analytics Cookies
                  </Label>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-8">
                  Help us understand how you use the site to improve performance.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Checkbox
                    id="preferences"
                    checked={consent.preferences}
                    onCheckedChange={(checked) =>
                      handleConsentChange("preferences", checked as boolean)
                    }
                  />
                  <Label htmlFor="preferences" className="font-medium cursor-pointer">
                    Preference Cookies
                  </Label>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-8">
                  Remember your settings and preferences for a better experience.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Checkbox
                    id="marketing"
                    checked={consent.marketing}
                    onCheckedChange={(checked) =>
                      handleConsentChange("marketing", checked as boolean)
                    }
                  />
                  <Label htmlFor="marketing" className="font-medium cursor-pointer">
                    Marketing Cookies
                  </Label>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-8">
                  Used to track your interests and show relevant content.
                </p>
              </div>
            </div>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 font-medium"
          >
            {showDetails ? "Hide" : "Show"} Details
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleAcceptNecessary}
              className="border-slate-300 dark:border-slate-700"
            >
              Reject All
            </Button>

            {showDetails && (
              <Button variant="outline" onClick={handleCustomConsent}>
                Save Preferences
              </Button>
            )}

            <Button onClick={handleAcceptAll} className="bg-blue-600 hover:bg-blue-700">
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
