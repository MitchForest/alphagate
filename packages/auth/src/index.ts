// Placeholder Better Auth adapter interface
export type AuthUser = {
  id: string
  email: string
}

export function getCurrentUser(): AuthUser | null {
  return null
}

