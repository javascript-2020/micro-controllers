



        var console             = {};
        globalThis.console      = console;
        
        console.log             = function(){trace([...arguments].join(' ')+'\n')};
        console.error           = function(){console.log.apply(console,['[ERROR]',...arguments])};
        console.warn            = function(){console.log.apply(console,['[ WARN]',...arguments])};
        console.clear           = ()=>{};
        console.json            = v=>console.log(JSON.stringify(v,null,4));
        
        Object.defineProperty(console,'date',{get:()=>console.log(new Date().toUTCString())});



