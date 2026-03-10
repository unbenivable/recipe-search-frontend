import React, { useRef, useState } from 'react';
import { ImageUploaderProps } from '@/types';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const HEIC_TYPES = ['image/heic', 'image/heif'];

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  setSelectedImage,
  imagePreview,
  setImagePreview,
  handleDetectIngredients,
  isDetectingIngredients,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file: File) => {
    // Check HEIC/HEIF first (common iPhone format)
    if (HEIC_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')) {
      onError('HEIC format is not supported. Please take a screenshot or convert to JPEG first.');
      return;
    }

    // Check supported types
    if (!SUPPORTED_TYPES.includes(file.type)) {
      onError(`Unsupported format (${file.type || 'unknown'}). Please use JPEG, PNG, or WebP.`);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      onError(`Image is too large (${sizeMB}MB). Please use an image under 4MB.`);
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  return (
    <div className="uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        style={{ display: 'none' }}
      />

      {!imagePreview ? (
        <div
          className={`uploader-dropzone${isDragging ? ' uploader-dropzone-active' : ''}`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="uploader-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="uploader-title">
            {isDragging ? 'Drop your image here' : 'Upload a photo'}
          </p>
          <p className="uploader-subtitle">
            Take a photo of your ingredients or drag & drop here
          </p>
          <p className="uploader-hint">JPEG, PNG, or WebP — max 4MB</p>
        </div>
      ) : (
        <div className="uploader-preview">
          <img src={imagePreview} alt="Selected food" />
          <button
            className="uploader-preview-remove"
            onClick={() => { setSelectedImage(null); setImagePreview(''); }}
            aria-label="Remove image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <button
        className="detect-btn"
        onClick={handleDetectIngredients}
        disabled={!selectedImage || isDetectingIngredients}
      >
        {isDetectingIngredients ? (
          <>
            <div className="loading-spinner" />
            <span>Detecting ingredients...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Detect Ingredients</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ImageUploader;
