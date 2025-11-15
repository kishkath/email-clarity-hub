import { useState, useEffect } from "react";
import { Mail, Loader2, AlertCircle, Search, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Email {
  id?: number;
  subject: string;
  from: string;
  body: string;
  priority: string;
  received_at: string;
  classification?: string;
}

const Inbox = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [limit, setLimit] = useState(20);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:1212/emails?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch emails");
      
      const data = await response.json();
      setEmails(data.emails || []);
      
      toast.success("Inbox refreshed", {
        description: `Loaded ${data.count} email(s)`,
      });
    } catch (error) {
      toast.error("Failed to fetch emails", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High Priority":
        return "destructive";
      case "Medium Priority":
        return "warning";
      case "Low Priority":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || email.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-gradient-primary p-2.5">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Email Inbox</h1>
              <p className="text-sm text-muted-foreground">
                {filteredEmails.length} email(s) {searchQuery || priorityFilter !== "all" ? "filtered" : "total"}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search emails by subject, sender, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High Priority">High Priority</SelectItem>
                    <SelectItem value="Medium Priority">Medium Priority</SelectItem>
                    <SelectItem value="Low Priority">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={fetchEmails}
                  disabled={loading}
                  variant="outline"
                  className="h-10"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">All Messages</CardTitle>
            <CardDescription className="text-sm">
              Browse and manage your classified emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading emails...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                {emails.length === 0 ? (
                  <>
                    <Mail className="h-16 w-16 opacity-50" />
                    <p className="text-base font-medium">No emails found</p>
                    <p className="text-sm">Your inbox is empty</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-16 w-16 opacity-50" />
                    <p className="text-base font-medium">No matching emails</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmails.map((email, index) => (
                  <div
                    key={email.id || index}
                    className="rounded-lg border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer fade-in"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base truncate">{email.subject}</h3>
                          <Badge variant={getPriorityColor(email.priority)} className="shrink-0 text-xs">
                            {email.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">From:</span> {email.from}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">{email.body}</p>
                        {email.classification && (
                          <div className="mt-3">
                            <Badge variant="outline" className="text-xs">
                              {email.classification}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-xs text-muted-foreground">
                          {new Date(email.received_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(email.received_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Inbox;
