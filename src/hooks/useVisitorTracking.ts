import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const generateVisitorId = (): string => {
  const stored = localStorage.getItem("visitor_id");
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem("visitor_id", newId);
  return newId;
};

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = generateVisitorId();
        const pagePath = window.location.pathname;
        
        await supabase.from("visitor_analytics").insert({
          visitor_id: visitorId,
          page_path: pagePath,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

        // Update analytics summary
        const { data: summary } = await supabase
          .from("analytics_summary")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (summary) {
          // Check if this is a unique visitor today
          const today = new Date().toISOString().split("T")[0];
          const { count } = await supabase
            .from("visitor_analytics")
            .select("*", { count: "exact", head: true })
            .eq("visitor_id", visitorId)
            .gte("created_at", today);

          const isNewVisitorToday = count === 1;

          await supabase
            .from("analytics_summary")
            .update({
              total_pageviews: summary.total_pageviews + 1,
              total_unique_visitors: isNewVisitorToday
                ? summary.total_unique_visitors + 1
                : summary.total_unique_visitors,
              last_updated: new Date().toISOString(),
            })
            .eq("id", summary.id);
        }
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    trackVisit();
  }, []);
};
