// src/components/ClientOnly/ClientOnly.tsx

"use client";

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

const ClientOnly = ({ children }: ClientOnlyProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Component client-side mount hone par yeh chalta hai
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Server-side ya hydration se pehle kuch nahi dikhana
    return null;
  }

  // Client-side mount hone ke baad children render karna
  return <>{children}</>;
};

export default ClientOnly;