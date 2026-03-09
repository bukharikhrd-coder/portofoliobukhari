import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "./TranslatedText";

interface JourneyItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  year: string | null;
  category: string | null;
  order_index: number | null;
}

const HorizontalScroll = ({
  items,
  onItemClick,
}: {
  items: JourneyItem[];
  onItemClick: (item: JourneyItem, index: number) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-lg opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
            viewport={{ once: true, margin: "-20px" }}
            className="group relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] aspect-square overflow-hidden cursor-pointer bg-secondary/50 rounded-lg snap-start"
            onClick={() => onItemClick(item, index)}
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-foreground font-medium text-xs md:text-sm truncate">{item.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-lg opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

const WorkJourneyGallery = () => {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<JourneyItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeYear, setActiveYear] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("work_journey_gallery").select("*").eq("is_visible", true).order("order_index");
      if (data && !error) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const { items: translatedItems } = useTranslatedContent(items.length > 0 ? items : undefined, ["title", "description"]);
  const displayItems = translatedItems.length > 0 ? translatedItems : items;

  const years = [...new Set(items.map((i) => i.year || "Other"))].sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return b.localeCompare(a);
  });

  const groupedItems: Record<string, JourneyItem[]> = {};
  displayItems.forEach((item) => {
    const key = item.year || "Other";
    if (!groupedItems[key]) groupedItems[key] = [];
    groupedItems[key].push(item);
  });

  const filteredYears = activeYear === "all" ? years : years.filter((y) => y === activeYear);

  const openLightbox = (item: JourneyItem, _index: number) => {
    const globalIndex = items.findIndex((i) => i.id === item.id);
    setSelectedImage(items[globalIndex >= 0 ? globalIndex : 0]);
    setCurrentIndex(globalIndex >= 0 ? globalIndex : 0);
  };
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => { const i = (currentIndex + 1) % items.length; setCurrentIndex(i); setSelectedImage(items[i]); };
  const prevImage = () => { const i = (currentIndex - 1 + items.length) % items.length; setCurrentIndex(i); setSelectedImage(items[i]); };
  const getTranslatedSelected = () => { if (!selectedImage) return null; return displayItems.find((i) => i.id === selectedImage.id) || selectedImage; };

  if (loading) {
    return (
      <section id="journey" className="py-20 relative overflow-hidden bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-center min-h-[200px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  const translatedSelected = getTranslatedSelected();

  return (
    <section id="journey" className="py-12 md:py-20 relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            <TranslatedText>My Collection</TranslatedText>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 md:mt-4">
            <TranslatedText>WORK JOURNEY</TranslatedText>
            <br />
            <span className="text-gradient"><TranslatedText>GALLERY</TranslatedText></span>
          </h2>
        </motion.div>

        {/* Year filter tabs */}
        {years.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10"
          >
            <button
              onClick={() => setActiveYear("all")}
              className={`px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm tracking-wide rounded-full transition-all duration-300 ${
                activeYear === "all"
                  ? "btn-gradient shadow-lg"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <TranslatedText>All</TranslatedText>
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm tracking-wide rounded-full transition-all duration-300 ${
                  activeYear === year
                    ? "btn-gradient shadow-lg"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {year}
              </button>
            ))}
          </motion.div>
        )}

        {/* Grouped horizontal scrolls */}
        <div className="space-y-8 md:space-y-10">
          {filteredYears.map((year, yearIdx) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: yearIdx * 0.1 }}
              viewport={{ once: true, margin: "-40px" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-primary font-medium text-sm">{year}</span>
                </div>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-muted-foreground text-xs">{groupedItems[year]?.length || 0} items</span>
              </div>
              <HorizontalScroll items={groupedItems[year] || []} onItemClick={openLightbox} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && translatedSelected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 md:left-6 p-2 md:p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors rounded-lg"><ChevronLeft size={20} /></button>
          <div className="w-full max-w-4xl max-h-[80vh] mx-auto px-10 md:px-16" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.image_url} alt={translatedSelected.title} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg" />
            <div className="text-center mt-4 md:mt-6">
              <h3 className="font-display text-lg md:text-2xl text-foreground">{translatedSelected.title}</h3>
              {translatedSelected.description && <p className="text-muted-foreground mt-2 text-sm md:text-base">{translatedSelected.description}</p>}
              {selectedImage.year && <p className="text-primary text-sm mt-2 flex items-center justify-center gap-2"><Calendar size={14} />{selectedImage.year}</p>}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 md:right-6 p-2 md:p-3 bg-secondary/80 text-foreground hover:bg-primary transition-colors rounded-lg"><ChevronRight size={20} /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground text-sm">{currentIndex + 1} / {items.length}</div>
        </motion.div>
      )}
    </section>
  );
};

export default WorkJourneyGallery;
