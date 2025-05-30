import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Star } from 'lucide-react';
import { ProductImage } from '../../types/product';

interface ImageUploadProps {
  existingImages?: ProductImage[];
  onImagesSelected: (files: FileList) => void;
  onDeleteImage?: (imageId: string) => void;
  onSetPrimaryImage?: (imageId: string) => void;
  maxFiles?: number;
  uploading?: boolean;
  disabled?: boolean;
  selectedFiles?: FileList | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  existingImages = [],
  onImagesSelected,
  onDeleteImage,
  onSetPrimaryImage,
  maxFiles = 5,
  uploading = false,
  disabled = false,
  selectedFiles = null
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URLs when selectedFiles changes
  React.useEffect(() => {
    if (selectedFiles) {
      const urls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const url = URL.createObjectURL(file);
        urls.push(url);
      }
      setPreviewUrls(urls);
      
      // Cleanup function to revoke URLs
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setPreviewUrls([]);
    }
  }, [selectedFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    if (files.length + existingImages.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed. You currently have ${existingImages.length} images.`);
      return;
    }
    
    // Validate file types
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onImagesSelected(fileList.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImagesSelected(files);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Current Images ({existingImages.length}/{maxFiles})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((image) => (
              <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.imageUrl}
                  alt={image.altText || 'Product image'}
                  className="w-full h-24 object-cover"
                />
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </span>
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    {!image.isPrimary && onSetPrimaryImage && (
                      <button
                        onClick={() => onSetPrimaryImage(image.id)}
                        className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        title="Set as primary"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    {onDeleteImage && (
                      <button
                        onClick={() => onDeleteImage(image.id)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files Preview (for new products) */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Images ({selectedFiles.length}) - Will be uploaded after creating product
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
                <img
                  src={url}
                  alt={`Selected image ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                
                {/* Preview Badge */}
                <div className="absolute top-1 left-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {index === 0 ? 'Primary' : `#${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {(existingImages.length + (selectedFiles?.length || 0)) < maxFiles && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Add New Images ({maxFiles - existingImages.length - (selectedFiles?.length || 0)} remaining)
          </label>
          
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${uploading ? 'opacity-50 cursor-wait' : ''}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled && !uploading) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || uploading}
            />

            <div className="space-y-2">
              {uploading ? (
                <>
                  <div className="animate-spin mx-auto h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600">Uploading images...</p>
                </>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    {dragActive ? <Upload className="h-full w-full" /> : <Camera className="h-full w-full" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {dragActive ? 'Drop images here' : 'Add product images'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Up to {maxFiles - existingImages.length - (selectedFiles?.length || 0)} images, 5MB each. Formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 