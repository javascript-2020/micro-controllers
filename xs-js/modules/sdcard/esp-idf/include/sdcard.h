


/*

//sdcard.h:d

09-05-25


*/


        #include "esp_err.h"
        
        
        esp_err_t mount(const char* mount,int cs,int clk,int mosi,int miso);
        esp_err_t unmount(const char* mount);
        void test(const char* mount);
        
        
        typedef struct {
        
              void (*version)();
              
              esp_err_t (*mount)(const char* mount,int cs,int clk,int mosi,int miso);
              esp_err_t (*unmount)(const char* mount);
              void (*test)(const char* mount);
              
              esp_err_t (*size)(const char* path,long* size);
              esp_err_t (*write)(const char* path,void* data,long size);
              esp_err_t (*read)(const char *path,void* buf);
              void (*list_directory)(const char *path);
              
        } sdcard_t;
        
        extern sdcard_t sdcard;
        
        
        
        
        
        
        
        
