import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SectionConfig {
  id: string;
  section_key: string;
  section_name: string;
  order_index: number;
  is_visible: boolean;
}

export const useSectionConfig = () => {
  return useQuery({
    queryKey: ["section-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("section_config")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as SectionConfig[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
