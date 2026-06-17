# ENC-022 — Public detectEncoding API

## Мета

Надати публічний detection-only API для routing, logging, diagnostics і тестування detector pipeline.

## Обсяг

- Реалізувати `detectEncoding(input: Uint8Array, options?: DetectEncodingOptions)`.
- Підключити options normalization і composite detector.
- Забезпечити, що API не декодує весь документ і не будує `OffsetMap`.
- Додати tests для public result shape і fatal option conflicts.

## Критерії виконання

- `detectEncoding` повертає `EncodingDetectionResult`.
- API працює синхронно для byte sample.
- Result містить encoding, confidence, source, candidates, warnings, label і backend info.

## Межі

- Не приймати stream або string input у цьому API.
- Не повертати decoded text.
