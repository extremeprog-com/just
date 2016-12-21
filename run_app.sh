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

perl -pi -e 's/{site_name}/'`echo $MSA_SITE_NAME`'/g' mgosites-admin/index.html

if [ -z "$MSA_SITE_NAME" ]; then
    ./prepare_site --site-name=$MSA_SITE_NAME --domain-name=$MSA_DOMAIN_NAME --free-register=$MSA_FREE_REGISTER
fi

if [[ -z "$MSA_ADMIN_EMAIL" ]] && [[ -z "$MSA_ADMIN_PASSWORD" ]] && [[ -z "$MSA_SITE_NAME" ]]; then
    node msa-config-layer/add_admin_user.js --email=$MSA_ADMIN_EMAIL --password=$MSA_ADMIN_PASSWORD --site-name=$MSA_SITE_NAME
fi

cd /root/mongo-sites-api/
node msa-http-layer/server.js
