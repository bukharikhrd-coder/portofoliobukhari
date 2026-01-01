export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string
          description_1: string | null
          description_2: string | null
          headline_1: string | null
          headline_2: string | null
          id: string
          section_label: string | null
          stat_1_label: string | null
          stat_1_number: string | null
          stat_2_label: string | null
          stat_2_number: string | null
          stat_3_label: string | null
          stat_3_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_1?: string | null
          description_2?: string | null
          headline_1?: string | null
          headline_2?: string | null
          id?: string
          section_label?: string | null
          stat_1_label?: string | null
          stat_1_number?: string | null
          stat_2_label?: string | null
          stat_2_number?: string | null
          stat_3_label?: string | null
          stat_3_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_1?: string | null
          description_2?: string | null
          headline_1?: string | null
          headline_2?: string | null
          id?: string
          section_label?: string | null
          stat_1_label?: string | null
          stat_1_number?: string | null
          stat_2_label?: string | null
          stat_2_number?: string | null
          stat_3_label?: string | null
          stat_3_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_summary: {
        Row: {
          id: string
          last_updated: string
          total_pageviews: number | null
          total_unique_visitors: number | null
        }
        Insert: {
          id?: string
          last_updated?: string
          total_pageviews?: number | null
          total_unique_visitors?: number | null
        }
        Update: {
          id?: string
          last_updated?: string
          total_pageviews?: number | null
          total_unique_visitors?: number | null
        }
        Relationships: []
      }
      contact_content: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          github_url: string | null
          headline_1: string | null
          headline_2: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          section_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          github_url?: string | null
          headline_1?: string | null
          headline_2?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          section_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          github_url?: string | null
          headline_1?: string | null
          headline_2?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          section_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          end_year: string | null
          field_of_study: string | null
          id: string
          institution: string
          is_current: boolean | null
          location: string | null
          order_index: number | null
          start_year: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          end_year?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          is_current?: boolean | null
          location?: string | null
          order_index?: number | null
          start_year: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          end_year?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          is_current?: boolean | null
          location?: string | null
          order_index?: number | null
          start_year?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_social_links: {
        Row: {
          created_at: string
          icon_name: string | null
          id: string
          is_active: boolean
          order_index: number | null
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          brand_name: string | null
          created_at: string
          cta_primary_link: string | null
          cta_primary_text: string | null
          cta_secondary_link: string | null
          cta_secondary_text: string | null
          date_display: string | null
          description: string | null
          headline_1: string
          headline_2: string
          id: string
          subtitle: string
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          cta_primary_link?: string | null
          cta_primary_text?: string | null
          cta_secondary_link?: string | null
          cta_secondary_text?: string | null
          date_display?: string | null
          description?: string | null
          headline_1?: string
          headline_2?: string
          id?: string
          subtitle?: string
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          cta_primary_link?: string | null
          cta_primary_text?: string | null
          cta_secondary_link?: string | null
          cta_secondary_text?: string | null
          date_display?: string | null
          description?: string | null
          headline_1?: string
          headline_2?: string
          id?: string
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      language_skills: {
        Row: {
          created_at: string
          id: string
          language_name: string
          order_index: number | null
          proficiency_level: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_name: string
          order_index?: number | null
          proficiency_level?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_name?: string
          order_index?: number | null
          proficiency_level?: string
        }
        Relationships: []
      }
      project_tags: {
        Row: {
          created_at: string
          id: string
          project_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          order_index: number | null
          show_link: boolean | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          order_index?: number | null
          show_link?: boolean | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          order_index?: number | null
          show_link?: boolean | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      section_config: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          order_index: number
          section_key: string
          section_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_key: string
          section_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_key?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      tech_stack: {
        Row: {
          category: string | null
          created_at: string
          icon_name: string | null
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      trainings: {
        Row: {
          certificate_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          organization: string | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          organization?: string | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          organization?: string | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string
          id: string
          original_text: string
          target_language: string
          translated_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_text: string
          target_language: string
          translated_text: string
        }
        Update: {
          created_at?: string
          id?: string
          original_text?: string
          target_language?: string
          translated_text?: string
        }
        Relationships: []
      }
      video_portfolio: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          platform: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          platform?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          platform?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      video_tools: {
        Row: {
          created_at: string
          icon_name: string | null
          id: string
          name: string
          order_index: number | null
          proficiency_level: string | null
        }
        Insert: {
          created_at?: string
          icon_name?: string | null
          id?: string
          name: string
          order_index?: number | null
          proficiency_level?: string | null
        }
        Update: {
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
          order_index?: number | null
          proficiency_level?: string | null
        }
        Relationships: []
      }
      visitor_analytics: {
        Row: {
          country: string | null
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          order_index: number | null
          position: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          order_index?: number | null
          position: string
          start_date: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          order_index?: number | null
          position?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_journey_gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          order_index: number | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
