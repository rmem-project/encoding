# ENC-006 — SourceBuffer і raw bytes

## Мета

Реалізувати source model для збереження original bytes, який потрібен source-perfect workflows і parser integration.

## Обсяг

- Реалізувати `SourceBuffer` для immutable доступу до raw bytes.
- Визначити правила копіювання або ownership для `Uint8Array`, `ArrayBuffer` і зібраних stream bytes.
- Додати APIs для byte slicing без неочікуваної мутації.
- Забезпечити, що BOM та invalid bytes не втрачаються після decoding.

## Критерії виконання

- `DecodedDocument.bytes` і `DecodedDocument.source` вказують на повний original byte input.
- Зовнішня мутація input buffer не змінює вже створений decoded document.
- Raw bytes доступні навіть якщо `stripBom: true`.

## Межі

- Не будувати `OffsetMap` у цій задачі.
- Не декодувати bytes у text.
