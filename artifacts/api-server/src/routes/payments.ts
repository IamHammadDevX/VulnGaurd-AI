import { Router, type Request, type Response } from "express";
import crypto from "crypto";

const router = Router();

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
const LEMON_SQUEEZY_GROWTH_PRODUCT_ID = process.env.LEMON_SQUEEZY_GROWTH_PRODUCT_ID;
const LEMON_SQUEEZY_ENTERPRISE_PRODUCT_ID = process.env.LEMON_SQUEEZY_ENTERPRISE_PRODUCT_ID;

// Lemon Squeezy API Base URL
const LEMON_SQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1";

type LemonCheckoutResponse = {
  data: {
    attributes: {
      url: string;
    };
  };
};

type LemonSubscriptionResponse = {
  data: Array<{
    id: string;
    attributes: {
      status: string;
      product_name: string;
      renews_at: string | null;
      ends_at: string | null;
      product_id: string | number;
    };
  }>;
};

/**
 * POST /api/payments/checkout
 * Create a checkout link for a subscription plan
 * Supports both monthly and annual billing
 */
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { planType, billingCycle = "monthly", email, userId } = req.body;

    if (!planType || !email) {
      return res.status(400).json({ error: "Missing planType or email" });
    }

    if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID) {
      return res.status(500).json({ error: "Payment system not configured" });
    }

    // Get product ID based on plan and billing cycle
    let productId: string | undefined;

    if (planType === "growth") {
      // Monthly Growth plan
      if (billingCycle === "monthly") {
        productId = LEMON_SQUEEZY_GROWTH_PRODUCT_ID;
      } else if (billingCycle === "annual") {
        // Use annual variant ID (add this to .env)
        productId = process.env.LEMON_SQUEEZY_GROWTH_ANNUAL_PRODUCT_ID;
      }
    } else if (planType === "enterprise") {
      productId = LEMON_SQUEEZY_ENTERPRISE_PRODUCT_ID;
    }

    if (!productId) {
      return res.status(400).json({ error: "Invalid plan type or billing cycle" });
    }

    // Create checkout using Lemon Squeezy API
    const checkoutResponse = await fetch(
      `${LEMON_SQUEEZY_API_BASE}/stores/${LEMON_SQUEEZY_STORE_ID}/checkouts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              product_id: productId,
              custom_price: null,
              product_options: {
                redirect_url: `${process.env.VITE_API_URL || "http://localhost:5173"}/dashboard?plan=${planType}&billing=${billingCycle}&status=success`,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              },
              checkout_data: {
                email,
                custom: {
                  userId,
                  billingCycle,
                },
              },
            },
          },
        }),
      }
    );

    if (!checkoutResponse.ok) {
      throw new Error(`Lemon Squeezy API error: ${checkoutResponse.status}`);
    }

    const checkoutData = await checkoutResponse.json() as LemonCheckoutResponse;
    const checkoutUrl = checkoutData.data.attributes.url;

    return res.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Failed to create checkout" });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Lemon Squeezy webhook events (subscription created, updated, etc.)
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!LEMON_SQUEEZY_WEBHOOK_SECRET) {
      console.warn("Webhook secret not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    // Verify webhook signature
    const signature = req.headers["x-signature"] as string;
    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac("sha256", LEMON_SQUEEZY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    const eventType = event.meta?.event_name;
    const data = event.data;

    console.log(`Processing webhook event: ${eventType}`);

    // Handle different webhook events
    switch (eventType) {
      case "order:created":
        // New subscription created
        await handleOrderCreated(data);
        break;

      case "subscription:updated":
        // Subscription updated (plan change, etc.)
        await handleSubscriptionUpdated(data);
        break;

      case "subscription:cancelled":
        // Subscription cancelled
        await handleSubscriptionCancelled(data);
        break;

      case "subscription:expired":
        // Subscription expired
        await handleSubscriptionExpired(data);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * GET /api/payments/subscription/:userId
 * Get subscription details for a user
 */
router.get("/subscription/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!LEMON_SQUEEZY_API_KEY) {
      return res.status(500).json({ error: "Payment system not configured" });
    }

    // Fetch subscriptions from Lemon Squeezy
    const response = await fetch(
      `${LEMON_SQUEEZY_API_BASE}/subscriptions?filter[customer_id]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.status}`);
    }

    const data = await response.json() as LemonSubscriptionResponse;
    const subscription = data.data[0];

    if (!subscription) {
      return res.json({ subscription: null });
    }

    return res.json({
      subscription: {
        id: subscription.id,
        status: subscription.attributes.status,
        plan: subscription.attributes.product_name,
        renewsAt: subscription.attributes.renews_at,
        endsAt: subscription.attributes.ends_at,
        productId: subscription.attributes.product_id,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

/**
 * POST /api/payments/cancel-subscription
 * Cancel a subscription
 */
router.post("/cancel-subscription", async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: "Missing subscriptionId" });
    }

    if (!LEMON_SQUEEZY_API_KEY) {
      return res.status(500).json({ error: "Payment system not configured" });
    }

    const response = await fetch(
      `${LEMON_SQUEEZY_API_BASE}/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            attributes: {
              cancelled_at: new Date().toISOString(),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.status}`);
    }

    return res.json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Webhook handlers
async function handleOrderCreated(data: any) {
  const customData = data.attributes?.custom;
  const userId = customData?.userId;
  const email = data.attributes?.customer_email;

  console.log(`New subscription for user: ${userId}, email: ${email}`);

  // TODO: Save subscription to your database
  // await db.subscription.create({
  //   userId,
  //   email,
  //   lemonsqueezyId: data.id,
  //   status: 'active',
  //   plan: data.attributes.product_name,
  // });
}

async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id;
  const status = data.attributes?.status;

  console.log(`Subscription ${subscriptionId} updated to status: ${status}`);

  // TODO: Update subscription in your database
  // await db.subscription.update({ lemonsqueezyId: subscriptionId }, { status });
}

async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.id;

  console.log(`Subscription ${subscriptionId} cancelled`);

  // TODO: Mark subscription as cancelled in your database
  // await db.subscription.update({ lemonsqueezyId: subscriptionId }, { status: 'cancelled' });
}

async function handleSubscriptionExpired(data: any) {
  const subscriptionId = data.id;

  console.log(`Subscription ${subscriptionId} expired`);

  // TODO: Update subscription as expired in your database
  // await db.subscription.update({ lemonsqueezyId: subscriptionId }, { status: 'expired' });
}

export default router;
