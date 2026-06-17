# ENC-028 — Backend encode support

## Мета

Реалізувати encode capability у backend layer, оскільки public backend contract містить `canEncode` і `encode`.

## Обсяг

- Додати `EncodeOptions` і `EncodeResult` відповідно до потреб backend contract.
- Реалізувати UTF-8/UTF-16 encode для native backend.
- Реалізувати single-byte encode для supported legacy tables.
- Повертати structured errors/warnings для символів, які не можна закодувати.

## Критерії виконання

- `canEncode` чесно відображає capabilities backend.
- Encode tests покривають basic roundtrip для canonical encodings v1.
- Unsupported character behavior контрольований і документований.

## Межі

- Не додавати public high-level encode API, якщо SPEC його не вимагає.
- Не змішувати encode support із detection pipeline.
