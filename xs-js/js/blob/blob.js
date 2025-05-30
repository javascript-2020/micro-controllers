
    function Blob(parts,options){
    
          var size    = calc();
          var data    = new Uint8Array(size);
          create();
          
          var blob                    = {};
          blob[Symbol.toStringTag]    = 'Blob';
          
          blob.size                   = size;
          blob.type                   = options.type||options.mimeType||'';
          
          blob.arrayBuffer            = function(){return data.buffer};
          blob.bytes                  = function(){return data};
          blob.slice                  = slice;
          blob.text                   = function(){return String.fromArrayBuffer(data.buffer)};
          //blob.stream               = function(){};
          
          return blob;
          
          
          function slice(start,end,contentType){
          
                var uint8   = data.slice(start,end);
                var blob    = Blob([uint8],{type:contentType});
                return blob;
                
          }//slice
          
          
          function create(){
          
                var uint8;
                var index   = 0;
                parts.forEach(part=>{
                
                      var type    = datatype(part);
                      switch(type){
                      
                        case 'string'         : var buf   = ArrayBuffer.fromString(part);
                                                uint8     = new Uint8Array(buf);
                                                data.set(uint8,index);
                                                index    += uint8.byteLength;
                                                break;
                        case 'uint8array'     : data.set(part,index);
                                                index    += part.byteLength;
                                                break;
                        case 'arrayBuffer'    : uint8     = new Uint8Array(part);
                                                data.set(uint8,index);
                                                index    += uint8.byteLength;
                                                break;
                        case 'blob'           : var buf   = part.arrayBuffer();
                                                uint8     = new Uint8Array(buf);
                                                data.set(uint8,index);
                                                index    += uint8.byteLength;
                                                break;
                                                
                      }//switch
                      
                });
                
          }//create
          
          
          function calc(){
          
                var size    = 0;
                parts.forEach(part=>{
                
                      var type    = datatype(part);
                      switch(type){
                      
                        case 'string'         : size   += part.length;            break;
                        case 'uint8array'     : size   += part.byteLength;        break;
                        case 'arrayBuffer'    : size   += part.byteLength;        break;
                        case 'blob'           : size   += part.size;              break;
                        
                      }//switch
                      
                });
                
          }//calc
          
          
          function datatype(value){
          
                var str     = Object.prototype.toString.call(value);
                str         = str.slice(8,-1);
                str         = str.toLowerCase();
                return str;
                
          }//datatype
          
    }//blob
    
    
