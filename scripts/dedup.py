#!/usr/bin/env python

# Deduplicate similar words from a given frequency list and wordlist

from typing import Dict, Set, List
import sys
from normalize import normalize

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("You should pass the wordlist as argument and pipe the frequencies to stdin")
        sys.exit(-1)

    words_path = sys.argv[1]

    frequencies: Dict[int, Set[str]] = dict()
    words: Dict[int, List[str]] = dict()


    # get the frequencies
    for line in sys.stdin:
        freq, word = line.split()
        freq = int(freq)

        frequencies.setdefault(freq, set()).add(word)

    # get all words and group them by frequency
    with open(words_path, "r") as f:
        for line in f.readlines():
            word = line.strip()

            for k in frequencies.keys():
                if normalize(word) in frequencies[k]:
                    words.setdefault(k, list()).append(word)


    #print(*words[2][::2], sep='\n')
    # print all unique words ignoring similars.
    for freq,ws in words.items():
        print(*(w for w in ws[::freq]) , sep='\n')

