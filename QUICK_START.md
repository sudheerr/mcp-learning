# Quick Start Guide

Welcome! You now have a complete MCP learning environment with three AI providers.

## 🎯 What You Have

```
mcp-learning/
├── system-info-server/        # Your MCP server (provides system info)
├── mcp-client.js              # Claude client
├── mcp-client-openai.js       # ChatGPT client
├── mcp-client-ollama.js       # Local Ollama client ⭐ YOU ARE HERE
└── Documentation files...
```

## ⚡ Quick Test (Ollama - You're Ready!)

Since you have Ollama running with Llama 3.2:3b, try this:

```bash
node mcp-client-ollama.js "Use the get_system_info tool to show my system details"
```

**What will happen:**
1. 🚀 MCP server starts
2. 🦙 Llama 3.2 receives your query
3. 🔧 Calls the `get_system_info` tool
4. 📊 Gets your real system data
5. 💬 Formats a nice response

**Expected time:** 20-30 seconds (local processing)

---

## 📚 Documentation Guide

Not sure where to start? Here's what to read:

### 1. **Just Want to Use It?**
→ Read `README.md` - quick overview and usage

### 2. **Want to Understand How It Works?**
→ Read `WALKTHROUGH.md` - detailed step-by-step explanation of what happens

### 3. **Want to Use ChatGPT Instead?**
→ Read `OPENAI_SETUP.md` - setup guide for OpenAI/ChatGPT

### 4. **Want to Optimize Your Ollama Setup?**
→ Read `OLLAMA_SETUP.md` - tips, model recommendations, troubleshooting

### 5. **Want to Compare All Three?**
→ Read `COMPARISON.md` - side-by-side comparison of Claude, ChatGPT, Ollama

---

## 🚀 Your Next Steps

### Step 1: Test Your Current Setup ✅

You're already set up with Ollama! Try these:

```bash
# Simple query
node mcp-client-ollama.js "Use get_system_info. How much RAM do I have?"

# More complex
node mcp-client-ollama.js "Use get_system_info with network. What's my system configuration?"

# Different model (if you have it)
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js "Check my system info"
```

### Step 2: Try Different Models (Optional)

Download and try better models for tool use:

```bash
# Best for tool use
ollama pull qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js "Check my system"

# Larger Llama
ollama pull llama3.1:8b
OLLAMA_MODEL=llama3.1:8b node mcp-client-ollama.js "Check my system"
```

### Step 3: Add Cloud Options (Optional)

If you want to compare with cloud AIs:

**For ChatGPT:**
```bash
# Get API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY='sk-your-key'
node mcp-client-openai.js "What's my system info?"
```

**For Claude:**
```bash
# Get API key from https://console.anthropic.com/
export ANTHROPIC_API_KEY='your-key'
node mcp-client.js "What's my system info?"
```

### Step 4: Build Your Own Tools

The real power of MCP is adding your own tools! Ideas:

- 📁 File reader tool
- 💾 Database query tool
- 🌐 API caller tool
- 📧 Email sender tool
- 🔍 Web scraper tool

See `system-info-server/index.js` for how to build tools.

---

## 🎓 Learning Path

### Beginner (You Are Here!)

1. ✅ Understand what MCP is
2. ✅ Run the Ollama client successfully
3. ⏭️ Read `WALKTHROUGH.md` to understand the flow
4. ⏭️ Experiment with different queries

### Intermediate

1. Compare all three clients (Ollama, ChatGPT, Claude)
2. Try different Ollama models
3. Modify queries and see how responses differ
4. Read the server code (`system-info-server/index.js`)

### Advanced

1. Add a new parameter to the existing tool
2. Create a new tool in the MCP server
3. Build your own MCP server from scratch
4. Integrate with your own applications

---

## 💡 Tips for Success

### For Ollama (Local LLM):

**DO:**
- ✅ Be explicit: "Use the get_system_info tool..."
- ✅ Use better models for tool use (qwen2.5:7b)
- ✅ Be patient - local processing takes time
- ✅ Try different phrasings if tools aren't called

**DON'T:**
- ❌ Expect cloud-level quality from 3B models
- ❌ Use vague queries like "tell me about my system"
- ❌ Expect instant responses
- ❌ Give up if first try doesn't work - rephrase!

### For ChatGPT/Claude:

**DO:**
- ✅ Use natural language - they're smart!
- ✅ Let them decide when to use tools
- ✅ Ask complex, multi-part questions
- ✅ Expect high quality responses

**DON'T:**
- ❌ Forget to set API keys
- ❌ Worry about being too vague
- ❌ Over-explain what you want

---

## 🐛 Common Issues

### "model not found" (Ollama)
```bash
ollama list              # See what you have
ollama pull llama3.2:3b  # Download if needed
```

### "ECONNREFUSED" (Ollama)
```bash
ollama serve  # Start Ollama in another terminal
```

### "Incorrect API key" (ChatGPT/Claude)
```bash
echo $OPENAI_API_KEY     # Check if set
export OPENAI_API_KEY='sk-...'  # Set it
```

### "Tools not being called" (Ollama)
Be more explicit:
```bash
node mcp-client-ollama.js "Use the get_system_info tool to check my computer"
```

Or use a better model:
```bash
ollama pull qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b node mcp-client-ollama.js
```

---

## 📊 Quick Command Reference

### Ollama Commands
```bash
ollama serve                    # Start Ollama
ollama list                     # List installed models
ollama pull MODEL_NAME          # Download a model
ollama rm MODEL_NAME            # Remove a model
ollama run MODEL_NAME "query"   # Test a model directly
```

### Running Clients
```bash
# Ollama (local)
node mcp-client-ollama.js "your query"
OLLAMA_MODEL=model:tag node mcp-client-ollama.js "query"

# ChatGPT (cloud)
node mcp-client-openai.js "your query"

# Claude (cloud)
node mcp-client.js "your query"
```

### Testing MCP Server Directly
```bash
cd system-info-server
node test.js
```

---

## 🎯 Try These Examples

### Example 1: Basic System Info
```bash
node mcp-client-ollama.js "Use get_system_info tool. What's my RAM and CPU?"
```

### Example 2: With Network Details
```bash
node mcp-client-ollama.js "Use get_system_info with includeNetwork=true. Show me everything."
```

### Example 3: Specific Question
```bash
node mcp-client-ollama.js "Use the tool to check my system, then tell me if I can run Docker"
```

### Example 4: Compare All Three
```bash
QUERY="Use the get_system_info tool. What's my system memory?"

node mcp-client-ollama.js "$QUERY"          # Local
node mcp-client-openai.js "What's my RAM?"  # ChatGPT (if set up)
node mcp-client.js "What's my RAM?"         # Claude (if set up)
```

---

## 📖 What to Read Next

Based on what you want to do:

**"I want to understand everything deeply"**
→ `WALKTHROUGH.md` (comprehensive step-by-step)

**"I want to set up ChatGPT"**
→ `OPENAI_SETUP.md`

**"I want to optimize Ollama"**
→ `OLLAMA_SETUP.md`

**"I want to compare the three options"**
→ `COMPARISON.md`

**"I want to build my own tools"**
→ Look at `system-info-server/index.js` and MCP documentation

---

## 🎉 Success!

You now have:
- ✅ A working MCP server
- ✅ A local LLM setup (Ollama + Llama 3.2)
- ✅ Three different client implementations
- ✅ Complete documentation

**You're ready to start exploring the world of MCP and local LLMs!**

## Questions?

Check the documentation files or:
- MCP Docs: https://modelcontextprotocol.io
- Ollama: https://ollama.com
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com

Happy learning! 🚀
