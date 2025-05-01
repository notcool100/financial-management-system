/**
 * Role-Based Access Control (RBAC) system
 * This module defines the permissions for different staff roles
 */

// Define all possible permissions in the system
export type Permission =
  | 'dashboard:view'
  | 'clients:view'
  | 'clients:create'
  | 'clients:edit'
  | 'clients:delete'
  | 'staff:view'
  | 'staff:create'
  | 'staff:edit'
  | 'staff:delete'
  | 'loans:view'
  | 'loans:create'
  | 'loans:edit'
  | 'loans:approve'
  | 'loans:reject'
  | 'loans:disburse'
  | 'interest:view'
  | 'interest:edit'
  | 'transactions:view'
  | 'transactions:create'
  | 'reports:view'
  | 'reports:generate'
  | 'settings:view'
  | 'settings:edit';

// Define staff roles
export type Role = 'admin' | 'manager' | 'loan-officer' | 'teller';

// Define permissions for each role
export const rolePermissions: Record<Role, Permission[]> = {
  'admin': [
    'dashboard:view',
    'clients:view',
    'clients:create',
    'clients:edit',
    'clients:delete',
    'staff:view',
    'staff:create',
    'staff:edit',
    'staff:delete',
    'loans:view',
    'loans:create',
    'loans:edit',
    'loans:approve',
    'loans:reject',
    'loans:disburse',
    'interest:view',
    'interest:edit',
    'transactions:view',
    'transactions:create',
    'reports:view',
    'reports:generate',
    'settings:view',
    'settings:edit',
  ],
  'manager': [
    'dashboard:view',
    'clients:view',
    'clients:create',
    'clients:edit',
    'staff:view',
    'loans:view',
    'loans:create',
    'loans:edit',
    'loans:approve',
    'loans:reject',
    'loans:disburse',
    'interest:view',
    'transactions:view',
    'transactions:create',
    'reports:view',
    'reports:generate',
    'settings:view',
  ],
  'loan-officer': [
    'dashboard:view',
    'clients:view',
    'clients:create',
    'clients:edit',
    'loans:view',
    'loans:create',
    'loans:edit',
    'loans:approve',
    'loans:reject',
    'interest:view',
    'reports:view',
  ],
  'teller': [
    'dashboard:view',
    'clients:view',
    'clients:create',
    'transactions:view',
    'transactions:create',
    'reports:view',
  ],
};

// Role descriptions
export const roleDescriptions: Record<Role, string> = {
  'admin': 'Full access to all system features and settings',
  'manager': 'Oversee operations, staff, and approve loans',
  'loan-officer': 'Process loan applications and manage clients',
  'teller': 'Handle client transactions and basic account management',
};

/**
 * Check if a user has a specific permission
 * @param userRole The user's role
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  // Check if the role exists in rolePermissions before accessing it
  if (!userRole || !rolePermissions[userRole]) {
    console.warn(`Role "${userRole}" not found in rolePermissions`);
    return false;
  }
  return rolePermissions[userRole].includes(permission);
}

/**
 * Get all permissions for a specific role
 * @param role The role to get permissions for
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  // Check if the role exists in rolePermissions before accessing it
  if (!role || !rolePermissions[role]) {
    console.warn(`Role "${role}" not found in rolePermissions`);
    return [];
  }
  return rolePermissions[role];
}

/**
 * Get a human-readable name for a permission
 * @param permission The permission
 * @returns Human-readable name
 */
export function getPermissionName(permission: Permission): string {
  const [resource, action] = permission.split(':');
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
}

/**
 * Get a human-readable name for a role
 * @param role The role
 * @returns Human-readable name
 */
export function getRoleName(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'loan-officer':
      return 'Loan Officer';
    case 'teller':
      return 'Teller';
    default:
      return role;
  }
}