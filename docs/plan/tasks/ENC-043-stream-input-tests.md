# ENC-043 — Stream і async input tests

## Мета

Покрити stream-safe behavior і всі async input форми зі SPEC.

## Обсяг

- Тестувати `AsyncIterable<Uint8Array>` і `ReadableStream<Uint8Array>`.
- Тестувати `createDecodingStream`, `write` до/після detection і `end`.
- Тестувати split UTF-8, split UTF-16 і split CRLF.
- Тестувати incomplete final sequence для fatal і replace policies.

## Критерії виконання

- Stream result еквівалентний high-level decode result для тих самих bytes.
- `write` ranges стабільні і не перекриваються некоректно.
- `end` виявляє incomplete pending sequence.

## Межі

- Не тестувати performance великих streams як acceptance blocker v1.
- Не використовувати timing-sensitive assertions.
