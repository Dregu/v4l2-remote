var exec = require('child_process').exec
var express = require('express')
var expressWs = require('express-ws')
var expressWs = expressWs(express())
var app = expressWs.app

app.use(express.static('public'))

var aWss = expressWs.getWss('/')

app.ws('/', (ws, req) => {
  console.log('Socket Connected')

  ws.onmessage = (msg) => {
    var data = JSON.parse(msg.data)
    if(data.ctrl !== undefined && data.value !== undefined) {
      exec('v4l2-ctl -c '+data.ctrl+'='+data.value, (error, stdout, stderr) => {
        if(error) {
          console.error('error: '+error)
        }
        update()
      })
    }
  }
  update()
})

var broadcast = (data) => {
  aWss.clients.forEach((client) => {
    client.send(data)
  })
}

var update = () => {
  exec('v4l2-ctl --list-ctrls-menus', (error, stdout, stderr) => {
    if(error) {
      console.error('error: '+error)
      return
    }
    broadcast(stdout)
  })
}

app.get('/', (req, res, next) => {
  res.sendFile('public/index.html')
})

app.listen(8002)
