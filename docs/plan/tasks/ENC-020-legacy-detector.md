# ENC-020 — Legacy Cyrillic detector

## Мета

Реалізувати legacy heuristic detection для `windows-1251`, `koi8-r`, `cp866`, `iso-8859-5` і `windows-1252` у межах профілю.

## Обсяг

- Реалізувати deterministic scoring для Cyrillic fixtures.
- Обмежувати candidates через profile allowed encodings.
- Враховувати `legacyHeuristics` і правила `rmem` щодо валідного UTF-8.
- Створювати ambiguous warning, якщо кілька candidates мають близький score.

## Критерії виконання

- `legacyCyrillic` відрізняє основні Cyrillic encodings на контрольних fixtures або повертає ambiguous warning.
- Legacy detector не запускається для профілів, де він вимкнений.
- ASCII-only input не отримує фальшиво високий legacy confidence.

## Межі

- Не гарантувати визначення мови документа.
- Не робити aggressive auto-detect everything поза allowed encodings.
