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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_agent_id: string | null
          actor_profile_id: string | null
          actor_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: number
          metadata: Json
          project_id: string | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_agent_id?: string | null
          actor_profile_id?: string | null
          actor_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          metadata?: Json
          project_id?: string | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_agent_id?: string | null
          actor_profile_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          metadata?: Json
          project_id?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_agent_id_fkey"
            columns: ["actor_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          capabilities: Json
          created_at: string
          department: string
          guardrails: Json
          id: string
          last_seen_at: string | null
          name: string
          owner_only: boolean
          slug: string
          status: Database["public"]["Enums"]["agent_status"]
          system_role: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json
          created_at?: string
          department: string
          guardrails?: Json
          id?: string
          last_seen_at?: string | null
          name: string
          owner_only?: boolean
          slug: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_role: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          created_at?: string
          department?: string
          guardrails?: Json
          id?: string
          last_seen_at?: string | null
          name?: string
          owner_only?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_handoffs: {
        Row: {
          ai_task_id: string
          context: Json
          created_at: string
          from_agent_id: string
          id: string
          reason: string
          to_agent_id: string
        }
        Insert: {
          ai_task_id: string
          context?: Json
          created_at?: string
          from_agent_id: string
          id?: string
          reason: string
          to_agent_id: string
        }
        Update: {
          ai_task_id?: string
          context?: Json
          created_at?: string
          from_agent_id?: string
          id?: string
          reason?: string
          to_agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_handoffs_ai_task_id_fkey"
            columns: ["ai_task_id"]
            isOneToOne: false
            referencedRelation: "ai_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_handoffs_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_handoffs_to_agent_id_fkey"
            columns: ["to_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          input: Json
          instruction: string
          output: Json | null
          owner_only: boolean
          parent_task_id: string | null
          project_id: string | null
          risk: Database["public"]["Enums"]["approval_risk"]
          started_at: string | null
          status: Database["public"]["Enums"]["ai_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          instruction: string
          output?: Json | null
          owner_only?: boolean
          parent_task_id?: string | null
          project_id?: string | null
          risk?: Database["public"]["Enums"]["approval_risk"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          instruction?: string
          output?: Json | null
          owner_only?: boolean
          parent_task_id?: string | null
          project_id?: string | null
          risk?: Database["public"]["Enums"]["approval_risk"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "ai_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          category: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          payload: Json
          project_id: string | null
          requester_agent_id: string | null
          requester_profile_id: string | null
          risk: Database["public"]["Enums"]["approval_risk"]
          status: Database["public"]["Enums"]["approval_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          payload?: Json
          project_id?: string | null
          requester_agent_id?: string | null
          requester_profile_id?: string | null
          risk?: Database["public"]["Enums"]["approval_risk"]
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          payload?: Json
          project_id?: string | null
          requester_agent_id?: string | null
          requester_profile_id?: string | null
          risk?: Database["public"]["Enums"]["approval_risk"]
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_requester_agent_id_fkey"
            columns: ["requester_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_requester_profile_id_fkey"
            columns: ["requester_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          requires_approval: boolean
          schedule_cron: string | null
          slug: string
          status: Database["public"]["Enums"]["automation_status"]
          trigger_type: Database["public"]["Enums"]["automation_trigger"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          requires_approval?: boolean
          schedule_cron?: string | null
          slug: string
          status?: Database["public"]["Enums"]["automation_status"]
          trigger_type?: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          requires_approval?: boolean
          schedule_cron?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["automation_status"]
          trigger_type?: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          result: Json | null
          rule_id: string
          started_at: string
          status: Database["public"]["Enums"]["automation_run_status"]
          trigger_source: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          rule_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["automation_run_status"]
          trigger_source?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          rule_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["automation_run_status"]
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefs: {
        Row: {
          brief_date: string
          created_at: string
          id: string
          metrics: Json
          priorities: Json
          profile_id: string
          summary: string
          title: string
        }
        Insert: {
          brief_date?: string
          created_at?: string
          id?: string
          metrics?: Json
          priorities?: Json
          profile_id: string
          summary: string
          title: string
        }
        Update: {
          brief_date?: string
          created_at?: string
          id?: string
          metrics?: Json
          priorities?: Json
          profile_id?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_briefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issued_at: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
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
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          category: string
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          metadata: Json
          storage_path: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          storage_path?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          storage_path?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_summary: string | null
          assigned_to: string | null
          budget: number | null
          client_id: string | null
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          needs: string | null
          notes: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ai_summary?: string | null
          assigned_to?: string | null
          budget?: number | null
          client_id?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          needs?: string | null
          notes?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ai_summary?: string | null
          assigned_to?: string | null
          budget?: number | null
          client_id?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          needs?: string | null
          notes?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          activated_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          license_hash: string
          masked_code: string | null
          metadata: Json
          order_id: string
          product_id: string
          revoked_at: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_hash: string
          masked_code?: string | null
          metadata?: Json
          order_id: string
          product_id: string
          revoked_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_hash?: string
          masked_code?: string | null
          metadata?: Json
          order_id?: string
          product_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          automation_rule_id: string | null
          body: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["notification_level"]
          link: string | null
          notification_key: string | null
          profile_id: string
          read_at: string | null
          title: string
        }
        Insert: {
          automation_rule_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["notification_level"]
          link?: string | null
          notification_key?: string | null
          profile_id: string
          read_at?: string | null
          title: string
        }
        Update: {
          automation_rule_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["notification_level"]
          link?: string | null
          notification_key?: string | null
          profile_id?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_whatsapp: string | null
          id: string
          order_number: string
          paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          product_id: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_whatsapp?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_id: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_whatsapp?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_id?: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          license_enabled: boolean
          name: string
          price: number
          slug: string
          updated_at: string
          warranty_text: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          license_enabled?: boolean
          name: string
          price: number
          slug: string
          updated_at?: string
          warranty_text?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          license_enabled?: boolean
          name?: string
          price?: number
          slug?: string
          updated_at?: string
          warranty_text?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assignee_agent_id: string | null
          assignee_profile_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          priority: number
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_agent_id?: string | null
          assignee_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: number
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_agent_id?: string | null
          assignee_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: number
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_agent_id_fkey"
            columns: ["assignee_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_assignee_profile_id_fkey"
            columns: ["assignee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          agreed_value: number | null
          brief: string | null
          client_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          dp_amount: number | null
          final_amount: number | null
          id: string
          lead_id: string | null
          owner_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          progress: number
          revision_limit: number
          revision_used: number
          service_label: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agreed_value?: number | null
          brief?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          dp_amount?: number | null
          final_amount?: number | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          progress?: number
          revision_limit?: number
          revision_used?: number
          service_label?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agreed_value?: number | null
          brief?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          dp_amount?: number | null
          final_amount?: number | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          progress?: number
          revision_limit?: number
          revision_used?: number
          service_label?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
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
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      revisions: {
        Row: {
          approval_id: string | null
          completed_at: string | null
          details: string | null
          id: string
          is_scope_change: boolean
          project_id: string
          requested_at: string
          requested_by: string | null
          revision_no: number
          status: Database["public"]["Enums"]["revision_status"]
          summary: string
        }
        Insert: {
          approval_id?: string | null
          completed_at?: string | null
          details?: string | null
          id?: string
          is_scope_change?: boolean
          project_id: string
          requested_at?: string
          requested_by?: string | null
          revision_no: number
          status?: Database["public"]["Enums"]["revision_status"]
          summary: string
        }
        Update: {
          approval_id?: string | null
          completed_at?: string | null
          details?: string | null
          id?: string
          is_scope_change?: boolean
          project_id?: string
          requested_at?: string
          requested_by?: string | null
          revision_no?: number
          status?: Database["public"]["Enums"]["revision_status"]
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisions_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          occurred_at: string
          order_id: string | null
          project_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          verified_by: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          occurred_at?: string
          order_id?: string | null
          project_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          verified_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          occurred_at?: string
          order_id?: string | null
          project_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      command_center_snapshot: {
        Args: { p_month_start: string }
        Returns: Json
      }
      owner_pin_status: { Args: never; Returns: Json }
      record_owner_pin_attempt: { Args: { p_success: boolean }; Returns: Json }
    }
    Enums: {
      agent_status:
        | "tersedia"
        | "sedang_bekerja"
        | "menunggu_informasi"
        | "review"
        | "perlu_perhatian"
        | "offline"
      ai_task_status:
        | "antri"
        | "berjalan"
        | "menunggu_input"
        | "menunggu_approval"
        | "selesai"
        | "gagal"
        | "dibatalkan"
      app_role: "owner" | "staff"
      approval_risk: "low" | "medium" | "high" | "critical"
      approval_status: "menunggu" | "disetujui" | "ditolak" | "minta_revisi"
      automation_run_status: "berjalan" | "selesai" | "gagal" | "dilewati"
      automation_status: "active" | "paused"
      automation_trigger: "manual" | "daily" | "hourly" | "event"
      invoice_status:
        | "draft"
        | "terkirim"
        | "sebagian"
        | "lunas"
        | "jatuh_tempo"
        | "dibatalkan"
      lead_source:
        | "instagram"
        | "tiktok"
        | "whatsapp"
        | "website"
        | "referral"
        | "lainnya"
      lead_status:
        | "lead_baru"
        | "konsultasi"
        | "penawaran"
        | "menunggu_dp"
        | "deal"
        | "tidak_jadi"
      notification_level: "info" | "success" | "warning" | "critical"
      order_status:
        | "menunggu_pembayaran"
        | "dibayar"
        | "diproses"
        | "akses_dikirim"
        | "aktif"
        | "selesai"
        | "dibatalkan"
      payment_status: "belum_bayar" | "dp" | "lunas" | "gagal" | "refund"
      project_status:
        | "baru"
        | "berlangsung"
        | "menunggu_klien"
        | "revisi"
        | "menunggu_pelunasan"
        | "handover"
        | "selesai"
        | "dibatalkan"
      revision_status:
        | "diajukan"
        | "diterima"
        | "dikerjakan"
        | "selesai"
        | "ditolak"
        | "scope_baru"
      service_type:
        | "landing_page"
        | "dashboard"
        | "web_custom"
        | "produk_jadi"
        | "lainnya"
      transaction_status: "pending" | "terverifikasi" | "gagal" | "dibatalkan"
      transaction_type:
        | "pemasukan"
        | "pengeluaran"
        | "dp"
        | "pelunasan"
        | "refund"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      agent_status: [
        "tersedia",
        "sedang_bekerja",
        "menunggu_informasi",
        "review",
        "perlu_perhatian",
        "offline",
      ],
      ai_task_status: [
        "antri",
        "berjalan",
        "menunggu_input",
        "menunggu_approval",
        "selesai",
        "gagal",
        "dibatalkan",
      ],
      app_role: ["owner", "staff"],
      approval_risk: ["low", "medium", "high", "critical"],
      approval_status: ["menunggu", "disetujui", "ditolak", "minta_revisi"],
      automation_run_status: ["berjalan", "selesai", "gagal", "dilewati"],
      automation_status: ["active", "paused"],
      automation_trigger: ["manual", "daily", "hourly", "event"],
      invoice_status: [
        "draft",
        "terkirim",
        "sebagian",
        "lunas",
        "jatuh_tempo",
        "dibatalkan",
      ],
      lead_source: [
        "instagram",
        "tiktok",
        "whatsapp",
        "website",
        "referral",
        "lainnya",
      ],
      lead_status: [
        "lead_baru",
        "konsultasi",
        "penawaran",
        "menunggu_dp",
        "deal",
        "tidak_jadi",
      ],
      notification_level: ["info", "success", "warning", "critical"],
      order_status: [
        "menunggu_pembayaran",
        "dibayar",
        "diproses",
        "akses_dikirim",
        "aktif",
        "selesai",
        "dibatalkan",
      ],
      payment_status: ["belum_bayar", "dp", "lunas", "gagal", "refund"],
      project_status: [
        "baru",
        "berlangsung",
        "menunggu_klien",
        "revisi",
        "menunggu_pelunasan",
        "handover",
        "selesai",
        "dibatalkan",
      ],
      revision_status: [
        "diajukan",
        "diterima",
        "dikerjakan",
        "selesai",
        "ditolak",
        "scope_baru",
      ],
      service_type: [
        "landing_page",
        "dashboard",
        "web_custom",
        "produk_jadi",
        "lainnya",
      ],
      transaction_status: ["pending", "terverifikasi", "gagal", "dibatalkan"],
      transaction_type: [
        "pemasukan",
        "pengeluaran",
        "dp",
        "pelunasan",
        "refund",
      ],
    },
  },
} as const
