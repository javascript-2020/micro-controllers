/*
 * Copyright (c) 2016-2024  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK Runtime.
 *
 *   The Moddable SDK Runtime is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   The Moddable SDK Runtime is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with the Moddable SDK Runtime.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
/*
websocket client and server

- validate Sec-WebSocket-Accept in client
*/

import {Socket, Listener} from 'socket';
import Logical from 'logical';
import {Digest} from 'crypt';
import Timer from 'timer';
import URL from 'url';
import SecureSocket from 'securesocket';

/*
state:

0 - connecting
1 - sending handshake status
2 - receving handshake headers
3 - connected
4 - done

callback values:

1 - connected socket
2 - websocket handshake complete
3 - message received
4 - closed
5 - sub-protocol(s) (client only)
*/

export class Client {
      constructor(dictionary) {
            // port, host, address, path (everything after port)
            
            
  //host:
  
            if(dictionary.address && !dictionary.host){
                  dictionary.host   = dictionary.address;
            }
            
            
            
            this.path = dictionary.path ?? '/';
            this.host = dictionary.host ?? dictionary.address;
            this.headers = dictionary.headers ?? [];
            this.protocol = dictionary.protocol;
            this.state = 0;
            this.flags = 0;
            
            if (dictionary.socket) this.socket = dictionary.socket;
            else {
                  dictionary.port ??= 80;
                  if (dictionary.Socket)
                        this.socket = new dictionary.Socket(Object.assign({}, dictionary.Socket, dictionary));
                  else this.socket = new Socket(dictionary);
            }
            this.socket.callback = callback.bind(this);
            this.doMask = true;
            
            
            
            var console     = {};
            console.log     = function(){
            
                                    trace([...arguments].join(' ')+'\n');
                                    
                              }//log
            this.console    = console;
            
            this.buffers    = createBuffers(console);
            
            
      } //constructor
      
      write(message) {
            //@@ implement masking
            const type = message instanceof ArrayBuffer ? 0x82 : 0x81;
            if (0x81 === type) message = ArrayBuffer.fromString(message);
            
            const length = message.byteLength;
            // Note: WS spec requires XOR masking for clients, but w/ strongly random mask. We
            // can't achieve that on this device for now, so just punt and use 0x00000000 for
            // a no-op mask.
            if (length < 126) {
                  if (this.doMask) this.socket.write(type, length | 0x80, 0, 0, 0, 0, message);
                  else this.socket.write(type, length, message);
            } else if (length < 65536) {
                  if (this.doMask)
                        this.socket.write(type, 126 | 0x80, length >> 8, length & 0x0ff, 0, 0, 0, 0, message);
                  else this.socket.write(type, 126, length >> 8, length & 0x0ff, message);
            } else throw new Error('message too long');
      } //write
      
      detach() {
            const socket = this.socket;
            delete this.socket.callback;
            delete this.socket;
            return socket;
      } //detach
      
