import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, ExternalLink } from "lucide-react";

const VideoPortfolio = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["video_portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_portfolio")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === "youtube") {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (platform === "vimeo") {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos?.length) return null;

  return (
    <section id="video-portfolio" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase">
            Showreel
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            VIDEO <span className="text-gradient">PORTFOLIO</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {videos?.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <iframe
                  src={getEmbedUrl(video.video_url, video.platform || "youtube")}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-muted-foreground text-sm">
                  {video.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoPortfolio;
