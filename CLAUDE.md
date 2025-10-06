# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript learning project for MCP (Model Context Protocol) development. The project uses:
- **@modelcontextprotocol/sdk**: Official MCP SDK for building context servers
- **@anthropic-ai/sdk**: Anthropic's SDK for Claude API integration

## Development Setup

### Running TypeScript Files

Since there's no build script configured, use `ts-node` to run TypeScript files directly:

```bash
npx ts-node path/to/file.ts
```

### TypeScript Configuration

The project uses strict TypeScript settings (tsconfig.json):
- Module system: `nodenext` (Node.js ESM)
- Target: `esnext`
- Strict mode enabled with additional safety checks:
  - `noUncheckedIndexedAccess`: true
  - `exactOptionalPropertyTypes`: true
- Generates source maps and declaration files

## Architecture Notes

### MCP Integration

When working with MCP servers:
- The MCP SDK provides tools for creating context servers that Claude can interact with
- Servers expose resources, prompts, and tools that can be called by Claude
- Use the stdio transport for local development (most common pattern)

### Anthropic SDK Usage

For Claude API integration:
- The SDK supports both streaming and non-streaming completions
- Message-based API with system prompts and user/assistant messages
- Supports tool use (function calling) for extended capabilities

## Common Patterns

### Building an MCP Server

MCP servers typically follow this structure:
1. Import `Server` from `@modelcontextprotocol/sdk/server/index.js`
2. Import transport (usually `StdioServerTransport`)
3. Define tools/resources/prompts
4. Start the server with the transport

### Using the Anthropic SDK

When integrating Claude:
1. Create client with API key
2. Call `messages.create()` with model and messages
3. Handle streaming responses if needed
4. Parse tool use blocks for function calling
