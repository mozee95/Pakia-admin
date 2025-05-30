import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Download, Package2, FolderOpen, Folder, Image, Grid, List, ToggleLeft, ToggleRight } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Category, CategoryFormData } from '../types/category';
import { formatDate } from '../utils/formatters';
import { categoryService } from '../services/categoryService';
import { useToastContext } from '../contexts/ToastContext';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [filters, setFilters] = useState({
    status: '',
    parent: '',
  });

  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data);
      showSuccess('Categories loaded successfully');
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showError('Failed to load categories', 'Please try refreshing the page');
      // Fallback to empty array if API fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await categoryService.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
        showSuccess('Category deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        showError('Failed to delete category', error?.message || 'Please try again');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      try {
        await categoryService.bulkDeleteCategories(selectedCategories);
        setCategories(categories.filter(c => !selectedCategories.includes(c.id)));
        setSelectedCategories([]);
        showSuccess(`${selectedCategories.length} categories deleted successfully`);
      } catch (error: any) {
        console.error('Failed to bulk delete categories:', error);
        showError('Failed to delete categories', error?.message || 'Please try again');
      }
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedCategories.length === 0) return;
    
    try {
      await categoryService.bulkUpdateCategoryStatus(selectedCategories, isActive);
      setCategories(categories.map(c => 
        selectedCategories.includes(c.id) ? { ...c, isActive } : c
      ));
      setSelectedCategories([]);
      showSuccess(`Categories ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error('Failed to bulk update status:', error);
      showError('Failed to update category status', error?.message || 'Please try again');
    }
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    try {
      setIsFormLoading(true);
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showSuccess('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        showSuccess('Category created successfully');
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      showError(
        editingCategory ? 'Failed to update category' : 'Failed to create category',
        error?.message || 'Please try again'
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const buildCategoryTree = (categories: Category[], parentId?: string): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filters.status || 
                         (filters.status === 'active' && category.isActive) ||
                         (filters.status === 'inactive' && !category.isActive);
    const matchesParent = !filters.parent || category.parentId === filters.parent;
    
    return matchesSearch && matchesStatus && matchesParent;
  });

  const parentCategories = categories.filter(cat => !cat.parentId);

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      width: '80px',
      render: (value: any, category: Category) => (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {category.iconUrl ? (
            <img src={category.iconUrl} alt={category.name} className="w-8 h-8 object-cover rounded" />
          ) : (
            <Package2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Category',
      render: (value: any, category: Category) => (
        <div>
          <p className="font-medium text-gray-900">{category.name}</p>
          <p className="text-sm text-gray-500">/{category.slug}</p>
          {category.description && (
            <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">{category.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'parent',
      label: 'Parent Category',
      render: (value: any, category: Category) => {
        const parent = categories.find(c => c.id === category.parentId);
        return parent ? (
          <span className="text-sm text-gray-600">{parent.name}</span>
        ) : (
          <span className="text-sm text-gray-400">Root Category</span>
        );
      }
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (value: any, category: Category) => (
        <span className="text-sm font-mono text-gray-600">{category.displayOrder}</span>
      )
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (value: any, category: Category) => (
        <span className="text-sm text-gray-600">{category.productsCount || 0}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: any, category: Category) => (
        <StatusBadge status={category.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, category: Category) => formatDate(category.createdAt)
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (value: any, category: Category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditCategory(category)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categories Management</h2>
          <p className="text-gray-600">Organize your product catalog with categories</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'tree' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tree View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedCategories.length > 0 && (
            <>
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ToggleRight className="h-4 w-4 mr-2 inline" />
                Activate ({selectedCategories.length})
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <ToggleLeft className="h-4 w-4 mr-2 inline" />
                Deactivate ({selectedCategories.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Delete ({selectedCategories.length})
              </button>
            </>
          )}

          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4 mr-2 inline" />
            Import
          </button>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
            <select
              value={filters.parent}
              onChange={(e) => setFilters({...filters, parent: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="root">Root Categories Only</option>
              {parentCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', parent: '' })}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Categories Content */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredCategories}
          columns={columns}
          loading={loading}
          onSearch={setSearchQuery}
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found"
        />
      ) : (
        <CategoryTreeView 
          categories={buildCategoryTree(filteredCategories)} 
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        categories={categories}
        loading={isFormLoading}
      />
    </div>
  );
};

// Tree View Component
interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  level?: number;
}

const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ 
  categories, 
  onEdit, 
  onDelete, 
  level = 0 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="space-y-2">
          {categories.map((category) => (
            <CategoryTreeNode
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CategoryTreeNodeProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  level: number;
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  level 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div 
        className={`flex items-center p-3 rounded-lg hover:bg-gray-50 group transition-colors`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors mr-2"
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-gray-600" />
            ) : (
              <Folder className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
        
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
          {category.iconUrl ? (
            <img src={category.iconUrl} alt={category.name} className="w-6 h-6 object-cover rounded" />
          ) : (
            <Package2 className="h-4 w-4 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{category.name}</span>
            <StatusBadge status={category.isActive ? 'active' : 'inactive'} size="sm" />
            {category.productsCount && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {category.productsCount} products
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">/{category.slug}</p>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <CategoryTreeView
          categories={category.children!}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      )}
    </div>
  );
};

// Category Form Modal Component
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  category?: Category | null;
  categories: Category[];
  loading: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  categories,
  loading
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    iconUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        iconUrl: category.iconUrl || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
      setIconPreview(category.iconUrl || '');
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        iconUrl: '',
        displayOrder: 0,
        isActive: true,
      });
      setIconPreview('');
    }
    setIconFile(null);
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setIconPreview(url);
        setFormData({ ...formData, iconUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter out current category and its descendants from parent options
  const availableParents = categories.filter(cat => {
    if (!category) return true;
    if (cat.id === category.id) return false;
    // Add logic to prevent circular references
    return true;
  }).filter(cat => !cat.parentId); // Only show root categories for simplicity

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({...formData, parentId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Root Category</option>
              {availableParents.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Icon Upload */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Icon</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {iconPreview ? (
                  <img src={iconPreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose Icon
                </label>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active Category</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <LoadingSpinner size="sm" /> : (category ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Categories; 