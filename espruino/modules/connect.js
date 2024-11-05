        var connect           = {};
        connect.ct            = 0;
        connect.max           = 5;
        connect.time          = 1000;
        connect.display       = false;
        connect.callback      = null;
        
        connect.test          = function(callback){
        
                                      connect.callback    = callback;
                                      
                                      var status    = wifi.getStatus();
                                      
                                      if( status.ssid==WIFI_SSID        &&
                                          status.station=='connected'
                                      ){
                                            connect.complete();
                                            return;
                                      }
                                      
                                      connect.connect();
                                      
                                }//test
                                
        connect.complete      = function(){
                                                                                console.log('wifi connected');
                                      connect.info();
                                      connect.callback();
                                      
                                }//complete
                                
        connect.connect       = function(){
        
                                      var err;
                                      try{
                                                                                console.log('connecting',WIFI_SSID,WIFI_PASSWORD,'...');
                                            wifi.connect(WIFI_SSID,{password:WIFI_PASSWORD},function(err){
                                            
                                                  if(err){
                                                        connect.error(err);
                                                  }else{
                                                        connect.complete();
                                                  }
                                                  
                                            });
                                            
                                      }//try
                                      
                                      catch(err2){
                                      
                                            err   = err2;
                                            
                                      }//catch
                                      
                                      if(err){
                                            connect.error(err);
                                      }
                                      
                                }//connect
                                
        connect.error         = function(err){
        
                                      connect.ct++;
                                                                                console.log('wifi connect error',connect.ct);
                                                                                console.log(err.message);
                                                                                console.json(err);
                                      if(connect.ct==connect.max){
                                                                                console.log('max retries',connect.max);
                                            return;
                                      }
                                      setTimeout(connect,connect.time);
                                      
                                }//error
                                
        connect.info          = function(){
        
                                      var status        = wifi.getStatus();
                                      connect.status    = status;
                                      
                                      var info          = wifi.getIP();
                                      connect.info      = info;
                                      
                                      if(connect.display){
                                                                                console.log('status');
                                                                                console.json(status);
                                                                                console.log('info');
                                                                                console.json(info);
                                            return;
                                      }
                                      
                                }//info
                                
