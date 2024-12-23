-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create whatsapp_groups table
CREATE TABLE public.whatsapp_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS) for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Set up RLS for whatsapp_groups table
ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view WhatsApp groups" ON public.whatsapp_groups
  FOR SELECT USING (true);

-- Set up RLS for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to get user email
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email TO anon, authenticated;

-- Insert sample WhatsApp groups
INSERT INTO public.whatsapp_groups (name, description, link) VALUES
('Digital Nomads Global', 'Connect with digital nomads worldwide', 'https://chat.whatsapp.com/example1'),
('Remote Work Enthusiasts', 'Share tips and tricks for remote work', 'https://chat.whatsapp.com/example2'),
('Travel Hackers Unite', 'Exchange travel hacks and destination ideas', 'https://chat.whatsapp.com/example3');


-- Modify the messages table to include user_email
ALTER TABLE public.messages ADD COLUMN user_email TEXT NOT NULL;

-- Update the RLS policy for inserting messages
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
CREATE POLICY "Authenticated users can insert messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.email() = user_email);

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'test@gmail.com';

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);


-- Blog Posts Policies
-- Step 1: Enable Row Level Security (RLS) for the table
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy to allow authenticated users to view all blog posts
CREATE POLICY "Allow read access to authenticated users"
ON blog_posts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Step 3: Create policy to allow authenticated users to create blog posts
CREATE POLICY "Allow insert access to authenticated users"
ON blog_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 4: Create policy to allow users to update their own blog posts to inactive status
CREATE POLICY "Allow update access for blog post owner"
ON blog_posts
FOR UPDATE
USING (auth.uid() = user_id);

