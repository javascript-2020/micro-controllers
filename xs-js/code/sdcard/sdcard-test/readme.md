


### initial upload for sdcard


download files from [sdcard-test](https://javascript-2020.github.io/utils/github/download-a-directory-from-a-github-repository/download-a-directory-from-a-github-repository.html?owner=javascript-2020&repo=micro-controllers&path=%2Fmicro-controllers%2Fxs-js%2Fcode%2Fsdcard%2Fsdcard-test%2F&auto=true)


unzip

cd sdcard-test

mcconfig -d -m -p esp32/esp32s3

or

mcconfig -d -m -p esp32


note:

for esp32-cam with built in sdmmc controller for sdcard, the board cant enter download mode while a sdcard is inserted, some of the gpio pins are used, the card must be removed, the device flashed, then the sdcard inserted and the device reset





