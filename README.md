# Self-hosted AI starter kit

**Self-hosted AI Starter Kit** is an open-source Docker Compose template designed to swiftly initialize a comprehensive AI and low-code development environment that can run locally or be made globally accessible via secure Cloudflare Tunnels.

![n8n.io - Screenshot](https://raw.githubusercontent.com/n8n-io/self-hosted-ai-starter-kit/main/assets/n8n-demo.gif)

Curated by <https://github.com/n8n-io>, it combines the self-hosted n8n
platform with a curated list of compatible AI products and components to
quickly get started with building self-hosted AI workflows.

> [!TIP]
> [Read the announcement](https://blog.n8n.io/self-hosted-ai/)

### What's included

✅ [**Self-hosted n8n**](https://n8n.io/) - Low-code platform with over 400
integrations and advanced AI components

✅ [**Ollama**](https://ollama.com/) - Cross-platform LLM platform to install
and run the latest local LLMs

✅ [**Open WebUI**](https://openwebui.com/) - User-friendly web interface for interacting with local LLMs

✅ [**Qdrant**](https://qdrant.tech/) - Open-source, high performance vector
store with an comprehensive API

✅ [**PostgreSQL**](https://www.postgresql.org/) -  Workhorse of the Data
Engineering world, handles large amounts of data safely.

✅ [**Supabase**](https://supabase.com/) - Complete backend-as-a-service with authentication, real-time database, file storage, and admin dashboard (optional profile)

### What you can build

⭐️ **AI Agents** for scheduling appointments

⭐️ **Summarize Company PDFs** securely without data leaks

⭐️ **Smarter Slack Bots** for enhanced company communications and IT operations

⭐️ **Private Financial Document Analysis** at minimal cost

## 🌐 Access Options

### Local Development (Default)
- **n8n Workflows**: <http://localhost:5678/>
- **Open WebUI (AI Chat)**: <http://localhost:3000/> 
- **Qdrant Vector Database**: <http://localhost:6333/dashboard>
- **Ollama API**: <http://localhost:11434/>

### Backend Services (Optional - Supabase Profile)
- **Supabase Studio**: <http://localhost:3001> - Database admin & user management
- **Supabase API**: <http://localhost:8000> - REST API & authentication
- **Analytics Dashboard**: <http://localhost:4000> - Logs & real-time monitoring

### Global Access (Optional)
Transform your local setup into a globally accessible AI platform with [Cloudflare Tunnels](docs/cloudflare-tunnels.md):

- **Professional URLs** with automatic HTTPS
- **No port forwarding** or firewall changes needed  
- **Enterprise security** with DDoS protection
- **Authentication options** for sensitive services

Example setup with custom domain:
- 🤖 **AI Chat**: `https://ai.yourdomain.com`
- ⚡ **Workflows**: `https://workflows.yourdomain.com` (with authentication)
- 📊 **Vector DB**: `https://vectors.yourdomain.com/dashboard`
- 🔧 **API**: `https://llm.yourdomain.com` (protected)

See [Complete Setup Guide](docs/SETUP-COMPLETE.md) for real-world implementation example.

## 🔧 Prerequisites

Before starting, ensure you have:

### Required
- **Docker & Docker Compose**: Latest stable versions
  - [Install Docker Desktop](https://docs.docker.com/get-docker/) (Mac/Windows)
  - [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)
- **8GB+ RAM**: Recommended for local LLM inference
- **10GB+ free disk space**: For Docker images and model storage

### Optional (for Global Access)
- **Domain name**: From any registrar (Porkbun, Namecheap, etc.)
- **Cloudflare account**: Free tier is sufficient
- **Email address**: For n8n admin account and Cloudflare Access

### Hardware-Specific Requirements
- **NVIDIA GPU**: Install [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- **AMD GPU (Linux only)**: ROCm drivers and Docker support
- **Mac/Apple Silicon**: No additional requirements (CPU inference)

## Installation

### Cloning the Repository

```bash
git clone https://github.com/NoiseMeld/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
cp .env.example .env
```

### 🔧 Environment Configuration

Edit the `.env` file to configure your setup:

```bash
# Required: Update n8n admin account details
N8N_OWNER_EMAIL=your-email@example.com          # Your email for n8n admin account
N8N_OWNER_PASSWORD=YourSecurePassword123!       # Secure password (8+ chars, 1 number, 1 capital)

# Optional: For Mac users with local Ollama
# OLLAMA_HOST=host.docker.internal:11434

# Optional: For global access via Cloudflare Tunnels
# TUNNEL_TOKEN=your-tunnel-token-here
```

> [!IMPORTANT]
> **Required Setup**: You must update `N8N_OWNER_EMAIL` and `N8N_OWNER_PASSWORD` with your details. These create your admin account during first startup.

### Running n8n using Docker Compose

#### For Nvidia GPU users

```bash
git clone https://github.com/NoiseMeld/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
cp .env.example .env
docker compose --profile gpu-nvidia up
```

> [!NOTE]
> If you have not used your Nvidia GPU with Docker before, please follow the
> [Ollama Docker instructions](https://github.com/ollama/ollama/blob/main/docs/docker.md).

### For AMD GPU users on Linux

```bash
git clone https://github.com/NoiseMeld/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
cp .env.example .env
docker compose --profile gpu-amd up
```

#### For Mac / Apple Silicon users

If you’re using a Mac with an M1 or newer processor, you can't expose your GPU
to the Docker instance, unfortunately. There are two options in this case:

1. Run the starter kit fully on CPU, like in the section "For everyone else"
   below
2. Run Ollama on your Mac for faster inference, and connect to that from the
   n8n instance

If you want to run Ollama on your mac, check the
[Ollama homepage](https://ollama.com/)
for installation instructions, and run the starter kit as follows:

```bash
git clone https://github.com/NoiseMeld/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
cp .env.example .env
docker compose up
```

##### For Mac users running OLLAMA locally

If you're running OLLAMA locally on your Mac (not in Docker), you need to modify the OLLAMA_HOST environment variable

1. Set OLLAMA_HOST to `host.docker.internal:11434` in your .env file. 
2. Additionally, after you see "Editor is now accessible via: <http://localhost:5678/>":

    1. Head to <http://localhost:5678/home/credentials>
    2. Click on "Local Ollama service"
    3. Change the base URL to "http://host.docker.internal:11434/"

#### For everyone else

```bash
git clone https://github.com/NoiseMeld/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
cp .env.example .env
docker compose --profile cpu up
```

#### Adding Supabase Backend (Optional)

For a complete backend-as-a-service with authentication, real-time database, and file storage:

```bash
# Add Supabase configuration to your .env file
SUPABASE_DB_PASSWORD=your-secure-db-password
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SECRET_KEY_BASE=your-secret-key-base-for-realtime
SUPABASE_LOGFLARE_API_KEY=your-logflare-api-key

# Start with Supabase profile (any hardware configuration)
docker compose --profile cpu --profile supabase up
docker compose --profile gpu-nvidia --profile supabase up  # For NVIDIA users
docker compose --profile gpu-amd --profile supabase up     # For AMD users

# Or all services including Cloudflare tunnels
docker compose --profile cpu --profile supabase --profile cloudflare up
```

**Supabase Services:**
- 🗄️ **Database Admin**: http://localhost:3001 - Visual database management
- 🔐 **API & Auth**: http://localhost:8000 - REST API with authentication  
- 📊 **Analytics**: http://localhost:4000 - Real-time logs and monitoring

See the [Supabase Integration Guide](docs/supabase-integration.md) for detailed setup and usage.

## ⚡️ Quick start and usage

The core of the Self-hosted AI Starter Kit is a Docker Compose file, pre-configured with network and storage settings, minimizing the need for additional installations.

### Local Access (Default)

After completing the installation steps above, simply follow the steps below to get started.

1. **Set up n8n**: Open <http://localhost:5678/> in your browser to configure n8n. You'll create an owner account during first setup.
2. **Try the demo workflow**: Open the included workflow at <http://localhost:5678/workflow/srOnR8PAY3u4RSwb>
3. **Start chatting**: Click the **Chat** button at the bottom of the canvas to run the workflow.
4. **Wait for models**: If this is the first time, wait for Ollama to download Llama3.2 (check docker logs for progress).

**Available Interfaces:**
- **n8n Workflows**: <http://localhost:5678/> - Build AI automation workflows
- **Open WebUI (AI Chat)**: <http://localhost:3000/> - ChatGPT-like interface for your local LLMs
- **Qdrant Vector Database**: <http://localhost:6333/dashboard> - Vector database management
- **Ollama API**: <http://localhost:11434/> - Direct API access for developers

### Global Access (Optional)

Transform your local setup into a professionally accessible AI platform:

1. **Set up Cloudflare Tunnels** following our [step-by-step guide](docs/cloudflare-tunnels.md)
2. **Configure authentication** for sensitive services like workflow management and API access
3. **Access from anywhere** using your custom domain with enterprise-grade security

Example result: Your personal AI platform accessible at `ai.yourdomain.com`, `workflows.yourdomain.com`, etc.

With your n8n instance, you'll have access to over 400 integrations and a
suite of basic and advanced AI nodes such as
[AI Agent](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/),
[Text classifier](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.text-classifier/),
and [Information Extractor](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.information-extractor/)
nodes. To keep everything local, just remember to use the Ollama node for your
language model and Qdrant as your vector store.

> [!NOTE]
> This starter kit is designed to help you get started with self-hosted AI
> workflows. While it's not fully optimized for production environments, it
> combines robust components that work well together for proof-of-concept
> projects. You can customize it to meet your specific needs

## Managing the Docker Stack

### Starting the Services

#### Foreground Mode (Default)
Running in foreground mode shows live logs and is great for development:

```bash
# For CPU setups
docker compose --profile cpu up

# For Nvidia GPU setups  
docker compose --profile gpu-nvidia up

# For AMD GPU setups
docker compose --profile gpu-amd up

# For Mac / Apple Silicon users
docker compose up
```

**What you'll see:**
- Live logs from all services in your terminal
- Progress of model downloads and service initialization
- The terminal will stay occupied showing ongoing activity
- Use **Ctrl+C** to stop all services

#### Background Mode (Detached)
Running in background mode frees up your terminal:

```bash
# For CPU setups
docker compose --profile cpu up -d

# For Nvidia GPU setups
docker compose --profile gpu-nvidia up -d

# For AMD GPU setups  
docker compose --profile gpu-amd up -d

# For Mac / Apple Silicon users
docker compose up -d

# With Cloudflare Tunnels (add to any profile)
docker compose --profile cpu --profile cloudflare up -d
```

**Benefits of background mode:**
- Terminal is immediately available for other commands
- Services run in the background
- Use `docker compose logs -f` to view logs when needed

### Stopping the Services

#### Stop Running Services
```bash
# Stop services (keeps containers and data)
docker compose stop

# Stop and remove containers (keeps volumes and images)
docker compose down
```

#### Force Stop from Foreground Mode
If running in foreground mode, use **Ctrl+C** to stop all services gracefully.

### Viewing Logs and Status

#### Check Service Status
```bash
# View running containers
docker compose ps

# View all containers (including stopped)
docker compose ps -a
```

#### View Logs
```bash
# View all service logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs -f n8n
docker compose logs -f ollama-cpu
docker compose logs -f postgres
docker compose logs -f qdrant
docker compose logs -f open-webui
docker compose logs -f cloudflared
```

#### Monitor Resource Usage
```bash
# View container resource usage
docker stats
```

### Restarting Services

#### Restart All Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart n8n
```

#### Rebuild and Restart
```bash
# Pull latest images and restart
docker compose pull
docker compose up -d --force-recreate
```

### Common Scenarios

#### Development Workflow
```bash
# Start in foreground to see logs during development
docker compose --profile cpu up

# When done, stop with Ctrl+C
# Or open new terminal and run:
docker compose stop
```

#### Long-running Setup
```bash
# Start in background for long-running use
docker compose --profile cpu up -d

# Check status periodically
docker compose ps

# View logs when needed
docker compose logs -f

# Stop when done
docker compose down
```

#### Troubleshooting
```bash
# View logs to diagnose issues
docker compose logs -f

# Restart problematic service
docker compose restart [service-name]

# Complete restart
docker compose down && docker compose --profile cpu up -d
```

## Upgrading

* ### For Nvidia GPU setups:

```bash
docker compose --profile gpu-nvidia pull
docker compose create && docker compose --profile gpu-nvidia up
```

* ### For Mac / Apple Silicon users

```bash
docker compose pull
docker compose create && docker compose up
```

* ### For Non-GPU setups:

```bash
docker compose --profile cpu pull
docker compose create && docker compose --profile cpu up
```

## Cleanup

To completely remove the Docker stack and all related resources:

### For CPU setups:

```bash
# Remove containers, networks, and volumes
docker compose --profile cpu down -v

# Also remove all images (for complete cleanup)
docker compose --profile cpu down -v --rmi all
```

### For Nvidia GPU setups:

```bash
# Remove containers, networks, and volumes
docker compose --profile gpu-nvidia down -v

# Also remove all images (for complete cleanup)
docker compose --profile gpu-nvidia down -v --rmi all
```

### For AMD GPU setups:

```bash
# Remove containers, networks, and volumes
docker compose --profile gpu-amd down -v

# Also remove all images (for complete cleanup)
docker compose --profile gpu-amd down -v --rmi all
```

### For Mac / Apple Silicon users:

```bash
# Remove containers, networks, and volumes
docker compose down -v

# Also remove all images (for complete cleanup)
docker compose down -v --rmi all
```

### Additional cleanup (optional):

```bash
# Remove local n8n configuration data
rm -rf ~/.n8n

# Remove shared directory contents
rm -rf ./shared/*
```

> [!NOTE]
> The `-v` flag removes named volumes. The `--rmi all` flag removes all images used by services.
> Use `--rmi local` to only remove images that don't have a custom tag.

## 👓 Recommended reading

n8n is full of useful content for getting started quickly with its AI concepts
and nodes. If you run into an issue, go to [support](#support).

- [AI agents for developers: from theory to practice with n8n](https://blog.n8n.io/ai-agents/)
- [Tutorial: Build an AI workflow in n8n](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- [Langchain Concepts in n8n](https://docs.n8n.io/advanced-ai/langchain/langchain-n8n/)
- [Demonstration of key differences between agents and chains](https://docs.n8n.io/advanced-ai/examples/agent-chain-comparison/)
- [What are vector databases?](https://docs.n8n.io/advanced-ai/examples/understand-vector-databases/)

## 🎥 Video walkthrough

- [Installing and using Local AI for n8n](https://www.youtube.com/watch?v=xz_X2N-hPg0)

## 🛍️ More AI templates

For more AI workflow ideas, visit the [**official n8n AI template
gallery**](https://n8n.io/workflows/categories/ai/). From each workflow,
select the **Use workflow** button to automatically import the workflow into
your local n8n instance.

### Learn AI key concepts

- [AI Agent Chat](https://n8n.io/workflows/1954-ai-agent-chat/)
- [AI chat with any data source (using the n8n workflow too)](https://n8n.io/workflows/2026-ai-chat-with-any-data-source-using-the-n8n-workflow-tool/)
- [Chat with OpenAI Assistant (by adding a memory)](https://n8n.io/workflows/2098-chat-with-openai-assistant-by-adding-a-memory/)
- [Use an open-source LLM (via Hugging Face)](https://n8n.io/workflows/1980-use-an-open-source-llm-via-huggingface/)
- [Chat with PDF docs using AI (quoting sources)](https://n8n.io/workflows/2165-chat-with-pdf-docs-using-ai-quoting-sources/)
- [AI agent that can scrape webpages](https://n8n.io/workflows/2006-ai-agent-that-can-scrape-webpages/)

### Local AI templates

- [Tax Code Assistant](https://n8n.io/workflows/2341-build-a-tax-code-assistant-with-qdrant-mistralai-and-openai/)
- [Breakdown Documents into Study Notes with MistralAI and Qdrant](https://n8n.io/workflows/2339-breakdown-documents-into-study-notes-using-templating-mistralai-and-qdrant/)
- [Financial Documents Assistant using Qdrant and](https://n8n.io/workflows/2335-build-a-financial-documents-assistant-using-qdrant-and-mistralai/) [Mistral.ai](http://mistral.ai/)
- [Recipe Recommendations with Qdrant and Mistral](https://n8n.io/workflows/2333-recipe-recommendations-with-qdrant-and-mistral/)

## Tips & tricks

### 📚 Additional Documentation

This starter kit includes comprehensive documentation:
- [**Cloudflare Tunnels Guide**](docs/cloudflare-tunnels.md) - Complete setup for global access
- [**Supabase Integration Guide**](docs/supabase-integration.md) - Backend-as-a-service setup with authentication
- [**Setup Complete Guide**](docs/SETUP-COMPLETE.md) - Real-world implementation example
- [**Quick Reference**](QUICK-REFERENCE.md) - Commands and troubleshooting for daily use

### 🚨 Quick Troubleshooting

**Services won't start:**
```bash
# Check service status
docker compose ps

# View logs for specific service
docker compose logs -f [service-name]

# Restart problematic service
docker compose restart [service-name]
```

**n8n shows connection errors:**
- Verify `.env` file has correct `N8N_OWNER_EMAIL` and `N8N_OWNER_PASSWORD`
- Check if n8n container is running: `docker compose logs -f n8n`
- Reset n8n data: `docker compose down -v` (⚠️ removes all workflows)

**Open WebUI can't see models:**
- Ensure Ollama is running: `docker compose logs -f ollama-cpu`
- Check model download progress: Wait for first-time model download
- Restart Open WebUI: `docker compose restart open-webui`

**Cloudflare tunnels not working:**
- Verify `TUNNEL_TOKEN` is set in `.env` file
- Check tunnel status: `cloudflared tunnel info your-tunnel-name`
- Ensure local services are running before starting tunnel

For detailed troubleshooting, see [Complete Setup Guide](docs/SETUP-COMPLETE.md) and [Quick Reference](QUICK-REFERENCE.md).

### Accessing local files

The self-hosted AI starter kit will create a shared folder (by default,
located in the same directory) which is mounted to the n8n container and
allows n8n to access files on disk. This folder within the n8n container is
located at `/data/shared` -- this is the path you'll need to use in nodes that
interact with the local filesystem.

**Nodes that interact with the local filesystem**

- [Read/Write Files from Disk](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.filesreadwrite/)
- [Local File Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.localfiletrigger/)
- [Execute Command](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/)

### Accessing Open WebUI via subdomain

Open WebUI (AI Chat Interface) is accessible at `http://localhost:3000` by default. If you want to access it via your own subdomain (e.g., `ai.yourdomain.com`), you'll need to set up a reverse proxy on your server.

**Example nginx configuration for Open WebUI:**
```nginx
server {
    listen 80;
    server_name ai.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The WebSocket connection upgrade headers are important for real-time features in Open WebUI.

### 🌐 Global Access with Cloudflare Tunnels

Transform your local AI development environment into a globally accessible, professionally hosted AI platform without complex networking or security setup.

**Why Cloudflare Tunnels?**
- ✅ **Zero Port Forwarding** - No firewall or router configuration needed
- ✅ **Automatic HTTPS** - SSL certificates and security handled automatically  
- ✅ **Enterprise Security** - DDoS protection and threat filtering included
- ✅ **Global Performance** - CDN acceleration worldwide
- ✅ **Professional URLs** - Custom domains like `ai.yourdomain.com`
- ✅ **Authentication Options** - Protect sensitive services with email/SSO

**Quick Setup:**
1. **Follow our guide**: Complete step-by-step instructions in [docs/cloudflare-tunnels.md](docs/cloudflare-tunnels.md)
2. **Get tunnel token**: `cloudflared tunnel token your-tunnel-name`
3. **Add to environment**: Set `TUNNEL_TOKEN=your-token-here` in `.env`
4. **Deploy globally**: `docker compose --profile cloudflare up -d`

**Real-world Example:**
See [Complete Setup Guide](docs/SETUP-COMPLETE.md) for a documented implementation showing how we deployed:
- 🤖 **AI Chat**: https://ai.coachmeld.app (Public)
- ⚡ **Workflows**: https://workflows.coachmeld.app (Authenticated)
- 📊 **Vector DB**: https://vectors.coachmeld.app/dashboard (Public)
- 🔧 **API Access**: https://llm.coachmeld.app (Protected)

**Security Features:**
- n8n workflow platform with user authentication
- Ollama API protected with Cloudflare Access
- Configurable access controls per service
- Geographic restrictions and rate limiting options

This transforms your local development setup into an enterprise-grade AI platform accessible from anywhere, while maintaining complete control over your data and models.

## 📜 License

This project is licensed under the Apache License 2.0 - see the
[LICENSE](LICENSE) file for details.

## 💬 Support

Join the conversation in the [n8n Forum](https://community.n8n.io/), where you
can:

- **Share Your Work**: Show off what you’ve built with n8n and inspire others
  in the community.
- **Ask Questions**: Whether you’re just getting started or you’re a seasoned
  pro, the community and our team are ready to support with any challenges.
- **Propose Ideas**: Have an idea for a feature or improvement? Let us know!
  We’re always eager to hear what you’d like to see next.
