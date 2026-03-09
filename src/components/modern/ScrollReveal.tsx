import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  blur?: boolean;
  once?: boolean;
}

const getVariants = (direction: Direction, blur: boolean): Variants => {
  const hidden: Record<string, string | number> = { opacity: 0 };
  const visible: Record<string, string | number> = { opacity: 1 };

  switch (direction) {
    case "up":
      hidden.y = 30;
      visible.y = 0;
      break;
    case "down":
      hidden.y = -30;
      visible.y = 0;
      break;
    case "left":
      hidden.x = 40;
      visible.x = 0;
      break;
    case "right":
      hidden.x = -40;
      visible.x = 0;
      break;
    case "none":
      break;
  }

  if (blur) {
    hidden.filter = "blur(8px)";
    visible.filter = "blur(0px)";
  }

  return { hidden, visible };
};

const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  blur = false,
  once = true,
}: ScrollRevealProps) => {
  const variants = getVariants(direction, blur);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
