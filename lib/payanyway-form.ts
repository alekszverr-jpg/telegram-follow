export type PayAnyWayForm = { action: string; method: "POST"; fields: Record<string, string> };

export function validatePayAnyWayForm(value: unknown, requestId: string, amount: number): PayAnyWayForm | undefined {
  if (!value || typeof value !== "object") return;
  const form = value as PayAnyWayForm;
  if (form.action !== "https://www.payanyway.ru/assistant.htm" || form.method !== "POST" || !form.fields || Array.isArray(form.fields)) return;
  const fields = form.fields;
  const allowed = ["MNT_ID", "MNT_TRANSACTION_ID", "MNT_AMOUNT", "MNT_CURRENCY_CODE", "MNT_TEST_MODE", "MNT_DESCRIPTION", "moneta.locale", "MNT_SIGNATURE", "MNT_SUCCESS_URL", "MNT_FAIL_URL", "MNT_RETURN_URL", "MNT_INPROGRESS_URL"];
  if (Object.keys(fields).some(key => !allowed.includes(key) || typeof fields[key] !== "string" || fields[key].length > 1000)) return;
  if (fields.MNT_ID !== "47523795" || fields.MNT_TRANSACTION_ID !== requestId || fields.MNT_AMOUNT !== amount.toFixed(2) ||
      fields.MNT_CURRENCY_CODE !== "RUB" || !["0", "1"].includes(fields.MNT_TEST_MODE) || !/^[a-f0-9]{32}$/i.test(fields.MNT_SIGNATURE || "")) return;
  const origin = requestId.startsWith("RB-") ? "https://realbuzz.ru" : "https://xn----8sbicgasaatoponcziw4g.xn--p1ai";
  for (const name of ["MNT_SUCCESS_URL", "MNT_FAIL_URL", "MNT_RETURN_URL", "MNT_INPROGRESS_URL"]) {
    try {
      const url = new URL(fields[name]);
      if (url.origin !== origin || url.pathname !== "/payment/return/" || url.searchParams.get("order") !== requestId || url.username || url.password) return;
    } catch { return; }
  }
  return { action: form.action, method: "POST", fields: { ...fields } };
}
