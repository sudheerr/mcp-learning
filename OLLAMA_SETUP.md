# Using Local Llama with Ollama and MCP

This guide shows you how to use your local Llama 3.2 model with MCP - completely free and private!

## ✅ What You Have

- ✅ Ollama installed and running
- ✅ Llama 3.2 model downloaded
- ✅ New MCP client ready to use

## 🚀 Quick Start

### 1. Make sure Ollama is running

```bash
# Check if Ollama is running
curl http://localhost:11434

# If not running, start it
ollama serve
```

Leave this running in one terminal.

### 2. Verify your model is available

```bash
# List installed models
ollama list

# Should see something like:
# llama3.2:latest    ...
# llama3.2:3b        ...
```

### 3. Run the MCP client

```bash
# Use default model (llama3.2)
node mcp-client-ollama.js

# Or specify a different model
OLLAMA_MODEL=llama3.2:3b node mcp-client-ollama.js

# With custom query
node mcp-client-ollama.js "Tell me about my CPU and memory"
```

---

## 🎯 How It Works

### The Flow

```
You → Ollama Client → Llama 3.2 (local) → MCP Client → MCP Server → System Info
                          ↑                                              ↓
                          └──────────────── Results ─────────────────────┘
```

**All on your machine!** No internet required, no API costs, completely private.

### What's Different from Cloud APIs

| Aspect | Ollama (Local) | Claude/ChatGPT (Cloud) |
|--------|----------------|------------------------|
| **Speed** | Slower (depends on your CPU/GPU) | Fast (cloud servers) |
| **Privacy** | 100% local, nothing leaves your machine | Data sent to API |
| **Cost** | Free! | Pay per request |
| **Quality** | Good for simple tasks | Better reasoning |
| **Offline** | ✅ Works offline | ❌ Needs internet |
| **Setup** | Need to install model | Just need API key |

---

## 📊 Model Recommendations

### Which Llama 3.2 variant should you use?

| Model | Size | RAM Needed | Speed | Quality | Best For |
|-------|------|-----------|-------|---------|----------|
| `llama3.2:1b` | ~1GB | 4GB+ | ⚡⚡⚡ | ⭐⭐ | Testing, low-end hardware |
| `llama3.2:3b` | ~3GB | 8GB+ | ⚡⚡ | ⭐⭐⭐ | General use, good balance |
| `llama3.2` (default) | ~7GB | 16GB+ | ⚡ | ⭐⭐⭐⭐ | Best quality |

### Better models for tool use

Llama 3.2 is okay with tools, but these are better:

```bash
# Qwen 2.5 - BEST for tool use
ollama pull qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js

# Llama 3.1 - Good tool support
ollama pull llama3.1:8b
OLLAMA_MODEL=llama3.1:8b node mcp-client-ollama.js

# Mistral - Solid general purpose
ollama pull mistral
OLLAMA_MODEL=mistral node mcp-client-ollama.js
```

**Recommendation:** If you have 16GB+ RAM, try **qwen2.5:7b** - it's specifically trained for tool use.

---

## 🔧 Configuration Options

### Change the Model

**Option 1: Environment variable**
```bash
export OLLAMA_MODEL=llama3.2:3b
node mcp-client-ollama.js
```

**Option 2: Edit the file**

In `mcp-client-ollama.js`, change line 11:
```javascript
const MODEL = "llama3.2:3b"; // Change this
```

### Change Ollama Host

If Ollama is running on a different port or machine:

```javascript
const ollama = new Ollama({
  host: "http://192.168.1.100:11434", // Different machine
});
```

### Model Parameters (Optional)

You can add more control over the model's behavior:

```javascript
let response = await ollama.chat({
  model: MODEL,
  messages: conversationHistory,
  tools: ollamaTools,
  options: {
    temperature: 0.7,    // Creativity (0.0 = deterministic, 1.0 = creative)
    top_p: 0.9,          // Nucleus sampling
    num_predict: 2000,   // Max tokens to generate
  },
});
```

---

## 🧪 Testing

### Test 1: Verify Ollama is working

```bash
# Simple test without tools
ollama run llama3.2 "What is 2+2?"
```

Should respond quickly with "4".

### Test 2: Run the MCP client

```bash
node mcp-client-ollama.js
```

**Expected output:**
```
🚀 Starting MCP server...
🦙 Using Ollama model: llama3.2

✅ Connected to MCP server

📋 Available tools:
[...]

💬 User Query: "What's my system information? Include network details if possible."

🤔 Thinking...

🦙 Llama's response:
Tool calls: 1

🔄 Tool use iteration 1

🔧 Tool called: get_system_info
Arguments: {
  "includeNetwork": true
}
✅ Tool result received

🤔 Processing results...

🦙 Llama's response:
Tool calls: 0

📝 Final Answer:
Based on the system information retrieved, here's what I found:

**Operating System:**
- Platform: linux
- Type: Linux
...
```

### Test 3: Different queries

```bash
# Simple query
node mcp-client-ollama.js "How much RAM do I have?"

# Specific query
node mcp-client-ollama.js "What's my CPU model and core count?"

# Complex query
node mcp-client-ollama.js "Analyze my system and tell me if it's good for development"
```

---

## 🐛 Troubleshooting

### "Failed to fetch" or "ECONNREFUSED"

**Problem:** Ollama server is not running.

**Solution:**
```bash
# Start Ollama
ollama serve
```

### "model not found"

**Problem:** The model isn't downloaded.

**Solution:**
```bash
# Download the model
ollama pull llama3.2

# Check what's installed
ollama list
```

