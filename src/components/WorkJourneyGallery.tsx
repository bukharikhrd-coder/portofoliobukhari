import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [selectedImage, setSelectedImage] = useState<JourneyItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("work_journey_gallery")
        .select("*")
        .order("order_index");
      if (data) setItems(data);
    };
    fetchItems();
  }, []);

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

  if (items.length === 0) return null;

  return (
    <section id="journey" className="py-32 relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">My Collection</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">
            WORK JOURNEY
            <br />
            <span className="text-gradient">GALLERY</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden cursor-pointer bg-secondary/50"
              onClick={() => openLightbox(item, index)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-foreground font-medium text-sm truncate">{item.title}</h3>
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
      {selectedImage && (
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
            className="absolute left-6 p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
            <div className="text-center mt-6">
              <h3 className="font-display text-2xl text-foreground">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-muted-foreground mt-2">{selectedImage.description}</p>
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
            className="absolute right-6 p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors"
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
