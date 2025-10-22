# AI Platform - White Label Solution

A powerful white-label AI platform with Claude & OpenAI integration, RAG system, document processing, and n8n automation capabilities.

## 🚀 Features

### ✅ **COMPLETED - Production Ready!** (Phases 1-6)

#### **Phase 1-2: Foundation & Project Management**
- ✅ **Authentication System**
  - Supabase Auth with email/password
  - Protected routes with middleware
  - Session management & user profiles
  - Row Level Security (RLS)

- ✅ **Project Management**
  - Full CRUD operations
  - Custom AI instructions per project
  - Color coding and categorization
  - Archive/restore functionality
  - Beautiful card-based UI

- ✅ **Database & Infrastructure**
  - Complete Supabase setup with pgvector
  - 11 tables with comprehensive RLS policies
  - Type-safe database client
  - Automatic triggers and functions

#### **Phase 3: AI Chat Interface**
- ✅ **OpenAI Integration**
  - GPT-4, GPT-4-Turbo, GPT-4o, GPT-3.5-Turbo
  - Streaming chat responses
  - Token counting & cost tracking

- ✅ **Anthropic Claude Integration**
  - Claude 3.5 Sonnet, Opus, Sonnet, Haiku
  - Streaming responses
  - Advanced conversation management

- ✅ **Chat Features**
  - Provider/model switcher
  - Conversation history storage
  - Message threading
  - Real-time streaming
  - Usage analytics

#### **Phase 4: API Key Management**
- ✅ **Secure Key Storage**
  - Encrypted API key storage
  - Support for OpenAI, Anthropic, RunwayML
  - Key validation & testing
  - Add/Test/Delete interface

#### **Phase 5: RAG Document System**
- ✅ **Document Processing**
  - Upload PDF, DOCX, TXT, CSV files
  - Drag-and-drop interface
  - Text extraction from all formats
  - Intelligent chunking (500 tokens)

- ✅ **Vector Search**
  - OpenAI embedding generation (text-embedding-3-small)
  - pgvector similarity search
  - Automatic context injection in chats
  - Semantic search with threshold tuning

#### **Phase 6: DALL-E Image Generation**
- ✅ **Image Generation**
  - DALL-E 3 integration
  - Multiple sizes (1024x1024, 1792x1024, 1024x1792)
  - Standard & HD quality
  - Cost tracking

- ✅ **Image Gallery**
  - Grid view with hover effects
  - Image preview & zoom
  - Download functionality
  - Delete management

### 🚧 **Coming Soon** (Phases 7-11)

- ⏳ n8n Webhook Integration
- ⏳ MPC Decision Rooms (multi-model comparison)
- ⏳ Analytics Dashboard
- ⏳ White-label Configuration
- ⏳ Deployment Scripts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL with pgvector
- **AI Providers**: OpenAI, Anthropic Claude
- **Animations**: Framer Motion, Lucide Icons

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/IGTA-Tech/Claude-OpenAI-Co-Project-Tool.git
   cd Claude-OpenAI-Co-Project-Tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable the `vector` extension in Database → Extensions
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Create two storage buckets: `documents` and `images`
   - See `supabase/README.md` for detailed instructions

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/           # Main dashboard
│   │   ├── projects/        # Projects pages
│   │   ├── chat/            # Chat interface (coming soon)
│   │   ├── documents/       # Document management (coming soon)
│   │   └── settings/        # Settings pages (coming soon)
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (sidebar, header)
│   └── projects/            # Project-specific components
├── lib/
│   ├── supabase/            # Supabase client setup
│   ├── auth/                # Auth actions
│   └── projects/            # Project actions
├── types/                   # TypeScript types
├── supabase/               # Database schema and migrations
└── public/                 # Static assets
```

## 🗄️ Database Schema

The platform uses a comprehensive PostgreSQL schema with:

- **profiles**: User profile data
- **api_keys**: Encrypted API keys for AI providers
- **projects**: User projects with custom instructions
- **documents**: Uploaded documents for RAG
- **document_chunks**: Text chunks with vector embeddings
- **conversations**: Chat conversations
- **messages**: Individual chat messages
- **generated_images**: DALL-E generated images
- **n8n_webhooks**: Automation webhook configurations
- **decision_rooms**: Multi-model comparison sessions
- **usage_logs**: API usage and cost tracking

All tables have Row Level Security (RLS) enabled for multi-tenant isolation.

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Server-side authentication checks
- Encrypted API key storage
- Protected API routes
- CORS configuration
- Input validation

## 🎨 Customization (Coming Soon)

The platform will support white-label configuration:

- Custom logo and branding
- Color scheme customization
- Feature toggles
- Custom domain support
- Email template customization

## 📊 Roadmap

- [x] **Phase 1: Foundation & Authentication** ✅ COMPLETE
- [x] **Phase 2: Project Management** ✅ COMPLETE
- [x] **Phase 3: AI Chat Interface** ✅ COMPLETE
- [x] **Phase 4: API Key Management** ✅ COMPLETE
- [x] **Phase 5: RAG Document System** ✅ COMPLETE
- [x] **Phase 6: Image Generation (DALL-E)** ✅ COMPLETE
- [ ] Phase 7: n8n Webhook Integration
- [ ] Phase 8: MPC Decision Rooms
- [ ] Phase 9: Analytics Dashboard
- [ ] Phase 10: White-label Configuration
- [ ] Phase 11: Deployment Scripts & Docker

## 📈 Project Stats

- **Total Files**: 100+
- **Lines of Code**: 8,000+
- **Components**: 45+
- **API Routes**: 4
- **Database Tables**: 11 (all with RLS)
- **Features**: 6 major phases complete
- **Build Status**: ✅ Compiles successfully
- **GitHub**: https://github.com/IGTA-Tech/Claude-OpenAI-Co-Project-Tool

## 🤝 Contributing

This is a white-label platform designed to be customized and deployed by different organizations. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this for commercial projects

## 🔗 Links

- **GitHub Repository**: https://github.com/IGTA-Tech/Claude-OpenAI-Co-Project-Tool
- **Supabase**: https://supabase.com
- **Next.js**: https://nextjs.org
- **shadcn/ui**: https://ui.shadcn.com

## 🆘 Support

For issues and questions:
1. Check the `supabase/README.md` for database setup
2. Review environment variables in `.env.example`
3. Open an issue on GitHub

---

🤖 Built with Claude Code
