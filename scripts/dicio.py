#!/usr/bin/env python3

import sys

import bs4

import dict_scrapper.index as scrap
from bs4 import BeautifulSoup

if __name__ == "__main__":
    BASE_URL = "https://dicio.com.br/pesquisa.php?q="

    if len(sys.argv) < 1:
        exit(1)

    wordlist_path = sys.argv[1]

    def word_exists(word: str) -> bool:
        res = scrap.get_word(BASE_URL, word)
        print(
            f"GET {word} -> {res.status_code}",
            file=sys.stderr,
        )

        if res.status_code != 200:
            return False

        soup = BeautifulSoup(res.content, "html.parser")
        title = soup.find("title")
        if title and "Busca" in title.text:
            results = soup.find("ul", class_="resultados")
            if type(results) is bs4.Tag:
                for a in results.find_all(attrs={"data-s": "es"}):
                    if type(span := a.find("span")) is bs4.Tag and span.text == word:
                        return True
        else:
            return True

        return False

    words = scrap.get_all_words(wordlist_path, word_exists, nprocs=50)
    for word in words:
        print(word)
