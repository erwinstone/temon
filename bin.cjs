#!/usr/bin/env node

const esbuild = require('esbuild')
const parse = require('nodemon/lib/cli/index.js').parse
const tmpdir = require('os').tmpdir
const join = require('path').join
const realpathSync = require('fs').realpathSync
const spawn = require('child_process').spawn
const type = require('../../package.json').type

const options = parse(process.argv)
const watch = options.hasOwnProperty('watch')
const args = options.args
const build = args.includes('--build')
const outfile = build ? args[args.indexOf('--build') + 1] : join(realpathSync(tmpdir()), `${Math.random()}.js`)

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
  require('nodemon')({
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
