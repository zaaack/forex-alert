import { task, desc, option, fs, setGlobalOptions, execa, sleep } from 'foy'
setGlobalOptions({ loading: false })
task('dev', async (ctx) => {
  let p: execa.ExecaChildProcess<string> | void
  // Your build tasks
  // load .env
  fs
    .readFileSync('./.env', 'utf-8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => /^\w+/.test(s))
    .map((s) => s.split('=').map((s) => s.trim()))
    .map(([k, v]) => ctx.env(k, v.replace(/(^["'])|(["']$)/g, '')))
  ctx.run('build:server').then(() => {
    fs.watchDir('./server', { throttle: 1000 }, async () => {
      while (p && !p.killed) {
        p.kill()
        await sleep(500)
      }
      await ctx.run(`build:server`)
      p = ctx.exec(`node ./dist`)
      // p = ctx.exec(`ts-node ./server`)
    })
    p = ctx.popd().exec(`node ./dist`)
    // p = ctx.popd().exec(`ts-node ./server`)
  })
  // start client dev server
  ctx.pushd('./client').exec('yarn start')
})
task('build:server', async (ctx) => {
  await fs.rmrf('./dist')
  await ctx.exec(`ncc build ./server/index.ts -t --no-asset-builds -o dist`)
})
task('build:client', async (ctx) => {
  await fs.rmrf('./static')
  await ctx.cd('./client').exec([`yarn`, `yarn build`])
})
task('build', ['build:client', 'build:server'])
task('start', async (ctx) => {
  await ctx.exec(`node ./dist`)
})

task('build:signal', async (ctx) => {
  await fs.rmrf('./forex-signal/build')
  await ctx.exec([
    `yarn`,
    `ncc build ./forex-signal/index.ts -t --no-asset-builds -o forex-signal-build`,
  ])
})
