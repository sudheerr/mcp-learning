# Using ChatGPT (OpenAI) with MCP

This guide shows you how to use ChatGPT instead of Claude with your MCP server.

## Setup

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Important:** Your ChatGPT subscription is different from API access. The API is pay-per-use (but very cheap).

### 2. Set the API Key

```bash
export OPENAI_API_KEY='sk-your-key-here'
```

To make it permanent, add to your `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Run the OpenAI Client

```bash
node mcp-client-openai.js
```

Or with a custom query:
```bash
node mcp-client-openai.js "Tell me about my system's CPU"
```

---

## Key Differences: OpenAI vs Anthropic

### API Structure

**OpenAI (ChatGPT):**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: conversationHistory,
  tools: openaiTools,
  tool_choice: "auto"
});

// Check: response.choices[0].finish_reason
// Access message: response.choices[0].message
```

**Anthropic (Claude):**
```javascript
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: conversationHistory,
  tools: anthropicTools
});

// Check: response.stop_reason
// Access message: response.content
```

### Tool Format

**OpenAI:**
```javascript
{
  type: "function",
  function: {
    name: "get_system_info",
    description: "Get system information...",
    parameters: {
      type: "object",
      properties: { ... }
    }
  }
}
```

**Anthropic:**
```javascript
{
  name: "get_system_info",
  description: "Get system information...",
  input_schema: {
    type: "object",
    properties: { ... }
  }
}
```

### Tool Calling

**OpenAI:**
- Uses `tool_calls` array in the message
- Each call has an `id` for tracking
- Tool results have role `"tool"`

**Anthropic:**
- Uses content blocks with `type: "tool_use"`
- Tool results have role `"user"` with `type: "tool_result"`

### Finish Reasons

**OpenAI:**
- `"tool_calls"` - wants to call a tool
- `"stop"` - finished normally
- `"length"` - hit max tokens

**Anthropic:**
- `"tool_use"` - wants to call a tool
- `"end_turn"` - finished normally
- `"max_tokens"` - hit max tokens

---

## Model Options

### GPT-4 Models (Recommended)

```javascript
model: "gpt-4o"           // GPT-4 Omni - latest, fastest, best
model: "gpt-4-turbo"      // GPT-4 Turbo - good balance
model: "gpt-4"            // Original GPT-4 - slower, more expensive
```

### GPT-3.5 Models (Cheaper, faster, less capable)

```javascript
model: "gpt-3.5-turbo"    // Cheapest option
```

### Pricing (as of 2024)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4 Turbo | $10.00 | $30.00 |
| GPT-3.5 Turbo | $0.50 | $1.50 |

**For reference:** This simple system info query typically uses ~500 tokens total ≈ $0.006 with GPT-4o

---

## Complete Code Comparison

### OpenAI Version (mcp-client-openai.js)

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tool format
const openaiTools = toolsResult.tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  },
}));

// API call
let response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: conversationHistory,
  tools: openaiTools,
  tool_choice: "auto",
});

// Tool use loop
while (response.choices[0].finish_reason === "tool_calls") {
  const assistantMessage = response.choices[0].message;
  conversationHistory.push(assistantMessage);

  const toolCalls = assistantMessage.tool_calls;
  for (const toolCall of toolCalls) {
    // Execute tool
    const result = await mcpClient.callTool({
      name: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments),
    });

    // Add result
    conversationHistory.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: resultText,
    });
  }

  // Continue conversation
  response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory,
    tools: openaiTools,
  });
}

// Final answer
console.log(response.choices[0].message.content);
```

### Anthropic Version (mcp-client.js)

```javascript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool format
const anthropicTools = toolsResult.tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.inputSchema,
}));

// API call
let response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  tools: anthropicTools,
  messages: conversationHistory,
});

// Tool use loop
while (response.stop_reason === "tool_use") {
  conversationHistory.push({
    role: "assistant",
    content: response.content,
  });

  const toolResults = [];
  for (const content of response.content) {
    if (content.type === "tool_use") {
      // Execute tool
      const result = await mcpClient.callTool({
        name: content.name,
        arguments: content.input,
      });

      toolResults.push({
        type: "tool_result",
        tool_use_id: content.id,
        content: result.content,
      });
    }
  }

  conversationHistory.push({
    role: "user",
    content: toolResults,
  });

  // Continue conversation
  response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    tools: anthropicTools,
    messages: conversationHistory,
  });
}

// Final answer
for (const content of response.content) {
  if (content.type === "text") {
    console.log(content.text);
  }
}
```

---

## Testing

### Test the OpenAI Client

```bash
# Set your API key
export OPENAI_API_KEY='sk-your-key-here'

# Run with default query
node mcp-client-openai.js

# Run with custom query
node mcp-client-openai.js "How much RAM does my system have?"
```

### Expected Output

```
🚀 Starting MCP server...
✅ Connected to MCP server

📋 Available tools:
[
  {
    "name": "get_system_info",
    "description": "Get comprehensive system information...",
    ...
  }
]

💬 User Query: "What's my system information? Include network details if possible."

🤖 ChatGPT's response:
Finish reason: tool_calls

🔧 Tool called: get_system_info
Arguments: {
  "includeNetwork": true
}
✅ Tool result received

🤖 ChatGPT's response:
Finish reason: stop

📝 Final Answer:
Your system has the following specifications:

**Operating System:**
- Platform: Linux
- Type: Linux
- Release: 5.15.153.1-microsoft-standard-WSL2
...
```

---

## Troubleshooting

### "Incorrect API key provided"

Make sure you've set the environment variable:
```bash
echo $OPENAI_API_KEY
```

Should show your key starting with `sk-`

### "You exceeded your current quota"

Your OpenAI account needs to have billing set up. Go to:
https://platform.openai.com/account/billing

Add a payment method (you'll only pay for what you use).

### "Model not found"

Make sure you're using a valid model name:
- `gpt-4o` ✅
- `gpt-4-turbo` ✅
- `gpt-3.5-turbo` ✅
- `gpt4` ❌ (wrong format)

### Tool not being called

Try being more explicit in your query:
```bash
node mcp-client-openai.js "Use the get_system_info tool to check my computer specs"
```

---

## Which Should You Use?

### Use OpenAI (ChatGPT) if:
- ✅ You already have an OpenAI account
- ✅ You want faster responses
- ✅ You prefer GPT-4's style
- ✅ You need the cheapest option (GPT-3.5-turbo)

### Use Anthropic (Claude) if:
- ✅ You prefer Claude's careful, detailed responses
- ✅ You want better tool use reasoning
- ✅ You need longer context windows
- ✅ You prefer Claude's safety approach

### Use Both!
You have both clients (`mcp-client.js` and `mcp-client-openai.js`) - try both and see which you prefer!

**The beauty of MCP:** Your `system-info-server` works with both - no changes needed!

---

## Next Steps

Try these experiments:

```bash
# Compare responses
node mcp-client-openai.js "What's my CPU?"
node mcp-client.js "What's my CPU?"

# Test different models
# Edit mcp-client-openai.js and change model to:
# - "gpt-3.5-turbo" (faster, cheaper)
# - "gpt-4" (slower, more thorough)

# Complex query
node mcp-client-openai.js "Analyze my system and tell me if I can run machine learning workloads"
```
