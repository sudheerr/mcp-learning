#!/usr/bin/env node

import { spawn } from "child_process";

// Start the MCP server
const server = spawn("node", ["index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let responseBuffer = "";

server.stdout.on("data", (data) => {
  responseBuffer += data.toString();

  // Try to parse JSON responses
  const lines = responseBuffer.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line.startsWith("{")) {
      try {
        const response = JSON.parse(line);
        console.log("\n📥 Response:", JSON.stringify(response, null, 2));
      } catch (e) {
        // Not valid JSON yet
      }
    }
  }
  responseBuffer = lines[lines.length - 1];
});

server.stderr.on("data", (data) => {
  console.log("ℹ️  Server:", data.toString().trim());
});

// Test sequence
async function runTests() {
  console.log("🧪 Testing System Info MCP Server\n");

  // 1. Initialize
  console.log("📤 Sending: initialize");
  server.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    }) + "\n"
  );

  await sleep(500);

  // 2. List tools
  console.log("\n📤 Sending: tools/list");
  server.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    }) + "\n"
  );

  await sleep(500);

  // 3. Call get_system_info without network
  console.log("\n📤 Sending: tools/call (get_system_info)");
  server.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_system_info",
        arguments: {
          includeNetwork: false,
        },
      },
    }) + "\n"
  );

  await sleep(1000);

  // 4. Call get_system_info with network
  console.log("\n📤 Sending: tools/call (get_system_info with network)");
  server.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_system_info",
        arguments: {
          includeNetwork: true,
        },
      },
    }) + "\n"
  );

  await sleep(1000);

  console.log("\n✅ Tests complete!");
  server.kill();
  process.exit(0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runTests().catch((error) => {
  console.error("❌ Test failed:", error);
  server.kill();
  process.exit(1);
});
