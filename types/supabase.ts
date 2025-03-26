export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tours: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          category_id: string
          destination_id: string
          duration_days: number | null
          duration_hours: number | null
          duration_minutes: number | null
          retail_price: number
          discounted_price: number | null
          rating_exact_score: number
          review_count: number
          image_0_src: string
          image_1_src: string | null
          image_2_src: string | null
          image_3_src: string | null
          image_4_src: string | null
          status: "active" | "inactive"
          created_at: string
          updated_at: string
          vendor_id: string | null
          max_capacity: number | null
          min_booking_notice: number | null
          infant_age: number | null
          child_age: number | null
          pickup_available: boolean
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          category_id: string
          destination_id: string
          duration_days?: number | null
          duration_hours?: number | null
          duration_minutes?: number | null
          retail_price: number
          discounted_price?: number | null
          rating_exact_score?: number
          review_count?: number
          image_0_src: string
          image_1_src?: string | null
          image_2_src?: string | null
          image_3_src?: string | null
          image_4_src?: string | null
          status?: "active" | "inactive"
          created_at?: string
          updated_at?: string
          vendor_id?: string | null
          max_capacity?: number | null
          min_booking_notice?: number | null
          infant_age?: number | null
          child_age?: number | null
          pickup_available?: boolean
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          category_id?: string
          destination_id?: string
          duration_days?: number | null
          duration_hours?: number | null
          duration_minutes?: number | null
          retail_price?: number
          discounted_price?: number | null
          rating_exact_score?: number
          review_count?: number
          image_0_src?: string
          image_1_src?: string | null
          image_2_src?: string | null
          image_3_src?: string | null
          image_4_src?: string | null
          status?: "active" | "inactive"
          created_at?: string
          updated_at?: string
          vendor_id?: string | null
          max_capacity?: number | null
          min_booking_notice?: number | null
          infant_age?: number | null
          child_age?: number | null
          pickup_available?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          image: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image?: string
          created_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          image: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      tour_tags: {
        Row: {
          id: string
          tour_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          tour_id: string
          tag_id: string
        }
        Update: {
          id?: string
          tour_id?: string
          tag_id?: string
        }
      }
      tour_features: {
        Row: {
          id: string
          tour_id: string
          icon: string
          label: string
          description: string | null
        }
        Insert: {
          id?: string
          tour_id: string
          icon: string
          label: string
          description?: string | null
        }
        Update: {
          id?: string
          tour_id?: string
          icon?: string
          label?: string
          description?: string | null
        }
      }
      tour_availability: {
        Row: {
          id: string
          tour_id: string
          date: string
          spots_available: number
          created_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          date: string
          spots_available: number
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          date?: string
          spots_available?: number
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          tour_id: string
          user_id: string | null
          booking_date: string
          adults: number
          children: number
          infants: number
          pickup_required: boolean
          pickup_location: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
          special_requests: string | null
          status: "pending" | "confirmed" | "cancelled"
          created_at: string
          updated_at: string
          payment_status: "unpaid" | "paid" | "refunded"
          payment_id: string | null
        }
        Insert: {
          id?: string
          tour_id: string
          user_id?: string | null
          booking_date: string
          adults: number
          children: number
          infants?: number
          pickup_required?: boolean
          pickup_location?: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
          special_requests?: string | null
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
          payment_status?: "unpaid" | "paid" | "refunded"
          payment_id?: string | null
        }
        Update: {
          id?: string
          tour_id?: string
          user_id?: string | null
          booking_date?: string
          adults?: number
          children?: number
          infants?: number
          pickup_required?: boolean
          pickup_location?: string | null
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          special_requests?: string | null
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
          payment_status?: "unpaid" | "paid" | "refunded"
          payment_id?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          tour_id: string
          user_id: string | null
          name: string
          email: string
          avatar: string | null
          rating: number
          title: string | null
          comment: string
          date: string
          status: "pending" | "approved" | "rejected"
          helpful_votes: number
          unhelpful_votes: number
          created_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          user_id?: string | null
          name: string
          email: string
          avatar?: string | null
          rating: number
          title?: string | null
          comment: string
          date: string
          status?: "pending" | "approved" | "rejected"
          helpful_votes?: number
          unhelpful_votes?: number
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          user_id?: string | null
          name?: string
          email?: string
          avatar?: string | null
          rating?: number
          title?: string | null
          comment?: string
          date?: string
          status?: "pending" | "approved" | "rejected"
          helpful_votes?: number
          unhelpful_votes?: number
          created_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          logo: string | null
          contact_email: string
          contact_phone: string
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          logo?: string | null
          contact_email: string
          contact_phone: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          logo?: string | null
          contact_email?: string
          contact_phone?: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          role: "user" | "vendor" | "admin"
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          role?: "user" | "vendor" | "admin"
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          role?: "user" | "vendor" | "admin"
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_vendor_stats: {
        Args: {
          vendor_id: string
        }
        Returns: {
          total_tours: number
          pending_bookings: number
          monthly_revenue: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

