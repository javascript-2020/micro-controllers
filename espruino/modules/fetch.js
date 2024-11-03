        function fetch(url,opts){
                                                                                console.log('fetch',url);
              var v             = fetch.opts(url,opts);
              var opts          = v.opts;
              var body          = v.body;
                                                                                //console.json(opts);
              var ctx           = fetch.req.create();
              ctx.request       = request.espruino(opts,res=>fetch.response(ctx,res));
              fetch.error(ctx,'request');
              ctx.request.end(body);
              
              return ctx.req.promise;
              
        }//fetch
        
        fetch.debug   = false;
        
        fetch.response=function(ctx,res){
                                                                                //console.log('fetch.response');
                                                                                //console.json(res.headers);
              ctx.response    = res;
              fetch.data(ctx);
              fetch.error(ctx,'response');
              fetch.close(ctx);
              fetch.res.create(ctx);
              
        }//response
        
  //:
  
        fetch.proxy=function(url,opts){
                                                                                console.log('fetch.proxy',url);
              var v             = fetch.opts(url,opts);
              var opts          = v.opts;
              var body          = v.body;
              
              body              = JSON.stringify({url,opts,body});
              
              var proxy_opts    = {method:'post',body};
              var proxy         = fetch.opts(fetch.proxy.url,proxy_opts);
                                                                                //console.json(proxy.opts);
              var ctx           = fetch.req.create();
              
              ctx.request       = request.espruino(proxy.opts,res=>fetch.proxy.response(ctx,res));
              
              fetch.error(ctx,'req');
              ctx.request.end(proxy.body);
              
              return ctx.req.promise;
              
        }//fetch.proxy
        
        fetch.proxy.debug   = false;
        
        fetch.proxy.response=function(ctx,res){
                                                                                console.log('fetch.proxy.response');
              ctx.response    = res;
              
              function ondata(data){
              
                    ctx.body   += data;
                    if(!ctx.obj.headers){
                          var i   = ctx.body.indexOf('--hdrs--');
                          if(i!=-1){
                                var hdrs          = ctx.body.slice(0,i);
                                ctx.obj.headers   = JSON.parse(hdrs);
                                                                                //console.log('fetch.proxy.response.headers');
                                                                                console.json(ctx.obj.headers);
                                ctx.body    = ctx.body.slice(i+8);
                                ctx.req.resolve(ctx.obj);
                          }
                    }
                    
              }//ondata
              
              res.on('data',ondata);
              fetch.error(ctx,'response');
              fetch.close(ctx);
              fetch.res.create(ctx,'proxy');
              
        }//response
        
        fetch.proxy.url   = url.proxy;
        
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
        
        fetch.parse2=function(url,opts){
        }//parse2
        
        
        fetch.opts=function(url,opts){
        
              opts        = opts||{};
              var opts2   = {headers:{}};
              
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
                    
              }//timeout
              
              ctx.timer   = setTimeout(timeout,time);
              
        }//timeout
        
        fetch.error=function(ctx,type){
        
              function error(err){
                                                                                console.log(`fetch.${type}.error`);
                                                                                console.json(err);
                    clearTimeout(ctx.timer);
                    //ctx.onclose && ctx.res.removeEventListener(ctx.close);
                    ctx[type].reject(err);
                    
              }//error
              
              ctx[type].on('error',error);
              
        }//error
        
        fetch.data=function(ctx){
        
              function data(data){
              
                    ctx.body    += data;
                    
              }//ondata
              
              ctx.response.on('data',data);
              
        }//data
        
        fetch.close=function(ctx){
        
              ctx.close=function(){
                                                                                console.log('fetch.response.close',ctx.body.length);
                    ctx.res.resolve(ctx.body);
                    
              }//onclose
              
              ctx.response.on('close',ctx.close);
              
        }//close
        
        fetch.req   = {};
        fetch.res   = {};
        
        fetch.req.create=function(){
        
              var ctx           = {};
              ctx.req           = {};
              ctx.res           = {};
              ctx.body          = '';
              ctx.req.promise   = new Promise((res,rej)=>(ctx.req.resolve=res,ctx.req.reject=rej));
              fetch.timeout(ctx);
              return ctx;
              
        }//create
        
        fetch.res.create=function(ctx,proxy){
        
              clearTimeout(ctx.timer);
              var promise   = new Promise((res,rej)=>(ctx.res.resolve=res,ctx.res.reject=rej));
              ctx.obj       = {};
              ctx.obj.text=function(){return promise};
              ctx.obj.json=function(){return ctx.obj.text().then(JSON.parse)};
              !proxy && ctx.req.resolve(ctx.obj);
              
        }//create
        
  //:
  
        var request   = {};
        
        request.espruino=function(opts,callback){
        
              var req   = http.request(opts,function(res){
              
                    callback(res);
                    
              });
              return req;
              
        }//espruino
        
        
        request.moddable=function(){
        
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
        