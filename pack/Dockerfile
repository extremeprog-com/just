FROM ubuntu:16.04

ENV PORT=80
ENV PRODUCTION=1

ENV MSA_SITE_NAME=msa
ENV MSA_FREE_REGISTER=true
ENV MSA_ADMIN_EMAIL=admin@msa.com
ENV MSA_ADMIN_PASSWORD=admin

VOLUME /var/lib/mongodb

RUN apt-get update
RUN apt-get install -y --force-yes nodejs nodejs-legacy npm mongodb
RUN npm install -g gulp

RUN mkdir -p /root/mongo-sites-api
COPY package.json /root/mongo-sites-api/package.json

WORKDIR /root/mongo-sites-api
RUN bash -c 'npm update || echo'
COPY . /root/mongo-sites-api
RUN gulp

CMD bash /root/mongo-sites-api/run_app.sh