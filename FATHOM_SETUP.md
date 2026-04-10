# 📊 Fathom Analytics Setup - Quick Guide

## ✅ Implementation Complete!

Fathom Analytics has been integrated into VulnGuard AI. It's 100% free and privacy-first.

---

## 🚀 3-Step Setup (5 minutes)

### Step 1: Create Free Fathom Account
1. Go to **[usefathom.com](https://usefathom.com)**
2. Click **"Start Free"** (no credit card needed)
3. Fill in email and password
4. Verify your email

### Step 2: Add Your Site
1. In Fathom dashboard, click **"Add Site"**
2. Enter your domain: `vulnguard.ai` (or your production domain)
3. Copy your **Site ID** (looks like: `ABC123XYZ`)

### Step 3: Update Your Code
In `artifacts/vulnguard/index.html`, replace `YOUR-SITE-ID` with your actual Site ID:

```html
<!-- Before: -->
<script defer data-site="YOUR-SITE-ID" src="https://cdn.usefathom.com/script.js"></script>

<!-- After: -->
<script defer data-site="ABC123XYZ" src="https://cdn.usefathom.com/script.js"></script>
```

---

## ✅ Done!

That's it! Your analytics are now active.

---

## 🧪 Test It

```bash
pnpm --filter @workspace/vulnguard run dev
```

1. Go to http://localhost:5173
2. Accept analytics in the cookie consent banner
3. Sign up, run a scan, download a report
4. Check [Fathom Dashboard](https://app.usefathom.com) in 2-5 minutes

---

## 📊 What You'll See

In your Fathom dashboard:

**Real-time data:**
- Active visitors
- Current page views
- Page view trends

**Events tracked:**
- `user_signup` (email, google, github)
- `user_login` (with auth method)
- `scan_started` (with file size)
- `scan_completed` (with findings, risk score, duration)
- `report_downloaded`
- `faq_viewed`
- `contact_page_visited`
- `cookie_consent_*` events

---

## 🎯 Free Plan Limits

| Feature | Limit | Notes |
|---------|-------|-------|
| Monthly Pageviews | 100,000 | More than enough for launch |
| Sites | Unlimited | Host multiple products |
| Events | Unlimited | Track as much as you want |
| Data Retention | Unlimited | Keep historical data forever |
| Cost | **$0** | Free forever (no trial ending) |

---

## 📈 Key Metrics to Watch

### Week 1 (Launch)
- Total visitors
- Signup funnel (signup attempts → completions)
- Top pages

### Week 2+
- Scan completion rate
- Feature engagement (which features users use)
- Support page effectiveness

---

## 🔒 Privacy & Compliance

✅ **GDPR Compliant** — No personal data, no cookies
✅ **Privacy-First** — European company, strong privacy
✅ **Cookie Consent** — Respects your cookie settings in VulnGuard
✅ **No Tracking** — Just analytics, no behavioral tracking

---

## 🔧 Customization

### Add Custom Event (Anywhere in React)

```typescript
import { trackEvent } from "@/lib/analytics";

// In a button click:
const handleCustomAction = () => {
  trackEvent("custom_event_name", { detail: "value" });
};
```

### Modify Existing Events

Edit `artifacts/vulnguard/src/lib/analytics.ts` to change event names or properties.

---

## 📞 Support

- **Fathom Help**: https://usefathom.com/support
- **Fathom Docs**: https://usefathom.com/docs
- **Dashboard**: https://app.usefathom.com

---

## 💡 Pro Tips

1. **Custom Dashboard**: Create custom dashboards in Fathom for specific metrics
2. **Alerts**: Set up email alerts for traffic spikes
3. **Custom Goals**: Create "goals" for key actions (signups, scans, etc.)
4. **Public Stats**: Share public analytics page with your team

---

## 🆓 Why Fathom?

✅ **100% Free** — No credit card, no trial ending
✅ **Simple** — Works out of the box, minimal setup
✅ **Privacy** — GDPR compliant, no cookies
✅ **Powerful** — Unlimited events and sites
✅ **Fast** — Real-time data
✅ **Beautiful** — Clean, modern dashboard

---

## Next Steps

1. ✅ Create Fathom account
2. ✅ Copy your Site ID
3. ✅ Update `index.html`
4. ✅ Start app and test
5. ✅ Check dashboard in 2-5 minutes

**Questions?** Check the [FAQ](#faq) below.

---

## ❓ FAQ

**Q: Will my local dev send data to Fathom?**
A: No, localhost doesn't work with domain tracking. Data only comes from production.

**Q: Can I test locally?**
A: Yes, data will appear when you deploy to production domain.

**Q: What if I exceed 100K pageviews?**
A: After 100K/month, Fathom may throttle data. Upgrade to paid plan (or wait for next month).

**Q: Can I change my domain later?**
A: Yes, create a new site in Fathom and update your Site ID.

**Q: Is my data safe?**
A: Yes, Fathom stores data in EU (GDPR compliant servers) and only you can access it.

---

**Status**: 🟢 **READY TO USE** — Just add your Site ID and go!
