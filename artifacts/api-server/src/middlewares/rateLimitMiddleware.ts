import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { type Request, type Response, type NextFunction } from "express";

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 * Returns 429 Too Many Requests when limit exceeded
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (_req: Request) => {
    // Don't skip anyone - apply to all
    return false;
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

/**
 * Auth rate limiter: 5 attempts per 15 minutes (brute force protection)
 * Only counts failed attempts (skipSuccessfulRequests: true)
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many login attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true, // Only count failed requests
  keyGenerator: (req: Request) => {
    // Use email as key if available, otherwise IP
    const email = (req.body?.email as string) || req.ip;
    return email || "unknown";
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many login attempts, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

/**
 * Scan rate limiter: 20 scans per 15 minutes per user/IP
 * Allows unlimited scans for admin users
 */
export const scanLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    error: "Too many scans. Please wait before scanning again.",
    retryAfter: "15 minutes",
  },
  keyGenerator: (req: Request) => {
    // Use authenticated user ID if available, otherwise IP
    const userId = (req.user as any)?.id;
    return userId || req.ip || "unknown";
  },
  skip: (req: Request) => {
    // Skip rate limiting for admin users
    const role = (req.user as any)?.role;
    return role === "admin";
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many scans. Please wait before scanning again.",
      retryAfter: "15 minutes",
    });
  },
});

/**
 * Password reset rate limiter: 3 attempts per hour
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: "Too many password reset attempts, please try again later.",
    retryAfter: "1 hour",
  },
  keyGenerator: (req: Request) => {
    // Use email as key
    return (req.body?.email as string) || req.ip || "unknown";
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many password reset attempts, please try again later.",
      retryAfter: "1 hour",
    });
  },
});

/**
 * Fix generation rate limiter: 10 fixes per 15 minutes
 * Prevents abuse of AI-powered fix generation
 */
export const generateFixLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: "Too many fix requests. Please wait before requesting another fix.",
    retryAfter: "15 minutes",
  },
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req.user as any)?.id;
    return userId || req.ip || "unknown";
  },
  skip: (req: Request) => {
    // Skip for admin users
    const role = (req.user as any)?.role;
    return role === "admin";
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many fix requests. Please wait before requesting another fix.",
      retryAfter: "15 minutes",
    });
  },
});

/**
 * Report generation rate limiter: 5 reports per 15 minutes
 * Prevents abuse of report generation
 */
export const reportLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many report requests. Please wait before generating another report.",
    retryAfter: "15 minutes",
  },
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req.user as any)?.id;
    return userId || req.ip || "unknown";
  },
  skip: (req: Request) => {
    // Skip for admin users
    const role = (req.user as any)?.role;
    return role === "admin";
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many report requests. Please wait before generating another report.",
      retryAfter: "15 minutes",
    });
  },
});

/**
 * Global error handler middleware for rate limit errors
 * Ensures consistent error responses across the API
 */
export function rateLimitErrorHandler(
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Check if it's a rate limit error
  if (err.status === 429 || err.code === "RATE_LIMIT") {
    res.status(429).json({
      error: err.message || "Too many requests, please try again later.",
      retryAfter: "Please check RateLimit-Reset header for exact time.",
    });
    return;
  }

  // Pass other errors to next handler
  next(err);
}
