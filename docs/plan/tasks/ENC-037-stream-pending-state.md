# ENC-037 — Pending stream state і finalization errors

## Мета

Гарантувати stream-safe decoding для UTF-8 і UTF-16 sequences, які розділені між chunks.

## Обсяг

- Зберігати pending bytes між `write` calls.
- Валідувати incomplete sequence на `end`.
- Повертати fatal `ENCODING_INCOMPLETE_STREAM_SEQUENCE` при `replacementPolicy: "fatal"`.
- При replace policy створювати replacement warning і segment.

## Критерії виконання

- Split UTF-8 і UTF-16 sequences декодуються коректно, якщо stream завершується валідно.
- Incomplete final sequence не ігнорується.
- Pending state не змішується між різними stream instances.

## Межі

- Не реалізовувати detector heuristics.
- Не нормалізувати line endings при stream decoding.
