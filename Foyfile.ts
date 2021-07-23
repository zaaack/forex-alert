import { task, desc, option, fs, setGlobalOptions, execa } from 'foy'
setGlobalOptions({ loading: false })
task('dev', async ctx => {
  let p: execa.ExecaChildProcess<string> | void
  // Your build tasks
  ctx.run('build:server').then(() => {
    fs.watchDir('./server',{throttle: 1000}, async () => {
      p && p.kill()
      await ctx.run(`build:server`)
      p = ctx.exec(`node ./server`)
      console.log('p', p)
    })
    p = ctx.popd().exec(`node ./server`)
  })
  await ctx.pushd('./client').exec(`yarn start`)
})
task('build:server', async ctx => {
  await ctx.exec(`ncc build ./server-source/index.ts -t --no-asset-builds -o server`)
})
task('build:client', async ctx => {
  await fs.rmrf('./static')
  await ctx.cd('./client').exec([
    `yarn`,
    `yarn build`
  ])
})
task('build', ['build:client', 'build:server'])
task('start', async ctx => {
  await ctx.exec(`node ./server`)
})

task('build:signal', async ctx=> {
  await fs.rmrf('./forex-signal/build')
  await ctx.exec([
    `yarn`,
    `ncc build ./forex-signal/index.ts -t --no-asset-builds -o forex-signal-build`
  ])
})
