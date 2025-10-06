# System Info MCP Server

An MCP (Model Context Protocol) server that provides system information tools for Claude and other MCP clients.

## Features

The server exposes a `get_system_info` tool that returns:
- **OS Information**: Platform, type, release, architecture, hostname, uptime
- **CPU Information**: Model, number of cores, speed
- **Memory Information**: Total, free, used memory with usage percentage
- **Network Information** (optional): Network interfaces and their addresses

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
# or
node index.js
```

The server runs on stdio and communicates using the MCP protocol.

## Testing

Run the included test script to verify the server works:

```bash
node test.js
```

## Using with Claude Desktop

Add this server to your Claude Desktop configuration:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "system-info": {
      "command": "node",
      "args": ["/absolute/path/to/system-info-server/index.js"]
    }
  }
}
```

## Tool Usage

### get_system_info

Get comprehensive system information.

**Parameters:**
- `includeNetwork` (boolean, optional): Include network interface information (default: false)

**Example request:**
```json
{
  "name": "get_system_info",
  "arguments": {
    "includeNetwork": true
  }
}
```

**Example response:**
```json
{
  "os": {
    "platform": "linux",
    "type": "Linux",
    "release": "5.15.153.1-microsoft-standard-WSL2",
    "architecture": "x64",
    "hostname": "hostname",
    "uptime": "0d 0h 6m"
  },
  "cpu": {
    "model": "13th Gen Intel(R) Core(TM) i7-1360P",
    "cores": 16,
    "speed": "2995 MHz"
  },
  "memory": {
    "total": "7.61 GB (7790.34 MB)",
    "free": "6.69 GB (6855.16 MB)",
    "used": "0.91 GB (935.18 MB)",
    "usagePercentage": "12.00%"
  }
}
```
