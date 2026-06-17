# ENC-001 — Package scaffold і структура модулів

## Мета

Створити базову структуру TypeScript-бібліотеки `@rmem/encoding`, щоб наступні задачі мали стабільні місця для коду, тестів, fixtures і публічних entrypoints.

## Обсяг

- Додати `package.json`, `tsconfig`-файли, package-level metadata і базові scripts.
- Створити рекомендовану структуру `src/`: `detector/`, `decoder/`, `source/`, `stream/`, `profile/`.
- Створити `tests/` і `fixtures/` без наповнення поведінковими fixtures.
- Додати головний `src/index.ts` як єдину публічну точку експорту.

## Критерії виконання

- Пакет збирається порожнім або мінімальним кодом без TypeScript-помилок.
- Структура модулів відповідає `docs/SPEC.md`.
- Public entrypoint існує, але не експортує нестабільні внутрішні модулі.

## Межі

- Не реалізовувати detection, decoding або source model.
- Не додавати runtime залежності без окремого обґрунтування в задачах backend layer.
