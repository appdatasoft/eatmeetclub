export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_config: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          cover_image: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          price: number
          published: boolean | null
          restaurant_id: string
          tickets_sold: number | null
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity: number
          cover_image?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          price: number
          published?: boolean | null
          restaurant_id: string
          tickets_sold?: number | null
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          cover_image?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          price?: number
          published?: boolean | null
          restaurant_id?: string
          tickets_sold?: number | null
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          membership_id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          membership_id: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          membership_id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          is_subscription: boolean
          last_payment_id: string | null
          renewal_at: string | null
          started_at: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_subscription?: boolean
          last_payment_id?: string | null
          renewal_at?: string | null
          started_at?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_subscription?: boolean
          last_payment_id?: string | null
          renewal_at?: string | null
          started_at?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          date: string
          event_id: string | null
          id: string
          is_auto_generated: boolean | null
          location: string
          privacy: Database["public"]["Enums"]["memory_privacy_type"]
          restaurant_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          event_id?: string | null
          id?: string
          is_auto_generated?: boolean | null
          location: string
          privacy?: Database["public"]["Enums"]["memory_privacy_type"]
          restaurant_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          event_id?: string | null
          id?: string
          is_auto_generated?: boolean | null
          location?: string
          privacy?: Database["public"]["Enums"]["memory_privacy_type"]
          restaurant_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_attendees: {
        Row: {
          created_at: string
          id: string
          is_tagged: boolean | null
          memory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_tagged?: boolean | null
          memory_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_tagged?: boolean | null
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_attendees_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_content: {
        Row: {
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string
          id: string
          memory_id: string
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string
          id?: string
          memory_id: string
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          id?: string
          memory_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_content_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_dishes: {
        Row: {
          created_at: string
          dish_name: string
          id: string
          memory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dish_name: string
          id?: string
          memory_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          dish_name?: string
          id?: string
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_dishes_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          created_by: string | null
          element_id: string
          id: string
          page_path: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          element_id: string
          id?: string
          page_path: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          element_id?: string
          id?: string
          page_path?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          interval: string | null
          name: string
          price_cents: number
          stripe_price_id: string
          stripe_product_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          name: string
          price_cents: number
          stripe_price_id: string
          stripe_product_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          name?: string
          price_cents?: number
          stripe_price_id?: string
          stripe_product_id?: string
        }
        Relationships: []
      }
      restaurant_menu_ingredients: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          name: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          name: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "restaurant_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_menu_ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menu_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menu_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          menu_item_id: string
          restaurant_id: string
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type?: string
          menu_item_id: string
          restaurant_id: string
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          menu_item_id?: string
          restaurant_id?: string
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_media_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "restaurant_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_menu_media_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          city: string
          created_at: string
          cuisine_type: string
          description: string | null
          id: string
          name: string
          phone: string
          state: string
          updated_at: string
          user_id: string
          website: string | null
          zipcode: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          cuisine_type: string
          description?: string | null
          id?: string
          name: string
          phone: string
          state: string
          updated_at?: string
          user_id: string
          website?: string | null
          zipcode: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          cuisine_type?: string
          description?: string | null
          id?: string
          name?: string
          phone?: string
          state?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          zipcode?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          event_id: string
          id: string
          payment_id: string | null
          payment_status: string | null
          price: number
          purchase_date: string | null
          quantity: number
          service_fee: number
          total_amount: number
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          price: number
          purchase_date?: string | null
          quantity: number
          service_fee: number
          total_amount: number
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          price?: number
          purchase_date?: string | null
          quantity?: number
          service_fee?: number
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_fee: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_active_membership: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      memory_mood_type:
        | "cozy"
        | "romantic"
        | "fun"
        | "deep_talk"
        | "loud"
        | "chill"
        | "other"
      memory_privacy_type: "public" | "private" | "unlisted"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      memory_mood_type: [
        "cozy",
        "romantic",
        "fun",
        "deep_talk",
        "loud",
        "chill",
        "other",
      ],
      memory_privacy_type: ["public", "private", "unlisted"],
      user_role: ["user", "admin"],
    },
  },
} as const
