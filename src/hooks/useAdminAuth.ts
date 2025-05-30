import { useUser } from '@clerk/clerk-react';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  imageUrl?: string;
}

export const useAdminAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  const adminUser: AdminUser | null = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.publicMetadata?.role as string || 'customer',
    permissions: user.publicMetadata?.permissions as string[] || [],
    imageUrl: user.imageUrl,
  } : null;

  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'super_admin';
  
  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true; // Super admin has all permissions
    return adminUser.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return permissions.some(permission => adminUser.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return permissions.every(permission => adminUser.permissions.includes(permission));
  };

  return {
    user: adminUser,
    isLoaded,
    isSignedIn,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}; 