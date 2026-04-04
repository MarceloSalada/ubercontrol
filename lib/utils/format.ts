export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function parseNumber(value: FormDataEntryValue | string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value ?? "")
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function monthRefFromDate(date: string) {
  const [year, month] = date.split("-");
  return `${year}-${month}`;
}
