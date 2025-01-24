



      fetch.df    = false;
      
      function fetch(url,opts={}){
      
            var parts         = new URL(url);
            var params        = {};
            var port          = 80;
            if(parts.protocol=='https:'){
                  params.Socket   = SecureSocket;
                  params.secure   = {verify:false};
                  port            = 443;
            }
            params.host       = parts.hostname;
            params.port       = parts.port||port;
            params.path       = parts.pathname;
            if(opts.method){
                  params.method     = opts.method.toUpperCase();
            }
            if(opts.body){
                  params.body       = opts.body;
            }
            params.response   = String;
            if(opts.headers){
                  params.headers    = [];
                  for(var key of opts.headers){
                  
                        params.headers.push(key);
                        params.headers.push(opts.headers[key]);
                        
                  }
            }
                                                                                fetch.fd && console.json(params);
                                                                                
            var resolve,promise   = new Promise(res=>resolve=res);
            var headers           = [];
            var request           = new Request(params);
            var complete;
            var mode;
            var str               = '';
            var res               = {text,json,headers};
            
            request.callback=function(message,value,etc){
                                                                                //console.log('callback',message);
                                                                                
                  switch(message){
                  
                    case Request.error              :
                                                                                fetch.df && console.log('fetch',url,'error');
                        throw `fetch ${url} an error occurred`;
                        break;
                        
                    case Request.status             :
                                                                                fetch.df && console.log('fetch',url,value);
                        res.status    = value;
                        break;
                        
                    case Request.header             :
                                                                                fetch.df && console.log(value,etc);
                        headers[value]    = etc;
                        break;
                        
                    case Request.headersComplete    :
                        resolve(res);
                        break;
                        
                    case Request.responseFragment   :
                    
                        str  += request.read(String);
                        break;
                        
                    case Request.responseComplete   :
                                                                                fetch.df && console.log('fetch',url,'complete');
                        complete    = true;
                        str        += value;
                        
                        switch(mode){
                        
                          case 'json'   : json.complete();        break;
                          case 'text'   : text.complete();        break;
                          
                        }//switch
                        break;
                        
                  }//switch
                  
            }//callback
            
            function text(){
            
                  mode      = 'text';
                  promise   = new Promise(res=>resolve=res);
                  if(complete){
                        text.complete();
                  }
                  return promise;
                  
            }//text
            
            text.complete=function(){
            
                  resolve(str);
                  
            }//complete
            
            function json(){
            
                  mode      = 'json';
                  promise   = new Promise(res=>resolve=res);
                  if(complete){
                        json.complete();
                  }
                  return promise;
                  
            }//json
            
            json.complete=function(){
            
                  var json    = JSON.parse(str);
                  resolve(json);
                  
            }//complete
            
            return promise;
            
      }//fetch
      
