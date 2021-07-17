// import net from 'net'
// import { fs, logger } from 'foy'

// const PIPE_NAME = '/tmp/mt4_emacross'
// const PIPE_PATH =
//   (process.platform === 'win32' ? '\\\\.\\pipe\\' : '') + PIPE_NAME

// let L = logger.log

// let server = net.createServer(function (socket) {
//   L('Server: on connection')

//   socket.on('data', function (c) {
//     L('Server: on data:', c.toString())
//   })

//   socket.on('end', function () {
//     L('Server: on end')
//     server.close()
//   })

//   socket.write('Take it easy!')
// })

// server.on('close', function () {
//   L('Server: on close')
// })
// // 如果ipc文件已经存在则先删除
// if (fs.existsSync(PIPE_PATH)) {
//     fs.unlinkSync(PIPE_PATH)
// }
// server.listen(PIPE_PATH, function () {
//   L('Server: on listening')
// })

// // == Client part == //
// let client = net.connect(PIPE_PATH, function () {
//   L('Client: on connection')
// })

// client.on('data', function (data) {
//   L('Client: on data:', data.toString())
//   client.write('from client')
//   client.end('Thanks!')
// })

// client.on('end', function () {
//   L('Client: on end')
// })
