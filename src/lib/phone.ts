export function normalizeGreekPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0030")) {
    return digits.slice(4);
  }

  if (digits.startsWith("30") && digits.length === 12) {
    return digits.slice(2);
  }

  return digits;
}

export function normalizePhoneSearch(value: string) {
  return normalizeGreekPhone(value).toLowerCase();
}

