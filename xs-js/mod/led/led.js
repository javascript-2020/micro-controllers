        function led(pin){
        
              var blink_time          = 500;
              var long_time           = 2500;
        
              var preset    = {
                    'ok'      : [250,250,250,250,250,250],
                    'error'   : [1000,250,1000,250,1000,250]
              };

        
              var led   = new Proxy({},{
              
                    get   : function(target,prop){
              
                          switch(prop){
                            
                            case 'pin'        : return pin;
                            case 'on'         : return on();
                            case 'off'        : return off();
                            case 'blink'      : return blink();
                            case 'long'       : return long();
                            case 'ok'         : return pattern('ok');
                            case 'error'      : return pattern('error');
                            
                            case 'time'       : return time;
                            
                            case 'pattern'    : return pattern;
                            
                          }//switch
      
                          return pattern(prop);
                          
                    }//get

              });
              

              function on(){
                                                                                console.log('on');
                    //Digital.write(led.pin,1);
                    
              }//on
                                        
              function off(){
                                                                                console.log('off');              
                    //Digital.write(led.pin,0);
                    
              }//off
                                        
              function time(time){
                                        
                    led.on;
                    var id    = timer.off(time);
                    return id;
                    
              }//time
              
              function blink(){
                                              
                    led.on();
                    var id    = timer.off(500);
                    return id;
                    
              }//blink
                                        
              function long(){
                                              
                    led.on;
                    var id    = timer.off(2500);
                    return id;
                    
              }//long
                    

              function pattern(pattern,name){
              
                      if(typeof pattern=='string'){
                            pattern   = preset[pattern];
                            if(!pattern){
                                  return;
                            }
                      }
                      if(name){
                            preset[name]    = pattern;
                            return;
                      }
                      
                      var n   = pattern.length;
                      var i   = -1;
                      loop();

                      
                      function loop(){

                            i++;
                            if(i>=n){
                                  return;
                            }
                            
                            if(i%2==0){
                                  led.on;
                            }else{
                                  led.off;
                            }
                            
                            var time    = pattern[i];
                            timer(loop,time);
                            
                      }//loop
                    
              }//pattern
                                    
              
              timer.id    = null;
              
              function timer(fn,time){
              
                    clearTimeout(timer.id);
                    timer.id    = setTimeout(fn,time);
                    
              }//timer
              
              timer.on=function(time){
              
                    clearTimeout(timer.id);
                    var fn      = ()=>led.on;
                    timer.id    = setTimeout(fn,time);
                    
              }//on
              
              timer.off=function(time){
              
                    clearTimeout(timer.id);
                    var fn      = ()=>led.off;
                    timer.id    = setTimeout(fn,time);
                    
              }//off
                    
                    
              

                                        
              return led;
              
        }//led