      close() {
            this.socket?.close();
            delete this.socket;
            
            Timer.clear(this.timer);
            delete this.timer;
            
            this.state = 4;
      } //close
} //Client






        function createBuffers(console){
                                                                                //  https://github.com/javascript-2020/code/blob/main/buffers.js
              var buffers                   = {};
              buffers.mem                   = [];
              
              
              buffers.add                   = {};
              
              buffers.add.arraybuffer       = function(buf){
              
                                                    [...arguments].forEach((buf,i)=>{
                                                    
                                                          var uint8   = new Uint8Array(buf);
                                                          buffers.mem.push(uint8);
                                                          
                                                    });
                                                    
                                              }//arraybuffer
                                              
                                              
              var len                       = function(){
              
                                                    var size    = 0;
                                                    buffers.mem.forEach(buf=>(size   += buf.byteLength));
                                                    return size;
                                                    
                                              }//len
              Object.defineProperty(buffers,'len',{get:len});
              
              
              buffers.peek                  = {};
              
              buffers.peek.slice            = function(i1,i2){
              
                                                    var uint8   = buffers.rd(i2+1,false);
                                                    uint8       = uint8.slice(i1,i2+1);
                                                    return uint8;
                                                    
                                              }//peek.slice
                                              
              buffers.peek.uint16           = function(offset){
              
                                                    var uint8     = buffers.peek.slice(offset,offset+2);
                                                    var view      = new DataView(uint8.buffer);
                                                    var num       = view.getUint16(0);
                                                    return num;
                                                    
                                              }//uint16
                                              
              buffers.peek.uint64           = function(offset){
              
                                                    var uint8     = buffers.peek.slice(offset,offset+8);
                                                    var view      = new DataView(uint8.buffer);
                                                    var bigint    = view.getBigUint64(0);
                                                    var num       = Number(bigint);
                                                    return num;
                                                    
                                              }//peek.bigint
                                              
              buffers.peek.number           = function(offset){
              
                                                    var uint8   = buffers.rd(offset+1,false);
                                                    if(!uint8){
                                                          return uint8;
                                                    }
                                                    var num   = uint8[offset];
                                                    return num;
                                                    
                                              }//peek.number
                                              
                                              
              buffers.rd                    = function(len,remove=true){
              
                                                    var info    = [];
                                                    var t       = 0;
                                                    var flag    = false;
                                                    var n       = buffers.mem.length;
                                                    for(var i=0;i<n;i++){
                                                    
                                                          var buf2    = buffers.mem[i];
                                                          if(t+buf2.byteLength>len){
                                                                var n1    = len-t;
                                                                info.push({index:i,num:n1});
                                                                t  += n1;
                                                          }else{
                                                                info.push(i);
                                                                t  += buf2.byteLength;
                                                          }
                                                          if(t==len){
                                                                flag    = true;
                                                                break;
                                                          }
                                                          
                                                    }//for
                                                    
                                                    if(!flag){
                                                          return null;
                                                    }
                                                    
                                                    var t     = len;
                                                    var buf   = new Uint8Array(len);
                                                    var buf2;
                                                    var buf3;
                                                    var n     = info.length;
                                                    for(var j=n-1;j>=0;j--){
                                                    
                                                          var o = info[j];
                                                          if(typeof o=='number'){
                                                                buf2    = buffers.mem[o];
                                                                t      -= buf2.byteLength;
                                                                buf.set(buf2, t);
                                                          } else {
                                                                buf2    = buffers.mem[o.index];
                                                                buf3    = buf2.slice(0, o.num);
                                                                t      -= o.num;
                                                                buf.set(buf3, t);
                                                          }
                                                          
                                                    }//for
                                                    
                                                    if(remove){
                                                          var n   = info.length;
                                                          for(var j=n-1;j>=0;j--){
                                                          
                                                                var o   = info[j];
                                                                if(typeof o=='number'){
                                                                      buffers.mem.splice(o, 1);
                                                                }else{
                                                                      buf3    = buf2.slice(n1);
                                                                      buffers.mem.splice(o.index, 1, buf3);
                                                                }
                                                                
                                                          } //for
                                                    }//remove
                                                    
                                                    return buf;
                                                    
                                              }//rd
                                              
                                              
              buffers.display               = function (pretty = true) {
                                                                                console.log('buffers :', buffers.mem.length);
                                                    buffers.mem.forEach(uint8 => {
                                                    
                                                          var n     = uint8.length;
                                                          var str   = '';
                                                          for(var i=0;i<n;i++){
                                                          
                                                                var b   = uint8[i];
                                                                str    += b+' ';
                                                                
                                                          }//for
                                                                                console.log(str);
                                                    });
                                                    
                                              }//display
                                              
              return buffers;
              
        }//createBuffers
        
        
        
        
