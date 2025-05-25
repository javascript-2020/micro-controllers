


/*

//component.xs.js:d

module

13-05-25


*/


        class sdcard_xs @ "xs_sdcard_destructor" {
        
              constructor(...params) @ "xs_sdcard";
              
              spi_mount() @ "xs_sdcard_spi_mount";
              spi_unmount() @ "xs_sdcard_spi_unmount";
              
              sdmmc_mount_data1() @ "xs_sdcard_sdmmc_mount_data1";
              sdmmc_mount_data4() @ "xs_sdcard_sdmmc_mount_data4";
              sdmmc_unmount() @ "xs_sdcard_sdmmc_unmount";
              
              format() @ "xs_sdcard_format";
              info() @ "xs_sdcard_info";
              
              file_read() @ "xs_sdcard_file_read";
              file_read_offset() @ "xs_sdcard_file_read_offset";
              file_read_until() @ "xs_sdcard_file_read_until";
              file_write() @ "xs_sdcard_file_write";
              file_write_offset() @ "xs_sdcard_file_write_offset";
              file_append() @ "xs_sdcard_file_append";
              file_size() @ "xs_sdcard_file_size";
              file_exists() @ "xs_sdcard_file_exists";
              file_delete() @ "xs_sdcard_file_delete";
              file_copy() @ "xs_sdcard_file_copy";
              file_rename() @ "xs_sdcard_file_rename";
              file_stat() @ "xs_sdcard_file_stat";
              file_truncate() @ "xs_sdcard_file_truncate";
              
              dir_num() @ "xs_sdcard_dir_num";
              dir_list() @ "xs_sdcard_dir_list";
              dir_mkdir() @ "xs_sdcard_dir_mkdir";
              dir_clear() @ "xs_sdcard_dir_clear";
              dir_delete() @ "xs_sdcard_dir_delete";
              dir_exists() @ "xs_sdcard_dir_exists";
              
        }//sdcard_xs
        
        
        export default sdcard_xs;
        
        
        
        
