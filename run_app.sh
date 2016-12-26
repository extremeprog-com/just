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

perl -pi -e 's/{site_name}/'`echo $JUST_SITE_NAME`'/g' mgosites-admin/index.html

if [ -z "$JUST_SITE_NAME" ]; then
    ./prepare_site --site-name=$JUST_SITE_NAME --domain-name=$JUST_DOMAIN_NAME --free-register=$JUST_FREE_REGISTER
fi

if [[ -z "$JUST_ADMIN_EMAIL" ]] && [[ -z "$JUST_ADMIN_PASSWORD" ]] && [[ -z "$JUST_SITE_NAME" ]]; then
    node just-config-layer/add_admin_user.js --email=$JUST_ADMIN_EMAIL --password=$JUST_ADMIN_PASSWORD --site-name=$JUST_SITE_NAME
fi

cd /root/mongo-sites-api/
node just-http-layer/server.js
