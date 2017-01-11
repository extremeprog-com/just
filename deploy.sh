#!/usr/bin/env bash

if [ "$1" ]; then
  container_name="$1"
else
  container_name=just
fi

set -x

docker build -t extremeprog/just .

docker rm -f $container_name
docker run -d -it --restart=always -p 81:80 --name=$container_name -v /var/lib/just/mongodb:/var/lib/mongodb --hostname=$container_name -e PRODUCTION="" extremeprog/just
