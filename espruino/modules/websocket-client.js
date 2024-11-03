


        
        var strChr = String.fromCharCode;
        
        function buildKey() {
        
              var randomString = btoa(Math.random().toString(36).substr(2, 8)+
                                      Math.random().toString(36).substr(2, 8));
              var toHash = randomString + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
              return {
                source: randomString,
                hashed: btoa(require('crypto').SHA1(toHash))
              }
              
        }

        
        function WebSocket(wsurl,protocols,hdrs,options){
        
              var opts                = URL.parse(wsurl);
              protocols               = protocols||[];
              hdrs                    = hdrs||{};
              options                 = options||{};
              
              this.host               = opts.host;
              this.port               = opts.port || 80;
              this.path               = opts.path || "/";
              this.type               = opts.protocol;
              this.protocolVersion    = 13;
              this.origin             = hdrs.origin || 'Espruino';
              this.keepAlive          = options.keepAlive*1000 || 60000;
              this.masking            = options.masking!==undefined ? options.masking : true;
              this.protocol           = protocols;
              this.lastData           = "";
              this.key                = buildKey();
              this.socket             = null;
              this.connected          = false;
              this.headers            = hdrs || {};
              
        }

        
        WebSocket.prototype.initializeConnection = function () {
        
              if(this.type==='https:'){
                    require('tls').connect({
                          host    : this.host,
                          port    : this.port
                    },this.onConnect.bind(this));
              }else{
                    require("net").connect({
                          host    : this.host,
                          port    : this.port
                    },this.onConnect.bind(this));
              }
              
        };

        
        WebSocket.prototype.onConnect = function (socket) {
        
              this.socket = socket;
              var ws = this;
              socket.on('data', this.parseData.bind(this));
              socket.on('close', function () {
              
                    if (ws.pingTimer) {
                          clearInterval(ws.pingTimer);
                          ws.pingTimer = undefined;
                    }
                    ws.emit('close');
                    
              });
            
              this.handshake();
              
        };

        
        WebSocket.prototype.parseData = function (data) {
                                                                                // see https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
                                                                                // Note, docs specify bits 0-7, etc - but BIT 0 is the MSB, 7 is the LSB
              var ws    = this;
              this.emit('rawData',data);
            
              if(this.lastData.length){
                    data    = this.lastData+data;
                    this.lastData   = "";
              }
            
              if(!this.connected){
                                                                                //  FIXME - not a good idea!
                    if( data.indexOf(this.key.hashed)>-1    &&
                        data.indexOf('\r\n\r\n')>-1         
                    ){
                          this.emit('handshake');
                          this.pingTimer    = setInterval(function(){ws.send('ping',0x89);},this.keepAlive);
                          data    = data.substring(data.indexOf('\r\n\r\n')+4);
                          this.connected    = true;
                          this.emit('open');
                    }
                    this.lastData   = data;
                    return;
              }
            
              while(data.length){
              
                    var offset    = 2;
                    var opcode    = data.charCodeAt(0)&15;
                    var dataLen   = data.charCodeAt(1)&127;
                    if(dataLen==126){
                          dataLen   = data.charCodeAt(3) | (data.charCodeAt(2)<<8);
                          offset   += 2;
                    }else{
                          if(dataLen==127)
                                throw "Messages >65535 in length unsupported";
                    }
                    
                    var pktLen    = dataLen+offset+((data.charCodeAt(1)&128)?4/*mask*/:0);
                    if(pktLen>data.length){
                                                                                //  we received the start of a packet,
                                                                                //  but not enough of it for a full message.
                                                                                //  store it for later, so when we get the next packet
                                                                                //  we can do the whole message
                          this.lastData = data;
                          return;
                    }
                
                    switch(opcode){
                    
                      case 0xA    : 
                                    this.emit('pong');        
                                                                    break;
                      case 0x9    : 
                                    this.send('pong',0x8A);
                                    this.emit('ping');
                                                                    break;
                      case 0x8    :
                                    this.socket.end();
                                                                    break;
                      case 0      :
                      case 1      :
                                    var mask    = [ 0,0,0,0 ];
                                    if(data.charCodeAt(1)&128)                 //  mask
                                          mask    = [
                                                data.charCodeAt(offset++),data.charCodeAt(offset++),
                                                data.charCodeAt(offset++),data.charCodeAt(offset++)
                                          ];
                                    var msg   = "";
                                    for(var i=0;i<dataLen;i++){
                                    
                                          msg += String.fromCharCode(data.charCodeAt(offset++) ^ mask[i&3]);
                                          
                                    }//for
                                    this.emit('message', msg);
                                    break;
                      default     :
                                    console.log("WS: Unknown opcode "+opcode);
                    }//switch
                    data    = data.substr(pktLen);
                    
              }//while
                
        };
        
        WebSocket.prototype.handshake = function () {
        
              var socketHeader = [
                    "GET " + this.path + " HTTP/1.1",
                    "Host: " + this.host,
                    "Upgrade: websocket",
                    "Connection: Upgrade",
                    "Sec-WebSocket-Key: " + this.key.source,
                    "Sec-WebSocket-Version: " + this.protocolVersion,
                    "Origin: " + this.origin
              ];
              if(this.protocol){
                    socketHeader.push("Sec-WebSocket-Protocol: "+this.protocol);
              }
              
              for(var key in this.headers){
              
                    if(this.headers.hasOwnProperty(key)){
                          socketHeader.push(key+": "+this.headers[key]);
                    }
                          
              }//for
             
              this.socket.write(socketHeader.join("\r\n")+"\r\n\r\n");
              
        };
        
        WebSocket.prototype.send = function (msg, opcode) {
        
              opcode      = opcode===undefined ? 0x81 : opcode;
              var size    = msg.length;
              if(msg.length>125){
                    size    = 126;
              }
              this.socket.write(strChr(opcode,size+(this.masking?128:0)));
            
              if(size==126){
                                                                                //  Need to write extra bytes for longer messages
                    this.socket.write(strChr(msg.length>>8));
                    this.socket.write(strChr(msg.length));
              }
            
              if(this.masking){
                    var mask = [];
                    var masked = '';
                    for(var ix=0;ix<4;ix++){
                    
                          var rnd     = Math.floor(Math.random()*255);
                          mask[ix]    = rnd;
                          masked     += strChr(rnd);
                          
                    }//for
                    for(var ix=0;ix<msg.length;ix++){
                    
                          masked   += strChr(msg.charCodeAt(ix)^mask[ix&3]);
                          
                    }//for
                    this.socket.write(masked);
              }else{
                    this.socket.write(msg);
              }
              
        };
        
        WebSocket.prototype.close = function() {
        
              this.socket.end();
              
        };
        
        exports = function(wsurl,protocols,hdrs,options){
        
              var ws = new WebSocket(wsurl,protocols,hdrs,options);
              ws.initializeConnection();
              return ws;
              
        };
        
