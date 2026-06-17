# ENC-012 — Encoding registry і label normalization

## Мета

Реалізувати canonical set encoding names v1 і нормалізацію labels до стабільного public result.

## Обсяг

- Зафіксувати `RmemEncodingName` canonical values зі SPEC.
- Додати aliases для `utf8`, `UTF-8`, `win1251`, `cp-866`, `latin1` та інших потрібних labels.
- Реалізувати WHATWG-compatible remapping для `webCompat`, зокрема `iso-8859-1` до `windows-1252` за політикою профілю.
- Повертати `NormalizedEncodingLabel` з original label, canonical encoding, aliases і source.

## Критерії виконання

- Усі public encoding names lowercase і stable.
- Unsupported labels створюють контрольовану помилку або warning згідно з контекстом.
- Web-compatible remapping явно видимий інтегратору.

## Межі

- Не реалізовувати detector scoring.
- Не додавати підтримку encoding поза v1 без окремого рішення.
