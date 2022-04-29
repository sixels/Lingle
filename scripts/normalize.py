#!/usr/bin/env python

import sys
from unidecode import unidecode

def normalize(s: str):
    return unidecode(s)

if __name__ == "__main__":
    for p in sys.stdin:
        print(normalize(p), end='')
