// src/hooks/useScrollAnimation.ts
import { useEffect, useState } from 'react';

export const useScrollAnimation = (threshold = 0) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isVisible;
};