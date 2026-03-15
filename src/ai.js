

async function generatePR(diff, model = "qwen2.5-coder:1.5b", reason) {
    try {

        // The ultra-strict, token-optimized system prompt
        const prompt = `You are a strict, expert software engineer. Generate a clear and professional Pull Request description based on the provided Git diff.

CRITICAL INSTRUCTIONS:
1. OUTPUT EXACTLY THE MARKDOWN FORMAT PROVIDED BELOW. DO NOT add any conversational text, introductory remarks, or explanations.
2. Focus on the *WHY* (the problem and the rationale), not just the *WHAT* (the code changes).
3. Be highly concise. No fluff.

DIFF DATA:
${diff}

USER REASON FOR CHANGES (if provided, incorporate this context):
"${reason}"

REQUIRED OUTPUT MARKDOWN FORMAT:

**Title:** <feat|fix|chore|refactor|docs|test>: <short, descriptive summary>

**Description:**
<concise sentences explaining the core problem, the context, and how this PR resolves it>

**Changes Included:**
* \`<file path>\`: <brief, precise technical detail of what changed and its impact>
* \`<file path>\`: <brief, precise technical detail of what changed and its impact>
`;

        // The HTTP request to the local Ollama server
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: true
            })
        });

        // Extract and return the AI's markdown string
        
        return response;
        
    } catch (error) {
        throw new Error(`Ollama connection failed: ${error.message} (Cause: ${error.cause})`);
    }
}


async function processStream(response){

    const reader = await response.body.getReader()
    const decoder = new TextDecoder("utf-8")

    let buffer = ""
    let fulldescription = ""

    while (true){   

        const {done, value} = await reader.read()

        if (done) break;

        buffer+= decoder.decode(value, {stream: true})
        
        const lines = buffer.split('\n')
        buffer = lines.pop()
        
        for (const line of lines){
            try{
                const parsed = JSON.parse(line)
                if (parsed.response){
                    fulldescription += parsed.response
                    process.stdout.write(parsed.response)
                }
            }catch(error){
                // Ignore invalid JSON chunks (often happens when stream splits midway)
            }
        }
    }

    return fulldescription
}

export { generatePR, processStream };