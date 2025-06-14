import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Download, Eye, Package } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageUpload from '../components/forms/ImageUpload';
import { Product, ProductFormData, ProductImage } from '../types/product';
import { Category, Brand } from '../types/category';
import { formatCurrency, formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../utils/constants';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useToastContext } from '../contexts/ToastContext';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    stock: '',
  });
  
  // Add pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // Increase default limit to show more products
    total: 0,
    totalPages: 0,
  });

  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    fetchData();
  }, [searchQuery]); // Refetch when search changes since API supports server-side search

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use API with proper limit to get all products
      console.log('Fetching all products with API limit parameter');
      
      const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        productService.getProducts({ 
          search: searchQuery, 
          limit: 100,  // Get all products for now, can be changed to pagination.limit for true pagination
          page: 1      // Always get first page since we're getting all with high limit
        }),
        categoryService.getCategories(),
        productService.getBrands()
      ]);
      
      console.log('Products fetched successfully:', {
        count: productsResponse.data?.length,
        total: productsResponse.pagination?.total
      });
      
      // Set all products
      const allProducts = productsResponse.data || [];
      setProducts(allProducts);
      
      // Set pagination based on API response
      setPagination(prev => ({
        ...prev,
        total: productsResponse.pagination?.total || allProducts.length,
        totalPages: Math.ceil((productsResponse.pagination?.total || allProducts.length) / prev.limit),
      }));
      
      setCategories(categoriesResponse.data);
      setBrands(brandsResponse.data);
      showSuccess('Products loaded successfully');
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      showError('Failed to load products', 'Please try refreshing the page');
      
      // Set empty arrays on error
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Add page change handler
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Update search handler to reset to first page
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Update filter handlers to reset to first page
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        showSuccess('Product deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete product:', error);
        showError('Failed to delete product', error?.message || 'Please try again');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await productService.bulkDeleteProducts(selectedProducts);
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        showSuccess(`${selectedProducts.length} products deleted successfully`);
      } catch (error: any) {
        console.error('Failed to bulk delete products:', error);
        showError('Failed to delete products', error?.message || 'Please try again');
      }
    }
  };

  const handleFormSubmit = async (formData: ProductFormData, selectedFiles?: FileList | null) => {
    try {
      setIsFormLoading(true);
      
      // Add validation and logging for debugging
      console.log('Submitting product data:', formData);
      console.log('Form data details:', {
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        description: formData.description,
        basePrice: formData.basePrice,
        stockQuantity: formData.stockQuantity,
        minOrderQuantity: formData.minOrderQuantity,
        isActive: formData.isActive,
        featured: formData.featured,
        unitOfMeasurement: formData.unitOfMeasurement
      });
      
      // Validate required fields
      if (!formData.name?.trim()) {
        showError('Product name is required');
        return;
      }
      if (!formData.sku?.trim()) {
        showError('SKU is required');
        return;
      }
      if (!formData.categoryId) {
        showError('Category is required');
        return;
      }
      if (!formData.brandId) {
        showError('Brand is required');
        return;
      }
      if (!formData.description?.trim()) {
        showError('Description is required');
        return;
      }
      if (formData.basePrice <= 0) {
        showError('Base price must be greater than 0');
        return;
      }
      if (formData.stockQuantity < 0) {
        showError('Stock quantity cannot be negative');
        return;
      }
      if (formData.minOrderQuantity <= 0) {
        showError('Minimum order quantity must be greater than 0');
        return;
      }
      
      // Transform data to match backend expectations
      const backendData = {
        name: formData.name,
        sku: formData.sku,
        price: formData.basePrice, // Backend expects 'price' not 'basePrice'
        stockQuantity: formData.stockQuantity,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        description: formData.description,
        shortDescription: formData.shortDescription,
        unitOfMeasurement: formData.unitOfMeasurement,
        minOrderQuantity: formData.minOrderQuantity,
        maxOrderQuantity: formData.maxOrderQuantity,
        weightKg: formData.weightKg,
        dimensionsCm: formData.dimensionsCm,
        specifications: formData.specifications,
        technicalData: formData.technicalData,
        isActive: formData.isActive,
        featured: formData.featured,
        slug: formData.slug
      };
      
      // Log each field with type and value for debugging
      console.log('🔍 Detailed field analysis:', {
        name: { value: backendData.name, type: typeof backendData.name, length: backendData.name?.length },
        sku: { value: backendData.sku, type: typeof backendData.sku, length: backendData.sku?.length },
        price: { value: backendData.price, type: typeof backendData.price, isNumber: !isNaN(backendData.price) },
        stockQuantity: { value: backendData.stockQuantity, type: typeof backendData.stockQuantity, isInteger: Number.isInteger(backendData.stockQuantity) },
        categoryId: { value: backendData.categoryId, type: typeof backendData.categoryId, isEmpty: !backendData.categoryId },
        brandId: { value: backendData.brandId, type: typeof backendData.brandId, isEmpty: !backendData.brandId },
        description: { value: backendData.description?.slice(0, 50) + '...', type: typeof backendData.description, length: backendData.description?.length },
        shortDescription: { value: backendData.shortDescription?.slice(0, 30) + '...', type: typeof backendData.shortDescription, length: backendData.shortDescription?.length },
        unitOfMeasurement: { value: backendData.unitOfMeasurement, type: typeof backendData.unitOfMeasurement },
        minOrderQuantity: { value: backendData.minOrderQuantity, type: typeof backendData.minOrderQuantity, isInteger: Number.isInteger(backendData.minOrderQuantity) },
        maxOrderQuantity: { value: backendData.maxOrderQuantity, type: typeof backendData.maxOrderQuantity, isInteger: backendData.maxOrderQuantity ? Number.isInteger(backendData.maxOrderQuantity) : 'undefined' },
        weightKg: { value: backendData.weightKg, type: typeof backendData.weightKg, isNumber: backendData.weightKg ? !isNaN(backendData.weightKg) : 'undefined' },
        dimensionsCm: { value: backendData.dimensionsCm, type: typeof backendData.dimensionsCm },
        isActive: { value: backendData.isActive, type: typeof backendData.isActive },
        featured: { value: backendData.featured, type: typeof backendData.featured },
        slug: { value: backendData.slug, type: typeof backendData.slug, length: backendData.slug?.length }
      });
      
      if (editingProduct) {
        console.log('=== PRODUCT UPDATE DEBUGGING ===');
        console.log('Updating product ID:', editingProduct.id);
        console.log('Backend data being sent:', backendData);
        
        try {
          const updateResponse = await productService.updateProduct(editingProduct.id, backendData);
          console.log('✅ Update response received:', {
            success: updateResponse.success,
            message: updateResponse.message,
            data: updateResponse.data,
            hasData: !!updateResponse.data
          });
          
          // Check if response indicates success
          if (updateResponse.success !== false) {
            console.log('✅ Backend indicates success');
            showSuccess('Product updated successfully');
          } else {
            console.log('❌ Backend indicates failure');
            throw new Error(updateResponse.message || 'Backend returned unsuccessful response');
          }
        } catch (updateError: any) {
          console.log('❌ Update error caught:', {
            errorType: typeof updateError,
            errorMessage: updateError?.message,
            errorName: updateError?.name,
            errorStack: updateError?.stack,
            errorResponse: updateError?.response,
            isAxiosError: updateError?.isAxiosError,
            responseStatus: updateError?.response?.status,
            responseData: updateError?.response?.data,
            responseHeaders: updateError?.response?.headers
          });
          throw updateError; // Re-throw to be caught by main catch block
        }
      } else {
        // Create product first
        console.log('Creating product with backend data:', backendData);
        const response = await productService.createProduct(backendData);
        console.log('Product creation response:', response);
        const newProduct = response.data;
        
        // Upload images if any were selected
        if (selectedFiles && selectedFiles.length > 0) {
          try {
            console.log('Uploading images for product:', newProduct.id);
            await productService.uploadImages(newProduct.id, selectedFiles);
            showSuccess(`Product created successfully with ${selectedFiles.length} image(s)`);
          } catch (imageError: any) {
            console.error('Failed to upload images:', imageError);
            showSuccess('Product created successfully');
            showError('Failed to upload images', 'You can add images by editing the product');
          }
        } else {
          showSuccess('Product created successfully');
        }
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Try to extract more detailed error information
      let errorMessage = error?.message || 'Please try again';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Array.isArray(error.response.data.errors) 
          ? error.response.data.errors.join(', ')
          : JSON.stringify(error.response.data.errors);
      }
      
      showError(
        editingProduct ? 'Failed to update product' : 'Failed to create product',
        errorMessage
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  // Client-side filtering and pagination since API doesn't support server-side yet
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter  
    const matchesCategory = !filters.category || product.categoryId === filters.category;
    
    // Status filter
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && product.isActive) ||
      (filters.status === 'inactive' && !product.isActive);
    
    // Stock filter
    const matchesStock = !filters.stock ||
      (filters.stock === 'low' && product.stockQuantity < product.minOrderQuantity) ||
      (filters.stock === 'normal' && product.stockQuantity >= product.minOrderQuantity);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Client-side pagination
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Update pagination totals when filters change
  useEffect(() => {
    const totalFiltered = filteredProducts.length;
    setPagination(prev => ({
      ...prev,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / prev.limit),
      page: prev.page > Math.ceil(totalFiltered / prev.limit) ? 1 : prev.page // Reset to page 1 if current page is beyond total
    }));
  }, [filteredProducts.length, pagination.limit]);

  const columns = [
    {
      key: 'image',
      label: 'Image',
      width: '80px',
      render: (value: any, product: Product) => {
        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
        
        const getImageUrl = (url: string) => {
          if (!url) return '';
          if (url.startsWith('http')) return url;
          // Remove any leading slashes to avoid double slashes
          const cleanUrl = url.replace(/^\/+/, '');
          return `${API_BASE_URL}/${cleanUrl}`;
        };
        
        return (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {primaryImage ? (
              <img 
                src={getImageUrl(primaryImage.imageUrl)} 
                alt={primaryImage.altText || product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, show the package icon
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                }}
              />
            ) : (
              <Package className="h-6 w-6 text-gray-400" />
            )}
            <Package className="h-6 w-6 text-gray-400 fallback-icon hidden" />
          </div>
        );
      }
    },
    {
      key: 'name',
      label: 'Product',
      render: (value: any, product: Product) => (
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any, product: Product) => product.category?.name || 'N/A'
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (value: any, product: Product) => product.brand?.name || 'N/A'
    },
    {
      key: 'basePrice',
      label: 'Price',
      render: (value: any, product: Product) => formatCurrency(product.basePrice)
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      render: (value: any, product: Product) => (
        <div>
          <span className={`font-medium ${product.stockQuantity < product.minOrderQuantity ? 'text-red-600' : 'text-gray-900'}`}>
            {product.stockQuantity}
          </span>
          <span className="text-sm text-gray-500 ml-1">{product.unitOfMeasurement}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: any, product: Product) => (
        <StatusBadge status={product.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, product: Product) => formatDate(product.createdAt)
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (value: any, product: Product) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
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
          <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBulkDelete}
            disabled={selectedProducts.length === 0}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2 inline" />
            Delete Selected ({selectedProducts.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4 mr-2 inline" />
            Import
          </button>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFiltersChange({...filters, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFiltersChange({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
            <select
              value={filters.stock}
              onChange={(e) => handleFiltersChange({...filters, stock: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleFiltersChange({ category: '', status: '', stock: '' })}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        data={paginatedProducts}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search products..."
        emptyMessage="No products found"
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        categories={categories}
        brands={brands}
        loading={isFormLoading}
      />
    </div>
  );
};

// Product Form Modal Component
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, selectedFiles?: FileList | null) => void;
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  loading: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  brands,
  loading
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    categoryId: '',
    brandId: '',
    basePrice: 0,
    unitOfMeasurement: 'pieces',
    stockQuantity: 0,
    minOrderQuantity: 1,
    isActive: true,
    featured: false,
    specifications: {},
    technicalData: {},
  });

  // Image upload states
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        categoryId: product.categoryId,
        brandId: product.brandId,
        basePrice: product.basePrice,
        unitOfMeasurement: product.unitOfMeasurement,
        weightKg: product.weightKg,
        dimensionsCm: product.dimensionsCm,
        stockQuantity: product.stockQuantity,
        minOrderQuantity: product.minOrderQuantity,
        maxOrderQuantity: product.maxOrderQuantity,
        isActive: product.isActive,
        featured: product.featured,
        specifications: product.specifications,
        technicalData: product.technicalData,
      });
      
      // Load existing images for edit mode
      loadProductImages(product.id);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        sku: '',
        categoryId: '',
        brandId: '',
        basePrice: 0,
        unitOfMeasurement: 'pieces',
        stockQuantity: 0,
        minOrderQuantity: 1,
        isActive: true,
        featured: false,
        specifications: {},
        technicalData: {},
      });
      setExistingImages([]);
    }
  }, [product]);

  const loadProductImages = async (productId: string) => {
    try {
      setLoadingImages(true);
      const response = await productService.getImages(productId);
      setExistingImages(response.data || []);
    } catch (error) {
      console.error('Failed to load product images:', error);
      showError('Failed to load product images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImagesSelected = (files: FileList) => {
    setSelectedFiles(files);
    
    // If we're editing an existing product, upload immediately
    if (product) {
      handleUploadImages(product.id, files);
    }
  };

  const handleUploadImages = async (productId: string, files: FileList) => {
    try {
      setUploadingImages(true);
      const response = await productService.uploadImages(productId, files);
      
      // Add new images to existing images - ensure we have an array
      let newImages: ProductImage[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          newImages = response.data;
        } else {
          // If response.data is a single object, wrap it in an array
          newImages = [response.data] as ProductImage[];
        }
      }
      
      setExistingImages(prev => [...prev, ...newImages]);
      setSelectedFiles(null);
      
      showSuccess(`${newImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      console.error('Error details:', error.response?.data);
      showError('Failed to upload images', error?.message || 'Please try again');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await productService.deleteImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      showSuccess('Image deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      showError('Failed to delete image', error?.message || 'Please try again');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await productService.setPrimaryImage(imageId);
      setExistingImages(prev => 
        prev.map(img => ({ ...img, isPrimary: img.id === imageId }))
      );
      showSuccess('Primary image updated successfully');
    } catch (error: any) {
      console.error('Failed to set primary image:', error);
      showError('Failed to set primary image', error?.message || 'Please try again');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit the form data first
      await onSubmit(formData, selectedFiles);
      
      // If creating a new product and there are files selected, we'll need the product ID from the response
      // This will be handled in the parent component's handleFormSubmit function
      if (!product && selectedFiles && selectedFiles.length > 0) {
        // The parent component will handle image upload after product creation
        // by calling handleUploadImages with the new product ID
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
            <select
              required
              value={formData.brandId}
              onChange={(e) => setFormData({...formData, brandId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.basePrice === 0 ? '' : formData.basePrice}
              onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Inventory */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory & Shipping</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measurement *</label>
            <select
              required
              value={formData.unitOfMeasurement}
              onChange={(e) => setFormData({...formData, unitOfMeasurement: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="pieces">Pieces</option>
              <option value="meters">Meters</option>
              <option value="kilograms">Kilograms</option>
              <option value="liters">Liters</option>
              <option value="bags">Bags</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stockQuantity === 0 ? '' : formData.stockQuantity}
              onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Quantity *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.minOrderQuantity}
              onChange={(e) => setFormData({...formData, minOrderQuantity: parseInt(e.target.value) || 1})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.weightKg || ''}
              onChange={(e) => setFormData({...formData, weightKg: parseFloat(e.target.value) || undefined})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Product Images */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            {loadingImages ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" text="Loading images..." />
              </div>
            ) : (
              <ImageUpload
                existingImages={existingImages}
                onImagesSelected={handleImagesSelected}
                onDeleteImage={product ? handleDeleteImage : undefined}
                onSetPrimaryImage={product ? handleSetPrimaryImage : undefined}
                maxFiles={5}
                uploading={uploadingImages}
                disabled={loading}
                selectedFiles={!product ? selectedFiles : null}
              />
            )}
            {!product && selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  📋 {selectedFiles.length} image(s) selected. Images will be uploaded after creating the product.
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
            </div>
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
            {loading ? <LoadingSpinner size="sm" /> : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Products; 