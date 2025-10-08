#!/usr/bin/env node

import { Ollama } from "ollama";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Initialize Ollama client (connects to local Ollama server)
const ollama = new Ollama({
  host: "http://localhost:11434", // Default Ollama port
});

// Choose your model
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b"; // or "qwen2.5:7b", "mistral", etc.

async function main() {
  console.log(`🚀 Starting MCP server...`);
  console.log(`🦙 Using Ollama model: ${MODEL}\n`);

  // Create MCP client and connect to the server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["system-info-server/index.js"],
  });

  const mcpClient = new Client(
    {
      name: "mcp-ollama-client",
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

  // Convert MCP tools to Ollama tool format (OpenAI-compatible)
  const ollamaTools = toolsResult.tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  // Conversation loop
  const conversationHistory = [];
  const userQuery =
    process.argv[2] ||
    "What's my system information? Include network details if possible.";

  console.log(`\n💬 User Query: "${userQuery}"\n`);

  // Add a system message to guide the model
  conversationHistory.push({
    role: "system",
    content:
      "You are a helpful assistant that uses tools to answer questions. When you need system information, use the get_system_info tool. Always call tools when needed before answering.",
  });

  conversationHistory.push({
    role: "user",
    content: userQuery,
  });

  // Make the initial request to Ollama
  console.log("🤔 Thinking...\n");
  let response = await ollama.chat({
    model: MODEL,
    messages: conversationHistory,
    tools: ollamaTools,
  });

  console.log("🦙 Llama's response:");
  console.log(
    `Tool calls: ${response.message.tool_calls ? response.message.tool_calls.length : 0}`
  );

  // Handle tool use loop
  let iterations = 0;
  const MAX_ITERATIONS = 5; // Prevent infinite loops

  while (response.message.tool_calls && iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`\n🔄 Tool use iteration ${iterations}`);

    // Add assistant's response to history
    conversationHistory.push(response.message);

    // Process each tool call
    const toolCalls = response.message.tool_calls;
    for (const toolCall of toolCalls) {
      console.log(`\n🔧 Tool called: ${toolCall.function.name}`);
      console.log(
        `Arguments: ${JSON.stringify(toolCall.function.arguments, null, 2)}`
      );

      try {
        // Call the tool via MCP
        const result = await mcpClient.callTool({
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        });

        console.log(`✅ Tool result received`);

        // Extract the text content from MCP result
        let resultText = "";
        if (result.content && Array.isArray(result.content)) {
          for (const content of result.content) {
            if (content.type === "text") {
              resultText += content.text;
            }
          }
        }

        // Add tool result to history
        // Note: Ollama expects the result in the message content
        conversationHistory.push({
          role: "tool",
          content: resultText,
        });
      } catch (error) {
        console.error(`❌ Tool execution failed:`, error.message);
        conversationHistory.push({
          role: "tool",
          content: `Error: ${error.message}`,
        });
      }
    }

    // Continue conversation with tool results
    console.log("\n🤔 Processing results...\n");
    response = await ollama.chat({
      model: MODEL,
      messages: conversationHistory,
      tools: ollamaTools,
    });

    console.log(`🦙 Llama's response:`);
    console.log(
      `Tool calls: ${response.message.tool_calls ? response.message.tool_calls.length : 0}`
    );
  }

  if (iterations >= MAX_ITERATIONS) {
    console.log(
      "\n⚠️  Reached maximum iterations. Stopping to prevent infinite loop."
    );
  }

  // Print final response
  console.log("\n📝 Final Answer:");
  console.log(response.message.content || "No response content");

  // Cleanup
  await mcpClient.close();
  console.log("\n👋 Done!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
