import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CompanySettings {
  id: string;
  name: string;
  phone1: string;
  phone2: string;
  cip_number: string;
  cip_expiry: string;
  ifu: string;
  email: string;
  website?: string;
  address?: string;
  logo_url?: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  client_address?: string;
  invoice_date: string;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  discount_type?: 'fixed' | 'percentage';
  discount_value: number;
  discount_amount: number;
  total_amount: number;
  payment_terms?: string;
  responsible_name: string;
  signature_url?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  designation: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  order_index: number;
}