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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          provider: 'openai' | 'anthropic' | 'runwayml' | 'dalle'
          encrypted_key: string
          project_id: string | null
          is_valid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'openai' | 'anthropic' | 'runwayml' | 'dalle'
          encrypted_key: string
          project_id?: string | null
          is_valid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          encrypted_key?: string
          is_valid?: boolean
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          custom_instructions: string | null
          color: string
          category: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          custom_instructions?: string | null
          color?: string
          category?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          custom_instructions?: string | null
          color?: string
          category?: string | null
          is_archived?: boolean
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          user_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          extracted_text: string | null
          chunk_count: number
          status: 'pending' | 'processing' | 'completed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          extracted_text?: string | null
          chunk_count?: number
          status?: 'pending' | 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          extracted_text?: string | null
          chunk_count?: number
          status?: 'pending' | 'processing' | 'completed' | 'error'
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          chunk_index: number
          content: string
          embedding: number[] | null
          token_count: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          chunk_index: number
          content: string
          embedding?: number[] | null
          token_count: number
          created_at?: string
        }
        Update: {
          embedding?: number[] | null
        }
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          provider: 'openai' | 'anthropic' | null
          model: string | null
          tokens_used: number | null
          cost: number | null
          rag_chunks: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          provider?: 'openai' | 'anthropic' | null
          model?: string | null
          tokens_used?: number | null
          cost?: number | null
          rag_chunks?: Json | null
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          project_id: string
          user_id: string
          conversation_id: string | null
          prompt: string
          image_url: string
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          conversation_id?: string | null
          prompt: string
          image_url: string
          model: string
          created_at?: string
        }
      }
      n8n_webhooks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          event_type: string
          webhook_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          event_type: string
          webhook_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          webhook_url?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      decision_rooms: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          prompt: string
          responses: Json
          selected_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          prompt: string
          responses: Json
          selected_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          selected_response?: string | null
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          action_type: string
          provider: string | null
          tokens_used: number | null
          cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          action_type: string
          provider?: string | null
          tokens_used?: number | null
          cost?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          filter_document_id?: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
        }[]
      }
    }
  }
}
