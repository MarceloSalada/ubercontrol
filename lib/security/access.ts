export type AuthorizedAccessRow = {
  email: string;
  is_active: boolean;
  allowed_until?: string | null;
};

export function isAuthorizedAccess(
  row: AuthorizedAccessRow | null | undefined,
  email: string | null | undefined
) {
  if (!row || !email) return false;
  if (!row.is_active) return false;
  if (row.email.trim().toLowerCase() !== email.trim().toLowerCase()) return false;

  if (row.allowed_until) {
    const allowedUntil = new Date(row.allowed_until);
    if (Number.isNaN(allowedUntil.getTime())) return false;
    if (allowedUntil.getTime() < Date.now()) return false;
  }

  return true;
}
