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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      scraping_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          source: Database["public"]["Enums"]["vacancy_source"]
          started_at: string
          status: string
          vacancies_added: number | null
          vacancies_found: number | null
          vacancies_updated: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source: Database["public"]["Enums"]["vacancy_source"]
          started_at?: string
          status?: string
          vacancies_added?: number | null
          vacancies_found?: number | null
          vacancies_updated?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source?: Database["public"]["Enums"]["vacancy_source"]
          started_at?: string
          status?: string
          vacancies_added?: number | null
          vacancies_found?: number | null
          vacancies_updated?: number | null
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          company_name: string
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_required: Database["public"]["Enums"]["experience_level"]
          full_description: string | null
          id: string
          is_active: boolean | null
          last_updated: string
          location: string
          posted_date: string
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          scraped_date: string
          short_description: string | null
          source: Database["public"]["Enums"]["vacancy_source"]
          source_url: string
          title: string
        }
        Insert: {
          company_name: string
          created_at?: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_required: Database["public"]["Enums"]["experience_level"]
          full_description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string
          location: string
          posted_date: string
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          scraped_date?: string
          short_description?: string | null
          source: Database["public"]["Enums"]["vacancy_source"]
          source_url: string
          title: string
        }
        Update: {
          company_name?: string
          created_at?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_required?: Database["public"]["Enums"]["experience_level"]
          full_description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string
          location?: string
          posted_date?: string
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          scraped_date?: string
          short_description?: string | null
          source?: Database["public"]["Enums"]["vacancy_source"]
          source_url?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_old_vacancies: { Args: never; Returns: number }
    }
    Enums: {
      employment_type:
        | "full-time"
        | "part-time"
        | "temporary"
        | "contract"
        | "internship"
      experience_level:
        | "no-experience"
        | "1-year"
        | "1-5-years"
        | "5-10-years"
        | "10-plus-years"
      vacancy_source: "work.ua" | "robota.ua" | "dou.ua" | "other"
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
    Enums: {
      employment_type: [
        "full-time",
        "part-time",
        "temporary",
        "contract",
        "internship",
      ],
      experience_level: [
        "no-experience",
        "1-year",
        "1-5-years",
        "5-10-years",
        "10-plus-years",
      ],
      vacancy_source: ["work.ua", "robota.ua", "dou.ua", "other"],
    },
  },
} as const
