# ENC-003 — Інфраструктура fixtures

## Мета

Підготувати спосіб створення, збереження і читання byte fixtures так, щоб тести перевіряли реальні байти, а не випадково перекодований текст.

## Обсяг

- Створити conventions для `fixtures/` і helper APIs для читання fixture bytes.
- Додати metadata-формат для expected encoding, confidence, warnings, line ranges і offset ranges.
- Забезпечити можливість мати fixtures з invalid sequences і legacy encodings.
- Документувати правила додавання нових fixtures.

## Критерії виконання

- Тести можуть читати fixture як `Uint8Array` без автоматичного text decoding.
- Fixture metadata дозволяє перевіряти не тільки text, а й detection/source map/line index.
- Invalid byte sequences можна зберігати без втрати байтів.

## Межі

- Не створювати повний мінімальний corpus зі специфікації; це задача `ENC-039`.
- Не реалізовувати detector-specific логіку в fixture helpers.
