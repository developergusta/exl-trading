# Configuração do Supabase para EXL Trading

Este guia mostra como configurar o Supabase para autenticação e banco de dados no projeto EXL Trading.

## 1. Configuração do Projeto Supabase

### 1.1 Criar um novo projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em "New Project"
3. Escolha sua organização
4. Digite o nome do projeto: "exl-trading"
5. Crie uma senha segura para o banco de dados
6. Escolha a região mais próxima
7. Clique em "Create new project"

### 1.2 Obter as credenciais do projeto

Após a criação do projeto:

1. Vá para "Settings" > "API"
2. Copie a "Project URL" e a "anon public" key

## 2. Configuração das Variáveis de Ambiente

### 2.1 Criar arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**Substitua pelos valores reais do seu projeto Supabase!**

## 3. Configuração do Banco de Dados

### 3.1 Executar o script SQL

1. No dashboard do Supabase, vá para "SQL Editor"
2. Copie todo o conteúdo do arquivo `scripts/supabase-setup.sql`
3. Cole no editor e execute

Este script irá:

- Criar a tabela `profiles` para dados dos usuários
- Configurar Row Level Security (RLS)
- Criar políticas de acesso
- Configurar triggers automáticos
- Criar as tabelas para os cursos da academia

### 3.2 Criar usuário administrador

Após executar o script SQL:

1. Vá para "Authentication" > "Users" no dashboard
2. Clique em "Add user"
3. Preencha:
   - Email: `admin@exltrading.com`
   - Password: `admin123` (ou a senha que preferir)
   - Confirm password: `admin123`
4. Clique em "Create user"

5. Execute este SQL para tornar o usuário admin:

```sql
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@exltrading.com');
```

## 4. Configuração do Storage

### 4.1 Criar bucket para a Academia

1. No dashboard do Supabase, vá para "Storage"
2. Clique em "Create bucket"
3. Configure o bucket:
   - Name: `academy`
   - Public bucket: ✅ (marque como público)
   - File size limit: `5 MB`
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`
4. Clique em "Create bucket"

### 4.2 Configurar políticas do Storage

Após criar o bucket, você precisa configurar as políticas de RLS. Vá para "Storage" > "Policies" no dashboard do Supabase e execute os seguintes comandos SQL:

**IMPORTANTE: Execute cada comando SQL separadamente no SQL Editor**

1. **Habilitar RLS no Storage (se não estiver habilitado):**

```sql
-- Verificar se RLS está habilitado no storage.objects
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Se rowsecurity for 'f' (false), execute:
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

2. **Remover políticas existentes (se houver conflito):**

```sql
-- Limpar políticas existentes do bucket academy
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "academy_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "academy_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "academy_delete_policy" ON storage.objects;
```

3. **Criar políticas corretas para o bucket academy:**

```sql
-- Política para visualização pública (todos podem ver as imagens)
CREATE POLICY "academy_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'academy');

-- Política para upload (apenas admins autenticados)
CREATE POLICY "academy_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'academy'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  )
);

-- Política para deletar (apenas admins autenticados)
CREATE POLICY "academy_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'academy'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  )
);
```

4. **Verificar se o usuário é admin:**

```sql
-- Verificar se seu usuário atual é admin
SELECT
  p.id,
  p.name,
  p.email,
  p.role,
  p.status,
  u.email as auth_email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'SEU_EMAIL_AQUI'; -- Substitua pelo seu email

-- Se não for admin, execute:
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');
```

## 5. Configuração de Autenticação

### 5.1 Configurações do Auth

No dashboard do Supabase:

1. Vá para "Authentication" > "Settings"
2. Em "User Signups":
   - Marque "Enable email confirmations" (opcional)
   - Se não quiser confirmação por email, desmarque esta opção

### 5.2 Configurar URL de redirecionamento

Em "Authentication" > "URL Configuration":

- Site URL: `http://localhost:3000` (para desenvolvimento)
- Redirect URLs: `http://localhost:3000/**`

Para produção, substitua por sua URL real.

## 6. Política de Row Level Security (RLS)

O script SQL já configura automaticamente:

### 6.1 Tabela Profiles

- Usuários podem ver apenas seu próprio perfil
- Usuários podem atualizar apenas seu próprio perfil
- Admins podem ver e modificar todos os perfis
- Qualquer um pode criar um perfil (registro)

### 6.2 Tabelas de Cursos

