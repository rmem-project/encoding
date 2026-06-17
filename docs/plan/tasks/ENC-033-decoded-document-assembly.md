# ENC-033 — DecodedDocument assembly

## Мета

Стандартизувати складання immutable `DecodedDocument` з усіх шарів pipeline.

## Обсяг

- Об'єднати text, bytes, detection, lineIndex, offsetMap, warnings і source.
- Забезпечити stable warning ordering: detection, backend, source map, stream finalization.
- Захистити масиви і segments від зовнішньої мутації.
- Перевірити, що document invariants валідні перед поверненням.

## Критерії виконання

- `DecodedDocument` відповідає public contract.
- Warnings не дублюються без причини і не втрачають ranges/details.
- `bytes`, `source`, `offsetMap` і `lineIndex` узгоджені між собою.

## Межі

- Не приймати частково декодований документ як successful result після fatal error.
- Не генерувати user-facing messages українською в runtime code.
