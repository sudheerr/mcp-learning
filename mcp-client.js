#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  // Start the MCP server as a subprocess
  console.log("🚀 Starting MCP server...");
  const serverProcess = spawn("node", ["system-info-server/index.js"], {
    stdio: ["pipe", "pipe", "inherit"], // stdin, stdout, stderr
  });

  // Create MCP client and connect to the server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["system-info-server/index.js"],
  });

  const mcpClient = new Client(
    {
      name: "mcp-claude-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  // Connect to the server
  await mcpClient.connect(transport);
  console.log("✅ Connected to MCP server");

  // List available tools from the MCP server
  const toolsResult = await mcpClient.listTools();
  console.log(
    "\n📋 Available tools:",
    JSON.stringify(toolsResult.tools, null, 2)
  );

  // Convert MCP tools to Anthropic tool format
  const anthropicTools = toolsResult.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));

  // Conversation loop
  const conversationHistory = [];
  const userQuery =
    process.argv[2] ||
    "What's my system information? Include network details if possible.";

  console.log(`\n💬 User Query: "${userQuery}"\n`);

  conversationHistory.push({
    role: "user",
    content: userQuery,
  });

  // Make the initial request to Claude
  let response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    tools: anthropicTools,
    messages: conversationHistory,
  });

  console.log("🤖 Claude's response:");
  console.log(`Stop reason: ${response.stop_reason}`);

  // Handle tool use loop
  while (response.stop_reason === "tool_use") {
    // Add assistant's response to history
    conversationHistory.push({
      role: "assistant",
      content: response.content,
    });

    // Process each tool use
    const toolResults = [];
    for (const content of response.content) {
      if (content.type === "tool_use") {
        console.log(`\n🔧 Tool called: ${content.name}`);
        console.log(`Arguments: ${JSON.stringify(content.input, null, 2)}`);

        // Call the tool via MCP
        const result = await mcpClient.callTool({
          name: content.name,
          arguments: content.input,
        });

        console.log(`✅ Tool result received`);

        toolResults.push({
          type: "tool_result",
          tool_use_id: content.id,
          content: result.content,
        });
      }
    }

    // Add tool results to history
    conversationHistory.push({
      role: "user",
      content: toolResults,
    });

    // Continue conversation with tool results
    response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      tools: anthropicTools,
      messages: conversationHistory,
    });

    console.log(`\n🤖 Claude's response:`);
    console.log(`Stop reason: ${response.stop_reason}`);
  }

  // Print final response
  console.log("\n📝 Final Answer:");
  for (const content of response.content) {
    if (content.type === "text") {
      console.log(content.text);
    }
  }

  // Cleanup
  await mcpClient.close();
  serverProcess.kill();
  console.log("\n👋 Done!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
