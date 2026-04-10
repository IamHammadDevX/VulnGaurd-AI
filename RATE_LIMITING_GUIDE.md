# Rate Limiting Implementation Guide

This guide will help you add rate limiting to VulnGuard AI to prevent brute force attacks and abuse.

## Installation

```bash
pnpm add express-rate-limit
pnpm add -D @types/express-rate-limit
```

## Step 1: Create Rate Limiting Middleware

Create `artifacts/api-server/src/middlewares/rateLimitMiddleware.ts`:

```typescript
import rateLimit from "express-rate-limit";
import { type Request, type Response, type NextFunction } from "express";

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  skip: (req: Request) => {
    // Skip rate limiting for authenticated users with high limits
    return req.isAuthenticated() === false && false; // Customize as needed
  },
});

// Auth rate limiter: 5 attempts per 15 minutes (brute force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req: Request) => {
    // Use email as key if available, otherwise IP
    const email = (req.body?.email as string) || req.ip;
    return email;
  },
});

// Scan rate limiter: 10 scans per 15 minutes per user
export const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many scans. Please wait before scanning again.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip || "unknown";
  },
  skip: (req: Request) => {
    // Allow unlimited scans for admin users
    return (req.user as any)?.role === "admin";
  },
});

// Reset password limiter: 3 attempts per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset attempts, please try again later.",
  keyGenerator: (req: Request) => {
    return (req.body?.email as string) || req.ip;
  },
});
```

## Step 2: Apply Middleware to Routes

### For Auth Routes

Modify `artifacts/api-server/src/routes/auth.ts`:

```typescript
import { Router, type IRouter, type Request, type Response } from "express";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimitMiddleware";

const router: IRouter = Router();

// Apply auth limiter to login/signup attempts
router.post("/auth/login", authLimiter, async (req: Request, res: Response) => {
  // ... existing login logic
});

router.post("/auth/signup", authLimiter, async (req: Request, res: Response) => {
  // ... existing signup logic
});

router.post("/auth/password-reset", passwordResetLimiter, async (req: Request, res: Response) => {
  // ... existing password reset logic
});

export default router;
```

### For API Routes

Modify `artifacts/api-server/src/app.ts`:

```typescript
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import { apiLimiter, scanLimiter } from "./middlewares/rateLimitMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ... existing middleware ...

// Apply general API rate limiter
app.use("/api/", apiLimiter);

// Apply scan-specific rate limiter
app.use("/api/scan", scanLimiter);

app.use("/api", router);

export default app;
```

## Step 3: Test Rate Limiting

```bash
# Terminal 1: Start the API
pnpm --filter @workspace/api-server run dev

# Terminal 2: Test rate limiting
# Spam a request to hit the limit
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
  echo "\nRequest $i"
done

# You should see rate limit error on the 6th request
```

## Step 4: Handle Rate Limit Errors Client-Side

In `artifacts/vulnguard/src/hooks/use-scanner.ts` or similar:

```typescript
try {
  const response = await fetch("/api/scan", ...);
  
  if (response.status === 429) {
    // Rate limited
    setError("Too many scans. Please wait before scanning again.");
    return;
  }
  
  // ... rest of error handling
} catch (err) {
  console.error("Scan error:", err);
}
```

## Configuration Reference

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 min |
| `/api/auth/signup` | 5 attempts | 15 min |
| `/api/auth/password-reset` | 3 attempts | 1 hour |
| `/api/scan` (authenticated) | 10 scans | 15 min |
| `/api/*` (general) | 100 requests | 15 min |

## Production Considerations

1. **Store Rate Limit Data in Redis** (for distributed systems):
   ```bash
   pnpm add rate-limit-redis redis
   ```

2. **Use Store Option**:
   ```typescript
   import RedisStore from "rate-limit-redis";
   import { createClient } from "redis";
   
   const redisClient = createClient();
   
   export const apiLimiter = rateLimit({
     store: new RedisStore({
       client: redisClient,
       prefix: "rate-limit:",
     }),
     windowMs: 15 * 60 * 1000,
     max: 100,
   });
   ```

3. **Monitor Rate Limit Hits**:
   - Log when users are rate limited
   - Add to monitoring/analytics dashboard
   - Alert on suspicious patterns (DDoS attempts)

## Testing in Different Scenarios

- ✅ Normal user: Should work without hitting limits
- ✅ Brute force attempt: Should be blocked after N attempts
- ✅ Authenticated user: Should have higher limits (optional)
- ✅ High-traffic periods: Should gracefully handle with clear errors

**Status**: 🟡 **Not yet implemented** — Ready to add!
