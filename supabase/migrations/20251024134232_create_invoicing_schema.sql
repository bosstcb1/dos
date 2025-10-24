/*
  # GBEFFA REIS BE KOM - Invoicing Platform Schema

  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone1` (text)
      - `phone2` (text)
      - `cip_number` (text)
      - `cip_expiry` (date)
      - `ifu` (text)
      - `email` (text)
      - `website` (text, nullable)
      - `address` (text, nullable)
      - `logo_url` (text, nullable)
      - `updated_at` (timestamptz)
    
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text, nullable)
      - `address` (text, nullable)
      - `created_at` (timestamptz)
    
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `client_id` (uuid, foreign key)
      - `client_name` (text)
      - `client_phone` (text)
      - `client_email` (text, nullable)
      - `client_address` (text, nullable)
      - `invoice_date` (date)
      - `subtotal` (decimal)
      - `tax_percentage` (decimal)
      - `tax_amount` (decimal)
      - `discount_type` (text, nullable) -- 'fixed' or 'percentage'
      - `discount_value` (decimal, default 0)
      - `discount_amount` (decimal, default 0)
      - `total_amount` (decimal)
      - `payment_terms` (text, nullable)
      - `responsible_name` (text)
      - `signature_url` (text, nullable)
      - `created_at` (timestamptz)
    
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `designation` (text)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_amount` (decimal)
      - `order_index` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth is required)
*/

-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'GBEFFA REIS BE KOM',
  phone1 text NOT NULL DEFAULT '01 96 34 64 35',
  phone2 text NOT NULL DEFAULT '01 94 14 52 69',
  cip_number text NOT NULL DEFAULT '8382792325',
  cip_expiry date NOT NULL DEFAULT '2026-12-10',
  ifu text NOT NULL DEFAULT '1201408335401',
  email text NOT NULL DEFAULT 'tundetoile@gmail.com',
  website text,
  address text,
  logo_url text,
  updated_at timestamptz DEFAULT now()
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  client_address text,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_percentage decimal(5,2) NOT NULL DEFAULT 18,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_type text,
  discount_value decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_terms text,
  responsible_name text NOT NULL DEFAULT 'Komla DOS-REIS',
  signature_url text,
  created_at timestamptz DEFAULT now()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  designation text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  order_index integer NOT NULL
);

-- Insert default company settings
INSERT INTO company_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required)
CREATE POLICY "Public can view company settings"
  ON company_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can update company settings"
  ON company_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view clients"
  ON clients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert clients"
  ON clients FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update clients"
  ON clients FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete clients"
  ON clients FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view invoices"
  ON invoices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert invoices"
  ON invoices FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update invoices"
  ON invoices FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete invoices"
  ON invoices FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view invoice items"
  ON invoice_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert invoice items"
  ON invoice_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update invoice items"
  ON invoice_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete invoice items"
  ON invoice_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);