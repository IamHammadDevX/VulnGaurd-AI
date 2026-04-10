# 📊 Umami Analytics Setup - Quick Guide

## ✅ Implementation Complete!

Umami Analytics has been integrated into VulnGuard AI. It's 100% free and privacy-first, with optional self-hosting.

---

## 🚀 3-Step Setup (5 minutes)

### Step 1: Create Free Umami Cloud Account
1. Go to **[cloud.umami.is](https://cloud.umami.is)** (or self-host if preferred)
2. Click **"Sign Up"** (no credit card needed)
3. Fill in email and password
4. Verify your email

### Step 2: Add Your Site
1. In Umami dashboard, click **"Add Website"**
2. Enter your domain: `vulnguard.ai` (or your production domain)
3. Copy your **Website ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 3: Update Your Code
In `artifacts/vulnguard/index.html`, replace `YOUR-WEBSITE-ID` with your actual Website ID:

```html
<!-- Before: -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="YOUR-WEBSITE-ID"></script>

<!-- After: -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></script>
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
4. Check [Umami Dashboard](https://cloud.umami.is) in 2-5 minutes

---

## 📊 What You'll See

In your Umami dashboard:

**Real-time data:**
- Active visitors
- Current page views
- Traffic overview

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

## 🎯 Free Plan Limits (Cloud)

| Feature | Limit | Notes |
|---------|-------|-------|
| Monthly Pageviews | Unlimited | No limits on cloud |
| Sites | 3 | More than enough for launch |
| Events | Unlimited | Track as much as you want |
| Data Retention | 365 days | Plenty of history |
| Cost | **$0** | Free tier available |

**Note:** Umami also offers self-hosting option if you need more sites or infinite retention.

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
✅ **Analytics Only** — No behavioral tracking, just analytics

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

- **Umami GitHub**: https://github.com/umami-software/umami
- **Umami Docs**: https://umami.is/docs
- **Dashboard**: https://cloud.umami.is

---

## 💡 Pro Tips

1. **Custom Reports**: Create custom dashboards in Umami for specific metrics
2. **Alerts**: Set up email alerts for traffic changes
3. **Goals**: Create "goals" for key actions (signups, scans, etc.)
4. **Public Stats**: Share public analytics page with your team

---

## 🆓 Why Umami?

✅ **100% Free** — Cloud tier available, no credit card
✅ **Open Source** — Full transparency, community-driven
✅ **Privacy** — GDPR compliant, no cookies
✅ **Powerful** — Unlimited events and custom properties
✅ **Fast** — Real-time data with minimal overhead
✅ **Beautiful** — Clean, modern dashboard
✅ **Flexible** — Cloud hosted or self-hosted option

---

## Self-Hosting Option

Want to self-host for maximum control?

```bash
git clone https://github.com/umami-software/umami.git
cd umami
# Follow docs at https://umami.is/docs/getting-started
```

Self-hosted Umami gives you:
- Unlimited sites
- Full data ownership
- Custom domain
- No data limits

---

## Next Steps

1. ✅ Create Umami account (cloud.umami.is)
2. ✅ Copy your Website ID
3. ✅ Update `index.html`
4. ✅ Start app and test
5. ✅ Check dashboard in 2-5 minutes

**Questions?** Check the [FAQ](#faq) below.

---

## ❓ FAQ

**Q: Will my local dev send data to Umami?**
A: No, localhost doesn't work with domain tracking. Data only comes from production.

**Q: Can I test locally?**
A: Yes, data will appear when you deploy to production domain.

**Q: What's the difference between cloud and self-hosted?**
A: Cloud = managed by Umami (easiest), Self-hosted = you run it (most control).

**Q: Can I change my domain later?**
A: Yes, create a new website in Umami or update the ID.

**Q: Is my data safe?**
A: Yes, Umami is GDPR compliant and only you can access your data.

**Q: Can I export my data?**
A: Yes, Umami provides data export options.

---

**Status**: 🟢 **READY TO USE** — Just add your Website ID and go!
