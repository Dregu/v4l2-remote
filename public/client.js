connect(window.location.protocol.replace(/http/, 'ws')+'//'+window.location.host+window.location.pathname, 2000)

function connect(wsUri, reconnectMs) {
  var menu = []
  function update(data) {
    menu = []
    var line = data.data.split('\n'), section = -1, ctrlnum = 0
    menu.push({ name: "foo", ctrls: [] }); section = 0; // purkka
    for(var i = 0; i < line.length; i++) {
      // Empty line
      if(line[i].trim() == '') {
        continue
      }
      // Menuitem
      else if(line[i].trim().match(/^[0-9]/)){
        var item = line[i].trim().match(/(\d+)\s*:\s*(.*)/)
        menu[section].ctrls[ctrlnum].menu.push({ key: item[1], value: item[2] })
      }
      // Section header
      else if(line[i].substr(0, 1) != ' ') {
        menu.push({ name: line[i].trim(), ctrls: [] })
        section++
      }
      // Control
      else if(line[i].trim().match(/([^ ]*) 0x.*? \(([^\)]*)\) *: *( min=([^ ]*))?( max=([^ ]*))?( step=([^ ]*))?( default=([^ ]*))?( value=([^ ]*))?( flags=(.*))?$/)) {
        var ctrl = line[i].trim().match(/([^ ]*) 0x.*? \(([^\)]*)\) *: *( min=([^ ]*))?( max=([^ ]*))?( step=([^ ]*))?( default=([^ ]*))?( value=([^ ]*))?( flags=(.*))?$/)
        if(ctrl) {
          menu[section].ctrls.push({ ctrl: ctrl[1], type: ctrl[2], min: ctrl[4], max: ctrl[6], step: ctrl[8], default: ctrl[10], value: ctrl[12], flags: ctrl[14], menu: []})
        }
        ctrlnum = menu[section].ctrls.length-1
      }
    }
    var out = ''
    for(var section = 0; section < menu.length; section++) {
      out += '<section><h2>'+menu[section].name+'</h2>'
      for(var ctrl = 0; ctrl < menu[section].ctrls.length; ctrl++) {
        var my = menu[section].ctrls[ctrl]
        out += '<div class="ctrl"><label for="'+my.ctrl+'">'+my.ctrl+':'
        out += '<input data-id="'+my.ctrl+'" id="'+my.ctrl+'-value" value="'+my.value+'" class="small bind">'
        if(my.type == 'int') {
          out += '<input data-id="'+my.ctrl+'" id="'+my.ctrl+'" type="range" min="'+(my.min||0)+'" max="'+(my.max||100)+'" step="'+(my.step||1)+'" value="'+my.value+'" class="bind">'
        } else if(my.type == 'bool') {
          out += '<select data-id="'+my.ctrl+'" id="'+my.ctrl+'" class="bind"><option value="1"'+(my.value=='1'?' selected="selected"':'')+'>True</option><option value="0"'+(my.value=='0'?' selected="selected"':'')+'>False</option></select>'
        } else if(my.type == 'menu' || my.type == 'intmenu') {
          out += '<select data-id="'+my.ctrl+'" id="'+my.ctrl+'" class="bind">'
          for(var item = 0; item < my.menu.length; item++) {
            out += '<option value="'+my.menu[item].key+'"'+(my.value==my.menu[item].key?' selected="selected"':'')+'>'+my.menu[item].value+'</option>'
          }
          out += '</select>'
        }
        out += '</label></div>'
      }
      out += '</section>'
    }
    document.getElementById('ctrls').innerHTML = out
    var ctrls = document.getElementsByClassName('bind')
    for(var i = 0; i < ctrls.length; i++) {
      ctrls[i].addEventListener('change', function(e) {
        ws.send(JSON.stringify({ ctrl: this.dataset.id, value: this.value }))
      })
    }
  }
  var ws = new WebSocket(wsUri)
  ws.onopen = function (e) {
    console.log('websocket connected')
    ws.onmessage = function (msg) {
      console.log(msg)
      update(msg)
    }
  }
  ws.onclose = function (e) {
    console.log('websocket disconnected')
    if (reconnectMs > 0) {
      setTimeout(function() { connect(wsUri, reconnectMs) }, reconnectMs)
    }
  }
}
