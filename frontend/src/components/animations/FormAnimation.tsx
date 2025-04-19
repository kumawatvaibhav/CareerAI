import { Variants } from "framer-motion";

export const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 12,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

export const inputVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 10,
      delay: 0.6,
    },
  },
};

// Hook simply returns variants and animation props to use in your form
export const useFormAnimation = (isVisible: boolean = true) => {
  return {
    container: {
      initial: "hidden",
      animate: isVisible ? "visible" : "hidden",
      variants: containerVariants,
    },
    input: {
      variants: inputVariants,
    },
    button: {
      variants: buttonVariants,
    },
  };
};
