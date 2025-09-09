# Supabase Integration Guide

## Overview

This guide explains how to integrate Supabase into your self-hosted AI starter kit, providing a complete backend-as-a-service (BaaS) solution with authentication, database management, real-time capabilities, and file storage.

## What You Get with Supabase Integration

### 🔐 **Authentication & User Management**
- Complete user registration and login system
- JWT-based authentication
- Social authentication providers (configurable)
- User roles and permissions
- Password reset and email verification

### 🗄️ **Database & API**
- PostgreSQL database with REST API
- Auto-generated API endpoints
- Real-time subscriptions
- Row Level Security (RLS)
- Database migrations and versioning

### 📁 **File Storage**
- S3-compatible file storage
- Image transformation
- Access control and policies
- CDN-ready content delivery

### 📊 **Admin Dashboard**
- Database visual editor
- User management interface
- API logs and analytics
- Real-time monitoring

---

## 🚀 Quick Start

### 1. Enable Supabase Services

Update your `.env` file with Supabase configuration:

```bash
# Required Supabase Configuration
SUPABASE_DB_PASSWORD=your-secure-db-password
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SECRET_KEY_BASE=your-secret-key-base-for-realtime
SUPABASE_LOGFLARE_API_KEY=your-logflare-api-key
```

### 2. Start with Supabase Profile

```bash
# Start AI stack with Supabase
docker compose --profile supabase up -d

# Or combine with other profiles
docker compose --profile cpu --profile supabase up -d
docker compose --profile gpu-nvidia --profile supabase --profile cloudflare up -d
```

### 3. Access Supabase Services

Once started, access these interfaces:

| Service | URL | Purpose |
|---------|-----|---------|
| **Supabase Studio** | http://localhost:3001 | Database management & admin dashboard |
| **Supabase API** | http://localhost:8000 | REST API and authentication |
| **Analytics** | http://localhost:4000 | Logs and real-time analytics |
| **Mailpit (Dev)** | http://localhost:54324 | Email testing interface |

---

## 🔧 Integration with AI Services

### n8n Workflow Integration

You can now use Supabase in your n8n workflows:

1. **Database Operations**: Use HTTP Request nodes to interact with Supabase REST API
2. **Authentication**: Authenticate users before AI workflow execution
3. **Data Storage**: Store AI-generated content and user data
4. **Real-time Updates**: Send real-time notifications via Supabase Realtime

Example n8n HTTP Request node configuration:
```json
{
  "method": "POST",
  "url": "http://supabase-kong:8000/rest/v1/ai_conversations",
  "headers": {
    "Authorization": "Bearer {{ $json.supabase_token }}",
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "body": {
    "user_id": "{{ $json.user_id }}",
    "conversation": "{{ $json.ai_response }}",
    "model_used": "llama3.2"
  }
}
```

### Open WebUI Authentication

Integrate Open WebUI with Supabase authentication:

1. Users authenticate through Supabase
2. JWT tokens validate access to Open WebUI
3. User sessions persist across AI interactions
4. Chat history stored in Supabase database

### Qdrant + Supabase

Store vector metadata and user context:

1. **Vector Metadata**: Store document metadata in Supabase
2. **User Collections**: Organize vectors by user with RLS
3. **Access Control**: Secure vector operations with Supabase Auth
4. **Analytics**: Track vector usage and performance

---

## 🛠️ Configuration Options

### Authentication Settings

```bash
# Disable public signups
SUPABASE_DISABLE_SIGNUP=true

# Set allowed redirect URLs
SUPABASE_AUTH_ALLOW_LIST=http://localhost:3000,https://ai.yourdomain.com

# Auto-confirm emails (development only)
SUPABASE_MAILER_AUTOCONFIRM=true
```

### Database Configuration

```bash
# Custom database schemas
SUPABASE_DB_SCHEMAS=public,ai_data,vector_metadata

# JWT expiry time (in seconds)
SUPABASE_JWT_EXPIRY=7200
```

### Email Configuration

For production, configure real SMTP:

