/**
 * Normalize Iraqi / international phone numbers to E.164-ish +964… form.
 */
export function normalizePhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, '').trim();
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (digits.startsWith('+')) {
    const rest = digits.slice(1).replace(/\D/g, '');
    return `+${rest}`;
  }
  const only = digits.replace(/\D/g, '');
  if (only.startsWith('964')) return `+${only}`;
  if (only.startsWith('0') && only.length >= 10) return `+964${only.slice(1)}`;
  if (only.length === 10 && only.startsWith('7')) return `+964${only}`;
  if (only.length >= 8) return `+964${only}`;
  throw new Error('Invalid phone number');
}

export function phoneToSyntheticEmail(phone: string): string {
  const normalized = normalizePhone(phone).replace(/\D/g, '');
  return `${normalized}@customers.local`;
}
