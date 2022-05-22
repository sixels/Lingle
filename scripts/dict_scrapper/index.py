#!/usr/bin/env python3

import sys
import uuid
import multiprocessing

from typing import Tuple, Callable
from requests.models import Response
from requests_cache.session import CachedSession

cached_req = None


def globalize(func):
    def result(*args, **kwargs):
        return func(*args, **kwargs)

    result.__name__ = result.__qualname__ = uuid.uuid4().hex
    setattr(sys.modules[result.__module__], result.__name__, result)
    return result


def get_word(base_url: str, word: str) -> Response:
    assert cached_req is not None

    res = cached_req.get(base_url + f"{word}")
    return res


def get_all_words(
    wordlist_path: str, word_exists: Callable[[str], bool], nprocs: int = 8
):
    global cached_req

    cached_req = CachedSession("words_cache", backend="redis", use_cache_dir=True)

    @globalize
    def map_words(word: str) -> Tuple[str, bool]:
        return (word, word_exists(word))

    responses = []
    with multiprocessing.Pool(nprocs) as pool, open(wordlist_path, "r") as f:
        words = [line.split("\t")[0].strip() for line in f.readlines()]
        responses = pool.map(map_words, words)

    return map(lambda x: x[0], filter(lambda x: x[1], responses))
