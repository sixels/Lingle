# Lingle

Um jogo de palavras em português inspirado em [Wordle](https://www.nytimes.com/games/wordle/index.html)

## Metas

- [x] Persistência
- [x] Menu
- [x] Animações
- [x] Compartilhar resultado
- [x] Sequência de vitórias
- [x] Estatísticas pessoais
- [x] Como jogar
- [ ] Mais modos de jogo
- [ ] Tela de ajustes
- [ ] PWA

## Recursos

A base de palavras vem do [VERO](https://pt-br.libreoffice.org/projetos/vero), o verificador ortográfico do LibreOffice.

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

Onde `palavras.txt` é o dicionário descompactado.
