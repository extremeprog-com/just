#!/usr/bin/env bash
set -e
if [ ! "$MONGO_URL" ]; then
    chown -R mongodb:mongodb /var/lib/mongodb
    test -f /var/lib/mongodb/mongod.lock && rm -f $_
    mongod --dbpath=/var/lib/mongodb --smallfiles &
    while true; do
        if mongo --eval "db.stats()" > /dev/null; then
            echo "waiting for mongodb..."
            sleep 2
        else
            break
        fi
    done
fi

# Set env variables if they are not set for further work
if [ -z "$JUST_SITE_NAME" ]; then
    export JUST_SITE_NAME="default"
fi

if [[ -z "$JUST_ADMIN_EMAIL" ]]; then
    export JUST_ADMIN_EMAIL="admin@just.extremeprog.com"
fi

if [[ -z "$JUST_ADMIN_PASSWORD" ]]; then
    export JUST_ADMIN_PASSWORD="admin"
fi

perl -pi -e 's/{site_name}/'`echo $JUST_SITE_NAME`'/g' mgosites-admin/index.html

# Initialization for a site and an admin
./prepare_site --site-name=$JUST_SITE_NAME --domain-name=$JUST_DOMAIN_NAME --free-register=true
node just-config-layer/add_admin_user.js --email=$JUST_ADMIN_EMAIL --password=$JUST_ADMIN_PASSWORD --site-name=$JUST_SITE_NAME

cd /root/just/
node just-http-layer/server.js
