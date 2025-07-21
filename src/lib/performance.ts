/**
 * Performance monitoring and optimization utilities
 * Following industry standards for web performance
 */

import React from 'react';

// Web Vitals monitoring
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Performance thresholds based on Google's recommendations
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
} as const;

// Performance observer for monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: PerformanceObserver[] = [];
  private metrics: Map<string, number> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.set('LCP', lastEntry.startTime);
          this.reportMetric('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime;
            this.metrics.set('FID', fid);
            this.reportMetric('FID', fid);
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.set('CLS', clsValue);
        this.reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation timing
      this.observeNavigationTiming();
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }

  private observeNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            // Time to First Byte
            const ttfb = navigation.responseStart - navigation.requestStart;
            this.metrics.set('TTFB', ttfb);
            this.reportMetric('TTFB', ttfb);

            // First Contentful Paint
            const fcpEntries = performance.getEntriesByType('paint');
            const fcp = fcpEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
              this.metrics.set('FCP', fcp.startTime);
              this.reportMetric('FCP', fcp.startTime);
            }

            // DOM Load time
            const domLoad = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            this.metrics.set('DOM_LOAD', domLoad);
          }
        }, 0);
      });
    }
  }

  private reportMetric(name: string, value: number) {
    const thresholds = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
    if (thresholds) {
      const rating = value <= thresholds.good ? 'good' : 
                    value <= thresholds.needsImprovement ? 'needs-improvement' : 'poor';
      
      // Report to analytics (replace with your analytics service)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        // gtag('event', name, {
        //   event_category: 'Web Vitals',
        //   event_label: rating,
        //   value: Math.round(value),
        //   non_interaction: true,
        // });
      }

      console.log(`${name}: ${Math.round(value)}ms (${rating})`);
    }
  }

  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sizes
  generateSrcSet: (src: string, sizes: number[]) => {
    return sizes.map(size => `${src}?w=${size}&q=75 ${size}w`).join(', ');
  },

  // Get optimized image props for Next.js Image
  getOptimizedImageProps: (src: string, alt: string) => ({
    src,
    alt,
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 75,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  }),

  // Preload critical images
  preloadImage: (src: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  },
};

// Code splitting utilities
export function loadComponentLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    React.createElement(React.Suspense, 
      { fallback: fallback ? React.createElement(fallback) : React.createElement('div', {}, 'Loading...') },
      React.createElement(LazyComponent, { ...props, ref })
    )
  ));
}

// Resource hints utilities
export const resourceHints = {
  // Preconnect to external domains
  preconnect: (href: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  },

  // DNS prefetch for external domains
  dnsPrefetch: (href: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Prefetch critical resources
  prefetch: (href: string) => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },
};

// Memory optimization utilities
export const memoryOptimization = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), delay);
      }
    };
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};

// Bundle size optimization
export const bundleOptimization = {
  // Dynamic import wrapper with error handling
  dynamicImport: async <T>(importFn: () => Promise<T>): Promise<T | null> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  },

  // Check if feature is supported before importing polyfills
  conditionalPolyfill: async (
    condition: boolean,
    polyfillImport: () => Promise<any>
  ) => {
    if (condition) {
      return polyfillImport();
    }
    return null;
  },
};

// React-specific performance utilities
export const usePerformance = () => {
  const monitor = React.useMemo(() => PerformanceMonitor.getInstance(), []);
  
  React.useEffect(() => {
    return () => {
      // Clean up if component unmounts
      if (process.env.NODE_ENV === 'development') {
        monitor.disconnect();
      }
    };
  }, [monitor]);

  return {
    getMetrics: () => monitor.getMetrics(),
    reportCustomMetric: (name: string, value: number) => {
      console.log(`Custom metric - ${name}: ${value}`);
    },
  };
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance();
}

export default PerformanceMonitor;
