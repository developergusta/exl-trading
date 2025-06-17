-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables for EXL Academy
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS course_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url TEXT,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('youtube', 'pdf', 'download')),
  content_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS course_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  content_id UUID REFERENCES course_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('all', 'specific', 'group')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS user_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_course_content_course_id ON course_content(course_id);
CREATE INDEX IF NOT EXISTS idx_course_content_order ON course_content(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_permissions_course ON course_permissions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_permissions_user ON course_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_user ON user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_group ON user_group_members(group_id);

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Users can view active courses" ON courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for course_content
CREATE POLICY "Users can view content they have permission for" ON course_content
  FOR SELECT USING (
    is_active = true AND (
      -- Content is public (all users)
      EXISTS (
        SELECT 1 FROM course_permissions cp
        WHERE cp.content_id = course_content.id
        AND cp.permission_type = 'all'
      )
      OR
      -- User has specific permission
      EXISTS (
        SELECT 1 FROM course_permissions cp
        WHERE cp.content_id = course_content.id
        AND cp.user_id = auth.uid()
        AND cp.permission_type = 'specific'
      )
      OR
      -- User is in a group with permission
      EXISTS (
        SELECT 1 FROM course_permissions cp
        JOIN user_group_members ugm ON ugm.group_id::text = cp.user_id::text
        WHERE cp.content_id = course_content.id
        AND ugm.user_id = auth.uid()
        AND cp.permission_type = 'group'
      )
    )
  );

CREATE POLICY "Admins can manage course content" ON course_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for course_permissions
CREATE POLICY "Admins can manage permissions" ON course_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for user_groups
CREATE POLICY "Admins can manage groups" ON user_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for user_group_members
CREATE POLICY "Users can view their group memberships" ON user_group_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage group memberships" ON user_group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Create functions for better data management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_content_updated_at BEFORE UPDATE ON course_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
