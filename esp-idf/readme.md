



```

        idf.py --build-dir /work/esp-idf/build/sdcard_test/local-component set-target esp32s3
        idf.py --build-dir /work/esp-idf/build/sdcard_test/local-component menuconfig
        idf.py -B /work/esp-idf/build/sdcard_test/local-component --port COM10 build flash monitor
        idf.py --build-dir /work/esp-idf/build/sdcard_test/local-component fullclean

```