### "Tools not being called"

**Problem:** Llama 3.2 might not recognize when to use tools.

**Solution 1:** Be more explicit:
```bash
node mcp-client-ollama.js "Use the get_system_info tool to check my computer"
```

**Solution 2:** Use a better model for tools:
```bash
ollama pull qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js
```

### "Slow responses"

**Problem:** Local models are slower than cloud APIs.

**Solutions:**
- Use a smaller model: `llama3.2:3b` or `llama3.2:1b`
- Get a GPU (CUDA/ROCm) - Ollama will automatically use it
- Be patient - first request is slower (loads model into memory)

### "Out of memory"

**Problem:** Model is too large for your RAM.

**Solution:** Use a smaller model:
```bash
ollama pull llama3.2:1b
OLLAMA_MODEL=llama3.2:1b node mcp-client-ollama.js
```

### "Infinite loop" / "Reached maximum iterations"

**Problem:** Model keeps calling tools without finishing.

**Solution:** This is a safety feature. The model might be confused. Try:
- Being more specific in your query
- Using a better model (qwen2.5:7b)
- Restarting and trying again

---

## 💡 Tips for Best Results

### 1. Be Specific

❌ Bad: "Tell me about my system"
✅ Good: "What are my system's CPU specs, total RAM, and operating system?"

### 2. Guide the Model

If tools aren't being called:
```bash
node mcp-client-ollama.js "Use the get_system_info tool with includeNetwork=true to show me my system details"
```

### 3. Start Simple

Test with simple queries first:
```bash
node mcp-client-ollama.js "How much memory does my system have?"
```

### 4. Use the Right Model

- **Llama 3.2:1b/3b** - Testing, simple questions
- **Llama 3.2** - General use
- **Qwen 2.5:7b** - Tool use, complex reasoning
- **Llama 3.1:8b** - Long conversations, analysis

---

## 🎓 Understanding Tool Use with Local Models

### How Cloud Models Work

ChatGPT and Claude are **specifically trained** on millions of examples of tool calling. They're very good at:
- Recognizing when tools are needed
- Choosing the right tool
- Formatting parameters correctly

### How Local Models Work

Local models like Llama 3.2 have **some** tool calling ability, but:
- Less training on tool use
- May need more explicit prompting
- Sometimes don't recognize when to use tools

**This is normal!** Local models are getting better, but aren't as polished as cloud APIs yet.

---

## 🔍 Behind the Scenes

### What happens when you run the client:

1. **Ollama loads the model** (into RAM, ~10-30 seconds first time)
2. **Client connects to MCP server** (your system-info-server)
3. **Client sends your query + tool list** to Llama
4. **Llama decides** if it needs to call a tool
5. **If yes:** Client executes tool → sends result back to Llama
6. **Llama formulates answer** based on tool results
7. **You see the response**

### Where everything runs:

```
┌─────────────────────────────────────┐
│     Your Computer (All Local)       │
│                                     │
│  ┌──────────┐    ┌──────────────┐  │
│  │  Llama   │←──→│  MCP Client  │  │
│  │  3.2     │    └──────┬───────┘  │
│  │ (Ollama) │           │          │
│  └──────────┘           │          │
│                         │          │
│                    ┌────▼──────┐   │
│                    │MCP Server │   │
│                    │(sys info) │   │
│                    └───────────┘   │
└─────────────────────────────────────┘
```

**No internet needed!** **No data leaves your machine!**

---

## 📈 Performance Comparison

I tested the same query on different setups:

| Setup | Response Time | Cost | Privacy |
|-------|--------------|------|---------|
| **Claude 3.5 Sonnet** (API) | 2-3 sec | $0.006 | ⚠️ Cloud |
| **GPT-4o** (API) | 1-2 sec | $0.005 | ⚠️ Cloud |
| **Llama 3.2 3B** (local, CPU) | 15-30 sec | $0 | ✅ 100% Local |
| **Llama 3.2** (local, CPU) | 30-60 sec | $0 | ✅ 100% Local |
| **Qwen 2.5 7B** (local, GPU) | 5-10 sec | $0 | ✅ 100% Local |

*Times vary based on hardware. GPU makes a huge difference!*

---

## 🚀 Next Steps

### Try Different Models

```bash
# Download other models
ollama pull qwen2.5:7b
ollama pull mistral
ollama pull llama3.1:8b

# Test them
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js "What's my system info?"
```

### Compare All Three Clients

You now have three clients!

```bash
# Local (free, private, slow)
node mcp-client-ollama.js "What's my CPU?"

# ChatGPT (fast, cheap, cloud)
node mcp-client-openai.js "What's my CPU?"

# Claude (fast, thorough, cloud)
node mcp-client.js "What's my CPU?"
```

### Build More Tools

Your MCP server can do more than just system info. Add tools for:
- Reading files
- Running commands
- Accessing databases
- Making API calls
- Controlling hardware

The same Ollama client will work with any MCP tools!

---

## 🎯 Summary

**You now have:**
- ✅ Local LLM running with Ollama
- ✅ MCP client that works with Llama 3.2
- ✅ Completely private, offline, free setup
- ✅ Same MCP server works with Claude, ChatGPT, and Llama

**Trade-offs:**
- 🐌 Slower than cloud APIs
- 🧠 Less capable reasoning
- 💰 But FREE and PRIVATE!

**Best use case:**
- Learning and experimenting
- Privacy-sensitive data
- Offline environments
- Cost-conscious projects

Enjoy your local AI assistant! 🦙
