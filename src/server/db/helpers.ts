/** Default filter: exclude soft-deleted rows. Spread into any where-clause. */
export const notDeleted = { deletedAt: null } as const;

/** Public shape of a user - passwordHash can never leak through this select. */
export const PUBLIC_USER = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  provider: true,
  onboardingStatus: true,
  lastActiveAt: true, // powers the members "Last active" column
  createdAt: true,
} as const;
