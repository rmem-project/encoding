# ENC-024 — Native UTF-8/UTF-16 backend

## Мета

Реалізувати власний exact backend для UTF-8, UTF-16LE і UTF-16BE, який може будувати source maps і валідні errors.

## Обсяг

- Декодувати UTF-8 з fatal/replace policies.
- Декодувати UTF-16LE/BE з BOM handling і surrogate pair validation.
- Повернути decoded text, warnings і mapping segments або дані для builder.
- Забезпечити byte ranges для invalid sequences.

## Критерії виконання

- Backend підтримує exact source map.
- Fatal invalid sequence кидає/повертає structured `EncodingError`.
- Replace policy створює replacement warnings і segments.

## Межі

- Не використовувати `TextDecoder` як єдине джерело правди, якщо він не дає required ranges.
- Не підтримувати legacy single-byte encodings у цій задачі.
