#!/bin/bash

# Move into the project root
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$dir"

# A shell script which publishes all packages to a local Verdaccio registry for testing / local dev purposes

if [[ -z "${VERDACCIO_URL}" ]]; then
  VERDACCIO=https://npm.jiyang-health.com/
else
  VERDACCIO="${VERDACCIO_URL}"
fi

echo "Publishing to Verdaccio @ $VERDACCIO"
#cd ../apps/jy-server && npm publish -reg $VERDACCIO

cd ../packages/asset-server-plugin && npm publish -reg $VERDACCIO &&\
cd ../common && npm publish -reg $VERDACCIO &&\
cd ../core && npm publish -reg $VERDACCIO &&\
cd ../ali-sms-plugin && npm publish -reg $VERDACCIO && \
cd ../wechat-plugin && npm publish -reg $VERDACCIO
#cd ../editorjs-parser && npm publish -reg $VERDACCIO
