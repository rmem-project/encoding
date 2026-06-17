# ENC-021 — Composite detection pipeline

## Мета

Зібрати окремі detectors у deterministic decision pipeline зі SPEC-defined priority rules.

## Обсяг

- Реалізувати порядок: options/profile, explicit label, sample, BOM, metadata, UTF-8, UTF-16, legacy, fallback.
- Об'єднати candidates і warnings у stable order.
- Застосувати explicit/BOM/metadata priority rules.
- Повернути повний `EncodingDetectionResult` з label і backend info placeholder або selected info.

## Критерії виконання

- Рішення detection відповідає розділу 9 SPEC.
- Fallback default encoding створює warning, якщо confidence нижче `minConfidence`.
- Composite detector не декодує весь документ і не будує `OffsetMap`.

## Межі

- Не реалізовувати public API wrapper; це задача `ENC-022`.
- Не приховувати detector conflicts без warnings.
