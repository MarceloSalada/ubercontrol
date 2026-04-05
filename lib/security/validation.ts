export function getFormString(formData: FormData, key: string, maxLength = 120) {
  const raw = formData.get(key);
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, maxLength);
}

export function parseMoneyInput(
  value: FormDataEntryValue | null,
  options?: { min?: number; max?: number }
) {
  const min = options?.min ?? 0;
  const max = options?.max ?? 1_000_000;

  if (typeof value !== "string") {
    throw new Error("Valor inválido.");
  }

  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error("Valor inválido.");
  }

  if (parsed < min || parsed > max) {
    throw new Error("Valor fora do limite permitido.");
  }

  return parsed;
}

export function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Data inválida.");
  }

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida.");
  }

  return value;
}

export function parseMonthRef(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new Error("Mês de referência inválido.");
  }

  return value;
}
