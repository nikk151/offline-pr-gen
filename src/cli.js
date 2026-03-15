#!/usr/bin/env node
import pkg from '../package.json' with { type: 'json' }
import { program } from 'commander'
import { runPRGenerator } from './index.js'

program.name('offline-pr-gen').description('CLI for generating PRs').version(pkg.version)
program.option('-s, --staged', 'Read only the staged git changes').option('-o, --output <output>', 'takes filename to write description', 'PR_DESCRIPTION.md').option('-m, --model <model_name>', 'Model to use for generation', 'qwen2.5-coder:1.5b').option('-r, --reason <reason>', 'Reason for the Changes', 'No reason provided by user')

program.parse(process.argv)

// Pass the parsed options object to the orchestrator to do the actual work
runPRGenerator(program.opts())