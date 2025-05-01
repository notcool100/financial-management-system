/**
 * Get the authentication token from localStorage
 * This function is safe to use in both client and server components
 * In server components, it will return null
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Check if the user is authenticated
 * This function is safe to use in both client and server components
 * In server components, it will return false
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
}

/**
 * Set the authentication token in localStorage
 * @param token The token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}