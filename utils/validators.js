export function isValidImageUrl(v) {
  if (!v) return false;
  // site-relative путь из статики
  if (v.startsWith('/images/')) return true;
  try {
    const u = new URL(v, 'http://example.com'); // чтобы не падать на относительном
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}