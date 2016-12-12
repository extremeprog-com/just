#!/usr/bin/env bash

if [ "$1" ]; then
  container_name="$1"
else
  container_name=mongo-sites-api
fi

set -x

docker build -t extremeprog/mongo-sites-api .

docker rm -f $container_name
docker run -d -it --restart=always -p 81:80 --name=$container_name -v /var/lib/mongo-sites-api/mongodb:/var/lib/mongodb --hostname=$container_name -e PRODUCTION="" extremeprog/mongo-sites-api
