


/*

//pirmod:d

27-01-25


*/



        globalThis.pirmod   = pirmod;
        
        function pirmod(pin,callback,enabled=true){    //27
        
              if(!Number.isInteger(pin)){
                                                                                console.error('pir, pin not integer');
                    return;
              }
              
              var mode            = Digital.Input;
              var edge            = Monitor.Rising;
              var monitor         = new Monitor({pin,mode,edge});
              monitor.onChanged   = onchanged;
              var list            = [];
              
              
              var set   = {};
              var get   = {};
              
              
              set.onchanged   = function(fn){
              
                    if(typeof fn!='function'){
                                                                                console.error('pir, onchange not function');
                          return;
                    }
                    if(list.includes(fn)){
                          return;
                    }
                    list.push(fn);
                    
              }//onchanged
              
              set.enabled   = function(v){enabled   = v};
              get.enabled   = function(){return enabled};
              
              function onchanged(){
              
                    if(!enabled){
                          return;
                    }
                    
                    list.forEach(fn=>fn(pir));
                    
              }//onchanged
              
              
              var pir             = {pin};
              Object.defineProperty(pir,'onchanged',{set:set.onchanged});
              Object.defineProperty(pir,'enabled',{get:get.enabled,set:set.enabled});
              
              set.onchanged(callback);
                                                                                console.log('pir',pin,enabled);
              return pir;
              
        }//pir
        
        
        
        
        
