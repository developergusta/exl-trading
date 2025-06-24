# Guia de Configuração dos Comentários

Este guia explica como configurar o sistema de comentários no community feed da aplicação EXL Trading.

## 📋 Visão Geral

O sistema de comentários foi implementado com as seguintes funcionalidades:

- ✅ Comentários em posts da comunidade
- ✅ Respostas a comentários (replies)
- ✅ Exclusão de comentários próprios
- ✅ Atualização automática do contador de comentários
- ✅ Interface responsiva e moderna
- ✅ Carregamento sob demanda dos comentários

## 🗃️ Configuração do Banco de Dados

### 1. Execute o Script SQL

Execute o script `scripts/community-comments-setup.sql` no seu banco Supabase:

```sql
-- O script irá criar:
-- 1. Tabela community_comments
-- 2. Políticas RLS (Row Level Security)
-- 3. Índices para performance
-- 4. Triggers para atualizar contadores automaticamente
```

### 2. Estrutura da Tabela

A tabela `community_comments` possui os seguintes campos:

```sql
- id: UUID (Primary Key)
- post_id: UUID (FK para community_posts)
- author_id: UUID (FK para profiles)
- content: TEXT (conteúdo do comentário)
- parent_id: UUID (FK para community_comments - para replies)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🚀 Como Usar

### 1. Interface do Usuário

- **Ver comentários**: Clique no ícone de comentário em qualquer post
- **Adicionar comentário**: Digite no campo de texto e clique em "Comentar"
- **Responder comentário**: Clique em "Responder" em qualquer comentário
- **Excluir comentário**: Clique no ícone de lixeira (apenas seus próprios comentários)

### 2. Funcionalidades Técnicas

#### Hook `useCommunity()`

```typescript
const {
  comments, // Record<string, CommunityComment[]>
  commentsLoading, // Record<string, boolean>
  getComments, // (postId: string) => Promise<void>
  addComment, // (postId: string, content: string, parentId?: string) => Promise<void>
  deleteComment, // (commentId: string, postId: string) => Promise<void>
} = useCommunity();
```

#### Componente `CommentSection`

```tsx
<CommentSection
  postId="uuid-do-post"
  isOpen={true}
  onClose={() => setOpen(false)}
/>
```

## 🔒 Segurança (RLS)

As políticas implementadas garantem:

- **Visualização**: Todos podem ver comentários
- **Criação**: Apenas usuários autenticados podem comentar
- **Edição**: Apenas o autor pode editar seus comentários
- **Exclusão**: Apenas o autor pode excluir seus comentários

## ⚡ Performance

### Otimizações Implementadas:

- **Carregamento sob demanda**: Comentários só são carregados quando necessário
- **Índices**: Criados em colunas frequently consultadas
- **Contadores automáticos**: Triggers atualizam `comments_count` automaticamente
- **Cache local**: Estado dos comentários mantido em memória durante a sessão

### Índices Criados:

```sql
- community_comments_post_id_idx
- community_comments_author_id_idx
- community_comments_parent_id_idx
- community_comments_created_at_idx
```

## 🛠️ Estrutura de Arquivos

```
components/
├── community/
│   ├── community-feed.tsx      # Componente principal (atualizado)
│   └── comment-section.tsx     # Novo componente de comentários

hooks/
└── use-community.tsx           # Hook atualizado com funções de comentário

scripts/
└── community-comments-setup.sql # Script de configuração do banco
```

## 🔄 Fluxo de Dados

1. **Carregar comentários**: `getComments(postId)` → Busca no banco → Atualiza estado
2. **Adicionar comentário**: `addComment()` → Insere no banco → Recarrega comentários → Trigger atualiza contador
3. **Responder comentário**: `addComment(postId, content, parentId)` → Mesmo fluxo com parent_id
4. **Excluir comentário**: `deleteComment()` → Remove do banco → Recarrega comentários → Trigger atualiza contador

## 🎨 Estilização

O sistema usa o tema dark da aplicação com:

- Cores consistentes com o design system
- Avatares com iniciais como fallback
- Animações sutis de carregamento
- Layout responsivo para mobile e desktop
- Hierarquia visual clara entre comentários e respostas

## 🧪 Testando

Para testar o sistema:

1. **Execute o script SQL** no Supabase
2. **Reinicie a aplicação** para aplicar as mudanças
3. **Faça login** com um usuário
4. **Crie um post** na comunidade
5. **Teste as funcionalidades**:
   - Adicionar comentário
   - Responder comentário
   - Excluir comentário próprio
   - Verificar atualização do contador

## 🚨 Solução de Problemas

### Erro: "community_comments table doesn't exist"

- Execute o script SQL `community-comments-setup.sql`

### Comentários não aparecem

- Verifique se as políticas RLS estão ativas
- Confirme se o usuário está autenticado

### Contador de comentários não atualiza

- Verifique se os triggers foram criados corretamente
- Execute: `SELECT * FROM pg_trigger WHERE tgname LIKE '%comments_count%';`

### Performance lenta

- Confirme se os índices foram criados
- Execute: `SELECT * FROM pg_indexes WHERE tablename = 'community_comments';`

## 📝 Próximas Melhorias

Funcionalidades que podem ser implementadas no futuro:

- [ ] Edição de comentários
- [ ] Curtir comentários
- [ ] Notificações de respostas
- [ ] Menções (@usuario)
- [ ] Anexos em comentários
- [ ] Moderação de comentários
- [ ] Comentários aninhados (sub-replies)
