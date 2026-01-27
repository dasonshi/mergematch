import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Mail,
  Clock,
  FileText,
  GitMerge,
  Calendar,
  RotateCcw,
  Boxes,
  CreditCard
} from "lucide-react";

const documentationSections = [
  {
    id: "match-rules",
    icon: FileText,
    title: "Match Rules",
    content: (
      <div className="space-y-3">
        <p>Match rules define how MergeMatch identifies duplicate records in your account. Each rule targets a specific object type and compares records across one or more fields.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Exact matching</strong> requires fields to be identical — useful for emails, phone numbers, and IDs where even small differences indicate distinct records.</li>
          <li><strong>Fuzzy matching</strong> finds similar values with minor variations (e.g., "Jon Smith" ≈ "John Smith"). Great for catching typos, nicknames, and formatting differences.</li>
          <li><strong>Cross-field matching</strong> compares different fields against each other (e.g., work email vs. personal email) so duplicates aren't missed when the same value appears in different places.</li>
          <li><strong>AND / OR logic</strong> — combine multiple field conditions. AND requires all conditions to match; OR requires at least one. Use AND for stricter rules and OR for broader scans.</li>
          <li><strong>Confidence thresholds</strong> control how strict the rule is. A higher threshold (e.g., 90%) means fewer but higher-quality matches. A lower threshold catches more potential duplicates but may include false positives.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "merge-strategies",
    icon: GitMerge,
    title: "Merge Strategies",
    content: (
      <div className="space-y-3">
        <p>Merge strategies determine how two records are combined into one when duplicates are confirmed.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Standard strategy</strong> — the newer record is merged into the older one (the master). Empty fields on the master are filled from the duplicate, and non-empty fields are kept as-is.</li>
          <li><strong>Custom strategy</strong> — choose field-by-field how conflicts are resolved: keep the master value, keep the duplicate value, keep the most recently updated value, or concatenate both.</li>
          <li><strong>Related records</strong> — notes, tasks, and opportunities from the duplicate are re-associated with the master record by default. You can change this per strategy to copy all, copy from master only, or skip.</li>
          <li><strong>Tags &amp; lists</strong> — tags and list memberships from both records are combined so nothing is lost.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "scheduling",
    icon: Calendar,
    title: "Scheduling & Automation",
    content: (
      <div className="space-y-3">
        <p>Starter plans and above include scheduled duplicate scans so you can keep your data clean without manual effort.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Scan frequency</strong> — choose hourly, daily, or weekly scans per rule. Daily scans run at your preferred time; weekly scans run on the day you select.</li>
          <li><strong>Auto-merge</strong> (Pro+) — automatically merge matches above your confidence threshold (default 95%). Lower-confidence matches are queued for manual review.</li>
          <li><strong>Webhook-triggered scans</strong> (Pro+) — trigger a scan via webhook whenever a new contact is created or updated, so duplicates are caught in near real-time.</li>
          <li><strong>Notifications</strong> — receive an email summary after each scheduled scan with the number of duplicates found and merged.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "rollback",
    icon: RotateCcw,
    title: "Rollback & Recovery",
    content: (
      <div className="space-y-3">
        <p>Every merge creates a full backup so you can undo mistakes with confidence.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>30-day window</strong> — backups are retained for 30 days from the merge date. After that, they are permanently deleted.</li>
          <li><strong>How to restore</strong> — go to History, find the merge, and click <em>Restore</em>. The original duplicate record is recreated with all its original field values, notes, tasks, and related records.</li>
          <li><strong>What gets recreated</strong> — the duplicate contact and all related records (notes, tasks, opportunities) that were re-associated during the merge are moved back to the restored record.</li>
          <li><strong>Bulk restore</strong> — you can restore multiple merges at once from the History page by selecting them and choosing <em>Restore Selected</em>.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "object-types",
    icon: Boxes,
    title: "Object Types",
    content: (
      <div className="space-y-3">
        <p>MergeMatch can deduplicate several object types depending on your plan.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Contacts</strong> (all plans) — match on email, phone, name, address, and custom fields.</li>
          <li><strong>Companies</strong> (Starter+) — match on company name, domain, phone, and address.</li>
          <li><strong>Opportunities</strong> (Pro+) — match on opportunity name, contact, and monetary value.</li>
          <li><strong>Custom Objects</strong> (Agency) — match on any fields defined in your custom objects.</li>
        </ul>
        <p>Each object type exposes its own set of matchable fields. You can create multiple rules per object type with different field combinations and thresholds.</p>
      </div>
    ),
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Plans & Billing",
    content: (
      <div className="space-y-3">
        <p>MergeMatch is billed through the Marketplace. Plans are per-location and can be changed at any time.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Free</strong> — up to 50 manual merges/month, Contacts only, exact matching, 1 match rule.</li>
          <li><strong>Starter</strong> — unlimited merges, Contacts &amp; Companies, exact + fuzzy matching, scheduled scans, up to 5 match rules.</li>
          <li><strong>Pro</strong> — everything in Starter plus Opportunities, auto-merge, webhook-triggered scans, cross-field matching, unlimited rules.</li>
          <li><strong>Agency</strong> — everything in Pro plus Custom Objects, white-labeling, unlimited locations, priority support.</li>
        </ul>
        <p>To manage your subscription, visit your account in the Marketplace.</p>
      </div>
    ),
  },
];

const faqItems = [
  {
    id: "notes-tasks",
    question: "What happens to notes and tasks when I merge?",
    answer: "By default, all notes and tasks from both records are copied to the master record. You can customize this behavior in your merge strategy settings to either copy all, copy from master only, or skip copying entirely.",
  },
  {
    id: "undo-merge",
    question: "Can I undo a merge?",
    answer: "Yes! Every merge creates a backup that can be restored within 30 days. Go to History, find the merge you want to undo, and click Restore. The original duplicate record will be recreated along with all its related records.",
  },
  {
    id: "locked-features",
    question: "Why are some features locked?",
    answer: "Features like scheduled scans, auto-merge, and additional object types are only available on higher-tier plans. Upgrade your plan through the Marketplace to unlock them.",
  },
  {
    id: "exact-fuzzy",
    question: "What's the difference between Exact and Fuzzy matching?",
    answer: "Exact matching requires fields to be identical (e.g., 'john@email.com' = 'john@email.com'). Fuzzy matching finds similar values with minor differences (e.g., 'Jon Smith' ≈ 'John Smith'). Fuzzy matching is great for catching typos, nicknames, and formatting differences.",
  },
  {
    id: "auto-merge",
    question: "How does auto-merge work?",
    answer: "Auto-merge automatically merges duplicates whose confidence score is above your threshold (default 95%). Only high-confidence matches are auto-merged; lower-confidence matches are queued for manual review. Auto-merge is available on Pro and Agency plans.",
  },
  {
    id: "confidence-score",
    question: "What does the confidence score mean?",
    answer: "The confidence score (0–100%) indicates how likely two records are true duplicates. Higher scores mean more matching fields and closer matches. Scores above 90% are typically true duplicates. Lower scores may need manual review.",
  },
  {
    id: "cross-field",
    question: "What is cross-field matching?",
    answer: "Cross-field matching compares values across different fields — for example, checking a contact's work email against another contact's personal email. This catches duplicates that would be missed if you only compared the same field to itself. Cross-field matching is available on Pro and Agency plans.",
  },
  {
    id: "scheduled-scans",
    question: "How do scheduled scans work?",
    answer: "Scheduled scans run automatically at the interval you choose (hourly, daily, or weekly). Each scan checks for new duplicates using your configured match rules. Results appear in the Pending Matches queue. If auto-merge is enabled, high-confidence matches are merged automatically while lower-confidence ones await review.",
  },
  {
    id: "related-records",
    question: "What happens to related records (notes, tasks, opportunities)?",
    answer: "When two records are merged, related records from the duplicate are re-associated with the master record by default. Notes and tasks are copied over, and opportunities are transferred. You can customize this behavior per merge strategy. If you later restore the merge, related records are moved back to the restored record.",
  },
  {
    id: "data-safety",
    question: "Is my data safe? What data does MergeMatch access?",
    answer: "MergeMatch only accesses the CRM data required to identify and merge duplicates — contact fields, company fields, and related records like notes and tasks. We never store your CRM data on our servers beyond temporary processing. All merges create backups so you can always roll back. Data is transmitted over encrypted connections and processed in compliance with industry-standard security practices.",
  },
];

export default function Help() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Documentation"
        description="Learn how to get the most out of MergeMatch"
      />

      {/* Getting Started Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium">Create a Match Rule</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Go to <strong>Match Rules → New Rule</strong>. Pick your object type (e.g., Contacts), choose the fields to compare (email, phone, name), select a matching type (exact or fuzzy), and set your confidence threshold.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium">Scan for Duplicates</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Open your rule and click <strong>Scan Now</strong> to search your records for duplicates. MergeMatch compares every record against your rule's criteria and flags potential matches.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium">Review &amp; Merge</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Review flagged pairs in <strong>Pending Matches</strong>. Pick the master record, then merge individually or use bulk-merge to handle all matches at once.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  4
                </span>
                <div>
                  <p className="font-medium">Set Up Automation</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">Starter+</span>{" "}
                    Enable scheduled scans and auto-merge for hands-free deduplication. Choose your scan frequency and confidence threshold — MergeMatch handles the rest.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Documentation Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Documentation</h2>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {documentationSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <section.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-7">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="hover:no-underline text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Support Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Support</h2>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href="mailto:support@mergematch.app"
                    className="font-medium hover:text-primary transition-colors"
                  >
                    support@mergematch.app
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response time</p>
                  <p className="font-medium">Within 24 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
