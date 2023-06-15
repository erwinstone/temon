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

const command = process.argv[2].split(' ')
console.log(command)

async function builder() {
  const buildOpts = {
    entryPoints: [command[0]],
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
        args: command.length > 1 ? command.slice(1) : [],
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
