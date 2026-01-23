import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, RotateCcw, Target, Loader2, Calendar } from "lucide-react";

const chartConfig = {
  completed: {
    label: "Merged",
    color: "hsl(142, 76%, 36%)",
  },
  rolled_back: {
    label: "Restored",
    color: "hsl(38, 92%, 50%)",
  },
};

const COLORS = {
  completed: "#22c55e",
  rolled_back: "#f59e0b",
};

export default function StatsSummary() {
  const { locationId, isAuthenticated } = useLocation();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["detailed-merge-stats", locationId],
    queryFn: () => api.getDetailedMergeStats(30),
    enabled: isAuthenticated && !!locationId,
  });


  const { data: rulesData } = useQuery({
    queryKey: ["rules", locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
  });

  const { data: contactsData } = useQuery({
    queryKey: ["contacts-stats", locationId],
    queryFn: () => api.getContactsStats(),
    enabled: isAuthenticated && !!locationId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Your Stats"
          description="Detailed analytics and insights"
        >
          <Button size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </PageHeader>

        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Stats</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {(error as Error).message || "Failed to load statistics. Please try again."}
            </p>
            <Button asChild>
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats || !stats.summary || stats.summary.total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Your Stats"
          description="Detailed analytics and insights"
        >
          <Button size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </PageHeader>

        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Start merging duplicates to see your stats and analytics here.
            </p>
            <Button asChild>
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate trends (compare last 7 days to previous 7 days)
  const last7Days = stats.time_series.slice(-7);
  const prev7Days = stats.time_series.slice(-14, -7);
  const last7Total = last7Days.reduce((sum, d) => sum + d.completed, 0);
  const prev7Total = prev7Days.reduce((sum, d) => sum + d.completed, 0);
  const trend = prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total) * 100 : 0;

  // Pie chart data
  const pieData = [
    { name: "Merged", value: stats.summary.completed, color: COLORS.completed },
    { name: "Restored", value: stats.summary.rolled_back, color: COLORS.rolled_back },
  ].filter(d => d.value > 0);

  // Format date for chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formattedTimeSeries = stats.time_series.map(d => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  // Calculate average merges per day (for days with activity)
  const activeDays = stats.time_series.filter(d => d.completed > 0 || d.rolled_back > 0);
  const avgPerDay = activeDays.length > 0
    ? (stats.summary.total / activeDays.length).toFixed(1)
    : "0";

  const rules = rulesData?.data ?? [];
  const activeRules = rules.filter(r => r.is_active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Stats"
        description="Detailed analytics and insights for the last 30 days"
      >
        <Button size="sm" asChild>
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
        </Button>
      </PageHeader>

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Merged</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.summary.completed}</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              {trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-500">+{trend.toFixed(0)}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">{trend.toFixed(0)}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-muted-foreground">No change</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{stats.success_rate}%</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <span>{stats.summary.total} total operations</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Restored</p>
                <p className="text-3xl font-bold text-amber-500">{stats.summary.rolled_back}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <RotateCcw className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <span>Rollbacks performed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg/Active Day</p>
                <p className="text-3xl font-bold">{avgPerDay}</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <span>{activeDays.length} active days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Merge Activity</CardTitle>
            <CardDescription>Daily merge operations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={formattedTimeSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.completed} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.completed} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke={COLORS.completed}
                  strokeWidth={2}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of all operations</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Rule Breakdown */}
      {stats.by_rule.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Performance by Rule</CardTitle>
            <CardDescription>Merge results grouped by match rule</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={stats.by_rule}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 0, 0]} />
                <Bar dataKey="rolled_back" stackId="a" fill={COLORS.rolled_back} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Records</p>
              <p className="text-2xl font-bold">{contactsData?.total?.toLocaleString() ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">in your CRM</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Active Rules</p>
              <p className="text-2xl font-bold">{activeRules}</p>
              <p className="text-xs text-muted-foreground mt-1">of {rules.length} total</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
