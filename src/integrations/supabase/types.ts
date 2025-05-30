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
      affiliate_links: {
        Row: {
          code: string
          created_at: string
          event_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          event_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          event_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_tracking: {
        Row: {
          action_type: string
          affiliate_link_id: string
          conversion_value: number | null
          created_at: string
          event_id: string
          id: string
          ip_address: string | null
          referred_user_id: string | null
          ticket_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          affiliate_link_id: string
          conversion_value?: number | null
          created_at?: string
          event_id: string
          id?: string
          ip_address?: string | null
          referred_user_id?: string | null
          ticket_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          affiliate_link_id?: string
          conversion_value?: number | null
          created_at?: string
          event_id?: string
          id?: string
          ip_address?: string | null
          referred_user_id?: string | null
          ticket_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_tracking_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_tracking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_tracking_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
      contract_templates: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          storage_path: string
          type: Database["public"]["Enums"]["contract_template_type"]
          updated_at: string
          updated_by: string | null
          variables: Json | null
          version: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          storage_path: string
          type: Database["public"]["Enums"]["contract_template_type"]
          updated_at?: string
          updated_by?: string | null
          variables?: Json | null
          version?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          storage_path?: string
          type?: Database["public"]["Enums"]["contract_template_type"]
          updated_at?: string
          updated_by?: string | null
          variables?: Json | null
          version?: string
        }
        Relationships: []
      }
      creator_payouts: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          id: string
          notes: string | null
          payout_date: string | null
          reference_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id: string
          id?: string
          notes?: string | null
          payout_date?: string | null
          reference_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          id?: string
          notes?: string | null
          payout_date?: string | null
          reference_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          id: string
          profile_image_url: string | null
          slug: string
          social_instagram: string | null
          social_tiktok: string | null
          social_twitter: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          profile_image_url?: string | null
          slug: string
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          profile_image_url?: string | null
          slug?: string
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_menu_selections: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          menu_item_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          menu_item_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          menu_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_menu_selections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_menu_selections_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "restaurant_menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_team_members: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_team_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "event_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      event_teams: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          score?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          ambassador_fee_percentage: number | null
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
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
          rejected_by: string | null
          rejection_date: string | null
          rejection_reason: string | null
          restaurant_id: string
          submitted_for_approval_at: string | null
          tickets_sold: number | null
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ambassador_fee_percentage?: number | null
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
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
          rejected_by?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
          restaurant_id: string
          submitted_for_approval_at?: string | null
          tickets_sold?: number | null
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ambassador_fee_percentage?: number | null
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
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
          rejected_by?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
          restaurant_id?: string
          submitted_for_approval_at?: string | null
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
      feature_flag_values: {
        Row: {
          created_at: string | null
          environment: Database["public"]["Enums"]["app_environment"]
          feature_id: string | null
          id: string
          is_enabled: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          environment: Database["public"]["Enums"]["app_environment"]
          feature_id?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: Database["public"]["Enums"]["app_environment"]
          feature_id?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_values_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          feature_key: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          feature_key: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          feature_key?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
          product_id: string | null
          renewal_at: string | null
          restaurant_id: string | null
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
          product_id?: string | null
          renewal_at?: string | null
          restaurant_id?: string | null
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
          product_id?: string | null
          renewal_at?: string | null
          restaurant_id?: string | null
          started_at?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      referral_links: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          id: string
          name: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          id?: string
          name: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          id?: string
          name?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tracking: {
        Row: {
          commission_amount: number | null
          created_at: string
          creator_id: string
          event_type: string
          id: string
          ip_hash: string | null
          referral_link_id: string
          revenue_amount: number | null
          transaction_id: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string
          creator_id: string
          event_type: string
          id?: string
          ip_hash?: string | null
          referral_link_id: string
          revenue_amount?: number | null
          transaction_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          commission_amount?: number | null
          created_at?: string
          creator_id?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          referral_link_id?: string
          revenue_amount?: number | null
          transaction_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_tracking_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_contracts: {
        Row: {
          contract_url: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          restaurant_id: string | null
          signed_at: string | null
          signed_by: string | null
          terms_version: string | null
          updated_at: string | null
        }
        Insert: {
          contract_url?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          restaurant_id?: string | null
          signed_at?: string | null
          signed_by?: string | null
          terms_version?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_url?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          restaurant_id?: string | null
          signed_at?: string | null
          signed_by?: string | null
          terms_version?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_contracts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      restaurant_referrals: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          id: string
          invited_at: string | null
          referred_by_creator_id: string | null
          restaurant_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          id?: string
          invited_at?: string | null
          referred_by_creator_id?: string | null
          restaurant_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          id?: string
          invited_at?: string | null
          referred_by_creator_id?: string | null
          restaurant_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_referrals_referred_by_creator_id_fkey"
            columns: ["referred_by_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_referrals_restaurant_id_fkey"
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
          business_license_image_url: string | null
          business_license_number: string | null
          city: string
          created_at: string
          cuisine_type: string
          default_ambassador_fee_percentage: number | null
          description: string | null
          drivers_license_image_url: string | null
          ein_number: string | null
          has_signed_contract: boolean | null
          id: string
          logo_url: string | null
          name: string
          owner_email: string | null
          owner_name: string | null
          owner_ssn_last4: string | null
          phone: string
          state: string
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
          zipcode: string
        }
        Insert: {
          address: string
          business_license_image_url?: string | null
          business_license_number?: string | null
          city: string
          created_at?: string
          cuisine_type: string
          default_ambassador_fee_percentage?: number | null
          description?: string | null
          drivers_license_image_url?: string | null
          ein_number?: string | null
          has_signed_contract?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          owner_email?: string | null
          owner_name?: string | null
          owner_ssn_last4?: string | null
          phone: string
          state: string
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          zipcode: string
        }
        Update: {
          address?: string
          business_license_image_url?: string | null
          business_license_number?: string | null
          city?: string
          created_at?: string
          cuisine_type?: string
          default_ambassador_fee_percentage?: number | null
          description?: string | null
          drivers_license_image_url?: string | null
          ein_number?: string | null
          has_signed_contract?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_email?: string | null
          owner_name?: string | null
          owner_ssn_last4?: string | null
          phone?: string
          state?: string
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          zipcode?: string
        }
        Relationships: []
      }
      social_media_connections: {
        Row: {
          created_at: string | null
          id: string
          is_connected: boolean
          meta_data: Json | null
          oauth_expires_at: string | null
          oauth_token: string | null
          oauth_token_secret: string | null
          platform: string
          profile_url: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_connected?: boolean
          meta_data?: Json | null
          oauth_expires_at?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          platform: string
          profile_url?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_connected?: boolean
          meta_data?: Json | null
          oauth_expires_at?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          platform?: string
          profile_url?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
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
          sold_by_creator_id: string | null
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
          sold_by_creator_id?: string | null
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
          sold_by_creator_id?: string | null
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
          {
            foreignKeyName: "tickets_sold_by_creator_id_fkey"
            columns: ["sold_by_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_targeting: {
        Row: {
          created_at: string | null
          feature_id: string
          id: string
          is_enabled: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_id: string
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_id?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_targeting_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
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
      get_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          raw_user_meta_data: Json
        }[]
      }
      has_active_membership: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_active_restaurant_membership: {
        Args: { restaurant_id: string; user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_creator: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_feature_enabled: {
        Args: {
          feature_key: string
          env?: Database["public"]["Enums"]["app_environment"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_environment: "development" | "staging" | "production"
      contract_template_type:
        | "restaurant"
        | "restaurant_referral"
        | "ticket_sales"
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
      app_environment: ["development", "staging", "production"],
      contract_template_type: [
        "restaurant",
        "restaurant_referral",
        "ticket_sales",
      ],
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
