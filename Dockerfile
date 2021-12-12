FROM ubuntu:20.04

RUN apt-get update && apt -y install curl
# node dependency
ENV DEBIAN_FRONTEND="noninteractive" TZ="Europe/Berlin"
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt -y install nodejs git
# c toolchain
RUN apt-get update && apt -y install make gcc clang libcunit1 libcunit1-dev

# python toolchain
RUN apt-get update && apt -y install python3 ipython3 pypy3

# build isolate
RUN apt-get update && apt -y install libcap-dev
RUN mkdir /build
RUN cd /build && git clone https://github.com/ioi/isolate.git --depth 1
RUN cd /build/isolate && make install
RUN rm -rf /build

# temporary directory for submissions
RUN mkdir /submissions

# install api
RUN mkdir /app
WORKDIR /app
# copy package.json before everything else so we don't redo deps installing when we update the api
COPY package.json /app/package.json
# install dependencies
RUN npm install
# copy api to the container
COPY src /app/src

# the api can be accessed via port 3001
EXPOSE 3000

# start api
ENTRYPOINT node /app/src/index.js && exit
# ENTRYPOINT bash
