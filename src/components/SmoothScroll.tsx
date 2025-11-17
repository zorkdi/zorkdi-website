// components/SmoothScroll.tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// TypeScript ke liye, hum children prop ko explicitly define kar rahe hain
interface SmoothScrollProps {
  children: React.ReactNode;
}

function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Ye 'html' element par smooth scroll apply karega
    const lenis = new Lenis({
      // wrapper: window, // Default window hai
      // content: document.body, // Default body hai
      duration: 1.2, // Scroll animation kitni der chalegi
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing function
      // Saare invalid options hata diye gaye hain
      touchMultiplier: 2,
      infinite: false,
    });

    // Har animation frame par 'lenis' ko update karo
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Jab component hatega (page change hoga), tab 'lenis' instance ko destroy karo
    return () => {
      lenis.destroy();
    };
  }, []); // Yeh effect sirf ek baar page load par chalega

  // Yeh component khud kuch render nahi karega,
  // yeh bas 'children' (yaani aapki poori site) ko pass through karega.
  return <>{children}</>;
}

export default SmoothScroll;