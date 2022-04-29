#!/bin/bash

# Mix our scripts to produce the final wordlist.

set -eu


[ "$#" -eq 1 ] || {
  echo "You should pass only the wordlist path as argument" >&2
  exit -1
}

WLIST_PATH=$(readlink -f "$1")
[ -f "$WLIST_PATH" ] || {
  echo "File not found: '$WLIST_PATH'" >&2
  exit -1
}

cd $(dirname "$0")

# filter the wordlist
WLIST="$(./filter.sh "$WLIST_PATH")"
# generate the frequency list
FREQLIST="$(./normalize.py <<<$WLIST | uniq -c | column -t)"

<<<$FREQLIST ./dedup.py  <(echo "$WLIST")
