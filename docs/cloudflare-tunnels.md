# Cloudflare Tunnels Guide

## Overview

Cloudflare Tunnels provide a secure way to expose your self-hosted AI services to the internet without port forwarding or exposing your home network directly. This guide explains how to set up tunnels for all services in this starter kit.

## Why Use Cloudflare Tunnels?

### The Traditional Problem
Normally, to expose a service to the internet, you need to:
1. **Port forward** on your router (security risk)
2. **Expose your home IP** (privacy risk) 
3. **Configure SSL certificates** manually
4. **Handle DDoS attacks** yourself
5. **No load balancing** or caching

### What Cloudflare Tunnels Provide Instead
1. **Outbound-only connection** - Your server connects TO Cloudflare (no inbound ports)
2. **Hide your real IP** - Cloudflare acts as a proxy shield
3. **Automatic HTTPS** - SSL certificates handled automatically
4. **DDoS protection** - Cloudflare's massive network filters attacks
5. **Global CDN** - Content cached worldwide for speed
6. **Zero Trust security** - Can add authentication layers

## How It Works Technically

```
Internet User → Cloudflare Edge → Encrypted Tunnel → Your Home Server
```

1. **User visits** `ai.yourdomain.com`
2. **Cloudflare receives** the request at their edge servers
3. **Encrypted tunnel** carries the request to your home server
4. **Your server responds** back through the tunnel
5. **Cloudflare delivers** the response to the user

**Your home network never accepts inbound connections!**

## Prerequisites

- Domain name (can be registered anywhere - Porkbun, Namecheap, etc.)
- Cloudflare account (free tier works)
- cloudflared binary installed or running in Docker

## Setup Process

### 1. Add Domain to Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Add a site"**
3. Enter your domain name
4. Choose **Free plan**
5. Cloudflare will scan existing DNS records

### 2. Update Nameservers

Change your domain's nameservers to Cloudflare's (provided during setup):
```
example-ns1.ns.cloudflare.com
example-ns2.ns.cloudflare.com
```

**Note**: This doesn't transfer domain ownership - your registrar still owns/renews the domain.

### 3. Install cloudflared

#### Option A: Native Installation
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

#### Option B: Docker Installation (Recommended)
See the Docker Compose section below for running cloudflared in a container.

### 4. Authenticate and Create Tunnel

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create ai-starter-kit

# This creates ~/.cloudflared/[tunnel-id].json with credentials
```

### 5. Configure Multiple Services

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: ai-starter-kit
credentials-file: ~/.cloudflared/[your-tunnel-id].json

ingress:
  # Open WebUI - ChatGPT-like interface
  - hostname: ai.yourdomain.com
    service: http://localhost:3000
  
  # n8n workflows - Low-code automation platform
  - hostname: workflows.yourdomain.com
    service: http://localhost:5678
  
  # Qdrant vector database - For RAG workflows
  - hostname: vectors.yourdomain.com
    service: http://localhost:6333
    
  # Direct Ollama API access - For developers
  - hostname: llm.yourdomain.com
    service: http://localhost:11434
  
  # Catch-all for unmatched requests
  - service: http_status:404
```

### 6. Create DNS Records

```bash
# Create DNS records for each service
cloudflared tunnel route dns ai-starter-kit ai.yourdomain.com
cloudflared tunnel route dns ai-starter-kit workflows.yourdomain.com
cloudflared tunnel route dns ai-starter-kit vectors.yourdomain.com
cloudflared tunnel route dns ai-starter-kit llm.yourdomain.com
```

### 7. Run the Tunnel

```bash
# Test run (foreground)
cloudflared tunnel run ai-starter-kit

# Install as system service (persistent)
cloudflared service install
sudo systemctl start cloudflared
```

## Service Mapping Reference

| Service | Local Port | Purpose | Suggested Subdomain |
|---------|------------|---------|-------------------|
| **Open WebUI** | 3000 | ChatGPT-like chat interface | `ai.yourdomain.com` |
| **n8n** | 5678 | Workflow automation platform | `workflows.yourdomain.com` |
| **Qdrant** | 6333 | Vector database for embeddings | `vectors.yourdomain.com` |
| **Ollama** | 11434 | Direct LLM API access | `llm.yourdomain.com` |

## Docker Integration

### Adding cloudflared to docker-compose.yml

```yaml
services:
  # ... your existing services ...

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
    restart: unless-stopped
    network_mode: "host"
    environment:
      - TUNNEL_TOKEN=your-tunnel-token-here
    depends_on:
      - open-webui
      - n8n
      - qdrant
```

### Getting Your Tunnel Token

```bash
# Generate a tunnel token for Docker use
cloudflared tunnel token ai-starter-kit
```

This generates a long token string you can use in the Docker environment variable.

## Advanced Security Features

### Add Authentication

Protect sensitive services with Cloudflare Access:

```yaml
ingress:
  # Protected workflow editor
  - hostname: workflows.yourdomain.com
    service: http://localhost:5678
    originRequest:
      access:
        required: true
        teamName: your-team-name
        
  # Public AI chat interface
  - hostname: ai.yourdomain.com
    service: http://localhost:3000
    # No access control - public
```

### Geographic Restrictions

```yaml
ingress:
  - hostname: admin.yourdomain.com
    service: http://localhost:5678
    originRequest:
      access:
        required: true
        rules:
          - allow:
            - country: US
            - country: CA
```

### Rate Limiting

Configure rate limiting in Cloudflare dashboard under Security → Rate Limiting.

## Troubleshooting

### Common Issues

1. **Tunnel not connecting**
   ```bash
   # Check tunnel status
   cloudflared tunnel info ai-starter-kit
   
   # View tunnel logs
   cloudflared tunnel run ai-starter-kit
   ```

2. **DNS not resolving**
   - Wait up to 48 hours for DNS propagation
   - Check nameservers are correctly set at your registrar
   - Verify DNS records in Cloudflare dashboard

3. **Service not accessible**
   - Ensure local service is running: `docker compose ps`
   - Check service is bound to correct port
   - Verify firewall isn't blocking localhost connections

### Useful Commands

```bash
# List all tunnels
cloudflared tunnel list

# Delete a tunnel
cloudflared tunnel delete ai-starter-kit

# Test connectivity
cloudflared tunnel ingress rule https://ai.yourdomain.com

# View tunnel metrics
cloudflared tunnel info ai-starter-kit
```

## Cost Considerations

- **Cloudflare Free Plan**: Includes tunnels, basic DDoS protection, SSL
- **Bandwidth**: Unlimited inbound, but consider your home internet upload limits
- **Domain Registration**: Keep paying your existing registrar (Porkbun, etc.)

## Security Best Practices

1. **Keep credentials secure**: Never commit tunnel credentials to version control
2. **Use authentication**: Enable Cloudflare Access for admin interfaces
3. **Monitor access**: Review Cloudflare Analytics for unusual traffic
4. **Regular updates**: Keep cloudflared binary updated
5. **Principle of least exposure**: Don't expose services you don't need publicly

## Real-World Example URLs

After setup, you'll have professional URLs like:
- `https://ai.coachmeld.app` - Chat with your local AI models
- `https://workflows.coachmeld.app` - Build AI workflows with n8n
- `https://vectors.coachmeld.app` - Qdrant vector database interface
- `https://llm.coachmeld.app` - Direct Ollama API for developers

All with automatic HTTPS, global CDN, and DDoS protection - completely bypassing your home network's security perimeter!