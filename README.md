# offline-pr-gen 🚀

A lightning-fast, 100% offline Pull Request generator powered by local AI.

Generate professional, structured PR descriptions straight from your terminal by analyzing your Git diffs locally. No API keys, no subscription costs, no internet required.

## Prerequisites
Because this tool runs the AI models directly on your hardware (Ensuring your codebase stays 100% private), you must install **Ollama**.

1. Download and install [Ollama](https://ollama.com/)
2. Open your terminal and download the recommended model:
   ```bash
   ollama pull qwen2.5-coder:1.5b
   ```
   *(Note: You can use any model you prefer by passing the `-m` flag!)*

3. **Ensure Ollama is running.** On Windows/Mac, the Ollama app usually runs in the background automatically. On some Linux setups, you may need to manually start the server before using this CLI:
   ```bash
   ollama serve
   ```

## Installation

Install the CLI globally using NPM:

```bash
npm install -g offline-pr-gen
```

## Usage

Simply run the command inside any Git repository. It will read your uncommitted changes and generate a PR description.

```bash
# You can use the full name:
offline-pr-gen

# Or use the blazing fast alias to do the exact same thing:
oprg
```

### Options

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `-s, --staged` | Only read staged `git add` changes | `false` |
| `-m, --model <name>` | The Ollama model to use | `qwen2.5-coder:1.5b` |
| `-r, --reason <text>` | Provide context to the AI about *why* you made the changes | `No reason provided` |

### Example
```bash
offline-pr-gen -s -m "qwen2.5-coder:0.5b" -r "Refactoring the CLI architecture and adding an elapsed timer"
```

## How It Works
1. Runs `git diff` via child processes.
2. Sanitizes the diff (removes massive files like `package-lock.json`).
3. Sends a highly-optimized prompt to your local Ollama server.
4. Streams the AI response, formats it, and automatically copies the perfect PR description straight to your **clipboard**.
