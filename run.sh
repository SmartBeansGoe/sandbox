#!/bin/sh
sudo docker build -t sandbox .
sudo docker run --privileged -p 3000:3000 sandbox
