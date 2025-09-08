# 🚀 Quick Reference - Your AI Platform

## 🔗 Live Services
- **🤖 AI Chat:** https://ai.coachmeld.app
- **⚡ Workflows:** https://workflows.coachmeld.app  
- **📊 Vector DB:** https://vectors.coachmeld.app/dashboard
- **🔧 API:** https://llm.coachmeld.app

## ⚡ Quick Commands

### Start Everything
```bash
# Start local AI services
docker compose up -d

# Start Cloudflare tunnel  
cloudflared tunnel run coachmeld-ai
```

### Stop Everything
```bash  
# Stop tunnel (Ctrl+C if running in foreground)
pkill cloudflared

# Stop local services
docker compose down
```

### Check Status
```bash
# Local services
docker compose ps

# Tunnel status
cloudflared tunnel info coachmeld-ai

# Test connectivity
curl https://ai.coachmeld.app
```

## 🛠 Troubleshooting
- **Service not responding:** `docker compose restart [service-name]`
- **Tunnel disconnected:** `cloudflared tunnel run coachmeld-ai`
- **DNS issues:** Wait 10 minutes, check nslookup

## 📞 Important Info
- **Tunnel ID:** `c1bd9c4c-4f28-4593-b9e1-d83b1b6d27f2`
- **Config:** `~/.cloudflared/config.yml`
- **Credentials:** `~/.cloudflared/c1bd9c4c-4f28-4593-b9e1-d83b1b6d27f2.json`

**🌟 Your AI platform is live and globally accessible!**