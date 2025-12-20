import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

interface ParallaxOptions {
  offset?: [string, string];
  speed?: number;
}

export function useParallax(options: ParallaxOptions = {}) {
  const { offset = ["start end", "end start"], speed = 0.5 } = options;
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return { ref, y, opacity, scale, scrollYProgress };
}

export function useParallaxY(
  scrollYProgress: MotionValue<number>,
  distance: number = 100
) {
  return useTransform(scrollYProgress, [0, 1], [distance, -distance]);
}

export function useParallaxRotate(
  scrollYProgress: MotionValue<number>,
  degrees: number = 10
) {
  return useTransform(scrollYProgress, [0, 1], [-degrees, degrees]);
}
