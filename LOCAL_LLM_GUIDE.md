# Running a Local LLM with MCP

This guide shows you how to run an LLM on your laptop and integrate it with your MCP server.

## Why Run a Local LLM?

✅ **Privacy:** Everything runs on your machine - no data sent to external APIs
✅ **No API costs:** Free to use once set up
✅ **Offline:** Works without internet connection
✅ **Control:** Full control over the model and data

❌ **Downsides:** Slower than cloud APIs, requires good hardware, models are less capable than GPT-4/Claude

---

## Option 1: Ollama (Recommended - Easiest)

**Ollama** is the easiest way to run local LLMs. It's like Docker for AI models.

### Install Ollama

**On Linux/WSL:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**On macOS:**
```bash
brew install ollama
```

**On Windows:**
Download from https://ollama.com/download

### Start Ollama Service

```bash
# Start the Ollama service
ollama serve
```

Leave this running in one terminal.

### Pull a Model

Open a new terminal and download a model:

```bash
# Recommended models (from smallest to largest):

# 1. Llama 3.2 3B (smallest, fastest, good for testing)
ollama pull llama3.2:3b

# 2. Llama 3.2 (1B - even smaller, for very limited hardware)
ollama pull llama3.2:1b

# 3. Qwen 2.5 7B (better at tool use)
ollama pull qwen2.5:7b

# 4. Llama 3.1 8B (good balance)
ollama pull llama3.1:8b

# 5. Mistral (7B, good general purpose)
ollama pull mistral
```

**Hardware recommendations:**
- **8GB RAM:** Use 3B models (llama3.2:3b)
- **16GB RAM:** Use 7B models (qwen2.5:7b, mistral)
- **32GB+ RAM:** Use larger models (llama3.1:70b)

### Test Your Model

```bash
# Test that it works
ollama run llama3.2:3b "Hello, who are you?"
```

### API Endpoint

Ollama provides an OpenAI-compatible API at:
```
http://localhost:11434
```

---

## Option 2: LM Studio (GUI - User Friendly)

**LM Studio** provides a nice GUI for running models.

### Install

Download from: https://lmstudio.ai/

### Steps:
1. Open LM Studio
2. Browse and download a model (search for "Llama" or "Mistral")
3. Load the model
4. Click "Start Server" - it runs at `http://localhost:1234`

---

## Option 3: llama.cpp (Advanced - Most Control)

More technical but gives you the most control.

### Install

```bash
# Clone the repo
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Build
make

# Download a model (example - Llama 3.2 3B)
# Models are in GGUF format from HuggingFace
wget https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b.Q4_K_M.gguf

# Run the server
./server -m llama-2-7b.Q4_K_M.gguf --host 0.0.0.0 --port 8080
```

---

## Comparing Local Models for Tool Use

**Best models for tool/function calling:**

| Model | Size | Tool Calling | Speed | Quality |
|-------|------|--------------|-------|---------|
| Qwen 2.5 | 7B | ⭐⭐⭐⭐⭐ | Fast | Good |
| Llama 3.1 | 8B | ⭐⭐⭐⭐ | Fast | Good |
| Mistral | 7B | ⭐⭐⭐ | Fast | OK |
| Llama 3.2 | 3B | ⭐⭐ | Very Fast | Basic |

**Recommendation:** Start with **Qwen 2.5 7B** - it's specifically trained for tool use.

---

## Installing Required Packages

We'll need a library to talk to local LLMs:

```bash
npm install ollama
```

Or if you want OpenAI-compatible API access:

```bash
npm install openai
```

---

## Next Steps

Once you have a local LLM running, see `LOCAL_LLM_CLIENT.md` for how to modify the client to use it!
