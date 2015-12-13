#!/bin/bash

# This script is for copying dir of selected container to the remote server
# and run ./deploy_$container script remotely
#
# How to use:
# - for each deploy_$container script run 'ln -s _remote_deploy deploy_$container_remotely'


if [ -z "$1" ]; then
  echo " " Runs Docker commands remotely.
  echo " " Usage:
  echo " " $0 [ -i private_key_path ] [user@]hostname.domain
  echo
  exit 255
fi

SERVICE=mongo-sites-api

# make unique socket file for ssh master connection (see https://en.wikibooks.org/wiki/OpenSSH/Cookbook/Multiplexing)
SSH_SOCK=/tmp/$RANDOM.sock

TMPDIR=/tmp/$SERVICE._deploy

if [ "$3" ]; then
    SSH_KEY="$1 $2"
    SSH_HOST="$3"
else
    SSH_HOST="$1"
fi

SSH_ARGS="$SSH_KEY $SSH_HOST"

# make ssh master connection socket. this line can request a password (but only 1 time per this script)
ssh -S $SSH_SOCK -M -N -f $SSH_ARGS

function finish {
  # close ssh master connection
  ssh -O exit -S $SSH_SOCK $SSH_ARGS
}

# close master connection and remove socket on script end or failure
trap finish EXIT

# if dir exist, copy contents to a remote server
rsync -rv -e "ssh -S $SSH_SOCK $SSH_KEY" --exclude=.git --delete --delete-excluded . $SSH_HOST:$TMPDIR

# runs ./deploy_$container script commands remotely
# subscribe to logs
# run bash console inside container (for debug)
# last 2 steps is temporary and used for manual debug. should be removed in future (before automation in CI)
ssh -S $SSH_SOCK -t $SSH_ARGS "cd $TMPDIR; container_name=$SERVICE; $(cat deploy.sh) || exit; echo Streaming log...; (docker logs -f \$container_name & ); docker exec -it \$container_name bash || sleep infinity"

