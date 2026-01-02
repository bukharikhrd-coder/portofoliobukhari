import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon, Check, RotateCcw, Crop } from "lucide-react";
import ImageCropper from "./ImageCropper";

interface ImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  aspectRatio?: number;
  compact?: boolean;
}

const ImageUpload = ({
  currentImage,
  onImageChange,
  bucket = "project-images",
  folder = "profile",
  label = "Profile Image",
  aspectRatio = 1,
  compact = false,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB for original, will be compressed after crop)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Create preview URL and show cropper
    const objectUrl = URL.createObjectURL(file);
    setOriginalImageUrl(objectUrl);
    setShowCropper(true);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Clean up original image URL
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    
    // Create new file from cropped blob
    const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(objectUrl);
    setPendingFile(croppedFile);
    setShowCropper(false);
    setOriginalImageUrl(null);
  };

  const handleCropCancel = () => {
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setOriginalImageUrl(null);
    setShowCropper(false);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    setUploading(true);

    try {
      const fileExt = "jpg";
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, pendingFile, { 
          upsert: true,
          contentType: "image/jpeg"
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload image");
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onImageChange(publicUrl);
      toast.success("Image uploaded successfully!");
      
      // Clear preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
      console.error("Upload error details:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const handleRemove = () => {
    onImageChange("");
  };

  // Compact mode for inline editing
  if (compact) {
    return (
      <>
        {showCropper && originalImageUrl && (
          <ImageCropper
            imageSrc={originalImageUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={aspectRatio}
          />
        )}
        
        <div className="relative w-full h-full bg-secondary border border-border overflow-hidden group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : currentImage ? (
            <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon size={20} />
            </div>
          )}
          
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            {previewUrl ? (
              <>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="p-1.5 bg-primary text-primary-foreground rounded text-xs"
                >
                  {uploading ? <Loader2 className="animate-spin" size={12} /> : <Check size={12} />}
                </button>
                <button
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="p-1.5 bg-secondary text-foreground border border-border rounded text-xs"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-1.5 bg-secondary text-foreground border border-border rounded text-xs"
              >
                <Upload size={12} />
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showCropper && originalImageUrl && (
        <ImageCropper
          imageSrc={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      )}
      
      <div className="space-y-4">
        <label className="text-sm text-muted-foreground">{label}</label>
        
        <div className="flex items-start gap-6 flex-wrap">
          {/* Current Image */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground block">Current</span>
            <div className="relative w-32 h-32 bg-secondary border border-border overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Current"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={32} />
                </div>
              )}
              
              {currentImage && !previewUrl && (
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Preview (when selecting new image) */}
          {previewUrl && (
            <>
              <div className="flex items-center text-muted-foreground self-center">
                <span className="text-2xl">→</span>
              </div>
              <div className="space-y-2">
                <span className="text-xs text-primary block">New Preview</span>
                <div className="relative w-32 h-32 bg-secondary border-2 border-primary overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-primary/10" />
                </div>
              </div>
            </>
          )}

          {/* Upload Controls */}
          <div className="flex flex-col gap-2 self-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            
            {!previewUrl ? (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-secondary text-foreground border border-border hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Crop size={16} />
                  Select & Crop
                </button>
                <span className="text-xs text-muted-foreground">
                  Max 10MB, JPG/PNG/GIF
                </span>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  {uploading ? "Uploading..." : "Confirm"}
                </button>
                <button
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="px-4 py-2 bg-secondary text-foreground border border-border hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUpload;