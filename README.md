# Temon

**T**ypescript + **E**sbuild + Node**mon**. Typescript runner, bundler, watcher powered by esbuild & nodemon

## Local installation

```bash
  npm install --save-dev esbuild nodemon temon
```

To use the binary, you can call it with `npx` while in the project directory:

```bash
npx temon index.ts
npx temon index.ts --build dist/index.js
npx temon index.ts --build dist/index.js --minify
npx temon index.ts --watch
```

## Global installation

```bash
  npm install --global esbuild nodemon temon
```

Then, you can call `temon` directly:

```bash
temon index.ts
temon index.ts --build dist/index.js
temon index.ts --build dist/index.js --minify
temon index.ts --watch
```

You can also pass arguments:

```bash
temon "index.ts --test" --watch
```
