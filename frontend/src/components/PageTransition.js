import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: (direction) => ({
    x: direction === "forward" ? 45 : direction === "back" ? -45 : 0,
    opacity: 0,
    scale: 0.995,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // Ultra-premium cubic-bezier ease-out curve
    },
  },
  exit: (direction) => ({
    x: direction === "forward" ? -45 : direction === "back" ? 45 : 0,
    opacity: 0,
    scale: 0.995,
    transition: {
      duration: 0.3,
      ease: [0.7, 0, 0.84, 0], // Smooth ease-in exit curve
    },
  }),
};

function PageTransition({ children, fallback = "fade" }) {
  return (
    <motion.div
      custom={fallback}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
