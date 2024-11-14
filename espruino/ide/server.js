

/*

rollup -c && espruino -b 115200 -p COM16 ./build/bundle.min.js --watch

esptool.py --chip esp32 --port COM5 --baud 921600 --after hard_reset write_flash -z -e --flash_mode dio --flash_freq 40m --flash_size detect 0x1000 bootloader.bin 0x8000 partitions_espruino.bin 0x10000 espruino_2v24.74_esp32.bin




reset();
e.setTime();
e.setTimeZone(1);
require('Storage').write('.bootcde',`${code}`);
load();





*/


        var {key,cert}    = require('server-cert.js');
                                                                                console.log(key,'\n',cert);
                                                                                
        var fs        = require('fs');
        var cp        = require('child_process');
        
        var server    = require('https').createServer({key,cert},request).listen(3001);
        console.log('https://localhost:3001/');
        
        function request(req,res){
                                                                                console.log(req.url);
              if(req.url=='/'){
                    request.index(req,res);
                    return;
              }
              
              res.writeHead(404);
              res.end();
              
        }//request
        
        request.index=function(req,res){
        
              var headers   = {
                    'content-type'                    : 'text/html',
                    'Cross-Origin-Opener-Policy'      : 'same-origin',
                    'Cross-Origin-Embedder-Policy'    : 'require-corp'
              };
              res.writeHead(200,headers);
              res.end(fs.readFileSync('index-2.html','utf8'));
              
        }//index
        
