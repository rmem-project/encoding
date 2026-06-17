# ENC-018 — UTF-8 validator

## Мета

Реалізувати deterministic UTF-8 validation як сильний detection signal і основу exact UTF-8 decoding.

## Обсяг

- Перевіряти валідність UTF-8 byte sequences без replacement.
- Виявляти invalid sequence byte ranges.
- Підтримати streaming-friendly state machine для split multibyte sequences.
- Повертати candidate з confidence `1` для валідного UTF-8 без сильнішого explicit/BOM signal.

## Критерії виконання

- Invalid UTF-8 у `strictUtf8` може стати fatal error з точним byte range.
- `rmem` не вибирає legacy encoding, якщо UTF-8 валідний.
- Validator не приймає overlong, surrogate і out-of-range sequences.

## Межі

- Не будувати decoded string.
- Не запускати legacy heuristics.
