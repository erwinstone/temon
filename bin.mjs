#!/usr/bin/env node

import esbuild from 'esbuild'
import { parse } from 'nodemon/lib/cli/index.js'
import { tmpdir } from 'os'
import { join } from 'path'
import { realpathSync, readFileSync } from 'fs'
import { spawn } from 'child_process'
import { pkgUpSync } from 'pkg-up'

const type = JSON.parse(readFileSync(pkgUpSync(), 'utf8')).type
const options = parse(process.argv)
const watch = options.hasOwnProperty('watch')
const args = options.args
const build = args.includes('--build')
const ext = type === 'module' ? 'mjs' : 'cjs'
const outfile = build
  ? args[args.indexOf('--build') + 1]
  : join(realpathSync(tmpdir()), `${Math.random()}.${ext}`)

async function builder() {
  await esbuild.build({
    entryPoints: [options.script],
    bundle: true,
    platform: 'node',
    external: ['./node_modules/*'],
    format: type === 'module' ? 'esm' : 'cjs',
    logLevel: watch || build ? 'info' : 'silent',
    outfile,
    watch,
  })
}

function watcher() {
  import('nodemon').then((module) => {
    module.default({
      script: outfile,
      watch: [outfile],
      quiet: true,
    })
  })
}

await builder()
if (watch) {
  watcher()
  process.on('SIGINT', process.exit)
} else {
  !build && spawn('node', [outfile], { stdio: 'inherit' })
}