- Usuários podem ver cursos e conteúdos ativos
- Apenas admins podem gerenciar cursos e conteúdos
- Sistema de permissões para controlar acesso ao conteúdo

## 7. Testando a Configuração

### 7.1 Verificar conexão

1. Inicie o projeto: `npm run dev`
2. Acesse `http://localhost:3000`
3. Tente fazer login com o usuário admin criado
4. Se der erro, verifique:
   - Se as variáveis de ambiente estão corretas
   - Se o script SQL foi executado
   - Se o usuário admin foi criado corretamente

### 7.2 Testar registro de novo usuário

1. Clique em "Cadastre-se"
2. Preencha o formulário
3. Verifique se o usuário foi criado na tabela `profiles` com status "pending"
4. Como admin, aprove o usuário no painel administrativo

## 8. Funcionalidades Implementadas

### 8.1 Autenticação

- ✅ Registro de usuários com validação
- ✅ Login com email e senha
- ✅ Logout
- ✅ Persistência de sessão
- ✅ Controle de acesso por roles (user/admin)
- ✅ Sistema de aprovação de usuários

### 8.2 Segurança

- ✅ Row Level Security habilitado
- ✅ Políticas de acesso por role
- ✅ Validação de dados no banco
- ✅ Triggers automáticos

### 8.3 Fallback

- ✅ Sistema funciona com Supabase
- ✅ Migração automática quando Supabase for configurado

## 9. Estrutura do Banco de Dados

### 9.1 Tabela `profiles`

```sql
- id (UUID, PK, FK para auth.users)
- name (TEXT)
- email (TEXT)
- phone (TEXT, opcional)
- experience (TEXT: iniciante, intermediario, avancado, profissional)
- status (TEXT: pending, approved, rejected)
- role (TEXT: user, admin)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 9.2 Outras tabelas

- `courses`: Cursos da academia
- `course_content`: Conteúdo dos cursos
- `course_permissions`: Permissões de acesso
- `user_groups`: Grupos de usuários
- `user_group_members`: Membros dos grupos

## 10. Troubleshooting

### 10.1 Erro de conexão

- Verifique se as URLs e chaves estão corretas
- Verifique se o projeto Supabase está ativo
- Reinicie o servidor de desenvolvimento

### 10.2 Erro de autenticação

- Verifique se o script SQL foi executado
- Verifique se a tabela `profiles` foi criada
- Verifique se as políticas RLS estão ativas

### 10.3 Usuário não consegue fazer login

- Verifique se o status do usuário é "approved"
- Verifique se o email está correto
- Para admins, verifique se o role é "admin"

### 10.4 Erro no upload de imagens

- Verifique se o bucket "academy" foi criado no Storage
- Verifique se o bucket está marcado como público
- Verifique se as políticas de Storage foram configuradas
- Verifique se o usuário é admin (apenas admins podem fazer upload)
- Verifique se o arquivo está dentro do limite de 5MB
- Verifique se o tipo de arquivo é suportado (JPG, JPEG, PNG, WEBP)

### 10.5 Erro "new row violates row-level security policy" (RLS)

**Este é um erro comum de permissões no Supabase Storage. Siga estes passos:**

1. **Verificar se você está logado como admin:**

```sql
SELECT
  p.id,
  p.name,
  p.email,
  p.role,
  p.status,
  u.email as auth_email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.id = auth.uid(); -- Mostra o usuário atual
```

2. **Se não for admin, tornar admin:**

```sql
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE id = auth.uid();
```

3. **Verificar se o bucket existe:**

```sql
SELECT * FROM storage.buckets WHERE id = 'academy';
```

4. **Se não existir, criar o bucket:**

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy', 'academy', true);
```

5. **Verificar políticas existentes:**

```sql
SELECT * FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

6. **Recriar políticas (execute no SQL Editor):**

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "academy_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "academy_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "academy_delete_policy" ON storage.objects;

-- Criar políticas novas
CREATE POLICY "academy_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'academy');

CREATE POLICY "academy_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'academy'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  )
);

CREATE POLICY "academy_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'academy'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'approved'
  )
);
```

7. **Fazer logout e login novamente** para atualizar as permissões no frontend

## 11. Próximos Passos

Após a configuração básica:

1. Personalize as políticas de RLS conforme necessário
2. Configure emails de confirmação (opcional)
3. Implemente recuperação de senha
4. Configure backup automático
5. Configure ambiente de produção
