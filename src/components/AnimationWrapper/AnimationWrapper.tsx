// components/AnimationWrapper/AnimationWrapper.tsx

"use client";

import React, { useEffect, useRef } from 'react'; // FIX: React ko explicitly import kiya
import { motion, useInView, useAnimation } from 'framer-motion';

interface Props {
  // FIX: Type ko theek kiya, taaki TypeScript compiler use recognize kar sake
  children: React.ReactNode; 
  delay?: number; // Optional delay for staggered animations
}

export const AnimationWrapper = ({ children, delay = 0 }: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // 'once: true' means animation runs only once
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};