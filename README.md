
install-nodejs-lts-raspberry-pi-zero-w-armv6



# update system
$ sudo apt update && sudo apt upgrade

# uninstall old node (v10?)
$ sudo apt remove nodejs npm -y

# install nvm
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# use 'unofficial builds' in nvm
$ echo "export NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release" >> ~/.bashrc

# reload bashrc
$ source ~/.bashrc

# install latest LTS
$ nvm install --lts
$ nvm use --lts

# verify versions
$ node -v
$ npm -v
