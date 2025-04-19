import { useRef, useEffect } from "react";
import { useAnimation, useInView } from "framer-motion";

export const useFormAnimation = (isVisible = true) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (isVisible && inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView, isVisible]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  return {
    ref,
    animationProps: {
      initial: "hidden",
      animate: controls,
      variants: containerVariants,
    },
  };
};
