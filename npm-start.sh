#!/bin/bash
env=${1:-'set_env_default_param'}

# set your mongodb uri string.
export MONGODB_URI=mongodb://127.0.0.1/estimate-support-system-db
# set your set your super secret words.
export SUPER_SECRET=set-your-super-secret-words
# set your client host application url.
export ALLOW_ORIGIN=http://localhost:3000

if [ $env = 'prod' ]; then
  set -x
  npm start
elif [ $env = 'dev' ]; then
  set -x
  npm run start_dev
else
  echo "set parameter 'dev' or 'prod'"
fi
