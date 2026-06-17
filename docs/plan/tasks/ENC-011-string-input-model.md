# ENC-011 — String input і synthetic bytes

## Мета

Реалізувати already-decoded string input як API symmetry mode без змішування його з source-perfect byte intake.

## Обсяг

- Для string input повертати `text`, що дорівнює input string.
- Створювати synthetic UTF-8 bytes за правилами специфікації.
- Формувати `detection.source: "explicit"` і encoding з `explicitEncoding` або `defaultEncoding`.
- Додавати warning `ENCODING_TEXT_INPUT_SYNTHETIC_BYTES`, якщо запитано exact source map.

## Критерії виконання

- String input не маскується під original byte source.
- Synthetic `OffsetMap` явно позначений segment kind `synthetic`.
- Parser source-perfect режим може відрізнити string input від byte input через warning/source metadata.

## Межі

- Не додавати опцію, яка обіцяє відновити original bytes зі string.
- Не виконувати detection heuristics для already-decoded string input.
