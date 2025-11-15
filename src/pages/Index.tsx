import { useState } from "react";
import { Mail, PlayCircle, Inbox, Clock, AlertCircle, CheckCircle2, Loader2, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Email {
  id?: number;
  subject: string;
  from: string;
  body: string;
  priority: string;
  received_at: string;
  classification?: string;
}

interface PipelineResponse {
  status: string;
  processed_emails: number;
  alerts_sent: number;
  timestamp: string;
}

const Index = () => {
  const [startDate, setStartDate] = useState("04-11-2025");
  const [endDate, setEndDate] = useState("10-11-2025");
  const [limit, setLimit] = useState(3);
  const [unread, setUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [stats, setStats] = useState<PipelineResponse | null>(null);

  const runPipeline = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:1212/run-pipeline?start_date=${startDate}&end_date=${endDate}&limit=${limit}&unread=${unread}`,
        { method: "POST" }
      );
      
      if (!response.ok) throw new Error("Pipeline execution failed");
      
      const data: PipelineResponse = await response.json();
      setStats(data);
      
      toast.success("Pipeline executed successfully!", {
        description: `Processed ${data.processed_emails} emails, sent ${data.alerts_sent} alerts`,
      });
      
      // Auto-fetch emails after pipeline runs
      fetchEmails();
    } catch (error) {
      toast.error("Failed to run pipeline", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const response = await fetch(`http://127.0.0.1:1212/emails?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch emails");
      
      const data = await response.json();
      setEmails(data.emails || []);
      
      toast.success("Emails loaded", {
        description: `Retrieved ${data.count} email(s)`,
      });
    } catch (error) {
      toast.error("Failed to fetch emails", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoadingEmails(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-primary p-2.5">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Email Management Dashboard</h1>
              <p className="text-sm text-muted-foreground">Professional email ingestion & classification system</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pipeline Control Panel */}
          <Card className="lg:col-span-1 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Pipeline Control</CardTitle>
              </div>
              <CardDescription className="text-sm">Configure and execute email processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit" className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Email Limit
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="h-10"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="unread" className="text-sm font-medium">Unread Only</Label>
                  <p className="text-xs text-muted-foreground">Process unread emails only</p>
                </div>
                <Switch
                  id="unread"
                  checked={unread}
                  onCheckedChange={setUnread}
                />
              </div>

              <Button
                onClick={runPipeline}
                disabled={loading}
                className="w-full h-11 font-medium text-base"
              >
                {loading ? (
                  <>
                    <div className="spinner h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Run Pipeline
                  </>
                )}
              </Button>

              <Button
                onClick={fetchEmails}
                disabled={loadingEmails}
                variant="outline"
                className="w-full h-11 font-medium"
              >
                {loadingEmails ? (
                  <>
                    <div className="spinner h-5 w-5 mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Inbox className="mr-2 h-5 w-5" />
                    Load Emails
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Stats & Email List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid gap-4 sm:grid-cols-3 fade-in">
                <Card className="shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-success/10 p-2.5">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Processed</p>
                        <p className="text-2xl font-bold">{stats.processed_emails}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-warning/10 p-2.5">
                        <AlertCircle className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Alerts Sent</p>
                        <p className="text-2xl font-bold">{stats.alerts_sent}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-info/10 p-2.5">
                        <Clock className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Run</p>
                        <p className="text-sm font-bold">{new Date(stats.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Email List */}
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Email Inbox</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {emails.length > 0 ? `${emails.length} email(s) retrieved` : "No emails to display"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEmails ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Loading emails...</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                    <Mail className="h-12 w-12 opacity-50" />
                    <p className="text-sm font-medium">No emails found</p>
                    <p className="text-xs">Run the pipeline or load emails to see results</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emails.map((email, index) => (
                      <div
                        key={email.id || index}
                        className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow fade-in"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate">{email.subject}</h3>
                              <Badge variant={getPriorityColor(email.priority)} className="shrink-0 text-xs">
                                {email.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">From:</span> {email.from}
                            </p>
                            <p className="text-sm text-foreground line-clamp-2">{email.body}</p>
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            {new Date(email.received_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