function callback(message, value) {
      var console = this.console;
                                                                                console.log('client.callback',message);
      let socket = this.socket;
      
      if (1 == message) {
            // connected
            if (0 != this.state) throw new Error('socket connected but ws not in connecting state');
            
            this.callback(Client.connect); // connected socket
            if (4 === this.state) return;
            
            let key = new Uint8Array(16);
            for (let i = 0; i < 16; i++) key[i] = (Math.random() * 256) | 0;
            
            let response = [
                  'GET ',
                  this.path,
                  ' HTTP/1.1\r\n',
                  'Host: ',
                  this.host,
                  '\r\n',
                  'Upgrade: websocket\r\n',
                  'Connection: keep-alive, Upgrade\r\n',
                  'Sec-WebSocket-Version: 13\r\n',
                  'Sec-WebSocket-Key: ',
                  key.toBase64() + '\r\n',
            ];
            
            if (this.protocol) response.push(`Sec-WebSocket-Protocol: ${this.protocol}\r\n`);
            
            let hdr = undefined;
            if (this.headers)
                  for (let w of this.headers) {
                        if (hdr === undefined) {
                              hdr = w;
                        } else {
                              response.push(`${hdr}: ${w}\r\n`);
                              hdr = undefined;
                        }
                  }
            if (hdr != undefined) throw new Error('invalid header array: need a value for every header');
            
            response.push('\r\n');
            socket.write.apply(socket, response);
            
            delete this.path;
            delete this.host;
            delete this.headers;
            delete this.protocol;
            
            this.state = 1;
      } // connected
      
      if (2 == message) {
            // data available to read
            
            if (1 === this.state) {
                  let line = socket.read(String, '\n');
                  if ('HTTP/1.1 101' !== line.substring(0, 12)) {
                        trace('web socket upgrade failed\n');
                        this.callback(Client.disconnect);
                        this.close();
                        return;
                  }
                  this.state = 2;
                  this.line = undefined;
                  this.flags = 0;
            } //state=1
            
            if (2 === this.state) {
                  while (true) {
                        let line = socket.read(String, '\n');
                        if (!line) return; // out of data. wait for more.
                        
                        if (this.line) {
                              line = this.line + line;
                              this.line = undefined;
                        }
                        
                        if (10 != line.charCodeAt(line.length - 1)) {
                              // partial header line, accumulate and wait for more
                              trace('partial header!!\n'); //@@ untested
                              this.line = line;
                              return;
                        }
                        
                        if ('\r\n' == line) {
                              // empty line is end of headers
                              if (7 == this.flags) {
                                    this.callback(Client.handshake); // websocket handshake complete
                                    if (4 === this.state) return;
                                    this.state = 3; // ready to receive
                                    value = socket.read();
                              } else {
                                    this.callback(Client.disconnect); // failed
                                    this.state = 4; // close state
                                    return;
                              }
                              delete this.flags;
                              delete this.line;
                              value = socket.read(); // number of bytes available
                              if (!value) return;
                              break;
                        }
                        
                        let position = line.indexOf(':');
                        let name = line.substring(0, position).trim().toLowerCase();
                        let data = line.substring(position + 1).trim();
                        
                        if ('connection' == name) {
                              if ('upgrade' == data.toLowerCase()) this.flags |= 1;
                        } else if ('sec-websocket-accept' == name) {
                              this.flags |= 2; //@@ validate data
                        } else if ('upgrade' == name) {
                              if ('websocket' == data.toLowerCase()) this.flags |= 4;
                        }
                  }
            } //state=2
            
            
            
  //receive:
  
            if(3===this.state){
                                                                                //  receive message
                                                                                var df        = true;
                  var buffers   = this.buffers;
                  
                  var exit      = false;
                  while(!exit){
                  
                        var buf   = socket.read(ArrayBuffer,value);
                                                                                df && console.log('receive message',buf.byteLength);
                        buffers.add.arraybuffer(buf);
                                                                                df && buffers.display();
                        if(buffers.len<2){
                              return;
                        }
                        
                        let tag         = buffers.peek.number(0);
                        var frameType   = tag & 0x0f;
                        let length      = buffers.peek.number(1);
                        let mask        = 0 != (length & 0x80);
                        length         &= 0x7f;
                        var offset      = 2;
                        
                        if(126==length){
                              if(buffers.len<offset+2){
                                    return;
                              }
                              length    = buffers.peek.uint16(2);
                              offset   += 2;
                        }else{
                              if(127==length){
                                    if(buffers.len<offset+8){
                                          return;
                                    }
                                    length    = buffers.peek.uint64(2);
                                    offset   += 8;
                              }
                        }
                        var total   = length+offset;
                                                                                df && console.log('tag',tag,frameType);
                                                                                df && console.log('mask',mask);
                                                                                df && console.log('length',length);
                                                                                df && console.log('offset',offset);
                                                                                df && console.log('total',total);
                                                                                df && console.log('buffers',buffers.len);
                        if(buffers.len<total){
                                                                                df && console.log('more data required');
                              return;
                        }
                                                                                df && console.log('frame complete');
                                                                                
                        var uint8   = buffers.rd(total);
                        uint8       = uint8.slice(offset);
                                                                                df && console.log('frameType',frameType);
                        switch(frameType){
                        
                              case 1  :                                         //  text
                              case 2  :                                         //  binary
                                                                                df && console.log(frameType == 1 ? 'text' : 'binary', 'received');
                                        if(mask){
                                              mask    = uint8.slice(0,4);
                                              uint8   = uint8.slice(4);
                                              Logical.xor(uint8.buffer,mask.buffer);
                                        }
                                        
                                        var data      = uint8.buffer;
                                        if(frameType===1){
                                              data    = String.fromArrayBuffer(data);
                                        }
                                        
                                        this.callback(Client.receive,data);
                                        
                                        break;
                                        
                              case 8  :                                         //  close
                                                                                df && console.log('close received');
                                        this.state    = 4;
                                        this.callback(Client.disconnect);
                                        this.close();
                                        return;
                                        
                              case 9  :                                         //  ping
                                                                                df && console.log('ping received');
                                        if(length){
                                                                                //  writes back application data
                                                                                //  assumes length is 125 or less
                                              socket.write(0x8a,length,uint8.buffer);
                                        }else{
                                              socket.write(0x8a,0);
                                        }
                                        
                                        break;
                                        
                              case 10 :                                         //  pong
                                                                                df && console.log('pong received');
                                    break;
                                    
                              default:
                                                                                df && console.log('unrecognized frame type');
                                    throw new Error('websocket.js message.received, unrecognised frame type');
                                    break;
                                    
                        }//switch
                        
                        if(buffers.len==0){
                              exit    = true;
                        }
                        
                  }//while
                  
            }//receive message
            
      }// data available to read
      
      
      
      if (message < 0) {
            if (this.state !== 4) {
                  this.callback(Client.disconnect);
                  this.close();
                  this.state = 4;
            }
      }
      
      
      
} //callback




