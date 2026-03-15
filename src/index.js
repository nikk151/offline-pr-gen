import ora from 'ora'
import { gitDiff } from './git.js'
import { sanitizeDiff } from './sanitize.js'
import { generatePR, processStream } from './ai.js'
import fs from 'fs'

export async function runPRGenerator(options) {
    const diff = gitDiff(options.staged)
    const sanitizedDiff = sanitizeDiff(diff)
    const spinner = ora('Connecting to Ollama...').start()

    if (sanitizedDiff.length !== 0) {
        try {
            const streamResponse = await generatePR(sanitizedDiff, options.model, options.reason)
            
            // Stop the spinner BEFORE the stream starts printing bytes to the terminal
            spinner.stop()
            console.log("🤖 Generating PR Description...\n")
            
            const pr = await processStream(streamResponse)
            
            fs.writeFileSync(options.output, pr)
            console.log(`\n\n✅ PR description saved successfully to ${options.output}`)
            
        } catch (error) {
            // If Ollama is offline or times out, the spinner catches the error instead of crashing
            spinner.fail(error.message)
            process.exit(1)
        }
    } else {
        spinner.info('No changes to commit')
        process.exit(0)
    }
}
