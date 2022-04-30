# Lingle

Um jogo de palavras em português inspirado em [Wordle](https://www.nytimes.com/games/wordle/index.html)

## Metas

- [x] Persistência
- [x] Menu
- [ ] Animações
- [ ] Mais modos de jogo
- [ ] Estatísticas pessoais

## Recursos

A lista de palavras vem de um [site da USP](https://www.ime.usp.br/~pf/dicios/index.html), e foram salvas em `data/palavras.txt`.
Algumas palavras foram adicionadas ou removidas, conforme julguei necessário. As alteraç\ões foram salvas em `data/palavras.5.txt`.

Criei uma mini coleção de scripts para facilitar o processamento das palavras (disponíveis no diretório `scripts/`).

`filter.py`: Espera receber o **caminho** para a lista de palavras como argumento. Usado para filtrar palavras com 5 letras e organizá-las em ordem alfabética.

`normalize.py`: Espera receber uma lista de palavras pelo stdin. Usado para remover diacríticos das palvras, utilizado para geração da lista de frequência (`normalize.py <path/to/wordlist | uniq -c | column -t`).

`dedup.py`: Espera receber o caminho para a lista de palavras como argumento, e uma lista de frequências das palavras normalizadas, passada pelo stdin. É usado para remover palavras iguais, ignorando diacríticos (acentos). Quando há mais de uma ocorrência de uma palavra, somente a primeira é retornada.

`generate_wordlist.sh`: Espera receber o caminho para a lista de palavras como argumento. Mistura todos os scripts para gerar a lista de palavras final (já processada).

O commando usado para gerar wordlist presente em `src/wordlist.ts` foi:

```sh
./scripts/generate_wordlist.sh ./data/palavras.5.txt | sed 's/\(.*\)/"\1",/'
```

## Testando localmente

Você pode testar o jogo localmente, basta clonar o repositório e executar:

```sh
# usando npm
npm run dev
# usando yarn
yarn dev
# usando pnpm
pnpm dev
```

Agora só abrir seu navegador em http://localhost:3000
