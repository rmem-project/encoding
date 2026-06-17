# Fixtures

Цей каталог зберігає byte fixtures для поведінкових тестів `@rmem/encoding`.

## Структура

- `manifest.json` — реєстр fixtures і очікуваної поведінки.
- `schema.json` — JSON Schema для metadata у `manifest.json`.
- `bytes/` — місце для binary payloads, які потрібно читати як raw bytes.

## Формат fixture

Кожен запис у `manifest.json` має стабільний `id`, короткий `description`, рівно одне джерело байтів і блок `expected`.

Джерело байтів може бути одним із двох:

- `bytesPath` — шлях до binary file відносно `fixtures/`.
- `bytesHex` — hex-представлення байтів для малих payloads, зокрема invalid sequences.

`expected` має дозволяти тестам перевіряти не лише decoded text, а й detection, warnings, line ranges і offset ranges. Поля всередині `expected` є опціональними, щоб кожен fixture описував тільки релевантну для нього поведінку.

## Правила додавання fixtures

1. Додавайте payload як binary file у `fixtures/bytes/`, якщо це реальний документ або файл з legacy encoding.
2. Використовуйте `bytesHex` тільки для малих synthetic payloads, де важливо точно зафіксувати invalid bytes.
3. Не відкривайте binary fixtures як text і не зберігайте їх через редактор, який може автоматично перекодувати файл.
4. Для кожного fixture додавайте metadata в `manifest.json`: expected encoding, confidence, warnings, line ranges або offset ranges там, де вони важливі для поведінки.
5. Не додавайте detector-specific припущення в test helper. Helper має лише читати bytes і metadata.
6. Повний мінімальний corpus зі специфікації додається окремо в задачі `ENC-039`.
