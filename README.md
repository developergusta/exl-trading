# EXL Trading - Plataforma de Trading

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/exltrade/v0-diariotrading3)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/YJg2BZ2WwGx)

## 📱 Mobile-First Design

Este sistema foi desenvolvido com **abordagem mobile-first**, priorizando a experiência em dispositivos móveis e expandindo para desktop.

### Características Mobile-First:

- ✅ **Design Responsivo**: Interface otimizada para telas pequenas primeiro
- ✅ **PWA (Progressive Web App)**: Pode ser instalado como app nativo
- ✅ **Touch-Friendly**: Componentes otimizados para toque
- ✅ **Performance Mobile**: Carregamento rápido em conexões móveis
- ✅ **Navegação Mobile**: Menu hambúrguer e navegação por gestos

## 🚀 Funcionalidades

### Principais Recursos:

- 📊 **Diário de Trading**: Registro e análise de trades
- 📚 **EXL Academy**: Plataforma de cursos e conteúdo educacional
- 🌐 **Comunidade**: Feed social entre traders
- 📱 **Notificações Push**: Alertas e atualizações em tempo real
- 👤 **Gestão de Perfil**: Upload de avatar e configurações pessoais
- 📈 **Analytics**: Relatórios de performance e expectativa
- 🎯 **Gestão de Risco**: Ferramentas de análise de risco

### Características Técnicas:

- **Framework**: Next.js 14 (App Router)
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Mobile**: Progressive Web App (PWA)
- **Notificações**: Web Push API
- **Tipo**: TypeScript

## 📱 Responsividade

### Breakpoints Mobile-First:

```css
/* Mobile First (padrão) */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  /* md */
}

/* Desktop */
@media (min-width: 1024px) {
  /* lg */
}

/* Large Desktop */
@media (min-width: 1280px) {
  /* xl */
}
```

### Componentes Responsivos:

- **Navigation**: Menu hambúrguer mobile → Sidebar desktop
- **Cards**: Stack vertical mobile → Grid desktop
- **Forms**: Full-width mobile → Containers desktop
- **Modais**: Full-screen mobile → Centered desktop

## 🔧 Instalação e Deploy

### Desenvolvimento Local:

```bash
npm install
npm run dev
```

### Configuração Mobile PWA:

1. Configure o `manifest.json` em `/public/`
2. Registre o Service Worker
3. Configure notificações push
4. Teste em dispositivos móveis

## 📲 PWA Features

### Instalação:

- **iOS**: "Adicionar à Tela Inicial"
- **Android**: Prompt automático de instalação
- **Desktop**: Botão de instalação no navegador

### Offline Support:

- Cache de páginas principais
- Sincronização quando voltar online
- Indicador de status offline

## 🔐 Configuração do Backend

### Supabase Setup:

1. Execute `scripts/supabase-setup.sql`
2. Configure variáveis de ambiente
3. Setup buckets de storage (avatares, academy, publico)
4. Configure políticas RLS

### Storage Buckets:

- **`avatares`**: Fotos de perfil dos usuários
- **`academy`**: Conteúdo educacional
- **`publico`**: Imagens de posts da comunidade

## 📱 Testes Mobile

### Dispositivos Testados:

- ✅ iPhone (Safari)
- ✅ Android Chrome
- ✅ Tablets
- ✅ Desktop responsive

### Ferramentas de Teste:

```bash
# Lighthouse mobile score
npm run lighthouse

# Teste PWA
npm run pwa-test

# Responsivo
npm run responsive-test
```

## 🎨 Design System

### Mobile-First Components:

- **Touch targets**: Mínimo 44px
- **Typography**: Escalas legíveis em mobile
- **Spacing**: Sistema 4px/8px
- **Colors**: Contraste otimizado para telas pequenas

### Acessibilidade:

- ✅ ARIA labels
- ✅ Navegação por teclado
- ✅ Alto contraste
- ✅ Screen readers

---

## 🔗 Links Úteis

- **Deploy**: [https://vercel.com/exltrade/v0-diariotrading3](https://vercel.com/exltrade/v0-diariotrading3)
- **Development**: [https://v0.dev/chat/projects/YJg2BZ2WwGx](https://v0.dev/chat/projects/YJg2BZ2WwGx)
- **Guias**:
  - `AVATAR_SETUP_GUIDE.md` - Configuração de upload de avatares
  - `PUSH_NOTIFICATIONS_GUIDE.md` - Setup de notificações
  - `MOBILE_NAVIGATION_UPDATE.md` - Navegação mobile

**📱 Sistema otimizado para dispositivos móveis primeiro!**
