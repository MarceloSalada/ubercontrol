export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          gross: number;
          km: number;
          fuel_price: number;
          consumption: number;
          extras: number;
          fuel_cost: number;
          total_cost: number;
          profit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          gross: number;
          km: number;
          fuel_price: number;
          consumption: number;
          extras?: number;
          fuel_cost: number;
          total_cost: number;
          profit: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          gross?: number;
          km?: number;
          fuel_price?: number;
          consumption?: number;
          extras?: number;
          fuel_cost?: number;
          total_cost?: number;
          profit?: number;
          created_at?: string;
        };
      };
      monthly_costs: {
        Row: {
          id: string;
          user_id: string;
          month_ref: string;
          financing: number;
          insurance: number;
          ipva: number;
          oil_maintenance: number;
          reserve_maintenance: number;
          cellphone: number;
          washing: number;
          other_monthly: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month_ref: string;
          financing?: number;
          insurance?: number;
          ipva?: number;
          oil_maintenance?: number;
          reserve_maintenance?: number;
          cellphone?: number;
          washing?: number;
          other_monthly?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month_ref?: string;
          financing?: number;
          insurance?: number;
          ipva?: number;
          oil_maintenance?: number;
          reserve_maintenance?: number;
          cellphone?: number;
          washing?: number;
          other_monthly?: number;
          created_at?: string;
        };
      };
    };
  };
};
