# ENC-017 — BOM detector

## Мета

Реалізувати detector, який визначає UTF BOM до heuristic detection.

## Обсяг

- Розпізнавати UTF-8, UTF-16LE і UTF-16BE BOM.
- Повертати encoding candidate з `source: "bom"` і коректним `bomLength`.
- Виявляти конфлікт BOM з explicit encoding.
- Підтримувати `stripBom` downstream через detection metadata.

## Критерії виконання

- BOM detector працює на коротких і повних inputs.
- BOM має пріоритет над metadata і heuristics, якщо explicit encoding не заданий.
- BOM conflict створює `ENCODING_BOM_CONFLICT` або fatal result згідно з profile/options.

## Межі

- Не декодувати документ.
- Не підтримувати BOM для encodings поза v1.
