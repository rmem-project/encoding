# ENC-005 — Errors, warnings і structured results

## Мета

Реалізувати єдиний механізм warning/error/result, щоб всі шари бібліотеки створювали стабільні diagnostics англійською мовою.

## Обсяг

- Реалізувати `EncodingWarning`, `EncodingError` і `EncodingResult`.
- Зафіксувати базові warning/error codes зі специфікації.
- Забезпечити immutable warning arrays і stable ordering.
- Додати helpers для створення fatal errors без втрати `byteRange`, `textRange`, `details` і накопичених warnings.

## Критерії виконання

- Runtime messages, warnings і errors генеруються англійською мовою.
- Fatal стани зберігають структуровані ranges і details.
- `tryDecodeDocument` зможе повторно використати ці primitives без throw.

## Межі

- Не визначати detection scoring у цій задачі.
- Не підміняти typed errors plain objects, якщо вони мають поводитись як `Error`.
