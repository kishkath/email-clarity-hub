import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Mail, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Loader2
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Email {
  id?: number;
  subject: string;
  from: string;
  body: string;
  priority: string;
  received_at: string;
}

interface DashboardStats {
  total_emails: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  alerts_sent: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_emails: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    alerts_sent: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:1212/emails?limit=100");
      if (response.ok) {
        const data = await response.json();
        const emailData = data.emails || [];
        setEmails(emailData.slice(0, 5)); // Get latest 5 for preview
        
        // Calculate stats
        const highPriority = emailData.filter((e: Email) => e.priority === "High Priority").length;
        const mediumPriority = emailData.filter((e: Email) => e.priority === "Medium Priority").length;
        const lowPriority = emailData.filter((e: Email) => e.priority === "Low Priority").length;
        
        setStats({
          total_emails: emailData.length,
          high_priority: highPriority,
          medium_priority: mediumPriority,
          low_priority: lowPriority,
          alerts_sent: highPriority, // Assuming all high priority trigger alerts
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const priorityData = [
    { name: "High Priority", value: stats.high_priority, color: "hsl(var(--destructive))" },
    { name: "Medium Priority", value: stats.medium_priority, color: "hsl(var(--warning))" },
    { name: "Low Priority", value: stats.low_priority, color: "hsl(var(--secondary))" },
  ];

  const barData = [
    { name: "High", count: stats.high_priority, fill: "hsl(var(--destructive))" },
    { name: "Medium", count: stats.medium_priority, fill: "hsl(var(--warning))" },
    { name: "Low", count: stats.low_priority, fill: "hsl(var(--secondary))" },
  ];

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
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-primary p-2.5">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Email management analytics and insights</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
                      <p className="text-3xl font-bold mt-2">{stats.total_emails}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Processed and classified</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alerts Sent</p>
                      <p className="text-3xl font-bold mt-2">{stats.alerts_sent}</p>
                    </div>
                    <div className="rounded-lg bg-warning/10 p-3">
                      <AlertCircle className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">WhatsApp notifications</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                      <p className="text-3xl font-bold mt-2">{stats.high_priority}</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-3">
                      <TrendingUp className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {stats.total_emails > 0 ? `${((stats.high_priority / stats.total_emails) * 100).toFixed(1)}% of total` : "0% of total"}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Low Priority</p>
                      <p className="text-3xl font-bold mt-2">{stats.low_priority}</p>
                    </div>
                    <div className="rounded-lg bg-success/10 p-3">
                      <Activity className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {stats.total_emails > 0 ? `${((stats.low_priority / stats.total_emails) * 100).toFixed(1)}% of total` : "0% of total"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Priority Distribution</CardTitle>
                  <CardDescription>Email classification breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Email Count by Priority</CardTitle>
                  <CardDescription>Comparative analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Emails Preview */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Emails</CardTitle>
                  <CardDescription>Latest classified emails</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/inbox")}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {emails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No emails to display</p>
                    <p className="text-xs">Run the pipeline to process emails</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emails.map((email, index) => (
                      <div
                        key={email.id || index}
                        className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate("/inbox")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-sm truncate">{email.subject}</h3>
                              <Badge variant={getPriorityColor(email.priority)} className="shrink-0 text-xs">
                                {email.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              <span className="font-medium">From:</span> {email.from}
                            </p>
                            <p className="text-xs text-foreground line-clamp-1">{email.body}</p>
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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
