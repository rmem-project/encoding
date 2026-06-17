# ENC-040 — Detection і profile tests

## Мета

Покрити behavior detection pipeline і profile policies тестами, які описують зовнішню поведінку.

## Обсяг

- Тестувати explicit encoding, BOM priority, metadata priority і fallback.
- Тестувати `strictUtf8`, `rmem`, `legacyCyrillic`, `webCompat`.
- Тестувати candidate order, confidence і ambiguous warnings.
- Тестувати unsupported labels і option conflicts.

## Критерії виконання

- Тести доводять, що `rmem` не вибирає legacy encoding для валідного UTF-8.
- `legacyCyrillic` має контрольні positive і ambiguous cases.
- `webCompat` показує WHATWG label remapping у result.

## Межі

- Не тестувати internal implementation details detectors.
- Не прив'язуватися до нестабільних numeric scores там, де важлива тільки категорія confidence.
