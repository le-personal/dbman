FROM ubuntu:12.04
MAINTAINER Luis Elizondo "lelizondo@gmail.com"

RUN apt-get update
RUN apt-get install -y python python-software-properties curl git
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get -qq update
RUN apt-get install -y nodejs
RUN npm install -g expressjsmvc express forever bower

EXPOSE 3000

ENV MONGODB_DATABASE dbman
ENV PORT 3000

WORKDIR /var/www

CMD ["node", "start.js"]