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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      border_crossings: {
        Row: {
          bl_number: string
          border_point: string
          clearance_date: string
          created_at: string
          crossing_date: string
          customs_agent: string
          direction: string
          documents: string
          driver_name: string
          fees: number
          hold_reason: string
          id: string
          notes: string
          status: string
          truck_unit: string
        }
        Insert: {
          bl_number?: string
          border_point?: string
          clearance_date?: string
          created_at?: string
          crossing_date?: string
          customs_agent?: string
          direction?: string
          documents?: string
          driver_name?: string
          fees?: number
          hold_reason?: string
          id?: string
          notes?: string
          status?: string
          truck_unit?: string
        }
        Update: {
          bl_number?: string
          border_point?: string
          clearance_date?: string
          created_at?: string
          crossing_date?: string
          customs_agent?: string
          direction?: string
          documents?: string
          driver_name?: string
          fees?: number
          hold_reason?: string
          id?: string
          notes?: string
          status?: string
          truck_unit?: string
        }
        Relationships: []
      }
      claims: {
        Row: {
          assigned_to: string
          bl_number: string
          claim_amount: number
          claim_number: string
          claim_type: string
          created_at: string
          currency: string
          customer_name: string
          description: string
          documents: string
          id: string
          incident_date: string
          priority: string
          reported_date: string
          resolution_notes: string
          resolved_date: string
          settled_amount: number
          status: string
        }
        Insert: {
          assigned_to?: string
          bl_number?: string
          claim_amount?: number
          claim_number?: string
          claim_type?: string
          created_at?: string
          currency?: string
          customer_name?: string
          description?: string
          documents?: string
          id?: string
          incident_date?: string
          priority?: string
          reported_date?: string
          resolution_notes?: string
          resolved_date?: string
          settled_amount?: number
          status?: string
        }
        Update: {
          assigned_to?: string
          bl_number?: string
          claim_amount?: number
          claim_number?: string
          claim_type?: string
          created_at?: string
          currency?: string
          customer_name?: string
          description?: string
          documents?: string
          id?: string
          incident_date?: string
          priority?: string
          reported_date?: string
          resolution_notes?: string
          resolved_date?: string
          settled_amount?: number
          status?: string
        }
        Relationships: []
      }
      containers: {
        Row: {
          arrival_date: string
          bl_number: string
          container_number: string
          created_at: string
          departure_date: string
          id: string
          location: string
          notes: string
          owner: string
          seal_number: string
          status: string
          type: string
        }
        Insert: {
          arrival_date?: string
          bl_number?: string
          container_number: string
          created_at?: string
          departure_date?: string
          id?: string
          location?: string
          notes?: string
          owner?: string
          seal_number?: string
          status?: string
          type?: string
        }
        Update: {
          arrival_date?: string
          bl_number?: string
          container_number?: string
          created_at?: string
          departure_date?: string
          id?: string
          location?: string
          notes?: string
          owner?: string
          seal_number?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      costs: {
        Row: {
          amount: number
          bl_number: string
          category: string
          cost_type: string
          created_at: string
          currency: string
          id: string
          notes: string
          paid_by: string
          payment_date: string
          payment_reference: string
          payment_status: string
          vendor: string
          vendor_invoice: string
        }
        Insert: {
          amount?: number
          bl_number?: string
          category?: string
          cost_type?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string
          paid_by?: string
          payment_date?: string
          payment_reference?: string
          payment_status?: string
          vendor?: string
          vendor_invoice?: string
        }
        Update: {
          amount?: number
          bl_number?: string
          category?: string
          cost_type?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string
          paid_by?: string
          payment_date?: string
          payment_reference?: string
          payment_status?: string
          vendor?: string
          vendor_invoice?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          city: string
          company_name: string
          contact_person: string
          country: string
          created_at: string
          credit_limit: number
          current_balance: number
          customer_type: string
          email: string
          id: string
          notes: string
          payment_terms: string
          phone: string
          status: string
          total_shipments: number
        }
        Insert: {
          address?: string
          city?: string
          company_name: string
          contact_person?: string
          country?: string
          created_at?: string
          credit_limit?: number
          current_balance?: number
          customer_type?: string
          email?: string
          id?: string
          notes?: string
          payment_terms?: string
          phone?: string
          status?: string
          total_shipments?: number
        }
        Update: {
          address?: string
          city?: string
          company_name?: string
          contact_person?: string
          country?: string
          created_at?: string
          credit_limit?: number
          current_balance?: number
          customer_type?: string
          email?: string
          id?: string
          notes?: string
          payment_terms?: string
          phone?: string
          status?: string
          total_shipments?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_assignment: string
          current_location: string
          email: string
          full_name: string
          id: string
          id_number: string
          license_expiry: string
          license_number: string
          medical_expiry: string
          nationality: string
          notes: string
          phone: string
          status: string
          total_trips: number
        }
        Insert: {
          created_at?: string
          current_assignment?: string
          current_location?: string
          email?: string
          full_name: string
          id?: string
          id_number?: string
          license_expiry?: string
          license_number?: string
          medical_expiry?: string
          nationality?: string
          notes?: string
          phone?: string
          status?: string
          total_trips?: number
        }
        Update: {
          created_at?: string
          current_assignment?: string
          current_location?: string
          email?: string
          full_name?: string
          id?: string
          id_number?: string
          license_expiry?: string
          license_number?: string
          medical_expiry?: string
          nationality?: string
          notes?: string
          phone?: string
          status?: string
          total_trips?: number
        }
        Relationships: []
      }
      fleet_units: {
        Row: {
          created_at: string
          driver_initials: string
          driver_name: string
          gps_last_seen: string
          id: string
          incidents: Json
          location: string
          next_maintenance: string
          owner_id: string
          status: string
          total_trips: number
          trip_history: Json
          unit_number: string
        }
        Insert: {
          created_at?: string
          driver_initials?: string
          driver_name?: string
          gps_last_seen?: string
          id?: string
          incidents?: Json
          location?: string
          next_maintenance?: string
          owner_id: string
          status?: string
          total_trips?: number
          trip_history?: Json
          unit_number: string
        }
        Update: {
          created_at?: string
          driver_initials?: string
          driver_name?: string
          gps_last_seen?: string
          id?: string
          incidents?: Json
          location?: string
          next_maintenance?: string
          owner_id?: string
          status?: string
          total_trips?: number
          trip_history?: Json
          unit_number?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          bl_number: string
          created_at: string
          description: string
          id: string
          owner_id: string
          reported_at: string
          resolved: boolean
          severity: string
          title: string
        }
        Insert: {
          bl_number?: string
          created_at?: string
          description?: string
          id?: string
          owner_id: string
          reported_at?: string
          resolved?: boolean
          severity?: string
          title: string
        }
        Update: {
          bl_number?: string
          created_at?: string
          description?: string
          id?: string
          owner_id?: string
          reported_at?: string
          resolved?: boolean
          severity?: string
          title?: string
        }
        Relationships: []
      }
      pods: {
        Row: {
          bl_number: string
          condition_notes: string
          created_at: string
          customer_name: string
          delivery_date: string
          destination: string
          file_reference: string
          id: string
          notes: string
          origin: string
          pod_status: string
          recipient_name: string
          recipient_signature: string
          rejection_reason: string
          shipment_ref: string
          uploaded_at: string
          uploaded_by: string
          verified_at: string
          verified_by: string
        }
        Insert: {
          bl_number?: string
          condition_notes?: string
          created_at?: string
          customer_name?: string
          delivery_date?: string
          destination?: string
          file_reference?: string
          id?: string
          notes?: string
          origin?: string
          pod_status?: string
          recipient_name?: string
          recipient_signature?: string
          rejection_reason?: string
          shipment_ref?: string
          uploaded_at?: string
          uploaded_by?: string
          verified_at?: string
          verified_by?: string
        }
        Update: {
          bl_number?: string
          condition_notes?: string
          created_at?: string
          customer_name?: string
          delivery_date?: string
          destination?: string
          file_reference?: string
          id?: string
          notes?: string
          origin?: string
          pod_status?: string
          recipient_name?: string
          recipient_signature?: string
          rejection_reason?: string
          shipment_ref?: string
          uploaded_at?: string
          uploaded_by?: string
          verified_at?: string
          verified_by?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          bl_number: string
          containers: string
          cost_customs: number
          cost_detention: number
          cost_fuel: number
          created_at: string
          customs_uploaded: boolean
          destination: string
          detention_cost: number
          driver: string
          eta: string
          id: string
          invoice_uploaded: boolean
          notes: string
          origin: string
          owner_id: string
          pod_uploaded: boolean
          status: string
          transporter: string
          weight: string
        }
        Insert: {
          bl_number: string
          containers?: string
          cost_customs?: number
          cost_detention?: number
          cost_fuel?: number
          created_at?: string
          customs_uploaded?: boolean
          destination?: string
          detention_cost?: number
          driver?: string
          eta?: string
          id?: string
          invoice_uploaded?: boolean
          notes?: string
          origin?: string
          owner_id: string
          pod_uploaded?: boolean
          status?: string
          transporter?: string
          weight?: string
        }
        Update: {
          bl_number?: string
          containers?: string
          cost_customs?: number
          cost_detention?: number
          cost_fuel?: number
          created_at?: string
          customs_uploaded?: boolean
          destination?: string
          detention_cost?: number
          driver?: string
          eta?: string
          id?: string
          invoice_uploaded?: boolean
          notes?: string
          origin?: string
          owner_id?: string
          pod_uploaded?: boolean
          status?: string
          transporter?: string
          weight?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          bl_number: string
          created_at: string
          description: string
          driver_name: string
          event_type: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          recorded_at: string
          shipment_ref: string
          status: string
          truck_unit: string
        }
        Insert: {
          bl_number?: string
          created_at?: string
          description?: string
          driver_name?: string
          event_type?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          recorded_at?: string
          shipment_ref?: string
          status?: string
          truck_unit?: string
        }
        Update: {
          bl_number?: string
          created_at?: string
          description?: string
          driver_name?: string
          event_type?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          recorded_at?: string
          shipment_ref?: string
          status?: string
          truck_unit?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
    },
  },
} as const
