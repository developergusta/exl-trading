-- Create community comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE, -- Para replies/respostas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on community_comments
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for community_comments table
CREATE POLICY "Everyone can view comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS community_comments_post_id_idx ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS community_comments_author_id_idx ON public.community_comments(author_id);
CREATE INDEX IF NOT EXISTS community_comments_parent_id_idx ON public.community_comments(parent_id);
CREATE INDEX IF NOT EXISTS community_comments_created_at_idx ON public.community_comments(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER set_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update comments count when a comment is added/removed
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update comments count
CREATE TRIGGER community_comments_count_trigger_insert
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comments_count();

CREATE TRIGGER community_comments_count_trigger_delete
  AFTER DELETE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comments_count(); 