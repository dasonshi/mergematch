import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = `${API_URL}/auth/install`;
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Stop Losing Deals to Duplicate Records
          </h1>
          <p className="text-lg text-muted-foreground">
            Find and merge duplicate contacts, companies, and opportunities — automatically.
            Keep your CRM clean without the manual work.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Get Started Free
          </Button>
        </section>

        {/* Problem */}
        <section className="space-y-4">
          <p>
            Duplicate records cost you deals. When the same lead exists twice, follow-ups get missed,
            reporting breaks, and your team wastes time sorting through messy data. MergeMatch fixes that.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <p>
            Create a match rule by picking the fields to compare — email, phone, name, or any custom field —
            and choose exact or fuzzy matching. Fuzzy matching catches typos, nicknames, and formatting
            differences that exact matching misses.
          </p>
          <p>
            Run a scan and MergeMatch compares every record against your rules, scoring each potential
            duplicate with a confidence percentage. Review flagged pairs side by side, pick the master
            record, and merge with one click. Or use bulk merge to clean up everything at once.
          </p>
          <p>
            Then automate it. Schedule hourly, daily, or weekly scans. Enable auto-merge for high-confidence
            matches so duplicates are handled before your team even sees them.
          </p>
          <p>
            Every merge can be undone. Full backups are created automatically and can be restored within
            30 days — fields, notes, tasks, and opportunities all come back.
          </p>
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">What's included</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Free</h3>
              <p className="text-muted-foreground">
                Scan once per day, exact matching on Contacts, 3 merges to try it out. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Starter ($39/mo)</h3>
              <p className="text-muted-foreground">
                Unlimited merges, exact and fuzzy matching, Contacts and Companies, daily scheduled scans, 7-day rollback.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Pro ($59/mo)</h3>
              <p className="text-muted-foreground">
                Everything in Starter plus Opportunities, Custom Objects, phonetic and cross-field matching,
                hourly scans, auto-merge, webhook-triggered scans, and 30-day rollback.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Agency ($89/mo)</h3>
              <p className="text-muted-foreground">
                Everything in Pro plus white-labeling, unlimited locations, and priority support.
                Brand it as your own and resell across your client base.
              </p>
            </div>
          </div>
        </section>

        {/* Why MergeMatch */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Why MergeMatch</h2>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Built for your CRM</strong> — not a generic tool bolted on. Works natively inside your account.</span>
            </li>
            <li className="flex gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Safe by default</strong> — every merge is reversible. Pre-merge snapshots, full audit trail, 30-day rollback.</span>
            </li>
            <li className="flex gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Set it and forget it</strong> — scheduled scans and auto-merge keep your data clean without ongoing effort.</span>
            </li>
            <li className="flex gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Agency-friendly</strong> — white-label it, resell it across locations, manage everything from one place.</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 pt-8 border-t">
          <h2 className="text-2xl font-semibold">Get started free</h2>
          <p className="text-muted-foreground">
            Install MergeMatch, run your first scan, and see exactly how many duplicates are hiding in your data.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Get Started Free
          </Button>
        </section>
      </div>
    </div>
  );
}
