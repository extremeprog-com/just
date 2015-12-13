#!/bin/bash

if [ ! "$MONGO_URL" ]; then
    chown -R mongodb:mongodb /var/lib/mongodb
    rm var/lib/mongodb/mongod.lock
    mongod --dbpath=/var/lib/mongodb --smallfiles &
    while true; do
        mongo --eval "db.stats()" > /dev/null
        RESULT=$?
        if [ $RESULT -ne 0 ]; then
            echo "waiting for mongodb..."
            sleep 2
        else
            break
        fi
    done
fi

perl -pi -e 's/{site_name}/'`echo $MSA_SITE_NAME`'/g' mgosites-admin/index.html

cd /root/mongo-sites-api/
node server.js
