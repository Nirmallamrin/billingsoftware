-- Supabase Schema for Billing Software & CRM (Vyapar-like)

-- Drop existing policies and tables if they exist to allow clean recreation
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage their own invoice lines" ON public.invoice_lines;
DROP TABLE IF EXISTS public.invoice_lines;
DROP TABLE IF EXISTS public.invoices;

-- 1. Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Parties (Customers/Vendors)
CREATE TABLE IF NOT EXISTS public.parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    party_type TEXT NOT NULL CHECK (party_type IN ('Customer', 'Vendor')),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    gstin TEXT,
    opening_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Items (Products/Services)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('Product', 'Service')),
    name TEXT NOT NULL,
    sku TEXT,
    hsn_sac TEXT,
    sale_price NUMERIC DEFAULT 0,
    purchase_price NUMERIC DEFAULT 0,
    tax_rate NUMERIC DEFAULT 0, -- e.g., 18 for 18% GST
    current_stock NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions (Invoices, Purchases, Estimates)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Sale', 'Purchase', 'Estimate', 'Purchase Order')),
    party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL,
    transaction_number TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Partial')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Transaction Items
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL, -- Stored separately in case item is deleted/changed later
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_rate NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('Payment In', 'Payment Out')),
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'Bank', 'Cheque', 'UPI', 'Other')),
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own company_settings" ON public.company_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own parties" ON public.parties FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own items" ON public.items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transaction_items" 
ON public.transaction_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.transactions 
    WHERE public.transactions.id = public.transaction_items.transaction_id 
    AND public.transactions.user_id = auth.uid()
  )
);

-- ==========================================
-- ADD PRODUCT IMAGES STORAGE BUCKET & SCHEMA
-- ==========================================

-- 1. Add image_url column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS for product_images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'product_images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND auth.uid() = owner);

-- ==========================================
-- ADD ONE-OFF CUSTOMER FIELDS TO TRANSACTIONS
-- ==========================================
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customer_phone TEXT;
