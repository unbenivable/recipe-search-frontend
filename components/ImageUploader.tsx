import React, { useRef } from 'react';
import { ImageUploaderProps } from '@/types';

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  setSelectedImage,
  imagePreview,
  setImagePreview,
  handleDetectIngredients,
  isDetectingIngredients
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {!imagePreview ? (
        <div className="uploader-dropzone" onClick={triggerFileInput}>
          <div className="uploader-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="uploader-title">Upload a photo</p>
          <p className="uploader-subtitle">Take a clear photo of your ingredients</p>
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
