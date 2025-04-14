import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { upload } from '../utils/api';

const ImageUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Check file size
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      onUploadError('File size must be less than 20MB');
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await upload.uploadImage(formData);
      onUploadSuccess(response.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    maxSize: 20 * 1024 * 1024 // 20MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setUploading(false);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image, or click to select'}
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {uploading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 