# Analytics & Event Tracking Implementation Guide

This guide will help you add user event tracking and page analytics to VulnGuard AI.

## Overview

There are two types of analytics to implement:

1. **User Event Tracking** — Track specific user actions (signup, first scan, etc.)
2. **Page Analytics** — Track page views and navigation patterns

---

## Option 1: Plausible Analytics (Recommended for GDPR Compliance)

**Pros:** Privacy-first, GDPR compliant, respects DNT, no cookie consent needed
**Cons:** Paid service (starts at $9/mo)

### Installation

```bash
pnpm add plausible
```

### Implementation

Create `artifacts/vulnguard/src/lib/analytics.ts`:

```typescript
import { getCookieConsent } from "./cookies";

// Initialize Plausible
export function initPlausuible() {
  const consent = getCookieConsent();
  
  // Plausible is privacy-first, doesn't require cookies
  // Insert this in your HTML head instead via index.html
  return true;
}

// Track custom events
export function trackEvent(eventName: string, props?: Record<string, string | number>) {
  const consent = getCookieConsent();
  
  // Only track if user hasn't rejected analytics
  if (consent && !consent.analytics) return;
  
  if (typeof window !== "undefined" && "plausible" in window) {
    (window as any).plausible?.(eventName, { props });
  }
}
```

### Setup in HTML

In `artifacts/vulnguard/index.html`, add:

```html
<head>
  <!-- Place this before closing </head> -->
  <script defer data-domain="vulnguard.ai" src="https://plausible.io/js/script.js"></script>
</head>
```

### Usage in React Components

```typescript
import { trackEvent } from "@/lib/analytics";

// Track signup
const handleSignup = async (email: string) => {
  trackEvent("signup", { email_domain: email.split("@")[1] });
};

// Track first scan
const handleScan = async () => {
  trackEvent("scan_start");
};

// Track scan completion
const handleScanComplete = () => {
  trackEvent("scan_complete", { 
    vulnerability_count: foundCount,
    risk_score: riskScore 
  });
};
```

---

## Option 2: Mixpanel (Advanced Analytics)

**Pros:** Rich feature set, cohort analysis, funnels, retention
**Cons:** Paid service, requires cookie consent setup

### Installation

```bash
pnpm add @mixpanel/browser
```

### Implementation

Create `artifacts/vulnguard/src/lib/analytics.ts`:

```typescript
import mixpanel from "@mixpanel/browser";
import { getCookieConsent } from "./cookies";

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

export function initMixpanel() {
  const consent = getCookieConsent();
  
  mixpanel.init(TOKEN, {
    track_pageview: false, // We'll do manual tracking
    persistence: "localStorage",
    opt_out_tracking_by_default: !consent?.analytics,
  });
}

// Check if analytics allowed
function analyticsEnabled(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics ?? false;
}

// Track user
export function identifyUser(userId: string, properties = {}) {
  if (!analyticsEnabled()) return;
  mixpanel.identify(userId);
  mixpanel.people.set(properties);
}

// Track events
export function trackEvent(eventName: string, properties = {}) {
  if (!analyticsEnabled()) return;
  mixpanel.track(eventName, properties);
}

// Page view tracking
export function trackPageView(pageName: string, properties = {}) {
  if (!analyticsEnabled()) return;
  mixpanel.track("Page View", { page: pageName, ...properties });
}

export function resetUser() {
  mixpanel.reset();
}
```

### Setup Environment Variables

Add to `.env.example` and `.env`:

```env
VITE_MIXPANEL_TOKEN=your_token_here
```

### Usage in React

```typescript
import { useAuth } from "@workspace/replit-auth-web";
import { useEffect } from "react";
import { trackEvent, trackPageView, identifyUser } from "@/lib/analytics";

export function App() {
  const { isAuthenticated, user } = useAuth();
  
  // Identify logged-in users
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      identifyUser(user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [isAuthenticated, user]);
  
  // Track page views
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);
}
```

---

## Option 3: Supabase Custom Events (Free, Self-Hosted)

**Pros:** Free, you control the data, integrates with your existing DB
**Cons:** More manual setup, less UI for analysis

### Implementation

Create `artifacts/vulnguard/src/lib/analytics.ts`:

```typescript
import { getCookieConsent } from "./cookies";

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export async function trackEvent(
  eventName: string,
  userId?: string,
  properties?: Record<string, any>
) {
  const consent = getCookieConsent();
  
  if (!consent?.analytics) return;
  
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        user_id: userId,
        properties,
        timestamp: new Date(),
        page_url: window.location.href,
      }),
    });
  } catch (err) {
    console.error("Failed to track event:", err);
  }
}
```

