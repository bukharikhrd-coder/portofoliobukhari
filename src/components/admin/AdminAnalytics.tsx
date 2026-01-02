import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users, TrendingUp, Calendar, Globe, Monitor, Smartphone, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminAnalytics = () => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["analytics_summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("analytics_summary").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: recentVisits, isLoading: visitsLoading } = useQuery({
    queryKey: ["recent_visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: last7DaysData } = useQuery({
    queryKey: ["last_7_days_analytics"],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data, error } = await supabase
        .from("visitor_analytics")
        .select("*")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: todayStats } = useQuery({
    queryKey: ["today_stats"],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const yesterday = startOfDay(subDays(new Date(), 1)).toISOString();
      const yesterdayEnd = endOfDay(subDays(new Date(), 1)).toISOString();

      const { count: todayPageviews } = await supabase
        .from("visitor_analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      const { count: yesterdayPageviews } = await supabase
        .from("visitor_analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday)
        .lte("created_at", yesterdayEnd);

      const { data: uniqueToday } = await supabase
        .from("visitor_analytics")
        .select("visitor_id")
        .gte("created_at", today);

      const { data: uniqueYesterday } = await supabase
        .from("visitor_analytics")
        .select("visitor_id")
        .gte("created_at", yesterday)
        .lte("created_at", yesterdayEnd);

      const todayUnique = new Set(uniqueToday?.map((v) => v.visitor_id)).size;
      const yesterdayUnique = new Set(uniqueYesterday?.map((v) => v.visitor_id)).size;

      return {
        pageviews: todayPageviews || 0,
        uniqueVisitors: todayUnique,
        yesterdayPageviews: yesterdayPageviews || 0,
        yesterdayUnique,
      };
    },
  });

  // Process chart data for last 7 days
  const chartData = useMemo(() => {
    if (!last7DaysData) return [];

    const dailyData: Record<string, { date: string; pageviews: number; visitors: Set<string> }> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyData[date] = { date, pageviews: 0, visitors: new Set() };
    }

    last7DaysData.forEach((visit) => {
      const date = format(new Date(visit.created_at), "yyyy-MM-dd");
      if (dailyData[date]) {
        dailyData[date].pageviews++;
        dailyData[date].visitors.add(visit.visitor_id);
      }
    });

    return Object.values(dailyData).map((d) => ({
      date: format(new Date(d.date), "EEE"),
      fullDate: format(new Date(d.date), "MMM d"),
      pageviews: d.pageviews,
      visitors: d.visitors.size,
    }));
  }, [last7DaysData]);

  // Top pages
  const topPages = useMemo(() => {
    if (!recentVisits) return [];

    const pageCount: Record<string, number> = {};
    recentVisits.forEach((visit) => {
      pageCount[visit.page_path] = (pageCount[visit.page_path] || 0) + 1;
    });

    return Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));
  }, [recentVisits]);

  // Device breakdown (simple detection from user agent)
  const deviceData = useMemo(() => {
    if (!recentVisits) return [];

    let mobile = 0;
    let desktop = 0;

    recentVisits.forEach((visit) => {
      const ua = visit.user_agent?.toLowerCase() || "";
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        mobile++;
      } else {
        desktop++;
      }
    });

    return [
      { name: "Desktop", value: desktop, icon: Monitor },
      { name: "Mobile", value: mobile, icon: Smartphone },
    ];
  }, [recentVisits]);

  // Referrer breakdown
  const referrerData = useMemo(() => {
    if (!recentVisits) return [];

    const refCount: Record<string, number> = {};
    recentVisits.forEach((visit) => {
      const ref = visit.referrer ? new URL(visit.referrer).hostname : "Direct";
      refCount[ref] = (refCount[ref] || 0) + 1;
    });

    return Object.entries(refCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  }, [recentVisits]);

  // Hourly distribution for today
  const hourlyData = useMemo(() => {
    if (!last7DaysData) return [];

    const today = format(new Date(), "yyyy-MM-dd");
    const hourlyCount: Record<number, number> = {};

    for (let i = 0; i < 24; i++) {
      hourlyCount[i] = 0;
    }

    last7DaysData.forEach((visit) => {
      const visitDate = format(new Date(visit.created_at), "yyyy-MM-dd");
      if (visitDate === today) {
        const hour = new Date(visit.created_at).getHours();
        hourlyCount[hour]++;
      }
    });

    return Object.entries(hourlyCount).map(([hour, count]) => ({
      hour: `${hour.padStart(2, "0")}:00`,
      visits: count,
    }));
  }, [last7DaysData]);

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(change).toFixed(0)}%
      </span>
    );
  };

  if (summaryLoading || visitsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="animate-pulse h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">ANALYTICS</h1>
          <p className="text-muted-foreground mt-1">Track your portfolio performance</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {summary?.last_updated ? format(new Date(summary.last_updated), "MMM d, HH:mm") : "N/A"}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <Eye className="text-primary" size={20} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{summary?.total_pageviews?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Pageviews</p>
        </div>

        <div className="bg-card border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-primary" size={20} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{summary?.total_unique_visitors?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Unique Visitors</p>
        </div>

        <div className="bg-card border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-primary" size={20} />
            <div className="flex items-center gap-2">
              {getChangeIndicator(todayStats?.pageviews || 0, todayStats?.yesterdayPageviews || 0)}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</span>
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{todayStats?.pageviews?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Today's Pageviews</p>
        </div>

        <div className="bg-card border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="text-primary" size={20} />
            <div className="flex items-center gap-2">
              {getChangeIndicator(todayStats?.uniqueVisitors || 0, todayStats?.yesterdayUnique || 0)}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</span>
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{todayStats?.uniqueVisitors?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Today's Unique Visitors</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Last 7 Days
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                  }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  name="Pageviews"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2) / 0.2)"
                  name="Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-card border border-border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-primary" />
            Device Type
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {deviceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hourly Distribution */}
        <div className="lg:col-span-2 bg-card border border-border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Today's Hourly Traffic
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  interval={3}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                  }}
                />
                <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages & Referrers */}
        <div className="space-y-4">
          {/* Top Pages */}
          <div className="bg-card border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Globe size={14} className="text-primary" />
              Top Pages
            </h3>
            <div className="space-y-2">
              {topPages.map((item, index) => (
                <div key={item.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm truncate max-w-[120px]">{item.page}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-card border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <TrendingUp size={14} className="text-primary" />
              Traffic Sources
            </h3>
            <div className="space-y-2">
              {referrerData.map((item, index) => (
                <div key={item.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm truncate max-w-[120px]">{item.source}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            Recent Visits
          </h3>
          <span className="text-xs text-muted-foreground">Last 50 visits</span>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentVisits?.map((visit) => {
                const ua = visit.user_agent?.toLowerCase() || "";
                const isMobile = ua.includes("mobile") || ua.includes("android") || ua.includes("iphone");
                
                return (
                  <tr key={visit.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs">
                      {format(new Date(visit.created_at), "MMM d, HH:mm")}
                    </td>
                    <td className="px-4 py-2 text-xs font-medium">{visit.page_path}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground hidden sm:table-cell">
                      {isMobile ? (
                        <span className="flex items-center gap-1"><Smartphone size={12} /> Mobile</span>
                      ) : (
                        <span className="flex items-center gap-1"><Monitor size={12} /> Desktop</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground hidden md:table-cell">
                      {visit.referrer ? new URL(visit.referrer).hostname : "Direct"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
