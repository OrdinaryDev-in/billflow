// Auto-generated from the live Supabase schema. Do not edit by hand.
// Regenerate with:
//   npx supabase gen types typescript --project-id oxkmzrmuibafjzfnjaad > src/types/database.ts
// or via the Supabase MCP `generate_typescript_types` tool.

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          contact_name: string | null
          country: string
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          pincode: string | null
          state: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          discount_type: string | null
          discount_value: number
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          sort_order: number
          tax_rate: number
          tax_type: string | null
          unit: string | null
          unit_price: number
        }
        Insert: {
          description: string
          discount_type?: string | null
          discount_value?: number
          id?: string
          invoice_id: string
          line_total?: number
          quantity?: number
          sort_order?: number
          tax_rate?: number
          tax_type?: string | null
          unit?: string | null
          unit_price?: number
        }
        Update: {
          description?: string
          discount_type?: string | null
          discount_value?: number
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          sort_order?: number
          tax_rate?: number
          tax_type?: string | null
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          discount_total: number
          due_date: string | null
          grand_total: number
          id: string
          invoice_number: string
          issue_date: string
          milestone_id: string | null
          notes: string | null
          organization_id: string
          po_number: string | null
          project_id: string | null
          public_token: string
          recurring_schedule_id: string | null
          sent_at: string | null
          source_quotation_id: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_total?: number
          due_date?: string | null
          grand_total?: number
          id?: string
          invoice_number: string
          issue_date?: string
          milestone_id?: string | null
          notes?: string | null
          organization_id: string
          po_number?: string | null
          project_id?: string | null
          public_token?: string
          recurring_schedule_id?: string | null
          sent_at?: string | null
          source_quotation_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_total?: number
          due_date?: string | null
          grand_total?: number
          id?: string
          invoice_number?: string
          issue_date?: string
          milestone_id?: string | null
          notes?: string | null
          organization_id?: string
          po_number?: string | null
          project_id?: string | null
          public_token?: string
          recurring_schedule_id?: string | null
          sent_at?: string | null
          source_quotation_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_invoice_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_source_quotation_id_fkey"
            columns: ["source_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoiced_amount: number
          name: string
          paid_amount: number
          project_id: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoiced_amount?: number
          name: string
          paid_amount?: number
          project_id: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoiced_amount?: number
          name?: string
          paid_amount?: number
          project_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          country: string
          created_at: string
          currency: string
          default_payment_terms: string | null
          email: string | null
          gst_enabled: boolean
          gstin: string | null
          id: string
          invoice_prefix: string
          legal_name: string | null
          logo_path: string | null
          name: string
          next_invoice_number: number
          next_quotation_number: number
          pan: string | null
          phone: string | null
          pincode: string | null
          quotation_prefix: string
          state: string | null
          timezone: string
          updated_at: string
          upi_id: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          default_payment_terms?: string | null
          email?: string | null
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_path?: string | null
          name: string
          next_invoice_number?: number
          next_quotation_number?: number
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          quotation_prefix?: string
          state?: string | null
          timezone?: string
          updated_at?: string
          upi_id?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          default_payment_terms?: string | null
          email?: string | null
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_path?: string | null
          name?: string
          next_invoice_number?: number
          next_quotation_number?: number
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          quotation_prefix?: string
          state?: string | null
          timezone?: string
          updated_at?: string
          upi_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          gateway: string | null
          gateway_payment_id: string | null
          id: string
          invoice_id: string
          notes: string | null
          organization_id: string
          paid_at: string
          payment_method: string
          payment_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          gateway?: string | null
          gateway_payment_id?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          paid_at?: string
          payment_method: string
          payment_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          gateway?: string | null
          gateway_payment_id?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string
          payment_method?: string
          payment_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          billing_type: string
          client_id: string
          contract_value: number
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string
          source_quotation_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_type?: string
          client_id: string
          contract_value?: number
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          source_quotation_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_type?: string
          client_id?: string
          contract_value?: number
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          source_quotation_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_quotation_id_fkey"
            columns: ["source_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_approval_events: {
        Row: {
          action: string
          client_message: string | null
          client_name: string | null
          created_at: string
          id: string
          ip_address: string | null
          quotation_id: string
        }
        Insert: {
          action: string
          client_message?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          quotation_id: string
        }
        Update: {
          action?: string
          client_message?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_approval_events_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          line_total: number
          quantity: number
          quotation_id: string
          sort_order: number
          tax_rate: number
          title: string
          type: string
          unit: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          line_total?: number
          quantity?: number
          quotation_id: string
          sort_order?: number
          tax_rate?: number
          title: string
          type?: string
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          line_total?: number
          quantity?: number
          quotation_id?: string
          sort_order?: number
          tax_rate?: number
          title?: string
          type?: string
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          assumptions: string | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          deliverables: string | null
          discount_total: number
          exclusions: string | null
          grand_total: number
          id: string
          issue_date: string
          notes: string | null
          organization_id: string
          project_id: string | null
          public_token: string
          quotation_number: string
          scope_of_work: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          timeline: string | null
          updated_at: string
          valid_until: string | null
          version: number
          viewed_at: string | null
        }
        Insert: {
          assumptions?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deliverables?: string | null
          discount_total?: number
          exclusions?: string | null
          grand_total?: number
          id?: string
          issue_date?: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          public_token?: string
          quotation_number: string
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          timeline?: string | null
          updated_at?: string
          valid_until?: string | null
          version?: number
          viewed_at?: string | null
        }
        Update: {
          assumptions?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deliverables?: string | null
          discount_total?: number
          exclusions?: string | null
          grand_total?: number
          id?: string
          issue_date?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          public_token?: string
          quotation_number?: string
          scope_of_work?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          timeline?: string | null
          updated_at?: string
          valid_until?: string | null
          version?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoice_schedules: {
        Row: {
          client_id: string
          created_at: string
          currency: string
          due_days: number
          ends_at: string | null
          frequency: string
          id: string
          interval_count: number
          last_invoice_id: string | null
          name: string
          next_run_at: string
          organization_id: string
          project_id: string | null
          status: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          currency?: string
          due_days?: number
          ends_at?: string | null
          frequency: string
          id?: string
          interval_count?: number
          last_invoice_id?: string | null
          name: string
          next_run_at: string
          organization_id: string
          project_id?: string | null
          status?: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          currency?: string
          due_days?: number
          ends_at?: string | null
          frequency?: string
          id?: string
          interval_count?: number
          last_invoice_id?: string | null
          name?: string
          next_run_at?: string
          organization_id?: string
          project_id?: string | null
          status?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoice_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoice_schedules_last_invoice_id_fkey"
            columns: ["last_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoice_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoice_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization_with_owner: {
        Args: {
          org_country?: string
          org_currency?: string
          org_name: string
          org_timezone?: string
        }
        Returns: {
          address_line_1: string | null
          address_line_2: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          country: string
          created_at: string
          currency: string
          default_payment_terms: string | null
          email: string | null
          gst_enabled: boolean
          gstin: string | null
          id: string
          invoice_prefix: string
          legal_name: string | null
          logo_path: string | null
          name: string
          next_invoice_number: number
          next_quotation_number: number
          pan: string | null
          phone: string | null
          pincode: string | null
          quotation_prefix: string
          state: string | null
          timezone: string
          updated_at: string
          upi_id: string | null
          website: string | null
        }
      }
      next_invoice_number: {
        Args: { target_organization_id: string }
        Returns: string
      }
      next_quotation_number: {
        Args: { target_organization_id: string }
        Returns: string
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
