import ora from 'ora'
import { gitDiff } from './git.js'
import { sanitizeDiff } from './sanitize.js'
import { generatePR, processStream } from './ai.js'
import clipboardy from 'clipboardy'

export async function runPRGenerator(options) {
    const diff = gitDiff(options.staged)
    const sanitizedDiff = sanitizeDiff(diff)
    if (sanitizedDiff.length !== 0) {
        const spinner = ora('Connecting to Ollama... (0s)').start()
        
        let seconds = 0;
        const timer = setInterval(() => {

            seconds++;

            let message = "Connecting to Ollama...";

            if (seconds > 60){
                message = "Heavy RAM swap in progress... (this can take up to 5 minutes on low RAM)";
            }
            else if (seconds > 30){
                message = "Clearing system RAM and loading model (Cold Start)...";
            }
            else if (seconds > 10){
                message = "Model loaded. Analyzing the code changes (Warm Start)...";
            }
            spinner.text = `${message} (${seconds}s elapsed)`;
        }, 1000);

        try {
            const streamResponse = await generatePR(sanitizedDiff, options.model, options.reason)
            
            clearInterval(timer);
            // Stop the spinner BEFORE the stream starts printing bytes to the terminal
            spinner.stop()
            console.log("🤖 Generating PR Description...\n")
            
            const pr = await processStream(streamResponse)
            
            clipboardy.writeSync(pr)
            console.log(`\n\n✅ PR description saved successfully to clipboard`)
            
        } catch (error) {
            clearInterval(timer);
            // If Ollama is offline or times out, the spinner catches the error instead of crashing
            spinner.fail(error.message)
            process.exit(1)
        }
    } else {
        console.log('No changes to commit')
        process.exit(0)
    }
}
