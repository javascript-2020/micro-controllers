


/*

//sdcard.c:d

09-05-25


*/

        #include "sdcard.h"
        
        #include <string.h>
        #include <sys/unistd.h>
        #include <sys/stat.h>
        #include <dirent.h>
        
        
        #include "esp_vfs_fat.h"
        //#include "sdmmc_cmd.h"
        #include "driver/sdspi_host.h"
        #include "esp_heap_caps.h"
        #include "esp_err.h"
        #include "esp_log.h"
        
        
        
        
        static const char *TAG          = "[ sdcard ]";
        
        
        int cs      = 40;
        int clk     = 39;
        int mosi    = 42;
        int miso    = 41;
        
        
        sdcard_t sdcard;
        
        
  //
  
  
  
  
  
  
        typedef struct {
              const char*     mount;
              sdmmc_card_t*   card;
              sdmmc_host_t*   host;
        } sd_card_t;
        
        sd_card_t** list;
        
        size_t list_len     = 0;
        size_t list_size    = 1;
        
        void list_add(const char* mount,sdmmc_host_t* host,sdmmc_card_t* card){
        
              size_t size           = sizeof(sdmmc_host_t);
              sdmmc_host_t* host2   = (sdmmc_host_t*)heap_caps_malloc(size,MALLOC_CAP_8BIT);
              memcpy(host2,host,size);
              
              size                  = sizeof(sd_card_t);
              sd_card_t* sd_card    = (sd_card_t*)heap_caps_malloc(size,MALLOC_CAP_8BIT);
              sd_card->mount        = mount;
              sd_card->host         = host2;
              sd_card->card         = card;
              
              list[list_len]        = sd_card;
              list_len++;
              
        }//list_add
        
        sd_card_t* list_find(const char* mount){
        
              sd_card_t* ptr;
              int cmp;
              
              for(int i=0;i<list_len;i++){
              
                    ptr   = list[i];
                    cmp   = strcmp(ptr->mount,mount);
                    if(cmp==0){
                          break;
                    }
                    ptr   = NULL;
                    
              }//for
              return ptr;
              
        }//find
        
        void list_rem(const char* mount){
        
              sd_card_t* ptr;
              int cmp;
              int i;
              
              for(i=0;i<list_len;i++){
              
                    ptr   = list[i];
                    cmp   = strcmp(ptr->mount,mount);
                    if(cmp==0){
                          break;
                    }
                    ptr   = NULL;
                    
              }//for
              
              if(!ptr){
                    return;
              }
              
              heap_caps_free(ptr->host);
              heap_caps_free(ptr);
              
              if(i<list_len-1){
                    for(int j=i+1;j<list_len;j++){
                    
                          list[j-1]   = list[j];
                          
                    }//for
                    
              }
              
              list_len--;
              
        }//list_rem
        
        
  //:
  
  
        void version(){
        
              ESP_LOGI(TAG,"version 2.0");
              
        }//version
        
        
  //:
  
  
        esp_err_t mount(const char* mount,int cs,int clk,int mosi,int miso){
        
              esp_err_t result;
                                                                                ESP_LOGI(TAG, "Initializing SD card");
                                                                                
                                                                                // Use settings defined above to initialize SD card and mount FAT filesystem.
                                                                                // Note: esp_vfs_fat_sdmmc/sdspi_mount is all-in-one convenience functions.
                                                                                // Please check its source code and implement error recovery when developing
                                                                                // production applications.
                                                                                ESP_LOGI(TAG, "Using SPI peripheral");
                                                                                
                                                                                // By default, SD card frequency is initialized to SDMMC_FREQ_DEFAULT (20MHz)
                                                                                // For setting a specific frequency, use host.max_freq_khz (range 400kHz - 20MHz for SDSPI)
                                                                                // Example: for fixed frequency of 10MHz, use host.max_freq_khz = 10000;
              sdmmc_host_t host   = SDSPI_HOST_DEFAULT();
                                                                                // This initializes the slot without card detect (CD) and write protect (WP) signals.
                                                                                // Modify slot_config.gpio_cd and slot_config.gpio_wp if your board has these signals.
              spi_bus_config_t bus_cfg    = {
                    .mosi_io_num        = mosi,
                    .miso_io_num        = miso,
                    .sclk_io_num        = clk,
                    .quadwp_io_num      = -1,
                    .quadhd_io_num      = -1,
                    .max_transfer_sz    = 4000,
              };
              
              result    = spi_bus_initialize(host.slot,&bus_cfg,SDSPI_DEFAULT_DMA);
              if(result!=ESP_OK){
                                                                                ESP_LOGE(TAG, "Failed to initialize bus.");
                    return result;
              }
              
                                                                                // Options for mounting the filesystem.
                                                                                // If format_if_mount_failed is set to true, SD card will be partitioned and
                                                                                // formatted in case when mounting fails.
              esp_vfs_fat_sdmmc_mount_config_t mount_config   = {
                    .format_if_mount_failed   = false,
                    .max_files                = 5,
                    .allocation_unit_size     = 16*1024
              };
              
              sdspi_device_config_t slot_config   = SDSPI_DEVICE_CONFIG_DEFAULT();
              slot_config.gpio_cs                 = cs;
              slot_config.host_id                 = host.slot;
              sdmmc_card_t* card;
                                                                                ESP_LOGI(TAG, "Mounting filesystem");
              result    = esp_vfs_fat_sdspi_mount(mount,&host,&slot_config,&mount_config,&card);
              if(result!=ESP_OK){
                    if(result==ESP_FAIL){
                                                                                ESP_LOGE(TAG, "Failed to mount filesystem. ");
                    }else{
                                                                                ESP_LOGE(TAG, "Failed to initialize the card (%s). "
                                                                                         "Make sure SD card lines have pull-up resistors in place.", esp_err_to_name(result));
                    }
                    return result;
              }
                                                                                ESP_LOGI(TAG, "Filesystem mounted");
/*
              if(debug){
                                                                                // Card has been initialized, print its properties
                    //sdmmc_card_print_info(stdout,card);
              }
*/


              list_add(mount,&host,card);
              
              return ESP_OK;
              
        }//mount
        
        
        esp_err_t unmount(const char* mount){
        
              sd_card_t* ptr    = list_find(mount);
              if(!ptr){
                                                                                ESP_LOGE(TAG,"failed to find mount point");
                    return ESP_FAIL;
              }
              
                                                                                // All done, unmount partition and disable SPI peripheral
              esp_vfs_fat_sdcard_unmount(ptr->mount,ptr->card);
                                                                                ESP_LOGI(TAG, "Card unmounted");
                                                                                
              spi_bus_free(ptr->host->slot);
              
              list_rem(mount);
              
              return ESP_OK;
              
        }//unmount
        
        
  //
  
  
        esp_err_t file_size(const char* path,long* size){
        
              FILE *file    = fopen(path,"rb");
              if(!file){
                                                                                //printf("Failed to open file: %s\n", filename);
                    return ESP_FAIL;
              }
              
              fseek(file,0,SEEK_END);
              *size   = ftell(file);
              
              fclose(file);
              
              return ESP_OK;
              
        }//size
        
        
        esp_err_t file_write(const char* path,void* buf,long size){
                                                                                ESP_LOGI(TAG, "Opening file %s", path);
              FILE *f   = fopen(path,"wb");
              if(f==NULL){
                                                                                ESP_LOGE(TAG, "Failed to open file for writing");
                    return ESP_FAIL;
              }
              
              size_t n    = fwrite(buf,1,size,f);
              
              fclose(f);
                                                                                ESP_LOGI(TAG, "File written %d",n);
              return ESP_OK;
              
        }//write
        
        
        esp_err_t file_read(const char *path,void* buf){
                                                                                ESP_LOGI(TAG, "Reading file %s", path);
              FILE *file    = fopen(path,"rb");
              if(!file){
                                                                                //printf("Failed to open file: %s\n", filename);
                    return ESP_FAIL;
              }
              
              fseek(file,0,SEEK_END);
              long size   = ftell(file);
              rewind(file);
              
              fread(buf,1,size,file);
              
              fclose(file);
              
              return ESP_OK;
              
              
/*

              FILE *f   = fopen(path,"r");
              if(f==NULL){
                                                                                ESP_LOGE(TAG, "Failed to open file for reading");
                    return ESP_FAIL;
              }
              
              char line[EXAMPLE_MAX_CHAR_SIZE];
              fgets(line,sizeof(line),f);
              fclose(f);
              
              char *pos   = strchr(line,'\n');
              if(pos){
                    *pos    = '\0';
              }
                                                                                ESP_LOGI(TAG, "Read from file: '%s'", line);
              return ESP_OK;
              
*/
        }//read
        
        
        
        static esp_err_t format(const char* mount){
        
            sd_card_t* ptr    = list_find(mount);
                                                                                // Format FATFS
            esp_err_t ret   = esp_vfs_fat_sdcard_format(mount,ptr->card);
            if(ret!=ESP_OK){
                                                                                ESP_LOGE(TAG, "Failed to format FATFS (%s)", esp_err_to_name(ret));
                return ret;
            }
            
/*
            struct stat st;
            if(stat(file_foo,&st)==0){
                                                                                ESP_LOGI(TAG, "file still exists");
                  return ret;
            }else{
                                                                                ESP_LOGI(TAG, "file doesn't exist, formatting done");
            }
*/
            return ESP_OK;
            
        }//format
        
        
        void list_directory(const char *path){
        
              DIR *dir    = opendir(path);
              if(!dir){
                    printf("Failed to open directory: %s\n",path);
                    return;
              }
              
              struct dirent *entry;
              while ((entry = readdir(dir)) != NULL) {
                  printf("Found: %s\n", entry->d_name);
              }
              
              closedir(dir);
              
        }//list_directory
        
        
        
        
        void test(const char* mount){
        
              sd_card_t* ptr    = list_find(mount);
              
              char hello[50];
              strcpy(hello,ptr->mount);
              strcat(hello,"/hello.txt");
              
              char foo[50];
              strcpy(foo,ptr->mount);
              strcat(foo,"/foo.txt");
              
              char nihao[50];
              strcpy(nihao,ptr->mount);
              strcat(nihao,"/nihao.txt");
              
              char data[50];
              size_t n;
                                                                                // Use POSIX and C standard library functions to work with files.
                                                                                
                                                                                // First create a file.
              n   = snprintf(data,50,"%s %s!\n","Hello",ptr->card->cid.name);
              
              esp_err_t ret   = file_write(hello,&data,n);
              if(ret!=ESP_OK){
                    return;
              }
              
                                                                                // Check if destination file exists before renaming
              struct stat st;
              if(stat(foo,&st)==0){
                                                                                // Delete it if it exists
                    unlink(foo);
              }
              
                                                                                // Rename original file
                                                                                ESP_LOGI(TAG, "Renaming file %s to %s",hello,foo);
                                                                                
              if(rename(hello,foo)!=0){
                                                                                ESP_LOGE(TAG, "Rename failed");
                    return;
              }
              
              
              ret   = file_read(foo,&data);
              if(ret!=ESP_OK){
                    return;
              }
              
              
              
              //memset(data,0,50);
              n     = snprintf(data,50,"%s %s!\n","Nihao",ptr->card->cid.name);
              ret   = file_write(nihao,&data,n);
              if(ret!=ESP_OK){
                    return;
              }
              
                                                                                //Open file for reading
              ret   = file_read(nihao,&data);
              if(ret!=ESP_OK){
                    return;
              }
              
              
              
              
              
        }//test
        
        
        
        
        __attribute__((constructor))
        void sdcard_init(){
        
              size_t size   = sizeof(sd_card_t*);
              size         *= list_size;
              list          = (sd_card_t**)heap_caps_malloc(size,MALLOC_CAP_8BIT);
              
              sdcard.version            = version;
              sdcard.mount              = mount;
              sdcard.unmount            = unmount;
              sdcard.test               = test;
              sdcard.size               = file_size;
              sdcard.read               = file_read;
              sdcard.write              = file_write;
              sdcard.list_directory     = list_directory;
              
              
        }//init
        
        
        
        
        
        