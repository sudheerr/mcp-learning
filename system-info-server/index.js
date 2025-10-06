#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import os from "os";

// Create server instance
const server = new Server(
  {
    name: "system-info-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_system_info",
        description: "Get comprehensive system information including CPU, memory, and OS details",
        inputSchema: {
          type: "object",
          properties: {
            includeNetwork: {
              type: "boolean",
              description: "Include network interface information",
              default: false,
            },
          },
        },
      },
    ],
  };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_system_info") {
    const includeNetwork = request.params.arguments?.includeNetwork || false;

    // Gather system information
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const systemInfo = {
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch(),
        hostname: os.hostname(),
        uptime: formatUptime(os.uptime()),
      },
      cpu: {
        model: cpus[0]?.model || "Unknown",
        cores: cpus.length,
        speed: `${cpus[0]?.speed || 0} MHz`,
      },
      memory: {
        total: formatBytes(totalMemory),
        free: formatBytes(freeMemory),
        used: formatBytes(usedMemory),
        usagePercentage: ((usedMemory / totalMemory) * 100).toFixed(2) + "%",
      },
    };

    // Optionally include network interfaces
    if (includeNetwork) {
      const networkInterfaces = os.networkInterfaces();
      systemInfo.network = Object.entries(networkInterfaces).reduce(
        (acc, [name, interfaces]) => {
          acc[name] = interfaces?.map((iface) => ({
            address: iface.address,
            family: iface.family,
            internal: iface.internal,
          }));
          return acc;
        },
        {}
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(systemInfo, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Helper function to format bytes
function formatBytes(bytes) {
  const gb = (bytes / 1024 / 1024 / 1024).toFixed(2);
  const mb = (bytes / 1024 / 1024).toFixed(2);
  return `${gb} GB (${mb} MB)`;
}

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("System Info MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
