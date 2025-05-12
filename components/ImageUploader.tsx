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
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "0 auto 2rem auto",
      backgroundColor: "#2e2e2e",
      borderRadius: "16px",
      padding: "1.5rem",
      textAlign: "center"
    }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        style={{ display: "none" }}
      />
      
      {!imagePreview ? (
        <div style={{
          padding: "2rem",
          border: "2px dashed #4285f4",
          borderRadius: "12px",
          cursor: "pointer"
        }} onClick={triggerFileInput}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 1rem auto" }}>
            <path d="M19 7V5H5v14h2v2H3V3h18v4h-2zm-4 12v-2h4v-4h2v6h-6zm-6-6H7V5h8v2h2V3H5v14h4v2H3V3h18v6h-2V5h-8v8z" fill="#4285f4"/>
          </svg>
          <p style={{ fontSize: "16px", color: "#ffffff", marginBottom: "0.5rem" }}>
            Click to upload an image
          </p>
          <p style={{ fontSize: "14px", color: "#a0a0a0" }}>
            Upload a clear photo of your ingredients
          </p>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <img 
            src={imagePreview} 
            alt="Selected" 
            style={{ 
              width: "100%", 
              borderRadius: "12px",
              marginBottom: "1rem" 
            }} 
          />
          <button
            onClick={() => {
              setSelectedImage(null);
              setImagePreview('');
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.6)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white"/>
            </svg>
          </button>
        </div>
      )}
      
      <button
        onClick={handleDetectIngredients}
        disabled={!selectedImage || isDetectingIngredients}
        style={{
          width: "100%",
          padding: "0.85rem",
          backgroundColor: !selectedImage ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: !selectedImage ? "not-allowed" : "pointer",
          marginTop: imagePreview ? "1rem" : "0",
          opacity: !selectedImage ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}
      >
        {isDetectingIngredients ? (
          <>
            <div className="loading-spinner" style={{ width: "20px", height: "20px" }}></div>
            <span>Detecting ingredients...</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white"/>
            </svg>
            <span>Detect Ingredients</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ImageUploader; 