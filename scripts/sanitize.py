#!/usr/bin/env python3

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("You should pass the path to the frequency list and the path to the wordlist as argument", file=sys.stderr)
        sys.exit(-1)

    freqs_path = sys.argv[1]
    wordlist_path = sys.argv[2]

    blacklist = set()
    with open(freqs_path, "r") as f:
        for line in f.readlines()[1:]:
            [word, tf, dicts, corpus, title, dmap] = line.split(",")
            if len(word) != 5:
                continue

            tf = int(tf)
            dicts = float(dicts)

            if dicts <= 0.09 or tf == 0:
                blacklist.add(word)
    
    with open(wordlist_path, "r") as f:
        for line in f.readlines():
            word = line.strip()
            if (word in blacklist):
                continue
            print(word, flush=False)
    sys.stdout.flush()



