#!/bin/bash

# Move into the project root
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$dir"

NPM = "https://registry.npmjs.org/"
echo "Publishing to NPM @ https://registry.npmjs.org/"
#cd ../apps/jy-server && npm publish -reg $NPM

cd ../packages/asset-server-plugin && pnpm publish --access public $NPM &&\
cd ../common && pnpm  publish --access public $NPM &&\
cd ../core && pnpm  publish --access public $NPM &&\
cd ../create && pnpm  publish --access public $NPM &&\
cd ../auth && pnpm  publish --access public $NPM &&\
cd ../ali-sms-plugin && pnpm publish --access public $NPM && \
cd ../wechat-plugin && pnpm  publish --access public $NPM
#cd ../editorjs-parser && npm publish -reg $VERDACCIO
