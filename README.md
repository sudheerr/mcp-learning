# MCP Learning Project

A learning project demonstrating MCP (Model Context Protocol) integration with multiple AI providers.

## Components

### 1. System Info MCP Server (`system-info-server/`)
An MCP server that provides system information through a tool.

**Tool:** `get_system_info`
- Returns CPU, memory, and OS details
- Optional network interface information

### 2. MCP Clients (Multiple Options!)

**`mcp-client.js`** - Claude (Anthropic)
- Cloud-based, high quality responses
- Requires ANTHROPIC_API_KEY

**`mcp-client-openai.js`** - ChatGPT (OpenAI)
- Cloud-based, fast and affordable
- Requires OPENAI_API_KEY

**`mcp-client-ollama.js`** - Local LLM (Ollama)
- 100% local and private
- Free, works offline
- Requires Ollama running locally

## Setup

1. Install dependencies:
```bash
npm install
```

2. Choose your AI provider and set up:

**For Claude (Anthropic):**
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

**For ChatGPT (OpenAI):**
```bash
export OPENAI_API_KEY='sk-your-api-key-here'
```

**For Local Ollama:**
```bash
# Install Ollama: https://ollama.com
ollama serve                    # Start Ollama
ollama pull llama3.2:3b         # Download a model
```

## Usage

### Option 1: Claude (Cloud)
```bash
node mcp-client.js
node mcp-client.js "Tell me about my system's memory usage"
```

### Option 2: ChatGPT (Cloud)
```bash
node mcp-client-openai.js
node mcp-client-openai.js "What's my CPU model?"
```

### Option 3: Local Ollama (Free & Private)
```bash
node mcp-client-ollama.js
node mcp-client-ollama.js "Use the get_system_info tool to check my RAM"
```

**Tip for Ollama:** Be explicit about using tools for best results!

### Testing the MCP Server Directly

```bash
cd system-info-server
node test.js
```

## How It Works

1. **MCP Client** starts and spawns the **MCP Server** as a subprocess
2. Client connects to Claude API with available tools from the server
3. User sends a query to Claude
4. Claude decides if it needs to call any tools
5. If yes, client forwards tool calls to the MCP server
6. Server executes tools and returns results
7. Results are sent back to Claude
8. Claude formulates a natural language response

## Architecture

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│   MCP Client        │
│  (mcp-client.js)    │
└──────┬──────────────┘
       │
       ├──────────────────┐
       │                  │
       v                  v
┌──────────────┐   ┌─────────────────┐
│  Claude API  │   │  MCP Server     │
│  (Anthropic) │   │  (system-info)  │
└──────────────┘   └─────────────────┘
```

## Learning Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
