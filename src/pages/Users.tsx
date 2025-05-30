import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Shield, 
  ShieldOff, 
  Edit, 
  Eye, 
  Users as UsersIcon, 
  AlertCircle,
  Search,
  Download,
  Upload,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../utils/formatters';
import { adminService, User, AdminAssignment, UserActivity } from '../services/adminService';

// Permission definitions
const PERMISSION_CATEGORIES = {
  products: {
    label: 'Products',
    permissions: [
      { key: 'products.view', label: 'View Products' },
      { key: 'products.create', label: 'Create Products' },
      { key: 'products.edit', label: 'Edit Products' },
      { key: 'products.delete', label: 'Delete Products' },
      { key: 'products.manage', label: 'Full Product Management' },
    ]
  },
  orders: {
    label: 'Orders',
    permissions: [
      { key: 'orders.view', label: 'View Orders' },
      { key: 'orders.edit', label: 'Edit Orders' },
      { key: 'orders.status', label: 'Update Order Status' },
      { key: 'orders.cancel', label: 'Cancel Orders' },
      { key: 'orders.refund', label: 'Process Refunds' },
    ]
  },
  users: {
    label: 'Users',
    permissions: [
      { key: 'users.view', label: 'View Users' },
      { key: 'users.edit', label: 'Edit Users' },
      { key: 'users.delete', label: 'Delete Users' },
      { key: 'users.admin', label: 'Manage Admin Roles' },
      { key: 'users.permissions', label: 'Manage Permissions' },
    ]
  },
  analytics: {
    label: 'Analytics',
    permissions: [
      { key: 'analytics.view', label: 'View Analytics' },
      { key: 'analytics.export', label: 'Export Reports' },
      { key: 'analytics.advanced', label: 'Advanced Analytics' },
    ]
  },
  settings: {
    label: 'Settings',
    permissions: [
      { key: 'settings.view', label: 'View Settings' },
      { key: 'settings.edit', label: 'Edit Settings' },
      { key: 'settings.system', label: 'System Settings' },
    ]
  }
};

const ROLE_PRESETS = {
  admin: {
    label: 'Admin',
    description: 'Full access to all features except system settings',
    permissions: [
      'products.manage', 'orders.view', 'orders.edit', 'orders.status',
      'users.view', 'users.edit', 'analytics.view', 'analytics.export'
    ]
  },
  manager: {
    label: 'Manager',
    description: 'Can manage products and orders',
    permissions: [
      'products.view', 'products.create', 'products.edit',
      'orders.view', 'orders.edit', 'orders.status',
      'analytics.view'
    ]
  },
  support: {
    label: 'Support',
    description: 'Can view and manage orders, limited product access',
    permissions: [
      'products.view', 'orders.view', 'orders.edit', 'orders.status',
      'users.view'
    ]
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Complete system access including user management',
    permissions: Object.values(PERMISSION_CATEGORIES).flatMap(cat => 
      cat.permissions.map(p => p.key)
    )
  }
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'admins'>('all');
  
  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  // Selected data
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, roleFilter, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        role: roleFilter,
      };

      if (activeTab === 'admins') {
        const response = await adminService.getAdmins();
        setUsers(response.data);
      } else {
        const response = await adminService.getUsers(filters);
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove admin privileges?')) return;
    
    try {
      await adminService.removeAdminRole(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
    }
  };

  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    setActivityLoading(true);
    setIsActivityModalOpen(true);
    
    try {
      const response = await adminService.getUserActivity(user.id);
      setUserActivity(response.data);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setUserActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const handleBulkActions = () => {
    if (selectedUsers.length === 0) return;
    setIsBulkModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportUsers({
        search: searchQuery,
        role: roleFilter,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getUserRoleBadge = (user: User) => {
    const role = user.publicMetadata?.role;
    if (!role || role === 'customer') return null;
    
    const roleColors: Record<string, string> = {
      admin: 'bg-blue-100 text-blue-800',
      super_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-green-100 text-green-800',
      support: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      key: 'select',
      label: '',
      width: '50px',
      render: (value: any, user: User) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (value: any, user: User) => (
        <div>
          <p className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.phoneNumber && (
            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
          )}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: any, user: User) => (
        <div className="flex items-center space-x-2">
          {getUserRoleBadge(user)}
          {user.publicMetadata?.role && user.publicMetadata.role !== 'customer' && (
            <Shield className="h-4 w-4 text-blue-500" />
          )}
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (value: any, user: User) => {
        const permCount = user.publicMetadata?.permissions?.length || 0;
        return permCount > 0 ? (
          <span className="text-sm text-gray-600">{permCount} permissions</span>
        ) : (
          <span className="text-sm text-gray-400">No permissions</span>
        );
      }
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: any, user: User) => (
        <div>
          {user.lastLoginAt ? (
            <span className="text-sm text-gray-900">{formatDateTime(user.lastLoginAt)}</span>
          ) : (
            <span className="text-sm text-gray-400">Never</span>
          )}
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (value: any, user: User) => (
        <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (value: any, user: User) => {
        const isAdmin = user.publicMetadata?.role && user.publicMetadata.role !== 'customer';
        
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewActivity(user)}
              className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
              title="View Activity"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleEditPermissions(user)}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit Permissions"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveAdmin(user.id)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove Admin"
                >
                  <ShieldOff className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleMakeAdmin(user)}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                title="Make Admin"
              >
                <Shield className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  if (loading && users.length === 0) {
    return (
      <LoadingSpinner size="lg" text="Loading users..." className="h-64" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'admins' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admins Only
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkActions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedUsers.length})
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="support">Support</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={activeTab === 'all' ? pagination : undefined}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        emptyMessage="No users found"
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedUser(null);
          setUserActivity([]);
        }}
        user={selectedUser}
        activity={userActivity}
        loading={activityLoading}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedUsers([]);
        }}
        selectedUserIds={selectedUsers}
        onSuccess={() => {
          fetchUsers();
          setSelectedUsers([]);
        }}
      />
    </div>
  );
};

