import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "./TranslatedText";

interface JourneyItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  year: string | null;
  order_index: number | null;
}

const WorkJourneyGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<JourneyItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("work_journey_gallery")
        .select("*")
        .order("order_index");
      if (data && !error) {
        setItems(data);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  // Translate titles and descriptions - only when items are loaded
  const { items: translatedItems, isTranslating } = useTranslatedContent(
    items.length > 0 ? items : undefined, 
    ["title", "description"]
  );

  // Use translated items if available, otherwise use original items
  const displayItems = translatedItems.length > 0 ? translatedItems : items;

  const openLightbox = (item: JourneyItem, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(newIndex);
    setSelectedImage(items[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(newIndex);
    setSelectedImage(items[newIndex]);
  };

  // Get translated version of selected image
  const getTranslatedSelected = () => {
    if (!selectedImage) return null;
    const translated = displayItems.find(i => i.id === selectedImage.id);
    return translated || selectedImage;
  };

  // Show loading state
  if (loading) {
    return (
      <section id="journey" className="py-24 relative overflow-hidden bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  // Don't render if no items
  if (items.length === 0) return null;

  const translatedSelected = getTranslatedSelected();

  return (
    <section id="journey" className="py-24 relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            <TranslatedText>My Collection</TranslatedText>
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">
            <TranslatedText>WORK JOURNEY</TranslatedText>
            <br />
            <span className="text-gradient"><TranslatedText>GALLERY</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.8) }}
              className="group relative aspect-square overflow-hidden cursor-pointer bg-secondary/50 rounded-lg"
              onClick={() => openLightbox(items[index], index)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-foreground font-medium text-sm truncate">
                  {item.title}
                </h3>
                {item.year && (
                  <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {item.year}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && translatedSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-6 p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={translatedSelected.title}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
            />
            <div className="text-center mt-6">
              <h3 className="font-display text-2xl text-foreground">
                {translatedSelected.title}
              </h3>
              {translatedSelected.description && (
                <p className="text-muted-foreground mt-2">
                  {translatedSelected.description}
                </p>
              )}
              {selectedImage.year && (
                <p className="text-primary text-sm mt-2 flex items-center justify-center gap-2">
                  <Calendar size={14} />
                  {selectedImage.year}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-6 p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors rounded-lg"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground text-sm">
            {currentIndex + 1} / {items.length}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default WorkJourneyGallery;
