#!/usr/bin/env node

import esbuild from 'esbuild'
import nodemon from 'nodemon'
import { parse } from 'nodemon/lib/cli/index.js'
import { tmpdir } from 'os'
import { join } from 'path'
import { realpathSync } from 'fs'
import { spawn } from 'child_process'

const options = parse(process.argv)
const watch = options.hasOwnProperty('watch')
const args = options.args
const build = args.includes('--build')
const outfile = build ? args[args.indexOf('--build') + 1] : join(realpathSync(tmpdir()), `${Math.random()}.mjs`)

async function builder() {
  await esbuild.build({
    entryPoints: [options.script],
    bundle: true,
    platform: 'node',
    external: ['./node_modules/*'],
    format: 'esm',
    logLevel: watch || build ? 'info' : 'silent',
    outfile,
    watch,
  })
}

function watcher() {
  nodemon({
    script: outfile,
    watch: [outfile],
    quiet: true,
  })
}

void (async () => {
  await builder()
  if (watch) {
    watcher()
    process.on('SIGINT', process.exit)
  } else {
    !build && spawn('node', [outfile], { stdio: 'inherit' })
  }
})()
