# 🚀 Complete Setup Guide - Self-Hosted AI with Cloudflare Tunnels

## Overview

This guide documents the complete setup process for exposing your self-hosted AI starter kit to the internet using Cloudflare Tunnels, including the specific configuration used for `coachmeld.app`.

---

## 🌟 What You've Accomplished

You've successfully created a **globally accessible AI platform** from your home server with:

- ✅ **Professional URLs** with automatic HTTPS
- ✅ **Enterprise-grade security** and DDoS protection  
- ✅ **Global CDN performance** via Cloudflare's network
- ✅ **Zero port forwarding** - your home network stays private
- ✅ **Four AI services** accessible from anywhere

---

## 🔗 Your Live AI Services

| Service | URL | Purpose | Security |
|---------|-----|---------|----------|
| **AI Chat** | https://ai.coachmeld.app | ChatGPT-like interface for your local LLMs | 🌐 Public access |
| **Workflows** | https://workflows.coachmeld.app | n8n low-code automation platform | 🔒 User authentication |
| **Vector DB** | https://vectors.coachmeld.app/dashboard | Qdrant vector database dashboard | 🌐 Public access (dashboard) |
| **API Access** | https://llm.coachmeld.app | Direct Ollama API for developers | 🔒 Cloudflare Access |

---

## 📋 Complete Setup Process

### Phase 1: Local AI Stack Setup

1. **Clone and setup the self-hosted AI starter kit**
2. **Add Open WebUI service to docker-compose.yml**
3. **Start the stack:** `docker compose up -d`
4. **Verify local access:**
   - Open WebUI: http://localhost:3000
   - n8n: http://localhost:5678
   - Qdrant: http://localhost:6333/dashboard
   - Ollama API: http://localhost:11434

### Phase 2: Domain and Cloudflare Setup

1. **Add domain to Cloudflare:**
   - Go to dash.cloudflare.com
   - Add `coachmeld.app`
   - Choose Free plan
   - Verify DNS records import

2. **Update nameservers on Porkbun:**
   - Change from Porkbun nameservers to:
     - `alexis.ns.cloudflare.com`
     - `tori.ns.cloudflare.com`
   - Wait for DNS propagation (5 minutes - 48 hours)

### Phase 3: Tunnel Configuration

1. **Install cloudflared:**
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```
   - Complete browser authentication
   - Certificate saved to `~/.cloudflared/cert.pem`

3. **Create tunnel:**
   ```bash
   cloudflared tunnel create coachmeld-ai
   ```
   - Tunnel ID: `c1bd9c4c-4f28-4593-b9e1-d83b1b6d27f2`
   - Credentials: `~/.cloudflared/c1bd9c4c-4f28-4593-b9e1-d83b1b6d27f2.json`

4. **Create configuration file:** `~/.cloudflared/config.yml`
   ```yaml
   tunnel: coachmeld-ai
   credentials-file: /Users/michaelbenson/.cloudflared/c1bd9c4c-4f28-4593-b9e1-d83b1b6d27f2.json

   ingress:
     # Open WebUI - ChatGPT-like interface for your AI models
     - hostname: ai.coachmeld.app
       service: http://localhost:3000
     
     # n8n workflows - Low-code automation platform  
     - hostname: workflows.coachmeld.app
       service: http://localhost:5678
     
     # Qdrant vector database - For RAG workflows
     - hostname: vectors.coachmeld.app
       service: http://localhost:6333
       
     # Direct Ollama API access - For developers
     - hostname: llm.coachmeld.app
       service: http://localhost:11434
     
     # Catch-all for unmatched requests
     - service: http_status:404
   ```

5. **Create DNS records:**
   ```bash
   cloudflared tunnel route dns coachmeld-ai ai.coachmeld.app
   cloudflared tunnel route dns coachmeld-ai workflows.coachmeld.app  
   cloudflared tunnel route dns coachmeld-ai vectors.coachmeld.app
   cloudflared tunnel route dns coachmeld-ai llm.coachmeld.app
   ```

6. **Start the tunnel:**
   ```bash
   cloudflared tunnel run coachmeld-ai
   ```

---

## 🎯 Service Usage Guide

### 🤖 AI Chat Interface (ai.coachmeld.app)
- **Purpose:** ChatGPT-like interface for your local AI models
- **Models Available:**
  - llama3.2:latest (3.2B parameters)
  - qwen2.5:7b (7.6B parameters)  
  - nomic-embed-text:latest (embeddings)
- **Usage:** Select a model and start chatting
- **Mobile Friendly:** Yes, works great on phones

### ⚡ Workflow Builder (workflows.coachmeld.app)  
- **Purpose:** n8n low-code automation platform
- **Features:** 400+ integrations, AI nodes, scheduling
- **Demo Workflow:** Available at startup
- **Authentication:** None currently (consider adding Cloudflare Access)

### 📊 Vector Database (vectors.coachmeld.app/dashboard)
- **Purpose:** Qdrant vector database for RAG workflows
- **Dashboard:** Must use `/dashboard` path for web interface
- **API Access:** Available at root URL for developers
- **Usage:** Store and query embeddings for AI workflows

### 🔧 API Access (llm.coachmeld.app)
- **Purpose:** Direct Ollama API for developers
- **Response:** JSON API responses, not a web interface
- **Usage Examples:**
  ```bash
  # List available models
  curl https://llm.coachmeld.app/api/tags
  
  # Chat with a model
  curl https://llm.coachmeld.app/api/generate \\
    -H "Content-Type: application/json" \\
    -d '{"model": "llama3.2", "prompt": "Why is the sky blue?"}'
  ```

---

## 🛠 Managing Your Setup

### Starting/Stopping the Tunnel
```bash
# Start tunnel (foreground)
cloudflared tunnel run coachmeld-ai

