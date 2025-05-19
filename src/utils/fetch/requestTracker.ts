
// Request tracker for monitoring API calls
interface RequestMetrics {
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  success?: boolean;
  error?: string;
  cacheHit?: boolean;
}

class RequestTracker {
  private requests: Map<string, RequestMetrics> = new Map();
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private cachedRequests = 0;
  private avgResponseTime = 0;

  // Start tracking a request
  startRequest(url: string): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.requests.set(requestId, {
      url,
      startTime: performance.now()
    });
    this.totalRequests++;
    return requestId;
  }

  // Complete tracking a request
  completeRequest(requestId: string, options: {
    status?: number;
    error?: string;
    cacheHit?: boolean;
  }) {
    const request = this.requests.get(requestId);
    if (!request) return;

    const endTime = performance.now();
    const duration = endTime - request.startTime;
    const success = !(options.error || (options.status && options.status >= 400));

    // Update request data
    request.endTime = endTime;
    request.duration = duration;
    request.status = options.status;
    request.success = success;
    request.error = options.error;
    request.cacheHit = options.cacheHit;

    // Update statistics
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    if (options.cacheHit) {
      this.cachedRequests++;
    }

    // Update average response time
    const totalCompletedRequests = this.successfulRequests + this.failedRequests;
    this.avgResponseTime = (this.avgResponseTime * (totalCompletedRequests - 1) + duration) / totalCompletedRequests;
  }

  // Get performance metrics
  getMetrics() {
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      cachedRequests: this.cachedRequests,
      averageResponseTime: this.avgResponseTime,
      successRate: this.totalRequests > 0 
        ? (this.successfulRequests / this.totalRequests) * 100 
        : 0,
      cacheHitRate: this.totalRequests > 0 
        ? (this.cachedRequests / this.totalRequests) * 100 
        : 0
    };
  }

  // Reset statistics
  reset() {
    this.requests.clear();
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.cachedRequests = 0;
    this.avgResponseTime = 0;
  }
}

export const requestTracker = new RequestTracker();
