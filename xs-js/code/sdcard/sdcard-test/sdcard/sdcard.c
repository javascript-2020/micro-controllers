


/*

//sdcard.c:d

13-05-25


*/

        #include <stdio.h>
        #include <errno.h>
        #include <stdbool.h>
        #include <sys/stat.h>
        
        
        #include "esp_err.h"
        
        #include "sdcard.h"
        
        
        #include "xsPlatform.h"
        #include "xsmc.h"
        #include "mc.xs.h" // for xsID_ values
        #include "mc.defines.h"
        
        
        const char* tag     = "sdcard.c";
        bool df             = true;
        void debug(xsMachine *the);
        void debug2(xsMachine *the,const char *fmt,...);
        
        
        void buf_str(void *buf,size_t size,char *output,size_t output_size);
        
        
  //
  
  
        void xs_sdcard(xsMachine* the){
                                                                                xsTrace("sdcard create\n");
        }//xs_sdcard
        
        
        void xs_sdcard_destructor(void* data){
        }//xs_sdcard_destructor
        
        
  //:
  
  
        void xs_sdcard_spi_mount(xsMachine* the){
        
              char* root      = xsmcToString(xsArg(0));
              int cs          = xsmcToInteger(xsArg(1));
              int clk         = xsmcToInteger(xsArg(2));
              int mosi        = xsmcToInteger(xsArg(3));
              int miso        = xsmcToInteger(xsArg(4));
              
              esp_err_t result    = sdcard.spi.mount(root,cs,clk,mosi,miso);
              
              if(result!=ESP_OK){
                    char* str   = esp_err_to_name(result);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_mount
        
        
        void xs_sdcard_spi_unmount(xsMachine* the){
        
              char* root    = xsmcToString(xsArg(0));
              
              esp_err_t result    = sdcard.spi.unmount(root);
              
              if(result!=ESP_OK){
                    char* str   = esp_err_to_name(result);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//unmount
        
        
        void xs_sdcard_sdmmc_mount_data1(xsMachine *the){
        
              char *root    = xsmcToString(xsArg(0));
              int clk       = xsmcToInteger(xsArg(1));
              int cmd       = xsmcToInteger(xsArg(2));
              int d0        = xsmcToInteger(xsArg(3));
              
              esp_err_t err   = sdcard.sdmmc.mount_data1(root,clk,cmd,d0);
              
              if(err){
                    char *str   = esp_err_to_name(err);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_sdmmc_mount_data1
        
        
        void xs_sdcard_sdmmc_mount_data4(xsMachine *the){
        
              char *root    = xsmcToString(xsArg(0));
              int clk       = xsmcToInteger(xsArg(1));
              int cmd       = xsmcToInteger(xsArg(2));
              int d0        = xsmcToInteger(xsArg(3));
              int d1        = xsmcToInteger(xsArg(4));
              int d2        = xsmcToInteger(xsArg(5));
              int d3        = xsmcToInteger(xsArg(6));
              
              esp_err_t err   = sdcard.sdmmc.mount_data4(root,clk,cmd,d0,d1,d2,d3);
              
              if(err){
                    char *str   = esp_err_to_name(err);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_sdmmc_mount_data4
        
        
        void xs_sdcard_sdmmc_unmount(xsMachine *the){
        
              char *root    = xsmcToString(xsArg(0));
              
              esp_err_t err   = sdcard.sdmmc.unmount(root);
              
              if(err){
                    char *str   = esp_err_to_name(err);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_sdmmc_unmount
        
        
  //:
  
  
        void xs_sdcard_format(xsMachine* the){
        
              char* root    = xsmcToString(xsArg(0));
              
              esp_err_t result    = sdcard.format(root);
              
              if(result!=ESP_OK){
                    char* str   = esp_err_to_name(result);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_format
        
        
        void xs_sdcard_info(xsMachine* the){
        
              char* root    = xsmcToString(xsArg(0));
              
              sdcard_info_t info;
              esp_err_t result    = sdcard.info(root,&info);
              
              if(result!=ESP_OK){
                    char* str   = esp_err_to_name(result);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              
              xsSlot name           = xsString(info.name);
              xsSlot fs             = xsString(info.fs);
              xsSlot type           = xsString(info.type);
              xsSlot speed          = xsString(info.speed);
              xsSlot size           = xsInteger(info.size);
              xsSlot bus_width      = xsInteger(info.bus_width);
              
              xsSlot info2          = xsNewObject();
              
              xsmcSet(info2,xsID_name,name);
              xsmcSet(info2,xsID_fs,fs);
              xsmcSet(info2,xsID_type,type);
              xsmcSet(info2,xsID_speed,speed);
              xsmcSet(info2,xsID_size,size);
              xsmcSet(info2,xsID_bus_width,bus_width);
              
              xsResult        = info2;
              
        }//cs_sdcard_info
        
        
  //:
  
  
        void xs_sdcard_file_read(xsMachine* the){
                                                                                debug2(the,"file_read");
              char* path    = xsmcToString(xsArg(0));
              size_t size;
              esp_err_t result;
              
              result    = sdcard.file.size(path,&size);
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
                                                                                debug2(the,"size %d",size);
              void* buf   = malloc(size);
              
              result    = sdcard.file.read(path,buf,&size);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
                                                                                char str2[size+1];
                                                                                buf_str(buf,size,str2,size+1);
                                                                                debug2(the,"[%s]",str2);
              xsmcSetArrayBuffer(xsResult,buf,size);
              
              //free(buf);
              
        }//xs_sdcard_file_read
        
        
        void xs_sdcard_file_read_offset(xsMachine *the){
                                                                                debug2(the,"file_read_offset");
              char *path      = xsmcToString(xsArg(0));
              size_t offset   = xsmcToInteger(xsArg(1));
              size_t size     = xsmcToInteger(xsArg(2));
              void *buf       = malloc(size);
              size_t num;
                                                                                debug2(the,"%s %d %d",path,offset,size);
              esp_err_t err   = sdcard.file.read_offset(path,offset,buf,&size);
              
              if(err){
                                                                                debug2(the,"error");
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
                                                                                debug2(the,"ok");
                                                                                char *ptr=(char*)buf;
                                                                                for(int i=0;i<size;i++){
                                                                                      debug2(the,"%d : %d %c",i,ptr[i],ptr[i]);
                                                                                }
                                                                                debug2(the,"size %d",size);
                                                                                char buf2[size+1];
                                                                                buf_str(buf,size,buf2,size+1);
                                                                                debug2(the,"[%s]",buf2);
              xsmcSetArrayBuffer(xsResult,buf,size);
              
              //free(buf);
              
        }//xs_sdcard_file_read_offset
        
        
        void xs_sdcard_file_read_until(xsMachine *the){
        
              char *path              = xsmcToString(xsArg(0));
              char *search            = xsmcToString(xsArg(1));
              size_t offset           = xsmcToInteger(xsArg(2));
              size_t num;
              
              esp_err_t err   = sdcard.file.read_until(path,*search,offset,&num);
              if(err){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              xsmcSetInteger(xsResult,num);
              
        }//xs_sdcard_file_read_until
        
        
        void xs_sdcard_file_write(xsMachine* the){
                                                                                debug2(the,"file_write");
              char* path    = xsmcToString(xsArg(0));
              void* buf     = xsmcToArrayBuffer(xsArg(1));
              size_t size   = xsmcToInteger(xsArg(2));
                                                                                char str[size+1];
                                                                                buf_str(buf,size,str,size+1);
                                                                                debug2(the,"[%s]",str);
              esp_err_t err   = sdcard.file.write(path,buf,&size);
              
              if(err){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_write
        
        
        void xs_sdcard_file_write_offset(xsMachine *the){
                                                                                debug2(the,"file_write_offset");
              char *path      = xsmcToString(xsArg(0));
              size_t offset   = xsmcToInteger(xsArg(1));
              void *buf       = xsmcToArrayBuffer(xsArg(2));
              size_t size     = xsmcToInteger(xsArg(3));
                                                                                debug2(the,"%s %d %p %d",path,offset,buf,size);
                                                                                debug2(the,"[%s]",buf);
              esp_err_t err   = sdcard.file.write_offset(path,offset,buf,&size);
              
              if(err){
                                                                                debug2(the,"error");
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
                                                                                debug2(the,"ok");
        }//xs_sdcard_file_write_offset
        
        
        void xs_sdcard_file_append(xsMachine *the){
        
              char *path    = xsmcToString(xsArg(0));
              void *buf     = xsmcToArrayBuffer(xsArg(1));
              size_t size   = xsmcToInteger(xsArg(2));
              
              esp_err_t err   = sdcard.file.append(path,buf,&size);
              
              if(err){
              
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_append
        
        
        void xs_sdcard_file_size(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              
              size_t size;
              esp_err_t result    = sdcard.file.size(path,&size);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              xsmcSetInteger(xsResult,size);
              
        }//xs_sdcard_file_size
        
        
        void xs_sdcard_file_exists(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              bool exists;
              
              esp_err_t result    = sdcard.file.exists(path,&exists);
              
              if(result==ESP_OK){
                    xsmcSetBoolean(xsResult,true);
                    return;
              }
              
              if(result==ESP_ERR_NOT_FOUND){
                    xsmcSetBoolean(xsResult,false);
                    return;
              }
              
              char* str   = strerror(errno);
              xsmcSetString(xsResult,str);
              
        }//xs_sdcard_file_exists
        
        
        void xs_sdcard_file_delete(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              
              esp_err_t result    = sdcard.file.delete(path);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_delete
        
        
        void xs_sdcard_file_copy(xsMachine* the){
        
              char* src     = xsmcToString(xsArg(0));
              char* dest    = xsmcToString(xsArg(1));
              
              esp_err_t result    = sdcard.file.copy(src,dest);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_copy
        
        
        void xs_sdcard_file_rename(xsMachine *the){
        
              char *src     = xsmcToString(xsArg(0));
              char *dest    = xsmcToString(xsArg(1));
              
              esp_err_t err   = sdcard.file.rename(src,dest);
              
              if(err){
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_rename
        
        
        void xs_sdcard_file_stat(xsMachine *the){
        
              char *path    = xsmcToString(xsArg(0));
              
              struct stat stat;
              esp_err_t result    = sdcard.file.stat(path,&stat);
              
              if(result!=ESP_OK){
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              
              xsSlot stat2          = xsNewObject();
              
              xsSlot st_dev         = xsInteger(stat.st_dev);
              xsmcSet(stat2,xsID_st_dev,st_dev);
              
              xsSlot st_ino         = xsInteger(stat.st_ino);
              xsmcSet(stat2,xsID_st_ino,st_ino);
              
              xsSlot st_mode        = xsInteger(stat.st_mode);
              xsmcSet(stat2,xsID_st_mode,st_mode);
              
              xsSlot st_nlink       = xsInteger(stat.st_nlink);
              xsmcSet(stat2,xsID_st_nlink,st_nlink);
              
              xsSlot st_uid         = xsInteger(stat.st_uid);
              xsmcSet(stat2,xsID_st_uid,st_uid);
              
              xsSlot st_gid         = xsInteger(stat.st_gid);
              xsmcSet(stat2,xsID_st_gid,st_gid);
              
                                                                                // should be long long - bigint
              xsSlot st_size        = xsInteger(stat.st_size);
              xsmcSet(stat2,xsID_st_size,st_size);
              
              
              xsSlot st_atime_x     = xsInteger(stat.st_atime);
              xsmcSet(stat2,xsID_st_atime,st_atime_x);
              
              
              //char str[21];
              
              //snprintf(str,21,"%lld",stat.st_mtime);
              
              xsSlot st_mtime_x     = xsInteger(stat.st_mtime);
              xsmcSet(stat2,xsID_st_mtime,st_mtime_x);
              
              
              xsSlot st_ctime_x     = xsInteger(stat.st_ctime);
              xsmcSet(stat2,xsID_st_ctime,st_ctime_x);
              
              xsSlot st_blksize     = xsInteger(stat.st_blksize);
              xsmcSet(stat2,xsID_st_blksize,st_blksize);
              
              xsSlot st_blocks      = xsInteger(stat.st_blocks);
              xsmcSet(stat2,xsID_st_blocks,st_blocks);
              
              xsResult        = stat2;
              
              
        }//xs_sdcard_file_stat
        
        
        void xs_sdcard_file_truncate(xsMachine *the){
        
              char *path    = xsmcToString(xsArg(0));
              
              esp_err_t err   = sdcard.file.truncate(path);
              
              if(err){
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_file_truncate
        
        
  //:
  
  
        void xs_sdcard_dir_num(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              int ct;
              
              esp_err_t result    = sdcard.dir.num(path,&ct);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              xsmcSetInteger(xsResult,ct);
              
        }//xs_sdcard_dir_num
        
        
        void xs_sdcard_dir_list(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              char** buf;
              int num;
              
              esp_err_t result    = sdcard.dir.list(path,&buf,&num);
              if(result!=ESP_OK){
                    char* str;
                    if(result==ESP_ERR_NO_MEM){
                          str   = "no memory";
                          xsmcSetString(xsResult,str);
                          return;
                    }
                    str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              
              xsSlot arr    = xsNewArray(num);
              
              for(int i=0;i<num;i++){
              
                    xsSlot str    = xsString(buf[i]);
                    xsmcSetIndex(arr,i,str);
                    
              }//for
              
              xsResult    = arr;
              
              sdcard.dir.list_free(&buf,num);
              
        }//xs_sdcard_dir_list
        
        
        void xs_sdcard_dir_mkdir(xsMachine* the){
        
              char* path    = xsmcToString(xsArg(0));
              
              esp_err_t result    = sdcard.dir.mkdir(path);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_dir_mkdir
        
        
        void xs_sdcard_dir_clear(xsMachine *the){
        
              char *path    = xsmcToString(xsArg(0));
              
              esp_err_t err   = sdcard.dir.clear(path);
              
              if(err){
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_dir_clear
        
        
        void xs_sdcard_dir_delete(xsMachine *the){
        
              char* path    = xsmcToString(xsArg(0));
              
              esp_err_t result    = sdcard.dir.delete(path);
              
              if(result!=ESP_OK){
                    char* str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
        }//xs_sdcard_dir_delete
        
        
        void xs_sdcard_dir_exists(xsMachine *the){
        
              char *path    = xsmcToString(xsArg(0));
              bool exists;
              
              esp_err_t err   = sdcard.dir.exists(path,&exists);
              
              if(err){
                    char *str   = strerror(errno);
                    xsmcSetString(xsResult,str);
                    return;
              }
              
              xsmcSetBoolean(xsResult,exists);
              
        }//xs_sdcard_dir_exists
        
        
  //:
  
  
        void buf_str(void *buf,size_t size,char *output,size_t output_size){
        
              snprintf(output,output_size,"%.*s",(int)size,(char*)buf);
              
        }//buf_str
        
        
  //:
  
  
        void debug2(xsMachine* the,const char* fmt,...){
        
              if(!df){
                    return;
              }
              
              char str[50];
              
              va_list args;
              va_start(args,fmt);
              
              xsLog("[ %s ] ",tag);
              vsnprintf(str,sizeof(str),fmt,args);
              xsLog("%s\n",str);
              
              va_end(args);
              
        }//debug
        
        
        
        
        
        
