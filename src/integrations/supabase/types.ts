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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      daily_entries: {
        Row: {
          achieved: boolean | null
          completion_percentage: number | null
          created_at: string
          date: string
          html_study: boolean | null
          html_study_topics: string[] | null
          id: string
          month_id: string
          notes: string | null
          reason: string | null
          updated_at: string
          user_id: string
          wakeup_5am: boolean | null
          work_block: boolean | null
        }
        Insert: {
          achieved?: boolean | null
          completion_percentage?: number | null
          created_at?: string
          date: string
          html_study?: boolean | null
          html_study_topics?: string[] | null
          id?: string
          month_id: string
          notes?: string | null
          reason?: string | null
          updated_at?: string
          user_id: string
          wakeup_5am?: boolean | null
          work_block?: boolean | null
        }
        Update: {
          achieved?: boolean | null
          completion_percentage?: number | null
          created_at?: string
          date?: string
          html_study?: boolean | null
          html_study_topics?: string[] | null
          id?: string
          month_id?: string
          notes?: string | null
          reason?: string | null
          updated_at?: string
          user_id?: string
          wakeup_5am?: boolean | null
          work_block?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_entries_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
        ]
      }
      design_portfolio: {
        Row: {
          created_at: string
          date: string
          external_link: string | null
          file_url: string | null
          id: string
          title: string
          tool: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          external_link?: string | null
          file_url?: string | null
          id?: string
          title: string
          tool?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          external_link?: string | null
          file_url?: string | null
          id?: string
          title?: string
          tool?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          archived: boolean | null
          category: string
          created_at: string
          deadline: string | null
          id: string
          month_id: string | null
          notes: string | null
          priority: string
          reason: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          category?: string
          created_at?: string
          deadline?: string | null
          id?: string
          month_id?: string | null
          notes?: string | null
          priority?: string
          reason?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean | null
          category?: string
          created_at?: string
          deadline?: string | null
          id?: string
          month_id?: string | null
          notes?: string | null
          priority?: string
          reason?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
        ]
      }
      health_metrics: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          id: string
          meals: number | null
          updated_at: string
          user_id: string
          water_ml: number | null
          weight: number | null
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date: string
          id?: string
          meals?: number | null
          updated_at?: string
          user_id: string
          water_ml?: number | null
          weight?: number | null
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          id?: string
          meals?: number | null
          updated_at?: string
          user_id?: string
          water_ml?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      html_curriculum: {
        Row: {
          completed: boolean | null
          completed_date: string | null
          created_at: string
          id: string
          notes: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      months: {
        Row: {
          created_at: string
          end_date: string
          id: string
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          challenges: string | null
          content: string | null
          created_at: string
          date: string
          id: string
          prayer_verse: string | null
          type: string
          updated_at: string
          user_id: string
          wins: string | null
        }
        Insert: {
          challenges?: string | null
          content?: string | null
          created_at?: string
          date: string
          id?: string
          prayer_verse?: string | null
          type: string
          updated_at?: string
          user_id: string
          wins?: string | null
        }
        Update: {
          challenges?: string | null
          content?: string | null
          created_at?: string
          date?: string
          id?: string
          prayer_verse?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          wins?: string | null
        }
        Relationships: []
      }
      savings: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          note: string | null
          time_recorded: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          note?: string | null
          time_recorded?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          time_recorded?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
