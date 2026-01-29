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
      activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          club_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          link: string | null
          metadata: Json | null
          title: string
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          club_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          title: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          club_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string | null
          avg_comments: number | null
          avg_likes: number | null
          avg_video_views: number | null
          business_description: string | null
          city: string | null
          club_name: string
          coaches: string[] | null
          contact_name: string | null
          content_created_date: string | null
          converted_date: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          facebook: string | null
          first_comment_date: string | null
          first_dm_date: string | null
          first_response_date: string | null
          followed_date: string | null
          google_maps_url: string | null
          id: string
          insta_bio: string | null
          insta_followers: number | null
          insta_url: string | null
          instagram_handle: string | null
          key_individuals: string[] | null
          linkedin: string | null
          logo: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          number_of_courts: number | null
          ownership_group: string | null
          phone: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          response_time_hours: number | null
          suburb: string | null
          tier: Database["public"]["Enums"]["club_tier"] | null
          top_hashtags: string[] | null
          total_comments: number | null
          total_content_pieces: number | null
          total_dms: number | null
          trial_start_date: string | null
          twitter: string | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_video_views?: number | null
          business_description?: string | null
          city?: string | null
          club_name: string
          coaches?: string[] | null
          contact_name?: string | null
          content_created_date?: string | null
          converted_date?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          facebook?: string | null
          first_comment_date?: string | null
          first_dm_date?: string | null
          first_response_date?: string | null
          followed_date?: string | null
          google_maps_url?: string | null
          id?: string
          insta_bio?: string | null
          insta_followers?: number | null
          insta_url?: string | null
          instagram_handle?: string | null
          key_individuals?: string[] | null
          linkedin?: string | null
          logo?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          number_of_courts?: number | null
          ownership_group?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          response_time_hours?: number | null
          suburb?: string | null
          tier?: Database["public"]["Enums"]["club_tier"] | null
          top_hashtags?: string[] | null
          total_comments?: number | null
          total_content_pieces?: number | null
          total_dms?: number | null
          trial_start_date?: string | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_video_views?: number | null
          business_description?: string | null
          city?: string | null
          club_name?: string
          coaches?: string[] | null
          contact_name?: string | null
          content_created_date?: string | null
          converted_date?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          facebook?: string | null
          first_comment_date?: string | null
          first_dm_date?: string | null
          first_response_date?: string | null
          followed_date?: string | null
          google_maps_url?: string | null
          id?: string
          insta_bio?: string | null
          insta_followers?: number | null
          insta_url?: string | null
          instagram_handle?: string | null
          key_individuals?: string[] | null
          linkedin?: string | null
          logo?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          number_of_courts?: number | null
          ownership_group?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          response_time_hours?: number | null
          suburb?: string | null
          tier?: Database["public"]["Enums"]["club_tier"] | null
          top_hashtags?: string[] | null
          total_comments?: number | null
          total_content_pieces?: number | null
          total_dms?: number | null
          trial_start_date?: string | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      content_pieces: {
        Row: {
          club_id: string | null
          club_response: string | null
          created_at: string | null
          created_by: string | null
          created_date: string | null
          description: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          sent_date: string | null
          status: string | null
          style: string | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          club_id?: string | null
          club_response?: string | null
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          sent_date?: string | null
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          club_id?: string | null
          club_response?: string | null
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          sent_date?: string | null
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          last_used: string | null
          template_body: string
          template_name: string
          template_type: string | null
          updated_at: string | null
          use_count: number | null
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_used?: string | null
          template_body: string
          template_name: string
          template_type?: string | null
          updated_at?: string | null
          use_count?: number | null
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_used?: string | null
          template_body?: string
          template_name?: string
          template_type?: string | null
          updated_at?: string | null
          use_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      ownership_groups: {
        Row: {
          brand_color: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          relationship_status: string | null
          total_clubs: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_color?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          relationship_status?: string | null
          total_clubs?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_color?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          relationship_status?: string | null
          total_clubs?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          contact_date: string | null
          contact_method: string | null
          contact_method_other: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          instagram_handle: string | null
          linkedin: string | null
          notes: string | null
          phone: string | null
          profile_image: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          contact_date?: string | null
          contact_method?: string | null
          contact_method_other?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          instagram_handle?: string | null
          linkedin?: string | null
          notes?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          contact_date?: string | null
          contact_method?: string | null
          contact_method_other?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          linkedin?: string | null
          notes?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      person_link_suggestions: {
        Row: {
          club_id: string | null
          created_at: string
          id: string
          link_type: string
          match_reason: string | null
          ownership_group_name: string | null
          person_id: string
          status: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          id?: string
          link_type: string
          match_reason?: string | null
          ownership_group_name?: string | null
          person_id: string
          status?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          id?: string
          link_type?: string
          match_reason?: string | null
          ownership_group_name?: string | null
          person_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_link_suggestions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_link_suggestions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_links: {
        Row: {
          club_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_primary: boolean | null
          link_type: string
          ownership_group_name: string | null
          person_id: string
          role_at_entity: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          link_type: string
          ownership_group_name?: string | null
          person_id: string
          role_at_entity?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          link_type?: string
          ownership_group_name?: string | null
          person_id?: string
          role_at_entity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_links_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_links_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          club_id: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      club_tier:
        | "enterprise"
        | "multi_court"
        | "boutique"
        | "group_owned"
        | "large"
      pipeline_stage:
        | "not_contacted"
        | "followed"
        | "engaged"
        | "dm_sent"
        | "responded"
        | "content_created"
        | "trial"
        | "customer"
        | "dead"
      priority_level: "high" | "medium" | "low"
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
      app_role: ["admin", "user"],
      club_tier: [
        "enterprise",
        "multi_court",
        "boutique",
        "group_owned",
        "large",
      ],
      pipeline_stage: [
        "not_contacted",
        "followed",
        "engaged",
        "dm_sent",
        "responded",
        "content_created",
        "trial",
        "customer",
        "dead",
      ],
      priority_level: ["high", "medium", "low"],
    },
  },
} as const
