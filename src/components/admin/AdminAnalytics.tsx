import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

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
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: todayStats } = useQuery({
    queryKey: ["today_stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { count: pageviews } = await supabase
        .from("visitor_analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      const { data: uniqueToday } = await supabase
        .from("visitor_analytics")
        .select("visitor_id")
        .gte("created_at", today);

      const uniqueVisitors = new Set(uniqueToday?.map((v) => v.visitor_id)).size;

      return { pageviews: pageviews || 0, uniqueVisitors };
    },
  });

  if (summaryLoading || visitsLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-display mb-6">Visitor Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="text-primary" size={24} />
            <span className="text-xs text-muted-foreground uppercase">Total</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{summary?.total_pageviews?.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Pageviews</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-primary" size={24} />
            <span className="text-xs text-muted-foreground uppercase">Total</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{summary?.total_unique_visitors?.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Unique Visitors</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-primary" size={24} />
            <span className="text-xs text-muted-foreground uppercase">Today</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{todayStats?.pageviews?.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Today's Pageviews</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="text-primary" size={24} />
            <span className="text-xs text-muted-foreground uppercase">Today</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{todayStats?.uniqueVisitors?.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Today's Unique Visitors</p>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Recent Visits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Visitor ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentVisits?.map((visit) => (
                <tr key={visit.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(visit.created_at), "MMM d, HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{visit.page_path}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                    {visit.visitor_id.slice(0, 20)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {visit.referrer || "Direct"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
