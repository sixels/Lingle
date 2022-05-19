#!/bin/bash

set -eu

[ "$#" -eq 2 ] || {
  echo "You should pass the frequency list and the wordlist path as argument" >&2
  exit -1
}

FLIST_PATH=$(readlink -f "$1")
[ -f "$FLIST_PATH" ] || {
  echo "Frequency list not found: '$FLIST_PATH'" >&2
  exit -1
}
WLIST_PATH=$(readlink -f "$2")
[ -f "$WLIST_PATH" ] || {
  echo "Word list not found: '$WLIST_PATH'" >&2
  exit -1
}

cd $(dirname "$0")

# filter the wordlist
WLIST="$(./filter.sh "$WLIST_PATH")"

./sanitize.py "$FLIST_PATH" <(./normalize.py <<<$WLIST \
                                | uniq -c              \
                                | column -t            \
                                | ./dedup.py  <(echo "$WLIST")) \
  | sed 's/\(.*\)/"\1",/'