#!/usr/bin/env node

const { gitDiff } = require('./git')
const version = require('../package.json').version
const { program } = require('commander')
const { sanitizeDiff } = require('./sanitize')

program.name('offline-pr-gen').description('CLI for generating PRs').version(version)
program.option('-s, --staged', 'Read only the staged git changes').option('-o, --output <output>', 'takes file for generation').option('-m, --model <model_name>', 'Model to use for generation', 'qwen2.5-coder:1.5b')
program.parse(process.argv)

const options = program.opts()
console.log(sanitizeDiff(gitDiff(options.staged)))

// console.log(options)