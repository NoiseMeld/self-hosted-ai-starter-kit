# Product Mission

> Last Updated: 2025-09-02
> Version: 1.0.0

## Pitch

Self-hosted AI Starter Kit is a Docker-based development environment that helps AI enthusiasts, developers, and learners quickly set up a complete local AI workflow stack by providing pre-configured containers for n8n, Ollama, Qdrant, and PostgreSQL.

## Users

### Primary Customers

- **AI Enthusiasts**: Individuals wanting to experiment with open source AI tools locally
- **Developers**: Software developers learning AI workflow development and automation
- **Students and Educators**: Those teaching or learning AI concepts with hands-on experience
- **Privacy-focused Users**: Users who prefer local AI processing over cloud services

### User Personas

**AI Workflow Developer** (25-45 years old)
- **Role:** Software Developer/Engineer
- **Context:** Building AI applications and want to prototype locally before cloud deployment
- **Pain Points:** Complex setup of AI toolchains, dependency conflicts, inconsistent environments
- **Goals:** Rapid prototyping, learning AI patterns, building RAG workflows

**AI Learning Enthusiast** (20-50 years old)
- **Role:** Student, Hobbyist, or Career Changer
- **Context:** Learning AI development through hands-on experimentation
- **Pain Points:** Overwhelming setup complexity, lack of integrated examples, fragmented tutorials
- **Goals:** Understanding AI workflows, building personal projects, skill development

**Privacy-conscious Developer** (30-50 years old)
- **Role:** Senior Developer/Architect
- **Context:** Building AI features while maintaining data privacy and control
- **Pain Points:** Cloud dependency, data privacy concerns, vendor lock-in
- **Goals:** Local development, data sovereignty, cost control

## The Problem

### Complex AI Toolchain Setup

Setting up a complete AI development environment requires configuring multiple tools (LLM servers, vector databases, workflow engines) with complex dependencies and integration challenges. This creates significant barriers to entry for AI experimentation.

**Our Solution:** Pre-configured Docker Compose stack that launches a complete AI environment in minutes.

### Fragmented Learning Resources

AI tutorials and examples are scattered across different platforms and tools, making it difficult to understand how components work together in real workflows.

**Our Solution:** Integrated demo workflows that demonstrate real AI patterns using the included toolchain.

### Cloud Dependency for AI Development

Most AI development requires expensive cloud services or complex API integrations, limiting experimentation and creating privacy concerns.

**Our Solution:** Complete local AI stack with open source models that runs entirely on user hardware.

## Differentiators

### One-Command Setup

Unlike other AI development environments that require manual installation and configuration of multiple tools, we provide a single Docker Compose command that launches a complete, integrated AI workflow environment.

### Hardware-Optimized Profiles

Unlike generic Docker setups, we provide specific profiles for different hardware configurations (CPU-only, NVIDIA GPU, AMD GPU) ensuring optimal performance across diverse development machines.

### Pre-configured Integration

Unlike separate tool installations, our components are pre-configured to work together with demo credentials, sample workflows, and shared file access, eliminating integration complexity.

## Key Features

### Core Features

- **Docker Compose Orchestration:** Single-command deployment with hardware-specific profiles for CPU, NVIDIA GPU, and AMD GPU configurations
- **n8n Workflow Platform:** Pre-configured workflow automation with community packages enabled and demo workflows included
- **Ollama LLM Server:** Local language model inference with automatic llama3.2 model download and GPU acceleration support
- **Qdrant Vector Database:** Ready-to-use vector storage for embeddings and RAG (Retrieval-Augmented Generation) workflows
- **PostgreSQL Database:** Persistent storage for n8n workflows and user data with automatic initialization

### Integration Features

- **Shared File System:** Mounted volumes enabling file access between containers for data processing workflows
- **Auto-initialization:** Automatic setup of demo credentials, sample workflows, and model downloads on first run
- **Health Checks:** Built-in service monitoring and dependency management ensuring reliable startup order
- **Environment Configuration:** Template-based configuration with sensible defaults for immediate use