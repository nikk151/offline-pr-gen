#!/usr/bin/env node
import ora from 'ora'
import { gitDiff } from './git.js'
import pkg from '../package.json' with { type: 'json' }
import { program } from 'commander'
import { sanitizeDiff } from './sanitize.js'
import { generatePR, processStream } from './ai.js'
import fs from 'fs'

program.name('offline-pr-gen').description('CLI for generating PRs').version(pkg.version)
program.option('-s, --staged', 'Read only the staged git changes').option('-o, --output <output>', 'takes filename to write description', 'PR_DESCRIPTION.md').option('-m, --model <model_name>', 'Model to use for generation', 'qwen2.5-coder:1.5b').option('-r, --reason <reason>', 'Reason for the Changes', 'No reason provided by user')
program.parse(process.argv)

const options = program.opts()
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