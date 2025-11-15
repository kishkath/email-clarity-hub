import { useState } from "react";
import { PlayCircle, Clock, AlertCircle, CheckCircle2, Calendar, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PipelineResponse {
  status: string;
  processed_emails: number;
  alerts_sent: number;
  timestamp: string;
}

const Pipeline = () => {
  const [startDate, setStartDate] = useState("04-11-2025");
  const [endDate, setEndDate] = useState("10-11-2025");
  const [limit, setLimit] = useState(3);
  const [unread, setUnread] = useState(false);
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      toast.error("Failed to run pipeline", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-primary p-2.5">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pipeline Control</h1>
              <p className="text-sm text-muted-foreground">Configure and execute email processing pipeline</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pipeline Configuration */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
              <CardDescription className="text-sm">Set pipeline parameters</CardDescription>
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
            </CardContent>
          </Card>

          {/* Pipeline Results */}
          <div className="lg:col-span-2 space-y-6">
            {stats ? (
              <>
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

                <Card className="shadow-md fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg">Pipeline Details</CardTitle>
                    <CardDescription>Last execution information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <p className="text-base font-semibold capitalize">{stats.status}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Execution Time</p>
                        <p className="text-base font-semibold">{new Date(stats.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Date Range</p>
                        <p className="text-base font-semibold">{startDate} - {endDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Email Limit</p>
                        <p className="text-base font-semibold">{limit} emails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-16">
                  <div className="text-center text-muted-foreground">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-base font-medium">No pipeline execution yet</p>
                    <p className="text-sm">Configure and run the pipeline to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pipeline;
