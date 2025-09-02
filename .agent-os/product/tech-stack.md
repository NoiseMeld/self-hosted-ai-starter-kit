# Technical Stack

> Last Updated: 2025-09-02
> Version: 1.0.0

## Container Orchestration
- **Platform:** Docker Compose
- **Version:** Latest stable
- **Configuration:** Multi-profile setup (cpu, gpu-nvidia, gpu-amd)
- **Networking:** Custom bridge network ('demo')

## Workflow Automation Platform
- **Framework:** n8n
- **Version:** Latest stable
- **Port:** 5678
- **Features:** Community packages enabled, credential management, workflow persistence
- **Database:** PostgreSQL for data storage

## Language Model Inference
- **System:** Ollama
- **Version:** Latest stable  
- **Port:** 11434
- **Models:** llama3.2 (auto-downloaded)
- **Hardware Support:** CPU, NVIDIA GPU, AMD GPU acceleration

## Vector Database
- **System:** Qdrant
- **Version:** Latest stable
- **Port:** 6333
- **Purpose:** Embeddings storage for RAG workflows
- **Configuration:** Default settings optimized for development

## Primary Database
- **System:** PostgreSQL
- **Version:** 16
- **Purpose:** n8n workflow and user data persistence
- **Configuration:** Docker volume for data persistence

## Development Environment
- **Containerization:** Docker
- **Orchestration:** Docker Compose with profiles
- **File Sharing:** Bind mounts between host and containers
- **Initialization:** Automated credential and workflow import

## Networking
- **Container Network:** Custom bridge network 'demo'
- **External Access:** Host port mapping for web interfaces
- **Inter-service Communication:** Container name resolution

## Storage & Persistence
- **Volumes:** Docker named volumes for database persistence
- **Shared Files:** Host directory mounted to containers
- **Configuration:** Environment-based configuration with .env template

## Hardware Profiles
- **CPU Profile:** Default configuration for systems without GPU
- **NVIDIA GPU Profile:** CUDA-enabled containers for GPU acceleration  
- **AMD GPU Profile:** ROCm-enabled containers for AMD GPU support (Linux only)

## Environment Configuration
- **Configuration Method:** Environment variables via .env file
- **Template:** .env.example provided with sensible defaults
- **Secrets Management:** Local environment variables, not production-ready

## Planned Additions
- **Supabase:** Self-hosted backend-as-a-service integration
- **Additional AI Tools:** TBD based on community feedback