


/*
//:

//console:d

29-01-25

*/

        var console             = {}
        export default console;
        globalThis.console      = console;
        
        
        Object.defineProperty(console,'date',{get:()=>console.log(new Date().toLocaleString())})
        
        console.fn              = [trace]
        console.fn.add          = fn=>!console.fn.includes(fn) && console.fn.push(fn)
        console.fn.rem          = fn=>{var i=console.fn.indexOf(fn);i!=-1 && console.fn.splice(i,1)}
        
        console.log             = function(){console.write.apply(null,[...arguments,'\n'])};
        console.ok              = function(){console.log.apply(null,['[    ok ]',...arguments])}
        console.error           = function(){console.log.apply(null,['[ ERROR ]',...arguments])}
        console.warn            = function(){console.log.apply(null,['[  WARN ]',...arguments])}
        console.clear           = ()=>{};
        console.json            = function(v){console.log(JSON.stringify(v,null,4))}
        
        console.write           = function(){
        
                                        var str   = [...arguments].join(' ');
                                        console.fn.forEach(fn=>fn(str));
                                        
                                  }//write
                                  
                                  
                                  
                                  
                                  
                                  
