
-- Create trainings table for Training & Workshops section
CREATE TABLE public.trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT,
  year TEXT,
  description TEXT,
  certificate_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read trainings" 
ON public.trainings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage trainings" 
ON public.trainings 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_trainings_updated_at
BEFORE UPDATE ON public.trainings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
