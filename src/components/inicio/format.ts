import type { CurrencyCode } from "./mock";

export function formatMoney(value: number, currency: CurrencyCode) {
  const format =
    currency === "ARS"
      ? new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        })
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        });

  return format.format(value);
}

export function formatShortDate(isoDate: string) {
  // yyyy-mm-dd -> dd/mm or mm/dd would vary by locale; we keep es-AR.
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return isoDate;
  return `${dd}/${mm}`;
}

export function formatTimeAgo(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `hace ${diffD} d`;
}

