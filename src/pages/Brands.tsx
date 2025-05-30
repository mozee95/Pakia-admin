import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Download, Building2, Image, ToggleLeft, ToggleRight } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Brand, BrandFormData } from '../types/category';
import { formatDate } from '../utils/formatters';
import { brandService } from '../services/brandService';
import { useToastContext } from '../contexts/ToastContext';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    country: '',
  });

  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getBrands();
      setBrands(response.data);
      showSuccess('Brands loaded successfully');
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      showError('Failed to load brands', 'Please try refreshing the page');
      // Fallback to empty array if API fails
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      try {
        await brandService.deleteBrand(brandId);
        setBrands(brands.filter(b => b.id !== brandId));
        showSuccess('Brand deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete brand:', error);
        showError('Failed to delete brand', error?.message || 'Please try again');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedBrands.length} brands?`)) {
      try {
        await brandService.bulkDelete(selectedBrands);
        setBrands(brands.filter(b => !selectedBrands.includes(b.id)));
        setSelectedBrands([]);
        showSuccess(`${selectedBrands.length} brands deleted successfully`);
      } catch (error: any) {
        console.error('Failed to bulk delete brands:', error);
        showError('Failed to delete brands', error?.message || 'Please try again');
      }
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedBrands.length === 0) return;
    
    try {
      await brandService.bulkUpdateStatus(selectedBrands, isActive);
      setBrands(brands.map(b => 
        selectedBrands.includes(b.id) ? { ...b, isActive } : b
      ));
      setSelectedBrands([]);
      showSuccess(`Brands ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error('Failed to bulk update status:', error);
      showError('Failed to update brand status', error?.message || 'Please try again');
    }
  };

  const handleFormSubmit = async (formData: BrandFormData) => {
    try {
      setIsFormLoading(true);
      
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, formData);
        showSuccess('Brand updated successfully');
      } else {
        await brandService.createBrand(formData);
        showSuccess('Brand created successfully');
      }
      
      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      showError(
        editingBrand ? 'Failed to update brand' : 'Failed to create brand',
        error?.message || 'Please try again'
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (brand.countryOfOrigin && brand.countryOfOrigin.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !filters.status || 
                         (filters.status === 'active' && brand.isActive) ||
                         (filters.status === 'inactive' && !brand.isActive);
    const matchesCountry = !filters.country || brand.countryOfOrigin === filters.country;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(brands.map(b => b.countryOfOrigin).filter(Boolean)));

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      width: '80px',
      render: (value: any, brand: Brand) => (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 object-cover rounded" />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Brand Name',
      render: (value: any, brand: Brand) => (
        <div>
          <p className="font-medium text-gray-900">{brand.name}</p>
          {brand.description && (
            <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">{brand.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'countryOfOrigin',
      label: 'Country',
      render: (value: any, brand: Brand) => (
        <span className="text-sm text-gray-600">{brand.countryOfOrigin || 'Not specified'}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: any, brand: Brand) => (
        <StatusBadge status={brand.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, brand: Brand) => formatDate(brand.createdAt)
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (value: any, brand: Brand) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditBrand(brand)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteBrand(brand.id)}
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
          <h2 className="text-xl font-semibold text-gray-900">Brands Management</h2>
          <p className="text-gray-600">Manage product brands and manufacturers</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {selectedBrands.length > 0 && (
            <>
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ToggleRight className="h-4 w-4 mr-2 inline" />
                Activate ({selectedBrands.length})
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <ToggleLeft className="h-4 w-4 mr-2 inline" />
                Deactivate ({selectedBrands.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Delete ({selectedBrands.length})
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
            onClick={handleAddBrand}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Brand
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', country: '' })}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Brands Table */}
      <DataTable
        data={filteredBrands}
        columns={columns}
        loading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search brands..."
        emptyMessage="No brands found"
      />

      {/* Brand Form Modal */}
      <BrandFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        brand={editingBrand}
        loading={isFormLoading}
      />
    </div>
  );
};

// Brand Form Modal Component
interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormData) => void;
  brand?: Brand | null;
  loading: boolean;
}

const BrandFormModal: React.FC<BrandFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  brand,
  loading
}) => {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    logoUrl: '',
    countryOfOrigin: '',
    isActive: true,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
        logoUrl: brand.logoUrl || '',
        countryOfOrigin: brand.countryOfOrigin || '',
        isActive: brand.isActive,
      });
      setLogoPreview(brand.logoUrl || '');
    } else {
      setFormData({
        name: '',
        description: '',
        logoUrl: '',
        countryOfOrigin: '',
        isActive: true,
      });
      setLogoPreview('');
    }
    setLogoFile(null);
  }, [brand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setLogoPreview(url);
        setFormData({ ...formData, logoUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  // Common countries for construction brands
  const commonCountries = [
    'United States', 'Germany', 'Japan', 'Italy', 'United Kingdom', 
    'France', 'China', 'South Korea', 'Canada', 'Australia',
    'Tanzania', 'Kenya', 'Uganda', 'South Africa', 'Nigeria'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? 'Edit Brand' : 'Add New Brand'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
            <select
              value={formData.countryOfOrigin}
              onChange={(e) => setFormData({...formData, countryOfOrigin: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Country</option>
              {commonCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the brand..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Logo Upload */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Logo</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose Logo
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
              <span className="ml-2 text-sm text-gray-700">Active Brand</span>
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
            {loading ? <LoadingSpinner size="sm" /> : (brand ? 'Update Brand' : 'Create Brand')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Brands; 