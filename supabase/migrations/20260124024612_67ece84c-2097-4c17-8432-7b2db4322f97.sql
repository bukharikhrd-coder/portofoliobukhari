-- Create service_packages table
CREATE TABLE public.service_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'idr',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_orders table
CREATE TABLE public.client_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  project_url TEXT,
  amount_paid INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_orders ENABLE ROW LEVEL SECURITY;

-- Service packages policies (public read, admin manage)
CREATE POLICY "Public can read active service packages"
  ON public.service_packages
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage service packages"
  ON public.service_packages
  FOR ALL
  USING (is_admin(auth.uid()));

-- Client orders policies (admin only)
CREATE POLICY "Admins can manage client orders"
  ON public.client_orders
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Public can insert client orders"
  ON public.client_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read own orders by email"
  ON public.client_orders
  FOR SELECT
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_orders_updated_at
  BEFORE UPDATE ON public.client_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_client_orders_status ON public.client_orders(status);
CREATE INDEX idx_client_orders_email ON public.client_orders(client_email);
CREATE INDEX idx_service_packages_active ON public.service_packages(is_active, order_index);