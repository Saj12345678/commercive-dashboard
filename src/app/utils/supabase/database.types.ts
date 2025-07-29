export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string
          email: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          back_orders: number | null
          created_at: string
          id: string
          inventory_id: string
          inventory_level: Json | null
          product_id: string | null
          product_image: string | null
          sku: string | null
          store_name: string | null
        }
        Insert: {
          back_orders?: number | null
          created_at?: string
          id?: string
          inventory_id: string
          inventory_level?: Json | null
          product_id?: string | null
          product_image?: string | null
          sku?: string | null
          store_name?: string | null
        }
        Update: {
          back_orders?: number | null
          created_at?: string
          id?: string
          inventory_id?: string
          inventory_level?: Json | null
          product_id?: string | null
          product_image?: string | null
          sku?: string | null
          store_name?: string | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          confirmed: boolean | null
          created_at: string
          email: string | null
          id: number
          issue: string | null
          name: string | null
          phone_number: number | null
          store_url: string | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          email?: string | null
          id?: number
          issue?: string | null
          name?: string | null
          phone_number?: number | null
          store_url?: string | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          email?: string | null
          id?: number
          issue?: string | null
          name?: string | null
          phone_number?: number | null
          store_url?: string | null
        }
        Relationships: []
      }
      new_leads: {
        Row: {
          businessPlatform: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          orderUnits: string | null
          phone: string | null
          source: string | null
          webUrl: string | null
        }
        Insert: {
          businessPlatform?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          orderUnits?: string | null
          phone?: string | null
          source?: string | null
          webUrl?: string | null
        }
        Update: {
          businessPlatform?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          orderUnits?: string | null
          phone?: string | null
          source?: string | null
          webUrl?: string | null
        }
        Relationships: []
      }
      order: {
        Row: {
          created_at: string
          currency: string | null
          current_total_tax: string | null
          current_total_tax_set: Json | null
          customer_email: string | null
          customer_id: string | null
          financial_status: string | null
          fulfillment_status: string | null
          fulfillments: Json | null
          id: string
          line_items: Json[] | null
          order_id: string | null
          order_number: string
          order_status_url: string | null
          order_tags: string | null
          processed_at: string | null
          shipping_address: string | null
          shipping_costs: number | null
          shipping_costs_usd: string | null
          store_name: string | null
          sub_total_price: string
          sub_total_price_usd: string | null
          tax_rate: number | null
          total_discounts: string | null
          total_discounts_set: Json | null
          total_order_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          current_total_tax?: string | null
          current_total_tax_set?: Json | null
          customer_email?: string | null
          customer_id?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          fulfillments?: Json | null
          id?: string
          line_items?: Json[] | null
          order_id?: string | null
          order_number: string
          order_status_url?: string | null
          order_tags?: string | null
          processed_at?: string | null
          shipping_address?: string | null
          shipping_costs?: number | null
          shipping_costs_usd?: string | null
          store_name?: string | null
          sub_total_price: string
          sub_total_price_usd?: string | null
          tax_rate?: number | null
          total_discounts?: string | null
          total_discounts_set?: Json | null
          total_order_value: string
          updated_at: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          current_total_tax?: string | null
          current_total_tax_set?: Json | null
          customer_email?: string | null
          customer_id?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          fulfillments?: Json | null
          id?: string
          line_items?: Json[] | null
          order_id?: string | null
          order_number?: string
          order_status_url?: string | null
          order_tags?: string | null
          processed_at?: string | null
          shipping_address?: string | null
          shipping_costs?: number | null
          shipping_costs_usd?: string | null
          store_name?: string | null
          sub_total_price?: string
          sub_total_price_usd?: string | null
          tax_rate?: number | null
          total_discounts?: string | null
          total_discounts_set?: Json | null
          total_order_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          currency: string | null
          discount_allocations: Json | null
          grams: string | null
          id: string
          image_url: string | null
          lineItem_id: string | null
          order_id: string | null
          price: string | null
          product_id: string | null
          quantity: string | null
          sku: string | null
          store_name: string | null
          total_discount: string | null
          vendor_name: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          discount_allocations?: Json | null
          grams?: string | null
          id?: string
          image_url?: string | null
          lineItem_id?: string | null
          order_id?: string | null
          price?: string | null
          product_id?: string | null
          quantity?: string | null
          sku?: string | null
          store_name?: string | null
          total_discount?: string | null
          vendor_name?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          discount_allocations?: Json | null
          grams?: string | null
          id?: string
          image_url?: string | null
          lineItem_id?: string | null
          order_id?: string | null
          price?: string | null
          product_id?: string | null
          quantity?: string | null
          sku?: string | null
          store_name?: string | null
          total_discount?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number | null
          completed: boolean | null
          created_at: string
          id: string
          paypal_address: string | null
          userId: string
        }
        Insert: {
          amount?: number | null
          completed?: boolean | null
          created_at?: string
          id?: string
          paypal_address?: string | null
          userId?: string
        }
        Update: {
          amount?: number | null
          completed?: boolean | null
          created_at?: string
          id?: string
          paypal_address?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_rate: number | null
          created_at: string
          customer_number: string | null
          email: string | null
          id: number
          order_number: string | null
          order_time: string | null
          paypal_address: string | null
          quantity_of_order: number | null
          referred_by: string | null
          referred_store_name: string | null
          reffered_by_id: string | null
          store_name: string | null
          total_commission: number | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          customer_number?: string | null
          email?: string | null
          id?: number
          order_number?: string | null
          order_time?: string | null
          paypal_address?: string | null
          quantity_of_order?: number | null
          referred_by?: string | null
          referred_store_name?: string | null
          reffered_by_id?: string | null
          store_name?: string | null
          total_commission?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          customer_number?: string | null
          email?: string | null
          id?: number
          order_number?: string | null
          order_time?: string | null
          paypal_address?: string | null
          quantity_of_order?: number | null
          referred_by?: string | null
          referred_store_name?: string | null
          reffered_by_id?: string | null
          store_name?: string | null
          total_commission?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      session: {
        Row: {
          accessToken: string
          accountOwner: boolean
          collaborator: boolean | null
          email: string | null
          emailVerified: boolean | null
          expires: string | null
          firstName: string | null
          id: string
          isOnline: boolean
          lastName: string | null
          locale: string | null
          scope: string | null
          shop: string
          state: string
          userId: number | null
        }
        Insert: {
          accessToken: string
          accountOwner?: boolean
          collaborator?: boolean | null
          email?: string | null
          emailVerified?: boolean | null
          expires?: string | null
          firstName?: string | null
          id: string
          isOnline?: boolean
          lastName?: string | null
          locale?: string | null
          scope?: string | null
          shop: string
          state: string
          userId?: number | null
        }
        Update: {
          accessToken?: string
          accountOwner?: boolean
          collaborator?: boolean | null
          email?: string | null
          emailVerified?: boolean | null
          expires?: string | null
          firstName?: string | null
          id?: string
          isOnline?: boolean
          lastName?: string | null
          locale?: string | null
          scope?: string | null
          shop?: string
          state?: string
          userId?: number | null
        }
        Relationships: []
      }
      store_to_user: {
        Row: {
          created_at: string
          id: number
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_to_user_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_to_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          is_inventory_fetched: boolean
          is_store_listed: boolean
          store_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_inventory_fetched: boolean
          is_store_listed?: boolean
          store_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_inventory_fetched?: boolean
          is_store_listed?: boolean
          store_name?: string
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      trackings: {
        Row: {
          created_at: string
          destination: Json | null
          id: string
          order_id: string | null
          status: string
          store_location: string | null
          store_name: string | null
          tracking_company: string | null
          tracking_number: string | null
          tracking_numbers: Json | null
          tracking_url: string | null
          tracking_urls: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination?: Json | null
          id?: string
          order_id?: string | null
          status: string
          store_location?: string | null
          store_name?: string | null
          tracking_company?: string | null
          tracking_number?: string | null
          tracking_numbers?: Json | null
          tracking_url?: string | null
          tracking_urls?: Json | null
          updated_at: string
        }
        Update: {
          created_at?: string
          destination?: Json | null
          id?: string
          order_id?: string | null
          status?: string
          store_location?: string | null
          store_name?: string | null
          tracking_company?: string | null
          tracking_number?: string | null
          tracking_numbers?: Json | null
          tracking_url?: string | null
          tracking_urls?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          referral_code: string | null
          role: string | null
          user_name: string | null
          visible_pages: string[] | null
          visible_store: string[] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          referral_code?: string | null
          role?: string | null
          user_name?: string | null
          visible_pages?: string[] | null
          visible_store?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          referral_code?: string | null
          role?: string | null
          user_name?: string | null
          visible_pages?: string[] | null
          visible_store?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
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
