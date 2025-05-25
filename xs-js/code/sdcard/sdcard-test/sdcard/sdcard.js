


/*



*/



        import console from 'console';
        import sdcard_xs from './sdcard.xs.js';
        
        var sdcard          = new sdcard_xs();
        
        var sd              = {};
        sd.df               = true;
        sd.spi              = {};
        sd.sdmmc            = {};
        sd.sdmmc.mount      = {};
        
        export default sd;
        
        
        var spi             = {};
        var sdmmc           = {};
        sdmmc.mount         = {};
        var file            = {};
        var dir             = {};
        
        
        
        
  //:
  
  
        function create(){
        
              var card                  = {};
              
              card.mode                 = null;
              card.status               = false;
              
              card.spi                  = {};
              card.spi.mount            = function(){return spi.mount(card)}
              
              card.sdmmc                = {};
              card.sdmmc.mount          = {};
              card.sdmmc.mount.data1    = function(){return sdmmc.mount.data1(card)}
              card.sdmmc.mount.data4    = function(){return sdmmc.mount.data4(card)}
              
              card.unmount              = function(){return unmount(card)}
              
              card.format               = function(){return format(card)}
              card.info                 = function(){return info(card)}
              card.info.print           = function(){return info.print(card)}
              
              card.file                 = {};
              card.file.read            = function(path,opts){return file.read(card,path,opts)}
              card.file.read.offset     = function(path,offset,size,opts){return file.read.offset(card,path,offset,size,opts)}
              card.file.read.until      = function(path,search,offset,opts){return file.read.until(card,path,search,offset,opts)}
              card.file.write           = function(path,data){return file.write(card,path,data)}
              card.file.write.offset    = function(path,data,offset){return file.write.offset(card,path,data,offset)}
              card.file.append          = function(path,data){return file.append(card,path,data)}
              card.file.appendln        = function(path,data){return file.appendln(card,path,data)}
              card.file.size            = function(path){return file.size(card,path)}
              card.file.exists          = function(path){return file.exists(card,path)}
              card.file.delete          = function(path){return file.delete(card,path)}
              card.file.copy            = function(src,dest){return file.copy(card,src,dest)}
              card.file.rename          = function(src,dest){return file.rename(card,src,dest)}
              card.file.stat            = function(path){return file.stat(card,path)}
              card.file.stat.print      = function(path){return file.stat.print(card,path)}
              card.file.truncate        = function(path){return file.truncate(card,path)}
              card.file.print           = function(path){return file.print(card,path)}
              
              card.dir                  = {};
              card.dir.list             = function(path){return dir.list(card,path)}
              card.dir.list.print       = function(path){return dir.list.print(card,path)}
              card.dir.mkdir            = function(path){return dir.mkdir(card,path)}
              card.dir.clear            = function(path){return dir.clear(card,path)}
              card.dir.delete           = function(path){return dir.delete(card,path)}
              card.dir.exists           = function(path){return dir.exists(card,path)}
              
              card.test                 = function(){return test(card)}
              
              return card;
              
        }//create
        
        
        function unmount(card){
        
              if(!card.status){
                    return {error:'car not mounted'};
              }
              
              var result;
              
              if(card.mode=='spi'){
                    result    = spi.unmount(card);
              }
              if(card.mode=='sdmmc'){
                    result    = sdmmc.unmount(card);
              }
              
              return result;
              
        }//unmount
        
        
        sd.spi.mount    = function(root,cs,clk,mosi,miso){
                                                                                debug('sd.spi.mount',root);
              var card      = create();
              
              card.mode     = 'spi';
              
              card.root     = root;
              card.cs       = cs;
              card.clk      = clk;
              card.mosi     = mosi;
              card.miso     = miso;
              
              var {error}   = spi.mount(card);
              if(error){
                                                                                debug.error(error);
                    return {error};
              }
              
              return {card};
              
        }//mount
        
        
        sd.sdmmc.mount.data1    = function(root,clk,cmd,d0){
        
              var card    = create();
              
              card.mode   = 'sdmmc';
              
              card.root   = root;
              card.clk    = clk;
              card.cmd    = cmd;
              card.d0     = d0;
              
              var {error}   = sdmmc.mount.data1(card);
              if(error){
                    return {error};
              }
              
              return {card};
              
        }//data1
        
        
        sd.sdmmc.mount.data4    = function(root,clk,cmd,d0,d1,d2,d3){
        
              var card    = create();
              
              card.mode   = 'sdmmc';
              
              card.root   = root;
              card.clk    = clk;
              card.cmd    = cmd;
              card.d0     = d0;
              card.d1     = d1;
              card.d2     = d2;
              card.d3     = d3;
              
              var {error}   = sdmmc.mount.data4(card);
              if(error){
                    return {error};
              }
              
              return {card};
              
        }//data4
        
        
  //:
  
  
        spi.mount   = function(card){
                                                                                debug('spi.mount');
              if(card.status){
                    return {error:'card mounted'};
              }
              
              var error   = sdcard.spi_mount(card.root,card.cs,card.clk,card.mosi,card.miso);
              
              if(error){
                    return {error};
              }
              
              card.status   = true;
              
              return {};
              
        }//mount
        
        
        spi.unmount   = function(card){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              var error   = sdcard.spi_unmount(card.root);
              
              if(error){
                    return {error};
              }
              
              card.status   = false;
              
              return {};
              
        }//unmount
        
        
        sdmmc.mount.data1   = function(card){
        
              if(card.status){
                    return {error:'card already mounted'};
              }
              
              var error   = sdcard.sdmmc_mount_data1(card.root,card.clk,card.cmd,card.d0);
              if(error){
                    return {error};
              }
              
              card.status   = true;
              
              return {};
              
        }//data1
        
        
        sdmmc.mount.data4   = function(card){
        
              if(card.status){
                    return {error:'card already mounted'};
              }
              
              var error   = sdcard.sdmmc_mount_data4(card.root,card.clk,card.cmd,card.d0,card.d1,card.d2,card.d3);
              
              if(error){
                    return {error};
              }
              
              card.status   = true;
              
              return {};
              
        }//data4
        
        
        sdmmc.unmount   = function(card){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              var error   = sdcard.sdmmc_unmount(card.root);
              
              if(error){
                    return {error};
              }
              
              card.status   = false;
              
              return {};
              
        }//unmount
        
        
  //:
  
  
        function format(card){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              var error    = sdcard.format(card.root);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//format
        
        
        function info(card){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              var result    = sdcard.info(card.root);
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              var info    = result;
              return {info};
              
        }//info
        
        
        info.print    = function(card){
        
              var {error,info}    = card.info();
              if(error){
                    return {error};
              }
              
              console.log();
              console.log('card info');
              console.log();
              console.log('        name  :',info.name);
              console.log('          fs  :',info.fs);
              console.log('        type  :',info.type);
              console.log('       speed  :',info.speed);
              console.log('        size  :',info.size);
              console.log('   bus width  :',info.bus_width);
              console.log();
              
              return {};
              
        }//print
        
        
        
        
  //:
  
  
        file.read   = function(card,path,opts){
        
              opts    = opts||{};
              
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var result    = sdcard.file_read(path);
              
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var buf   = result;
              
              if(opts==='utf8' || opts?.encoding==='utf8'){
                    buf   = String.fromArrayBuffer(buf);
              }
              
              return {buf};
              
        }//read
        
        
        file.read.offset    = function(card,path,offset,size,opts){
                                                                                debug('file.read.offset',path,offset,size);
              opts    = opts||{};
              
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var result    = sdcard.file_read_offset(path,offset,size);
              if(typeof result=='string'){
                                                                                debug('error');
                    var error   = result;
                    return {error};
              }
                                                                                debug('ok');
              var buf   = result;
              
              if(opts==='utf8' || opts?.encoding==='utf8'){
                    buf   = String.fromArrayBuffer(buf);
              }
              
              return {buf};
              
        }//offset
        
        
        file.read.until   = function(card,path,search,offset,opts){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var result    = sdcard.file_read_until(path,search,offset);
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var buf   = result;
              
              if(opts==='utf8' || opts?.encoding==='utf8'){
                    buf   = String.fromArrayBuffer(buf);
              }
              
              return {buf};
              
        }//until
        
        
        file.write    = function(card,path,data){
                                                                                console.log('file.write');
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              if(typeof data=='string'){
                    data    = ArrayBuffer.fromString(data);
              }
              path          = card.root+'/'+path;
              var size      = data.byteLength;
                                                                                console.log(size);
              var error     = sdcard.file_write(path,data,size);
              if(error){
                    return {error};
              }
              
              return {};
              
        }//write
        
        
        file.write.offset   = function(card,path,offset,data){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              if(typeof data=='string'){
                    data    = ArrayBuffer.fromString(data);
              }
              path        = card.root+'/'+path;
              var size    = data.byteLength;
              
              var error   = sdcard.file_write_offset(path,offset,data,size);
              if(error){
                    return {error};
              }
              
              return {};
              
        }//offset
        
        
        file.append   = function(card,path,data){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              if(typeof data=='string'){
                    data    = ArrayBuffer.fromString(data);
              }
              path        = card.root+'/'+path;
              var size    = data.byteLength;
              
              var error   = sdcard.file_append(path,data,size);
              if(error){
                    return {error};
              }
              
              return {};
              
        }//append
        
        
        file.appendln   = function(card,path,str){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              if(typeof str!='string'){
                    str   = str.toString();
              }
              str        += '\n';
              var data    = ArrayBuffer.fromString(str);
              path        = card.root+'/'+path;
              var size    =  data.byteLength;
              
              var error   = sdcard.file_append(path,data,size);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//appendln
        
        
        file.size   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var result    = sdcard.file_size(path);
              
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var size    = result;
              return {size};
              
        }//size
        
        
        file.exists   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var result    = sdcard.file_exists(path);
              
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var exists    = result;
              return {exists};
              
        }//exists
        
        
        file.delete   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var error   = sdcard.file_delete(path);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//delete
        
        
        file.copy   = function(card,src,dest){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              src           = card.root+'/'+src;
              dest          = card.root+'/'+dest;
              
              var error     = sdcard.file_copy(src,dest);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//copy
        
        
        file.rename   = function(card,src,dest){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              src     = card.root+'/'+src;
              dest    = card.root+'/'+dest;
              
              var error   = sdcard.file_rename(src,dest);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//rename
        
        
        file.stat   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var result    = sdcard.file_stat(path);
              
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var stat    = result;
              return {stat};
              
        }//stat
        
        
        file.stat.print   = function(card,path){
        
              var {stat,error}    = file.stat(card,path);
              
              if(error){
                    return {error};
              }
              
              console.log();
              console.log('file stat :',path);
              console.log();
              console.log('            device id  :',stat.st_dev);
              console.log('   file serial number  :',stat.st_ino);
              console.log('                 mode  :',stat.st_mode);
              console.log('                nlink  :',stat.st_nlink);
              console.log('                  uid  :',stat.st_uid);
              console.log('                  gid  :',stat.st_gid);
              console.log('                 size  :',stat.st_size);
              console.log('                atime  :',stat.st_atime);
              console.log('                mtime  :',stat.st_mtime);
              console.log('                ctime  :',stat.st_ctime);
              console.log('           block size  :',stat.st_blksize);
              console.log('     number of blocks  :',stat.st_blocks);
              console.log();
              
              return {stat};
              
        }//print
        
        
        file.truncate   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var error   = sdcard.file_truncate(path);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//truncate
        
        
        file.print    = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var {buf,error}   = sdcard.file_read(path);
              
              if(error){
                    return {error};
              }
              
              var uint8   = new Uint8Array(buf);
              var n       = uint8.length;
              
              for(var i=0;i<n;i++){
              
                    console.log(i,uint8[i],String.fromCharCode(uint8[i]));
                    
              }//for
              
              return {};
              
        }//print
        
        
  //:
  
  
        dir.list    = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path          = card.root+'/'+path;
              
              var result    = sdcard.dir_list(path);
              
              if(typeof result=='string'){
                    var error   = result;
                    return {error};
              }
              
              var list    = result;
              return {list};
              
        }//list
        
        
        dir.list.print    = function(card,path){
        
              var {list,error}    = dir.list(card,path);
              if(error){
                                                                                console.log('error');
                                                                                console.log(error);
                    return {error};
              }
              
              console.log();
              console.log('dir.list : ',list.length);
              list.forEach((dir,i)=>console.log(i,':',dir));
              console.log();
              
              return {list};
              
        }//print
        
        
        dir.mkdir   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var error   = sdcard.dir_mkdir(path);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//mkdir
        
        
        dir.clear   = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var error   = sdcard.dir_clear(path);
              
              if(error){
                    return {error};
              }
              
              return {};
              
        }//clear
        
        
        dir.delete    = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var error   = sdcard.dir_delete(path);
              if(error){
                    return {error};
              }
              
              return {};
              
        }//delete
        
        
        dir.exists    = function(card,path){
        
              if(!card.status){
                    return {error:'card not mounted'};
              }
              
              path    = card.root+'/'+path;
              
              var error   = sdcard.dir_exists(path);
              if(error){
                    return {error};
              }
              
              return {};
              
        }//exists
        
        
  //:
  
  
        function debug(){
        
              if(!sd.df)return;
              var str   = [...arguments].join(' ');
              console.log('[ sdcard ]',str);
              
        }//debug
        
        
        debug.error   = function(){
        
              var args    = [...arguments];
              args.unshift('error :');
              debug.apply(null,args);
              
        }//error
        
        
        
