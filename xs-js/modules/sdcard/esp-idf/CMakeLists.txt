



        idf_component_register(
              SRCS "sdcard.c"
              INCLUDE_DIRS "include"
              PRIV_REQUIRES esp_driver_sdspi fatfs
        )
        
        
