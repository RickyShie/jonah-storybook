#!/bin/zsh
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 18以降が必要です。https://nodejs.org/ からインストールしてください。'
  read -r '?Enterキーで閉じます。'
  exit 1
fi
node server.mjs --open
