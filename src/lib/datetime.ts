// Node 的 Intl zh-TW 日期格式會夾帶 thin space 等特殊 Unicode 空白字元，
// 中文字型（如 Noto Sans TC）沒有對應字形，PDF 裡會顯示缺字方框，故一律正規化為一般空白。
function normalizeIntlWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei",
  }).format(d);
  return normalizeIntlWhitespace(formatted);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }).format(d);
  return normalizeIntlWhitespace(formatted);
}

export function formatCurrency(amount: number): string {
  return `NT$ ${amount.toLocaleString("zh-TW")}`;
}
