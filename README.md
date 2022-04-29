# Lingle

Um jogo de palavras em português inspirado em [Wordle](https://www.nytimes.com/games/wordle/index.html)

## Recursos

A lista de palavras vem de um [site da USP](https://www.ime.usp.br/~pf/dicios/index.html), e foram salvas em `data/palavras.txt`.
Algumas palavras foram adicionadas ou removidas, conforme julguei necessário. As alteraç\ões foram salvas em `data/palavras.5.txt`.

Criei uma mini coleção de scripts para facilitar o processamento das palavras (disponíveis no diretório `scripts/`). O commando usado para gerar wordlist presente em `src/wordlist.ts` foi:

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
