import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Video,
  FileText,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn the basics of MergeMatch",
    icon: BookOpen,
    articles: 5,
  },
  {
    title: "Match Rules",
    description: "Configure duplicate detection rules",
    icon: FileText,
    articles: 8,
  },
  {
    title: "Merge Strategies",
    description: "Control how data is merged",
    icon: FileText,
    articles: 6,
  },
  {
    title: "API Integration",
    description: "Connect with GoHighLevel",
    icon: FileText,
    articles: 4,
  },
];

const faqs = [
  {
    question: "How does duplicate detection work?",
    answer: "MergeMatch uses configurable rules to compare contact fields and identify potential duplicates.",
  },
  {
    question: "Can I undo a merge?",
    answer: "Yes, all merges can be undone within 30 days from the History page.",
  },
  {
    question: "What happens to merged contact data?",
    answer: "Data is combined based on your merge strategy settings. The original data is backed up.",
  },
];

export default function Help() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Help Center" 
        description="Find answers and get support"
      />

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search for help..." 
          className="pl-9 h-12 text-base"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">Browse full docs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group" style={{ animationDelay: "50ms" }}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">Watch & learn</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group" style={{ animationDelay: "100ms" }}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Get in touch</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Topics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Browse by Topic</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {helpTopics.map((topic, index) => (
            <Card 
              key={topic.title} 
              className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              style={{ animationDelay: `${(index + 3) * 50}ms` }}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <topic.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{topic.title}</h3>
                    <p className="text-xs text-muted-foreground">{topic.articles} articles</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className="animate-fade-in border-border/50 shadow-sm"
              style={{ animationDelay: `${(index + 7) * 50}ms` }}
            >
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
