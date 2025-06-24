# Guia de Configuração do Upload de Avatar

## 📸 Bucket de Avatares - Configuração Necessária

Para implementar o upload de avatares de usuários, você precisa executar o script SQL que adiciona as configurações necessárias do bucket no Supabase.

### 1. Execute o Script SQL

Acesse o **Supabase Dashboard** > **SQL Editor** e execute o script completo em `scripts/supabase-setup.sql`.

**IMPORTANTE**: As novas configurações de bucket foram adicionadas ao final do arquivo:

```sql
-- CONFIGURAÇÃO DO BUCKET PARA AVATARES
-- Criar bucket 'avatares' para imagens de perfil dos usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de avatares
-- 1. Qualquer usuário autenticado pode fazer upload de sua própria imagem
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatares'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Qualquer usuário autenticado pode atualizar sua própria imagem
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatares'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Qualquer usuário autenticado pode deletar sua própria imagem
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatares'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Todos podem visualizar avatares (bucket público)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatares');
```

### 2. Funcionalidades Implementadas

✅ **Upload de Avatar**: Componente para selecionar e fazer upload de imagem de perfil  
✅ **Validação de Arquivo**: Aceita apenas JPG, JPEG, PNG, WEBP (máximo 2MB)  
✅ **Gerenciamento**: Remove avatares antigos automaticamente ao fazer upload de novo  
✅ **Segurança**: Cada usuário só pode gerenciar seus próprios avatares  
✅ **Interface**: Componente visual intuitivo na página de configurações

### 3. Estrutura do Bucket

O bucket `avatares` organiza as imagens da seguinte forma:

```
avatares/
  ├── {user_id}/
  │   └── avatar.{extensão}
  ├── {outro_user_id}/
  │   └── avatar.{extensão}
  └── ...
```

### 4. Como Usar

1. **Acesse**: Dashboard > Perfil > Configurações
2. **Upload**: Clique em "Carregar Foto" na seção "Foto de Perfil"
3. **Formato**: Selecione uma imagem (JPG, PNG, WEBP) de até 2MB
4. **Salvar**: Clique em "Salvar" para aplicar as alterações

### 5. Recursos Técnicos

- **Bucket**: `avatares` (público)
- **Campo**: `avatar_url` na tabela `profiles`
- **Validação**: Tipo de arquivo e tamanho
- **Fallback**: Funciona sem Supabase (localStorage para desenvolvimento)
- **Cleanup**: Remove arquivos antigos automaticamente

### 6. Políticas de Segurança

- ✅ Usuários só podem gerenciar seus próprios avatares
- ✅ Estrutura de pastas baseada no ID do usuário
- ✅ Bucket público para visualização
- ✅ RLS (Row Level Security) aplicado

---

**Após executar o script SQL, a funcionalidade de upload de avatar estará totalmente operacional!** 🚀
