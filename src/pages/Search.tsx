import { useState } from "react";
import { Search as SearchIcon, Loader2, Mail, Calendar, Sparkles, Database } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface SearchResult {
  subject: string;
  from: string;
  body: string;
  date: string;
  snippet: string;
  similarity_score?: number;
  summary?: string;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summarize, setSummarize] = useState(false);
  const [useFaiss, setUseFaiss] = useState(true);
  const [fetchNewEmails, setFetchNewEmails] = useState(false);
  const [topK, setTopK] = useState(5);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/check-auth");
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(data.authenticated);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          summarize,
          useFaiss,
          topK,
          fetchNewEmails,
        }),
      });

      if (response.status === 401) {
        toast.error("Authentication required", {
          description: "Please authenticate to use the search feature",
        });
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Search failed");
      }

      const data = await response.json();
      
      if (data.message) {
        toast.info(data.message);
        setResults([]);
      } else {
        setResults(data.results || []);
        toast.success("Search completed", {
          description: `Found ${data.results?.length || 0} similar email(s)`,
        });
      }
    } catch (error) {
      toast.error("Search failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    checkAuth();
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-primary p-2.5">
              <SearchIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Email Search</h1>
              <p className="text-sm text-muted-foreground">AI-powered semantic email search</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search Configuration */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Search Settings</CardTitle>
              <CardDescription className="text-sm">Configure your search parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="query" className="text-sm font-medium">
                  Search Query
                </Label>
                <Textarea
                  id="query"
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topK" className="text-sm font-medium">
                  Number of Results
                </Label>
                <Input
                  id="topK"
                  type="number"
                  min="1"
                  max="20"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="h-10"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="useFaiss" className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Use FAISS
                    </Label>
                    <p className="text-xs text-muted-foreground">Fast similarity search</p>
                  </div>
                  <Switch
                    id="useFaiss"
                    checked={useFaiss}
                    onCheckedChange={setUseFaiss}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="summarize" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Summarize
                    </Label>
                    <p className="text-xs text-muted-foreground">AI email summaries</p>
                  </div>
                  <Switch
                    id="summarize"
                    checked={summarize}
                    onCheckedChange={setSummarize}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="fetchNew" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fetch New
                    </Label>
                    <p className="text-xs text-muted-foreground">Update email database</p>
                  </div>
                  <Switch
                    id="fetchNew"
                    checked={fetchNewEmails}
                    onCheckedChange={setFetchNewEmails}
                  />
                </div>
              </div>

              {!authenticated && (
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                  <p className="text-sm font-medium text-warning-foreground">
                    Authentication required to search
                  </p>
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="w-full h-11 font-medium text-base"
              >
                {loading ? (
                  <>
                    <div className="spinner h-5 w-5 mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-2 h-5 w-5" />
                    Search Emails
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Search Results</CardTitle>
                <CardDescription className="text-sm">
                  {results.length > 0 ? `${results.length} similar email(s) found` : "No results to display"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Searching emails...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <SearchIcon className="h-16 w-16 opacity-50" />
                    <p className="text-base font-medium">No results found</p>
                    <p className="text-sm">Enter a query and click search to find similar emails</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow fade-in"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-primary shrink-0" />
                              <h3 className="font-semibold text-base truncate">{result.subject}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">From:</span> {result.from}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {result.similarity_score && (
                              <Badge variant="secondary" className="text-xs">
                                {(result.similarity_score * 100).toFixed(1)}% match
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(result.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {result.summary && (
                          <div className="mb-3 p-3 rounded-md bg-info/10 border border-info/20">
                            <p className="text-xs font-medium text-info-foreground mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Summary
                            </p>
                            <p className="text-sm text-foreground">{result.summary}</p>
                          </div>
                        )}

                        <p className="text-sm text-foreground line-clamp-3">{result.body}</p>
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

export default Search;
