import { motion } from "framer-motion";
import { ChevronRight, Mail, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";
import { engagementEvents } from "@/lib/analytics";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    engagementEvents.supportContacted("page_visited");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/iamhammaddev@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      engagementEvents.supportContacted("form_submitted");
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError("Failed to send your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingShell
      eyebrow="Contact"
      title="Talk to the VulnGuard team"
      subtitle="Get architecture guidance, pricing support, and implementation help from security specialists."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Panel title="Contact information" description="We respond quickly for product and security questions.">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Email us</h3>
                  <p className="mt-1 text-sm text-muted-foreground">For sales, support, and partnerships.</p>
                  <a href="mailto:iamhammaddev@gmai.com" className="mt-2 inline-block text-sm text-foreground">
                    iamhammaddev@gmai.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Business hours support line.</p>
                  <p className="mt-2 text-sm">+92 327 814 7376</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Operations</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Distributed team with global coverage.</p>
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <form className="space-y-6 rounded-3xl border border-border bg-card p-8" onSubmit={handleSubmit}>
              
              {/* FormSubmit Configuration Fields */}
              <input type="hidden" name="_subject" value="New Submission on VulnGuard AI" />
              <input type="hidden" name="_template" value="box" />
              <input type="hidden" name="_autoresponse" value="Thank you for contacting VulnGuard AI. We have received your message and will get back to you shortly." />

              {isSuccess && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Message sent successfully!
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center font-medium text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input required type="text" name="name" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input required type="email" name="email" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20" placeholder="john@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Message</label>
                <textarea required name="message" rows={5} className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20" placeholder="How can we help you?" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 font-semibold text-background transition-all hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
        </motion.div>
      </div>
    </MarketingShell>
  );
}
