



        var console             = {};
        console.log             = function(){trace([...arguments].join(' ')+'\n')};
        console.json            = v=>console.log(JSON.stringify(v,null,4));
        
