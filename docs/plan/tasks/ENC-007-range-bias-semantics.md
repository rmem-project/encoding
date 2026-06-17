# ENC-007 — Range validation і bias semantics

## Мета

Зафіксувати єдині правила half-open ranges `[start, end)` і поведінки `OffsetBias`, щоб source model не мав неоднозначних edge cases.

## Обсяг

- Реалізувати validation helpers для `SourceByteRange` і `TextRange`.
- Реалізувати нормалізацію та перевірку `OffsetBias`: `start`, `end`, `nearest`.
- Визначити поведінку на межах segment, collapsed ranges і out-of-bounds offsets.
- Додати focused unit tests для граничних випадків.

## Критерії виконання

- Некоректні ranges дають контрольовану помилку, а не silent wrong mapping.
- Bias rules однаково використовуються `OffsetMap` і `LineIndex`.
- Collapsed text ranges для BOM мають визначену поведінку.

## Межі

- Не реалізовувати повний `OffsetMap`.
- Не вводити 1-based offsets; offsets залишаються 0-based, а line/column позиції 1-based.
