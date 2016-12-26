FROM ubuntu:16.04

ENV PORT=80 \
    PRODUCTION=1 \
    JUST_SITE_NAME=just \
    JUST_FREE_REGISTER=true \
    JUST_ADMIN_EMAIL=admin@just.extremeprog.com \
    JUST_ADMIN_PASSWORD=admin

VOLUME /var/lib/mongodb

RUN apt-get update && \
    apt-get install -y nodejs nodejs-legacy npm mongodb && \
    apt-get clean

RUN npm install -g gulp

RUN mkdir -p /root/just
COPY package.json /root/just/package.json

WORKDIR /root/just
RUN bash -c 'npm update || echo'
COPY . /root/just
RUN gulp

CMD ["bash", "/root/just/run_app.sh"]
