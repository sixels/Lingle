# Lingle

Um jogo de palavras em português inspirado em [Wordle](https://www.nytimes.com/games/wordle/index.html).

Disponível em [lingle.vercel.app](https://lingle.vercel.app)

## Metas

- [x] Persistência
- [x] Menu
- [x] Animações
- [x] Compartilhar resultado
- [x] Sequência de vitórias
- [x] Estatísticas pessoais
- [x] Como jogar
- [x] Mais modos de jogo
- [x] Mostrar soluções após o termino do jogo
- [x] Tela de ajustes
- [x] PWA

## Recursos

A base de palavras vem desse [projeto incrível](https://github.com/fserb/pt-br) do [Fernando Serboncini](https://fserb.com/), criador do jogo [Termo](https://term.ooo) (que também foi inspirado em Wordle!).

Criei uma mini coleção de scripts para facilitar o processamento das palavras (disponíveis no diretório `scripts/`).

### Estrutura dos scripts

`filter.py`: Espera receber o **caminho** para a lista de palavras como argumento. Usado para filtrar palavras com 5 letras e organizá-las em ordem alfabética.

`normalize.py`: Espera receber uma lista de palavras pelo stdin. Usado para remover diacríticos das palvras, utilizado para geração da lista de frequência (exemplo: `normalize.py <path/to/wordlist | uniq -c | column -t`).

`dedup.py`: Espera receber o caminho para a lista de palavras como argumento, e uma lista de frequências das palavras normalizadas, passada pelo stdin. É usado para remover palavras iguais, ignorando diacríticos (acentos). Quando há mais de uma ocorrência de uma palavra, somente a primeira é retornada.

`generate_wordlist.sh`: Espera receber o caminho para a lista de palavras como argumento. Mistura todos os scripts para gerar uma lista de palavras já processadas.

O commando usado para gerar wordlist presente em `src/wordlist.ts` foi:

```sh
./scripts/generate_wordlist.sh ./data/palavras.txt | sed 's/\(.*\)/"\1",/'
```
