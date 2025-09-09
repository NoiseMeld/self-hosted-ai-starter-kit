# 🚀 Quick Reference - Self-Hosted AI Starter Kit

## 🔗 Local Services
- **🤖 n8n Workflows:** http://localhost:5678
- **🤖 Open WebUI (AI Chat):** http://localhost:3000
- **📊 Qdrant Vector DB:** http://localhost:6333/dashboard
- **🔧 Ollama API:** http://localhost:11434
- **🗄️ Supabase Studio:** http://localhost:54323 (if running)
- **🔗 Supabase API:** http://localhost:54321 (if running)

## ⚡ Quick Commands

### Start Everything
```bash
# Start full stack (AI + Supabase)
bun start

# Start individual services
bun start:ai        # AI stack only
bun start:supabase  # Supabase only

# Start with GPU acceleration
bun start:gpu       # Auto-detect GPU
bun start:nvidia    # NVIDIA GPU
bun start:amd       # AMD GPU

# Start with global access
bun start:cloudflare
```

### Stop Everything
```bash
# Stop everything
bun stop

# Stop individual services
bun stop:ai         # AI stack only
bun stop:supabase   # Supabase only

# Force stop with cleanup
bun stop --force
```

### Monitor Services
```bash
# Check service status
bun status

# View service URLs
bun urls

# View logs
bun logs            # All services
bun logs:ai         # AI stack only
bun logs:supabase   # Supabase only
bun logs n8n -f     # Follow specific service
bun logs --since 1h # Last hour
```

## 🛠 Troubleshooting

### Service Issues
```bash
# Check status and health
bun status

# View specific service logs
bun logs [service-name]

# Restart services
bun stop && bun start
```

### Common Problems
- **Service not responding:** Check `bun status` and `bun logs [service]`
- **Port conflicts:** Ensure ports 5678, 3000, 6333, 11434 are available
- **Memory issues:** Ensure 8GB+ RAM available for local LLMs
- **GPU not detected:** Check `bun start:gpu` vs manual profile selection

### Manual Docker Commands (if needed)
```bash
# AI stack only
docker compose up -d
docker compose down

# View container status
docker compose ps

# Restart specific service
docker compose restart [service-name]
```

### Supabase CLI (if needed)
```bash
# Direct Supabase control
npx supabase start
npx supabase stop
npx supabase status
```

## 📞 File Locations
- **Environment:** `.env` (copy from `.env.example`)
- **Shared files:** `./shared/` (mounted to `/data/shared` in n8n)
- **Logs:** Use `bun logs [service]` instead of file access
- **Config:** `docker-compose.yml` and `package.json`

**🌟 Your self-hosted AI platform is ready for development!**