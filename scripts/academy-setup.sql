-- ==================================================
-- EXL ACADEMY - Sistema de Cursos e Conteúdos
-- ==================================================

-- Melhorar a tabela de cursos existente
DROP TABLE IF EXISTS public.course_progress CASCADE;
DROP TABLE IF EXISTS public.course_enrollments CASCADE;
DROP TABLE IF EXISTS public.course_content CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- Criar tabela de cursos melhorada
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,
  category TEXT DEFAULT 'trading' CHECK (category IN ('trading', 'analise-tecnica', 'psicologia', 'gestao-risco', 'outros')),
  level TEXT DEFAULT 'iniciante' CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
  duration_hours INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de módulos/conteúdos do curso
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de conteúdos (vídeos, PDFs, etc.)
CREATE TABLE IF NOT EXISTS public.course_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('youtube', 'vimeo', 'pdf', 'download', 'text')),
  content_url TEXT NOT NULL,
  youtube_video_id TEXT, -- Para extrair automaticamente do URL do YouTube
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false, -- Se pode ser visto sem permissão
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de matrículas em cursos
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  enrolled_by UUID REFERENCES public.profiles(id), -- Admin que fez a matrícula
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(course_id, user_id)
);

-- Criar tabela de progresso do usuário
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.course_content(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  watch_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, content_id)
);

-- ===========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ===========================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLÍTICAS PARA CURSOS
-- ===========================================

CREATE POLICY "Todos podem ver cursos ativos" ON public.courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Apenas admins podem gerenciar cursos" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- POLÍTICAS PARA MÓDULOS
-- ===========================================

CREATE POLICY "Todos podem ver módulos ativos" ON public.course_modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Apenas admins podem gerenciar módulos" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- POLÍTICAS PARA CONTEÚDOS
-- ===========================================

CREATE POLICY "Todos podem ver conteúdos ativos e previews" ON public.course_content
  FOR SELECT USING (is_active = true AND (is_preview = true OR 
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND c.is_free = true
    )
  ));

CREATE POLICY "Usuários com permissão podem ver conteúdos pagos" ON public.course_content
  FOR SELECT USING (
    is_active = true AND (
      is_preview = true OR
      EXISTS (
        SELECT 1 FROM public.courses c 
        WHERE c.id = course_id AND c.is_free = true
      ) OR
      EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.course_id = course_id AND ce.user_id = auth.uid() AND ce.is_active = true
      )
    )
  );

CREATE POLICY "Apenas admins podem gerenciar conteúdos" ON public.course_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- POLÍTICAS PARA MATRÍCULAS
-- ===========================================

CREATE POLICY "Usuários podem ver suas próprias matrículas" ON public.course_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todas as matrículas" ON public.course_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Usuários podem se matricular em cursos gratuitos" ON public.course_enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND c.is_free = true AND c.is_active = true
    )
  );

-- ===========================================
-- POLÍTICAS PARA PROGRESSO
-- ===========================================

CREATE POLICY "Usuários podem ver seu próprio progresso" ON public.course_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem registrar seu próprio progresso" ON public.course_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio progresso" ON public.course_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todo o progresso" ON public.course_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- TRIGGERS PARA UPDATED_AT
-- ===========================================

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_course_content_updated_at
  BEFORE UPDATE ON public.course_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_course_enrollments_updated_at
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- FUNÇÕES AUXILIARES
-- ===========================================

-- Função para extrair ID do vídeo do YouTube
CREATE OR REPLACE FUNCTION extract_youtube_video_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Extrair ID do YouTube de diferentes formatos de URL
  IF url ~* 'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)' THEN
    RETURN substring(url from 'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)');
  ELSIF url ~* 'youtu\.be/([a-zA-Z0-9_-]+)' THEN
    RETURN substring(url from 'youtu\.be/([a-zA-Z0-9_-]+)');
  ELSIF url ~* 'youtube\.com/embed/([a-zA-Z0-9_-]+)' THEN
    RETURN substring(url from 'youtube\.com/embed/([a-zA-Z0-9_-]+)');
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para extrair automaticamente o ID do YouTube
CREATE OR REPLACE FUNCTION auto_extract_youtube_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_type = 'youtube' AND NEW.content_url IS NOT NULL THEN
    NEW.youtube_video_id = extract_youtube_video_id(NEW.content_url);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER extract_youtube_id_trigger
  BEFORE INSERT OR UPDATE ON public.course_content
  FOR EACH ROW
  EXECUTE FUNCTION auto_extract_youtube_id();

-- Função para calcular progresso do curso
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_content INTEGER;
  completed_content INTEGER;
  progress INTEGER;
BEGIN
  -- Contar total de conteúdos do curso
  SELECT COUNT(*) INTO total_content
  FROM public.course_content
  WHERE course_id = p_course_id AND is_active = true;
  
  -- Contar conteúdos completados pelo usuário
  SELECT COUNT(*) INTO completed_content
  FROM public.course_progress cp
  JOIN public.course_content cc ON cp.content_id = cc.id
  WHERE cp.user_id = p_user_id AND cc.course_id = p_course_id AND cc.is_active = true;
  
  -- Calcular porcentagem
  IF total_content > 0 THEN
    progress = (completed_content * 100) / total_content;
  ELSE
    progress = 0;
  END IF;
  
  -- Atualizar tabela de matrículas
  UPDATE public.course_enrollments
  SET progress_percentage = progress,
      completion_date = CASE WHEN progress = 100 THEN now() ELSE NULL END
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso automaticamente
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_course_progress(NEW.user_id, NEW.course_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_trigger
  AFTER INSERT OR UPDATE ON public.course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress();

-- ===========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ===========================================

-- Descomente as linhas abaixo para inserir dados de exemplo
-- Certifique-se de que existe um usuário admin primeiro

/*
INSERT INTO public.courses (title, description, instructor_name, category, level, is_free, created_by)
VALUES 
  ('Fundamentos do Trading', 'Aprenda os conceitos básicos do trading', 'João Silva', 'trading', 'iniciante', true, 
   (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
  ('Análise Técnica Avançada', 'Domine as técnicas avançadas de análise', 'Maria Santos', 'analise-tecnica', 'avancado', false,
   (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));

-- Adicionar alguns conteúdos de exemplo para o primeiro curso
INSERT INTO public.course_content (course_id, title, description, content_type, content_url, duration_minutes, order_index, is_preview)
VALUES 
  ((SELECT id FROM public.courses WHERE title = 'Fundamentos do Trading' LIMIT 1), 
   'Introdução ao Trading', 'Conceitos básicos do mercado financeiro', 'youtube', 
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 15, 1, true),
  ((SELECT id FROM public.courses WHERE title = 'Fundamentos do Trading' LIMIT 1), 
   'Análise de Gráficos', 'Como interpretar gráficos de preços', 'youtube', 
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25, 2, false);
*/ 