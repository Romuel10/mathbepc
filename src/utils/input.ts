export function normalizeNumberInput(value: string): string {
  return value.trim().replace(/\s+/g, '').replace(',', '.');
}

export function parseNumberInput(value: string, label = 'La valeur'): number {
  const normalized = normalizeNumberInput(value);
  if (!normalized) throw new Error(`${label} est obligatoire`);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new Error(`${label} n'est pas un nombre valide`);
  }
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new Error(`${label} n'est pas un nombre valide`);
  return number;
}

export function parseIntegerInput(value: string, label = 'La valeur'): number {
  const number = parseNumberInput(value, label);
  if (!Number.isInteger(number)) throw new Error(`${label} doit être un entier`);
  return number;
}

export function parseNumberOrZero(value: string, label = 'La valeur'): number {
  return value.trim() ? parseNumberInput(value, label) : 0;
}

export function parseOptionalNumber(value: string, label = 'La valeur'): number | null {
  return value.trim() ? parseNumberInput(value, label) : null;
}

export function parseNumberList(value: string, label = 'La liste'): number[] {
  const source = value.trim();
  if (!source) throw new Error(`${label} est vide`);
  // With semicolons, commas are treated as decimal separators: 2,5; 3,75; 4.
  // Without semicolons, commas act as list separators: 12, 14, 16.
  const parts = source.includes(';')
    ? source.split(';')
    : source.split(/[,\s]+/);
  const numbers = parts.map((item, index) => parseNumberInput(item, `${label} (élément ${index + 1})`));
  if (!numbers.length) throw new Error(`${label} est vide`);
  return numbers;
}

export function errorSteps(error: unknown) {
  const message = error instanceof Error ? error.message : 'Une erreur est survenue';
  return [{ text: `Erreur : ${message}`, highlight: true, type: 'warning' as const }];
}