export class Server {
      #listener;
      constructor(dictionary = {}) {
            if (null === dictionary.port) return;
            
            this.#listener = new Listener({port: dictionary.port ?? 80});
            this.#listener.callback = () => {
                  const request = addClient(new Socket({listener: this.#listener}), 1, this.callback);
                  request.callback(Server.connect, this); // tell app we have a new connection
            };
      }
      close() {
            this.#listener?.close();
            this.#listener = undefined;
      }
      attach(socket) {
            const request = addClient(socket, 2, this.callback);
            request.timer = Timer.set(() => {
                  delete request.timer;
                  request.callback(Server.connect, this); // tell app we have a new connection
                  socket.callback(2, socket.read());
            });
      }
}

function addClient(socket, state, callback) {
      const request = new Client({socket});
      delete request.doMask;
      socket.callback = server.bind(request);
      request.state = state;
      request.callback = callback; // transfer server.callback to request.callback
      return request;
}

/*
callback for server handshake. after that, switches to client callback
*/

function server(message, value, etc) {
      let socket = this.socket;
      
      if (!socket) return;
      
      if (2 == message) {
            if (1 === this.state || 2 === this.state) {
                  while (true) {
                        let line = socket.read(String, '\n');
                        if (!line) return; // out of data. wait for more.
                        
                        if (this.line) {
                              line = this.line + line;
                              this.line = undefined;
                        }
                        
                        if (10 != line.charCodeAt(line.length - 1)) {
                              // partial header line, accumulate and wait for more
                              trace('partial header!!\n'); //@@ untested
                              this.line = line;
                              return;
                        }
                        
                        if ('\r\n' == line) {
                              // empty line is end of headers
                              if (15 !== this.flags) throw new Error('not a valid websocket handshake');
                              
                              delete this.line;
                              delete this.flags;
                              
                              let sha1 = new Digest('SHA1');
                              sha1.write(this.key);
                              delete this.key;
                              sha1.write('258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
                              
                              let response = [
                                    'HTTP/1.1 101 Web Socket Protocol Handshake\r\n',
                                    'Connection: Upgrade\r\n',
                                    'Upgrade: websocket\r\n',
                                    'Sec-WebSocket-Accept: ',
                                    new Uint8Array(sha1.close()).toBase64(),
                                    '\r\n',
                              ];
                              
                              if (this.protocol) {
                                    response.push('Sec-WebSocket-Protocol: ', this.protocol, '\r\n');
                                    delete this.protocol;
                              }
                              response.push('\r\n');
                              
                              socket.write.apply(socket, response);
                              
                              this.callback(Server.handshake); // websocket handshake complete
                              
                              this.state = 3;
                              socket.callback = callback.bind(this);
                              value = socket.read(); // number of bytes available
                              if (0 !== value)
                                    // should be 0. unexpected to receive a websocket message before server receives handshake
                                    socket.callback(2, value);
                              return;
                        }
                        
                        if (1 === this.state) {
                              // parse status line: GET / HTTP/1.1
                              line = line.split(' ');
                              if (line.length < 3) throw new Error('unexpected status format');
                              if ('GET' != line[0]) throw new Error('unexpected GET');
                              if ('HTTP/1.1' != line[line.length - 1].trim()) throw new Error('HTTP/1.1');
                              //@@ could provide path to callback here
                              this.state = 2;
                              this.flags = 0;
                        } else if (2 === this.state) {
                              let position = line.indexOf(':');
                              let name = line.substring(0, position).trim().toLowerCase();
                              let data = line.substring(position + 1).trim();
                              
                              if ('upgrade' === name) this.flags |= data.toLowerCase() === 'websocket' ? 1 : 0;
                              else if ('connection' === name) {
                                    // Firefox: "Connection: keep-alive, Upgrade"
                                    data = data.split(',');
                                    for (let i = 0; i < data.length; i++)
                                          this.flags |= data[i].trim().toLowerCase() === 'upgrade' ? 2 : 0;
                              } else if ('sec-websocket-version' === name)
                                    this.flags |= data.toLowerCase() === '13' ? 4 : 0;
                              else if ('sec-websocket-key' === name) {
                                    this.flags |= 8;
                                    this.key = data;
                              } else if ('sec-websocket-protocol' === name) {
                                    data = data.split(',');
                                    for (let i = 0; i < data.length; ++i) data[i] = data[i].trim().toLowerCase();
                                    const protocol = this.callback(Server.subprotocol, data);
                                    if (protocol) this.protocol = protocol;
                              }
                        }
                  }
            }
      }
      
      if (message < 0) {
            this.callback(Client.disconnect);
            this.close();
      }
}




  //WebSocket:
  
  
        WebSocket.CONNECTING    = 0;
        WebSocket.OPEN          = 1;
        WebSocket.CLOSING       = 2;
        WebSocket.CLOSED        = 3;
        
        
        export function WebSocket(url,protocols,options){
                                                                                var df    = true;
                                                                                if(options && 'df' in options){
                                                                                      df    = options.df;
                                                                                }
                                                                                var console   = {};
                                                                                console.log   = function(){trace([...arguments].join(' ')+'\n')};
              var listeners                 = {};
              listeners.open                = [];
              listeners.close               = [];
              listeners.message             = [];
              listeners.error               = [];
              
              
              var ws                        = {};
              ws[Symbol.toStringTag]        = 'WebSocket';
              ws.readyState                 = WebSocket.CONNECTING;
              ws.url                        = url;
              ws.extensions                 = '';
              ws.protocol                   = '';
              ws.bufferedAmount             = 0;
              ws.binaryType                 = 'arraybuffer';
              
              ws.onopen                     = null;
              ws.onclose                    = null;
              ws.onerror                    = null;
              ws.onmessage                  = null;
              
              ws.send                       = function(txt){socket.write(txt)};
              ws.send.json                  = function(json){ws.send(JSON.stringify(json,null,4))};
              ws.close                      = function(){socket.close()};
              
              ws.addEventListener           = addeventlistener;
              ws.removeEventListener        = removeeventlistener;
              ws.on                         = on;
              ws.removeListener             = removelistener;
              
              
              var opts                      = build();
              var socket                    = new Client(opts);
              socket.callback               = callback;
              
              
              return ws;
              
              
              function callback(message,value){
                                                                                df && console.log('callback',message);
                    switch(message){
                    
                      case Client.connect           :
                                                                                df && console.log('websocket connected');
                                                      break;
                      case Client.handshake         :
                                                                                df && console.log('websocket handshake');
                                                      ws.readyState   = WebSocket.OPEN;
                                                      if(typeof ws.onopen=='function'){
                                                            ws.onopen();
                                                      }
                                                      call('open');
                                                      
                                                      break;
                      case Client.receive           :
                                                                                df && console.log('websocket receive');
                                                                                df && console.log(value);
                                                      var e   = {data:value};
                                                      if(typeof ws.onmessage=='function'){
                                                            ws.onmessage(e);
                                                      }
                                                      call('message',e);
                                                      
                                                      break;
                      case Client.disconnect        :
                                                                                df && console.log('websocket disconnected');
                                                      ws.readyState   = WebSocket.CLOSED;
                                                      if(typeof ws.onclose=='function'){
                                                            ws.onclose();
                                                      }
                                                      call('close');
                                                      
                                                      break;
                    }//switch
                    
              }//callback
              
              
              function call(name,args=[]){
              
                    if(!Array.isArray(args)){
                          args    = [args];
                    }
                    listeners[name].forEach(o=>o.callback.apply(null,args));
                    
              }//call
              
              
              function removelistener(name,callback){
              
                    removeeventlistener(name,callback,false);
                    
              }//removelistener
              
              
              function on(name,callback){
              
                    addeventlistnener(name,callback,false);
                    
              }//on
              
              
              function removeeventlistener(name,callback,capture){
              
                    if(!listeners[name]){
                          return;
                    }
                    var index   = listeners[name].findIndex(o=>o.name===name && o.callback===callback && o.capture===capture);
                    if(index==-1){
                          return;
                    }
                    listeners[name].splice(index,1);
                    
              }//removeeventlistener
              
              
              function addeventlistener(name,callback,capture){
              
                    if(!listeners[name]){
                          return;
                    }
                    listeners[name].push({callback,capture});
                    
              }//addeventlistener
              
              
              function build(){
              
                    var parts   = new URL(url);
                    var opts    = {};
                    
                    
                    if(parts.protocol=='ws:'){
                          opts.port                   = parts.port||80;
                    }else{
                          opts.port                   = parts.port||443;
                          opts.Socket                 = SecureSocket;
                          opts.secure                 = {};
                          opts.secure.verify          = false;
                          if(options && 'rejectUnauthorized' in options){
                                opts.secure.verify    = options.rejectUnauthorized;
                          }
                          if(options && 'verify' in options){
                                opts.secure.verify    = options.verify;
                          }
                    }
                    
                    if(ip(parts.hostname)){
                          opts.address                = parts.hostname;
                    }else{
                          opts.host                   = parts.hostname;
                    }
                    opts.path             = parts.pathname;
                    
                    if(options && options.headers){
                          opts.headers    = options.headers;
                    }
                    
                    return opts;
                    
              }//build
              
              
              function ip(value){
              
                    var parts   = value.split('.');
                    if(parts.length!=4){
                          return false;
                    }
                    
                    for(var i=0;i<4;i++){
                    
                          var num     = parts[i];
                          var n       = Math.floor(Number(num));
                          var test    = (String(n)===num && n!==Infinity && n>=0);
                          if(!test){
                                return false;
                          }
                          
                    }//for
                    return true;
                    
              }//ip
              
        }//WebSocket
        
        
        
        
Server.connect = 1;
Server.handshake = 2;
Server.receive = 3;
Server.disconnect = 4;
Server.subprotocol = 5;
Object.freeze(Server.prototype);

Client.connect = 1;
Client.handshake = 2;
Client.receive = 3;
Client.disconnect = 4;
Object.freeze(Client.prototype);

export default Object.freeze({
      Client,
      Server,
      WebSocket,
});
