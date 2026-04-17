import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

const fromAuth = process.env.EMAIL_FROM_AUTH ?? "auth@thevulnguardai.tech";
const fromNoReply = process.env.EMAIL_FROM_NO_REPLY ?? "no-reply@thevulnguardai.tech";
const fromSupport = process.env.EMAIL_FROM_SUPPORT ?? "support@thevulnguardai.tech";
const fromBilling = process.env.EMAIL_FROM_BILLING ?? "billing@thevulnguardai.tech";
const supportInbox = process.env.SUPPORT_INBOX ?? fromSupport;
const appBaseUrl = process.env.APP_BASE_URL ?? "https://www.thevulnguardai.tech";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildBaseTemplate(params: {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): EmailTemplate {
  const ctaUrl = params.ctaUrl ?? appBaseUrl;
  const footerNote = params.footerNote ?? "You received this email because you interacted with VulnGuard AI.";

  const html = `
    <div style="margin:0;background:#0b1220;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#e5eefc;">
      <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #243044;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 32px;border-bottom:1px solid #243044;background:linear-gradient(135deg,#0f172a,#111827 60%,#1d4ed8 160%);">
          <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#93c5fd;font-weight:700;">${escapeHtml(params.eyebrow)}</div>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">${escapeHtml(params.title)}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#d8e1f2;">${escapeHtml(params.intro)}</p>
          <div style="margin:24px 0 28px;padding:20px;border:1px solid #243044;border-radius:18px;background:#0b1324;color:#d8e1f2;white-space:pre-line;line-height:1.7;">${escapeHtml(params.body)}</div>
          ${params.ctaLabel ? `<div style="margin:28px 0 12px;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#f8fafc;color:#0f172a;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px;">${escapeHtml(params.ctaLabel)}</a></div>` : ""}
          <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#93a4bd;">${escapeHtml(footerNote)}</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    params.title,
    "",
    params.intro,
    "",
    params.body,
    params.ctaLabel ? `${params.ctaLabel}: ${ctaUrl}` : "",
    "",
    footerNote,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: params.title,
    html,
    text,
  };
}

export function getEmailSender(kind: "auth" | "no-reply" | "support" | "billing"): string {
  switch (kind) {
    case "auth":
      return fromAuth;
    case "support":
      return fromSupport;
    case "billing":
      return fromBilling;
    default:
      return fromNoReply;
  }
}

export async function sendTransactionalEmail(params: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  if (!resend) {
    throw new Error("RESEND_API_KEY must be set to send email.");
  }

  return resend.emails.send({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  });
}

export function buildSupportAutoReplyTemplate(input: { name: string; topic: string }): EmailTemplate {
  const safeName = escapeHtml(input.name);
  const safeTopic = escapeHtml(input.topic);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>We received your message</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px 28px;background:#0f172a;color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;">Support</p>
                <h1 style="margin:10px 0 0 0;font-size:26px;line-height:1.2;">We received your message</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
                <p style="margin:0 0 10px 0;font-size:15px;line-height:1.7;color:#374151;">Thanks for contacting VulnGuard AI.</p>
                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">Topic: <strong>${safeTopic}</strong></p>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.7;color:#4b5563;">Our team will reply as soon as possible from support@thevulnguardai.tech.</p>
                <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">For urgent security issues, reply directly to this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">VulnGuard AI Support Team<br/>https://www.thevulnguardai.tech</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: "We received your message",
    html,
    text: `Hi ${safeName},\nThanks for contacting VulnGuard AI.\nTopic: ${safeTopic}\nOur team will reply as soon as possible from support@thevulnguardai.tech.`,
  };
}

export function buildSupportInboxTemplate(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): EmailTemplate {
  const safeName = escapeHtml(input.name);
  const safeEmail = escapeHtml(input.email);
  const safeTopic = escapeHtml(input.topic);
  const safeMessage = escapeHtml(input.message);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New support request</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px 28px;background:#7f1d1d;color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#fecaca;">Support Inbox</p>
                <h1 style="margin:10px 0 0 0;font-size:26px;line-height:1.2;">New support request: ${safeTopic}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;width:120px;">Name</td>
                    <td style="padding:8px 0;font-size:14px;color:#111827;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;">Email</td>
                    <td style="padding:8px 0;font-size:14px;color:#111827;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#6b7280;">Topic</td>
                    <td style="padding:8px 0;font-size:14px;color:#111827;">${safeTopic}</td>
                  </tr>
                </table>
                <div style="margin-top:16px;padding:16px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;white-space:pre-line;font-size:14px;line-height:1.7;color:#1f2937;">${safeMessage}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: `New support request: ${input.topic}`,
    html,
    text: `Name: ${input.name}\nEmail: ${input.email}\nTopic: ${input.topic}\nMessage: ${input.message}`,
  };
}

export function buildPasswordResetTemplate(input: { resetUrl: string; email: string }): EmailTemplate {
  return buildBaseTemplate({
    eyebrow: "Security",
    title: "Reset your VulnGuard AI password",
    intro: "We received a request to reset your password.",
    body: [
      "If you did not request this, ignore this email.",
      "",
      `Reset link: ${input.resetUrl}`,
      "",
      "This link may expire based on your auth provider settings.",
    ].join("\n"),
    ctaLabel: "Reset password",
    ctaUrl: input.resetUrl,
    footerNote: `Sent to ${input.email} from VulnGuard AI security automation.`,
  });
}

export function buildBillingTemplate(input: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): EmailTemplate {
  return buildBaseTemplate({
    eyebrow: "Billing",
    title: input.title,
    intro: "A billing event occurred in your VulnGuard AI account.",
    body: input.body,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    footerNote: "Billing messages are transactional and sent only for account-related events.",
  });
}

export const emailConfig = {
  supportInbox,
  appBaseUrl,
};