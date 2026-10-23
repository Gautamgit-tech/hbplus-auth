import { ALLOWED_DOMAIN } from '../config/constants';

// Exact match on the part after the LAST "@" (prevents "a@hbplus.fit.evil.com" and "a@evilhbplus.fit").
export function isAllowedEmail(email) {
  if (typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  return at > 0 && e.slice(at + 1) === ALLOWED_DOMAIN;
}