Add API endpoint in `artifacts/api-server/src/routes/`:

Create `events.ts`:

```typescript
import { Router } from "express";
import { db } from "@workspace/db";

const router = Router();

router.post("/events", async (req, res) => {
  const { event_name, user_id, properties, timestamp, page_url } = req.body;
  
  try {
    // Insert into analytics_events table (needs to be created in db schema)
    await db.insert(analyticsEventsTable).values({
      eventName: event_name,
      userId: user_id || null,
      properties,
      timestamp: new Date(timestamp),
      pageUrl: page_url,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to log event:", err);
    res.status(500).json({ error: "Failed to log event" });
  }
});

export default router;
```

---

## Key Events to Track

### User Journey
```typescript
// Signup
trackEvent("user_signup", userId, { method: "email" | "github" | "google" });

// First login
trackEvent("first_login", userId);

// Profile completion
trackEvent("profile_completed", userId, { fields: ["firstName", "lastName"] });
```

### Feature Usage
```typescript
// Scan events
trackEvent("scan_started", userId, { contract_size: byteSize });
trackEvent("scan_completed", userId, { 
  duration_seconds: scanTime,
  vulnerabilities_found: vulnCount,
  risk_score: riskScore 
});

// Report generation
trackEvent("report_downloaded", userId, { format: "pdf" });

// Team features
trackEvent("team_created", userId);
trackEvent("team_member_invited", userId, { email: memberEmail });
```

### Engagement
```typescript
// Feature views
trackEvent("viewed_feature", userId, { feature: "severity_chart" });

// Support interaction
trackEvent("support_contacted", userId, { topic: "bug_report" });
trackEvent("faq_viewed", userId, { question_id: faqId });
```

### Navigation
```typescript
// Page views automatically tracked or:
trackPageView("/dashboard", { tab: "active_scans" });
trackPageView("/support", { section: "faq" });
```

---

## Integration with Cookie Consent

The cookie consent component from `CookieConsent.tsx` stores user preferences. All analytics should respect this:

```typescript
import { getCookieConsent } from "@/lib/cookies";

function shouldTrack(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics ?? false;
}

// Only send events if analytics consent given
if (shouldTrack()) {
  trackEvent("some_event", userId, { ...props });
}
```

---

## Dashboard Setup

### Plausible Dashboard
1. Create account at plausible.io
2. Add your domain
3. View real-time stats, sources, pages, goals

### Mixpanel Dashboard
1. Create account at mixpanel.com
2. Get project token
3. Set up funnels, cohorts, retention analysis

### Supabase Custom Analytics
1. Create `analytics_events` table in Drizzle schema
2. Query with SQL: `SELECT * FROM analytics_events WHERE event_name = 'scan_completed'`
3. Build dashboards with any BI tool (Metabase, Grafana, etc.)

---

## Recommended Event Tracking Priorities

### Phase 1 (Week 1)
- ✅ User signup/login
- ✅ First scan completion
- ✅ Page views

### Phase 2 (Week 2)
- ✅ All feature usage
- ✅ Report generation
- ✅ Support interactions

### Phase 3 (Month 1)
- ✅ Funnels (signup → first scan)
- ✅ Retention cohorts
- ✅ Feature adoption rates

---

## Privacy & GDPR Compliance

### Ensure Your Analytics Platform:
- ✅ Respects cookie consent settings
- ✅ Doesn't track unless user opted in
- ✅ IP anonymization
- ✅ No third-party data sharing (unless explicitly listed in Privacy Policy)

### Update Privacy Policy
Add to `/artifacts/vulnguard/src/pages/Privacy.tsx`:

```markdown
### Analytics Tools
We use [Plausible/Mixpanel/Custom] analytics to understand how users interact 
with our service. Analytics collection respects your cookie preferences. 
You can disable analytics by managing your cookie consent.
```

---

## Status

🟡 **Not yet implemented** — Ready to add!

**Recommendation**: Start with Plausible for simplicity and GDPR compliance.

---

## Quick Setup Checklist

- [ ] Choose analytics platform (Plausible recommended)
- [ ] Install SDK
- [ ] Create `artifacts/vulnguard/src/lib/analytics.ts`
- [ ] Integrate with `CookieConsent.tsx` component
- [ ] Add test events to key flows
- [ ] Set up dashboard
- [ ] Configure environment variables
- [ ] Test in production mode
- [ ] Monitor data collection

**Questions?** Check the documentation for your chosen platform!
