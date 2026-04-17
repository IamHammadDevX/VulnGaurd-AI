import { Router, type IRouter, type Request, type Response } from "express";
import * as zod from "zod";
import {
  buildSupportAutoReplyTemplate,
  buildSupportInboxTemplate,
  emailConfig,
  getEmailSender,
  sendTransactionalEmail,
} from "../lib/email.js";

const router: IRouter = Router();

const supportRequestSchema = zod.object({
  name: zod.string().trim().min(1).max(120),
  email: zod.string().trim().email().max(320),
  topic: zod.string().trim().min(1).max(120).default("General support"),
  message: zod.string().trim().min(10).max(4000),
  company: zod.string().optional().default(""),
  website: zod.string().optional().default(""),
});

router.post("/support/contact", async (req: Request, res: Response) => {
  const parsed = supportRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid support request" });
    return;
  }

  const { name, email, topic, message, company, website } = parsed.data;

  if (company.trim().length > 0 || website.trim().length > 0) {
    res.status(202).json({ success: true });
    return;
  }

  const inboxTemplate = buildSupportInboxTemplate({ name, email, topic, message });
  const autoReplyTemplate = buildSupportAutoReplyTemplate({ name, topic });

  try {
    await sendTransactionalEmail({
      from: getEmailSender("support"),
      to: emailConfig.supportInbox,
      subject: inboxTemplate.subject,
      html: inboxTemplate.html,
      text: inboxTemplate.text,
      replyTo: email,
    });

    await sendTransactionalEmail({
      from: getEmailSender("support"),
      to: email,
      subject: autoReplyTemplate.subject,
      html: autoReplyTemplate.html,
      text: autoReplyTemplate.text,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;