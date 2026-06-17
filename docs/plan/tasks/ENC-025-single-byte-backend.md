# ENC-025 — Single-byte legacy backend

## Мета

Реалізувати exact decoding для single-byte canonical encodings v1.

## Обсяг

- Додати mapping tables для `windows-1251`, `windows-1252`, `iso-8859-1`, `iso-8859-5`, `koi8-r`, `cp866`.
- Реалізувати decode з exact one-byte-to-code-unit або one-byte-to-character mapping.
- Підтримати replacement/fatal behavior для unmapped bytes, якщо такі є в конкретній таблиці.
- Повернути mapping segments без per-character overhead там, де можливий encoded segment.

## Критерії виконання

- Legacy fixtures декодуються очікуваним текстом.
- Source ranges для single-byte encodings мапляться назад у original bytes.
- Tables стабільні і покриті smoke tests.

## Межі

- Не додавати legacy encodings поза v1.
- Не покладатися на системну locale.
