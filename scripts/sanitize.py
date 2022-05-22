#!/usr/bin/env python3

from os import environ

DICTS_THRESHOLD = float(environ.get("S_DICT_THRESHOLD") or 0.1)
TF_THRESHOLD = int(environ.get("S_TF_THRESHOLD") or 0)

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Sanitize a wordlist")
    parser.add_argument("freqlist", type=str, help="the word frequency list")
    parser.add_argument("wordlist", type=str, help="the word list to be sanitized")
    parser.add_argument(
        "--dicts-threshold",
        "-d",
        dest="dthreshold",
        type=float,
        default=DICTS_THRESHOLD,
        help=f"ignore words with 'dicts' lower than the threshold (default: {DICTS_THRESHOLD})",
    )
    parser.add_argument(
        "--tf-threshold",
        "-t",
        dest="tthreshold",
        type=int,
        default=TF_THRESHOLD,
        help=f"ignore words with 'tf' lower than the threshold (default: {TF_THRESHOLD})",
    )
    parser.add_argument(
        "--print-frequency",
        dest="pfreqs",
        action="store_true",
        help="if the frequency should be printed (default: false)",
    )
    parser.add_argument(
        "--print-dicts",
        dest="pdicts",
        action="store_true",
        help="if the 'dicts' should be printed (default: false)",
    )

    args = parser.parse_args()

    freqs_path = args.freqlist
    wordlist_path = args.wordlist
    dthreshold = args.dthreshold
    tthreshold = args.tthreshold
    pfreqs = args.pfreqs
    pdicts = args.pdicts

    blacklist = set()
    freqlist_map = {}
    with open(freqs_path, "r") as f:
        for line in f.readlines()[1:]:
            # word, tf, dicts, corpus, title, dmap
            [word, tf, dicts, _, _, _] = ldata = line.split(",")
            if len(word) == 5:
                freqlist_map[word] = ldata

                dicts = float(dicts)
                tf = int(tf)
                if dicts <= dthreshold or tf <= tthreshold:
                    blacklist.add(word)

    def cond_col(c, w, i):
        if w in freqlist_map and c:
            return "\t" + freqlist_map[w][i]
        return ""

    with open(wordlist_path, "r") as f:
        for line in f.readlines():
            word = line.strip()
            if len(word) == 5:
                if word not in blacklist:
                    out = word + cond_col(pfreqs, word, 1) + cond_col(pdicts, word, 2)
                    print(out, flush=False)
        sys.stdout.flush()
