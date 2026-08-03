-- ==========================================
-- SUPABASE POSTGRESQL SCHEMA FOR HOLOGRAPHIC BLOG
-- ==========================================

-- 1. Create Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Create Assignment Users Table (Step 4)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  profile_pic TEXT,
  role VARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  category_id INT DEFAULT 1,
  thumbnail_url TEXT DEFAULT '',
  image TEXT DEFAULT '',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  author TEXT DEFAULT 'Admin',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Article Likes Table
CREATE TABLE IF NOT EXISTS public.article_likes (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

-- 5. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id TEXT NOT NULL, -- 'admin' or user uuid
  sender_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'article')),
  article_id TEXT DEFAULT '',
  article_title TEXT DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone authenticated can insert categories" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can update categories" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can delete categories" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

-- Articles Policies
CREATE POLICY "Published articles viewable by everyone" ON public.articles FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create articles" ON public.articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update articles" ON public.articles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete articles" ON public.articles FOR DELETE USING (auth.role() = 'authenticated');

-- Likes Policies
CREATE POLICY "Likes viewable by everyone" ON public.article_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage likes" ON public.article_likes FOR ALL USING (auth.role() = 'authenticated');

-- Comments Policies
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Notifications Policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (true);

-- ==========================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- REALTIME PUBLICATION ENABLEMENT
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