```bash
SUPABASE_SMTP_HOST=smtp.gmail.com
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=your-email@gmail.com
SUPABASE_SMTP_PASS=your-app-password
SUPABASE_SMTP_ADMIN_EMAIL=admin@yourdomain.com
```

---

## 📋 Database Schema Examples

### AI Conversations Table

```sql
CREATE TABLE ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    conversation_title TEXT,
    messages JSONB NOT NULL,
    model_used TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);
```

### Vector Collections Table

```sql
CREATE TABLE vector_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    collection_name TEXT NOT NULL,
    description TEXT,
    qdrant_collection_id TEXT NOT NULL,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vector_collections ENABLE ROW LEVEL SECURITY;

-- Users can only access their own collections
CREATE POLICY "Users can manage own collections" ON vector_collections
    USING (auth.uid() = user_id);
```

---

## 🌐 Global Access with Cloudflare

When combined with Cloudflare Tunnels, you can expose Supabase services globally:

### Cloudflare Configuration

Add to your `~/.cloudflared/config.yml`:

```yaml
ingress:
  # Supabase Studio - Admin dashboard
  - hostname: admin.yourdomain.com
    service: http://localhost:3001
    
  # Supabase API - Public API
  - hostname: api.yourdomain.com
    service: http://localhost:8000
    
  # Your existing AI services
  - hostname: ai.yourdomain.com
    service: http://localhost:3000
    
  # Catch-all
  - service: http_status:404
```

### Environment Updates

Update your `.env` for global access:

```bash
SUPABASE_API_URL=https://api.yourdomain.com
SUPABASE_SITE_URL=https://ai.yourdomain.com
```

---

## 🔍 Monitoring & Analytics

### Real-time Analytics

Supabase provides built-in analytics at http://localhost:4000:

- API request logs
- Authentication events  
- Database performance metrics
- Real-time connection monitoring

### Custom Analytics

Create custom analytics tables:

```sql
CREATE TABLE ai_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    service_used TEXT NOT NULL, -- 'ollama', 'n8n', 'qdrant'
    operation TEXT NOT NULL,
    tokens_used INTEGER,
    execution_time INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚨 Security Considerations

### Row Level Security (RLS)

Always enable RLS on user data tables:

```sql
-- Enable RLS on all user tables
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY "policy_name" ON your_table
    FOR SELECT USING (auth.uid() = user_id);
```

### API Key Management

- Use `SUPABASE_ANON_KEY` for client-side operations
- Use `SUPABASE_SERVICE_ROLE_KEY` for admin operations only
- Never expose service role key to clients

### Network Security

- Supabase services communicate within Docker network
- Only Kong gateway is exposed externally
- All API requests go through authentication layer

---

## 🛠️ Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check service logs
docker compose logs -f supabase-db
docker compose logs -f supabase-kong

# Verify network connectivity
docker network inspect self-hosted-ai-starter-kit_demo
```

**Authentication not working:**
```bash
# Verify JWT secret consistency
grep SUPABASE_JWT_SECRET .env

# Check Kong configuration
docker compose exec supabase-kong kong config -c /etc/kong/kong.conf check
```

**Database connection issues:**
```bash
# Test database connection
docker compose exec supabase-db psql -U supabase_admin -d postgres -c "SELECT version();"
```

### Reset Everything

To completely reset Supabase data:

```bash
# Stop services
docker compose --profile supabase down

# Remove volumes (⚠️ destroys all data)
docker volume rm $(docker volume ls -q --filter name=supabase)

# Restart services
docker compose --profile supabase up -d
```

---

## 🎯 Next Steps

1. **Set up authentication** in your AI applications
2. **Create database schemas** for your specific use cases
3. **Configure real-time subscriptions** for collaborative features
4. **Implement file storage** for AI-generated content
5. **Set up monitoring** and analytics dashboards

For advanced configuration and production deployment, see the [Supabase documentation](https://supabase.com/docs).

---

*This integration transforms your AI starter kit into a full-stack platform with enterprise-grade backend capabilities while maintaining complete self-hosting control.*