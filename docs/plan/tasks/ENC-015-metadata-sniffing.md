# ENC-015 — Metadata sniffing

## Мета

Реалізувати контрольовану участь metadata у detection без порушення пріоритету explicit encoding і BOM.

## Обсяг

- Обробляти `declaredEncoding`, `contentType`, `htmlHeadSample`, `sourceName`.
- Витягувати charset з HTTP content-type і HTML meta charset.
- Нормалізувати metadata labels через encoding registry.
- Формувати warnings для metadata/BOM conflict або invalid metadata decoding.

## Критерії виконання

- Metadata не перебиває explicit encoding.
- BOM має пріоритет над metadata.
- У `webCompat` metadata може перебити heuristic detection, але рішення прозоре через source і warnings.

## Межі

- Не парсити повний HTML.
- Не визначати мову документа.
