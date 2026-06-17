# ENC-013 — Нормалізація options

## Мета

Звести `DecodeDocumentOptions` і `DetectEncodingOptions` до внутрішньої validated форми перед detection і decoding.

## Обсяг

- Нормалізувати profile, explicit/default encodings, allowed encodings, minConfidence і sample size.
- Перевіряти конфлікти опцій, наприклад unsupported explicit encoding або default encoding поза allowed list.
- Застосовувати profile defaults для `stripBom`, `sourceMap`, `replacementPolicy` і backend preference.
- Видавати fatal `EncodingError` для некоректних опцій.

## Критерії виконання

- Внутрішній pipeline отримує повністю нормалізовані options.
- Конфлікти опцій не перетворюються на неявний fallback.
- Поведінка sync і async APIs однакова для однакових options.

## Межі

- Не виконувати detection.
- Не змінювати public API shape.
