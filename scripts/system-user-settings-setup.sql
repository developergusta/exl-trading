-- ========================================
-- EXL TRADING - Configurações do Sistema e Usuário
-- ========================================

-- Tabela de configurações do sistema (administração)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('boolean', 'string', 'number', 'object')),
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Se pode ser lida por usuários não-admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES public.profiles(id)
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('boolean', 'string', 'number', 'object')),
  is_private BOOLEAN DEFAULT true, -- Se a preferência é privada do usuário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, preference_key)
);

-- Tabela de notificações do sistema
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('general', 'individual', 'group')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients JSONB NOT NULL, -- Array de IDs ou 'all'
  sent_by UUID REFERENCES public.profiles(id) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'failed')),
  read_by JSONB DEFAULT '{}', -- Objeto com user_id: timestamp de quando foi lida
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- ========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================================

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA CONFIGURAÇÕES DO SISTEMA
-- ========================================

-- Apenas admins podem ver todas as configurações
CREATE POLICY "Admins can view all system settings" ON public.system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem ver apenas configurações públicas
CREATE POLICY "Users can view public system settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

-- Apenas admins podem modificar configurações do sistema
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS PARA PREFERÊNCIAS DO USUÁRIO
-- ========================================

-- Usuários podem ver suas próprias preferências
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem gerenciar suas próprias preferências
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Admins podem ver todas as preferências
CREATE POLICY "Admins can view all user preferences" ON public.user_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS PARA NOTIFICAÇÕES
-- ========================================

-- Usuários podem ver notificações destinadas a eles
CREATE POLICY "Users can view their notifications" ON public.system_notifications
  FOR SELECT USING (
    recipients @> jsonb_build_array(auth.uid()::text) OR
    recipients @> jsonb_build_array('all') OR
    (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Apenas admins podem criar e gerenciar notificações
CREATE POLICY "Admins can manage notifications" ON public.system_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE TRIGGER set_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- INSERIR CONFIGURAÇÕES PADRÃO DO SISTEMA
-- ========================================

INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('auto_approve_users', 'false', 'boolean', 'Aprovar novos usuários automaticamente', false),
('allow_user_registration', 'true', 'boolean', 'Permitir que novos usuários se cadastrem', true),
('enable_push_notifications', 'true', 'boolean', 'Habilitar notificações push do sistema', false),
('maintenance_mode', 'false', 'boolean', 'Bloquear acesso de usuários (apenas admin)', true),
('max_users_per_day', '10', 'number', 'Máximo de usuários que podem se cadastrar por dia', false),
('session_timeout', '24', 'number', 'Timeout da sessão em horas', false),
('app_name', '"EXL Trading"', 'string', 'Nome da aplicação', true),
('app_version', '"1.0.0"', 'string', 'Versão da aplicação', true),
('support_email', '"admin@exltrading.com"', 'string', 'Email de suporte', true),
('terms_updated_at', '"2024-01-01"', 'string', 'Data da última atualização dos termos', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para obter configuração do sistema
CREATE OR REPLACE FUNCTION get_system_setting(setting_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT setting_value INTO result
  FROM public.system_settings
  WHERE setting_key = setting_name;
  
  RETURN COALESCE(result, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para definir configuração do sistema (apenas admin)
CREATE OR REPLACE FUNCTION set_system_setting(setting_name TEXT, setting_val JSONB, setting_desc TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Verificar se o usuário é admin
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF user_role != 'admin' THEN
    RETURN FALSE;
  END IF;
  
  -- Inserir ou atualizar configuração
  INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, updated_by)
  VALUES (
    setting_name, 
    setting_val, 
    CASE 
      WHEN jsonb_typeof(setting_val) = 'boolean' THEN 'boolean'
      WHEN jsonb_typeof(setting_val) = 'number' THEN 'number'
      WHEN jsonb_typeof(setting_val) = 'string' THEN 'string'
      ELSE 'object'
    END,
    setting_desc,
    auth.uid()
  )
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = COALESCE(EXCLUDED.description, system_settings.description),
    updated_at = now(),
    updated_by = auth.uid();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter preferência do usuário
CREATE OR REPLACE FUNCTION get_user_preference(pref_key TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT preference_value INTO result
  FROM public.user_preferences
  WHERE user_id = auth.uid() AND preference_key = pref_key;
  
  RETURN COALESCE(result, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para definir preferência do usuário
CREATE OR REPLACE FUNCTION set_user_preference(pref_key TEXT, pref_val JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Inserir ou atualizar preferência
  INSERT INTO public.user_preferences (user_id, preference_key, preference_value, preference_type)
  VALUES (
    auth.uid(), 
    pref_key, 
    pref_val, 
    CASE 
      WHEN jsonb_typeof(pref_val) = 'boolean' THEN 'boolean'
      WHEN jsonb_typeof(pref_val) = 'number' THEN 'number'
      WHEN jsonb_typeof(pref_val) = 'string' THEN 'string'
      ELSE 'object'
    END
  )
  ON CONFLICT (user_id, preference_key) 
  DO UPDATE SET 
    preference_value = EXCLUDED.preference_value,
    preference_type = EXCLUDED.preference_type,
    updated_at = now();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE public.system_settings IS 'Configurações globais do sistema administradas pelos admins';
COMMENT ON TABLE public.user_preferences IS 'Preferências individuais dos usuários';
COMMENT ON TABLE public.system_notifications IS 'Histórico de notificações enviadas pelo sistema';

COMMENT ON COLUMN public.system_settings.setting_key IS 'Chave única da configuração';
COMMENT ON COLUMN public.system_settings.setting_value IS 'Valor da configuração em formato JSON';
COMMENT ON COLUMN public.system_settings.is_public IS 'Se a configuração pode ser lida por usuários não-admin';

COMMENT ON COLUMN public.user_preferences.preference_key IS 'Chave da preferência do usuário';
COMMENT ON COLUMN public.user_preferences.preference_value IS 'Valor da preferência em formato JSON';
COMMENT ON COLUMN public.user_preferences.is_private IS 'Se a preferência é privada do usuário';

COMMENT ON COLUMN public.system_notifications.recipients IS 'Array de IDs de usuários ou "all" para todos';
COMMENT ON COLUMN public.system_notifications.read_by IS 'Objeto com user_id: timestamp de quando foi lida'; 