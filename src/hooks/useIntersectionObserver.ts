// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export const useIntersectionObserver = (options: Options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
      }
    );

    const current = targetRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return { targetRef, isIntersecting };
};