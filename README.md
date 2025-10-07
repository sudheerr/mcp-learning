# MCP Learning Project

A learning project demonstrating MCP (Model Context Protocol) integration with Claude AI.

## Components

### 1. System Info MCP Server (`system-info-server/`)
An MCP server that provides system information through a tool.

**Tool:** `get_system_info`
- Returns CPU, memory, and OS details
- Optional network interface information

### 2. MCP Client (`mcp-client.js`)
A client that connects Claude to the MCP server, enabling Claude to call tools.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

## Usage

### Running the MCP Client with Claude

```bash
node mcp-client.js
```

Or with a custom query:
```bash
node mcp-client.js "Tell me about my system's memory usage"
```

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
