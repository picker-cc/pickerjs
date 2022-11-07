#!/bin/bash

# Move into the project root
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$dir"

NPM = "https://registry.npmjs.org/"
echo "Publishing to NPM @ https://registry.npmjs.org/"
#cd ../apps/jy-server && npm publish -reg $NPM

cd ../packages/asset-server-plugin && pnpm publish -reg $NPM &&\
cd ../common && pnpm changeset publish -reg $NPM &&\
cd ../core && pnpm changeset publish -reg $NPM &&\
cd ../create && pnpm changeset publish -reg $NPM &&\
cd ../auth && pnpm changeset publish -reg $NPM &&\
cd ../ali-sms-plugin && pnpm changeset publish -reg $NPM && \
cd ../wechat-plugin && pnpm changeset publish -reg $NPM
#cd ../editorjs-parser && npm publish -reg $VERDACCIO
