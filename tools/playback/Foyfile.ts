import { task, desc, option, fs, setGlobalOptions, namespace } from 'foy'
import dayjs from "dayjs";
import * as readline from 'readline'


setGlobalOptions({ loading: false })

const symbol = 'EURUSD'

const txtFile = `/Users/z/Downloads/${symbol}.txt`
const sqlFile = `/Users/z/Downloads/${symbol}.sql`
// playback
namespace('pb', () => {
  task('txt2sql', async ctx => {
    let stream=fs.createReadStream(txtFile)
    const rl = readline.createInterface(stream)
    let sqls: string[] = []
    await fs.writeFile(sqlFile, `
  PRAGMA foreign_keys = false;
  PRAGMA temp_store=2;
  PRAGMA synchronous=OFF;
  PRAGMA journal_mode=MEMORY;

  DROP TABLE IF EXISTS "${symbol}_M1";
  CREATE TABLE "${symbol}_M1" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "time" DATETIME NOT NULL,
      "open" REAL NOT NULL,
      "high" REAL NOT NULL,
      "low" REAL NOT NULL,
      "close" REAL NOT NULL,
      "volume" REAL NOT NULL
  );
  CREATE INDEX "${symbol}_M1.time_index" ON "${symbol}_M1"("time");

  BEGIN;

    `)
    let id = 1;
    for await (const line of rl) {
      if (line[0]==='<') continue
      const [symbol,date, time, open, high, low, close, volume] = line.split(',')
      const timestamp = dayjs(date+' '+time, 'YYYYMMDD HHmmss')
      // YYYY-MM-DD HH:mm:ss
      // 2003-02-20T17:28:00.000Z
      // 2004-06-09T10:03:00.000Z 1010000
      // 2004-07-28T20:20:00.000Z 1060000
      sqls.push(`INSERT INTO "${symbol}_M1" VALUES (${id}, '${timestamp.format('YYYY-MM-DD HH:mm:ss')}', ${open}, ${high}, ${low}, ${close}, ${volume});\n`)
      if (id % 10000 === 0) {
        await fs.appendFile(sqlFile, sqls.join(''))
        sqls = []
        console.log('id', id)
      }
      id++
    }
    await fs.appendFile(sqlFile, sqls.join(''))
    sqls = []
    await fs.appendFile(sqlFile, `\nCOMMIT;`)
  })
  task('readsql', async ctx => {
    console.time('readsql')
    await ctx.exec(`sqlite3 ./tools/playback/database/${symbol}.db ".read ${sqlFile}"`)
    console.timeEnd('readsql')
  })
})
