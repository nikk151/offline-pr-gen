

async function generatePR(diff, model = "qwen2.5-coder:1.5b", reason) {
    try {

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 600000) // 10 minutes timeout

        // The ultra-strict, token-optimized system prompt
        const prompt = `Write a Pull Request condition based on the GIT DIFF below. 

Instructions:
- Do not output any raw code blocks.
- List every modified file in the Changes section.
- User reason for changes: "${reason}"

GIT DIFF:
${diff}

Output Format:
**Title:** <feat|fix|chore>: <summary>
**Description:** <description>
**Changes Included:**
- \`<file 1>\`: <summary>
- \`<file 2>\`: <summary>
... [continue for every single file in the diff]

`;


        // The HTTP request to the local Ollama server
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: true
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        // Extract and return the AI's markdown string
        
        return response;
        
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error(`Ollama connection failed: Time out. Cannot support due to hardware constraints.`);
        }
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