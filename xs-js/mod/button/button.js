


/*

//buttonmod:d

27-01-25


*/



        globalThis.buttonmod   = buttonmod;
        
        function buttonmod(pin,callback){
        
                if(!Number.isInteger(pin)){
                      return;
                }
                
                var mode            = Digital.Input;
                var edge            = Monitor.Rising|Monitor.Falling;
                var monitor         = new Monitor({pin,mode,edge});
                monitor.onChanged   = onchanged;
                
                var time;
                var debounce;
                
                var click     = {};
                click.time    = 500;
                click.fn      = [];
                click.set     = function(fn){
                
                                      if(typeof fn!='function'){
                                            return;
                                      }
                                      if(click.fn.includes(fn)){
                                            return;
                                      }
                                      click.fn.push(fn);
                                      return btn;
                                      
                                }//set
                if(callback){
                      click.fn.push(callback);
                }
                
                
                var dblclick    = {};
                
                
                var longclick   = {};
                
                
                
                var btn   = {pin};
                Object.defineProperty(btn,'onclick',{set:click.set});
                
                return btn;
                
                
                function onchanged(){
                
                        var value   = monitor.read();
                        var now   = Date.now();
                        if(value==1){
                              time        = now;
                              debounce    = null;
                        }else{
                              if(debounce){
                                    return;
                              }
                              debounce    = true;
                              
                              var d   = now-time;
                              if(d<click.time){
                                    click.fn.forEach(fn=>fn(btn));
                              }
                        }
                        
                }//onchanged
                
                
        }//button
        
        
        
        
        
        
