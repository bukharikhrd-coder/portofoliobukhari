import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon, Check, RotateCcw } from "lucide-react";

interface ImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
}

const ImageUpload = ({
  currentImage,
  onImageChange,
  bucket = "project-images",
  folder = "profile",
  label = "Profile Image"
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPendingFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    setUploading(true);

    try {
      const fileExt = pendingFile.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, pendingFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onImageChange(publicUrl);
      toast.success("Image uploaded successfully!");
      
      // Clear preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className="space-y-4">
      <label className="text-sm text-muted-foreground">{label}</label>
      
      <div className="flex items-start gap-6">
        {/* Current Image */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground block">Current</span>
          <div className="relative w-32 h-32 bg-secondary border border-border overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Current"
                className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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
                <Upload size={16} />
                Select Image
              </button>
              <span className="text-xs text-muted-foreground">
                Max 5MB, JPG/PNG/GIF
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
  );
};

export default ImageUpload;