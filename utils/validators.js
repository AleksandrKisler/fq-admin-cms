export function isValidImageUrl(v) {
  if (!v) return false;
  if (v.startsWith('/images/')) return true;
  try {
    const u = new URL(v, 'http://example.com');
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}

export function isValidSlug(
    input,
    opts = {}
) {
  if (typeof input !== 'string') return false;
  const max = opts.max ?? 80;
  const requireLowercase = opts.requireLowercase ?? true;
  const allowUnicode = opts.allowUnicode ?? true;

  let s = input.trim();
  if (!s || s.length > max) return false;

  if (requireLowercase && s !== s.toLowerCase()) return false;

  const hasBadUrlChars = /[\/?#\[\]@!$&'()*+,;=.%\s]/.test(s);
  if (hasBadUrlChars) return false;

  if (s.startsWith('-') || s.endsWith('-') || s.includes('--')) return false;

  const re = allowUnicode
      ? /^[\p{L}\p{N}-]+$/u
      : /^[a-z0-9-]+$/;

  return re.test(s);
}