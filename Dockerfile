FROM ubuntu:14.04
MAINTAINER Alessandro Oliveira <alessandro@dynamicflow.com.br>
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh && bash nodesource_setup.sh && rm nodesource_setup.sh
RUN apt-get update && apt-get install -y nodejs git make python g++
RUN git clone https://github.com/aro1976/staticache.git
RUN cd staticache; npm install
