import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Key, CreditCard, Globe } from "lucide-react";

const AdminSettings = () => {
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["stripe_secret_key", "stripe_publishable_key", "portfolio_url"]);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.key === "stripe_secret_key") {
          setStripeSecretKey(setting.value || "");
        } else if (setting.key === "stripe_publishable_key") {
          setStripePublishableKey(setting.value || "");
        } else if (setting.key === "portfolio_url") {
          setPortfolioUrl(setting.value || "");
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    // Check if setting exists
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("site_settings")
        .insert({ key, value });
      
      if (error) throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting("stripe_secret_key", stripeSecretKey);
      await saveSetting("stripe_publishable_key", stripePublishableKey);
      toast.success("Pengaturan Stripe berhasil disimpan!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePortfolioUrl = async () => {
    setSavingUrl(true);
    try {
      await saveSetting("portfolio_url", portfolioUrl);
      toast.success("Link portfolio berhasil disimpan!");
    } catch (error) {
      console.error("Error saving portfolio URL:", error);
      toast.error("Gagal menyimpan link portfolio");
    } finally {
      setSavingUrl(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan integrasi dan konfigurasi lainnya
        </p>
      </div>

      {/* Portfolio URL Settings */}
      <div className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
            <Globe size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-display">Portfolio Website Link</h2>
            <p className="text-sm text-muted-foreground">
              Link website yang akan ditampilkan di CV yang di-generate
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio_url" className="flex items-center gap-2">
              <Globe size={14} />
              Website URL
            </Label>
            <Input
              id="portfolio_url"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://portofoliobukhari.lovable.app"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              URL ini akan muncul sebagai link yang bisa diklik pada CV yang di-generate
            </p>
          </div>

          <Button onClick={handleSavePortfolioUrl} disabled={savingUrl} className="w-full sm:w-auto">
            <Save size={16} className="mr-2" />
            {savingUrl ? "Menyimpan..." : "Simpan Link Portfolio"}
          </Button>
        </div>
      </div>

      {/* Stripe Settings */}
      <div className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
            <CreditCard className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display">Stripe Integration</h2>
            <p className="text-sm text-muted-foreground">
              Konfigurasi API keys untuk menerima pembayaran
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Publishable Key */}
          <div className="space-y-2">
            <Label htmlFor="publishable_key" className="flex items-center gap-2">
              <Key size={14} />
              Publishable Key
            </Label>
            <Input
              id="publishable_key"
              type="text"
              value={stripePublishableKey}
              onChange={(e) => setStripePublishableKey(e.target.value)}
              placeholder="pk_test_... atau pk_live_..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Publishable key digunakan di frontend untuk Stripe Checkout
            </p>
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="secret_key" className="flex items-center gap-2">
              <Key size={14} />
              Secret Key
            </Label>
            <div className="relative">
              <Input
                id="secret_key"
                type={showSecretKey ? "text" : "password"}
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                placeholder="sk_test_... atau sk_live_..."
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Secret key digunakan di backend untuk membuat checkout session. 
              <span className="text-destructive"> Jangan pernah share key ini!</span>
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 border border-border p-4 space-y-2">
            <h4 className="font-medium text-sm">Cara mendapatkan API Keys:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Login ke <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Dashboard</a></li>
              <li>Pergi ke Developers → API Keys</li>
              <li>Copy Publishable key dan Secret key</li>
              <li>Gunakan test keys (pk_test_, sk_test_) untuk testing</li>
              <li>Gunakan live keys (pk_live_, sk_live_) untuk production</li>
            </ol>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            <Save size={16} className="mr-2" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
