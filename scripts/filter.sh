#!/bin/sh

# Simple bash script to get all five-letter words from a given wordlist.

set -eu

cat "$1"                                          \
  | rg '^[^\.\-]{5}$'                             \
  | rg -v '^(\p{Lu}){5}$'                         \
  | gawk '{print tolower($0);}'                   \
  | rg -v '^[aáâ]{1}'                             \
  | uniq | sort
