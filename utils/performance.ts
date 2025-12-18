// utils/performance.ts - Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  // Track API call duration
  trackAPICall(expertId: string, duration: number) {
    this.addMetric(`api_call_${expertId}`, duration);
  }

  // Track component render time
  trackRender(componentName: string, duration: number) {
    this.addMetric(`render_${componentName}`, duration);
  }

  // Track page load time
  trackPageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      this.addMetric('page_load', pageLoadTime);
      
      // Also track specific timings
      const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
      const tcpTime = perfData.connectEnd - perfData.connectStart;
      const requestTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      this.addMetric('dns_lookup', dnsTime);
      this.addMetric('tcp_connect', tcpTime);
      this.addMetric('request_response', requestTime);
      this.addMetric('dom_render', renderTime);
    }
  }

  // Track cache hit/miss performance
  trackCachePerformance(hit: boolean, duration: number) {
    const metricName = hit ? 'cache_hit' : 'cache_miss';
    this.addMetric(metricName, duration);
  }

  private addMetric(name: string, duration: number) {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    });

    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  // Get average duration for a metric
  getAverage(metricName: string): number {
    const filtered = this.metrics.filter(m => m.name === metricName);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  // Get all metrics summary
  getSummary() {
    const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity
        };
      }

      const s = summary[metric.name];
      s.count++;
      s.min = Math.min(s.min, metric.duration);
      s.max = Math.max(s.max, metric.duration);
    });

    // Calculate averages
    Object.keys(summary).forEach(key => {
      const filtered = this.metrics.filter(m => m.name === key);
      const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
      summary[key].avg = sum / filtered.length;
    });

    return summary;
  }

  // Export metrics for external analytics
  exportMetrics() {
    return [...this.metrics];
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
  }

  // Print summary to console
  printSummary() {
    const summary = this.getSummary();
    console.table(summary);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-track page load on initialization
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackPageLoad();
  });
}

// Helper function to measure async operations
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.trackAPICall(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackAPICall(`${name}_error`, duration);
    throw error;
  }
}

// Helper function to measure sync operations
export function measureSync<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    performanceMonitor.trackRender(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackRender(`${name}_error`, duration);
    throw error;
  }
}
