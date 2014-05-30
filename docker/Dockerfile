FROM ubuntu:14.04
MAINTAINER Luis Elizondo "lelizondo@gmail.com"

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y nodejs npm
RUN npm install -g expressjsmvc express bower

RUN apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor
ADD ./config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN apt-get install -y nginx
ADD ./config/nginx.conf /etc/nginx/nginx.conf

# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 80
EXPOSE 3000

ENV MONGODB_DATABASE dbman
ENV PORT 3000

WORKDIR /var/www

CMD ["/usr/bin/supervisord", "-n"]