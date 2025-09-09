# Hybrid Stack Integration Examples

> **Using AI Stack + Supabase Together**
>
> This guide shows how to connect your AI services (n8n, Open WebUI, Qdrant) with Supabase for data persistence and user management.

## 🔗 Service Connection Map

### Internal Network Communication

When both stacks are running, they can communicate through `localhost`:

```
n8n Workflows ←→ Supabase API (localhost:54321)
   ↓                    ↓
Ollama LLMs       Supabase Database
   ↓                    ↓  
Qdrant Vectors    Supabase Storage
```

### Access URLs

- **n8n**: `http://localhost:5678`
- **Supabase Studio**: `http://localhost:54323`
- **Supabase API**: `http://localhost:54321`
- **Open WebUI**: `http://localhost:3000`
- **Qdrant**: `http://localhost:6333`

---

## 🔧 n8n + Supabase Integration

### Example 1: Store Chat Conversations

**Use Case**: Save AI conversations from n8n workflows to Supabase

**Setup Steps:**

1. **Create Database Table** (in Supabase Studio):
   ```sql
   CREATE TABLE chat_conversations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_message TEXT NOT NULL,
     ai_response TEXT NOT NULL,
     model_used TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **n8n HTTP Request Node Configuration**:
   ```json
   {
     "method": "POST",
     "url": "http://localhost:54321/rest/v1/chat_conversations",
     "headers": {
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "Content-Type": "application/json",
       "Prefer": "return=minimal"
     },
     "body": {
       "user_message": "{{ $json.user_input }}",
       "ai_response": "{{ $json.llm_response }}",
       "model_used": "llama3.2"
     }
   }
   ```

3. **Get API Keys**: From your startup output or `npx supabase status`

### Example 2: User-Specific RAG Collections

**Use Case**: Store different vector collections per user in Qdrant, with metadata in Supabase

**Database Schema**:
```sql
CREATE TABLE vector_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  collection_name TEXT NOT NULL,
  qdrant_collection_id TEXT NOT NULL,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**n8n Workflow Logic**:
1. Get user email from webhook
2. Check Supabase for existing collections
3. Create new Qdrant collection if needed
4. Update Supabase with collection metadata
5. Store vectors in Qdrant
6. Return collection ID to user

---

## 🌐 Open WebUI + Supabase Integration

### User Session Management

**Use Case**: Track user conversations in Open WebUI with Supabase backend

Since Open WebUI runs on `localhost:3000` and Supabase API on `localhost:54321`, you can:

1. **Custom Authentication**: Use Supabase Auth for Open WebUI users
2. **Chat History**: Store conversation history in Supabase
3. **User Preferences**: Save model preferences and settings
4. **Analytics**: Track usage patterns and popular models

### Connection Configuration

In Open WebUI settings, you can configure webhook endpoints to:
```
POST http://localhost:54321/rest/v1/chat_logs
```

With Supabase handling user authentication and data persistence.

---

## 📊 Qdrant + Supabase Integration

### Vector Metadata Management

**Use Case**: Store vector collection metadata and user access controls

**Benefits**:
- **User Collections**: Each user has their own document sets
- **Access Control**: Supabase RLS controls who can access which vectors
- **Search History**: Track what users search for
- **Document Metadata**: Store rich metadata beyond what Qdrant handles

**Example Schema**:
```sql
-- Document metadata
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  content_type TEXT,
  qdrant_vector_id TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "users_own_documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔐 Authentication Flow

### Shared Authentication Strategy

Since both stacks run independently, here's how to share authentication:

1. **Supabase as Auth Provider**:
   - Users sign up/in through Supabase Studio or API
   - Supabase provides JWT tokens

2. **n8n Workflow Authentication**:
   - Use Supabase JWT tokens in HTTP Request headers
   - Validate tokens against Supabase Auth

3. **API Integration**:
   ```javascript
   // In n8n Code node
   const token = $input.first().json.supabase_token;
   const response = await $http.request({
     method: 'GET',
     url: 'http://localhost:54321/rest/v1/user_data',
     headers: {
       'Authorization': `Bearer ${token}`,
       'apikey': 'your-anon-key'
     }
   });
   ```

---

## 🚀 Getting Started

### 1. Start Both Stacks
```bash
./start-full-stack.sh
```

### 2. Set Up Your First Integration

1. **Open Supabase Studio**: http://localhost:54323
2. **Create a test table** using the SQL examples above
3. **Open n8n**: http://localhost:5678
4. **Create a workflow** with HTTP Request to Supabase
5. **Test the connection**

### 3. Common Connection Pattern

Most integrations follow this pattern:
```
User Input → n8n Workflow → Ollama LLM → Store in Supabase → Return Response
             ↓
     Optional: Store in Qdrant for RAG
```

### 4. Example Workflow

1. **Webhook Trigger**: Receive user message
2. **Ollama Node**: Process with local LLM  
3. **HTTP Request**: Store conversation in Supabase
4. **Qdrant Node**: Store vectors for future RAG
5. **Return Response**: Send back to user

---

## 🛠️ Troubleshooting

### Connection Issues

**Problem**: n8n can't reach Supabase API
**Solution**: Ensure both services are running:
```bash
curl http://localhost:54321/rest/v1/  # Should return API info
curl http://localhost:5678            # Should return n8n interface
```

**Problem**: Authentication errors
**Solution**: Check your API keys:
```bash
npx supabase status  # Shows current API keys
```

### Data Not Appearing

**Problem**: Data sent to Supabase but not visible
**Solution**: 
1. Check Row Level Security policies
2. Use correct API key (anon vs service_role)
3. Verify table permissions

---

## 📚 Next Steps

1. **Build Your First Integration**: Try the chat conversation example
2. **Explore Advanced Features**: Custom authentication, real-time subscriptions
3. **Scale Your Setup**: Add more Supabase services as needed
4. **Monitor Usage**: Use Supabase analytics for insights

The hybrid approach gives you the reliability of proven tools (Supabase CLI) with the flexibility of containerized AI services. Both stacks can evolve independently while working together seamlessly!