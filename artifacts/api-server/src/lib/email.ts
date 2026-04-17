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
  return buildBaseTemplate({
    eyebrow: "Support",
    title: "We received your message",
    intro: `Thanks${input.name ? `, ${input.name}` : ""}. Our team got your request and will review it soon.`,
    body: [
      `Topic: ${input.topic}`,
      "",
      "What happens next:",
      "- We review your message",
      "- We reply from support@thevulnguardai.tech",
      "- Critical security issues get priority handling",
    ].join("\n"),
    ctaLabel: "Open VulnGuard AI",
    ctaUrl: appBaseUrl,
    footerNote: "For urgent security issues, reply directly to this email.",
  });
}

export function buildSupportInboxTemplate(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): EmailTemplate {
  return buildBaseTemplate({
    eyebrow: "Support Inbox",
    title: `New support request: ${input.topic}`,
    intro: "A new message arrived through VulnGuard AI contact form.",
    body: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Topic: ${input.topic}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
    footerNote: `Reply-to is set to ${input.email}.`,
  });
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