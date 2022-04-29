#!/bin/sh

# Simple bash script to get all five-letter words from a given wordlist.

set -eu

cat "$1" | rg '^.....$'           \
  | gawk '{print tolower($0);}'   \
  | uniq | sort
