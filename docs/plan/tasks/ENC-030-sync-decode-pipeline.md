# ENC-030 — decodeDocumentSync

## Мета

Реалізувати синхронний high-level decode pipeline для byte, array buffer, iterable і string inputs.

## Обсяг

- З'єднати input normalization, options normalization, detection, backend selection, decoding, offset map і line index.
- Кидати `EncodingError` тільки для fatal станів.
- Підтримати `sourceMap: "exact"`, `"line"` і `"none"` відповідно до контракту.
- Забезпечити stable warnings merge.

## Критерії виконання

- `decodeDocumentSync` повертає повний `DecodedDocument`.
- Fatal states відповідають переліку зі SPEC.
- Sync behavior збігається з async behavior на тих самих bytes/options.

## Межі

- Не приймати `AsyncIterable` або `ReadableStream`.
- Не реалізовувати `tryDecodeDocument`.
