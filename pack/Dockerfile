FROM ubuntu:16.04

ENV PORT=80 \
    PRODUCTION=1 \
    MSA_SITE_NAME=msa \
    MSA_FREE_REGISTER=true \
    MSA_ADMIN_EMAIL=admin@msa.com \
    MSA_ADMIN_PASSWORD=admin

VOLUME /var/lib/mongodb

RUN apt-get update && \
    apt-get install -y nodejs nodejs-legacy npm mongodb && \
    apt-get clean

RUN npm install -g gulp

RUN mkdir -p /root/mongo-sites-api
COPY package.json /root/mongo-sites-api/package.json

WORKDIR /root/mongo-sites-api
RUN bash -c 'npm update || echo'
COPY . /root/mongo-sites-api
RUN gulp

CMD ["bash", "/root/mongo-sites-api/run_app.sh"]
