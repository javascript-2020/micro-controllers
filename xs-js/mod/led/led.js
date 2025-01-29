


/*

//ledmod.js:d

27-01-25


notes:

  requires timeout
  
  
*/

        //globalThis.ledmod   = ledmod;
        
        function ledmod(pin){
        
        
              var blink_time          = 500;
              var long_time           = 2500;
              
              var callback;
              
              timer.id                = null;
              
              var mem                 = {};
              mem.pattern             = {
                                              ok        : [250,250,250,250,250,250],
                                              stop      : [1000,250,1000,250,1000,250],
                                              error     : [1000,1000,1000,1000,1000,1000],
                                        };
                                        
              mem.repeat              = {
                                              pause     : [null,250,2000]
                                        };
                                        
                                        
  //:
  
              var led   = new Proxy({},{
              
                    get   : function(target,prop){return cmd(prop)}
                    set   : function(target,prop,value){
                    
                          if(typeof value=='function'){
                                callback    = value;
                          }
                          cmd(prop);
                          return true;
                          
                    }//set
                    
              });
              
              
              function cmd(prop){console.log('cmd',prop);
              
                    switch(prop){
                    
                      case 'pin'        : return pin;
                      case 'on'         : return on();
                      case 'off'        : return off();
                      case 'blink'      : return blink();
                      case 'long'       : return long();
                      
                      case 'time'       : return time;
                      
                      case 'pattern'    : return pattern;
                      case 'repeat'     : return repeat;
                      
                    }//switch
                    
                    if(prop in mem.pattern){
                          return pattern(prop);
                    }
                    if(prop in mem.repeat){
                          return repeat(prop);
                    }
                    
              }//cmd
              
  //:
  
              function on(){
                                                                                //console.log('on');
                    timer.clear();
                    Digital.write(pin,1);
                    
              }//on
              
              
              function off(){
                                                                                //console.log('off');
                    timer.clear();
                    Digital.write(pin,0);
                    
              }//off
              
              
              function time(time){
              
                    on();
                    var id    = timer(complete,time);
                    return id;
                    
              }//time
              
              
              function blink(){
              
                    on();
                    var id    = timer(complete,500);
                    return id;
                    
              }//blink
              
              
              function long(){
              
                    on();
                    var id    = timer(complete,2500);
                    return id;
                    
              }//long
              
              
              function complete(){
              
                    off();
                    if(typeof callback=='function'){
                          callback();
                    }
                    
              }//complete
              
  //:
  
              function pattern(pattern,name){
              
                      if(typeof pattern=='string'){
                            pattern   = mem.pattern[pattern];
                            if(!pattern){
                                  return;
                            }
                      }
                      if(name){
                            mem.pattern[name]    = pattern;
                            return;
                      }
                      
                      var n   = pattern.length;
                      var i   = -1;
                      loop();
                      
                      
                      function loop(){
                      
                            i++;
                            if(i>=n){
                                  if(typeof callback=='function'){
                                        callback();
                                  }
                                  callback    = null;
                                  return;
                            }
                            
                            if(i%2==0){
                                  on();
                            }else{
                                  off();
                            }
                            
                            var time    = pattern[i];
                            timer(loop,time);
                            
                      }//loop
                      
              }//pattern
              
              
              function repeat(pattern,name){
              
                    if(typeof pattern=='string'){
                          pattern   = mem.repeat[pattern];
                          if(!pattern){
                                return;
                          }
                    }
                    if(name){
                          mem.repeat[name]    = pattern;
                          return;
                    }
                    
                    var n       = pattern.length;
                    var i       = 0;
                    var ct      = 0;
                    var total   = pattern[0];
                    loop();
                    
                    
                    function loop(){
                    
                          i++;
                          if(i>=n){
                                ct++;
                                if(ct>=total){
                                      if(typeof callback=='function'){
                                            callback();
                                      }
                                      return;
                                }
                                i   = 1;
                          }
                          
                          if(i%2==1){
                                on();
                          }else{
                                off();
                          }
                          
                          var time    = pattern[i];
                          timer(loop,time);
                          
                    }//loop
                    
              }//repeat
              
              
  //:
  
              function timer(fn,time){
              
                    clearTimeout(timer.id);
                    timer.id    = setTimeout(fn,time);
                    
              }//timer
              
              
              timer.clear=function(){
              
                    clearTimeout(timer.id);
                    
              }//clear
              
              
              timer.on=function(time){
              
                    clearTimeout(timer.id);
                    timer.id    = setTimeout(on,time);
                    
              }//on
              
              
              timer.off=function(time){
              
                    clearTimeout(timer.id);
                    timer.id    = setTimeout(off,time);
                    
              }//off
              
              
              
              return led;
              
        }//led
        
        
        
        
        
        
        
