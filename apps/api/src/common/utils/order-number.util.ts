import { randomBytes } from 'node:crypto';

function dateStamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function sequenceSegment(): string {
  return randomBytes(2).toString('hex').toUpperCase().padStart(4, '0').slice(0, 4);
}

/** Format: ORD-YYYYMMDD-XXXX */
export function generateOrderNumber(): string {
  return `ORD-${dateStamp()}-${sequenceSegment()}`;
}

/** Format: QT-YYYYMMDD-XXXX */
export function generateQuoteNumber(): string {
  return `QT-${dateStamp()}-${sequenceSegment()}`;
}

export function generateTicketNumber(): string {
  return `TKT-${dateStamp()}-${sequenceSegment()}`;
}
