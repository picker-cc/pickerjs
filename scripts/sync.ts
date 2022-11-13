#!/usr/bin/env zx
import { fetch } from 'zx';

const requestUrl = 'https://npmmirror.com/sync/@pickerjs';

const pkgs = ['common', 'core', 'create', 'ali-sms-plugin', 'asset-server-plugin', 'wechat-plugin'];

const requestUrls = pkgs.map(item => requestUrl + (item ? `/${item}` : ''));

async function sync() {
  await Promise.all(requestUrls.map(url => fetch(url)));
}

sync();
