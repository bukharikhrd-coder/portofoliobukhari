import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, X, Loader2 } from "lucide-react";
import { TranslatedText, useTranslatedContent } from "./TranslatedText";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  platform: string | null;
  order_index: number | null;
}

const VideoPortfolio = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["video_portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_portfolio")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as VideoItem[];
    },
  });

  // Translate descriptions - only when videos are loaded
  const { items: translatedVideos } = useTranslatedContent(
    videos && videos.length > 0 ? videos : undefined, 
    ["description"]
  );

  // Use translated videos if available, otherwise use original
  const displayVideos = translatedVideos.length > 0 ? translatedVideos : (videos || []);

  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === "youtube") {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (platform === "vimeo") {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url;
    }
    return url;
  };

  const getThumbnailUrl = (video: VideoItem) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    
    if (video.platform === "youtube") {
      const videoId = video.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  if (isLoading) {
    return (
      <section id="video-portfolio" className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  if (!videos?.length) return null;

  return (
    <section id="video-portfolio" className="py-12 md:py-20 px-4 md:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-8 md:mb-12"
        >
          <span className="text-primary text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            <TranslatedText>Showreel</TranslatedText>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 md:mt-4">
            <TranslatedText>VIDEO</TranslatedText> <span className="text-gradient"><TranslatedText>PORTFOLIO</TranslatedText></span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {displayVideos.map((video, index) => {
            const thumbnailUrl = getThumbnailUrl(video);
            
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div 
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3 md:mb-4 cursor-pointer"
                  onClick={() => setActiveVideo(video.id)}
                >
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Play size={36} className="text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center">
                      <Play size={22} className="text-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-muted-foreground text-sm">
                    {video.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
          
          <div 
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {videos?.find(v => v.id === activeVideo) && (
              <iframe
                src={getEmbedUrl(
                  videos.find(v => v.id === activeVideo)!.video_url,
                  videos.find(v => v.id === activeVideo)!.platform || "youtube"
                )}
                title={videos.find(v => v.id === activeVideo)!.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default VideoPortfolio;
