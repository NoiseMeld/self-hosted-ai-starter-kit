# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Self-hosted AI Starter Kit** - a Docker Compose-based template for quickly setting up a local AI development environment. The kit combines n8n (workflow automation), Ollama (local LLM inference), Qdrant (vector database), and PostgreSQL in a pre-configured stack designed for learning and experimentation, not production use.

## Architecture

### Core Components

- **n8n**: Workflow automation platform (port 5678) - the main interface for building AI workflows
- **Ollama**: Local LLM inference server (port 11434) - runs language models locally
- **Qdrant**: Vector database (port 6333) - stores embeddings for RAG workflows  
- **PostgreSQL**: Primary database - stores n8n data and workflow definitions

### Docker Architecture

The setup uses Docker Compose with profiles for different hardware configurations:
- `cpu`: CPU-only inference (default for Mac without GPU access)
- `gpu-nvidia`: NVIDIA GPU acceleration
- `gpu-amd`: AMD GPU acceleration (Linux only)

Key architectural patterns:
- **YAML anchors** (`x-n8n`, `x-ollama`) define reusable service templates
- **Service dependencies** ensure proper startup order (postgres → n8n-import → n8n)
- **Shared volumes** enable data persistence and file access between containers
- **Auto-initialization** pulls llama3.2 model on first startup

### Data Flow

1. **n8n-import** service runs once to import demo credentials and workflows
2. **n8n** main service starts and connects to PostgreSQL for persistence
3. **ollama-pull-llama-*** services download the llama3.2 model based on profile
4. All services communicate through the `demo` Docker network

## Common Development Commands

### Initial Setup
```bash
cp .env.example .env  # Configure environment variables
```

### Running the Stack

**For Mac/Apple Silicon users:**
```bash
docker compose up
# Access n8n at http://localhost:5678
```

**For NVIDIA GPU users:**
```bash
docker compose --profile gpu-nvidia up
```

**For AMD GPU users (Linux):**
```bash
docker compose --profile gpu-amd up
```

**For CPU-only systems:**
```bash
docker compose --profile cpu up
```

### Upgrading Components

**For Mac users:**
```bash
docker compose pull
docker compose create && docker compose up
```

**For GPU setups:**
```bash
docker compose --profile gpu-nvidia pull  # or gpu-amd
docker compose create && docker compose --profile gpu-nvidia up
```

### Development Operations

**Stop all services:**
```bash
docker compose down
```

**View logs:**
```bash
docker compose logs -f [service-name]  # ollama, n8n, postgres, qdrant
```

**Reset all data:**
```bash
docker compose down -v  # Removes all volumes and data
```

## Key Configuration

### Environment Variables (.env)
- `POSTGRES_*`: Database credentials  
- `N8N_ENCRYPTION_KEY`: n8n data encryption
- `N8N_USER_MANAGEMENT_JWT_SECRET`: n8n authentication
- `OLLAMA_HOST`: Ollama connection (use `host.docker.internal:11434` for local Mac Ollama)

### Special Mac Configuration
If running Ollama locally on Mac instead of in Docker:
1. Set `OLLAMA_HOST=host.docker.internal:11434` in `.env`
2. Update n8n credentials at http://localhost:5678/home/credentials to use `http://host.docker.internal:11434/`

### File Access
The `./shared` directory is mounted to `/data/shared` inside the n8n container. Use this path in n8n nodes that need local file access (Read/Write Files, Local File Trigger, Execute Command).

## Project Structure

```
├── docker-compose.yml     # Main orchestration file with profiles
├── .env.example          # Environment template
├── n8n/demo-data/        # Pre-configured credentials and workflows
│   ├── credentials/      # Ollama and Qdrant connection configs
│   └── workflows/        # Sample AI workflow
├── shared/               # Created at runtime - mounted to n8n container
└── README.md            # Comprehensive setup documentation
```

## Development Workflow

This is a **starter kit** focused on simplicity over completeness. The philosophy is "learning-focused, not production-ready." Key principles:

1. **Everything runs locally** - no external dependencies by default
2. **Opinionated stack** - specific choices (n8n + Ollama + Qdrant + PostgreSQL) to reduce setup complexity  
3. **Quick start** - from clone to working AI workflows in minutes
4. **Extensible base** - users customize after learning the basics

When contributing:
- Keep changes focused and simple
- Maintain the "just works" experience
- Avoid production-grade complexity (load balancers, advanced security, etc.)
- Test across different hardware profiles

The included demo workflow demonstrates core AI capabilities and can be accessed at http://localhost:5678/workflow/srOnR8PAY3u4RSwb after setup.