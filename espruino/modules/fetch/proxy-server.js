


/*

//espruino-fetch-proxy:d

03-11-24

*/


                var port        = process.argv[2] || 3003;
                
                                  require('base');
                var wsmod       = require(base.libs.node+'wsmod/v2.0/wsmod-v2.0.js');
                wsmod           = wsmod();
                
                var http        = require('http');
                var https       = require('https');
                console.json    = v=>console.log(JSON.stringify(v,null,4));
                
                
                var server      = http.createServer(request).listen(port);
                                                                                console.log(`http://[all-interfaces]:${port}/`);
                                                                                
                async function request(req,res){
                                                                                console.log(req.url);
                      var body    = '';
                      for await(data of req){
                      
                            body   += data;
                            
                      }//for
                      
                      if(req.url=='/websocket'){
                            websocket(body,res);
                            return;
                      }
                      
                      
                      var {url,opts,body,buffer,time}   = JSON.parse(body);
                      proxy(res,url,opts,body,buffer,time);
                                                                                console.log(url);
                }//request
                
                
                function proxy(res,url,opts,body,buffer,time){
                
                      var mod     = opts.protocol=='http:' ? http : https;
                      var req2    = mod.request(url,opts,res2=>response(url,res,res2,buffer,time));
                      req2.end(body);
                      
                }//proxy
                
                
                async function response(url,res,res2,buffer,time){
                                                                                //console.json(res2.headers);
                      switch(url){
                      
                        //case 'https://stackoverflow.com/users/login'    :
                        //case 'https://chat.stackoverflow.com/'          :
                                                                          //proxy_ext(res,res2);
                                                                          //return;
                      }//switch
                      
                      
                      res.write(JSON.stringify(res2.headers)+'--hdrs--');
                      
                      var buf   = '';
                      
                      res2.on('data',data=>{
                                                                                //console.log('res2',data.toString());
                            buf  += data;
                            
                      });
                      
                      res2.on('end',()=>{
                                                                                console.log('end',buf.length);
                            send();
                            
                      });
                      
                      
                      function send(){
                      
                            if(!buf.length){
                                                                                console.log('complete');
                                  res.end();
                                  return;
                            }
                            
                            var b   = buf.slice(0,buffer);
                            buf     = buf.slice(buffer);
                            
                            res.write(b);
                            setTimeout(send,time);
                            
                      }//send
                      
                }//response
                
                
                async function proxy_ext(res,res2){
                
                      var body    = '';
                      for await( data of res2){
                      
                            body   += data;
                            
                      }//for
                                                                                console.log(body.length);
                      var i               = body.indexOf('name="fkey"');
                      var i1              = body.indexOf('value="',i)+7;
                      var i2              = body.indexOf('"',i1);
                      var fkey            = body.slice(i1,i2);
                      res2.headers.fkey   = fkey;
                      var data            = JSON.stringify(res2.headers)+'--hdrs--';
                      
                      res.write(data);
                      res.end();
                      
                }//proxy_ext
                
  //:
  
                var mem    = [];
                server.on('upgrade',upgrade);
                
                
                function websocket(body,res){
                
                      var {url,hdrs}    = JSON.parse(body);
                                                                                console.log('websocket',url);
                      var wsurl   = gen();
                      mem.push({wsurl,url,hdrs});
                      res.end(wsurl);
                      
                      function gen(){
                      
                            var s   = Math.random()+'';
                            var i   = s.indexOf('.');
                            s       = s.slice(i+1);
                            return s;
                            
                      }//gen
                      
                }//websocket
                
                
                async function upgrade(req,socket,head){
                                                                                console.log('upgrade',req.url);
                      var index         = mem.findIndex(o=>'/'+o.wsurl==req.url);
                      var {url,hdrs}    = mem[index];
                      mem.splice(index,1);
                      console.log(url,hdrs);
                      var dest      = await wsmod.client(url,hdrs,onrec2,onerror2,onclose2);
                      var source    = wsmod.upgrade.server(req,socket,onrec,onerror,onclose);
                      
  //source:-
                      function onrec(payload,type){
                      }//onmsg
                      
                      function onerror(err){
                                                                                console.log('esp32 error',err);
                            source.close();
                            dest.close();
                            
                      }//onerror
                      
                      function onclose(){
                                                                                console.log('esp32 close');
                            dest.close();
                            
                      }//onclose
                      
  //dest:-
                      function onrec2(payload,type){
                      
                            var txt   = payload.toString();
                            source.send.text(txt);
                                                                                console.log(txt);
                      }//rec
                      
                      function onerror2(err){
                                                                                console.log('stackoverflow error',err);
                            source.close();
                            dest.close();
                            
                      }//onerror2
                      
                      function onclose2(){
                                                                                console.log('stackoverflow close');
                            source.close();
                            
                      }//onclose2
                      
                }//upgrade
                
                
                
                
                
  //:
  //debug:
  
                if(0){
                
                      server.on('connection',socket=>{
                      
                            socket.on('data',data=>{
                                                                                console.log('read');
                                                                                console.log(data.toString());
                                                                                console.log('-- read --');
                            });
                            
                            
                            var write       = socket.write;
                            socket.write    = function(data,encoding,callback){
                                                                                console.log('write');
                                                                                console.log(data.toString());
                                                                                console.log('-- write --');
                                  write.apply(socket,arguments);
                                  
                            }//write
                            
                      });//connection
                      
                }
                
                
                
                
                
