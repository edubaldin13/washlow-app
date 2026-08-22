import { getCookie, setCookie, deleteCookie } from './cookies';

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
}

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
}

const USER_COOKIE_KEY = 'washflow_user';

export function saveUser(user: StoredUser): void {
  setCookie(USER_COOKIE_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  const value = getCookie(USER_COOKIE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    deleteCookie(USER_COOKIE_KEY);
    return null;
  }
}

export function clearUser(): void {
  deleteCookie(USER_COOKIE_KEY);
}

export function isAdmin(user: StoredUser | null): boolean {
  return user?.role === UserRole.Admin;
}
