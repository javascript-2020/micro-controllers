

/*

//espruino.fetch:d

17-11-24



fetch.proxy requires the global variable FETCH_PROXY to be set specifying the proxy url



*/




        function fetch(url,opts,params){
                                                                                fetch.debug && console.log('fetch',url);
              var v             = fetch.opts(url,opts);
              var opts          = v.opts;
              var body          = v.body;
                                                                                fetch.debug>1 && console.json(opts);
              var ctx           = fetch.req.create(params);
              ctx.url           = url;
              ctx.request       = fetch.request(opts,res=>fetch.response(ctx,res));
              
              fetch.error(ctx,'req');
              ctx.request.end(body);
              
              return ctx.req.promise;
              
        }//fetch
        
        fetch.response=function(ctx,res){
                                                                                fetch.debug && console.log('fetch.response',ctx.url);
                                                                                fetch.debug>1 && console.json(res.headers);
              ctx.response    = res;
              
              fetch.data(ctx);
              
              fetch.error(ctx,'res');
              fetch.close(ctx);
              fetch.res.create(ctx);
              
        }//response
        
  //:
  
        fetch.proxy=function(url,opts,params){
                                                                                fetch.debug && console.log('fetch.proxy',url);
              params                = params||{};
              
              var v                 = fetch.opts(url,opts);
              var opts              = v.opts;
              var body              = v.body;
              
              var proxy_params      = {url,opts,body};
              proxy_params.buffer   = params.buffer||256;
              proxy_params.time     = params.time||100;
              
              body                  = JSON.stringify(proxy_params);
              var proxy_opts        = {method:'post',body};
              var proxy             = fetch.opts(fetch.proxy.url,proxy_opts);
                                                                                //console.json(proxy.opts);
              var ctx               = fetch.req.create(params);
              ctx.url               = url;
              ctx.request           = fetch.request(proxy.opts,res=>fetch.proxy.response(ctx,res));
              
              fetch.error(ctx,'req');
              ctx.request.end(proxy.body);
              
              return ctx.req.promise;
              
        }//fetch.proxy
        
        fetch.proxy.response=function(ctx,res){
                                                                                fetch.debug && console.log('fetch.proxy.response',ctx.url);
              ctx.response    = res;
              
              var hdr   = '';
              
              function ondata(data){
              
                    if(!ctx.obj.headers){
                          hdr    += data;
                          var i   = hdr.indexOf('--hdrs--');
                          if(i==-1){
                                return;
                          }
                          var hdrs          = hdr.slice(0,i);
                          ctx.obj.headers   = JSON.parse(hdrs);
                                                                                //console.log('fetch.proxy.response.headers');
                                                                                fetch.debug && console.json(ctx.obj.headers);
                          ctx.req.resolve(ctx.obj);
                          data    = hdr.slice(i+8);
                    }
                    
                    if(ctx.on.data){
                          ctx.on.data(data);
                    }else{
                          ctx.body   += data;
                    }
                    
              }//ondata
              
              res.on('data',ondata);
              
              fetch.error(ctx,'res');
              fetch.close(ctx);
              fetch.res.create(ctx,'proxy');
              
        }//response
  //:
        fetch.parse=function(url,opts){
                                                                                //console.log('fetch.parse');
                                                                                //console.log(url);
                                                                                //console.json(opts);
              var params        = URL.parse(url);
                                                                                //console.json(params);
                                                                                
              opts.protocol     = params.protocol;
              
              opts.host         = params.host;
              
              opts.port         = params.port;
              
              opts.path         = params.pathname;
              
              if(params.hash){
                    opts.path  += params.hash;
              }
              
              if(params.username){
                    opts.auth   = params.username+':'+params.password;
              }
              
        }//parse
        
        fetch.opts=function(url,opts){
        
              opts        = opts||{};
              var opts2   = {
                    method    : 'GET',
                    headers   : {}
              };
              
              fetch.parse(url,opts2);
              
              Object.assign(opts2.headers,opts.headers);
              
              if(opts2.protocol=='https:'){
                    opts2.rejectUnauthorized   = false;
              }
              
              !(opts.headers && opts.headers.accept) && (opts2.headers.accept='*/*');
              !(opts.headers && opts.headers['accept-language']) && (opts2.headers['accept-language']='*');
              !(opts.headers && opts.headers['sec-fetch-mode']) && (opts2.headers['sec-fetch-mode']='cors');
              !(opts.headers && opts.headers['user-agent']) && (opts2.headers['user-agent']='node');
              
              var body    = opts.body;
              delete opts.body;
              
              if(body){
                    !(opts.headers && opts.headers['content-type']) && (opts2.headers['content-type']='text/plain;charset=UTF-8');
                    !(opts.headers && opts.headers['content-length']) && (opts2.headers['content-length']=body.length);
              }
              
              opts.method && (opts2.method=opts.method.toUpperCase())
              
              return {opts:opts2,body};
              
        }//opts
        
        fetch.timeout=function(ctx){
        
              var time      = 60000;
              
              function timeout(){
                                                                                console.log('fetch.timeout');
                    var err   = new Error('fetch timeout');
                    ctx.req.reject(err);
                    if(ctx.on.timeout){
                          ctx.on.timeout();
                    }
                    
              }//timeout
              
              ctx.timer   = setTimeout(timeout,time);
              
        }//timeout
        
        fetch.error=function(ctx,type){
        
              function error(err){
                                                                                console.log(`fetch.${type}.error`);
                                                                                console.json(err);
                    clearTimeout(ctx.timer);
                    ctx[type].reject(err);
                    if(ctx.on.error){
                          ctx.on.error(err);
                    }
                    
              }//error
              
              ctx[type].on('error',error);
              
        }//error
        
        fetch.data=function(ctx){
        
              function ondata(data){
              
                    if(ctx.on.data){
                          ctx.on.data(data);
                    }else{
                          ctx.body    += data;
                    }
                    
              }//ondata
              
              ctx.response.on('data',ondata);
              
        }//data
        
        fetch.close=function(ctx){
        
              ctx.close=function(){
                                                                                fetch.debug && console.log('fetch.response.close',ctx.body.length);
                    ctx.res.resolve(ctx.body);
                    if(ctx.on.close){
                          ctx.on.close(ctx.body);
                    }
                    
                    
              }//onclose
              
              ctx.response.on('close',ctx.close);
              
        }//close
        
        fetch.req   = {};
        fetch.res   = {};
        
        fetch.req.create=function(params){
        
              params            = params||{};
              
              var ctx           = {};
              ctx.req           = {};
              ctx.res           = {};
              ctx.body          = '';
              
              ctx.on            = {};
              ctx.on.data       = params.ondata;
              ctx.on.error      = params.onerror;
              ctx.on.close      = params.onclose;
              ctx.on.timeout    = params.timeout;
              
              ctx.req.promise   = new Promise((res,rej)=>(ctx.req.resolve=res,ctx.req.reject=rej));
              fetch.timeout(ctx);
              return ctx;
              
        }//create
        
        fetch.res.create=function(ctx,proxy){
        
              clearTimeout(ctx.timer);
              
              var promise         = new Promise((res,rej)=>(ctx.res.resolve=res,ctx.res.reject=rej));
              
              ctx.obj             = {};
              ctx.obj.text        = function(){return promise};
              ctx.obj.json        = function(){return ctx.obj.text().then(JSON.parse)};
              ctx.obj.complete    = function(){return promise};
              
              !proxy && ctx.req.resolve(ctx.obj);
              
        }//create
        
  //:
  
        fetch.request=function(opts,callback){
        
              var result    = fetch.request[fetch.mode](opts,callback);
              return result;
              
        }//request
        
        fetch.request.espruino=function(opts,callback){
        
              var req   = http.request(opts,function(res){
              
                    callback(res);
                    
              });
              return req;
              
        }//espruino
        
        fetch.request.moddable=function(){
        
              let request   = new Request({
                  host        : 'raw.githubusercontent.com',
                  path        : '',
                  response    : String,
              		port        : 443,
              		Socket      : SecureSocket,
              		method      : 'get'
              });
              
              request.callback = function(message,value,etc){
              
                    if (Request.responseFragment === message) {
                  		let text = this.read(String);
                  		characterCount += text.length;
                  		trace(text);
                  	}
                   
                  	if (Request.header === message)
                  		trace(`${value}: ${etc}\n`);
                    
                  	if (Request.responseComplete === message)
                  		trace(value + "\n");
                    
              }
              
        }//request
  //:
        fetch.proxy.url     = FETCH_PROXY;
        fetch.debug         = false;
        fetch.mode          = 'espruino';
        
        fetch.config=function(){
        }//config
        
