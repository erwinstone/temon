#!/usr/bin/env node

const esbuild = require('esbuild')
const parse = require('nodemon/lib/cli/index.js').parse
const tmpdir = require('os').tmpdir
const join = require('path').join
const realpathSync = require('fs').realpathSync
const spawn = require('child_process').spawn

const type = require(join(process.cwd(), 'package.json')).type
const options = parse(process.argv)
const watch = options.hasOwnProperty('watch')
const args = options.args
const build = args.includes('--build')
const minify = args.includes('--minify')
const ext = type === 'module' ? 'mjs' : 'cjs'
const outfile = build ? args[args.indexOf('--build') + 1] : join(realpathSync(tmpdir()), `${Math.random()}.${ext}`)

async function builder() {
  const buildOpts = {
    entryPoints: [options.script],
    bundle: true,
    platform: 'node',
    external: ['./node_modules/*'],
    format: type === 'module' ? 'esm' : 'cjs',
    logLevel: watch || build ? 'info' : 'silent',
    outfile,
    minify,
  }
  if (watch) {
    const ctx = await esbuild.context(buildOpts)
    await ctx.watch()
  } else {
    await esbuild.build(buildOpts)
  }
}

function watcher() {
    require('nodemon')({
        script: outfile,
        watch: [outfile],
        quiet: true,
    })
}

void(async function () {
    await builder()
    if (watch) {
      watcher()
      process.on('SIGINT', process.exit)
    } else {
      !build && spawn('node', [outfile], { stdio: 'inherit' })
    }
})()
