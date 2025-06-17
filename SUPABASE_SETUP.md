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

## 4. Configuração de Autenticação

### 4.1 Configurações do Auth

No dashboard do Supabase:

1. Vá para "Authentication" > "Settings"
2. Em "User Signups":
   - Marque "Enable email confirmations" (opcional)
   - Se não quiser confirmação por email, desmarque esta opção

### 4.2 Configurar URL de redirecionamento

Em "Authentication" > "URL Configuration":

- Site URL: `http://localhost:3000` (para desenvolvimento)
- Redirect URLs: `http://localhost:3000/**`

Para produção, substitua por sua URL real.

## 5. Política de Row Level Security (RLS)

O script SQL já configura automaticamente:

### 5.1 Tabela Profiles

- Usuários podem ver apenas seu próprio perfil
- Usuários podem atualizar apenas seu próprio perfil
- Admins podem ver e modificar todos os perfis
- Qualquer um pode criar um perfil (registro)

### 5.2 Tabelas de Cursos

- Usuários podem ver cursos e conteúdos ativos
- Apenas admins podem gerenciar cursos e conteúdos
- Sistema de permissões para controlar acesso ao conteúdo

## 6. Testando a Configuração

### 6.1 Verificar conexão

1. Inicie o projeto: `npm run dev`
2. Acesse `http://localhost:3000`
3. Tente fazer login com o usuário admin criado
4. Se der erro, verifique:
   - Se as variáveis de ambiente estão corretas
   - Se o script SQL foi executado
   - Se o usuário admin foi criado corretamente

### 6.2 Testar registro de novo usuário

1. Clique em "Cadastre-se"
2. Preencha o formulário
3. Verifique se o usuário foi criado na tabela `profiles` com status "pending"
4. Como admin, aprove o usuário no painel administrativo

## 7. Funcionalidades Implementadas

### 7.1 Autenticação

- ✅ Registro de usuários com validação
- ✅ Login com email e senha
- ✅ Logout
- ✅ Persistência de sessão
- ✅ Controle de acesso por roles (user/admin)
- ✅ Sistema de aprovação de usuários

### 7.2 Segurança

- ✅ Row Level Security habilitado
- ✅ Políticas de acesso por role
- ✅ Validação de dados no banco
- ✅ Triggers automáticos

### 7.3 Fallback

- ✅ Sistema funciona com localStorage se Supabase não estiver configurado
- ✅ Migração automática quando Supabase for configurado

## 8. Estrutura do Banco de Dados

### 8.1 Tabela `profiles`

```sql
- id (UUID, PK, FK para auth.users)
- name (TEXT)
- phone (TEXT, opcional)
- experience (TEXT: iniciante, intermediario, avancado, profissional)
- status (TEXT: pending, approved, rejected)
- role (TEXT: user, admin)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 8.2 Outras tabelas

- `courses`: Cursos da academia
- `course_content`: Conteúdo dos cursos
- `course_permissions`: Permissões de acesso
- `user_groups`: Grupos de usuários
- `user_group_members`: Membros dos grupos

## 9. Troubleshooting

### 9.1 Erro de conexão

- Verifique se as URLs e chaves estão corretas
- Verifique se o projeto Supabase está ativo
- Reinicie o servidor de desenvolvimento

### 9.2 Erro de autenticação

- Verifique se o script SQL foi executado
- Verifique se a tabela `profiles` foi criada
- Verifique se as políticas RLS estão ativas

### 9.3 Usuário não consegue fazer login

- Verifique se o status do usuário é "approved"
- Verifique se o email está correto
- Para admins, verifique se o role é "admin"

## 10. Próximos Passos

Após a configuração básica:

1. Personalize as políticas de RLS conforme necessário
2. Configure emails de confirmação (opcional)
3. Implemente recuperação de senha
4. Configure backup automático
5. Configure ambiente de produção