// Role Assignment Modal Component
interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  isOpen, onClose, user, onSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_PRESETS>('admin');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const currentRole = user.publicMetadata?.role as keyof typeof ROLE_PRESETS;
      if (currentRole && ROLE_PRESETS[currentRole]) {
        setSelectedRole(currentRole);
        setCustomPermissions(user.publicMetadata?.permissions || []);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const permissions = ROLE_PRESETS[selectedRole].permissions;
      await adminService.makeUserAdmin(user.id, {
        userId: user.id,
        role: selectedRole,
        permissions
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Admin Role to ${user.firstName} ${user.lastName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
          <div className="space-y-3">
            {Object.entries(ROLE_PRESETS).map(([roleKey, roleData]) => (
              <div
                key={roleKey}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRole === roleKey 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRole(roleKey as keyof typeof ROLE_PRESETS)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={roleKey}
                    checked={selectedRole === roleKey}
                    onChange={() => setSelectedRole(roleKey as keyof typeof ROLE_PRESETS)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{roleData.label}</h4>
                    <p className="text-sm text-gray-500">{roleData.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {roleData.permissions.length} permissions included
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            Assign Role
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Permissions Modal Component
interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen, onClose, user, onSuccess
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.publicMetadata?.permissions || []);
    }
  }, [user]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await adminService.updatePermissions(user.id, selectedPermissions);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Permissions for ${user.firstName} ${user.lastName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{category.label}</h4>
              <div className="space-y-2">
                {category.permissions.map((permission) => (
                  <label key={permission.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.key)}
                      onChange={() => handlePermissionToggle(permission.key)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            Update Permissions
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Activity Modal Component
interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  activity: UserActivity[];
  loading: boolean;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen, onClose, user, activity, loading
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Activity Log for ${user.firstName} ${user.lastName}`} size="lg">
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner size="md" text="Loading activity..." className="h-32" />
        ) : activity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity found</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.action}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.ipAddress && (
                      <p className="text-xs text-gray-400 mt-2">IP: {item.ipAddress}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDateTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

// Bulk Actions Modal Component
interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onSuccess: () => void;
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen, onClose, selectedUserIds, onSuccess
}) => {
  const [action, setAction] = useState<'assign' | 'remove'>('assign');
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_PRESETS>('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (action === 'assign') {
        const assignments = selectedUserIds.map(userId => ({
          userId,
          role: selectedRole,
          permissions: ROLE_PRESETS[selectedRole].permissions
        }));
        await adminService.bulkAssignRoles(assignments);
      } else {
        await adminService.bulkRemoveAdminRoles(selectedUserIds);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Actions (${selectedUserIds.length} users)`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Action</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="assign"
                checked={action === 'assign'}
                onChange={(e) => setAction(e.target.value as 'assign')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">Assign Admin Roles</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="remove"
                checked={action === 'remove'}
                onChange={(e) => setAction(e.target.value as 'remove')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">Remove Admin Roles</span>
            </label>
          </div>
        </div>

        {action === 'assign' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as keyof typeof ROLE_PRESETS)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(ROLE_PRESETS).map(([roleKey, roleData]) => (
                <option key={roleKey} value={roleKey}>
                  {roleData.label} - {roleData.description}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            {action === 'assign' ? 'Assign Roles' : 'Remove Roles'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Users; 