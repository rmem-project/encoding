# ENC-016 — Confidence, candidates і warning policy

## Мета

Зафіксувати єдину політику scoring і warning generation, щоб detector pipeline був deterministic.

## Обсяг

- Описати і реалізувати структуру `EncodingCandidate`.
- Визначити правила сортування candidates і tie-breaking.
- Реалізувати `minConfidence` checks.
- Додавати `ENCODING_LOW_CONFIDENCE`, `ENCODING_FALLBACK_USED` і `ENCODING_AMBIGUOUS_CANDIDATES` у відповідних випадках.

## Критерії виконання

- Однаковий input з однаковими options завжди дає однаковий порядок candidates.
- Low confidence не губиться і не перетворюється на silent success.
- Ambiguous legacy cases мають warning з details.

## Межі

- Не реалізовувати конкретні byte heuristics.
- Не використовувати nondeterministic або locale-dependent scoring.
