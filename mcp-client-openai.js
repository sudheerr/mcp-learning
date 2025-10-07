#!/usr/bin/env node

import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log("🚀 Starting MCP server...");

  // Create MCP client and connect to the server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["system-info-server/index.js"],
  });

  const mcpClient = new Client(
    {
      name: "mcp-openai-client",
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

  // Convert MCP tools to OpenAI tool format
  const openaiTools = toolsResult.tools.map((tool) => ({
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

  conversationHistory.push({
    role: "user",
    content: userQuery,
  });

  // Make the initial request to ChatGPT
  let response = await openai.chat.completions.create({
    model: "gpt-4o", // or "gpt-4", "gpt-3.5-turbo"
    messages: conversationHistory,
    tools: openaiTools,
    tool_choice: "auto", // Let ChatGPT decide if it needs tools
  });

  console.log("🤖 ChatGPT's response:");
  console.log(`Finish reason: ${response.choices[0].finish_reason}`);

  // Handle tool use loop
  while (response.choices[0].finish_reason === "tool_calls") {
    const assistantMessage = response.choices[0].message;

    // Add assistant's response to history
    conversationHistory.push(assistantMessage);

    // Process each tool call
    const toolCalls = assistantMessage.tool_calls;
    for (const toolCall of toolCalls) {
      console.log(`\n🔧 Tool called: ${toolCall.function.name}`);
      console.log(
        `Arguments: ${JSON.stringify(
          JSON.parse(toolCall.function.arguments),
          null,
          2
        )}`
      );

      // Call the tool via MCP
      const result = await mcpClient.callTool({
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments),
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

      // Add tool result to history in OpenAI format
      conversationHistory.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: resultText,
      });
    }

    // Continue conversation with tool results
    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationHistory,
      tools: openaiTools,
      tool_choice: "auto",
    });

    console.log(`\n🤖 ChatGPT's response:`);
    console.log(`Finish reason: ${response.choices[0].finish_reason}`);
  }

  // Print final response
  console.log("\n📝 Final Answer:");
  console.log(response.choices[0].message.content);

  // Cleanup
  await mcpClient.close();
  console.log("\n👋 Done!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
