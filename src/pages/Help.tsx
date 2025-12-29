import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Video, 
  Lightbulb, 
  Mail,
  Clock,
  FileText,
  GitMerge,
  Calendar,
  RotateCcw,
  Boxes,
  CreditCard
} from "lucide-react";

const gettingStartedCards = [
  {
    icon: BookOpen,
    title: "Quick Start Guide",
    description: "Create your first match rule in 5 min",
  },
  {
    icon: Video,
    title: "Video Tutorial",
    description: "Watch a 3-minute walkthrough",
  },
  {
    icon: Lightbulb,
    title: "Best Practices",
    description: "Tips for accurate matches",
  },
];

const documentationSections = [
  {
    id: "match-rules",
    icon: FileText,
    title: "Match Rules",
    content: "Match rules define how MergeMatch identifies duplicate records in your GoHighLevel account. You can create rules based on email, phone, name, address, or custom fields. Each rule can use exact matching for precise duplicates or fuzzy matching for similar records with minor variations.",
  },
  {
    id: "merge-strategies",
    icon: GitMerge,
    title: "Merge Strategies",
    content: "Merge strategies determine how records are combined when duplicates are found. Configure which record becomes the master, how field conflicts are resolved, and what happens to related records like notes, tasks, and opportunities.",
  },
  {
    id: "scheduling",
    icon: Calendar,
    title: "Scheduling & Automation",
    content: "Pro and Agency plans include scheduled duplicate scans. Configure hourly, daily, or weekly scans to automatically detect new duplicates. Enable auto-merge to automatically merge high-confidence matches without manual review.",
  },
  {
    id: "rollback",
    icon: RotateCcw,
    title: "Rollback & Recovery",
    content: "Every merge creates a backup that can be restored within 30 days. View merge history to see all past merges and restore any merge to recover the original duplicate records.",
  },
  {
    id: "object-types",
    icon: Boxes,
    title: "Object Types",
    content: "MergeMatch supports Contacts and Companies on all plans. Pro and Agency plans add support for Opportunities and Custom Objects. Each object type has specific fields available for matching and merging.",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Plans & Billing",
    content: "MergeMatch is billed through the GoHighLevel Marketplace. Starter plan includes manual scans and basic matching. Pro plan adds scheduled scans and auto-merge. Agency plan includes white-labeling and unlimited locations.",
  },
];

const faqItems = [
  {
    id: "notes-tasks",
    question: "What happens to notes and tasks when I merge?",
    answer: "By default, all notes and tasks from both records are copied to the master record. You can customize this behavior in your merge strategy settings to either copy all, copy from master only, or don't copy.",
  },
  {
    id: "undo-merge",
    question: "Can I undo a merge?",
    answer: "Yes! Every merge creates a backup that can be restored within 30 days. Go to History, find the merge you want to undo, and click Restore. The original duplicate records will be recreated.",
  },
  {
    id: "locked-features",
    question: "Why are some features locked?",
    answer: "Some features like scheduled scans, auto-merge, and additional object types are only available on Pro and Agency plans. Upgrade your plan through the GoHighLevel Marketplace to unlock these features.",
  },
  {
    id: "exact-fuzzy",
    question: "What's the difference between Exact and Fuzzy matching?",
    answer: "Exact matching requires fields to be identical (e.g., 'john@email.com' = 'john@email.com'). Fuzzy matching finds similar values with minor differences (e.g., 'Jon Smith' ≈ 'John Smith'). Fuzzy matching is great for catching typos and variations.",
  },
  {
    id: "auto-merge",
    question: "How does auto-merge work?",
    answer: "Auto-merge automatically merges duplicates with a confidence score above your threshold (default 95%). Only high-confidence matches are auto-merged; lower confidence matches are queued for manual review. Auto-merge is available on Pro and Agency plans.",
  },
  {
    id: "confidence-score",
    question: "What does the confidence score mean?",
    answer: "The confidence score (0-100%) indicates how likely two records are duplicates. Higher scores mean more matching fields and closer matches. Scores above 90% are typically true duplicates. Lower scores may need manual review.",
  },
];

export default function Help() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Help & Documentation" 
        description="Learn how to get the most out of MergeMatch"
      />

      {/* Getting Started Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gettingStartedCards.map((card, index) => (
            <Card 
              key={card.title}
              className="animate-fade-in border-border/50 shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Documentation Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Documentation</h2>
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "150ms" }}>
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
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "200ms" }}>
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
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "250ms" }}>
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
