// Shared formatters. No esc()/innerHTML helper needed here — every render
// path in this app is a Vue template `{{ }}` interpolation, which auto-escapes.
export const fmtMoney = (n) => "$" + Math.round(n).toLocaleString("en-US");
export const fmtMoneyPrecise = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtPct = (n) => (n * 100).toFixed(1) + "%";
export const fmtDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
