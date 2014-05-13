FROM ubuntu:14.04
MAINTAINER Luis Elizondo "lelizondo@gmail.com"

RUN apt-get update
RUN apt-get install -y python python-software-properties curl git
RUN apt-get -qq update
RUN apt-get install -y nodejs npm
RUN npm install -g expressjsmvc express forever bower

EXPOSE 3000

ENV MONGODB_DATABASE dbman
ENV PORT 3000

WORKDIR /var/www

CMD ["nodejs", "start.js"]