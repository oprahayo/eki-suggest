export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      report_types: {
        Row: {
          id: string
          code: string
          label: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          label: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          label?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon_key: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon_key?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon_key?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      lgas: {
        Row: {
          id: string
          slug: string
          name: string
          headquarters: string | null
          state_name: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          headquarters?: string | null
          state_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          headquarters?: string | null
          state_name?: string
          created_at?: string
        }
        Relationships: []
      }
      wards: {
        Row: {
          id: string
          lga_id: string
          slug: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          lga_id: string
          slug: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          lga_id?: string
          slug?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      offices: {
        Row: {
          id: string
          slug: string
          name: string
          office_type: Database["public"]["Enums"]["office_type"]
          description: string | null
          email: string | null
          phone: string | null
          is_active: boolean
          is_public: boolean
          is_default_queue: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          office_type: Database["public"]["Enums"]["office_type"]
          description?: string | null
          email?: string | null
          phone?: string | null
          is_active?: boolean
          is_public?: boolean
          is_default_queue?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          office_type?: Database["public"]["Enums"]["office_type"]
          description?: string | null
          email?: string | null
          phone?: string | null
          is_active?: boolean
          is_public?: boolean
          is_default_queue?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          full_name: string | null
          phone: string | null
          email: string | null
          preferred_lga_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          phone?: string | null
          email?: string | null
          preferred_lga_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          phone?: string | null
          email?: string | null
          preferred_lga_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      handlers: {
        Row: {
          id: string
          office_id: string
          user_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          title: string | null
          escalation_level: number
          is_primary: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          office_id: string
          user_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          title?: string | null
          escalation_level?: number
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          office_id?: string
          user_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          title?: string | null
          escalation_level?: number
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          state_name: string
          lga_id: string
          ward_id: string | null
          community: string | null
          area: string | null
          street_address: string | null
          landmark: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          state_name?: string
          lga_id: string
          ward_id?: string | null
          community?: string | null
          area?: string | null
          street_address?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          state_name?: string
          lga_id?: string
          ward_id?: string | null
          community?: string | null
          area?: string | null
          street_address?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          tracking_number: string
          submitted_by: string | null
          report_type_id: string
          category_id: string
          location_id: string
          assigned_office_id: string | null
          current_assignment_id: string | null
          current_status: Database["public"]["Enums"]["report_status"]
          severity: Database["public"]["Enums"]["report_severity"]
          title: string
          description: string
          landmark_note: string | null
          is_anonymous: boolean
          contact_name: string | null
          contact_phone: string | null
          contact_email: string | null
          public_tracking_enabled: boolean
          moderation_flag: Database["public"]["Enums"]["moderation_flag"]
          duplicate_of_report_id: string | null
          estimated_response_text: string | null
          source_channel: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_number: string
          submitted_by?: string | null
          report_type_id: string
          category_id: string
          location_id: string
          assigned_office_id?: string | null
          current_assignment_id?: string | null
          current_status?: Database["public"]["Enums"]["report_status"]
          severity?: Database["public"]["Enums"]["report_severity"]
          title: string
          description: string
          landmark_note?: string | null
          is_anonymous?: boolean
          contact_name?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          public_tracking_enabled?: boolean
          moderation_flag?: Database["public"]["Enums"]["moderation_flag"]
          duplicate_of_report_id?: string | null
          estimated_response_text?: string | null
          source_channel?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          submitted_by?: string | null
          report_type_id?: string
          category_id?: string
          location_id?: string
          assigned_office_id?: string | null
          current_assignment_id?: string | null
          current_status?: Database["public"]["Enums"]["report_status"]
          severity?: Database["public"]["Enums"]["report_severity"]
          title?: string
          description?: string
          landmark_note?: string | null
          is_anonymous?: boolean
          contact_name?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          public_tracking_enabled?: boolean
          moderation_flag?: Database["public"]["Enums"]["moderation_flag"]
          duplicate_of_report_id?: string | null
          estimated_response_text?: string | null
          source_channel?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routing_rules: {
        Row: {
          id: string
          code: string
          name: string
          category_id: string | null
          lga_id: string | null
          ward_id: string | null
          office_id: string
          priority: number
          is_active: boolean
          is_fallback: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category_id?: string | null
          lga_id?: string | null
          ward_id?: string | null
          office_id: string
          priority?: number
          is_active?: boolean
          is_fallback?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category_id?: string | null
          lga_id?: string | null
          ward_id?: string | null
          office_id?: string
          priority?: number
          is_active?: boolean
          is_fallback?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          id: string
          report_id: string
          office_id: string
          handler_id: string | null
          routing_rule_id: string | null
          assigned_by_user_id: string | null
          assignment_mode: Database["public"]["Enums"]["assignment_mode"]
          is_current: boolean
          escalated: boolean
          note: string | null
          assigned_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          report_id: string
          office_id: string
          handler_id?: string | null
          routing_rule_id?: string | null
          assigned_by_user_id?: string | null
          assignment_mode?: Database["public"]["Enums"]["assignment_mode"]
          is_current?: boolean
          escalated?: boolean
          note?: string | null
          assigned_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          report_id?: string
          office_id?: string
          handler_id?: string | null
          routing_rule_id?: string | null
          assigned_by_user_id?: string | null
          assignment_mode?: Database["public"]["Enums"]["assignment_mode"]
          is_current?: boolean
          escalated?: boolean
          note?: string | null
          assigned_at?: string
          closed_at?: string | null
        }
        Relationships: []
      }
      report_updates: {
        Row: {
          id: string
          report_id: string
          assignment_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          note: string
          visibility: Database["public"]["Enums"]["update_visibility"]
          actor_user_id: string | null
          actor_name_snapshot: string
          actor_role_snapshot: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          assignment_id?: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          note: string
          visibility?: Database["public"]["Enums"]["update_visibility"]
          actor_user_id?: string | null
          actor_name_snapshot: string
          actor_role_snapshot: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          assignment_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          note?: string
          visibility?: Database["public"]["Enums"]["update_visibility"]
          actor_user_id?: string | null
          actor_name_snapshot?: string
          actor_role_snapshot?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      report_media: {
        Row: {
          id: string
          report_id: string
          bucket_name: string
          storage_path: string
          media_kind: Database["public"]["Enums"]["media_kind"]
          file_name: string
          mime_type: string | null
          file_size_bytes: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          bucket_name?: string
          storage_path: string
          media_kind: Database["public"]["Enums"]["media_kind"]
          file_name: string
          mime_type?: string | null
          file_size_bytes?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          bucket_name?: string
          storage_path?: string
          media_kind?: Database["public"]["Enums"]["media_kind"]
          file_name?: string
          mime_type?: string | null
          file_size_bytes?: number | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          report_id: string | null
          recipient_user_id: string | null
          recipient_handler_id: string | null
          recipient_office_id: string | null
          kind: Database["public"]["Enums"]["notification_kind"]
          channel: Database["public"]["Enums"]["notification_channel"]
          delivery_status: Database["public"]["Enums"]["notification_status"]
          title: string
          body: string
          recipient_email: string | null
          recipient_phone: string | null
          metadata: Json
          created_at: string
          sent_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          report_id?: string | null
          recipient_user_id?: string | null
          recipient_handler_id?: string | null
          recipient_office_id?: string | null
          kind: Database["public"]["Enums"]["notification_kind"]
          channel?: Database["public"]["Enums"]["notification_channel"]
          delivery_status?: Database["public"]["Enums"]["notification_status"]
          title: string
          body: string
          recipient_email?: string | null
          recipient_phone?: string | null
          metadata?: Json
          created_at?: string
          sent_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          report_id?: string | null
          recipient_user_id?: string | null
          recipient_handler_id?: string | null
          recipient_office_id?: string | null
          kind?: Database["public"]["Enums"]["notification_kind"]
          channel?: Database["public"]["Enums"]["notification_channel"]
          delivery_status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          body?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          metadata?: Json
          created_at?: string
          sent_at?: string | null
          read_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          report_id: string | null
          actor_user_id: string | null
          entity_type: string
          entity_id: string | null
          action: string
          actor_role_snapshot: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          report_id?: string | null
          actor_user_id?: string | null
          entity_type: string
          entity_id?: string | null
          action: string
          actor_role_snapshot?: string | null
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string | null
          actor_user_id?: string | null
          entity_type?: string
          entity_id?: string | null
          action?: string
          actor_role_snapshot?: string | null
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
      drafts: {
        Row: {
          id: string
          user_id: string | null
          client_key: string | null
          payload: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          client_key?: string | null
          payload: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          client_key?: string | null
          payload?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      users: {
        Row: {
          id: string | null
          email: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          full_name: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      generate_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_app_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_office_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      can_access_report: {
        Args: { target_report_id: string }
        Returns: boolean
      }
      get_public_report_tracking: {
        Args: { tracking_number_input: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "citizen" | "super_admin" | "moderator" | "government_handler" | "viewer_analyst"
      report_status:
        | "Received"
        | "Under Review"
        | "Assigned"
        | "In Progress"
        | "Resolved"
        | "Closed"
        | "Rejected"
      report_severity: "routine" | "urgent" | "critical"
      media_kind: "image" | "video" | "document"
      office_type: "ministry" | "department" | "agency" | "moderation" | "default_queue"
      assignment_mode: "routing" | "manual" | "escalation" | "moderation"
      notification_kind: "submission_confirmation" | "assignment" | "status" | "notice" | "system"
      notification_channel: "in_app" | "email" | "sms" | "whatsapp"
      notification_status: "queued" | "sent" | "failed" | "read"
      update_visibility: "public" | "internal"
      moderation_flag: "none" | "review" | "sensitive" | "abusive" | "duplicate"
    }
    CompositeTypes: Record<string, never>
  }
}

export type DbReportStatus = Database["public"]["Enums"]["report_status"]
export type DbReportSeverity = Database["public"]["Enums"]["report_severity"]
export type DbNotificationKind = Database["public"]["Enums"]["notification_kind"]
export type DbNotificationChannel = Database["public"]["Enums"]["notification_channel"]
export type DbMediaKind = Database["public"]["Enums"]["media_kind"]
