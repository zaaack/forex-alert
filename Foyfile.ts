import { ChildProcess } from 'child_process'
import { task, desc, option, fs, setGlobalOptions, execa, sleep, logger } from 'foy'
import { join } from 'path'
import './tools/playback/Foyfile'
const ncc = require('@vercel/ncc')
setGlobalOptions({ loading: false })
task('dev', async (ctx) => {
  // load .env
  fs.readFileSync('./.env', 'utf-8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => /^\w+/.test(s))
    .map((s) => s.split('=').map((s) => s.trim()))
    .map(([k, v]) => ctx.env(k, v.replace(/(^["'])|(["']$)/g, '')))
  //

  let p: ChildProcess | null = null
  // FIXME: @vercel/ncc@0.28.5 https://github.com/vercel/ncc/issues/716

  ctx.pushd('./client').exec('yarn start')
  ncc(join(process.cwd(), './server/index.ts'), {
    watch: true,
    sourceMap: true,
    // v8cache: true, // default
  }).handler(async ({ err, code, map, assets }) => {
    if (!err) {
      const outDir = './dist'
      await fs.rmrf(outDir)
      await fs.outputFile(join(outDir, 'index.js'), code)
      await fs.outputFile(join(outDir, 'index.js.map'), map)
      for (const asset of Object.keys(assets)) {
        const assetPath = outDir + "/" + asset;
        await fs.outputFile(assetPath, assets[asset].source, { mode: assets[asset].permissions });
      }
      while (p && !p.killed && p.exitCode === null) {
        p.kill()
        await sleep(1000)
        logger.info('kill old server')
      }
      p = ctx.cd(process.cwd()).exec(`node ./dist`)
      logger.info('rerun server')
    } else {
      ctx.error(err)
    }
  })
  .rebuild (() => {
    logger.info('rebuild server')
  })

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