# Start tunnel (background)  
cloudflared tunnel run coachmeld-ai &

# Install as system service
cloudflared service install

# Check tunnel status
cloudflared tunnel info coachmeld-ai
```

### Managing Local Services
```bash
# Start AI stack
docker compose up -d

# Stop AI stack  
docker compose down

# View logs
docker compose logs -f open-webui
docker compose logs -f ollama-cpu

# Restart specific service
docker compose restart open-webui
```

### Troubleshooting
```bash
# Check tunnel connectivity
cloudflared tunnel ingress rule https://ai.coachmeld.app

# Test local services
curl http://localhost:3000  # Open WebUI
curl http://localhost:5678  # n8n
curl http://localhost:6333/dashboard  # Qdrant
curl http://localhost:11434/api/tags   # Ollama

# Check DNS propagation
nslookup ai.coachmeld.app
```

---

## 🔐 Security Considerations

### Current Setup
- ✅ **HTTPS Everywhere** - Automatic SSL certificates
- ✅ **DDoS Protection** - Cloudflare's enterprise-grade filtering
- ✅ **Network Isolation** - No direct access to home network
- ✅ **n8n Authentication** - Protected with user management and login
- ✅ **API Protection** - Ollama API secured with Cloudflare Access email authentication
- ⚠️ **Some Services Public** - Open WebUI and Qdrant dashboard remain publicly accessible

### Implemented Security Features

1. **n8n User Management** - ✅ Configured
   - Owner account with email authentication
   - User management enabled with JWT secrets
   - Login required for workflow access

2. **Cloudflare Access for API** - ✅ Configured
   ```yaml
   # Implemented in config.yml for Ollama API:
   - hostname: llm.coachmeld.app
     service: http://localhost:11434
     originRequest:
       access:
         required: true
         teamName: coachmeld
   ```

### Additional Security Enhancements

1. **Geographic Restrictions:**
   - Use Cloudflare dashboard to restrict access by country
   - Consider IP allowlists for admin interfaces

2. **Rate Limiting:**
   - Configure rate limiting in Cloudflare dashboard
   - Protect against abuse of AI endpoints

---

## 📊 Performance & Monitoring

### What You Get from Cloudflare
- **Global CDN** - Content cached worldwide
- **Analytics** - Traffic and performance metrics  
- **Uptime Monitoring** - Automatic health checks
- **Load Balancing** - Traffic distributed across edge servers

### Monitoring Your Services
```bash
# Check resource usage
docker stats

# Monitor tunnel connections  
cloudflared tunnel info coachmeld-ai

# View Cloudflare analytics
# Visit dash.cloudflare.com → Analytics
```

---

## 🚀 Next Steps & Extensions

### Immediate Improvements
1. **Add Authentication** - Protect sensitive services
2. **Custom Error Pages** - Better user experience  
3. **Monitoring Alerts** - Get notified of issues

### Advanced Features  
1. **Multiple Environments** - Staging vs Production tunnels
2. **Load Balancing** - Multiple backend servers
3. **Custom Headers** - Enhanced security policies

### Scaling Options
1. **More AI Models** - Add additional Ollama models
2. **Dedicated Hardware** - GPU acceleration setup  
3. **Backup Strategies** - Data protection and recovery

---

## 🎉 Conclusion

You've successfully transformed a local AI development environment into a **professionally accessible, globally distributed AI platform**. This setup provides:

- **Enterprise-grade infrastructure** without enterprise costs
- **Complete control** over your AI models and data
- **Professional presentation** with custom domains  
- **Scalable architecture** that can grow with your needs

The combination of Docker containerization, self-hosted AI services, and Cloudflare Tunnels creates a powerful platform that rivals cloud-based AI services while maintaining complete privacy and control.

**Your AI platform is now live and ready for the world! 🌍✨**

---

*This setup was completed on September 8, 2025, for the coachmeld.app domain using the self-hosted AI starter kit with Open WebUI, n8n, Ollama, and Qdrant.*