/*

//timeout.js:d

28-01-25

*/


            function setTimeout(fn,time){
            
                  if(!setTimeout.mem){
                        setTimeout.id     = 1;
                        setTimeout.mem    = {};
                  }
            
                  var id                = setTimeout.id++;
                  var timer             = Timer.set(complete,time);
                  setTimeout.mem[id]    = timer;
                  return id;
                  
                  function complete(){
                  
                        delete setTimeout.mem[id];
                        fn();
                        
                  }//complete
                  
            }//setTimeout
            
                        
            function clearTimeout(id){

                  if(!setTimeout.mem){
                        return;
                  }
                  
                  var timer   = setTimeout.mem[id];
                  if(!timer){
                        return;
                  }
                  delete timeout.mem[id];
                  Timer.clear(timer);
                  
            }//clearTimeout
            
            
            function setInterval(fn,time){
            
                  if(!setInterval.mem){
                        setInterval.id    = 1;
                        setInterval.mem   = {}
                  }
                  
                  var id                = setInterval.id++;
                  var timer             = Timer.repeat(fn,time);
                  setInterval.mem[id]   = timer;
                  return id;
                  
            }//setInterval
            
            
            function clearInterval(id){
            
                  if(!setInterval.mem){
                        return;
                  }
                  
                  var timer   = setInterval.mem[id];
                  if(!timer){
                        return;
                  }
                  delete setInterval.mem[id];
                  Timer.clear(timer);
                  
            }//clearInterval
            
            
      
      
      
