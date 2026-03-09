import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

interface LogoUploadProps {
  currentLogo: string | null;
  onLogoChange: (url: string | null) => void;
  size?: number;
}

const LogoUpload = ({ currentLogo, onLogoChange, size = 56 }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logos/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("project-images").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(fileName);
      onLogoChange(publicUrl);
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
      <div className="w-full h-full rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-secondary hover:border-primary transition-all cursor-pointer"
        onClick={() => !uploading && fileInputRef.current?.click()}>
        {uploading ? (
          <Loader2 className="animate-spin text-primary" size={size * 0.35} />
        ) : currentLogo ? (
          <img src={currentLogo} alt="Logo" className="w-full h-full object-contain p-1" />
        ) : (
          <ImageIcon size={size * 0.35} className="text-muted-foreground" />
        )}
      </div>
      {currentLogo && !uploading && (
        <button onClick={(e) => { e.stopPropagation(); onLogoChange(null); }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={10} />
        </button>
      )}
    </div>
  );
};

export default LogoUpload;
