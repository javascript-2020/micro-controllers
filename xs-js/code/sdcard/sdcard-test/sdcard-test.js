


/*

//sdcard-test.js:d

13-05-25


*/


        import console from 'console';
        import sd from 'sdcard';
        
        
(()=>{
                                                                                console.log('sdcard-test.js');
                                                                                
if(1){

        var root    = '/sdcard';
        var cs      = 40;
        var clk     = 39;
        var mosi    = 42;
        var miso    = 41;
        
        var {card,error}    = sd.spi.mount(root,cs,clk,mosi,miso);
        if(error){
                                                                                console.log('failed to mount card');
                                                                                console.log(error);
              return;
        }
        
}


if(0){

        var root          = '/sdcard';
        var clk           = 14;
        var cmd           = 15;
        var d0            = 2;
        var d1            = 4;
        var d2            = 12;
        var d3            = 13;
        
        var{card,error}   = sd.sdmmc.mount.data4(root,clk,cmd,d0,d1,d2,d3);
        if(error){
              console.log('failed to mount card');
              console.log(error);
              return;
        }
        
}



        var {error}   = card.dir.list.print('');
        
        if(error){
              console.log('dir.list.print error');
              return;
        }
        
        
        var {error}   = card.file.truncate('hello.txt');
        
        if(error){
              console.log('file.truncate',error);
              return;
        }
        
        
        for(var i=0;i<5;i++){
        
              for(var j=0;j<10;j++){
              
                    var {error}   = card.file.append('hello.txt',''+j);
                    
                    if(error){
                          console.log('file.append error');
                          return;
                    }
                    
              }//for
              
        }//for
        
        
        var {error}   = card.file.write.offset('hello.txt',5,'xxxxx');
        
        if(error){
              console.log('file.write.offset error');
              return;
        }
        
        
        var {buf,error}   = card.file.read.offset('hello.txt',0,10);
        
        if(error){
              console.log('read.offset',error);
              return;
        }
        
        disp('read.offset',buf);
        
        
        var {num,error}   = card.file.read.until('hello.txt','x',0);
        
        if(error){
              console.log('file.read.until error');
              return;
        }
        
        var {error}   = card.file.print('hello.txt');
        
        if(error){
              console.log('file.print error');
              return;
        }
        
        var {error}   = card.file.stat.print('hello.txt');
        
        if(error){
              console.log('file.stat.print error');
              return;
        }
        
        var {error}   = card.file.copy('hello.txt','foo.txt');
        
        if(error){
              console.log('file.copy.error');
              return;
        }
        
        var {error}   = card.file.rename('foo.txt','bar.txt');
        
        if(error){
              console.log('file.rename error');
              return;
        }
        
        var {error}   = card.file.delete('bar.txt');
        
        if(error){
              console.log('file.delete error',error);
              return;
        }
        
        var {error}   = card.dir.mkdir('tmp');
        
        if(error){
              console.log('dir.mkdir error',error);
              return;
        }
        
        var {error}   = card.file.copy('hello.txt','tmp/a.txt');
        
        if(error){
              console.log('file.copy error',error);
              return;
        }
        
        var {error}   = card.dir.list.print('tmp/');
        
        if(error){
              console.log('dir.list.print error',error);
              return;
        }
        
        var {error}   = card.dir.clear('tmp/');
        
        if(error){
              console.log('dir.clear error',error);
              return;
        }
        
        var {error}   = card.dir.delete('tmp/');
        
        if(error){
              console.log('dir.delete error',error);
              return;
        }
        
        var {error}   = card.dir.list.print('');
        
        if(error){
              console.log('dir.print error',error);
              return;
        }
        
        
        
        console.log('test complete');
        
        
        
        
        
        
        function disp(name,buf){
        
              var uint8   = new Uint8Array(buf);
              var n       = uint8.length;
              
              console.log(name,n);
              
              for(var i=0;i<n;i++){
              
                    console.log(i,uint8[i]);
                    
              }//for
              
        }//disp
        
        
})();



